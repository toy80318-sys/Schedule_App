((root)=>{
 'use strict';
 const fields={brightness:[100,0,200],contrast:[100,0,200],saturation:[100,0,200],hue:[0,-180,180],glowStrength:[0,0,100],glowRadius:[16,1,40]};
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function normalize(value){return Object.fromEntries(Object.entries(fields).map(([key,[fallback,min,max]])=>[key,finite(value?.[key])?Math.max(min,Math.min(max,value[key])):fallback]))}
 function valid(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(fields).every(([key,[,min,max]])=>value[key]===undefined||finite(value[key])&&value[key]>=min&&value[key]<=max)}
 function colorCSS(value){const v=normalize(value);return[v.brightness!==100?`brightness(${v.brightness}%)`:'',v.contrast!==100?`contrast(${v.contrast}%)`:'',v.saturation!==100?`saturate(${v.saturation}%)`:'',v.hue?`hue-rotate(${v.hue}deg)`:''].filter(Boolean).join(' ')}
 function css(value,height=3480,pixelScale=1){const v=normalize(value),h=finite(height)&&height>0?height:3480,scale=finite(pixelScale)&&pixelScale>=0?pixelScale:1,sigma=v.glowRadius*h/1080*scale;if(v.glowStrength&&!Number.isFinite(sigma))throw Error('Invalid object effect dimensions');return[colorCSS(v),v.glowStrength?`drop-shadow(0px 0px ${sigma.toFixed(3)}px rgba(255,244,218,${(v.glowStrength/100).toFixed(3)}))`:''].filter(Boolean).join(' ')}
 const n='[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?',blur=new RegExp('\\bblur\\(\\s*('+n+')px\\s*\\)','gi'),shadow=new RegExp('\\bdrop-shadow\\(\\s*('+n+')px\\s+('+n+')px\\s+('+n+')px','gi');
 function scaleCSS(filter,scale){
  if(typeof filter!=='string')return'';const factor=finite(scale)&&scale>=0?scale:1;
  const px=value=>{const result=Number(value)*factor;if(!Number.isFinite(result))throw Error('Invalid object effect scale');return result.toFixed(3)+'px'};
  return filter.replace(blur,(_,sigma)=>'blur('+px(sigma)+')').replace(shadow,(_,x,y,sigma)=>'drop-shadow('+px(x)+' '+px(y)+' '+px(sigma));
 }
 function padding(filter){
  if(typeof filter!=='string')return 0;let sigma=0,offset=0;
  for(const match of filter.matchAll(blur)){const v=Number(match[1]);if(Number.isFinite(v))sigma+=Math.max(0,v)}
  for(const match of filter.matchAll(shadow)){const [x,y,v]=match.slice(1).map(Number);if([x,y,v].every(Number.isFinite)){sigma+=Math.max(0,v);offset=Math.max(offset,Math.abs(x),Math.abs(y))}}
  return Math.ceil(3*(sigma+offset));
 }
 const api={normalize,valid,colorCSS,css,scaleCSS,padding};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuObjectEffects=api;
})(typeof window==='object'?window:globalThis);
