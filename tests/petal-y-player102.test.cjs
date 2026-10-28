const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {harness,project,object}=require('./game-interaction.test.cjs');
const player=fs.readFileSync(require.resolve('../docs/player.js'),'utf8');
const catalog=JSON.parse(fs.readFileSync('docs/assets/flower-petals-v90/manifest.json','utf8'));
const [petalA,petalB]=catalog.items.filter(a=>a.theme==='sunset'&&a.shape==='A'&&['camellia','marigold'].includes(a.species));
const flower=a=>({id:a.id,name:a.name,sha256:a.sourceSHA256,src:a.sourcePNG,category:'flower',group:'flowers',theme:a.theme,stillOnly:true,ready:true});
const placed=(id,a,x=400,hue=0)=>({...object(id,a.id,x),r:0,flipX:false,flowerHue:hue});
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const opacity=(age,initial=.8)=>{const f=Math.max(0,Math.min(1,(age-7)/3));return initial*(1-f*f*(3-2*f));};
function quiet(h){const input=h.get('atmosphereRichness');input.value='0';input.listeners.input();}

function trackedHarness(reduce=false){
 const h=harness(reduce),banks=[],runtimeData={version:102,testMarker:'trusted runtime catalog'};
 h.env.window.jejuFlowerPetals=catalog;
 h.env.window.jejuFlowerHue={css:v=>v?`hue-rotate(${v}deg)`:''};
 h.env.window.jejuPetalYData=runtimeData;
 h.env.window.jejuPetalY={create(data){
  assert.equal(data,runtimeData,'player uses the packaged trusted Y catalog');
  const registered=new Map(),instances=new Map(),used=new Set();
  const bank={active:false,clearCalls:0,registerCalls:[],frameCalls:[],draws:0,lastId:'',lastTime:0,
   register(a,p){bank.registerCalls.push({id:a.id,src:a.src,sha256:a.sha256,petalId:p?.id,petalSHA256:p?.sha256});if(!p||a.id!==p.id||a.src!==p.sourcePNG||a.sha256!==p.sourceSHA256)return false;registered.set(a.id,p);return true;},
   draw(ctx,id,fallback,...args){
    const y=bank.active&&registered.has(id);if(y&&!instances.has(id))instances.set(id,{source:'petal-y:'+id,naturalWidth:128,naturalHeight:128});
    if(y){used.add(id);bank.draws++;bank.lastId=id;bank.lastTime=h.api.state().clock%5;}
    const call={id,y,alpha:ctx.globalAlpha,filter:ctx.filter,matrix:ctx.matrix.slice(),clock:h.api.state().clock};bank.frameCalls.push(call);
    ctx.drawImage(y?instances.get(id):fallback,...args);return y;
   },
   beginFrame(){bank.frameCalls=[];used.clear();},endFrame(){},
   setActive(value){bank.active=value===true;},
   clear(){bank.clearCalls++;registered.clear();instances.clear();used.clear();bank.frameCalls=[];},
   stats(){return{registered:registered.size,instances:instances.size,ready:instances.size,playing:bank.active?used.size:0,draws:bank.draws,frameDraws:bank.frameCalls.filter(c=>c.y).length,lastId:bank.lastId,lastTime:bank.lastTime,lastFrame:Math.floor(bank.lastTime*30),failed:0};}
  };banks.push(bank);return bank;
 }};
 // The shared harness loads the IIFE before it exposes window; rerun only the unloaded player with its optional helper installed.
 vm.runInNewContext(player,h.env);h.api=h.env.window.jejuExhibition;
 return{h,banks,get bank(){assert(banks.length,'player creates the Y runtime bank');return banks.at(-1);}};
}

test('actual player routes both flower textures through Y playback while retaining flight, ordering, Hue and fade',async()=>{
 const s=trackedHarness(),{h}=s,grass={id:'ground',category:'grass',src:'https://example.test/ground.png'};
 const p=project([grass,flower(petalA),flower(petalB)],[object('bed',grass.id,0),placed('one',petalA,400,5),placed('two',petalB,600,-10)]);
 p.sceneFilters={flowers:{brightness:83},scene:{brightness:94}};const before=JSON.stringify(p);
 const timeline=[],originalDraw=h.ctx.drawImage.bind(h.ctx),originalClear=h.ctx.clearRect.bind(h.ctx);
 h.ctx.drawImage=(im,...args)=>{timeline.push(im.source);return originalDraw(im,...args);};h.ctx.clearRect=(...args)=>{timeline.length=0;return originalClear(...args);};
 await h.api.load(p);h.api.setActive(true);quiet(h);
 assert(s.bank,'player creates the Y runtime bank');
 assert.deepEqual(s.bank.registerCalls.map(c=>c.id).sort(),[petalA.id,petalB.id].sort(),'one trusted registration per used flower type');
 for(const c of s.bank.registerCalls){const original=catalog.items.find(a=>a.id===c.id);assert.equal(c.src,original.sourcePNG);assert.equal(c.sha256,original.sourceSHA256);assert.equal(c.petalId,c.id);assert.equal(c.petalSHA256,original.sha256);}
 const [one,two]=h.get('flowers').children;one.onpointerdown(h.event(550,270,one));
 assert.equal(h.api.state().petals,36);let burst=s.bank.frameCalls.filter(c=>c.y);assert.equal(burst.length,36);assert(burst.every(c=>c.id===petalA.id&&c.filter.includes('hue-rotate(5deg)')&&c.filter.includes('brightness(83%)')&&c.filter.includes('brightness(94%)')&&c.alpha===.8));assert(burst.some(c=>c.filter.includes('blur(')),'depth focus still filters the rotating petal frames');
 const firstY=timeline.indexOf('petal-y:'+petalA.id);assert(timeline.indexOf(grass.src)<firstY&&firstY<timeline.indexOf(petalA.sourcePNG)&&firstY<timeline.indexOf(petalB.sourcePNG),'Y petals retain the ground-before-petals-before-all-flowers order');
 const initialY=burst.map(c=>c.matrix[5]);assert(initialY.every(y=>y>=171&&y<=179),'Y drawing does not move emission away from the flower head');
 h.step(250);burst=s.bank.frameCalls.filter(c=>c.y);assert(burst.every((c,i)=>c.matrix[5]<initialY[i]),'all textured petals still rise immediately');
 h.step(250);two.click();assert.equal(h.api.state().petals,72);assert(s.bank.frameCalls.some(c=>c.y&&c.id===petalB.id&&c.filter.includes('hue-rotate(-10deg)')));
 h.step(7500);for(const c of s.bank.frameCalls.filter(c=>c.y))near(c.alpha,opacity(c.clock-(c.id===petalB.id ? .5 : 0)));
 h.step(1500);assert(s.bank.frameCalls.filter(c=>c.y).every(c=>c.alpha>0&&c.alpha<.25),'the existing smooth final-three-second opacity applies to Y video frames');
 h.step(1000);assert.equal(h.api.state().petals,0);assert.equal(s.bank.frameCalls.filter(c=>c.y).length,0);
 assert.equal(JSON.stringify(p),before,'Y registration and playback never enter saved assets or placement geometry');
});

test('ambient donor IDs share the same bank and many objects never register one player per particle',async()=>{
 const s=trackedHarness(),{h}=s,p=project([flower(petalA)],[placed('one',petalA),placed('same-art',petalA,600)]);
 await h.api.load(p);h.api.setActive(true);assert.equal(s.bank.registerCalls.length,1);assert(s.bank.frameCalls.some(c=>c.y&&c.id===petalA.id&&c.alpha<.7),'floating petals use their placed flower donor');
 quiet(h);for(const button of h.get('flowers').children)button.click();assert.equal(h.api.state().petals,72);assert.equal(s.bank.stats().instances,1,'72 emitted petals reuse one type binding');
 const data=h.get('scene').dataset;assert.equal(Number(data.petalYReady),1);assert.equal(Number(data.petalYVideos),1);assert.equal(data.petalYAsset,petalA.id);assert(Number(data.petalYDraws)>=72);assert(Number.isFinite(Number(data.petalYTime)));
});

test('pause, hidden state, reset, project replacement and reduced motion retain the original lifecycle',async()=>{
 const s=trackedHarness(),{h}=s;await h.api.load(project([flower(petalA)],[placed('one',petalA)]));h.api.setActive(true);quiet(h);h.get('flowers').children[0].click();
 const draws=s.bank.draws;h.api.setActive(false);assert.equal(s.bank.active,false);h.get('flowers').children[0].click();assert.equal(s.bank.draws,draws);
 h.document.hidden=true;h.api.setActive(true);assert.equal(s.bank.active,false,'hidden parent disables the shared videos');h.document.hidden=false;h.api.setActive(true);
 const clears=s.bank.clearCalls;h.api.reset();assert.equal(h.api.state().petals,0);assert.equal(s.bank.clearCalls,clears,'reset keeps trusted bindings for the next touch');h.get('flowers').children[0].click();assert.equal(h.api.state().petals,36);assert(s.bank.frameCalls.some(c=>c.y&&c.id===petalA.id));
 const old=s.bank,oldClears=old.clearCalls;await h.api.load(project([flower(petalB)],[placed('next',petalB)]));assert(old.clearCalls>oldClears,'project replacement clears old video resources');h.api.setActive(true);quiet(h);h.get('flowers').children[0].click();assert(s.bank.frameCalls.every(c=>!c.y||c.id===petalB.id));
 const reduced=trackedHarness(true);await reduced.h.api.load(project([flower(petalA)],[placed('reduced',petalA)]));reduced.h.api.setActive(true);reduced.h.get('flowers').children[0].click();assert.equal(reduced.h.api.state().petals,5);assert.equal(reduced.bank.active,false);assert.equal(reduced.bank.stats().instances,0,'reduced motion keeps the static texture without creating a decoder');assert(reduced.h.ctx.draws.some(d=>d.source===petalA.texture));
});

test('untrusted saved Y fields cannot load textures and cached pages without the helper keep still petals',async()=>{
 const s=trackedHarness(),{h}=s,a={...flower(petalA),sha256:'0'.repeat(64),petalY:{src:'https://evil.test/petal.webm'},petalTexture:'https://evil.test/petal.png'},p=project([a],[placed('stale',petalA)]),before=JSON.stringify(p);
 await h.api.load(p);h.api.setActive(true);h.get('flowers').children[0].click();assert.equal(s.bank.registerCalls.length,0);assert.equal(s.bank.stats().instances,0);assert(!h.requests.some(src=>src.includes('evil.test')));assert.equal(JSON.stringify(p),before);
 for(const partial of [false,true]){const old=harness();old.env.window.jejuFlowerPetals=catalog;if(partial){old.env.window.jejuPetalY={create(){throw Error('missing catalog');}};assert.doesNotThrow(()=>vm.runInNewContext(player,old.env),'a missing cached catalog must not stop the game');old.api=old.env.window.jejuExhibition;}await old.api.load(project([flower(petalA)],[placed('legacy',petalA)]));old.api.setActive(true);quiet(old);old.get('flowers').children[0].click();assert.equal(old.api.state().petals,36);assert(old.ctx.draws.filter(d=>d.source===petalA.texture).length>=36,'missing optional helper or catalog preserves the original textured burst');}
});

test('an older asynchronous flower load cannot add Y bindings after the current project replaces it',async()=>{
 const s=trackedHarness(),{h}=s,pending=[],OriginalImage=h.env.Image;
 h.env.Image=class extends OriginalImage{set src(value){if(value===petalA.texture){this.source=value;h.requests.push(value);pending.push(()=>this.onload?.());}else super.src=value;}};
 const slow=h.api.load(project([flower(petalA)],[placed('slow-scene',petalA)]));await new Promise(setImmediate);assert.equal(pending.length,1);
 await h.api.load(project([flower(petalB)],[placed('current-scene',petalB)]));for(const finish of pending)finish();assert.equal(await slow,false);
 assert.equal(s.bank.stats().registered,1,'the cancelled scene cannot leave an extra trusted binding in the current bank');
 assert.deepEqual(s.bank.registerCalls.map(c=>c.id),[petalB.id]);h.api.setActive(true);quiet(h);h.get('flowers').children[0].click();assert(s.bank.frameCalls.every(c=>!c.y||c.id===petalB.id));
});
