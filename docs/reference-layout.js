(function(root){'use strict';
 const contours={sunset:[[0,.54],[.08,.64],[.2,.69],[.4,.70],[.6,.70],[.8,.67],[.92,.62],[1,.54]],day:[[0,.53],[.1,.67],[.22,.70],[.42,.72],[.65,.70],[.85,.66],[1,.52]],night:[[0,.57],[.12,.68],[.25,.74],[.45,.75],[.65,.73],[.85,.69],[1,.56]],morning:[[0,.58],[.14,.68],[.3,.73],[.5,.72],[.7,.72],[.9,.68],[1,.56]]};
 function project(input,theme){
  const p=JSON.parse(JSON.stringify(input)),line=contours[theme];
  if(!line||p.currentReleaseVersion!==86||p.referenceLayoutVersion===93)return p;
  const W=p.width,H=p.height,map=new Map(p.assets.map(a=>[a.id,a]));let seed=9300+Object.keys(contours).indexOf(theme);
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const contour=x=>{let i=1;while(i<line.length-1&&line[i][0]<x)i++;const a=line[i-1],b=line[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])};
  const size=(o,h)=>{o.w=o.h=o.baseW=o.baseH=h*H;o.aspect=1};
  const place=(o,x,y,h)=>{size(o,h);o.x=Math.max(0,Math.min(W-o.w,x*W-o.w/2));o.y=y*H;o.blur=0;o.opacity=1};
  const flowers=p.objects.filter(o=>map.get(o.assetId)?.category==='flower');
  for(let i=flowers.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[flowers[i],flowers[j]]=[flowers[j],flowers[i]]}
  flowers.forEach((o,i)=>{
   const band=Math.floor(i/80),n=80,j=i%80;
   const x=(j+.15+.7*random())/n,top=contour(x),h=[.09,.10,.105,.10][band]*(.9+.2*random());
   const y=band===3?.992-h:top+band*.085+(random()-.5)*.045;
   place(o,x,Math.min(y,.992-h),h);o.r=(random()-.5)*10;o.referenceBand=band;o.groupId='reference93-flowers-'+band;
  });
  const grasses=p.objects.filter(o=>map.get(o.assetId)?.category==='grass'),leaves=p.objects.filter(o=>map.get(o.assetId)?.category==='leaf');
  for(const [objects,count,label] of [[grasses,28,'grass'],[leaves,4,'leaf']]){
   const originals=[...objects];if(!originals.length)continue;
   while(objects.length<count){const o={...originals[objects.length%originals.length],id:theme+'-reference93-'+label+'-'+objects.length};objects.push(o);p.objects.push(o)}
   objects.forEach((o,i)=>{const x=(i+.05+.9*random())/count,h=(label==='grass'?.12:.14)*(.78+.44*random()),front=i%3!==0||label==='leaf',root=front?.999:Math.min(.94,contour(x)+.25);place(o,x,root-h,h);o.r=(random()-.5)*14;o.groupId='reference93-'+(front?'foreground':'foliage');});
  }
  const rockX=[.022,.10,.135,.252,.287,.418,.476,.59,.72,.802,.853,.97];let rock=0;
  for(const o of p.objects){const c=map.get(o.assetId)?.category;
   if(c==='basalt'){const i=rock++,h=(i%3===0?.23:.17)*(.9+.2*random());place(o,rockX[i%rockX.length],(i%4===2?.935:.997)-h,h);o.r=(random()-.5)*9;o.groupId='reference93-rocks'}
   else if(c==='tree'){const right=o.x>W/2,h=.30;place(o,right?.985:.015,.78-h,h);o.opacity=.8;o.groupId='reference93-backdrop'}
  }
  const bed=[];for(let i=0;grasses.length&&i<14;i++){const o={...grasses[i%grasses.length],id:theme+'-reference93-bed-'+i,groupId:'reference93-bed'},h=.28*(.9+.2*random());place(o,(i+.1+.8*random())/14,.995-h,h);o.opacity=.76;o.r=(random()-.5)*10;bed.push(o)}
  const ground=o=>['flower','grass','leaf','tree','basalt'].includes(map.get(o.assetId)?.category);
  const landscape=p.objects.filter(ground).sort((a,b)=>(a.y+a.h)-(b.y+b.h)||a.id.localeCompare(b.id));
  p.objects=[...p.objects.filter(o=>map.get(o.assetId)?.category==='cloud'),...bed,...landscape,...p.objects.filter(o=>!ground(o)&&map.get(o.assetId)?.category!=='cloud')];
  p.sceneFilters.decor={...p.sceneFilters.decor,brightness:85,saturation:94};
  p.referenceLayoutVersion=93;p.name=p.name.replace(/v86/g,'v93')+' · 통합본 기준 군집 배치';
  p.reviewNote='통합본의 군집 높이·명암·전경 겹침을 참고한 독립 객체 배치. 원본 통합 그림의 픽셀 단위 복제는 아님. 기존 저장 배치는 자동 변경하지 않음.';
  return p;
 }
 const api={project};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuReferenceLayout=api;
})(typeof window==='object'?window:globalThis);
