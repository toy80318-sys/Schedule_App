"""Phase-align reviewed whole-object alpha loops to 72 frames; preserve original media."""
from pathlib import Path
import json,hashlib,math,colorsys,subprocess,zipfile,concurrent.futures
import numpy as np
from PIL import Image,ImageDraw
import cv2

repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
delivery=repo.parent/'20261028_메이즈랜드_원본소스/요소루프_480_3초_v95'
public=docs/'assets/element-loops-v95'
old=json.loads((docs/'assets/separated-loops-v88/manifest.json').read_text(encoding='utf-8'))
atmos=json.loads((docs/'assets/atmosphere-v85/manifest.json').read_text(encoding='utf-8'))
accepted={r['name']:r for r in json.loads((repo/'source-assets/atmosphere-v85/accepted.json').read_text(encoding='utf-8'))['assets']}
specs=[]
for a in old['environment']:
    assert a['qa']['visualReview']=='passed'
    files=[delivery.parent/'분리루프_v88'/p for p in a['unityFrames']]
    specs.append((a,files))
for a in atmos['assets']:
    r=accepted[a['file'].removesuffix('.png')];assert r['qa']['passed'] and r['qa']['allFramesReviewed']
    specs.append((dict(id=a['id'],name=a['name'],category=a['category'],sourcePNG=a['src'],sourceSHA256=a['sha256'],compatibleThemes=a['compatibleThemes']),[repo/p for p in r['frames']]))
assert len(specs)==28
for p in [delivery/'PNG알파',delivery/'영상',delivery/'검수',delivery/'다운로드',public]:p.mkdir(parents=True,exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def encoder(path,alpha):
    codec=['-c:v','libvpx-vp9','-pix_fmt','yuva420p','-auto-alt-ref','0','-b:v','0','-crf','24','-deadline','good','-cpu-used','5'] if alpha else ['-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','fast','-movflags','+faststart']
    return subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba' if alpha else 'rgb24','-s','480x480','-r','24','-i','pipe:0','-an','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv',*codec,'-threads','2',str(path)],stdin=subprocess.PIPE,stderr=subprocess.PIPE)
def periodic_atmosphere(files,category):
    base=np.asarray(Image.open(files[0]).convert('RGBA'));small=cv2.resize(base,(160,160));premult=small[:,:,:3].astype(np.float32)*(small[:,:,3:4]/255)
    gray=cv2.cvtColor(premult.astype(np.uint8),cv2.COLOR_RGB2GRAY);flows=[];design=[]
    for i in range(12):
        phase=i/12*math.tau;sample=np.asarray(Image.open(files[i*len(files)//12]).convert('RGBA'));tiny=cv2.resize(sample,(160,160));g=cv2.cvtColor(np.uint8(tiny[:,:,:3]*(tiny[:,:,3:4]/255)),cv2.COLOR_RGB2GRAY)
        flows.append(cv2.calcOpticalFlowFarneback(gray,g,None,.5,3,19,3,5,1.2,0));design.append([1,math.sin(phase),math.cos(phase),math.sin(phase*2),math.cos(phase*2)])
    coefficients=np.linalg.lstsq(np.asarray(design),np.asarray(flows).reshape(12,-1),rcond=None)[0].reshape(5,160,160,2)
    coefficients[0]=0
    limit=7 if category=='butterfly' else 2.5
    scale=max(1,float(np.abs(coefficients).max())*3*3/limit);coefficients/=scale
    y,x=np.mgrid[:480,:480].astype(np.float32);source=base.astype(np.float32);source[:,:,:3]*=source[:,:,3:4]/255;frames=[]
    for i in range(72):
        phase=i/72*math.tau;flow=np.tensordot([1,math.sin(phase),math.cos(phase),math.sin(phase*2),math.cos(phase*2)],coefficients,axes=1);flow=cv2.resize(flow,(480,480))*3
        flow-=flow[240,240];flow=flow.astype(np.float32);f=cv2.remap(source,x-flow[:,:,0],y-flow[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        np.divide(f[:,:,:3]*255,f[:,:,3:4],out=f[:,:,:3],where=f[:,:,3:4]>0);frames.append(np.uint8(np.clip(np.round(f),0,255)))
    return frames
def build(spec):
    a,files=spec;assert len(files) in [96,150] and all(p.is_file() for p in files)
    record=delivery/'검수'/(a['id']+'_검증.json')
    if record.exists():
        cached=json.loads(record.read_text(encoding='utf-8'));assert cached['sourceSHA256']==a['sourceSHA256']
        if cached.get('renderRevision')==2:return cached
    indices=[math.floor(i*len(files)/72) for i in range(72)]
    frames=periodic_atmosphere(files,a['category']) if len(files)==150 else [np.asarray(Image.open(files[i]).convert('RGBA')) for i in indices];assert all(f.shape==(480,480,4) for f in frames)
    # Choose the dominant chromatic hue's opposite; retained PNG alpha avoids destroying translucent glow.
    f=frames[0].astype(float);weight=(f[:,:,3]/255)*(f[:,:,:3].max(2)-f[:,:,:3].min(2));rgb=(f[:,:,:3]*weight[:,:,None]).sum((0,1))/max(weight.sum(),1)
    hue=colorsys.rgb_to_hsv(*(rgb/255))[0];key=np.array([round(v*255) for v in colorsys.hsv_to_rgb((hue+.5)%1,1,1)],np.uint8)
    keyhex='#'+''.join(f'{v:02X}' for v in key)
    target=public/a['id'];target.mkdir(exist_ok=True)
    stem=a['id'].replace('-','_')+'_Loop3s_480_v95'
    alpha=encoder(target/'alpha.webm',True);chroma=encoder(target/'key.mp4',False)
    hashes=[];alphaFailures=[];borderFailures=[]
    sheet=Image.new('RGB',(960,12*100),'#172334');d=ImageDraw.Draw(sheet)
    for i,frame in enumerate(frames):
        im=Image.fromarray(frame);file=delivery/'PNG알파'/f'{stem}_{i:04}.png';im.save(file,compress_level=3);hashes.append(sha(file))
        reread=np.asarray(Image.open(file));assert np.array_equal(reread,frame),'No introduced alpha holes or RGB changes'
        if np.any(frame[:2,:,3]) or np.any(frame[-2:,:,3]) or np.any(frame[:,:2,3]) or np.any(frame[:,-2:,3]):borderFailures.append(i)
        im.resize((128,128),Image.Resampling.LANCZOS).save(target/f'frame_{i:04}.webp',quality=92,method=4)
        opacity=frame[:,:,3:4].astype(float)/255;keyframe=np.uint8(np.round(frame[:,:,:3]*opacity+key*(1-opacity)))
        alpha.stdin.write(frame.tobytes());chroma.stdin.write(keyframe.tobytes())
        tile=Image.new('RGBA',(80,80),'#f2e9df' if i%2 else '#12192d');tile.alpha_composite(im.resize((80,80)));x=i%12*80;y=i//12*200;sheet.paste(tile.convert('RGB'),(x,y));d.text((x+2,y+82),str(i),fill='white')
        other=Image.new('RGBA',(80,80),'#12192d' if i%2 else '#f2e9df');other.alpha_composite(im.resize((80,80)));sheet.paste(other.convert('RGB'),(x,y+100))
    for process in [alpha,chroma]:process.stdin.close();error=process.stderr.read();assert process.wait()==0,error
    assert not borderFailures, (a['id'],borderFailures)
    visible=[np.dstack([f[:,:,:3].astype(float)*(f[:,:,3:4]/255),f[:,:,3]]) for f in frames]
    diffs=[float(np.abs(x-y).mean()) for x,y in zip(visible,visible[1:])];seam=float(np.abs(visible[-1]-visible[0]).mean());assert seam<=max(diffs)*1.3+.03,(a['id'],seam,max(diffs))
    for file in [target/'key.mp4',target/'alpha.webm']:
        cap=cv2.VideoCapture(str(file));assert cap.get(cv2.CAP_PROP_FPS)==24 and cap.get(cv2.CAP_PROP_FRAME_COUNT)==72;cap.release()
    sheet.save(delivery/'검수'/f'{a["id"]}_72프레임.jpg',quality=95)
    for suffix in ['key.mp4','alpha.webm']:
        out=delivery/'영상'/(stem+'_'+suffix);out.write_bytes((target/suffix).read_bytes())
    rel=target.relative_to(docs).as_posix()
    result={**a,'name':a['name'].replace('5초','3초'),'fps':24,'duration':3,'width':480,'height':480,'previewWidth':128,'previewHeight':128,'frames':[f'{rel}/frame_{i:04}.webp' for i in range(72)],'loopVideo':rel+'/alpha.webm','keyVideo':rel+'/key.mp4','keyColor':keyhex,'sequenceZip':'https://github.com/toy80318-sys/Schedule_App/releases/download/mazeland-elements-3s-v95/'+a['category']+'_Loop3s_PNGAlpha480_v95.zip','sourceFrameIndices':indices,'originalCycleFrameCount':len(files),'alphaWebM_SHA256':sha(target/'alpha.webm'),'keyMP4_SHA256':sha(target/'key.mp4'),'nativePNGPattern':str(delivery/'PNG알파'/(stem+'_%04d.png')),'pngSHA256':hashes,'derivation':'Phase resampling of the reviewed original RGBA cycle; not a new paid AI generation; true source alpha preserved rather than lossy round-trip key extraction.','qa':{'framesChecked':72,'introducedAlphaHolePixels':0,'borderFailures':borderFailures,'seamMAE':seam,'maximumAdjacentMAE':max(diffs),'visualReview':'pending'}}
    if len(files)==150:
        result['sourceFrameIndices']=None;result['derivation']='Whole-object RGBA reference with bounded periodic optical-flow Fourier fit from the reviewed cycle; discontinuous original seam removed. Not a new paid AI generation.'
    result['renderRevision']=2;result['colorSpace']='BT.709 limited range, explicitly converted from RGB'
    (delivery/'검수'/(a['id']+'_검증.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('RENDERED '+a['id'],flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:rows=list(ex.map(build,specs))
result={'format':'mazeland-element-loops-v95','version':95,'count':28,'items':rows}
(delivery/'요소루프_제작목록_v95.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('28 loops rendered; visual review still required, no automatic registration.')
