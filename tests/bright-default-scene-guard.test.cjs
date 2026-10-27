const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('docs/whole62-scenes.js','utf8');
const code=source.slice(source.indexOf(' const u=new URL(location.href);'),source.indexOf(' if(E.state?.().objects.every'));
async function run(marker,query=''){
 const opened=[],replaced=[],scene={id:'sunset'},state={objects:[]};if(marker!==undefined)state.backgroundDefaultVersion=marker;
 const context={URL,location:{href:'https://example.test/editor.html'+query},E:{state:()=>state,notice(){}},data:{scenes:[scene]},window:{},unchanged:()=>true,open:async s=>opened.push(s.id),history:{replaceState:(a,b,url)=>replaced.push(url)}};
 await vm.runInNewContext('(async()=>{'+code+'})()',context);return{opened,replaced};
}
(async()=>{
 for(const marker of [0,80])assert.deepEqual((await run(marker)).opened,[],'new startup owns success and protected failure; legacy auto-open must not change flowers');
 assert.deepEqual((await run(undefined)).opened,['sunset'],'legacy editor behavior remains compatible');
 const explicit=await run(80,'?objects=62&scene=sunset');assert.deepEqual(explicit.opened,['sunset']);assert.equal(explicit.replaced.length,1,'explicit old-layout request still works');
 assert.deepEqual((await run(undefined,'?layers=55')).opened,[]);
 console.log('PASS: bright-background startup blocks legacy automatic flower replacement; explicit archived layouts remain available.');
})().catch(error=>{console.error(error);process.exitCode=1});
