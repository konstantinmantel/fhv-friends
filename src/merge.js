// Three-way merge: apply only local changes, preserving concurrent remote edits.
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const copy=x=>x===undefined?undefined:structuredClone(x);
export function mergeChanges(base,next,remote){
 if(equal(base,next))return copy(remote);
 if(base===undefined&&Array.isArray(next)&&Array.isArray(remote))base=[];
 if(base===undefined&&object(next)&&object(remote))base={};
 if(Array.isArray(base)&&Array.isArray(next)&&Array.isArray(remote)){
  const values=[...base,...next,...remote];
  if(values.length&&values.every(x=>object(x)&&typeof x.id==='string')){
   const b=new Map(base.map(x=>[x.id,x])),n=new Map(next.map(x=>[x.id,x])),r=new Map(remote.map(x=>[x.id,x]));
   for(const [id,old] of b)if(!n.has(id))r.delete(id);
   for(const [id,value] of n){if(!b.has(id))r.set(id,r.has(id)?mergeChanges({},value,r.get(id)):copy(value));else if(!equal(b.get(id),value))r.set(id,mergeChanges(b.get(id),value,r.get(id)||{}));}
   return [...r.values()];
  }
  const removed=base.filter(x=>!next.some(y=>equal(x,y)));
  const result=remote.filter(x=>!removed.some(y=>equal(x,y)));
  for(const x of next)if(!base.some(y=>equal(x,y))&&!result.some(y=>equal(x,y)))result.push(copy(x));
  return result;
 }
 if(object(base)&&object(next)){
  const result=object(remote)?copy(remote):{};
  for(const key of new Set([...Object.keys(base),...Object.keys(next)])){
   if(['__proto__','prototype','constructor'].includes(key))continue;
   if(!(key in next)){delete result[key];continue;}
   if(!equal(base[key],next[key]))result[key]=mergeChanges(base[key],next[key],result[key]);
  }
  return result;
 }
 return copy(next);
}
