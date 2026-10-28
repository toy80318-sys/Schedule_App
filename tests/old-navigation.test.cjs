const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync('docs/'+n,'utf8');
function navigation(page,search=''){
 const notices=[];class El{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.classList={add(){}};this.style={setProperty(){}}}append(...v){this.children.push(...v)}prepend(v){this.children.unshift(v)}after(v){notices.push(v)}setAttribute(k,v){this.attrs[k]=v}}
 const body=new El('body');vm.runInNewContext(read('site-nav.js'),{document:{body,createElement:t=>new El(t),documentElement:new El('html')},location:{pathname:'/Schedule_App/'+page,search,href:'https://example.test/'+page},URLSearchParams,ResizeObserver:class{observe(){}}});return{bar:body.children[0],notice:notices[0]};
}
const destinations=['layered-garden.html','source-cutouts.html','atmosphere-loops.html','editor.html'];
for(const page of [...destinations,'index.html','set-review.html','old.html','gallery-v62-archive.html','flower-shapes-v84-archive.html']){const n=navigation(page),links=n.bar.children.find(n=>n.className==='maze-nav-links').children;assert.deepEqual(links.map(a=>a.href.split('?')[0]),destinations);assert(!links.some(a=>a.href.startsWith('old.html')));const active=links.find(a=>a.attrs['aria-current']==='page');if(page==='set-review.html')assert.equal(active.href.split('?')[0],'editor.html');else if(page==='index.html')assert.equal(active.href.split('?')[0],'layered-garden.html');else if(destinations.includes(page))assert.equal(active.href.split('?')[0],page);else{assert(!active);assert(n.notice)}}
for(const theme of ['sunset','day','night','morning','invalid']){const nav=navigation('layered-garden.html','?theme='+theme),link=nav.bar.children.find(n=>n.className==='maze-nav-links').children[0],url=new URL(link.href,'https://example.test/');assert.equal(url.searchParams.get('theme'),theme==='invalid'?'sunset':theme);}
assert(!navigation('player.html','?embed=1').bar);
for(const page of ['single-flowers.html','generation-v40.html','flower-shapes-v80.html','gallery-v62-archive.html','atmosphere-assets-v84-archive.html'])assert(read('old.html').includes(page));
for(const page of ['index.html','source-cutouts.html'])assert(read(page).includes('<details>')&&read(page).includes('old.html'),'archive is secondary and collapsed');
console.log('PASS:4 purpose-based destinations,secondary review/archive links,archive notices and embedded-player isolation.');
