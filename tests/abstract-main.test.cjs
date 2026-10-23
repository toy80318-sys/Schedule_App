const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const read=n=>fs.readFileSync(require.resolve('../docs/'+n),'utf8');
const sceneManifest=JSON.parse(read('assets/air-particles-v51/scene_manifest_v51.json'));
const mainCode=[...read('index.html').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('const scenes='));
function main(search=''){
 const elements=new Map(),urls=[],classes=[];const get=id=>{if(!elements.has(id))elements.set(id,{children:[],style:{},parentElement:{style:{}},append(v){this.children.push(v)},setAttribute(k,v){this[k]=v}});return elements.get(id)};
 const sandbox={URL,URLSearchParams,location:{search,href:'https://example.test/Schedule_App/'+search},history:{replaceState(a,b,u){urls.push(String(u))}},document:{getElementById:get,createElement:()=>({dataset:{},setAttribute(k,v){this[k]=v}}),body:{classList:{add:v=>classes.push(v)}},documentElement:{requestFullscreen(){}},exitFullscreen(){}}};
 vm.runInNewContext(mainCode,sandbox);return {get,urls,classes};
}
let page=main('?embed=1&theme=night');assert(page.classes.includes('embed'));assert(page.get('garden').alt.includes('추상 유화'));
for(const b of page.get('themes').children){b.onclick();const e=sceneManifest.entries.find(e=>e.theme===b.dataset.theme&&e.kind==='IntegratedBloom');assert.equal(page.get('garden').src,e.preview);assert.equal(page.get('garden').parentElement.style.aspectRatio,e.width+'/'+e.height);assert.equal(b['aria-pressed'],'true');assert(page.urls.at(-1).includes('theme='+b.dataset.theme));}
page=main('?theme=unknown');assert(page.get('garden').src.includes('BG01'));assert(!read('index.html').includes('_20261021_v19'));assert(read('index-v19-archive.html').includes('_20261021_v19'));
const catalogSandbox={window:{}};vm.runInNewContext(read('catalog-data.js'),catalogSandbox);const catalog=catalogSandbox.window.jejuFinalCatalog;
assert.equal(catalog.sourceFiles.length,104);assert(catalog.sourceFiles.every(f=>/\.png$/.test(f.relativePath)&&/\/(?:release-20261022-v44|release-20261023-v49|abstract-flowers-v43)\//.test(f.stablePreviewUrl)));
const app=read('app.js'),registerCode=app.slice(app.indexOf('function registerCatalog'),app.indexOf('function replaceSelection'));
const objects=[{id:'saved-flower',assetId:catalog.assets[0].id,x:314,y:812,w:300,h:400}],original=JSON.stringify(objects);
const context={window:{jejuAmbient:{atmosphereKind:()=>null}},currentPreviews:new Map(catalog.assets.map(a=>[a.src,a.thumb])),builtins:structuredClone(catalog.assets.filter(a=>a.category!=='background')),assets:structuredClone(catalog.assets),objects,background:catalog.backgrounds[0].src,backgroundChoices:[],backgroundVideos:{},currentFlowerAsset:a=>a,renderPalette(){},refresh(){},$:()=>({replaceChildren(){},append(){}}),document:{createElement:()=>({})}};
const register=vm.runInNewContext(registerCode+'registerCatalog',context);assert.equal(register(catalog),80);assert.equal(JSON.stringify(objects),original,'catalog refresh must preserve saved positions');
for(const src of ['https://example.test/untrusted.png','https://toy80318-sys.github.io/Schedule_App/assets/abstract-flowers-v43/fake.png','https://lixkizqprsbnsnozwbpa.supabase.co/storage/v1/object/public/jeju-maze-v14/../fake.png'])assert.throws(()=>register({assets:[{id:'bad',src,category:'flower'}],backgrounds:[]}));
assert(read('site-nav.js').includes("['index.html', '메인']"));
console.log('PASS: all4 main scenes use complete v51 images, embed/theme/fallback behavior,104 current originals, trusted catalog registration and saved-layout protection.');
