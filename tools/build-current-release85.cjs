const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),docs=path.join(root,'docs'),dir=path.join(docs,'assets/current-release-v85');fs.mkdirSync(dir,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(path.join(docs,p),'utf8')),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const c={window:{},URL};for(const f of ['catalog-data','whole62-data','set-review-catalog','set-review-elements'])vm.runInNewContext(fs.readFileSync(path.join(docs,f+'.js'),'utf8'),c);
const flowers=read('assets/scene-flowers-v83/manifest.json'),integrated=read('assets/integrated-small-flowers-v84/manifest.json'),atmosphere=read('assets/atmosphere-v85/manifest.json');
const retained=c.window.jejuSetReviewElements.assets.filter(a=>['grass','tree','basalt','leaf'].includes(a.category));
const birds=c.window.jejuWhole62.assets.filter(a=>a.category==='bird');
const assets=[...c.window.jejuFinalCatalog.backgrounds,...flowers.assets,...retained,...atmosphere.assets,...birds].map(a=>({...JSON.parse(JSON.stringify(a)),releaseVersion:85}));
assert.equal(assets.length,88);assert.equal(new Set(assets.map(a=>a.id)).size,88);
for(const a of assets){
 let local=a.src.includes('/source-assets/')?a.src.split('/source-assets/')[1]:'whole-objects-v59/'+a.file;
 const bytes=fs.readFileSync(path.join(root,'source-assets',local));assert.equal(hash(bytes),a.sha256,a.id);assert.equal(bytes.readUInt32BE(16),a.width,a.id);assert.equal(bytes.readUInt32BE(20),a.height,a.id);
 a.sourceVersion=a.artStyleVersion?'v'+a.artStyleVersion:a.atmosphereVersion?'v'+a.atmosphereVersion:a.setReviewVersion||a.file.match(/_v\d+/)?.[0]?.slice(1)||'기존 최신';
}
const previous=read('assets/set-review-v01/manifest.json'),review=structuredClone(previous);review.assetVersion='v85';review.colorHarmonyVersion='v85';review.date='2026-10-28';
const labels={sunset:'노을 · 코랄',day:'낮 · 골드',night:'달빛 · 라일락',morning:'아침 · 스카이블루'};
const scenes=[];
for(const old of previous.backgrounds){
 const theme=old.id,master=integrated.scenes.find(a=>a.theme===theme),background=assets.find(a=>a.category==='background'&&a.theme===theme);
 const own=assets.filter(a=>a.theme===theme||a.compatibleThemes?.includes(theme)),plants=own.filter(a=>a.category==='flower');
 const project=read(old.project),original=structuredClone(project),oldAssets=new Map(project.assets.map(a=>[a.id,a]));
 project.name=labels[theme]+' · 최신 소스 v85 배치';project.currentReleaseVersion=85;project.background=background.src;project.backgroundDefaultVersion=83;project.reference=null;project.setReviewVersion='V85';project.sourcePngVersion='mixed-v85';project.colorHarmonyVersion='V85';
 for(const [index,o] of project.objects.entries()){
  const before=oldAssets.get(o.assetId);let next;
  if(before.category==='flower'){
   const design=Number(before.id.match(/-F(\d+)/)?.[1]||1),group='F'+String(design%2?design:design-1).padStart(2,'0');
   const candidates=plants.filter(a=>a.design===group);next=(candidates.length?candidates:plants)[index%(candidates.length||plants.length)];
  }else if(['cloud','butterfly'].includes(before.category)){
   const candidates=own.filter(a=>a.category===before.category&&a.atmosphereVersion===85);next=candidates[index%candidates.length];
  }else next=own.find(a=>a.id===before.id)||own.find(a=>a.category===before.category);
  assert(next,'Missing source for '+before.id);o.assetId=next.id;o.name=next.name;
  const ratio=next.frames?.length?next.loopWidth/next.loopHeight:next.width/next.height;if(Math.abs(o.w/o.h-ratio)>.001){const cy=o.y+o.h/2;o.h=o.w/ratio;o.y=cy-o.h/2;o.baseH=o.h;o.aspect=ratio;}
  if(next.lightingBaked)o.flipX=false;
 }
 const used=new Set(project.objects.map(o=>o.assetId));project.assets=own.filter(a=>used.has(a.id));
 assert.equal(project.objects.length,356);assert.equal(project.objects.filter(o=>plants.some(a=>a.id===o.assetId)).length,320);
 const projectPath='assets/current-release-v85/'+theme+'_editor_v85.json',projectFile=path.join(docs,projectPath);write(projectFile,project);
 const projectSha256=hash(fs.readFileSync(projectFile));
 const unity={format:'jeju-unity-v1',version:1,name:project.name,units:'meters',widthMm:project.width,heightMm:project.height,sourceProject:projectPath,sourceProjectSha256:projectSha256,sceneFilters:project.sceneFilters,gardenSpace:project.gardenSpace,background:{image:'PNG/'+background.file,fit:'fill'},assets:project.assets.map(a=>({id:a.id,name:a.name,kind:a.frames?.length?'sequence':'sprite',frames:a.frames||['PNG/'+a.file],fps:a.fps||30,widthPixels:a.width,heightPixels:a.height,sourceAssetId:a.id,sha256:a.sha256})),objects:project.objects.map((o,i)=>({id:o.id,assetId:o.assetId,name:o.name,xMeters:(o.x+o.w/2-project.width/2)/1000,yMeters:(project.height/2-o.y-o.h/2)/1000,widthMeters:o.w/1000,heightMeters:o.h/1000,rotationZ:-o.r,sortingOrder:i,flipX:!!o.flipX,opacity:o.opacity,blur:o.blur||0,blurBaked:false,editorXmm:o.x,editorYmm:o.y})),verification:{runtimeVerified:false,note:'Unity coordinates follow the existing jeju-unity-v1 convention; actual Unity runtime remains unverified.'},setReviewVersion:'V85',sourcePngVersion:'mixed-v85'};
 const unityPath='assets/current-release-v85/'+theme+'_unity_v85.json';write(path.join(docs,unityPath),unity);
 const reference={...master,id:old.code+'-Integrated-v84',version:'v84',preview:master.src,construction:'generated-integrated-reference'};
 const set=review.backgrounds.find(b=>b.id===theme);set.integrated=[reference];set.backgrounds=[{...background,version:background.sourceVersion}];set.flowers=plants.map(a=>({...a,version:a.sourceVersion,designLabel:({camellia:'동백',marigold:'금잔화',buckwheat:'메밀꽃',canola:'유채꽃',hydrangea:'수국',lavender:'라벤더'})[a.species]}));set.flowerDesigns=[...new Set(plants.map(a=>a.design))].sort();set.environment=own.filter(a=>!['flower','background'].includes(a.category)).map(a=>({...a,version:a.sourceVersion}));
 set.project=projectPath;set.unityLayout=unityPath;set.projectVersion='V85';set.sourcePngVersion='mixed-v85';set.projectLabel='최신 꽃·구름·나비 v85 배치';set.projectVersions=[{id:'current',path:projectPath,unityLayout:unityPath,version:'V85',label:'최신 소스 v85 배치'},...old.projectVersions.map(a=>({...a,id:'old-'+a.id,label:'올드 · '+a.label}))];
 scenes.push({id:theme,name:labels[theme],backgroundId:master.backgroundId,lightingId:master.lightingId,integrated:reference,background,assetIds:own.map(a=>a.id),flowers:[...new Set(plants.map(a=>a.name.split(' · ')[1]))],project:projectPath,projectSha256,unityLayout:unityPath,objectCount:project.objects.length});
 assert.deepEqual(project.objects.map(o=>[o.id,o.x,o.w,o.r,o.opacity,o.blur]),original.objects.map(o=>[o.id,o.x,o.w,o.r,o.opacity,o.blur]),'Existing example positions and widths stay stable');
}
const release={format:'jeju-current-release-v1',version:85,date:'2026-10-28',scenes,assets,counts:{integrated:4,background:4,flower:48,environment:16,atmosphere:12,bird:8},note:'Latest available sources by category. Integrated v84 paintings are references, not identical PNG-layout composites. Earlier sources and user layouts are preserved.'};
write(path.join(dir,'manifest.json'),release);write(path.join(dir,'set-review.json'),review);fs.writeFileSync(path.join(docs,'current-release.js'),'window.jejuCurrentRelease='+JSON.stringify(release)+';\n');
console.log('Built current release v85: 4 integrated,88 PNG sources,4 updated356-object samples; original manifests untouched.');
