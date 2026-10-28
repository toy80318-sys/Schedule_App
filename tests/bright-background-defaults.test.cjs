const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const read=p=>fs.readFileSync('docs/'+p,'utf8'),copy=v=>structuredClone(v),app=read('app.js');
const slice=(start,end)=>{const a=app.indexOf(start),b=app.indexOf(end,a);assert(a>=0&&b>a);return app.slice(a,b);};
const seed={window:{}};vm.createContext(seed);
let legacyCatalog;
for(const name of ['catalog-data.js','layer55-data.js','cutout56-data.js','cutout57-data.js','whole59-data.js','whole60-data.js','whole61-data.js','whole62-data.js','additions68-data.js','set-review-catalog.js','set-review-elements.js']){if(name==='set-review-catalog.js')legacyCatalog=JSON.parse(JSON.stringify(seed.window.jejuFinalCatalog));vm.runInContext(read(name),seed);}
const catalog=JSON.parse(JSON.stringify(seed.window.jejuFinalCatalog)),registry=JSON.parse(JSON.stringify(seed.window.jejuSetReviewElements));
const manifestText=read('assets/set-review-v01/manifest.json'),manifest=JSON.parse(manifestText),fresh=JSON.parse(read(manifest.backgrounds[0].project));
const grade=require('../docs/background-grade.js'),renderer=require('../docs/set-review-renderer.js');
const filterBytes=value=>JSON.stringify({...value,backgroundGrade:grade.normalize(value?.backgroundGrade)});
const neutral={brightness:100,contrast:100,saturation:100,warmth:0};
function saved(theme='sunset'){
  const project=copy(fresh),bg=legacyCatalog.backgrounds.find(a=>a.id===`whole62-${theme}-background`);
  project.background=bg.src;project.oilAssetVersion=14;delete project.backgroundDefaultVersion;
  project.sceneFilters={scene:{brightness:70,contrast:85,saturation:90,warmth:2},background:{brightness:52,contrast:150,saturation:60,warmth:-10},flowers:{brightness:89,contrast:115,saturation:120,warmth:8},decor:{brightness:78,contrast:97,saturation:101,warmth:-3},backgroundGrade:{hue:9,exposure:-1,brightness:60,curve:[0,50,100,170,245]},focus:{background:5,far:9,near:8,focus:.65}};
  project.gardenSpace={enabled:true,horizon:.57,strength:.4};return project;
}
function setup(input,options={}){
  let current=copy(input),stored=0;const backups=[],events=[],notices=[],images=[],nodes=new Map();
  const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',src:'',classList:{toggle(){}}});return nodes.get(id);};
  const c={window:{jejuFinalCatalog:copy(catalog),jejuSetReviewElements:copy(registry),jejuBackgroundGrade:grade,JejuSetRenderer:renderer,jejuAmbient:{cleanProject:v=>copy(v),isRetired:()=>false},jejuSpace:{normalize:v=>copy(v||{enabled:false})},jejuFocus:{normalize:v=>copy(v)}},W:14165,H:3480,crypto:crypto.webcrypto,TextEncoder,Uint8Array,structuredClone,Date,Error,Map,Set,console,
    autosaveReady:false,saveTimer:null,backgroundDefaultVersion:0,assets:[],objects:[],background:'initial',reference:null,sceneFilters:{},gardenSpace:{enabled:false},history:[],future:[],selected:null,selectedIds:new Set(),builtins:[],currentFlowerAsset:a=>a,backgroundChoices:catalog.backgrounds.map(a=>[a.src,a.name]),snapshot:()=>events.push('snapshot'),renderWall:()=>events.push('wall'),scheduleSave:()=>events.push('save-schedule'),
    $:node,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),migrateLongStems:async()=>{},renderPalette(){},refresh(){events.push('render');},syncUndo(){},clearTimeout(){},uid:()=>String(backups.length+1),notice:m=>notices.push(m),
    readCurrent:async()=>copy(current),namedStore:async(mode,key,value)=>{events.push('backup-start');if(options.backupGate)await options.backupGate;if(options.backupFailure)throw Error('백업 커밋 실패');backups.push({key,value:copy(value)});events.push('backup-commit');},
    image:async src=>{images.push(src);events.push('image');if(options.imageFailure)throw Error('image failure');},
    storeCurrent:async()=>{if(options.saveFailure)throw Error('current commit failure');stored++;current={name:node('saveName').value,assets:copy(c.assets),objects:copy(c.objects),background:c.background,sceneFilters:copy(c.sceneFilters),gardenSpace:copy(c.gardenSpace),oilAssetVersion:14,backgroundDefaultVersion:c.backgroundDefaultVersion};events.push('current-commit');},
    fetch:async path=>{if(options.fetchFailure)throw Error('manifest download failure');const text=path.startsWith('assets/set-review-v01/manifest.json')?manifestText:read(manifest.backgrounds[0].project)+(options.projectHashFailure?' ':'');return{ok:options.httpFailure!==true,text:async()=>text};}
  };
  if(options.manifestHashFailure)c.window.jejuSetReviewElements.manifestSha256='0'.repeat(64);
  vm.createContext(c);
  vm.runInContext(slice('  const neutralTone=','  let sceneFilters='),c);
  vm.runInContext(slice('  async function applyProject(','  function brightBackgroundProject(')+slice('  function brightBackgroundProject(',"  $('saveCurrent').onclick")+';this.run=restoreCurrent;this.plan=brightBackgroundProject;this.apply=applyProject;',c);
  vm.runInContext(slice('  function applyBackground(','  function openBackgroundGallery(')+';this.changeBackground=applyBackground;',c);
  const setter=app.split('\n').find(line=>line.trim().startsWith('setBackground:')).trim().replace(/,$/,'');vm.runInContext('this.setBackground=({'+setter+'}).setBackground;',c);
  return{c,run:c.run,plan:c.plan,apply:c.apply,backups,events,notices,images,change:c.changeBackground,set:c.setBackground,current:()=>copy(current),stored:()=>stored};
}
(async()=>{
  for(const [i,theme] of ['sunset','day','night','morning'].entries()){
    const original=saved(theme),bytes=JSON.stringify(original),t=setup(original);await t.run();
    assert.equal(t.c.background,catalog.backgrounds.find(a=>a.id===`BG0${i+1}-B04-V05`).src);
    assert.equal(JSON.stringify(t.c.objects),JSON.stringify(original.objects),'flower positions/counts/blur/hue stay exact');
    for(const key of ['flowers','decor','focus'])assert.equal(JSON.stringify(t.c.sceneFilters[key]),JSON.stringify(original.sceneFilters[key]));
    for(const key of ['scene','background'])assert.equal(JSON.stringify(t.c.sceneFilters[key]),JSON.stringify(neutral));
    assert(grade.neutral(t.c.sceneFilters.backgroundGrade));assert.equal(JSON.stringify(t.c.gardenSpace),JSON.stringify(original.gardenSpace));
    assert.equal(t.backups.length,1);assert.equal(JSON.stringify(t.backups[0].value),bytes,'backup is the exact original record with no migration marker');
    assert.equal(JSON.stringify(original),bytes);assert.equal(t.c.backgroundDefaultVersion,83);assert.equal(t.current().backgroundDefaultVersion,83);
    assert(t.events.indexOf('image')<t.events.indexOf('backup-start'));assert(t.events.indexOf('backup-commit')<t.events.indexOf('render'));
    await t.run();assert.equal(t.backups.length,1,'second startup does not repeat migration');
  }
  const alias=saved();alias.background='https://example.test/registered-old-alias.png';let t=setup(alias);t.c.window.jejuFinalCatalog.backgroundAliases[alias.background]=catalog.backgrounds.find(a=>a.id==='BG01-B04-V05').src;t.c.window.jejuFinalCatalog.backgroundReplacements[alias.background]=catalog.backgrounds.find(a=>a.id==='BG01-B04-V05').src;await t.run();assert(t.c.background.endsWith('BG01-B04-V05.png'));
  for(const suffix of ['?v=old-cache','#stored','?v=old-cache#stored']){const value=saved();value.background+=suffix;t=setup(value);await t.run();assert(t.c.background.endsWith('BG01-B04-V05.png'),'registered sources with cache queries/fragments remain eligible');}
  for(const background of [null,'none','data:image/png;base64,AAAA','blob:https://example.test/custom','https://example.test/ML_BG01_LT01_Background_Darker_v60.png',catalog.backgrounds.find(a=>a.id==='BG01-B04-V05').src]){
    const value=saved();value.background=background;t=setup(value);await t.run();assert.equal(t.c.background,background);assert.equal(t.backups.length,0);assert.equal(t.stored(),0);assert.equal(filterBytes(t.c.sceneFilters),filterBytes(value.sceneFilters),'unrelated or chosen backgrounds retain their filters');
  }
  for(const marker of [80,83]){const explicit=saved();explicit.backgroundDefaultVersion=marker;t=setup(explicit);await t.run();assert(t.c.background.endsWith('BG01-B04-V05.png'));assert.equal(t.backups.length,1,'removed dark choices migrate even with an earlier explicit receipt');}
  for(const option of ['imageFailure','backupFailure','saveFailure']){
    const original=saved();t=setup(original,{[option]:true});await assert.rejects(t.run());assert.equal(t.c.background,original.background);assert.equal(JSON.stringify(t.c.objects),JSON.stringify(original.objects));assert.equal(filterBytes(t.c.sceneFilters),filterBytes(original.sceneFilters));assert.equal(t.c.autosaveReady,false);assert.equal(t.current().background,original.background);assert(t.notices.some(n=>n.includes('자동 교체를 중단')));
  }
  let release;t=setup(saved(),{backupGate:new Promise(resolve=>release=resolve)});const pending=t.run();await Promise.resolve();await Promise.resolve();await Promise.resolve();assert.equal(t.events.includes('render'),false,'uncommitted backup never changes the visible project');release();await pending;
  const legacy=saved();legacy.background='https://example.test/custom.png';legacy.oilAssetVersion=13;t=setup(legacy);await t.run();assert.equal(t.backups.length,1);assert.equal(t.c.background,legacy.background);assert.equal(JSON.stringify(t.c.objects),JSON.stringify(legacy.objects));assert.equal(t.current().backgroundDefaultVersion,83,'legacy restore preserves user work after a committed backup');
  t=setup(null);await t.run();assert.equal(t.c.background,fresh.background);assert.equal(t.c.objects.length,356);assert.equal(JSON.stringify(t.c.objects),JSON.stringify(fresh.objects));assert.equal(t.images.length,31);assert.equal(t.backups.length,0);assert.equal(t.current().backgroundDefaultVersion,83);
  for(const option of ['fetchFailure','httpFailure','manifestHashFailure','projectHashFailure','imageFailure']){t=setup(null,{[option]:true});await assert.rejects(t.run());assert.equal(t.stored(),0);assert.equal(t.c.autosaveReady,false);}
  t=setup(saved());await t.run();const before=t.c.history.pop(),after=JSON.stringify({objects:t.c.objects,background:t.c.background,sceneFilters:t.c.sceneFilters,gardenSpace:t.c.gardenSpace});
  vm.runInContext(slice('  function restoreHistory(',"  $('openTonePanel').onclick"),t.c);
  t.c.restoreHistory(before);assert(t.c.background.endsWith('BG01-B04-V05.png'),'undo cannot reintroduce a removed dark background');assert.equal(t.c.backgroundDefaultVersion,83,'undo retains the completed one-time receipt');
  assert(grade.neutral(t.c.sceneFilters.backgroundGrade));assert.deepEqual(JSON.parse(JSON.stringify(t.c.sceneFilters.scene)),neutral);assert.equal(JSON.stringify(t.c.objects),JSON.stringify(saved().objects));
  t.c.restoreHistory(after);assert(t.c.background.endsWith('BG01-B04-V05.png'));assert(grade.neutral(t.c.sceneFilters.backgroundGrade),'redo restores the neutral bright view');
  const imported=saved(),importedBytes=JSON.stringify(imported);await t.apply(imported);assert.equal(t.c.backgroundDefaultVersion,83);assert(t.c.background.endsWith('BG01-B04-V05.png'),'file, named and sample imports use bright replacement');assert.equal(JSON.stringify(imported),importedBytes,'import source data stays exact');assert.deepEqual(JSON.parse(JSON.stringify(t.c.sceneFilters.scene)),neutral);
  for(const [old,target] of Object.entries(catalog.backgroundReplacements)){const value=saved();value.background=old+'?v=legacy#cache';const bytes=JSON.stringify(value),planned=t.plan(value);assert.equal(planned.background,target);assert.equal(JSON.stringify(value),bytes);t.set(old);assert.equal(t.c.background,target,'registered API accepts legacy URL but only applies its bright replacement');t.change(old);assert.equal(t.c.background,target);}
  for(const background of [null,'https://example.test/custom.png',catalog.backgrounds[0].src]){const value=saved();value.background=background;const bytes=JSON.stringify(value);await t.apply(value);assert.equal(t.c.background,background);assert.equal(filterBytes(t.c.sceneFilters),filterBytes(value.sceneFilters));assert.equal(JSON.stringify(value),bytes);}
  assert.throws(()=>t.set('https://example.test/custom.png'),/등록된 배경/);assert.equal(t.plan({...saved(),background:'constructor'}),null,'replacement lookup ignores inherited keys');
  assert.equal((app.match(/oilAssetVersion:14,backgroundDefaultVersion/g)||[]).length,4,'current, named, file and exhibition exports persist the receipt');
  assert(app.includes('gardenSpace,backgroundDefaultVersion,restoredBushVersion99,foregroundGrassVersion101}),selected:'));
  const html=read('editor.html');assert(html.indexOf('set-review-renderer.js')<html.indexOf('app.js?v=ground-height'));assert(html.includes('whole62-scenes.js?v=80'));
  console.log('PASS: four-theme exact-source/alias migration, original backup bytes and commit order, geometry/focus/group filters preserved, neutral background, removed choices/imports/undo/API migrate while custom/none/bright filters stay intact, legacy backups, signed356-object fresh default and all download/hash/image/backup/save failure gates.');
})().catch(error=>{console.error(error);process.exitCode=1;});
