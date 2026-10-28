(()=>{'use strict';
 const root=document.createElement('section');root.id='environment88';document.querySelector('#sections').before(root);const status=document.createElement('p');status.textContent='배경과 분리 환경 루프를 불러오는 중…';root.append(status);
 fetch('assets/separated-loops-v88/manifest.json?v=88').then(r=>{if(!r.ok)throw Error('분리 루프 목록을 불러오지 못했습니다.');return r.json()}).then(data=>{
  window.jejuSeparatedMotion.validate(data);status.textContent='배경 4종 · 풀·잎·나무 12종 · 고정 현무암 4종 · 기존 구름·나비·빛 12종. 원본 PNG를 보존한 분리 루프입니다.';
  const labels={grass:'풀',leaf:'잎 가지',tree:'나무',basalt:'현무암 · 고정'};
  for(const[type,title,items]of[['background','배경만 · 60초 루프',data.backgrounds],['environment','풀·잎·나무·현무암 · 4초 루프',data.environment]]){
   const heading=document.createElement('h2'),grid=document.createElement('div');heading.textContent=title;grid.className='grid';root.append(heading,grid);
   for(const a of items){const card=document.createElement('article'),preview=document.createElement('div'),video=document.createElement('video'),info=document.createElement('div'),name=document.createElement('h3'),note=document.createElement('p');card.className='card';card.id='loop-'+a.id;preview.className='preview';info.className='info';name.textContent=a.name;video.controls=true;video.loop=true;video.muted=true;video.playsInline=true;video.preload='none';video.src=type==='background'?a.video:a.loopVideo;video.poster=type==='background'?`assets/web-v87/BG0${['sunset','day','night','morning'].indexOf(a.id)+1}-B04-V05.webp`:'assets/web-v87/'+a.id+'.webp';if(type==='background'){preview.style.background='#10271f';video.style.aspectRatio='3/1'}video.setAttribute('aria-label',a.name+' 분리 루프');note.textContent=type==='background'?'1440×480 · 24fps · 60초 · 고정 카메라':labels[a.category]+' · 480×480 · 24fps · PNG 알파 96장'+(a.category==='basalt'?' · 움직임 없이 고정':' · 밑동 고정');preview.append(video);info.append(name,note);
    const links=type==='background'?[['배경 MP4',a.video],['배경 PNG',a.sourcePNG],['레이어로 보기','layered-garden.html?v=20261028-v89r1&theme='+a.id]]:[['투명 WebM',a.loopVideo],['단색 키 MP4',a.keyVideo],['PNG 알파 ZIP',a.sequenceZip],['PNG 원본',a.sourcePNG]];
    for(const[text,url]of links){const link=document.createElement('a');link.textContent=text;link.href=url;link.target='_blank';link.rel='noopener';if(url===a.video||url===a.loopVideo||url===a.keyVideo){const stem='ML_'+a.backgroundId+'_'+a.lightingId+'_'+(type==='background'?'Background_60s':a.category+'_Loop')+'_480p_v88';link.download=stem+(url===a.loopVideo?'_alpha.webm':url===a.keyVideo?'_key.mp4':'.mp4')}info.append(link)}card.append(preview,info);grid.append(card);
   }
  }
 }).catch(error=>{status.textContent=error.message;status.style.color='#ffccaa'});
})();
