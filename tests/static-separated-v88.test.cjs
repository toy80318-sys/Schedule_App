const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../docs/separated-motion'),E=require('../docs/element-loops95'),A=require('../docs/ambient-policy'),F=require('../docs/flower-opening');
const read=p=>fs.readFileSync('docs/'+p,'utf8'),data=JSON.parse(read('assets/separated-loops-v88/manifest.json')),loops=JSON.parse(read('assets/element-loops-v95/manifest.json')),release=JSON.parse(read('assets/current-release-v86/manifest.json')),flowers=JSON.parse(read('assets/flower-openings-v89/manifest.json'));
const fields=['frames','previewFrames','previewWidth','previewHeight','fps','frameCount','duration','loopWidth','loopHeight','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','elementLoopVersion','motion'];
const originals=data.environment.map(m=>release.assets.find(a=>a.id===m.id));
const before=JSON.stringify(originals);
for(const a of originals){
 const m=data.environment.find(m=>m.id===a.id),v=loops.items.find(v=>v.id===a.id),legacy={...a,frames:m.frames.slice(),previewFrames:m.frames.slice(),fps:24,loopVideo:v.loopVideo,keyVideo:v.keyVideo,unityFrames:m.unityFrames.slice(),sequenceZip:v.sequenceZip,loopInPlace:true,duration:3,elementLoopVersion:95};
 const result=E.asset(M.asset(legacy,data),loops);
 assert.equal(result.src,a.src);assert.equal(result.sha256,a.sha256);assert.equal(result.theme,a.theme);assert.equal(result.stillOnly,true);assert.equal(result.loopInPlace,false);
 for(const key of fields)assert(!Object.hasOwn(result,key),a.id+' retains '+key);
 assert.deepEqual(JSON.parse(JSON.stringify(result)),result,'saved static metadata has no undefined-only keys');
 const restored=A.currentAsset(legacy,{assets:[result]});for(const key of fields)assert(!Object.hasOwn(restored,key));assert.equal(restored.src,a.src);
 const style=A.currentAsset({...legacy,id:'user-style-'+a.id},{assets:[result]});assert.equal(style.id,'user-style-'+a.id);assert(!style.frames&&!style.loopVideo,'saved styles with private IDs also become static');
 assert.throws(()=>M.asset({...legacy,sha256:'0'.repeat(64)},data));assert.throws(()=>E.asset({...legacy,theme:'other'},loops));
}
assert.equal(JSON.stringify(originals),before,'original metadata is immutable');
for(const b of data.backgrounds){
 const relative=b.video+'?v=old#background',absolute='https://toy80318-sys.github.io/Schedule_App/'+relative;
 assert.equal(M.staticBackground(relative,data),b.sourcePNG);assert.equal(M.staticBackground(absolute,data),b.sourcePNG);
 const project={name:'old',assets:originals,objects:[{id:'placed',assetId:originals[0].id,x:123,y:45,w:67,h:89,r:12}],background:absolute,backgroundOriginal:b.sourcePNG,backgroundLoop:relative,backgroundPlaylist:[absolute,'https://example.test/custom.mp4']},bytes=JSON.stringify(project),converted=M.project(project,data,true);
 assert.equal(converted.background,b.sourcePNG);assert(!converted.backgroundLoop);assert.deepEqual(converted.backgroundPlaylist,[b.sourcePNG,'https://example.test/custom.mp4']);assert.deepEqual(converted.objects,project.objects);assert.equal(JSON.stringify(project),bytes);
 const custom=M.project({...project,background:'https://example.test/custom.png'},data);assert.equal(custom.background,'https://example.test/custom.png');assert(!custom.backgroundLoop);
}
assert.equal(M.staticBackground('https://example.test/custom.mp4',data),'https://example.test/custom.mp4');assert.equal(M.staticBackground(null,data),null);
for(const a of release.assets.filter(a=>['flower','particle'].includes(a.category))){assert.deepEqual(M.asset(a,data),a);const current=E.asset(a,loops);if(a.category==='particle'){assert.equal(current.frames.length,72);assert.equal(current.loopInPlace,true);assert(current.loopVideo)}}
const blooming=release.assets.find(a=>flowers.items.some(f=>f.id===a.id&&f.status==='passed'));assert(blooming);const opening=F.asset(blooming,flowers),stillOpening=F.asset(E.asset(M.asset(blooming,data),loops),flowers);assert.deepEqual(stillOpening,opening);assert.equal(opening.bloomSequence.frames.length,72,'real opening sequence is preserved');
const handoff=read('handoff.js'),start=handoff.indexOf('const project=copy(E.project()),styles=copy(library);'),end=handoff.indexOf(' const textFile=',start);assert(start>0&&end>start);
const source=originals[0],legacyStyle={...source,id:'private-style-id',frames:['old-frame.png'],fps:24,loopVideo:'old.webm',unityFrames:['old-native.png']},library={assets:[legacyStyle],styles:[]},snapshot=JSON.stringify(library),project={assets:[source],objects:[],name:'static',sceneFilters:{}};
const packed=vm.runInNewContext('(()=>{'+handoff.slice(start,end)+'return {project,styles,lookup};})()',{copy:structuredClone,E:{project:()=>project,W:14165,H:3480},library,window:{jejuAmbient:A}});
assert.equal(packed.lookup.get('private-style-id').src,source.src);assert(!packed.lookup.get('private-style-id').frames&&!packed.lookup.get('private-style-id').loopVideo);assert(!packed.styles.assets[0].frames);assert.equal(JSON.stringify(library),snapshot,'export keeps stored styles intact');
(async()=>{
 const {harness,object}=require('./game-interaction.test.cjs'),h=harness();h.env.window.jejuSeparatedLoops=data;h.env.window.jejuSeparatedMotion=M;
 const b=data.backgrounds[0],oldAssets=originals.map(a=>({...a,frames:['assets/separated-loops-v88/'+a.id+'/frame_0000.webp'],fps:24,loopVideo:'assets/separated-loops-v88/'+a.id+'/alpha.webm',loopInPlace:true})),p={format:'jeju-maze-wall-v1',oilAssetVersion:14,width:1000,height:300,background:b.video,backgroundLoop:b.video,backgroundPlaylist:[b.video],assets:oldAssets,objects:oldAssets.map((a,i)=>object('item-'+i,a.id,i*50))},bytes=JSON.stringify(p);
 await h.api.load(p);h.api.setActive(true);assert(h.requests.includes(b.sourcePNG));assert(!h.requests.some(src=>/separated-loops-v88|element-loops-v95/.test(src)),'player requests only original PNGs');assert.equal(h.api.state().swayCount,4,'grass retains existing procedural sway;other static environment stays fixed');assert.equal(JSON.stringify(p),bytes);
 h.step(1000);assert.equal(h.api.state().swayCount,4);
 console.log('PASS:16 static PNG assets,4 legacy backgrounds,immutable layouts/styles,full-resolution Unity sprites,existing sway,and untouched flower/particle animation.');
})().catch(error=>{console.error(error);process.exitCode=1});
