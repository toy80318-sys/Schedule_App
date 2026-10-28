const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync('docs/'+p,'utf8'),app=read('app.js'),start=app.indexOf('  function exhibitionMessage('),end=app.indexOf('  const bloomReady=',start);
assert(start>0&&end>start);const bridge=app.slice(start,end);
const manifest=JSON.parse(read('assets/set-review-v01/manifest.json')),fixture=JSON.parse(read(manifest.backgrounds[0].project));
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(options={}){
  const nodes=new Map(),messages=[],fetches=[],events={window:{},document:{}},calls={save:0,fit:0,flush:0,sequence:0,playback:0,fullscreen:0};
  let project=freeze(structuredClone(fixture));const before=JSON.stringify(project);
  class Element{
    constructor(){this.hidden=false;this.attributes={};this.classes=new Set();this.listeners={};this.style={};this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name),remove:name=>this.classes.delete(name)};this.clicks=0;this.srcdocWrites=0;}
    setAttribute(key,value){this.attributes[key]=value;}
    getAttribute(key){return this.attributes[key]||null;}
    set srcdoc(value){this.attributes.srcdoc=value;this.srcdocWrites++;}
    addEventListener(type,listener){this.listeners[type]=listener;}
    focus(){this.focused=true;}
    click(){this.clicks++;this.lastClick=this.onclick?.();}
    requestFullscreen(){calls.fullscreen++;return Promise.resolve();}
  }
  const get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
  get('editorTab').setAttribute('aria-selected','true');get('exhibitionTab').setAttribute('aria-selected','false');get('exhibitionWorkspace').hidden=true;get('exhibitionStatus').hidden=true;
  const frame=get('exhibitionFrame');frame.contentWindow={postMessage:(value,origin)=>messages.push({value:structuredClone(value),origin})};
  const pending=new Set();if(options.addReady){let task=options.addReady.finally(()=>pending.delete(task));pending.add(task);}
  const document={hidden:false,fullscreenElement:null,addEventListener:(type,fn)=>events.document[type]=fn,exitFullscreen:()=>Promise.resolve()};
  const c={document,window:{jejuEditor:{project:()=>project},addEventListener:(type,fn)=>events.window[type]=fn},location:{origin:'https://toy80318-sys.github.io'},$:get,exhibitionActive:false,exhibitionReady:false,workspaceRequest:0,pendingObjectAdds:pending,bloomReady:options.editorReady||Promise.resolve(),Promise,Number,
    drag:options.drag||null,pendingPointer:options.pendingPointer||null,marquee:{style:{}},els:{view:new Element()},flushPointerMove:()=>calls.flush++,scheduleSave:()=>calls.save++,fit:()=>calls.fit++,requestAnimationFrame:fn=>fn(),syncSequenceLoop:()=>calls.sequence++,updateBackgroundPlayback:()=>calls.playback++,
    fetch:async url=>{fetches.push(url);if(options.fetchReady)await options.fetchReady;return{ok:!options.httpFailure,text:async()=>options.invalidTemplate?'bad template':'<body data-jeju-embedded="true"><script src="player.js?v=ground-height"></script></body>'};}
  };
  vm.runInNewContext(bridge+';this.switch=switchWorkspace;',c);
  const message=(value,origin=c.location.origin,source=frame.contentWindow)=>events.window.message({origin,source,data:value});
  return{c,get,frame,calls,messages,fetches,options,before,message,switch:c.switch,project:()=>JSON.stringify(project),setProject:value=>project=freeze(structuredClone(value)),visibility:hidden=>{document.hidden=hidden;events.document.visibilitychange();}};
}
(async()=>{
  let t=setup();await t.switch(true);
  assert.equal(t.fetches[0],'player-embed.txt?v=ground-height-grass101');assert.equal(t.c.exhibitionActive,true);assert.equal(t.get('editorWorkspace').hidden,true);assert.equal(t.get('exhibitionWorkspace').hidden,false);assert.equal(t.frame.srcdocWrites,1);
  assert.equal(t.get('exhibitionTab').getAttribute('aria-selected'),'true');assert.equal(t.get('editorTab').tabIndex,-1);assert.equal(t.messages.length,0,'project waits for the iframe ready handshake');
  t.message({type:'jeju-exhibition-ready'},'https://evil.test');t.message({type:'jeju-exhibition-ready'},undefined,{});assert.equal(t.messages.length,0,'both origin and frame source must match');
  t.message({type:'jeju-exhibition-ready'});assert.deepEqual(t.messages.map(m=>m.value.type),['jeju-exhibition-project','jeju-exhibition-active']);assert.equal(t.messages[1].value.active,true);assert(t.messages.every(m=>m.origin==='https://toy80318-sys.github.io'));
  assert.equal(JSON.stringify(t.messages[0].value.project),t.before);assert.equal(t.project(),t.before);assert.equal(t.calls.save,0,'game entry never saves or mutates the layout');
  t.message({type:'jeju-exhibition-loaded',flowerCount:320,openingCount:8,unavailable:[]});assert(t.get('exhibitionStatus').textContent.includes('꽃잎 흩날림'));assert(t.get('exhibitionStatus').textContent.includes('검수된 3초 개화 8종'));const status=t.get('exhibitionStatus').textContent;t.message({type:'jeju-exhibition-error',message:'spoof'},'https://evil.test');assert.equal(t.get('exhibitionStatus').textContent,status);
  t.get('exhibitionBloomAll').click();assert.equal(t.messages.at(-1).value.type,'jeju-exhibition-bloom-all');t.get('exhibitionFullscreen').click();assert.equal(t.calls.fullscreen,1);
  t.visibility(true);assert.equal(t.messages.at(-1).value.active,false);t.visibility(false);assert.equal(t.messages.at(-1).value.active,true);
  await t.switch(false);assert.equal(t.c.exhibitionActive,false);assert.equal(t.get('editorWorkspace').hidden,false);assert.equal(t.get('exhibitionWorkspace').hidden,true);assert.equal(t.messages.at(-1).value.active,false);assert.equal(t.calls.fit,1);assert.equal(t.project(),t.before);
  t.visibility(false);assert.equal(t.messages.at(-1).value.active,false,'hidden game remains inactive after editor return');
  const edited=structuredClone(fixture);edited.objects[0].x+=13;t.setProject(edited);await t.switch(true);assert.equal(t.frame.srcdocWrites,1,'returning to game reuses the iframe');assert.equal(t.fetches.length,1);assert.equal(t.messages.at(-2).value.project.objects[0].x,edited.objects[0].x,'the current edited project is sent on re-entry');assert.equal(t.calls.save,0);
  const editor=deferred(),adding=deferred();t=setup({editorReady:editor.promise,addReady:adding.promise});const gated=t.switch(true);await tick();assert.equal(t.fetches.length,0);editor.resolve();await tick();assert.equal(t.fetches.length,0,'pending image additions finish before projection');adding.resolve();await gated;assert.equal(t.frame.srcdocWrites,1);
  const downloading=deferred();t=setup({fetchReady:downloading.promise});const stale=t.switch(true);await tick();await t.switch(false);downloading.resolve();await stale;assert.equal(t.c.exhibitionActive,false);assert.equal(t.frame.srcdocWrites,0,'a slower stale entry cannot reopen game after editor was selected');assert(!t.messages.some(m=>m.value.type==='jeju-exhibition-project'));
  for(const options of [{httpFailure:true},{invalidTemplate:true},{editorReady:Promise.reject(Error('editor unavailable'))}]){t=setup(options);await t.switch(true);assert.equal(t.c.exhibitionActive,false);assert.equal(t.get('editorWorkspace').hidden,false);assert.equal(t.frame.srcdocWrites,0);assert.equal(t.project(),t.before);assert.equal(t.calls.save,0);assert(t.get('exhibitionStatus').textContent);}
  t=setup({httpFailure:true});await t.switch(true);t.options.httpFailure=false;await t.switch(true);assert.equal(t.fetches.length,2,'failed template loads can be retried');assert.equal(t.frame.srcdocWrites,1);
  for(const mode of ['move','pan','marquee']){t=setup({drag:{mode},pendingPointer:{clientX:10}});await t.switch(true);assert.equal(t.c.drag,null);assert.equal(t.c.pendingPointer,null);assert.equal(t.c.marquee.style.display,'none');assert.equal(t.calls.flush,1);assert.equal(t.calls.save,mode==='move'?1:0,'only an existing unfinished edit is finalized');assert.equal(t.project(),t.before);}
  t=setup();let prevented=0;t.get('editorTab').listeners.keydown({key:'ArrowRight',preventDefault:()=>prevented++,stopPropagation(){}});await t.get('exhibitionTab').lastClick;assert.equal(t.get('exhibitionTab').focused,true);assert.equal(prevented,1);assert.equal(t.c.exhibitionActive,true);
  const html=read('editor.html');assert.equal((html.match(/class="workspace-tabs"/g)||[]).length,1);assert(!html.includes('id="gameTab"'));assert(html.includes('tabindex="-1">게임 모드</button>'));assert(html.includes('id="exhibitionBloomAll">모든 꽃 반응'));assert(html.includes('app.js?v=ground-height'));
  console.log('PASS: two-tab game bridge, editor/add readiness, ready/load/active ordering, origin/source checks, inactive pause, current/frozen layout preservation, rapid-transition races, retry/failure gates, pointer cleanup, keyboard/fullscreen and unchanged message/API IDs.');
})().catch(error=>{console.error(error);process.exitCode=1;});
