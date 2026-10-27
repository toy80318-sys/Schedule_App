/* Swap whole flower silhouettes while keeping each planted root in place. */
(function(root){
 'use strict';
 function species(a){const value=a?.species||'';if(value==='rapeseed')return'canola';if(value)return value;const text=(a?.name||'')+' '+(a?.designLabel||'');return [['camellia',/동백/],['marigold',/금잔화|메리골드/],['buckwheat',/메밀|크림꽃|흰꽃/],['canola',/유채/],['hydrangea',/수국/],['lavender',/라벤더/]].find(v=>v[1].test(text))?.[0]}
 function plan(items,assets,random=Math.random){
  const map=new Map(assets.map(a=>[a.id,a])),available=assets.filter(a=>a.group==='flowers'&&a.completeObject&&a.setReviewVersion==='V05'&&a.ready!==false&&!a.referenceOnly&&!a.legacyFlower),result=[];
  for(const o of items){const old=map.get(o.assetId),kind=species(old);if(old?.group!=='flowers'||!kind||!old.theme||!['x','y','w','h'].every(k=>Number.isFinite(o[k])))continue;
   let choices=available.filter(a=>!a.catalogHidden&&a.id!==old.id&&a.src!==old.src&&a.theme===old.theme&&species(a)===kind&&(!old.color||a.color===old.color));if(!choices.length)continue;
   const latest=Math.max(0,...choices.map(a=>a.artStyleVersion||0));if(latest)choices=choices.filter(a=>a.artStyleVersion===latest);
   const a=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))],before=(o.r||0)*Math.PI/180,r=(o.r||0)+(random()*2-1)*6,after=r*Math.PI/180;
   const rootX=o.x+o.w/2-Math.sin(before)*o.h/2,rootY=o.y+o.h/2+Math.cos(before)*o.h/2;
   result.push({id:o.id,patch:{assetId:a.id,name:a.name,r,flipX:a.morphologyVersion?false:random()<.5,x:rootX+Math.sin(after)*o.h/2-o.w/2,y:rootY-Math.cos(after)*o.h/2-o.h/2}});
  }
  return result;
 }
 const api={species,plan};if(typeof module==='object')module.exports=api;else root.jejuFlowerShapes=api;
})(typeof window==='object'?window:globalThis);
