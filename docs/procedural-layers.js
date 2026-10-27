/* A saved PCG recipe contains independent, editable lines and regions. */
(function(root){
 'use strict';const P=typeof module==='object'?require('./procedural-garden'):root.jejuProceduralGarden;
 function normalize(value={}){
  const source=Array.isArray(value.layers)&&value.layers.length?value.layers:[{id:'layer-1',name:'영역 1',params:value}],seen=new Set();
  const layers=source.slice(0,12).map((layer,i)=>{let id=typeof layer.id==='string'?layer.id.slice(0,80):'layer-'+(i+1);if(!id||seen.has(id))id='layer-'+(i+1);while(seen.has(id))id+='-';seen.add(id);return{id,name:(typeof layer.name==='string'&&layer.name.trim()?layer.name.trim():'라인 '+(i+1)).slice(0,80),enabled:layer.enabled!==false,params:P.normalize(layer.params||{})}});
  return{layers,activeLayerId:layers.some(l=>l.id===value.activeLayerId)?value.activeLayerId:layers[0]?.id||null};
 }
 function ready(layer){const p=layer.params;return p.shape==='rectangle'||p.points.length>=(p.shape==='curve'?3:2)}
 function build(state,input,width,height,uid,groupId=null){
  if(Array.isArray(input.layers)&&input.layers.length>12)throw Error('라인·영역은 최대 12개까지 사용할 수 있습니다.');
  const params=normalize(input),id=groupId||uid(),objects=[];let plantCount=0,flowerCount=0;
  for(const layer of params.layers.filter(l=>l.enabled)){
   let result;try{result=P.build(state,layer.params,width,height,uid,id)}catch(error){throw Error(layer.name+' · '+error.message)}
   layer.params=result.params;plantCount+=result.plantCount;flowerCount+=result.flowerCount;
   objects.push(...result.objects.map(o=>({...o,pcgLayerId:layer.id,pcgLayerName:layer.name})));
   if(objects.length>1600)throw Error('총 요소가 1,600개를 넘습니다. 라인별 밀도를 줄이거나 일부 라인을 꺼 주세요.');
  }
  if(!objects.length)throw Error('요소가 있는 라인·영역을 하나 이상 켜 주세요.');
  const meta={type:'flower-bed',version:3,params},rootY=o=>o.y+o.h/2+Math.cos(o.r*Math.PI/180)*o.h/2;
  objects.sort((a,b)=>rootY(a)-rootY(b));for(const o of objects){o.procedural=meta;o.groupName='PCG 꽃밭 · '+params.layers.filter(l=>l.enabled).length+'개 라인·영역'}
  return{objects,params,plantCount,flowerCount,groupId:id,theme:P.theme(state)};
 }
 const api={normalize,ready,build};if(typeof module==='object')module.exports=api;else root.jejuProceduralLayers=api;
})(typeof window==='object'?window:globalThis);
