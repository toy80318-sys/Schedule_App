const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const BASE='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/';
const species=['hydrangea','lavender','rapeseed','buckwheat','marigold','camellia'];
const variants=species.flatMap((s,i)=>Array.from({length:i<4?3:2},(_,n)=>{const tone=String.fromCharCode(97+n),bud=BASE+s+'_'+tone+'_bud.png',open=BASE+s+'_'+tone+'_open.png';return{id:s+'-'+tone,species:s,tone,name:s,ready:true,route:'PNG_STATE_PAIR',transparent:true,bud,open,frames:[bud,open],frameCount:2,fps:0,duration:0,width:100,height:100,petalColor:'#d92f56'}}));
const manifest={format:'jeju-png-state-pairs-v1',mode:'PNG_STATE_PAIR',defaultVariants:Object.fromEntries(species.map(s=>[s,'a'])),variants};
let frame,now=0;
const ctx={globalAlpha:1,tx:0,ty:0,ellipses:[],stack:[],save(){this.stack.push([this.globalAlpha,this.tx,this.ty])},restore(){[this.globalAlpha,this.tx,this.ty]=this.stack.pop()},resetTransform(){this.tx=this.ty=0},clearRect(){this.ellipses=[]},translate(x,y){this.tx+=x;this.ty+=y},ellipse(){this.ellipses.push({x:this.tx,y:this.ty,alpha:this.globalAlpha})}};
for(const name of ['scale','rotate','fillRect','beginPath','fill'])ctx[name]=()=>{};
const draws=[];ctx.drawImage=im=>draws.push({source:im.source,x:ctx.tx,y:ctx.ty});
const videos=[];
class Element{
 constructor(tag='DIV'){this.tagName=tag.toUpperCase();if(this.tagName==='VIDEO')videos.push(this);this.paused=true;this.videoWidth=this.videoHeight=100;this.currentTime=0;this.dataset={};this.style={};this.children=[];this.classList={add(){}};this.hidden=false}
 get source(){return this.src} load(){queueMicrotask(()=>this.onloadeddata?.())} play(){this.paused=false;return Promise.resolve()} pause(){this.paused=true} removeAttribute(k){delete this[k]}
 append(x){this.children.push(x)} replaceChildren(){this.children=[]} setAttribute(k,v){this[k]=v} addEventListener(){} getContext(){return ctx} getBoundingClientRect(){return{width:1000,height:300}} click(){this.onclick?.()}
}
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)};
class Image{constructor(){this.naturalWidth=this.naturalHeight=100}set src(s){this.source=s;queueMicrotask(()=>this.onload?.())}}
const document={baseURI:'https://example.test/player.html?embedded=1',hidden:false,body:new Element(),getElementById:get,createElement:tag=>new Element(tag),addEventListener(){}};
const window={document,devicePixelRatio:1,jejuFinalCatalog:{backgrounds:[{src:BASE+'background.png'}]},jejuPlayerArt:{displaySrc:s=>s},jejuPngPairs:require('../docs/png-state-pairs.js'),jejuAmbient:{cleanProject:p=>p,currentAsset:a=>a,atmosphereKind:()=>null},matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}};window.parent=window;
const sandbox={window,document,location:new URL(document.baseURI),URL,URLSearchParams,Image,performance:{now:()=>now},requestAnimationFrame:fn=>{frame=fn;return 1},cancelAnimationFrame(){frame=null},createImageBitmap:async blob=>({source:blob.src,width:100,height:100,close(){}}),fetch:async src=>({ok:true,json:async()=>manifest,blob:async()=>({src})}),setTimeout,clearTimeout,console};
vm.runInNewContext(fs.readFileSync(require.resolve('../docs/player.js'),'utf8'),sandbox);
const advance=ms=>{now=ms;const fn=frame;frame=null;assert(fn);fn(ms)};
(async()=>{
 const api=window.jejuExhibition;
 await api.load({format:'jeju-maze-wall-v1',oilAssetVersion:14,name:'Test',width:1000,height:300,assets:[{id:'flower',group:'flowers',species:'camellia',src:BASE+'camellia_a_open.png'}],objects:[{id:'flower1',assetId:'flower',x:400,y:150,w:100,h:100,r:0,opacity:.8}],background:BASE+'background.png'});
 api.setActive(true);
 const button=get('flowers').children[0];assert(button);assert.equal(api.state().activeBlooms,0);
 button.onpointerenter({pointerType:'touch'});assert.equal(api.state().activeBlooms,0,'touch entry alone must not activate');
 button.onpointerenter({pointerType:'mouse'});assert.equal(api.state().activeBlooms,1);assert.equal(get('scene').dataset.petals,'24','PNG preview must emit petals');
 const initial=ctx.ellipses.map(x=>({...x}));assert.equal(initial.length,24);
 let stopped=false;button.onpointerdown({pointerType:'touch',button:0,stopPropagation(){stopped=true}});assert(stopped,'flower pointerdown must not bubble into the empty-stage burst');
 button.onpointerenter({pointerType:'mouse'});button.click();assert.equal(get('scene').dataset.petals,'24','one pointer/hover/click sequence cannot create duplicate bursts');
 advance(7000);assert.equal(ctx.ellipses.length,24);ctx.ellipses.forEach((p,i)=>{assert(p.x<initial[i].x);assert(p.y<initial[i].y);assert.equal(p.alpha,.8)});
 advance(8500);ctx.ellipses.forEach(p=>assert(Math.abs(p.alpha-.4)<1e-9,'half opacity halfway through final three seconds'));
 advance(9999);assert.equal(ctx.ellipses.length,24);ctx.ellipses.forEach(p=>assert(p.alpha<.00001));
 advance(10000);assert.equal(get('scene').dataset.petals,'0','particles expire at exactly ten seconds');
advance(61000);assert.equal(api.state().activeBlooms,0);assert.equal(button.dataset.state,'idle');
 button.click();assert.equal(get('scene').dataset.petals,'24','touch/keyboard click remains available after reset');
 api.reset();assert.equal(get('scene').dataset.petals,'0');assert.equal(api.state().activeBlooms,0);
 const policy=require('../docs/ambient-policy.js'),fixed={x:100,y:50,w:100,motion:'left'};assert.strictEqual(policy.driftPose(fixed,'cloud',20,1000,{loopInPlace:true}),fixed);assert.notEqual(policy.driftPose(fixed,'cloud',20,1000).x,fixed.x);
 const frames=[0,1,2].map(n=>BASE+'bird/frame_'+n+'.webp');
 await api.load({format:'jeju-maze-wall-v1',oilAssetVersion:14,width:1000,height:300,assets:[{id:'bird',src:frames[0],frames,fps:2,loopInPlace:true}],objects:[{id:'bird1',assetId:'bird',x:100,y:50,w:100,h:100,r:0,opacity:1,motion:'left'}],background:BASE+'background.png'});
 api.setActive(true);await new Promise(setImmediate);
 draws.length=0;advance(now+500);assert(draws.some(d=>d.source===frames[1]),'oil editor must play the second sequence frame at the declared FPS');
 const pose=draws.find(d=>d.source===frames[1]);await new Promise(setImmediate);draws.length=0;advance(now+1000);
 const wrapped=draws.find(d=>d.source===frames[0]);assert(wrapped,'sequence must wrap to the first frame');assert.equal(wrapped.x,pose.x);assert.equal(wrapped.y,pose.y);assert.equal(api.state().activeBlooms,0);
 await api.load({format:'jeju-maze-wall-v1',oilAssetVersion:14,width:1000,height:300,assets:[{id:'grass',category:'grass',src:frames[0],frames,fps:2,loopInPlace:true},{id:'flower',group:'flowers',species:'camellia',src:BASE+'camellia_a_open.png'}],objects:[{id:'grass1',assetId:'grass',x:100,y:50,w:100,h:100,r:0,opacity:1},{id:'flower1',assetId:'flower',x:100,y:50,w:100,h:100,r:0,opacity:1}],background:BASE+'background.png'});
 draws.length=0;api.reset();const grassIndex=draws.findIndex(d=>d.source===frames[0]),flowerIndex=draws.findIndex(d=>d.source===BASE+'camellia_a_bud.png');assert(grassIndex>=0&&flowerIndex>grassIndex,'animated grass must keep its saved layer behind the flower');
 const videoSrc=BASE+'cloud.webm';await api.load({format:'jeju-maze-wall-v1',oilAssetVersion:14,width:1000,height:300,assets:[{id:'cloud',src:frames[0],frames,fps:2,loopInPlace:true,loopVideo:videoSrc}],objects:[{id:'cloud1',assetId:'cloud',x:100,y:50,w:100,h:100,r:0,opacity:1}],background:BASE+'background.png'});
 draws.length=0;api.reset();assert(draws.some(d=>d.source===videoSrc),'exhibition must draw the native alpha-video decoder');assert.equal(api.state().queuedFrames,0,'native actors must not queue individual frame downloads');
 const native=videos.at(-1);assert.equal(native.paused,false);api.setActive(false);assert.equal(native.paused,true);api.setActive(true);assert.equal(native.paused,false);native.currentTime=9;api.reset();assert.equal(native.currentTime,0);
 console.log('PASS:native alpha playback avoids frame-request starvation.');
 console.log('PASS:oil actor sequence advances, wraps and remains in place without changing saved motion.');
 console.log('PASS:mouse hover, touch/click, duplicate guard, left/up travel, final3s smooth fade,10s expiry, re-entry and reset.');
})().catch(e=>{console.error(e);process.exitCode=1});
