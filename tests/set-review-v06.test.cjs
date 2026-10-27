const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/assets/set-review-v01'),read=p=>JSON.parse(fs.readFileSync(path.join(out,p),'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),draft=process.argv.includes('--draft');
const manifest=read('manifest.json'),audit=read('asset-audit.json'),proof=read('source-count-hashes.json'),baseline=read('archive-v05/manifest.json'),frozenAudit=read('archive-v05/asset-audit.json'),frozenLayouts=read('archive-v05/layout-hashes.json');
const palettes={sunset:[['C04','C01'],['C04','C03'],['C03','C01'],['C04','C03'],['C01','C03'],['C03','C01']],day:[['C03','C01'],['C03','C02'],['C04','C02'],['C02','C03'],['C03','C04'],['C03','C04']],night:Array.from({length:6},()=>['C01','C02']),morning:[...Array.from({length:5},()=>['C01','C03']),['C04','C03']]};
assert.equal(manifest.assetVersion,'V05');assert.equal(manifest.colorHarmonyVersion,'V06');assert.equal(proof.preservation.sourceCount,276);assert.equal(proof.preservation.layoutCount,24);assert.equal(frozenLayouts.sourceCommit,'56e28342d332ab9a01e36441f6d51d959c44e0be');assert.equal(frozenLayouts.files.length,24);assert.equal(frozenAudit.files.length,276);
for(const a of frozenAudit.files){assert.equal(hash(path.join(root,'source-assets/set-review-v01',a.id+'.png')),a.sha256,'prior PNG unchanged');assert.deepEqual(a,audit.files.find(v=>v.id===a.id),'prior audit record unchanged');}
for(const item of frozenLayouts.files)assert.equal(hash(path.join(out,item.file)),item.sha256,'prior24 JSON bytes unchanged');
const captures=fs.existsSync(path.join(out,'generation-records/v06-assembly-captures.json'))?read('generation-records/v06-assembly-captures.json').exports:[];
function anchor(o,a){const box=a.verification.visibleBounds,localX=((box[0]+box[2])/2/a.width-.5)*o.w*(o.flipX?-1:1),localY=(box[3]/a.height-.5)*o.h,angle=o.r*Math.PI/180;return[o.x+o.w/2+localX*Math.cos(angle)-localY*Math.sin(angle),o.y+o.h/2+localX*Math.sin(angle)+localY*Math.cos(angle)];}
const visibleHeight=(o,a)=>o.h*(a.verification.visibleBounds[3]-a.verification.visibleBounds[1])/a.height;
let complete=0;
for(const scene of manifest.backgrounds){
 const previous=baseline.backgrounds.find(s=>s.id===scene.id),old=read(scene.id+'_editor_v05.json'),current=read(scene.id+'_editor_v06.json'),unity=read(scene.id+'_unity_v06.json'),assets=new Map([...scene.flowers,...scene.environment].map(a=>[a.id,a]));
 assert.equal(scene.project,'assets/set-review-v01/'+scene.id+'_editor_v06.json');assert.equal(scene.unityLayout,'assets/set-review-v01/'+scene.id+'_unity_v06.json');assert.equal(scene.projectVersion,'V06');assert.equal(scene.sourcePngVersion,'V05');assert.deepEqual(scene.flowers,previous.flowers);assert.deepEqual(scene.environment,previous.environment);assert.deepEqual(scene.backgrounds,previous.backgrounds);
 assert.deepEqual(scene.projectVersions.map(v=>v.version),['V06','V05','V04','V01']);assert.equal(scene.projectVersions[0].path,scene.project);assert.equal(scene.projectVersions[1].path,previous.project);assert.equal(scene.projectVersions[2].path,previous.previousProject);assert.equal(scene.projectVersions[3].path,previous.legacyProject);
 for(const v of scene.projectVersions){assert(fs.existsSync(path.join(root,'docs',v.path)));assert(fs.existsSync(path.join(root,'docs',v.unityLayout)));}
 assert.equal(current.setReviewVersion,'V06');assert.equal(current.sourcePngVersion,'V05');assert.equal(current.colorHarmonyVersion,'V06');assert.equal(current.flowerPalette.primaryShare,.75);assert.deepEqual(current.flowerPalette,scene.flowerPalette);assert.deepEqual(current.assets,old.assets);assert.equal(current.assets.length,30);assert.equal(current.objects.length,356);assert.deepEqual(current.sceneFilters,old.sceneFilters);assert.deepEqual(current.gardenSpace,old.gardenSpace);assert.equal(current.background,old.background);assert.equal(current.backgroundFit,old.backgroundFit);
 const flower=current.objects.filter(o=>assets.get(o.assetId).category==='flower'),env=current.objects.filter(o=>assets.get(o.assetId).category!=='flower');assert.equal(flower.length,320);assert.equal(env.length,36);assert.deepEqual(env,old.objects.filter(o=>assets.get(o.assetId).category!=='flower'));
 const prior=new Map(old.objects.map(o=>[o.id,o]));assert.deepEqual(current.objects.map(o=>o.id),old.objects.map(o=>o.id));
 for(const o of flower){const p=prior.get(o.id),a=assets.get(p.assetId),b=assets.get(o.assetId);assert.equal(a.design,b.design);assert.equal(a.theme,b.theme);assert.equal(o.assetId.split('-')[3],'V05');assert(Math.abs(visibleHeight(p,a)-visibleHeight(o,b))<1e-7);const before=anchor(p,a),after=anchor(o,b);assert(Math.max(...before.map((v,i)=>Math.abs(v-after[i])))<1e-7,'rotated/flipped alpha-foot anchor unchanged');assert(Math.abs(o.w/o.h-b.width/b.height)<1e-10);assert(Math.abs(o.baseW/o.w-p.baseW/p.w)<1e-10);assert(Math.abs(o.baseH/o.h-p.baseH/p.h)<1e-10);
  for(const key of Object.keys(p).filter(k=>!['assetId','name','x','y','w','h','baseW','baseH','aspect'].includes(k)))assert.deepEqual(o[key],p[key],key+' unchanged');
 }
 for(let i=0;i<6;i++){const design='F'+String(i+1).padStart(2,'0'),colors=palettes[scene.id][i],items=flower.filter(o=>assets.get(o.assetId).design===design);assert.deepEqual(scene.flowerPalette.designs[design],colors);assert.equal(items.length,i<2?56:52);assert.equal(items.filter(o=>assets.get(o.assetId).color===colors[0]).length,items.length*.75);assert.equal(items.filter(o=>assets.get(o.assetId).color===colors[1]).length,items.length*.25);assert.deepEqual([...new Set(items.map(o=>assets.get(o.assetId).color))].sort(),colors.slice().sort());
  const groups=Map.groupBy(items,o=>o.sourceObjectId);for(const siblings of groups.values()){assert.equal(siblings.length,4);assert.equal(siblings.filter(o=>assets.get(o.assetId).color===colors[0]).length,3);assert.equal(siblings.filter(o=>assets.get(o.assetId).color===colors[1]).length,1);}
 }
 assert.equal(new Set(flower.map(o=>o.assetId)).size,12);assert.equal(new Set(current.objects.map(o=>o.assetId)).size,18);
 assert.equal(unity.sourceProject,scene.id+'_editor_v06.json');assert.equal(unity.sourcePngVersion,'V05');assert.deepEqual(unity.sceneFilters,current.sceneFilters);assert.equal(unity.objects.length,356);assert.equal(unity.assets.length,30);assert.deepEqual(unity.flowerPalette,current.flowerPalette);assert.equal(unity.verification.runtime,'not_run');assert.equal(unity.verification.focusBlurBaked,false);
 current.objects.forEach((o,i)=>{const u=unity.objects[i];assert.equal(u.id,o.id);assert.equal(u.assetId,o.assetId);assert.equal(u.xMeters,(o.x+o.w/2-current.width/2)/1000);assert.equal(u.yMeters,(current.height/2-o.y-o.h/2)/1000);assert.equal(u.widthMeters,o.w/1000);assert.equal(u.heightMeters,o.h/1000);assert(u.rotationZ===-o.r);assert.equal(u.flipX,o.flipX);assert.equal(u.opacity,o.opacity);assert.equal(u.blur,o.blur);assert.equal(u.sortingOrder,i);});
 assert.deepEqual(scene.integrated.slice(0,5),previous.integrated);const assembled=scene.integrated.at(-1);assert.equal(assembled.id,scene.code+'-I06-V06');assert.equal(assembled.sourceProject,scene.project);
 if(assembled.src){complete++;const capture=captures.find(c=>c.id===assembled.id);assert(capture);assert.equal(assembled.construction,'same-png-layout-render');assert.equal(assembled.sourceProjectSha256,capture.projectSha256);assert.equal(assembled.captureProof,'assets/set-review-v01/generation-records/v06-assembly-captures.json');assert.equal(capture.imageSha256,hash(path.join(root,'source-assets/set-review-v01',assembled.id+'.png')));assert.equal(capture.sourceProject,scene.project);assert.equal(capture.sourcePngs[scene.backgrounds.at(-1).id],scene.backgrounds.at(-1).sha256);assert.equal(Object.keys(capture.sourcePngs).length,19);assert.equal(capture.usedElementIds.length,18);assert.equal(capture.renderedSourceCount,18);assert.deepEqual(capture.usedElementIds,[...new Set(current.objects.map(o=>o.assetId))].sort());}
 else{assert(draft,'formal build requires4 actual composites');assert.equal(assembled.status,'pending_capture');}
}
assert.equal(manifest.counts.totalPngs,276+complete);assert.equal(manifest.counts.integratedPngs,20+complete);assert.equal(manifest.counts.activePngs,156+complete);assert.equal(audit.technicalPassed,276+complete);if(!draft)assert.equal(complete,4);
const python=spawnSync('python',['-c',`import copy
import build_flower_palette_v06 as v,build_set_review as b
base,_,_=v.frozen_inputs()
for scene in base['backgrounds']:
 project=b.read_json(b.OUT/(scene['id']+'_editor_v05.json'));before=copy.deepcopy(project)
 assert v.palette_project(project,scene)==v.palette_project(project,scene)
 assert project==before
old_digest=b.digest
for filename in ['BG01-F01-C01-V05.png','sunset_editor_v05.json']:
 b.digest=lambda p:'0'*64 if p.name==filename else old_digest(p)
 try:v.frozen_inputs()
 except ValueError:pass
 else:raise AssertionError('must reject modified frozen file: '+filename)
 b.digest=old_digest
v.build(check=True,draft=${draft?'True':'False'})
`],{cwd:root,encoding:'utf8',env:{...process.env,PYTHONUTF8:'1'}});assert.equal(python.status,0,python.stderr||python.stdout);
console.log('PASS: V06 neighboring2colors75/25, exact320flowers+36environment, visible heights/alpha-foot anchors/rotation/focus, V05 pixel reuse and276PNG/24layout preservation, version links/Unity coordinates'+(draft?' (draft captures '+complete+'/4)':' and4verified actual composite captures'));
