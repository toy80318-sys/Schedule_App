const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const code=fs.readFileSync('docs/petal-y-runtime102.js','utf8'),catalogCode=fs.readFileSync('docs/petal-y-runtime102-catalog.js','utf8');
const scope={window:{}};vm.runInNewContext(catalogCode,scope);const data=JSON.parse(JSON.stringify(scope.window.jejuPetalYData));
const petals=JSON.parse(fs.readFileSync('docs/assets/flower-petals-v90/manifest.json','utf8')).items;
const loops=JSON.parse(fs.readFileSync('docs/assets/petal-y-loops-v102/manifest.json','utf8')).items;
const asset=p=>({id:p.id,src:p.sourcePNG,sha256:p.sourceSHA256});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness({supported=true,playError,playDeferred=false,canvasError=false,opaque=false,tainted=false}={}){
 const videos=[],canvases=[],draws=[];
 class Video{
  constructor(){this.paused=true;this.readyState=0;this.videoWidth=this.videoHeight=480;this.duration=5;this.currentTime=0;this.playCalls=0;this.loadCalls=0;this.events=[];}
  canPlayType(){return supported?'probably':''}
  set crossOrigin(value){this._crossOrigin=value;this.events.push('crossOrigin')}
  set src(value){this._src=value;this.events.push('src');assert.equal(this._crossOrigin,'anonymous')}
  get src(){return this._src}
  play(){this.playCalls++;if(playError)return Promise.reject(playError);this.paused=false;if(playDeferred)return new Promise((resolve,reject)=>{this.resolvePlay=resolve;this.rejectPlay=reject});return Promise.resolve()}
  pause(){this.paused=true}
  load(){this.loadCalls++}
  removeAttribute(name){if(name==='src')this._src=''}
 }
 const doc={createElement(tag){if(tag==='video'){const v=new Video;videos.push(v);return v}assert.equal(tag,'canvas');const calls=[],canvas={width:0,height:0,calls,getContext(){return{clearRect(...args){calls.push(['clear',...args])},drawImage(...args){if(canvasError)throw Error('canvas unavailable');calls.push(['draw',...args])},getImageData(...args){calls.push(['read',...args]);if(tainted)throw Error('tainted');return{data:[0,0,0,opaque?255:0]}}}}};canvases.push(canvas);return canvas}};
 const sandbox={window:{document:doc}};vm.runInNewContext(code,sandbox);const bank=sandbox.window.jejuPetalY.create(data),ctx={filter:'hue-rotate(7deg)',globalAlpha:.3,drawImage(...args){draws.push(args)}};
 return{bank,api:sandbox.window.jejuPetalY,ctx,videos,canvases,draws};
}

test('trusted catalog retains all 48 original source identities, alpha videos and visible-size compensation',()=>{
 const h=harness();assert.equal(h.api.validate(data),data);assert.equal(data.items.length,48);
 for(const row of data.items){const p=petals.find(p=>p.id===row.id),loop=loops.find(a=>a.id===row.id);assert(p&&loop);assert.equal(row.sourcePNG,p.sourcePNG);assert.equal(row.sourceSHA256,p.sourceSHA256);assert.equal(row.sourcePetalSHA256,p.sha256);assert.equal(row.videoSHA256,crypto.createHash('sha256').update(fs.readFileSync('docs/'+row.alphaVideo)).digest('hex'));assert(row.drawScale>=1.4&&row.drawScale<=1.68);assert.equal(h.bank.register(asset(p),p),true);}
 assert.equal(h.bank.stats().registered,48);assert.equal(h.videos.length,0,'registration never creates decoders');
});

test('invalid catalogs and untrusted source aliases cannot load a movie',()=>{
 const h=harness(),p=petals[0];
 for(const alter of [d=>d.items.pop(),d=>d.items[1]=d.items[0],d=>d.fps=24,d=>d.seconds=4,d=>d.width=128,d=>d.rotationAxis='Z',d=>d.sampleSize=512,d=>d.items[0].drawScale=Infinity,d=>d.items[0].sourceSHA256='x',d=>d.items[0].alphaVideo='https://evil.test/movie.webm',d=>d.items[0].alphaVideo='assets/../movie.webm',d=>d.items[0].alphaVideo=d.items[0].alphaVideo.replace('alpha.webm','key.mp4'),d=>d.items[0].alphaVideo='//evil.test/a.webm',d=>d.items[0].sourcePNG='https://evil.test/source.png']){const bad=structuredClone(data);alter(bad);assert.throws(()=>h.api.validate(bad));}
 for(const change of [{id:'private'}, {src:'https://evil.test/a.png'},{sha256:'0'.repeat(64)}])assert.equal(h.bank.register({...asset(p),...change},p),false);
 assert.equal(h.bank.register(asset(p),{...p,sha256:'0'.repeat(64)}),false);assert.equal(h.bank.register(asset(p),{...p,id:'private'}),false);
 h.bank.setActive(true);h.bank.draw(h.ctx,p.id,{},-10,-10,20,20);assert.equal(h.videos.length,0);
 for(const prefix of ['https://toy80318-sys.github.io/Schedule_App/','https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/docs/']){const external=structuredClone(data);external.items[0].alphaVideo=prefix+external.items[0].alphaVideo;assert.doesNotThrow(()=>h.api.validate(external));}
 const mutable=structuredClone(data),sandbox={window:{document:{createElement(){throw Error('should remain lazy')}}}};vm.runInNewContext(code,sandbox);const bank=sandbox.window.jejuPetalY.create(mutable);mutable.items[0].sourcePNG='https://evil.test';assert.equal(bank.register(asset(p),p),true,'the verified scalar rows are snapshotted');
});

test('hundreds of particles share one decoder, canvas and frame sample while preserving tone and opacity',async()=>{
 const h=harness(),p=petals[0],fallback={name:'original'};h.bank.register(asset(p),p);h.bank.setActive(true);h.bank.beginFrame();
 assert.equal(h.bank.draw(h.ctx,p.id,fallback,-10,-20,20,40),false);assert.deepEqual(h.draws.at(-1),[fallback,-10,-20,20,40]);assert.equal(h.videos.length,1);
 const video=h.videos[0];assert(video.loop&&video.muted&&video.playsInline);assert.equal(video.preload,'auto');assert(video.events.indexOf('crossOrigin')<video.events.indexOf('src'));video.readyState=4;video.onloadeddata();await tick();
 for(let i=0;i<480;i++)assert.equal(h.bank.draw(h.ctx,p.id,fallback,-10,-20,20,40),true);
 assert.equal(h.videos.length,1);assert.equal(h.canvases.length,1);assert.equal(h.canvases[0].width,128);assert.equal(h.canvases[0].calls.filter(c=>c[0]==='draw').length,1);assert.equal(h.canvases[0].calls.filter(c=>c[0]==='read').length,1,'video alpha is checked before the first public draw');assert.equal(h.bank.stats().draws,480);assert.equal(h.bank.stats().lastFrame,0);
 assert.equal(h.ctx.filter,'hue-rotate(7deg)');assert.equal(h.ctx.globalAlpha,.3);const scale=data.items[0].drawScale,args=h.draws.at(-1);assert.equal(args[0],h.canvases[0]);assert.deepEqual(args.slice(1),[-10+20*(1-scale)/2,-20+40*(1-scale)/2,20*scale,40*scale]);
 video.currentTime=.01;h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);assert.equal(h.canvases[0].calls.filter(c=>c[0]==='draw').length,1);video.currentTime=.04;h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);assert.equal(h.canvases[0].calls.filter(c=>c[0]==='draw').length,2);assert.equal(h.canvases[0].calls.filter(c=>c[0]==='read').length,1,'the transparency check does not repeat for every particle or frame');assert.equal(h.bank.stats().lastFrame,1);
});

test('unused, hidden or reduced-motion playback pauses without touching flight state and can resume',async()=>{
 const h=harness(),p=petals[0],fallback={};h.bank.register(asset(p),p);h.bank.setActive(true);h.bank.beginFrame();h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);const v=h.videos[0];v.readyState=4;await tick();h.bank.endFrame();assert.equal(h.bank.stats().playing,1);
 h.bank.beginFrame();h.bank.endFrame();assert.equal(v.paused,true);assert.equal(h.bank.stats().frameDraws,0);
 h.bank.beginFrame();h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);await tick();assert.equal(v.paused,false);h.bank.setActive(false);assert.equal(v.paused,true);assert.equal(h.bank.draw(h.ctx,p.id,fallback,0,0,20,20),false);assert.equal(h.draws.at(-1)[0],fallback);
 h.bank.setActive(true);await tick();assert.equal(v.paused,false);assert.equal(h.videos.length,1);assert.equal(v.currentTime,0,'drawing never seeks video time');
});

test('unsupported, failed, wrong-sized and tainted media keep the original transparent still',async()=>{
 const p=petals[0],fallback={name:'original'};
 for(const options of [{supported:false},{canvasError:true},{opaque:true},{tainted:true},{error:true},{wrongSize:true},{wrongDuration:true}]){
  const h=harness(options);h.bank.register(asset(p),p);h.bank.setActive(true);h.bank.beginFrame();h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);const v=h.videos[0];
  if(options.error)v.onerror();else if(options.supported!==false){v.readyState=4;if(options.wrongSize)v.videoWidth=512;if(options.wrongDuration)v.duration=6;}
  assert.equal(h.bank.draw(h.ctx,p.id,fallback,0,0,20,20),false);assert.equal(h.draws.at(-1)[0],fallback);assert.equal(h.bank.stats().failed,1);assert(!String(v.src).includes('mp4'));assert.equal(h.bank.stats().instances,0);await tick();
 }
});

test('autoplay rejection and pending clear cannot leak asynchronous playback',async()=>{
 const p=petals[0],fallback={},h=harness({playError:Error('not allowed')});h.bank.register(asset(p),p);h.bank.setActive(true);h.bank.beginFrame();h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);await tick();assert.equal(h.videos[0].paused,true);h.bank.draw(h.ctx,p.id,fallback,0,0,20,20);assert.equal(h.videos[0].playCalls,1);h.bank.setActive(true);await tick();assert.equal(h.videos[0].playCalls,2);
 const pending=harness({playDeferred:true});pending.bank.register(asset(p),p);pending.bank.setActive(true);pending.bank.beginFrame();pending.bank.draw(pending.ctx,p.id,fallback,0,0,20,20);const v=pending.videos[0],onload=v.onloadeddata,onerror=v.onerror;pending.bank.clear();v.resolvePlay();onload();onerror();await tick();assert.equal(v.paused,true);assert.equal(v.src,'');assert.equal(v.onloadeddata,null);assert.equal(v.onerror,null);assert.equal(pending.bank.stats().registered,0);assert.equal(pending.bank.stats().instances,0);assert.equal(pending.bank.draw(pending.ctx,p.id,fallback,0,0,20,20),false);assert.equal(pending.videos.length,1);
});

test('an intentional unused pause does not permanently block a later request',async()=>{
 const p=petals[0],h=harness({playDeferred:true});h.bank.register(asset(p),p);h.bank.setActive(true);h.bank.beginFrame();h.bank.draw(h.ctx,p.id,{},0,0,20,20);const v=h.videos[0];h.bank.beginFrame();h.bank.endFrame();v.rejectPlay(Object.assign(Error('paused'),{name:'AbortError'}));await tick();h.bank.beginFrame();h.bank.draw(h.ctx,p.id,{},0,0,20,20);assert.equal(v.playCalls,2);v.resolvePlay();await tick();assert.equal(v.paused,false);
});
