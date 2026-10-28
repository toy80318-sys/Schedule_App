(()=>{
 'use strict';
 const E=window.jejuEditor;if(!E||document.getElementById('openPetalYPreview'))return;
 const link=document.createElement('a'),themes=['sunset','day','night','morning'];
 link.id='openPetalYPreview';link.className='btn';link.textContent='꽃잎 Y축 회전 보기';link.target='_blank';link.rel='noopener';
 function sync(){const state=E.state(),selected=E.selected()[0],asset=selected&&state.assets.find(a=>a.id===selected.assetId),backgroundTheme=({BG01:'sunset',BG02:'day',BG03:'night',BG04:'morning'})[state.background?.match(/BG0[1-4]/)?.[0]],theme=asset?.theme||backgroundTheme;link.href='petal-y-loops.html?v=y102&theme='+(themes.includes(theme)?theme:'sunset')}
 E.ready.then(()=>{const group=document.getElementById('currentReleaseControls');if(!group)return;group.append(link);sync();document.addEventListener('jeju-editor-change',sync)},()=>{});
})();
