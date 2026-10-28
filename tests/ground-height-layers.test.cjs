const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const read=name=>fs.readFileSync('docs/'+name,'utf8'),G=require('../docs/background-grade');
const clone=value=>JSON.parse(JSON.stringify(value)),tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return{promise,resolve}};
class Element{
 constructor(tag='div'){this.tagName=tag;this.value='';this.disabled=false;this.hidden=false;this.checked=true;this.dataset={};this.attributes={};this.children=[];this.textContent='';this.style={};this.classList={toggle(){}};}
 setAttribute(name,value){this.attributes[name]=value;}
 getAttribute(name){return this.attributes[name]??null;}
 append(...children){this.children.push(...children);}
 after(element){this.afterElement=element;}
 remove(){this.removed=true;}
 click(){this.onclick?.({preventDefault(){}});this.onClicked?.();}
}
function fixture(theme){return{format:'jeju-maze-wall-v1',name:theme,width:14165,height:3480,background:theme+'.png',assets:[{id:theme+'-grass',category:'grass',src:theme+'-grass.png'}],objects:[{id:'plant',assetId:theme+'-grass',x:31,y:52,w:63,h:74,r:5}],sceneFilters:{backgroundGrade:{hue:theme==='sunset'?24:51,exposure:.35,brightness:112,curve:[0,60,128,195,255],groundHeight:7}}};}
function layered(search='?theme=sunset'){
 const nodes=new Map(),messages=[],fetches=[],events={},downloads=[],blobs=new Map(),timers=[],pipeline=[],srcdocReady=deferred(),projectWaiters=[];
 const get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
 get('layerTheme').value='sunset';get('referencePanel').hidden=true;get('groundHeight').value='0';get('groundHeight').disabled=true;
 const frame=get('layerPlayer');frame.contentWindow={postMessage:(value,origin)=>{const record={value:clone(value),origin};messages.push(record);if(value.type==='jeju-exhibition-project')projectWaiters.shift()?.resolve(record.value.project);}};
 Object.defineProperty(frame,'srcdoc',{set(value){this.attributes.srcdoc=value;srcdocReady.resolve();}});
 const source=Object.fromEntries(['sunset','day'].map(theme=>[theme,JSON.stringify(fixture(theme))]));
 const release={assets:[],scenes:Object.keys(source).map(id=>({id,name:id,project:'layouts/'+id+'.json',projectSha256:crypto.createHash('sha256').update(source[id]).digest('hex'),integrated:{src:id+'-integrated.png'}}))};
 const original=JSON.stringify({release,source}),location={href:'https://example.test/layered-garden.html'+search,origin:'https://example.test',search};
 class BrowserURL extends URL{static createObjectURL(blob){const id='blob:test-'+(blobs.size+1);blobs.set(id,blob);return id;}static revokeObjectURL(id){blobs.delete(id);}}
 const document={hidden:false,body:new Element('body'),getElementById:get,querySelectorAll:()=>['background','flower','grass,leaf,tree'].map(value=>Object.assign(new Element('input'),{value})),addEventListener:(type,fn)=>events['document:'+type]=fn,createElement:tag=>{const element=new Element(tag);element.onClicked=()=>{if(element.href?.startsWith('blob:'))downloads.push({href:element.href,download:element.download,blob:blobs.get(element.href)});};return element;}};
 const c={document,location,URL:BrowserURL,URLSearchParams,Blob,TextEncoder,Uint8Array,JSON,Number,Array,Object,Promise,console,crypto:crypto.webcrypto,setTimeout:(fn,ms)=>timers.push({fn,ms}),history:{replaceState:(_a,_b,url)=>{location.href=String(url);location.search=new URL(location.href).search;}}};
 c.window=c;c.addEventListener=(type,fn)=>events[type]=fn;c.jejuBackgroundGrade=G;
 c.jejuSeparatedMotion={validate:value=>value,project:(value,manifest,useVideo)=>{pipeline.push({step:'separated',useVideo});return clone(value);}};c.jejuReferenceLayout={project:value=>clone(value)};c.jejuElementLoops={project:value=>clone(value)};c.jejuFlowerOpening={project:value=>clone(value)};
 c.jejuAmbient={cleanProject:value=>{pipeline.push({step:'clean'});return{...clone(value),environmentPolicy:'static-png'};}};
 c.jejuRestoredBushes={project:value=>{pipeline.push({step:'restored-bushes'});return{...clone(value),restoredBushes99:{version:99,completeObject:true}};}};
 c.fetch=async path=>{fetches.push(path);return{ok:true,json:async()=>path.includes('current-release')?clone(release):{},text:async()=>path.startsWith('layouts/')?source[path.split('/')[1].replace('.json','')]:'<body data-jeju-embedded><script src="player.js"></script></body>'};};
 vm.runInNewContext(read('layered-garden.js'),c);
 return{get,frame,c,messages,downloads,fetches,timers,blobs,pipeline,release,source,original,srcdocReady:srcdocReady.promise,message:(data,origin=location.origin,sender=frame.contentWindow)=>events.message({origin,source:sender,data}),nextProject:()=>{const item=deferred();projectWaiters.push(item);return item.promise;},location};
}
async function start(t){await t.srcdocReady;const pending=t.nextProject();t.message({type:'jeju-exhibition-ready'});const p=await pending;t.message({type:'jeju-exhibition-loaded',flowerCount:1,openingCount:1});return p;}

test('ground controls are accessible and their shared grade dependency loads first',()=>{
 const html=read('layered-garden.html'),input=html.match(/<input\b[^>]*\bid="groundHeight"[^>]*>/)?.[0];
 assert(input);for(const attribute of ['type="range"','min="-15"','max="40"','step="1"','disabled'])assert(input.includes(attribute));
 assert(/<label\b[^>]*for="groundHeight"[^>]*>/.test(html));assert(html.includes('id="groundHeightValue"'));assert(html.includes('하늘')&&html.includes('산'));
 assert(html.indexOf('background-grade.js')<html.indexOf('layered-garden.js'));
});
test('shared URLs clamp ground height while keeping source colors and placements',async()=>{
 const t=layered('?theme=sunset&groundHeight=999');const p=await start(t);
 assert.equal(p.sceneFilters.backgroundGrade.groundHeight,40);assert.equal(t.get('groundHeight').value,'40');assert.equal(t.get('groundHeight').disabled,false);
 assert.equal(p.sceneFilters.backgroundGrade.hue,24);assert.equal(p.sceneFilters.backgroundGrade.exposure,.35);assert.deepEqual(p.objects,fixture('sunset').objects);
 assert.deepEqual(t.pipeline,[{step:'separated',useVideo:false},{step:'clean'},{step:'restored-bushes'}]);assert.equal(p.environmentPolicy,'static-png');assert.deepEqual(p.restoredBushes99,{version:99,completeObject:true});assert.deepEqual(t.c.jejuCurrentRelease,t.release);assert(t.c.jejuSeparatedLoops);
 assert.equal(new URL(t.get('editGarden').href,t.location.href).searchParams.get('groundHeight'),'40');
 assert.equal(JSON.stringify({release:t.release,source:t.source}),t.original);
});
test('live height updates do not reload actors and remain in theme links and JSON download',async()=>{
 const t=layered();await start(t);const before=t.messages.filter(m=>m.value.type==='jeju-exhibition-project').length;
 t.get('groundHeight').value='16';t.get('groundHeight').oninput();
 const live=t.messages.filter(m=>m.value.type==='jeju-exhibition-background-grade').at(-1);
 assert(live);assert.equal(live.value.grade.groundHeight,16);assert.equal(live.value.grade.hue,24);assert.equal(live.value.grade.brightness,112);assert.deepEqual(live.value.grade.curve,[0,60,128,195,255]);
 assert.equal(t.messages.filter(m=>m.value.type==='jeju-exhibition-project').length,before);assert.equal(new URL(t.location.href).searchParams.get('groundHeight'),'16');
 const next=t.nextProject();t.get('layerTheme').value='day';t.get('layerTheme').onchange();const p=await next;t.message({type:'jeju-exhibition-loaded',flowerCount:1,openingCount:1});
 assert.equal(p.sceneFilters.backgroundGrade.groundHeight,16);assert.equal(p.sceneFilters.backgroundGrade.hue,51);assert.deepEqual(p.objects,fixture('day').objects);
 const editor=new URL(t.get('editGarden').href,t.location.href);assert.equal(editor.searchParams.get('currentSet'),'day');assert.equal(editor.searchParams.get('groundHeight'),'16');
 t.get('layerLayout').onclick({preventDefault(){}});assert.equal(t.downloads.length,1);const saved=JSON.parse(await t.downloads[0].blob.text());assert.equal(saved.sceneFilters.backgroundGrade.groundHeight,16);assert.equal(saved.sceneFilters.backgroundGrade.hue,51);assert.deepEqual(saved.objects,fixture('day').objects);assert.deepEqual(saved.restoredBushes99,{version:99,completeObject:true});assert.equal(saved.environmentPolicy,'static-png');assert.equal(t.blobs.size,1);assert.equal(t.timers.at(-1).ms,1000);t.timers.at(-1).fn();assert.equal(t.blobs.size,0);
});
test('untrusted iframe messages cannot enable or reload the garden',async()=>{
 const t=layered();await t.srcdocReady;t.message({type:'jeju-exhibition-ready'},'https://other.test');t.message({type:'jeju-exhibition-ready'},t.location.origin,{});await tick();
 assert.equal(t.messages.filter(m=>m.value.type==='jeju-exhibition-project').length,0);assert.equal(t.get('groundHeight').disabled,true);
 const next=t.nextProject();t.message({type:'jeju-exhibition-ready'});await next;t.message({type:'jeju-exhibition-loaded'},'https://other.test');assert.equal(t.get('groundHeight').disabled,true);
});
function editor(search){
 const changes=[],samples=[],notices=[],groups=[],prepared=[],ready=deferred();let grade=G.normalize({hue:73,exposure:.6,brightness:118,groundHeight:4});
 const document={createElement:tag=>new Element(tag),querySelector:()=>({after:group=>groups.push(group)})},location={href:'https://example.test/editor.html'+search};
 const E={ready:ready.promise,image:()=>{},notice:text=>notices.push(text),useSample:async p=>{samples.push(clone(p));grade=G.normalize(p.sceneFilters?.backgroundGrade);},getBackgroundGrade:()=>clone(grade),setBackgroundGrade:value=>{grade=G.normalize(value);changes.push(clone(grade));}};
 const c={document,location,URL,URLSearchParams,Promise,console,Option:function(name,id){return{text:name,value:id};},fetch:()=>{},history:{replaceState:(_a,_b,url)=>location.href=String(url)}};c.window=c;c.jejuEditor=E;c.jejuCurrentRelease={assets:[],scenes:[{id:'sunset',name:'노을'}]};c.jejuBackgroundGrade=G;c.jejuCurrentProjects={load:async theme=>fixture(theme),prepare:(value,theme,release)=>{prepared.push({theme,release});return{...clone(value),restoredBushes99:{version:99},savedVideo:{mediaType:'video',loopVideo:'approved-user-video.mp4'}};}};c.jejuReferenceLayout={project:value=>clone(value)};
 vm.runInNewContext(read('current-release-editor.js'),c);ready.resolve();
 return{c,E,changes,samples,notices,groups,prepared,location,getGrade:()=>grade,flush:tick};
}
test('editor import applies explicit ground height after its scene without resetting color grade',async()=>{
 const t=editor('?currentSet=sunset&groundHeight=19');await t.flush();
 assert.equal(t.samples.length,1);assert.equal(t.changes.length,1);assert.equal(t.getGrade().groundHeight,19);assert.equal(t.getGrade().hue,24);assert.equal(t.getGrade().brightness,112);
 assert.equal(t.prepared.length,1);assert.equal(t.prepared[0].theme,'sunset');assert.equal(t.prepared[0].release,t.c.jejuCurrentRelease);assert.deepEqual(t.samples[0].restoredBushes99,{version:99});assert.equal(t.samples[0].savedVideo.loopVideo,'approved-user-video.mp4');assert(t.groups[0].children.some(element=>element.href==='production-status.html#flower-5'));
 const url=new URL(t.location.href);assert.equal(url.searchParams.has('currentSet'),false);assert.equal(url.searchParams.has('groundHeight'),false);
});
test('missing height never overrides the imported grade, and an explicit height alone keeps the saved scene',async()=>{
 const normal=editor('?currentSet=sunset');await normal.flush();assert.equal(normal.samples.length,1);assert.equal(normal.changes.length,0);assert.equal(normal.getGrade().groundHeight,7);
 const saved=editor('?groundHeight=-999');await saved.flush();assert.equal(saved.samples.length,0);assert.equal(saved.changes.length,1);assert.equal(saved.getGrade().groundHeight,-15);assert.equal(saved.getGrade().hue,73);assert.equal(saved.getGrade().exposure,.6);
});
