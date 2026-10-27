const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const crypto=require('node:crypto');
const read=file=>fs.readFileSync('docs/'+file,'utf8'),code=read('set-review-catalog.js'),context={window:{}};vm.createContext(context);
for(const file of ['catalog-data.js','layer55-data.js','cutout56-data.js','cutout57-data.js','whole59-data.js','whole60-data.js','whole61-data.js','whole62-data.js','additions68-data.js'])vm.runInContext(read(file),context);
const catalog=context.window.jejuFinalCatalog,old=structuredClone(catalog),otherAssets=JSON.stringify(catalog.assets.filter(a=>a.category!=='background')),otherSources=JSON.stringify(catalog.sourceFiles.filter(f=>!catalog.assets.some(a=>a.id===f.id&&a.category==='background')));
vm.runInContext(code,context);
assert.equal(catalog.backgrounds.length,4);assert.equal(catalog.assets.filter(a=>a.category==='background').length,4);
assert.equal(JSON.stringify(catalog.assets.filter(a=>a.category!=='background')),otherAssets,'flower/environment assets remain byte-identical');
assert.equal(JSON.stringify(catalog.sourceFiles.filter(f=>!catalog.backgrounds.some(a=>a.id===f.id))),otherSources,'other source downloads remain identical');
for(const [i,theme] of ['sunset','day','night','morning'].entries()){
 const bg=catalog.backgrounds[i];assert.equal(bg.id,`BG0${i+1}-B04-V05`);assert.equal(bg.theme,theme);assert.equal(bg.catalogHidden,false);assert(bg.stillOnly);assert.equal(bg.preview,'assets/set-review-v01/preview/'+bg.id+'.webp');
 assert.equal(bg.file,bg.id+'.png');assert.equal(bg.sha256,crypto.createHash('sha256').update(fs.readFileSync('source-assets/set-review-v01/'+bg.file)).digest('hex'));assert.equal(bg.width,2172);assert.equal(bg.height,724);
 assert.deepEqual(JSON.parse(JSON.stringify(catalog.sourceFiles.find(f=>f.id===bg.id))),{id:bg.id,relativePath:bg.id+'.png',stablePreviewUrl:bg.src});
 for(const a of old.assets.filter(a=>a.category==='background'&&a.theme===theme)){assert.equal(catalog.backgroundReplacements[a.src],bg.src);assert.equal(catalog.backgroundAliases[a.src],bg.src);}
 for(const f of old.sourceFiles.filter(f=>f.id===`whole62-${theme}-background`))assert.equal(catalog.backgroundReplacements[f.stablePreviewUrl],bg.src);
 for(const [part,version] of [['B01','V01'],['B02','V02'],['B03','V03']])assert.equal(catalog.backgroundReplacements[bg.src.replace('B04-V05',part+'-'+version)],bg.src);
 assert(!Object.hasOwn(catalog.backgroundReplacements,bg.src),'new bright choices keep their existing filters');
}
for(const [from,to] of Object.entries(old.backgroundAliases))assert.equal(catalog.backgroundAliases[from],catalog.backgroundReplacements[to],'older aliases point directly to bright sources');
for(const file of catalog.sourceFiles)assert(!/Darker_v60/.test(file.relativePath),'no retired dark download remains');
assert(!Object.hasOwn(catalog.backgroundReplacements,'https://example.test/ML_BG01_LT01_Background_Darker_v60.png'),'unregistered custom lookalikes are preserved');
const after=JSON.stringify(catalog);vm.runInContext(code,context);assert.equal(JSON.stringify(catalog),after,'registry is idempotent');vm.runInNewContext(code,{window:{}});
for(const [file,entry]of [['editor.html','app.js'],['player.html','player.js']]){const html=read(file);assert(html.indexOf('set-review-catalog.js')>0);assert(html.indexOf('set-review-catalog.js')<html.indexOf('src="'+entry));}
assert(read('index.html').includes('set-review.html?v=86'),'review tools remain in the production links');
console.log('PASS: bright-only four-theme gallery/assets/downloads, all legacy aliases replaced, unchanged flowers/environment, custom safety and idempotence.');
