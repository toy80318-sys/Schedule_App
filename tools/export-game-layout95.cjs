const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),L=require('../docs/reference-layout'),M=require('../docs/separated-motion'),E=require('../docs/element-loops95'),F=require('../docs/flower-opening'),B=require('../docs/butterfly-loops98');
const read=p=>JSON.parse(fs.readFileSync('docs/'+p)),release=read('assets/current-release-v86/manifest.json'),old=read('assets/separated-loops-v88/manifest.json'),elements=read('assets/element-loops-v95/manifest.json'),flowers=read('assets/flower-openings-v89/manifest.json'),butterflies=read('assets/butterfly-wingbeats-v98/manifest.json'),web98='docs/assets/game-layout-v98',web='docs/assets/game-layout-v95',local=path.resolve('../20261028_메이즈랜드_원본소스/게임배치_v95');
for(const dir of [web,local,web98])fs.mkdirSync(dir,{recursive:true});
const manifest={version:95,date:'2026-10-28',passedFlowerTypes:flowers.reviewPassed,rejectedFlowerTypes:flowers.reviewRejected,unityRuntimeVerified:false,scenes:[]};
for(const [i,s]of release.scenes.entries()){
 const original=read(s.project),p=F.project(E.project(M.project(L.project(original,s.id),old,false,release.assets.filter(a=>a.category==='particle')),elements),flowers),name=s.id+'_editor_v95.json',text=JSON.stringify(p,null,2)+'\n';
 const csv=['ObjectID,AssetID,OriginalOpeningAssetID,BackgroundID,LightingID,X_normalized,Y_normalized,Width_normalized,Height_normalized,Rotation,Opacity'];
 for(const o of p.objects){const a=p.assets.find(a=>a.id===o.assetId);csv.push([o.id,o.assetId,o.originalOpeningAssetId||'',a.backgroundId||'BG0'+(i+1),a.lightingId||'LT0'+(i+1),o.x/p.width,o.y/p.height,o.w/p.width,o.h/p.height,o.r,o.opacity].join(','))}
 for(const dir of [web,local]){fs.writeFileSync(path.join(dir,name),text);fs.writeFileSync(path.join(dir,s.id+'_Unity_layout_v95.csv'),'\ufeff'+csv.join('\n'))}
 fs.writeFileSync(path.join(web98,s.id+'_editor_v98.json'),JSON.stringify({...p,assets:p.assets.map(a=>B.asset(a,butterflies))},null,2)+'\n');
 manifest.scenes.push({id:s.id,project:name,sha256:crypto.createHash('sha256').update(text).digest('hex'),objects:p.objects.length,preview:p.reviewedOpeningPreview});
}
for(const dir of [web,local])fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Exported4 static-environment layouts and4 matching native-butterfly layouts;source geometry and user saves preserved.');
