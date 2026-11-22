export const TAB_ORDER=['feed','trade','activities','profile'];
export function swipeDestination(tab,dx,dy,duration=500){
 if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5||duration>1000)return null;
 const index=TAB_ORDER.indexOf(tab)+(dx<0?1:-1);return TAB_ORDER[index]||null;
}
export function shouldRefreshPull(distance,startScroll){return startScroll<=0&&distance>=135;}
export function installGestures({target,onSwipe,onRefresh,onPull,isBlocked,isMobile}){
 let gesture=null,suppressUntil=0;
 function start(x,y,node){
  if(!isMobile()||isBlocked()||x<22||x>window.innerWidth-22||node.closest('input,textarea,select,[contenteditable],.modal,.bottom-nav,.header-actions,.chips,.segment-control,.featured-carousel'))return;
  gesture={x,y,dx:0,dy:0,started:Date.now(),scroll:window.scrollY,axis:null};
 }
 function move(x,y,event){
  if(!gesture)return;gesture.dx=x-gesture.x;gesture.dy=y-gesture.y;
  if(!gesture.axis&&Math.max(Math.abs(gesture.dx),Math.abs(gesture.dy))>12)gesture.axis=Math.abs(gesture.dx)>Math.abs(gesture.dy)*1.3?'x':'y';
  if(gesture.axis==='x'){if(event.cancelable)event.preventDefault();}
  else if(gesture.axis==='y'&&gesture.scroll<=0&&window.scrollY<=0&&gesture.dy>14){if(event.cancelable)event.preventDefault();onPull(Math.min(82,gesture.dy*.45));}
 }
 function end(){
  if(!gesture)return;const g=gesture;gesture=null;
  if(g.axis==='x'&&Math.abs(g.dx)>=60){suppressUntil=Date.now()+450;onSwipe(g.dx,g.dy,Date.now()-g.started);}
  else if(g.axis==='y'&&shouldRefreshPull(g.dy,g.scroll)){suppressUntil=Date.now()+450;onRefresh();}
  onPull(0);
 }
 target.addEventListener('touchstart',e=>{if(e.touches.length===1)start(e.touches[0].clientX,e.touches[0].clientY,e.target);else gesture=null;},{passive:true});
 target.addEventListener('touchmove',e=>{if(e.touches.length===1)move(e.touches[0].clientX,e.touches[0].clientY,e);},{passive:false});
 target.addEventListener('touchend',end,{passive:true});target.addEventListener('touchcancel',()=>{gesture=null;onPull(0);},{passive:true});
 target.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)start(e.clientX,e.clientY,e.target);});
 target.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&e.buttons===1)move(e.clientX,e.clientY,e);});
 target.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')end();});
 target.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
}
