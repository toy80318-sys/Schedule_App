const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const G=require('../docs/background-grade'),F=require('../docs/focus-blur');
const app=fs.readFileSync('docs/app.js','utf8'),player=fs.readFileSync('docs/player.js','utf8');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(G.normalize().groundHeight,0);
for(const bad of [NaN,Infinity,-Infinity,'30',null,undefined])assert.equal(G.normalize({groundHeight:bad}).groundHeight,0);
assert.equal(G.normalize({groundHeight:-100}).groundHeight,-15);assert.equal(G.normalize({groundHeight:100}).groundHeight,40);
assert.deepEqual(G.placement(),{scaleY:1,offsetY:0});
const colors={hue:24,exposure:.4,brightness:112,curve:[0,45,130,215,255]};
for(const groundHeight of [-15,0,40]){assert.deepEqual(G.pixel([50,120,220],{...colors,groundHeight}),G.pixel([50,120,220],colors));assert.deepEqual(G.table({...colors,groundHeight}),G.table(colors));assert.equal(G.css({groundHeight}),'');assert(G.neutral({groundHeight}));}
let tableWrites=0;
function node(){return{style:{},setAttribute(k){if(k==='tableValues')tableWrites++},append(){}}}
const gradeContext={window:{},document:{createElementNS:node,body:{append(){}}}};
vm.runInNewContext(fs.readFileSync('docs/background-grade.js','utf8'),gradeContext);const colorGrade=gradeContext.window.jejuBackgroundGrade;
assert.equal(colorGrade.css({...colors,groundHeight:0}),colorGrade.css({...colors,groundHeight:40}));assert.equal(tableWrites,3,'height-only changes reuse the same color table');
const appDraw=app.split('\n').find(l=>l.includes('function drawBackground(ctx,im,width,height)'));
const appDOM=app.split('\n').find(l=>l.includes('function applySceneFilters()'));
const playerDraw=player.slice(player.indexOf('  function drawBackground(im,alpha=1){'),player.indexOf('  function paint(){'));
const W=1000,H=300;
for(const height of [-15,0,40])for(const blur of [0,10])for(const fill of [true,false])for(const im of [{naturalWidth:1000,naturalHeight:900},{videoWidth:1000,videoHeight:900}]){
 const grade={groundHeight:height},focus={background:blur},placement=G.placement(grade),zoom=F.backgroundScale(focus),iw=im.videoWidth||im.naturalWidth,ih=im.videoHeight||im.naturalHeight;
 const ctx={save(){},restore(){},getTransform(){return{a:1}},drawImage(...args){this.last=args}};
 const window={jejuBackgroundGrade:G,jejuFocus:F},sceneFilters={backgroundGrade:grade,focus};
 const drawEditor=vm.runInNewContext(appDraw+';drawBackground',{window,sceneFilters,H,background:'test.png',sourceRegistered:new Set(fill?['test.png']:[]),filterCSS:()=> 'none'});drawEditor(ctx,im,W,H);const editorRect=ctx.last.slice(1);
 const drawGame=vm.runInNewContext(playerDraw+';drawBackground',{window,ctx,project:{width:W,height:H,backgroundFit:fill?'fill':'cover',sceneFilters},layerVisible:()=>true,filter:()=> 'none'});drawGame(im);assert.deepEqual(ctx.last.slice(1),editorRect,'editor PNG/Unity drawing and game drawing use identical placement');
 const wallBackground={style:{}};vm.runInNewContext(appDOM+';applySceneFilters()',{window,sceneFilters,wallBackground,objects:[],syncFilterControls(){},filterCSS:()=> 'none'});
 assert.equal(wallBackground.style.transform,`translateY(${placement.offsetY*100}%) scale(${zoom},${zoom*placement.scaleY})`);
 const top=H*(1-zoom*placement.scaleY)/2+H*placement.offsetY,bottom=top+H*zoom*placement.scaleY;assert(top<=1e-8&&bottom>=H-1e-8,'overscan covers the complete view at every allowed height');
 for(const py of [0,H/2,H]){const localY=(py-H/2-H*placement.offsetY)/(zoom*placement.scaleY)+H/2;assert(localY>=-1e-8&&localY<=H+1e-8);const coverRatio=fill?H/ih:Math.max(W/iw,H/ih),baseTop=fill?0:(H-ih*coverRatio)/2,domSourceY=(localY-baseTop)/coverRatio,canvasSourceY=(py-editorRect[1])/editorRect[3]*ih;near(domSourceY,canvasSourceY);}
 if(height===0&&blur===0&&fill)assert.deepEqual(editorRect,[0,0,W,H],'omitted/zero height keeps the original pixel rectangle');
}
const preserveCode=app.split('\n').find(l=>l.includes('function preserveGroundHeight('));
const neutralTone=()=>({brightness:100,contrast:100,saturation:100,warmth:0});
const neutralFilters=()=>Object.fromEntries(['scene','background','flowers','decor'].map(k=>[k,neutralTone()]));
const nodes={tonePreset:{value:'natural'},toneAmount:{value:'100'}},presetColors={hue:-12,exposure:.2,brightness:108,curve:[0,60,128,195,255]};
const actionContext={sceneFilters:{},window:{jejuBackgroundGrade:G,jejuSceneHarmony:{theme:()=> 'sunset',filters:()=>({...neutralFilters(),backgroundGrade:presetColors}),presets:{sunset:{name:'Sunset'}}}},neutralTone,neutralFilters,normalizeFilters:value=>value,background:'test.png',backgroundBlendPreset:()=> 'natural',blendPresets:{natural:{name:'Natural',scene:[100,100,100,0],flowers:[100,100,100,0],decor:[100,100,100,0]}},clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),$:id=>nodes[id]||=( {} ),snapshot(){},applySceneFilters(){},scheduleSave(){},notice(){},document:{dispatchEvent(){}},Event:class{},CustomEvent:class{}};
vm.createContext(actionContext);vm.runInContext(preserveCode,actionContext);
const harmonyCode=app.slice(app.indexOf('  function applySceneHarmony('),app.indexOf("  $('applySceneHarmony').onclick"));
vm.runInContext(harmonyCode,actionContext);
for(const control of ['toneResetAll','toneNatural'])vm.runInContext(app.split('\n').find(l=>l.includes(`$('${control}').onclick=`)),actionContext);
const brightenLine=app.split('\n').find(l=>l.includes('brightenBackground:()=>'));
const brighten=vm.runInContext('({'+brightenLine+'}).brightenBackground',actionContext);
for(const [name,action,wanted]of [['reset',nodes.toneResetAll.onclick,G.normalize()],['natural',nodes.toneNatural.onclick,G.normalize()],['harmony',()=>actionContext.applySceneHarmony(),G.normalize(presetColors)],['brighten',brighten,G.normalize(presetColors)]]){
 actionContext.sceneFilters={...neutralFilters(),backgroundGrade:{...colors,groundHeight:25},focus:{background:6}};action();
 assert.equal(actionContext.sceneFilters.backgroundGrade.groundHeight,25,name+' color action preserves ground height');
 assert.deepEqual({...actionContext.sceneFilters.backgroundGrade,groundHeight:0},wanted,name+' keeps its original color result');
 assert.equal(actionContext.sceneFilters.focus.background,6);
}
const gradeLine=app.split('\n').find(l=>l.includes('getBackgroundGrade:')).trim(),sent=[],setterCalls={snapshot:0,apply:0,save:0,event:0};
const setterContext={window:{jejuBackgroundGrade:G},sceneFilters:{},exhibitionReady:false,exhibitionActive:false,snapshot(){setterCalls.snapshot++},applySceneFilters(){setterCalls.apply++},scheduleSave(){setterCalls.save++},document:{dispatchEvent(e){assert.equal(e.type,'jeju-editor-change');setterCalls.event++}},CustomEvent:class{constructor(type){this.type=type}},exhibitionMessage:message=>sent.push(message)};
const setEditorGrade=vm.runInNewContext('({'+gradeLine+'}).setBackgroundGrade',setterContext);
for(const [ready,active]of [[false,false],[true,false],[false,true]]){setterContext.exhibitionReady=ready;setterContext.exhibitionActive=active;setEditorGrade({...colors,groundHeight:20},false)}
assert.equal(sent.length,0,'inactive/unready game receives no grade message');assert.equal(setterCalls.snapshot,0,'slider previews preserve their existing undo checkpoint policy');
setterContext.exhibitionReady=setterContext.exhibitionActive=true;setEditorGrade({...colors,groundHeight:100});
assert.deepEqual(sent.map(m=>m.type),['jeju-exhibition-background-grade'],'live editor sends only a grade update, never a full project reload');
assert.deepEqual(sent[0].grade,G.normalize({...colors,groundHeight:100}));assert.deepEqual(setterCalls,{snapshot:1,apply:4,save:4,event:4},'editor rendering, autosave, UI events and undo remain intact');
const historyCode=app.split('\n').filter(l=>l.includes('function historyState(')||l.includes('function restoreHistory(')).join('\n');
const historyContext={objects:[{id:'plant'}],sceneFilters:{backgroundGrade:{...colors,groundHeight:25}},gardenSpace:{enabled:false},background:'garden.png',backgroundLoop:'garden.mp4',backgroundDefaultVersion:0,brightBackgroundProject:()=>null,normalizeFilters:value=>value,window:{}};
vm.createContext(historyContext);vm.runInContext(historyCode+';this.saved=historyState()',historyContext);historyContext.sceneFilters={};historyContext.backgroundLoop=null;vm.runInContext('restoreHistory(saved)',historyContext);
assert.equal(historyContext.backgroundLoop,'garden.mp4','undo/redo keeps the chosen video background');assert.equal(historyContext.sceneFilters.backgroundGrade.groundHeight,25,'undo/redo keeps its ground height');
const {harness,project,flower,object}=require('./game-interaction.test.cjs');
(async()=>{
 const h=harness();let lastGrade;h.env.window.jejuBackgroundGrade={...G,css:()=>'',normalize(value){lastGrade=G.normalize(value);return lastGrade}};assert.equal(h.api.setBackgroundGrade({groundHeight:10}),false);
 const p=project([flower],[object('flower',flower.id)]);p.sceneFilters={backgroundGrade:{...colors,groundHeight:0}};const before=JSON.stringify(p);
 await h.api.load(p);h.api.setActive(true);const button=h.get('flowers').children[0];button.click();const active=h.api.state(),requests=h.requests.length;
 assert.equal(h.api.setBackgroundGrade({groundHeight:40}),true);assert.deepEqual(lastGrade,{...colors,groundHeight:40},'partial live height input preserves all color fields');const bg=h.ctx.draws.find(d=>d.source===p.background);assert(bg,'background was redrawn');assert.equal(h.requests.length,requests,'height input does not reload any image or actor');
 for(const k of ['activeBlooms','petals','clock','flowerCount'])assert.equal(h.api.state()[k],active[k],k+' is preserved');assert.equal(h.get('flowers').children[0],button);assert.equal(JSON.stringify(p),before,'live grade changes never mutate saved input');
 const trustedCode=player.split('\n').find(l=>l.includes('function trustedMessage(event)')),listenerCode=player.split('\n').find(l=>l.includes("window.addEventListener('message'"));let listener,calls=0;
 const parent={},messageWindow={parent,addEventListener(type,fn){listener=fn}};
 vm.runInNewContext(trustedCode+'\n'+listenerCode,{window:messageWindow,ownOrigin:'https://example.test',setBackgroundGrade(grade){calls++;return h.api.setBackgroundGrade(grade)}});
 const data={type:'jeju-exhibition-background-grade',grade:{...colors,groundHeight:-15}};listener({origin:'https://other.test',source:parent,data});listener({origin:'https://example.test',source:{},data});assert.equal(calls,0,'untrusted frames cannot change the grade');
 listener({origin:'https://example.test',source:parent,data});assert.equal(calls,1);const normalized=G.placement(data.grade);const last=h.ctx.draws.find(d=>d.source===p.background);near(last.args[1],(H-1000*normalized.scaleY)/2+H*normalized.offsetY);
 for(const bad of [null,undefined,'40',40,[]])assert.equal(h.api.setBackgroundGrade(bad),false);
 assert.equal(JSON.stringify(p),before);
 console.log('PASS: bounded ground height, color/cache independence, edge coverage, DOM/PNG/game parity, live trusted update without actor reload and saved-input preservation.');
})().catch(error=>{console.error(error);process.exitCode=1});
