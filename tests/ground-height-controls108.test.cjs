const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const G=require('../docs/background-grade'),S=require('../docs/garden-space'),app=fs.readFileSync('docs/app.js','utf8');
function harness(){
 const nodes=new Map(),events={},calls=[];let grade=G.normalize({hue:23,exposure:.4,brightness:111,groundHeight:7});
 class Element{
  constructor(tag='div'){this.tagName=tag;this.value='';this.type='';this.children=[];this.dataset={};this.hidden=false;this.disabled=false;this.attributes={};this.style={};}
  set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
  set innerHTML(value){for(const m of value.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const el=new Element(m[1]);el.id=m[2];el.type=m[0].match(/type="([^"]+)"/)?.[1]||'';}}append(...children){this.children.push(...children);}after(){}prepend(){}addEventListener(){}setAttribute(k,v){this.attributes[k]=v;}focus(){document.activeElement=this;}
 }
 const get=id=>nodes.get(id),document={activeElement:null,body:new Element(),head:new Element(),getElementById:get,createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag),querySelector:()=>new Element(),addEventListener:(name,fn)=>events[name]=fn};
 for(const id of ['openTonePanel','spaceEnabled','spaceStrength','spaceStrengthValue','spaceHorizon','cameraOrbit','zSpread','plantDepth','plantDepthValue']){const el=new Element();el.id=id;}
 const E={ready:Promise.resolve(),getBackgroundGrade:()=>G.normalize(grade),setBackgroundGrade:(value,checkpoint=true)=>{calls.push({value:G.normalize(value),checkpoint});grade=G.normalize(value);events['jeju-editor-change']?.();}};
 const context={document,window:{jejuEditor:E,jejuBackgroundGrade:G,jejuSpace:S},$:get,gardenSpace:S.normalize({enabled:false}),sceneFilters:{},assets:[],members:()=>[]};
 vm.createContext(context);vm.runInContext(app.split('\n').find(line=>line.includes('const spacePanel=')),context);
 vm.runInContext(fs.readFileSync('docs/background-grade-ui.js','utf8'),context);
 const syncSource=app.split('\n').find(line=>line.includes('function syncSpaceControls()'));
 const syncSpace=()=>{context.sceneFilters={backgroundGrade:G.normalize(grade)};vm.runInContext(syncSource+';syncSpaceControls()',context);};
 return{get,E,context,document,calls,syncSpace,grade:()=>grade,external:value=>{grade=G.normalize(value);events['jeju-editor-change']?.();}};
}
test('ground controls update the shared background grade with space off or XYZ on, and keep one undo per gesture',async()=>{
 const t=harness();await Promise.resolve();
 assert(app.includes('식물 원근 기준선 (%)'));assert.equal(t.get('spaceGroundHeightNumber').value,'7');
 for(const spatial of [false,true]){
  t.context.gardenSpace=S.normalize({enabled:spatial,spatial,horizon:.53});t.syncSpace();
  const before=JSON.stringify(t.context.gardenSpace),range=t.get('spaceGroundHeight');
  assert.equal(range.disabled,false);assert.equal(t.get('spaceGroundHeightNumber').disabled,false);
  const start=t.calls.length;range.value='15';range.oninput();range.value='20';range.oninput();range.onchange();
  assert.deepEqual(t.calls.slice(start).map(c=>c.checkpoint),[true,false]);
  assert.equal(t.grade().groundHeight,20);assert.equal(t.grade().hue,23);assert.equal(t.grade().exposure,.4);assert.equal(t.grade().brightness,111);
  assert.equal(t.get('bgGrade_groundHeight').value,'20');assert.equal(t.get('bgGradeNumber_groundHeight').value,'20');assert.equal(t.get('spaceGroundHeightValue').textContent,'+20');
  assert.equal(JSON.stringify(t.context.gardenSpace),before,'background input must not change any planting or XYZ setting');
 }
 t.external({...t.grade(),groundHeight:-9});assert.equal(t.get('spaceGroundHeight').value,'-9');assert.equal(t.get('spaceGroundHeightNumber').value,'-9');
 const other=t.get('bgGrade_groundHeight');other.value='12';other.oninput();other.onchange();assert.equal(t.get('spaceGroundHeightNumber').value,'12');
});
test('continuous number entry keeps its text while clamping the preview and commits on blur',async()=>{
 const t=harness();await Promise.resolve();const n=t.get('spaceGroundHeightNumber');t.document.activeElement=n;
 const start=t.calls.length;n.value='4';n.oninput();n.value='41';n.oninput();
 assert.equal(n.value,'41');assert.equal(t.grade().groundHeight,40);assert.equal(t.get('bgGradeNumber_groundHeight').value,'40');
 t.syncSpace();assert.equal(n.value,'41','animation refresh must not replace active text');
 n.value='';n.oninput();t.syncSpace();assert.equal(n.value,'');assert.equal(t.grade().groundHeight,40);
 n.value='27';n.oninput();assert.equal(t.grade().groundHeight,27);assert.equal(n.value,'27');
 assert.deepEqual(t.calls.slice(start).map(c=>c.checkpoint),[true,false,false]);
 n.value='99';n.oninput();n.onblur();assert.equal(n.value,'40');assert.equal(t.get('spaceGroundHeight').value,'40');
 const old=t.get('spaceHorizon');t.document.activeElement=old;old.value='72';t.syncSpace();assert.equal(old.value,'72','legacy planting number is also protected while editing');
 t.document.activeElement=null;t.syncSpace();assert.equal(old.value,53);
 const panelNumber=t.get('bgGradeNumber_groundHeight');t.document.activeElement=panelNumber;panelNumber.value='-20';panelNumber.oninput();assert.equal(panelNumber.value,'-20');assert.equal(t.grade().groundHeight,-15);panelNumber.onblur();assert.equal(panelNumber.value,'-15');
});
