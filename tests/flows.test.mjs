import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
async function app() {
 const elements=new Map();const storage=new Map();const listeners={};
 function element(key){if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',isConnected:true,classList:{add(){},remove(){}},focus(){},querySelector(){return {focus(){}}},querySelectorAll(){return []}});return elements.get(key);}
 const ctx=vm.createContext({console,Date,Intl,Set,Map,URL,URLSearchParams,Blob,AbortSignal,crypto:webcrypto,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{hash:'',pathname:'/',href:'https://example.com/',protocol:'https:'},history:{replaceState(){}},navigator:{},document:{querySelector:element,addEventListener:(name,fn)=>listeners[name]=fn,body:{classList:{add(){},remove(){}}},activeElement:null},window:{FHV_CONFIG:{},addEventListener(){},scrollTo(){}},fetch:()=>{throw new Error('Unexpected network call in demo');}});
 let code='';for(const file of ['core','data','demo','icons','api','franzi','app']){let part=await readFile(`src/${file}.js`,'utf8');part=part.replace(/^import .*;\n/gm,'').replace(/^export /gm,'').replaceAll('import.meta.url',"'https://example.com/src/app.js'");if(file==='app')part='const e=escapeHtml;\n'+part;code+=part+'\n';}
 code+='globalThis.testApp = {state,render,navigate,detail,createModal,actions,joinActivity,respondInvite,toggleSave,toggleLike,contact,groupChat,persist,switchAccount,testAccounts,demoWorld};';
 vm.runInContext(code,ctx);return {ctx,a:ctx.testApp,elements,element,storage,listeners};
}
test('initial app renders all four tabs, correct brand and explicit demo state',async()=>{
 const {a,element}=await app();let html=element('#app').innerHTML;assert.match(html,/FHV/);assert.match(html,/riends/);assert.match(html,/Demo · nur auf diesem Gerät/);for(const x of ['Home \/ Feed','Trade \/ Help','Activities','Profile'])assert.ok(html.includes(x));
 a.navigate('trade');html=element('#app').innerHTML;assert.match(html,/Nachhilfe|Hilfe/);assert.match(html,/Campus-Spots/);assert.doesNotMatch(html,/Kopf aus\. Karren rauf\.<\/h3>/);
 a.navigate('activities');html=element('#app').innerHTML;assert.match(html,/Meine Pläne/);assert.doesNotMatch(html,/Ein Salat zu viel/);
 a.navigate('profile');assert.match(element('#app').innerHTML,/Profil bearbeiten/);
});
test('RSVP join and leave update counts and capacity without oversubscription',async()=>{
 const {a}=await app();const post=a.state.posts.find(p=>p.id==='run');const original=post.join_count;
 await a.joinActivity('run');assert.ok(a.state.joined.includes('run'));assert.equal(post.join_count,original+1);
 await a.joinActivity('run');assert.ok(!a.state.joined.includes('run'));assert.equal(post.join_count,original);
 post.capacity=1;post.join_count=1;await a.joinActivity('run');assert.ok(!a.state.joined.includes('run'));assert.equal(post.join_count,1);
});
test('accepting an invitation is idempotent and updates personal plans',async()=>{
 const {a}=await app();const p=a.state.posts.find(p=>p.id==='coffee');const before=p.join_count;
 await a.respondInvite('invite-coffee','accepted');await a.respondInvite('invite-coffee','accepted');
 assert.equal(a.state.joined.filter(id=>id==='coffee').length,1);assert.equal(p.join_count,before+1);
 assert.equal(a.state.invitations.find(i=>i.id==='invite-coffee').status,'accepted');
});
test('bookmarks and likes toggle and persist; details render without template errors',async()=>{
 const {a,element,storage}=await app();await a.toggleSave('salad');assert.ok(a.state.saved.includes('salad'));assert.ok(storage.has('fhv-demo-v2'));
 await a.toggleSave('salad');assert.equal(a.state.saved.length,0);await a.toggleLike('salad');assert.ok(a.state.liked.includes('salad'));
 await a.detail('coffee');assert.match(element('#overlay').innerHTML,/Spieleabend im Café Campus/);assert.doesNotMatch(element('#overlay').innerHTML,/\$\{FREE\}/);
 await a.detail('salad');assert.match(element('#overlay').innerHTML,/Allergene/);
});
test('direct and group chats create one conversation and never fake incoming messages',async()=>{
 const {a,element}=await app();await a.contact('salad');assert.doesNotMatch(element('#overlay').innerHTML,/&lt;button class/);await a.contact('salad');assert.equal(a.state.chats.length,1);assert.equal(a.state.messages[a.state.chats[0].id].length,0);
 await a.joinActivity('hike');await a.groupChat('hike');assert.equal(a.state.chats.length,2);assert.equal(a.state.chats[1].post_id,'hike');
});
test('create and edit forms render safe text and the help category in the right place',async()=>{
 const {a,element}=await app();a.createModal('help');assert.match(element('#overlay').innerHTML,/Hilfe anbieten/);assert.doesNotMatch(element('#overlay').innerHTML,/name="date"/);
 a.createModal('activity');assert.match(element('#overlay').innerHTML,/name="date"/);
 const p=a.state.posts.find(x=>x.id==='tool');p.title='<img onerror=x>';a.createModal('help','tool');assert.match(element('#overlay').innerHTML,/&lt;img onerror=x&gt;/);assert.match(element('#overlay').innerHTML,/Änderungen speichern/);
});

test('four editable test profiles keep RSVPs and bookmarks separate',async()=>{
 const {a,storage}=await app();assert.equal(a.demoWorld.profiles.length,4);
 await a.joinActivity('run');await a.toggleSave('salad');
 a.state.user.name='Mara';a.state.user.bio='Bouldern und Kaffee';a.persist();
 a.switchAccount('demo-profile-2');assert.equal(a.state.user.name,'Profil 2');assert.equal(a.state.joined.length,0);assert.equal(a.state.saved.length,0);
 await a.joinActivity('run');assert.equal(a.state.posts.find(p=>p.id==='run').join_count,2);
 a.switchAccount('demo-you');assert.equal(a.state.user.name,'Mara');assert.deepEqual(Array.from(a.state.saved),['salad']);assert.ok(a.state.joined.includes('run'));
 const saved=JSON.parse(storage.get('fhv-demo-v2'));assert.equal(saved.accounts['demo-profile-2'].joined.length,1);
});
test('test profiles share direct conversations while third profiles cannot see them',async()=>{
 const {a}=await app();await a.contact('salad');const firstChat=a.state.chats[0];
 assert.ok(firstChat.members.includes('demo-you'));assert.ok(firstChat.members.includes('demo-profile-2'));
 a.switchAccount('demo-profile-2');await a.contact('study');assert.equal(a.state.chats.length,1);
 a.switchAccount('demo-profile-3');a.testAccounts();
 assert.equal(a.demoWorld.profiles.length,4);
});
test('profile pictures update every authored card without duplicating picture data in saved posts',async()=>{
 const {a,storage,element}=await app();a.state.user.name='Testperson';a.state.user.avatar_data='data:image/jpeg;base64,YWJj';a.persist();a.render();
 assert.match(element('#app').innerHTML,/data:image\/jpeg;base64,YWJj/);
 assert.equal(JSON.parse(storage.get('fhv-demo-v2')).posts.some(p=>p.author),false);
 a.switchAccount('demo-profile-2');a.switchAccount('demo-you');assert.equal(a.state.user.avatar_data,'data:image/jpeg;base64,YWJj');
});

test('selling and gifts are separate and selling is searchable',async()=>{
 const {a,element}=await app();a.navigate('trade');a.actions.filter({dataset:{value:'Verkaufen'}});let html=element('#app').innerHTML;assert.match(html,/Skier/);assert.doesNotMatch(html,/Schreibtischlampe/);
 a.actions.filter({dataset:{value:'Verschenken'}});html=element('#app').innerHTML;assert.match(html,/Schreibtischlampe/);assert.doesNotMatch(html,/Skier, 170/);
});
test('connections require the recipient to accept and direct messages work without a post',async()=>{
 const {a,element}=await app();await a.actions.people();assert.match(element('#overlay').innerHTML,/Profil 2/);
 await a.actions.connect({dataset:{id:'demo-profile-2'}});assert.equal(a.demoWorld.connections[0].status,'pending');
 a.switchAccount('demo-profile-3');await a.actions['connect-accept']({dataset:{id:'demo-you'}});assert.equal(a.demoWorld.connections[0].status,'pending');
 a.switchAccount('demo-profile-2');await a.actions['connect-accept']({dataset:{id:'demo-you'}});assert.equal(a.demoWorld.connections[0].status,'accepted');
 await a.actions['message-person']({dataset:{id:'demo-you'}});await a.actions['message-person']({dataset:{id:'demo-you'}});assert.equal(a.state.chats.length,1);
 await a.actions.disconnect({dataset:{id:'demo-you'}});assert.equal(a.demoWorld.connections.length,0);
});
test('Franzi opens without downloading a model and identifies campus-only mode',async()=>{
 const {a,element}=await app();a.actions.franzi();const html=element('#overlay').innerHTML;assert.match(html,/Franzi/);assert.match(html,/Lokale KI aktivieren/);assert.match(html,/Ohne KI/);
});

test('Beerpong, Glühwein and carpool offers are included and rides have their own form',async()=>{
 const {a,element}=await app();for(const id of ['beerpong','gluehwein','ride-bregenz'])assert.ok(a.state.posts.some(p=>p.id===id));
 a.createModal('activity',null,true);let html=element('#overlay').innerHTML;assert.match(html,/name="ride_destination"/);assert.match(html,/Freie Plätze/);assert.match(html,/Mitfahren/);
 await a.detail('ride-bregenz');html=element('#overlay').innerHTML;assert.match(html,/Bregenz Bahnhof/);assert.match(html,/3 Plätze frei/);
});
