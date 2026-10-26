const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createParticles,findParticle}=require('../docs/particle-scatter.js');
const manifest=JSON.parse(fs.readFileSync('docs/assets/whole-objects-v62/manifest_v62.json','utf8'));
let id=0,seed=9;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
for(const scene of manifest.scenes){
 const state={...scene.project,assets:manifest.assets},asset=findParticle(state,manifest.scenes);
 assert.equal(asset.theme,scene.id);assert.equal(asset.category,'particle');
 const before=JSON.stringify(state),items=createParticles(asset,14165,3480,()=>String(++id),random);
 assert.equal(items.length,72);assert.equal(new Set(items.map(o=>o.id)).size,72);assert.equal(new Set(items.map(o=>o.groupId)).size,1);
 const cells=new Set();for(const o of items){assert.equal(o.assetId,asset.id);assert(o.w>0&&o.h>0&&o.x>=0&&o.y>=0&&o.x+o.w<=14165&&o.y+o.h<=3480);assert.equal(o.w/o.h,asset.width/asset.height);assert(o.opacity>=.35&&o.opacity<=.85);cells.add(`${Math.floor((o.x+o.w/2)/14165*12)},${Math.floor((o.y+o.h/2)/3480*6)}`)}
 assert.equal(cells.size,72,'every screen cell gets one particle');assert.equal(JSON.stringify(state),before,'existing layout remains unchanged');
 assert(new Set(items.map(o=>o.w)).size>1);assert(new Set(items.map(o=>o.opacity)).size>1);
}
assert.equal(findParticle({assets:[],objects:[],background:'custom'},[]),undefined);
const scene=manifest.scenes[0],asset=scene.assets.find(a=>a.category==='particle');
assert.equal(findParticle({background:'custom',assets:[asset],objects:[{assetId:asset.id}]},[]),asset);
const code=fs.readFileSync('docs/particle-scatter.js','utf8'),button={disabled:false,addEventListener(type,fn){this.click=fn}},notices=[],inserts=[];
const E={ready:Promise.resolve(),state:()=>({...scene.project,assets:manifest.assets}),uid:()=>String(++id),W:14165,H:3480,image:async()=>{},insert:(...args)=>inserts.push(args),notice:s=>notices.push(s)};
vm.runInNewContext(code,{window:{jejuEditor:E,jejuWhole62:manifest},document:{getElementById:()=>button},console});
(async()=>{await button.click();assert.equal(inserts.length,1,'one insert means one undo checkpoint');assert.equal(inserts[0][0].length,72);assert.equal(inserts[0][1].length,0);assert.equal(button.disabled,false);
 E.image=async()=>{throw Error('image failed')};await button.click();assert.equal(inserts.length,1,'failed image load must not alter the layout');assert.equal(button.disabled,false);assert(notices.at(-1).includes('image failed'));
 const changed={...scene.project,assets:manifest.assets};E.state=()=>changed;E.image=async()=>{E.state=()=>({...changed,background:'other'})};await button.click();assert.equal(inserts.length,1,'switching backgrounds during loading must not insert incorrectly lit particles');assert(notices.at(-1).includes('배경이 변경'));
 const html=fs.readFileSync('docs/editor.html','utf8');assert(html.includes('id="scatterParticles"'));assert(html.includes('particle-scatter.js?v=63'));console.log('PASS: full-screen coverage, four lighting themes, one undo, image failure protection');})();
