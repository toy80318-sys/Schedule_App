(()=>{
 'use strict';const E=window.jejuEditor,catalog=window.jejuFlowerShapeCatalog;if(!E||!catalog)return;
 const controls=[];
 for(const target of [document.querySelector('#proceduralTools .pcg-actions'),document.getElementById('varyFlowerDirections')?.parentElement]){
  if(!target)continue;const button=document.createElement('button');button.className='btn';button.type='button';button.dataset.flowerShapes='';button.disabled=true;button.onclick=async()=>{controls.forEach(b=>b.disabled=true);try{await E.varyFlowerShapes()}catch(error){E.notice(error.message)}finally{controls.forEach(b=>b.disabled=false)}};target.append(button);controls.push(button);
 }
 const link=document.createElement('a');link.className='btn';link.href='flower-shapes.html';link.target='_blank';link.rel='noopener';link.textContent='새 형태 12종 · 원본 비교';document.querySelector('#proceduralTools .pcg-actions')?.after(link);
 function sync(){const count=E.selected().length;for(const b of controls)b.textContent=(count?'선택한':'전체')+' 꽃 형태·방향 섞기'}
 document.addEventListener('jeju-editor-change',sync);E.ready.then(()=>{sync();controls.forEach(b=>b.disabled=false)});
 const toolbar=document.getElementById('sourceDownloadToolbar'),button=document.createElement('button'),status=document.createElement('output');button.className='btn';button.textContent='새 꽃 형태 12종 ZIP';button.type='button';status.setAttribute('aria-live','polite');
 button.onclick=async()=>{button.disabled=true;try{await E.ready;const blob=await window.jejuSourceDownload.packageSources(catalog.assets,fetch.bind(window),window.jejuHandoff.zip,(n,total)=>status.textContent=`원본 확인 ${n}/${total}`,window.crypto);E.download(blob,'Mazeland_FlowerShapes12_OriginalPNG_v80.zip');status.textContent='새 형태 12종 ZIP 완료'}catch(error){status.textContent='실패 · '+error.message;E.notice(error.message)}finally{button.disabled=false}};
 toolbar?.prepend(button,status);
})();
