const fs=require('fs'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(require.resolve('../docs/'+n),'utf8');
const manifest=JSON.parse(read('assets/contrast-v54/scene_manifest_v54.json'));
const latest=manifest.entries.filter(e=>e.styleVersion===47||e.styleVersion===54);
assert.equal(latest.length,8);assert.equal(latest.filter(e=>e.airborneParticles).length,4);assert.equal(manifest.nativeImagesTotal,104);assert.equal(manifest.integratedBudCount,0);
for(const e of latest.filter(e=>e.styleVersion===54)){
 const b=fs.readFileSync(require.resolve('../source-assets/contrast-v54/'+e.file));
 assert(e.selectiveLuminanceContrast);assert.equal(b[25],2,'opaque RGB PNG');
 assert.equal(b.readUInt32BE(16),e.width);assert.equal(b.readUInt32BE(20),e.height);
 assert.equal(require('crypto').createHash('sha256').update(b).digest('hex'),e.sha256);
}
assert(read('oil-art-v51-archive.html').includes('IntegratedBloom_AirParticles_'));
for(const name of ['all-images.html','oil-art.html','abstract-world-v44.html','oil-gallery.html','oil-sources.html','lighting-sets.html']){
 const html=read(name);assert(!html.includes('IntegratedBud_AbstractOil_v44'));assert(!html.includes('IntegratedBloom_AbstractOil_v44'));
 assert(html.includes('whole62-data.js')&&html.includes('whole62-viewer.js'),name+' must render latest independent assets');
 assert(html.includes('old.html'),'earlier versions remain discoverable');
}
assert(read('oil-art-v44-archive.html').includes('IntegratedBud_AbstractOil_v44'));
const c=JSON.parse(read('catalog-data.js').split('=',2)[1].trim().replace(/;$/,''));
assert.equal(c.backgrounds.length,4);
for(const b of c.backgrounds){assert(b.src.includes('release-20261023-v49'));assert(Object.values(c.backgroundAliases).includes(b.src));}
for(const s of c.scenes){assert(s.project.background.includes('release-20261023-v49'));assert.equal(s.project.oilAssetVersion,17);}
console.log('PASS: 8 new images on all current galleries, original PNG links, previous paired images archived, current editor backgrounds and saved-layout version retained.');
