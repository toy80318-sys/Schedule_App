(function(){
  'use strict';
  function hue(hex){
    const [r,g,b]=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;
    return d?((hi===r?(g-b)/d:hi===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360:0;
  }
  function similar(current,variants){
    if(!/^#[a-f\d]{6}$/i.test(current?.petalColor))return [];
    const base=hue(current.petalColor);
    return variants.filter(v=>{if(!v.ready||v.species!==current.species||v.id===current.id||!/^#[a-f\d]{6}$/i.test(v.petalColor))return false;const d=Math.abs(hue(v.petalColor)-base);return Math.min(d,360-d)<=30});
  }
  function mix(data,variants,resolve){
    const next=JSON.parse(JSON.stringify(data)),assets=new Map((next.assets||[]).map(a=>[a.id,a]));let count=0;
    const usable=variants.filter(v=>v.ready&&/^#[a-f\d]{6}$/i.test(v.petalColor));
    function items(objects){
      const groups=new Map();for(const o of objects||[]){const a=assets.get(o.assetId),v=a&&resolve(o,a);if(!v||!usable.some(x=>x.id===v.id))continue;const key=(o.groupId||'ungrouped')+':'+v.species;if(!groups.has(key))groups.set(key,[]);groups.get(key).push({o,v})}
      for(const list of groups.values()){
        const votes=new Map();for(const {v} of list)votes.set(v.id,(votes.get(v.id)||0)+1);
        const anchor=list.find(({v})=>votes.get(v.id)===Math.max(...votes.values())).v,base=hue(anchor.petalColor);
        const distance=v=>{const d=Math.abs(hue(v.petalColor)-base);return Math.min(d,360-d)};
        const colors=usable.filter(v=>v.species===anchor.species&&distance(v)<=45).sort((a,b)=>distance(a)-distance(b)).slice(0,3);
        for(const [i,{o}] of list.entries()){const v=colors[i%colors.length],id='flower-'+v.id;if(!assets.has(id))assets.set(id,{id,name:v.name,group:'flowers',species:v.species,tone:v.tone,bloomVariant:v.id,src:v.open,ready:true});Object.assign(o,{assetId:id,name:v.name,flowerVariant:v.id,flowerColor:v.tone});count++}
      }
    }
    items(next.objects);for(const s of next.styles||[])for(const p of s.presets||[]){items(p.objects);delete p.thumbnail}
    next.assets=[...assets.values()];return {data:next,count};
  }
  function commit(database,before,after,backupKey){
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('projects','readwrite'),store=tx.objectStore('projects');let conflict=false;
      for(const [key,value] of before){const request=store.get(key);request.onsuccess=()=>{if(JSON.stringify(request.result)!==JSON.stringify(value)){conflict=true;tx.abort()}}}
      store.put({entries:[...before],savedAt:new Date().toISOString()},backupKey);
      for(const [key,value] of after)store.put(value,key);
      tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(conflict?Error('다른 탭에서 저장본이 바뀌었습니다. 다시 적용해 주세요.'):tx.error||Error('저장 공간이 부족하거나 저장에 실패했습니다. 기존 저장본을 유지했습니다.'));
    });
  }
  if(typeof module==='object'&&module.exports){module.exports={mix,commit,similar};return}
  window.jejuFlowerTones={similar};
  const E=window.jejuEditor,$=id=>document.getElementById(id);if(!E)return;
  const controls=document.createElement('div');controls.className='group';controls.innerHTML='<h3>저장된 군집 색상 혼합</h3><button class="btn" id="mixSavedFlowers">저장된 모든 군집 · 비슷한 색상 섞기</button><button class="btn" id="restoreFlowerMix">혼합 전 저장본 복구</button><p class="note" id="flowerMixStatus" role="status">같은 꽃의 비슷한 계열 원본 2~3색을 섞습니다. 위치·크기는 유지하고 변경 전 저장본을 보관합니다.</p>';$('replaceFlowers').parentElement.after(controls);
  const backupKey='flower-tone-mix-backup-v1';let busy=false;
  async function run(restore=false){
    if(busy)return;busy=true;const workspace=$('editorWorkspace'),name=$('saveName').value;workspace.inert=true;
    try{
      await E.ready;await window.jejuHandoff?.settled();await E.storeCurrent();
      const database=await E.db();let before;
      try{before=await new Promise((resolve,reject)=>{const tx=database.transaction('projects','readonly'),store=tx.objectStore('projects'),keys=store.getAllKeys(),values=store.getAll();tx.oncomplete=()=>resolve(new Map(keys.result.map((k,i)=>[k,values.result[i]])));tx.onerror=tx.onabort=()=>reject(tx.error)})}finally{database.close()}
      let after,count=0,layouts=0;
      const selected=new Map([...before].filter(([key])=>key==='current'||key==='current-assets'||key==='group-style-library-v1'||typeof key==='string'&&key.startsWith('named:')));
      if(restore){const backup=before.get(backupKey);if(!backup?.entries)throw Error('복구할 색상 혼합 백업이 없습니다.');after=new Map(backup.entries)}else{
        const manifest=await fetch('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/bloom-manifest.json?v=14').then(r=>{if(!r.ok)throw Error('꽃 색상 목록을 읽지 못했습니다.');return r.json()});after=new Map(selected);
        for(const [key,value] of selected){if(key==='current-assets')continue;const input=key==='current'?{...value,assets:before.get(value.assetRecord)||value.assets||[]}:value;if(!input||!Array.isArray(input.assets))continue;
          const result=mix(input,manifest.variants,(o,a)=>E.objectVariant(o,E.currentFlowerAsset(a)));count+=result.count;
          if(key==='group-style-library-v1')after.set(key,await window.jejuHandoff.prepareLibrary(result.data));
          else if(key==='current'&&value.assetRecord){after.set(value.assetRecord,result.data.assets);delete result.data.assets;after.set(key,result.data)}else after.set(key,result.data);
          if(typeof key==='string'&&key.startsWith('named:'))layouts++;
        }
      }
      const write=await E.db();try{await commit(write,selected,after,restore?'flower-tone-mix-before-restore-v1':backupKey)}finally{write.close()}
      await window.jejuHandoff?.reloadLibrary();await E.restoreCurrent();$('saveName').value=name;await E.updateSavedLayouts();
      $('flowerMixStatus').textContent=restore?'혼합 전 저장본을 복구했습니다.':`${layouts}개 저장 배치와 현재 배치·스타일 라이브러리의 ${count}개 꽃에 비슷한 계열 원본 색상을 섞었습니다. 변경 전 백업을 보관했습니다.`;
    }catch(error){$('flowerMixStatus').textContent=error.message}finally{workspace.inert=false;busy=false}
  }
  $('mixSavedFlowers').onclick=()=>run();$('restoreFlowerMix').onclick=()=>run(true);
})();
