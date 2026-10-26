((root)=>{
 'use strict';
 function vary(object,index,random=Math.random){
  const old=object.r*Math.PI/180,r=[-8,0,8,0][index%4]+(random()*4-2),angle=r*Math.PI/180;
  const x=object.x+object.w/2-Math.sin(old)*object.h/2,y=object.y+object.h/2+Math.cos(old)*object.h/2;
  return{...object,x:x+Math.sin(angle)*object.h/2-object.w/2,y:y-Math.cos(angle)*object.h/2-object.h/2,r,flipX:index%4===0||index%4===3,directionVersion:64};
 }
 if(typeof module==='object'&&module.exports)module.exports=vary;else root.jejuFlowerDirections=vary;
})(typeof window==='object'?window:globalThis);
