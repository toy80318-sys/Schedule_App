((root)=>{
 'use strict';
 function build(state,scenes,width,height,uid){
  const placed=new Set(state.objects.filter(o=>o.placementRole!=='foreground_fill_v67').map(o=>o.assetId)),theme=scenes.find(s=>s.project.background===state.background)?.id||state.assets.find(a=>placed.has(a.id)&&a.theme)?.theme;
  const pool=[...state.assets].filter(a=>a.theme===theme&&a.completeObject&&a.src).sort((a,b)=>Number(placed.has(b.id))-Number(placed.has(a.id)));
  const unique=items=>{const map=new Map();for(const a of items)if(!map.has(a.src))map.set(a.src,a);return [...map.values()]};
  const rocks=unique(pool.filter(a=>/_rocks_0[124]_/.test(a.src))),grass=unique(pool.filter(a=>/GrassTuft_Complete|_greenery_0[56]_/.test(a.src)));
  if(!rocks.length||!grass.length)throw Error('현재 배경에 맞는 완성형 돌·풀 소스를 먼저 불러와 주세요.');
  const rows=[{assets:rocks,step:.11,size:.31,depth:.67,phase:0},{assets:grass,step:.083,size:.195,depth:.73,phase:.4},{assets:rocks,step:.14,size:.245,depth:.56,phase:.5},{assets:grass,step:.09,size:.16,depth:.54,phase:.15}],objects=[];
  rows.forEach((row,k)=>{
   const step=height*row.step*.72;
   for(let i=-1;i<=Math.ceil(width/step)+1;i++){
    const a=row.assets[((i+3)*7+k)%row.assets.length],w=height*row.size*.72*(1+.1*Math.sin(i*2.37+k)),h=w*a.height/a.width;
    const center=(i+row.phase)*step+step*.08*Math.sin(i*3.13+k);
    objects.push({id:uid(),assetId:a.id,name:a.name+' · 하단 채움',x:center-w/2,y:height-h*(row.depth+.025*Math.sin(i*1.71+k)),w,h,baseW:w,baseH:h,aspect:w/h,r:0,flipX:i%2===0,opacity:1,motion:'stationary',placementRole:'foreground_fill_v67'});
   }
  });
  return objects;
 }
 build.clipPath=(pose,width,height)=>{
  const angle=pose.r*Math.PI/180,[a,b,c,d]=pose.plane||[Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle)],det=a*d-b*c;
  if(Math.abs(det)<1e-9)return 'inset(100%)';
  const cx=pose.x+pose.w/2,cy=pose.y+pose.h/2;
  return 'polygon('+[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>{const dx=x-cx,dy=y-cy;return ((d*dx-c*dy)/det+pose.w/2)+'px '+((-b*dx+a*dy)/det+pose.h/2)+'px'}).join(',')+')';
 };
 if(typeof module==='object'&&module.exports)module.exports=build;else root.jejuForegroundFill=build;
})(typeof window==='object'?window:globalThis);
