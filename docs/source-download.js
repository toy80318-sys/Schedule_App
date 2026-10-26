((root)=>{
 'use strict';
 function entries(catalog,newOnly=false){
  const items=catalog.assets.filter(a=>!a.catalogHidden&&!a.referenceOnly&&(!newOnly||a.imageStyleVersion===68)),seen=new Set();
  return items.filter(a=>{if(seen.has(a.src))return false;seen.add(a.src);return true}).map(a=>{
   const url=new URL(a.src);
   if(!/^[A-Za-z0-9_.-]+\.png$/i.test(a.file)||!/^[a-f0-9]{64}$/i.test(a.sha256)||url.protocol!=='https:'||url.username||url.password||!['raw.githubusercontent.com','lixkizqprsbnsnozwbpa.supabase.co'].includes(url.hostname))throw Error('원본 PNG 목록이 올바르지 않습니다.');
   return a;
  });
 }
 async function packageSources(items,fetcher,zip,progress,cryptoAPI){
  if(!items.length)throw Error('내려받을 원본이 없습니다.');
  const files=new Array(items.length),controller=new AbortController();let cursor=0,completed=0,total=0;
  async function read(a){
   for(let attempt=0;attempt<3;attempt++){
    try{const url=new URL(a.src);if(attempt)url.searchParams.set('sourceRetry',a.sha256.slice(0,12)+'-'+attempt);const response=await fetcher(url.href,{signal:controller.signal,cache:'no-store'});if(response.ok)return new Uint8Array(await response.arrayBuffer());if(response.status!==429&&response.status<500)throw Object.assign(Error('HTTP '+response.status),{permanent:true});throw Error('HTTP '+response.status)}
    catch(error){if(error.permanent||controller.signal.aborted||attempt===2)throw Error(a.file+' 다운로드 실패: '+error.message);await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)))}
   }
  }
  try{await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{
   while(cursor<items.length){const i=cursor++,a=items[i],bytes=await read(a);total+=bytes.length;
    if(total>750*1024*1024)throw Error('원본 용량이 너무 큽니다. 새 이미지 ZIP으로 나누어 받아 주세요.');
    if(![137,80,78,71,13,10,26,10].every((v,k)=>bytes[k]===v))throw Error(a.file+' PNG 형식 오류');
    const hash=Array.from(new Uint8Array(await cryptoAPI.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
    if(hash!==a.sha256)throw Error(a.file+' 원본 검증 실패');
    files[i]={name:'PNG/'+a.file,bytes};progress(++completed,items.length);
   }
  }))}catch(error){controller.abort();throw error}
  const manifest={format:'jeju-source-png-v1',version:70,generatedAt:new Date().toISOString(),count:items.length,assets:items.map(a=>({id:a.id,name:a.name,file:'PNG/'+a.file,backgroundId:a.backgroundId,lightingId:a.lightingId,theme:a.theme,group:a.group,species:a.species,width:a.width,height:a.height,transparent:a.transparent,sha256:a.sha256,source:a.src,stillOnly:a.stillOnly}))};
  files.push({name:'sources.json',bytes:new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'})},{name:'README.txt',bytes:new Blob(['제주 메이즈랜드 원본 PNG\nPNG 폴더에 원본을 모았습니다. 파일명의 BG는 배경, LT는 조명입니다.\nsources.json에서 종류·해상도·배경·조명·원본 해시를 확인하세요.\n이 ZIP은 정지 이미지 원본이며 편집 배치나 새 개화 영상을 포함하지 않습니다.\n'])});
  return zip(files);
 }
 const api={entries,packageSources};if(typeof module==='object'&&module.exports){module.exports=api;return}root.jejuSourceDownload=api;
 const E=root.jejuEditor,catalog=root.jejuFinalCatalog;if(!E||!catalog)return;
 const toolbar=document.createElement('div');toolbar.id='sourceDownloadToolbar';toolbar.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 12px;flex-wrap:wrap;flex-shrink:0;background:#132f2b';
 const status=document.createElement('output');status.id='sourceDownloadStatus';status.setAttribute('aria-live','polite');status.style.fontSize='12px';const buttons=[];
 for(const [newOnly,label] of [[true,'새 이미지'],[false,'전체 원본']]){
  const items=entries(catalog,newOnly),button=document.createElement('button');button.className='btn';button.textContent=`${label} ${items.length}종 ZIP`;button.type='button';buttons.push(button);toolbar.append(button);
  button.onclick=async()=>{buttons.forEach(b=>b.disabled=true);status.textContent=`원본 확인 중 0 / ${items.length}`;
   try{await E.ready;const blob=await packageSources(items,fetch.bind(root),root.jejuHandoff.zip,(done,count)=>{status.textContent=`원본 확인 중 ${done} / ${count}`},root.crypto);E.download(blob,`Mazeland_${newOnly?'New24':'All132'}_OriginalPNG_v70.zip`);status.textContent=`완료 · ${items.length}종 · ${(blob.size/1048576).toFixed(1)}MB`;E.notice('원본 PNG ZIP을 내려받았습니다.');}
   catch(error){status.textContent='실패 · '+error.message;E.notice(error.message)}finally{buttons.forEach(b=>b.disabled=false)}
  };
 }
 toolbar.append(status);document.getElementById('items').before(toolbar);
})(typeof window==='object'?window:globalThis);
