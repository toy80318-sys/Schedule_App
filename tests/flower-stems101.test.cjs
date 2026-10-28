const {readFileSync,existsSync}=require('node:fs');
const {resolve}=require('node:path');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const root=resolve(__dirname,'..'), folder=resolve(root,'docs/assets/flower-stems-v101');
const m=JSON.parse(readFileSync(resolve(folder,'manifest.json'),'utf8'));
assert.equal(m.count,48);assert.equal(m.videoCount,48);assert.equal(m.imageCount,96);
assert.equal(m.automaticPaidRetry,false);assert.equal(m.upscaleApproved,false);
assert.equal(new Set(m.items.map(x=>x.id)).size,48);
assert.equal(new Set(m.items.map(x=>x.opening.jobId)).size,48);
for(const x of m.items){
 const o=x.opening;assert.equal(x.videoReady,true);assert.equal(x.roots,false);
 assert.deepEqual([o.duration,o.fps,o.frames,o.width,o.height],[2,24,48,320,480]);
 assert.deepEqual([o.atlasColumns,o.atlasRows,o.previewWidth,o.previewHeight],[8,6,192,288]);
 assert.equal(o.status,'passed');assert.ok(o.fullyOpenBySeconds<2);
 assert.equal(o.immediateStart,true);assert.equal(o.firstOpeningAtSeconds,1/24);
 assert.equal(o.actualInputs.length,2);
 for(const [role,state] of [['start_image','bud'],['end_image','bloom']]){
  const input=o.actualInputs.find(x=>x.role===role);assert.ok(input.media_id);
  assert.equal(input.sourceSHA256,x.images[state].sha256);
 }
 const atlas=resolve(root,'docs',o.atlas.split('?')[0]);
 assert.equal(createHash('sha256').update(readFileSync(atlas)).digest('hex'),o.atlasSHA256);
 assert.ok(existsSync(resolve(root,'docs',o.keyVideo)));
 assert.equal(createHash('sha256').update(readFileSync(resolve(root,'docs',o.keyVideo))).digest('hex'),o.keyVideoSHA256);
 for(let i=0;i<48;i++)assert.ok(existsSync(resolve(folder,x.id,`frame_${String(i).padStart(4,'0')}.webp`)));
}
console.log('48 image-pair jobs / 96 images / 2304 frames / atlas hashes / 2-second geometry passed');
