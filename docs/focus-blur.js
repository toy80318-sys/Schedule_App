((root)=>{
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const number=(v,fallback,min,max)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):fallback;
 function normalize(v){
  const out={background:number(v?.background,0,0,30),far:number(v?.far,0,0,30),near:number(v?.near,0,0,30),focus:number(v?.focus,.65,.2,.9)},r=v?.region;
  if(r&&typeof r==='object'&&!Array.isArray(r)&&['x','y','w','h','blur'].every(k=>typeof r[k]==='number'&&Number.isFinite(r[k]))){const w=clamp(r.w,.01,1),h=clamp(r.h,.01,1);out.region={x:clamp(r.x,0,1-w),y:clamp(r.y,0,1-h),w,h,blur:clamp(r.blur,0,30)}}
  return out;
 }
 function depth(o,height,space){
  if(space?.enabled!==false&&space?.spatial)return clamp((number(o.z,0,-2000,2000)+2000)/4000,0,1);
  const r=number(o.r,0,-36000,36000)*Math.PI/180,foot=number(o.y,0,-1e6,1e6)+number(o.h,0,0,1e6)*(1+Math.cos(r))/2;
  return clamp((foot/height-.45)/.55,0,1);
 }
 function amount(o,a,v,height=3480,space){
  const f=normalize(v),manual=number(o?.blur,0,0,40);
  if(!root.jejuSpace?.ground(a)&&!(a?.group==='flowers'||['grass','basalt','stone','branch'].includes(a?.category)))return manual;
  const d=depth(o,height,space),distance=d<f.focus?f.far*((f.focus-d)/f.focus)**1.5:f.near*((d-f.focus)/(1-f.focus))**1.5;
  return Math.round(clamp(manual+distance,0,60)*10)/10;
 }
 function css(value,height=3480,pixelScale=1){const px=number(value,0,0,60)*height/1080*pixelScale;return px>0?`blur(${px.toFixed(3)}px)`:''}
 function scaleCSS(filter,scale){return filter.replace(/blur\(([\d.]+)px\)/g,(_,n)=>`blur(${(Number(n)*scale).toFixed(3)}px)`)}
 const regionSources=new WeakMap();
 function drawRegion(ctx,canvas,focus){
  const r=normalize(focus).region;if(!r||!r.blur||!canvas.width||!canvas.height)return false;
  let source=regionSources.get(canvas);if(!source){source=(canvas.ownerDocument||root.document)?.createElement('canvas');if(!source)return false;regionSources.set(canvas,source)}
  if(source.width!==canvas.width||source.height!==canvas.height){source.width=canvas.width;source.height=canvas.height}
  const copy=source.getContext('2d');if(!copy)return false;copy.clearRect(0,0,source.width,source.height);copy.drawImage(canvas,0,0);
  const x=r.x*canvas.width,y=r.y*canvas.height,w=r.w*canvas.width,h=r.h*canvas.height;
  ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter=css(r.blur,canvas.height);ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.clearRect(x,y,w,h);ctx.drawImage(source,0,0)}finally{ctx.restore()}
  return true;
 }
 const backgroundScale=v=>1+6*normalize(v).background/1080;
 const api={normalize,depth,amount,css,scaleCSS,backgroundScale,drawRegion};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuFocus=api;
})(typeof window==='object'?window:globalThis);
