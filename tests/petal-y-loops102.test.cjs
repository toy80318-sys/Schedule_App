const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {validate,safePath}=require('../docs/petal-y-loops.js');
const source=JSON.parse(fs.readFileSync('docs/assets/flower-petals-v90/manifest.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('docs/assets/petal-y-loops-v102/manifest.json','utf8'));
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

test('48 rotations preserve each original flower, petal, theme and verified output bytes',()=>{
 const before=JSON.stringify(manifest);assert.equal(validate(manifest),manifest);assert.equal(JSON.stringify(manifest),before);assert.equal(manifest.paidGenerations,0);assert.deepEqual([manifest.width,manifest.height,manifest.fps,manifest.seconds,manifest.frameCount,manifest.rotationAxis],[480,480,30,5,150,'Y']);
 assert.deepEqual(manifest.items.map(a=>a.id),source.items.map(a=>a.id));
 for(const a of manifest.items){const original=source.items.find(p=>p.id===a.id),folder='docs/assets/petal-y-loops-v102/'+a.id+'/';for(const k of ['name','theme','species','shape','backgroundId','lightingId','sourcePNG','sourceSHA256'])assert.equal(a[k],original[k]);assert.equal(a.sourcePetalSHA256,original.sha256);assert.equal(digest(a.sourcePetalPNG),original.sha256);for(const [name,hash]of Object.entries(a.hashes))assert.equal(digest(folder+name),hash);const qa=JSON.parse(fs.readFileSync('docs/'+a.qaFile));assert.equal(qa.sourceId,a.id);assert.equal(qa.inputHash,original.sha256);assert.equal(qa.periodClosureExact,true);assert.equal(qa.encodedAlphaChecked,true);assert.equal(qa.actualLastFrameDuplicatesFirst,false);assert.equal(qa.perFrame.length,150);assert(qa.perFrame.every((p,i)=>p.index===i&&p.borderPixels===0));assert.equal(qa.qa.encodedAlpha.framesChecked,150);assert.equal(qa.qa.encodedAlpha.opaqueInteriorFailures,0);assert.equal(qa.qa.encodedAlpha.borderFailures,0);assert.equal(qa.qa.encodedAlpha.alphaDecoder,'libvpx-vp9');for(const kind of ['alpha','key']){const p=qa.video[kind].probe,s=p.streams[0];assert.deepEqual([s.width,s.height,s.r_frame_rate,s.nb_read_frames],[480,480,'30/1','150']);assert.equal(Number(p.format.duration),5);}assert.match(a.backSurface,/both faces/);}
});

test('gallery rejects wrong timing, missing/duplicate sources and unsafe URLs',()=>{
 for(const alter of [d=>d.items.pop(),d=>d.items[1]=structuredClone(d.items[0]),d=>d.seconds=4,d=>d.rotationAxis='Z',d=>d.items[0].periodClosureExact=false,d=>d.items[0].encodedAlphaChecked=false,d=>d.items[0].sourcePetalSHA256='x',d=>d.items[0].alphaVideo='https://evil.test/a.webm',d=>d.items[0].alphaVideo='//evil.test/a.webm',d=>d.items[0].poster='../a.png',d=>d.items[0].keyVideo='assets/%2e%2e/a.mp4']){const bad=structuredClone(manifest);alter(bad);assert.throws(()=>validate(bad));}
 for(const value of ['//evil.test/a.png','/etc/a.png','a/../b','a\\b','javascript:alert(1)','assets/%2e%2e/a.png'])assert.equal(safePath(value),false);
});

function harness(protocol='https:'){
 const elements=new Map(),intersections=[],events=new Map(),historyCalls=[];
 class Element{
  constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.attributes={};this.events={};this.className='';this.textContent='';this.paused=true;this.hidden=false;this.tabIndex=0;this.playCalls=0;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(k,v){this.attributes[k]=String(v);}
  removeAttribute(k){delete this.attributes[k];}
  addEventListener(k,fn){this.events[k]=fn;}
  querySelectorAll(selector){const result=[];const walk=e=>{for(const c of e.children||[]){if(selector==='video'&&c.tagName==='video'||selector==='.play'&&c.className==='play')result.push(c);walk(c);}};walk(this);return result;}
  getBoundingClientRect(){return{top:20,bottom:120,left:0,right:100};}
  focus(){this.focused=true;}
  pause(){const active=!this.paused;this.paused=true;if(active)this.events.pause?.();}
  play(){this.playCalls++;this.paused=false;this.events.play?.();return Promise.resolve();}
 }
 for(const id of ['loopCards','loopStatus','themeTabs','themePanel','stopAll','backdrop','petalYData','packageDownload'])elements.set(id,new Element());
 elements.get('petalYData').textContent=JSON.stringify(manifest);
 const document={body:new Element('body'),hidden:false,getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener:(k,fn)=>events.set(k,fn)};
 const scope={document,URL,Promise,innerWidth:1200,innerHeight:900,location:{href:protocol==='file:'?'file:///garden/00_index.html':'https://garden.test/petal-y-loops.html',protocol},history:{replaceState:(...args)=>historyCalls.push(args)},fetch(){throw Error('Embedded local gallery must not fetch');},IntersectionObserver:class{constructor(cb){this.cb=cb;intersections.push(this);}observe(){}disconnect(){}}};scope.window=scope;vm.runInNewContext(fs.readFileSync('docs/petal-y-loops.js','utf8'),scope);
 return{elements,document,events,intersections,historyCalls};
}
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};

test('native controls have valid sources without autoplay and allow only one playing video',async()=>{
 const h=harness();await flush();const tabs=h.elements.get('themeTabs').children,cards=h.elements.get('loopCards');assert.equal(tabs.length,4);assert.equal(cards.children.length,12);assert(tabs[0].attributes['aria-selected']==='true');assert.equal(tabs[0].tabIndex,0);let videos=cards.querySelectorAll('video');assert.equal(videos.length,12);assert(videos.every(v=>v.preload==='none'&&v.loop&&v.muted&&v.playsInline&&v.src.endsWith('/alpha.webm')&&v.paused&&v.playCalls===0&&v.autoplay!==true));
 const buttons=cards.querySelectorAll('.play');buttons[0].onclick();await flush();assert.equal(videos[0].paused,false);assert(videos.slice(1).every(v=>v.paused&&v.playCalls===0));await videos[1].play();assert.equal(videos[0].paused,true);assert.equal(videos[1].paused,false);assert.equal(videos.filter(v=>!v.paused).length,1);assert.equal(buttons[0].textContent,'회전 재생');assert.equal(buttons[1].textContent,'일시 정지');
 h.elements.get('stopAll').onclick();assert(videos.every(v=>v.paused));buttons[1].onclick();h.intersections[0].cb([{target:videos[1],isIntersecting:false}]);assert(videos.every(v=>v.paused));
 tabs[1].onclick();assert.equal(cards.children.length,12);assert(cards.children[0].children[1].textContent.startsWith('낮'));assert(videos.every(v=>v.paused));let prevented=false;tabs[1].onkeydown({key:'ArrowRight',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(tabs[2].attributes['aria-selected'],'true');assert.equal(tabs[2].focused,true);assert.equal(tabs[1].tabIndex,-1);assert.equal(h.elements.get('themePanel').attributes['aria-labelledby'],'theme_night');
 h.elements.get('backdrop').onchange({target:{value:'light'}});assert.equal(h.document.body.dataset.backdrop,'light');const current=cards.querySelectorAll('video')[0];cards.querySelectorAll('.play')[0].onclick();h.document.hidden=true;h.events.get('visibilitychange')();assert.equal(current.paused,true);
});

test('local file gallery uses embedded data without network or history mutation',async()=>{const h=harness('file:');await flush();assert.equal(h.elements.get('loopCards').children.length,12);assert.equal(h.historyCalls.length,0);assert.equal(h.elements.get('loopStatus').className,'');});

test('page has keyboard tabs, status, four alpha backgrounds and local-data placeholder',()=>{const html=fs.readFileSync('docs/petal-y-loops.html','utf8');for(const text of ['role="tablist"','role="tabpanel"','aria-live="polite"','<script id="petalYData" type="application/json"></script>','value="checker"','value="light"','value="dark"','value="night"'])assert(html.includes(text));assert(html.includes('뒷면은 같은 원본 그림을 양면으로 사용'));assert(!html.includes('autoplay'));});
