const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(require.resolve('../docs/'+n),'utf8');
function navigation(page,search=''){
 const nodes=[];
 class El{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.classList={add(){}};this.style={setProperty(){}}}append(...v){this.children.push(...v)}prepend(v){this.children.unshift(v)}after(v){nodes.push(v)}setAttribute(k,v){this.attrs[k]=v}}
 const body=new El('body');vm.runInNewContext(read('site-nav.js'),{document:{body,createElement:t=>new El(t),documentElement:new El('html')},location:{pathname:'/Schedule_App/'+page,search,href:'https://example.test/'+page},URLSearchParams,ResizeObserver:class{observe(){}}});
 return {bar:body.children[0],notice:nodes[0]};
}
const latest=['library.html','abstract-world-v44.html','all-images.html','oil-art.html','layers-v55.html','lighting-sets.html','oil-sources.html','editor.html','index.html'];
const old=['layers.html','all-images-old.html','abstract-flowers-v43.html','single-flowers.html','scene-loops.html','generation-v38.html','generation-v40.html','production.html','ambient-loops.html','ambient-inplace.html','cloud-sample.html','oil-art-v21-archive.html','oil-gallery-v26-archive.html','oil-sources-v27-archive.html','lighting-sets-v32-archive.html','index-v19-archive.html','index-v44-archive.html','oil-art-v44-archive.html','oil-art-v49-archive.html','oil-art-v51-archive.html'];
for(const page of [...latest,'old.html',...old]){
 const n=navigation(page),links=n.bar.children[0].children;
 assert.equal(links.length,latest.length+1);assert.equal(links.at(-1).textContent,'올드');
 assert.equal(links.find(a=>a.attrs['aria-current']==='page').href,old.includes(page)?'old.html':page);
 assert.equal(!!n.notice,old.includes(page));
}
assert(!navigation('player.html','?embed=1').bar);
for(const page of old)assert(read('old.html').includes('href="'+page+'"'),page+' must be discoverable in Old');
for(const page of old)assert(!read('library.html').includes('href="'+page),page+' must leave the current library');
for(const file of ['all-images.html','all-images-old.html']){
 const html=read(file),keys=[...html.matchAll(/<main[^>]*data-page="([^"]+)"/g)].map(m=>m[1]);
 const code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function showPage'));
 for(const hash of ['',...keys.map(k=>'#'+k),'#unknown','#real']){
  const mains=keys.map(k=>({dataset:{page:k}})),location={hash,search:'',replace(url){this.redirect=url}},document={title:'',body:{classList:{add(){}}},querySelectorAll:s=>s==='main[data-page]'?mains:[]};
  vm.runInNewContext(code,{document,location,URLSearchParams,window:{addEventListener(){}}});
  if(file==='all-images.html'&&hash==='#real')assert.equal(location.redirect,'all-images-old.html#real');else assert.equal(mains.filter(m=>!m.hidden).length,1);
 }
 assert.equal(keys.length,file==='all-images.html'?9:4);
}
console.log('PASS: Old archive covers20 pages, current menu stays current, earlier deep links redirect, both image tab routers show one section, and embedded player stays unchanged.');
