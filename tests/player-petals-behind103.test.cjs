const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {harness,project,flower,object}=require('./game-interaction.test.cjs');
const code=fs.readFileSync('docs/player.js','utf8'),start=code.indexOf('  function scatter('),end=code.indexOf('  function bloom(',start);
assert(start>0&&end>start);
const posed={assetId:'flower',x:300,y:100,w:180,h:120,r:19,plane:[1.1,.3,-.2,.8],opacity:.7};
const math=Object.create(Math);math.random=()=>.5;
const box={window:{jejuSpace:{pose:()=>posed,lighting:()=>({brightness:.8})}},assets:new Map([['flower',{category:'flower',theme:'morning'}]]),project:{width:1000,height:300},cameraView:{},reduced:{matches:false},petals:[],stills:new Map(),clock:0,canvas:{dataset:{}},filter:()=> 'none',touchFlower:a=>a?.category==='flower',Math:math};
vm.runInNewContext(code.slice(start,end)+';this.emit=scatter;',box);
box.emit({assetId:'flower',x:0,y:0,w:50,h:50,r:0,opacity:1},{},{x:999,y:999});
assert.equal(box.petals.length,36);
for(const p of box.petals){assert(p.behindFlower);assert.equal(p.x,posed.x+posed.w/2-posed.h*.25*posed.plane[2]);assert.equal(p.y,posed.y+posed.h/2-posed.h*.25*posed.plane[3]);assert(p.kickY<=0&&p.vy<0&&p.vx<0);assert.equal(p.life,10)}

function trace(h){
 const log=[],draw=h.ctx.drawImage.bind(h.ctx),fill=h.ctx.fill.bind(h.ctx),clear=h.ctx.clearRect.bind(h.ctx);
 h.ctx.drawImage=(im,...args)=>{log.push({type:'image',source:im.source});return draw(im,...args)};
 h.ctx.fill=()=>{log.push({type:'petal'});return fill()};
 h.ctx.clearRect=(...args)=>{log.length=0;return clear(...args)};return log;
}
function quiet(h){const input=h.get('atmosphereRichness');input.value='0';input.listeners.input()}
(async()=>{
 const h=harness(),log=trace(h),grass={id:'ground',category:'grass',src:'https://example.test/ground.png'},a={...flower},b={...flower,id:'second',src:'https://example.test/second.png',preview:'https://example.test/second-preview.png'};
 const p=project([grass,a,b],[object('bed',grass.id,0),{...object('one',a.id),r:0,flipX:false},{...object('two',b.id,600),r:0,flipX:false}]),before=JSON.stringify(p);
 await h.api.load(p);h.api.setActive(true);quiet(h);h.get('flowers').children[0].onpointerdown(h.event(550,270,h.get('flowers').children[0]));
 assert.equal(h.api.state().petals,36);assert.equal(h.api.state().activeBlooms,1);assert.equal(log.filter(e=>e.type==='petal').length,36);
 const burst=log.findIndex(e=>e.type==='petal'),bed=log.findIndex(e=>e.source===grass.src),first=log.findIndex(e=>e.source===a.preview),second=log.findIndex(e=>e.source===b.preview);
 assert(bed>=0&&bed<burst&&burst<first&&burst<second,'burst is above preceding ground and behind every flower');
 let previous=h.ctx.particles.map(p=>p.matrix[5]);assert(previous.every(y=>y>=171&&y<=179),'a touch near the stem still emits from the head');
 for(const ms of [40,100,200,500]){h.step(ms);assert.equal(h.ctx.particles.length,36);const next=h.ctx.particles.map(p=>p.matrix[5]);assert(next.every((y,i)=>y<previous[i]),'all petals rise immediately and continue upward');previous=next}
 assert.equal(JSON.stringify(p),before);
 const empty=harness(),emptyLog=trace(empty);await empty.api.load(project([grass],[object('no-flower',grass.id,0)]));empty.api.setActive(true);quiet(empty);
 empty.get('viewport').listeners.pointerdown(empty.event(350,120,empty.get('viewport')));assert.equal(empty.api.state().petals,36);assert.equal(emptyLog.filter(e=>e.type==='petal').length,36);
 assert(emptyLog.findIndex(e=>e.type==='petal')>emptyLog.findIndex(e=>e.source===grass.src),'empty-stage burst keeps its foreground pass');assert(empty.ctx.particles.every(p=>p.matrix[4]===250&&p.matrix[5]===100));empty.step(10000);assert.equal(empty.api.state().petals,0,'no-flower fallback still expires particles');
 console.log('PASS: posed flower-head origin, upward initial kick/flight, one burst pass above ground and behind flowers, empty pointer/front pass/expiry, and saved geometry preserved.');
})().catch(error=>{console.error(error);process.exitCode=1});
