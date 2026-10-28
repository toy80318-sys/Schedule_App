const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const data=JSON.parse(fs.readFileSync('docs/assets/separated-loops-v88/manifest.json')),A=require('../docs/ambient-policy'),M=require('../docs/separated-motion');
class Element{constructor(tag){this.tag=tag;this.children=[];this.style={}}append(...items){this.children.push(...items)}before(item){this.beforeItem=item}setAttribute(key,value){this[key]=value}}
const sections=new Element('sections'),document={createElement:tag=>new Element(tag),querySelector:selector=>{assert.equal(selector,'#sections');return sections}};
const walk=e=>[e,...e.children.flatMap(walk)];
(async()=>{
 vm.runInNewContext(fs.readFileSync('docs/separated-loop-gallery.js','utf8'),{document,window:{jejuAmbient:A,jejuSeparatedMotion:M},fetch:async()=>({ok:true,json:async()=>structuredClone(data)})});await new Promise(setImmediate);
 const all=walk(sections.beforeItem),images=all.filter(e=>e.tag==='img'),videos=all.filter(e=>e.tag==='video'),links=all.filter(e=>e.tag==='a');
 assert.equal(images.length,12);assert.equal(videos.length,4);assert.equal(all.filter(e=>e.tag==='article').length,16);assert(all.every(e=>!/-E06-/.test(e.id||'')));
 assert.deepEqual(videos.map(e=>e.src),data.backgrounds.map(b=>b.video));assert(images.every(e=>/^assets\/separated-loops-v88\/BG0[1-4]-E0[125]-V05\/still\.png$/.test(e.src)));
 assert.equal(links.filter(e=>e.download?.endsWith('.png')).length,12);assert(links.every(e=>!/(?:alpha\.webm|key\.mp4|PNG_ALPHA|\.zip)/.test(e.href)));
 const protectedFiles=['manifest.json',...['sunset','day','night','morning'].flatMap(t=>[t+'_editor_v99.json',t+'_Unity_layout_v99.csv'])],hash=p=>crypto.createHash('sha256').update(fs.readFileSync('docs/assets/game-layout-v99/'+p)).digest('hex'),before=protectedFiles.map(hash);
 execFileSync(process.execPath,['tools/export-media-playback99.cjs','--gallery-only']);assert.deepEqual(protectedFiles.map(hash),before,'gallery refresh must never re-export saved gameplay layouts');
 const gallery=fs.readFileSync('docs/element-loops.html','utf8');assert.equal((gallery.match(/data-kind="static-environment"/g)||[]).length,12);assert.equal((gallery.match(/data-kind="static-bush"/g)||[]).length,4);assert.equal((gallery.match(/data-kind="static-rock"/g)||[]).length,4);assert.equal((gallery.match(/<video /g)||[]).length,14);assert(!/element-loops-v95\/BG0[1-4]-E0[1256]-V05/.test(gallery));
 console.log('PASS: rendered12 PNGs/4 unchanged background videos, no retired leaves or environment video/ZIP links;7 separate loops/8 rear PNGs and gallery-only export preserve every existing layout byte.');
})().catch(error=>{console.error(error);process.exitCode=1});
