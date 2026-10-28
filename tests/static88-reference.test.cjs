const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const dir='docs/assets/reference-layout-v93/',read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const manifest=read(dir+'manifest.json'),environment=read('docs/assets/separated-loops-v88/manifest.json').environment;
const fields=['frames','previewFrames','previewWidth','previewHeight','fps','frameCount','duration','loopWidth','loopHeight','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','elementLoopVersion','motion'];
const protectedHashes={"sunset":"566679bb1c58c183fb2034700d04013654b7c53b657936e308d822c123e8fcb6","day":"ee05305f523db521d840229214b6aa3ba7bcba6e91355cc80a6eab53bb7106d9","night":"5cf3f3379a4ffb6b0fb8acff90aa4f0d06ff7b60e010d0ee93bb171b3b8cb108","morning":"6eb7e269dd6b5c10f298129b2b13ce4cdcf5f0a1f9420d40ce7ff68c2f89f133"};
let count=0;
for(const scene of manifest.scenes){
 const bytes=fs.readFileSync(dir+scene.project,'utf8'),p=JSON.parse(bytes);assert.equal(hash(bytes.replace(/\r\n/g,'\n')),scene.sha256);
 for(const a of p.assets.filter(a=>/^BG0[1-4]-E0[1256]-V05$/.test(a.id))){
  const original=environment.find(v=>v.id===a.id);assert(original);assert.equal(a.src,original.sourcePNG);assert.equal(a.sha256,original.sourceSHA256);assert.equal(a.theme,original.theme);assert.equal(a.category,original.category);assert.equal(a.width,1254);assert.equal(a.height,1254);assert.equal(a.kind,'image');assert.equal(a.stillOnly,true);assert.equal(a.loopInPlace,false);assert.equal(a.separatedLoopVersion,88);
  for(const k of fields)assert(!Object.hasOwn(a,k),a.id+' retains '+k);for(const k of ['stillOnly','loopInPlace','separatedLoopVersion'])delete a[k];count++;
 }
 assert.equal(hash(JSON.stringify(p)),protectedHashes[scene.id],scene.id+' background, placements, groups or non-environment metadata changed');
}
assert.equal(count,12);console.log('PASS: all12 remaining reference environment assets are original static PNGs;4 manifest hashes match; background, geometry,groups and all unrelated metadata remain exact.');
