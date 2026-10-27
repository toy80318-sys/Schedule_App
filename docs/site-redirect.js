((root)=>{'use strict';
 const routes={'library.html':'index.html','abstract-world-v44.html':'index.html','all-images.html':'index.html','oil-art.html':'index.html','oil-gallery.html':'index.html','lighting-sets.html':'source-cutouts.html','oil-sources.html':'source-cutouts.html','flower-shapes.html':'source-cutouts.html','atmosphere-assets.html':'source-cutouts.html'};
 function target(page,search='',hash=''){
  const q=new URLSearchParams(search),key=hash.slice(1).split('/')[0].replace(/^source-(?=sunset|day|night|morning)/,''),themes=['sunset','day','night','morning'],codes={BG01:'sunset',BG02:'day',BG03:'night',BG04:'morning'},theme=[q.get('theme'),codes[key]||key].find(v=>themes.includes(v));let file=routes[page]||'index.html';if(['source-parts','flowers','stems','atmosphere'].includes(key))file='source-cutouts.html';
  const next=new URLSearchParams({v:'20261028-v88'});if(theme)next.set('theme',theme);if(page==='lighting-sets.html')next.set('category','background');if(page==='atmosphere-assets.html')next.set('category','atmosphere');if(page==='flower-shapes.html')next.set('category','flower');if(q.get('embed')==='1'&&file==='index.html')next.set('embed','1');return file+'?'+next+(page==='library.html'?'#workflow':'');
 }
 if(typeof module==='object'&&module.exports){module.exports={target};return}root.location.replace(target(root.location.pathname.split('/').pop(),root.location.search,root.location.hash));
})(typeof window==='object'?window:globalThis);
