"""Prepare newly generated butterfly art, preserving originals and real alpha."""
from pathlib import Path
import json,hashlib,shutil,colorsys,zipfile
import numpy as np
from PIL import Image,ImageDraw

repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
raw=Path(r'C:\Users\TOY LEE\.codex\generated_images\01a15479-0e70-75f1-bab3-32ccc3cdcf77')
files=['exec-8bdb0d83-da85-4e2a-b768-61d27ec71206.png','exec-00e57aea-3b4f-4889-906a-3668be13fbdb.png','exec-e7614eb0-ff95-462d-8a18-56c4008202fb.png','exec-94d503d5-7533-44bf-8f97-c20a3e56e49d.png']
old=json.loads((docs/'assets/element-loops-v95/manifest.json').read_text(encoding='utf-8'))
public=docs/'assets/abstract-butterflies-v96'
for p in [base/'생성원본',base/'PNG알파',base/'영상입력_보색키',base/'검수',public]:p.mkdir(parents=True,exist_ok=True)
rows=[];sheet=Image.new('RGB',(1600,800),'#142129');draw=ImageDraw.Draw(sheet)
names=['넓은 날개','긴 꼬리','둥근 날개','가느다란 날개']
for i,file in enumerate(files,1):
    source=raw/file;im=Image.open(source);assert im.mode=='RGBA'
    a=np.asarray(im)[:,:,3];assert not any(np.any(v>=200) for v in [a[0],a[-1],a[:,0],a[:,-1]]),'Paint clipped at image edge'
    stem=f'ML_SHARED_Butterfly{i:02}_AbstractOil3x_v96'
    shutil.copy2(source,base/'생성원본'/(stem+'_Generated1254.png'))
    # Uniform scaling and padding only; do not repaint or fill the generated art.
    normalized=Image.new('RGBA',(1024,1024));normalized.alpha_composite(im.resize((768,768),Image.Resampling.LANCZOS),(128,128))
    normalized.save(base/'PNG알파'/(stem+'_RGBA1024.png'));normalized.save(public/(stem+'.png'))
    normalized.resize((480,480),Image.Resampling.LANCZOS).save(base/'PNG알파'/(stem+'_RGBA480.png'))
    normalized.resize((256,256),Image.Resampling.LANCZOS).save(public/(stem+'_preview.webp'),quality=93,method=4)
    pixels=np.asarray(normalized);alpha=pixels[:,:,3];assert np.count_nonzero(alpha==0)>alpha.size*.35 and not alpha[:100].any() and not alpha[:,:100].any()
    rgb=pixels[:,:,:3].astype(float);weight=(alpha/255)*(rgb.max(2)-rgb.min(2));average=(rgb*weight[:,:,None]).sum((0,1))/weight.sum();hue=colorsys.rgb_to_hsv(*(average/255))[0];key='#'+''.join(f'{round(c*255):02X}' for c in colorsys.hsv_to_rgb((hue+.5)%1,1,1))
    solid=Image.new('RGB',(1024,1024),key);solid.paste(normalized,mask=normalized.getchannel('A'));keyfile=base/'영상입력_보색키'/(stem+'_Key'+key[1:]+'_1024.png');solid.save(keyfile);shutil.copy2(keyfile,public/keyfile.name)
    prior=next(a for a in old['items'] if a['id']==f'atmosphere85-butterfly-{i:02}')
    row=dict(index=i,id=prior['id'],name=names[i-1]+' · 추상 유화 나비',originalSourcePNG=prior['sourcePNG'],originalSourceSHA256=prior['sourceSHA256'],sourcePNG='assets/abstract-butterflies-v96/'+stem+'.png',sourceSHA256=hashlib.sha256((public/(stem+'.png')).read_bytes()).hexdigest(),preview='assets/abstract-butterflies-v96/'+stem+'_preview.webp',keyImage='assets/abstract-butterflies-v96/'+keyfile.name,keyColor=key,width=1024,height=1024,generatedOriginal=str(source),compatibleThemes=prior['compatibleThemes'],imageReview='passed',videoStatus='awaiting-cost-approval',nativeRGBA480=str(base/'PNG알파'/(stem+'_RGBA480.png')))
    rows.append(row)
    for y,color in [(0,'#142129'),(400,'#f1e8db')]:
        tile=Image.new('RGBA',(400,400),color);tile.alpha_composite(normalized.resize((400,400)));sheet.paste(tile.convert('RGB'),((i-1)*400,y));draw.text(((i-1)*400+12,y+12),f'Butterfly{i:02} / New abstract oil',fill='#dfbb81' if y==0 else '#413b4c')
manifest={'format':'mazeland-abstract-butterflies-v96','version':96,'date':'2026-10-28','imageCount':4,'paidVideoJobsSubmitted':0,'videoApproval':False,'maximumEstimatedCredits':9.6,'generator':'Built-in image_gen;one new image per butterfly','artDirection':'Remove microscopic veins,jewels,scales and tiny patterns;paint broad opalescent impasto color masses. About3x stronger abstract oil language. Preserve whole silhouettes.','items':rows}
(base/'제작목록_v96.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(public/'manifest.json').write_text(json.dumps({**manifest,'items':[{k:v for k,v in a.items() if k not in ['generatedOriginal','nativeRGBA480']} for a in rows]},ensure_ascii=False,indent=2),encoding='utf-8')
sheet.save(base/'검수/나비4종_추상유화_밝고어두운배경_v96.jpg',quality=95)
with zipfile.ZipFile(public/'Butterfly_AbstractOil3x_4PNG_v96.zip','w',zipfile.ZIP_DEFLATED) as z:
    for a in rows:z.write(docs/a['sourcePNG'],Path(a['sourcePNG']).name)
    z.writestr('README.txt','New oil-painted butterfly art.1024x1024 RGBA with fixed padding. Video production pending separate approval. No old video restyling.\n')
print('Prepared4 new true-alpha images and4 complementary-key input images. No paid video submitted.')
