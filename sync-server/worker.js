import {mergeChanges} from '../src/merge.js';
const MAX_WORLD=3*1024*1024;
const IDS=['demo-you','demo-profile-2','demo-profile-3','demo-profile-4'];
const origins=new Set(['https://fhv-friends.netlify.app','https://konstantinmantel.github.io','http://127.0.0.1:4173','http://localhost:4173']);
function validWorld(w){
 if(!w||w.version!==2||!Array.isArray(w.profiles)||w.profiles.length!==4||!Array.isArray(w.posts)||w.posts.length>200||!Array.isArray(w.chats)||w.chats.length>100||!w.accounts||!w.messages||!w.comments)throw Error('Invalid presentation data.');
 if(new Set(w.profiles.map(p=>p.id)).size!==4||w.profiles.some(p=>!IDS.includes(p.id)||typeof p.name!=='string'||p.name.length>80||p.role!=='student'))throw Error('Invalid profiles.');
 for(const id of IDS)if(!w.accounts[id])throw Error('Missing profile.');
 if(JSON.stringify(w).length>MAX_WORLD)throw Error('Presentation storage is full. Remove a large post photo.');
 const text=JSON.stringify(w);if(/"(?:__proto__|prototype|constructor)"\s*:/.test(text))throw Error('Invalid field.');
 return w;
}
async function roomKey(token){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return 'rooms/'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')+'.json';}
function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');}
export default {async fetch(request,env){
 const origin=request.headers.get('origin');const headers={'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Vary':'Origin'};
 if(origin&&origins.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET,POST,OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type,Authorization,If-None-Match';headers['Access-Control-Expose-Headers']='ETag';}
 const reply=(data,status=200,extra={})=>new Response(data===null?null:JSON.stringify(data),{status,headers:{...headers,...extra}});
 if(origin&&!origins.has(origin))return reply({error:'Origin is not allowed.'},403);
 if(request.method==='OPTIONS')return reply(null,204);
 const path=new URL(request.url).pathname;
 if(path==='/')return reply({service:'FHV Friends presentation sync',status:'ready'});
 if(!env.BUCKET)return reply({error:'Shared storage is not connected.'},503);
 try{
  if(path==='/rooms'&&request.method==='POST'){
   if(Number(request.headers.get('content-length')||0)>MAX_WORLD+500)return reply({error:'Upload too large.'},413);
   const text=await request.text();if(text.length>MAX_WORLD+500)return reply({error:'Upload too large.'},413);
   const world=validWorld(JSON.parse(text).world),token=newToken();
   const result=await env.BUCKET.put(await roomKey(token),JSON.stringify({world,updated_at:new Date().toISOString()}),{httpMetadata:{contentType:'application/json'}});
   return reply({token,world},201,{ETag:result.httpEtag});
  }
  if(path!=='/state'||!['GET','POST'].includes(request.method))return reply({error:'Not found.'},404);
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'');
  if(!/^[a-f0-9]{64}$/.test(token||''))return reply({error:'A presentation room link is required.'},401);
  const key=await roomKey(token);
  if(request.method==='GET'){
   const found=await env.BUCKET.get(key,{onlyIf:request.headers});
   if(!found)return reply({error:'Presentation room not found.'},404);
   if(!('body' in found))return reply(null,304,{ETag:found.httpEtag});
   return reply(await found.json(),200,{ETag:found.httpEtag});
  }
  const text=await request.text();if(text.length>MAX_WORLD*2+1000)return reply({error:'Upload too large.'},413);
  const {base,next}=JSON.parse(text);validWorld(base);validWorld(next);
  for(let attempt=0;attempt<6;attempt++){
   const found=await env.BUCKET.get(key);if(!found)return reply({error:'Presentation room not found.'},404);
   const stored=await found.json();const world=validWorld(mergeChanges(base,next,stored.world));
   const value={world,updated_at:new Date().toISOString()};
   const written=await env.BUCKET.put(key,JSON.stringify(value),{onlyIf:{etagMatches:found.etag},httpMetadata:{contentType:'application/json'}});
   if(written)return reply(value,200,{ETag:written.httpEtag});
  }
  return reply({error:'The room is busy. Changes will retry.'},409);
 }catch(error){return reply({error:error instanceof SyntaxError?'Invalid request.':error.message||'Could not sync this room.'},400);}
}};
