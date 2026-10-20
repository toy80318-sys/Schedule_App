(function(root){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const number=(v,fallback,min,max)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):fallback;
  const angle=(v,fallback)=>typeof v==='number'&&Number.isFinite(v)?((v+180)%360+360)%360-180:fallback;
  function normalize(value){return {enabled:value?.enabled!==false,strength:number(value?.strength,.75,0,1),horizon:number(value?.horizon,.53,.15,.85),spatial:value?.spatial===true,cameraOrbit:value?.cameraOrbit===true,cameraAmount:number(value?.cameraAmount,2,0,5),spread:number(value?.spread,600,0,2000),targetX:number(value?.targetX,null,-100000,100000),targetY:number(value?.targetY,null,-100000,100000),light:normalizeLight(value?.light)}}
  function normalizeLight(v){return {enabled:v?.enabled===true,x:number(v?.x,4500,-100000,100000),y:number(v?.y,650,-100000,100000),z:number(v?.z,2600,-20000,20000),rx:angle(v?.rx,35),ry:angle(v?.ry,-30),rz:angle(v?.rz,0),power:number(v?.power,1,0,3),ambient:number(v?.ambient,.85,0,1),shadow:number(v?.shadow,.6,0,1),softness:number(v?.softness,12,0,60)}}
  function lightDirection(light){const x=light.rx*Math.PI/180,y=light.ry*Math.PI/180,z=light.rz*Math.PI/180,a=-Math.sin(y)*Math.cos(x),b=Math.sin(x);return [Math.cos(z)*a-Math.sin(z)*b,Math.sin(z)*a+Math.cos(z)*b,-Math.cos(y)*Math.cos(x)]}
  function lightPose(height,settings,camera){const l=normalizeLight(settings?.light);return pose({x:l.x,y:l.y,z:l.z,w:0,h:0,r:0,opacity:1,lightPoint:true},null,height,settings,camera)}
  function lighting(o,a,height,settings,camera){
    if(!settings?.light?.enabled||!ground(a))return {brightness:1};
    const l=normalizeLight(settings.light),p=pose(o,a,height,settings,camera),lamp=lightPose(height,settings,camera),vector=[l.x-o.x-o.w/2,l.y-o.y-o.h/2,l.z-(o.z||0)],distance=Math.hypot(...vector)||1,toLight=vector.map(v=>v/distance),direction=lightDirection(l),beam=Math.max(0,(direction.reduce((s,v,i)=>s-v*toLight[i],0)+.25)/1.25)**1.5;
    const rx=(o.rx||0)*Math.PI/180,ry=(o.ry||0)*Math.PI/180,rz=o.r*Math.PI/180,normal=[Math.cos(rz)*Math.sin(ry)*Math.cos(rx)+Math.sin(rz)*Math.sin(rx),Math.sin(rz)*Math.sin(ry)*Math.cos(rx)-Math.cos(rz)*Math.sin(rx),Math.cos(ry)*Math.cos(rx)],diffuse=Math.max(0,normal.reduce((s,v,i)=>s+v*toLight[i],0)),energy=l.power*beam/(1+(distance/(height*3))**2);
    const m=p.plane||[Math.cos(rz),Math.sin(rz),-Math.sin(rz),Math.cos(rz)],footX=p.x+p.w/2+m[2]*p.h/2,footY=p.y+p.h/2+m[3]*p.h/2;
    // A flattened alpha silhouette represents the receiving ground in the painted scene.
    const dx=clamp((footX-lamp.x)*p.h/Math.max(p.h*.75,Math.abs(footY-lamp.y)),-p.h*1.8,p.h*1.8),dy=p.h*(.14+clamp((l.z-(o.z||0))/height,-.5,1)*.35),u=.75*m[0],v=.08*m[1],c=.75*m[2]-dx/p.h,d=-.1*Math.abs(m[3])-dy/p.h;
    return {brightness:clamp(l.ambient+energy*(.3+.7*diffuse)*.65,.1,2.5),shadow:{matrix:[u,v,c,d,footX-u*p.w/2-c*p.h,footY-v*p.w/2-d*p.h],opacity:clamp(l.shadow*energy,0,.85),blur:l.softness}};
  }
  function castShadow(ctx,o,a,im,height,settings,camera){
    const shade=lighting(o,a,height,settings,camera);if(!shade.shadow||shade.shadow.opacity<=0||!im)return;
    const p=pose(o,a,height,settings,camera),iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;if(!iw||!ih)return;
    const r=Math.min(p.w/iw,p.h/ih),w=iw*r,h=ih*r,pixelScale=Math.abs(ctx.getTransform?.()?.a||1);
    ctx.save();ctx.globalAlpha=o.opacity*shade.shadow.opacity;ctx.filter=`brightness(0) blur(${shade.shadow.blur*pixelScale}px)`;ctx.transform(...shade.shadow.matrix);if(o.flipX){ctx.translate(p.w,0);ctx.scale(-1,1)}ctx.drawImage(im,(p.w-w)/2,a.group==='flowers'?p.h-h:(p.h-h)/2,w,h);ctx.restore();
  }
  function view(objects,assets,width,height,settings,time=0){
    const map=assets instanceof Map?assets:new Map(assets.map(a=>[a.id,a])),flowers=objects.filter(o=>ground(map.get(o.assetId))),items=flowers.length?flowers:objects;
    const x=items.length?items.reduce((s,o)=>s+o.x+o.w/2,0)/items.length:width/2,y=items.length?items.reduce((s,o)=>s+o.y+o.h/2,0)/items.length:height*.7,c=normalize(settings),phase=time*Math.PI*2/60;
    return {x:c.targetX??x,y:c.targetY??y,distance:height*2.5,yaw:c.cameraOrbit?Math.sin(phase)*c.cameraAmount*Math.PI/180:0,pitch:c.cameraOrbit?Math.sin(phase*.7)*c.cameraAmount*.5*Math.PI/180:0};
  }
  function turn(x,y,z,yaw,pitch){const cx=Math.cos(yaw)*x+Math.sin(yaw)*z,cz=-Math.sin(yaw)*x+Math.cos(yaw)*z;return [cx,Math.cos(pitch)*y-Math.sin(pitch)*cz,Math.sin(pitch)*y+Math.cos(pitch)*cz]}
  function spatialPose(o,base,height,camera){
    const c=camera||{x:height*14165/3480/2,y:height*.7,distance:height*2.5,yaw:0,pitch:0},z=number(o.z,0,o.lightPoint?-20000:-2000,o.lightPoint?20000:2000),center=turn(base.x+base.w/2-c.x,base.y+base.h/2-c.y,z,c.yaw,c.pitch),denom=Math.max(c.distance*.2,c.distance-center[2]),scale=c.distance/denom;
    const rx=number(o.rx,0,-60,60)*Math.PI/180,ry=number(o.ry,0,-60,60)*Math.PI/180,rz=o.r*Math.PI/180,sx=Math.sin(rx),cx=Math.cos(rx),sy=Math.sin(ry),cy=Math.cos(ry),sz=Math.sin(rz),cz=Math.cos(rz);
    const u=turn(cz*cy,sz*cy,-sy,c.yaw,c.pitch),v=turn(cz*sy*sx-sz*cx,sz*sy*sx+cz*cx,cy*sx,c.yaw,c.pitch),plane=[u[0]+center[0]*u[2]/denom,u[1]+center[1]*u[2]/denom,v[0]+center[0]*v[2]/denom,v[1]+center[1]*v[2]/denom];
    const root=turn((base.rootX??base.x+base.w/2)-c.x,(base.rootY??base.y+base.h)-c.y,z,c.yaw,c.pitch),rs=c.distance/Math.max(c.distance*.2,c.distance-root[2]),w=base.w*scale,h=base.h*scale;
    return {...base,spaceScale:scale,x:c.x+center[0]*scale-w/2,y:c.y+center[1]*scale-h/2,w,h,plane,viewZ:center[2],rootX:c.x+root[0]*rs,rootY:c.y+root[1]*rs};
  }
  const transform=p=>p.plane?`matrix(${p.plane.join(',')},0,0)`:`rotate(${p.r}deg)`;
  function orient(ctx,p){if(p.plane)ctx.transform(...p.plane,0,0);else ctx.rotate(p.r*Math.PI/180)}
  function floorCover(a){return !!a&&/grass|basalt|stone/.test([a.id,a.src].join(' '))}
  function ground(a){return !!a&&(a.group==='flowers'||['hydrangea','lavender','rapeseed','buckwheat','marigold','camellia'].includes(a.species)||a.bloomVariant||/^(?:flower-|loop-(?:hydrangea|lavender|rapeseed|buckwheat|marigold|camellia))/.test(a.id||'')||floorCover(a))}
  function rootPoint(o){const angle=o.r*Math.PI/180;return {x:o.x+o.w/2-Math.sin(angle)*o.h/2,y:o.y+o.h/2+Math.cos(angle)*o.h/2}}
  function pose(o,a,height,settings,camera){
    const config=normalize(settings);if(!config.enabled)return o;if(config.spatial)return spatialPose(o,o,height,camera||{x:config.targetX??height*14165/3480/2,y:config.targetY??height*.7,distance:height*2.5,yaw:0,pitch:0});if(!ground(a))return o;
    const anchor=rootPoint(o),back=height*config.horizon,front=height*.98,depth=clamp((anchor.y-back)/(front-back),0,1),scale=1-config.strength*.7*(1-depth),w=o.w*scale,h=o.h*scale,angle=o.r*Math.PI/180;
    const x=anchor.x,y=o.spaceUnclamped===true?anchor.y:floorCover(a)?Math.max(back,anchor.y):clamp(anchor.y,back,front);
    const base={...o,x:x+Math.sin(angle)*h/2-w/2,y:y-Math.cos(angle)*h/2-h/2,w,h,spaceScale:scale,spaceDepth:depth,rootX:x,rootY:y};return config.spatial?spatialPose(o,base,height,camera):base;
  }
  function atCenter(o,a,height,settings,x,y,camera){
    if(settings?.enabled!==false&&settings?.spatial){const c=camera||{x:settings.targetX??height*14165/3480/2,y:settings.targetY??height*.7,distance:height*2.5},f=(c.distance-number(o.z,0,-2000,2000))/c.distance;return {...o,x:c.x+(x-c.x)*f-o.w/2,y:c.y+(y-c.y)*f-o.h/2}}
    const config=normalize(settings);if(!config.enabled||!ground(a))return {...o,x:x-o.w/2,y:y-o.h/2};
    const back=height*config.horizon,front=height*.98,min=1-config.strength*.7,slope=(1-min)/(front-back),angle=o.r*Math.PI/180,vertical=Math.cos(angle)*o.h/2;
    const far=y+vertical*min,near=y+vertical,rootY=far<=back?far:near>=front?near:(y+vertical*(min-slope*back))/(1-vertical*slope),scale=1-config.strength*.7*(1-clamp((rootY-back)/(front-back),0,1));
    // A centre resize must not be pulled back to the planting boundary.
    return {...o,x:x+Math.sin(angle)*o.h*(1-scale)/2-o.w/2,y:rootY-Math.cos(angle)*o.h/2-o.h/2,spaceUnclamped:true};
  }
  function ordered(objects,assets,height,settings,camera){
    if(!normalize(settings).enabled)return objects;
    const map=assets instanceof Map?assets:new Map(assets.map(a=>[a.id,a]));
    if(settings?.spatial)return objects.map((o,i)=>({o,i,z:pose(o,map.get(o.assetId),height,settings,camera).viewZ})).sort((a,b)=>a.z-b.z||a.i-b.i).map(v=>v.o);
    const planted=objects.filter(o=>ground(map.get(o.assetId))).map((o,i)=>({o,i,y:pose(o,map.get(o.assetId),height,settings).rootY})).sort((a,b)=>a.y-b.y||a.i-b.i);let index=0;
    return objects.map(o=>ground(map.get(o.assetId))?planted[index++].o:o);
  }
  function shadow(ctx,p){
    if(p.spaceScale===undefined)return;
    ctx.save();ctx.filter='none';ctx.globalAlpha=p.opacity*.38;ctx.translate(p.rootX,p.rootY);ctx.scale(p.w*.36,Math.max(5,p.w*.07));const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#10251bd9');g.addColorStop(.45,'#10251b80');g.addColorStop(1,'#10251b00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,1,1,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function guide(width,height,settings){
    const top=height*normalize(settings).horizon,bottom=height*.98,lines=[];
    for(let i=-8;i<=16;i++)lines.push(`<path d="M ${width/2} ${top} L ${i*width/8} ${bottom}"/>`);
    for(let i=0;i<=8;i++){const y=top+(bottom-top)*(i/8)**2;lines.push(`<path d="M 0 ${y} H ${width}"/>`)}
    return 'url("data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g fill="none" stroke="#b7e9da" stroke-opacity=".33" stroke-width="8">${lines.join('')}</g></svg>`)+'")';
  }
  const api={normalize,normalizeLight,lightDirection,lightPose,lighting,castShadow,view,transform,orient,floorCover,ground,rootPoint,pose,atCenter,ordered,shadow,guide};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuSpace=api;
})(typeof window==='object'?window:globalThis);
