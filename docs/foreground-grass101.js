/* Reuses three signed foreground-grass sources per lighting without moving placed objects. */
(function(root){
 'use strict';
 const themes=['sunset','day','night','morning'],kinds=['wide','arching','sedge'];
 const originals=['c50ebbe3de7dd4dac257cf270c9bc022a09f371c8b82eb58eed9439d474aa7df','0974a3ba7bc86f5f8aef5a86d727b263782dc449fa5a2fa607039f8632534301','908ebcc7d5485cb06b19ad62a5c5ab2ec600e6ab09c9ee28eb5218c063e6f61e','37099846835571c716058f508db71f78be8717bf0258e3ff5ee26716750dbb63'].map((sha256,i)=>({id:`BG0${i+1}-E01-V05`,theme:themes[i],src:`https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/BG0${i+1}-E01-V05.png`,sha256}));
 const copy=v=>JSON.parse(JSON.stringify(v)),same=(a,b)=>!!a&&a.id===b.id&&a.src===b.src&&a.sha256===b.sha256&&a.theme===b.theme&&a.category==='grass'&&a.group==='decor';
 function validate(data){
  if(data?.version!==101||data.assets?.length!==12)throw Error('하단 풀 3종·4개 시간대 목록이 다릅니다.');
  const seen=new Set();for(const a of data.assets){const i=themes.indexOf(a.theme),kind=kinds.find(k=>a.id===`foreground101-${a.theme}-${k}`),bg=`BG0${i+1}`,lt=`LT0${i+1}`,path=kind==='sedge'?`assets/foreground-grass-v101/${bg}_${lt}_sedge-low_v101.png`:`source-assets/whole-objects-v59/ML_${bg}_${lt}_greenery_0${kind==='wide'?5:6}_Whole_v59.png`;
   if(i<0||!kind||seen.has(a.id)||a.backgroundId!==bg||a.lightingId!==lt||a.foregroundGrassVersion!==101||a.category!=='grass'||a.group!=='decor'||!a.ready||!a.stillOnly||!a.completeObject||a.setReviewVersion==='V05'||typeof a.src!=='string'||!(a.src===path||a.src.endsWith('/'+path)||a.src===`assets/foreground-grass-v101/${bg}_${lt}_${kind}_v101.png`||a.src.endsWith(`/assets/foreground-grass-v101/${bg}_${lt}_${kind}_v101.png`))||!/^[a-f0-9]{64}$/.test(a.sha256)||!Number.isFinite(a.width)||a.width<=0||!Number.isFinite(a.height)||a.height<=0||a.frames?.length||a.loopVideo)throw Error('같은 시간대의 검수된 독립 풀 PNG가 필요합니다.');seen.add(a.id);
  }return data;
 }
 function data(){return root.jejuForegroundGrassData?validate(root.jejuForegroundGrassData):null;}
 function original(a){return originals.find(s=>a?.src===s.src&&a.sha256===s.sha256&&a.theme===s.theme&&a.category==='grass'&&a.group==='decor')||null;}
 function variant(a){return !!data()?.assets.some(s=>same(a,s));}
 function isCollision(a){const known=[...originals,...(data()?.assets||[])].find(s=>s.id===a?.id);return !!known&&(a.src!==known.src||a.sha256!==known.sha256||a.theme!==known.theme||a.category!=='grass');}
 function isGrassAsset(a){return !!original(a)||variant(a);}
 function hash(id){let value=2166136261;for(const c of String(id)){value^=c.charCodeAt(0);value=Math.imul(value,16777619)}value^=value>>>16;value=Math.imul(value,0x85ebca6b);value^=value>>>13;value=Math.imul(value,0xc2b2ae35);value^=value>>>16;return value>>>0;}
 function lower(o,p,partial){
  if(o.foregroundGrassManual101||o.procedural)return false;
  if(o.foregroundGrassVersion101===101&&o.foregroundGrassRole101==='lower-row')return true;
  if(['reference93-foreground','reference93-bed'].includes(o.groupId))return true;
  if(partial||o.groupId||o.stylePresetId||o.styleCategoryId||/rear|backdrop|behind/i.test(o.placementRole||''))return false;
  return Number.isFinite(p.height)&&p.height>0&&[o.y,o.h].every(Number.isFinite)&&o.h>0&&o.h<=p.height*.45&&o.y>=p.height*.6&&o.y+o.h>=p.height*.975;
 }
 function plan(input,partial=false){
  const d=data();if(!d||!Array.isArray(input?.assets)||!Array.isArray(input.objects))return [];
  const map=new Map(input.assets.map(a=>[a.id,a])),rows=new Map();
  for(const [at,o]of input.objects.entries()){
   const a=map.get(o.assetId);let source=original(a);
   if(!source&&o.foregroundGrassVersion101===101&&variant(a))source=originals.find(s=>s.id===o.foregroundGrassSource101&&s.theme===a.theme);
   if(!source||!lower(o,input,partial))continue;
   const key=source.theme+'|'+(o.foregroundGrassRow101||o.groupId||'legacy-lower'),row=rows.get(key)||[];row.push({at,o,a,source});rows.set(key,row);
  }
  const changes=[];
  for(const row of rows.values()){
   row.sort((a,b)=>a.o.x-b.o.x||a.o.y-b.o.y||String(a.o.id).localeCompare(String(b.o.id)));const counts=[0,0,0,0];let previous=-1;
   for(const item of row){const {o,a,source}=item,choices=[null,...kinds.map(k=>d.assets.find(v=>v.id===`foreground101-${source.theme}-${k}`))],current=original(a)?0:kinds.findIndex(k=>a.id===`foreground101-${source.theme}-${k}`)+1;
    if(o.foregroundGrassVersion101===101){counts[current]++;previous=current;continue;}
    const allowed=choices.map((v,i)=>i===0||!map.has(v.id)||same(map.get(v.id),v)?i:-1).filter(i=>i>=0),different=allowed.filter(i=>i!==previous),options=different.length?different:allowed,min=Math.min(...options.map(i=>counts[i])),balanced=options.filter(i=>counts[i]===min),seed=hash(o.id)%4;
    let chosen=balanced[0];for(let n=0;n<4;n++){const i=(seed+n)%4;if(balanced.includes(i)){chosen=i;break}}
    counts[chosen]++;previous=chosen;
    const target=choices[chosen],object={...o,...(target?{assetId:target.id,name:target.name}:{}),foregroundGrassVersion101:101,foregroundGrassRole101:'lower-row',foregroundGrassRow101:o.groupId||'legacy-lower',foregroundGrassSource101:source.id,foregroundGrassOriginalAsset101:a.id};changes.push({at: item.at,object,asset:target});
   }
  }return changes;
 }
 function project(input,options={}){
  const p=copy(input),changes=plan(input,options.partial===true);if(changes.length){const map=new Map(p.assets.map(a=>[a.id,a]));for(const change of changes){p.objects[change.at]=change.object;if(change.asset&&!map.has(change.asset.id)){const a=copy(change.asset);p.assets.push(a);map.set(a.id,a)}}p.foregroundGrassVersion101=101;}
  if(Array.isArray(p.styles))for(const style of p.styles)for(const preset of style.presets||[]){const q=project({...preset,assets:p.assets},{partial:true});preset.objects=q.objects;if(q.foregroundGrassVersion101===101)preset.foregroundGrassVersion101=101;for(const a of q.assets)if(!p.assets.some(v=>v.id===a.id))p.assets.push(a);}
  return p;
 }
 function needsMigration(input){if(plan(input).length)return true;return !!input?.styles?.some(s=>s.presets?.some(p=>plan({...p,assets:input.assets},{partial:true}).length));}
 function register(catalog){const d=data();if(!d||!Array.isArray(catalog?.assets))return;const ids=[];for(const a of d.assets){const old=catalog.assets.find(v=>v.id===a.id);if(!old){catalog.assets.push(copy(a));ids.push(a.id)}else if(same(old,a))ids.push(a.id);}if(Array.isArray(catalog.currentSourceIds))catalog.currentSourceIds=[...new Set([...catalog.currentSourceIds,...ids])];}
 const api={validate,project,needsMigration,register,original,isGrassAsset,isCollision,variant,get assets(){return copy(data()?.assets||[])}};register(root.jejuCurrentRelease);register(root.jejuFinalCatalog);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuForegroundGrass=api;
})(typeof window==='object'?window:globalThis);
