import test from 'node:test';
import assert from 'node:assert/strict';
import {swipeDestination,shouldRefreshPull,installGestures} from '../src/gestures.js';
test('horizontal swipes select adjacent tabs without wrapping',()=>{
 assert.equal(swipeDestination('feed',-110,8),'trade');
 assert.equal(swipeDestination('activities',100,12),'trade');
 assert.equal(swipeDestination('profile',-120,2),null);
 assert.equal(swipeDestination('feed',100,2),null);
 for(const [x,y,t] of [[20,1,100],[80,90,200],[100,3,1500]])assert.equal(swipeDestination('trade',x,y,t),null);
});
test('pull refresh only activates at the top after an intentional pull',()=>{
 assert.equal(shouldRefreshPull(145,0),true);
 assert.equal(shouldRefreshPull(70,0),false);
 assert.equal(shouldRefreshPull(160,40),false);
 assert.equal(shouldRefreshPull(-150,0),false);
});
test('gesture routing ignores modal and carousel gestures and cancels accidental clicks',()=>{
 const listeners={},target={addEventListener:(name,callback)=>listeners[name]=callback};
 const previous=globalThis.window;globalThis.window={innerWidth:390,scrollY:0};
 let blocked=false,swipes=0,refreshes=0;
 try{
 installGestures({target,isBlocked:()=>blocked,isMobile:()=>true,onSwipe:()=>swipes++,onRefresh:()=>refreshes++,onPull(){}});
 const node={closest:()=>false},point=(x,y,n=node)=>({target:n,touches:[{clientX:x,clientY:y}],cancelable:true,preventDefault(){}});
 listeners.touchstart(point(250,200));listeners.touchmove(point(100,208));listeners.touchend();assert.equal(swipes,1);
 let prevented=false;listeners.click({preventDefault(){prevented=true;},stopImmediatePropagation(){}});assert.equal(prevented,true);
 listeners.touchstart(point(120,40));listeners.touchmove(point(125,200));listeners.touchend();assert.equal(refreshes,1);
 listeners.touchstart(point(250,100,{closest:()=>true}));listeners.touchmove(point(100,105));listeners.touchend();assert.equal(swipes,1);
 blocked=true;listeners.touchstart(point(250,100));listeners.touchmove(point(100,105));listeners.touchend();assert.equal(swipes,1);
 }finally{globalThis.window=previous;}
});
