import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {createDemoWorld} from '../src/demo.js';
async function mountedApp(){
 const {document}=parseHTML('<html><body><div id="app"></div><div id="overlay"></div><div id="toast"></div></body></html>');
 const world=createDemoWorld();world.profiles[0].avatar_data='data:image/jpeg;base64,YWJj';
 const storage=new Map([['fhv-demo-v2',JSON.stringify(world)]]);
 const ctx=vm.createContext({console,structuredClone,Date,Intl,Set,Map,URL,URLSearchParams,Blob,AbortSignal,crypto:webcrypto,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{hash:'',pathname:'/',href:'https://example.com/',protocol:'https:'},history:{replaceState(){}},navigator:{},document,window:{FHV_CONFIG:{},innerWidth:390,scrollY:0,addEventListener(){},scrollTo(){}},fetch:()=>{throw Error('Unexpected request');}});
 let code='';for(const file of ['core','data','demo','merge','sync','icon-sprite','dom','gestures','icons','api','franzi','app']){let part=await readFile('src/'+file+'.js','utf8');part=part.replace(/^import .*;\n/gm,'').replace(/^export /gm,'').replaceAll('import.meta.url',"'https://example.com/src/app.js'");if(file==='app')part='const e=escapeHtml;\n'+part;code+=part+'\n';}
 code+='globalThis.testApp={state,render,navigate,actions,refreshApp,testAccounts,switchAccount};';
 vm.runInContext(code,ctx);return {app:ctx.testApp,document,storage};
}
test('tab changes preserve the navigation, header icons and already loaded profile images',async()=>{
 const {app,document}=await mountedApp();
 const nav=document.querySelector('.bottom-nav'),franzi=document.querySelector('.header-actions [data-action="franzi"]');
 const feed=document.querySelector('[data-panel="feed"]'),avatar=feed.querySelector('img');
 assert.ok(avatar);app.navigate('profile');app.navigate('activities');app.navigate('feed');
 assert.equal(document.querySelector('.bottom-nav'),nav);
 assert.equal(document.querySelector('.header-actions [data-action="franzi"]'),franzi);
 assert.equal(document.querySelector('[data-panel="feed"] img'),avatar);
 assert.equal(document.querySelectorAll('#campus-icons').length,1);
 assert.equal(document.querySelector('.header-actions').lastElementChild.dataset.action,'franzi');
 assert.equal(document.querySelector('[data-panel="profile"]').hidden,true);
});
test('refresh keeps decoded images and account switching updates the visible profile',async()=>{
 const {app,document,storage}=await mountedApp();
 app.navigate('profile');const image=document.querySelector('[data-panel="profile"] img');
 await app.refreshApp();assert.equal(document.querySelector('[data-panel="profile"] img'),image);
 app.switchAccount('demo-profile-2');assert.equal(app.state.user.name,'Maya');
 assert.equal(document.querySelector('.profile-content h2').textContent,'Maya');
 assert.equal(storage.get('fhv-demo-active'),'demo-profile-2');
});
test('featured events follow the pinned card and have independent accessible controls',async()=>{
 const {document}=await mountedApp();const slides=document.querySelectorAll('.featured-track>.pinned-post');
 assert.ok(slides.length>1);assert.ok(slides[0].textContent.includes('PINNED'));
 assert.equal(document.querySelector('[data-action="featured-prev"]').disabled,true);
 assert.equal(document.querySelector('[data-action="featured-next"]').disabled,false);
 assert.ok(document.querySelector('.featured-track').getAttribute('aria-label').includes('Swipe'));
});
