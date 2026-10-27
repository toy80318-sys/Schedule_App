const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(require.resolve('../docs/'+p),'utf8'),G=require('../docs/background-grade.js');
const app=read('app.js'),controller=read('cutout57-scenes.js'),old=JSON.parse(read('assets/source-cutouts-v56/manifest_v56.json')),latest=JSON.parse(read('assets/source-contrast-v57/manifest_v57.json'));
const previewCode=app.match(/  const currentPreviews=.*\r?\n  const sourceRegistered=.*\r?\n  const displaySrc=.*\r?\n/)[0];
const display=vm.runInNewContext(previewCode+'displaySrc',{window:{jejuFinalCatalog:{assets:latest.assets}},optimizedImages:{},lightPreview:true});
for(const a of latest.assets){assert.equal(display(a.src),a.src,'canvas must render native source PNG');assert.equal(display(a.src,'thumb'),a.preview,'palette retains small previews');}
const unchanged=vm.runInNewContext(controller.slice(controller.indexOf(' function unchanged'),controller.indexOf(' const panel='))+'unchanged',{window:{jejuBackgroundGrade:G}});
for(const scene of old.scenes){
 assert(unchanged(structuredClone(scene.project),scene));
 for(const change of [p=>p.objects[0].x+=.01,p=>p.objects[0].opacity=.8,p=>p.objects.reverse(),p=>p.objects[0].flipX=true,p=>p.assets[0].src='https://example.test/changed.png',p=>p.sceneFilters={backgroundGrade:{hue:15}},p=>p.gardenSpace.enabled=true]){
  const edited=structuredClone(scene.project);change(edited);assert(!unchanged(edited,scene),'edited work must never auto-upgrade');
 }
}
assert(app.includes("setFlowerImage(im,src);im.style.objectFit=a.sourceRect?.length===4?'fill':'contain'"));assert(app.includes("dw=a.sourceRect?.length===4?display.w"));assert(app.includes("wallBackground.style.objectFit=sourceRegistered.has(background)?'fill':'cover'"));assert(app.includes("const data={name:$('saveName').value,objects"));assert(app.includes('await applyProject(await loadBrightDefault(),{startup:true})'));assert(controller.includes('await E.useSample(')&&controller.includes('b.onclick=()=>open(s)'));assert(read('editor.html').includes('cutout57-scenes.js'));
const player=read('player.js');assert(player.includes("w=a.sourceRect?.length===4?o.w"));assert(player.includes("project.backgroundFit==='fill'"));assert(player.includes("scope:a.group==='flowers'?'flowers':'decor'"));
assert(read('editor.html').includes('border:0;outline:2px solid #7a8796'));
console.log('PASS: native PNG precision, registered object/background fit, correct flower tone scope, saved names and edited-layout migration protection for all4 scenes.');
