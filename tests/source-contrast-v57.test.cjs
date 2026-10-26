const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.join(__dirname,'..'),web=path.join(root,'docs'),raw=path.join(root,'source-assets/source-contrast-v57'),read=n=>fs.readFileSync(path.join(web,n),'utf8');
const d=JSON.parse(read('assets/source-contrast-v57/manifest_v57.json')),code=read('cutout57-viewer.js');
const validate=vm.runInNewContext("const cdn='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261026-v57/',labels={flower:1,grass:1,decor:1,particle:1};"+code.slice(code.indexOf('function validate'),code.indexOf('function show'))+';validate');
validate(d);assert(d.staticCompositionOnly);assert.equal(d.copiedOriginalCount,106);assert.equal(d.assets.filter(a=>a.matteRefinedFrom).length,32);assert.equal(d.assets.filter(a=>a.category==='particle').length,4);assert.equal(d.imageCount,d.assets.length);
for(const a of d.assets){const b=fs.readFileSync(path.join(raw,a.file));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);assert.equal(b.readUInt32BE(16),a.width);assert.equal(b.readUInt32BE(20),a.height);if(a.transparent){assert.equal(b[25],6);assert.equal(a.sourceRect.length,4)}assert(a.stillOnly);assert(fs.existsSync(path.join(web,a.preview)))}
for(const s of d.scenes){
 const p=s.project,u=JSON.parse(read(s.unityLayout));assert(p.objects.length>20);assert.equal(u.objects.length,p.objects.length);assert.equal(new Set(p.objects.map(o=>o.id)).size,p.objects.length);
 assert(!p.objects.some(o=>o.groupId),'source regions must be individually selectable');
 p.objects.forEach((o,i)=>{const a=s.assets.find(a=>a.id===o.assetId),[x,y,w,h]=a.sourceRect,v=u.objects[i];assert.equal(o.x,x/4096*14165);assert.equal(o.y,y/1006*3480);assert.equal(o.w,w/4096*14165);assert.equal(o.h,h/1006*3480);assert.equal(v.assetId,o.assetId);assert.equal(v.widthMeters,o.w/1000);assert.equal(v.xMeters,(o.x+o.w/2-14165/2)/1000)});
 assert(fs.statSync(path.join(raw,s.zip.split('/').at(-1))).size<50*1024**2);
}
for(const mutate of [x=>x.assets[0].src='https://evil.invalid/a.png',x=>x.scenes[0].reference='../a.webp',x=>x.scenes[0].project.objects[0].x=-1,x=>x.scenes[0].zip=x.scenes[0].zip.replace('ML_','../ML_')]){const bad=structuredClone(d);mutate(bad);assert.throws(()=>validate(bad))}
async function startup(url,fail=false){
 const opened=[],replaced=[],data={scenes:[{id:'sunset',name:'sunset',project:{objects:[{x:10}]}}]},items={parentElement:{prepend(){}}};
 const E={ready:Promise.resolve(),notice(){},useSample:async p=>{if(fail)throw Error('backup');opened.push(p);p.objects[0].x=99}};
 await vm.runInNewContext(read('cutout57-scenes.js'),{window:{jejuEditor:E,jejuCutout57:data,jejuHandoff:{ready:Promise.resolve()}},document:{getElementById:()=>items,createElement:()=>({style:{},append(){}})},location:{href:url},history:{replaceState:(_a,_b,u)=>replaced.push(u)},URL,structuredClone});return{opened,replaced,data};
}
(async()=>{assert.equal((await startup('https://example.test/editor.html')).opened.length,0);const a=await startup('https://example.test/editor.html?layers=57&scene=sunset&keep=1#wall');assert.equal(a.opened.length,1);assert.equal(a.data.scenes[0].project.objects[0].x,10);assert.equal(a.replaced[0],'https://example.test/editor.html?keep=1#wall');assert.equal((await startup('https://example.test/editor.html?layers=57&scene=sunset',true)).replaced.length,0);console.log('PASS: source PNG hashes/dimensions,matching source rectangles/Unity coordinates and v57 provenance,individual selection,static-only data,invalid-path rejection and saved-layout backup.');})().catch(e=>{console.error(e);process.exitCode=1});
