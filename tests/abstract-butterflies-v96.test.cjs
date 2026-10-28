const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const m=JSON.parse(fs.readFileSync('docs/assets/abstract-butterflies-v96/manifest.json'));
assert.equal(m.items.length,4);assert.equal(m.paidVideoJobsSubmitted,0);assert.equal(m.videoApproval,false);assert.equal(new Set(m.items.map(a=>a.sourceSHA256)).size,4);
for(const a of m.items){assert.equal(a.imageReview,'passed');assert.equal(a.videoStatus,'awaiting-cost-approval');assert.notEqual(a.sourceSHA256,a.originalSourceSHA256);assert.equal(crypto.createHash('sha256').update(fs.readFileSync('docs/'+a.sourcePNG)).digest('hex'),a.sourceSHA256);assert(!a.loopVideo&&!a.frames,'new art must not reuse a differently styled old video');assert.equal(a.width,1024);assert.equal(a.height,1024)}
const code=`from pathlib import Path
import json,hashlib,zipfile
import numpy as np
from PIL import Image
m=json.loads(Path('docs/assets/abstract-butterflies-v96/manifest.json').read_text(encoding='utf-8'))
for a in m['items']:
 im=Image.open('docs/'+a['sourcePNG']);assert im.mode=='RGBA' and im.size==(1024,1024)
 alpha=np.asarray(im)[:,:,3];assert not any(np.any(v) for v in [alpha[:100],alpha[-100:],alpha[:,:100],alpha[:,-100:]])
 key=Image.open('docs/'+a['keyImage']);assert key.mode=='RGB' and key.size==(1024,1024);rgb=tuple(bytes.fromhex(a['keyColor'][1:]));assert all(key.getpixel(p)==rgb for p in [(0,0),(1023,0),(0,1023),(1023,1023)])
 old=Path('source-assets/atmosphere-v84')/('butterfly_'+str(a['index']).zfill(2)+'.png');assert hashlib.sha256(old.read_bytes()).hexdigest()==a['originalSourceSHA256']
with zipfile.ZipFile('docs/assets/abstract-butterflies-v96/Butterfly_AbstractOil3x_4PNG_v96.zip') as z:assert z.testzip() is None and len(z.namelist())==5
print('RGBA1024/padding/complementary solid inputs/original SHA/ZIP verified.')`;
const r=spawnSync('python',['-X','utf8','-c',code],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);console.log(r.stdout.trim());
const page=fs.readFileSync('docs/butterflies-oil.html','utf8');assert.equal((page.match(/<article id="butterfly-/g)||[]).length,4);assert(page.includes(fs.existsSync('docs/assets/abstract-butterflies-v97/production.json')?'실제 날갯짓':'생성 비용 확인 대기'));for(const f of ['docs/atmosphere-loops.html','docs/element-loops.html'])assert(fs.readFileSync(f,'utf8').includes('butterflies-oil.html?v=20261028-v97#wingbeat-motion'));
console.log('PASS:4 newly generated whole-object butterfly images,real alpha,matching key inputs,original preservation and honest video-pending display.');
