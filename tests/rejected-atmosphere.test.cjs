const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),S=require('../docs/source-collection');
const read=p=>fs.readFileSync('docs/'+p,'utf8'),full=JSON.parse(read('assets/current-release-v86/manifest.json')),lite=JSON.parse(read('assets/web-v87/collection.json'));
for(const data of [full,lite]){
 const before=JSON.stringify(data),hidden=data.assets.filter(a=>a.catalogHidden),active=S.select(data),particles=S.select(data,'all','atmosphere');
 assert.equal(data.assets.length,80);assert.equal(hidden.length,8);assert(hidden.every(a=>/^atmosphere85-(cloud|butterfly)-0[1-4]$/.test(a.id)&&a.useStatus==='rejected-by-user'));
 assert.equal(active.length,72);assert(!active.some(a=>hidden.some(h=>h.id===a.id)));assert.equal(particles.length,4);assert(particles.every(a=>a.category==='particle'));
 for(const theme of ['sunset','day','night','morning'])assert.equal(S.select(data,theme,'atmosphere').length,4);
 assert.equal(JSON.stringify(data),before,'source selection preserves canonical assets and layout references');
}
for(const [file,data]of [['current-release.js',full],['web-collection.js',lite]]){const context={window:{}};vm.runInNewContext(read(file),context);assert.deepEqual(JSON.parse(JSON.stringify(context.window.jejuCurrentRelease)),data)}
const context={module:{exports:{}},jejuButterflyLoopData:{},jejuButterflyLoops:{asset:a=>({...a,name:'replacement wingbeat'})}};vm.runInNewContext(read('source-collection.js'),context);assert.equal(context.module.exports.select(lite,'all','atmosphere').length,4,'artwork overrides preserve hidden status');
console.log('PASS: source galleries show 72 active sources and4 particles, while8 rejected rows, media metadata and saved references remain intact.');
