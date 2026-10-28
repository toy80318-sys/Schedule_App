const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),L=require('../docs/reference-layout'),M=require('../docs/separated-motion');
const repo=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(repo,'docs',p))),release=read('assets/current-release-v86/manifest.json'),loops=read('assets/separated-loops-v88/manifest.json'),web=path.join(repo,'docs/assets/reference-layout-v93'),local=path.resolve(repo,'../20261028_메이즈랜드_원본소스/통합본기준배치_v93');
for(const dir of [web,local])fs.mkdirSync(dir,{recursive:true});
const manifest={version:93,date:'2026-10-28',coordinateSystem:'top-left, normalized canvas coordinates; root pivots remain in the complete sprites',unityRuntimeVerified:false,scenes:[]};
for(const [i,scene] of release.scenes.entries()){
 const original=read(scene.project),p=M.project(L.project(original,scene.id),loops,false,release.assets.filter(a=>a.category==='particle')),file=scene.id+'_editor_v93.json',text=JSON.stringify(p,null,2)+'\n',rows=['ObjectID,AssetID,BackgroundID,LightingID,X_normalized,Y_normalized,Width_normalized,Height_normalized,Rotation,Opacity'];
 for(const o of p.objects){const a=p.assets.find(a=>a.id===o.assetId);rows.push([o.id,o.assetId,a.backgroundId||'BG0'+(i+1),a.lightingId||'LT0'+(i+1),o.x/p.width,o.y/p.height,o.w/p.width,o.h/p.height,o.r,o.opacity].join(','))}
 for(const dir of [web,local]){fs.writeFileSync(path.join(dir,file),text);fs.writeFileSync(path.join(dir,scene.id+'_Unity_layout_v93.csv'),'\ufeff'+rows.join('\n'))}
 manifest.scenes.push({id:scene.id,project:file,sha256:crypto.createHash('sha256').update(text).digest('hex'),objectCount:p.objects.length,flowers:320,reference:scene.integrated.src,sourceProject:scene.project,sourceProjectSHA256:scene.projectSha256});
}
for(const dir of [web,local])fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Exported4 matching editor projects and normalized Unity layout tables; saved user projects and original v86 files remain untouched.');
