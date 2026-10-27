(()=>{
  'use strict';
  const $=id=>document.getElementById(id),art=window.jejuPlayerArt,canvas=$('scene'),ctx=canvas.getContext('2d');
  const SPECIES=['hydrangea','lavender','rapeseed','buckwheat','marigold','camellia'];
  const BACKGROUNDS=window.jejuFinalCatalog?.backgrounds?.length?window.jejuFinalCatalog.backgrounds.map(a=>a.src):['hallasan','jeju-forest','mountain-forest','sunset','starry-night','hallasan-morning','hallasan-noon','hallasan-evening','hallasan-night'].map(id=>`/assets/background-loops/${id}-oil-20261014.mp4?v=calm180-leftdrift-20261020`);
  const DEFAULTS={hydrangea:'skyblue',lavender:'red',rapeseed:'yellow',buckwheat:'cream',marigold:'orange',camellia:'red'};
  const LEGACY={
    hydrangea:{pink:'lightpurple',burgundy:'purple',red:'purple',orange:'purple',yellow:'skyblue',gold:'skyblue'},
    lavender:{pink:'purple',burgundy:'purple',yellow:'orange',gold:'orange',skyblue:'blue',lightpurple:'purple'},
    rapeseed:{pink:'amber',burgundy:'orange',red:'orange',purple:'orange',blue:'gold',skyblue:'yellow',lightpurple:'amber'},
    buckwheat:{pink:'lightpurple',burgundy:'gold',red:'gold',orange:'gold',purple:'lightpurple',blue:'lightpurple',skyblue:'lightpurple',creamyellow:'cream'},
    marigold:{pink:'red',burgundy:'red',yellow:'orange',gold:'orange',skyblue:'blue',lightpurple:'purple'},
    camellia:{pink:'red',burgundy:'red',yellow:'orange',gold:'orange',skyblue:'blue',lightpurple:'purple'}
  };
  const ownOrigin=new URL(document.baseURI||location.href||location.origin).origin;
  const embedded=new URLSearchParams(location.search).get('embedded')==='1'||document.body.dataset?.jejuEmbedded==='true',reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const assets=new Map(),buttons=new Map(),active=new Map(),stills=new Map(),frameCache=new Map(),framePending=new Map(),frameFailures=new Set(),sequenceCache=new Map(),plantAnchors=new Map(),touches=new Map(),particleSprites=new Map();
  const atmosphere={richness:100,focus:65,wind:50};let ambientParticles=[],cloudCount=0,cloudOffset=0;
  let project=null,bloomManifest=null,manifestTask,actorManifestTask,actors=[],petals=[],frameQueue=[],decoding=0;
  let cameraView,paintCount=0,swayCount=0,lastEmptyTouch=-Infinity;
  let enabled=!embedded,raf=0,last=0,lastPaint=0,clock=0,generation=0,loading=false,bg=null,bgNext=null,bgTask=null,bgIndex=-1,bgChangeAt=180,bgFadeAt=null;
  const status=text=>$('status').textContent=text;
  const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  const running=()=>enabled&&!document.hidden;
  const message=(type,extra={})=>{if(window.parent!==window)window.parent.postMessage({type,...extra},ownOrigin)};
  function safeRoot(s){
    if(typeof s!=='string'||!/^\/?assets\/[A-Za-z0-9_./-]+(?:\?[A-Za-z0-9_.=&-]+)?$/.test(s))return false;
    return !s.split('?')[0].split('/').some(part=>part==='.'||part==='..');
  }
  function safeSource(s){
    if(safeRoot(s))return true;
    if(typeof s!=='string')return false;
    if(/^data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/.test(s))return true;
    try{const url=new URL(s);return !url.username&&!url.password&&(url.protocol==='https:'||url.protocol==='blob:'&&url.origin===ownOrigin)}catch{return false}
  }
  function validate(data){
    if(data?.format==='jeju-group-styles-v1'){
      if(!Array.isArray(data.styles)||data.styles.length>5000||!Array.isArray(data.assets))throw Error('군집 파일 형식이 맞지 않습니다.');
      const presets=data.styles.flatMap(s=>Array.isArray(s.presets)?s.presets:[]);if(!presets.length||presets.length>5000)throw Error('저장한 군집이 없거나 너무 많습니다.');
      let count=0;const objects=[];
      for(const [i,p] of presets.entries()){
        if(!finite(p.width,1,100000)||!finite(p.height,1,100000)||!Array.isArray(p.objects)||(count+=p.objects.length)>5000)throw Error('군집 크기 또는 개수 형식 오류');
        for(const [j,o] of p.objects.entries())objects.push({...o,id:`group-${i}-${j}`,x:o.x+(14165-p.width)/2,y:o.y+(3480-p.height)/2});
      }
      data={format:'jeju-maze-wall-v1',name:'저장한 군집',width:14165,height:3480,assets:data.assets,objects,background:null,sceneFilters:data.sceneFilters};
    }
    if(data?.format!=='jeju-maze-wall-v1'||!finite(data.width,1,100000)||!finite(data.height,1,100000)||!Array.isArray(data.assets)||data.assets.length>5000||!Array.isArray(data.objects)||data.objects.length>5000)throw Error('에디터에서 저장한 프로젝트 또는 군집 JSON을 선택하세요.');
    data=window.jejuAmbient.cleanProject(data);
    const ids=new Set();for(const a of data.assets){
      if(typeof a.id!=='string'||!a.id||a.id.length>256||ids.has(a.id)||!safeSource(a.src)||['bud','open','openImage'].some(k=>a[k]!==undefined&&!safeSource(a[k]))||a.loopVideo&&(!safeSource(a.loopVideo)||!/\.webm(?:\?|$)/i.test(a.loopVideo))||a.frames&&(!Array.isArray(a.frames)||!a.frames.length||a.frames.length>(a.frames.every(safeRoot)?3600:600)||!a.frames.every(safeSource)||!finite(a.fps,1,60)))throw Error('이미지 또는 영상 프레임 형식 오류');ids.add(a.id);
    }
    const objectIds=new Set();for(const o of data.objects){
      if(typeof o.id!=='string'||!o.id||o.id.length>256||objectIds.has(o.id)||!ids.has(o.assetId)||!finite(o.x,-100000,100000)||!finite(o.y,-100000,100000)||!finite(o.w,1,100000)||!finite(o.h,1,100000)||!finite(o.r,-100000,100000)||!finite(o.opacity,0,1)||['z','rx','ry'].some(k=>o[k]!==undefined&&!finite(o[k],k==='z'?-2000:-60,k==='z'?2000:60)))throw Error('배치 좌표 또는 이미지 참조 오류');objectIds.add(o.id);
    }
    if(data.background&&!safeSource(data.background))throw Error('배경 형식 오류');
    return window.jejuAmbient.cleanProject(JSON.parse(JSON.stringify(data)));
  }
  function flowerSpecies(a){if(a?.stillOnly)return;return a&&SPECIES.find(s=>a.species===s||typeof a.bloomVariant==='string'&&a.bloomVariant.startsWith(`${s}-`)||a.id===`loop-${s}`||a.id.startsWith(`flower-${s}-`)||a.frames?.[0]?.includes(`/animations/${s}/`)||a.src?.includes(`/flower-blooms/${s}-`)||a.src?.includes(`/flowers/flower-${s}-`)||a.src?.includes(`/flowers/recolor_${s}-`))}
  const touchFlower=a=>a?.group==='flowers'||a?.category==='flower'||!!flowerSpecies(a);
  const plant=a=>touchFlower(a)||a?.category==='grass';
  function seedOf(id){let seed=0;for(const c of String(id))seed=(seed*31+c.charCodeAt(0))>>>0;return seed}
  const breeze=(time,x=0)=>Math.sin(time*.23-x/(project?.width||1)*3)+.35*Math.sin(time*.47-x/(project?.width||1));
  function buildAtmosphere(){
    particleSprites.clear();ambientParticles=[];if(!project)return;
    const emitters=project.objects.filter(o=>{const a=assets.get(o.assetId);return plant(a)||['basalt','stone','tree','branch'].includes(a?.category)}).sort((a,b)=>a.id.localeCompare(b.id));
    const count=Math.min(144,Math.round(96*atmosphere.richness/100));
    for(let i=0;i<count;i++){
      let seed=seedOf(`${project.background}:${i}`);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296},o=emitters[Math.floor(random()*emitters.length)],a=o&&assets.get(o.assetId),layer=i%12===11?2:i%4===0?0:1;
      const pose=o&&(window.jejuSpace?.pose(o,a,project.height,project.gardenSpace,cameraView)||o),x=pose?pose.x+pose.w*(.15+.7*random()):project.width*random(),y=pose?pose.y+pose.h*(touchFlower(a)?.15:.4):project.height*(.48+.45*random());
      ambientParticles.push({x,y,layer,phase:random()*Math.PI*2,speed:.12+random()*.12,rangeX:project.height*(.015+.04*random()),rangeY:project.height*(.012+.035*random()),size:project.height*([.0035,.008,.045][layer])*(.65+.7*random()),color:Math.floor(random()*3),petal:i%3===0,theme:a?.theme});
    }
  }
  function particlePalette(theme){const palettes={sunset:['#f8c3a6','#ffe8bb','#f5b9bc'],day:['#fff1c3','#f7dda1','#e8f2c9'],night:['#d1ceff','#b7d9f3','#f0ddff'],morning:['#e8e5ff','#d3ecf1','#ffe8d5']};return typeof theme==='string'&&Object.hasOwn(palettes,theme)?palettes[theme]:palettes.sunset}
  function particleSprite(p){
    const requested=p.theme||({BG01:'sunset',BG02:'day',BG03:'night',BG04:'morning'}[(project.background||'').match(/BG0[1-4]/)?.[0]]),theme=typeof requested==='string'&&['sunset','day','night','morning'].includes(requested)?requested:'sunset',key=`${theme}:${p.layer}:${p.color}:${p.petal}:${atmosphere.focus}`;if(particleSprites.has(key))return particleSprites.get(key);
    const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');if(!g?.createRadialGradient)return null;
    const color=particlePalette(theme)[p.color],blur=([1.4,0,7][p.layer])*atmosphere.focus/100;g.filter=blur?`blur(${blur}px)`:'none';g.translate(48,48);
    if(p.petal&&g.bezierCurveTo){g.fillStyle=color;g.beginPath();g.moveTo(0,-21);g.bezierCurveTo(25,-5,19,22,0,24);g.bezierCurveTo(-20,15,-21,-6,0,-21);g.fill()}
    else{const glow=g.createRadialGradient(0,0,0,0,0,30);glow.addColorStop(0,'#fff9e9');glow.addColorStop(.2,color);glow.addColorStop(1,'#fff9e900');g.fillStyle=glow;g.fillRect(-32,-32,64,64)}
    particleSprites.set(key,c);return c;
  }
  function ambientPose(p){const time=reduced.matches?0:clock*atmosphere.wind/50;return{x:p.x+Math.sin(time*p.speed+p.phase)*p.rangeX+(breeze(time,p.x)-breeze(0,p.x))*project.height*.008,y:p.y+Math.sin(time*p.speed*.73+p.phase+1)*p.rangeY,time}}
  function drawAtmosphere(layer){
    if(reduced.matches)return;ctx.save();ctx.filter=toneCSS(project?.sceneFilters?.scene)||'none';
    for(const p of ambientParticles){if(p.layer!==layer)continue;const sprite=particleSprite(p);if(!sprite)continue;const pose=ambientPose(p);ctx.save();ctx.globalAlpha=[.28,.57,.3][layer]*(.65+.35*Math.sin(pose.time*.35+p.phase)**2);ctx.translate(pose.x,pose.y);ctx.rotate(p.phase+Math.sin(pose.time*.3+p.phase)*.5);ctx.drawImage(sprite,-p.size,-p.size,p.size*2,p.size*2);ctx.restore()}ctx.restore();
  }
  function particlePose(o,a){if(a?.category!=='particle'||reduced.matches||!atmosphere.wind)return o;const phase=seedOf(o.id)%628/100,time=clock*atmosphere.wind/50;return{...o,x:o.x+(Math.sin(time*.21+phase)-Math.sin(phase))*project.height*.018,y:o.y+(Math.sin(time*.16+phase+1)-Math.sin(phase+1))*project.height*.012,r:o.r+Math.sin(time*.17+phase)*3}}
  function preparePlant(a,im,anchors=plantAnchors){
    if(!plant(a)||anchors.has(a.id))return;
    let point=a.groundAnchor,b=a.alphaBounds||a.visibleBounds||a.verification?.visibleBounds;
    if(!point&&b?.length===4&&finite(a.width,1,100000)&&finite(a.height,1,100000))point={x:(b[0]+b[2])/2/a.width,y:b[3]/a.height};
    if(!point)try{
      const c=document.createElement('canvas'),w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;
      c.width=Math.min(320,w);c.height=Math.max(1,Math.round(h*c.width/w));const p=c.getContext('2d');p.drawImage(im,0,0,c.width,c.height);const bytes=p.getImageData(0,0,c.width,c.height).data;
      let l=c.width,r=-1,bottom=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(bytes[(y*c.width+x)*4+3]>=8){l=Math.min(l,x);r=Math.max(r,x);bottom=y+1}
      if(r>=l)point={x:(l+r+1)/2/c.width,y:bottom/c.height};
    }catch{}
    anchors.set(a.id,point&&finite(point.x,0,1)&&finite(point.y,0,1)?point:{x:.5,y:1});
  }
  function plantMotion(o,a){
    if(!plant(a)||reduced.matches)return{angle:0,scale:1};
    const seed=seedOf(o.id);
    const phase=seed%628/100,t=clock-(active.get(o.id)?.touchedAt??-10),scale=t>=0&&t<.45?1+.065*Math.sin(Math.PI*t/.45):1;
    return{angle:atmosphere.wind/50*(a.category==='grass'?1.8:1.05)*(.55*breeze(clock,o.x)+.5*Math.sin(clock*.79+phase)+.12*Math.sin(clock*1.61+phase*.7)),scale};
  }
  function plantGeometry(o,a,im){
    const iw=im.videoWidth||im.naturalWidth||im.width,ih=im.videoHeight||im.naturalHeight||im.height,ratio=Math.min(o.w/iw,o.h/ih),w=a.sourceRect?.length===4?o.w:iw*ratio,h=a.sourceRect?.length===4?o.h:ih*ratio,top=touchFlower(a)?o.h/2-h:-h/2,p=plantAnchors.get(a.id)||{x:.5,y:1};
    return{w,h,top,x:(p.x-.5)*w,y:top+p.y*h};
  }
  function syncHit(o,a,im,rank){
    const button=buttons.get(o.id);if(!button)return;
    const pose=window.jejuSpace?.pose(o,a,project.height,project.gardenSpace,cameraView)||o,g=plantGeometry(pose,a,im),motion=plantMotion(o,a),base=window.jejuSpace?.transform(pose)||`rotate(${pose.r}deg)`,x=g.x/pose.w*100,y=g.y/pose.h*100;
    Object.assign(button.style,{left:pose.x/project.width*100+'%',top:pose.y/project.height*100+'%',width:pose.w/project.width*100+'%',height:pose.h/project.height*100+'%',transform:`${base} scaleX(${o.flipX?-1:1}) translate(${x}%,${y}%) rotate(${motion.angle}deg) scale(${motion.scale}) translate(${-x}%,${-y}%)`,zIndex:rank});
    button.dataset.sway=String(motion.angle);
  }
  function touchPoint(event){
    if(!finite(event?.clientX,-1000000,1000000)||!finite(event?.clientY,-1000000,1000000))return null;
    const rect=$('stage').getBoundingClientRect();if(!rect.width||!rect.height)return null;
    const x=(event.clientX-(rect.left||0))/rect.width,y=(event.clientY-(rect.top||0))/rect.height;if(x<0||x>1||y<0||y>1)return null;
    return{x:x*project.width,y:y*project.height};
  }
  function validateManifest(data){
    if(data?.mode==='PNG_STATE_PAIR')return window.jejuPngPairs.validate(data);

    if(!data||data.fps!==30||![[480,640],[384,512],[336,448]].some(([w,h])=>data.width===w&&data.height===h)||data.frameCount!==240||data.duration!==8||!Array.isArray(data.variants)||data.variants.length>48)throw Error('색상별 개화 영상 목록 형식 오류');
    const ids=new Set();for(const v of data.variants){
      if(!SPECIES.includes(v.species)||typeof v.tone!=='string'||!/^[-a-z0-9]+$/.test(v.tone)||v.id!==`${v.species}-${v.tone}`||ids.has(v.id)||typeof v.ready!=='boolean'||!['GPT_PAIR_TO_SEEDANCE','USER_PROVIDED_RGBA_SEQUENCE'].includes(v.route))throw Error('개화 영상의 이미지 제작 경로 또는 색상 정보 오류');ids.add(v.id);
      const framePath=new RegExp(`^/assets/flower-blooms/${v.id}/frame_(?:00\\d{2}|01\\d{2}|02[0-3]\\d)\\.webp$`);
      if(v.ready&&(v.fps!==30||v.width!==data.width||v.height!==data.height||v.frameCount!==240||v.duration!==8||v.transparent!==true||!/^#[\da-f]{6}$/i.test(v.petalColor)||!Array.isArray(v.frames)||v.frames.length!==240||v.bud!==v.frames[0]||v.open!==v.frames[239]||!v.frames.every(src=>safeRoot(src)&&framePath.test(src.split('?')[0]))))throw Error('색상별 30FPS 개화 프레임 형식 오류');
      if(!v.ready&&(!Array.isArray(v.frames)||v.frames.length))throw Error('미완료 개화 영상 정보 오류');
    }
    for(const s of SPECIES)if(!ids.has(`${s}-${data.defaultVariants?.[s]||DEFAULTS[s]}`))throw Error('기본 꽃 색상 정보 오류');
    return data;
  }
  async function getManifest(){
    if(!manifestTask)manifestTask=fetch('assets/abstract-scene-v44/bloom-manifest_v44.json?v=44').then(r=>{if(!r.ok)throw Error('색상별 개화 영상 목록을 읽지 못했습니다.');return r.json()}).then(data=>bloomManifest=validateManifest(data)).catch(e=>{manifestTask=null;throw e});
    return manifestTask;
  }
  function normalizeVariant(type,requested,asset={}){
    const list=bloomManifest?.variants||[],defaultTone=bloomManifest?.defaultVariants?.[type]||DEFAULTS[type];
    let tone=typeof requested==='string'?requested.replace(new RegExp(`^${type}-`),'').toLowerCase():'';
    if(!tone||['source','original','default'].includes(tone))tone=asset.src?.includes('recolor_')?({buckwheat:'gold',rapeseed:'gold',marigold:'purple'}[type]||defaultTone):defaultTone;
    if(!list.some(v=>v.species===type&&v.tone===tone))tone=window.jejuFinalCatalog?.flowerAliases?.[type]?.[tone]||LEGACY[type]?.[tone]||defaultTone;if(!list.some(v=>v.species===type&&v.tone===tone))tone=defaultTone;
    return list.find(v=>v.species===type&&v.tone===tone)||null;
  }
  function bloomPhase(elapsed,seq,from=0){
    if(seq.route==='PNG_STATE_PAIR')return {frame:elapsed<30?1:0,done:elapsed>=30,closing:elapsed>=30};

    const end=(seq.frameCount||seq.frames.length)-1,fps=seq.fps||30,closing=elapsed>=30;
    return {frame:Math.max(0,Math.min(end,closing?end-Math.floor((elapsed-30)*fps):from+Math.floor(Math.max(0,elapsed)*fps))),done:elapsed>=30+(end+1)/fps,closing};
  }
  function backgroundPhase(elapsed){const cycle=Math.floor(Math.max(0,elapsed)/180);return {cycle,blend:Math.min(1,Math.max(0,(elapsed-cycle*180)/2))}}
  async function image(src){
    if(!stills.has(src))stills.set(src,new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>{stills.delete(src);reject(Error('이미지를 읽지 못했습니다. 다시 눌러 주세요.'))};im.src=src}));
    return stills.get(src);
  }
  function rememberSequence(v){sequenceCache.delete(v.id);sequenceCache.set(v.id,v);while(sequenceCache.size>4)sequenceCache.delete(sequenceCache.keys().next().value)}
  function cachedFrame(key){const value=frameCache.get(key);if(value){frameCache.delete(key);frameCache.set(key,value)}return value}
  function cacheFrame(key,value){
    frameCache.set(key,value);
    while(frameCache.size>96){const visible=new Set([...active.values()].map(anim=>anim.display).concat(actors.map(actor=>actor.display))),oldest=[...frameCache.keys()].find(k=>k!==key&&!visible.has(k))??frameCache.keys().next().value;frameCache.get(oldest)?.close?.();frameCache.delete(oldest)}
  }
  async function decodeFrame(src,small){
    if(typeof createImageBitmap==='function'){
      const response=await fetch(src);if(!response.ok)throw Error('개화 프레임을 읽지 못했습니다. 다시 터치해 주세요.');
      const blob=await response.blob();return small?createImageBitmap(blob,{resizeWidth:320,resizeQuality:'high'}):createImageBitmap(blob);
    }
    const im=await image(src);if(!small)return im;
    const cv=document.createElement('canvas');cv.width=320;cv.height=Math.max(1,Math.round(320*im.naturalHeight/im.naturalWidth));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);stills.delete(src);return cv;
  }
  function pumpFrames(){
    while(running()&&decoding<4&&frameQueue.length){
      const item=frameQueue.shift();decoding++;
      decodeFrame(item.src,item.small).then(value=>{cacheFrame(item.key,value);item.resolve(value)},error=>{frameFailures.add(item.key);item.reject(error)}).finally(()=>{decoding--;framePending.delete(item.key);pumpFrames();wake()});
    }
  }
  function requestFrame(src,small=false,urgent=false){
    const key=(small?'small:':'')+src,cached=cachedFrame(key);if(cached)return Promise.resolve(cached);
    if(framePending.has(key))return framePending.get(key);
    if(frameFailures.has(key))return Promise.reject(Error('프레임을 준비하지 못했습니다. 다시 터치해 주세요.'));
    if(frameQueue.length>=96)return Promise.resolve(null);
    const task=new Promise((resolve,reject)=>{const item={key,src,small,resolve,reject};urgent?frameQueue.unshift(item):frameQueue.push(item)});
    framePending.set(key,task);pumpFrames();return task;
  }
  function clearFrameQueue(){for(const item of frameQueue){framePending.delete(item.key);item.reject(Error('배치가 변경되어 프레임 준비를 취소했습니다.'))}frameQueue=[]}
  function prefetch(v,frame,closing){
    const variants=new Set([...active.values()].map(anim=>anim.variant?.id).filter(Boolean));
    const ahead=Math.max(2,Math.min(12,Math.floor(64/Math.max(1,variants.size+actors.length/2))));
    for(let n=0;n<ahead;n++){const i=frame+(closing?-n:n);if(i>=0&&i<v.frames.length)requestFrame(v.frames[i]).catch(()=>{})}
  }
  function toneCSS(t={}){const v=(key,def,min,max)=>finite(t?.[key],min,max)?t[key]:def,b=v('brightness',100,0,200),c=v('contrast',100,0,200),s=v('saturation',100,0,200),w=v('warmth',0,-100,100);return [b!==100?`brightness(${b}%)`:'',c!==100?`contrast(${c}%)`:'',s!==100?`saturate(${s}%)`:'',w?`sepia(${Math.abs(w)*.25}%) hue-rotate(${w<0?180:0}deg)`:''].filter(Boolean).join(' ')}
  function filter(scope){return [toneCSS(project?.sceneFilters?.[scope]),toneCSS(project?.sceneFilters?.scene),scope==='background'?window.jejuBackgroundGrade?.css(project?.sceneFilters?.backgroundGrade,'jeju-player-background-grade'):'',scope==='background'?window.jejuFocus?.css(window.jejuFocus.normalize(project?.sceneFilters?.focus).background,project.height,Math.abs(ctx.getTransform().a)):''].filter(Boolean).join(' ')||'none'}
  function scatter(o,v={},point=null){
    o=window.jejuSpace?.pose(o,assets.get(o.assetId),project.height,project.gardenSpace,cameraView)||o;
    const a=assets.get(o.assetId),theme=a?.theme||({BG01:'sunset',BG02:'day',BG03:'night',BG04:'morning'}[(project.background||'').match(/BG0[1-4]/)?.[0]]),palettes={sunset:['#f7ad99','#f4c2ab','#fff1d1'],day:['#f6dc88','#fff0bc','#ffdfa3'],night:['#b4b9ef','#d0b9e8','#ede5ff'],morning:['#a9ceeb','#cbc4ed','#edf2ff']},colors=typeof theme==='string'&&Object.hasOwn(palettes,theme)?palettes[theme]:palettes.sunset;
    const texture=v.petalTexture&&stills.get('petal:'+v.id),angle=o.r*Math.PI/180,m=o.plane||[Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle)],count=reduced.matches?5:v.id?24:36;
    const explicit=a?.petalColor||v.petalColor;
    for(let i=0;i<count;i++){const dx=(Math.random()-.5)*o.w*.25,dy=-o.h*.29+Math.random()*o.h*.08,rad=i/count*Math.PI*2;petals.push({x:point?.x??o.x+o.w/2+dx*m[0]+dy*m[2],y:point?.y??o.y+o.h/2+dx*m[1]+dy*m[3],vx:-o.w*(reduced.matches?.08:.16)*(1+Math.random()),vy:-(.08+Math.random()*.22)*o.h,kickX:reduced.matches?0:Math.cos(rad)*o.w*.32,kickY:reduced.matches?0:Math.sin(rad)*o.h*.24,size:!reduced.matches&&!v.id&&i%6===0?Math.max(o.w*.1,project.width*(.003+.002*Math.random())):6*o.w*(.012+Math.random()*.014),spin:(Math.random()-.5)*5,rotation:Math.random()*6,color:/^#[\da-f]{6}$/i.test(explicit)?explicit:colors[i%colors.length],texture:texture instanceof Promise?null:texture,start:clock,life:10,turbulence:.35+Math.random()*.3,frequency:.8+Math.random()*.6,phase:Math.random()*Math.PI*2,opacity:o.opacity,depth:i%6===0?2:i%5===0?0:1})}
    if(petals.length>480)petals.splice(0,petals.length-480);
  }
  function bloom(o,event,source='click'){
    if(!running()||loading||source==='hover'&&active.has(o.id)||clock-(touches.get(o.id)??-Infinity)<.45)return;
    const a=assets.get(o.assetId),v=a?.variants?.get(o.id),button=buttons.get(o.id);if(!button||button.disabled)return;
    const point=source==='click'&&event?.detail===0?null:touchPoint(event);
    if(!flowerSpecies(a)){
      touches.set(o.id,clock);active.set(o.id,{kind:a.budStill?'pair':'reaction',touchedAt:clock});scatter(o,{},point);button.dataset.state=a.budStill?'open':'reacting';button.setAttribute('aria-pressed','true');
      status(a.budStill?'준비된 같은 꽃의 만개 PNG · 30초 후 봉오리 PNG로 돌아갑니다.':'꽃잎이 흩날립니다. 꽃은 30초 후 다시 반응할 준비를 합니다. 개화 애니메이션은 준비 중입니다.');paint();wake();return;
    }
    if(!v?.ready){status(`${o.name||a?.name||'이 꽃'} · 이 색상의 개화 영상이 아직 준비되지 않았습니다.`);return}
    for(const key of [...frameFailures])if(key.includes(`/flower-blooms/${v.id}/`))frameFailures.delete(key);
    touches.set(o.id,clock);active.set(o.id,{variant:v,touchedAt:clock,from:0,display:null,error:false});rememberSequence(v);scatter(o,v,point);
    button.dataset.state='opening';button.setAttribute('aria-pressed','true');status(v.route==='PNG_STATE_PAIR'?`${v.name||o.name||a.name} · 만개 PNG 상태 · 30초 후 봉오리 상태 복귀 · 개화 영상 미포함`:`${v.name||o.name||a.name} · 꽃이 피어납니다. 30초 뒤 천천히 봉오리로 닫힙니다.`);
    prefetch(v,0,false);paint();wake();
  }
  function drawObject(o,im,scope='decor',opacity=1,neutral=false,cast=true){
    if(!im)return;const iw=im.videoWidth||im.naturalWidth||im.width,ih=im.videoHeight||im.naturalHeight||im.height;if(!iw||!ih)return;
    const a=assets.get(o.assetId);o=particlePose(o,a);const lighting=window.jejuSpace?.lighting(o,a,project.height,project.gardenSpace,cameraView).brightness??1;if(cast)window.jejuSpace?.castShadow(ctx,o,a,im,project.height,project.gardenSpace,cameraView);o=window.jejuSpace?.pose(o,a,project.height,project.gardenSpace,cameraView)||o;if(window.jejuSpace?.ground(a))window.jejuSpace.shadow(ctx,o);
    const baseTone=['particle','butterfly'].includes(a?.category)?toneCSS(project?.sceneFilters?.scene):filter(scope),tone=[baseTone==='none'?'':baseTone,scope==='flowers'?window.jejuFlowerHue?.css(o.flowerHue):'',lighting===1?'':`brightness(${lighting})`,window.jejuFocus?.css(window.jejuFocus.amount(o,a,project?.sceneFilters?.focus,project.height,project.gardenSpace),project.height,Math.abs(ctx.getTransform().a))].filter(Boolean).join(' ')||'none';ctx.save();ctx.filter=neutral?(tone==='none'?'grayscale(1)':tone+' grayscale(1)'):tone;ctx.globalAlpha=o.opacity*opacity;ctx.translate(o.x+o.w/2,o.y+o.h/2);if(window.jejuSpace)window.jejuSpace.orient(ctx,o);else ctx.rotate(o.r*Math.PI/180);if(o.flipX)ctx.scale(-1,1);
    const g=plantGeometry(o,a,im),motion=plantMotion(o,a);if(plant(a)){swayCount++;ctx.translate(g.x,g.y);ctx.rotate(motion.angle*Math.PI/180);ctx.scale(motion.scale,motion.scale);ctx.translate(-g.x,-g.y)}ctx.drawImage(im,-g.w/2,g.top,g.w,g.h);ctx.restore();
  }
  const actorKind=a=>{const source=[a.id,a.src,a.frames?.[0]].join(' ');return (['cloud','mist'].includes(a.category)?a.category:null)||window.jejuAmbient.atmosphereKind(a)||(/butterfly/.test(source)?'butterfly':/bird/.test(source)?'bird':a.frames&&!a.flowerAnimation&&!flowerSpecies(a)?'loop':null)};
  function actorPose(o,kind,time,index=0){
    if(kind==='cloud'||kind==='mist'){cloudCount++;if(reduced.matches||!atmosphere.wind)return o;const phase=seedOf(o.id)%628/100,t=time*atmosphere.wind/50,speed=kind==='cloud'?.018:.011,dx=(Math.sin(t*speed+phase)-Math.sin(phase))*project.width*.025;cloudOffset+=dx;return{...o,x:o.x+dx,y:o.y+(Math.sin(t*speed*.7+phase)-Math.sin(phase))*project.height*.008}}
    if(reduced.matches||!kind||kind==='loop'||o.motion==='stationary')return o;
    const period=kind==='bird'?105:170,span=project.width+o.w*2+40,speed=span/period,offset=o.motion==='left'?-1:o.motion==='right'?1:o.flipX?-1:1;
    const x=((o.x+o.w+20+time*speed*offset)%span+span)%span-o.w-20;
    return {...o,x,y:o.y+Math.sin(time/8+index*2)*project.height*.018};
  }
  function drawActor(actor,index,paintNow=true){
    const o=actorPose(actor.object,actor.kind,clock,index),frames=actor.frames,frame=reduced.matches?0:Math.floor(clock*actor.fps)%frames.length;
    const src=frames[frame],hit=cachedFrame('small:'+src);if(hit)actor.display='small:'+src;const im=actor.video||hit||cachedFrame(actor.display)||actor.first;if(paintNow)drawObject(o,im,'decor',1,(actor.kind==='cloud'||actor.kind==='mist')&&!assets.get(actor.object.assetId)?.sourceDriveId&&!assets.get(actor.object.assetId)?.lightingBaked);
    if(!actor.video&&!reduced.matches&&frames.length>1)for(let i=0;i<Math.min(12,frames.length,Math.max(2,Math.floor(64/Math.max(1,actors.length))));i++)requestFrame(frames[(frame+i)%frames.length],true).catch(()=>{});
    return {o,im,scope:'decor'};
  }
  function drawBackground(im,alpha=1){
    const iw=im?.videoWidth||im?.naturalWidth,ih=im?.videoHeight||im?.naturalHeight;if(!iw||!ih)return;
    const zoom=window.jejuFocus?.backgroundScale(project.sceneFilters?.focus)||1,r=Math.max(project.width/iw,project.height/ih)*zoom,w=project.backgroundFit==='fill'?project.width*zoom:iw*r,h=project.backgroundFit==='fill'?project.height*zoom:ih*r;ctx.save();ctx.globalAlpha=alpha;ctx.filter=filter('background');ctx.drawImage(im,(project.width-w)/2,(project.height-h)/2,w,h);ctx.restore();
  }
  function paint(){
    if(!project)return;swayCount=0;cloudCount=0;cloudOffset=0;paintCount++;cameraView=window.jejuSpace?.view(project.objects,assets,project.width,project.height,{...project.gardenSpace,cameraOrbit:!reduced.matches&&project.gardenSpace?.cameraOrbit},clock);ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.scale(canvas.width/project.width,canvas.height/project.height);ctx.fillStyle='#1c3029';ctx.fillRect(0,0,project.width,project.height);
    drawBackground(bg);if(bgNext&&bgFadeAt!==null)drawBackground(bgNext,Math.min(1,(clock-bgFadeAt)/2));
    for(const [i,actor] of actors.entries())if(actor.kind==='cloud'||actor.kind==='mist')drawActor(actor,i);
    drawAtmosphere(0);const drawables=[];let depthRank=0;for(const o of window.jejuSpace?.ordered(project.objects,assets,project.height,project.gardenSpace,cameraView)||project.objects){
      depthRank++;const a=assets.get(o.assetId),type=flowerSpecies(a);if(actorKind(a)){if(a.category==='grass'){const actor=actors.find(x=>x.object.id===o.id);if(actor)drawables.push(drawActor(actor,0,false))}continue;}
      if(!type){let im=a.budStill||a.still;const reaction=active.get(o.id),button=buttons.get(o.id);if(reaction){if(clock-reaction.touchedAt>=30){active.delete(o.id);button.dataset.state='idle';button.setAttribute('aria-pressed','false')}else{im=a.openStill||im;button.dataset.state=a.budStill?'open':'reacting'}}if(touchFlower(a))syncHit(o,a,im,depthRank);drawables.push({o,im,scope:touchFlower(a)?'flowers':'decor'});continue}
      const v=a.variants.get(o.id);if(!v?.ready)continue;
      const button=buttons.get(o.id);
      const anim=active.get(o.id);let im=a.buds.get(v.id);
      if(anim){
        const phase=bloomPhase(clock-anim.touchedAt,v,anim.from),src=v.frames[phase.frame],hit=cachedFrame(src);let displayedFrame=phase.frame;
        if(phase.frame===(v.route==='PNG_STATE_PAIR'?1:239)){anim.display=v.open;im=a.opens.get(v.id)}else if(hit){anim.display=src;im=hit}else{
          const held=anim.display===v.open?a.opens.get(v.id):cachedFrame(anim.display);im=held||im;displayedFrame=held?v.frames.indexOf(anim.display):0;
          const version=generation;requestFrame(src,false,true).then(()=>{if(version===generation)wake()},error=>{
            if(version!==generation||active.get(o.id)!==anim||anim.error)return;anim.error=true;active.delete(o.id);buttons.get(o.id).dataset.state='error';buttons.get(o.id).setAttribute('aria-pressed','false');status(`${v.name||'꽃'} · ${error.message}`);
          });
        }
        if(!anim.error){prefetch(v,phase.frame,phase.closing);const button=buttons.get(o.id);button.dataset.frame=String(displayedFrame);button.dataset.state=phase.closing?'closing':phase.frame===(v.route==='PNG_STATE_PAIR'?1:239)?'open':'opening';
          if(phase.done){active.delete(o.id);button.dataset.state='idle';button.dataset.frame='0';button.setAttribute('aria-pressed','false');im=a.buds.get(v.id)}
        }
      }
      syncHit(o,a,im,depthRank);drawables.push({o,im,scope:'flowers'});
    }
    for(const {o,im} of drawables)window.jejuSpace?.castShadow(ctx,o,assets.get(o.assetId),im,project.height,project.gardenSpace,cameraView);
    if(!drawables.length)drawAtmosphere(1);for(const [i,{o,im,scope}] of drawables.entries()){drawObject(o,im,scope,1,false,false);if(i===Math.floor(drawables.length/2))drawAtmosphere(1)}
    for(const [i,actor] of actors.entries())if(actor.kind!=='cloud'&&actor.kind!=='mist'&&assets.get(actor.object.assetId)?.category!=='grass')drawActor(actor,i);
    petals=petals.filter(p=>clock-p.start<p.life);ctx.save();ctx.filter=filter('flowers');
    for(const p of petals){const t=clock-p.start,fade=Math.max(0,Math.min(1,(t-(p.life-3))/3));
      // Integrated gusts vary the flight speed without reversing the left/up wind.
      const gust=(frequency,phase)=>t+p.turbulence*(Math.sin(t*frequency+phase)-Math.sin(phase))/frequency;
      const burst=1-Math.exp(-t*5);ctx.save();const defocus=([1.4,0,7][p.depth||0])*atmosphere.focus/100,blur=window.jejuFocus?.css(defocus,project.height,Math.abs(ctx.getTransform?.().a||canvas.width/project.width||1));if(blur)ctx.filter=[filter('flowers'),blur].filter(v=>v&&v!=='none').join(' ');ctx.globalAlpha=p.opacity*(1-fade*fade*(3-2*fade));ctx.translate(p.x+p.vx*gust(p.frequency,p.phase)+p.kickX*burst,p.y+p.vy*gust(p.frequency*.73,p.phase+1.7)+p.kickY*burst-project.height*.0006*t*t);ctx.rotate(p.rotation+t*p.spin+p.turbulence*Math.sin(t*p.frequency+p.phase));if(p.texture){ctx.drawImage(p.texture,-p.size,-p.size,p.size*2,p.size*2)}else{let color=p.color;if(ctx.createRadialGradient){const g=ctx.createRadialGradient(-p.size*.2,-p.size*.35,0,0,0,p.size);g.addColorStop(0,'#fff8e8');g.addColorStop(.35,p.color);g.addColorStop(1,p.color);color=g}ctx.fillStyle=color;ctx.beginPath();if(ctx.bezierCurveTo){ctx.moveTo(0,-p.size);ctx.bezierCurveTo(p.size,p.size*.1,p.size*.45,p.size,0,p.size);ctx.bezierCurveTo(-p.size*.65,p.size*.65,-p.size*.6,-p.size*.3,0,-p.size)}else ctx.ellipse(0,0,p.size*.6,p.size,0,0,Math.PI*2);ctx.fill();}ctx.restore()}ctx.restore();
    drawAtmosphere(2);const visibleAmbient=reduced.matches?[]:ambientParticles,sample=visibleAmbient[0]&&ambientPose(visibleAmbient[0]);canvas.dataset.ambientParticles=String(visibleAmbient.length);canvas.dataset.nearParticles=String(visibleAmbient.filter(p=>p.layer===2).length);canvas.dataset.clouds=String(cloudCount);canvas.dataset.cloudOffset=String(cloudOffset);canvas.dataset.ambientX=String(sample?.x??0);canvas.dataset.ambientY=String(sample?.y??0);canvas.dataset.particleFocus=String(atmosphere.focus);canvas.dataset.wind=String(atmosphere.wind);
    canvas.dataset.petals=String(petals.length);canvas.dataset.reactions=String(active.size);canvas.dataset.flowers=String(buttons.size);canvas.dataset.swayCount=String(swayCount);canvas.dataset.renderFrames=String(paintCount);
  }
  function disposeBackground(video){if(video?.tagName==='VIDEO'){video.pause();video.removeAttribute('src');video.load()}}
  async function loadBackground(src){
    if(!/\.(?:mp4|webm)(?:\?|$)/i.test(src))return image(art.displaySrc(src));
    const entry=window.jejuFinalCatalog?.backgrounds?.find(a=>a.src===src.split('?')[0]);
    if(entry?.revision)src=entry.src+entry.revision;
    if(src.startsWith('/assets/background-loops/'))src=src.split('?')[0]+'?v=calm180-leftdrift-20261020';
    const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.src=entry?.fallbackSrc&&video.canPlayType?.('video/mp4; codecs="av01.0.08M.08"')===''?entry.fallbackSrc+(entry.revision||''):src;
    try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>finish(Error('배경 영상 준비 시간이 초과되었습니다.')),15000);function finish(error){clearTimeout(timer);video.onloadeddata=video.onerror=null;error?reject(error):resolve()}video.onloadeddata=()=>finish();video.onerror=()=>finish(Error('배경 영상을 읽지 못했습니다.'));video.load()});return video}catch(error){disposeBackground(video);throw error}
  }
  function playBackground(video){if(video?.tagName==='VIDEO'&&running()&&!reduced.matches)video.play().catch(()=>status('화면을 터치하면 배경 영상이 재생됩니다.'))}
  function advanceBackground(){
    if(project?.oilAssetVersion===14)return;

    if(clock>=bgChangeAt-5&&!bgNext&&!bgTask){
      const version=generation,nextIndex=(bgIndex+1)%BACKGROUNDS.length;
      bgTask=loadBackground(BACKGROUNDS[nextIndex]).then(video=>{if(version!==generation){disposeBackground(video);return}bgNext=video;playBackground(video)}).catch(error=>{if(version===generation){bgChangeAt+=180;status(error.message+' 현재 배경을 유지합니다.')}}).finally(()=>{if(version===generation)bgTask=null});
    }
    if(clock>=bgChangeAt&&bgNext&&bgFadeAt===null)bgFadeAt=clock;
    if(bgFadeAt!==null&&clock-bgFadeAt>=2){disposeBackground(bg);bg=bgNext;bgNext=null;bgIndex=(bgIndex+1)%BACKGROUNDS.length;bgFadeAt=null;bgChangeAt+=180}
  }
  function tick(now){
    raf=0;if(!running())return;clock+=Math.max(0,(now-last)/1000);last=now;
    const due=Math.floor((now-lastPaint+.1)/(1000/30));
    if(due>0){lastPaint+=due*(1000/30);advanceBackground();paint()}
    raf=requestAnimationFrame(tick);
  }
  function wake(){if(!raf&&running()&&project){last=performance.now();raf=requestAnimationFrame(tick)}}
  function setActive(value){enabled=value===true;for(const video of new Set(actors.map(a=>a.video).filter(Boolean)))if(running()&&!reduced.matches)playBackground(video);else video.pause();if(!running()){if(raf)cancelAnimationFrame(raf);raf=0;bg?.pause?.();bgNext?.pause?.()}else{playBackground(bg);playBackground(bgNext);pumpFrames();wake()}}
  function resize(){
    if(!project)return;const box=$('viewport').getBoundingClientRect(),scale=Math.min(box.width/project.width,box.height/project.height);$('stage').style.width=project.width*scale+'px';$('stage').style.height=project.height*scale+'px';
    const pixelRatio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(project.width*scale*pixelRatio));canvas.height=Math.max(1,Math.round(project.height*scale*pixelRatio));paint();
  }
  function reset(){
    generation++;clearFrameQueue();loading=false;$('loading').hidden=true;active.clear();touches.clear();lastEmptyTouch=-Infinity;sequenceCache.clear();petals=[];clock=0;bgChangeAt=180;bgFadeAt=null;bgTask=null;disposeBackground(bgNext);bgNext=null;
    if(bg?.tagName==='VIDEO')bg.currentTime=0;for(const video of new Set(actors.map(a=>a.video).filter(Boolean)))video.currentTime=0;
    for(const button of buttons.values()){button.dataset.state=button.disabled?'unavailable':'idle';button.setAttribute('aria-pressed','false');delete button.dataset.frame}
    paint();status('꽃을 터치하면 꽃잎이 흩날립니다. 개화 애니메이션은 준비 중입니다.');wake();
  }
  async function mapLimit(items,fn){let cursor=0;await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{while(cursor<items.length){const index=cursor++;await fn(items[index],index)}}))}
  async function loadActors(next,map){
    if(next.oilAssetVersion===14){const result=[],videos=new Map();try{for(const o of next.objects){const a=map.get(o.assetId),kind=actorKind(a);if(kind){const frames=a.frames||[a.src];if(a.loopVideo&&!videos.has(a.id))videos.set(a.id,await loadBackground(a.loopVideo));const video=videos.get(a.id);result.push({object:a.loopInPlace?{...o,motion:'stationary'}:o,kind,frames,fps:a.frames?a.fps:0,video,first:video||await image(frames[0])})}}return result}catch(error){for(const video of videos.values())disposeBackground(video);throw error}}

    if(!actorManifestTask)actorManifestTask=fetch('/assets/animations/manifest.json?v=center-size-v51-20261020').then(r=>{if(!r.ok)throw Error('새·나비·구름 목록을 읽지 못했습니다.');return r.json()}).catch(e=>{actorManifestTask=null;throw e});
    const rawList=await actorManifestTask;if(!Array.isArray(rawList))throw Error('배경 배우 목록 형식 오류');const list=rawList.filter(a=>!window.jejuAmbient.isRetired(a));
    const result=[],present=new Set();
    for(const o of next.objects){const a=map.get(o.assetId),kind=actorKind(a);if(!kind)continue;const found=list.find(v=>a.id===`loop-${v.id}`||a.id===v.id||a.frames?.[0]?.includes(`/animations/${v.id}/`)||a.src?.includes(`/animations/${v.id}/`));
      const frames=a.frames||found?.frames||((kind==='cloud'||kind==='mist')?[a.src]:null);if(!frames?.length||frames.length>(frames.every(safeRoot)?3600:600)||!frames.every(safeSource))continue;present.add(kind);result.push({object:o,kind,frames,fps:(a.fps||found?.fps||30)*(a.sourceDriveId?1:kind==='cloud'?.25:kind==='loop'?1:.7)});
    }
    const h=next.height;
    for(const spec of [{id:'bird1',kind:'bird',x:.66,y:.13,w:.25,opacity:.85},{id:'butterfly1',kind:'butterfly',x:.27,y:.58,w:.17,opacity:.9},{id:'butterfly2',kind:'butterfly',x:.73,y:.47,w:.14,opacity:.85}]){
      if(next.editableActors||present.has(spec.kind))continue;const found=list.find(v=>v.id===spec.id);if(!found?.frames?.length||found.frames.length>600||!found.frames.every(safeRoot))continue;
      result.push({kind:spec.kind,frames:found.frames,fps:found.fps*(spec.kind==='cloud'?.25:.7),object:{id:`ambient-${spec.id}`,x:next.width*spec.x,y:h*spec.y,w:h*spec.w,h:h*spec.w*9/16,r:0,opacity:spec.opacity}});
    }
    await mapLimit(result,async actor=>{const im=await image(actor.frames[0]);const cv=document.createElement('canvas');cv.width=actor.kind==='cloud'||actor.kind==='mist'?1086:320;cv.height=Math.max(1,Math.round(cv.width*im.naturalHeight/im.naturalWidth));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);actor.first=cv;stills.delete(actor.frames[0])});return result;
  }
  async function load(data){
    let next;try{next=validate(data)}catch(error){status(error.message);message('jeju-exhibition-error',{message:error.message});throw error}
    const version=++generation,preparedAnchors=new Map();clearFrameQueue();stills.clear();loading=true;active.clear();touches.clear();lastEmptyTouch=-Infinity;petals=[];sequenceCache.clear();$('loading').hidden=false;
    let nextBackground;
    try{
      next.background=window.jejuFinalCatalog?.backgroundAliases?.[next.background?.split('?')[0]]||next.background;const map=new Map(next.assets.map(a=>[a.id,{...window.jejuAmbient.currentAsset(a,window.jejuFinalCatalog)}])),used=new Set(next.objects.map(o=>o.assetId));if([...used].some(id=>flowerSpecies(map.get(id))))await getManifest();
      for(const id of used){const a=map.get(id);if(flowerSpecies(a)){a.buds=new Map();a.opens=new Map();a.variants=new Map()}}
      const unavailable=[];
      await mapLimit([...used],async id=>{const a=map.get(id),type=flowerSpecies(a);if(!type&&!actorKind(a)){a.still=await image(plant(a)&&safeSource(a.preview)?a.preview:art.displaySrc(a.src));if(touchFlower(a)&&a.ready!==false&&a.bud){a.budStill=await image(a.bud);a.openStill=await image(a.open||a.openImage||a.src)}preparePlant(a,a.still,preparedAnchors)}
      if(type){const objects=next.objects.filter(o=>o.assetId===id),choices=new Map();for(const o of objects){const v=normalizeVariant(type,o.flowerVariant||o.flowerColor||a.bloomVariant||a.tone,a);a.variants.set(o.id,v);if(v?.ready)choices.set(v.id,v);else unavailable.push(v?.id||type)}await mapLimit([...choices.values()],async v=>{a.buds.set(v.id,await image(v.bud));a.opens.set(v.id,await image(v.open));if(v.petalTexture&&safeRoot(v.petalTexture))stills.set('petal:'+v.id,await image(v.petalTexture))})}
      });
      const nextActors=await loadActors(next,map);for(const id of used){const a=map.get(id),im=a.still||a.buds?.values().next().value||nextActors.find(actor=>actor.object.assetId===id)?.first;if(im)preparePlant(a,im,preparedAnchors)}nextBackground=await loadBackground(next.background||BACKGROUNDS[0]);
      if(version!==generation){disposeBackground(nextBackground);for(const video of new Set(nextActors.map(a=>a.video)))disposeBackground(video);return false}
      for(const video of new Set(actors.map(a=>a.video)))disposeBackground(video);disposeBackground(bg);disposeBackground(bgNext);bg=nextBackground;bgNext=null;bgTask=null;bgFadeAt=null;bgChangeAt=180;
      const selected=(next.background||BACKGROUNDS[0]).split('?')[0].replace('/assets/background/','/assets/background-loops/').replace(/\.webp$/,'.mp4');bgIndex=BACKGROUNDS.findIndex(src=>src.split('?')[0]===selected);
      next.gardenSpace=window.jejuSpace?.normalize(next.gardenSpace);project=next;cameraView=window.jejuSpace?.view(next.objects,map,next.width,next.height,next.gardenSpace,0);assets.clear();for(const [id,a] of map)assets.set(id,a);plantAnchors.clear();for(const [id,p] of preparedAnchors)plantAnchors.set(id,p);actors=nextActors;clock=0;paintCount=0;buildAtmosphere();buttons.clear();$('flowers').replaceChildren();
      for(const o of window.jejuSpace?.ordered(project.objects,assets,project.height,project.gardenSpace,cameraView)||project.objects){const a=assets.get(o.assetId);if(!touchFlower(a))continue;const v=a.variants?.get(o.id),ready=flowerSpecies(a)?!!v?.ready:a.ready!==false,button=document.createElement('button');button.className='flower-hit';button.type='button';button.disabled=!ready;button.dataset.variant=v?.id||'';button.dataset.state=ready?'idle':'unavailable';button.dataset.budSupported=String(!!(a.budStill||v?.ready));button.setAttribute('aria-label',`${v?.name||o.name||a.name||'꽃'} · ${ready?'꽃잎 반응':'준비 중'}`);button.setAttribute('aria-pressed','false');button.title=a.budStill||v?.ready?'꽃잎 반응 · 30초 후 준비된 봉오리 상태 복귀':'꽃잎 반응 · 원본 꽃 유지 · 봉오리 이미지 준비 중';button.style.transformOrigin='50% 50%';
        button.onpointerenter=e=>{if(e.pointerType==='mouse')bloom(o,e,'hover')};button.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.stopPropagation?.();bloom(o,e,'pointer')};button.onclick=e=>bloom(o,e);$('flowers').append(button);buttons.set(o.id,button);
      }
      $('layoutName').textContent=(project.name||'현재 배치')+' · '+buttons.size+'개 꽃';resize();playBackground(bg);for(const actor of actors)playBackground(actor.video);status(unavailable.length?'일부 색상의 개화 영상이 아직 준비되지 않았습니다.':'꽃 주변으로 빛과 꽃잎이 떠다닙니다. 개화 애니메이션은 준비 중입니다.');message('jeju-exhibition-loaded',{flowerCount:buttons.size,unavailable:[...new Set(unavailable)]});wake();return true;
    }catch(error){if(version===generation){status(error.message);message('jeju-exhibition-error',{message:error.message})}throw error}
    finally{if(version===generation){loading=false;$('loading').hidden=true}}
  }
  async function demo(){const sample=window.jejuWhole62?.scenes?.[0]?.project||window.jejuFinalCatalog?.scenes?.[0]?.project;if(sample){const project=structuredClone(sample),used=new Set((project.objects||[]).map(o=>o.assetId)),sceneAssets=project.assets?.filter(a=>!used.size||used.has(a.id));
    if(sceneAssets?.length&&sceneAssets.every(a=>a.category==='background'||a.completeObject))project.oilAssetVersion=14;
    await load(project);return}const manifest=await getManifest(),variants=manifest.variants.filter(v=>v.ready);await load({format:'jeju-maze-wall-v1',name:'모든 꽃 · 24색 체험',width:2400,height:2100,gardenSpace:{enabled:false},assets:variants.map(v=>({id:`flower-${v.id}`,name:v.name,group:'flowers',species:v.species,tone:v.tone,bloomVariant:v.id,src:v.open})),background:BACKGROUNDS[0],objects:variants.map((v,i)=>({id:v.id,assetId:`flower-${v.id}`,name:v.name,x:i%4*600+180,y:Math.floor(i/4)*350+15,w:240,h:320,r:0,opacity:1,flowerVariant:v.id,flowerColor:v.tone}))})}
  function trustedMessage(event){return event.origin===ownOrigin&&window.parent!==window&&event.source===window.parent&&event.data&&typeof event.data==='object'}
  function state(){return {active:enabled,loading,flowerCount:buttons.size,activeBlooms:active.size,petals:petals.length,swayCount,renderFrames:paintCount,cacheSize:sequenceCache.size,decodedFrames:frameCache.size,decoding,queuedFrames:frameQueue.length,clock,backgroundIndex:bgIndex}}
  window.jejuExhibition={load,setActive,reset,state,normalizeVariant,bloomAll:()=>{for(const o of project?.objects||[])if(touchFlower(assets.get(o.assetId)))bloom(o)}};
  window.addEventListener('message',event=>{if(!trustedMessage(event))return;if(event.data.type==='jeju-exhibition-project')load(event.data.project).catch(()=>{});else if(event.data.type==='jeju-exhibition-active')setActive(event.data.active);else if(event.data.type==='jeju-exhibition-bloom-all')window.jejuExhibition.bloomAll()});
  $('openFile').onclick=()=>$('projectFile').click();$('projectFile').onchange=async e=>{const file=e.target.files[0];try{if(!file)return;if(file.size>256*1024*1024)throw Error('256MB 이하 JSON 파일을 선택하세요.');await load(JSON.parse(await file.text()))}catch(error){status(error.message)}finally{e.target.value=''}};
  $('demo').onclick=()=>demo().catch(error=>status(error.message));$('reset').onclick=reset;$('fullscreen').onclick=()=>{const task=document.fullscreenElement?document.exitFullscreen():document.body.requestFullscreen?.();task?.catch(()=>status('이 브라우저에서 전체 화면을 열 수 없습니다.'))};
  $('viewport').addEventListener('pointerdown',event=>{playBackground(bg);playBackground(bgNext);if(!project||loading||!running()||event.target?.closest?.('.flower-hit')||event.target?.closest?.('#atmosphereControls')||event.button!==undefined&&event.button!==0||clock-lastEmptyTouch<.15)return;const point=touchPoint(event);if(!point)return;lastEmptyTouch=clock;scatter({id:'empty-touch',x:point.x,y:point.y,w:project.height*.18,h:project.height*.26,r:0,opacity:1},{},point);canvas.dataset.touchX=String(point.x);canvas.dataset.touchY=String(point.y);paint();wake()});window.addEventListener('resize',resize);document.addEventListener('fullscreenchange',resize);document.addEventListener('visibilitychange',()=>setActive(enabled));
  reduced.addEventListener('change',()=>{setActive(enabled);if(reduced.matches){bg?.pause?.();bgNext?.pause?.()}else{playBackground(bg);playBackground(bgNext)}paint()});
  for(const [key,id,max] of [['richness','atmosphereRichness',150],['focus','atmosphereFocus',100],['wind','atmosphereWind',100]]){const input=$(id);if(!input)continue;const update=()=>{const number=Number(input.value);atmosphere[key]=Number.isFinite(number)?Math.max(0,Math.min(max,number)):atmosphere[key];input.value=String(atmosphere[key]);const output=$(id+'Value');if(output)output.textContent=atmosphere[key]+'%';if(key==='richness')buildAtmosphere();if(key==='focus')particleSprites.clear();paint();wake()};input.value=String(atmosphere[key]);input.addEventListener('input',update);const output=$(id+'Value');if(output)output.textContent=atmosphere[key]+'%'}
  if(embedded){document.body.classList.add('embedded');message('jeju-exhibition-ready')}
  async function start(){if(embedded)return;let data;try{if(window.opener?.location.origin===ownOrigin)data=window.opener.jejuEditor?.project()}catch{}if(data?.objects?.length)await load(data);else await demo()}
  start().catch(error=>{status(error.message);$('loading').hidden=true});
})();
