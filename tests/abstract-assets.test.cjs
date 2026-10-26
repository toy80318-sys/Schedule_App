const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {validate}=require('../docs/png-state-pairs.js');
const read=n=>JSON.parse(fs.readFileSync(require.resolve('../docs/assets/abstract-scene-v44/'+n),'utf8'));
const manifest=read('bloom-manifest_v44.json');
assert.equal(validate(manifest),manifest);
for(const bad of ['https://example.test/flower.png',manifest.variants[0].bud.replace('/ML_','/../ML_'),manifest.variants[0].bud+'?redirect=1']){
 const copy=structuredClone(manifest);copy.variants[0].bud=bad;copy.variants[0].frames[0]=bad;assert.throws(()=>validate(copy));
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../docs/catalog-data.js'),'utf8'),sandbox);
const c=sandbox.window.jejuFinalCatalog;assert.equal(c.assets.length,84);assert.equal(c.version,50);
const app=fs.readFileSync(require.resolve('../docs/app.js'),'utf8'),previewCode=app.match(/  const currentPreviews=.*\r?\n  const sourceRegistered=.*\r?\n  const displaySrc=.*\r?\n/)[0];
const preview=vm.runInNewContext(previewCode+'displaySrc',{window:{jejuFinalCatalog:c},optimizedImages:{},lightPreview:false});
for(const a of c.assets)assert.equal(preview(a.src),a.thumb,'new asset must use its published preview: '+a.id);
assert.equal(preview('https://example.test/original.png'),'https://example.test/original.png');
assert.equal(preview('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/old.png'),'https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/old.webp');
for(const a of c.assets){assert(a.src.includes(a.category==='flower'?'/abstract-flowers-v43/':a.category==='background'?'/release-20261023-v49/':'/release-20261022-v44/'),a.id);assert(!a.frames&&!a.loopVideo,a.id);if(a.category!=='background')assert(a.lightingBaked&&a.kind==='image'&&a.motion==='stationary',a.id);}
const sources=read('scene_manifest_v44.json');assert.equal(sources.entries.length,76);assert.equal(sources.flowerAssets.length,16);assert.equal(sources.nativeImagesTotal,108);assert.equal(sources.newVideoCount,0);
for(const e of sources.entries){const name=e.src.split('/').at(-1);assert(fs.existsSync(require.resolve('../source-assets/abstract-scene-v44/'+name)));if(e.kind!=='Prop')assert.deepEqual([e.wallExport.width,e.wallExport.height],[4096,1006]);}
console.log('PASS: all84 replacement assets,108 stills,16 validated pairs, strict URL boundaries and4 wall ratios');
