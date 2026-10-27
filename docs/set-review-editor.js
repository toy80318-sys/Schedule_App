(function(root){
  'use strict';
  const E=root.jejuEditor,registry=root.jejuSetReviewElements,$=id=>document.getElementById(id);
  if(!E||!registry||!$('setReviewLoadScene'))return;
  const themes=['sunset','day','night','morning'],hashPattern=/^[a-f0-9]{64}$/;
  const themeInput=$('setReviewPaletteTheme'),loadButton=$('setReviewLoadScene'),status=$('setReviewEditorStatus');
  let manifest,busy=false;
  const fail=error=>{const message=error?.message||String(error);status.textContent='불러오기를 중단했습니다: '+message;E.notice(message);};
  async function sha256(text){
    const bytes=new TextEncoder().encode(text.replace(/\r\n/g,'\n'));
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
  }
  async function readText(path){const response=await fetch(path);if(!response.ok)throw Error('파일을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');return response.text();}
  function reference(scene){return scene.integrated?.slice().reverse().find(a=>a.sourceProject===scene.project&&a.construction==='same-png-layout-render');}
  function background(scene){return scene.backgrounds?.find(a=>a.id===scene.code+'-B04-V05');}
  function validateManifest(value){
    if(value?.format!=='jeju-set-review-v1'||value.assetVersion!=='V05'||!Array.isArray(value.backgrounds)||value.backgrounds.length!==4||!Array.isArray(registry.assets)||registry.assets.length!==120||new Set(registry.assets.map(a=>a.id)).size!==120)throw Error('V05 요소 목록 형식이 맞지 않습니다.');
    const seen=new Set();
    for(const scene of value.backgrounds){
      const index=themes.indexOf(scene.id),ref=reference(scene),bg=background(scene);
      if(index<0||seen.has(scene.id)||scene.code!=='BG0'+(index+1)||!['V05','V06'].includes(scene.projectVersion)||scene.project!==`assets/set-review-v01/${scene.id}_editor_${scene.projectVersion.toLowerCase()}.json`||ref?.version!==scene.projectVersion||!hashPattern.test(ref?.sourceProjectSha256||'')||!bg?.src||!Array.isArray(scene.flowers)||scene.flowers.length!==24||!Array.isArray(scene.environment)||scene.environment.length!==6)throw Error('통합본과 V05 원본 PNG 배치 파일 연결이 올바르지 않습니다.');
      seen.add(scene.id);
    }
    return value;
  }
  function validateProject(project,scene){
    root.JejuSetRenderer.validate(project);
    if(!scene||project.format!=='jeju-maze-wall-v1'||project.width!==E.W||project.height!==E.H||project.setReviewVersion!==scene.projectVersion||project.sourcePngVersion!=='V05'||project.assets.length!==30||project.objects.length!==356||project.background!==background(scene)?.src||project.backgroundFit!=='fill')throw Error('선택한 통합본의 배치 파일 또는 V05 원본 PNG와 다릅니다.');
    const expected=new Map([...scene.flowers,...scene.environment].map(a=>[a.id,a])),registered=new Map(registry.assets.map(a=>[a.id,a]));
    if(expected.size!==30)throw Error('V05 요소 번호가 중복되었습니다.');
    for(const asset of project.assets){
      const source=expected.get(asset.id),catalog=registered.get(asset.id);
      if(!source||!catalog||asset.theme!==scene.id||catalog.theme!==scene.id||asset.src!==source.src||asset.src!==catalog.src||!hashPattern.test(asset.sha256||'')||asset.sha256!==source.sha256||asset.sha256!==catalog.sha256||asset.sourceRect!==undefined||!asset.completeObject||!asset.stillOnly||!asset.lightingBaked||asset.group!==catalog.group||asset.category!==catalog.category)throw Error('V05 독립 PNG의 번호·원본·색감 정보가 맞지 않습니다.');
    }
    const flowerIds=new Set(project.assets.filter(a=>a.group==='flowers').map(a=>a.id));
    if(project.objects.filter(o=>flowerIds.has(o.assetId)).length!==320)throw Error('V05 꽃 개수가 통합본과 다릅니다.');
    return project;
  }
  function updatePreview(){
    if(!manifest)return;
    const scene=manifest.backgrounds.find(s=>s.id===themeInput.value);if(!scene)return;
    const ref=reference(scene),image=$('setReviewMaster');image.src=ref.preview||ref.src;image.alt=scene.label+' · '+scene.projectVersion+' 배치 · V05 원본 PNG 통합본';
    $('setReviewCompare').href='set-review.html?v=79#'+scene.id+'/integrated';
    loadButton.textContent=scene.projectVersion==='V06'?'유사색 V06 배치 불러오기':'V05 통합 배치 불러오기';
    if(!busy)status.textContent=scene.label+' · '+(scene.projectVersion==='V06'?'유사색 V06 배치 · V05 원본 PNG. 시간대별 12종 유사색을 중심으로 꽃 320개 배치, 전체 24종 원본 유지.':'V05 원본 PNG 30종 · 꽃 320개와 환경 36개. ')+(scene.flowerPalette?.name?' '+scene.flowerPalette.name+'. ':' ')+'테마 선택은 현재 배치를 바꾸지 않습니다.';
  }
  async function openScene(theme=themeInput.value){
    if(busy)return false;
    busy=true;loadButton.disabled=true;themeInput.disabled=true;
    try{
      await ready;
      const scene=manifest.backgrounds.find(s=>s.id===theme);if(!scene)throw Error('불러올 테마를 선택해 주세요.');
      status.textContent=scene.label+' · 통합본과 같은 배치와 원본 PNG를 확인하는 중…';
      const text=await readText(scene.project+'?v=79');
      if(await sha256(text)!==reference(scene).sourceProjectSha256)throw Error('배치 파일이 통합본 제작 당시와 다릅니다. 새로고침 후 다시 시도해 주세요.');
      const project=validateProject(JSON.parse(text),scene);
      await Promise.all([project.background,...project.assets.map(a=>a.src)].map(src=>E.image(src)));
      status.textContent=scene.label+' · 이전 작업을 백업하고 '+scene.projectVersion+' 배치를 여는 중…';
      await E.useSample(structuredClone(project));
      status.textContent=scene.label+' · '+(scene.projectVersion==='V06'?'유사색 V06 배치 · V05 원본 PNG':'V05 통합 배치')+' · 통합본과 같은 356개 요소를 열었습니다. 이전 작업은 이름 있는 저장본에 보관됩니다.';
      E.notice(scene.projectVersion+' '+scene.label+' 배치를 열었습니다. V05 원본 PNG와 저장된 크기·좌표·초점을 유지했습니다.');
      return true;
    }finally{busy=false;themeInput.disabled=false;loadButton.disabled=!manifest;}
  }
  async function initialize(){
    loadButton.disabled=true;
    const requested=new URL(location.href).searchParams.get('setV05');
    if(themes.includes(requested)){themeInput.value=requested;$('setReviewPaletteTab')?.click();}
    const text=await readText('assets/set-review-v01/manifest.json?v=79');
    if(!hashPattern.test(registry.manifestSha256||'')||await sha256(text)!==registry.manifestSha256)throw Error('요소 목록과 현재 에디터 버전이 다릅니다. 새로고침 후 다시 시도해 주세요.');
    const value=validateManifest(JSON.parse(text));
    await E.ready;await root.jejuHandoff?.ready;
    manifest=value;updatePreview();loadButton.disabled=busy;
    return value;
  }
  themeInput.addEventListener('change',updatePreview);
  loadButton.addEventListener('click',()=>openScene().catch(fail));
  const ready=initialize();
  root.jejuSetReviewEditor={ready,validateProject,openScene};
  ready.catch(fail);
})(window);
