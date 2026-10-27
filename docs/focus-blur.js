((root)=>{
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const number=(v,fallback,min,max)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):fallback;
 function normalize(v){return {background:number(v?.background,0,0,30),far:number(v?.far,0,0,30),near:number(v?.near,0,0,30),focus:number(v?.focus,.65,.2,.9)}}
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
 const backgroundScale=v=>1+6*normalize(v).background/1080;
 const api={normalize,depth,amount,css,scaleCSS,backgroundScale};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuFocus=api;
})(typeof window==='object'?window:globalThis);
