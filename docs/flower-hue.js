((root)=>{
 'use strict';
 const normalize=v=>typeof v==='number'&&Number.isFinite(v)?Math.round(Math.max(-10,Math.min(10,v))):0;
 function definition(value){const degrees=normalize(value);return `<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -10 10 0 0 0" result="greenR"/><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 10 -10 0 0" result="greenB"/><feComposite in="greenR" in2="greenB" operator="in" result="leafMask"/><feColorMatrix in="SourceGraphic" type="hueRotate" values="${degrees}" result="hued"/><feComposite in="SourceGraphic" in2="leafMask" operator="in" result="leaf"/><feComposite in="hued" in2="leafMask" operator="out" result="petals"/><feComposite in="leaf" in2="petals" operator="arithmetic" k2="1" k3="1"/>`}
 function css(value){
  const degrees=normalize(value);if(!degrees)return '';
  const id='jeju-flower-hue-'+(degrees<0?'m':'p')+Math.abs(degrees),NS='http://www.w3.org/2000/svg';
  if(!document.getElementById(id)){
   let svg=document.getElementById('jeju-flower-hue-defs');if(!svg){svg=document.createElementNS(NS,'svg');svg.id='jeju-flower-hue-defs';svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';document.body.append(svg)}
   const filter=document.createElementNS(NS,'filter');filter.id=id;filter.setAttribute('color-interpolation-filters','sRGB');filter.innerHTML=definition(degrees);svg.append(filter);
  }
  return `url(#${id})`;
 }
 const api={normalize,definition,css};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuFlowerHue=api;
})(typeof window==='object'?window:globalThis);
