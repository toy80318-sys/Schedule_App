((root)=>{
 'use strict';
 const NS='http://www.w3.org/2000/svg',filters=new Map(),sources=new WeakMap();let nextId=0;
 const number=(v,f,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;
 function normalize(v){return{strength:number(v?.strength,0,0,100),radius:number(v?.radius,16,1,40)}}
 function css(value,width,height,id='jeju-glow'){
  const v=normalize(value);if(!v.strength)return'';
  if(!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id))throw Error('Invalid glow filter ID');
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!root.document?.createElementNS)return'';
  let item=filters.get(id);
  if(!item){
   const make=(tag,attributes={})=>{const e=root.document.createElementNS(NS,tag);for(const [k,val] of Object.entries(attributes))e.setAttribute(k,String(val));return e},svg=make('svg',{width:0,height:0,'aria-hidden':'true'}),defs=make('defs'),filter=make('filter',{id,filterUnits:'userSpaceOnUse','color-interpolation-filters':'sRGB'});
   svg.style.position='absolute';svg.style.pointerEvents='none';
   const mask=make('feColorMatrix',{in:'SourceGraphic',type:'luminanceToAlpha',result:'luminance'}),threshold=make('feComponentTransfer',{in:'luminance',result:'brightMask'}),gate=make('feFuncA',{type:'linear',slope:2.5,intercept:-1.5});threshold.append(gate);
   const bright=make('feComposite',{in:'SourceGraphic',in2:'brightMask',operator:'in',result:'bright'}),blur=make('feGaussianBlur',{in:'bright',result:'spread'}),opacity=make('feComponentTransfer',{in:'spread',result:'glow'}),alpha=make('feFuncA',{type:'linear',intercept:0});opacity.append(alpha);
   const blend=make('feBlend',{in:'SourceGraphic',in2:'glow',mode:'screen'});filter.append(mask,threshold,bright,blur,opacity,blend);defs.append(filter);svg.append(defs);root.document.body.append(svg);item={filter,blur,alpha,key:''};filters.set(id,item);
  }
  const key=[v.strength,v.radius,width,height].join(':');
  if(item.key!==key){const sigma=v.radius*height/1080,pad=Math.ceil(sigma*3);for(const [k,val] of Object.entries({x:-pad,y:-pad,width:width+pad*2,height:height+pad*2}))item.filter.setAttribute(k,String(val));item.blur.setAttribute('stdDeviation',String(sigma));item.alpha.setAttribute('slope',String(v.strength/100));item.key=key}
  return'url(#'+id+')';
 }
 function draw(ctx,canvas,value){
  if(!normalize(value).strength||!canvas.width||!canvas.height)return false;
  let item=sources.get(canvas);if(!item){const doc=canvas.ownerDocument||root.document;if(!doc?.createElement)return false;item={canvas:doc.createElement('canvas'),id:'jeju-glow-canvas-'+(++nextId)};sources.set(canvas,item)}
  const filter=css(value,canvas.width,canvas.height,item.id);if(!filter)return false;
  const source=item.canvas;if(source.width!==canvas.width||source.height!==canvas.height){source.width=canvas.width;source.height=canvas.height}
  const copy=source.getContext('2d');if(!copy)return false;copy.clearRect(0,0,source.width,source.height);copy.drawImage(canvas,0,0);
  ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,canvas.width,canvas.height);ctx.filter=filter;ctx.drawImage(source,0,0)}finally{ctx.restore()}
  return true;
 }
 const api={normalize,css,draw};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuGlow=api;
})(typeof window==='object'?window:globalThis);
