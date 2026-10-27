const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const data=JSON.parse(fs.readFileSync('docs/assets/integrated-small-flowers-v84/manifest.json','utf8'));
const old=JSON.parse(fs.readFileSync('docs/assets/scene-flowers-v83/manifest.json','utf8'));
assert.equal(data.scenes.length,4);assert.equal(new Set(data.scenes.map(s=>s.sha256)).size,4);
assert.deepEqual(data.scenes.map(s=>s.theme),['sunset','day','night','morning']);
for(const s of data.scenes){
 const bytes=fs.readFileSync('source-assets/integrated-small-flowers-v84/'+s.file);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),s.sha256);
 assert.equal(bytes.readUInt32BE(16),2169);assert.equal(bytes.readUInt32BE(20),725);
 assert.equal(s.flowerScaleTarget,.3);const previous=old.scenes.find(a=>a.theme===s.theme);
 assert.equal(s.previousScene.sha256,previous.sha256);assert.equal(s.backgroundId,previous.backgroundId);assert.equal(s.lightingId,previous.lightingId);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('source-assets/scene-flowers-v83/'+previous.file)).digest('hex'),previous.sha256);
}
const gallery=fs.readFileSync('docs/scene-flowers-gallery.js','utf8');
assert(gallery.includes('assets/integrated-small-flowers-v84/manifest.json?v=84'));
assert(gallery.includes('assets/scene-flowers-v83/manifest.json?v=83'));
assert(gallery.includes('link(master.previousScene)'));assert.equal(old.assets.length,48);
console.log('PASS:4 new integrated scenes,30% scale target,matching theme lighting,unaltered v83 masters and48 independent flowers.');
