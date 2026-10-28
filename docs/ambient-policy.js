(function(root){
  'use strict';
  const approvedButterflies98=[{"source":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/docs/assets/abstract-butterflies-v97/ML_SHARED_Butterfly01_Side_AbstractOil_v97.png","sha256":"fa46e30f65398e04c89d523e304cd1eb640ea480e390106d6ef65f2f00c84029","base":"assets/butterfly-wingbeats-v98/atmosphere85-butterfly-01/"},{"source":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/docs/assets/abstract-butterflies-v97/ML_SHARED_Butterfly02_Side_AbstractOil_v97.png","sha256":"4b64e18fe294a4a17c2ff4b0b0ff16299e4957aff64ca9af577f91f9823942b4","base":"assets/butterfly-wingbeats-v98/atmosphere85-butterfly-02/"},{"source":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/docs/assets/abstract-butterflies-v97/ML_SHARED_Butterfly03_Side_AbstractOil_v97.png","sha256":"5d29f839b0f42fdb8027dac8522d3cecd09e11ca7adddb2f5564b73fe1b2e4ef","base":"assets/butterfly-wingbeats-v98/atmosphere85-butterfly-03/"}];
  const rejectedAtmosphereHashes=["49f452b40cd23428b215f452e1637e69d76e08989312ad5be4f06da8979faf71","598909323adc4f88168a3e75165f28f9104d7a6a6254755ff4ad290882d9980b","6f676f85f646f9478a3d25f91ea53a0d09d08d92d9ca45e7dcaef4626fc1d7bc","3f925f439273ae93cc5793f59baece593b12239eb2da6b272cefc41979332bc3","cbab7ace68740bbe4c4fe97a969545747b899dc92c7074babbf72567a1b44708","9759e862b0448881022f04cf1d93b33a6e9c99ec5360e26e407a3e6228a74aa5","68cac29d87bfae6016c406b6bd2a11961cd015e274e968f9be88f746e3999925","fcf6041245e4b4b0b2236e631ba5c8009c5d6fa7dc20e47bbd6a51fba9aff3b6"];
  function normalizedAsset(asset){return root.jejuButterflyLoopData&&root.jejuButterflyLoops?root.jejuButterflyLoops.asset(asset,root.jejuButterflyLoopData):asset;}
  function isRetired(asset){
    if(!asset)return false;
    const approved=approvedButterflies98.some(m=>asset.src===m.source&&asset.sha256===m.sha256&&(!asset.loopVideo||asset.loopVideo===m.base+'alpha.webm')&&(!asset.frames||asset.frames.every((p,i)=>p===m.base+'frame_'+String(i).padStart(4,'0')+'.webp'||p===m.base+'png/frame_'+String(i).padStart(4,'0')+'.png')));
    if(approved)return false;
    const id=String(asset.id||'').replace(/^loop-/,''),source=asset.src||asset.frames?.[0]||'',sources=[asset.src,asset.frames?.[0],asset.loopVideo,asset.preview,asset.thumb].filter(v=>typeof v==='string').map(v=>{try{return decodeURIComponent(v)}catch{return v}}).join(' ');
    if(asset.useStatus==='rejected-by-user'||/^atmosphere8[45]-(?:cloud|butterfly)-0[1-4]$/.test(id)||/(?:source-assets|assets)\/(?:atmosphere-v8[45]|element-loops-v95)\/(?:previews?\/)?(?:cloud_0[1-4]|butterfly_0[1-4]|atmosphere85-(?:cloud|butterfly)-0[1-4])(?:[\/.?#]|$)/.test(sources)||rejectedAtmosphereHashes.includes(asset.sha256||asset.sourceSHA256))return true;
    return id==='wind1'||id==='cloud1'||/^\/assets\/animations\/(?:wind1|cloud1)\//.test(source)||/^BG0[1-4]-E06-V05$/.test(id)||/(?:^|\/)BG0[1-4]-E06-V05(?:\/|\.(?:png|webp)(?:[?#]|$))/.test(source)||["0556cccc4ed44f9696fac848833eb5b657b337713577e911022bfe66919ef835","139b4947682d54d193b6ea7110f02d090db48d851f090acddaafe164879d12d8","440031d555e11c90a774614cbaddd33c7ddae1064ea69e51f21b449512a3b4a6","07ffcf05e9a0ffaf8b9f34b17074c0f814440d14d2038e8daa017660d0eaf912"].includes(asset.sha256||asset.sourceSHA256);
  }
  function cleanProject(data){
    const original=data.assets||[],assets=original.map(normalizedAsset),removed=new Set(assets.filter(isRetired).map(a=>a.id)),available=new Set(assets.filter(a=>!isRetired(a)).map(a=>a.id)),changed=new Set(assets.filter((a,i)=>a.src!==original[i].src||a.useStatus!==original[i].useStatus||a.catalogHidden!==original[i].catalogHidden).map(a=>a.id));
    const keep=o=>!removed.has(o.assetId)&&(available.has(o.assetId)||!isRetired({id:o.assetId})),result={...data,assets:assets.filter(a=>!isRetired(a)),objects:(data.objects||[]).filter(keep)};
    if(Array.isArray(data.styles))result.styles=data.styles.map(s=>({...s,presets:(s.presets||[]).map(p=>{const objects=p.objects.filter(keep);return objects.length===p.objects.length&&!p.objects.some(o=>changed.has(o.assetId))?{...p,objects}:{...p,objects,thumbnail:undefined}}).filter(p=>p.objects.length)}));
    return result;
  }
  const atmosphereAssets=[
    {id:'atmosphere-cloud-white',name:'구름 · 천천히 왼쪽으로',group:'decor',atmosphere:'cloud',src:'/assets/atmosphere/cloud-white.webp'},
    {id:'atmosphere-mist-pearl',name:'안개 · 천천히 왼쪽으로',group:'decor',atmosphere:'mist',src:'/assets/atmosphere/mist-pearl.webp'}
  ];
  function atmosphereKind(asset){
    if(!asset)return null;
    if(['cloud','mist'].includes(asset.atmosphere))return asset.atmosphere;
    const source=[asset.id,asset.src,asset.frames?.[0]].join(' ');
    return /cloud/.test(source)?'cloud':/mist|fog/.test(source)?'mist':null;
  }
  function driftPose(object,kind,time,width,asset){
    if(!['cloud','mist'].includes(kind)||object.motion==='stationary'||asset?.loopInPlace)return object;
    const span=width+object.w*2+40,speed=span/(kind==='cloud'?540:900);
    return {...object,x:((object.x+object.w+20-time*speed*(object.motion==='right'?-1:1))%span+span)%span-object.w-20};
  }
  function currentAsset(asset,catalog){
    asset=normalizedAsset(asset);
    const source=(asset.src||asset.frames?.[0]||'').split('?')[0];
    const current=catalog?.assets?.find(a=>!a.referenceOnly&&(a.id===asset.id||a.legacyAssetIds?.includes(asset.id)||a.legacySources?.includes(source)||a.legacySourcePrefixes?.some(prefix=>source.startsWith(prefix))));
    return normalizedAsset(current?{...asset,...current,id:asset.id,frames:current.frames}:asset);
  }
  const policy={isRetired,cleanProject,atmosphereAssets,atmosphereKind,driftPose,currentAsset};
  if(typeof module==='object'&&module.exports)module.exports=policy;else root.jejuAmbient=policy;
})(typeof window==='object'?window:globalThis);
