((root)=>{'use strict';
 function validate(data){
  if(data?.format!=='jeju-flower-openings-v89'||!Array.isArray(data.items)||data.items.length>48)throw Error('꽃 개화 목록 형식이 다릅니다.');
  const ids=new Set();for(const a of data.items){
   if(!/^BG0[1-4]-(?:buckwheat|camellia|canola|hydrangea|lavender|marigold)-scene-[a-d]-v83$/.test(a.id)||ids.has(a.id)||!/^[a-f0-9]{64}$/.test(a.sourceSHA256))throw Error('꽃 원본 식별자가 다릅니다.');ids.add(a.id);
   if(a.status!=='passed')continue;
   if(a.route!=='GENERATED_IMAGE_PAIR_TO_VIDEO'||!a.jobId||a.fps!==24||a.duration!==3||a.frames?.length!==72||a.previewWidth!==192||a.previewHeight!==192||a.transparent!==true||a.review?.alpha!==true||a.review?.naturalOpening!==true||a.review?.fullyOpenBySeconds>3||!(a.review?.fullyOpenBySeconds>0)||a.inputs?.length!==2||a.inputs[0].role!=='start_image'||a.inputs[1].role!=='end_image'||a.inputs.some(i=>!i.generatedImage||!/^[a-f0-9]{64}$/.test(i.sha256))||a.inputs[0].sha256===a.inputs[1].sha256||!a.frames.every((p,i)=>p===`assets/flower-openings-v89/${a.id}/frame_${String(i).padStart(4,'0')}.webp`)||a.bud!==a.frames[0]||a.open!==a.frames[71])throw Error('검수된 두 이미지 입력과 개화 프레임이 필요합니다.');
  }return data;
 }
 function asset(a,data){const v=data.items.find(v=>v.id===a.id&&v.status==='passed');if(!v)return{...a};if(a.sha256!==v.sourceSHA256||a.src!==v.sourcePNG||a.theme!==v.theme||a.category!=='flower')throw Error('같은 꽃과 조명의 개화 영상만 연결할 수 있습니다.');return{...a,bloomSequence:JSON.parse(JSON.stringify(v)),bud:v.bud,open:v.open,flowerAnimation:true};}
 function phase(elapsed,sequence){return Math.min(sequence.frames.length-1,Math.max(0,Math.floor(Math.max(0,elapsed)*sequence.fps)));}
 const api={validate,asset,phase};if(typeof module==='object'&&module.exports)module.exports=api;else root.jejuFlowerOpening=api;
})(typeof window==='object'?window:globalThis);
