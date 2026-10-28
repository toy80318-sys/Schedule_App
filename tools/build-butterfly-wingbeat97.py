"""Extract a real forward wingbeat cycle; retain its native timing and source pixels."""
from pathlib import Path
import cv2,numpy as np,json,hashlib,subprocess,sys
from PIL import Image,ImageDraw

repo=Path(__file__).resolve().parents[1];base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
index,version,start,period=map(int,sys.argv[1:]) if len(sys.argv)>1 else (4,97,26,24)
assert index in [1,2,3,4] and version in [97,98] and period in [8,9,12,18,24,36,72] and start>=0
target=base/f'루프후보_v{version}';target.mkdir(exist_ok=True)
frames_dir=target/f'Butterfly{index:02}_PNGAlpha480';frames_dir.mkdir(exist_ok=True)
raw_version=97 if index==4 else version
raw=base/f'원본영상_v{raw_version}'/f'ML_SHARED_Butterfly{index:02}_Wingbeat_Raw_v{raw_version}.mp4'
original_info=json.loads((base/'검수'/f'Butterfly{index:02}_원본검수_v{raw_version}.json').read_text(encoding='utf-8'))
assert hashlib.sha256(raw.read_bytes()).hexdigest()==original_info['sha256']
side=next(a for a in json.loads((base/'측면이미지4종_v97.json').read_text(encoding='utf-8')) if a['index']==index)
paint_file=repo/'docs'/side['sourcePNG'];assert hashlib.sha256(paint_file.read_bytes()).hexdigest()==side['sourceSHA256']
paint=np.asarray(Image.open(paint_file))

def matte(rgb):
    f=rgb.astype(np.float32);bg=np.median(np.concatenate([f[:,:4],f[:,-4:]],axis=1),axis=1)[:,None,:];bg=np.repeat(bg,f.shape[1],axis=1)
    delta=f-bg;distance=np.linalg.norm(delta,axis=2)
    hue=np.linalg.norm(f/np.maximum(f.max(2,keepdims=True),1)-bg/np.maximum(bg.max(2,keepdims=True),1),axis=2)
    # Eroded opaque paint avoids baking cyan mixed pixels into the wing edge.
    cyan_mix=(f[:,:,0]<np.minimum(f[:,:,1],f[:,:,2])*.55)&(np.abs(f[:,:,1]-f[:,:,2])<40)
    core=cv2.erode(((hue>.4)&(distance>80)&~cyan_mix).astype(np.uint8),np.ones((3,3),np.uint8)).astype(bool)
    # Dark painted body pixels are opaque foreground; cyan shadows retain the key hue.
    core|=(f.max(2)<bg.max(2)*.5)&(distance>100)&(hue>.2)
    assert core.any()
    spatial,labels=cv2.distanceTransformWithLabels((~core).astype(np.uint8),cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    palette=np.zeros((int(labels.max())+1,3),np.float32);palette[labels[core]]=f[core];foreground=palette[labels];direction=foreground-bg
    a=np.clip(np.sum(delta*direction,2)/np.maximum(np.sum(direction*direction,2),1),0,1)
    # Cyan-key shadows cannot add red; use that independent evidence at mixed edges.
    red=np.clip(delta[:,:,0]/np.maximum(direction[:,:,0],1),0,1);a=np.minimum(a,red)
    a[core]=1;a[(spatial>20)|(hue<.14)|(a<.10)|((spatial>6)&(a<.65))]=0;a[a>.98]=1
    color=rgb.copy();edge=(a>0)&~core
    # Solve mixed-edge colors without quantizing the original painting.
    color[edge]=np.uint8(np.clip(np.round((f[edge]-(1-a[edge,None])*bg[edge])/np.maximum(a[edge,None],.001)),0,255))
    assert np.array_equal(color[core],rgb[core]) and np.all(a[core]==1),'Opaque paint must stay opaque and unchanged'
    return np.dstack([color,np.uint8(np.round(a*255))]),int(core.sum())

cap=cv2.VideoCapture(str(raw));assert cap.get(cv2.CAP_PROP_FPS)==24;original=[]
while True:
    ok,bgr=cap.read()
    if not ok:break
    original.append(cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB))
cap.release();assert len(original)==original_info['frameCount'] and start+period<len(original)
cycle=[];core_counts=[]
for k in range(start,start+period):
    rgba,n=matte(original[k]);core_counts.append(n);cycle.append(Image.fromarray(rgba).resize((480,480),Image.Resampling.LANCZOS))
indices=[start+i%period for i in range(72)];frames=[cycle[i%period] for i in range(72)]
key=np.array(list(bytes.fromhex(side['keyColor'][1:])),np.uint8)
def encoder(file,alpha,repeat=1):
    codec=['-c:v','libvpx-vp9','-pix_fmt','yuva420p','-auto-alt-ref','0','-b:v','0','-crf','22','-deadline','good','-cpu-used','5'] if alpha else ['-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','fast','-movflags','+faststart']
    p=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba' if alpha else 'rgb24','-s','480x480','-r','24','-i','pipe:0','-an','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv',*codec,'-threads','2',str(file)],stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    for _ in range(repeat):
        for im in frames:
            f=np.asarray(im)
            if not alpha:
                a=f[:,:,3:4]/255;f=np.uint8(np.round(f[:,:,:3]*a+key*(1-a)))
            p.stdin.write(f.tobytes())
    p.stdin.close();err=p.stderr.read();assert p.wait()==0,err

hashes=[];sheets={c:Image.new('RGB',(1440,300*6),color) for c,color in [('dark','#142036'),('light','#f1e8de')]}
for i,im in enumerate(frames):
    f=np.asarray(im);assert not any(np.any(v) for v in [f[:3,:,3],f[-3:,:,3],f[:,:3,3],f[:,-3:,3]])
    file=frames_dir/f'ML_SHARED_Butterfly{index:02}_Wingbeat_v{version}_{i:04}.png';im.save(file,compress_level=3);assert np.array_equal(np.asarray(Image.open(file)),f);hashes.append(hashlib.sha256(file.read_bytes()).hexdigest())
    for name,color in [('dark','#142036'),('light','#f1e8de')]:
        tile=Image.new('RGBA',(120,280),color);tile.alpha_composite(im.resize((120,120)),(0,5));tile.alpha_composite(im.crop((180,150,340,280)).resize((120,98)),(0,140));ImageDraw.Draw(tile).text((4,245),f'{i:02} / raw{indices[i]:02}',fill='white' if name=='dark' else 'black');sheets[name].paste(tile.convert('RGB'),(i%12*120,i//12*300))
for name,sheet in sheets.items():sheet.save(base/'검수'/f'Butterfly{index:02}_72프레임_{name}_v{version}.jpg',quality=96)
encoder(target/f'ML_SHARED_Butterfly{index:02}_Wingbeat_Key_480_3s_v{version}.mp4',False)
encoder(target/f'ML_SHARED_Butterfly{index:02}_Wingbeat_Alpha_480_3s_v{version}.webm',True)
encoder(target/f'ML_SHARED_Butterfly{index:02}_Wingbeat_5회확인_v{version}.mp4',False,5)
arr=np.stack([np.asarray(f).astype(np.float32) for f in cycle]);arr[:,:,:,:3]*=arr[:,:,:,3:]/255
adj=np.abs(arr[1:]-arr[:-1]).mean((1,2,3));seam=float(np.abs(arr[-1]-arr[0]).mean());velocity=float(np.abs((arr[0]-arr[-1])-(arr[1]-arr[0])).mean());assert seam<adj.max() and velocity<adj.max()
for file in target.glob(f'ML_SHARED_Butterfly{index:02}_*.mp4'):
    cap=cv2.VideoCapture(str(file));assert cap.get(cv2.CAP_PROP_FPS)==24;assert cap.get(cv2.CAP_PROP_FRAME_COUNT)==(360 if '5회' in file.name else 72);cap.release()
record=dict(index=index,matteRevision=3,sourcePNG=side['sourcePNG'],sourceSHA256=side['sourceSHA256'],keyColor=side['keyColor'],rawSHA256=hashlib.sha256(raw.read_bytes()).hexdigest(),sourceFrameIndices=indices,fps=24,duration=3,width=480,height=480,actualCycleFrames=period,cycleSourceStart=start,cycleSourceEndExclusive=start+period,derivation=f'{72//period} unchanged forward repetitions of a complete{period}-frame native-rate wingbeat from originalframes{start}..{start+period-1};no reverse,no duplicated endpoint,no morph,no optical-flow synthesis,no retiming. RGB key removed using measured background; detached cast shadow excluded by chromatic evidence. Mixed key-edge RGB decontaminated by solving the continuous compositing equation; opaque paint kept unchanged.',opaqueSourcePixelsPreserved=core_counts,pngSHA256=hashes,seamMAE=seam,velocityMAE=velocity,maxAdjacentMAE=float(adj.max()),visualReview='pending',gameApplied=False)
(base/'검수'/f'Butterfly{index:02}_루프후보_검증_v{version}.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in record.items() if k not in ['sourceFrameIndices','opaqueSourcePixelsPreserved','pngSHA256']},ensure_ascii=False))
