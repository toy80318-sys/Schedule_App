const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const dir='docs/assets/reference-layout-v93/',read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const manifest=read(dir+'manifest.json'),environment=read('docs/assets/separated-loops-v88/manifest.json').environment;
const fields=['frames','previewFrames','previewWidth','previewHeight','fps','frameCount','duration','loopWidth','loopHeight','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','elementLoopVersion','motion'];
const protectedHashes={sunset:'82bd654c21d01da00ab0bec9e8a918a5ae67957b0d09e589d8efdb063fdf999d',day:'ed5494407de7a0488a9118baeaafe4b78c7a005c76c6f3f2a0d4938deebf0edc',night:'02c68ea82bcf5067aeaf0d682a31ff823d47d497a98c6ac4f47d4453d96800b7',morning:'2a024e6378c88af74ed433f0c31ed2fa26b21d0bdfe5f05acb781e1b26d58766'};
let count=0;
for(const scene of manifest.scenes){
 const bytes=fs.readFileSync(dir+scene.project,'utf8'),p=JSON.parse(bytes);assert.equal(hash(bytes.replace(/\r\n/g,'\n')),scene.sha256);
 for(const a of p.assets.filter(a=>/^BG0[1-4]-E0[1256]-V05$/.test(a.id))){
  const original=environment.find(v=>v.id===a.id);assert(original);assert.equal(a.src,original.sourcePNG);assert.equal(a.sha256,original.sourceSHA256);assert.equal(a.theme,original.theme);assert.equal(a.category,original.category);assert.equal(a.width,1254);assert.equal(a.height,1254);assert.equal(a.kind,'image');assert.equal(a.stillOnly,true);assert.equal(a.loopInPlace,false);assert.equal(a.separatedLoopVersion,88);
  for(const k of fields)assert(!Object.hasOwn(a,k),a.id+' retains '+k);for(const k of ['stillOnly','loopInPlace','separatedLoopVersion'])delete a[k];count++;
 }
 assert.equal(hash(JSON.stringify(p)),protectedHashes[scene.id],scene.id+' background, placements, groups or non-environment metadata changed');
}
assert.equal(count,16);console.log('PASS: all16 reference environment assets are original static PNGs;4 manifest hashes match; background, geometry,groups and all unrelated metadata remain exact.');
