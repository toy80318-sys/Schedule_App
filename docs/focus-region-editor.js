(()=>{
 'use strict';
 const E=window.jejuEditor,F=window.jejuFocus,wall=document.getElementById('wall');if(!E||!F||!wall)return;
 const effect=document.createElement('div'),guide=document.createElement('div'),surface=document.createElement('div');
 effect.id='focusRegionEffect';guide.id='focusRegionGuide';surface.id='focusRegionPicker';surface.tabIndex=0;surface.setAttribute('aria-label','블러 영역을 드래그하여 지정 · Escape 취소');surface.hidden=true;
 const style=document.createElement('style');style.textContent='#focusRegionEffect,#focusRegionGuide{position:absolute;pointer-events:none;box-sizing:border-box}#focusRegionEffect{z-index:9000}#focusRegionGuide{z-index:11001;border:calc(2px * var(--inv,1)) dashed #ffdf8b}#focusRegionPicker{position:absolute;inset:0;z-index:11000;cursor:crosshair;touch-action:none;outline:calc(2px * var(--inv,1)) solid #ffdf8b}#focusRegionPicker[hidden],#focusRegionEffect[hidden],#focusRegionGuide[hidden]{display:none}';document.head.append(style);wall.append(effect,guide,surface);
 let start=null,changed=false,previousRegion=null,pointer=null;
 const point=e=>{const b=wall.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),y:Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))}};
 function sync(){const r=E.getFocus().region;effect.hidden=!r||!r.blur;guide.hidden=!r||surface.hidden&&document.getElementById('focusBlurPanel')?.hidden!==false;if(!r)return;for(const node of [effect,guide])Object.assign(node.style,{left:r.x*100+'%',top:r.y*100+'%',width:r.w*100+'%',height:r.h*100+'%'});effect.style.backdropFilter=effect.style.webkitBackdropFilter=F.css(r.blur,E.H);}
 function finish(cancel=false){if(cancel&&changed){const focus=E.getFocus();if(previousRegion)focus.region=previousRegion;else delete focus.region;E.setFocus(focus,false)}start=null;changed=false;previousRegion=null;if(pointer!==null){if(surface.hasPointerCapture(pointer))surface.releasePointerCapture(pointer);pointer=null}surface.hidden=true;sync()}
 E.beginFocusRegion=()=>{if(start)finish(true);document.getElementById('editorTab')?.click();surface.hidden=false;surface.focus();sync();E.notice('화면에서 블러를 넣을 영역을 드래그하세요. Escape로 취소합니다.');};
 surface.onpointerdown=e=>{if(e.button!==0||start)return;e.preventDefault();e.stopPropagation();start=point(e);changed=false;previousRegion=E.getFocus().region||null;pointer=e.pointerId;surface.setPointerCapture(pointer)};
 surface.onpointermove=e=>{if(!start||e.pointerId!==pointer)return;e.preventDefault();e.stopPropagation();const p=point(e),w=Math.abs(p.x-start.x),h=Math.abs(p.y-start.y);if(w<.01||h<.01)return;const focus=E.getFocus();focus.region={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w,h,blur:focus.region?.blur??8};E.setFocus(focus,!changed);changed=true;sync()};
 surface.onpointerup=e=>{if(!start||e.pointerId!==pointer)return;e.preventDefault();e.stopPropagation();const completed=changed;finish();E.notice(completed?'블러 영역을 지정했습니다. 위치·크기·강도를 숫자나 슬라이더로 조절하세요.':'영역을 넓게 드래그해 주세요.');};
 surface.onpointercancel=e=>{if(e.pointerId===pointer)finish(true)};surface.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(true)}};
 document.addEventListener('jeju-editor-change',sync);document.addEventListener('jeju-focus-panel',sync);E.ready.then(sync);
})();
