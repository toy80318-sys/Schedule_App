(function(root){
 'use strict';
 const X=[0,64/255,128/255,192/255,1],DEFAULT=[0,64,128,192,255],cache=new Map(),NS='http://www.w3.org/2000/svg';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),number=(v,f,a,b)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,a,b):f;
 function normalize(v){return{hue:number(v?.hue,0,-180,180),exposure:number(v?.exposure,0,-3,3),brightness:number(v?.brightness,100,0,200),curve:DEFAULT.map((d,i)=>number(v?.curve?.[i],d,0,255)),groundHeight:number(v?.groundHeight,0,-15,40)}}
 function placement(value){const h=normalize(value).groundHeight/100;return{scaleY:1+2*Math.abs(h),offsetY:h?-h:0}}
 function neutral(v){v=normalize(v);return v.hue===0&&v.exposure===0&&v.brightness===100&&v.curve.every((n,i)=>n===DEFAULT[i])}
 function curveTable(values){
  const y=normalize({curve:values}).curve.map(v=>v/255),d=X.slice(1).map((x,i)=>(y[i+1]-y[i])/(x-X[i])),m=[d[0],0,0,0,d[3]];
  for(let i=1;i<4;i++)m[i]=d[i-1]*d[i]>0?2*d[i-1]*d[i]/(d[i-1]+d[i]):0;
  for(let i=0;i<4;i++){if(d[i]===0){m[i]=m[i+1]=0;continue}const a=m[i]/d[i],b=m[i+1]/d[i],r=a*a+b*b;if(r>9){const k=3/Math.sqrt(r);m[i]=k*a*d[i];m[i+1]=k*b*d[i]}}
  return Array.from({length:256},(_,n)=>{const x=n/255;let i=0;while(i<3&&x>X[i+1])i++;const h=X[i+1]-X[i],t=(x-X[i])/h,t2=t*t,t3=t2*t;return clamp((2*t3-3*t2+1)*y[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*y[i+1]+(t3-t2)*h*m[i+1],0,1)});
 }
 const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,srgb=v=>v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055;
 function table(value){const v=normalize(value),curve=curveTable(v.curve);return Array.from({length:256},(_,i)=>{const exposed=clamp(srgb(clamp(linear(i/255)*2**v.exposure,0,1)),0,1)*255,lo=Math.floor(exposed),hi=Math.min(255,lo+1),f=exposed-lo;return clamp((curve[lo]*(1-f)+curve[hi]*f)*v.brightness/100,0,1)})}
 function hueMatrix(deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[.213+.787*c-.213*s,.715-.715*c-.715*s,.072-.072*c+.928*s,.213-.213*c+.143*s,.715+.285*c+.140*s,.072-.072*c-.283*s,.213-.213*c-.787*s,.715-.715*c+.715*s,.072+.928*c+.072*s]}
 function pixel(rgb,value){const v=normalize(value),m=hueMatrix(v.hue),t=table(v);return[0,1,2].map(i=>{const p=clamp(m[i*3]*rgb[0]+m[i*3+1]*rgb[1]+m[i*3+2]*rgb[2],0,255),a=Math.floor(p),b=Math.min(255,a+1);return Math.round(255*(t[a]*(1-p+a)+t[b]*(p-a)))})}
 function css(value,id='jeju-background-grade'){
  const v=normalize(value);if(neutral(v))return'';if(!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id))throw Error('Invalid background filter ID');
  let item=cache.get(id);if(!item){
   const svg=document.createElementNS(NS,'svg'),defs=document.createElementNS(NS,'defs'),filter=document.createElementNS(NS,'filter'),hue=document.createElementNS(NS,'feColorMatrix'),transfer=document.createElementNS(NS,'feComponentTransfer');
   svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';svg.style.pointerEvents='none';filter.setAttribute('id',id);filter.setAttribute('color-interpolation-filters','sRGB');hue.setAttribute('type','hueRotate');
   const channels=['R','G','B'].map(c=>{const el=document.createElementNS(NS,'feFunc'+c);el.setAttribute('type','table');transfer.append(el);return el});filter.append(hue,transfer);defs.append(filter);svg.append(defs);document.body.append(svg);item={hue,channels,key:''};cache.set(id,item);
  }
  const key=JSON.stringify([v.hue,v.exposure,v.brightness,v.curve]);if(item.key!==key){item.hue.setAttribute('values',String(v.hue));const values=table(v).map(x=>x.toFixed(7)).join(' ');for(const el of item.channels)el.setAttribute('tableValues',values);item.key=key}
  return'url(#'+id+')';
 }
 const api={normalize,neutral,placement,curveTable,table,hueMatrix,pixel,css};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuBackgroundGrade=api;
})(typeof window==='object'?window:globalThis);
