const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.join(__dirname,'..'),web=path.join(root,'docs'),raw=path.join(root,'source-assets/unity-layers-v55');
const read=n=>fs.readFileSync(path.join(web,n),'utf8');
const d=JSON.parse(read('assets/unity-layers-v55/manifest_v55.json')),code=read('layer55-viewer.js');
const validate=vm.runInNewContext("const cdn='https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/release-20261025-v55/',labels={background:1,flower:1,grass:1,decor:1,particle:1,butterfly:1};"+code.slice(code.indexOf('function validate'),code.indexOf('function image'))+';validate');
validate(d);assert.equal(d.openingVideoCount,0);assert.equal(d.transparentImageCount,36);
for(const a of d.assets){
 const b=fs.readFileSync(path.join(raw,a.file));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);
 assert.equal(b.readUInt32BE(16),a.width);assert.equal(b.readUInt32BE(20),a.height);if(a.transparent)assert.equal(b[25],6);
 assert.equal(a.pixelsPerUnit,100);assert.deepEqual(a.anchor,{x:.5,y:.5,origin:'top-left'});assert(a.stillOnly);
 assert(fs.existsSync(path.join(web,a.preview)));assert(a.file.includes(a.backgroundId+'_'+a.lightingId));
}
for(const s of d.scenes){
 const p=s.project,u=JSON.parse(read(s.unityLayout));assert.equal(p.objects.length,238);assert.equal(u.objects.length,p.objects.length);
 assert.equal(p.objects.filter(o=>o.assetId.includes('-F')).length,228);assert.equal(new Set(p.objects.map(o=>o.id)).size,p.objects.length);
 assert.equal(p.reference,null);assert.equal(u.background.image,s.assets.find(a=>a.category==='background').file);
 p.objects.forEach((o,i)=>{const v=u.objects[i];assert.equal(v.id,o.id);assert(v.rotationZ===-o.r);assert.equal(v.sortingOrder,i);assert.equal(v.widthMeters,o.w/1000);assert.equal(v.xMeters,(o.x+o.w/2-p.width/2)/1000);assert.equal(v.yMeters,(p.height/2-o.y-o.h/2)/1000)});
 assert(fs.statSync(path.join(raw,s.zip.split('/').at(-1))).size<50*1024**2);
}
for(const mutate of [x=>x.assets.pop(),x=>x.assets[0].src='https://example.invalid/a.png',x=>x.scenes[0].zip=x.scenes[0].zip.replace('ML_','../ML_'),x=>x.scenes[0].project.objects[0].x=-1,x=>x.scenes[0].reference.preview='../a.webp']){const bad=structuredClone(d);mutate(bad);assert.throws(()=>validate(bad))}
assert(code.includes("$('overlay').value=0"));assert(code.includes('i.cloneNode()'));assert(!code.includes('requestFullscreen'));
assert(read('app.js').includes('if(a?.stillOnly)return;'));assert(read('player.js').includes('if(a?.stillOnly)return;'));
assert(read('unity/Editor/JejuLayoutImporter.cs').includes('SpriteMeshType.FullRect'));
async function startup(url,fail=false){
 const opened=[],replaced=[],items={parentElement:{prepend(){}}},data={scenes:[{id:'sunset',name:'sunset',project:{objects:[{x:10}]}}]};
 const E={ready:Promise.resolve(),notice(){},useSample:async p=>{if(fail)throw Error('backup');opened.push(p);p.objects[0].x=99}};
 await vm.runInNewContext(read('layer55-scenes.js'),{window:{jejuEditor:E,jejuLayer55:data,jejuHandoff:{ready:Promise.resolve()}},document:{getElementById:()=>items,createElement:()=>({style:{},append(){}})},location:{href:url},history:{replaceState:(_a,_b,u)=>replaced.push(u)},URL,structuredClone});return{opened,replaced,data};
}
(async()=>{
 assert.equal((await startup('https://example.test/editor.html')).opened.length,0);
 const r=await startup('https://example.test/editor.html?layers=55&scene=sunset&keep=1#wall');assert.equal(r.opened.length,1);assert.equal(r.data.scenes[0].project.objects[0].x,10);assert.equal(r.replaced[0],'https://example.test/editor.html?keep=1#wall');
 assert.equal((await startup('https://example.test/editor.html?layers=55&scene=sunset',true)).replaced.length,0);
 console.log('PASS:40 PNG hashes/dimensions,36 alpha sources,4 matching editor/Unity scenes,238 objects each,safe paths,static-only playback and saved-work protection.');
})().catch(e=>{console.error(e);process.exitCode=1});
