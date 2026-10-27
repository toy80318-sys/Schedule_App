const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('docs/app.js','utf8'),start=app.indexOf('  const sequenceCache='),end=app.indexOf('  function drawGuides()',start);
assert(start>0&&end>start);const code=app.slice(start,end);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const asset=(id='cloud-01')=>Object.freeze({id:'atmosphere85-'+id,atmosphereVersion:85,fps:30,
 frames:Object.freeze(Array.from({length:150},(_,i)=>`https://example.test/${id}/frames/frame_${String(i).padStart(4,'0')}.png`)),
 previewFrames:Object.freeze(Array.from({length:150},(_,i)=>`https://example.test/${id}/preview_frames/frame_${String(i).padStart(4,'0')}.png`))});
function setup(options={}){
 const blobs=new Map(),revoked=[],fetches=[],images=[],messages=[];let serial=0;
 const context={sequenceTime:1,sequenceTargets:[],AbortController,Promise,Map,Error,Math,
  renderWall(){},notice:message=>messages.push(message),
  URL:{createObjectURL(blob){const url='blob:preview-'+(++serial);blobs.set(url,blob);return url},revokeObjectURL(url){revoked.push(url);blobs.delete(url)}},
  fetch:async(src,config)=>{fetches.push({src,signal:config.signal});if(options.fetch)await options.fetch(fetches.length,src);return{ok:true,blob:async()=>({src,width:options.width||128,height:options.height||128})}},
  image:async url=>{const blob=blobs.get(url);images.push(blob);if(options.decode)await options.decode(images.length);return{naturalWidth:blob.width,naturalHeight:blob.height}}
 };
 vm.runInNewContext(code+`;this.api={sequenceSrc,sequenceFrame,warmSequence,
 setTargets(list){sequenceTargets=list.map(asset=>({asset}));syncSequenceAssets()},
 wait(){return Promise.all([...sequenceLoads.values()])},tasks(){return [...sequenceLoads.values()]},
 stats(){return {cached:sequenceCache.size,loading:sequenceLoads.size,controls:sequenceControls.size,
 bytes:[...sequenceCache.values()].reduce((sum,v)=>sum+v.decoded.reduce((n,im)=>n+im.naturalWidth*im.naturalHeight*4,0),0),
 urls:[...sequenceCache.values()].flatMap(v=>v.urls)}}};`,context);
 return{api:context.api,context,blobs,revoked,fetches,images,messages};
}
(async()=>{
 const originals=Array.from({length:12},(_,i)=>asset('set-'+i)),before=JSON.stringify(originals),t=setup();
 t.api.setTargets(originals);await t.api.wait();let stats=t.api.stats();assert.equal(stats.cached,12);assert.equal(stats.bytes,12*150*128*128*4);assert.equal(stats.bytes/1024/1024,112.5);
 assert(t.fetches.every(v=>v.src.includes('/preview_frames/')),'editor preloads only the 128px preview path');assert(t.images.every(v=>v.width===128&&v.height===128));assert.equal(t.fetches.length,1800);
 assert.match(t.api.sequenceSrc(originals[0]),/^blob:/);assert.equal(t.api.sequenceSrc(originals[0],true),originals[0].frames[30],'PNG export bypasses the low-resolution cache');assert.equal(JSON.stringify(originals),before,'saved/Unity frame lists are never changed');
 t.api.setTargets([originals[0],originals[0]]);await t.api.wait();assert.equal(t.api.stats().cached,1);assert.equal(t.api.stats().bytes,150*128*128*4);assert.equal(t.fetches.length,1800,'duplicate placements share one asset cache');assert.equal(t.revoked.length,11*150);
 t.api.setTargets([]);assert.equal(t.api.stats().cached,0);assert.equal(t.blobs.size,0);assert.equal(t.revoked.length,1800,'removing the last placement releases every cached blob');
 t.api.setTargets([originals[0]]);await t.api.wait();assert.equal(t.api.stats().cached,1,'undo/re-add can prepare the preview again');

 const gates=Array.from({length:12},deferred),race=setup({fetch:async n=>{if(n<=12)await gates[n-1].promise}}),a=asset();
 race.api.setTargets([a]);const oldTask=race.api.tasks()[0];assert.equal(race.fetches.length,6);race.api.setTargets([]);assert(race.fetches.every(v=>v.signal.aborted));assert.equal(race.api.stats().loading,0);
 race.api.setTargets([a]);const newTask=race.api.tasks()[0];assert.notEqual(oldTask,newTask);assert.equal(race.fetches.length,12);gates.slice(6).forEach(v=>v.resolve());await newTask;const newURLs=Array.from(race.api.stats().urls);
 gates.slice(0,6).forEach(v=>v.resolve());await oldTask;assert.deepEqual(Array.from(race.api.stats().urls),newURLs,'late canceled fetches cannot overwrite a new cache');assert.equal(race.blobs.size,150);assert.equal(race.api.stats().controls,0);

 const decodes=Array.from({length:6},deferred),duringDecode=setup({decode:async n=>{if(n<=6)await decodes[n-1].promise}});
 duringDecode.api.setTargets([a]);const decoding=duringDecode.api.tasks()[0];await tick();assert.equal(duringDecode.blobs.size,6);duringDecode.api.setTargets([]);assert.equal(duringDecode.blobs.size,0,'cancellation releases blobs even during image decoding');decodes.forEach(v=>v.resolve());await decoding;assert.equal(duringDecode.blobs.size,0);assert.equal(duringDecode.api.stats().cached,0,'late decoded images cannot resurrect a removed asset');

 const oversized=setup({width:480,height:480});oversized.api.setTargets([a]);await assert.rejects(oversized.api.wait(),/미리보기가 너무 큽니다/);await tick();assert.equal(oversized.api.stats().cached,0);assert.equal(oversized.blobs.size,0,'incorrect full-size previews never remain cached');
 const fallback=setup(),short={...a,previewFrames:a.previewFrames.slice(0,2)},missing={...a,previewFrames:a.previewFrames.map((src,i)=>i===30?null:src)},notArray={...a,previewFrames:{length:150,30:'https://example.test/invalid.png'}};
 for(const malformed of [short,missing,notArray])assert.equal(fallback.api.sequenceFrame(malformed,30),a.frames[30],'malformed imported preview metadata falls back to the original frame');
 const exportStart=app.indexOf("$('exportPng').onclick="),exportEnd=app.indexOf("$('saveAs').onclick",exportStart);const exportCode=app.slice(exportStart,exportEnd>exportStart?exportEnd:exportStart+6000);assert(exportCode.includes('sequenceSrc(a,true)'),'full PNG export explicitly chooses original sequence frames');
 console.log('PASS: 12 preview sets use 112.5 MiB decoded pixels; 480px export/source preservation; shared placement cache; removal/undo; abort during fetch/decode; stale-job isolation; oversized-preview rejection.');
})().catch(error=>{console.error(error);process.exitCode=1});
