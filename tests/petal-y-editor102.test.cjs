const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('docs/petal-y-editor102.js','utf8');
test('editor petal preview follows selected flower or background without changing the project',async()=>{
 const state={assets:[{id:'flower',theme:'night'}],background:'https://example.test/BG02-background.png'},selection=[],links=[],listeners={};let reads=0;
 const before=JSON.stringify(state),document={getElementById:id=>id==='currentReleaseControls'?{append:link=>links.push(link)}:links.find(link=>link.id===id),createElement:()=>({}),addEventListener:(name,fn)=>listeners[name]=fn};
 const scope={window:{jejuEditor:{ready:Promise.resolve(),state:()=>{reads++;return state},selected:()=>selection}},document};
 vm.runInNewContext(source,scope);await Promise.resolve();assert.equal(links.length,1);const link=links[0];assert.equal(link.href,'petal-y-loops.html?v=y102&theme=day');assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener');
 selection.push({assetId:'flower'});listeners['jeju-editor-change']();assert(link.href.endsWith('theme=night'));assert.equal(JSON.stringify(state),before);
 state.assets[0].theme='javascript:bad';listeners['jeju-editor-change']();assert(link.href.endsWith('theme=sunset'));
 vm.runInNewContext(source,scope);await Promise.resolve();assert.equal(links.length,1);assert(reads>0);
});
test('missing editor or missing source group leaves other tools untouched',async()=>{
 const document={getElementById:()=>null,createElement:()=>({}),addEventListener(){throw Error('No orphan listener')}};
 vm.runInNewContext(source,{window:{},document});
 vm.runInNewContext(source,{window:{jejuEditor:{ready:Promise.resolve()}},document});await Promise.resolve();
});
