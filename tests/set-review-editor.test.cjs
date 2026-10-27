const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const read=file=>fs.readFileSync('docs/'+file,'utf8'),copy=value=>structuredClone(value),hash=text=>crypto.createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
const manifestText=read('assets/set-review-v01/manifest.json'),manifest=JSON.parse(manifestText),projectTexts=new Map(manifest.backgrounds.map(s=>[s.id,read(s.project)])),projects=new Map([...projectTexts].map(([id,text])=>[id,JSON.parse(text)]));
const code=read('set-review-editor.js');
function setup(options={}){
  const active=options.fixture?.manifest||manifest,text=options.fixture?JSON.stringify(active):manifestText,texts=options.fixture?.texts||projectTexts,layouts=new Map([...texts].map(([id,value])=>[id,JSON.parse(value)]));
  const elements=new Map(),calls=[],notices=[],images=[],fetches=[],validated=[];
  class Element{
    constructor(){this.value='';this.disabled=false;this.listeners={};this.textContent='';this.clicks=0;}
    addEventListener(type,fn){(this.listeners[type]||=[]).push(fn);}
    dispatch(type){for(const fn of this.listeners[type]||[])fn();}
    click(){this.clicks++;this.dispatch('click');}
  }
  const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
  get('setReviewPaletteTheme').value='sunset';
  let state={name:'기존 작업',objects:[{id:'saved',x:71}],sceneFilters:{scene:{brightness:83}}};
  const original=JSON.stringify(state),registry={assets:[...layouts.values()].flatMap(p=>copy(p.assets)),manifestSha256:options.manifestHash||hash(text)};
  const E={W:14165,H:3480,ready:options.editorReady||Promise.resolve(),image:async src=>{images.push(src);if(options.imageFailure)throw Error('PNG 준비 실패');},notice:m=>notices.push(m),useSample:async project=>{if(options.backupFailure)throw Error('백업 실패');calls.push(copy(project));state=project;if(options.mutateImport)project.objects[0].x=-91;}};
  const root={jejuEditor:E,jejuSetReviewElements:registry,jejuHandoff:{ready:options.handoffReady||Promise.resolve()},location:{origin:'https://toy80318-sys.github.io'}};
  const context={window:root,document:{getElementById:get},location:{href:options.url||'https://toy80318-sys.github.io/Schedule_App/editor.html'},URL,TextEncoder,Uint8Array,crypto:crypto.webcrypto,structuredClone,console};
  context.fetch=async path=>{
    fetches.push(path);
    if(options.fetchFailure)throw Error('다운로드 실패');
    if(path.startsWith('assets/set-review-v01/manifest.json'))return{ok:true,text:async()=>text};
    const scene=active.backgrounds.find(s=>path.startsWith(s.project+'?'));
    if(!scene)return{ok:false,text:async()=>''};
    if(options.projectGate)await options.projectGate;
    return{ok:options.httpFailure!==true,text:async()=>texts.get(scene.id)+(options.projectHashFailure?'\n ': '')};
  };
  vm.runInNewContext(read('set-review-renderer.js'),context);
  const renderer=root.JejuSetRenderer;root.JejuSetRenderer={...renderer,validate:project=>{validated.push(project);return renderer.validate(project);}};
  vm.runInNewContext(code,context);
  return{api:root.jejuSetReviewEditor,get,calls,notices,images,fetches,validated,state:()=>JSON.stringify(state),original,registry};
}
(async()=>{
  let test=setup();await test.api.ready;
  assert.equal(test.calls.length,0,'ordinary entry must not replace saved work');assert.equal(test.state(),test.original);
  const initialMaster=test.get('setReviewMaster').src;
  test.get('setReviewPaletteTheme').value='morning';test.get('setReviewPaletteTheme').dispatch('change');
  assert.notEqual(test.get('setReviewMaster').src,initialMaster);assert.equal(test.get('setReviewCompare').href,'set-review.html?v=79#morning/integrated');assert.equal(test.calls.length,0,'theme change is preview only');
  test=setup({url:'https://example.test/editor.html?setV05=night'});await test.api.ready;
  assert.equal(test.get('setReviewPaletteTheme').value,'night');assert.equal(test.get('setReviewPaletteTab').clicks,1);assert.equal(test.calls.length,0,'palette URL must never apply a layout');
  test=setup({mutateImport:true});await test.api.ready;
  const originalProject=JSON.stringify(projects.get('sunset'));await test.api.openScene('sunset');
  assert.equal(test.calls.length,1);assert.equal(test.images.length,31,'all30 original independent PNGs and background are ready before import');
  assert.equal(JSON.stringify(test.calls[0].objects),JSON.stringify(projects.get('sunset').objects),'geometry must remain exact');
  assert.equal(JSON.stringify(test.calls[0].sceneFilters),JSON.stringify(projects.get('sunset').sceneFilters),'lighting/filter settings must remain exact');
  assert.equal(JSON.stringify(projects.get('sunset')),originalProject,'import receives a clone');
  assert.equal(test.validated[0].objects[0].x,projects.get('sunset').objects[0].x,'import mutation must not alter the validated source project');
  let editorReady,handoffReady;
  test=setup({editorReady:new Promise(resolve=>editorReady=resolve),handoffReady:new Promise(resolve=>handoffReady=resolve)});
  const waiting=test.api.openScene('morning');await Promise.resolve();assert.equal(test.get('setReviewLoadScene').disabled,true);assert.equal(test.calls.length,0);
  editorReady();await Promise.resolve();assert.equal(test.calls.length,0,'handoff must also be ready');handoffReady();await waiting;assert.equal(test.calls.length,1);
  for(const option of ['projectHashFailure','httpFailure','imageFailure','backupFailure']){
    test=setup({[option]:true});await test.api.ready;
    await assert.rejects(test.api.openScene('day'));
    assert.equal(test.state(),test.original,option+' must preserve current work');assert.equal(test.calls.length,0);
    assert.equal(test.get('setReviewLoadScene').disabled,false,'recoverable failure must release button');
  }
  for(const options of [{fetchFailure:true},{manifestHash:'0'.repeat(64)}]){
    test=setup(options);await assert.rejects(test.api.ready);await Promise.resolve();
    assert.equal(test.calls.length,0);assert.equal(test.state(),test.original);assert.equal(test.get('setReviewLoadScene').disabled,true);assert(test.notices.length>0);
  }
  let release;const gate=new Promise(resolve=>release=resolve);test=setup({projectGate:gate});await test.api.ready;
  const first=test.api.openScene('night');assert.equal(await test.api.openScene('morning'),false,'busy lock must reject a second replacement');
  assert.equal(test.get('setReviewLoadScene').disabled,true);release();await first;assert.equal(test.calls.length,1);assert.equal(test.calls[0].background,projects.get('night').background);
  test=setup();await test.api.ready;
  for(const scene of manifest.backgrounds){
    const p=copy(projects.get(scene.id)),before=JSON.stringify(p);test.api.validateProject(p,scene);assert.equal(JSON.stringify(p),before);
    for(const corrupt of [v=>v.assets[0].src='https://example.test/foreign.png',v=>v.assets[0].sha256='0'.repeat(64),v=>v.assets[0].theme='foreign',v=>v.assets[0].sourceRect=[0,0,1,1],v=>v.sourcePngVersion='V06',v=>v.setReviewVersion='V99',v=>v.objects.pop()]){
      const invalid=copy(p);corrupt(invalid);assert.throws(()=>test.api.validateProject(invalid,scene));
    }
  }
  const v06=copy(manifest),texts=new Map();v06.colorHarmonyVersion='V06';
  for(const scene of v06.backgrounds){
    const project=copy(projects.get(scene.id));project.setReviewVersion='V06';project.sourcePngVersion='V05';
    scene.project=`assets/set-review-v01/${scene.id}_editor_v06.json`;scene.projectVersion='V06';
    scene.flowerPalette={name:'시간대별 가까운 색',designs:Object.fromEntries(['F01','F02','F03','F04','F05','F06'].map(d=>[d,['C01','C02']])),primaryShare:.75};
    const text=JSON.stringify(project);texts.set(scene.id,text);
    scene.integrated=scene.integrated.filter(a=>a.id!==scene.code+'-I06-V06');
    scene.integrated.push({id:scene.code+'-I06-V06',version:'V06',construction:'same-png-layout-render',src:'assets/'+scene.code+'-I06-V06.png',preview:'assets/'+scene.code+'-I06-V06.webp',sourceProject:scene.project,sourceProjectSha256:hash(text)});
    scene.integrated.push({id:scene.code+'-unrelated',version:'V06',construction:'same-png-layout-render',src:'assets/unrelated.png',sourceProject:'assets/unrelated.json',sourceProjectSha256:'0'.repeat(64)});
  }
  const pending=copy(v06);for(const scene of pending.backgrounds){const ref=scene.integrated.find(a=>a.id===scene.code+'-I06-V06');ref.construction='pending-same-png-layout-render';delete ref.sourceProjectSha256;}
  const withheld=setup({fixture:{manifest:pending,texts}});await assert.rejects(withheld.api.ready);assert.equal(withheld.calls.length,0,'unfinished I06 capture must never open a layout');
  test=setup({fixture:{manifest:v06,texts}});await test.api.ready;
  assert(test.get('setReviewMaster').src.endsWith('I06-V06.webp'),'latest project-linked composite replaces hardcoded I05');
  assert(test.get('setReviewEditorStatus').textContent.includes('12종 유사색'));assert(test.get('setReviewEditorStatus').textContent.includes('전체 24종 원본 유지'));
  for(const theme of ['sunset','day','night','morning'])await test.api.openScene(theme);
  assert.equal(test.calls.length,4);assert(test.calls.every(p=>p.setReviewVersion==='V06'&&p.sourcePngVersion==='V05'&&p.assets.every(a=>a.id.endsWith('-V05'))));
  console.log('PASS: V05-source/V06-layout explicit import only, project-linked latest reference, preview-only themes/legacyURL, manifest/project hashes, exact30canonicalassets/356placements, preserved geometry/filters, cloned import,31image gate, backup/download failure protection and busy lock.');
})().catch(error=>{console.error(error);process.exitCode=1;});
