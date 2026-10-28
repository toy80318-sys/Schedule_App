((root)=>{'use strict';
 function validate(project,scene,release,renderer){
  renderer.validate(project);const sources=new Map(release.assets.map(a=>[a.id,a]));
  if(project.currentReleaseVersion!==release.version||project.width!==14165||project.height!==3480||project.background!==scene.background.src||project.objects.length!==scene.objectCount)throw Error('최신 배치의 배경·크기·요소 구성이 다릅니다.');
  for(const a of project.assets){const expected=sources.get(a.id);if(!expected||a.src!==expected.src||a.sha256!==expected.sha256||a.width!==expected.width||a.height!==expected.height||a.sourceRect!==undefined||!a.completeObject||a.stillOnly!==expected.stillOnly||JSON.stringify(a.frames||[])!==JSON.stringify(expected.frames||[])||JSON.stringify(a.previewFrames||[])!==JSON.stringify(expected.previewFrames||[])||a.loopVideo!==expected.loopVideo||!a.transparent||!(a.theme===scene.id||a.compatibleThemes?.includes(scene.id)))throw Error('최신 배치의 독립 PNG 정보가 다릅니다.');}
  return project;
 }
 async function load(theme,release,fetcher,renderer,cryptoAPI,image){
  const scene=release.scenes.find(s=>s.id===theme);if(!scene||scene.project!=='assets/current-release-v'+release.version+'/'+theme+'_editor_v'+release.version+'.json')throw Error('배경 시간대를 확인해 주세요.');
  const response=await fetcher(scene.project);if(!response.ok)throw Error('최신 배치를 불러오지 못했습니다.');const text=await response.text();if(text.length>12*1024*1024)throw Error('배치 파일이 너무 큽니다.');
  const hash=Array.from(new Uint8Array(await cryptoAPI.subtle.digest('SHA-256',new TextEncoder().encode(text.replace(/\r\n/g,'\n')))),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==scene.projectSha256)throw Error('최신 배치의 원본 서명이 다릅니다.');
  const project=validate(JSON.parse(text),scene,release,renderer);await Promise.all([project.background,...project.assets.map(a=>a.src)].map(image));return project;
 }
 function prepare(project,theme,release,useVideo=false){
  const layout=root.jejuReferenceLayout?root.jejuReferenceLayout.project(project,theme):project;
  let next=root.jejuSeparatedLoops?root.jejuSeparatedMotion.project(layout,root.jejuSeparatedLoops,useVideo,release.assets.filter(a=>a.category==='particle')):layout;
  if(root.jejuElementLoopData)next=root.jejuElementLoops.project(next,root.jejuElementLoopData);
  if(root.jejuFlowerOpeningData)next=root.jejuFlowerOpening.project(next,root.jejuFlowerOpeningData);
  if(root.jejuAmbient)next=root.jejuAmbient.cleanProject(next);if(root.jejuRestoredBushes)next=root.jejuRestoredBushes.project(next);return root.jejuForegroundGrass?root.jejuForegroundGrass.project(next):next;
 }
 const api={validate,load,prepare};if(typeof module==='object'&&module.exports){module.exports=api;return}root.jejuCurrentProjects=api;
})(typeof window==='object'?window:globalThis);
