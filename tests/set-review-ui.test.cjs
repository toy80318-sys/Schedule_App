const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const web=path.resolve(__dirname,'../docs'),source=fs.readFileSync(path.join(web,'set-review.js'),'utf8'),html=fs.readFileSync(path.join(web,'set-review.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(web,'assets/set-review-v01/manifest.json'),'utf8'));
const extract=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert(a>=0&&b>a,'UI function extraction point missing');return source.slice(a,b);};

const validate=vm.runInNewContext(extract('  function safeURL','  function reviewKey')+';validateManifest',{URL,document:{baseURI:'https://toy80318-sys.github.io/Schedule_App/set-review.html'},location:{origin:'https://toy80318-sys.github.io'},expectedThemes:['sunset','day','night','morning']});
assert.equal(validate(manifest).backgrounds.length,4);
const fixture=()=>({format:'jeju-set-review-v1',version:'V01',backgrounds:['sunset','day','night','morning'].map((id,i)=>({id,code:'BG0'+(i+1),label:id,integrated:[{id:id+'-I01',src:'assets/'+id+'-I01.png'}],backgrounds:[{id:id+'-B01',src:'assets/'+id+'-B01.png'}],flowers:[],environment:[],project:'assets/'+id+'.json',unityLayout:'assets/'+id+'-unity.json'}))});
for(const change of [
  value=>value.backgrounds.pop(),
  value=>value.backgrounds[1].id='sunset',
  value=>value.backgrounds[0].project='javascript:alert(1)',
  value=>value.backgrounds[0].integrated[0].src='data:text/html,unsafe',
  value=>value.backgrounds[0].flowers.push({id:'unsafe',src:'https://user:secret@example.com/a.png'}),
  value=>value.backgrounds[0].backgrounds[0].id='sunset-I01',
  value=>value.backgrounds[0].environment=null
]){const value=fixture();change(value);assert.throws(()=>validate(value));}

const storageCode='let manual={};'+extract('  try{const saved','  const el=')+';manual';
for(const input of ['null','42','"bad"','[]','true','{broken'])assert.equal(Object.keys(vm.runInNewContext(storageCode,{localStorage:{getItem:()=>input},manualKey:'test'})).length,0,'malformed browser storage must leave the record map empty');
assert.equal(vm.runInNewContext(storageCode,{localStorage:{getItem:()=>'{"ok":{"status":"확인"}}'},manualKey:'test'}).ok.status,'확인');

const asset={id:'BG04-F01-C02-V01',sha256:'flower-v1',src:'assets/flower.png'},I02={id:'BG04-I02',version:'V02',src:'assets/I02.png',sha256:'reference-2'},I01={id:'BG04-I01',version:'V01',src:'assets/I01.png',sha256:'reference-1'};
const manual={'BG04-F01-C02-V01|flower-v1':{status:'확인',comment:'legacy review without a reference'}},context={manual,manualKey:'test',referenceEntry:I02,localStorage:{setItem(){}},status(){}};
vm.createContext(context);
const review=vm.runInContext(extract('  function reviewKey','  function structuralCheck')+';({reviewKey,manualReview,saveReview})',context);
assert.equal(review.manualReview(asset).status,'미검토','legacy unbound approvals cannot carry over');
review.saveReview(asset,{status:'확인',comment:'matches I02'});
assert.equal(review.manualReview(asset).status,'확인');
context.referenceEntry=I01;
assert.equal(review.manualReview(asset).status,'미검토','I02 approval must not approve I01');
context.referenceEntry=I02;
assert.equal(review.manualReview(asset).status,'확인','returning to I02 restores only the I02 review');
assert.equal(review.manualReview({...asset,sha256:'flower-v2'}).status,'미검토','asset hash changes invalidate approval');
assert.equal(review.manualReview(asset,{...I02,sha256:'new-reference-content'}).status,'미검토','reference hash changes invalidate approval');
const pathReference={id:'path-only-I02',src:'assets/reference-a.png'};
review.saveReview(asset,{status:'확인',comment:'path-bound review'},pathReference);
assert.equal(review.manualReview(asset,{...pathReference,src:'assets/reference-b.png'}).status,'미검토','exact reference paths bind reviews when SHA is unavailable');
context.referenceEntry=I01;
review.saveReview(asset,{status:'수정필요',comment:'old detached control'},I02);
assert.equal(review.manualReview(asset).status,'미검토','a detached control cannot save against the newly selected reference');
assert.equal(review.manualReview(asset,I02).status,'수정필요');
manual[review.reviewKey(asset,I01)]={status:'invalid',comment:'x'.repeat(1500)};
assert.equal(review.manualReview(asset,I01).status,'미검토');
assert.equal(review.manualReview(asset,I01).comment.length,1000);
assert(source.includes('const reviewReference=referenceEntry'),'each card must capture its own review reference');
assert(source.includes('comment:comment.value},reviewReference)'),'saved card changes must use the captured reference');
assert(source.includes('if(refreshReviews){fillBackgrounds(selected);fillFlowers(selected);fillEnvironment(selected);}'),'all manual controls must refresh after an integrated reference change');
assert(source.includes("$('integratedVersion').onchange=()=>showReference(true)"));

const slots=vm.runInNewContext(extract('  function flowerSlots','  function fillFlowers')+';flowerSlots');
assert.equal(slots({flowers:[]}).length,24);
for(const set of manifest.backgrounds)assert.equal(slots(set).length,0,set.id+' must expose every design-color slot');
const partial=structuredClone(manifest.backgrounds[0]);partial.flowers.pop();assert.equal(slots(partial).length,1);
const classify=vm.runInNewContext(extract('  function assetCategory','  function audit')+';assetCategory');
for(const set of manifest.backgrounds){
  const assets=[...set.integrated,...set.backgrounds,...set.flowers,...set.environment],counts={};
  for(const item of assets){const category=classify(item,set);counts[category]=(counts[category]||0)+1;}
  assert.equal(counts.flower,24,set.id+' flower count');
  assert.equal(counts.background,2,set.id+' background count');
  assert.equal(counts.integrated,2,set.id+' integrated count');
  assert.equal(Object.entries(counts).filter(([key])=>!['flower','background','integrated'].includes(key)).reduce((total,[,count])=>total+count,0),6,set.id+' environment count');
  assert.equal(assets.length,34);
}
assert(source.includes('category:assetCategory(a)'),'audit records must use the tested category classifier');
for(const id of [...source.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]))assert(html.includes('id="'+id+'"'),'missing HTML element '+id);
assert(fs.readFileSync(path.join(web,'set-review.css'),'utf8').includes('object-fit:contain'),'comparison frames preserve the source aspect ratios');
assert(source.includes('if(token!==renderToken)return'),'older renders cannot replace the latest selected set');
console.log('PASS: reference-bound review transitions and hash/path invalidation, legacy/malformed review storage, captured card references, safe manifest metadata, all24 flower slots, per-theme audit24/2/2/6 categories and complete UI wiring.');
