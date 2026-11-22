import {mergeChanges} from './merge.js';
const clone=x=>structuredClone(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const roomToken=value=>/^[a-f0-9]{64}$/.test(value||'')?value:null;
export class PresentationSync {
 constructor({endpoint,token,onChange,onStatus,storage=localStorage,fetcher=(...args)=>fetch(...args)}){Object.assign(this,{endpoint:endpoint.replace(/\/$/,''),token,onChange,onStatus,storage,fetcher});this.queue=[];this.busy=false;this.etag='';try{this.queue=JSON.parse(storage.getItem(this.queueKey)||'[]');}catch{} }
 get queueKey(){return 'fhv-room-pending-'+this.token;}
 stash(){try{this.storage.setItem(this.queueKey,JSON.stringify(this.queue));}catch{try{this.storage.removeItem(this.queueKey);}catch{}this.onStatus('saving','Device storage is full. Keep the app open until syncing finishes.');}}
 async request(path,options={}){
  const r=await this.fetcher(this.endpoint+path,{...options,headers:{'Content-Type':'application/json',...(this.token?{Authorization:'Bearer '+this.token}:{}),...options.headers},signal:AbortSignal.timeout(20000)});
  if(r.status===304)return null;
  const data=await r.json();if(!r.ok)throw Error(data.error||'Shared storage is unavailable.');this.etag=r.headers.get('etag')||'';return data;
 }
 adopt(world){let merged=world;for(const job of this.queue)merged=mergeChanges(job.base,job.next,merged);this.local=clone(merged);this.onChange(clone(merged));}
 async connect(){const data=await this.request('/state');this.adopt(data.world);this.onStatus('saved');this.flush();return data;}
 save(world){if(!this.local||same(this.local,world))return;this.queue.push({base:clone(this.local),next:clone(world)});this.local=clone(world);this.stash();this.onStatus('saving');void this.flush();}
 async flush(){
  if(this.busy||!this.queue.length)return;this.busy=true;let success=false;
  try{const job=this.queue[0];const data=await this.request('/state',{method:'POST',body:JSON.stringify(job)});this.queue.shift();this.stash();this.adopt(data.world);this.onStatus(this.queue.length?'saving':'saved');success=true;}
  catch(error){this.onStatus('offline',error.message);}finally{this.busy=false;}
  if(success&&this.queue.length)void this.flush();
 }
 async refresh(){const started=Date.now();while(this.busy&&Date.now()-started<22000)await new Promise(resolve=>setTimeout(resolve,40));if(this.busy)throw Error('Sync is still running. Please try again.');if(this.queue.length){await this.flush();if(this.queue.length)throw Error('Your changes are waiting for a connection.');}const data=await this.request('/state');this.adopt(data.world);this.onStatus('saved');}
 async poll(){if(this.busy)return;if(this.queue.length)return this.flush();try{const data=await this.request('/state',{headers:this.etag?{'If-None-Match':this.etag}:{}});if(data)this.adopt(data.world);this.onStatus('saved');}catch(error){this.onStatus('offline',error.message);}}
}
export async function createPresentation(endpoint,world){const r=await fetch(endpoint.replace(/\/$/,'')+'/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({world}),signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok)throw Error(data.error||'Could not create the room.');return data;}
