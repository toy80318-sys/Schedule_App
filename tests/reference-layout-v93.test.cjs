const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),L=require('../docs/reference-layout.js');
for(const theme of ['sunset','day','night','morning'])test(theme+' reference layout preserves sources and saved input',()=>{
 const p=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/assets/current-release-v86',theme+'_editor_v86.json'))),before=JSON.stringify(p),q=L.project(p,theme),assets=new Map(q.assets.map(a=>[a.id,a])),flowers=q.objects.filter(o=>assets.get(o.assetId).category==='flower');
 assert.equal(JSON.stringify(p),before);assert.deepEqual(q.assets,p.assets);assert.equal(flowers.length,320);assert.deepEqual(new Set(flowers.map(o=>o.id)),new Set(p.objects.filter(o=>assets.get(o.assetId).category==='flower').map(o=>o.id)));
 assert.equal(q.background,p.background);assert.equal(q.referenceLayoutVersion,93);assert.deepEqual(L.project(q,theme),q);assert.deepEqual(L.project(p,'invalid'),p);assert.equal(new Set(q.objects.map(o=>o.id)).size,q.objects.length);
 for(const o of q.objects){assert.ok([o.x,o.y,o.w,o.h].every(Number.isFinite));if(['flower','grass','leaf','tree','basalt'].includes(assets.get(o.assetId).category)){assert.ok(o.x>=0&&o.x+o.w<=q.width+.001);assert.ok(o.y>=0&&o.y+o.h<=q.height+.001)}}
 const left=flowers.filter(o=>o.x<q.width*.08),middle=flowers.filter(o=>o.x>q.width*.4&&o.x<q.width*.6);assert.ok(Math.min(...left.map(o=>o.y))<Math.min(...middle.map(o=>o.y))-q.height*.07);assert.ok(Math.max(...flowers.map(o=>o.y))-Math.min(...flowers.map(o=>o.y))>q.height*.23);
 assert.equal(q.objects.filter(o=>assets.get(o.assetId).category==='grass').length,42);assert.equal(q.objects.filter(o=>assets.get(o.assetId).category==='leaf').length,4);
});

for(const theme of ['sunset','day','night','morning'])test(theme+' reference environment uses original stills while background and archive input stay intact',()=>{
 const M=require('../docs/separated-motion'),read=p=>JSON.parse(fs.readFileSync('docs/'+p)),R=read('assets/current-release-v86/manifest.json'),m=read('assets/separated-loops-v88/manifest.json'),archive=read('assets/reference-layout-v93/manifest.json').scenes.find(s=>s.id===theme),hash=p=>crypto.createHash('sha256').update(fs.readFileSync('docs/'+p,'utf8').replace(/\r\n/g,'\n')).digest('hex');
 assert.equal(hash('assets/reference-layout-v93/'+archive.project),archive.sha256);assert.equal(hash(archive.sourceProject),archive.sourceProjectSHA256);
 const p=read(archive.sourceProject),q=M.project(L.project(p,theme),m,false,R.assets.filter(a=>a.category==='particle')),download=read('assets/reference-layout-v93/'+archive.project),before=JSON.stringify(download),normalized=M.project(download,m,false);
 assert.equal(JSON.stringify(download),before);assert.deepEqual(normalized.objects,download.objects);assert.equal(normalized.background,download.background);assert.equal(normalized.backgroundLoop,download.backgroundLoop);assert.equal(q.backgroundLoop,undefined);
 for(const a of normalized.assets.filter(a=>/^BG0[1-4]-E0[1256]-V05$/.test(a.id))){const old=download.assets.find(b=>b.id===a.id);assert.equal(a.src,old.src);assert.equal(a.sha256,old.sha256);assert.deepEqual(a.frames,old.frames);assert.equal(a.loopVideo,old.loopVideo);assert.equal(a.stillOnly,old.stillOnly);assert.equal(a.loopInPlace,old.loopInPlace)}
 const game=M.project(L.project(p,theme),m,true,R.assets.filter(a=>a.category==='particle'));assert.deepEqual(game.objects,download.objects);assert.equal(game.background,m.backgrounds.find(b=>b.id===theme).video);assert.equal(game.backgroundLoop,game.background);
});

test('both editor import buttons and garden use the same refined layout',()=>{for(const f of ['docs/current-release-editor.js','docs/catalog.js','docs/layered-garden.js'])assert.ok(/jejuReferenceLayout\.project|jejuCurrentProjects\.prepare/.test(fs.readFileSync(f,'utf8')));for(const f of ['docs/editor.html','docs/layered-garden.html'])assert.ok(fs.readFileSync(f,'utf8').includes('reference-layout.js?v=93'))});

test('download and status controls exist before the garden loader runs',()=>{const html=fs.readFileSync('docs/layered-garden.html','utf8');assert.equal((html.match(/id="layerLayout"/g)||[]).length,1);assert.ok(html.includes('production-status.html?v=20261028-v94'));assert.ok(html.includes('layered-garden.js?v=ground-height'))});
