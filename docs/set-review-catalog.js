(() => {
  'use strict';
  const catalog=window.jejuFinalCatalog;
  if(!catalog)return;
  for(const [code,label] of [['BG01','노을'],['BG02','낮'],['BG03','달빛'],['BG04','아침']]){
    for(const [background,version,name] of [['B01','V01','밝은 배경'],['B02','V02','약한 블러 배경'],['B03','V03','레퍼런스 추상 유화 배경'],['B04','V05','밝은 하늘 · 검은 현무암 흙 · 추상 유화']]){
      const id=`${code}-${background}-${version}`,src=`https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/${id}.png`,preview=`assets/set-review-v01/preview/${id}.webp`;
      if(catalog.assets.some(a=>a.id===id))continue;
      // Register full panoramas so editor, PNG export and player share the same wall fit.
      const asset={id,name:`${label} · ${name} ${version}`,src,preview,thumb:preview,category:'background',group:'decor',kind:'image',stillOnly:true,imageStyleVersion:75,catalogHidden:true};
      catalog.assets.push(asset);catalog.backgrounds.push(asset);
    }
  }
})();
