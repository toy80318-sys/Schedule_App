(async()=>{
 'use strict';
 const E=window.jejuEditor,data=window.jejuWhole59;if(!E||!data||(window.jejuWhole60&&new URL(location.href).searchParams.get('objects')!=='59'))return;
 
 function unchanged(state,scene){
  if(!state||state.background!==scene.project.background||state.objects.length!==scene.project.objects.length||state.gardenSpace?.enabled!==false)return false;
  const assetMap=new Map(state.assets.map(a=>[a.id,a]));
  if(!scene.project.objects.every((base,i)=>{const o=state.objects[i];return o?.assetId===base.assetId&&['x','y','w','h','r','opacity','z'].every(k=>Math.abs((o[k]||0)-(base[k]||0))<1e-6)&&!o.flipX&&!o.rx&&!o.ry&&!o.groupId&&!o.flowerColor&&assetMap.get(o.assetId)?.src===scene.assets.find(a=>a.id===o.assetId)?.src}))return false;
  return ['scene','background','flowers','decor'].every(scope=>['brightness','contrast','saturation','warmth'].every(k=>(state.sceneFilters?.[scope]?.[k]??(k==='warmth'?0:100))===(k==='warmth'?0:100)))&&(!state.sceneFilters?.backgroundGrade||window.jejuBackgroundGrade.neutral(state.sceneFilters.backgroundGrade));
 }
 const panel=document.createElement('section');panel.id='whole59-scenes';panel.className='precision-scenes';panel.setAttribute('aria-label','완성형 객체 정원');
 panel.style.cssText='position:absolute;top:62px;left:12px;right:12px;z-index:5;display:flex;align-items:center;gap:6px;overflow-x:auto;padding:6px 9px;background:#18392fef;border:1px solid #8eb6a3;border-radius:9px';
 const title=document.createElement('strong');title.textContent='완성형 객체 정원';title.style.whiteSpace='nowrap';panel.append(title);
 const buttons=[],status=document.createElement('output');status.setAttribute('role','status');status.style.cssText='font-size:12px;white-space:nowrap;color:#c0dacb';let opening=false;
 function sync(){const state=E.state?.();if(!state)return;const scene=data.scenes.find(s=>s.project.background===state.background);for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.scene===scene?.id));const registered=state.objects.length>0&&state.objects.every(o=>/^whole59-/.test(o.assetId));for(const id of ['clusterTheme','clusterCount','autoCluster']){const el=document.getElementById(id);if(el){el.hidden=registered;el.style.display=registered?'none':''}}if(!opening)status.textContent=scene?scene.name+' · 원본 PNG · '+state.objects.length+'개 레이어':'기존 작업 보존 · 시간대를 누르면 백업 후 완성형 객체 정원을 엽니다.'}
 async function open(scene){
  if(opening)return;opening=true;buttons.forEach(b=>b.disabled=true);status.textContent='기존 작업 백업 · 완성형 객체 불러오는 중…';
  try{await E.ready;await E.useSample(structuredClone(scene.project));E.setGuides?.(false);await Promise.all([...document.querySelectorAll('#wall .bg,#wall .obj>img')].map(im=>im.decode()));E.notice(scene.name+' · 완성형 독립 객체의 조명·크기·앞뒤 배치를 적용했습니다. 이전 작업은 저장본에 보관했습니다.')}
  finally{opening=false;buttons.forEach(b=>b.disabled=false);sync()}
 }
 for(const s of data.scenes){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=s.name.split(' · ')[0]+' 완성형';b.dataset.scene=s.id;b.onclick=()=>open(s).catch(e=>E.notice(e.message));buttons.push(b);panel.append(b)}
 const link=document.createElement('a');link.className='btn';link.href='source-cutouts.html';link.target='_blank';link.rel='noopener';link.textContent='객체별 PNG·Unity';panel.append(link,status);document.getElementById('view').parentElement.append(panel);
 document.addEventListener('jeju-editor-change',sync);
 await E.ready;await window.jejuHandoff.ready;
 const u=new URL(location.href);
 if(u.searchParams.get('objects')==='59'){
  const s=data.scenes.find(s=>s.id===u.searchParams.get('scene'));
  if(s)try{await open(s);u.searchParams.delete('objects');u.searchParams.delete('scene');history.replaceState(null,'',u.href)}catch(e){E.notice('기존 작업을 보호하기 위해 불러오기를 중단했습니다: '+e.message)}
 }else if(!u.searchParams.has('layers')&&!u.searchParams.has('objects')&&!u.searchParams.has('layout')){
  // Upgrade only untouched previous cutouts; the existing backup path protects all saved work.
  const old=[...(window.jejuCutout57?.scenes||[]),...(window.jejuCutout56?.scenes||[])].find(s=>unchanged(E.state?.(),s));
  if(old)try{await open(data.scenes.find(s=>s.id===old.id))}catch(e){E.notice('이전 배치를 유지했습니다: '+e.message)}
 }
 if(E.state?.().objects.every(o=>/^whole59-/.test(o.assetId)))E.setGuides?.(false);sync();
})();
