(()=>{
 'use strict';const E=window.jejuEditor,M=window.jejuGroupDensity;if(!E||!M)return;
 const panel=document.createElement('div');panel.id='groupDensityTools';panel.className='group';
 panel.innerHTML='<h3>그룹 · 오브젝트 밀도</h3><p class="note">선택 그룹 안에서 지정한 이미지의 수량만 조절합니다.</p><label class="muted">편집할 그룹<select id="densityGroupSelect" class="full-input" aria-label="밀도를 편집할 그룹"></select></label><label class="muted" style="display:block;margin-top:10px">대상 오브젝트<select id="groupDensityTarget" class="full-input" aria-label="밀도를 조절할 오브젝트 종류"></select></label><button class="btn" id="densitySelectTarget" style="width:100%;margin-top:8px">대상 오브젝트만 선택</button><p id="groupDensityStatus" class="note" role="status" aria-live="polite"></p><div class="actions"><button class="btn danger" id="groupDensityDown">밀도 줄이기 −10%</button><button class="btn" id="groupDensityUp">밀도 늘리기 +10%</button></div><p class="note">현재 대상 수의 10%를 반올림합니다. 마지막 1개는 남기며 Ctrl+Z로 복구할 수 있습니다. 추가 시 크기·색상·블러를 유지합니다.</p>';
 document.querySelector('.panel.right').prepend(panel);
 const $=id=>document.getElementById(id),groupSelect=$('densityGroupSelect'),target=$('groupDensityTarget');let previousGroup='',selectionKey='';
 function sync(){
  const state=E.state(),selected=E.selected(),group=M.selectedGroup(state.objects,selected),groups=new Map();
  for(const o of state.objects)if(o.groupId&&!groups.has(o.groupId))groups.set(o.groupId,o.groupName||'그룹');
  const chosen=group?.id||'',oldTarget=chosen===previousGroup?target.value:'',key=selected.map(o=>o.id).join('|');
  groupSelect.replaceChildren(new Option('그룹 선택', ''));for(const [id,name] of groups)groupSelect.add(new Option(name,id));groupSelect.value=chosen;
  target.replaceChildren(new Option('그룹 전체 오브젝트',''));const counts=new Map();for(const o of group?.items||[])counts.set(o.assetId,(counts.get(o.assetId)||0)+1);
  for(const [id,count] of counts){const asset=state.assets.find(a=>a.id===id),object=group.items.find(o=>o.assetId===id);target.add(new Option(`${asset?.name||object.name} · ${count}개`,id))}
  target.value=counts.has(oldTarget)?oldTarget:'';
  if(key!==selectionKey&&selected.length===1&&group)target.value=selected[0].assetId;
  previousGroup=chosen;selectionKey=key;target.disabled=!group;
  const items=M.candidates(state.objects,chosen,target.value||null),count=items.length;
  $('groupDensityDown').disabled=M.step(count,false)===0;$('groupDensityUp').disabled=!count;$('densitySelectTarget').disabled=!count;
  $('groupDensityStatus').textContent=group?`${group.name} 전체 ${group.items.length}개 / 대상 ${count}개 · 이번 감소 ${M.step(count,false)}개`:'아웃라이너에서 그룹을 선택하거나 위에서 그룹을 골라 주세요.';
 }
 groupSelect.onchange=()=>{if(groupSelect.value)E.selectGroupObjects(groupSelect.value);else sync()};
 target.onchange=sync;
 $('densitySelectTarget').onclick=()=>E.selectGroupObjects(groupSelect.value,target.value||null);
 $('groupDensityDown').onclick=()=>E.changeGroupDensity(false,groupSelect.value,target.value||null);
 $('groupDensityUp').onclick=()=>E.changeGroupDensity(true,groupSelect.value,target.value||null);
 document.addEventListener('jeju-editor-change',sync);E.ready.then(sync);
})();
