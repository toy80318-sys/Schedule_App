(async()=>{
 'use strict';
 const E=window.jejuEditor,data=window.jejuLayer55;if(!E||!data)return;
 const panel=document.createElement('section');panel.id='layer55-scenes';panel.style.cssText='padding:12px;border:1px solid #a9c9a4;border-radius:10px;margin-bottom:12px;background:#203e35';
 const title=document.createElement('h3');title.textContent='이전 v55 · 새 꽃으로 재구성한 배치';
 const note=document.createElement('p');note.className='note';note.textContent='개별 꽃·풀·현무암·공중 입자·발광 유리 나비를 실제 레이어로 쌓습니다. 선택하면 현재 작업을 백업하고 새 배치를 엽니다. 꽃·나비는 정지 이미지입니다. 개별 요소는 빈 곳을 눌러 선택을 해제한 뒤 Ctrl/⌘+클릭으로 선택할 수 있습니다.';
 panel.append(title,note);
 async function open(scene){await E.ready;await E.useSample(structuredClone(scene.project));E.notice(scene.name+' · v55 분리 PNG 배치. 기존 작업은 저장본에 보관했습니다.')}
 for(const scene of data.scenes){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=scene.name+' · v55';b.style.margin='3px';b.onclick=async()=>{b.disabled=true;try{await open(scene)}catch(error){E.notice(error.message)}finally{b.disabled=false}};panel.append(b)}
 const link=document.createElement('a');link.className='btn';link.href='layers-v55.html';link.target='_blank';link.rel='noopener';link.textContent='분리 소스·합성 비교·Unity ZIP';panel.append(link);
 const host=document.getElementById('items');if(!window.jejuCutout56||new URL(location.href).searchParams.get('layers')==='55')host.parentElement.prepend(panel);
 await E.ready;await window.jejuHandoff.ready;
 const requested=new URL(location.href);
 if(requested.searchParams.get('layers')==='55'){
  const scene=data.scenes.find(s=>s.id===requested.searchParams.get('scene'));
  if(scene)try{await open(scene);requested.searchParams.delete('layers');requested.searchParams.delete('scene');history.replaceState(null,'',requested.href)}catch(error){E.notice('현재 배치를 보호하기 위해 새 배치를 열지 않았습니다: '+error.message)}
 }
})();
