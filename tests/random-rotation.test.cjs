const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('docs/app.js','utf8'),start=source.indexOf('function randomizeRotations('),end=source.indexOf('for(const degrees of [5,10])',start);
assert(start>0&&end>start,'random rotation handler exists');
const space=require('../docs/garden-space.js');
for(const degrees of [5,10]){
 const flower={id:'flower',x:100,y:400,w:240,h:700,r:17,flipX:true,opacity:.8,groupId:'garden',z:20},stone={id:'stone',x:900,y:500,w:400,h:300,r:-12,opacity:.6},other={id:'other',x:20,y:30,w:40,h:50,r:2};
 const before=structuredClone([flower,stone,other]),root=space.rootPoint(flower);let checkpoints=0,renders=0,selected=[flower,stone],calls=0;
 const math=Object.create(Math);math.random=()=>calls++%2===0?0:1;
 const apply=vm.runInNewContext(source.slice(start,end)+';randomizeRotations',{Math:math,window:{jejuSpace:space},members:()=>selected,isFlower:o=>o.id==='flower',snapshot:()=>checkpoints++,refresh:()=>renders++});
 apply(degrees);assert.equal(flower.r,17-degrees);assert.equal(stone.r,-12+degrees);assert.equal(checkpoints,1);assert.equal(renders,1);
 assert(Math.abs(space.rootPoint(flower).x-root.x)<1e-8);assert(Math.abs(space.rootPoint(flower).y-root.y)<1e-8);
 for(const key of ['w','h','flipX','opacity','groupId','z'])assert.equal(flower[key],before[0][key]);
 assert.equal(stone.x,before[1].x);assert.equal(stone.y,before[1].y);assert.deepEqual(other,before[2]);
 selected=[];apply(degrees);assert.equal(checkpoints,1,'empty selection creates no history');assert.equal(renders,1);
}
const html=fs.readFileSync('docs/editor.html','utf8');for(const angle of [5,10])assert(html.includes(`id="randomRotate${angle}"`));assert(source.includes("$('randomRotate'+degrees).onclick=()=>randomizeRotations(degrees)"));
console.log('PASS: independent +/-5 and +/-10 degree deltas, planted root/prop center preserved, no unrelated edits, single undo and empty selection');
