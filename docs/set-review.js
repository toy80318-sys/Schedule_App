(() => {
  'use strict';
  const $=id=>document.getElementById(id), categories=['integrated','backgrounds','flowers','environment'], expectedThemes=['sunset','day','night','morning'], manualKey='jeju-set-review-manual-v1';
  const labels={grass:'풀·잎',tree:'나무',butterfly:'나비',cloud:'구름'};
  let manifest,selected,category='integrated',renderToken=0,currentProject,currentProjectSource,currentReport,referenceEntry,manual={};
  const projectCache=new Map(),uploads=new Map(),screenshots=new Map(),imageFailures=new Map();
  try{const saved=JSON.parse(localStorage.getItem(manualKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))manual=saved;}catch{}
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const status=(id,text,error=false)=>{$(id).textContent=text;$(id).classList.toggle('error',error);};
  function safeURL(src){
    if(typeof src!=='string'||!src||src.length>8192)return false;
    try{const u=new URL(src,document.baseURI);return !u.username&&!u.password&&(u.origin===location.origin&&['http:','https:','file:'].includes(u.protocol)||u.protocol==='https:');}catch{return false;}
  }
  function validateManifest(value){
    if(value?.format!=='jeju-set-review-v1'||!Array.isArray(value.backgrounds)||value.backgrounds.length!==4)throw Error('배경 세트 목록 형식이 맞지 않습니다.');
    const themes=new Set(),ids=new Map();
    for(const set of value.backgrounds){
      if(!expectedThemes.includes(set.id)||themes.has(set.id))throw Error('배경 번호가 중복되거나 빠져 있습니다.');themes.add(set.id);
      const setIds=new Set();for(const field of ['integrated','backgrounds','flowers','environment']){
        if(!Array.isArray(set[field]))throw Error('세트 구성 목록이 올바르지 않습니다.');
        for(const a of set[field]){const shared=ids.get(a.id);if(typeof a.id!=='string'||!a.id||setIds.has(a.id)||shared&&!(shared.src===a.src&&shared.sha256===a.sha256&&a.compatibleThemes?.includes(set.id))||a.src&&!safeURL(a.src))throw Error('이미지 번호 또는 경로가 올바르지 않습니다.');ids.set(a.id,a);setIds.add(a.id);}
      }
      if(!set.integrated.length||!set.backgrounds.length||!safeURL(set.project)||set.unityLayout&&!safeURL(set.unityLayout))throw Error('통합 시안·배경·배치 파일의 연결이 빠져 있습니다.');
      for(const field of ['legacyProject','legacyUnityLayout','previousProject','previousUnityLayout'])if(set[field]&&!safeURL(set[field]))throw Error('이전 배치 파일의 연결이 올바르지 않습니다.');
      if(set.projectVersions!==undefined){
        if(!Array.isArray(set.projectVersions)||!set.projectVersions.length)throw Error('배치 버전 목록이 올바르지 않습니다.');
        const choices=new Set();for(const choice of set.projectVersions){if(!choice||typeof choice.id!=='string'||!choice.id||choices.has(choice.id)||typeof choice.version!=='string'||typeof choice.label!=='string'||!safeURL(choice.path)||choice.unityLayout&&!safeURL(choice.unityLayout))throw Error('배치 버전의 번호 또는 연결이 올바르지 않습니다.');choices.add(choice.id);}
        const current=set.projectVersions.find(c=>c.id==='current');if(!current||current.path!==set.project||current.version!==set.projectVersion)throw Error('최신 배치 버전의 연결이 올바르지 않습니다.');
      }
    }
    return value;
  }
  function reviewKey(a,ref=referenceEntry){return JSON.stringify([a.id,a.sha256||a.src||'pending',ref?.id||null,ref?.sha256||ref?.src||null]);}
  function manualReview(a,ref=referenceEntry){const r=manual[reviewKey(a,ref)];return{status:['미검토','수정필요','확인'].includes(r?.status)?r.status:'미검토',comment:typeof r?.comment==='string'?r.comment.slice(0,1000):'',updatedAt:typeof r?.updatedAt==='string'?r.updatedAt:null,referenceId:ref?.id||null,referenceHash:ref?.sha256||ref?.src||null};}
  function saveReview(a,value,ref=referenceEntry){
    manual[reviewKey(a,ref)]={...value,referenceId:ref?.id||null,referenceHash:ref?.sha256||ref?.src||null,updatedAt:new Date().toISOString()};
    try{localStorage.setItem(manualKey,JSON.stringify(manual));}catch{status('loadStatus','검토 메모를 이 브라우저에 저장하지 못했습니다. JSON으로 내려받아 보관해 주세요.',true);}
  }
  function structuralCheck(a){
    if(!a.src)return{state:'pending',label:'원본 제작 대기'};
    if(imageFailures.has(a.id))return{state:'failed',label:'이미지 불러오기 실패'};
    if(selected?.backgrounds.includes(a)||selected?.integrated.includes(a))return{state:'pending',label:'배경·통합 PNG · 시각적 일치 별도 검토'};
    const v=a.verification;
    if(v?.alpha===true&&v?.borderClear===true&&v?.complete===true)return{state:'verified',label:'기술 검수 통과 · 통합본 유사도 육안 확인 필요'};
    if(v?.complete===false||v?.borderClear===false||v?.alpha===false)return{state:'failed',label:'PNG 구조 재검토 필요'};
    return{state:'pending',label:'PNG 구조 검수 미완료'};
  }
  function openAsset(a,wide=false){
    if(!a.src)return;
    $('assetDialogTitle').textContent=a.name||a.designLabel||'PNG 원본';$('assetDialogCode').textContent=[a.id,a.version].filter(Boolean).join(' · ');
    $('assetDialogImage').src=a.src;$('assetDialogImage').alt=a.name||a.id;$('assetDialogImage').classList.toggle('wide',wide);
    $('assetDialogDownload').href=a.src;$('assetDialogDownload').download=a.src.split('/').pop().split('?')[0];
    $('assetDialogInfo').textContent=[a.width&&a.height?`${a.width} × ${a.height} px`:null,a.sha256?'SHA-256 '+a.sha256:null].filter(Boolean).join(' · ');
    $('assetDialog').showModal();document.body.classList.add('dialog-open');
  }
  function card(a,wide=false){
    const article=el('article','asset-card'),button=el('button','asset-image'+(wide?' wide':' checker')),copy=el('div','asset-copy'),im=el('img');
    button.type='button';button.setAttribute('aria-label',(a.name||a.id)+' 원본 크게 보기');im.alt=a.name||a.id;im.loading='lazy';im.decoding='async';if(a.src)im.src=window.jejuWebPreviews?.[a.src]||a.preview||a.src;else button.disabled=true;
    const check=structuralCheck(a),checkNode=el('p','asset-status '+check.state,check.label);
    im.onerror=()=>{imageFailures.set(a.id,a.src);checkNode.className='asset-status failed';checkNode.textContent='이미지 불러오기 실패 · 원본 경로 확인 필요';};
    im.onload=()=>{imageFailures.delete(a.id);const current=structuralCheck(a);checkNode.className='asset-status '+current.state;checkNode.textContent=current.label;};
    button.append(im);button.onclick=()=>openAsset(a,wide);copy.append(el('div','asset-id',a.id),el('h4','',a.name||[a.designLabel,a.colorLabel].filter(Boolean).join(' · ')||a.id),checkNode);
    if(a.src){const link=el('a','download-link','PNG 원본 ↓');link.href=a.src;link.download='';copy.append(link);}
    const reviewReference=referenceEntry,fields=el('div','manual-review'),label=el('label','manual-label','시안과의 일치 검토'),select=el('select'),comment=el('textarea'),review=manualReview(a,reviewReference);
    select.setAttribute('aria-label',a.id+' 시안과의 일치 검토');for(const value of ['미검토','수정필요','확인'])select.append(new Option(value,value));select.value=review.status;
    comment.rows=2;comment.maxLength=1000;comment.placeholder='모양·색·잘림·초점 검토 메모';comment.value=review.comment;comment.setAttribute('aria-label',a.id+' 검토 메모');
    const save=()=>saveReview(a,{status:select.value,comment:comment.value},reviewReference);select.onchange=save;comment.onchange=save;label.append(select);fields.append(label,comment);copy.append(fields);article.append(button,copy);return article;
  }
  function missingSlot(design,color){const box=el('div','missing-card');box.append(el('strong','',design+' · '+color),el('span','','제작·검수 대기'));return box;}
  function flowerSlots(set){
    const missing=[];
    for(const design of set.flowerDesigns||Array.from({length:6},(_,d)=>'F'+String(d+1).padStart(2,'0')))for(let c=1;c<=4;c++){const color='C'+String(c).padStart(2,'0');if(!set.flowers.some(a=>a.design===design&&a.color===color&&a.src))missing.push({design,color});}
    return missing;
  }
  function fillFlowers(set){
    const host=$('flowerMatrix');host.replaceChildren();
    $('flowerReviewReference').textContent='현재 검토 기준: '+[referenceEntry?.id,referenceEntry?.version].filter(Boolean).join(' · ');
    for(const design of set.flowerDesigns||Array.from({length:6},(_,d)=>'F'+String(d+1).padStart(2,'0'))){
      const items=set.flowers.filter(a=>a.design===design),row=el('section','flower-row'),label=el('div','flower-row-label');
      label.append(el('span','eyebrow',design),el('h4','',items[0]?.designLabel||'꽃 디자인 '+design),el('p','','4색·4형태 독립 PNG'));row.append(label);
      for(let c=1;c<=4;c++){const color='C'+String(c).padStart(2,'0'),a=items.find(a=>a.color===color);row.append(a?card(a):missingSlot(design,color));}host.append(row);
    }
    const expected=(set.flowerDesigns?.length||6)*4;$('flowerCount').textContent=(expected-flowerSlots(set).length)+' / '+expected+'장';
  }
  function fillEnvironment(set){
    const host=$('environmentGroups');host.replaceChildren();
    $('environmentReviewReference').textContent='현재 검토 기준: '+[referenceEntry?.id,referenceEntry?.version].filter(Boolean).join(' · ');
    for(const[key,label]of Object.entries(labels)){
      const section=el('section','environment-group'),items=set.environment.filter(a=>a.category===key),grid=el('div','environment-grid');section.append(el('h4','',label+' · '+items.length+'종'));
      if(items.length)for(const a of items)grid.append(card(a));else grid.append(missingSlot(label,'원본 미등록'));section.append(grid);host.append(section);
    }
    const extras=set.environment.filter(a=>!Object.hasOwn(labels,a.category));
    if(extras.length){const section=el('section','environment-group'),grid=el('div','environment-grid');section.append(el('h4','','전경·기타 환경 요소'));extras.forEach(a=>grid.append(card(a)));section.append(grid);host.append(section);}
    $('environmentCount').textContent=set.environment.length+'장';
  }
  function fillBackgrounds(set){
    const overview=$('backgroundOverview');overview.replaceChildren();
    for(const item of manifest.backgrounds){const b=el('button'),im=el('img'),first=item.backgrounds[0];b.type='button';b.setAttribute('aria-pressed',String(item.id===set.id));im.src=first.preview||first.src;im.alt=item.label+' 배경';im.loading='lazy';b.append(im,el('span','',item.code+' · '+item.label));b.onclick=()=>navigate(item.id,'backgrounds');overview.append(b);}
    $('backgroundVariantsTitle').textContent=set.label+' · 배경 버전';$('backgroundVariants').replaceChildren(...set.backgrounds.map(a=>card(a,true)));
  }
  function fillReference(set){const select=$('integratedVersion');select.replaceChildren();set.integrated.forEach((a,i)=>select.append(new Option([a.version,a.name].filter(Boolean).join(' · '),String(i))));select.value=String(set.integrated.length-1);showReference();}
  function showReference(refreshReviews=false){
    if(!selected)return;referenceEntry=selected.integrated[Number($('integratedVersion').value)]||selected.integrated[0];
    $('referenceTitle').textContent=[referenceEntry.id,referenceEntry.name].filter(Boolean).join(' · ');$('referenceImage').src=referenceEntry.src;$('referenceImage').alt=selected.label+' · '+(referenceEntry.name||'AI 통합 시안');$('referenceDownload').href=referenceEntry.src;
    $('referenceBadge').textContent=referenceEntry.construction==='same-png-layout-render'?'분리 PNG 조립 통합본':'AI 통합 시안';
    $('referenceImage').onerror=()=>status('loadStatus','통합 시안 이미지를 불러오지 못했습니다. 원본 연결을 확인해 주세요.',true);
    if(refreshReviews){fillBackgrounds(selected);fillFlowers(selected);fillEnvironment(selected);}
  }
  function fillRenderBackground(set){$('renderBackground').replaceChildren(new Option('배치 파일의 배경 유지',''));for(const a of set.backgrounds)$('renderBackground').append(new Option([a.version,a.name].filter(Boolean).join(' · '),a.src));}
  async function signature(text){if(!crypto.subtle)return null;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
  function projectChoices(set){
    if(set.projectVersions?.length)return set.projectVersions.map(choice=>({...choice}));
    const choices=[{id:'current',path:set.project,unityLayout:set.unityLayout,version:set.projectVersion,label:set.projectLabel||'최신 기본 배치'}];
    if(set.previousProject)choices.push({id:'previous',path:set.previousProject,unityLayout:set.previousUnityLayout,version:set.previousProjectVersion,label:set.previousProjectLabel||'이전 그림체 배치'});
    if(set.legacyProject)choices.push({id:'legacy',path:set.legacyProject,unityLayout:set.legacyUnityLayout,version:set.legacyProjectVersion||'V01',label:set.legacyProjectLabel||'V01 · 이전 배치'});
    return choices;
  }
  function selectedProjectChoice(set){const choices=projectChoices(set);return choices.find(c=>c.id===$('layoutVersion').value)||choices[0];}
  function syncProjectLinks(set){
    const choice=selectedProjectChoice(set),prefix=choice.version?choice.version+' ':'';
    $('projectDownload').href=choice.path;$('projectDownload').textContent=prefix+'에디터 배치 JSON ↓';$('unityLayoutDownload').hidden=!choice.unityLayout;
    if(choice.unityLayout)$('unityLayoutDownload').href=choice.unityLayout;$('unityLayoutDownload').textContent=prefix+'Unity 좌표 참고 JSON ↓';
    $('layoutVersionNote').textContent=['V85','V86'].includes(choice.version)?'최신 꽃 v83·공중 요소 v84와 밝은 배경을 사용하는 예시 배치입니다. 통합 유화 v84는 미술·배치 참고 시안이며 오른쪽 PNG 합성과 픽셀 단위로 같다는 뜻은 아닙니다.':choice.version==='V06'?'유사색 V06 배치 · V05 원본 PNG. 시간대별 12종 유사색을 중심으로 꽃 320개를 배치하고 전체 24종 원본을 유지합니다. 환경 요소 36개와 보이는 꽃 크기·뿌리 접점·초점은 유지합니다.':choice.version==='V05'?'V05 · 그림체만 추상 유화로 변경했습니다. V04와 같은 크기·개수(꽃 320개 + 환경 요소 36개)를 유지하며 같은 PNG로 통합본을 조립합니다.':choice.version==='V04'?'V04 기본 배치 · 꽃 크기는 V01의 50%, 개수는 4배입니다. 꽃 320개 + 환경 요소 36개 = 총 356개.':choice.version==='V01'?'V01 이전 배치 · 꽃 80개 + 환경 요소 36개 = 총 116개. 기존 배치 파일은 그대로 보존합니다.':choice.label;
  }
  function fillProjectVersions(set){const select=$('layoutVersion');select.replaceChildren(...projectChoices(set).map(c=>new Option(c.label,c.id)));select.value='current';syncProjectLinks(set);}
  async function readProject(set,choice=selectedProjectChoice(set)){
    if(uploads.has(set.id))return uploads.get(set.id);
    if(!projectCache.has(choice.path)){
      const response=await fetch(choice.path);if(!response.ok)throw Error('기본 배치 파일을 불러오지 못했습니다.');const text=await response.text();if(text.length>12*1024*1024)throw Error('배치 파일이 너무 큽니다.');
      const project=window.JejuSetRenderer.validate(JSON.parse(text));projectCache.set(choice.path,{project,name:choice.label+' · '+set.label,version:choice.version,path:choice.path,sha256:await signature(text)});
    }
    return projectCache.get(choice.path);
  }
  async function renderProject(){
    if(!selected)return;const token=++renderToken,set=selected;currentProject=null;currentProjectSource=null;currentReport={complete:false,pending:true,missing:[],warnings:[]};$('downloadRender').disabled=true;status('renderStatus','배치 파일의 독립 PNG를 합성하고 있습니다…');$('canvasEmpty').hidden=false;$('canvasEmpty').textContent='배치 이미지 합성 중…';
    try{
      if(!window.JejuSetRenderer)throw Error('합성 도구를 불러오지 못했습니다.');const entry=await readProject(set);if(token!==renderToken)return;
      const temp=document.createElement('canvas'),report=await window.JejuSetRenderer.render(temp,entry.project,{width:4096,backgroundOverride:$('renderBackground').value||undefined});if(token!==renderToken)return;
      const canvas=$('layoutCanvas');canvas.width=temp.width;canvas.height=temp.height;canvas.getContext('2d').drawImage(temp,0,0);$('canvasEmpty').hidden=true;currentProject=entry.project;currentProjectSource=entry;currentReport=report;$('projectName').textContent=entry.name;$('downloadRender').disabled=false;
      const count=report.renderedObjects??0,total=report.totalObjects??entry.project.objects.length;
      status('renderStatus',report.complete?`${count}개 요소 합성 완료 · 소스 ${new Set(entry.project.objects.map(o=>o.assetId)).size}종 재사용 · 원본 배치 ${entry.project.width} × ${entry.project.height} · 실제 Unity 실행 검증 전`:`${count} / ${total}개 합성 · 누락 또는 오류가 있어 완성본으로 판정하지 않습니다.`,!report.complete);renderIssues();
    }catch(error){if(token!==renderToken)return;currentReport={complete:false,missing:[],warnings:[],error:error.message};currentProject=null;currentProjectSource=null;$('canvasEmpty').textContent='배치 이미지를 합성하지 못했습니다.';status('renderStatus',error.message,true);renderIssues();}
  }
  function renderIssues(){
    const host=$('renderIssues');host.replaceChildren();if(!currentReport){host.append(el('p','','아직 합성 검사를 진행하지 않았습니다.'));return;}
    const issues=[...(currentReport.error?[currentReport.error]:[]),...(currentReport.missing||[]).map(a=>(a.id||a.src)+' · '+(a.error||'이미지 누락')),...(currentReport.warnings||[])];
    if(!issues.length)host.append(el('p','','합성 중 확인된 이미지 누락은 없습니다. 통합 시안과의 일치는 개별 이미지와 비교 화면에서 검토해 주세요.'));
    else{const ul=el('ul');issues.forEach(item=>ul.append(el('li','',typeof item==='string'?item:JSON.stringify(item))));host.append(ul);}
  }
  function showScreenshot(set){
    const item=screenshots.get(set.id);$('unityScreenshotFigure').hidden=!item;
    if(item){$('unityScreenshot').src=item.url;$('unityScreenshotName').textContent=item.name;$('unityScreenshotStatus').textContent='사용자가 불러온 캡처 · '+item.width+' × '+item.height+' px · 파일의 출처와 실행 조건은 별도 확인이 필요합니다.';}
    else{$('unityScreenshot').removeAttribute('src');$('unityScreenshotStatus').textContent='실제 Unity 캡처가 아직 없습니다.';}
  }
  function showCategory(value){category=categories.includes(value)?value:'integrated';for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===category;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('panel-'+b.dataset.tab).hidden=!active;}}
  function showSet(id,tab=category){
    const set=manifest.backgrounds.find(s=>s.id===id)||manifest.backgrounds[0];selected=set;showCategory(tab);
    for(const b of $('backgroundTabs').children){const active=b.dataset.theme===set.id;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}
    $('reviewContent').setAttribute('aria-labelledby','background-tab-'+set.id);$('setCode').textContent=[set.projectVersion&&set.projectVersion+' 배치',(manifest.assetVersion||manifest.version)+' PNG',set.code].filter(Boolean).join(' · ');$('setTitle').textContent=set.label+' 세트';$('setSummary').textContent=`꽃 ${set.flowers.filter(a=>a.src).length} / ${(set.flowerDesigns?.length||6)*4}장 · 환경 요소 ${set.environment.filter(a=>a.src).length}장 · 통합 ${set.integrated.length}개 버전`;
    $('openSetElements').href='editor.html?v=20261028-v88&'+(['V85','V86'].includes(set.projectVersion)?'currentSet=':'setV05=')+set.id;
    fillProjectVersions(set);
    fillReference(set);fillRenderBackground(set);fillBackgrounds(set);fillFlowers(set);fillEnvironment(set);showScreenshot(set);document.title='메이즈랜드 · '+set.label+' 버전 비교';status('loadStatus','원본은 보존됩니다. 검토 상태와 메모는 이 브라우저에 저장되며, 검증 기준 JSON으로 내보낼 수 있습니다.');renderProject();
  }
  function navigate(id,tab){const hash='#'+id+'/'+tab;if(location.hash===hash){if(selected?.id!==id)showSet(id,tab);else showCategory(tab);}else location.hash=hash;}
  function route(){if(!manifest)return;const[id,tab]=location.hash.slice(1).split('/');if(selected?.id===id){showCategory(tab);return;}showSet(id,tab);}
  function bindTabKeyboard(host,selector){host.addEventListener('keydown',event=>{const buttons=[...host.querySelectorAll(selector)],i=buttons.indexOf(event.target);if(i<0)return;let next;if(event.key==='ArrowRight')next=(i+1)%buttons.length;else if(event.key==='ArrowLeft')next=(i+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();buttons[next].focus();buttons[next].click();});}
  function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function assetCategory(a,set=selected){return set.integrated.includes(a)?'integrated':set.backgrounds.includes(a)?'background':a.category||'flower';}
  function audit(){
    if(!selected)return null;const assets=[...selected.integrated,...selected.backgrounds,...selected.flowers,...selected.environment];
    return{format:'jeju-set-review-audit-v1',generatedAt:new Date().toISOString(),setVersion:manifest.assetVersion||manifest.version,sourcePngVersion:selected.sourcePngVersion||manifest.assetVersion||manifest.version,projectVersion:selected.projectVersion||null,colorHarmonyVersion:manifest.colorHarmonyVersion||null,flowerPalette:selected.flowerPalette||null,generationGuide:'assets/set-review-v01/AI_검증가이드.md',background:{id:selected.id,code:selected.code,label:selected.label},targetReference:referenceEntry?{id:referenceEntry.id,version:referenceEntry.version,src:referenceEntry.src,sha256:referenceEntry.sha256||null}:null,project:currentProjectSource?{name:currentProjectSource.name,version:currentProjectSource.version||null,src:currentProjectSource.path||null,sha256:currentProjectSource.sha256,width:currentProject?.width,height:currentProject?.height,backgroundOverride:$('renderBackground').value||null}:null,expected:{flowerDesigns:selected.flowerDesigns?.length||6,colorsPerDesign:4,totalFlowers:(selected.flowerDesigns?.length||6)*4,environmentCategories:Object.keys(labels)},missingFlowerSlots:flowerSlots(selected),missingEnvironmentCategories:Object.keys(labels).filter(key=>!selected.environment.some(a=>a.category===key&&a.src)),failedImageLoads:[...imageFailures].filter(([id])=>assets.some(a=>a.id===id)).map(([id,src])=>({id,src})),assets:assets.map(a=>({id:a.id,version:a.version||manifest.version,src:a.src,sha256:a.sha256||null,design:a.design,color:a.color,category:assetCategory(a),verification:a.verification||null,generationPrompt:a.generationPrompt||null,generationReference:a.generationReference||a.reference||null,generationRecords:a.generationRecords||null,structuralCheck:structuralCheck(a),visualMatch:manualReview(a),reference:referenceEntry?.src})),webComposite:currentReport||{complete:false,notRun:true},unityScreenshot:screenshots.has(selected.id)?{name:screenshots.get(selected.id).name,userSupplied:true,runtimeConditionsVerified:false}:null,reviewInstructions:['지정한 통합 시안과 꽃 디자인·꽃잎 형태·가까운 4색·크기·배치·명도·앞뒤 초점을 비교한다.','각 PNG는 다른 요소를 잘라낸 조각이 아닌, 온전한 한 개체와 투명 여백을 가져야 한다.','구조 검사와 시각적 일치 검토를 구분하고 미검토·수정필요인 요소를 완료로 판정하지 않는다.','Unity 전달 배치의 웹 합성을 실제 Unity 실행 결과로 판정하지 않는다.'],limits:['정지 이미지의 비교·제작 기준이며 개화 영상 검증을 포함하지 않음','미검토인 시각적 일치는 자동 확정하지 않음','업로드한 Unity 캡처의 출처·실행 조건은 별도 확인 필요']};
  }
  $('integratedVersion').onchange=()=>showReference(true);$('openReference').onclick=()=>referenceEntry&&openAsset(referenceEntry,true);$('renderBackground').onchange=renderProject;
  $('layoutVersion').onchange=()=>{if(!selected)return;uploads.delete(selected.id);$('projectFile').value='';syncProjectLinks(selected);renderProject();};
  $('loadDefault').onclick=()=>{if(!selected)return;uploads.delete(selected.id);$('projectFile').value='';renderProject();};
  $('projectFile').onchange=async event=>{
    const file=event.target.files?.[0],set=selected;if(!file||!set)return;
    try{if(file.size>12*1024*1024)throw Error('배치 JSON은 12MB 이하 파일을 선택해 주세요.');const text=await file.text(),project=window.JejuSetRenderer.validate(JSON.parse(text)),entry={project,name:file.name,path:null,sha256:await signature(text)};uploads.set(set.id,entry);if(selected.id===set.id)await renderProject();}
    catch(error){status('renderStatus','파일을 불러오지 못했습니다: '+error.message,true);}finally{event.target.value='';}
  };
  $('unityScreenshotFile').onchange=async event=>{
    const file=event.target.files?.[0],set=selected;if(!file||!set)return;let url;
    try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>32*1024*1024)throw Error('PNG·JPEG·WebP 형식의 32MB 이하 캡처를 선택해 주세요.');url=URL.createObjectURL(file);const im=new Image();im.src=url;await im.decode();if(im.naturalWidth*im.naturalHeight>100000000)throw Error('캡처 해상도가 너무 큽니다.');const old=screenshots.get(set.id);if(old)URL.revokeObjectURL(old.url);screenshots.set(set.id,{url,name:file.name,width:im.naturalWidth,height:im.naturalHeight});url=null;if(selected.id===set.id)showScreenshot(set);}
    catch(error){$('unityScreenshotStatus').textContent=error.message;}finally{if(url)URL.revokeObjectURL(url);event.target.value='';}
  };
  $('downloadRender').onclick=()=>{try{$('layoutCanvas').toBlob(blob=>{if(blob)download(blob,selected.code+'_web_composite_'+(currentProject?.setReviewVersion||manifest.assetVersion||manifest.version)+'.png');else status('renderStatus','합성 PNG 저장에 실패했습니다.',true);},'image/png');}catch(error){status('renderStatus','합성 PNG를 저장하지 못했습니다: '+error.message,true);}};
  $('downloadAudit').onclick=()=>download(new Blob([JSON.stringify(audit(),null,2)],{type:'application/json'}),selected.code+'_AI_review_'+(manifest.assetVersion||manifest.version)+'.json');
  $('closeAssetDialog').onclick=()=>$('assetDialog').close();$('assetDialog').addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>selected&&navigate(selected.id,b.dataset.tab);
  bindTabKeyboard($('backgroundTabs'),'[role=tab]');bindTabKeyboard(document.querySelector('.category-tabs'),'[role=tab]');window.addEventListener('hashchange',route);
  window.JejuSetReview={validateManifest,getAudit:audit};
  (async()=>{
    try{const response=await fetch('assets/current-release-v86/set-review.json?v=86');if(!response.ok)throw Error('세트 목록을 불러오지 못했습니다.');manifest=validateManifest(await response.json());$('releaseVersion').textContent=(manifest.colorHarmonyVersion?manifest.colorHarmonyVersion+' 배치 · ':'')+(manifest.assetVersion||manifest.version)+' PNG · '+(manifest.date||'2026.10.28');
      for(const set of manifest.backgrounds){const b=el('button','',set.code+' '+set.label);b.type='button';b.role='tab';b.id='background-tab-'+set.id;b.dataset.theme=set.id;b.setAttribute('aria-selected','false');b.setAttribute('aria-controls','reviewContent');b.tabIndex=-1;b.onclick=()=>navigate(set.id,category);$('backgroundTabs').append(b);}
      $('reviewContent').hidden=false;route();
    }catch(error){status('loadStatus',error.message+' 페이지를 새로 고쳐 다시 확인해 주세요.',true);}
  })();
})();
