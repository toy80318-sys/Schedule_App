"""Package generated flower-specific petals without changing their artwork."""
from pathlib import Path
import csv, hashlib, json, shutil, zipfile
from PIL import Image, ImageDraw

REPO=Path(__file__).resolve().parents[1]
OUT=REPO.parent/'20261028_메이즈랜드_원본소스/꽃별꽃잎_v90'
WEB=REPO/'docs/assets/flower-petals-v90'
SOURCE=REPO/'source-assets/flower-petals-v90'
BASE='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    parents=json.loads((REPO/'docs/assets/flower-openings-v89/manifest.json').read_text(encoding='utf-8'))['items']
    assert len(parents)==48
    for p in [WEB,SOURCE,OUT/'검수']:p.mkdir(parents=True,exist_ok=True)
    rows=[];sheets={}
    for a in parents:
        name=f"ML_{a['backgroundId']}_{a['lightingId']}_{a['species']}_Shape{a['shape']}_SceneOil_Petal_v90.png"
        src=OUT/'PNG'/name; im=Image.open(src)
        assert im.mode=='RGBA' and im.width==im.height
        alpha=im.getchannel('A');bounds=alpha.point(lambda v:255 if v>=16 else 0).getbbox()
        assert bounds and min(alpha.getextrema())==0 and alpha.getextrema()[1]==255
        assert bounds[0]>8 and bounds[1]>8 and bounds[2]<im.width-8 and bounds[3]<im.height-8,'Clipped petal'
        assert alpha.histogram()[0]>im.width*im.height*.2,'Background must be transparent'
        shutil.copy2(src,SOURCE/name)
        preview=im.copy();preview.thumbnail((128,128),Image.Resampling.LANCZOS)
        preview.save(WEB/(a['id']+'.webp'),quality=93,method=6)
        rows.append({k:a[k] for k in ['id','name','theme','species','shape','backgroundId','lightingId','sourcePNG','sourceSHA256']}|{'texture':'assets/flower-petals-v90/'+a['id']+'.webp','original':BASE+'source-assets/flower-petals-v90/'+name,'file':name,'sha256':sha(src),'width':im.width,'height':im.height,'alphaBounds':bounds})
        bg=a['backgroundId'];sheet=sheets.setdefault(bg,Image.new('RGB',(1200,1260),'#243c36'));n=sum(1 for r in rows if r['backgroundId']==bg)-1;x=(n%3)*400;y=(n//3)*315
        parent=Image.open(REPO/'source-assets/scene-flowers-v83'/a['sourcePNG'].split('/')[-1]).convert('RGBA');parent.thumbnail((190,270));petal=im.copy();petal.thumbnail((185,260));sheet.paste(parent,(x+5,y+5),parent);sheet.paste(petal,(x+200,y+5),petal);ImageDraw.Draw(sheet).text((x+8,y+287),f"{bg} {a['species']} {a['shape']}  /  flower -> petal",fill='white')
    catalog={'format':'jeju-flower-petals-v90','version':90,'count':48,'items':rows}
    content=json.dumps(catalog,ensure_ascii=False,indent=2)
    (WEB/'manifest.json').write_text(content,encoding='utf-8');(OUT/'꽃_꽃잎_대응목록.json').write_text(content,encoding='utf-8')
    (REPO/'docs/flower-petal-catalog.js').write_text('window.jejuFlowerPetals='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    with (OUT/'꽃_꽃잎_대응표.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=['id','backgroundId','lightingId','species','shape','file','sha256']);w.writeheader();w.writerows({k:a[k] for k in w.fieldnames} for a in rows)
    package='ML_FlowerPetals_48_RGBA_v90.zip'
    with zipfile.ZipFile(OUT/package,'w',zipfile.ZIP_DEFLATED) as z:
        for a in rows:z.write(OUT/'PNG'/a['file'],'PNG/'+a['file'])
        z.write(OUT/'꽃_꽃잎_대응표.csv','flower-petal-map.csv');z.writestr('manifest.json',content)
    with zipfile.ZipFile(OUT/package) as z:assert z.testzip() is None and len(z.namelist())==50
    for bg,sheet in sheets.items():sheet.save(OUT/'검수'/f'{bg}_꽃과꽃잎12쌍.jpg',quality=93)
    print(json.dumps({'petals':len(rows),'packageBytes':(OUT/package).stat().st_size,'originalsUnmodified':True}))
if __name__=='__main__':main()
