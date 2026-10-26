((root)=>{
 'use strict';
 function build(state,data,scenes,width,height,uid){
  const map=new Map(state.assets.map(a=>[a.id,a])),theme=scenes.find(s=>s.project.background===state.background)?.id||state.objects.map(o=>map.get(o.assetId)?.theme).find(Boolean);
  const variants=data.assets.filter(a=>a.theme===theme&&a.group==='flowers'),props=data.assets.filter(a=>a.theme===theme&&a.group==='decor');
  if(variants.length!==4||props.length!==2)throw Error('현재 배경의 새 꽃·후경 소스를 찾지 못했습니다.');
  const representative=scenes.find(s=>s.id===theme)?.assets.find(a=>a.group==='flowers');let changed=0;
  const objects=state.objects.filter(o=>o.placementRole!=='contrast_backdrop_v68').map(o=>{
   const a=map.get(o.assetId);if(a?.group!=='flowers'||a.src!==representative?.src)return {...o};
   const v=variants[changed++%4];return {...o,assetId:v.id,name:v.name};
  });
  const used=objects.some(o=>variants.some(a=>a.id===o.assetId));
  if(!used)return {objects:state.objects,changed:0};
  const back=[];
  for(let i=0;i<20;i++){
   const a=props[i%2],w=height*(a.decorType==='basalt'?.27:.24)*(1+.08*Math.sin(i*2.3)),h=w*a.height/a.width;
   back.push({id:uid(),assetId:a.id,name:a.name,x:width*(i+.4)/20-w/2,y:height*(.8+.025*Math.sin(i*1.7))-h*.75,w,h,baseW:w,baseH:h,aspect:w/h,r:Math.sin(i)*4,opacity:1,flipX:i%3===0,motion:'stationary',placementRole:'contrast_backdrop_v68'});
  }
  const at=objects.findIndex(o=>map.get(o.assetId)?.group==='flowers'||variants.some(a=>a.id===o.assetId));objects.splice(Math.max(0,at),0,...back);
  return {objects,changed};
 }
 if(typeof module==='object'&&module.exports)module.exports=build;else root.jejuContrastAdditions=build;
})(typeof window==='object'?window:globalThis);
