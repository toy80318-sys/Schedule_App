const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),F=require('../docs/focus-blur');
const clone=v=>JSON.parse(JSON.stringify(v)),close=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
function setup(initial={}){
 const nodes=new Map(),listeners=new Map(),calls=[],history=[],notices=[];let state=F.normalize(initial),selectedTabs=0;
 const document={activeElement:null,createElement(tag){const e={tagName:tag,hidden:false,style:{},children:[],attributes:{},captured:new Set(),append(...items){this.children.push(...items)},setAttribute(k,v){this.attributes[k]=v},focus(){document.activeElement=this},setPointerCapture(id){this.captured.add(id)},hasPointerCapture(id){return this.captured.has(id)},releasePointerCapture(id){this.captured.delete(id)}};let id;Object.defineProperty(e,'id',{get:()=>id,set:v=>{id=v;nodes.set(v,e)}});return e},getElementById:id=>nodes.get(id),addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn)}};
 document.head=document.createElement('head');const wall=document.createElement('div');wall.id='wall';wall.getBoundingClientRect=()=>({left:100,top:200,width:2000,height:500});const panel=document.createElement('aside');panel.id='focusBlurPanel';panel.hidden=true;const tab=document.createElement('button');tab.id='editorTab';tab.click=()=>selectedTabs++;
 const dispatch=name=>{for(const fn of listeners.get(name)||[])fn()},E={H:3480,getFocus:()=>F.normalize(state),setFocus(value,checkpoint=true){if(checkpoint)history.push(clone(state));state=F.normalize(value);calls.push({value:clone(state),checkpoint});dispatch('jeju-editor-change')},notice:text=>notices.push(text),ready:{then(fn){fn()}}};
 vm.runInNewContext(fs.readFileSync('docs/focus-region-editor.js','utf8'),{window:{jejuEditor:E,jejuFocus:F},document});
 const picker=nodes.get('focusRegionPicker'),event=(type,x,y,extra={})=>{const e={button:0,pointerId:1,clientX:x,clientY:y,prevented:0,stopped:0,preventDefault(){this.prevented++},stopPropagation(){this.stopped++},...extra};picker['on'+type]?.(e);return e};
 return{E,nodes,picker,panel,document,calls,history,notices,event,dispatch,get state(){return state},get selectedTabs(){return selectedTabs},undo(){assert(history.length);state=history.pop();dispatch('jeju-editor-change')}};
}
test('scaled wall coordinates, multiple moves and one undo preserve scene focus',()=>{
 const t=setup({background:3,far:5,near:7,focus:.6});t.E.beginFocusRegion();assert.equal(t.selectedTabs,1);assert.equal(t.picker.hidden,false);assert.equal(t.document.activeElement,t.picker);
 const down=t.event('pointerdown',500,300);assert.equal(down.prevented,1);assert.equal(down.stopped,1);assert(t.picker.hasPointerCapture(1));
 t.event('pointermove',1300,550);t.event('pointermove',1500,600);const r=t.state.region;close(r.x,.2);close(r.y,.2);close(r.w,.5);close(r.h,.6);assert.equal(r.blur,8);assert.deepEqual(t.calls.map(c=>c.checkpoint),[true,false]);assert.equal(t.history.length,1);assert.equal(t.state.far,5);
 t.event('pointerup',1500,600);assert.equal(t.picker.hidden,true);assert.equal(t.picker.hasPointerCapture(1),false);assert.match(t.notices.at(-1),/지정했습니다/);t.undo();assert.equal(t.state.region,undefined);assert.equal(t.state.background,3);
});
test('reverse direction, bounds, tiny drags and unrelated pointer events',()=>{
 const t=setup();t.E.beginFocusRegion();t.event('pointerdown',1800,650);t.event('pointermove',300,250);t.event('pointerup',300,250);let r=t.state.region;close(r.x,.1);close(r.y,.1);close(r.w,.75);close(r.h,.8);
 t.E.beginFocusRegion();t.event('pointerdown',-100,-100);t.event('pointermove',4100,3200);t.event('pointerup',4100,3200);assert.deepEqual(t.state.region,{x:0,y:0,w:1,h:1,blur:8});
 const before=clone(t.state),count=t.calls.length;t.E.beginFocusRegion();t.event('pointerdown',400,300,{button:2});t.event('pointermove',1300,500);assert.equal(t.calls.length,count);t.event('pointerdown',400,300);t.event('pointermove',900,450,{pointerId:2});assert.equal(t.calls.length,count);t.event('pointermove',401,301);t.event('pointerup',401,301);assert.deepEqual(t.state,before);assert.match(t.notices.at(-1),/넓게/);
});
test('Escape and pointer cancel restore the previous region without another checkpoint',()=>{
 const region={x:.1,y:.2,w:.5,h:.4,blur:0},t=setup({background:4,region});t.E.beginFocusRegion();t.event('pointerdown',200,250);t.event('pointermove',1500,600);assert.equal(t.state.region.blur,0,'a deliberately zero strength remains zero');t.event('keydown',0,0,{key:'Escape'});assert.deepEqual(t.state.region,region);assert.equal(t.state.background,4);assert.equal(t.picker.hidden,true);assert.equal(t.picker.captured.size,0);assert.equal(t.calls.filter(c=>c.checkpoint).length,1);assert.equal(t.calls.at(-1).checkpoint,false);
 const empty=setup();empty.E.beginFocusRegion();empty.event('pointerdown',200,250);empty.event('pointermove',1500,600);empty.event('pointercancel',0,0,{pointerId:2});assert.equal(empty.picker.hidden,false);empty.event('pointercancel',0,0);assert.equal(empty.state.region,undefined);assert.equal(empty.picker.hidden,true);
});
test('effect and guide synchronize with live fields and do not block ordinary selection',()=>{
 const t=setup(),effect=t.nodes.get('focusRegionEffect'),guide=t.nodes.get('focusRegionGuide');assert.equal(effect.hidden,true);assert.equal(guide.hidden,true);assert.equal(t.picker.hidden,true);
 t.E.setFocus({near:3,region:{x:.2,y:.3,w:.4,h:.5,blur:9}},false);assert.equal(effect.hidden,false);assert.equal(guide.hidden,true);for(const el of [effect,guide])assert.deepEqual(el.style,{left:'20%',top:'30%',width:'40%',height:'50%',...(el===effect?{backdropFilter:F.css(9,3480),webkitBackdropFilter:F.css(9,3480)}:{})});
 t.panel.hidden=false;t.dispatch('jeju-focus-panel');assert.equal(guide.hidden,false);t.panel.hidden=true;t.dispatch('jeju-focus-panel');assert.equal(guide.hidden,true);assert.equal(effect.hidden,false);
 t.E.setFocus({near:3},false);assert.equal(effect.hidden,true);assert.equal(guide.hidden,true);assert.equal(t.picker.hidden,true);
 const css=t.document.head.children.map(n=>n.textContent).join('');assert.match(css,/#focusRegionEffect,#focusRegionGuide\{[^}]*pointer-events:none/);assert.match(css,/#focusRegionPicker\[hidden\][^{]*\{display:none\}/);assert(!effect.onpointerdown&&!guide.onpointerdown,'normal object selection has no overlay pointer handler');
});
