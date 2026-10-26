const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),api=require('../docs/source-download');
(async()=>{
 const c={window:{}};for(const file of ['catalog-data','whole59-data','whole60-data','whole61-data','whole62-data','additions68-data'])vm.runInNewContext(fs.readFileSync('docs/'+file+'.js','utf8'),c);
 const all=api.entries(c.window.jejuFinalCatalog),fresh=api.entries(c.window.jejuFinalCatalog,true);assert.equal(all.length,132);assert.equal(fresh.length,24);assert.equal(new Set(all.map(a=>a.file)).size,132);assert(fresh.every(a=>a.completeObject&&a.stillOnly));
 assert.throws(()=>api.entries({assets:[{...fresh[0],file:'../bad.png'}]}),/목록/);assert.throws(()=>api.entries({assets:[{...fresh[0],src:'https://evil.example/a.png'}]}),/목록/);
 const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0,1,2]),hash=crypto.createHash('sha256').update(bytes).digest('hex'),items=fresh.slice(0,5).map(a=>({...a,sha256:hash}));let packed,progress=[];
 await api.packageSources(items,async()=>({ok:true,arrayBuffer:async()=>bytes.buffer}),files=>{packed=files;return new Blob(['ZIP'])},(...n)=>progress.push(n),crypto.webcrypto);
 assert.equal(packed.length,7);assert.equal(packed[0].name,'PNG/'+items[0].file);assert.equal(progress.length,5);const manifest=JSON.parse(await packed[5].bytes.text());assert.equal(manifest.assets.length,5);assert.equal(manifest.assets[0].lightingId,items[0].lightingId);assert.equal(manifest.assets[0].sha256,hash);
 let zipped=false;await assert.rejects(api.packageSources([{...items[0],sha256:'0'.repeat(64)}],async()=>({ok:true,arrayBuffer:async()=>bytes.buffer}),()=>{zipped=true},()=>{},crypto.webcrypto),/검증/);assert.equal(zipped,false);
 let calls=0;await api.packageSources([items[0]],async()=>++calls===1?{ok:false,status:503}:{ok:true,arrayBuffer:async()=>bytes.buffer},()=>new Blob(['ZIP']),()=>{},crypto.webcrypto);assert.equal(calls,2);
 await assert.rejects(api.packageSources(items,async()=>({ok:false}),()=>{zipped=true},()=>{},crypto.webcrypto),/다운로드 실패/);assert.equal(zipped,false);
 const html=fs.readFileSync('docs/editor.html','utf8');assert(html.includes('data-tab="latest"'));assert(html.includes('source-download.js?v=70'));assert(html.indexOf('source-download.js')>html.indexOf('handoff.js'));
 console.log('PASS:24 new/132 complete original sources, trusted filenames/hosts, byte hash validation, metadata ZIP, no partial download on failure');
})().catch(error=>{console.error(error);process.exitCode=1});
