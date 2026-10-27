const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const read=file=>fs.readFileSync('docs/'+file,'utf8'),manifestPath='docs/assets/atmosphere-v84/manifest.json';
assert(fs.existsSync(manifestPath),'Generate and accept all 12 original PNGs, then run python tools/build-atmosphere84.py');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.equal(manifest.format,'jeju-atmosphere-assets-v1');assert.equal(manifest.version,84);assert.equal(manifest.assets.length,12);assert.equal(new Set(manifest.assets.map(a=>a.id)).size,12);
for(const category of ['cloud','butterfly','particle'])assert.equal(manifest.assets.filter(a=>a.category===category).length,4);
for(const a of manifest.assets){
 assert.match(a.file,/^(cloud|butterfly|particle)_0[1-4]\.png$/);assert.equal(a.id,`atmosphere84-${a.category}-${a.file.slice(-6,-4)}`);assert.equal(a.group,'decor');assert.equal(a.kind,'image');
 assert(a.stillOnly&&a.ready&&a.completeObject&&a.transparent&&a.lightingBaked);assert.equal(a.atmosphereVersion,84);assert.equal(a.theme,undefined);assert.deepEqual(a.compatibleThemes,['sunset','day','night','morning']);assert(!a.frames&&!a.sourceRect,'each asset remains a complete standalone still');
 assert.equal(a.atmosphere,a.category==='cloud'?'cloud':undefined,'clouds use the existing sky placement path');
 const bytes=fs.readFileSync('source-assets/atmosphere-v84/'+a.file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.equal(bytes[25],6,'original PNG has actual RGBA color type');assert.equal(bytes.readUInt32BE(16),a.width);assert.equal(bytes.readUInt32BE(20),a.height);
 assert.equal(a.src,'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/atmosphere-v84/'+a.file);assert.equal(a.preview,a.src);assert.equal(a.thumb,a.src);
 assert.equal(a.verification.alphaMin,0);assert(a.verification.alphaMax>=32);assert(a.verification.transparentPixelShare>0&&a.verification.translucentPixelShare>0);assert(a.verification.edgeAlphaMax<=2);assert(a.alphaBounds[0]>0&&a.alphaBounds[1]>0&&a.alphaBounds[2]<a.width&&a.alphaBounds[3]<a.height);
}
const context={window:{}};vm.createContext(context);
for(const file of ['catalog-data.js','layer55-data.js','cutout56-data.js','cutout57-data.js','whole59-data.js','whole60-data.js','whole61-data.js','whole62-data.js','additions68-data.js','set-review-catalog.js','set-review-elements.js','flower-shape-catalog.js'])vm.runInContext(read(file),context);
const catalog=context.window.jejuFinalCatalog,existingAssets=JSON.stringify(catalog.assets),backgrounds=JSON.stringify(catalog.backgrounds),scenes=JSON.stringify(catalog.scenes),sourceCount=catalog.sourceFiles.length;
const api=require('../docs/source-download'),before=api.entries(catalog).length,code=read('atmosphere84-catalog.js');
vm.runInContext(code,context);assert.equal(JSON.stringify(catalog.assets.slice(0,-12)),existingAssets);assert.equal(JSON.stringify(catalog.backgrounds),backgrounds);assert.equal(JSON.stringify(catalog.scenes),scenes,'registration does not place objects or modify saved scene samples');assert.equal(catalog.backgrounds.length,4);
assert.equal(catalog.sourceFiles.length,sourceCount+12);const exported=api.entries(catalog);assert.equal(exported.length,before+12,'all 12 new originals satisfy source ZIP filename/hash/host checks');assert.equal(new Set(exported.map(a=>a.file)).size,exported.length,'original ZIP filenames stay unique');
const registered=JSON.stringify(catalog);vm.runInContext(code,context);assert.equal(JSON.stringify(catalog),registered,'catalog registration remains idempotent');
const standalone={window:{}};vm.runInNewContext(code,standalone);assert.equal(standalone.window.jejuAtmosphere84.assets.length,12,'gallery does not require the editor');
const promptSet=JSON.parse(read('assets/atmosphere-v84/prompts.json'));assert.equal(promptSet.assets.length,12);assert(promptSet.assets.every(p=>Object.keys(p).sort().join(',')==='file,prompt'&&p.prompt.trim()));
assert.deepEqual(promptSet,JSON.parse(fs.readFileSync('source-assets/atmosphere-v84/prompts.json','utf8')),'public prompts derive from the committed sanitized canonical source');
const html=read('atmosphere-assets-v84-archive.html');assert(html.includes('data-mode="checker"'));assert(html.includes('id="backdrop"'));assert(html.includes('object-fit:contain'));assert(html.includes('12종 PNG ZIP'));assert(!html.includes('requestAnimationFrame'),'the new page is a still-source preview');
for(const [file,entry]of [['editor.html','app.js'],['player.html','player.js']]){const source=read(file);assert(source.includes('atmosphere84-catalog.js'),file+' must load the new source catalog');assert(source.indexOf('atmosphere84-catalog.js')<source.indexOf('src="'+entry),file+' loads sprites before runtime initialization');}
const check=spawnSync('python',['tools/build-atmosphere84.py','--check'],{encoding:'utf8'});assert.equal(check.status,0,check.stderr||check.stdout);
console.log('PASS: 12 complete RGBA sprites, exact source hashes, four per category, real alpha and clear visible bounds, unchanged old assets/backgrounds/scenes, source ZIP integration, idempotency and still gallery.');
