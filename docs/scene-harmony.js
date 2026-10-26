((root)=>{
 'use strict';
 const presets={
  sunset:{name:'노을 · 붉은 꽃과 금빛',background:[98,107,110,6],flowers:[106,103,110,3],decor:[89,103,89,4],grade:{hue:-1,exposure:-.03,brightness:100,curve:[0,57,124,198,253]}},
  day:{name:'낮 · 햇살과 노란 꽃',background:[97,105,108,2],flowers:[104,103,110,1],decor:[91,103,91,2],grade:{hue:-1,exposure:-.02,brightness:100,curve:[0,58,126,198,253]}},
  night:{name:'밤 · 달빛과 보랏빛',background:[98,104,108,0],flowers:[110,102,110,0],decor:[88,102,92,0],grade:{hue:-1,exposure:-.02,brightness:100,curve:[0,61,130,199,253]}},
  morning:{name:'아침 · 푸른 꽃과 여명',background:[98,105,109,0],flowers:[106,102,108,0],decor:[90,103,91,1],grade:{hue:1,exposure:-.02,brightness:100,curve:[0,59,127,199,253]}}
 };
 const neutral=()=>({brightness:100,contrast:100,saturation:100,warmth:0});
 function theme(background,scenes=[]){const src=(background||'').split('?')[0],scene=scenes.find(s=>s.project.background.split('?')[0]===src);if(scene&&presets[scene.id])return scene.id;const n=src.match(/ML_BG0([1-4])_LT0\1_/);return n?['sunset','day','night','morning'][+n[1]-1]:null}
 function filters(key,amount=1){
  const p=presets[key];if(!p)throw Error('현재 배경의 색보정 기준을 찾지 못했습니다.');amount=Number.isFinite(amount)?Math.max(0,Math.min(1,amount)):1;
  const out={scene:neutral()};for(const scope of ['background','flowers','decor']){out[scope]=neutral();Object.keys(out[scope]).forEach((k,i)=>{const base=k==='warmth'?0:100;out[scope][k]=Math.round(base+(p[scope][i]-base)*amount)})}
  const g=p.grade;out.backgroundGrade={hue:g.hue*amount,exposure:g.exposure*amount,brightness:100,curve:g.curve.map((v,i)=>[0,64,128,192,255][i]+(v-[0,64,128,192,255][i])*amount)};return out;
 }
 const api={presets,theme,filters};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuSceneHarmony=api;
})(typeof window==='object'?window:globalThis);
