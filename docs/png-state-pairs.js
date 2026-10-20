(function(root){
 'use strict';
 const species=['hydrangea','lavender','rapeseed','buckwheat','marigold','camellia'];
 function validate(data){
  if(data?.format!=='jeju-png-state-pairs-v1'||data.mode!=='PNG_STATE_PAIR'||!Array.isArray(data.variants)||data.variants.length!==16)throw Error('PNG 상태 목록 형식 오류');
  const ids=new Set(),safe=s=>typeof s==='string'&&s.startsWith('https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/')&&/^[a-z0-9_]+\.png$/.test(s.slice(80));
  for(const v of data.variants){
   if(!species.includes(v.species)||!/^[a-z]+$/.test(v.tone)||v.id!==v.species+'-'+v.tone||ids.has(v.id)||v.ready!==true||v.route!=='PNG_STATE_PAIR'||v.transparent!==true||v.frameCount!==2||v.fps!==0||v.duration!==0||![v.width,v.height].every(n=>Number.isInteger(n)&&n>0&&n<=4096)||!safe(v.bud)||!safe(v.open)||v.bud===v.open||v.frames?.length!==2||v.frames[0]!==v.bud||v.frames[1]!==v.open)throw Error('PNG 봉오리/만개 정보 오류');
   ids.add(v.id);
  }
  for(const s of species)if(!ids.has(s+'-'+data.defaultVariants?.[s]))throw Error('기본 꽃 상태 누락');
  return data;
 }
 const api={validate};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuPngPairs=api;
})(typeof window==='object'?window:globalThis);
