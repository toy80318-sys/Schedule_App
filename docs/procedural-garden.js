/* Deterministic flower-bed rules, independent of editor rendering and storage. */
(function(root){
 'use strict';const C=typeof module==='object'?require('./procedural-curves'):root.jejuProceduralCurves;
 const foreground=typeof module==='object'?require('./foreground-grass101'):null,ambient=typeof module==='object'?require('./ambient-policy'):root.jejuAmbient;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),num=(n,d,a,b)=>Number.isFinite(n)?clamp(n,a,b):d;
 function normalize(p={}){
  let left=num(p.left,0,0,99),right=num(p.right,100,1,100),top=num(p.top,68,45,99),bottom=num(p.bottom,99,46,100);
  if(left>right)[left,right]=[right,left];if(top>bottom)[top,bottom]=[bottom,top];right=Math.max(left+1,right);bottom=Math.max(top+1,bottom);
  return{materialsExplicit:p.materialsExplicit===true,shape:['rectangle','curve','path'].includes(p.shape)?p.shape:'rectangle',planting:['mixed','flowers','grass','rocks','props','custom'].includes(p.planting)?p.planting:'mixed',points:(Array.isArray(p.points)?p.points:[]).filter(v=>Number.isFinite(v?.x)&&Number.isFinite(v?.y)).slice(0,32).map(v=>({x:clamp(v.x,0,100),y:clamp(v.y,0,100)})),smooth:num(p.smooth,70,0,100),spacing:num(p.spacing,260,40,2000),spread:num(p.spread,120,0,1200),left,right,top,bottom,density:num(p.density,70,1,100),size:num(p.size,360,80,1000),variation:num(p.variation,10,0,30),rotation:num(p.rotation,10,0,30),clump:num(p.clump,55,0,100),grass:num(p.grass,40,0,100),rocks:num(p.rocks,10,0,30),nearBlur:num(p.nearBlur,0,0,20),seed:Math.floor(num(p.seed,20261027,0,2147483647)),...Object.fromEntries(['assetIds','grassIds','rockIds','propIds'].map(key=>[key,[...new Set((Array.isArray(p[key])?p[key]:[]).filter(id=>typeof id==='string'))].slice(0,64)]))};
 }
 function random(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296}}
 function theme(state){const match=(state.background||'').match(/(?:ML_)?BG0([1-4])(?:_|-)/);if(match)return['sunset','day','night','morning'][+match[1]-1];return state.assets.find(a=>a.src===state.background&&a.theme)?.theme||state.objects.map(o=>state.assets.find(a=>a.id===o.assetId)?.theme).find(Boolean)||null}
 const rear=a=>/rear/i.test(a?.id||'')||/Rear/.test(a?.src||'')||a?.decorType==='branch';
 function ground(o,a){return o.placementRole!=='contrast_backdrop_v68'&&!rear(a)&&(a?.group==='flowers'||['grass','leaf','basalt','rock'].includes(a?.category)||/-rocks-/.test(a?.id||''))}
 function pools(state){
  const key=theme(state),all=state.assets.filter(a=>a.theme===key&&a.completeObject&&a.ready!==false&&a.src&&!a.catalogHidden&&!a.legacyFlower&&!a.referenceOnly&&(!ambient||!ambient.isRetired(a))),unique=list=>[...new Map(list.map(a=>[a.src,a])).values()],version=a=>Number((a.setReviewVersion||'').slice(1))||0;
  const flowers=unique(all.filter(a=>a.group==='flowers')),grass=unique(all.filter(a=>['grass','leaf'].includes(a.category)&&!rear(a))),rocks=unique(all.filter(a=>(['basalt','rock'].includes(a.category)||/-rocks-/.test(a.id))&&!rear(a)));
  const preferred=list=>{const style=Math.max(0,...list.map(a=>a.artStyleVersion||0)),latest=Math.max(0,...list.map(version));return list.filter(a=>!a.catalogHidden&&(style?a.artStyleVersion===style:!latest||version(a)===latest)).map(a=>a.id)};
  const props=unique(all.filter(a=>['tree','branch','cloud','butterfly','bird','particle','mist'].includes(a.category)&&/\.(png|webp)(?:[?#]|$)/i.test(a.src)));
  const addedGrass=grass.filter(a=>a.foregroundGrassVersion===101),baseGrass=addedGrass.length?grass.filter(a=>(foreground||root.jejuForegroundGrass)?.original(a)):[],grassIds=[...new Set([...preferred(grass),...baseGrass.map(a=>a.id),...addedGrass.map(a=>a.id)])];
  return{theme:key,flowers,grass,rocks,props,preferred:{assetIds:preferred(flowers),grassIds,rockIds:preferred(rocks),propIds:preferred(props)}};
 }
 function selectedGroup(objects,selected){const id=selected[0]?.groupId;if(!id||selected.some(o=>o.groupId!==id))return null;const o=objects.find(o=>o.groupId===id&&o.procedural?.type==='flower-bed');return o?{id,name:o.groupName,params:Array.isArray(o.procedural.params?.layers)?(typeof module==='object'?require('./procedural-layers'):root.jejuProceduralLayers).normalize(o.procedural.params):normalize(o.procedural.params)}:null}
 function build(state,input,width,height,uid,groupId=null){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('꽃밭 화면 크기가 올바르지 않습니다.');
  const p=normalize(input),pool=pools(state),flowers=p.assetIds.map(id=>pool.flowers.find(a=>a.id===id)).filter(Boolean);
  if(!p.materialsExplicit){if(!p.grassIds.length)p.grassIds=pool.preferred.grassIds;if(!p.rockIds.length)p.rockIds=pool.preferred.rockIds;if(!p.propIds.length)p.propIds=pool.preferred.propIds;}
  const grass=p.grassIds.map(id=>pool.grass.find(a=>a.id===id)).filter(Boolean),rocks=p.rockIds.map(id=>pool.rocks.find(a=>a.id===id)).filter(Boolean),props=p.propIds.map(id=>pool.props.find(a=>a.id===id)).filter(Boolean);
  const main=p.planting==='custom'?[...flowers,...grass,...rocks,...props]:p.planting==='grass'?grass:p.planting==='rocks'?rocks:p.planting==='props'?props:flowers.length?flowers:p.planting==='mixed'&&p.materialsExplicit?(grass.length?grass:rocks):flowers;if(!main.length)throw Error('이 라인에 심을 요소를 한 종류 이상 선택해 주세요.');
  if(p.shape!=='rectangle'&&p.points.length<(p.shape==='curve'?3:2))throw Error(p.shape==='curve'?'닫힌 곡선은 제어점 3개 이상을 그려 주세요.':'라인은 제어점 2개 이상을 그려 주세요.');
  const line=p.shape==='rectangle'?null:C.sample(p.points,p.shape==='curve',p.smooth).map(v=>({x:v.x*width/100,y:v.y*height/100})),distances=line?C.lengths(line):null;
  const area=line?C.bounds(line):{x:width*p.left/100,y:height*p.top/100,w:width*(p.right-p.left)/100,h:height*(p.bottom-p.top)/100};
  if(line&&(p.shape==='path'?distances.at(-1)<1:C.area(line)<1))throw Error('곡선 영역이나 라인이 너무 작습니다. 제어점을 넓혀 주세요.');
  area.w=Math.max(1,area.w);area.h=Math.max(1,area.h);
  const rand=random(p.seed),size=p.shape==='path'?p.size:Math.min(p.size,area.w*.6),measure=p.shape==='curve'?C.area(line):area.w*area.h,n=clamp(Math.round(p.shape==='path'?distances.at(-1)/p.spacing*p.density/70:measure/(size*size)*p.density/100*1.6),1,600),id=groupId||uid(),name='PCG 꽃밭 · '+p.seed,objects=[],meta={type:'flower-bed',version:2,params:p};
  for(let i=main.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[main[i],main[j]]=[main[j],main[i]]}
  const cols=Math.max(1,Math.ceil(Math.sqrt(n*area.w/area.h))),rows=Math.ceil(n/cols),clusters=Array.from({length:Math.max(2,Math.round(Math.sqrt(n)/2))},(_,i)=>({x:(i+.5)/Math.max(2,Math.round(Math.sqrt(n)/2)),y:.2+rand()*.6}));
  function add(a,x,t,k){
   const factor=(1+(rand()*2-1)*p.variation/100)*(.95+clamp(t,0,1)*.1),w=Math.min(size*factor*(k==='grass'?1.05:k==='rock'?1.25:1),p.shape==='path'?Infinity:area.w*.7),h=w*(Number.isFinite(a.height/a.width)?a.height/a.width:1),r=(rand()*2-1)*p.rotation,angle=r*Math.PI/180,margin=Math.min(area.w/2,w/2+Math.abs(Math.sin(angle))*h);
   const rootX=p.shape==='rectangle'?clamp(area.x+x*area.w,area.x+margin,area.x+area.w-margin):area.x+x*area.w,rootY=area.y+t*area.h;
   objects.push({id:uid(),assetId:a.id,name:a.name,x:rootX+Math.sin(angle)*h/2-w/2,y:rootY-Math.cos(angle)*h/2-h/2,w,h,baseW:w,baseH:h,aspect:w/h,r,flipX:a.artStyleVersion?false:rand()<.5,opacity:1,motion:'stationary',groupId:id,groupName:name,procedural:meta,...(k==='grass'?{foregroundGrassManual101:true}:{}),...(k==='grass'&&t>.7&&p.nearBlur?{blur:p.nearBlur}:{}),pcgRootY:rootY});
  }
  function position(i,total,kind){
   if(p.shape==='path'){const point=C.along(line,distances,(i+.15+rand()*.7)/total*distances.at(-1)),offset=(rand()+rand()-1)*p.spread/2;return{x:(point.x+point.nx*offset-area.x)/area.w,y:(point.y+point.ny*offset-area.y)/area.h}}
   if(p.shape==='curve'){for(let attempt=0;attempt<2000;attempt++){const point={x:area.x+rand()*area.w,y:area.y+rand()*area.h};if(C.inside(point,line))return{x:(point.x-area.x)/area.w,y:(point.y-area.y)/area.h}}throw Error('곡선 영역이 너무 좁거나 교차합니다. 제어점을 정리해 주세요.')}
   if(kind!=='flower'&&kind!=='main')return{x:rand(),y:kind==='rock'?.8+rand()*.2:.15+rand()*.85};
   const c=clusters[i%clusters.length],mix=p.clump/100,x=(i%cols+.15+rand()*.7)/cols,y=(Math.floor(i/cols)+.15+rand()*.7)/rows;return{x:clamp(x*(1-mix)+(c.x+(rand()+rand()-1)*.2)*mix,0,1),y:clamp(y*(1-mix)+(c.y+(rand()+rand()-1)*.3)*mix,0,1)};
  }
  for(let i=0;i<n;i++){const point=position(i,n,'main');const a=main[i%main.length],kind=['grass','leaf'].includes(a.category)?'grass':['basalt','rock'].includes(a.category)?'rock':'flower';add(a,point.x,point.y,kind)}
  if(p.planting==='mixed')for(const [kind,assets,count] of [['rock',rocks,Math.round(n*p.rocks/100)],['grass',grass,Math.round(n*p.grass/100)]])if(assets.length&&assets!==main)for(let i=0;i<count;i++){const point=position(i,count,kind);add(assets[i%assets.length],point.x,point.y,kind)};
  objects.sort((a,b)=>a.pcgRootY-b.pcgRootY);objects.forEach(o=>delete o.pcgRootY);
  return{objects,params:p,plantCount:n,flowerCount:objects.filter(o=>pool.flowers.some(a=>a.id===o.assetId)).length,groupId:id,theme:pool.theme};
 }
 function apply(existing,items,assets,groupId=null,replaceGround=false){
  if(!items.length)return existing;
  const map=new Map(assets.map(a=>[a.id,a])),remove=o=>groupId?o.groupId===groupId:replaceGround&&ground(o,map.get(o.assetId)),first=existing.findIndex(remove),remaining=existing.filter(o=>!remove(o));
  const at=first>=0?existing.slice(0,first).filter(o=>!remove(o)).length:remaining.findIndex(o=>['cloud','butterfly','bird','particle'].includes(map.get(o.assetId)?.category));
  return[...remaining.slice(0,at<0?remaining.length:at),...items,...remaining.slice(at<0?remaining.length:at)];
 }
 const api={normalize,random,theme,pools,ground,selectedGroup,build,apply};if(typeof module==='object')module.exports=api;else root.jejuProceduralGarden=api;
})(typeof window==='object'?window:globalThis);
