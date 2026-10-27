/* Moves existing controls without replacing their handlers or saved scene data. */
(()=>{
 'use strict';const E=window.jejuEditor;if(!E)return;
 const sections=[
  {id:'selection',label:'선택 · 밀도',entries:[
   {title:'그룹 만들기',controls:['makeGroup','ungroup']},
   {group:'groupDensityTools',open:true},
   {title:'선택 오브젝트 편집',controls:['duplicate','copyObjects','pasteObjects','flipX','remove'],open:true},
   {group:'undo',title:'키보드 단축키'}]},
  {id:'placement',label:'배치 · 변형',entries:[
   {group:'propX',open:true},
   {group:'nudgeStep'},
   {group:'normalizeFlowers'},
   {title:'겹침 · 레이어 순서',controls:['layerUp','layerDown','layerUp10','layerDown10','layerUp30','layerDown30','layerFront','layerBack']},
   {title:'꽃 방향 · 하단 채우기',controls:['varyFlowerDirections','fillForeground']},
   {title:'자동 군집 배치',controls:['clusterTheme','clusterCount','autoCluster']}]},
  {id:'color',label:'배경 · 색상',entries:[
   {group:'openBgGalleryRight',open:true},
   {node:'whole62-scenes',title:'시간대별 정원 불러오기'},
   {title:'배경 · 전체 색보정',controls:['openBackgroundGrade','openTonePanel','applySceneHarmony'],open:true},
   {title:'선택한 꽃 색상',controls:['randomFlowerColor','randomFlowerHue5','randomFlowerHue10'],help:'선택한 꽃의 색상만 바꿉니다. Hue 5%·10%는 각각 ±5°·±10° 범위입니다.'},
   {group:'replaceFlowers'},
   {group:'mixSavedFlowers'}]},
  {id:'effects',label:'효과 · 공간',entries:[
   {title:'파티클 · 블러',controls:['scatterSkyParticles','scatterParticles','openFocusBlur'],open:true},
   {group:'applySpatial'},
   {group:'addSceneLight'},
   {group:'seqImport'}]},
  {id:'files',label:'소스 · 저장',entries:[
   {title:'배치 이름 · 저장본',controls:['saveName','saveCurrent','savedLayouts','loadCurrent','deleteSaved'],open:true},
   {title:'프로젝트 · 이미지 파일',controls:['loadProject','saveSelectedGroup','exportPng']},
   {group:'styleRegister'},
   {node:'sourceDownloadToolbar',title:'원본 소스 ZIP 다운로드',open:true}]}
 ];
 function mount(){
  const controls=new Map([...document.querySelectorAll('[id]')].map(e=>[e.id,e])),$=id=>document.getElementById(id)||controls.get(id),right=document.querySelector('.panel.right'),groups=[...right.children].filter(e=>e.classList.contains('group')),used=new Set();
  const nav=document.createElement('div');nav.className='editor-tool-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','편집 도구');
  const panels=document.createElement('div');panels.id='editorToolPanels';right.id='editorToolInspector';
  function card(title,open){const details=document.createElement('details');details.className='editor-tool-card';details.open=!!open;const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');body.className='editor-tool-body';details.append(summary,body);return{details,body}}
  function activate(id){for(const button of nav.children){const active=button.dataset.tool===id;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$(button.getAttribute('aria-controls')).hidden=!active}}
  const panelById=new Map();
  for(const section of sections){
   const tab=document.createElement('button');tab.type='button';tab.id='toolTab_'+section.id;tab.dataset.tool=section.id;tab.textContent=section.label;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','toolPanel_'+section.id);
   const pane=document.createElement('section');pane.id='toolPanel_'+section.id;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',tab.id);panelById.set(section.id,pane);nav.append(tab);panels.append(pane);
   tab.onclick=()=>activate(section.id);tab.onkeydown=e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...nav.children],i=tabs.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus()};
   for(const entry of section.entries){
    if(entry.group){const anchor=$(entry.group),group=groups.find(g=>g===anchor||g.contains(anchor));if(!group||used.has(group))continue;used.add(group);const {details,body}=card(entry.title||group.querySelector('h3')?.textContent||'도구',entry.open);body.append(group);pane.append(details)}
    else if(entry.node){const node=$(entry.node);if(!node)continue;const {details,body}=card(entry.title,entry.open);body.append(node);pane.append(details)}
    else{const {details,body}=card(entry.title,entry.open),actions=document.createElement('div');actions.className='actions';for(const id of entry.controls){const node=$(id);if(!node)continue;if(node.tagName==='INPUT'||node.tagName==='SELECT'){const label=document.createElement('label');label.className='editor-tool-field';label.textContent=({'saveName':'배치 이름','savedLayouts':'저장된 배치','clusterTheme':'군집 색상','clusterCount':'군집 수'})[id]||node.getAttribute('aria-label')||'';label.append(node);body.append(label)}else actions.append(node)}if(actions.children.length)body.append(actions);if(entry.help){const help=document.createElement('p');help.className='note';help.textContent=entry.help;body.append(help)}pane.append(details)}
   }
  }
  const duplicate=$('openTonePanelRight')?.closest('.group');if(duplicate){duplicate.hidden=true;used.add(duplicate);panelById.get('color').append(duplicate)}
  for(const group of groups)if(!used.has(group)){const {details,body}=card(group.querySelector('h3')?.textContent||'추가 도구');body.append(group);panelById.get('files').append(details)}
  right.replaceChildren(nav,panels);
  const header=document.querySelector('body>header'),legacy=document.createElement('div');legacy.hidden=true;legacy.id='editorLegacyShortcuts';
  for(const node of [...header.children])if(node.tagName==='SMALL'||node.tagName==='BUTTON'&&node.id!=='saveProject')legacy.append(node);
  if($('openBgGallery'))legacy.append($('openBgGallery'));if($('ungroupSelected'))legacy.append($('ungroupSelected'));
  header.append($('undo'),$('redo'));$('undo').textContent='되돌리기';$('redo').textContent='다시 실행';$('saveProject').textContent='파일 저장';header.append($('saveProject'));
  const toggle=document.createElement('button');toggle.type='button';toggle.className='btn';toggle.id='editorToolToggle';toggle.textContent='도구';toggle.setAttribute('aria-controls',right.id);header.append(toggle);
  function toggleTools(hidden){document.body.classList.toggle('editor-tools-hidden',hidden);toggle.setAttribute('aria-expanded',String(!hidden));requestAnimationFrame(()=>$('fit').click())}
  toggle.onclick=()=>toggleTools(!document.body.classList.contains('editor-tools-hidden'));
  const leftFooter=document.querySelector('.panel.left').lastElementChild;leftFooter.replaceChildren();const editGroup=document.createElement('button');editGroup.type='button';editGroup.className='btn primary';editGroup.textContent='선택 그룹 · 밀도 편집';editGroup.onclick=()=>{activate('selection');toggleTools(false)};leftFooter.append(editGroup);
  for(const p of document.querySelectorAll('#properties .note'))if(p.textContent.startsWith('색상 변화 강도:'))p.hidden=true;
  document.body.append(legacy);document.body.classList.add('editor-organized');activate('selection');toggleTools(matchMedia('(max-width:760px)').matches);
  const fileCopy=document.createElement('button');fileCopy.className='btn';fileCopy.type='button';fileCopy.textContent='프로젝트 파일 저장';fileCopy.onclick=()=>$('saveProject').click();panelById.get('files').querySelectorAll('.editor-tool-body')[1].prepend(fileCopy);
  window.jejuEditorLayout={sections,activate};
 }
 E.ready.then(mount).catch(error=>E.notice('도구 정리를 완료하지 못했습니다: '+error.message));
})();
