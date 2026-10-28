(function(root){
  'use strict';
  function isRetired(asset){
    if(!asset)return false;
    const id=String(asset.id||'').replace(/^loop-/,''),source=asset.src||asset.frames?.[0]||'';
    return id==='wind1'||id==='cloud1'||/^\/assets\/animations\/(?:wind1|cloud1)\//.test(source);
  }
  function cleanProject(data){
    const assets=data.assets||[],removed=new Set(assets.filter(isRetired).map(a=>a.id));
    return {...data,assets:assets.filter(a=>!isRetired(a)),objects:(data.objects||[]).filter(o=>!removed.has(o.assetId)&&!isRetired({id:o.assetId}))};
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
  function staticSeparatedAsset(asset){
    if(!asset||!['grass','leaf','tree','basalt'].includes(asset.category)||!/^BG0[1-4]-E0[1256]-V05$/.test(asset.id||'')&&!/^https:\/\/raw\.githubusercontent\.com\/toy80318-sys\/Schedule_App\/main\/source-assets\/set-review-v01\/BG0[1-4]-E0[1256]-V05\.png(?:[?#]|$)/.test(asset.src||''))return asset;
    const value={...asset,stillOnly:true,loopInPlace:false,separatedLoopVersion:88};
    for(const key of ['frames','previewFrames','previewWidth','previewHeight','fps','frameCount','duration','loopWidth','loopHeight','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','elementLoopVersion','motion'])delete value[key];
    return value;
  }
  function currentAsset(asset,catalog){
    const source=(asset.src||asset.frames?.[0]||'').split('?')[0];
    const current=catalog?.assets?.find(a=>!a.referenceOnly&&(a.id===asset.id||a.legacyAssetIds?.includes(asset.id)||a.legacySources?.includes(source)||a.legacySourcePrefixes?.some(prefix=>source.startsWith(prefix))));
    return staticSeparatedAsset(current?{...asset,...current,id:asset.id,frames:current.frames}:asset);
  }
  const policy={isRetired,cleanProject,atmosphereAssets,atmosphereKind,driftPose,currentAsset,staticSeparatedAsset};
  if(typeof module==='object'&&module.exports)module.exports=policy;else root.jejuAmbient=policy;
})(typeof window==='object'?window:globalThis);
