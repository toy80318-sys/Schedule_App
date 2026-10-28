(()=>{'use strict';
 const root=document.createElement('section');root.id='environment88';document.querySelector('#sections').before(root);const status=document.createElement('p');status.textContent='배경 영상과 환경 이미지를 불러오는 중…';root.append(status);
 fetch('assets/separated-loops-v88/manifest.json?v=static106').then(r=>{if(!r.ok)throw Error('배경과 환경 목록을 불러오지 못했습니다.');return r.json()}).then(data=>{
  window.jejuSeparatedMotion.validate(data);const environment=data.environment.filter(a=>!window.jejuAmbient.isRetired({id:a.id,src:a.sourcePNG,sha256:a.sourceSHA256}));status.textContent='배경 영상 4종 · 풀·현무암 정지 PNG 8종 · 빛 파티클 영상 4종';
  const labels={grass:'풀',tree:'나무',basalt:'현무암'};
  for(const[type,title,items]of [['background','배경만 · 60초 루프',data.backgrounds],['environment','풀·현무암 · 원본 정지 PNG',environment]]){
   const heading=document.createElement('h2'),grid=document.createElement('div');heading.textContent=title;grid.className='grid';root.append(heading,grid);
   for(const a of items){
    const card=document.createElement('article'),preview=document.createElement('div'),media=document.createElement(type==='background'?'video':'img'),info=document.createElement('div'),name=document.createElement('h3'),note=document.createElement('p');card.className='card';card.id='loop-'+a.id;preview.className='preview';info.className='info';name.textContent=a.name;
    if(type==='background'){media.controls=true;media.loop=true;media.muted=true;media.playsInline=true;media.preload='none';media.src=a.video;media.poster=`assets/web-v87/BG0${['sunset','day','night','morning'].indexOf(a.id)+1}-B04-V05.webp`;preview.style.background='#10271f';media.style.aspectRatio='3/1';media.setAttribute('aria-label',a.name+' 배경 루프');note.textContent='1440×480 · 24fps · 60초 · 고정 카메라'}
    else{media.src=a.image||a.sourcePNG;media.alt=a.name+' 원본 정지 이미지';media.loading='lazy';note.textContent=labels[a.category]+' · 1254×1254 · 원본 투명 PNG 1장'}
    preview.append(media);info.append(name,note);
    const links=type==='background'?[['배경 MP4',a.video],['배경 PNG',a.sourcePNG],['레이어로 보기','layered-garden.html?v=static106&theme='+a.id]]:[['PNG 다운로드',a.image||a.sourcePNG],['원본 PNG 보기',a.sourcePNG]];
    for(const[text,url]of links){const link=document.createElement('a');link.textContent=text;link.href=url;link.target='_blank';link.rel='noopener';if(text==='PNG 다운로드')link.download=a.id+'.png';else if(url===a.video)link.download='ML_'+a.backgroundId+'_'+a.lightingId+'_Background_60s_480p_v88.mp4';info.append(link)}card.append(preview,info);grid.append(card);
   }
  }
 }).catch(error=>{status.textContent=error.message;status.style.color='#ffccaa'});
})();
