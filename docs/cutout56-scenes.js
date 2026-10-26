(async()=>{
 'use strict';
 const E=window.jejuEditor,data=window.jejuCutout56;if(!E||!data)return;
 const panel=document.createElement('section');panel.id='cutout56-scenes';panel.style.cssText='padding:14px;border:2px solid #b1d9ac;border-radius:10px;margin-bottom:12px;background:#234b3d';
 const title=document.createElement('h3');title.textContent='현재 통합본 그대로 · 원본 분리 v56';
 const note=document.createElement('p');note.className='note';note.textContent='통합본의 보이는 픽셀을 직접 분리했습니다. 꽃 군집·현무암·빛 입자·전경 연결부를 클릭해 이동·크기·겹침을 수정하세요. 겹친 꽃과 풀은 일부 함께 묶여 있으며, 가려진 바닥은 AI 복원본입니다. 선택 시 기존 작업을 백업합니다.';
 panel.append(title,note);
 async function open(scene){await E.ready;await E.useSample(structuredClone(scene.project));E.notice(scene.name+' · 원본 분리 배치를 열었습니다. 원래 배치로 돌아가려면 이 시간대 버튼을 다시 누르세요.')}
 for(const s of data.scenes){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=s.name+' · 원본 분리';b.style.margin='3px';b.onclick=async()=>{b.disabled=true;try{await open(s)}catch(e){E.notice(e.message)}finally{b.disabled=false}};panel.append(b)}
 const a=document.createElement('a');a.className='btn';a.href='source-cutouts.html';a.target='_blank';a.rel='noopener';a.textContent='원본·레이어 비교 / PNG·Unity ZIP';panel.append(a);
 if(!window.jejuCutout57||new URL(location.href).searchParams.get('layers')==='56')document.getElementById('items').parentElement.prepend(panel);
 await E.ready;await window.jejuHandoff.ready;
 const u=new URL(location.href);
 if(u.searchParams.get('layers')==='56'){
  const s=data.scenes.find(s=>s.id===u.searchParams.get('scene'));
  if(s)try{await open(s);u.searchParams.delete('layers');u.searchParams.delete('scene');history.replaceState(null,'',u.href)}catch(e){E.notice('기존 작업을 보호하기 위해 불러오기를 중단했습니다: '+e.message)}
 }
})();
