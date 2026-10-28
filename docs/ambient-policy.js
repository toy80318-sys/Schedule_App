(function(root){
  'use strict';
  function isRetired(asset){
    if(!asset)return false;
    const id=String(asset.id||'').replace(/^loop-/,''),source=asset.src||asset.frames?.[0]||'';
    return id==='wind1'||id==='cloud1'||/^\/assets\/animations\/(?:wind1|cloud1)\//.test(source)||/^BG0[1-4]-E06-V05$/.test(id)||/(?:^|\/)BG0[1-4]-E06-V05(?:\/|\.(?:png|webp)(?:[?#]|$))/.test(source)||["0556cccc4ed44f9696fac848833eb5b657b337713577e911022bfe66919ef835","139b4947682d54d193b6ea7110f02d090db48d851f090acddaafe164879d12d8","440031d555e11c90a774614cbaddd33c7ddae1064ea69e51f21b449512a3b4a6","07ffcf05e9a0ffaf8b9f34b17074c0f814440d14d2038e8daa017660d0eaf912"].includes(asset.sha256||asset.sourceSHA256);
  }
  function cleanProject(data){
    const assets=data.assets||[],removed=new Set(assets.filter(isRetired).map(a=>a.id));
    const keep=o=>!removed.has(o.assetId)&&!isRetired({id:o.assetId}),result={...data,assets:assets.filter(a=>!isRetired(a)),objects:(data.objects||[]).filter(keep)};
    if(Array.isArray(data.styles))result.styles=data.styles.map(s=>({...s,presets:(s.presets||[]).map(p=>{const objects=p.objects.filter(keep);return objects.length===p.objects.length?{...p,objects}:{...p,objects,thumbnail:undefined}}).filter(p=>p.objects.length)}));
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
    const source=(asset.src||asset.frames?.[0]||'').split('?')[0];
    const current=catalog?.assets?.find(a=>!a.referenceOnly&&(a.id===asset.id||a.legacyAssetIds?.includes(asset.id)||a.legacySources?.includes(source)||a.legacySourcePrefixes?.some(prefix=>source.startsWith(prefix))));
    return current?{...asset,...current,id:asset.id,frames:current.frames}:asset;
  }
  const policy={isRetired,cleanProject,atmosphereAssets,atmosphereKind,driftPose,currentAsset};
  if(typeof module==='object'&&module.exports)module.exports=policy;else root.jejuAmbient=policy;
})(typeof window==='object'?window:globalThis);
