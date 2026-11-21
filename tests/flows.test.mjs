import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
async function app() {
 const elements=new Map();const storage=new Map();const listeners={};
 function element(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',isConnected:true,classList:{add(){},remove(){}},focus(){},querySelector(){return {focus(){}}},querySelectorAll(){return []}});return elements.get(key);}
 const ctx=vm.createContext({console,Date,Intl,Set,Map,URL,URLSearchParams,Blob,AbortSignal,crypto:webcrypto,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{hash:'',pathname:'/',href:'https://example.com/',protocol:'https:'},history:{replaceState(){}},navigator:{},document:{querySelector:element,addEventListener:(name,fn)=>listeners[name]=fn,body:{classList:{add(){},remove(){}}},activeElement:null},window:{FHV_CONFIG:{},addEventListener(){},scrollTo(){}},fetch:()=>{throw new Error('Unexpected network call in demo');}});
 let code='';for(const file of ['core','data','icons','api','app']){let part=await readFile(`src/${file}.js`,'utf8');part=part.replace(/^import .*;\n/gm,'').replace(/^export /gm,'').replaceAll('import.meta.url',"'https://example.com/src/app.js'");if(file==='app')part='const e=escapeHtml;\n'+part;code+=part+'\n';}
 code+='globalThis.testApp = {state,render,navigate,detail,createModal,actions,joinActivity,respondInvite,toggleSave,toggleLike,contact,groupChat,persist};';
 vm.runInContext(code,ctx);return {ctx,a:ctx.testApp,elements,element,storage,listeners};
}
test('initial app renders all four tabs, correct brand and explicit demo state',async()=>{
 const {a,element}=await app();let html=element('#app').innerHTML;assert.match(html,/FHV/);assert.match(html,/riends/);assert.match(html,/Demo mit Beispieldaten/);for(const x of ['Home \/ Feed','Trade \/ Help','Activities','Profile'])assert.ok(html.includes(x));
 a.navigate('trade');html=element('#app').innerHTML;assert.match(html,/Nachhilfe|Hilfe/);assert.match(html,/Campus-Spots/);assert.doesNotMatch(html,/Kopf aus\. Karren rauf\.<\/h3>/);
 a.navigate('activities');html=element('#app').innerHTML;assert.match(html,/Meine Pläne/);assert.doesNotMatch(html,/Ein Salat zu viel/);
 a.navigate('profile');assert.match(element('#app').innerHTML,/Profil bearbeiten/);
});
test('RSVP join and leave update counts and capacity without oversubscription',async()=>{
 const {a}=await app();const post=a.state.posts.find(p=>p.id==='run');const original=post.join_count;
 await a.joinActivity('run');assert.ok(a.state.joined.includes('run'));assert.equal(post.join_count,original+1);
 await a.joinActivity('run');assert.ok(!a.state.joined.includes('run'));assert.equal(post.join_count,original);
 post.capacity=post.join_count;await a.joinActivity('run');assert.ok(!a.state.joined.includes('run'));assert.equal(post.join_count,original);
});
test('accepting an invitation is idempotent and updates personal plans',async()=>{
 const {a}=await app();const p=a.state.posts.find(p=>p.id==='coffee');const before=p.join_count;
 await a.respondInvite('invite-coffee','accepted');await a.respondInvite('invite-coffee','accepted');
 assert.equal(a.state.joined.filter(id=>id==='coffee').length,1);assert.equal(p.join_count,before+1);
 assert.equal(a.state.invitations.find(i=>i.id==='invite-coffee').status,'accepted');
});
test('bookmarks and likes toggle and persist; details render without template errors',async()=>{
 const {a,element,storage}=await app();await a.toggleSave('salad');assert.ok(a.state.saved.includes('salad'));assert.ok(storage.has('fhv-demo-v1'));
 await a.toggleSave('salad');assert.equal(a.state.saved.length,0);await a.toggleLike('salad');assert.ok(a.state.liked.includes('salad'));
 await a.detail('coffee');assert.match(element('#overlay').innerHTML,/Campus coffee/);assert.doesNotMatch(element('#overlay').innerHTML,/\$\{FREE\}/);
 await a.detail('salad');assert.match(element('#overlay').innerHTML,/Allergene/);
});
test('direct and group chats create one conversation and never fake incoming messages',async()=>{
 const {a}=await app();await a.contact('salad');await a.contact('salad');assert.equal(a.state.chats.length,1);assert.equal(a.state.messages[a.state.chats[0].id].length,0);
 await a.groupChat('hike');assert.equal(a.state.chats.length,2);assert.equal(a.state.chats[1].post_id,'hike');
});
test('create and edit forms render safe text and the help category in the right place',async()=>{
 const {a,element}=await app();a.createModal('help');assert.match(element('#overlay').innerHTML,/Hilfe anbieten/);assert.doesNotMatch(element('#overlay').innerHTML,/name="date"/);
 a.createModal('activity');assert.match(element('#overlay').innerHTML,/name="date"/);
 const p=a.state.posts.find(x=>x.id==='tool');p.title='<img onerror=x>';a.createModal('help','tool');assert.match(element('#overlay').innerHTML,/&lt;img onerror=x&gt;/);assert.match(element('#overlay').innerHTML,/Änderungen speichern/);
});
