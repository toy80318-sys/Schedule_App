((root)=>{'use strict';
 const kinds=['grass','leaf','tree','basalt'],ambient=typeof module==='object'&&module.exports?require('./ambient-policy'):null;
 const staticAsset=a=>(ambient||root.jejuAmbient).staticSeparatedAsset(a);
 function validate(data){
  if(data?.format!=='mazeland-separated-loops-v88'||data.version!==88||data.environment?.length!==16||data.backgrounds?.length!==4)throw Error('분리 루프 목록이 올바르지 않습니다.');
  const still=data.environmentMode==='static-image';if(data.environmentMode&&!still)throw Error('분리 요소의 이미지 형식이 다릅니다.');
  const ids=new Set();for(const a of data.environment){
   const id=/^BG0([1-4])-E0([1256])-V05$/.exec(a.id),valid=id&&a.theme===['sunset','day','night','morning'][Number(id[1])-1]&&a.category===({1:'grass',2:'tree',5:'basalt',6:'leaf'})[id[2]];
   const fields=['frames','previewFrames','previewWidth','previewHeight','fps','duration','loopWidth','loopHeight','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','motion','rootAnchor','seamCheck','visualReview','alphaQA','alphaWebM_SHA256','keyMP4_SHA256','sequenceSHA256','qa'];
   const format=still?a.kind==='image'&&a.stillOnly===true&&a.frameCount===1&&a.width===1254&&a.height===1254&&a.image===`assets/separated-loops-v88/${a.id}/still.png`&&a.sha256===a.sourceSHA256&&a.sourcePNG===`https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/${a.id}.png`&&!fields.some(key=>Object.hasOwn(a,key)):a.fps===24&&a.duration===4&&a.width===480&&a.height===480&&a.frames?.length===96&&a.frames.every((src,i)=>src===`assets/separated-loops-v88/${a.id}/frame_${String(i).padStart(4,'0')}.webp`)&&a.loopVideo===`assets/separated-loops-v88/${a.id}/alpha.webm`&&a.keyVideo===`assets/separated-loops-v88/${a.id}/key.mp4`;
   if(ids.has(a.id)||!valid||!format||!/^[a-f0-9]{64}$/.test(a.sourceSHA256))throw Error('분리 요소의 번호·규격·경로가 다릅니다.');ids.add(a.id);
  }
  const themes=new Set();for(const b of data.backgrounds){if(!['sunset','day','night','morning'].includes(b.id)||themes.has(b.id)||b.video!==`assets/separated-loops-v88/${b.id}/background.mp4`||b.duration!==60||b.fps!==24)throw Error('배경 루프 정보가 다릅니다.');themes.add(b.id)}return data;
 }
 function asset(a,data){const value=staticAsset(a),m=data.environment.find(m=>m.id===a.id);if(!m)return{...value};if(value.src!==m.sourcePNG||value.sha256!==m.sourceSHA256||value.theme!==m.theme||value.category!==m.category)throw Error('원본과 조명이 같은 요소에만 연결할 수 있습니다.');return value;}
 function staticBackground(source,data){if(typeof source!=='string')return source;const path=source.split(/[?#]/)[0],bg=data.backgrounds.find(b=>path===b.video||path.endsWith('/'+b.video));return bg?bg.sourcePNG:source;}
 function project(input,data,useVideo=false,particles=[]){validate(data);const p=JSON.parse(JSON.stringify(input));p.assets=p.assets.map(a=>asset(a,data));const bg=data.backgrounds.find(b=>b.sourcePNG===p.background);if(useVideo&&bg){p.backgroundOriginal=p.background;p.background=bg.video;p.backgroundLoop=bg.video;p.backgroundPlaylist=[bg.video];p.backgroundFit='fill'}
  const lights=particles.filter(a=>a.category==='particle'&&a.completeObject).slice(0,4);if(lights.length&&!p.objects.some(o=>o.groupId==='separated88-lights')){for(const a of lights)if(!p.assets.some(v=>v.id===a.id))p.assets.push(JSON.parse(JSON.stringify(a)));for(let i=0;i<14;i++){const a=lights[i%lights.length],w=p.height*(.025+.007*(i%3));p.objects.push({id:'separated88-light-'+i,assetId:a.id,name:a.name,x:((i*.618+.08)%.9+.05)*p.width-w/2,y:(.1+(i%5)*.08)*p.height,w,h:w,baseW:w,baseH:w,aspect:1,r:0,opacity:.55+.1*(i%3),motion:'stationary',groupId:'separated88-lights',groupName:'분리 루프 · 빛 입자'})}}
  p.oilAssetVersion=14;return p;}
 const api={validate,asset,project,staticBackground};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuSeparatedMotion=api;
})(typeof window==='object'?window:globalThis);
