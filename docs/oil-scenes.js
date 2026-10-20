(async()=>{
 'use strict';
 const E=window.jejuEditor,data=window.jejuFinalCatalog;
 const panel=document.createElement('section');panel.style.cssText='padding:12px;border:1px solid #6da699;border-radius:10px;margin-bottom:12px;background:#173b32';
 const title=document.createElement('h3');title.textContent='유화 정원 v14 · 조명별 통합 구성';
 const note=document.createElement('p');note.className='note';note.textContent='동일한 PNG를 조립한 시안입니다. 꽃은 가까운 전경 두 줄에 배치했습니다. 전시 탭은 봉오리/만개 PNG 상태 미리보기이며 개화 영상은 포함하지 않습니다.';
 panel.append(title,note);
 for(const scene of data.scenes){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=scene.name;b.style.margin='3px';b.onclick=async()=>{b.disabled=true;try{await E.ready;await E.useSample(structuredClone(scene.project));E.notice(scene.name+' 정원을 열었습니다. 이전 배치는 저장본에 보관했습니다.')}catch(error){E.notice(error.message)}finally{b.disabled=false}};panel.append(b)}
 const link=document.createElement('a');link.className='btn';link.href='oil-gallery.html';link.target='_blank';link.rel='noopener';link.textContent='통합 시안 · PNG 다운로드';panel.append(link);
 document.getElementById('items').before(panel);
 await E.ready;
 await window.jejuHandoff.ready;
 const database=await E.db();
 const backup=await new Promise((resolve,reject)=>{const tx=database.transaction('projects','readonly'),request=tx.objectStore('projects').get('group-style-library-v1-before-oil-v14');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});database.close();
 if(backup){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='교체 전 군집 스타일 백업 저장';b.onclick=()=>E.download(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),'제주_교체전_군집스타일_백업.json');panel.append(b)}
 for(const [id,text] of [['exhibitionBloomAll','모두 만개 PNG 보기'],['catalogSample','노을 정원 통합 시안 적용']]){const el=document.getElementById(id);if(el)el.textContent=text}
})();
