const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const vary=require('../docs/flower-directions.js');
const root=o=>{const a=o.r*Math.PI/180;return{x:o.x+o.w/2-Math.sin(a)*o.h/2,y:o.y+o.h/2+Math.cos(a)*o.h/2}};
const flowers=Array.from({length:128},(_,i)=>({id:String(i),x:100+i*90,y:2100,w:700,h:700,r:i%3===0?12:0,opacity:.8,flipX:i%2===0,assetId:'flower',groupId:'clump',z:200}));
const before=structuredClone(flowers),result=flowers.map((o,i)=>vary(o,i,()=>.5));
for(let i=0;i<flowers.length;i++){const a=before[i],b=result[i];assert(Math.abs(root(a).x-root(b).x)<1e-8);assert(Math.abs(root(a).y-root(b).y)<1e-8);for(const key of ['id','w','h','opacity','assetId','groupId','z'])assert.equal(b[key],a[key]);assert(Math.abs(b.r)<=10);assert.equal(b.directionVersion,64)}
assert.equal(JSON.stringify(flowers),JSON.stringify(before),'source layout is not mutated');assert.equal(result.filter(o=>o.flipX).length,64);assert(result.some(o=>o.r<0)&&result.some(o=>o.r>0)&&result.some(o=>o.r===0));
const app=fs.readFileSync('docs/app.js','utf8'),start=app.indexOf('function varyFlowerDirections('),end=app.indexOf("$('varyFlowerDirections').onclick",start);assert(start>0&&end>start);
let snapshots=0,refreshes=0;const props=[{id:'stone',assetId:'stone',x:0,y:0,w:50,h:50,r:0}],objects=[...before,...props];let selected=[];
const apply=vm.runInNewContext(app.slice(start,end)+';varyFlowerDirections',{objects,members:()=>selected,isFlower:o=>o.assetId==='flower',snapshot:()=>snapshots++,refresh:()=>refreshes++,notice:()=>{},window:{jejuFlowerDirections:vary}});
assert.equal(apply(),128);assert.equal(snapshots,1);assert.equal(refreshes,1);assert.deepEqual(objects.at(-1),props[0]);
const untouched=JSON.stringify(objects.slice(1));selected=[objects[0]];assert.equal(apply(),1);assert.equal(JSON.stringify(objects.slice(1)),untouched,'selected edit leaves other plants and props intact');
const html=fs.readFileSync('docs/editor.html','utf8');assert(html.includes('id="varyFlowerDirections"'));assert(html.indexOf('flower-directions.js?v=64')<html.indexOf('app.js?v='));assert(fs.readFileSync('docs/whole62-scenes.js','utf8').includes('E.varyFlowerDirections(false)'));
console.log('PASS: balanced left/front/right directions, fixed planting roots, unchanged sizes/colors/layers, one undo, selection scope and preset integration');
