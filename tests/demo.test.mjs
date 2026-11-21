import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoWorld,hydrateDemoPosts,visibleDemoChats } from '../src/demo.js';
import { safeImage } from '../src/core.js';
test('test profiles start as four blank editable accounts without fake email identities',()=>{
 const w=createDemoWorld();assert.equal(w.profiles.length,4);assert.equal(new Set(w.profiles.map(p=>p.id)).size,4);
 for(const p of w.profiles){assert.equal(p.bio,'');assert.equal(p.avatar_data,null);assert.equal(p.email,undefined);assert.equal(p.role,'student');}
 assert.equal(hydrateDemoPosts(w).every(p=>p.join_count===0),true);
});
test('legacy migration preserves custom posts, profile edits and message history',()=>{
 const w=createDemoWorld(null,{user:{id:'demo-you',name:'Mara',bio:'Mein Text'},posts:[{id:'mine',author_id:'demo-you',title:'Mein Plan'}],messages:{chat:[{body:'Hallo'}]},joined:['hike']});
 assert.equal(w.profiles[0].name,'Mara');assert.equal(w.posts.find(p=>p.id==='mine').title,'Mein Plan');assert.equal(w.messages.chat[0].body,'Hallo');assert.equal(hydrateDemoPosts(w).find(p=>p.id==='hike').join_count,1);
});
test('demo chat visibility follows direct memberships and activity participation',()=>{
 const chats=[{id:'direct',members:['a','b']},{id:'group',post_id:'hike'}];
 assert.deepEqual(visibleDemoChats(chats,'c',[],[]),[]);
 assert.deepEqual(visibleDemoChats(chats,'a',[],[]).map(c=>c.id),['direct']);
 assert.deepEqual(visibleDemoChats(chats,'c',['hike'],[]).map(c=>c.id),['group']);
});
test('only size-bounded raster data URLs are accepted as uploaded photos',()=>{
 assert.ok(safeImage('data:image/jpeg;base64,YWJj'));
 for(const value of ['javascript:alert(1)','data:image/svg+xml;base64,YWJj','https://example.com/a.jpg','data:text/html;base64,YWJj','data:image/png;base64,abc\" onerror=\"bad','data:image/jpeg;base64,'+'a'.repeat(220000)])assert.equal(safeImage(value),'');
});
