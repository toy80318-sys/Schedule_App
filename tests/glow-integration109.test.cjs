const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const G=require('../docs/glow'),F=require('../docs/focus-blur'),B=require('../docs/background-grade'),S=require('../docs/garden-space'),H=require('../docs/scene-harmony');
const app=fs.readFileSync('docs/app.js','utf8'),player=fs.readFileSync('docs/player.js','utf8'),review=fs.readFileSync('docs/set-review-renderer.js','utf8');
const line=(source,needle)=>{const result=source.split('\n').find(s=>s.includes(needle));assert(result,needle);return result},plain=value=>JSON.parse(JSON.stringify(value));
const neutralTone=()=>({brightness:100,contrast:100,saturation:100,warmth:0}),neutralFilters=()=>Object.fromEntries(['scene','background','flowers','decor'].map(k=>[k,neutralTone()]));
const windowHelpers={jejuGlow:G,jejuFocus:F,jejuBackgroundGrade:B,jejuSpace:S};
const normalize=vm.runInNewContext(line(app,'function normalizeFilters(')+';normalizeFilters',{neutralFilters,clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),window:windowHelpers});
const effects=()=>({focus:{background:2,far:5,near:1,focus:.6,region:{x:.1,y:.2,w:.5,h:.4,blur:8}},backgroundGrade:B.normalize({hue:14,exposure:.3,brightness:111,groundHeight:23}),glow:{strength:35,radius:19}});

test('legacy projects stay neutral and real project save/reopen retains glow, focus, ground height and geometry',async()=>{
 const legacy=normalize({flowers:{brightness:107}});assert.equal(legacy.glow,undefined);assert.deepEqual(G.normalize(legacy.glow),{strength:0,radius:16});
 const raw={...neutralFilters(),...effects()},filters=normalize(raw);assert.deepEqual(plain(filters),raw);
 assert.deepEqual(plain(normalize({glow:{strength:200,radius:-2}})).glow,{strength:100,radius:1});
 assert.deepEqual(plain(normalize({glow:{strength:'30',radius:Infinity}})).glow,{strength:0,radius:16});
 const nodes={saveName:{value:'글로우 저장 검사'},reference:{classList:{toggle(){}}}},asset={id:'custom-flower',group:'flowers',category:'flower',src:'https://example.test/flower.png'},item={id:'flower-1',assetId:asset.id,x:12,y:34,w:100,h:200,baseW:100,baseH:200,aspect:.5,r:9,opacity:.8,groupId:'group-1',groupName:'saved garden'};
 let downloaded;
 const context={window:{...windowHelpers,jejuAmbient:{cleanProject:value=>structuredClone(value)},jejuFinalCatalog:{backgroundAliases:{}}},sceneFilters:filters,assets:[asset],objects:[item],background:'https://example.test/background.png',backgroundLoop:'https://example.test/background.mp4',reference:null,gardenSpace:S.normalize({enabled:false}),W:1000,H:300,backgroundDefaultVersion:83,restoredBushVersion99:99,foregroundGrassVersion101:101,$:id=>nodes[id],Blob,structuredClone,download:blob=>downloaded=blob,downloadName:()=> 'garden.json',notice(){},brightBackgroundProject:()=>null,builtins:[],currentFlowerAsset:value=>value,migrateLongStems:async()=>{},selectedIds:new Set(),renderPalette(){},refresh(){},normalizeFilters:normalize};
 vm.createContext(context);vm.runInContext(line(app,'function save(){')+';save()',context);
 const saved=JSON.parse(await downloaded.text());assert.deepEqual(saved.sceneFilters,raw);assert.deepEqual(saved.objects,[item]);assert.equal(saved.backgroundLoop,context.backgroundLoop);
 context.sceneFilters={};context.objects=[];context.assets=[];context.backgroundLoop=null;
 vm.runInContext(line(app,'async function applyProject('),context);await context.applyProject(saved,{startup:true,preserveBackground:true});
 assert.deepEqual(plain(context.sceneFilters),raw);assert.deepEqual(plain(context.objects),[item]);assert.deepEqual(plain(context.assets),[asset]);assert.equal(context.backgroundLoop,saved.backgroundLoop);
 assert.deepEqual(saved.objects,[item],'reopening never modifies the saved source record');
});

test('color presets, palette background changes and history preserve independent glow, focus and ground height',()=>{
 const nodes={tonePreset:{value:'natural'},toneAmount:{value:'100'}},objects=[{id:'existing-flower',x:42,y:110,w:50,h:80,r:0,groupId:'keep-group'}];
 const context={window:{...windowHelpers,jejuSceneHarmony:H,jejuFinalCatalog:{backgroundReplacements:{'old.png':'bright.png'},backgrounds:[{src:'bright.png'}]}},sceneFilters:{},objects,background:'BG01-B04-V05.png',backgroundLoop:'loop.mp4',gardenSpace:{enabled:false},backgroundDefaultVersion:83,structuredClone,neutralTone,neutralFilters,normalizeFilters:normalize,clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),$:id=>nodes[id]||=( {} ),blendPresets:{natural:{name:'Natural',scene:[100,98,96,2],flowers:[103,101,104,1],decor:[90,98,95,2]}},snapshot(){},applySceneFilters(){},scheduleSave(){},renderWall(){},notice(){},document:{dispatchEvent(){}},Event:class{}};
 vm.createContext(context);vm.runInContext(line(app,'function preserveGroundHeight('),context);
 vm.runInContext(app.slice(app.indexOf('  function applySceneHarmony('),app.indexOf("  $('applySceneHarmony').onclick")),context);
 vm.runInContext(app.slice(app.indexOf('  function brightBackgroundProject('),app.indexOf('  async function startupText(')),context);
 for(const needle of ["$('toneResetAll').onclick=","$('toneNatural').onclick=",'function backgroundBlendPreset(','function applyBackground('])vm.runInContext(line(app,needle),context);
 const before=JSON.stringify(objects),actions=[()=>nodes.toneResetAll.onclick(),()=>nodes.toneNatural.onclick(),()=>context.applySceneHarmony(),()=>context.applyBackground('old.png')];
 for(const action of actions){context.sceneFilters={...neutralFilters(),...effects()};context.background='BG01-B04-V05.png';const old=plain(context.sceneFilters);action();assert.deepEqual(plain(context.sceneFilters.glow),old.glow);assert.deepEqual(plain(context.sceneFilters.focus),old.focus);assert.equal(context.sceneFilters.backgroundGrade.groundHeight,23);assert.equal(JSON.stringify(objects),before);}
 vm.runInContext(line(app,'function historyState(')+'\n'+line(app,'function restoreHistory('),context);context.sceneFilters={...neutralFilters(),...effects()};context.backgroundLoop='loop.mp4';const saved=context.historyState();context.sceneFilters={};context.backgroundLoop=null;context.restoreHistory(saved);
 assert.deepEqual(plain(context.sceneFilters.glow),effects().glow);assert.deepEqual(plain(context.sceneFilters.focus),effects().focus);assert.equal(context.sceneFilters.backgroundGrade.groundHeight,23);assert.equal(context.backgroundLoop,'loop.mp4');
});

test('editor glow setter makes one undo checkpoint and sends only a live effect update',()=>{
 const state={window:{jejuGlow:G},sceneFilters:{...neutralFilters(),...effects()},exhibitionReady:false,exhibitionActive:false,events:[],messages:[],snapshots:0,draws:0,saves:0,snapshot(){this.snapshots++},applySceneFilters(){this.draws++},scheduleSave(){this.saves++},document:{dispatchEvent(event){state.events.push(event.type)}},CustomEvent:class{constructor(type){this.type=type}},exhibitionMessage:message=>state.messages.push(message)};
 // Keep the real setter's lexical globals while recording its effects.
 state.snapshot=()=>state.snapshots++;state.applySceneFilters=()=>state.draws++;state.scheduleSave=()=>state.saves++;
 const api=vm.runInNewContext('({'+line(app,'getGlow:')+'})',state),before=plain(state.sceneFilters);
 for(const [ready,active]of [[false,false],[true,false],[false,true]]){state.exhibitionReady=ready;state.exhibitionActive=active;api.setGlow({strength:20,radius:12},false)}
 assert.equal(state.messages.length,0);assert.equal(state.snapshots,0);
 state.exhibitionReady=state.exhibitionActive=true;const input={strength:70,radius:22};api.setGlow(input);api.setGlow({strength:71,radius:23},false);
 assert.equal(state.snapshots,1);assert.equal(state.draws,5);assert.equal(state.saves,5);assert.equal(state.events.length,5);assert.deepEqual(state.messages.map(m=>m.type),['jeju-exhibition-glow','jeju-exhibition-glow']);assert.deepEqual(api.getGlow(),{strength:71,radius:23});assert.deepEqual(input,{strength:70,radius:22});
 assert.deepEqual(plain(state.sceneFilters.focus),before.focus);assert.deepEqual(plain(state.sceneFilters.backgroundGrade),before.backgroundGrade);
});

test('review rejects malformed glow and composites all art before glow then focus',async()=>{
 const events=[],ctx={clearRect(){},scale(){},save(){},restore(){},translate(){},rotate(){},drawImage(im){events.push('art:'+im.src)}};
 const root={Image:class{constructor(){this.naturalWidth=this.naturalHeight=100}set src(value){this._src=value;queueMicrotask(()=>this.onload())}get src(){return this._src}},jejuGlow:{draw(_ctx,_canvas,value){assert.deepEqual(plain(value),effects().glow);events.push('glow')}},jejuFocus:{drawRegion(){events.push('focus')}}};
 vm.runInNewContext(review,{window:root,URL,setTimeout,clearTimeout});const renderer=root.JejuSetRenderer;
 const project={format:'jeju-maze-wall-v1',width:400,height:100,background:'assets/back.png',backgroundFit:'fill',gardenSpace:{enabled:false},assets:[{id:'flower',src:'assets/flower.png',group:'flowers',category:'flower',stillOnly:true},{id:'rock',src:'assets/rock.png',category:'basalt'}],objects:[{id:'f',assetId:'flower',x:10,y:20,w:40,h:60,r:0,opacity:1},{id:'r',assetId:'rock',x:80,y:50,w:50,h:40,r:0,opacity:1}],sceneFilters:{glow:effects().glow,focus:effects().focus}};
 for(const glow of [null,[],true,25,'30',{strength:NaN},{strength:Infinity},{strength:-1},{strength:101},{strength:'25'},{radius:0},{radius:41},{radius:Infinity},{radius:'16'}])assert.throws(()=>renderer.validate({...project,sceneFilters:{glow}}),/글로우/);
 for(const glow of [{},{strength:0},{strength:100,radius:40},{strength:1,radius:1}])renderer.validate({...project,sceneFilters:{glow}});
 const before=JSON.stringify(project),canvas={width:0,height:0,getContext:()=>ctx};const result=await renderer.render(canvas,project,{width:800});assert.equal(result.complete,true);assert.equal(result.renderedObjects,2);assert.deepEqual(events,['art:assets/back.png','art:assets/flower.png','art:assets/rock.png','glow','focus']);assert.equal(JSON.stringify(project),before);
});

test('trusted game glow updates redraw without restarting flowers, actors, particles or input data',async()=>{
 const {harness,project,flower,object}=require('./game-interaction.test.cjs'),h=harness(),passes=[];
 h.env.window.jejuGlow={...G,draw(_ctx,_canvas,value){passes.push(['glow',plain(G.normalize(value))]);return true}};h.env.window.jejuFocus={...F,drawRegion(){passes.push(['focus']);return true}};
 assert.equal(h.api.setGlow({strength:30,radius:16}),false,'unloaded games do not accept effect changes');
 const grass={id:'grass',category:'grass',src:'https://example.test/assets/grass.png'},cloud={id:'cloud',category:'cloud',src:'https://example.test/assets/cloud.png'},p=project([flower,grass,cloud],[object('flower',flower.id),object('grass',grass.id,100),object('cloud',cloud.id,200)]);p.sceneFilters=effects();const before=JSON.stringify(p);
 await h.api.load(p);h.api.setActive(true);const button=h.get('flowers').children[0];button.click();const active=h.api.state(),requests=h.requests.length;
 const start=passes.length;assert.equal(h.api.setGlow({strength:65,radius:28}),true);assert.deepEqual(passes.slice(start).map(pass=>pass[0]),['glow','focus']);assert.deepEqual(JSON.parse(h.get('scene').dataset.glow),{strength:65,radius:28});
 assert.equal(h.requests.length,requests);assert.equal(h.get('flowers').children[0],button);for(const key of ['activeBlooms','petals','clock','flowerCount','swayCount','backgroundIndex','viewZoom'])assert.equal(h.api.state()[key],active[key],key+' must survive a live glow update');
 const expectedArt=h.ctx.draws.map(draw=>draw.source);assert(expectedArt.includes(grass.src)&&expectedArt.includes(cloud.src),'existing actors are still drawn');
 let listener,calls=0;const parent={},messageWindow={parent,addEventListener(_name,fn){listener=fn}};
 vm.runInNewContext(line(player,'function trustedMessage(event)')+'\n'+line(player,"window.addEventListener('message'"),{window:messageWindow,ownOrigin:'https://example.test',setGlow(value){calls++;return h.api.setGlow(value)}});
 const data={type:'jeju-exhibition-glow',glow:{strength:1000,radius:-5}};listener({origin:'https://other.test',source:parent,data});listener({origin:'https://example.test',source:{},data});assert.equal(calls,0);assert.equal(h.get('scene').dataset.glow,JSON.stringify({strength:65,radius:28}));
 listener({origin:'https://example.test',source:parent,data});assert.equal(calls,1);assert.deepEqual(JSON.parse(h.get('scene').dataset.glow),{strength:100,radius:1});assert.equal(h.requests.length,requests);assert.equal(h.get('flowers').children[0],button);assert.equal(JSON.stringify(p),before);
 for(const bad of [null,undefined,20,'20',[],false])assert.equal(h.api.setGlow(bad),false);
 h.api.setGlow({strength:0,radius:16});assert.equal(h.get('scene').dataset.glow,JSON.stringify({strength:0,radius:16}));assert.equal(h.api.state().petals,active.petals);assert.equal(JSON.stringify(p),before);
});
