((root)=>{'use strict';
 const RAW='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/',HASH=/^[a-f0-9]{64}$/;
 function validate(data){
  if(data?.format!=='jeju-petal-y-runtime-v102'||data.version!==102||data.count!==48||data.width!==480||data.height!==480||data.fps!==30||data.seconds!==5||data.frameCount!==150||data.rotationAxis!=='Y'||data.sampleSize!==128||data.items?.length!==48)throw Error('꽃잎 회전 재생 목록이 다릅니다.');
  const ids=new Set();
  for(const row of data.items){
   const match=/^(BG0[1-4])-(buckwheat|camellia|marigold|canola|hydrangea|lavender)-scene-([a-d])-v83$/.exec(row.id||'');
   if(!match||ids.has(row.id)||!({BG01:['buckwheat','camellia','marigold'],BG02:['buckwheat','canola','marigold'],BG03:['camellia','hydrangea','lavender'],BG04:['buckwheat','hydrangea','lavender']})[match[1]].includes(match[2]))throw Error('꽃잎 회전 식별자가 다릅니다.');
   const [,bg,species,shape]=match,path=`assets/petal-y-loops-v102/${row.id}/alpha.webm`,source=`${RAW}source-assets/scene-flowers-v83/ML_${bg}_${bg.replace('BG','LT')}_${species}_Shape${shape.toUpperCase()}_SceneOil_Bloom_v83.png`;
   if(row.sourcePNG!==source||![row.sourceSHA256,row.sourcePetalSHA256,row.videoSHA256].every(v=>HASH.test(v))||!Number.isFinite(row.drawScale)||row.drawScale<1||row.drawScale>2.5||!['', 'https://toy80318-sys.github.io/Schedule_App/',RAW+'docs/'].some(base=>row.alphaVideo===base+path))throw Error('꽃잎 원본과 회전 영상의 연결이 다릅니다.');
   ids.add(row.id);
  }
  for(let i=1;i<=4;i++)if(data.items.filter(a=>a.id.startsWith('BG0'+i+'-')).length!==12)throw Error('시간대별 꽃잎 회전 목록이 다릅니다.');
  return data;
 }
 function create(data){
  const rows=new Map(validate(data).items.map(row=>[row.id,{...row}])),records=new Map();let active=false,draws=0,frameDraws=0,lastId='',lastTime=0,lastFrame=-1;
  const pause=record=>{try{record.video?.pause()}catch{}};
  function release(record){record.disposed=true;pause(record);const video=record.video;if(video){video.onloadeddata=video.onerror=null;video.removeAttribute?.('src');try{video.load?.()}catch{}}if(record.canvas)record.canvas.width=record.canvas.height=1;record.video=record.canvas=record.context=null;}
  function fail(record){record.failed=true;release(record);}
  function play(record){
   const video=record.video;if(!active||!record.used||record.failed||record.disposed||record.blocked||record.pending||!video||!video.paused)return;
   record.pending=true;
   try{Promise.resolve(video.play()).then(()=>{record.pending=false;if(record.disposed||!active||!record.used)pause(record)},error=>{record.pending=false;if(!record.disposed){record.blocked=active&&record.used&&error?.name!=='AbortError';pause(record)}})}catch{record.pending=false;record.blocked=true;pause(record)}
  }
  function prepare(record){
   if(record.video||record.failed)return;
   try{
    const video=root.document.createElement('video');
    if(typeof video.canPlayType!=='function'||!video.canPlayType('video/webm; codecs="vp9"')){record.failed=true;return}
    record.video=video;video.crossOrigin='anonymous';video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';
    video.onloadeddata=()=>{if(!record.disposed)play(record)};video.onerror=()=>{if(!record.disposed)fail(record)};video.src=record.row.alphaVideo;video.load?.();play(record);
   }catch{fail(record)}
  }
  function register(asset,petal){
   const row=rows.get(asset?.id);
   if(!row||asset.src!==row.sourcePNG||asset.sha256!==row.sourceSHA256||petal?.id!==row.id||petal.sourcePNG!==row.sourcePNG||petal.sourceSHA256!==row.sourceSHA256||petal.sha256!==row.sourcePetalSHA256)return false;
   if(!records.has(row.id))records.set(row.id,{row,video:null,canvas:null,context:null,failed:false,disposed:false,blocked:false,pending:false,used:false,sampled:-1});return true;
  }
  function draw(ctx,id,fallback,x,y,w,h){
   const record=records.get(id);let image=null;
   if(record&&active&&!record.failed){
    record.used=true;prepare(record);play(record);const video=record.video;
    if(video?.readyState>=2){
     if(video.videoWidth!==480||video.videoHeight!==480||!Number.isFinite(video.duration)||Math.abs(video.duration-5)>.05)fail(record);
     else try{
      const frame=Math.floor(Math.max(0,video.currentTime)*30)%150;
      if(!record.canvas){record.canvas=root.document.createElement('canvas');record.canvas.width=record.canvas.height=128;record.context=record.canvas.getContext('2d');}
      if(!record.context)fail(record);
      else{if(record.sampled!==frame){record.context.clearRect(0,0,128,128);record.context.drawImage(video,0,0,128,128);if(record.sampled<0&&record.context.getImageData(0,0,1,1).data[3]!==0)throw Error('Video alpha is unavailable');record.sampled=frame}image=record.canvas;lastId=id;lastTime=video.currentTime;lastFrame=frame;}
     }catch{fail(record)}
    }
   }
   if(image){const scale=record.row.drawScale;ctx.drawImage(image,x+w*(1-scale)/2,y+h*(1-scale)/2,w*scale,h*scale);draws++;frameDraws++;return true}
   if(fallback)ctx.drawImage(fallback,x,y,w,h);return false;
  }
  function setActive(value){active=value===true;for(const record of records.values()){if(active){record.blocked=false;play(record)}else pause(record)}}
  function beginFrame(){frameDraws=0;for(const record of records.values())record.used=false}
  function endFrame(){for(const record of records.values())if(active&&record.used)play(record);else pause(record)}
  function clear(){for(const record of records.values())release(record);records.clear();draws=frameDraws=0;lastId='';lastTime=0;lastFrame=-1;}
  function stats(){const list=[...records.values()],ready=list.filter(r=>r.video?.readyState>=2&&!r.failed);return{registered:records.size,instances:list.filter(r=>r.video).length,ready:ready.length,playing:ready.filter(r=>!r.video.paused).length,failed:list.filter(r=>r.failed).length,draws,frameDraws,lastId,lastTime,lastFrame}}
  return{register,draw,beginFrame,endFrame,setActive,clear,stats};
 }
 const api={validate,create};if(typeof module==='object'&&module.exports)module.exports=api;root.jejuPetalY=api;
})(typeof window==='object'?window:globalThis);
