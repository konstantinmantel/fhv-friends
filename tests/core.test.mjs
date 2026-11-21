import test from 'node:test';
import assert from 'node:assert/strict';
import { validEmail, escapeHtml, filterPosts, validatePost, makeICS, initials } from '../src/core.js';
const future = new Date(Date.now()+86400000).toISOString();
const valid = {type:'activity',title:'Gemeinsam bouldern',description:'Eine entspannte Runde nach den Vorlesungen.',location:'K1 Dornbirn',starts_at:future,capacity:8,price:0};
test('only exact FHV email domains are allowed, with normalized casing',()=>{
 for(const email of ['alex@students.fhv.at',' a.b@FHV.AT ','alex+campus@students.fhv.at'])assert.equal(validEmail(email),true,email);
 for(const email of ['alex@gmail.com','alex@fhv.at.evil.com','alex@evilfhv.at','alex@sub.students.fhv.at','alex@students.fhv.at@evil.com','@fhv.at','a b@fhv.at','','alex@fhv.at\n.evil'])assert.equal(validEmail(email),false,email);
});
test('untrusted titles and chat text are escaped',()=>{assert.equal(escapeHtml('<img src=x onerror="alert(1)"> & \'hi\''),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;hi&#39;');});
test('Activities contains activities only; help and tutoring remain under Trade / Help',()=>{
 const posts=[{id:'a',type:'activity',title:'Lerngruppe',category:'Lernen',created_at:future,starts_at:future},{id:'h',type:'help',title:'Nachhilfe',category:'Lernen',created_at:future},{id:'t',type:'trade',title:'Lampe',created_at:future},{id:'f',type:'food',title:'Salat',created_at:future}];
 assert.deepEqual(filterPosts(posts,{tab:'activities'}).map(p=>p.id),['a']);
 assert.deepEqual(filterPosts(posts,{tab:'trade',filter:'Hilfe'}).map(p=>p.id),['h']);
 assert.deepEqual(filterPosts(posts,{tab:'trade'}).map(p=>p.id),['h','t','f']);
});
test('feed pinning, search, saved items and personal plans respect selection',()=>{
 const posts=[{id:'a',author_id:'me',type:'activity',title:'Bouldern',description:'K1 Dornbirn',created_at:'2026-11-20',starts_at:future},{id:'b',type:'activity',title:'Kaffee',created_at:'2026-11-19',starts_at:future,pinned:true},{id:'c',type:'help',title:'Nachhilfe',description:'MATLAB',created_at:'2026-11-21'}];
 assert.equal(filterPosts(posts)[0].id,'b');
 assert.deepEqual(filterPosts(posts,{query:'matlab'}).map(p=>p.id),['c']);
 assert.deepEqual(filterPosts(posts,{tab:'activities',activityTab:'Meine Pläne',userId:'me',joined:['b']}).map(p=>p.id),['a','b']);
 assert.deepEqual(filterPosts(posts,{tab:'saved',saved:['a']}).map(p=>p.id),['a']);
});
test('invalid and past activities, capacity and negative prices are rejected',()=>{
 assert.equal(validatePost(valid),null);
 for(const change of [{title:'x'},{description:'kurz'},{location:' '},{type:'hack'},{starts_at:'not a date'},{starts_at:'2020-01-01'},{capacity:1},{capacity:501},{capacity:2.3},{price:-1}])assert.equal(typeof validatePost({...valid,...change}),'string',JSON.stringify(change));
 assert.equal(validatePost({...valid,type:'help',starts_at:null,capacity:null}),null);
});
test('calendar uses UTC and escapes user supplied newlines and separators',()=>{
 const ics=makeICS({id:'abc',title:'Kaffee, Spiele; Spaß',description:'Zeile 1\nZeile 2',location:'FHV',starts_at:'2026-11-24T17:00:00Z'});
 assert.match(ics,/DTSTART:20261124T170000Z/);assert.match(ics,/DTEND:20261124T190000Z/);
 assert.ok(ics.includes('Kaffee\\, Spiele\\; Spaß'));assert.ok(ics.includes('Zeile 1\\nZeile 2'));
 assert.equal(ics.split('BEGIN:VEVENT').length,2);
});
test('profile initials work for names and empty profiles',()=>{assert.equal(initials('Lena Mantel'),'LM');assert.equal(initials('ÖH FHV'),'ÖF');});
