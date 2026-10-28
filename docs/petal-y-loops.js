(function(root){
 'use strict';
 const themes=[['sunset','노을 · 코랄'],['day','낮 · 골드'],['night','달빛 · 라일락'],['morning','아침 · 스카이블루']];
 function safePath(value){return typeof value==='string'&&value.length>0&&value.length<600&&!value.startsWith('/')&&!value.includes('\\')&&!value.split('/').includes('..')&&!/[<>%?#\x00-\x20]/.test(value)&&(!value.includes(':')||/^https:\/\/raw\.githubusercontent\.com\/toy80318-sys\/Schedule_App\/main\/source-assets\/flower-petals-v90\/[\w.-]+\.png$/.test(value))}
 function validate(data){
  if(data?.format!=='jeju-petal-y-loops-v102'||data.version!==102||data.count!==48||!Array.isArray(data.items)||data.items.length!==48||new Set(data.items.map(a=>a.id)).size!==48)throw Error('꽃잎 목록이 올바르지 않습니다.');
  if(data.width!==480||data.height!==480||data.fps!==30||data.seconds!==5||data.frameCount!==150||data.rotationAxis!=='Y')throw Error('꽃잎 회전 규격이 다릅니다.');
  for(const [theme]of themes)if(data.items.filter(a=>a.theme===theme).length!==12)throw Error('시간대별 꽃잎 목록이 다릅니다.');
  for(const a of data.items){if(!/^[\w-]+$/.test(a.id)||typeof a.name!=='string'||!themes.some(t=>t[0]===a.theme)||!/^[a-f\d]{64}$/.test(a.sourcePetalSHA256)||!/^#[a-f\d]{6}$/i.test(a.keyColor))throw Error('꽃잎 정보가 올바르지 않습니다.');for(const key of ['alphaVideo','keyVideo','poster','contact','originalPNG'])if(!safePath(a[key]))throw Error('꽃잎 파일 경로가 올바르지 않습니다.');if(!a.alphaVideo.endsWith('.webm')||!a.keyVideo.endsWith('.mp4')||!a.poster.endsWith('.png')||!a.originalPNG.endsWith('.png')||a.sourceUnchanged!==true||a.periodClosureExact!==true||a.encodedAlphaChecked!==true)throw Error('검증된 꽃잎 영상이 아닙니다.');}
  if(data.packageZip&&!safePath(data.packageZip))throw Error('전체 파일 경로가 올바르지 않습니다.');return data;
 }
 if(typeof module==='object'&&module.exports)module.exports={validate,safePath};
 if(!root.document)return;
 const $=id=>document.getElementById(id),cards=$('loopCards'),status=$('loopStatus'),tabs=$('themeTabs');let current=null,theme='sunset',manifest;
 function stop(){for(const v of cards.querySelectorAll('video'))v.pause();current=null;for(const b of cards.querySelectorAll('.play'))b.textContent='회전 재생';}
 function visible(video){const r=video.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const e of entries)if(!e.isIntersecting&&e.target===current)stop();},{threshold:.15}):null;
 function play(video,button){if(!visible(video))return;stop();current=video;button.textContent='일시 정지';video.play().catch(()=>{button.textContent='회전 재생';status.textContent='재생 버튼을 한 번 더 눌러 주세요.';});}
 function link(label,href){const a=document.createElement('a');a.textContent=label;a.href=href;a.download='';return a;}
 function show(value,focus=false){
  theme=value;stop();observer?.disconnect();cards.replaceChildren();
  for(const b of tabs.children){const selected=b.dataset.theme===theme;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;if(selected){$('themePanel').setAttribute('aria-labelledby',b.id);if(focus)b.focus();}}
  const items=manifest.items.filter(a=>a.theme===theme);status.textContent=themes.find(t=>t[0]===theme)[1]+' · '+items.length+'종 · 5초 반복';
  for(const a of items){
   const article=document.createElement('article'),preview=document.createElement('div'),video=document.createElement('video'),heading=document.createElement('h2'),button=document.createElement('button'),links=document.createElement('div'),meta=document.createElement('p'),details=document.createElement('details'),summary=document.createElement('summary');
   article.className='card';preview.className='preview';video.loop=true;video.muted=true;video.playsInline=true;video.preload='none';video.src=a.alphaVideo;video.poster=a.poster;video.setAttribute('aria-label',a.name+' Y축 회전 영상');video.controls=true;
   button.type='button';button.className='play';button.textContent='회전 재생';button.setAttribute('aria-label',a.name+' 회전 재생');button.onclick=()=>{if(current===video&&!video.paused)stop();else play(video,button);};
   video.addEventListener('play',()=>{for(const other of cards.querySelectorAll('video'))if(other!==video)other.pause();current=video;for(const b of cards.querySelectorAll('.play'))b.textContent=b===button?'일시 정지':'회전 재생';});video.addEventListener('pause',()=>{button.textContent='회전 재생';});
   heading.textContent=a.name;meta.className='meta';meta.textContent='480×480 · 5초 · Y축 한 바퀴';links.className='links';links.append(link('투명 영상',a.alphaVideo),link('보색 MP4',a.keyVideo),link('원본 PNG',a.originalPNG));summary.textContent='파일 정보';details.append(summary,document.createTextNode(a.backgroundId+' / '+a.lightingId+' · 보색 '+a.keyColor+' · 원본 '+a.sourcePetalSHA256.slice(0,12)));
   const contact=link('회전 단계 보기',a.contact);contact.removeAttribute('download');contact.target='_blank';contact.rel='noopener';details.append(document.createElement('br'),contact);preview.append(video);article.append(preview,heading,meta,button,links,details);cards.append(article);observer?.observe(video);
  }
  const url=new URL(location.href);url.searchParams.set('theme',theme);if(location.protocol!=='file:')history.replaceState(null,'',url);
 }
 $('stopAll').onclick=stop;$('backdrop').onchange=event=>{document.body.dataset.backdrop=event.target.value;};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 const embedded=$('petalYData').textContent.trim();Promise.resolve().then(()=>embedded?JSON.parse(embedded):fetch('assets/petal-y-loops-v102/manifest.json?v=102').then(r=>{if(!r.ok)throw Error('꽃잎 회전 목록을 불러오지 못했습니다.');return r.json();})).then(validate).then(data=>{
  manifest=data;
  for(const [value,name]of themes){const b=document.createElement('button');b.type='button';b.id='theme_'+value;b.dataset.theme=value;b.setAttribute('role','tab');b.setAttribute('aria-controls','themePanel');b.textContent=name+' · 12종';b.onclick=()=>show(value);b.onkeydown=e=>{const index=themes.findIndex(t=>t[0]===theme),next=e.key==='ArrowRight'?(index+1)%4:e.key==='ArrowLeft'?(index+3)%4:e.key==='Home'?0:e.key==='End'?3:null;if(next!==null){e.preventDefault();show(themes[next][0],true);}};tabs.append(b);}
  if(data.packageZip){$('packageDownload').href=data.packageZip;$('packageDownload').hidden=false;}const requested=new URL(location.href).searchParams.get('theme');show(themes.some(t=>t[0]===requested)?requested:'sunset');
 }).catch(error=>{status.textContent=error.message;status.className='error';});
})(typeof window==='object'?window:globalThis);
