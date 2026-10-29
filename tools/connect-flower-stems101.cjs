// Generate the current runtime registry from the reviewed source manifest.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const w={jejuFinalCatalog:{assets:[]}};
vm.runInNewContext(fs.readFileSync('docs/scene-flower-catalog.js','utf8'),{window:w});
const manifest=JSON.parse(fs.readFileSync('docs/assets/flower-stems-v101/manifest.json'));
const items=manifest.items.map(m=>{
 const previous=w.jejuSceneFlowerCatalog.assets.find(a=>a.id===m.id),o=m.opening,b=m.images.bloom;
 assert.equal(previous.sha256,m.sourceBloomSHA256);assert.equal(o.status,'passed');assert.equal(o.fivePassQA.passes,5);
 const asset={...previous,src:b.original,sha256:b.sha256,file:b.file,width:m.width,height:m.height,alphaBounds:b.alphaBounds,preview:b.preview,thumb:b.preview,ready:true,stemAssetVersion:101,openingAssetId:m.id,petalSourcePNG:previous.src,petalSourceSHA256:previous.sha256,budSourcePNG:m.images.bud.original,budSourceSHA256:m.images.bud.sha256,route:undefined,frames:undefined,loopInPlace:false,bloomVariant:undefined,flowerAnimation:false};
 const legacyName=({'BG02-marigold-scene-a-v83':'F05_Calendula_GoldYellow_A','BG02-marigold-scene-b-v83':'F06_Calendula_GoldYellow_B','BG02-canola-scene-a-v83':'F07_Rapeseed_LemonYellow_A','BG02-canola-scene-b-v83':'F08_Rapeseed_Yellow_B'})[m.id];
 const legacyStyleSources=legacyName?[`https://toy80318-sys.github.io/Schedule_App/assets/abstract-flowers-v43/ML_BG02_LT02_${legacyName}_Bloom_AbstractOil3x_v43.png`]:[];
 return{id:m.id,theme:m.theme,species:m.species,backgroundId:m.backgroundId,lightingId:m.lightingId,sourcePNG:b.original,sourceSHA256:b.sha256,legacySourcePNG:previous.src,legacySourceSHA256:previous.sha256,legacyStyleSources,asset,status:'passed',route:'GENERATED_IMAGE_PAIR_TO_VIDEO',jobId:o.jobId,fps:o.fps,duration:o.duration,previewWidth:o.previewWidth,previewHeight:o.previewHeight,transparent:true,frames:Array.from({length:48},(_,i)=>o.framePattern.replace('%04d',String(i).padStart(4,'0'))),bud:o.framePattern.replace('%04d','0000'),open:o.framePattern.replace('%04d','0047'),atlas:{src:o.atlas,columns:8,rows:6,width:1536,height:1728,sha256:o.atlasSHA256},inputs:o.actualInputs.map(i=>({role:i.role,generatedImage:true,mediaId:i.media_id,sha256:i.sha256,sourceSHA256:i.sourceSHA256})),review:{alpha:true,naturalOpening:true,fullyOpenBySeconds:o.fullyOpenBySeconds,fivePassQA:o.fivePassQA},matteRevision:o.matteRevision};
});
const data={format:'jeju-flower-openings-v101',version:101,items};require('../docs/flower-opening').validate(data);
fs.writeFileSync('docs/flower-stems101-catalog.js','window.jejuFlowerOpeningData='+JSON.stringify(data)+';\n'+`for(const v of window.jejuFlowerOpeningData.items){for(const a of window.jejuFinalCatalog?.assets||[])if(a.id===v.id)Object.assign(a,v.asset);for(const a of window.jejuSceneFlowerCatalog?.assets||[])if(a.id===v.id)Object.assign(a,v.asset);}\n`);
console.log('PASS: connected 48 reviewed long-stem flower image pairs and 2-second alpha sequences');
