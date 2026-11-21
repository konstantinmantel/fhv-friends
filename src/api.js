import { validEmail, readLocal, saveLocal } from './core.js';
const config = globalThis.window?.FHV_CONFIG || {};
export const configured = Boolean(config.supabaseUrl && config.supabaseKey);
let session = readLocal('fhv-session', null);
let refreshing;
export function currentSession() { return session; }
function storeSession(data) { session = data ? {...data, expires_at: data.expires_at || Math.floor(Date.now()/1000)+(data.expires_in||3600)} : null; saveLocal('fhv-session',session); }
async function request(path, {method='GET',body,auth=true,headers={}}={}) {
  if (!configured) throw new Error('Die Live-Anmeldung ist noch nicht eingerichtet. Du kannst die Demo ausprobieren.');
  if (auth && session?.expires_at < Date.now()/1000+60) await refresh();
  const response = await fetch(config.supabaseUrl.replace(/\/$/,'')+path, {method,headers:{'apikey':config.supabaseKey,'Content-Type':'application/json',...(auth && session?{Authorization:`Bearer ${session.access_token}`}:{Authorization:`Bearer ${config.supabaseKey}`}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
  const data = await response.json().catch(()=>null);
  if (!response.ok) {
    const code = data?.error_code || data?.code;
    const messages = {email_not_confirmed:'Bitte bestätige zuerst deine FHV-Mailadresse.',invalid_credentials:'Mailadresse oder Passwort stimmen nicht.',email_address_not_authorized:'Der Mailversand ist noch nicht für Studierende eingerichtet.',over_email_send_rate_limit:'Zu viele Anfragen. Bitte versuche es später noch einmal.',user_already_exists:'Für diese Mailadresse gibt es bereits ein Konto.',signup_disabled:'Die Registrierung ist derzeit geschlossen.'};
    throw new Error(messages[code] || (response.status===401?'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.':data?.message || data?.msg || data?.error_description || 'Das hat gerade nicht geklappt. Bitte versuche es erneut.'));
  }
  return data;
}
async function refresh() {
  if (!session?.refresh_token) return;
  if (!refreshing) refreshing = request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token},auth:false}).then(storeSession).catch(e=>{storeSession(null);throw e;}).finally(()=>refreshing=null);
  return refreshing;
}
export const api = {
  async login(email,password) { if (!validEmail(email)) throw new Error('Bitte nutze deine FHV-Mailadresse.'); const data = await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:email.trim().toLowerCase(),password},auth:false}); storeSession(data); return data.user; },
  async recover(email) { if(!validEmail(email))throw new Error('Bitte nutze deine FHV-Mailadresse.');return request('/auth/v1/recover',{method:'POST',body:{email:email.trim().toLowerCase()},auth:false}); },
  async updatePassword(password) {if(password.length<12)throw new Error('Bitte mindestens 12 Zeichen verwenden.');return request('/auth/v1/user',{method:'PUT',body:{password}});},
  async signup(email,password,name) { if (!validEmail(email)) throw new Error('Nur FHV-Mailadressen sind erlaubt.'); return request('/auth/v1/signup',{method:'POST',body:{email:email.trim().toLowerCase(),password,data:{name}},auth:false}); },
  async verifyCallback() { const h = new URLSearchParams(location.hash.slice(1)); if (h.has('access_token')) { storeSession({access_token:h.get('access_token'),refresh_token:h.get('refresh_token'),expires_in:Number(h.get('expires_in')||3600)}); history.replaceState(null,'',location.pathname); } if (session) return request('/auth/v1/user'); return null; },
  async logout() { try { if(session) await request('/auth/v1/logout',{method:'POST'}); } finally {storeSession(null);} },
  async profile(id) { const rows = await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}&select=*`); return rows?.[0]; },
  async role() { return (await this.rpc('my_role')) || 'student'; },
  async saveProfile(id,data) { return request(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:data}); },
  async posts() { return (await request('/rest/v1/posts?select=*,author:profiles!author_id(id,name,course,color,avatar_data)&order=created_at.desc&limit=200')) || []; },
  async memberships() { return request('/rest/v1/participants?select=post_id,user_id'); },
  async state(id) { const [saved,joined,likes,invitations] = await Promise.all([request(`/rest/v1/bookmarks?user_id=eq.${id}&select=post_id`),request(`/rest/v1/participants?user_id=eq.${id}&select=post_id`),request(`/rest/v1/likes?user_id=eq.${id}&select=post_id`),request(`/rest/v1/invitations?recipient_id=eq.${id}&select=*`)]); return {saved:saved.map(x=>x.post_id),joined:joined.map(x=>x.post_id),liked:likes.map(x=>x.post_id),invitations}; },
  async createPost(post) { return request('/rest/v1/posts',{method:'POST',body:post,headers:{Prefer:'return=representation'}}); },
  async updatePost(id,post) { const {type,...data}=post;return request(`/rest/v1/posts?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:data,headers:{Prefer:'return=representation'}}); },
  async deletePost(id) { return request(`/rest/v1/posts?id=eq.${id}`,{method:'DELETE'}); },
  async pinPost(id,value) { return request(`/rest/v1/posts?id=eq.${id}`,{method:'PATCH',body:{pinned:value}}); },
  async toggle(table,id,userId,on) { return on?request(`/rest/v1/${table}`,{method:'POST',body:{post_id:id,user_id:userId},headers:{Prefer:'resolution=ignore-duplicates'}}):request(`/rest/v1/${table}?post_id=eq.${id}&user_id=eq.${userId}`,{method:'DELETE'}); },
  async rpc(name,body={}) { return request(`/rest/v1/rpc/${name}`,{method:'POST',body}); },
  async comments(id) { return request(`/rest/v1/comments?post_id=eq.${id}&select=*,author:profiles!author_id(id,name,color)&order=created_at.asc&limit=100`); },
  async comment(postId,authorId,body) { return request('/rest/v1/comments',{method:'POST',body:{post_id:postId,author_id:authorId,body}}); },
  async report(postId,reporterId,reason) { return request('/rest/v1/reports',{method:'POST',body:{post_id:postId,reporter_id:reporterId,reason}}); },
  async invitations(postId,userId,senderId) { return request('/rest/v1/invitations',{method:'POST',body:{post_id:postId,recipient_id:userId,sender_id:senderId}}); },
  async invitationStatus(id,status) { return this.rpc('respond_invitation',{invitation_id:id,response:status}); },
  async people() { return request('/rest/v1/profiles?select=id,name,course,color,avatar_data,bio,interests&limit=100'); },
  async connections() { return request('/rest/v1/connections?select=*'); },
  async connect(other) { return this.rpc('request_connection',{other_user:other}); },
  async respondConnection(id,accept) { return this.rpc('respond_connection',{connection_id:id,accept}); },
  async disconnect(id) { return request(`/rest/v1/connections?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'}); },
  async chats() { return request('/rest/v1/conversations?select=*&order=created_at.desc&limit=100'); },
  async messages(id) { return request(`/rest/v1/messages?conversation_id=eq.${id}&select=*,author:profiles!author_id(id,name,color)&order=created_at.asc&limit=200`); },
  async send(id,authorId,body) { return request('/rest/v1/messages',{method:'POST',body:{conversation_id:id,author_id:authorId,body}}); },
};
