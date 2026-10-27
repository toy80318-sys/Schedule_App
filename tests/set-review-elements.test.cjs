const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const code=read('docs/set-review-elements.js'),manifestText=read('docs/assets/set-review-v01/manifest.json'),manifest=JSON.parse(manifestText),expected=manifest.backgrounds.flatMap(s=>[...s.flowers,...s.environment]);
assert.equal(manifest.assetVersion,'V05');assert.equal(expected.length,120);
const original={id:'existing-old-element',name:'preserve',nested:{value:1}},background={id:'existing-background',category:'background'},catalog={assets:[original,background],backgrounds:[background],scenes:[{project:{name:'existing'}}]},before=JSON.stringify(catalog),context={window:{jejuFinalCatalog:catalog}};
vm.runInNewContext(code,context);
const elements=context.window.jejuSetReviewElements;
assert.equal(elements.ready,true);assert.equal(elements.version,'V05');assert.equal(elements.assets.length,120);assert.equal(elements.manifestHashEncoding,'UTF-8 LF');assert.equal(elements.manifestSha256,hash(manifestText.replace(/\r\n/g,'\n')));
assert.equal(catalog.assets.length,122);assert.equal(catalog.assets[0],original);assert.equal(catalog.assets[1],background);assert.equal(JSON.stringify({...catalog,assets:catalog.assets.slice(0,2)}),before);
const byId=new Map(elements.assets.map(a=>[a.id,a]));assert.equal(byId.size,120);
for(const scene of manifest.backgrounds){
 const members=elements.assets.filter(a=>a.theme===scene.id);assert.equal(members.length,30);assert.equal(members.filter(a=>a.group==='flowers').length,24);assert.equal(members.filter(a=>a.group==='decor').length,6);
 for(const source of [...scene.flowers,...scene.environment]){
  const a=byId.get(source.id);assert(a);assert.equal(a.file,source.id+'.png');
  for(const key of ['id','name','src','preview','width','height','category','theme','sha256'])assert.equal(a[key],source[key]);
  for(const key of ['design','color'])assert.equal(a[key],source[key]??null);
  for(const key of ['designLabel','colorLabel'])assert.equal(a[key],source[key]);
  assert.equal(a.thumb,source.preview);assert.equal(a.imageStyleVersion,76);assert.equal(a.setReviewVersion,'V05');assert.equal(a.group,source.category==='flower'?'flowers':'decor');
  for(const key of ['completeObject','transparent','stillOnly','lightingBaked','ready'])assert.equal(a[key],true);
  assert(!('sourceRect' in a));assert(!('project' in a));assert.equal(a.kind,'image');assert.notEqual(a.category,'background');
  assert.equal(a.src,'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/'+a.id+'.png');assert.equal(a.preview,'assets/set-review-v01/preview/'+a.id+'.webp');
  assert.equal(hash(fs.readFileSync(path.join(root,'source-assets/set-review-v01',a.id+'.png'))),a.sha256);assert(fs.existsSync(path.join(root,'docs',a.preview)));
 }
}
const registered=catalog.assets.slice();vm.runInNewContext(code,context);assert.equal(catalog.assets.length,122);registered.forEach((a,i)=>assert.equal(catalog.assets[i],a));
const collision={id:expected[0].id,name:'user-preserved',src:'user.png'},collisionContext={window:{jejuFinalCatalog:{assets:[collision],backgrounds:[]}}};vm.runInNewContext(code,collisionContext);assert.equal(collisionContext.window.jejuFinalCatalog.assets.length,120);assert.equal(collisionContext.window.jejuFinalCatalog.assets[0],collision);assert.equal(collision.name,'user-preserved');
const absent={window:{}};vm.runInNewContext(code,absent);assert.equal(absent.window.jejuSetReviewElements.ready,false);
assert(!/fetch\s*\(|XMLHttpRequest|jeju-maze-wall-v1/.test(code),'startup catalog contains metadata only and performs no asynchronous requests');
const check=spawnSync('python',['build_set_review_elements.py','--check'],{cwd:root,encoding:'utf8',env:{...process.env,PYTHONUTF8:'1'}});assert.equal(check.status,0,check.stderr||check.stdout);
console.log('PASS: 120 V05 elements/4 themes, exact manifest metadata and PNG hashes, synchronous startup, no background/old asset mutation, duplicate-safe registration.');
for(const [file,entry] of [['editor.html','app.js'],['player.html','player.js']]){const html=fs.readFileSync(path.join(root,'docs',file),'utf8');assert(html.indexOf('set-review-elements.js')>0);assert(html.indexOf('set-review-elements.js')<html.indexOf('src="'+entry),'full PNG metadata must seed preview/render maps before startup');}
const app=fs.readFileSync(path.join(root,'docs/app.js'),'utf8'),match=app.match(/assets\.filter\(a=>(!a\.catalogHidden.*?)\)\.sort\(\(a,b\)=>/s);assert(match);
const fields={setReviewPaletteTheme:{value:'sunset'},setReviewPaletteKind:{value:''}},scope={tab:'set-v05',$:id=>fields[id]};vm.createContext(scope);const visible=vm.runInContext('(a)=>'+match[1],scope);
for(const theme of ['sunset','day','night','morning']){fields.setReviewPaletteTheme.value=theme;fields.setReviewPaletteKind.value='';assert.equal(elements.assets.filter(visible).length,30);fields.setReviewPaletteKind.value='flower';assert.equal(elements.assets.filter(visible).length,24);for(const kind of ['grass','basalt','tree','cloud','butterfly','leaf']){fields.setReviewPaletteKind.value=kind;assert.equal(elements.assets.filter(visible).length,1)}}
scope.tab='latest';assert(visible({group:'flowers',imageStyleVersion:68}),'older latest24 tab remains available');assert(!elements.assets.some(visible));
const html=fs.readFileSync(path.join(root,'docs/editor.html'),'utf8');for(const id of ['setReviewPaletteTab','setReviewPaletteFilters','setReviewPaletteTheme','setReviewPaletteKind','setReviewLoadScene','setReviewMaster'])assert(html.includes('id="'+id+'"'));
