(function(root){
 'use strict';
 const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const number=(v,f,min,max)=>finite(v,min,max)?v:f;
 const origin=()=>root.location?.origin||'https://toy80318-sys.github.io';
 function safeSource(src){
  if(typeof src!=='string'||!src||src.length>12*1024*1024||/[\u0000-\u001f\u007f\\]/.test(src))return false;
  if(/^data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/]+={0,2}$/.test(src))return true;
  try{
   const url=new URL(src,origin()+'/');
   if(url.username||url.password)return false;
   if(src.startsWith('blob:'))return url.origin===origin();
   if(/^[a-z][a-z\d+.-]*:/i.test(src))return url.protocol==='https:';
   return !src.startsWith('//')&&url.origin===origin()&&!decodeURIComponent(src.split(/[?#]/)[0]).split('/').some(p=>p==='.'||p==='..');
  }catch{return false}
 }
 function validate(project){
  if(!project||project.format!=='jeju-maze-wall-v1'||!finite(project.width,1,100000)||!finite(project.height,1,100000)||!Array.isArray(project.assets)||project.assets.length>5000||!Array.isArray(project.objects)||project.objects.length>5000)throw Error('에디터의 프로젝트 저장 JSON을 선택해 주세요.');
  const ids=new Set(),objectIds=new Set();
  for(const a of project.assets){
   if(!a||typeof a.id!=='string'||!a.id||a.id.length>256||ids.has(a.id)||!safeSource(a.src)||a.frames!==undefined&&(!Array.isArray(a.frames)||!a.frames.length||a.frames.length>3600||!a.frames.every(safeSource))||a.bud!==undefined&&!safeSource(a.bud)||a.loopVideo!==undefined&&!safeSource(a.loopVideo))throw Error('중복된 요소 번호 또는 안전하지 않은 이미지 경로가 있습니다.');
   if(a.sourceRect!==undefined&&(!Array.isArray(a.sourceRect)||a.sourceRect.length!==4||!a.sourceRect.every(n=>finite(n,0,100000))))throw Error('이미지 잘라내기 좌표가 올바르지 않습니다.');
   ids.add(a.id);
  }
  for(const o of project.objects){
   if(!o||typeof o.id!=='string'||!o.id||o.id.length>256||objectIds.has(o.id)||!ids.has(o.assetId)||!finite(o.x,-100000,100000)||!finite(o.y,-100000,100000)||!finite(o.w,1,100000)||!finite(o.h,1,100000)||['r','opacity','z','rx','ry','blur','flowerHue'].some(k=>o[k]!==undefined&&!finite(o[k],{r:-100000,opacity:0,z:-2000,rx:-60,ry:-60,blur:0,flowerHue:-10}[k],{r:100000,opacity:1,z:2000,rx:60,ry:60,blur:40,flowerHue:10}[k]))||o.flipX!==undefined&&typeof o.flipX!=='boolean')throw Error('배치 좌표 또는 요소 참조가 올바르지 않습니다.');
   objectIds.add(o.id);
  }
  if(project.background!=null&&!safeSource(project.background))throw Error('안전하지 않은 배경 이미지 경로입니다.');
  if(project.backgroundFit!==undefined&&!['fill','cover','contain'].includes(project.backgroundFit))throw Error('배경 맞춤 방식이 올바르지 않습니다.');
  const f=project.sceneFilters;
  if(f!==undefined){
   if(!f||typeof f!=='object'||Array.isArray(f))throw Error('색감 필터 형식이 올바르지 않습니다.');
   for(const scope of ['scene','background','flowers','decor'])if(f[scope]!==undefined){
    if(!f[scope]||typeof f[scope]!=='object'||Array.isArray(f[scope])||['brightness','contrast','saturation','warmth'].some(k=>f[scope][k]!==undefined&&!finite(f[scope][k],k==='warmth'?-100:0,k==='warmth'?100:200)))throw Error('색감 필터 값이 올바르지 않습니다.');
   }
   if(f.backgroundGrade!==undefined){const g=f.backgroundGrade;if(!g||typeof g!=='object'||Array.isArray(g)||['hue','exposure','brightness'].some(k=>g[k]!==undefined&&!finite(g[k],{hue:-180,exposure:-3,brightness:0}[k],{hue:180,exposure:3,brightness:200}[k]))||g.curve!==undefined&&(!Array.isArray(g.curve)||g.curve.length!==5||!g.curve.every(n=>finite(n,0,255))))throw Error('배경 색보정 값이 올바르지 않습니다.');}
   if(f.glow!==undefined){const g=f.glow;if(!g||typeof g!=='object'||Array.isArray(g)||g.strength!==undefined&&!finite(g.strength,0,100)||g.radius!==undefined&&!finite(g.radius,1,40))throw Error('글로우 값이 올바르지 않습니다.');}
   if(f.focus!==undefined){const v=f.focus;if(!v||typeof v!=='object'||Array.isArray(v)||['background','far','near','focus'].some(k=>v[k]!==undefined&&!finite(v[k],k==='focus'?.2:0,k==='focus'?.9:30)))throw Error('초점 블러 값이 올바르지 않습니다.');if(v.region!==undefined){const r=v.region;if(!r||typeof r!=='object'||Array.isArray(r)||!['x','y','w','h','blur'].every(k=>finite(r[k],k==='w'||k==='h'?.01:0,k==='blur'?30:1))||r.x+r.w>1.0000001||r.y+r.h>1.0000001)throw Error('블러 영역 값이 올바르지 않습니다.');}}
  }
  if(project.gardenSpace!==undefined&&(!project.gardenSpace||typeof project.gardenSpace!=='object'||Array.isArray(project.gardenSpace)))throw Error('입체 공간 값이 올바르지 않습니다.');
  if(project.gardenSpace){const s=project.gardenSpace;if(['enabled','spatial','cameraOrbit'].some(k=>s[k]!==undefined&&typeof s[k]!=='boolean')||['strength','horizon','cameraAmount','spread','targetX','targetY'].some(k=>s[k]!=null&&!finite(s[k],{strength:0,horizon:.15,cameraAmount:0,spread:0,targetX:-100000,targetY:-100000}[k],{strength:1,horizon:.85,cameraAmount:5,spread:2000,targetX:100000,targetY:100000}[k])))throw Error('입체 공간 값이 올바르지 않습니다.');}
  return project;
 }
 function toneCSS(t){
  const b=number(t?.brightness,100,0,200),c=number(t?.contrast,100,0,200),s=number(t?.saturation,100,0,200),w=number(t?.warmth,0,-100,100);
  return [b!==100?`brightness(${b}%)`:'',c!==100?`contrast(${c}%)`:'',s!==100?`saturate(${s}%)`:'',w?`sepia(${Math.abs(w)*.25}%) hue-rotate(${w<0?180:0}deg)`:''].filter(Boolean).join(' ');
 }
 function blurAmount(o,a,focus,height,space){
  const manual=number(o.blur,0,0,40),ground=root.jejuSpace?.ground(a)||a.group==='flowers'||['grass','basalt','stone','branch'].includes(a.category);
  if(!ground)return manual;
  const depth=space?.enabled!==false&&space?.spatial?(number(o.z,0,-2000,2000)+2000)/4000:Math.max(0,Math.min(1,((o.y+o.h*(1+Math.cos((o.r||0)*Math.PI/180))/2)/height-.45)/.55)),f=number(focus?.focus,.65,.2,.9);
  const defocus=depth<f?number(focus?.far,0,0,30)*((f-depth)/f)**1.5:number(focus?.near,0,0,30)*((depth-f)/(1-f))**1.5;
  return Math.min(60,manual+defocus);
 }
 async function render(canvas,input,options={}){
  const project=validate(input),width=Math.round(number(options.width,1800,256,4096)),height=Math.max(1,Math.round(width*project.height/project.width));
  if(height>8192||width*height>16000000)throw Error('배치 비율이 미리보기 범위를 초과합니다.');
  const background=options.backgroundOverride===undefined?project.background:options.backgroundOverride;
  if(background!=null&&!safeSource(background))throw Error('안전하지 않은 배경 이미지 경로입니다.');
  const warnings=[],missing=[],errors=[],images=new Map(),assets=new Map(project.assets.map(a=>[a.id,a])),sources=new Map(),scale=width/project.width,objects=project.objects.map(o=>({r:0,opacity:1,...o}));
  const warn=text=>{if(!warnings.includes(text))warnings.push(text)};
  if(project.objects.some(o=>o.rx||o.ry)&&!project.gardenSpace?.spatial)warn('입체 공간이 꺼진 배치의 X/Y 회전은 적용되지 않습니다.');
  if(project.objects.some(o=>assets.get(o.assetId)?.frames?.length>1))warn('애니메이션은 첫 프레임의 정지 이미지로 비교합니다.');
  if(project.objects.some(o=>assets.get(o.assetId)?.sourceRect))warn('이전 잘라낸 소스가 포함되어 있습니다. 독립 완성형 PNG 여부를 확인해 주세요.');
  if(project.objects.some(o=>o.motion&&o.motion!=='stationary')||project.gardenSpace?.cameraOrbit)warn('움직임과 카메라 궤도는 시간 0의 정지 상태로 비교합니다.');
  if(!root.jejuSpace&&project.gardenSpace?.enabled!==false)warn('입체 공간 도우미가 없어 평면 좌표로 합성합니다.');
  if(project.objects.some(o=>o.x<0||o.y<0||o.x+o.w>project.width||o.y+o.h>project.height))warn('벽면 밖으로 나간 요소는 화면 경계에서 잘립니다.');
  let variants=[];
  if(project.objects.some(o=>!assets.get(o.assetId)?.stillOnly&&o.flowerVariant)){
   try{const response=await root.fetch('assets/abstract-scene-v44/bloom-manifest_v44.json');if(!response.ok)throw Error();variants=(await response.json()).variants||[];}
   catch{warn('이전 꽃 색상 목록을 불러오지 못해 저장된 PNG 원본으로 표시합니다.');}
  }
  // shortcut: sequence media uses frame 0, use the exhibition player when animated comparison is required.
  for(const o of project.objects){const a=assets.get(o.assetId),v=!a.stillOnly&&variants.find(v=>v.id===o.flowerVariant);sources.set(o.id,v&&safeSource(v.open)?v.open:a.frames?.[0]||a.src);}
  const requests=new Map();
  async function load(src,id){
   if(!requests.has(src))requests.set(src,new Promise((resolve,reject)=>{
    const im=new root.Image(),timer=setTimeout(()=>{im.src='';reject(Error('이미지 로딩 시간 초과'));},20000);
    im.crossOrigin='anonymous';im.onload=()=>{clearTimeout(timer);im.naturalWidth&&im.naturalHeight?resolve(im):reject(Error('이미지 크기 오류'));};im.onerror=()=>{clearTimeout(timer);reject(Error('PNG를 읽을 수 없습니다.'));};im.src=src;
   }));
   try{images.set(src,await requests.get(src))}catch(error){missing.push({id,src,error:error.message});}
  }
  const jobs=[...new Map(project.objects.map(o=>[sources.get(o.id),o.assetId])).entries()];if(background)jobs.unshift([background,'background']);
  let next=0;
  await Promise.all(Array.from({length:Math.min(6,jobs.length)},async()=>{while(next<jobs.length){const [src,id]=jobs[next++];await load(src,id)}}));
  canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('미리보기 캔버스를 만들 수 없습니다.');
  ctx.clearRect(0,0,width,height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(scale,scale);
  const filters=project.sceneFilters||{},space=project.gardenSpace||{enabled:false},camera=root.jejuSpace?.view(objects,assets,project.width,project.height,space,0);
  const filter=scope=>[toneCSS(filters[scope]),toneCSS(filters.scene),scope==='background'&&root.jejuBackgroundGrade?root.jejuBackgroundGrade.css(filters.backgroundGrade,'jeju-set-review-grade'):''].filter(Boolean).join(' ')||'none';
  if(filters.backgroundGrade&&!root.jejuBackgroundGrade)warn('배경 색보정 도우미가 없어 곡선 보정을 생략했습니다.');
  const bg=images.get(background);
  if(bg){
   const bgBlur=number(filters.focus?.background,0,0,30),zoom=1+6*bgBlur/1080,registered=project.assets.some(a=>a.category==='background'&&a.src===background&&a.imageStyleVersion>=56),fit=project.backgroundFit||(registered?'fill':'cover');
   const ratio=(fit==='contain'?Math.min:Math.max)(project.width/bg.naturalWidth,project.height/bg.naturalHeight)*zoom,w=fit==='fill'?project.width*zoom:bg.naturalWidth*ratio,placement=root.jejuBackgroundGrade?.placement(filters.backgroundGrade)||{scaleY:1,offsetY:0},h=(fit==='fill'?project.height*zoom:bg.naturalHeight*ratio)*placement.scaleY;
   ctx.save();ctx.filter=[filter('background'),bgBlur?`blur(${bgBlur*project.height/1080*scale}px)`:''].filter(v=>v&&v!=='none').join(' ')||'none';ctx.drawImage(bg,(project.width-w)/2,(project.height-h)/2+project.height*placement.offsetY,w,h);ctx.restore();
  }
  const ordered=root.jejuSpace?.ordered(objects,assets,project.height,space,camera)||objects,drawables=ordered.map(o=>({o,a:assets.get(o.assetId),im:images.get(sources.get(o.id))})).filter(v=>v.im);
  for(const {o,a,im} of drawables)root.jejuSpace?.castShadow(ctx,o,a,im,project.height,space,camera);
  let rendered=0;
  for(const {o,a,im} of drawables){
   const scope=a.group==='flowers'?'flowers':'decor',pose=root.jejuSpace?.pose(o,a,project.height,space,camera)||o,lighting=root.jejuSpace?.lighting(o,a,project.height,space,camera).brightness??1;
   if(root.jejuSpace?.ground(a))root.jejuSpace.shadow(ctx,pose);
   const hue=scope==='flowers'&&o.flowerHue?(root.jejuFlowerHue?.css(o.flowerHue)||''):'',blur=blurAmount(o,a,filters.focus,project.height,space);
   if(o.flowerHue&&!root.jejuFlowerHue)warn('꽃잎 색상 보정 도우미가 없어 저장된 PNG 색상으로 표시합니다.');
   const base=['particle','butterfly'].includes(a.category)?toneCSS(filters.scene):filter(scope);
   ctx.save();ctx.filter=[base==='none'?'':base,hue,lighting===1?'':`brightness(${lighting})`,blur?`blur(${blur*project.height/1080*scale}px)`:''].filter(Boolean).join(' ')||'none';ctx.globalAlpha=o.opacity;ctx.translate(pose.x+pose.w/2,pose.y+pose.h/2);
   if(root.jejuSpace)root.jejuSpace.orient(ctx,pose);else ctx.rotate(o.r*Math.PI/180);if(o.flipX)ctx.scale(-1,1);
   const ratio=Math.min(pose.w/im.naturalWidth,pose.h/im.naturalHeight),w=a.sourceRect?pose.w:im.naturalWidth*ratio,h=a.sourceRect?pose.h:im.naturalHeight*ratio;
   ctx.drawImage(im,-w/2,scope==='flowers'?pose.h/2-h:-h/2,w,h);ctx.restore();rendered++;
  }
  root.jejuGlow?.draw(ctx,canvas,filters.glow);
  root.jejuFocus?.drawRegion(ctx,canvas,filters.focus);
  for(const item of missing)errors.push(item.id+' · '+item.error);
  return{mode:'web-composite-not-unity-runtime',width,height,sourceWidth:project.width,sourceHeight:project.height,totalObjects:project.objects.length,objectCount:project.objects.length,renderedObjects:rendered,renderedCount:rendered,missing,missingAssets:missing,errors,warnings,complete:missing.length===0&&rendered===project.objects.length};
 }
 const api={safeSource,validate,render};if(typeof module==='object'&&module.exports)module.exports=api;else root.JejuSetRenderer=api;
})(typeof window==='object'?window:globalThis);
