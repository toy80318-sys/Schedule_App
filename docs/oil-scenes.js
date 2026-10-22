(async()=>{
 'use strict';
 const E=window.jejuEditor,data=window.jejuFinalCatalog;
 const panel=document.createElement('section');panel.style.cssText='padding:12px;border:1px solid #6da699;border-radius:10px;margin-bottom:12px;background:#173b32';
 const title=document.createElement('h3');title.textContent='추상 유화 v44 배치 · 4가지 조명';
 const note=document.createElement('p');note.className='note';note.textContent='통합 유화처럼 작은 꽃을 풍성하게 배치하고, 잎·풀·현무암의 크기와 겹침을 맞췄습니다. 배경을 선택하면 이전 작업을 저장본에 보관하고 새 배치를 엽니다.';
 panel.append(title,note);
 async function applyScene(scene){await E.ready;await E.useSample(structuredClone(scene.project));E.notice(scene.name+' · 통합 유화 기준 배치를 열었습니다. 이전 배치는 저장본에 보관했습니다.')}
 for(const scene of data.scenes){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=scene.name;b.style.margin='3px';b.onclick=async()=>{b.disabled=true;try{await applyScene(scene)}catch(error){E.notice(error.message)}finally{b.disabled=false}};panel.append(b)}
 const link=document.createElement('a');link.className='btn';link.href='oil-art.html';link.target='_blank';link.rel='noopener';link.textContent='기준 통합 유화 보기';panel.append(link);
 document.getElementById('items').before(panel);
 await E.ready;
 await window.jejuHandoff.ready;
 const requested=new URL(location.href);
 if(['39','44'].includes(requested.searchParams.get('layout'))){
  const scene=data.scenes.find(s=>s.id===requested.searchParams.get('scene'));
  if(scene){try{await applyScene(scene);requested.searchParams.delete('layout');requested.searchParams.delete('scene');history.replaceState(null,'',requested.href)}catch(error){E.notice('새 배치를 열지 못했습니다: '+error.message)}}
 }
 const database=await E.db();
 const backup=await new Promise((resolve,reject)=>{const tx=database.transaction('projects','readonly'),request=tx.objectStore('projects').get('group-style-library-v1-before-oil-v14');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});database.close();
 if(backup){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='교체 전 군집 스타일 백업 저장';b.onclick=()=>E.download(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),'제주_교체전_군집스타일_백업.json');panel.append(b)}
 for(const [id,text] of [['exhibitionBloomAll','모두 만개 PNG 보기'],['catalogSample','노을 정원 통합 시안 적용']]){const el=document.getElementById(id);if(el)el.textContent=text}
})();
