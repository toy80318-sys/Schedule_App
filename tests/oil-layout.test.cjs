const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
async function check(url,fail=false){
 const elements=new Map(),messages=[],opened=[],replaced=[];
 class El{constructor(){this.children=[];this.style={}}append(...v){this.children.push(...v)}before(v){this.panel=v}}
 const get=id=>{if(!elements.has(id))elements.set(id,new El());return elements.get(id)};
 const data={scenes:['sunset','day','night','morning'].map(id=>({id,name:id,project:{objects:[{id,x:10}]}}))};
 const E={ready:Promise.resolve(),notice:m=>messages.push(m),useSample:async p=>{if(fail)throw Error('backup failed');opened.push(p);p.objects[0].x=25},db:async()=>({transaction:()=>({objectStore:()=>({get:()=>{let req={result:null};queueMicrotask(()=>req.onsuccess());return req}})}),close(){}})};
 const sandbox={window:{jejuEditor:E,jejuFinalCatalog:data,jejuHandoff:{ready:Promise.resolve()}},document:{createElement:()=>new El(),getElementById:get},location:{href:url},history:{replaceState:(_a,_b,u)=>replaced.push(u)},URL,structuredClone};
 await vm.runInNewContext(fs.readFileSync(require.resolve('../docs/oil-scenes.js'),'utf8'),sandbox);
 return {data,opened,replaced,messages,panel:get('items').panel};
}
(async()=>{
 let a=await check('https://example.test/editor.html');assert.equal(a.opened.length,0,'normal startup must retain saved work');assert.equal(a.panel.children.at(-1).href,'oil-art.html');
 a=await check('https://example.test/editor.html?layout=39&scene=morning&keep=1#wall');assert.equal(a.opened.length,1);assert.equal(a.opened[0].objects[0].id,'morning');assert.equal(a.data.scenes[3].project.objects[0].x,10,'catalog project must not be mutated');assert.equal(a.replaced[0],'https://example.test/editor.html?keep=1#wall','consume import request so refresh cannot reset edits');
 a=await check('https://example.test/editor.html?layout=39&scene=invalid');assert.equal(a.opened.length,0);assert.equal(a.replaced.length,0);
 a=await check('https://example.test/editor.html?layout=44&scene=night');assert.equal(a.opened.length,1);assert.equal(a.opened[0].objects[0].id,'night');assert.equal(a.replaced[0],'https://example.test/editor.html');
 a=await check('https://example.test/editor.html?layout=39&scene=day',true);assert.equal(a.opened.length,0);assert.equal(a.replaced.length,0);assert(a.messages.some(m=>m.includes('backup failed')),'failed backup must block replacement');
 const c={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../docs/catalog-data.js'),'utf8'),c);for(const s of c.window.jejuFinalCatalog.scenes){const p=JSON.parse(fs.readFileSync(require.resolve('../docs/assets/abstract-scene-v44/'+s.id+'_editor_layout_v44.json'),'utf8'));assert.equal(JSON.stringify(s.project),JSON.stringify(p));assert.equal(p.objects.length,382);assert.equal(p.objects.filter(o=>o.assetId.includes('-flowers-')).length,114);assert(p.objects.every(o=>o.x>=0&&o.y>=0&&o.x+o.w<=p.width+0.01&&o.y+o.h<=p.height+0.01));}
 console.log('PASS: explicit layout import, saved-work protection, one-time URL, backup failure,4 matching projects and canvas bounds');
})().catch(e=>{console.error(e);process.exitCode=1});
