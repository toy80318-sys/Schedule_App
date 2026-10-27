const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('docs/app.js','utf8');
const namedCode=source.slice(source.indexOf('  async function namedStore('),source.indexOf('  async function updateSavedLayouts('));
const sampleCode=source.slice(source.indexOf('  async function useSample('),source.indexOf('  window.jejuEditor={'));
function database(){const request={},tx={objectStore:()=>({put:()=>request,delete:()=>request,get:()=>request,getAllKeys:()=>request})};let closed=0;return{request,tx,db:async()=>({transaction:()=>tx,close:()=>closed++}),closed:()=>closed};}
const tick=async()=>{await Promise.resolve();await Promise.resolve();};
(async()=>{
 for(const mode of ['write','delete']){
  const state=database(),named=vm.runInNewContext(namedCode+';namedStore',{db:state.db,Error});let settled=false;
  const pending=named(mode,'named:old',{}).then(()=>{settled=true});await tick();state.request.result='ok';state.request.onsuccess();await tick();assert.equal(settled,false,'request success is not a committed backup');state.tx.oncomplete();await pending;assert.equal(state.closed(),1);
 }
 const state=database(),named=vm.runInNewContext(namedCode+';namedStore',{db:state.db,Error}),error=Error('backup transaction aborted');
 const pending=named('write','named:old',{});await tick();state.request.onsuccess();state.tx.error=error;state.tx.onabort();await assert.rejects(pending,/backup transaction aborted/);assert.equal(state.closed(),1);
 let applied=0,stored=0,sequence=0;const keys=[],snapshots=[];
 const context={objects:[{id:'old'}],uid:()=>String(++sequence),Date:class{toLocaleString(){return'fixed-second'}toISOString(){return'fixed-date'}},window:{jejuEditor:{project:()=>({objects:[{id:'old'}]})}},namedStore:async(mode,key,value)=>{keys.push(key);snapshots.push(value)},applyProject:async()=>{applied++},storeCurrent:async()=>{stored++},updateSavedLayouts:async()=>{},requestAnimationFrame:()=>{},fit(){}};
 const sample=vm.runInNewContext(sampleCode+';useSample',context);await sample({objects:[]});await sample({objects:[]});assert.equal(new Set(keys).size,2,'rapid imports must not overwrite the first backup');assert.equal(applied,2);assert.equal(stored,2);assert(snapshots.every(p=>p.objects[0].id==='old'));
 context.namedStore=async()=>{throw Error('cannot commit backup')};const blocked=vm.runInNewContext(sampleCode+';useSample',context);await assert.rejects(blocked({objects:[]}),/cannot commit backup/);assert.equal(applied,2);assert.equal(stored,2);
 console.log('PASS: backup waits for transaction commit, abort blocks replacement, connections close, same-second scene loads keep distinct original snapshots.');
})().catch(error=>{console.error(error);process.exitCode=1});
