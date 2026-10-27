/* Group density rules; scene mutation and undo remain in app.js. */
(function(root){
 'use strict';
 function selectedGroup(objects,selected){
  const id=selected[0]?.groupId;if(!id||selected.some(o=>o.groupId!==id))return null;
  const items=objects.filter(o=>o.groupId===id);return items.length?{id,name:items[0].groupName||'그룹',items}:null;
 }
 function candidates(objects,groupId,assetId=null){return groupId?objects.filter(o=>o.groupId===groupId&&(!assetId||o.assetId===assetId)):[]}
 function step(count,increase){return count?Math.min(Math.max(1,Math.round(count*.1)),increase?count:count-1):0}
 function change(objects,groupId,assetId,increase,uid,random=Math.random){
  const source=candidates(objects,groupId,assetId),count=step(source.length,increase);
  if(!count)return{objects,count:0,before:source.length,after:source.length};
  const pool=source.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  const chosen=pool.slice(0,count);let next;
  if(increase){
   let left=Math.min(...source.map(o=>o.x)),top=Math.min(...source.map(o=>o.y)),right=Math.max(...source.map(o=>o.x+o.w)),bottom=Math.max(...source.map(o=>o.y+o.h));
   if(source.length===1){left-=source[0].w*.4;right+=source[0].w*.4;top-=source[0].h*.12;bottom+=source[0].h*.12}
   const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),copies=new Map(chosen.map(o=>{const copy=structuredClone(o);copy.id=uid();copy.name=o.name+' 추가';copy.x=clamp(o.x+(random()-.5)*o.w*.8,left,Math.max(left,right-o.w));copy.y=clamp(o.y+(random()-.5)*o.h*.24,top,Math.max(top,bottom-o.h));return[o.id,copy]}));
   next=objects.flatMap(o=>copies.has(o.id)?[o,copies.get(o.id)]:[o]);
  }else{const ids=new Set(chosen.map(o=>o.id));next=objects.filter(o=>!ids.has(o.id))}
  return{objects:next,count,before:source.length,after:source.length+(increase?count:-count)};
 }
 const api={selectedGroup,candidates,step,change};if(typeof module==='object')module.exports=api;else root.jejuGroupDensity=api;
})(typeof window==='object'?window:globalThis);
