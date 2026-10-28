(()=>{
 'use strict';const E=window.jejuEditor,O=window.jejuObjectEffects;if(!E||!O)return;
 E.ready.then(()=>{
  const properties=document.getElementById('properties');if(!properties)return;
  const panel=document.createElement('section');panel.id='objectEffectsPanel';
  const title=document.createElement('h3');title.textContent='선택 객체 · 색감·글로우·블러';
  const status=document.createElement('p');status.id='objectEffectsStatus';status.className='note';status.setAttribute('role','status');
  const rows=document.createElement('div'),reset=document.createElement('button'),help=document.createElement('p');reset.id='resetObjectEffects';reset.type='button';reset.className='btn';reset.textContent='선택 객체 효과 초기화';help.className='note';help.textContent='그룹을 선택하면 함께 적용됩니다. 개별 객체는 선택을 해제한 뒤 Shift+클릭으로 고를 수 있습니다. 혼합된 값은 바꾼 항목만 함께 적용됩니다.';
  panel.append(title,status,rows,reset,help);properties.append(panel);
  const style=document.createElement('style');style.textContent='#objectEffectsPanel{margin-top:18px;padding-top:14px;border-top:1px solid #4f656d}.object-effects-row{display:grid;grid-template-columns:1fr 76px;gap:7px;margin:14px 0}.object-effects-row label{grid-column:1/-1}.object-effects-row input{width:100%;min-width:0;box-sizing:border-box}.object-effects-row input[type=range]{accent-color:#87cdb5}.object-effects-row input[type=number]{padding:6px;background:#10211e;color:#eff5ec;border:1px solid #5d8374;border-radius:5px}#resetObjectEffects{width:100%}';document.head.append(style);
  const controls=new Map(),changing=new Set(),randomButtons=[];let selectionKey='';
  const value=(object,key)=>key==='blur'?(typeof object.blur==='number'&&Number.isFinite(object.blur)?Math.max(0,Math.min(40,object.blur)):0):O.normalize(object.effects)[key];
  for(const [key,label,min,max,step] of [['brightness','객체 밝기 (%)',0,200,1],['contrast','객체 대비 (%)',0,200,1],['saturation','객체 채도 (%)',0,200,1],['hue','객체 색상 이동 (°)',-180,180,1],['glowStrength','객체 글로우 강도 (%)',0,100,1],['glowRadius','객체 빛 번짐 크기',1,40,1],['blur','객체 블러',0,40,.5]]){
   const row=document.createElement('div'),name=document.createElement('label'),range=document.createElement('input'),number=document.createElement('input');row.className='object-effects-row';range.type='range';number.type='number';range.id='objectEffect_'+key;number.id='objectEffectNumber_'+key;name.htmlFor=range.id;name.textContent=label;number.setAttribute('aria-label',label+' 숫자');
   for(const input of [range,number]){input.min=min;input.max=max;input.step=step;input.oninput=()=>{if(!E.selected().length||input.value===''||!Number.isFinite(Number(input.value)))return;const checkpoint=!changing.has(input);changing.add(input);if(key==='blur')E.setObjectBlur(Number(input.value),checkpoint);else E.setObjectEffects({[key]:Number(input.value)},checkpoint)};input.onchange=input.onblur=()=>{changing.delete(input);sync(input)}}
   row.append(name,range,number);rows.append(row);controls.set(key,[range,number]);
   if(key==='brightness'){
    const actions=document.createElement('div'),note=document.createElement('p');actions.style.display='flex';actions.style.gap='7px';note.className='note';note.textContent='그룹 또는 여러 객체를 선택하세요. 100% 기준으로 ±10%는 90–110%, ±20%는 80–120%로 새로 적용됩니다.';
    for(const spread of [10,20]){const button=document.createElement('button');button.id='randomObjectBrightness'+spread;button.type='button';button.className='btn';button.style.flex='1';button.textContent='밝기 랜덤 ±'+spread+'%';button.onclick=()=>{if(E.selected().length<2)return;changing.clear();E.randomizeObjectBrightness(spread);sync(null,true)};actions.append(button);randomButtons.push(button)}
    rows.append(actions,note);
   }
  }
  function sync(committed,force=false){
   const selected=E.selected(),key=selected.map(o=>o.id).join('\0'),selectionChanged=key!==selectionKey;if(selectionChanged){changing.clear();selectionKey=key}
   let mixedCount=0;
   for(const [field,[range,number]] of controls){const values=selected.map(o=>value(o,field)),first=values[0]??value({},field),mixed=values.some(v=>v!==first);if(mixed)mixedCount++;range.value=String(first);range.disabled=number.disabled=!selected.length;range.setAttribute('aria-valuetext',mixed?'혼합된 값 · 변경하면 선택한 객체에 함께 적용':String(first));number.placeholder=mixed?'혼합':'';if(force||selectionChanged||number===committed||document.activeElement!==number)number.value=mixed?'':String(first)}
   randomButtons.forEach(button=>button.disabled=selected.length<2);reset.disabled=!selected.length;status.textContent=selected.length?selected.length+'개 선택 · '+selected.slice(0,3).map(o=>o.name||'객체').join(', ')+(selected.length>3?' 외 '+(selected.length-3)+'개':'')+(mixedCount?' · 혼합된 값이 있습니다.':''):'나비·꽃·풀·돌 등 조절할 객체를 먼저 선택하세요.';
  }
  reset.onclick=()=>{if(!E.selected().length)return;changing.clear();E.resetObjectEffects();sync(null,true)};document.addEventListener('jeju-editor-change',sync);sync();
 });
})();
