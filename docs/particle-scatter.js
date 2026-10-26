(() => {
 'use strict';
 function findParticle(state,scenes){
  const scene=scenes.find(s=>s.project.background===state.background),placed=new Set(state.objects.map(o=>o.assetId));
  const particles=state.assets.filter(a=>a.category==='particle'&&a.src&&a.ready!==false);
  return particles.find(a=>a.theme===scene?.id&&placed.has(a.id))||particles.find(a=>a.theme===scene?.id)||particles.find(a=>placed.has(a.id))||particles.find(a=>!a.catalogHidden);
 }
 function createParticles(asset,width,height,uid,random=Math.random){
  if(!asset?.src||!(asset.width>0&&asset.height>0&&width>0&&height>0))throw Error('사용할 파티클 이미지 크기를 확인해 주세요.');
  const ratio=asset.width/asset.height,cellW=width/12,cellH=height/6,maxH=Math.min(cellH*.85,cellW*.85/ratio),groupId=uid();
  return Array.from({length:72},(_,i)=>{
   const h=maxH*(.38+.62*random()),w=h*ratio;
   return{id:uid(),assetId:asset.id,name:asset.name,x:(i%12)*cellW+(cellW-w)*random(),y:Math.floor(i/12)*cellH+(cellH-h)*random(),w,h,baseW:w,baseH:h,aspect:ratio,r:0,opacity:.35+.5*random(),motion:'stationary',groupId,groupName:'화면 전체 파티클'};
  });
 }
 if(typeof module==='object'&&module.exports){module.exports={createParticles,findParticle};return}
 const E=window.jejuEditor,button=document.getElementById('scatterParticles');if(!E||!button)return;
 button.addEventListener('click',async()=>{
  if(button.disabled)return;button.disabled=true;
  try{
   await E.ready;
   const state=E.state(),scenes=[62,61,60,59].flatMap(v=>window['jejuWhole'+v]?.scenes||[]),asset=findParticle(state,scenes);
   if(!asset)throw Error('파티클 소스가 없습니다. 최신 정원을 불러오거나 파티클 소스를 추가해 주세요.');
   await E.image(asset.src);
   if(E.state().background!==state.background)throw Error('배경이 변경되었습니다. 현재 배경에서 다시 눌러 주세요.');
   E.insert(createParticles(asset,E.W,E.H,E.uid),[]);
   E.notice('화면 전체에 파티클 72개를 추가했습니다. 선택된 입자의 크기·불투명도를 수정하거나 실행 취소로 되돌릴 수 있습니다.');
  }catch(error){E.notice(error.message||'파티클을 배치하지 못했습니다.')}
  finally{button.disabled=false}
 });
})();
