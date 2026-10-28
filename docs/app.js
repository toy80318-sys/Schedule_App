(() => {
  'use strict';
  const optimizedImages={"/assets/flowers/flower-buckwheat-aux.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-buckwheat-aux.webp", "thumb": "/assets/thumb/flowers/flower-buckwheat-aux.webp", "light": "/assets/light/flowers/flower-buckwheat-aux.webp"}, "/assets/flowers/flower-buckwheat-main.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-buckwheat-main.webp", "thumb": "/assets/thumb/flowers/flower-buckwheat-main.webp", "light": "/assets/light/flowers/flower-buckwheat-main.webp"}, "/assets/flowers/flower-buckwheat-point.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-buckwheat-point.webp", "thumb": "/assets/thumb/flowers/flower-buckwheat-point.webp", "light": "/assets/light/flowers/flower-buckwheat-point.webp"}, "/assets/flowers/flower-buckwheat-sub-01.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-buckwheat-sub-01.webp", "thumb": "/assets/thumb/flowers/flower-buckwheat-sub-01.webp", "light": "/assets/light/flowers/flower-buckwheat-sub-01.webp"}, "/assets/flowers/flower-buckwheat-sub-02.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-buckwheat-sub-02.webp", "thumb": "/assets/thumb/flowers/flower-buckwheat-sub-02.webp", "light": "/assets/light/flowers/flower-buckwheat-sub-02.webp"}, "/assets/flowers/flower-camellia-aux.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-camellia-aux.webp", "thumb": "/assets/thumb/flowers/flower-camellia-aux.webp", "light": "/assets/light/flowers/flower-camellia-aux.webp"}, "/assets/flowers/flower-camellia-main.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-camellia-main.webp", "thumb": "/assets/thumb/flowers/flower-camellia-main.webp", "light": "/assets/light/flowers/flower-camellia-main.webp"}, "/assets/flowers/flower-camellia-point.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-camellia-point.webp", "thumb": "/assets/thumb/flowers/flower-camellia-point.webp", "light": "/assets/light/flowers/flower-camellia-point.webp"}, "/assets/flowers/flower-camellia-sub-01.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-camellia-sub-01.webp", "thumb": "/assets/thumb/flowers/flower-camellia-sub-01.webp", "light": "/assets/light/flowers/flower-camellia-sub-01.webp"}, "/assets/flowers/flower-camellia-sub-02.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-camellia-sub-02.webp", "thumb": "/assets/thumb/flowers/flower-camellia-sub-02.webp", "light": "/assets/light/flowers/flower-camellia-sub-02.webp"}, "/assets/flowers/flower-hydrangea-aux.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-hydrangea-aux.webp", "thumb": "/assets/thumb/flowers/flower-hydrangea-aux.webp", "light": "/assets/light/flowers/flower-hydrangea-aux.webp"}, "/assets/flowers/flower-hydrangea-main.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-hydrangea-main.webp", "thumb": "/assets/thumb/flowers/flower-hydrangea-main.webp", "light": "/assets/light/flowers/flower-hydrangea-main.webp"}, "/assets/flowers/flower-hydrangea-point.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-hydrangea-point.webp", "thumb": "/assets/thumb/flowers/flower-hydrangea-point.webp", "light": "/assets/light/flowers/flower-hydrangea-point.webp"}, "/assets/flowers/flower-hydrangea-sub-01.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-hydrangea-sub-01.webp", "thumb": "/assets/thumb/flowers/flower-hydrangea-sub-01.webp", "light": "/assets/light/flowers/flower-hydrangea-sub-01.webp"}, "/assets/flowers/flower-hydrangea-sub-02.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-hydrangea-sub-02.webp", "thumb": "/assets/thumb/flowers/flower-hydrangea-sub-02.webp", "light": "/assets/light/flowers/flower-hydrangea-sub-02.webp"}, "/assets/flowers/flower-lavender-aux.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-lavender-aux.webp", "thumb": "/assets/thumb/flowers/flower-lavender-aux.webp", "light": "/assets/light/flowers/flower-lavender-aux.webp"}, "/assets/flowers/flower-lavender-main.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-lavender-main.webp", "thumb": "/assets/thumb/flowers/flower-lavender-main.webp", "light": "/assets/light/flowers/flower-lavender-main.webp"}, "/assets/flowers/flower-lavender-point.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-lavender-point.webp", "thumb": "/assets/thumb/flowers/flower-lavender-point.webp", "light": "/assets/light/flowers/flower-lavender-point.webp"}, "/assets/flowers/flower-lavender-sub-01.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-lavender-sub-01.webp", "thumb": "/assets/thumb/flowers/flower-lavender-sub-01.webp", "light": "/assets/light/flowers/flower-lavender-sub-01.webp"}, "/assets/flowers/flower-lavender-sub-02.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-lavender-sub-02.webp", "thumb": "/assets/thumb/flowers/flower-lavender-sub-02.webp", "light": "/assets/light/flowers/flower-lavender-sub-02.webp"}, "/assets/flowers/flower-marigold-aux.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-marigold-aux.webp", "thumb": "/assets/thumb/flowers/flower-marigold-aux.webp", "light": "/assets/light/flowers/flower-marigold-aux.webp"}, "/assets/flowers/flower-marigold-main.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-marigold-main.webp", "thumb": "/assets/thumb/flowers/flower-marigold-main.webp", "light": "/assets/light/flowers/flower-marigold-main.webp"}, "/assets/flowers/flower-marigold-point.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-marigold-point.webp", "thumb": "/assets/thumb/flowers/flower-marigold-point.webp", "light": "/assets/light/flowers/flower-marigold-point.webp"}, "/assets/flowers/flower-marigold-sub-01.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-marigold-sub-01.webp", "thumb": "/assets/thumb/flowers/flower-marigold-sub-01.webp", "light": "/assets/light/flowers/flower-marigold-sub-01.webp"}, "/assets/flowers/flower-marigold-sub-02.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/flower-marigold-sub-02.webp", "thumb": "/assets/thumb/flowers/flower-marigold-sub-02.webp", "light": "/assets/light/flowers/flower-marigold-sub-02.webp"}, "/assets/flowers/flower-rapeseed-aux.webp": {"width": 1254, "height": 1254, "preview": "/assets/preview/flowers/flower-rapeseed-aux.webp", "thumb": "/assets/thumb/flowers/flower-rapeseed-aux.webp", "light": "/assets/light/flowers/flower-rapeseed-aux.webp"}, "/assets/flowers/flower-rapeseed-main.webp": {"width": 1254, "height": 1254, "preview": "/assets/preview/flowers/flower-rapeseed-main.webp", "thumb": "/assets/thumb/flowers/flower-rapeseed-main.webp", "light": "/assets/light/flowers/flower-rapeseed-main.webp"}, "/assets/flowers/flower-rapeseed-point.webp": {"width": 1254, "height": 1254, "preview": "/assets/preview/flowers/flower-rapeseed-point.webp", "thumb": "/assets/thumb/flowers/flower-rapeseed-point.webp", "light": "/assets/light/flowers/flower-rapeseed-point.webp"}, "/assets/flowers/flower-rapeseed-sub-01.webp": {"width": 1254, "height": 1254, "preview": "/assets/preview/flowers/flower-rapeseed-sub-01.webp", "thumb": "/assets/thumb/flowers/flower-rapeseed-sub-01.webp", "light": "/assets/light/flowers/flower-rapeseed-sub-01.webp"}, "/assets/flowers/flower-rapeseed-sub-02.webp": {"width": 1254, "height": 1254, "preview": "/assets/preview/flowers/flower-rapeseed-sub-02.webp", "thumb": "/assets/thumb/flowers/flower-rapeseed-sub-02.webp", "light": "/assets/light/flowers/flower-rapeseed-sub-02.webp"}, "/assets/decor/basalt-1.webp": {"width": 1536, "height": 1024, "preview": "/assets/preview/decor/basalt-1.webp", "thumb": "/assets/thumb/decor/basalt-1.webp", "light": "/assets/light/decor/basalt-1.webp"}, "/assets/decor/basalt-2.webp": {"width": 1774, "height": 887, "preview": "/assets/preview/decor/basalt-2.webp", "thumb": "/assets/thumb/decor/basalt-2.webp", "light": "/assets/light/decor/basalt-2.webp"}, "/assets/decor/basalt-3.webp": {"width": 1402, "height": 1122, "preview": "/assets/preview/decor/basalt-3.webp", "thumb": "/assets/thumb/decor/basalt-3.webp", "light": "/assets/light/decor/basalt-3.webp"}, "/assets/decor/basalt-4.webp": {"width": 1536, "height": 1024, "preview": "/assets/preview/decor/basalt-4.webp", "thumb": "/assets/thumb/decor/basalt-4.webp", "light": "/assets/light/decor/basalt-4.webp"}, "/assets/decor/basalt-5.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/decor/basalt-5.webp", "thumb": "/assets/thumb/decor/basalt-5.webp", "light": "/assets/light/decor/basalt-5.webp"}, "/assets/decor/grass-1.webp": {"width": 1536, "height": 1024, "preview": "/assets/preview/decor/grass-1.webp", "thumb": "/assets/thumb/decor/grass-1.webp", "light": "/assets/light/decor/grass-1.webp"}, "/assets/decor/grass-2.webp": {"width": 1382, "height": 1138, "preview": "/assets/preview/decor/grass-2.webp", "thumb": "/assets/thumb/decor/grass-2.webp", "light": "/assets/light/decor/grass-2.webp"}, "/assets/decor/grass-3.webp": {"width": 1374, "height": 1145, "preview": "/assets/preview/decor/grass-3.webp", "thumb": "/assets/thumb/decor/grass-3.webp", "light": "/assets/light/decor/grass-3.webp"}, "/assets/decor/grass-4.webp": {"width": 1312, "height": 1199, "preview": "/assets/preview/decor/grass-4.webp", "thumb": "/assets/thumb/decor/grass-4.webp", "light": "/assets/light/decor/grass-4.webp"}, "/assets/decor/grass-5.webp": {"width": 1312, "height": 1199, "preview": "/assets/preview/decor/grass-5.webp", "thumb": "/assets/thumb/decor/grass-5.webp", "light": "/assets/light/decor/grass-5.webp"}, "/assets/decor/leafgrass-1.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/decor/leafgrass-1.webp", "thumb": "/assets/thumb/decor/leafgrass-1.webp", "light": "/assets/light/decor/leafgrass-1.webp"}, "/assets/decor/leafgrass-2.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/decor/leafgrass-2.webp", "thumb": "/assets/thumb/decor/leafgrass-2.webp", "light": "/assets/light/decor/leafgrass-2.webp"}, "/assets/decor/leafgrass-3.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/decor/leafgrass-3.webp", "thumb": "/assets/thumb/decor/leafgrass-3.webp", "light": "/assets/light/decor/leafgrass-3.webp"}, "/assets/background/background-14165x3480.webp": {"width": 14165, "height": 3480, "preview": "/assets/preview/background/background-14165x3480.webp", "thumb": "/assets/thumb/background/background-14165x3480.webp", "light": "/assets/light/background/background-14165x3480.webp"}, "/assets/flowers/recolor_buckwheat-main.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/recolor_buckwheat-main.webp", "thumb": "/assets/thumb/flowers/recolor_buckwheat-main.webp", "light": "/assets/light/flowers/recolor_buckwheat-main.webp"}, "/assets/flowers/recolor_rapeseed-main.webp": {"width": 1254, "height": 1254, "preview": "/assets/preview/flowers/recolor_rapeseed-main.webp", "thumb": "/assets/thumb/flowers/recolor_rapeseed-main.webp", "light": "/assets/light/flowers/recolor_rapeseed-main.webp"}, "/assets/flowers/recolor_marigold-point.webp": {"width": 1024, "height": 1536, "preview": "/assets/preview/flowers/recolor_marigold-point.webp", "thumb": "/assets/thumb/flowers/recolor_marigold-point.webp", "light": "/assets/light/flowers/recolor_marigold-point.webp"}, "/assets/background/hallasan-close1.webp": {"width": 1916, "height": 821, "preview": "/assets/preview/background/hallasan-close1.webp", "light": "/assets/light/background/hallasan-close1.webp", "thumb": "/assets/thumb/background/hallasan-close1.webp"}, "/assets/background/hallasan-close2.webp": {"width": 1983, "height": 793, "preview": "/assets/preview/background/hallasan-close2.webp", "light": "/assets/light/background/hallasan-close2.webp", "thumb": "/assets/thumb/background/hallasan-close2.webp"}, "/assets/background/hallasan-close3.webp": {"width": 1983, "height": 793, "preview": "/assets/preview/background/hallasan-close3.webp", "light": "/assets/light/background/hallasan-close3.webp", "thumb": "/assets/thumb/background/hallasan-close3.webp"}, "/assets/background/hallasan-milkyway.webp": {"width": 1986, "height": 792, "preview": "/assets/preview/background/hallasan-milkyway.webp", "light": "/assets/light/background/hallasan-milkyway.webp", "thumb": "/assets/thumb/background/hallasan-milkyway.webp"}, "/assets/background/hallasan-sunset.webp": {"width": 1983, "height": 793, "preview": "/assets/preview/background/hallasan-sunset.webp", "light": "/assets/light/background/hallasan-sunset.webp", "thumb": "/assets/thumb/background/hallasan-sunset.webp"}, "/assets/background/hallasan-sea.webp": {"width": 2009, "height": 783, "preview": "/assets/preview/background/hallasan-sea.webp", "light": "/assets/light/background/hallasan-sea.webp", "thumb": "/assets/thumb/background/hallasan-sea.webp"}, "/assets/background/hallasan-oil-20261011.webp": {"width": 2833, "height": 696, "preview": "/assets/preview/background/hallasan-oil-20261011.webp", "light": "/assets/light/background/hallasan-oil-20261011.webp", "thumb": "/assets/thumb/background/hallasan-oil-20261011.webp"}};
  let lightPreview=true;
  const currentPreviews=new Map(window.jejuFinalCatalog.assets.filter(a=>a.imageStyleVersion>=43).map(a=>[a.src,a.imageStyleVersion>=55?a.preview:a.thumb]));
  const sourceRegistered=new Set(window.jejuFinalCatalog.assets.filter(a=>a.completeObject||a.sourceRect?.length===4||a.category==='background'&&a.imageStyleVersion>=56).map(a=>a.src));
  const displaySrc=(src,kind="preview")=>kind==="thumb"&&window.jejuWebPreviews?.[src]||(kind==="preview"&&sourceRegistered.has(src)?src:currentPreviews.get(src)||(src?.startsWith('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/')&&src.endsWith('.png')?src.replace(/\.png$/,'.webp'):kind==="preview"&&src?.startsWith('/assets/background/')?src:optimizedImages[src?.split("?")[0]]?.[kind==="preview"&&lightPreview?"light":kind]||src));
  const W=14165,H=3480,$=id=>document.getElementById(id);
  const els={view:$('view'),wall:$('wall'),layers:$('layers'),items:$('items'),zoom:$('zoomLabel'),count:$('layerCount')};
  const species=[['hydrangea','수국'],['lavender','라벤더'],['rapeseed','유채꽃'],['buckwheat','메밀꽃'],['marigold','금잔화'],['camellia','동백꽃']];
  const tones=[['main','메인'],['sub-01','서브 1'],['sub-02','서브 2'],['aux','보조'],['point','포인트']];
  let assets=window.jejuFinalCatalog.assets.filter(a=>a.category!=='background').map(a=>({...a}));
  const builtins=assets.map(a=>({...a}));
  let bloomManifest=null;
  const bloomVariants=new Map(),toneNames={red:'레드',orange:'오렌지',purple:'퍼플',blue:'블루',skyblue:'스카이블루',lightpurple:'연한 퍼플',yellow:'옐로우',gold:'골드',amber:'앰버',cream:'크림옐로우',lemonyellow:'레몬옐로우',redorange:'레드오렌지',orangered:'오렌지레드',goldochre:'골드오커',orangegold:'오렌지골드',lavenderpurple:'라벤더퍼플',royalblue:'로열블루',deeppurple:'딥퍼플'};
  const legacyFlowerTones={hydrangea:{pink:'lightpurple',burgundy:'purple',red:'purple',orange:'purple',yellow:'skyblue',gold:'skyblue'},lavender:{pink:'purple',burgundy:'purple',yellow:'orange',gold:'orange',skyblue:'blue',lightpurple:'purple'},rapeseed:{pink:'amber',burgundy:'orange',red:'orange',purple:'orange',blue:'gold',skyblue:'yellow',lightpurple:'amber'},buckwheat:{pink:'lightpurple',burgundy:'gold',red:'gold',orange:'gold',purple:'lightpurple',blue:'lightpurple',skyblue:'lightpurple',creamyellow:'cream'},marigold:{pink:'red',burgundy:'red',yellow:'orange',gold:'orange',skyblue:'blue',lightpurple:'purple'},camellia:{pink:'red',burgundy:'red',yellow:'orange',gold:'orange',skyblue:'blue',lightpurple:'purple'}};
  const assetSpecies=a=>a?.species||a?.bloomVariant?.split('-')[0]||a?.id?.match(/^(?:flower-|loop-)(hydrangea|lavender|rapeseed|buckwheat|marigold|camellia)(?:-|$)/)?.[1]||a?.src?.match(/(?:flower-|flower-blooms\/|animations\/)(hydrangea|lavender|rapeseed|buckwheat|marigold|camellia)(?:-|\/)/)?.[1];
  function objectVariant(o,a){if(a?.stillOnly)return;const type=assetSpecies(a);if(!type)return;const requested=o?.flowerVariant||o?.flowerColor||a.bloomVariant||a.tone;let tone=typeof requested==='string'?requested.replace(new RegExp(`^${type}-`),'').toLowerCase():'';if(!tone||['source','original','default'].includes(tone))tone=a.src?.includes('recolor_')?({buckwheat:'gold',rapeseed:'gold',marigold:'purple'}[type]||bloomManifest?.defaultVariants[type]):bloomManifest?.defaultVariants[type];if(!bloomVariants.has(`${type}-${tone}`))tone=window.jejuFinalCatalog?.flowerAliases?.[type]?.[tone]||legacyFlowerTones[type]?.[tone]||bloomManifest?.defaultVariants[type];if(!bloomVariants.has(`${type}-${tone}`))tone=bloomManifest?.defaultVariants[type];return bloomVariants.get(`${type}-${tone}`)}
  function flowerSource(o,a){return objectVariant(o,a)?.open||a.src}
  function currentFlowerAsset(a){a=window.jejuAmbient.currentAsset(a,window.jejuFinalCatalog);const v=objectVariant({},a);return v?{...a,group:'flowers',species:v.species,tone:v.tone,bloomVariant:v.id,src:v.open,frames:undefined,flowerAnimation:false,legacyFlower:!!a.legacyFlower||!builtins.some(b=>b.id===a.id)}:a}
  function installBloomManifest(data){
    if(data?.mode==='PNG_STATE_PAIR'){window.jejuPngPairs.validate(data);bloomManifest=data;bloomVariants.clear();for(const v of data.variants)bloomVariants.set(v.id,v);return}

    const safe=s=>typeof s==='string'&&s.startsWith('/assets/flower-blooms/')&&!s.includes('..');
    if(!data||!Array.isArray(data.variants)||!data.defaultVariants)throw Error('색상별 꽃 영상 목록 형식이 맞지 않습니다.');
    const next=new Map();for(const v of data.variants){if(!species.some(([id])=>id===v.species)||!/^[a-z]+$/.test(v.tone)||v.id!==`${v.species}-${v.tone}`||next.has(v.id)||(v.ready&&(!safe(v.bud)||!safe(v.open))||!v.ready&&(v.bud!=null&&!safe(v.bud)||v.open!=null&&!safe(v.open)))||v.ready&&(v.fps!==30||v.frameCount!==240||!['GPT_PAIR_TO_SEEDANCE','USER_PROVIDED_RGBA_SEQUENCE'].includes(v.route)))throw Error('색상별 꽃 영상 정보가 올바르지 않습니다.');next.set(v.id,v)}
    for(const [id] of species)if(!next.has(`${id}-${data.defaultVariants[id]}`))throw Error('꽃 기본 색상 정보가 없습니다.');
    for(const a of builtins)if(a.bloomVariant&&!next.has(a.bloomVariant))a.legacyFlower=true;
    bloomManifest=data;bloomVariants.clear();for(const [id,v] of next)bloomVariants.set(id,v);
    for(const a of builtins.filter(a=>a.group==='flowers'&&(!a.bloomVariant||a.legacyFlower))){const type=assetSpecies(a),v=next.get(`${type}-${data.defaultVariants[type]}`);Object.assign(a,{src:v.open,species:type,tone:v.tone,bloomVariant:v.id,legacyFlower:true})}
    for(const v of next.values()){const id=`flower-${v.id}`,name=`${species.find(([s])=>s===v.species)[1]} · ${v.name||toneNames[v.tone]||v.tone}`;const value={id,name,group:'flowers',species:v.species,tone:v.tone,bloomVariant:v.id,src:v.open,bud:v.bud,ready:!!v.ready},existing=builtins.find(a=>a.id===id);if(existing)Object.assign(existing,value);else builtins.push(value)}
    const custom=assets.filter(a=>!builtins.some(b=>b.id===a.id));assets=[...builtins.map(a=>({...a})),...custom];
  }
  let exhibitionActive=false,exhibitionReady=false,workspaceRequest=0;
  const pendingObjectAdds=new Set();
  let objects=[],selected=null,selectedIds=new Set(),background=window.jejuFinalCatalog?.backgrounds?.find(a=>a.id==='BG01-B04-V05')?.src||window.jejuFinalCatalog?.backgrounds?.[0]?.src||'/assets/background/background-14165x3480.webp',reference=null,tab=window.jejuCurrentRelease?'latest':'all',scale=1,panX=0,panY=0,drag=null,space=false,history=[],future=[],fileTarget=null,toastTimer;
  const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
  const current=()=>objects.find(o=>o.id===selected);
  const members=()=>objects.filter(o=>selectedIds.has(o.id));
  const bounds=items=>({x:Math.min(...items.map(o=>o.x)),y:Math.min(...items.map(o=>o.y)),right:Math.max(...items.map(o=>o.x+o.w)),bottom:Math.max(...items.map(o=>o.y+o.h))});
  function selectOne(o){selected=o?.id||null;selectedIds=new Set(o?(o.groupId?objects.filter(x=>x.groupId===o.groupId).map(x=>x.id):[o.id]):[])}
  function selectSameType(o){
    if(!o)return;
    selected=o.id;selectedIds=new Set(objects.filter(x=>x.assetId===o.assetId).map(x=>x.id));
    refresh();notice(`같은 이미지 항목을 사용하는 오브젝트 ${selectedIds.size}개를 선택했습니다.`);
  }
  function selectSameTypeFromEvent(e){
    if(!(e.ctrlKey||e.metaKey)||e.button!==0||e.target.closest('[data-light-handle]'))return;
    const nodes=[e.target.closest('.obj,.layer'),...document.elementsFromPoint(e.clientX,e.clientY)];
    const node=nodes.find(n=>n&&(n.classList.contains('obj')&&els.wall.contains(n)||n.classList.contains('layer')&&els.layers.contains(n)));
    const object=e.target.closest('.group-box .handle')?current():node&&objects.find(o=>o.id===node.dataset.id);if(!object)return;
    e.preventDefault();drag=null;selectSameType(object);
  }
  function syncSelection(){selectedIds=new Set([...selectedIds].filter(id=>objects.some(o=>o.id===id)));if(!objects.some(o=>o.id===selected))selected=members().at(-1)?.id||null}
  const isFlower=o=>assets.find(a=>a.id===o?.assetId)?.group==='flowers';
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const neutralTone=()=>({brightness:100,contrast:100,saturation:100,warmth:0});
  const neutralFilters=()=>({scene:neutralTone(),background:neutralTone(),flowers:neutralTone(),decor:neutralTone()});
  function normalizeFilters(value){const out=neutralFilters();for(const scope of Object.keys(out))for(const key of Object.keys(out[scope])){const v=value?.[scope]?.[key];if(typeof v==='number'&&Number.isFinite(v))out[scope][key]=clamp(v,key==='warmth'?-100:0,key==='warmth'?100:200)}if(value?.backgroundGrade)out.backgroundGrade=window.jejuBackgroundGrade.normalize(value.backgroundGrade);if(value?.focus)out.focus=window.jejuFocus.normalize(value.focus);return out}
  let sceneFilters=neutralFilters(),gardenSpace=window.jejuSpace?.normalize()||{enabled:false};
  let spaceView,lightGizmo,shadowLayer,lightGizmoVisible=false;
  const updateSpaceView=()=>spaceView=window.jejuSpace?.view(objects,assets,W,H,{...gardenSpace,cameraOrbit:false});
  const spacePose=(o,a)=>window.jejuSpace?.pose(o,a,H,gardenSpace,spaceView)||o;
  const spaceOrder=()=>window.jejuSpace?.ordered(objects,assets,H,gardenSpace,spaceView)||objects;
  const displayBounds=items=>bounds(items.map(o=>spacePose(o,assets.find(a=>a.id===o.assetId))));
  const shadows=new Map();let groundGuide;
  function renderSpace(){if(!window.jejuSpace)return;syncSpaceControls();if(!groundGuide){groundGuide=document.createElement("div");groundGuide.className="space-ground-guide";els.wall.append(groundGuide)}groundGuide.style.display=gardenSpace.enabled&&gridVisible?"block":"none";if(groundGuide.dataset.horizon!==String(gardenSpace.horizon)){groundGuide.style.backgroundImage=window.jejuSpace.guide(W,H,gardenSpace);groundGuide.dataset.horizon=String(gardenSpace.horizon)}if(!shadowLayer){shadowLayer=document.createElement('div');shadowLayer.className='ground-shadow-layer';els.wall.append(shadowLayer)}const assetMap=new Map(assets.map(a=>[a.id,a])),ids=new Set(objects.map(o=>o.id)),ranks=new Map(spaceOrder().map((o,i)=>[o.id,i+1]));
    for(const o of objects){
      const a=assetMap.get(o.assetId),p=spacePose(o,a),node=wallNodes.get(o.id);if(node)node.style.zIndex=ranks.get(o.id)*2+1;
      let shadow=shadows.get(o.id);if(p.spaceScale!==undefined&&window.jejuSpace.ground(a)){
        if(!shadow){shadow=document.createElement('div');shadowLayer.append(shadow);shadows.set(o.id,shadow)}
        const cast=window.jejuSpace.lighting(o,a,H,gardenSpace,spaceView).shadow;
        if(cast){
          shadow.className='plant-cast-shadow';let im=shadow.firstElementChild;if(!im){im=document.createElement('img');im.draggable=false;shadow.append(im)}const src=node?.firstElementChild?.src;if(src&&im.src!==src)im.src=src;
          im.style.objectFit=a.sourceRect?.length===4?'fill':'contain';im.style.transform=o.flipX?'scaleX(-1)':'';im.style.objectPosition=a.group==='flowers'?'center bottom':'center';
          Object.assign(shadow.style,{left:'0px',top:'0px',width:p.w+'px',height:p.h+'px',transform:`matrix(${cast.matrix.join(',')})`,transformOrigin:'0 0',filter:`brightness(0) blur(${cast.blur}px)`,opacity:o.opacity*cast.opacity,zIndex:ranks.get(o.id)*2});
        }else{
          if(shadow.firstElementChild)shadow.replaceChildren();shadow.className='plant-contact-shadow';Object.assign(shadow.style,{left:p.rootX-p.w*.36+'px',top:p.rootY-p.w*.07+'px',width:p.w*.72+'px',height:Math.max(10,p.w*.14)+'px',transform:'none',filter:'none',opacity:o.opacity*.38,zIndex:ranks.get(o.id)*2});
        }
      }else if(shadow){shadow.remove();shadows.delete(o.id)}
    }
    for(const [id,shadow] of shadows)if(!ids.has(id)){shadow.remove();shadows.delete(id)}renderLightGizmo();
  }
  function toneCSS(t){const parts=[];if(t.brightness!==100)parts.push(`brightness(${t.brightness}%)`);if(t.contrast!==100)parts.push(`contrast(${t.contrast}%)`);if(t.saturation!==100)parts.push(`saturate(${t.saturation}%)`);if(t.warmth)parts.push(`sepia(${Math.abs(t.warmth)*.25}%)`, `hue-rotate(${t.warmth<0?180:0}deg)`);return parts.join(' ')}
  function filterCSS(scope,pixelScale=1){return [toneCSS(sceneFilters[scope]||neutralTone()),toneCSS(sceneFilters.scene),scope==='background'?window.jejuBackgroundGrade?.css(sceneFilters.backgroundGrade,'jeju-editor-background-grade'):'',scope==='background'?window.jejuFocus?.css(window.jejuFocus.normalize(sceneFilters.focus).background,H,pixelScale):''].filter(Boolean).join(' ')||'none'}
  function objectFilterCSS(o,a,pixelScale=1,height=3480){return [['particle','butterfly'].includes(a?.category)?toneCSS(sceneFilters.scene):filterCSS(a?.group==='flowers'?'flowers':'decor'),a?.group==='flowers'?window.jejuFlowerHue?.css(o.flowerHue):'',window.jejuFocus?.css(window.jejuFocus.amount(o,a,sceneFilters.focus,height,gardenSpace),height,pixelScale)].filter(v=>v&&v!=='none').join(' ')||'none'}
  function syncFilterControls(){const tone=sceneFilters[$('toneScope').value||'scene'];for(const key of Object.keys(tone)){ $('tone_'+key).value=tone[key];$('toneValue_'+key).textContent=tone[key]+(key==='warmth'?'':'%')} }
  function applySceneFilters(){if(wallBackground){wallBackground.style.filter=filterCSS('background');wallBackground.style.transform=`scale(${window.jejuFocus?.backgroundScale(sceneFilters.focus)||1})`}for(const o of objects){const im=wallNodes.get(o.id)?.firstElementChild;if(im){const a=assets.find(a=>a.id===o.assetId),tone=objectFilterCSS(o,a),light=window.jejuSpace?.lighting(o,a,H,gardenSpace,spaceView).brightness??1;im.style.filter=[tone==='none'?'':tone,light===1?'':`brightness(${light})`].filter(Boolean).join(' ')||'none'}}syncFilterControls()}
  function historyState(){return JSON.stringify({objects,sceneFilters,gardenSpace,background})}
  function restoreHistory(text){let value=JSON.parse(text);value=brightBackgroundProject(value)||value;objects=value.objects;sceneFilters=normalizeFilters(value.sceneFilters);gardenSpace=window.jejuSpace?.normalize(value.gardenSpace)||{enabled:false};if('background' in value)background=value.background;if(value.backgroundDefaultVersion===83)backgroundDefaultVersion=83}
  $('openTonePanel').onclick=$('openTonePanelRight').onclick=()=>{syncFilterControls();$('toneDialog').showModal()};
  $('closeTonePanel').onclick=()=>$('toneDialog').close();
  $('toneScope').onchange=syncFilterControls;
  for(const key of Object.keys(neutralTone())){const input=$('tone_'+key);let changing=false;input.oninput=()=>{if(!changing){snapshot();changing=true}sceneFilters[$('toneScope').value][key]=normalizeFilters({[$('toneScope').value]:{[key]:+input.value}})[$('toneScope').value][key];applySceneFilters();scheduleSave()};input.onchange=input.onblur=()=>{changing=false}}
  $('toneReset').onclick=()=>{snapshot();sceneFilters[$('toneScope').value]=neutralTone();applySceneFilters();scheduleSave()};
  $('toneResetAll').onclick=()=>{snapshot();sceneFilters={...neutralFilters(),...(sceneFilters.focus?{focus:sceneFilters.focus}:{})};applySceneFilters();scheduleSave()};
  const blendPresets={
    natural:{name:'부드러운 유화',scene:[100,96,94,8],flowers:[96,96,90,0],decor:[94,94,92,0]},
    morning:{name:'아침 햇살',scene:[103,96,96,12],flowers:[97,92,90,5],decor:[96,95,90,8]},
    forest:{name:'숲의 부드러운 빛',scene:[98,94,94,4],flowers:[96,92,88,4],decor:[92,94,92,2]},
    sunset:{name:'따뜻한 노을',scene:[98,94,98,24],flowers:[90,92,92,12],decor:[88,92,90,15]},
    night:{name:'달빛과 별밤',scene:[92,94,90,-18],flowers:[72,90,84,-30],decor:[70,90,84,-22]}
  };
  function backgroundBlendPreset(src){const path=(src||'').toLowerCase();return /night|starry|milkyway/.test(path)?'night':/sunset|evening|close1|close3/.test(path)?'sunset':/morning/.test(path)?'morning':/forest|close2/.test(path)?'forest':'natural'}
  function applySceneHarmony(checkpoint=true,amount=1){
    const key=window.jejuSceneHarmony.theme(background,window.jejuWhole62?.scenes||[]);if(!key){notice('색감을 맞출 배경을 먼저 선택해 주세요.');return false}
    if(checkpoint)snapshot();sceneFilters=normalizeFilters({...window.jejuSceneHarmony.filters(key,amount),...(sceneFilters.focus?{focus:sceneFilters.focus}:{})});applySceneFilters();scheduleSave();document.dispatchEvent(new Event('jeju-editor-change'));if(checkpoint)notice(window.jejuSceneHarmony.presets[key].name+' · 배경과 꽃·풀·돌 색감을 맞췄습니다.');return true;
  }
  $('applySceneHarmony').onclick=()=>applySceneHarmony();
  $('tonePreset').value='fantasy';$('toneAmount').value=100;
  $('toneAmount').oninput=()=>{$('toneAmountValue').textContent=$('toneAmount').value+'%'};
  $('toneNatural').onclick=()=>{const selected=$('tonePreset').value,key=selected==='auto'?backgroundBlendPreset(background):selected,preset=blendPresets[key]||blendPresets.natural,raw=+$('toneAmount').value,amount=Number.isFinite(raw)?clamp(raw,0,100)/100:1;if(selected==='fantasy'){applySceneHarmony(true,amount);return}snapshot();sceneFilters={...neutralFilters(),...(sceneFilters.focus?{focus:sceneFilters.focus}:{})};for(const scope of ['scene','flowers','decor'])Object.keys(neutralTone()).forEach((name,i)=>{const base=name==='warmth'?0:100;sceneFilters[scope][name]=Math.round(base+(preset[scope][i]-base)*amount)});applySceneFilters();scheduleSave();notice(`배경·꽃·풀에 '${preset.name}' 색감을 ${Math.round(amount*100)}% 적용했습니다.`)};

  const notice=s=>{const e=$('toast');e.textContent=s;e.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.style.display='none',2600)};
  let autosaveReady=false,saveTimer,backgroundDefaultVersion=0;
  const db=()=>new Promise((resolve,reject)=>{const request=indexedDB.open('jeju-maze-wall-editor',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});

  let savedAssetRefs=[];
  async function storeCurrent(){
    const refs=assets.map(a=>({id:a.id,src:a.src,frames:a.frames,previewSrc:a.previewSrc,fps:a.fps,name:a.name}));
    const assetsChanged=refs.length!==savedAssetRefs.length||refs.some((a,i)=>Object.keys(a).some(k=>a[k]!==savedAssetRefs[i]?.[k]));
    const data={name:$('saveName').value,objects,background,backgroundLoop:window.jejuSeparatedLoops?.backgrounds?.find(b=>b.sourcePNG===background)?.video,reference,sceneFilters,gardenSpace,flowerAssetVersion:2,oilAssetVersion:14,backgroundDefaultVersion,assetRecord:'current-assets'};const database=await db();
    await new Promise((resolve,reject)=>{const tx=database.transaction('projects','readwrite'),store=tx.objectStore('projects');if(assetsChanged)store.put(assets,'current-assets');store.put(data,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});database.close();if(assetsChanged)savedAssetRefs=refs;
  }
  async function readCurrent(){const database=await db();const data=await new Promise((resolve,reject)=>{const tx=database.transaction('projects','readonly'),store=tx.objectStore('projects'),request=store.get('current');request.onsuccess=()=>{const data=request.result;if(data?.assetRecord){const assetRequest=store.get(data.assetRecord);assetRequest.onsuccess=()=>{data.assets=assetRequest.result||[];resolve(data)};assetRequest.onerror=()=>reject(assetRequest.error)}else resolve(data)};request.onerror=()=>reject(request.error)});database.close();return data}
  async function namedStore(mode,key,value){
    const database=await db();
    try{return await new Promise((resolve,reject)=>{
      const readonly=mode==='read'||mode==='list',tx=database.transaction('projects',readonly?'readonly':'readwrite'),store=tx.objectStore('projects');
      const request=mode==='list'?store.getAllKeys():mode==='read'?store.get(key):mode==='delete'?store.delete(key):store.put(value,key);let result;
      request.onsuccess=()=>{result=request.result;if(readonly)resolve(result)};
      request.onerror=()=>reject(request.error);tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(tx.error||Error('저장본 보관을 완료하지 못했습니다.'));
    })}finally{database.close()}
  }
  async function updateSavedLayouts(prefer){const select=$('savedLayouts'),previous=prefer??select.value;const keys=(await namedStore('list')).filter(x=>typeof x==='string'&&x.startsWith('named:')).sort((a,b)=>a.localeCompare(b,'ko'));select.replaceChildren(new Option('자동 저장 (최근 작업)',''));for(const key of keys)select.add(new Option(key.slice(6),key));select.value=keys.includes(previous)?previous:'';$('deleteSaved').disabled=!select.value}
  $('savedLayouts').onchange=()=>{$('deleteSaved').disabled=!$('savedLayouts').value;if($('savedLayouts').value)$('saveName').value=$('savedLayouts').selectedOptions[0].textContent};
  function scheduleSave(){if(!autosaveReady)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeCurrent().catch(()=>{}),900)}
  async function migrateLongStems(data){data.flowerAssetVersion=2}
  async function applyProject(data,options={}){const migrated=options.preserveBackground?null:brightBackgroundProject(data);if(migrated&&!options.startup)await image(migrated.background);data=migrated||structuredClone(data);backgroundDefaultVersion=Number.isInteger(data.backgroundDefaultVersion)?data.backgroundDefaultVersion:0;if(!options.startup)backgroundDefaultVersion=Math.max(83,backgroundDefaultVersion);data=window.jejuAmbient.cleanProject(data);assets=[...builtins,...(data.assets||[]).filter(a=>!builtins.some(b=>b.id===a.id)).map(currentFlowerAsset)];objects=data.objects||[];objects.forEach(o=>{o.baseW||=o.w;o.baseH||=o.h;o.aspect||=o.w/o.h});await migrateLongStems(data);$('saveName').value=data.name||'불러온 배치';background=options.preserveBackground?data.background||null:window.jejuFinalCatalog?.backgroundAliases?.[data.background?.split(/[?#]/)[0]]||data.background||null;reference=data.reference||null;sceneFilters=normalizeFilters(data.sceneFilters);gardenSpace=window.jejuSpace?.normalize(data.gardenSpace)||{enabled:false};selected=null;selectedIds.clear();history=[];future=[];$('reference').src=reference||'';$('reference').classList.toggle('hidden',!reference);renderPalette();refresh()}
  function brightBackgroundProject(data){
    const catalog=window.jejuFinalCatalog,base=typeof data.background==='string'?data.background.split(/[?#]/)[0]:data.background,replacements=catalog.backgroundReplacements;
    if(!Object.hasOwn(replacements||{},base))return null;
    const target=catalog.backgrounds.find(a=>a.src===replacements[base]);
    if(!target?.src)throw Error('같은 시간대의 밝은 기본 배경이 등록되어 있지 않습니다.');
    const project=structuredClone(data);project.background=target.src;project.backgroundDefaultVersion=83;
    project.sceneFilters={...(project.sceneFilters||{}),scene:neutralTone(),background:neutralTone(),backgroundGrade:window.jejuBackgroundGrade.normalize()};
    return project;
  }
  async function startupText(path){const response=await fetch(path);if(!response.ok)throw Error('밝은 기본 배치 파일을 내려받지 못했습니다.');return response.text();}
  async function startupHash(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text.replace(/\r\n/g,'\n')))),v=>v.toString(16).padStart(2,'0')).join('');}
  async function loadBrightDefault(){
    if(window.jejuCurrentRelease)return window.jejuCurrentProjects.load('sunset',window.jejuCurrentRelease,fetch.bind(window),window.JejuSetRenderer,crypto,image).then(p=>window.jejuSeparatedLoops?window.jejuSeparatedMotion.project(p,window.jejuSeparatedLoops,false,window.jejuCurrentRelease.assets.filter(a=>a.category==='particle')):p);
    const registry=window.jejuSetReviewElements,text=await startupText('assets/set-review-v01/manifest.json?v=80');
    if(!/^[a-f0-9]{64}$/.test(registry?.manifestSha256||'')||await startupHash(text)!==registry.manifestSha256)throw Error('밝은 기본 배치의 요소 목록 서명이 다릅니다.');
    const manifest=JSON.parse(text),scene=manifest.backgrounds?.find(s=>s.id==='sunset');
    const ref=scene?.integrated?.slice().reverse().find(a=>a.sourceProject===scene.project&&a.construction==='same-png-layout-render');
    if(manifest.format!=='jeju-set-review-v1'||manifest.assetVersion!=='V05'||scene?.projectVersion!=='V06'||scene.project!=='assets/set-review-v01/sunset_editor_v06.json'||ref?.version!=='V06'||!/^[a-f0-9]{64}$/.test(ref?.sourceProjectSha256||'')||!Array.isArray(registry.assets)||registry.assets.length!==120)throw Error('밝은 V06 기본 배치가 아직 준비되지 않았습니다.');
    const projectText=await startupText(scene.project+'?v=80');if(await startupHash(projectText)!==ref.sourceProjectSha256)throw Error('밝은 기본 배치와 통합본의 서명이 다릅니다.');
    const project=window.JejuSetRenderer.validate(JSON.parse(projectText)),expected=new Map([...scene.flowers,...scene.environment].map(a=>[a.id,a])),registered=new Map(registry.assets.map(a=>[a.id,a]));
    const bg=scene.backgrounds.find(a=>a.id==='BG01-B04-V05');
    if(project.width!==W||project.height!==H||project.setReviewVersion!=='V06'||project.sourcePngVersion!=='V05'||project.assets.length!==30||project.objects.length!==356||expected.size!==30||project.background!==bg?.src||project.backgroundFit!=='fill')throw Error('밝은 기본 배치의 크기 또는 요소 구성이 다릅니다.');
    for(const a of project.assets){const source=expected.get(a.id),current=registered.get(a.id);if(!source||!current||a.theme!=='sunset'||a.src!==source.src||a.src!==current.src||a.sha256!==source.sha256||a.sha256!==current.sha256||!a.completeObject||!a.stillOnly||!a.lightingBaked||a.sourceRect!==undefined)throw Error('밝은 기본 배치의 독립 PNG 정보가 다릅니다.');}
    const flowers=new Set(project.assets.filter(a=>a.group==='flowers').map(a=>a.id));if(project.objects.filter(o=>flowers.has(o.assetId)).length!==320)throw Error('밝은 기본 배치의 꽃 개수가 다릅니다.');
    try{await Promise.all([project.background,...project.assets.map(a=>a.src)].map(image));}catch{throw Error('밝은 기본 배경과 꽃 PNG를 준비하지 못했습니다.');}
    return{...project,backgroundDefaultVersion:83};
  }
  async function restoreCurrent(){
    let data;autosaveReady=false;clearTimeout(saveTimer);
    try{
      data=await readCurrent();
      if(data){
        if(!Array.isArray(data.objects)||!Array.isArray(data.assets))throw Error('저장된 배치 형식을 확인할 수 없어 자동 교체를 중단했습니다.');
        const migrated=brightBackgroundProject(data),legacy=data.oilAssetVersion!==14;
        if(migrated)try{await image(migrated.background);}catch{throw Error('밝은 배경 원본을 준비하지 못해 기존 화면을 유지합니다.');}
        if(migrated||legacy){const key='named:'+(migrated?'밝은 배경 적용 전 ':'유화 v14 교체 전 ')+new Date().toLocaleString('ko-KR')+' · '+uid();await namedStore('write',key,structuredClone(data));}
        const project=migrated||structuredClone(data);if(legacy)project.backgroundDefaultVersion=83;
        await applyProject(project,{startup:true});
        if(migrated){history.push(JSON.stringify({objects:data.objects,background:data.background,sceneFilters:normalizeFilters(data.sceneFilters),gardenSpace:window.jejuSpace?.normalize(data.gardenSpace)||{enabled:false}}));syncUndo();}
        if(migrated||legacy)await storeCurrent();autosaveReady=true;
        if(migrated)notice('꽃 배치를 보존하고 밝은 기본 배경을 적용했습니다. 이전 화면은 저장본에 보관했습니다.');
        return true;
      }
      await applyProject(await loadBrightDefault(),{startup:true});await storeCurrent();autosaveReady=true;return true;
    }catch(error){
      if(data&&Array.isArray(data.objects)&&Array.isArray(data.assets))try{await applyProject(structuredClone(data),{startup:true,preserveBackground:true});}catch{}
      autosaveReady=false;notice('저장본을 보호하기 위해 자동 교체를 중단했습니다: '+error.message);throw error;
    }
  }
  $('saveCurrent').onclick=async()=>{const name=$('saveName').value.trim();if(!name){$('saveName').focus();notice('저장할 배치 이름을 입력해 주세요.');return}clearTimeout(saveTimer);try{const data={name,assets,objects,background,backgroundLoop:window.jejuSeparatedLoops?.backgrounds?.find(b=>b.sourcePNG===background)?.video,reference,sceneFilters,gardenSpace,flowerAssetVersion:2,oilAssetVersion:14,backgroundDefaultVersion,savedAt:new Date().toISOString()};await namedStore('write',`named:${name}`,data);await storeCurrent();await updateSavedLayouts(`named:${name}`);notice(`“${name}” 배치를 저장했습니다.`)}catch{notice('저장에 실패했습니다. 프로젝트 파일로 저장해 주세요.')}};
  $('loadCurrent').onclick=async()=>{const key=$('savedLayouts').value;if(!key){const ok=await restoreCurrent();notice(ok?'자동 저장된 최근 작업을 불러왔습니다.':'저장된 배치가 없습니다.');return}try{const data=await namedStore('read',key);if(!data)throw Error('저장본 없음');clearTimeout(saveTimer);await applyProject(data);$('saveName').value=data.name||key.slice(6);notice(`“${$('saveName').value}” 배치를 불러왔습니다.`)}catch{notice('선택한 배치를 불러오지 못했습니다.')}};
  $('deleteSaved').onclick=async()=>{const key=$('savedLayouts').value;if(!key)return;if(!confirm(`“${key.slice(6)}” 저장본을 삭제할까요?`))return;try{await namedStore('delete',key);await updateSavedLayouts('');notice('선택한 저장본을 삭제했습니다.')}catch{notice('저장본을 삭제하지 못했습니다.')}};
  function snapshot(){history.push(historyState());if(history.length>70)history.shift();future=[];syncUndo()}
  function syncUndo(){$('undo').disabled=!history.length;$('redo').disabled=!future.length}
  function refresh(){if(assets.some(window.jejuAmbient.isRetired)||objects.some(o=>window.jejuAmbient.isRetired({id:o.assetId}))){const clean=window.jejuAmbient.cleanProject({assets,objects});assets=clean.assets;objects=clean.objects;syncSelection();renderPalette()}renderWall();renderLayers();renderProperties();syncUndo();scheduleSave();document.dispatchEvent(new Event('jeju-editor-change'))}

  const wallNodes=new Map();let wallBackground=null,selectionBox=null,guideNode=null,guideKey='',sequenceTargets=[];
  function updateWallTransform(){els.wall.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;els.wall.style.setProperty('--inv',1/scale)}
  function objectHandles(node,enabled){
    if(node.dataset.handles===String(enabled))return;node.dataset.handles=String(enabled);
    node.querySelectorAll('.handle').forEach(h=>h.remove());
    if(enabled)for(const cls of ['resize','rotate','depth']){const h=document.createElement(cls==='depth'?'button':'div');h.className='handle '+cls;h.dataset.handle=cls;if(cls==='depth'){h.textContent='Z';h.title='Z축 앞뒤 이동 · 위로 끌면 앞으로';h.type='button';h.setAttribute('aria-label','Z축 깊이 피봇');h.onkeydown=e=>{if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;e.preventDefault();e.stopPropagation();snapshot();ensureSpatial();for(const o of members())o.z=clamp((o.z||0)+(e.key==='ArrowUp'?50:-50),-2000,2000);refresh()}}node.append(h)}
  }
  function renderMovingObjects(){
    updateSpaceView();
    const chosen=members();
    for(const o of chosen){const node=wallNodes.get(o.id),asset=assets.find(a=>a.id===o.assetId),display=spacePose(window.jejuAmbient.driftPose(o,window.jejuAmbient.atmosphereKind(asset),sequenceTime,W,asset),asset);if(node)Object.assign(node.style,{left:display.x+'px',top:display.y+'px',width:display.w+'px',height:display.h+'px',transform:window.jejuSpace?.transform(display)||`rotate(${o.r}deg)`,clipPath:o.placementRole==='foreground_fill_v67'?window.jejuForegroundFill.clipPath(display,W,H):''})}
    renderSpace();applySceneFilters();
    if(selectionBox&&chosen.length){const b=displayBounds(chosen);Object.assign(selectionBox.style,{left:b.x+'px',top:b.y+'px',width:b.right-b.x+'px',height:b.bottom-b.y+'px'})}
  }
  function renderWall(){
    updateSpaceView();
    syncBackgroundSelect();
    updateWallTransform();els.wall.classList.toggle('has-bg',!!background);
    if(background){const video=backgroundVideos[background],tag=video?'VIDEO':'IMG';if(wallBackground&&wallBackground.tagName!==tag){wallBackground.pause?.();wallBackground.parentElement.remove();wallBackground=null}if(!wallBackground){wallBackground=document.createElement(video?'video':'img');wallBackground.className='bg';if(video){wallBackground.loop=true;wallBackground.muted=true;wallBackground.playsInline=true;wallBackground.preload='auto';wallBackground.onerror=()=>notice('배경 영상을 불러오지 못했습니다.')}else wallBackground.decoding='async';const clip=document.createElement("div");clip.className="background-clip";clip.style.cssText="position:absolute;inset:0;overflow:hidden;pointer-events:none";clip.append(wallBackground);els.wall.prepend(clip)}const src=video?(video.fallbackSrc&&wallBackground.canPlayType?.('video/mp4; codecs="av01.0.08M.08"')===''?video.fallbackSrc:background)+(video.revision||''):displaySrc(background);wallBackground.style.objectFit=sourceRegistered.has(background)?'fill':'cover';if(wallBackground.dataset.src!==src){if(video)wallBackground.poster=video.poster;wallBackground.src=src;wallBackground.dataset.src=src}}
    else if(wallBackground){wallBackground.pause?.();wallBackground.parentElement.remove();wallBackground=null}
    updateBackgroundPlayback();
    const assetMap=new Map(assets.map(a=>[a.id,a])),ids=new Set(),nextSequences=[];
    objects.forEach((o,i)=>{
      const a=assetMap.get(o.assetId);if(!a?.src)return;ids.add(o.id);const display=spacePose(window.jejuAmbient.driftPose(o,window.jejuAmbient.atmosphereKind(a),sequenceTime,W,a),a);
      let node=wallNodes.get(o.id);
      if(!node){node=document.createElement('div');node.dataset.id=o.id;const im=document.createElement('img');im.draggable=false;im.decoding='async';node.append(im);wallNodes.set(o.id,node);els.wall.append(node)}
      node.className='obj'+(selectedIds.has(o.id)?' selected':'');node.style.pointerEvents=a.completeObject&&a.category==='particle'&&!selectedIds.has(o.id)?'none':'';
      Object.assign(node.style,{left:display.x+'px',top:display.y+'px',width:display.w+'px',height:display.h+'px',transform:window.jejuSpace?.transform(display)||`rotate(${o.r}deg)`,opacity:o.opacity,zIndex:i+1,clipPath:o.placementRole==='foreground_fill_v67'?window.jejuForegroundFill.clipPath(display,W,H):''});
      const im=node.firstElementChild,src=a.frames?sequenceSrc(a):displaySrc(a.group==='flowers'?flowerSource(o,a):a.src);
      setFlowerImage(im,src);im.style.objectFit=a.sourceRect?.length===4?'fill':'contain';
      im.style.transform=o.flipX?'scaleX(-1)':'';im.style.objectPosition=a.group==='flowers'?'center bottom':'center';
      if(a.frames?.length||window.jejuAmbient.atmosphereKind(a))nextSequences.push({img:im,asset:a,node,object:o});
      im.style.filter=window.jejuAmbient.atmosphereKind(a)&&!a.sourceDriveId&&!a.lightingBaked?'grayscale(1)':'';
      objectHandles(node,false);
    });
    for(const [id,node] of wallNodes)if(!ids.has(id)){node.remove();wallNodes.delete(id)}
    sequenceTargets=nextSequences;
    syncSequenceAssets();
    const chosen=members();
    if(chosen.length){if(!selectionBox){selectionBox=document.createElement('div');selectionBox.className='group-box selected';selectionBox.dataset.groupBox='1';objectHandles(selectionBox,true);els.wall.append(selectionBox)}const b=displayBounds(chosen);Object.assign(selectionBox.style,{left:b.x+'px',top:b.y+'px',width:b.right-b.x+'px',height:b.bottom-b.y+'px',zIndex:objects.length*2+3})}
    else if(selectionBox){selectionBox.remove();selectionBox=null}
    const nextGuideKey=[scale,gridVisible,guidesVisible].join(':');
    if(guideKey!==nextGuideKey){guideNode?.remove();guideNode=document.createElement('div');Object.assign(guideNode.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:10000});els.wall.append(guideNode);drawGuides();guideKey=nextGuideKey}
    renderSpace();
    els.zoom.textContent=Math.round(scale*100)+'%';els.count.textContent=objects.length+'개';syncSequenceLoop();applySceneFilters();
  }
  function renderLayers(){els.layers.innerHTML='';if(!objects.length){els.layers.innerHTML='<div class="empty">꽃을 화면에 배치하면 여기에서 겹친 오브젝트까지 선택할 수 있습니다.</div>';for(const id of ['layerUp','layerDown','layerUp10','layerDown10','layerUp30','layerDown30','layerFront','layerBack','makeGroup','ungroup','ungroupSelected'])$(id).disabled=true;return}const shownGroups=new Set();objects.slice().reverse().forEach((o,i)=>{if(o.groupId&&!shownGroups.has(o.groupId)){const label=document.createElement('button');label.className='group-label'+(selectedIds.has(o.id)?' active':'');label.type='button';label.title='클릭하여 그룹 전체 선택 · 아래에서 그룹 풀기';label.textContent=`▦ ${o.groupName||'그룹'} · ${objects.filter(x=>x.groupId===o.groupId).length}개`;label.onclick=()=>{selected=o.id;selectedIds=new Set(objects.filter(x=>x.groupId===o.groupId).map(x=>x.id));refresh()};els.layers.append(label);shownGroups.add(o.groupId)}const a=assets.find(x=>x.id===o.assetId);const b=document.createElement('button');b.className='layer'+(selectedIds.has(o.id)?' active':'')+(o.groupId?' grouped':'');b.title='Ctrl/⌘+더블클릭 같은 이미지 전체 선택 · Ctrl/⌘·Shift로 여러 레이어 선택 · 끌어서 순서 변경';b.draggable=true;b.dataset.id=o.id;const im=document.createElement('img');im.className='thumb';im.src=displaySrc(a?.src,'thumb')||'';im.draggable=false;const txt=document.createElement('span');txt.textContent=o.name;const sub=document.createElement('small');sub.textContent=`레이어 ${objects.length-i}`;txt.append(sub);b.append(im,txt);b.onclick=e=>{if(e.shiftKey&&selected){const rows=objects.slice().reverse(),from=rows.findIndex(x=>x.id===selected),to=rows.findIndex(x=>x.id===o.id);for(const x of rows.slice(Math.min(from,to),Math.max(from,to)+1))selectedIds.add(x.id);selected=o.id}else if(e.ctrlKey||e.metaKey){if(selectedIds.has(o.id))selectedIds.delete(o.id);else selectedIds.add(o.id);selected=selectedIds.has(o.id)?o.id:(members().at(-1)?.id||null)}else selectOne(o);refresh()};b.ondragstart=e=>{e.dataTransfer.setData('application/x-maze-layer',o.id);e.dataTransfer.effectAllowed='move';b.classList.add('dragging')};b.ondragend=()=>document.querySelectorAll('.layer').forEach(x=>x.classList.remove('dragging','drop-target'));b.ondragover=e=>{if(!e.dataTransfer.types.includes('application/x-maze-layer'))return;e.preventDefault();e.dataTransfer.dropEffect='move';b.classList.add('drop-target')};b.ondragleave=()=>b.classList.remove('drop-target');b.ondrop=e=>{e.preventDefault();b.classList.remove('drop-target');const source=objects.find(x=>x.id===e.dataTransfer.getData('application/x-maze-layer'));if(!source||source.id===o.id||source.groupId&&source.groupId===o.groupId)return;const moving=source.groupId?objects.filter(x=>x.groupId===source.groupId):[source];let to=objects.findIndex(x=>x.id===o.id);if(o.groupId)to=objects.findIndex(x=>x.groupId===o.groupId);snapshot();const ids=new Set(moving.map(x=>x.id));to-=objects.slice(0,to).filter(x=>ids.has(x.id)).length;objects=objects.filter(x=>!ids.has(x.id));objects.splice(to,0,...moving);selectOne(source);refresh()};els.layers.append(b)});$('layerUp').disabled=!current()||objects.at(-1)?.id===selected;$('layerDown').disabled=!current()||objects[0]?.id===selected;$('layerUp10').disabled=$('layerUp').disabled;$('layerDown10').disabled=$('layerDown').disabled;const moving=members();$('layerFront').disabled=$('layerUp30').disabled=!moving.length||objects.slice(-moving.length).every(o=>selectedIds.has(o.id));$('layerBack').disabled=$('layerDown30').disabled=!moving.length||objects.slice(0,moving.length).every(o=>selectedIds.has(o.id));$('makeGroup').disabled=selectedIds.size<2;$('ungroup').disabled=!members().some(x=>x.groupId);$('ungroupSelected').disabled=$('ungroup').disabled}
  function renderProperties(){const o=current(),items=members();$('noSelection').classList.toggle('hidden',!!o);$('properties').classList.toggle('hidden',!o);if(!o)return;const b=items.length>1?bounds(items):null;$('ratioNote').classList.toggle('hidden',!!b||!isFlower(o));for(const [key,val] of Object.entries({Name:b?(o.groupName||`${items.length}개 선택`):o.name,X:b?b.x:o.x,Y:b?b.y:o.y,W:b?b.right-b.x:o.w,H:b?b.bottom-b.y:o.h,Scale:100*o.w/(o.baseW||o.w),R:b?0:o.r,Z:o.z||0,RX:o.rx||0,RY:o.ry||0,O:Math.round(o.opacity*100)}))$('prop'+key).value=typeof val==='number'?Math.round(val):val}
  function renderPalette(){els.items.innerHTML='';assets.filter(a=>!a.catalogHidden&&(!window.jejuCurrentRelease||['set-v05','shape80','atmosphere84','atmosphere85'].includes(tab)||window.jejuCurrentRelease.assets.some(v=>v.id===a.id)||!window.jejuFinalCatalog.assets.some(v=>v.id===a.id))&&!a.referenceOnly&&!a.legacyFlower&&a.group!=='petals'&&(tab==='all'||tab==='latest'&&(window.jejuCurrentRelease?window.jejuCurrentRelease.assets.some(v=>v.id===a.id):a.imageStyleVersion===68)||tab==='shape80'&&a.artStyleVersion===83||tab==='atmosphere84'&&a.atmosphereVersion===84||tab==='atmosphere85'&&a.atmosphereVersion===85||tab==='set-v05'&&a.setReviewVersion==='V05'&&a.theme===$('setReviewPaletteTheme').value&&(!$('setReviewPaletteKind').value||a.category===$('setReviewPaletteKind').value)||a.group===tab&&(tab!=='decor'||!window.jejuCurrentRelease||!a.atmosphereVersion&&a.category!=='background'))).sort((a,b)=>(b.imageStyleVersion||0)-(a.imageStyleVersion||0)).forEach(a=>{const d=document.createElement('div');d.className='tile';d.draggable=!!a.src&&a.ready!==false;d.setAttribute('aria-disabled',String(a.ready===false));d.title=a.src?'클릭하거나 캔버스로 드래그해 배치':'클릭하여 이미지 연결';d.dataset.asset=a.id;if(a.src){const img=document.createElement('img');img.src=displaySrc(a.src,'thumb');img.alt=a.name;img.loading='lazy';img.decoding='async';img.onerror=()=>{d.classList.add('image-error');d.title='이미지 로딩에 실패했습니다. 새로고침 후 다시 시도해 주세요.'};d.append(img)}else{const ph=document.createElement('div');ph.className='placeholder';ph.textContent=a.ready===false?'준비 중':'＋';d.append(ph)}const t=document.createElement('small');t.textContent=a.name+(a.ready===false?' · 준비 중':'');d.append(t);d.onclick=()=>{if(a.ready===false){notice('이 색상 영상은 아직 준비 중입니다.');return}if(a.src)addObject(a,W/2,H*(a.atmosphere==='cloud'?.16:a.atmosphere==='mist'?.62:.5));else{fileTarget=a.id;$('assetFiles').click()}};d.ondragstart=e=>{if(!a.src||a.ready===false){e.preventDefault();return}e.dataTransfer.setData('text/plain',a.id);e.dataTransfer.effectAllowed='copy'};els.items.append(d)})}
  function addObject(a,x,y){if(!a?.src||a.ready===false)return Promise.resolve();const task=image(a.frames?sequenceFrame(a,0):displaySrc(a.src)).then(im=>{snapshot();const atmosphere=window.jejuAmbient.atmosphereKind(a),flowerScale=a.group==='flowers'?.5:1,w=(a.defaultWidthMm||(atmosphere?W*(atmosphere==='cloud'?.2:.45):(a.group==='flowers'||a.flowerAnimation)?270:900))*flowerScale,h=a.defaultHeightMm?a.defaultHeightMm*flowerScale:((atmosphere||a.group==='flowers'||a.frames)?w*im.naturalHeight/im.naturalWidth:900);const o={id:uid(),assetId:a.id,name:a.name,x:clamp(x-w/2,0,W-w),y:clamp(y-h/2,0,H-h),w,h,baseW:w,baseH:h,aspect:w/h,r:0,...(a.group==='flowers'?{defaultFlowerScale:.5}:{}),opacity:atmosphere?(atmosphere==='cloud'?.65:.3):1,...(a.motion?{motion:a.motion}:{}),...(a.bloomVariant?{flowerVariant:a.bloomVariant,flowerColor:a.tone}:{})};if(gardenSpace.enabled&&window.jejuSpace?.ground(a)){o.x=x-w/2;o.y=(window.jejuSpace.floorCover(a)?Math.max(y,H*gardenSpace.horizon):clamp(y,H*gardenSpace.horizon,H*.98))-h}if(atmosphere)objects.unshift(o);else objects.push(o);selectOne(o);refresh()}).catch(()=>notice('이미지를 읽을 수 없습니다.')).finally(()=>pendingObjectAdds.delete(task));pendingObjectAdds.add(task);return task}

  function viewPoint(e){const rect=els.view.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top}}
  function worldPoint(e){const p=viewPoint(e);return{x:(p.x-panX)/scale,y:(p.y-panY)/scale}}
  function fit(){const r=els.view.getBoundingClientRect();scale=Math.min((r.width-48)/W,(r.height-110)/H);panX=(r.width-W*scale)/2;panY=(r.height-H*scale)/2;renderWall()}
  function zoom(factor,pt){const p=pt||{x:els.view.clientWidth/2,y:els.view.clientHeight/2},old=scale;scale=clamp(scale*factor,.015,1.25);panX=p.x-(p.x-panX)*scale/old;panY=p.y-(p.y-panY)*scale/old;renderWall()}
  els.view.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.14:1/1.14,viewPoint(e))},{passive:false});
  const marquee=document.createElement('div');marquee.className='marquee';els.view.append(marquee);
  els.view.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==1)return;els.view.focus({preventScroll:true});const p=viewPoint(e),wp=worldPoint(e),obj=e.target.closest('.obj')||(e.shiftKey&&!e.target.dataset.handle?document.elementsFromPoint(e.clientX,e.clientY).find(node=>node.classList.contains('obj')):null),groupBox=e.target.closest('.group-box');const lamp=e.target.closest('[data-light-handle]');if(lamp){snapshot();drag={mode:'light-'+lamp.dataset.lightHandle,p,wp,light:{...gardenSpace.light},center:window.jejuSpace.lightPose(H,gardenSpace,spaceView)};e.preventDefault();return}if(space||e.button===1){drag={mode:'pan',p,startX:panX,startY:panY};els.view.classList.add('grabbing');e.preventDefault();return}if(!obj&&!groupBox){drag={mode:'marquee',p,wp,initial:e.shiftKey?new Set(selectedIds):new Set(),moved:false};e.preventDefault();return}if(obj&&e.shiftKey&&!e.target.dataset.handle){const id=obj.dataset.id;if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);selected=selectedIds.has(id)?id:(members().at(-1)?.id||null);drag=null;refresh();e.preventDefault();return}if(obj&&!selectedIds.has(obj.dataset.id))selectOne(objects.find(x=>x.id===obj.dataset.id));const o=current();if(!o)return;snapshot();const items=members(),b=bounds(items),handle=e.target.dataset.handle;drag={mode:handle||'move',p,wp,start:{...o},startMembers:items.map(x=>({...x})),bounds:b,objectById:new Map(objects.map(o=>[o.id,o])),center:{x:(b.x+b.right)/2,y:(b.y+b.bottom)/2}};refresh();e.preventDefault()});
  function processPointerMove(e){if(!drag)return;const p=viewPoint(e);if(drag.mode.startsWith('light-')){const dx=(p.x-drag.p.x)/scale,dy=(p.y-drag.p.y)/scale,key=drag.mode.slice(6),l={...drag.light};if(key==='xy'){const f=gardenSpace.spatial?Math.max(.2,(spaceView.distance-l.z)/spaceView.distance):1;l.x+=dx*f;l.y+=dy*f}else if(key==='z')l.z-=dy;else if(key==='rx')l.rx-=p.y-drag.p.y;else if(key==='ry')l.ry+=p.x-drag.p.x;else if(key==='rz'){const w=worldPoint(e);const a=Math.atan2(w.y-drag.center.y,w.x-drag.center.x)-Math.atan2(drag.wp.y-drag.center.y,drag.wp.x-drag.center.x);l.rz+=Math.atan2(Math.sin(a),Math.cos(a))*180/Math.PI}gardenSpace.light=window.jejuSpace.normalizeLight(l);renderSpace();applySceneFilters();return}if(drag.mode==='pan'){panX=drag.startX+p.x-drag.p.x;panY=drag.startY+p.y-drag.p.y;updateWallTransform();return}if(drag.mode==='marquee'){if(Math.hypot(p.x-drag.p.x,p.y-drag.p.y)<4&&!drag.moved)return;drag.moved=true;const l=Math.min(drag.p.x,p.x),t=Math.min(drag.p.y,p.y),r=Math.max(drag.p.x,p.x),b=Math.max(drag.p.y,p.y);Object.assign(marquee.style,{display:'block',left:l+'px',top:t+'px',width:r-l+'px',height:b-t+'px'});const wx=(l-panX)/scale,wy=(t-panY)/scale,wr=(r-panX)/scale,wb=(b-panY)/scale;selectedIds=new Set(drag.initial);for(const item of objects)if((()=>{const p=spacePose(item,assets.find(a=>a.id===item.assetId));return p.x<wr&&p.x+p.w>wx&&p.y<wb&&p.y+p.h>wy})())selectedIds.add(item.id);selected=members().at(-1)?.id||null;renderWall();renderLayers();renderProperties();return}const o=current();if(!o)return;const dx=(p.x-drag.p.x)/scale,dy=(p.y-drag.p.y)/scale,s=drag.start,group=drag.startMembers.length>1;if(drag.mode==='depth'){ensureSpatial();for(const start of drag.startMembers){const item=drag.objectById.get(start.id);if(item)item.z=clamp((start.z||0)-dy,-2000,2000)}}else if(drag.mode==='move'){for(const start of drag.startMembers){const item=drag.objectById.get(start.id);if(!item)continue;item.x=clamp(start.x+dx,-start.w+30,W-30);item.y=clamp(start.y+dy,-start.h+30,window.jejuSpace?.floorCover(assets.find(a=>a.id===item.assetId))?100000:H-30);if(e.shiftKey){if(Math.abs(dx)>Math.abs(dy))item.y=start.y;else item.x=start.x}}}else if(drag.mode==='resize'){if(group){const b=drag.bounds,f=Math.max(.1,1+Math.max(dx/(b.right-b.x),dy/(b.bottom-b.y)));for(const start of drag.startMembers){const item=drag.objectById.get(start.id);if(!item)continue;item.x=b.x+(start.x-b.x)*f;item.y=b.y+(start.y-b.y)*f;item.w=start.w*f;item.h=start.h*f}}else{const rad=-s.r*Math.PI/180,localX=dx*Math.cos(rad)-dy*Math.sin(rad),localY=dx*Math.sin(rad)+dy*Math.cos(rad);const ratio=s.aspect||s.w/s.h;if(isFlower(o)||e.shiftKey){const w=Math.max(40,s.w+localX);o.w=w;o.h=w/ratio}else{o.w=Math.max(40,s.w+localX);o.h=Math.max(40,s.h+localY)}}}else if(drag.mode==='rotate'){const w=worldPoint(e);if(group){const first=Math.atan2(drag.wp.y-drag.center.y,drag.wp.x-drag.center.x),next=Math.atan2(w.y-drag.center.y,w.x-drag.center.x),deg=(next-first)*180/Math.PI,angle=(e.shiftKey?Math.round(deg/15)*15:deg)*Math.PI/180;for(const start of drag.startMembers){const item=drag.objectById.get(start.id);if(!item)continue;const cx=start.x+start.w/2-drag.center.x,cy=start.y+start.h/2-drag.center.y;item.x=drag.center.x+cx*Math.cos(angle)-cy*Math.sin(angle)-start.w/2;item.y=drag.center.y+cx*Math.sin(angle)+cy*Math.cos(angle)-start.h/2;item.r=start.r+angle*180/Math.PI}}else{o.r=Math.round(Math.atan2(w.y-drag.center.y,w.x-drag.center.x)*180/Math.PI+90);if(e.shiftKey)o.r=Math.round(o.r/15)*15}}renderMovingObjects();renderProperties()}
  let pendingPointer=null,pointerRaf=0;
  function flushPointerMove(){if(pointerRaf)cancelAnimationFrame(pointerRaf);pointerRaf=0;const e=pendingPointer;pendingPointer=null;if(e)processPointerMove(e)}
  window.addEventListener('pointermove',e=>{if(!drag)return;pendingPointer=e;if(!pointerRaf)pointerRaf=requestAnimationFrame(flushPointerMove)});
  window.addEventListener('pointerup',()=>{flushPointerMove();if(drag?.mode==='marquee'){marquee.style.display='none';if(!drag.moved){selectedIds=new Set(drag.initial);selected=members().at(-1)?.id||null;refresh()}}else if(drag&&drag.mode!=='pan')scheduleSave();drag=null;els.view.classList.remove('grabbing')});
  els.view.addEventListener('dblclick',selectSameTypeFromEvent);
  // Rows are rebuilt after each click; intercept the second click before its row is replaced.
  els.layers.addEventListener('click',e=>{if(e.detail===2&&e.button===0&&(e.ctrlKey||e.metaKey)){e.stopPropagation();selectSameTypeFromEvent(e)}},true);
  els.view.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'});els.view.addEventListener('drop',e=>{e.preventDefault();const a=assets.find(x=>x.id===e.dataTransfer.getData('text/plain'));if(a)addObject(a,worldPoint(e).x,worldPoint(e).y)});
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));const active=tab==='set-v05';$('setReviewPaletteFilters').hidden=!active;document.body.classList.toggle('v05-palette-active',active);renderPalette()});
  for(const id of ['setReviewPaletteTheme','setReviewPaletteKind'])$(id).addEventListener('change',()=>{if(tab==='set-v05')renderPalette()});
  $('addAsset').onclick=()=>{fileTarget=null;$('assetFiles').click()};
  const fileData=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
  $('assetFiles').onchange=async e=>{const files=[...e.target.files];let slot=fileTarget?assets.findIndex(a=>a.id===fileTarget):-1;for(const f of files){if(!f.type.startsWith('image/'))continue;const src=await fileData(f);let a;if(slot>=0){a=assets[slot];slot=-1}else a=assets.find(x=>x.group===tab&&!x.src);if(!a){a={id:uid(),name:f.name.replace(/\.[^.]+$/,''),group:tab,src:null};assets.push(a)}a.src=src;a.name=f.name.replace(/\.[^.]+$/,'');}fileTarget=null;e.target.value='';renderPalette();refresh();notice(`${files.length}개 이미지가 추가되었습니다.`)};
  const oilBackgrounds=[];
  const backgroundRevision='?v=living-oil-20261014';
  const backgroundVideoRevision='?v=calm180-leftdrift-20261020';
  for(const [src] of oilBackgrounds){const filename=src.split('/').at(-1);optimizedImages[src]={width:14165,height:3480,revision:backgroundRevision,preview:`/assets/preview/background/${filename}${backgroundRevision}`,light:`/assets/light/background/${filename}${backgroundRevision}`,thumb:`/assets/thumb/background/${filename}${backgroundRevision}`}}
  const backgroundVideos={};
  for(const [src,name] of oilBackgrounds){const filename=src.split('/').at(-1).replace('.webp','.mp4');backgroundVideos[`/assets/background-loops/${filename}`]={poster:displaySrc(src,'thumb'),name:`${name} · 3분 · 고정 풍경`,revision:backgroundVideoRevision}}
  let backgroundPlaying=true;
  const backgroundMotionControls=document.createElement('div');backgroundMotionControls.className='actions';backgroundMotionControls.style.marginTop='8px';backgroundMotionControls.innerHTML='<button class="btn" id="backgroundPause">배경 영상 일시정지</button><button class="btn" id="backgroundRestart">처음부터</button>';$('backgroundSelect').after(backgroundMotionControls);
  function backgroundPreview(src){return backgroundVideos[src]?.thumb||backgroundVideos[src]?.poster||displaySrc(src,'thumb')}
  function updateBackgroundPlayback(){const isVideo=!!backgroundVideos[background];$('backgroundPause').disabled=$('backgroundRestart').disabled=!isVideo;$('backgroundPause').textContent=backgroundPlaying?'배경 영상 일시정지':'배경 영상 재생';if(wallBackground?.tagName!=='VIDEO')return;if(backgroundPlaying&&!document.hidden&&!exhibitionActive)wallBackground.play?.()?.catch?.(()=>notice('배경 영상 재생 버튼을 눌러 주세요.'));else wallBackground.pause?.()}
  $('backgroundPause').onclick=()=>{backgroundPlaying=!backgroundPlaying;updateBackgroundPlayback()};$('backgroundRestart').onclick=()=>{if(wallBackground?.tagName==='VIDEO')wallBackground.currentTime=0};document.addEventListener('visibilitychange',updateBackgroundPlayback);
  async function backgroundDrawable(){if(!backgroundVideos[background])return image(background+(optimizedImages[background]?.revision||''));const video=wallBackground;if(video?.readyState>=2)return video;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>finish(Error('배경 영상이 아직 로딩 중입니다. 잠시 후 다시 시도해 주세요.')),15000);const ready=()=>finish(),failed=()=>finish(Error('배경 영상을 읽을 수 없습니다.'));function finish(error){clearTimeout(timer);video?.removeEventListener('loadeddata',ready);video?.removeEventListener('error',failed);error?reject(error):resolve()}video?.addEventListener('loadeddata',ready,{once:true});video?.addEventListener('error',failed,{once:true})});return video}
  const backgroundChoices=window.jejuFinalCatalog.backgrounds.map(a=>[a.src,a.name]);
  $('backgroundSelect').replaceChildren(new Option('배경 없음','none'),...backgroundChoices.map(([src,name])=>new Option(name,src)),new Option('직접 불러온 배경','custom'));
  backgroundMotionControls.hidden=true;
  function syncBackgroundSelect(){
    const select=$('backgroundSelect');select.value=background||'none';if(!select.value)select.value='custom';
    const preview=$('activeBackgroundPreview'),src=background?backgroundPreview(background):'';
    if(src){if(preview.dataset.src!==src){preview.src=src;preview.dataset.src=src}preview.classList.remove('hidden')}else{preview.classList.add('hidden');preview.removeAttribute('src');preview.dataset.src=''}
    $('activeBackgroundName').textContent=backgroundChoices.find(([src])=>src===background)?.[1]||(background?'불러온 배경 이미지':'배경 없음');
    for(const card of $('backgroundGalleryCards').children)card.setAttribute('aria-pressed',String(card.dataset.background===background));
  }
  function applyBackground(src){const migrated=brightBackgroundProject({background:src,sceneFilters});backgroundDefaultVersion=83;background=migrated?.background||src;if(migrated)sceneFilters=normalizeFilters(migrated.sceneFilters);renderWall();scheduleSave();notice(src?'배경을 교체했습니다.':'배경을 제거했습니다.')}
  function openBackgroundGallery(){
    const host=$('backgroundGalleryCards');if(!host.children.length)for(const [src,name] of backgroundChoices){const button=document.createElement('button'),im=document.createElement('img'),label=document.createElement('span');button.type='button';button.className='background-card';button.dataset.background=src;button.setAttribute('aria-label',name);im.src=backgroundPreview(src);im.alt=name;im.loading='lazy';im.decoding='async';label.textContent=name;button.append(im,label);button.onclick=()=>{applyBackground(src);$('backgroundGallery').close()};host.append(button)}
    syncBackgroundSelect();$('backgroundGallery').showModal();
  }
  $('openBgGallery').onclick=openBackgroundGallery;$('openBgGalleryRight').onclick=openBackgroundGallery;
  $('closeBgGallery').onclick=()=>$('backgroundGallery').close();
  $('uploadBgGallery').onclick=()=>{$('backgroundGallery').close();$('bgFile').click()};
  $('clearBgGallery').onclick=()=>{applyBackground(null);$('backgroundGallery').close()};
  function drawBackground(ctx,im,width,height){const iw=im.videoWidth||im.naturalWidth,ih=im.videoHeight||im.naturalHeight,zoom=window.jejuFocus?.backgroundScale(sceneFilters.focus)||1,ratio=Math.max(width/iw,height/ih)*zoom,dw=sourceRegistered.has(background)?width*zoom:iw*ratio,dh=sourceRegistered.has(background)?height*zoom:ih*ratio;ctx.save();ctx.filter=filterCSS('background',height/H*Math.abs(ctx.getTransform?.().a||1));ctx.drawImage(im,(width-dw)/2,(height-dh)/2,dw,dh);ctx.restore()}
  $('backgroundSelect').onchange=e=>{const value=e.target.value;if(value==='custom'){$('bgFile').click();syncBackgroundSelect();return}applyBackground(value==='none'?null:value)};
  $('setBg').onclick=()=>$('bgFile').click();$('setRef').onclick=()=>$('refFile').click();
  $('bgFile').onchange=async e=>{const file=e.target.files?.[0];try{if(file){const src=await fileData(file);await image(src);applyBackground(src);notice('새 배경 이미지를 적용했습니다.')}}catch{notice('이미지를 읽을 수 없습니다. PNG, JPG, WEBP 이미지를 선택해 주세요.')}finally{e.target.value=''}};
  $('refFile').onchange=async e=>{if(e.target.files[0]){reference=await fileData(e.target.files[0]);$('reference').src=reference;$('reference').classList.remove('hidden');$('toggleRef').textContent='시안 숨기기'}e.target.value=''};
  $('removeBg').onclick=()=>applyBackground(null);$('toggleRef').onclick=()=>{if(!reference)return;const hidden=$('reference').classList.toggle('hidden');$('toggleRef').textContent=hidden?'시안 보기':'시안 숨기기'};
  for(const key of ['Name','X','Y','W','H','R','O'])$('prop'+key).onchange=e=>{const o=current();if(!o)return;snapshot();const v=e.target.value,items=members();if(items.length>1){const b=bounds(items),cx=(b.x+b.right)/2,cy=(b.y+b.bottom)/2;if(key==='Name'){if(o.groupId)items.forEach(x=>x.groupName=v||x.groupName)}else if(key==='X'||key==='Y'){const delta=(+v||0)-(key==='X'?b.x:b.y);items.forEach(x=>x[key==='X'?'x':'y']+=delta)}else if(key==='W'||key==='H'){const size=key==='W'?b.right-b.x:b.bottom-b.y,f=Math.max(.01,(+v||1)/size);items.forEach(x=>{x.x=b.x+(x.x-b.x)*f;x.y=b.y+(x.y-b.y)*f;x.w*=f;x.h*=f})}else if(key==='R'){const angle=(+v||0)*Math.PI/180;items.forEach(x=>{const px=x.x+x.w/2-cx,py=x.y+x.h/2-cy;x.x=cx+px*Math.cos(angle)-py*Math.sin(angle)-x.w/2;x.y=cy+px*Math.sin(angle)+py*Math.cos(angle)-x.h/2;x.r+=angle*180/Math.PI})}else if(key==='O')items.forEach(x=>x.opacity=clamp(+v/100,0,1))}else if(key==='Name')o.name=v||o.name;else if(key==='O')o.opacity=clamp(+v/100,0,1);else if((key==='W'||key==='H')&&isFlower(o)){const ratio=o.aspect||o.w/o.h;if(key==='W'){o.w=Math.max(1,+v);o.h=o.w/ratio}else{o.h=Math.max(1,+v);o.w=o.h*ratio}}else o[{X:'x',Y:'y',W:'w',H:'h',R:'r'}[key]]=key==='W'||key==='H'?Math.max(1,+v):+v||0;refresh()};
  function setScalePercent(value){
    const o=current();if(!o)return;const desired=clamp(value,1,1000),currentScale=100*o.w/(o.baseW||o.w),f=desired/currentScale,items=members(),b=displayBounds(items),cx=(b.x+b.right)/2,cy=(b.y+b.bottom)/2;
    const place=(o,x,y)=>Object.assign(o,window.jejuSpace?.atCenter(o,assets.find(a=>a.id===o.assetId),H,gardenSpace,x,y,spaceView)||{x:x-o.w/2,y:y-o.h/2});
    snapshot();for(const item of items){const p=spacePose(item,assets.find(a=>a.id===item.assetId)),x=cx+(p.x+p.w/2-cx)*f,y=cy+(p.y+p.h/2-cy)*f;item.w*=f;item.h*=f;place(item,x,y)}
    if(items.length>1&&gardenSpace.enabled){
      const origins=items.map(o=>o.y),centerAt=dy=>{items.forEach((o,i)=>o.y=origins[i]+dy);const b=displayBounds(items);return (b.y+b.bottom)/2},error=centerAt(0)-cy;
      if(Math.abs(error)>1e-7){const span=Math.max(...items.map(o=>o.h))*2+Math.abs(error)+1;let low=-span,high=span;for(let pass=0;pass<48;pass++){const mid=(low+high)/2;if(centerAt(mid)<cy)low=mid;else high=mid}centerAt((low+high)/2)}
      const b=displayBounds(items),dx=cx-(b.x+b.right)/2;for(const item of items)item.x+=dx;
    }
    refresh();
  }
  $('propScale').onchange=e=>setScalePercent(+e.target.value||100);
  for(const [id,delta] of [['scaleDown10',-10],['scaleDown5',-5],['scaleUp5',5],['scaleUp10',10]])$(id).onclick=()=>{const o=current();if(o)setScalePercent(100*o.w/(o.baseW||o.w)+delta)};
  function randomizeSizes(amount){
    const items=members();if(!items.length)return;
    snapshot();for(const o of items){
      const a=assets.find(a=>a.id===o.assetId),p=spacePose(o,a),cx=p.x+p.w/2,cy=p.y+p.h/2,f=1+(Math.random()*2-1)*amount/100;
      o.w*=f;o.h*=f;Object.assign(o,window.jejuSpace?.atCenter(o,a,H,gardenSpace,cx,cy,spaceView)||{x:cx-o.w/2,y:cy-o.h/2});
    }
    refresh();
  }
  for(const amount of [5,10])$('randomSize'+amount).onclick=()=>randomizeSizes(amount);
  function varyFlowerDirections(checkpoint=true){
    const chosen=members().filter(isFlower),items=chosen.length?chosen:objects.filter(isFlower);
    if(!items.length){notice('방향을 바꿀 꽃이 없습니다.');return 0}
    if(checkpoint)snapshot();
    items.forEach((o,i)=>Object.assign(o,window.jejuFlowerDirections(o,i)));
    refresh();if(checkpoint)notice(`${items.length}개 꽃을 좌향·정면·우향으로 섞었습니다. 줄기 아래 위치와 크기는 유지했습니다.`);return items.length;
  }
  $('varyFlowerDirections').onclick=()=>varyFlowerDirections();
  function randomizeFlowerHue(strength){
    const items=members().filter(isFlower);if(!items.length){notice('색상을 바꿀 꽃을 선택해 주세요.');return}
    snapshot();for(const o of items)o.flowerHue=Math.round((Math.random()*2-1)*strength);
    refresh();notice(`선택한 꽃 ${items.length}개에 Hue 랜덤 ${strength}%를 적용했습니다. 초록 잎과 줄기를 보호합니다.`);
  }
  for(const strength of [5,10])$('randomFlowerHue'+strength).onclick=()=>randomizeFlowerHue(strength);
  function applyContrastAdditions(checkpoint=true){
    try{const plan=window.jejuContrastAdditions({objects,assets,background},window.jejuAdditions68,window.jejuWhole62.scenes,W,H,uid);if(checkpoint)snapshot();objects=plan.objects;selected=null;selectedIds.clear();refresh();if(checkpoint)notice('가까운 4색 꽃과 어두운 현무암·가지 후경을 적용했습니다.');return plan.changed}catch(error){notice(error.message);return 0}
  }
  $('applyContrastAdditions').onclick=()=>applyContrastAdditions();
  function halfDefaultFlowers(checkpoint=true){
    const items=objects.filter(o=>isFlower(o)&&o.defaultFlowerScale!==.5);if(!items.length)return 0;
    if(checkpoint)snapshot();
    for(const o of items){const root=window.jejuSpace.rootPoint(o),angle=o.r*Math.PI/180;o.w*=.5;o.h*=.5;o.baseW=(o.baseW||o.w*2)*.5;o.baseH=(o.baseH||o.h*2)*.5;if(Number.isFinite(o.plantHeightMm))o.plantHeightMm*=.5;o.x=root.x+Math.sin(angle)*o.h/2-o.w/2;o.y=root.y-Math.cos(angle)*o.h/2-o.h/2;o.defaultFlowerScale=.5}
    refresh();if(checkpoint)notice(`${items.length}개 꽃을 기본 50% 크기로 줄였습니다. 줄기 아래 위치를 유지했습니다.`);return items.length;
  }
  $('halfDefaultFlowers').onclick=()=>halfDefaultFlowers();
  function fillForeground(checkpoint=true){
    try{
      const scenes=[62,61,60,59].flatMap(v=>window['jejuWhole'+v]?.scenes||[]),items=window.jejuForegroundFill({objects,assets,background},scenes,W,H,uid);
      if(checkpoint)snapshot();objects=objects.filter(o=>o.placementRole!=='foreground_fill_v67');
      const map=new Map(assets.map(a=>[a.id,a]));let at=objects.length;
      while(at>0&&['particle','bird','butterfly','cloud'].includes(map.get(objects[at-1].assetId)?.category))at--;
      objects.splice(at,0,...items);selected=null;selectedIds.clear();refresh();
      if(checkpoint)notice(`하단을 돌과 풀 ${items.length}개로 촘촘히 채웠습니다. 실행 취소로 되돌릴 수 있습니다.`);return items.length;
    }catch(error){notice(error.message);return 0}
  }
  $('fillForeground').onclick=()=>fillForeground();
  $('randomFlowerColor').onclick=async()=>{
    const button=$('randomFlowerColor');if(button.disabled)return;
    const plan=members().flatMap(o=>{const current=objectVariant(o,assets.find(a=>a.id===o.assetId)),choices=window.jejuFlowerTones.similar(current,[...bloomVariants.values()]),v=choices[Math.floor(Math.random()*choices.length)],asset=v&&assets.find(a=>a.id==='flower-'+v.id);return asset?[{o,current,v,asset}]:[]});
    if(!plan.length){notice('비슷한 다른 색상 원본이 있는 꽃을 선택해 주세요.');return}
    button.disabled=true;
    try{
      await Promise.all([...new Set(plan.map(p=>p.asset.src))].map(image));
      if(plan.some(p=>!objects.includes(p.o)||objectVariant(p.o,assets.find(a=>a.id===p.o.assetId))?.id!==p.current.id))throw Error('배치나 꽃 색상이 바뀌었습니다. 다시 적용해 주세요.');
      snapshot();for(const {o,v,asset} of plan)Object.assign(o,{assetId:asset.id,name:asset.name,flowerColor:v.tone,flowerVariant:v.id});
      refresh();notice(`${plan.length}개 꽃을 같은 종류의 비슷한 색상 원본으로 바꿨습니다.`);
    }catch(error){notice(error.message||'꽃 이미지를 준비하지 못했습니다.')}finally{button.disabled=false}
  };
  function rotateSelection(degrees){const items=members();if(!items.length)return;const b=bounds(items),cx=(b.x+b.right)/2,cy=(b.y+b.bottom)/2,angle=degrees*Math.PI/180;snapshot();items.forEach(o=>{if(items.length>1){const x=o.x+o.w/2-cx,y=o.y+o.h/2-cy;o.x=cx+x*Math.cos(angle)-y*Math.sin(angle)-o.w/2;o.y=cy+x*Math.sin(angle)+y*Math.cos(angle)-o.h/2}o.r+=degrees});refresh()}
  $('rotateLeft').onclick=()=>rotateSelection(-5);$('rotateRight').onclick=()=>rotateSelection(5);
  function randomizeRotations(degrees){
    const items=members();if(!items.length)return;
    snapshot();for(const o of items){
      const root=isFlower(o)?window.jejuSpace.rootPoint(o):null;
      o.r+=(Math.random()*2-1)*degrees;
      if(root){const angle=o.r*Math.PI/180;o.x=root.x+Math.sin(angle)*o.h/2-o.w/2;o.y=root.y-Math.cos(angle)*o.h/2-o.h/2}
    }
    refresh();
  }
  for(const degrees of [5,10])$('randomRotate'+degrees).onclick=()=>randomizeRotations(degrees);
  $('flipX').onclick=()=>{const items=members();if(!items.length)return;snapshot();const b=bounds(items);items.forEach(o=>{if(items.length>1){o.x=b.x+b.right-o.x-o.w;o.r=-o.r}o.flipX=!o.flipX});refresh()};
  function syncFlowerChoices(id){for(const button of $(id+'Cards').children)button.setAttribute('aria-pressed',String(button.dataset.species===$(id).value))}
  function buildFlowerChoices(){for(const id of ['replaceFrom','replaceTo']){const host=$(id+'Cards');host.replaceChildren();for(const [key,name] of species){const asset=builtins.find(a=>a.species===key),button=document.createElement('button'),im=document.createElement('img'),label=document.createElement('span');button.type='button';button.className='flower-choice';button.dataset.species=key;button.setAttribute('aria-label',name);im.src=displaySrc(asset.src,'thumb');im.alt=name;im.loading='lazy';im.decoding='async';label.textContent=name;button.append(im,label);button.onclick=()=>{$(id).value=key;syncFlowerChoices(id);if(id==='replaceTo')buildColorChoices()};host.append(button)}syncFlowerChoices(id)}}
  let chosenFlowerColor='',mixedFlowerColors=new Set();
  function currentFlowerColors(){return [...bloomVariants.values()].filter(v=>v.species===$('replaceTo').value)}
  function tintedFlowerSrc(src,tone){const source=[...assets,...builtins].find(a=>a.src===src||displaySrc(a.src)===src||displaySrc(a.src,'thumb')===src)||{src},v=objectVariant({flowerColor:tone},source);return Promise.resolve(v?.open||src)}
  function setFlowerImage(im,src){if(im.dataset.visual===src)return;im.dataset.visual=src;im.dataset.src=src;im.src=src;im.style.visibility=''}
  function syncColorChoices(){const mode=$('replaceColorMode').value;$('flowerColorCards').classList.remove('hidden');$('flowerColorHint').textContent=mode==='mix'?'선택한 조명별 원본 PNG가 균등하게 적용됩니다.':mode==='single'?'각 조명별 봉오리·만개 PNG 상태가 연결됩니다.':'지원하는 기존 색상을 유지합니다. 없는 색상은 해당 꽃의 기본 색상을 사용합니다.';for(const button of $('flowerColorCards').children){const selected=mode==='mix'?mixedFlowerColors.has(button.dataset.color):mode==='single'&&button.dataset.color===chosenFlowerColor;button.setAttribute('aria-pressed',String(selected))}}
  function buildColorChoices(){const host=$('flowerColorCards'),options=currentFlowerColors(),ready=options.filter(v=>v.ready);host.replaceChildren();if(!ready.some(v=>v.tone===chosenFlowerColor))chosenFlowerColor=ready[0]?.tone||'';mixedFlowerColors=new Set([...mixedFlowerColors].filter(t=>ready.some(v=>v.tone===t)));if(!mixedFlowerColors.size)mixedFlowerColors=new Set(ready.map(v=>v.tone));for(const v of options){const button=document.createElement('button'),im=document.createElement('img'),label=document.createElement('span');button.type='button';button.className='flower-choice';button.dataset.color=v.tone;button.setAttribute('aria-label',v.name||toneNames[v.tone]||v.tone);button.disabled=!v.ready;im.alt=v.name||toneNames[v.tone]||v.tone;im.decoding='async';if(v.open)im.src=v.open;label.textContent=im.alt+(v.ready?'':' · 준비 중');button.append(im,label);button.onclick=()=>{if(!v.ready)return;if($('replaceColorMode').value==='mix'){if(mixedFlowerColors.has(v.tone))mixedFlowerColors.delete(v.tone);else mixedFlowerColors.add(v.tone)}else{chosenFlowerColor=v.tone;$('replaceColorMode').value='single'}syncColorChoices()};host.append(button)}syncColorChoices()}
  $('replaceColorMode').onchange=syncColorChoices;
  function planFlowerReplacement(items,from,to,mode,colorIds){
    if(mode!=='keep'&&!colorIds.length)throw Error('적용할 색상을 하나 이상 선택해 주세요.');
    return items.filter(o=>assetSpecies(assets.find(a=>a.id===o.assetId))===from).map((o,index)=>{const current=objectVariant(o,assets.find(a=>a.id===o.assetId)),tone=mode==='keep'?(bloomVariants.has(`${to}-${current?.tone}`)?current.tone:bloomManifest.defaultVariants[to]):colorIds[index%colorIds.length],v=bloomVariants.get(`${to}-${tone}`),asset=assets.find(a=>!a.legacyFlower&&a.bloomVariant===`${to}-${tone}`);if(!v?.ready||!asset)throw Error('이 색상의 개화 영상은 아직 준비 중입니다.');return{object:o,asset,color:tone,variant:v.id}});
  }
  async function replaceFlowerSpecies(scope){
    const from=$('replaceFrom').value,to=$('replaceTo').value,mode=$('replaceColorMode').value,buttons=[$('replaceFlowers'),$('replaceSelectedFlowers')];if(buttons.some(b=>b.disabled))return;
    try{const colorIds=mode==='mix'?currentFlowerColors().filter(v=>v.ready&&mixedFlowerColors.has(v.tone)).map(v=>v.tone):[chosenFlowerColor],plan=planFlowerReplacement(scope==='selected'?members():objects,from,to,mode,colorIds);if(!plan.length){notice('적용할 꽃을 먼저 선택해 주세요.');return}buttons.forEach(b=>b.disabled=true);await Promise.all([...new Set(plan.map(p=>p.asset.src))].map(image));const live=new Set(objects);if(plan.some(p=>!live.has(p.object)))throw Error('배치가 변경되었습니다. 다시 적용해 주세요.');snapshot();for(const p of plan){const o=p.object;o.assetId=p.asset.id;o.flowerColor=p.color;o.flowerVariant=p.variant;o.name=p.asset.name}refresh();notice(`${plan.length}개 꽃에 색상별 원본 이미지와 개화 영상을 연결했습니다.`)}catch(err){notice(err.message||'꽃 이미지를 준비하지 못했습니다.')}finally{buttons.forEach(b=>b.disabled=false)}
  }
  const spacePanel=document.createElement('div');spacePanel.className='group';spacePanel.innerHTML='<h3>입체 화단 · XYZ 공간</h3><button class="btn primary" id="applySpatial" style="width:100%;margin-bottom:8px">입체감 적용 · 선택 / 전체 꽃</button><div class="actions"><button class="btn" id="randomRotation3">축별 랜덤 ±3°</button><button class="btn" id="randomRotation5">축별 랜덤 ±5°</button></div><label class="muted">Z 랜덤 범위 (±px)<input class="full-input" id="zSpread" type="number" min="0" max="2000" value="600"></label><button class="btn" id="randomDepth" style="width:100%;margin:8px 0">Z 깊이 랜덤</button><label><input id="cameraOrbit" type="checkbox"> 전시 카메라 천천히 회전</label><p class="note">선택이 없으면 전체 꽃에 적용합니다. 본체 드래그는 XY만 이동합니다. Z 피봇을 위로 끌면 앞쪽(+), 아래로 끌면 뒤쪽(−)으로 이동합니다. 편집 카메라는 고정됩니다.</p><label><input id="spaceEnabled" type="checkbox"> 원근 공간으로 심기</label><label class="muted">원근 강도 <output id="spaceStrengthValue"></output><input class="full-input" id="spaceStrength" type="range" min="0" max="100" step="5"></label><label class="muted">땅이 시작되는 높이 (%)<input class="full-input" id="spaceHorizon" type="number" min="15" max="85" step="1"></label><label class="muted">선택한 꽃·풀·돌 깊이 <output id="plantDepthValue"></output><input class="full-input" id="plantDepth" type="range" min="0" max="100" step="1"></label><p class="note">깊이 0은 앞쪽, 100은 뒤쪽입니다. 줄기 끝을 땅에 붙이고 뒤쪽은 작게, 앞쪽은 크게 보입니다. 겹침은 심긴 위치에 따라 정해집니다. 격자 숨기기로 바닥 가이드를 끌 수 있습니다.</p>';document.querySelector('.panel.right').prepend(spacePanel);const spaceTool=document.createElement('button');spaceTool.type='button';spaceTool.className='btn';spaceTool.textContent='입체 공간';spaceTool.onclick=()=>spacePanel.scrollIntoView({block:'start',behavior:'smooth'});$('openTonePanel').after(spaceTool);
  function syncSpaceControls(){if(!window.jejuSpace)return;$('spaceEnabled').checked=gardenSpace.enabled;$('spaceStrength').disabled=gardenSpace.spatial;$('spaceHorizon').disabled=gardenSpace.spatial;$('cameraOrbit').checked=gardenSpace.cameraOrbit;$('zSpread').value=gardenSpace.spread;$('spaceStrength').value=Math.round(gardenSpace.strength*100);$('spaceStrengthValue').textContent=$('spaceStrength').value+'%';$('spaceHorizon').value=Math.round(gardenSpace.horizon*100);const plants=members().filter(o=>window.jejuSpace.ground(assets.find(a=>a.id===o.assetId)));$('plantDepth').disabled=gardenSpace.spatial||!gardenSpace.enabled||!plants.length;const value=plants.length?Math.round(plants.reduce((sum,o)=>sum+window.jejuSpace.pose(o,assets.find(a=>a.id===o.assetId),H,{...gardenSpace,enabled:true,spatial:false}).spaceDepth,0)/plants.length*100):100;$('plantDepth').value=100-value;$('plantDepthValue').textContent=plants.length?String(100-value):'꽃·풀·돌 선택';}
  for(const id of ['spaceEnabled','spaceStrength','spaceHorizon'])$(id).onchange=()=>{snapshot();gardenSpace=window.jejuSpace.normalize({...gardenSpace,enabled:$('spaceEnabled').checked,strength:+$('spaceStrength').value/100,horizon:+$('spaceHorizon').value/100});refresh()};
  function ensureSpatial(){
    if(!gardenSpace.spatial)for(const o of objects){const p=window.jejuSpace.pose(o,assets.find(a=>a.id===o.assetId),H,gardenSpace),f=p.w/o.w;Object.assign(o,{x:p.x,y:p.y,w:p.w,h:p.h,baseW:(o.baseW||o.w)*f,baseH:(o.baseH||o.h)*f})}
    const v=window.jejuSpace.view(objects,assets,W,H,gardenSpace);
    gardenSpace=window.jejuSpace.normalize({...gardenSpace,enabled:true,spatial:true,targetX:v.x,targetY:v.y});
  }
  function spatialRandom(degrees,depth=false){
    const items=members().length?members():objects.filter(o=>isFlower(o));if(!items.length){notice('꽃이나 요소를 먼저 배치해 주세요.');return}
    snapshot();ensureSpatial();gardenSpace.spread=clamp(+$('zSpread').value||0,0,2000);
    for(const o of items){if(degrees){o.rx=clamp((o.rx||0)+(Math.random()*2-1)*degrees,-60,60);o.ry=clamp((o.ry||0)+(Math.random()*2-1)*degrees,-60,60);o.r+=(Math.random()*2-1)*degrees}if(depth)o.z=(Math.random()*2-1)*gardenSpace.spread}
    refresh();return true;
  }
  $('applySpatial').onclick=()=>{if(spatialRandom(3,true)){gardenSpace.cameraOrbit=true;refresh()}};
  $('randomRotation3').onclick=()=>spatialRandom(3);$('randomRotation5').onclick=()=>spatialRandom(5);$('randomDepth').onclick=()=>spatialRandom(0,true);
  $('cameraOrbit').onchange=()=>{snapshot();ensureSpatial();gardenSpace.cameraOrbit=$('cameraOrbit').checked;refresh()};
  $('zSpread').onchange=()=>{snapshot();gardenSpace.spread=clamp(+$('zSpread').value||0,0,2000);refresh()};
  for(const [id,key,min,max] of [['propZ','z',-2000,2000],['propRX','rx',-60,60],['propRY','ry',-60,60]])$(id).onchange=e=>{const items=members(),o=current(),value=+e.target.value;if(!o||!Number.isFinite(value))return;snapshot();ensureSpatial();const delta=clamp(value,min,max)-(o[key]||0);for(const item of items)item[key]=clamp(item===o?value:(item[key]||0)+delta,min,max);refresh()};
  const lightPanel=document.createElement('div');lightPanel.className='group';lightPanel.innerHTML='<h3>조명 · 투영 그림자</h3><button class="btn primary" id="addSceneLight" style="width:100%;margin-bottom:8px">조명 켜기 · 피봇 선택</button><button class="btn" id="resetSceneLight" style="width:100%;margin-bottom:8px">기본 조명 위치로</button><label><input type="checkbox" id="lightEnabled"> 조명 사용</label><label style="display:block"><input type="checkbox" id="showLightGizmo"> 편집 조명 피봇 표시</label><div class="field"><label>조명 X<input id="lightX" type="number" step="50"></label><label>조명 Y<input id="lightY" type="number" step="50"></label><label>조명 Z 앞뒤<input id="lightZ" type="number" min="-20000" max="20000" step="100"></label><label>조명 X 회전<input id="lightRX" type="number" min="-180" max="180" step="1"></label><label>조명 Y 회전<input id="lightRY" type="number" min="-180" max="180" step="1"></label><label>조명 Z 회전<input id="lightRZ" type="number" min="-180" max="180" step="1"></label></div><label class="muted">광량 (%)<input class="full-input" id="lightPower" type="number" min="0" max="300" step="10"></label><label class="muted">주변 밝기 (%)<input class="full-input" id="lightAmbient" type="number" min="0" max="100" step="5"></label><label class="muted">그림자 진하기 (%)<input class="full-input" id="lightShadow" type="number" min="0" max="100" step="5"></label><label class="muted">그림자 부드러움<input class="full-input" id="lightSoftness" type="number" min="0" max="60" step="2"></label><p class="note">전구는 XY 이동, 파란 Z는 앞뒤 이동, X↻·Y↻·Z↻는 각 축 회전입니다. 조명 위치는 그림자 방향을, 조사 방향은 빛이 닿는 범위를 바꿉니다. 피봇은 전시와 출력에 표시되지 않습니다.</p>';spacePanel.after(lightPanel);
  const lightTool=document.createElement('button');lightTool.type='button';lightTool.className='btn';lightTool.textContent='조명';lightTool.onclick=()=>{lightPanel.scrollIntoView({block:'start',behavior:'smooth'});$('addSceneLight').click()};spaceTool.after(lightTool);
  function syncLightControls(){if(!window.jejuSpace)return;const l=window.jejuSpace.normalizeLight(gardenSpace.light);$('lightEnabled').checked=l.enabled;$('showLightGizmo').checked=lightGizmoVisible;for(const [id,key,multiplier] of [['X','x',1],['Y','y',1],['Z','z',1],['RX','rx',1],['RY','ry',1],['RZ','rz',1],['Power','power',100],['Ambient','ambient',100],['Shadow','shadow',100],['Softness','softness',1]])$('light'+id).value=Math.round(l[key]*multiplier*10)/10}
  function renderLightGizmo(){
    syncLightControls();if(!gardenSpace.light?.enabled||!lightGizmoVisible){if(lightGizmo)lightGizmo.style.display='none';return}
    if(!lightGizmo){lightGizmo=document.createElement('div');lightGizmo.id='lightGizmo';lightGizmo.className='light-gizmo';const ray=document.createElement('div');ray.className='light-ray';lightGizmo.append(ray);for(const [key,label,name] of [['xy','☀','조명 XY 피봇'],['z','Z','조명 Z 피봇'],['rx','X↻','조명 X 회전 피봇'],['ry','Y↻','조명 Y 회전 피봇'],['rz','Z↻','조명 Z 회전 피봇']]){const h=document.createElement('button');h.type='button';h.className='light-handle light-'+key;h.textContent=label;h.dataset.lightHandle=key;h.setAttribute('aria-label',name);h.title=name+' · 드래그 또는 방향키';h.onkeydown=e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopPropagation();snapshot();const l={...gardenSpace.light},amount=e.key==='ArrowUp'||e.key==='ArrowRight'?1:-1;if(key==='xy')l[e.key==='ArrowLeft'||e.key==='ArrowRight'?'x':'y']+=(e.key==='ArrowLeft'||e.key==='ArrowUp'?-50:50);else l[key]+=amount*(key==='z'?100:1);gardenSpace.light=window.jejuSpace.normalizeLight(l);refresh()};lightGizmo.append(h)}els.wall.append(lightGizmo)}
    const p=window.jejuSpace.lightPose(H,gardenSpace,spaceView),l=gardenSpace.light,d=window.jejuSpace.lightDirection(l),end=window.jejuSpace.lightPose(H,{...gardenSpace,light:{...l,x:l.x+d[0]*H*.6,y:l.y+d[1]*H*.6,z:l.z+d[2]*H*.6}},spaceView);
    Object.assign(lightGizmo.style,{display:'block',left:p.x+'px',top:p.y+'px',zIndex:objects.length*2+20});lightGizmo.dataset.position=[l.x,l.y,l.z].join(',');const ray=lightGizmo.firstElementChild;Object.assign(ray.style,{width:Math.hypot(end.x-p.x,end.y-p.y)+'px',transform:`rotate(${Math.atan2(end.y-p.y,end.x-p.x)}rad)`});
  }
  $('addSceneLight').onclick=()=>{snapshot();ensureSpatial();gardenSpace.light=window.jejuSpace.normalizeLight({...gardenSpace.light,enabled:true});lightGizmoVisible=true;refresh()};
  $('resetSceneLight').onclick=()=>{snapshot();ensureSpatial();gardenSpace.light=window.jejuSpace.normalizeLight({enabled:true});lightGizmoVisible=true;refresh()};
  $('lightEnabled').onchange=()=>{snapshot();if($('lightEnabled').checked)ensureSpatial();gardenSpace.light=window.jejuSpace.normalizeLight({...gardenSpace.light,enabled:$('lightEnabled').checked});refresh()};
  $('showLightGizmo').onchange=()=>{lightGizmoVisible=$('showLightGizmo').checked;renderSpace()};
  for(const [id,key,divisor] of [['X','x',1],['Y','y',1],['Z','z',1],['RX','rx',1],['RY','ry',1],['RZ','rz',1],['Power','power',100],['Ambient','ambient',100],['Shadow','shadow',100],['Softness','softness',1]])$('light'+id).onchange=e=>{const v=+e.target.value/divisor;if(!Number.isFinite(v))return;snapshot();ensureSpatial();gardenSpace.light=window.jejuSpace.normalizeLight({...gardenSpace.light,[key]:v,enabled:true});refresh()};
  $('plantDepth').onchange=()=>{if(!gardenSpace.enabled||!window.jejuSpace)return;const plants=members().filter(o=>window.jejuSpace.ground(assets.find(a=>a.id===o.assetId)));if(!plants.length)return;snapshot();const y=H*gardenSpace.horizon+(1-+$('plantDepth').value/100)*H*(.98-gardenSpace.horizon);const delta=y-plants.reduce((sum,o)=>sum+window.jejuSpace.rootPoint(o).y,0)/plants.length;for(const o of plants)o.y+=delta;refresh()};
  $('replaceFlowers').onclick=()=>replaceFlowerSpecies('all');$('replaceSelectedFlowers').onclick=()=>replaceFlowerSpecies('selected');
  $('normalizeFlowers').onclick=async()=>{const width=clamp(+$('normalizeSize').value||900,1,5000),scope=$('normalizeScope').value,flowers=(scope==='selected'?members():objects).filter(isFlower);if(!flowers.length){notice(scope==='selected'?'선택한 꽃이 없습니다.':'벽면에 꽃이 없습니다.');return}const button=$('normalizeFlowers');button.disabled=true;try{const ratios=new Map();await Promise.all([...new Set(flowers.map(o=>o.assetId))].map(async id=>{const asset=assets.find(a=>a.id===id),im=await image(displaySrc(asset.src));ratios.set(id,im.naturalHeight/im.naturalWidth)}));snapshot();flowers.forEach(o=>{const height=width*ratios.get(o.assetId);o.x+=(o.w-width)/2;o.y+=o.h-height;o.w=o.baseW=width;o.h=o.baseH=height;o.aspect=width/height});refresh();notice(`${flowers.length}개 꽃의 너비를 ${width}px로 맞췄습니다.`)}catch{notice('꽃 이미지를 불러오지 못해 크기를 변경하지 않았습니다.')}finally{button.disabled=false}};
  $('makeGroup').onclick=()=>{const ids=new Set(selectedIds);if(ids.size<2)return;snapshot();const name=`군집 ${1+new Set(objects.map(x=>x.groupId).filter(Boolean)).size}`,id=uid(),chosen=objects.filter(x=>ids.has(x.id)),at=objects.findIndex(x=>ids.has(x.id));objects=objects.filter(x=>!ids.has(x.id));chosen.forEach(x=>{x.groupId=id;x.groupName=name});objects.splice(at,0,...chosen);selected=chosen.at(-1).id;refresh();notice(`${chosen.length}개 오브젝트를 ${name}으로 묶었습니다.`)};
  $('ungroupSelected').onclick=()=> $('ungroup').click();
  $('ungroup').onclick=()=>{const ids=new Set(members().map(x=>x.groupId).filter(Boolean));if(!ids.size)return;snapshot();objects.forEach(x=>{if(ids.has(x.groupId)){delete x.groupId;delete x.groupName}});refresh();notice('그룹을 해제했습니다.')};
  function moveLayerSelection(direction,steps=Infinity){
    const moving=members();if(!moving.length)return;
    const remaining=objects.filter(o=>!selectedIds.has(o.id));
    const edge=direction>0?objects.indexOf(moving.at(-1)):objects.indexOf(moving[0]);
    const boundary=direction>0?edge+1:edge;
    const currentIndex=objects.slice(0,boundary).filter(o=>!selectedIds.has(o.id)).length;
    const target=direction>0?Math.min(remaining.length,currentIndex+steps):Math.max(0,currentIndex-steps);
    const result=[...remaining.slice(0,target),...moving,...remaining.slice(target)];
    if(result.every((o,i)=>o.id===objects[i].id))return;
    snapshot();objects=result;refresh();
  }
  $('layerFront').onclick=()=>moveLayerSelection(1);
  $('layerBack').onclick=()=>moveLayerSelection(-1);
  $('layerUp30').onclick=()=>moveLayerSelection(1,30);
  $('layerDown30').onclick=()=>moveLayerSelection(-1,30);
  $('layerUp').onclick=()=>reorder(1);$('layerDown').onclick=()=>reorder(-1);$('layerUp10').onclick=()=>reorder(10);$('layerDown10').onclick=()=>reorder(-10);function reorder(n){const o=current();if(!o)return;const move=o.groupId?objects.filter(x=>x.groupId===o.groupId):[o],indices=move.map(x=>objects.indexOf(x)),edge=n>0?Math.max(...indices):Math.min(...indices),target=edge+n;if(target<0||target>=objects.length)return;snapshot();const other=objects[target];objects=objects.filter(x=>!move.includes(x));const at=objects.indexOf(other)+(n>0?1:0);objects.splice(at,0,...move);refresh()}
  let objectClipboard=[],pasteCount=0;
  function copySelection(){const items=members();if(!items.length)return;objectClipboard=JSON.parse(JSON.stringify(items));pasteCount=0;notice(`${items.length}개를 복사했습니다.`)}
  function cloneObjects(source,offset,randomFlower=false){if(!source.length)return;snapshot();const groupIds=new Map(),copies=source.map(o=>{const copy={...o,id:uid(),name:o.name+' 복사',x:o.x+offset,y:o.y+offset};if(o.groupId){if(!groupIds.has(o.groupId))groupIds.set(o.groupId,uid());copy.groupId=groupIds.get(o.groupId);copy.groupName=(o.groupName||'군집')+' 복사'}if(randomFlower&&isFlower(o)){const match=o.assetId.match(/^flower-([^-]+)-(.+)$/),tone=match?.[2],options=assets.filter(a=>a.group==='flowers'&&!a.legacyFlower&&a.ready!==false&&a.id!==o.assetId&&(!match||!a.id.startsWith(`flower-${match[1]}-`))&&(!tone||a.id.endsWith(`-${tone}`)));const choice=options[Math.floor(Math.random()*options.length)]||assets.find(a=>a.group==='flowers'&&!a.legacyFlower&&a.ready!==false&&a.id!==o.assetId);if(choice){copy.assetId=choice.id;copy.name=choice.name+' 복사';copy.flowerVariant=choice.bloomVariant;copy.flowerColor=choice.tone}}return copy});objects.push(...copies);selectedIds=new Set(copies.map(o=>o.id));selected=copies.at(-1).id;refresh();notice(`${copies.length}개를 ${randomFlower?'다른 꽃으로 ':''}복제했습니다.`)}
  function pasteSelection(){if(!objectClipboard.length)return;pasteCount++;cloneObjects(objectClipboard,120*pasteCount)}
  $('copyObjects').onclick=copySelection;$('pasteObjects').onclick=pasteSelection;$('duplicate').onclick=()=>cloneObjects(members(),100);
  $('remove').onclick=remove;function remove(){if(!current())return;snapshot();objects=objects.filter(o=>!selectedIds.has(o.id));selected=null;selectedIds.clear();refresh()}
  $('undo').onclick=()=>{if(!history.length)return;future.push(historyState());restoreHistory(history.pop());syncSelection();refresh()};$('redo').onclick=()=>{if(!future.length)return;history.push(historyState());restoreHistory(future.pop());syncSelection();refresh()};
  window.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(document.activeElement.tagName)){space=true;e.preventDefault()}if(e.key==='Escape'){selected=null;selectedIds.clear();refresh()}const editing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName),mod=e.ctrlKey||e.metaKey,key=e.key.toLowerCase();if(!editing&&(e.key==='Delete'||e.key==='Backspace'))remove();if(!editing&&mod&&key==='c'){e.preventDefault();copySelection()}if(!editing&&mod&&key==='v'){e.preventDefault();pasteSelection()}if(!editing&&mod&&key==='d'){e.preventDefault();cloneObjects(members(),100,e.shiftKey)}if(!editing&&mod&&key==='g'){e.preventDefault();e.shiftKey?$('ungroup').click():$('makeGroup').click()}if(mod&&key==='z'){e.preventDefault();e.shiftKey?$('redo').click():$('undo').click()}if(mod&&key==='s'){e.preventDefault();save()}});window.addEventListener('keyup',e=>{if(e.code==='Space')space=false});window.addEventListener('blur',()=>{space=false;drag=null});
  function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),30000)}
  function downloadName(extension,suffix='',value=$('saveName').value){const ending='.'+extension;let name=value.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/[. ]+$/g,'');if(name.toLowerCase().endsWith(ending))name=name.slice(0,-ending.length).replace(/[. ]+$/g,'');name=name.slice(0,180).replace(/[\uD800-\uDBFF]$/,'')||'꽃군집 프로젝트';if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))name='_'+name;return name+suffix+ending}
  function save(){const name=$('saveName').value.trim()||'꽃군집 프로젝트';const data={name,format:'jeju-maze-wall-v1',width:W,height:H,assets,objects,background,backgroundLoop:window.jejuSeparatedLoops?.backgrounds?.find(b=>b.sourcePNG===background)?.video,reference,sceneFilters,gardenSpace,flowerAssetVersion:2,oilAssetVersion:14,backgroundDefaultVersion,groupStyles:window.jejuHandoff?.getLibrary()};download(new Blob([JSON.stringify(data)],{type:'application/json'}),downloadName('json'));notice(`“${name}” 프로젝트 파일을 저장했습니다.`)}
  $('saveProject').onclick=save;$('loadProject').onclick=()=>$('projectFile').click();$('projectFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(data.format!=='jeju-maze-wall-v1'||data.width!==W||data.height!==H||!Array.isArray(data.objects)||!Array.isArray(data.assets))throw Error('형식이 맞지 않습니다.');await applyProject(data);fit();notice('프로젝트를 열었습니다.')}catch(err){notice('프로젝트 파일을 열 수 없습니다: '+err.message)}e.target.value=''};
  const image=src=>new Promise((res,rej)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>res(im);im.onerror=rej;im.src=src});
  // The three templates contain only transforms and asset IDs from the user's saved layouts.
  const templateName={blue:'블루',yellow:'옐로',red:'레드',balanced:'벨런스'};
  const templateCache=new Map();
  async function savedLayout(theme){const key=theme==='balanced'?'red':theme;if(!templateCache.has(key)){const response=await fetch(`/assets/layout-templates/${key}.json`);if(!response.ok)throw Error('저장 시안을 읽을 수 없습니다.');templateCache.set(key,await response.json())}return templateCache.get(key)}
  function referenceSubset(entries,limit){const flowers=entries.map((o,i)=>o.assetId.startsWith('flower-')?i:-1).filter(i=>i>=0);if(flowers.length<=limit)return entries;const ranked=flowers.map(i=>({i,score:Math.sin((i+1)*91.337)*10000})).sort((a,b)=>a.score-b.score),keep=new Set(ranked.slice(0,limit).map(x=>x.i));return entries.filter((o,i)=>!o.assetId.startsWith('flower-')||keep.has(i))}
  async function generateClusters(theme){
    const id={red:'sunset',yellow:'day',blue:'morning',balanced:'night'}[theme];if(id){await useSample(structuredClone(window.jejuFinalCatalog.scenes.find(s=>s.id===id).project));return}

    const reference=await savedLayout(theme),count=+$('clusterCount').value===3?3:1;
    const [left,,right,bottom]=reference.bounds,sourceWidth=right-left,sourceCenter=(left+right)/2;
    const fit=count===1?Math.min(1,(W-600)/sourceWidth):Math.min(.79,(W-600)/(3*sourceWidth));
    const centers=count===1?[W/2]:[W/6,W/2,5*W/6],created=[];
    const entries=count===1?reference.objects:referenceSubset(reference.objects,theme==='yellow'?240:theme==='red'||theme==='balanced'?185:100);
    const ratioCache=new Map();
    if(theme==='balanced'){await Promise.all(assets.filter(a=>a.group==='flowers').map(async a=>{const im=await image(displaySrc(a.src));ratioCache.set(a.id,im.naturalHeight/im.naturalWidth)}))}
    for(let cluster=0;cluster<count;cluster++){
      const groupId=uid(),groupName=`${templateName[theme]} · 저장 시안 군집 ${cluster+1}`;
      let flowerIndex=0,entryIndex=0;
      for(const source of entries){
        entryIndex++;
        let assetId=source.assetId;
        if(theme==='balanced'&&assetId.startsWith('flower-')){const tone=assetId.match(/^flower-[^-]+-(.+)$/)?.[1]||'main';assetId=`flower-${species[(flowerIndex*17+cluster*3)%species.length][0]}-${tone}`;flowerIndex++}
        const asset=assets.find(a=>a.id===assetId);if(!asset)continue;
        const w=source.w*fit,originalH=source.h*fit,h=theme==='balanced'&&ratioCache.has(assetId)?w*ratioCache.get(assetId):originalH;
        const shift=count===1?0:Math.sin((entryIndex+cluster*17)*1.13)*fit*22;
        const x=centers[cluster]+(source.x-sourceCenter)*fit+shift;
        const y=H-15-(bottom-source.y)*fit+originalH-h;
        created.push({id:uid(),assetId,name:asset.name,x,y,w,h,baseW:w,baseH:h,aspect:w/h,r:(source.r||0)+(count===3?Math.sin(entryIndex*2.14+cluster)*2:0),flipX:!!source.flipX,opacity:source.opacity??1,groupId,groupName,...(asset.bloomVariant?{flowerVariant:asset.bloomVariant,flowerColor:asset.tone}:{})});
      }
    }
    if(!created.length)throw Error('배치할 꽃이 없습니다.');
    snapshot();objects.push(...created);selectOne(created[0]);refresh();notice(`${templateName[theme]} 시안 기준 군집 ${count}개 · 오브젝트 ${created.length}개를 배치했습니다.`)
  }
  $('autoCluster').onclick=async()=>{const button=$('autoCluster');button.disabled=true;button.textContent='시안 기준 배치 중…';try{await generateClusters($('clusterTheme').value)}catch(err){notice(err.message||'저장 시안을 불러오지 못했습니다.')}finally{button.disabled=false;button.textContent='저장 시안 기준 자동 배치'}};
  $('exportPng').onclick=async()=>{const btn=$('exportPng');btn.disabled=true;btn.textContent='PNG 생성 중…';try{await window.jejuEditor.ready;const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');if(!ctx)throw Error('브라우저 캔버스를 만들 수 없습니다.');if(background)drawBackground(ctx,await backgroundDrawable(),W,H);const drawables=[];for(const o of spaceOrder()){const a=assets.find(x=>x.id===o.assetId);if(a?.src)drawables.push({o,a,im:await image(a.group==='flowers'?flowerSource(o,a):sequenceSrc(a,true))})}for(const {o,a,im} of drawables)window.jejuSpace?.castShadow(ctx,o,a,im,H,gardenSpace,spaceView);for(const {o,a,im} of drawables){ctx.save();ctx.filter=objectFilterCSS(o,a);ctx.globalAlpha=o.opacity;const display=spacePose(window.jejuAmbient.driftPose(o,window.jejuAmbient.atmosphereKind(a),sequenceTime,W,a),a);if(window.jejuAmbient.atmosphereKind(a)&&!a.sourceDriveId&&!a.lightingBaked)ctx.filter=ctx.filter==='none'?'grayscale(1)':ctx.filter+' grayscale(1)';if(window.jejuSpace?.ground(a))window.jejuSpace.shadow(ctx,display);const lighting=window.jejuSpace?.lighting(o,a,H,gardenSpace,spaceView).brightness??1;if(lighting!==1)ctx.filter=(ctx.filter==='none'?'':ctx.filter+' ')+`brightness(${lighting})`;ctx.translate(display.x+display.w/2,display.y+display.h/2);if(window.jejuSpace)window.jejuSpace.orient(ctx,display);else ctx.rotate(o.r*Math.PI/180);if(o.flipX)ctx.scale(-1,1);const ratio=Math.min(display.w/im.naturalWidth,display.h/im.naturalHeight),dw=a.sourceRect?.length===4?display.w:im.naturalWidth*ratio,dh=a.sourceRect?.length===4?display.h:im.naturalHeight*ratio;ctx.drawImage(im,-dw/2,a.group==='flowers'?display.h/2-dh:-dh/2,dw,dh);ctx.restore()}const blob=await new Promise(res=>canvas.toBlob(res,'image/png'));if(!blob)throw Error('PNG 생성에 실패했습니다.');download(blob,downloadName('png'));notice('원본 크기 PNG를 내려받았습니다.')}catch(err){notice(err.message||'내보내기에 실패했습니다.')}finally{btn.disabled=false;btn.textContent='원본 PNG 내보내기'}};
  $('zoomIn').onclick=()=>zoom(1.2);$('zoomOut').onclick=()=>zoom(1/1.2);$('fit').onclick=fit;window.addEventListener('resize',()=>{if(!drag)fit()});
  if(document.modelContext?.registerTool){
    const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{})}catch{}};
    register({name:'get_wall_layout',title:'벽면 배치 확인',description:'현재 꽃 군집의 크기, 오브젝트 좌표와 레이어 순서를 읽습니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({width:W,height:H,layers:objects.map((o,i)=>({name:o.name,x:o.x,y:o.y,w:o.w,h:o.h,rotation:o.r,layer:i+1}))})});
    register({
      name:'update_wall_object',title:'벽면 오브젝트 변경',
      description:'선택한 오브젝트 이름의 위치, 크기, 회전을 변경합니다.',
      inputSchema:{type:'object',properties:{name:{type:'string'},x:{type:'number'},y:{type:'number'},w:{type:'number'},h:{type:'number'},rotation:{type:'number'}},required:['name'],additionalProperties:false},
      execute:input=>{
        const o=objects.find(x=>x.name===input.name);
        if(!o)throw Error('해당 오브젝트를 찾을 수 없습니다.');
        for(const k of ['x','y','w','h','rotation']){
          const v=input[k];
          if(v!==undefined&&(!Number.isFinite(v)||((k==='w'||k==='h')&&v<=0)))throw Error('잘못된 크기 또는 좌표입니다.');
        }
        snapshot();
        for(const k of ['x','y','w','h'])if(input[k]!==undefined)o[k]=input[k];
        if(input.rotation!==undefined)o.r=input.rotation;
        selectOne(o);refresh();
        return {name:o.name,x:o.x,y:o.y,w:o.w,h:o.h,rotation:o.r};
      }
    });
  }

  let sequencePlaying=true,sequenceTime=0,sequenceLast=performance.now(),guidesVisible=true,gridVisible=true;
  // Editor loops use 128px previews; PNG export and saved frames retain the 480px originals.
  const sequenceCache=new Map(),sequenceLoads=new Map(),sequenceControls=new Map();
  function canonicalSequenceFrame(a,index,original=false){index=((Math.trunc(index)||0)%a.frames.length+a.frames.length)%a.frames.length;const preview=!original&&Array.isArray(a.previewFrames)&&a.previewFrames.length===a.frames.length?a.previewFrames[index]:null,src=typeof preview==='string'&&preview?preview:a.frames[index];return typeof src==='string'?(src.startsWith('/assets/animations/')&&!src.includes('?')?src+'?v=loops-21':src):typeof a.src==='string'?a.src:''}
  function sequenceFrame(a,index,original=false){index=((Math.trunc(index)||0)%a.frames.length+a.frames.length)%a.frames.length;return !original&&sequenceCache.get(a.id)?.urls[index]||canonicalSequenceFrame(a,index,original)}
  function releaseSequence(entry){if(entry.released)return;entry.released=true;entry.urls.forEach(url=>url&&URL.revokeObjectURL(url));entry.urls.length=0;entry.decoded.length=0}
  function syncSequenceAssets(){
    const active=new Map(sequenceTargets.filter(t=>t.asset.frames?.length).map(t=>[t.asset.id,t.asset]));
    for(const [id,entry] of sequenceCache)if(entry.version===85&&!active.has(id)){releaseSequence(entry);sequenceCache.delete(id)}
    for(const [id,entry] of sequenceControls)if(entry.version===85&&!active.has(id)){entry.controller.abort();releaseSequence(entry);sequenceControls.delete(id);sequenceLoads.delete(id)}
    for(const a of active.values())if((a.atmosphereVersion===85||a.frames[0].startsWith('/assets/animations/'))&&!sequenceCache.has(a.id)&&!sequenceLoads.has(a.id))warmSequence(a).then(renderWall).catch(err=>notice(err.message));
  }
  function warmSequence(a){
    if(!a.frames?.length||a.atmosphereVersion!==85&&!a.frames[0].startsWith('/assets/animations/'))return Promise.resolve();
    const expectedFrames=[95,98].includes(a.elementLoopVersion)?72:150;
    if(a.atmosphereVersion===85&&(a.frames.length!==expectedFrames||!Array.isArray(a.previewFrames)||a.previewFrames.length!==expectedFrames))return Promise.reject(Error('에디터용 루프 미리보기 목록이 맞지 않습니다.'));
    if(sequenceCache.has(a.id))return Promise.resolve();
    if(sequenceLoads.has(a.id))return sequenceLoads.get(a.id);
    const entry={urls:new Array(a.frames.length),decoded:new Array(a.frames.length),controller:new AbortController(),version:a.atmosphereVersion},control=entry.controller;
    sequenceControls.set(a.id,entry);
    const current=()=>!entry.released&&!control.signal.aborted&&sequenceControls.get(a.id)===entry;
    const loading=(async()=>{let next=0;try{await Promise.all(Array.from({length:6},async()=>{while(next<a.frames.length){
      if(!current())throw Error('루프 준비가 취소되었습니다.');const index=next++,response=await fetch(canonicalSequenceFrame(a,index),{signal:control.signal});if(!response.ok)throw Error('루프 프레임을 불러오지 못했습니다.');const blob=await response.blob();if(!current())throw Error('루프 준비가 취소되었습니다.');
      const url=URL.createObjectURL(blob);entry.urls[index]=url;const decoded=await image(url);if(!current())throw Error('루프 준비가 취소되었습니다.');if(a.atmosphereVersion===85&&(decoded.naturalWidth>128||decoded.naturalHeight>128))throw Error('에디터용 루프 미리보기가 너무 큽니다.');entry.decoded[index]=decoded;
    }}));if(current())sequenceCache.set(a.id,entry);
    }catch(err){releaseSequence(entry);if(!control.signal.aborted)throw err}finally{if(sequenceControls.get(a.id)===entry){sequenceControls.delete(a.id);sequenceLoads.delete(a.id)}}})();
    sequenceLoads.set(a.id,loading);return loading;
  }
  function sequenceSrc(a,original=false){return a.frames?.length?sequenceFrame(a,Math.floor(sequenceTime*(a.fps||30))%a.frames.length,original):a.src}
  function drawGuides(){
    if(gridVisible){const grid=document.createElement('div');grid.dataset.grid='500mm';Object.assign(grid.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'9999',backgroundImage:`linear-gradient(to right,rgba(185,214,223,.28) ${0.65/scale}px,transparent ${0.65/scale}px),linear-gradient(to bottom,rgba(185,214,223,.28) ${0.65/scale}px,transparent ${0.65/scale}px)`,backgroundSize:'500px 500px'});guideNode.append(grid)}
    if(!guidesVisible)return;
    for(const x of [4465,6845]){const line=document.createElement('div');Object.assign(line.style,{position:'absolute',left:x+'px',top:'0',height:H+'px',borderLeft:`${2/scale}px dashed #5fffee`,pointerEvents:'none',zIndex:'10000'});guideNode.append(line)}
    for(const [x,width,label] of [[0,4465,'L · 4,465 × 3,480 mm'],[4465,2380,'C · 2,380 × 3,480 mm'],[6845,7320,'R · 7,320 × 3,480 mm']]){const el=document.createElement('div');el.textContent=label;Object.assign(el.style,{position:'absolute',left:(x+width/2)+'px',top:(8/scale)+'px',transform:'translateX(-50%)',fontSize:(12/scale)+'px',padding:(5/scale)+'px',background:'#10252ddd',color:'#fff',whiteSpace:'nowrap',pointerEvents:'none',zIndex:'10001'});guideNode.append(el)}
  }
  const sequencePanel=document.createElement('div');sequencePanel.className='group';sequencePanel.innerHTML=`<h3>뷰포트 가이드</h3><button class="btn" id="gridToggle">50cm 격자 숨기기</button><p class="note">한 칸 500 × 500mm · 격자는 출력에 포함되지 않습니다.</p><p class="note">새 구름은 제자리에서 재생합니다. 전체 요소 창에서 선택한 항목의 이동 방향을 바꿀 수 있습니다.</p><h3>PNG 알파 시퀀스 테스트</h3><button class="btn" id="seqImport">PNG 여러 프레임 불러오기</button><input id="seqFiles" type="file" accept="image/png" multiple hidden><div class="field"><label>FPS<input id="seqFps" type="number" min="1" max="60" value="30"></label></div><div class="actions"><button class="btn" id="seqPlay">일시정지</button><button class="btn" id="seqReset">처음으로</button></div><button class="btn" id="seqGuide" style="margin-top:8px">L/C/R 가이드 숨기기</button><p class="note" id="seqStatus">한 동작의 PNG들을 선택하세요. 파일명 숫자순으로 반복 재생합니다. 기본 30fps.</p><p class="note">시퀀스는 배치 저장에 포함됩니다. 불러온 PNG는 256px WebP 미리보기로 최적화합니다. PNG 내보내기는 현재 프레임의 정지 이미지입니다.</p>`;document.querySelector('.panel.right').prepend(sequencePanel);
  $('gridToggle').onclick=()=>{gridVisible=!gridVisible;$('gridToggle').textContent=gridVisible?'50cm 격자 숨기기':'50cm 격자 표시';renderWall()};
  $('seqImport').onclick=()=>$('seqFiles').click();
  $('seqPlay').onclick=()=>{sequencePlaying=!sequencePlaying;$('seqPlay').textContent=sequencePlaying?'일시정지':'재생';syncSequenceLoop()};
  $('seqReset').onclick=()=>{sequenceTime=0;for(const {img,asset,node,object:o} of sequenceTargets){if(asset.frames?.length){img.src=sequenceFrame(asset,0);img.dataset.src=sequenceFrame(asset,0);img.dataset.frame='0'}if(node&&o){node.style.left=o.x+'px';node.dataset.motionX=String(o.x)}}};
  $('seqGuide').onclick=()=>{guidesVisible=!guidesVisible;$('seqGuide').textContent=guidesVisible?'L/C/R 가이드 숨기기':'L/C/R 가이드 표시';renderWall()};
  $('seqFps').onchange=()=>{const fps=clamp(+$('seqFps').value||30,1,60);$('seqFps').value=fps;for(const a of assets)if(a.frames)a.fps=fps;scheduleSave()};
  const loopLibrary=document.createElement('div');loopLibrary.innerHTML='<h3>제작 루핑 영상</h3><button class="btn" id="loopLibraryOpen">나비 · 새 · 구름 루프 선택</button><div id="loopLibraryGrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px"></div><p class="note">선택한 루프만 불러옵니다. 30fps · 투명 배경 · 256px 미리보기. 원본 알파 PNG는 별도 제공됩니다.</p>';sequencePanel.append(loopLibrary);
  loopLibrary.hidden=true;
  const inplaceLink=document.createElement('p');inplaceLink.className='note';inplaceLink.innerHTML='<a href="ambient-inplace.html" target="_blank" rel="noopener">제자리 루프 · 단색 영상 / AI 알파 / PNG 보기</a>';sequencePanel.append(inplaceLink);
  $('loopLibraryOpen').onclick=async()=>{
    const grid=$('loopLibraryGrid');if(grid.children.length){grid.hidden=!grid.hidden;return}
    const btn=$('loopLibraryOpen');btn.disabled=true;
    try{const response=await fetch('/assets/animations/manifest.json?v=center-size-v51-20261020');if(!response.ok)throw Error('루프 목록을 불러오지 못했습니다.');const loops=await response.json();
      for(const loop of loops.filter(l=>l.group!=='flowers'&&!window.jejuAmbient.isRetired(l))){const card=document.createElement('button');card.className='btn';const preview=document.createElement('img');preview.src=loop.frames[Math.min(loop.frames.length-1,loop.previewIndex??(loop.group==='flowers'?145:0))];preview.style.cssText='width:100%;height:85px;object-fit:contain;background:#19282c';const title=document.createElement('div');title.textContent=loop.name;card.append(preview,title);card.onclick=async()=>{card.disabled=true;try{let a=assets.find(x=>x.id==='loop-'+loop.id);if(!a){$('seqStatus').textContent='선택한 루프를 불러오는 중…';a={id:'loop-'+loop.id,name:loop.name+' · 루프',flowerAnimation:loop.group==='flowers',group:'decor',src:loop.frames[0],frames:loop.frames,fps:30};await warmSequence(a);await image(sequenceFrame(a,0));assets.push(a);renderPalette()}await warmSequence(a);addObject(a,W/2,H/2);sequenceTime=0;$('seqStatus').textContent=`${loop.name} · ${loop.frameCount}프레임 · 30fps · ${loop.duration.toFixed(2)}초`;}catch(err){notice(err.message)}finally{card.disabled=false}};grid.append(card)}
    }catch(err){notice(err.message)}finally{btn.disabled=false}
  };
  $('seqFiles').onchange=async e=>{
    const files=[...e.target.files].filter(f=>/\.png$/i.test(f.name)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    if(!files.length)return;
    if(files.length>600||files.reduce((n,f)=>n+f.size,0)>1024*1024*1024){notice('한 번에 600프레임 / 1GB 이하로 불러오세요.');e.target.value='';return}
    $('seqImport').disabled=true;const frames=[];
    try{let width,height;for(const [i,f] of files.entries()){
      const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});
      const im=await image(src);if(i===0){width=im.naturalWidth;height=im.naturalHeight}if(im.naturalWidth!==width||im.naturalHeight!==height)throw Error('모든 프레임의 가로·세로 크기가 같아야 합니다.');const canvas=document.createElement('canvas'),ratio=Math.min(1,256/Math.max(width,height));canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);frames.push(canvas.toDataURL('image/webp',.8));$('seqStatus').textContent=`최적화 중 ${i+1}/${files.length}`;
    }
    const a={id:uid(),name:'시퀀스 · '+files[0].name,group:'decor',src:frames[0],frames,fps:clamp(+$('seqFps').value||30,1,60)};assets.push(a);renderPalette();addObject(a,W/2,H/2);sequenceTime=0;$('seqStatus').textContent=`${frames.length}프레임 · ${a.fps}fps · ${(frames.length/a.fps).toFixed(2)}초 루프`;
    }catch(err){notice(err.message||'시퀀스를 불러오지 못했습니다.')}finally{$('seqImport').disabled=false;e.target.value=''}
  };

  let sequenceRaf=0;
  function syncSequenceLoop(){
    if(!sequencePlaying||!sequenceTargets.length||document.hidden||exhibitionActive){if(sequenceRaf)cancelAnimationFrame(sequenceRaf);sequenceRaf=0;return}
    if(!sequenceRaf){sequenceLast=performance.now();sequenceRaf=requestAnimationFrame(sequenceTick)}
  }
  function sequenceTick(now){
    sequenceRaf=0;if(!sequencePlaying||!sequenceTargets.length||document.hidden||exhibitionActive)return;
    sequenceTime+=Math.max(0,(now-sequenceLast)/1000);sequenceLast=now;
    for(const {img,asset:a,node,object:o} of sequenceTargets){
      if(a.frames?.length){const frame=Math.floor(sequenceTime*(a.fps||30))%a.frames.length;if(img.dataset.frame!==String(frame)){img.src=sequenceFrame(a,frame);img.dataset.src=sequenceFrame(a,frame);img.dataset.frame=frame}}
      const kind=window.jejuAmbient.atmosphereKind(a);if(kind&&node&&o){const p=window.jejuAmbient.driftPose(o,kind,sequenceTime,W,a);node.style.left=p.x+'px';node.dataset.motionX=String(p.x)}
    }
    sequenceRaf=requestAnimationFrame(sequenceTick);
  }
  document.addEventListener('visibilitychange',syncSequenceLoop);
  const qualityButton=document.createElement('button');qualityButton.className='btn';qualityButton.textContent='미리보기: 가볍게';qualityButton.style.marginBottom='8px';sequencePanel.prepend(qualityButton);
  qualityButton.onclick=()=>{lightPreview=!lightPreview;qualityButton.textContent=lightPreview?'미리보기: 가볍게':'미리보기: 선명하게';renderWall()};

  function nudgeObjects(dx,dy,step,record=true){
    const chosen=members();if(!chosen.length)return false;if(record)snapshot();
    const b=bounds(chosen),moveX=dx?clamp(dx*step,-(b.right-b.x)+30-b.x,W-30-b.x):0,moveY=dy?clamp(dy*step,-(b.bottom-b.y)+30-b.y,(chosen.some(o=>window.jejuSpace?.floorCover(assets.find(a=>a.id===o.assetId)))?100000:H-30)-b.y):0;
    for(const o of chosen){o.x+=moveX;o.y+=moveY}
    renderMovingObjects();renderProperties();syncUndo();scheduleSave();return true;
  }
  const movePanel=document.createElement('div');movePanel.className='group';movePanel.innerHTML=`<h3>선택 객체 이동</h3><label class="muted">버튼 이동 간격<select class="full-input" id="nudgeStep"><option value="1">1mm</option><option value="10">10mm</option><option value="50">50mm</option></select></label><div class="actions" style="margin-top:8px"><button class="btn" id="nudgeLeft">← 왼쪽</button><button class="btn" id="nudgeRight">오른쪽 →</button><button class="btn" id="nudgeUp">↑ 위쪽</button><button class="btn" id="nudgeDown">↓ 아래쪽</button></div><p class="note">다중 선택도 함께 이동합니다. 방향키 1mm · Shift+방향키 10mm.</p>`;sequencePanel.after(movePanel);
  for(const [id,x,y] of [['nudgeLeft',-1,0],['nudgeRight',1,0],['nudgeUp',0,-1],['nudgeDown',0,1]])$(id).onclick=()=>{if(!nudgeObjects(x,y,+$('nudgeStep').value))notice('이동할 꽃이나 객체를 먼저 선택하세요.')};
  window.addEventListener('keydown',e=>{
    const vectors={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},v=vectors[e.key];
    if(!v||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable)return;
    e.preventDefault();
    if(!nudgeObjects(v[0],v[1],e.shiftKey?10:1,!e.repeat)){const step=e.shiftKey?150:50;panX-=v[0]*step;panY-=v[1]*step;updateWallTransform()}
  });

  function registerCatalog(data){
    if(!data||!Array.isArray(data.assets)||!Array.isArray(data.backgrounds))throw Error('최종 요소 목록 형식 오류');
    const latest=data.assets.filter(a=>!a.referenceOnly&&a.kind!=='reference'&&a.category!=='background').map(a=>({...a,group:a.group==='flowers'?'flowers':a.category==='petal'?'petals':'decor'}));
    for(const a of latest){if(!a.id||!(a.src?.startsWith('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/')||currentPreviews.has(a.src))||a.src.includes('..'))throw Error('최종 요소 경로 오류');const previous=builtins.find(b=>b.id===a.id);if(previous)Object.assign(previous,currentFlowerAsset(a));else builtins.push(currentFlowerAsset(a));}
    for(const a of latest){for(const alias of a.legacyAssetIds||[]){if(alias===a.id)continue;const value={...a,id:alias,catalogHidden:true};const old=builtins.find(b=>b.id===alias);if(old)Object.assign(old,value);else builtins.push(value)}}
    const map=new Map(builtins.map(a=>[a.id,a]));assets=assets.map(a=>map.has(a.id)?{...map.get(a.id)}:currentFlowerAsset(a));for(const a of builtins)if(!assets.some(x=>x.id===a.id))assets.push({...a});
    if(data.backgrounds.length){backgroundChoices.splice(0,backgroundChoices.length,...data.backgrounds.map(a=>[a.src,a.name]));for(const a of data.backgrounds.filter(a=>a.kind==='video'))backgroundVideos[a.src]={name:a.name,poster:a.poster||a.thumb,thumb:a.thumb,fallbackSrc:a.fallbackSrc,revision:a.revision||''};const sel=$('backgroundSelect');sel.replaceChildren();for(const [value,label] of [['none','배경 없음'],...backgroundChoices,['custom','직접 불러온 배경']]){const option=document.createElement('option');option.value=value;option.textContent=label;sel.append(option)}$('backgroundGalleryCards').replaceChildren();const migrated=brightBackgroundProject({background,sceneFilters});background=migrated?.background||data.backgroundAliases?.[background?.split(/[?#]/)[0]]||background;if(migrated){sceneFilters=normalizeFilters(migrated.sceneFilters);backgroundDefaultVersion=83;}}
    for(const o of objects){const a=assets.find(a=>a.id===o.assetId);if(window.jejuAmbient.atmosphereKind(a)){if(!o.motion)o.motion=a.motion||'stationary';if(/구름.*루프/.test(o.name||'')&&a.sourceDriveId)o.name=a.name}}
    renderPalette();refresh();return latest.length;
  }
  function replaceSelection(asset){
    if(!asset?.src||asset.referenceOnly||!assets.some(a=>a.id===asset.id))throw Error('배치 가능한 요소를 선택하세요.');const chosen=members();if(!chosen.length)throw Error('바꿀 요소를 먼저 선택하세요.');
    snapshot();for(const o of chosen){o.assetId=asset.id;o.name=asset.name;if(asset.bloomVariant){o.flowerVariant=asset.bloomVariant;o.flowerColor=asset.tone}else{delete o.flowerVariant;delete o.flowerColor}if(asset.motion)o.motion=asset.motion;else delete o.motion}refresh();return chosen.length;
  }
  async function useSample(project){
    const backup=objects.length?'named:통합시안 이전 작업 '+new Date().toLocaleString('ko-KR')+' · '+uid():null;
    if(backup)await namedStore('write',backup,{...window.jejuEditor.project(),name:backup.slice(6),savedAt:new Date().toISOString()});
    await applyProject(project);await storeCurrent();await updateSavedLayouts();requestAnimationFrame(fit);return backup;
  }

  window.jejuEditor={W,H,uid,db,setGuides:visible=>{gridVisible=guidesVisible=visible;$('gridToggle').textContent=visible?'50cm 격자 숨기기':'50cm 격자 보이기';$('seqGuide').textContent=visible?'L/C/R 가이드 숨기기':'L/C/R 가이드 보이기';renderWall()},projectedObject:(o,a,height=H)=>window.jejuSpace?.pose(o,a,height,gardenSpace)||o,storeCurrent,restoreCurrent,updateSavedLayouts,objectVariant,currentFlowerAsset,notice,image,tintedFlowerSrc,displaySrc,drawBackground,backgroundDrawable,download,downloadName,isFlower,filterCSS,objectFilterCSS,
    getBackgroundGrade:()=>window.jejuBackgroundGrade.normalize(sceneFilters.backgroundGrade),setBackgroundGrade:(value,checkpoint=true)=>{if(checkpoint)snapshot();sceneFilters.backgroundGrade=window.jejuBackgroundGrade.normalize(value);applySceneFilters();scheduleSave();document.dispatchEvent(new CustomEvent('jeju-editor-change'));},
    getFocus:()=>window.jejuFocus.normalize(sceneFilters.focus),setFocus:(value,checkpoint=true)=>{if(checkpoint)snapshot();sceneFilters.focus=window.jejuFocus.normalize(value);applySceneFilters();scheduleSave();document.dispatchEvent(new CustomEvent('jeju-editor-change'));},
    setObjectBlur:(value,checkpoint=true)=>{const items=members();if(!items.length)return;if(typeof value!=='number'||!Number.isFinite(value))return;if(checkpoint)snapshot();for(const o of items)o.blur=clamp(value,0,40);applySceneFilters();scheduleSave();document.dispatchEvent(new CustomEvent('jeju-editor-change'));},
    brightenBackground:()=>{const key=window.jejuSceneHarmony.theme(background,window.jejuWhole62?.scenes||[]);if(!key){notice('먼저 정원 배경을 선택해 주세요.');return}snapshot();const f=window.jejuSceneHarmony.filters(key);sceneFilters.background=f.background;sceneFilters.backgroundGrade=f.backgroundGrade;applySceneFilters();scheduleSave();document.dispatchEvent(new CustomEvent('jeju-editor-change'));notice('배경만 조금 밝고 색감이 풍부하게 보정했습니다.');},
    state:()=>({assets,objects,background,reference,sceneFilters,gardenSpace,backgroundDefaultVersion}),selected:()=>members(),registerCatalog,replaceSelection,useSample,varyFlowerDirections,halfDefaultFlowers,fillForeground,applyContrastAdditions,applySceneHarmony,
    selectGroupObjects:(groupId,assetId=null)=>{const chosen=objects.filter(o=>o.groupId===groupId&&(!assetId||o.assetId===assetId));if(!chosen.length)return;selectedIds=new Set(chosen.map(o=>o.id));selected=chosen.at(-1).id;refresh()},
    changeGroupDensity:(increase,groupId,assetId=null)=>{const group=window.jejuGroupDensity.selectedGroup(objects,members());if(!group||group.id!==groupId)return;const change=window.jejuGroupDensity.change(objects,groupId,assetId,increase,uid);if(!change.count)return; snapshot();objects=change.objects;const chosen=objects.filter(o=>o.groupId===groupId);selectedIds=new Set(chosen.map(o=>o.id));selected=chosen.at(-1).id;refresh();notice(`${group.name} · ${change.count}개 ${increase?'추가':'삭제'} (${change.before} → ${change.after}개)`);return change.count},
    selectObject:id=>{const o=objects.find(o=>o.id===id);if(!o)throw Error('요소를 찾지 못했습니다.');selected=o.id;selectedIds=new Set([o.id]);refresh()},
    addAsset:a=>addObject(assets.find(x=>x.id===a.id)||a,W/2,H/2),
    setBackground:src=>{const target=brightBackgroundProject({background:src})?.background||src;if(!backgroundChoices.some(([value])=>value===target))throw Error('등록된 배경을 선택하세요.');snapshot();applyBackground(src)},
    setMotion:motion=>{if(!['stationary','left','right'].includes(motion))throw Error('이동 방향 오류');snapshot();for(const o of members())o.motion=motion;refresh()},
    openExhibition:()=>switchWorkspace(true),
    center:()=>{const r=els.view.getBoundingClientRect();return{x:(r.width/2-panX)/scale,y:(r.height/2-panY)/scale}},
    varyFlowerShapes:async()=>{
      const selectedItems=members(),items=(selectedItems.length?selectedItems:objects).filter(isFlower),changes=window.jejuFlowerShapes.plan(items,assets);
      if(!changes.length){notice('같은 꽃·색상·조명의 변형을 찾지 못했습니다.');return 0}
      const before=JSON.stringify(items);try{await Promise.all([...new Set(changes.map(c=>assets.find(a=>a.id===c.patch.assetId).src))].map(image));}catch{notice('새 꽃 PNG를 준비하지 못해 기존 꽃을 유지했습니다. 다시 시도해 주세요.');return 0}
      if(JSON.stringify(items)!==before||items.some(o=>!objects.includes(o))){notice('PNG를 준비하는 동안 배치가 변경되었습니다. 다시 눌러 주세요.');return 0}
      snapshot();const map=new Map(objects.map(o=>[o.id,o]));for(const change of changes){const o=map.get(change.id);Object.assign(o,change.patch);delete o.flowerVariant;delete o.flowerColor}refresh();notice(`${changes.length}개 꽃의 형태와 방향을 섞었습니다. 크기와 줄기 끝 위치를 유지했습니다.`);return changes.length;
    },
    applyProcedural:(items,groupId=null,replaceGround=false)=>{
      const P=window.jejuProceduralGarden,assetIds=new Set(assets.map(a=>a.id)),ids=new Set();
      if(!Array.isArray(items)||!items.length||items.length>1600)throw Error('꽃밭 요소 수가 올바르지 않습니다.');
      for(const o of items){if(!o||typeof o.id!=='string'||!o.id||ids.has(o.id)||!assetIds.has(o.assetId)||!['x','y','w','h','r','opacity'].every(k=>Number.isFinite(o[k]))||o.w<=0||o.h<=0||o.opacity<0||o.opacity>1||!o.groupId||o.groupId!==(groupId||items[0].groupId)||o.procedural?.type!=='flower-bed')throw Error('꽃밭 배치 데이터가 올바르지 않습니다.');ids.add(o.id)}
      if(groupId&&P.selectedGroup(objects,members())?.id!==groupId)throw Error('갱신할 PCG 꽃밭 그룹을 선택해 주세요.');
      snapshot();objects=P.apply(objects,items,assets,groupId,replaceGround);selectedIds=new Set(items.map(o=>o.id));selected=items.at(-1).id;refresh();notice(`${items.length}개 요소의 PCG 꽃밭을 적용했습니다.`);
    },
    insert:(items,extraAssets)=>{snapshot();assets.push(...extraAssets.map(currentFlowerAsset));objects.push(...items);selectedIds=new Set(items.map(o=>o.id));selected=items.at(-1)?.id;renderPalette();refresh()},
    project:()=>({format:'jeju-maze-wall-v1',gameAtmosphereVersion:89,name:$('saveName').value.trim()||'꽃군집 프로젝트',width:W,height:H,editableActors:true,backgroundPlaylist:assets.some(a=>a.completeObject&&objects.some(o=>o.assetId===a.id))?(background?[background]:[]):window.jejuFinalCatalog?.backgrounds?.map(a=>a.src),assets:assets.filter(a=>objects.some(o=>o.assetId===a.id)),backgroundFit:sourceRegistered.has(background)?'fill':'cover',objects:objects.map(o=>{const v=objectVariant(o,assets.find(a=>a.id===o.assetId));return v?{...o,flowerVariant:v.id,flowerColor:v.tone}:o}),background,backgroundLoop:window.jejuSeparatedLoops?.backgrounds?.find(b=>b.sourcePNG===background)?.video,reference,sceneFilters,gardenSpace,flowerAssetVersion:2,oilAssetVersion:14,backgroundDefaultVersion})};
  function exhibitionMessage(message){$('exhibitionFrame').contentWindow?.postMessage(message,location.origin)}
  function sendExhibitionProject(){if(exhibitionReady&&exhibitionActive){exhibitionMessage({type:'jeju-exhibition-project',project:window.jejuEditor.project()});exhibitionMessage({type:'jeju-exhibition-active',active:!document.hidden})}}
  let exhibitionTemplateTask;
  function exhibitionTemplate(){if(!exhibitionTemplateTask)exhibitionTemplateTask=fetch('player-embed.txt?v=butterfly98').then(response=>{if(!response.ok)throw Error('게임 화면을 불러오지 못했습니다. 게임 모드를 다시 눌러 주세요.');return response.text()}).then(html=>{if(!html.includes('data-jeju-embedded')||!html.includes('player.js'))throw Error('게임 화면 파일이 올바르지 않습니다.');return html}).catch(error=>{exhibitionTemplateTask=null;throw error});return exhibitionTemplateTask}
  async function switchWorkspace(exhibition){
    const request=++workspaceRequest,frame=$('exhibitionFrame');let template;
    if(exhibition)try{await bloomReady;while(pendingObjectAdds.size)await Promise.allSettled([...pendingObjectAdds]);if(!frame.getAttribute('srcdoc'))template=await exhibitionTemplate()}catch(err){if(request!==workspaceRequest)return;$('exhibitionStatus').hidden=false;$('exhibitionStatus').textContent=err.message;return}
    if(request!==workspaceRequest)return;
    if(exhibition){flushPointerMove();if(drag&&!['pan','marquee'].includes(drag.mode))scheduleSave();drag=null;pendingPointer=null;marquee.style.display='none';els.view.classList.remove('grabbing');}
    exhibitionActive=exhibition;for(const [id,active] of [['editorTab',!exhibition],['exhibitionTab',exhibition]]){$(id).setAttribute('aria-selected',String(active));$(id).tabIndex=active?0:-1;$(id).classList.toggle('primary',active)}$('editorWorkspace').hidden=exhibition;$('exhibitionWorkspace').hidden=!exhibition;$('exhibitionStatus').hidden=!exhibition;
    if(exhibition){$('exhibitionStatus').textContent='꽃 터치 게임을 준비하고 있습니다…';if(!frame.getAttribute('srcdoc')){exhibitionReady=false;frame.srcdoc=template}else sendExhibitionProject()}else{exhibitionMessage({type:'jeju-exhibition-active',active:false});requestAnimationFrame(fit)}
    syncSequenceLoop();updateBackgroundPlayback();
  }
  $('editorTab').onclick=()=>switchWorkspace(false);$('exhibitionTab').onclick=()=>switchWorkspace(true);
  for(const id of ['editorTab','exhibitionTab'])$(id).addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();const next=id==='editorTab'?'exhibitionTab':'editorTab';$(next).focus();$(next).click()}});
  $('exhibitionBloomAll').onclick=()=>exhibitionMessage({type:'jeju-exhibition-bloom-all'});
  $('exhibitionFullscreen').onclick=()=>{const task=document.fullscreenElement?document.exitFullscreen():$('exhibitionWorkspace').requestFullscreen?.();task?.catch(()=>{$('exhibitionStatus').textContent='이 브라우저에서 전체 화면을 열 수 없습니다.'})};
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('exhibitionFrame').contentWindow)return;const data=e.data;if(data?.type==='jeju-exhibition-ready'){exhibitionReady=true;sendExhibitionProject()}else if(data?.type==='jeju-exhibition-loaded'){$('exhibitionStatus').textContent=`${Number.isFinite(data.flowerCount)?data.flowerCount:0}개 꽃 · 터치하면 꽃잎 흩날림 · 꽃·풀 살랑임 · 떠다니는 빛과 느린 구름`+(Number.isFinite(data.openingCount)&&data.openingCount>0?` · 검수된 3초 개화 ${data.openingCount}종`:' · 개화 영상 미연결')+(data.unavailable?.length?` · ${data.unavailable.length}개 상태 이미지 미연결`:'')}else if(data?.type==='jeju-exhibition-error')$('exhibitionStatus').textContent=typeof data.message==='string'?data.message:'게임 콘텐츠를 불러오지 못했습니다.'});
  document.addEventListener('visibilitychange',()=>{if(exhibitionReady)exhibitionMessage({type:'jeju-exhibition-active',active:exhibitionActive&&!document.hidden})});
  const bloomReady=fetch('assets/abstract-scene-v44/bloom-manifest_v44.json?v=44').then(response=>{if(!response.ok)throw Error('색상별 꽃 영상 목록을 불러오지 못했습니다.');return response.json()}).then(data=>{installBloomManifest(data);buildFlowerChoices();buildColorChoices();renderPalette();refresh();return restoreCurrent().then(()=>updateSavedLayouts()).then(()=>requestAnimationFrame(fit))});
  window.jejuEditor.ready=bloomReady;
  bloomReady.catch(err=>{$('exhibitionStatus').hidden=false;$('exhibitionStatus').textContent=err.message;notice(err.message)});
})();
