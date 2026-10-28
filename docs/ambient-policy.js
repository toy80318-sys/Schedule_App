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
  const separatedSources88=[{"id":"BG01-E01-V05","theme":"sunset","category":"grass","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG01-E01-V05.png","sha256":"c50ebbe3de7dd4dac257cf270c9bc022a09f371c8b82eb58eed9439d474aa7df"},{"id":"BG01-E02-V05","theme":"sunset","category":"tree","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG01-E02-V05.png","sha256":"136cf4803af707624b350e0e92b09c0c74ec90a72df4b0bff7c32907394f7c5f"},{"id":"BG01-E05-V05","theme":"sunset","category":"basalt","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG01-E05-V05.png","sha256":"e05bbaa0bdeaf8a39ba5e78ffd74affc978ff4da2a28145deb0c7b1a6cacc4e0"},{"id":"BG01-E06-V05","theme":"sunset","category":"leaf","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG01-E06-V05.png","sha256":"0556cccc4ed44f9696fac848833eb5b657b337713577e911022bfe66919ef835"},{"id":"BG02-E01-V05","theme":"day","category":"grass","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG02-E01-V05.png","sha256":"0974a3ba7bc86f5f8aef5a86d727b263782dc449fa5a2fa607039f8632534301"},{"id":"BG02-E02-V05","theme":"day","category":"tree","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG02-E02-V05.png","sha256":"91ed0b5947f826e478e8180a91f3651e6535e4512ba15470a4541165073b81f2"},{"id":"BG02-E05-V05","theme":"day","category":"basalt","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG02-E05-V05.png","sha256":"28377b5dd62ae5ca8d0778ea6740878bf14b247633fd31855d764d21e184952d"},{"id":"BG02-E06-V05","theme":"day","category":"leaf","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG02-E06-V05.png","sha256":"139b4947682d54d193b6ea7110f02d090db48d851f090acddaafe164879d12d8"},{"id":"BG03-E01-V05","theme":"night","category":"grass","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG03-E01-V05.png","sha256":"908ebcc7d5485cb06b19ad62a5c5ab2ec600e6ab09c9ee28eb5218c063e6f61e"},{"id":"BG03-E02-V05","theme":"night","category":"tree","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG03-E02-V05.png","sha256":"909db735399393c2d75952195b194e665ce7d03a35680fa9e273634646cf5328"},{"id":"BG03-E05-V05","theme":"night","category":"basalt","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG03-E05-V05.png","sha256":"9dbb4a9516fea5757aad678f1dfbc1adc066b8b52085eb6e0657c72d9345c08a"},{"id":"BG03-E06-V05","theme":"night","category":"leaf","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG03-E06-V05.png","sha256":"440031d555e11c90a774614cbaddd33c7ddae1064ea69e51f21b449512a3b4a6"},{"id":"BG04-E01-V05","theme":"morning","category":"grass","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG04-E01-V05.png","sha256":"37099846835571c716058f508db71f78be8717bf0258e3ff5ee26716750dbb63"},{"id":"BG04-E02-V05","theme":"morning","category":"tree","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG04-E02-V05.png","sha256":"d1628a7dbfd9c505ffa47dda64c2627a8e9051782a663ef1c67435f10e79d98c"},{"id":"BG04-E05-V05","theme":"morning","category":"basalt","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG04-E05-V05.png","sha256":"8274d354a40f5bb2dba877e2b2076bace31a998c4af60be370bb6ac957865cbb"},{"id":"BG04-E06-V05","theme":"morning","category":"leaf","src":"https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG04-E06-V05.png","sha256":"07ffcf05e9a0ffaf8b9f34b17074c0f814440d14d2038e8daa017660d0eaf912"}];
  function hasExplicitLoop(asset){return !!(asset&&(Array.isArray(asset.frames)&&asset.frames.length||typeof asset.loopVideo==='string'&&asset.loopVideo));}
  function isSeparatedAsset(asset){return !!asset&&['grass','leaf','tree','basalt'].includes(asset.category)&&(/^BG0[1-4]-E0[1256]-V05$/.test(asset.id||'')||/^https:\/\/raw\.githubusercontent\.com\/toy80318-sys\/Schedule_App\/main\/source-assets\/set-review-v01\/BG0[1-4]-E0[1256]-V05\.png(?:[?#]|$)/.test(asset.src||''));}
  function separatedPath(src){
    if(typeof src!=='string')return null;
    const path=src.split(/[?#]/)[0];
    if(path.startsWith('assets/'))return path;
    for(const base of ['https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/docs/','https://toy80318-sys.github.io/Schedule_App/'])if(path.startsWith(base))return path.slice(base.length);
    return null;
  }
  function standardSeparatedMedia(asset,source){
    const bases=[`assets/separated-loops-v88/${source.id}/`,`assets/element-loops-v95/${source.id}/`];
    const sequence=frames=>!frames||Array.isArray(frames)&&bases.some((base,n)=>[1,n?72:96].includes(frames.length)&&frames.every((src,i)=>separatedPath(src)===base+'frame_'+String(i).padStart(4,'0')+'.webp'));
    const unity=!asset.unityFrames||Array.isArray(asset.unityFrames)&&asset.unityFrames.length===96&&asset.unityFrames.every((src,i)=>src===`PNG_ALPHA/${source.id}/frame_${String(i).padStart(4,'0')}.png`);
    const zip=!asset.sequenceZip||asset.sequenceZip===`https://github.com/toy80318-sys/Schedule_App/releases/download/mazeland-separated-loops-v88/${source.id}_PNG_ALPHA_v88.zip`||asset.sequenceZip===`https://github.com/toy80318-sys/Schedule_App/releases/download/mazeland-elements-3s-v95/${source.category}_Loop3s_PNGAlpha480_v95.zip`;
    return sequence(asset.frames)&&sequence(asset.previewFrames)&&unity&&zip&&(!asset.loopVideo||bases.some(base=>separatedPath(asset.loopVideo)===base+'alpha.webm'))&&(!asset.keyVideo||bases.some(base=>separatedPath(asset.keyVideo)===base+'key.mp4'));
  }
  function staticSeparatedAsset(asset){
    const source=separatedSources88.find(a=>a.id===asset?.id&&a.theme===asset.theme&&a.category===asset.category&&a.sha256===asset.sha256);
    if(!source||!(asset.src===source.src||[`assets/separated-loops-v88/${source.id}/frame_0000.webp`,`assets/element-loops-v95/${source.id}/frame_0000.webp`,`assets/separated-loops-v88/${source.id}/still.png`].includes(separatedPath(asset.src)))||!standardSeparatedMedia(asset,source))return asset;
    const value={...asset,src:source.src,preview:source.src,width:1254,height:1254,kind:'image',stillOnly:true,loopInPlace:false,separatedLoopVersion:88};
    for(const key of ['preview','thumb'])if(separatedPath(value[key])?.startsWith(`assets/separated-loops-v88/${source.id}/frame_`)||separatedPath(value[key])?.startsWith(`assets/element-loops-v95/${source.id}/frame_`))value[key]=source.src;
    for(const key of ['frames','previewFrames','previewWidth','previewHeight','fps','frameCount','duration','loopWidth','loopHeight','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','elementLoopVersion','motion','alphaWebM_SHA256','keyMP4_SHA256','sequenceSHA256','qa','sourceFrameIndices','originalCycleFrameCount','renderRevision','colorSpace'])delete value[key];
    return value;
  }
  function currentAsset(asset,catalog){
    asset=normalizedAsset(asset);
    const source=(asset.src||asset.frames?.[0]||'').split('?')[0];
    const current=catalog?.assets?.find(a=>!a.referenceOnly&&(a.id===asset.id||a.legacyAssetIds?.includes(asset.id)||a.legacySources?.includes(source)||a.legacySourcePrefixes?.some(prefix=>source.startsWith(prefix))));
    const value=current?(isSeparatedAsset(asset)&&hasExplicitLoop(asset)?{...current,...asset,id:asset.id}:{...asset,...current,id:asset.id,frames:current.frames}):asset;return staticSeparatedAsset(normalizedAsset(value));
  }
  const policy={isRetired,cleanProject,atmosphereAssets,atmosphereKind,driftPose,currentAsset,staticSeparatedAsset,hasExplicitLoop};
  if(typeof module==='object'&&module.exports)module.exports=policy;else root.jejuAmbient=policy;
})(typeof window==='object'?window:globalThis);
