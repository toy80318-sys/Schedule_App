(() => {
  'use strict';
  const $=id=>document.getElementById(id),cdn='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261024-v52/';
  function validManifest(data) {
    if(data.version!==52||!Array.isArray(data.scenes)||data.scenes.length!==4)throw Error('레이어 목록의 형식이 맞지 않습니다.');
    const ids=new Set();
    for(const s of data.scenes){
      if(!['sunset','day','night','morning'].includes(s.id)||ids.has(s.id)||!Array.isArray(s.layers)||s.layers.length!==5)throw Error('배경 목록이 맞지 않습니다.');ids.add(s.id);
      if(!/^assets\/air-particles-v51\/ML_BG0[1-4]_LT0[1-4]_IntegratedBloom_AirParticles_[A-Za-z]+_v51_preview\.webp$/.test(s.reference.preview)||!s.reference.src.startsWith('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261023-v49/')||s.reference.src.includes('..'))throw Error('원본 이미지 주소가 맞지 않습니다.');
      const kinds=new Set();
      for(const l of s.layers){
        if(!['background','flowers','grass','basalt','particles'].includes(l.id)||kinds.has(l.id))throw Error('분리 요소가 중복되거나 빠졌습니다.');kinds.add(l.id);
        if(!/^assets\/scene-layers-v52\/ML_BG0[1-4]_LT0[1-4]_(Background|Flowers|Grass|Basalt|Particles)_v52_preview\.webp$/.test(l.preview)||l.src!==cdn+l.file||!/^[A-Za-z0-9_]+\.png$/.test(l.file))throw Error('요소 이미지 주소가 맞지 않습니다.');
        if(!Array.isArray(l.rect)||l.rect.length!==4||!l.rect.every(Number.isFinite)||l.rect[0]<0||l.rect[1]<0||l.rect[2]<=0||l.rect[3]<=0||l.rect[0]+l.rect[2]>1.001||l.rect[1]+l.rect[3]>1.001||!Number.isFinite(l.sortingOrder)||!Number.isFinite(l.opacity)||l.opacity<0||l.opacity>1)throw Error('요소 배치 값이 맞지 않습니다.');
      }
      if(s.zip!==cdn+'ML_'+s.backgroundId+'_'+s.lightingId+'_Layers_v52.zip')throw Error('다운로드 주소가 맞지 않습니다.');
    }
    return data;
  }
  let scenes=[],revision=0;
  function image(src,alt){const i=document.createElement('img');i.src=src;i.alt=alt;i.decoding='async';return i;}
  function show(id){
    const s=scenes.find(s=>s.id===id)||scenes[0],turn=++revision;
    $('scene-title').textContent=s.name+' · '+s.backgroundId+' / '+s.lightingId;
    $('lighting').textContent=s.lighting;$('zip').href=s.zip;$('zip').hidden=false;
    $('reference').src=s.reference.preview;$('reference').alt=s.name+' 원본 통합 이미지';$('reference-link').href=s.reference.src;
    $('canvas').querySelectorAll('img').forEach(i=>i.remove());$('toggles').replaceChildren();$('cards').replaceChildren();
    $('ghost').style.backgroundImage='url("'+s.reference.preview+'")';$('ghost').style.opacity='0';$('overlay').value=0;$('overlay-value').value='0%';
    const pending=[];
    for(const l of s.layers){
      const i=image(l.preview,'');i.dataset.layer=l.id;i.setAttribute('aria-hidden','true');i.style.cssText='left:'+l.rect[0]*100+'%;top:'+l.rect[1]*100+'%;width:'+l.rect[2]*100+'%;height:'+l.rect[3]*100+'%;z-index:'+l.sortingOrder+';opacity:'+l.opacity;
      $('canvas').append(i);pending.push(i.decode());
      const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=true;check.dataset.layer=l.id;check.onchange=()=>{i.hidden=!check.checked;};label.append(check,document.createTextNode(l.name));$('toggles').append(label);
      const card=document.createElement('article');card.className='layer-card '+l.id;
      const link=document.createElement('a');link.href=l.src;const thumb=image(l.preview,s.name+' · '+l.name);thumb.className='checker';thumb.dataset.imagePreview='';thumb.tabIndex=0;thumb.title='클릭하여 크게 보기';link.append(thumb);
      const title=document.createElement('h3');title.textContent=l.name;
      const note=document.createElement('p');note.textContent=l.nativeWidth+'×'+l.nativeHeight+' · '+(l.transparent?'PNG 알파':'불투명 배경 PNG');
      const download=document.createElement('a');download.href=l.src;download.download=l.file;download.textContent='원본 PNG ↓';card.append(link,title,note,download);$('cards').append(card);
      if(l.id==='background'){$('background').src=l.preview;$('background').alt=s.name+' · 배경만';$('background-link').href=l.src;$('background-download').href=l.src;}
    }
    for(const b of $('themes').children)b.setAttribute('aria-pressed',String(b.dataset.theme===s.id));
    const u=new URL(location.href);u.hash=s.id;history.replaceState(null,'',u);
    $('status').textContent='분리된 요소를 불러오는 중입니다.';
    Promise.allSettled(pending).then(results=>{if(turn===revision)$('status').textContent=results.every(r=>r.status==='fulfilled')?'5개 요소를 겹쳐 표시했습니다. 체크를 끄면 각 요소를 분리해서 볼 수 있습니다.':'일부 이미지가 열리지 않았습니다. 새로고침해 주세요.';});
  }
  $('all-on').onclick=()=>{$('overlay').value=0;$('overlay').oninput();for(const check of $('toggles').querySelectorAll('input')){check.checked=true;check.onchange();}};
  $('background-only').onclick=()=>{$('overlay').value=0;$('overlay').oninput();for(const check of $('toggles').querySelectorAll('input')){check.checked=check.dataset.layer==='background';check.onchange();}};
  $('overlay').oninput=()=>{$('ghost').style.opacity=$('overlay').value/100;$('overlay-value').value=$('overlay').value+'%';};
  $('enlarge').onclick=()=>$('composition').requestFullscreen?.();
  fetch('assets/scene-layers-v52/layers-manifest_v52.json').then(r=>{if(!r.ok)throw Error('레이어 목록을 불러오지 못했습니다.');return r.json();}).then(validManifest).then(data=>{
    scenes=data.scenes;for(const s of scenes){const b=document.createElement('button');b.type='button';b.dataset.theme=s.id;b.textContent=s.name;b.onclick=()=>show(s.id);$('themes').append(b);}show(location.hash.slice(1));
  }).catch(error=>{$('status').textContent=error.message;});
})();
