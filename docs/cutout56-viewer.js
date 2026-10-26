(()=>{
 'use strict';
 const data=window.jejuCutout56,$=id=>document.getElementById(id),cdn='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261026-v56/';
 const labels={flower:'꽃 군집',grass:'풀·잎·전경 연결부',decor:'현무암 주변',particle:'공중 입자'};
 function validate(d){
  if(d?.version!==56||d.scenes?.length!==4||!Array.isArray(d.assets))throw Error('분리 목록 형식 오류');
  const ids=new Set();for(const a of d.assets){if(ids.has(a.id)||!['background',...Object.keys(labels)].includes(a.category)||a.src!==cdn+a.file||!/^[A-Za-z0-9_]+\.png$/.test(a.file)||!/^assets\/source-cutouts-v56\/[A-Za-z0-9_]+_preview\.webp$/.test(a.preview))throw Error('분리 소스 주소 오류');ids.add(a.id)}
  const themes=new Set();for(const s of d.scenes){
   const p=s.project,own=new Set(s.assets.map(a=>a.id));if(!['sunset','day','night','morning'].includes(s.id)||themes.has(s.id)||p.width!==14165||p.height!==3480||p.reference!==null||!/^BG0[1-4]$/.test(s.backgroundId)||!/^LT0[1-4]$/.test(s.lightingId)||s.zip!==cdn+'ML_'+s.backgroundId+'_'+s.lightingId+'_SourceCutouts_Unity_v56.zip'||p.background!==s.assets.find(a=>a.category==='background')?.src)throw Error('배치 형식 오류');themes.add(s.id);
   for(const o of p.objects)if(!own.has(o.assetId)||![o.x,o.y,o.w,o.h,o.r,o.opacity].every(Number.isFinite)||o.x<0||o.y<0||o.w<=0||o.h<=0||o.opacity<0||o.opacity>1||o.x+o.w>p.width+.01||o.y+o.h>p.height+.01)throw Error('배치 좌표 오류');
   for(const [key,suffix] of [['reference','reference'],['recomposed','recomposed'],['backgroundPreview','background']])if(s[key]!=='assets/source-cutouts-v56/'+s.id+'_'+suffix+'_v56.webp')throw Error('미리보기 주소 오류');
  }
  return d;
 }
 function show(id){
  const s=data.scenes.find(s=>s.id===id)||data.scenes[0],p=s.project,map=new Map(s.assets.map(a=>[a.id,a]));
  $('title').textContent=s.name+' · '+s.backgroundId+' / '+s.lightingId;$('editor').href='editor.html?layers=56&scene='+s.id;$('zip').href=s.zip;
  $('reference').src=s.reference;$('reference').alt=s.name+' 통합 원본의 벽면 비율';$('stage').replaceChildren();$('toggles').replaceChildren();$('cards').replaceChildren();
  function put(a,o){const im=document.createElement('img');im.src=a.preview;im.alt='';im.dataset.category=a.category;im.style.cssText=`left:${o.x/p.width*100}%;top:${o.y/p.height*100}%;width:${o.w/p.width*100}%;height:${o.h/p.height*100}%;z-index:${o.z};`; $('stage').append(im);return im.decode()}
  const bg=s.assets.find(a=>a.category==='background'),pending=[put(bg,{x:0,y:0,w:p.width,h:p.height,z:0})];for(const o of p.objects)pending.push(put(map.get(o.assetId),o));
  for(const [key,name] of Object.entries(labels)){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=true;check.onchange=()=>{for(const i of $('stage').querySelectorAll('img[data-category="'+key+'"]'))i.hidden=!check.checked};label.append(check,document.createTextNode(name));$('toggles').append(label)}
  for(const a of s.assets){const card=document.createElement('article'),link=document.createElement('a'),im=document.createElement('img'),name=document.createElement('p');card.className='layer-card';link.href=a.src;im.src=a.preview;im.alt=a.name;im.loading='lazy';im.className='checker';im.dataset.imagePreview='';name.textContent=a.name+' · '+a.width+'×'+a.height;link.append(im);card.append(link,name);$('cards').append(card)}
  $('background').src=s.backgroundPreview;$('background-link').href=bg.src;$('project').href=s.editorProject;$('layout').href=s.unityLayout;$('status').textContent='분리 PNG를 불러오는 중입니다.';
  Promise.allSettled(pending).then(r=>{if(location.hash==='#'+s.id)$('status').textContent=r.every(x=>x.status==='fulfilled')?p.objects.length+'개 분리 영역 · 원본 좌표로 재합성 · 저장 PNG 기준 최대 RGB 차이 0':'일부 PNG가 열리지 않았습니다.'});
  for(const b of $('themes').children)b.setAttribute('aria-pressed',String(b.dataset.id===s.id));history.replaceState(null,'','#'+s.id);
 }
 try{validate(data);for(const s of data.scenes){const b=document.createElement('button');b.type='button';b.dataset.id=s.id;b.textContent=s.name;b.onclick=()=>show(s.id);$('themes').append(b)}show(location.hash.slice(1))}catch(e){$('status').textContent=e.message}
})();
