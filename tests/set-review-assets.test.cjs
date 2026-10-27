const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const renderer=require('../docs/set-review-renderer'),web=path.resolve(__dirname,'../docs'),out=path.join(web,'assets/set-review-v01'),source=path.resolve(__dirname,'../source-assets/set-review-v01'),raw='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/',read=p=>JSON.parse(fs.readFileSync(path.join(out,p),'utf8'));
const manifest=read('manifest.json'),audit=read('asset-audit.json'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(manifest.format,'jeju-set-review-v1');assert.equal(manifest.version,'V01');assert.equal(manifest.backgrounds.length,4);assert.equal(manifest.counts.flowerPngs,96);assert.equal(manifest.counts.totalPngs,136);assert.equal(audit.technicalPassed,136);assert.equal(audit.visualMatch,'pending_manual_review');
const ids=new Set(),flowerHashes=new Set();let count=0;
for(const scene of manifest.backgrounds){
 assert(['sunset','day','night','morning'].includes(scene.id));assert.equal(scene.flowers.length,24);assert.equal(scene.environment.length,6);assert.equal(scene.backgrounds.length,2);assert.equal(scene.integrated.length,2);
 assert.deepEqual([...new Set(scene.flowers.map(a=>a.design))],['F01','F02','F03','F04','F05','F06']);
 for(let design=1;design<=6;design++){const variants=scene.flowers.filter(a=>a.design==='F'+String(design).padStart(2,'0'));assert.equal(variants.length,4);assert.deepEqual(variants.map(a=>a.color),['C01','C02','C03','C04']);}
 for(const category of ['grass','tree','butterfly','cloud','basalt','leaf'])assert.equal(scene.environment.filter(a=>a.category===category).length,1);
 for(const asset of [...scene.flowers,...scene.environment,...scene.backgrounds,...scene.integrated]){
  assert(!ids.has(asset.id),'globally unique versioned IDs');ids.add(asset.id);count++;
  assert(asset.id.startsWith(scene.code+'-'));assert(/^[A-Za-z0-9-]+$/.test(asset.id));assert.equal(asset.src,raw+asset.id+'.png');
  const file=path.resolve(source,asset.id+'.png');assert(file.startsWith(source+path.sep));assert(fs.existsSync(file));const bytes=fs.readFileSync(file);
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(bytes.readUInt32BE(16),asset.width);assert.equal(bytes.readUInt32BE(20),asset.height);assert.equal(hash(file),asset.sha256);
  assert.equal(asset.verification.complete,true);assert.equal(asset.verification.technicalOnly,true);assert.equal(asset.verification.visualMatch,'pending_manual_review');
  const evidence=audit.files.find(a=>a.id===asset.id);assert(evidence);assert.equal(evidence.sha256,asset.sha256);assert.deepEqual(evidence.verification,asset.verification);
  assert.equal(asset.preview,'assets/set-review-v01/preview/'+asset.id+'.webp');const preview=path.resolve(web,asset.preview),previewBytes=fs.readFileSync(preview);assert.equal(previewBytes.toString('ascii',0,4),'RIFF');assert.equal(previewBytes.toString('ascii',8,12),'WEBP');assert.equal(hash(preview),asset.previewSha256);assert(asset.width>asset.previewWidth,'original PNG is not the downsized display preview');assert.equal(asset.previewWidth,asset.category?320:1200);if(asset.category)assert.equal(asset.previewHeight,320);
  const legacy=path.join(out,'PNG',asset.id+'.png');if(fs.existsSync(legacy))assert.equal(hash(legacy),asset.sha256,'retained original doc copy is byte-identical');
  if(asset.category){assert.equal(bytes[25],6,'independent element PNG has RGBA alpha');assert(asset.verification.alpha&&asset.verification.borderClear);assert(asset.verification.transparentMarginsPx.every(n=>n>=8));assert.equal(asset.verification.alphaThreshold,8);assert(asset.verification.fullyTransparentFraction>=.01);}
  if(asset.category==='flower')flowerHashes.add(asset.sha256);
 }
 const project=JSON.parse(fs.readFileSync(path.join(web,scene.project),'utf8')),before=JSON.stringify(project),unity=JSON.parse(fs.readFileSync(path.join(web,scene.unityLayout),'utf8'));
 renderer.validate(project);assert.equal(JSON.stringify(project),before);assert.equal(project.width,14165);assert.equal(project.height,3480);assert.equal(project.backgroundFit,'fill');assert.equal(project.background,scene.backgrounds[1].src);assert.equal(project.reference,null);assert.equal(project.objects.length,116);assert.equal(project.assets.length,30);assert(project.assets.every(a=>a.completeObject&&a.stillOnly&&a.transparent&&!a.sourceRect));
 assert.equal(new Set(project.objects.map(o=>o.assetId)).size,30);assert.equal(project.objects.filter(o=>scene.flowers.some(a=>a.id===o.assetId)).length,80);assert(project.objects.some(o=>o.blur>=5));assert(project.objects.some(o=>o.blur===0));
 assert.equal(unity.format,'jeju-unity-v1');assert.equal(unity.widthMm,14165);assert.equal(unity.heightMm,3480);assert.equal(unity.verification.runtime,'not_run');assert(unity.verification.dataOnly);assert.equal(unity.objects.length,project.objects.length);
 project.objects.forEach((o,i)=>{const u=unity.objects[i];assert.equal(u.id,o.id);assert.equal(u.assetId,o.assetId);assert.equal(u.xMeters,(o.x+o.w/2-project.width/2)/1000);assert.equal(u.yMeters,(project.height/2-o.y-o.h/2)/1000);assert.equal(u.widthMeters,o.w/1000);assert.equal(u.heightMeters,o.h/1000);assert(Math.abs(u.rotationZ+o.r)<1e-12);assert.equal(u.sortingOrder,i);assert.equal(u.flipX,o.flipX);assert.equal(u.opacity,o.opacity);assert.equal(u.blur,o.blur);assert.equal(u.blurBaked,false)});
 for(const a of project.assets){const u=unity.assets.find(u=>u.id===a.id);assert.equal(a.src,raw+a.id+'.png');assert.equal(u.frames[0],'PNG/'+path.basename(a.src));assert.equal(u.sha256,a.sha256);assert(fs.existsSync(path.join(source,path.basename(u.frames[0]))));assert(a.preview.startsWith('assets/set-review-v01/preview/'));}
 assert.equal(unity.background.image,'PNG/'+path.basename(project.background));assert(scene.unityLayoutLabel.includes('좌표 참고'));assert(unity.verification.note.includes('blur'));
}
assert.equal(count,136);assert.equal(flowerHashes.size,96,'each flower design/color is its own PNG');
const proof=read('source-count-hashes.json');assert.equal(proof.count,136);assert.equal(proof.files.length,136);assert(proof.legacyDocCopiesUnchanged);assert.equal(proof.totalSourceBytes,proof.files.reduce((n,f)=>n+f.bytes,0));assert(proof.totalPreviewBytes<proof.totalSourceBytes/10);for(const item of proof.files){assert.equal(item.src,raw+item.id+'.png');assert.equal(hash(path.join(source,item.id+'.png')),item.sha256)}
assert(manifest.generationRecords.length>=3);
function publicRecord(value){if(typeof value==='string')assert(!/^[A-Za-z]:[\\/]/.test(value),'no absolute PC paths in public records');else if(Array.isArray(value))value.forEach(publicRecord);else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value)){assert(!['path','localpath','outputpath'].includes(key.toLowerCase()));publicRecord(item)}}
for(const record of manifest.generationRecords){assert(record.src.startsWith('assets/set-review-v01/generation-records/'));publicRecord(JSON.parse(fs.readFileSync(path.join(web,record.src),'utf8')))}
assert(manifest.backgrounds.every(s=>s.flowers.every(a=>typeof a.generationPrompt==='string'&&a.generationPrompt.length>50)));
const corrected=manifest.backgrounds.find(s=>s.id==='morning');assert.equal(corrected.flowers.find(a=>a.design==='F05'&&a.color==='C01').designLabel,'가는 라벤더');assert.equal(corrected.flowers.find(a=>a.design==='F06'&&a.color==='C01').colorLabel,'블루 아이보리');
const python=spawnSync('python',['build_set_review.py','--check'],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',env:{...process.env,PYTHONUTF8:'1'}});assert.equal(python.status,0,python.stderr||python.stdout);
const alphaCheck=spawnSync('python',['-c',`from pathlib import Path;from tempfile import TemporaryDirectory;from PIL import Image;import build_set_review as b
with TemporaryDirectory() as d:
 p=Path(d)/'test.png';im=Image.new('RGBA',(64,64));im.paste((30,90,40,255),(10,10,54,54));im.save(p);assert b.inspect_png(p,True)['verification']['complete']
 im.putpixel((0,0),(10,10,10,7));im.save(p);assert b.inspect_png(p,True)['verification']['complete']
 im.putpixel((0,0),(10,10,10,8));im.save(p);assert not b.inspect_png(p,True)['verification']['complete']
 Image.new('RGB',(64,64),'green').save(p);assert not b.inspect_png(p,True)['verification']['complete']
 old_ref=b.REFERENCES;b.REFERENCES=Path(d)/'absent-original-reference-folder';b.prepare_sources();b.REFERENCES=old_ref
 old=b.OUT;b.OUT=Path(d);records=b.OUT/'generation-records';records.mkdir()
 b.write_json(records/'root-assets.json',[{'id':'BG04-F05-C01-V01','generationPrompt':'outdated'}]);b.write_json(records/'extra-master-prompts.json',[{'id':'BG04-F05-C01-V01','generationPrompt':'corrected'}]);assert b.generation_metadata()['BG04-F05-C01-V01']['generationPrompt']=='corrected';assert len(b.generation_records())==2;b.OUT=old
`],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',env:{...process.env,PYTHONUTF8:'1'}});assert.equal(alphaCheck.status,0,alphaCheck.stderr);
console.log('PASS: four versioned sets,96 unique complete flower PNGs,24 independent environment PNGs,16 reference/background PNGs,verified hashes/alpha margins,116-object immutable editor projects,matching Unity coordinates and explicit manual/runtime verification boundaries.');
