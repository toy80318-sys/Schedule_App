"""Keep regenerated side-pose originals and prepare fixed-pivot wingbeat inputs."""
from pathlib import Path
import hashlib,json,shutil
import numpy as np
from PIL import Image

repo=Path(__file__).resolve().parents[1]
base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
raw=Path(r'C:\Users\TOY LEE\.codex\generated_images\01a15479-0e70-75f1-bab3-32ccc3cdcf77')
public=repo/'docs/assets/abstract-butterflies-v97';public.mkdir(exist_ok=True)
rows=[]
for i,name,root,key in [(1,'exec-9b6a2f01-97ac-4fae-b921-1a86e959eb2f.png',(.68,.80),'#00ECFF'),(2,'exec-75e0efe9-481e-4694-aa1a-aa993a37aa47.png',(.69,.69),'#00A8FF'),(3,'exec-c20c30c4-8c4c-4559-be4f-e134b920ed16.png',(.66,.75),'#00C2FF'),(4,'exec-71b03b9e-f36e-4816-aec0-a57552ac3ee5.png',(.68,.78),'#00FFF4')]:
    file=raw/name;im=Image.open(file);assert im.mode=='RGBA'
    a=np.asarray(im)[:,:,3];assert not any(np.any(v>=200) for v in [a[0],a[-1],a[:,0],a[:,-1]]),'Opaque art clipped at source edge'
    stem=f'ML_SHARED_Butterfly{i:02}_Side_AbstractOil_v97'
    shutil.copy2(file,base/'생성원본'/(stem+'_Generated1254.png'))
    size=600 if i==1 else 640
    out=Image.new('RGBA',(1024,1024));offset=(round(512-root[0]*size),round(512-root[1]*size))
    out.alpha_composite(im.resize((size,size),Image.Resampling.LANCZOS),offset)
    a=np.asarray(out)[:,:,3];assert not any(np.any(v) for v in [a[:20],a[-20:],a[:,:20],a[:,-20:]])
    png=public/(stem+'.png');out.save(png);shutil.copy2(png,base/'PNG알파'/png.name)
    out.resize((480,480),Image.Resampling.LANCZOS).save(base/'PNG알파'/(stem+'_480.png'))
    solid=Image.new('RGB',(1024,1024),key);solid.paste(out,mask=out.getchannel('A'));keyfile=public/(stem+'_Key'+key[1:]+'.png');solid.save(keyfile);shutil.copy2(keyfile,base/'영상입력_보색키'/keyfile.name)
    rows.append(dict(index=i,id=f'atmosphere85-butterfly-{i:02}',sourcePNG=png.relative_to(repo/'docs').as_posix(),sourceSHA256=hashlib.sha256(png.read_bytes()).hexdigest(),generatedOriginal=str(file),keyImage=keyfile.relative_to(repo/'docs').as_posix(),keyColor=key,pivot=[.5,.5],normalization=f'Uniform resize{size} and translation only; original alpha unchanged; thorax approximately at image center',imageReview='passed'))
(base/'측면이미지4종_v97.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print('Preserved4 new side-pose originals; prepared fixed-pivot1024RGBA and complementary-key inputs.')
