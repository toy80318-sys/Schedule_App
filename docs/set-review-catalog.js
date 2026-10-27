(() => {
  'use strict';
  const catalog=window.jejuFinalCatalog;
  if(!catalog)return;
  const base=src=>typeof src==='string'?src.split(/[?#]/)[0]:src,root='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/';
  const hashes={"BG01":"b0ce96d33d35da3759df1302975cd022c0d76b5868c75497eeae394b33d83533","BG02":"737572241559ca26307d8055c3687e5ba1153947043f8cebf01503ee33dad450","BG03":"74a1ca8783f7927e731a5490ff64fcbba76d4c044678aafce816d6f122bda24a","BG04":"75dd372084d3e54aaf29e0be616eb09408a4f0c134d2e026e2d84a8409fc4240"};
  const themes=[['BG01','노을','sunset'],['BG02','낮','day'],['BG03','달빛','night'],['BG04','아침','morning']];
  const backgrounds=themes.map(([code,label,theme])=>{
    const id=code+'-B04-V05',preview='assets/set-review-v01/preview/'+id+'.webp';
    return{id,name:label+' · 밝은 하늘 · 검은 현무암 흙 V05',theme,src:root+id+'.png',preview,thumb:preview,category:'background',group:'decor',kind:'image',stillOnly:true,imageStyleVersion:75,setReviewVersion:'V05',file:id+'.png',sha256:hashes[code],width:2172,height:724,catalogHidden:false};
  });
  const latest=new Map(backgrounds.map(a=>[a.theme,a])),ids=new Set(backgrounds.map(a=>a.id)),previous=[...(catalog.backgrounds||[]),...catalog.assets.filter(a=>a.category==='background')],removed=new Set(previous.filter(a=>!ids.has(a.id)).map(a=>a.id));
  const replacements={...(catalog.backgroundReplacements||{})},aliases=catalog.backgroundAliases||{};
  for(const a of previous){const target=latest.get(a.theme);if(target&&!ids.has(a.id)&&a.src)replacements[base(a.src)]=target.src;}
  for(const [code,,theme] of themes)for(const [part,version] of [['B01','V01'],['B02','V02'],['B03','V03']])replacements[root+code+'-'+part+'-'+version+'.png']=latest.get(theme).src;
  for(const f of catalog.sourceFiles||[]){const old=previous.find(a=>a.id===f.id),target=old&&latest.get(old.theme);if(target&&removed.has(f.id)&&f.stablePreviewUrl)replacements[base(f.stablePreviewUrl)]=target.src;}
  for(const [from,to] of Object.entries(aliases))if(Object.hasOwn(replacements,base(to)))replacements[base(from)]=replacements[base(to)];
  catalog.backgroundReplacements=replacements;
  catalog.backgroundAliases={...aliases,...replacements};
  catalog.assets=[...catalog.assets.filter(a=>a.category!=='background'),...backgrounds];
  catalog.backgrounds=backgrounds;
  catalog.sourceFiles=[...(catalog.sourceFiles||[]).filter(f=>!removed.has(f.id)&&!ids.has(f.id)),...backgrounds.map(a=>({id:a.id,relativePath:a.id+'.png',stablePreviewUrl:a.src}))];
})();
