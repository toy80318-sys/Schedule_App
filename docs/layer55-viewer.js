(()=>{
 'use strict';
 const $=id=>document.getElementById(id),data=window.jejuLayer55,cdn='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261025-v55/';
 const labels={background:'배경',flower:'개별 꽃',grass:'전경 풀·잎',decor:'현무암',particle:'공중 입자',butterfly:'유리 나비'};
 let revision=0;
 function validate(d){
  if(d?.version!==55||d.assets?.length!==40||d.scenes?.length!==4)throw Error('소스 목록 형식 오류');
  const ids=new Set();
  for(const a of d.assets){
   if(ids.has(a.id)||!labels[a.category]||!a.src.startsWith(cdn)||a.src!==cdn+a.file||!/^[A-Za-z0-9_]+\.png$/.test(a.file)||!/^assets\/unity-layers-v55\/[A-Za-z0-9_]+_preview\.webp$/.test(a.preview))throw Error('소스 이미지 주소 오류');ids.add(a.id);
  }
  const scenes=new Set();
  for(const s of d.scenes){
   if(!['sunset','day','night','morning'].includes(s.id)||scenes.has(s.id)||s.assets?.length!==10||!s.zip.startsWith(cdn)||!/^ML_BG0[1-4]_LT0[1-4]_UnityLayers_v55\.zip$/.test(s.zip.slice(cdn.length)))throw Error('배경별 소스 목록 오류');scenes.add(s.id);
   const own=new Set(s.assets.map(a=>a.id)),p=s.project;
   if(p.width!==14165||p.height!==3480||!Array.isArray(p.objects)||!own.has(s.assets.find(a=>a.category==='background')?.id))throw Error('배치 크기 오류');
   for(const o of p.objects)if(!own.has(o.assetId)||![o.x,o.y,o.w,o.h,o.r,o.opacity,o.z].every(Number.isFinite)||o.w<=0||o.h<=0||o.x<0||o.y<0||o.x+o.w>p.width+.01||o.y+o.h>p.height+.01||o.opacity<0||o.opacity>1)throw Error('요소 배치 오류');
   if(!s.reference.src.startsWith('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261025-v54/ML_')||s.reference.src.includes('..')||!/^assets\/contrast-v54\/[A-Za-z0-9_]+_v54r2_preview\.webp$/.test(s.reference.preview))throw Error('통합본 주소 오류');
  }
  return d;
 }
 function image(src,alt=''){const i=document.createElement('img');i.src=src;i.alt=alt;i.decoding='async';return i;}
 function show(id){
  const s=data.scenes.find(s=>s.id===id)||data.scenes[0],turn=++revision,p=s.project,map=new Map(s.assets.map(a=>[a.id,a]));
  $('scene-title').textContent=s.name+' · '+s.backgroundId+' / '+s.lightingId;
  $('lighting').textContent=typeof s.lighting==='string'?s.lighting:'통합본 기준으로 맞춘 조명 · 같은 캔버스와 스케일';
  $('zip').href=s.zip;$('zip').hidden=false;$('editor').href='editor.html?layers=55&scene='+s.id;
  $('reference').src=s.reference.preview;$('reference').alt=s.name+' 통합 유화 기준';$('reference-link').href=s.reference.src;
  $('canvas').querySelectorAll('img').forEach(i=>i.remove());$('cards').replaceChildren();$('toggles').replaceChildren();
  $('ghost').style.backgroundImage='url("'+s.reference.preview+'")';$('overlay').value=0;$('overlay').oninput();
  const pending=[];
  function place(a,o){const i=image(a.preview);i.dataset.category=a.category;i.setAttribute('aria-hidden','true');i.style.cssText='left:'+o.x/p.width*100+'%;top:'+o.y/p.height*100+'%;width:'+o.w/p.width*100+'%;height:'+o.h/p.height*100+'%;z-index:'+o.z+';opacity:'+o.opacity+';transform:rotate('+o.r+'deg)';$('canvas').append(i);pending.push(i.decode());}
  const bg=s.assets.find(a=>a.category==='background');place(bg,{x:0,y:0,w:p.width,h:p.height,z:0,opacity:1,r:0});
  for(const o of p.objects)place(map.get(o.assetId),o);
  for(const [kind,text] of Object.entries(labels)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=true;input.dataset.category=kind;input.onchange=()=>{for(const i of $('canvas').querySelectorAll('img[data-category="'+kind+'"]'))i.hidden=!input.checked;};label.append(input,document.createTextNode(text));$('toggles').append(label);}
  for(const a of s.assets){
   const card=document.createElement('article');card.className='layer-card '+a.category+(a.width===4096?' panorama':' sprite');
   const link=document.createElement('a');link.href=a.src;const thumb=image(a.preview,a.name);thumb.dataset.imagePreview='';thumb.tabIndex=0;thumb.className='checker';link.append(thumb);
   const title=document.createElement('h3');title.textContent=a.name;const note=document.createElement('p');note.textContent=a.width+'×'+a.height+' · '+(a.transparent?'PNG 알파':'배경 PNG');
   const download=document.createElement('a');download.href=a.src;download.download=a.file;download.textContent='Unity용 PNG ↓';card.append(link,title,note,download);$('cards').append(card);
  }
  $('background').src=bg.preview;$('background').alt=s.name+' 꽃 없는 배경';$('background-link').href=bg.src;$('background-download').href=bg.src;
  $('layout-download').href=s.unityLayout;$('project-download').href=s.editorProject;
  for(const b of $('themes').children)b.setAttribute('aria-pressed',String(b.dataset.theme===s.id));
  const u=new URL(location.href);u.hash=s.id;history.replaceState(null,'',u);$('status').textContent='분리 PNG를 겹쳐 불러오는 중입니다.';
  Promise.allSettled(pending).then(r=>{if(turn===revision)$('status').textContent=r.every(v=>v.status==='fulfilled')?p.objects.length+'개 오브젝트를 실제 PNG 레이어로 구성했습니다.':'일부 이미지가 열리지 않았습니다. 새로고침해 주세요.';});
 }
 $('overlay').oninput=()=>{$('ghost').style.opacity=$('overlay').value/100;$('overlay-value').value=$('overlay').value+'%';};
 for(const id of ['all-on','background-only'])$(id).onclick=()=>{$('overlay').value=0;$('overlay').oninput();for(const check of $('toggles').querySelectorAll('input')){check.checked=id==='all-on'||check.dataset.category==='background';check.onchange();}};
 $('enlarge').onclick=()=>{const big=document.createElement('div');big.className='canvas checker';for(const i of $('canvas').querySelectorAll('img'))big.append(i.cloneNode());$('enlarged-stage').replaceChildren(big);$('enlarged').showModal();};$('close-enlarged').onclick=()=>$('enlarged').close();
 try{validate(data);for(const s of data.scenes){const b=document.createElement('button');b.type='button';b.dataset.theme=s.id;b.textContent=s.name;b.onclick=()=>show(s.id);$('themes').append(b);}show(location.hash.slice(1));}catch(e){$('status').textContent=e.message;}
})();
