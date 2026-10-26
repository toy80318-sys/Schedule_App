const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),build=require('../docs/contrast-additions');
const c={window:{}};for(const file of ['catalog-data','whole62-data','additions68-data'])vm.runInNewContext(fs.readFileSync('docs/'+file+'.js','utf8'),c);
assert.equal(c.window.jejuAdditions68.assets.length,24);
for(const scene of c.window.jejuWhole62.scenes){
 const state=structuredClone(scene.project);state.assets.push(...c.window.jejuAdditions68.assets);const before=JSON.stringify(state);let id=0;
 const plan=build(state,c.window.jejuAdditions68,c.window.jejuWhole62.scenes,state.width,state.height,()=>`new-${id++}`);
 assert.equal(JSON.stringify(state),before);assert(plan.changed>0);assert.equal(plan.objects.length,state.objects.length+20);
 const flowers=plan.objects.filter(o=>o.assetId.startsWith('add68-')&&!o.placementRole);assert.equal(new Set(flowers.map(o=>o.assetId)).size,4);
 const next=build({...state,objects:plan.objects},c.window.jejuAdditions68,c.window.jejuWhole62.scenes,state.width,state.height,()=>`next-${id++}`);
 assert.equal(next.changed,0);assert.equal(next.objects.length,plan.objects.length);
 const back=plan.objects.filter(o=>o.placementRole==='contrast_backdrop_v68');assert.equal(back.length,20);
 for(const o of back)assert(plan.objects.indexOf(o)<plan.objects.indexOf(flowers[0]));
 for(const a of c.window.jejuAdditions68.assets.filter(a=>a.theme===scene.id)){assert.equal(a.backgroundId,scene.backgroundId);assert.equal(a.lightingId,scene.lightingId);assert(a.stillOnly&&a.completeObject&&a.transparent);assert(a.visibleBounds[0]>=70&&a.visibleBounds[1]>=70);assert.equal(a.width,1024);assert(fs.existsSync('source-assets/additions-v68/'+a.file))}
}
console.log('PASS:24 alpha objects, four close flower colors per theme,20 dark rear props, immutable/idempotent placement');
