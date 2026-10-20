(() => {
  'use strict';
  const data=window.jejuFinalCatalog,E=window.jejuEditor,$=id=>document.getElementById(id);
  const labels={flower:'꽃 · 만개 PNG',petal:'꽃잎',background:'배경 PNG',cloud:'구름',mist:'안개',bird:'새',butterfly:'나비',grass:'잎 · 잎줄기 · 풀',decor:'현무암',cluster:'군집 이미지',reference:'참고 자료'};
  let chosen=null,frame=0,playing=false,last=0,raf=0,loadToken=0;
  const host=$('finalCatalog'),list=$('catalogCards'),media=$('catalogMedia'),seek=$('catalogSeek');
  const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=text;b.onclick=fn;return b};
  const fail=error=>E.notice(error.message||String(error));
  function stop(){playing=false;cancelAnimationFrame(raf);$('catalogPlay').textContent='재생';media.querySelector('video')?.pause()}
  function frameLabel(){const n=chosen?.frames?.length||0;$('catalogFrame').textContent=n?`${frame+1} / ${n} 프레임 · ${(frame/(chosen.fps||30)).toFixed(2)}초`:''}
  function showFrame(){const im=media.querySelector('img');if(im&&chosen?.frames?.length)im.src=chosen.frames[frame];seek.value=frame;frameLabel()}
  function tick(now){if(!playing||!host.open||!chosen?.frames?.length)return;const raw=Math.floor((now-last)*(chosen.fps||30)/1000),next=chosen.category==='flower'?Math.min(chosen.frames.length-1,raw):raw%chosen.frames.length;if(next!==frame){frame=next;showFrame()}if(chosen.category==='flower'&&frame===chosen.frames.length-1){stop();return}raf=requestAnimationFrame(tick)}
  async function select(a){
    stop();const token=++loadToken;chosen=a;frame=0;media.replaceChildren();$('catalogName').textContent=a.name;
    const warning=a.visualWarning||a.warning||'';
    $('catalogInfo').textContent=[labels[a.category]||a.category,a.width&&`${a.width} × ${a.height}`,a.frames?.length&&`${a.frames.length}프레임 · ${a.fps}FPS`,a.duration&&`${Number(a.duration).toFixed(2)}초`,a.referenceOnly&&'참고용 · 전시 배치 제외',warning].filter(Boolean).join(' · ');
    $('catalogWarning').textContent=a.category==='flower'?'조명이 적용된 만개 PNG입니다. 봉오리 PNG도 별도로 제공됩니다. 개화 영상은 포함하지 않습니다.':a.sourceFpsVerified===false?'원본에 FPS 정보가 없어 웹 재생 속도를 30FPS로 지정했습니다.':warning;
    const im=document.createElement(a.kind==='video'?'video':'img');im.setAttribute('aria-label',a.name);if(a.kind==='video'){im.controls=true;im.muted=true;im.playsInline=true;im.preload='metadata';im.poster=a.poster||a.thumb||'';im.src=(a.fallbackSrc&&im.canPlayType?.('video/mp4; codecs="av01.0.08M.08"')===''?a.fallbackSrc:a.src)+(a.revision||'')}else{im.alt=a.name;im.src=a.frames?.[0]||a.src}media.append(im);
    seek.hidden=!a.frames?.length;seek.max=Math.max(0,(a.frames?.length||1)-1);seek.value=0;$('catalogPlay').hidden=!a.frames?.length;$('catalogStart').hidden=!a.frames?.length;$('catalogEnd').hidden=!a.frames?.length;frameLabel();
    $('catalogAdd').disabled=!!a.referenceOnly;$('catalogAdd').textContent=a.category==='background'?'이 배경 적용':'현재 배치에 추가';$('catalogReplace').disabled=!!a.referenceOnly||a.category==='background';
    const id=a.resolutionUpgrade?.masterDriveId||a.sourceDriveId||a.originalDriveId;$('catalogOriginal').hidden=!id;$('catalogOriginal').href=id?`https://drive.google.com/file/d/${encodeURIComponent(id)}/view`:'#';
    for(const card of list.children)card.setAttribute('aria-pressed',String(card.dataset.asset===a.id));
    if(a.frames?.length){await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error('프리뷰 프레임을 읽지 못했습니다.'))});if(token!==loadToken)return;}
  }
  function render(){
    const text=$('catalogSearch').value.trim().toLowerCase(),category=$('catalogCategory').value;
    const items=data.assets.filter(a=>(!category||a.category===category)&&`${a.name} ${a.code||''} ${a.sourceName||''}`.toLowerCase().includes(text));list.replaceChildren();
    $('catalogCount').textContent=`${items.length}개 / 전체 ${data.assets.length}개 · 조명별 원본 PNG`;
    for(const a of items){const b=button('',()=>select(a).catch(fail));b.className='catalog-card';b.dataset.asset=a.id;b.setAttribute('aria-label',a.name);b.setAttribute('aria-pressed',String(chosen?.id===a.id));const im=document.createElement('img');im.src=a.thumb||a.poster||a.src;im.alt='';im.loading='lazy';const name=document.createElement('span');name.textContent=a.name;const tag=document.createElement('small');tag.textContent=a.referenceOnly?'참고용':a.qualityStatus==='source-warning'?'원본 주의':labels[a.category]||a.category;b.append(im,name,tag);list.append(b)}
  }
  function placed(){
    const state=E.state(),target=$('catalogPlaced'),selected=new Set(E.selected().map(o=>o.id));target.replaceChildren();
    for(const o of state.objects){const b=button(`${selected.has(o.id)?'✓ ':''}${o.name||o.assetId}`,()=>{E.selectObject(o.id);const a=data.assets.find(a=>a.id===o.assetId);if(a)select(a).catch(fail)});b.dataset.object=o.id;b.setAttribute('aria-pressed',String(selected.has(o.id)));target.append(b)}
    const first=E.selected()[0],asset=state.assets.find(a=>a.id===first?.assetId);$('catalogMotion').disabled=!first||!['cloud','mist','bird','butterfly'].includes(asset?.category);$('catalogMotion').value=first?.motion||asset?.motion||'stationary';
  }
  function sample(){return structuredClone(data.scenes[0].project);

    const objects=[],used=new Map(),W=14165,H=3480;
    function put(a,x,y,w,h,extra={}){used.set(a.id,a);objects.push({id:`final-${objects.length}`,assetId:a.id,name:a.name,x,y,w,h,baseW:w,baseH:h,aspect:w/h,r:0,opacity:1,...(a.bloomVariant?{flowerVariant:a.bloomVariant,flowerColor:a.tone}:{}),...(a.motion?{motion:a.motion}:{}),...extra})}
    data.assets.filter(a=>['cloud','mist'].includes(a.category)&&!a.referenceOnly).forEach((a,i)=>put(a,400+i*3300,100+(i%2)*170,1900,1900*a.height/a.width,{motion:'stationary',opacity:a.kind==='image'?.3:.6}));
    data.assets.filter(a=>a.category==='decor').forEach((a,i)=>put(a,500+i*2700,Math.min(2600,H-700*a.height/a.width-50),700,700*a.height/a.width));
    const flowers=data.assets.filter(a=>a.category==='flower');flowers.forEach((a,i)=>{const group=Math.floor(i/4),k=i%4,w=740,h=w*4/3;put(a,350+group*2250+k*420,H-h-220-(k%2)*130,w,h,{groupId:`final-garden-${group}`,groupName:`꽃 군집 ${group+1}`})});
    data.assets.filter(a=>a.category==='grass').forEach((a,i)=>{const w=610;put(a,150+i*1740,H-w*a.height/a.width-50,w,w*a.height/a.width)});
    data.assets.filter(a=>['bird','butterfly'].includes(a.category)).forEach((a,i)=>put(a,900+i*2050,500+(i%3)*300,650,650*a.height/a.width,{motion:i%2?'left':'right',opacity:.9}));
    return {format:'jeju-maze-wall-v1',name:'Drive 최종 · 통합 전시 시안',width:W,height:H,editableActors:true,assets:[...used.values()],objects,background:(data.backgrounds.find(a=>a.id==='drive-background-hallasan-noon')||data.backgrounds[0])?.src||null,reference:null,sceneFilters:{},flowerAssetVersion:2};
  }
  $('openFinalCatalog').onclick=()=>{host.showModal();render();placed();if(!chosen)select(data.assets.find(a=>a.category==='flower')||data.assets[0]).catch(fail)};
  $('catalogClose').onclick=()=>host.close();host.addEventListener('close',()=>{loadToken++;stop()});$('catalogSearch').oninput=render;$('catalogCategory').onchange=render;
  $('catalogPlay').onclick=()=>{if(playing){stop();return}if(frame>=chosen.frames.length-1)frame=0;playing=true;last=performance.now()-frame*1000/(chosen.fps||30);$('catalogPlay').textContent='일시정지';raf=requestAnimationFrame(tick)};
  seek.oninput=()=>{stop();frame=Number(seek.value);showFrame()};$('catalogStart').onclick=()=>{stop();frame=0;showFrame()};$('catalogEnd').onclick=()=>{stop();frame=chosen.frames.length-1;showFrame()};
  $('catalogAdd').onclick=async()=>{try{if(chosen.category==='background')E.setBackground(chosen.src);else await E.addAsset(chosen);placed()}catch(e){fail(e)}};
  $('catalogReplace').onclick=()=>{try{const n=E.replaceSelection(chosen);E.notice(`${n}개 요소를 교체했습니다. 위치·크기·그룹을 유지했습니다.`);placed()}catch(e){fail(e)}};
  $('catalogMotion').onchange=()=>{try{E.setMotion($('catalogMotion').value)}catch(e){fail(e)}};
  $('catalogSample').onclick=async()=>{try{const backup=await E.useSample(sample());E.notice(backup?'이전 작업을 저장하고 통합 시안을 열었습니다.':'통합 시안을 열었습니다.');host.close()}catch(e){fail(e)}};
  $('catalogExhibition').onclick=()=>{host.close();E.openExhibition()};
  document.addEventListener('jeju-editor-change',()=>{if(host.open)placed()});
  for(const [id,name] of Object.entries(labels)){const option=document.createElement('option');option.value=id;option.textContent=name;$('catalogCategory').append(option)}
  const originals=$('catalogSources');for(const f of data.sourceFiles){const row=document.createElement('li'),a=document.createElement('a');a.textContent=f.relativePath;a.href=f.stablePreviewUrl||`https://drive.google.com/file/d/${encodeURIComponent(f.id)}/view`;a.target='_blank';a.rel='noopener';row.append(a);originals.append(row)}
  function openLinked(){const linked=data.assets.find(a=>a.id===new URLSearchParams(location.hash.slice(1)).get('asset'));if(linked){$('catalogCategory').value=linked.category;host.showModal();render();placed();select(linked).catch(fail)}}
  E.ready.then(()=>{E.registerCatalog(data);$('openFinalCatalog').disabled=false;openLinked();window.addEventListener('hashchange',openLinked);$('catalogSummary').textContent=`유화 v14 · 꽃 6종 / 조명·형태 16개 · 배경 ${data.backgrounds.length}종 · PNG 96개`}).catch(fail);
})();
