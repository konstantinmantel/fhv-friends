import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../sync-server/worker.js';
import {PresentationSync,roomToken} from '../src/sync.js';
import {mergeChanges} from '../src/merge.js';
import {createDemoWorld} from '../src/demo.js';
const copy=structuredClone;
class Bucket{
 constructor(){this.items=new Map();this.version=0;}
 async get(key,options={}){const item=this.items.get(key);if(!item)return null;const found={etag:item.etag,httpEtag:'"'+item.etag+'"',json:async()=>JSON.parse(item.value)};if(options.onlyIf?.get?.('if-none-match')===found.httpEtag)return found;return {...found,body:item.value};}
 async put(key,value,options={}){if(options.onlyIf?.etagMatches&&this.items.get(key)?.etag!==options.onlyIf.etagMatches)return null;const etag=String(++this.version);this.items.set(key,{value,etag});return {etag,httpEtag:'"'+etag+'"'};}
}
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
async function setup(){
 const env={BUCKET:new Bucket()};let online=true;
 const fetcher=(url,options={})=>{if(!online)return Promise.reject(Error('offline'));return worker.fetch(new Request(url,{...options,headers:{Origin:'https://fhv-friends.netlify.app',...options.headers}}),env);};
 const created=await fetcher('https://sync.test/rooms',{method:'POST',body:JSON.stringify({world:createDemoWorld()})});assert.equal(created.status,201);const {token}=await created.json();
 return {env,fetcher,token,setOnline:v=>online=v};
}
async function client(env,storage=memory()){let world;const sync=new PresentationSync({endpoint:'https://sync.test',token:env.token,fetcher:env.fetcher,storage,onChange:w=>world=w,onStatus(){}});await sync.connect();return {sync,get world(){return world},storage};}
async function settled(...clients){for(let i=0;i<30;i++){await new Promise(r=>setImmediate(r));if(clients.every(c=>!c.sync.busy&&!c.sync.queue.length))return;}throw Error('Pending sync did not settle');}
test('room keys are required and blocked origins cannot read shared data',async()=>{
 const env=await setup();assert.equal(roomToken(env.token),env.token);assert.equal(roomToken('guess'),null);
 assert.equal((await worker.fetch(new Request('https://sync.test/state'),env.env)).status,401);
 assert.equal((await worker.fetch(new Request('https://sync.test/state',{headers:{Origin:'https://evil.test',Authorization:'Bearer '+env.token}}),env.env)).status,403);
 assert.equal((await env.fetcher('https://sync.test/state',{headers:{Authorization:'Bearer '+'a'.repeat(64)}})).status,404);
});
test('four independent phones retain simultaneous profile edits and photos after reload',async()=>{
 const env=await setup(),clients=await Promise.all([client(env),client(env),client(env),client(env)]);
 clients.forEach((c,i)=>{const next=copy(c.world);Object.assign(next.profiles[i],{name:'Phone '+(i+1),bio:'My own profile',avatar_data:'data:image/jpeg;base64,YWJj'});c.sync.save(next);});
 await settled(...clients);const reloaded=await client(env);
 assert.deepEqual(reloaded.world.profiles.map(p=>p.name),['Phone 1','Phone 2','Phone 3','Phone 4']);assert.ok(reloaded.world.profiles.every(p=>p.avatar_data));
});
test('two browsers exchange messages without losing simultaneous sends or leaking another room',async()=>{
 const env=await setup(),a=await client(env),b=await client(env),id='dm-pair';
 for(const [c,author,body] of [[a,'demo-you','Hello from phone 1'],[b,'demo-profile-2','Hello from phone 2']]){const next=copy(c.world);next.chats.push({id,members:['demo-you','demo-profile-2']});next.messages[id]=[{id:author,author_id:author,body,created_at:new Date().toISOString()}];c.sync.save(next);}
 await settled(a,b);await b.sync.poll();assert.equal(b.world.chats.length,1);assert.equal(b.world.messages[id].length,2);
 const other=await client(await setup());assert.equal(other.world.chats.length,0);
});
test('offline edits survive reload and upload after connectivity returns',async()=>{
 const env=await setup(),storage=memory(),a=await client(env,storage);env.setOnline(false);
 const next=copy(a.world);next.profiles[0].name='Saved offline';a.sync.save(next);await new Promise(r=>setImmediate(r));assert.equal(a.sync.queue.length,1);
 env.setOnline(true);const reloaded=await client(env,storage);await settled(reloaded);assert.equal((await client(env)).world.profiles[0].name,'Saved offline');
});
test('three-way merge preserves concurrent likes and targeted removals',()=>{
 const base={liked:['a'],messages:[{id:'one',body:'First'}]};const a=copy(base),b=copy(base);a.liked=[];b.liked.push('b');b.messages.push({id:'two',body:'Second'});
 const merged=mergeChanges(base,a,b);assert.deepEqual(merged.liked,['b']);assert.equal(merged.messages.length,2);
});
