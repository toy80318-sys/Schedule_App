const fs=require('fs'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(require.resolve('../docs/'+n),'utf8');
const manifest=JSON.parse(read('assets/air-particles-v51/scene_manifest_v51.json'));
const latest=manifest.entries.filter(e=>e.styleVersion===47||e.styleVersion===51);
assert.equal(latest.length,8);assert.equal(latest.filter(e=>e.airborneParticles).length,4);assert.equal(manifest.nativeImagesTotal,104);assert.equal(manifest.integratedBudCount,0);
for(const name of ['all-images.html','oil-art.html','abstract-world-v44.html','oil-gallery.html','oil-sources.html','lighting-sets.html']){
 const html=read(name);assert(!html.includes('IntegratedBud_AbstractOil_v44'));assert(!html.includes('IntegratedBloom_AbstractOil_v44'));
 for(const e of latest){assert(html.includes(e.preview),name+' missing '+e.id);assert(fs.existsSync(require.resolve('../docs/'+e.preview)));assert(html.includes(e.src),name+' must link original PNG '+e.id);}
 assert(html.includes('oil-art-v44-archive.html'),'prior pair must remain discoverable');
}
assert(read('oil-art-v44-archive.html').includes('IntegratedBud_AbstractOil_v44'));
const c=JSON.parse(read('catalog-data.js').split('=',2)[1].trim().replace(/;$/,''));
assert.equal(c.backgrounds.length,4);
for(const b of c.backgrounds){assert(b.src.includes('release-20261023-v49'));assert(Object.values(c.backgroundAliases).includes(b.src));}
for(const s of c.scenes){assert(s.project.background.includes('release-20261023-v49'));assert.equal(s.project.oilAssetVersion,17);}
console.log('PASS: 8 new images on all current galleries, original PNG links, previous paired images archived, current editor backgrounds and saved-layout version retained.');
