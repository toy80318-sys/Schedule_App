const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('docs/set-review-catalog.js','utf8');
const original={id:'old-bg',src:'old.png',category:'background'},catalog={assets:[original],backgrounds:[original]},context={window:{jejuFinalCatalog:catalog}},before=JSON.stringify(original);
vm.runInNewContext(code,context);
assert.equal(catalog.assets.length,9);assert.equal(catalog.backgrounds.length,9);assert.equal(JSON.stringify(original),before);
for(const asset of catalog.assets.slice(1)){assert(asset.catalogHidden&&asset.imageStyleVersion>=56&&asset.stillOnly);assert.match(asset.src,/^https:\/\/raw\.githubusercontent\.com\/toy80318-sys\/Schedule_App\/main\/source-assets\/set-review-v01\/BG0[1-4]-B0[12]-V0[12]\.png$/);assert.equal(asset.preview,'assets/set-review-v01/preview/'+asset.id+'.webp');}
vm.runInNewContext(code,context);assert.equal(catalog.assets.length,9);
vm.runInNewContext(code,{window:{}});
for(const [file,entry]of [['editor.html','app.js'],['player.html','player.js']]){const html=fs.readFileSync('docs/'+file,'utf8');assert(html.indexOf('set-review-catalog.js')>0);assert(html.indexOf('set-review-catalog.js')<html.indexOf('src="'+entry));}
assert(fs.readFileSync('docs/site-nav.js','utf8').includes("['set-review.html', '배경별 세트·비교']"));
console.log('PASS: eight versioned backgrounds registered before editor/player, full-panorama fit, no old catalog mutation, idempotent and navigable.');
