const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const p=JSON.parse(fs.readFileSync('docs/assets/abstract-butterflies-v97/production.json'));
assert.equal(p.items.length,4);assert.equal(p.submittedCount,4);assert.equal(p.paidRetries,0);assert.equal(p.gameReplacements,0);assert(p.quotedMaximumCredits<=9.6);
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const a of p.items){assert.equal(a.generationStatus,'completed');assert.equal(hash('docs/'+a.sourcePNG),a.sourceSHA256);assert.equal(hash('docs/'+a.rawVideo),a.rawVideoSHA256);assert(a.jobId);assert.equal(a.gameApplied,false);assert(!a.frames&&!a.loopVideo,'a raw candidate is not a released loop');if(a.index<4){assert.equal(a.productionStatus,'rejected');assert.equal(a.review.allOriginalFramesInspected,97);assert.equal(a.review.alphaSequenceReleased,false)}}
assert.equal(p.motionPreview.duration,3);assert.equal(p.motionPreview.frameCount,72);assert.equal(p.motionPreview.gameApplied,false);assert.equal(p.motionPreview.alphaReview,'edge-cleanup-pending');
const current=JSON.parse(fs.readFileSync('docs/assets/element-loops-v95/manifest.json'));for(const a of current.items.filter(a=>a.category==='butterfly'))assert(a.sourcePNG.includes('atmosphere-v84/'),'candidate video must not silently replace the game');
const page=fs.readFileSync('docs/butterflies-oil.html','utf8');assert(page.includes('id="wingbeat-motion"'));assert.equal((page.match(/id="wingbeat-raw-/g)||[]).length,4);assert.equal((page.match(/불합격 · 게임 사용 제외/g)||[]).length,3);assert(page.includes('에디터·게임에 적용하지 않았습니다'));
const before=hash('docs/butterflies-oil.html'),rebuilt=spawnSync('python',['-X','utf8','tools/build-butterfly-review96.py'],{encoding:'utf8'});assert.equal(rebuilt.status,0,rebuilt.stderr);assert.equal(hash('docs/butterflies-oil.html'),before,'page generation must reproduce the reviewed status');
const check=spawnSync('python',['-X','utf8','-c',`from pathlib import Path
import json,zipfile,cv2,numpy as np,subprocess
from PIL import Image
base=Path('../20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96/루프후보_v97')
files=sorted((base/'Butterfly04_PNGAlpha480').glob('*.png'));assert len(files)==72
for i,f in enumerate(files):
 im=Image.open(f);assert im.mode=='RGBA' and im.size==(480,480);a=np.asarray(im)[:,:,3];assert a.max()==255 and a.min()==0 and not a[:3].any() and not a[-3:].any() and not a[:,:3].any() and not a[:,-3:].any()
 assert np.array_equal(np.asarray(im),np.asarray(Image.open(files[i%24]))),'native24-frame cycle is repeated forward without synthesized motion'
with zipfile.ZipFile('docs/'+json.loads(Path('docs/assets/abstract-butterflies-v97/production.json').read_text(encoding='utf-8'))['motionPreview']['sequenceZip']) as z:assert len(z.namelist())==74 and z.testzip() is None
for f in base.glob('*.mp4'):
 c=cv2.VideoCapture(str(f));assert c.get(cv2.CAP_PROP_FPS)==24 and c.get(cv2.CAP_PROP_FRAME_COUNT)==(360 if '5회' in f.name else 72);c.release()
f=next(base.glob('*.webm'));r=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-i',str(f),'-frames:v','1','-f','rawvideo','-pix_fmt','rgba','pipe:1'],capture_output=True);assert r.returncode==0,r.stderr
a=np.frombuffer(r.stdout,np.uint8).reshape(480,480,4)[:,:,3];assert a.min()==0 and a.max()>200
print('72 real RGBA480 candidates,24fps/3sec/5cycle timing,decoded WebM alpha,and ZIP CRC passed;alpha appearance remains pending.')`],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);console.log(check.stdout.trim());console.log('PASS:4 traceable initial generations,3 explicit rejects,1 real wingbeat candidate,and no false game replacement.');
