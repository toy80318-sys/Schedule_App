"""Prepare exact generated bud/bloom inputs; never submit paid video jobs."""
from pathlib import Path
import csv, hashlib, json, shutil
import numpy as np
from PIL import Image, ImageDraw

REPO=Path(__file__).resolve().parents[1]
OUT=REPO.parent/'20261028_메이즈랜드_원본소스'/'꽃개화게임_v89'
WEB=REPO/'docs/assets/flower-openings-v89'
SOURCE=REPO/'source-assets/flower-openings-v89'
BASE='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/'
KEYS={'sunset':'00FFFF','day':'0000FF','night':'80FF00','morning':'FF8000'}

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def save_json(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def root_point(im):
    a=np.asarray(im)[...,3]>96
    ys,xs=np.where(a)
    assert len(xs) and not np.any(a[0]) and not np.any(a[-1]) and not np.any(a[:,0]) and not np.any(a[:,-1]),'Object is empty or clipped'
    yy=ys.max();xx=np.where(a[max(0,yy-12):yy+1].any(axis=0))[0]
    return [round(float(xx.mean()),2),int(yy)]

def main():
    if (WEB/'manifest.json').exists():
        previous=json.loads((WEB/'manifest.json').read_text(encoding='utf-8'))
        assert not any(a.get('jobId') or a.get('status')=='passed' for a in previous['items']),'Preserve submitted/reviewed video records; do not rebuild image-only inputs over them'
    assets=json.loads((OUT/'제작대상48종.json').read_text(encoding='utf-8'))
    assert len(assets)==48
    for d in [WEB,SOURCE,OUT/'검수',OUT/'제작기록',OUT/'영상',OUT/'PNG_ALPHA']:d.mkdir(parents=True,exist_ok=True)
    reviews_path=OUT/'검수/입력쌍_시각검토.json'
    reviews=json.loads(reviews_path.read_text(encoding='utf-8')) if reviews_path.exists() else {}
    rows=[]
    for a in assets:
        original=REPO/'source-assets/scene-flowers-v83'/a['file']
        bud=OUT/'이미지'/a['backgroundId']/a['file'].replace('Bloom_v83','Bud_v89')
        assert bud.exists(),f'Missing generated bud: {a["id"]}'
        assert sha(original)==a['sha256']
        bloom=bud.parent/a['file'];shutil.copy2(original,bloom)
        bi=Image.open(bud);oi=Image.open(original)
        assert bi.mode==oi.mode=='RGBA' and bi.size==oi.size==(1254,1254)
        br,orr=root_point(bi),root_point(oi)
        key=KEYS[a['theme']]
        inputs=[];display={}
        for state,path,im in [('Bud',bud,bi),('Bloom',original,oi)]:
            filename=a['file'].replace('Bloom_v83',state+'_v89')
            alpha=SOURCE/filename
            keyname=filename.replace('_v89','_Key'+key+'_v89')
            preview_path=WEB/(a['id']+'_'+state.lower()+'.webp')
            unchanged=alpha.exists() and sha(alpha)==sha(path) and (SOURCE/keyname).exists() and preview_path.exists()
            if not unchanged:
                shutil.copy2(path,alpha);preview=im.copy();preview.thumbnail((256,256));preview.save(preview_path,quality=90,method=6)
                background=Image.new('RGBA',im.size,'#'+key);background.alpha_composite(im);background.convert('RGB').save(SOURCE/keyname)
            role='start_image' if state=='Bud' else 'end_image'
            inputs.append({'role':role,'value':BASE+'source-assets/flower-openings-v89/'+keyname,'sha256':sha(SOURCE/keyname),'alphaSHA256':sha(alpha),'generatedImage':True,'file':keyname})
            display[state.lower()]={'preview':'assets/flower-openings-v89/'+preview_path.name,'original':BASE+'source-assets/flower-openings-v89/'+filename,'sha256':sha(alpha)}
        review=reviews.get(a['id'],{})
        row={**{k:a[k] for k in ['id','name','theme','species','shape','backgroundId','lightingId']},'sourcePNG':a['src'],'sourceSHA256':a['sha256'],'status':'awaiting-video-approval' if review.get('passed') else 'image-review-pending','route':'GENERATED_IMAGE_PAIR_TO_VIDEO','inputs':inputs,'images':display,'keyColor':'#'+key,'inputResolution':[1254,1254],'requestedResolution':'480p','requestedDuration':4,'gameDuration':3,'budgetPerAttempt':2.4,'imageReview':review,'rootDeltaPixels':[round(br[0]-orr[0],2),br[1]-orr[1]],'rootBud':br,'rootBloom':orr}
        receipt=OUT/'제작기록'/(a['id']+'.json')
        if receipt.exists():row['generationRecord']=json.loads(receipt.read_text(encoding='utf-8'))
        rows.append(row)
    manifest={'format':'jeju-flower-openings-v89','version':89,'count':48,'creditEstimate':115.2,'account':'추진이','model':'seedance1_5','paidJobsSubmitted':0,'items':rows}
    save_json(OUT/'꽃_봉오리만개_제작입력48종.json',manifest)
    public={**manifest,'items':[{k:v for k,v in a.items() if k!='generationRecord'} for a in rows]}
    save_json(WEB/'manifest.json',public)
    (REPO/'docs/flower-opening-catalog.js').write_text('window.jejuFlowerOpeningData='+json.dumps(public,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    with (OUT/'소스_배경조명_입력대응.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=['id','backgroundId','lightingId','species','shape','keyColor','bud','bloom','status']);writer.writeheader()
        for a in rows:writer.writerow({**{k:a[k] for k in writer.fieldnames if k not in ['bud','bloom']},'bud':a['inputs'][0]['file'],'bloom':a['inputs'][1]['file']})
    for bg in ['BG01','BG02','BG03','BG04']:
        selected=[r for r in rows if r['backgroundId']==bg];canvas=Image.new('RGB',(1000,6*190),'#243b36');draw=ImageDraw.Draw(canvas)
        for i,a in enumerate(selected):
            x=i%2*500;y=i//2*190
            for j,state in enumerate(['bud','bloom']):
                path=WEB/Path(a['images'][state]['preview']).name;im=Image.open(path).convert('RGBA');im.thumbnail((175,165));canvas.paste(im,(x+j*230+20,y),im)
            draw.text((x+6,y+169),a['species']+' '+a['shape']+'  BUD / BLOOM',fill='white')
        canvas.save(OUT/'검수'/(bg+'_봉오리만개_12쌍.jpg'))
    print(json.dumps({'preparedPairs':len(rows),'paidJobsSubmitted':0,'imageReviewsPassed':sum(bool(a['imageReview'].get('passed')) for a in rows)}))

if __name__=='__main__':main()
