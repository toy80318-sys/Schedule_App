const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),web=path.join(root,'docs'),out=path.join(web,'assets/set-review-v01'),read=p=>JSON.parse(fs.readFileSync(path.join(out,['manifest.json','asset-audit.json','source-count-hashes.json'].includes(p)?'archive-v05':'',p),'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=read('manifest.json'),audit=read('asset-audit.json'),proof=read('source-count-hashes.json');
assert.equal(manifest.assetVersion,'V05');assert.equal(manifest.counts.totalPngs,276);assert.equal(manifest.counts.activePngs,156);assert.equal(audit.technicalPassed,276);assert.equal(proof.preservation.sourceCount,148);assert.equal(proof.preservation.layoutCount,16);
for(const item of proof.files)assert.equal(hash(path.join(root,'source-assets/set-review-v01',item.id+'.png')),item.sha256);
for(const item of proof.preservation.layouts)assert.equal(hash(path.join(out,item.file)),item.sha256,'prior16 layouts retained byte-for-byte');
for(const scene of manifest.backgrounds){
 assert.equal(scene.flowers.length,24);assert.equal(scene.environment.length,6);assert.equal(scene.backgrounds.length,4);assert.equal(scene.integrated.length,5);
 for(const a of [...scene.flowers,...scene.environment]){assert(a.id.endsWith('-V05'));assert(a.verification.alpha&&a.verification.borderClear&&a.verification.complete);assert(a.verification.transparentMarginsPx.every(n=>n>=8));assert(a.generationPrompt.length>50);}
 const target=scene.integrated.at(-1);assert.equal(target.construction,'same-png-layout-render');assert.equal(target.renderWidth,4096);assert.equal(target.sourceProject,scene.project);assert.equal(target.sourceProjectSha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(web,scene.project),'utf8').replace(/\r\n/g,'\n')).digest('hex'));
 const current=JSON.parse(fs.readFileSync(path.join(web,scene.project),'utf8')),previous=JSON.parse(fs.readFileSync(path.join(web,scene.previousProject),'utf8'));
 assert.equal(current.objects.length,356);assert.equal(current.setReviewVersion,'V05');assert(current.styleOnlyRevision);assert.equal(current.assets.length,30);assert.equal(current.background,scene.backgrounds.at(-1).src);
 assert.equal(current.objects.filter(o=>o.assetId.includes('-F')).length,320);assert.equal(current.objects.filter(o=>o.assetId.includes('-E')).length,36);
 const old=new Map(previous.objects.map(o=>[o.id,o]));for(const o of current.objects){const a=old.get(o.id);assert(a);assert.equal(o.assetId,a.assetId.replace('-V01','-V05'));for(const key of ['r','blur','opacity','flipX'])assert.equal(o[key],a[key]);}
 const unity=JSON.parse(fs.readFileSync(path.join(web,scene.unityLayout),'utf8'));assert.equal(unity.sourceProject,path.basename(scene.project));assert.equal(unity.objects.length,356);assert.equal(unity.verification.runtime,'not_run');assert.equal(unity.verification.focusBlurBaked,false);
 current.objects.forEach((o,i)=>{assert.equal(unity.objects[i].widthMeters,o.w/1000);assert.equal(unity.objects[i].yMeters,(current.height/2-o.y-o.h/2)/1000)});
}
const python=spawnSync('python',['-c',`import build_abstract_v05 as v, build_set_review as b
for scene in b.read_json(b.OUT/'archive-v05/manifest.json')['backgrounds']:
 old_scene=next(s for s in b.read_json(v.ARCHIVE/'manifest.json')['backgrounds'] if s['id']==scene['id'])
 old_assets={a['id']:a for a in old_scene['flowers']+old_scene['environment']};new_assets={a['id']:a for a in scene['flowers']+scene['environment']}
 old={o['id']:o for o in b.read_json(b.OUT/(scene['id']+'_editor_v04.json'))['objects']}
 for o in b.read_json(b.OUT/(scene['id']+'_editor_v05.json'))['objects']:
  a=old[o['id']];source=old_assets[a['assetId']];target=new_assets[o['assetId']]
  assert max(abs(x-y) for x,y in zip(v.anchor(a,source),v.anchor(o,target)))<1e-7
  assert abs(o['w']/o['h']-target['width']/target['height'])<1e-9
  for size,dim,i,j in [('h','height',1,3)]:
   x=source['verification']['visibleBounds'];y=target['verification']['visibleBounds']
   assert abs(a[size]*(x[j]-x[i])/source[dim]-o[size]*(y[j]-y[i])/target[dim])<1e-7
v.build(check=True)
scene=b.read_json(b.OUT/'archive-v05/manifest.json')['backgrounds'][0];aid=scene['integrated'][-1]['id'];info=b.inspect_png(b.PNG/(aid+'.png'),False)
capture=next(a for a in b.read_json(b.OUT/'generation-records/v05-assembly-captures.json')['exports'] if a['id']==aid)
sources={a['id']:a['sha256'] for a in scene['flowers']+scene['environment']+[scene['backgrounds'][-1]]};project=b.WEB/scene['project']
for key in ['imageSha256','projectSha256','rendererSha256','rendererDependencies','renderComplete','sourcePngs']:
 bad=dict(capture);bad[key]=None
 try:v.verify_capture(bad,info,project,sources)
 except ValueError:pass
 else:raise AssertionError('must reject mismatched capture '+key)
old_digest=b.digest
b.digest=lambda p:'0'*64 if p.name=='sunset_editor_v04.json' else old_digest(p)
try:v.build(check=True)
except ValueError as error:assert 'Frozen V04 layout changed' in str(error)
else:raise AssertionError('must reject modified V04 rather than recertify it')
finally:b.digest=old_digest
`],{cwd:root,encoding:'utf8',env:{...process.env,PYTHONUTF8:'1'}});assert.equal(python.status,0,python.stderr||python.stdout);
console.log('PASS: V05 independent PNGs, unchanged visible sizes/root anchors and356placements, prior148sources/16layouts, same-PNG composite provenance, Unity reference coordinates.');
