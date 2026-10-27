/* Shared curve geometry for canvas guides and seeded planting. */
(function(root){
 'use strict';
 function sample(points,closed,smooth=70){
  if(points.length<2)return points.map(p=>({...p}));const result=[],n=points.length,blend=smooth/100,at=i=>points[closed?(i+n)%n:Math.max(0,Math.min(n-1,i))];
  for(let i=0;i<(closed?n:n-1);i++)for(let k=0;k<16;k++){const t=k/16,a=at(i-1),b=at(i),c=at(i+1),d=at(i+2),p={};for(const key of ['x','y']){const linear=b[key]+(c[key]-b[key])*t,curved=.5*(2*b[key]+(-a[key]+c[key])*t+(2*a[key]-5*b[key]+4*c[key]-d[key])*t*t+(-a[key]+3*b[key]-3*c[key]+d[key])*t*t*t);p[key]=Math.max(0,Math.min(100,linear*(1-blend)+curved*blend))}result.push(p)}
  result.push({...at(closed?0:n-1)});return result;
 }
 function bounds(points){const x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y));return{x,y,w:Math.max(...points.map(p=>p.x))-x,h:Math.max(...points.map(p=>p.y))-y}}
 function area(points){return Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y},0))/2}
 function inside(p,points){let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[j],b=points[i],cross=(p.x-a.x)*(b.y-a.y)-(p.y-a.y)*(b.x-a.x);if(Math.abs(cross)<1e-7&&p.x>=Math.min(a.x,b.x)&&p.x<=Math.max(a.x,b.x)&&p.y>=Math.min(a.y,b.y)&&p.y<=Math.max(a.y,b.y))return true;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes}
 function lengths(points){const values=[0];for(let i=1;i<points.length;i++)values.push(values.at(-1)+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));return values}
 function along(points,values,distance){const total=values.at(-1),s=Math.max(0,Math.min(total,distance));let i=1;while(i<values.length-1&&values[i]<s)i++;const a=points[i-1],b=points[i],length=values[i]-values[i-1],t=length?(s-values[i-1])/length:0,dx=b.x-a.x,dy=b.y-a.y,scale=Math.hypot(dx,dy)||1;return{x:a.x+dx*t,y:a.y+dy*t,nx:-dy/scale,ny:dx/scale}}
 const api={sample,bounds,area,inside,lengths,along};if(typeof module==='object')module.exports=api;else root.jejuProceduralCurves=api;
})(typeof window==='object'?window:globalThis);
