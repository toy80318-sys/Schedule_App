"""Preserve generated wingbeats and expose every original frame for review."""
from pathlib import Path
import hashlib,json,math,urllib.request
import cv2,numpy as np
from PIL import Image,ImageDraw

repo=Path(__file__).resolve().parents[1]
base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
jobs=json.loads((base/'생성완료_v97.json').read_text(encoding='utf-8'))['jobs']
for d in ['원본영상_v97','검수']: (base/d).mkdir(exist_ok=True)
for job in jobs:
    if job['status']!='completed':continue
    i=job['index'];file=base/'원본영상_v97'/f'ML_SHARED_Butterfly{i:02}_Wingbeat_Raw_v97.mp4'
    if not file.exists():urllib.request.urlretrieve(job['result_url'],file)
    cap=cv2.VideoCapture(str(file));fps=cap.get(cv2.CAP_PROP_FPS);frames=[]
    while True:
        ok,f=cap.read()
        if not ok:break
        frames.append(cv2.cvtColor(f,cv2.COLOR_BGR2RGB))
    cap.release();assert frames and fps>0
    for label,indices,size in [('全프레임',range(len(frames)),160),('16시점',np.linspace(0,len(frames)-1,16).astype(int),320)]:
        cols=8 if size==160 else 4;sheet=Image.new('RGB',(cols*size,math.ceil(len(indices)/cols)*(size+20)),'#142129');draw=ImageDraw.Draw(sheet)
        for n,k in enumerate(indices):
            x=n%cols*size;y=n//cols*(size+20);sheet.paste(Image.fromarray(frames[k]).resize((size,size)),(x,y));draw.text((x+4,y+size+2),f'{k:03} / {k/fps:.3f}s',fill='white')
        sheet.save(base/'검수'/f'Butterfly{i:02}_원본_{label}_v97.jpg',quality=95)
    stats=[]
    for f in frames:
        bg=np.median(np.concatenate([f[:4].reshape(-1,3),f[-4:].reshape(-1,3),f[:,:4].reshape(-1,3),f[:,-4:].reshape(-1,3)]),axis=0)
        mask=np.linalg.norm(f.astype(float)-bg,axis=2)>70;y,x=np.where(mask)
        stats.append(dict(area=int(mask.sum()),bbox=[int(x.min()),int(y.min()),int(x.max()),int(y.max())],bg=bg.tolist()))
    info=dict(index=i,jobId=job['job_id'],file=str(file),sourceURL=job['result_url'],sha256=hashlib.sha256(file.read_bytes()).hexdigest(),fps=fps,frameCount=len(frames),duration=len(frames)/fps,width=frames[0].shape[1],height=frames[0].shape[0],frameStats=stats,visualReview='pending')
    (base/'검수'/f'Butterfly{i:02}_원본검수_v97.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in info.items() if k!='frameStats'},ensure_ascii=False))
