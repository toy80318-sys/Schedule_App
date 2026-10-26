const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const build=require('../docs/foreground-fill.js'),data=JSON.parse(fs.readFileSync('docs/assets/whole-objects-v62/manifest_v62.json','utf8'));let id=0;
for(const scene of data.scenes){
 const state={...scene.project,assets:data.assets},before=JSON.stringify(state),items=build(state,data.scenes,14165,3480,()=>String(++id));
 assert(items.length>100&&items.length<320);assert.equal(new Set(items.map(o=>o.id)).size,items.length);
 const map=new Map(state.assets.map(a=>[a.id,a]));assert(items.some(o=>map.get(o.assetId).category==='grass'));assert(items.some(o=>map.get(o.assetId).category==='decor'));
 for(const o of items){const a=map.get(o.assetId);assert(a&&a.theme===scene.id&&a.completeObject);assert.equal(o.placementRole,'foreground_fill_v67');assert(o.y>3480*.65);assert.equal(o.opacity,1);assert.equal(o.w/o.h,a.width/a.height);assert(!o.groupId)}
 assert(Math.min(...items.map(o=>o.x))<0&&Math.max(...items.map(o=>o.x+o.w))>14165,'cover both screen edges');assert.equal(JSON.stringify(state),before);
}
assert.throws(()=>build({assets:[],objects:[],background:'custom'},[],14165,3480,()=>String(++id)));
const aliasState={...data.scenes[0].project,assets:[...data.assets,...data.scenes[0].assets.map(a=>({...a,id:'old-'+a.id}))]};assert(build(aliasState,data.scenes,14165,3480,()=>String(++id)).every(o=>!o.assetId.startsWith('old-')),'reuse placed source entries instead of legacy aliases');
for(const pose of [{x:-100,y:3100,w:800,h:900,r:0},{x:13800,y:2900,w:1000,h:1100,r:18},{x:100,y:3000,w:900,h:1000,r:0,plane:[.9,.1,-.2,.8]}]){const angle=pose.r*Math.PI/180,[a,b,c,d]=pose.plane||[Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle)];const coords=build.clipPath(pose,14165,3480).match(/-?[\d.e+]+(?=px)/g).map(Number);[[0,0],[14165,0],[14165,3480],[0,3480]].forEach(([x,y],i)=>{const dx=coords[i*2]-pose.w/2,dy=coords[i*2+1]-pose.h/2;assert(Math.abs(pose.x+pose.w/2+a*dx+c*dy-x)<1e-8);assert(Math.abs(pose.y+pose.h/2+b*dx+d*dy-y)<1e-8)})}
const app=fs.readFileSync('docs/app.js','utf8'),start=app.indexOf('function fillForeground('),end=app.indexOf("$('fillForeground').onclick",start);assert(start>0&&end>start);
const scene=data.scenes[0],state={objects:structuredClone(scene.project.objects),assets:data.assets,background:scene.project.background},baseline=JSON.stringify(state.objects);let checkpoints=0;
const context={...state,W:14165,H:3480,uid:()=>String(++id),selected:null,selectedIds:new Set(),window:{jejuForegroundFill:build,jejuWhole62:data},snapshot:()=>checkpoints++,refresh:()=>{},notice:()=>{}};vm.createContext(context);vm.runInContext(app.slice(start,end),context);
context.fillForeground();const first=context.objects.length;context.fillForeground();assert.equal(context.objects.length,first,'reapplying replaces only the generated floor');assert.equal(checkpoints,2);assert.equal(JSON.stringify(context.objects.filter(o=>o.placementRole!=='foreground_fill_v67')),baseline,'all previous flowers, foliage, particles and positions remain intact');
assert(context.objects.at(-1).assetId.includes('particle'),'particles stay in front of floor props');
const html=fs.readFileSync('docs/editor.html','utf8');assert(html.includes('id="fillForeground"'));assert(html.indexOf('foreground-fill.js?v=67')<html.indexOf('app.js?v='));assert(fs.readFileSync('docs/whole62-scenes.js','utf8').includes('E.fillForeground(false)'));
console.log('PASS: four lighting themes, dense complete rock/grass props across both edges, bounded count, no flowers altered, idempotent fill, one undo, particles remain in front');
