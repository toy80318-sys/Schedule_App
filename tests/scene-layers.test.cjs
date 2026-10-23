const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.join(__dirname,'..'),web=path.join(root,'docs'),raw=path.join(root,'source-assets/scene-layers-v52');
const manifest=JSON.parse(fs.readFileSync(path.join(web,'assets/scene-layers-v52/layers-manifest_v52.json')));
const code=fs.readFileSync(path.join(web,'layers.js'),'utf8');
const validator=code.slice(code.indexOf('function validManifest'),code.indexOf('let scenes='));
const validate=vm.runInNewContext("const cdn='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261024-v52/';"+validator+';validManifest');
validate(manifest);
assert.equal(manifest.imageCount,20);assert.equal(manifest.transparentImageCount,16);
let alpha=0;
for(const s of manifest.scenes){
 assert(s.lighting);assert.equal(s.layers[0].id,'background');assert.equal(s.layers[4].id,'particles');
 assert(fs.existsSync(path.join(web,s.reference.preview)));
 for(const l of s.layers){
  const b=fs.readFileSync(path.join(raw,l.file));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),l.sha256);
  assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),l.nativeWidth);assert.equal(b.readUInt32BE(20),l.nativeHeight);
  if(l.transparent){assert.equal(b[25],6,'RGBA PNG required');alpha++;}
  assert(fs.existsSync(path.join(web,l.preview)));assert(s.backgroundId===l.file.split('_')[1]);assert(s.lightingId===l.file.split('_')[2]);
 }
 assert(fs.existsSync(path.join(raw,s.zip.split('/').at(-1))));
}
assert.equal(alpha,16);
for(const mutate of [m=>m.scenes.pop(),m=>m.scenes[0].layers[1].id='background',m=>m.scenes[0].layers[1].src='https://example.invalid/x.png',m=>m.scenes[0].layers[1].rect[2]=2,m=>m.scenes[0].reference.preview='../x.webp']){
 const bad=structuredClone(manifest);mutate(bad);assert.throws(()=>validate(bad));
}
const html=fs.readFileSync(path.join(web,'layers.html'),'utf8');
assert(!html.includes('class="canvas checker" role="img"'),'composite must use its own fullscreen control');
assert(code.includes("$('ghost').style.opacity='0'"),'reference overlay must start off');
assert(!code.includes('requestFullscreen'),'enlargement must work without fullscreen permission');
assert(code.includes('i.cloneNode()')&&code.includes("$('enlarged').showModal()"),'enlargement must display actual layers');
for(const name of ['abstract-world-v44.html','all-images.html','oil-art.html','library.html','index.html'])assert(fs.readFileSync(path.join(web,name),'utf8').includes('href="layers.html"'));
console.log('PASS: four scenes,20 original PNGs,16 RGBA layers,4 ZIPs,coordinates/source hashes,invalid manifest rejection,and discoverable page links.');
