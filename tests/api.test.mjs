import test from 'node:test';
import assert from 'node:assert/strict';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
globalThis.window={FHV_CONFIG:{supabaseUrl:'https://project.supabase.co',supabaseKey:'sb_publishable_test'}};
const {api}=await import('../src/api.js');
const calls=[];
globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(url.includes('/token')?{access_token:'access',refresh_token:'refresh',expires_in:3600,user:{id:'student-id'}}:[]),{status:200,headers:{'Content-Type':'application/json'}});};
test('external email registration is blocked before network transmission',async()=>{const before=calls.length;await assert.rejects(()=>api.signup('test@evil.com','longpassword123','Test'),/FHV/);assert.equal(calls.length,before);});
test('login sends normalized email and stores access token for authenticated requests',async()=>{
 await api.login(' Student@Students.FHV.AT ','longpassword123');const call=calls.at(-1);assert.equal(JSON.parse(call.options.body).email,'student@students.fhv.at');
 await api.posts();assert.equal(calls.at(-1).options.headers.Authorization,'Bearer access');assert.match(calls.at(-1).url,/select=\*,author:profiles/);
});
test('membership changes use the capacity-enforcing RPC',async()=>{await api.rpc('set_attendance',{activity_id:'event',attending:true});const call=calls.at(-1);assert.match(call.url,/\/rpc\/set_attendance$/);assert.deepEqual(JSON.parse(call.options.body),{activity_id:'event',attending:true});});
test('editing a contribution cannot change its immutable type or author',async()=>{
 await api.updatePost('abc',{type:'activity',title:'Neuer Title'});const call=calls.at(-1);assert.equal(call.options.method,'PATCH');assert.deepEqual(JSON.parse(call.options.body),{title:'Neuer Title'});
});
test('email delivery restrictions are shown as a clear configuration issue',async()=>{
 const prev=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({error_code:'email_address_not_authorized'}),{status:400});await assert.rejects(()=>api.signup('student@students.fhv.at','longpassword123','Name'),/email delivery/);globalThis.fetch=prev;
});
test('English categories round-trip through the existing database vocabulary',async()=>{
 const previous=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify([{id:'ride',category:'Mitfahren'}]),{status:200});};
 try{
  assert.equal((await api.posts())[0].category,'Rides');
  assert.equal((await api.createPost({type:'activity',category:'Rides'}))[0].category,'Rides');
  assert.equal(JSON.parse(calls.at(-1).options.body).category,'Mitfahren');
  await api.updatePost('ride',{category:'Culture'});assert.equal(JSON.parse(calls.at(-1).options.body).category,'Kultur');
 }finally{globalThis.fetch=previous;}
});
