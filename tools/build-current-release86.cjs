const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const docs=path.resolve(__dirname,'../docs'),read=p=>JSON.parse(fs.readFileSync(path.join(docs,p),'utf8')),dir=path.join(docs,'assets/current-release-v86');fs.mkdirSync(dir,{recursive:true});
const write=(p,v)=>fs.writeFileSync(path.join(docs,p),JSON.stringify(v,null,2)+'\n'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(docs,p),'utf8').replace(/\r\n/g,'\n')).digest('hex');
const release=read('assets/current-release-v85/manifest.json'),review=read('assets/current-release-v85/set-review.json');
release.version=86;release.assets=release.assets.filter(a=>a.category!=='bird').map(a=>({...a,releaseVersion:86}));release.counts.bird=0;release.note='Current abstract oil collection only. Earlier bird designs and historical sources remain archived; user layouts are not migrated.';
const active=new Set(release.assets.map(a=>a.id));
for(const scene of release.scenes){
 const project=read(scene.project),unity=read(scene.unityLayout);scene.assetIds=scene.assetIds.filter(id=>active.has(id));
 project.currentReleaseVersion=86;project.name=project.name.replace('v85','v86');project.setReviewVersion='V86';
 scene.project='assets/current-release-v86/'+scene.id+'_editor_v86.json';write(scene.project,project);scene.projectSha256=hash(scene.project);
 unity.name=project.name;unity.setReviewVersion='V86';unity.sourceProject=scene.project;unity.sourceProjectSha256=scene.projectSha256;scene.unityLayout='assets/current-release-v86/'+scene.id+'_unity_v86.json';write(scene.unityLayout,unity);
 const set=review.backgrounds.find(s=>s.id===scene.id);set.environment=set.environment.filter(a=>active.has(a.id));set.project=scene.project;set.unityLayout=scene.unityLayout;set.projectVersion='V86';set.projectLabel='최신 유화 소스 예시 배치';set.projectVersions=[{...set.projectVersions[0],path:scene.project,unityLayout:scene.unityLayout,version:'V86',label:'최신 유화 소스 배치'},...set.projectVersions.map(a=>({...a,id:'archive-'+a.id,label:'보관 · '+a.label}))];
}
review.assetVersion='v86';review.colorHarmonyVersion='v86';write('assets/current-release-v86/manifest.json',release);write('assets/current-release-v86/set-review.json',review);fs.writeFileSync(path.join(docs,'current-release.js'),'window.jejuCurrentRelease='+JSON.stringify(release)+';\n');
if(release.assets.length!==80||release.scenes.length!==4)throw Error('Current collection count differs');console.log('Built4 current gardens,80 oil PNG sources and4 preserved-layout examples; v85 remains unchanged.');
