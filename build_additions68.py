from pathlib import Path
import json, shutil, hashlib
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parent
DAY=ROOT.parent/'20261027_메이즈랜드_원본소스'
REC=DAY/'제작기록_대비꽃색_v68'
OUT=ROOT/'source-assets/additions-v68'
DELIVERY=DAY/'추상유화_꽃색과후경_v68'
OUT.mkdir(parents=True,exist_ok=True)
(DELIVERY/'생성원본').mkdir(parents=True,exist_ok=True)
themes={'sunset':('01','노을','동백꽃','camellia'),'day':('02','낮','금잔화','marigold'),'night':('03','밤','라벤더','lavender'),'morning':('04','아침','수국','hydrangea')}
assets=[]; records=[]
for record in sorted(REC.glob('generated_*.json')):
    job=json.loads(record.read_text(encoding='utf-8-sig')); theme=job['theme']; n,title,species,code=themes[theme]
    kind=job.get('kind'); flower=not kind
    suffix=f'Flower_{code}_CloseColor{job["variant"]:02}' if flower else f'Dark_{kind.title()}'
    file=f'ML_BG{n}_LT{n}_{suffix}_AbstractOil_Whole_v68.png'
    src=Path(job['path']); im=Image.open(src).convert('RGBA'); alpha=im.getchannel('A'); box=alpha.getbbox()
    assert box and alpha.getextrema()==(0,255),job['key']
    solid=alpha.point(lambda value:255 if value>32 else 0).getbbox()
    assert solid[0]>0 and solid[1]>0 and solid[2]<im.width and solid[3]<im.height,job['key']+' clipped object edge'
    box=(max(0,solid[0]-12),max(0,solid[1]-12),min(im.width,solid[2]+12),min(im.height,solid[3]+12))
    shutil.copy2(src,DELIVERY/'생성원본'/file)
    piece=im.crop(box); piece.thumbnail((860,860),Image.Resampling.LANCZOS)
    result=Image.new('RGBA',(1024,1024)); result.alpha_composite(piece,((1024-piece.width)//2,(1024-piece.height)//2))
    result.save(OUT/file); shutil.copy2(OUT/file,DELIVERY/file)
    preview=file.replace('.png','_preview.webp'); result.resize((320,320),Image.Resampling.LANCZOS).save(OUT/preview,quality=86)
    base='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/additions-v68/'
    name=f'{title} · {species} · 가까운 색상 {job["variant"]}' if flower else f'{title} · 어두운 '+('현무암' if kind=='basalt' else '나뭇가지')
    asset=dict(id='add68-'+job['key'],name=name,theme=theme,backgroundId='BG'+n,lightingId='LT'+n,category='flower' if flower else 'decor',group='flowers' if flower else 'decor',kind='image',file=file,src=base+file,preview=base+preview,thumb=base+preview,width=1024,height=1024,transparent=True,completeObject=True,sourceProvenance='complete_independent_generated_object',imageStyleVersion=68,sourceStyleVersion=68,lightingBaked=True,colorBaked=True,stillOnly=True,ready=True,motion='stationary',loopInPlace=True,pixelsPerUnit=100,anchor={'x':.5,'y':.5},groundAnchor={'x':.5,'y':.92},defaultWidthMm=450 if flower else 700,defaultHeightMm=450 if flower else 700,visibleBounds=list(result.getchannel('A').getbbox()),sha256=hashlib.sha256((OUT/file).read_bytes()).hexdigest(),abstractStyle='loose_gestural_oil_3x')
    if flower: asset.update(species=code,designVariant=job['variant'],colorName='가까운 색상 '+str(job['variant']))
    else: asset['decorType']=kind
    assets.append(asset); records.append(dict(job,delivery=file,nativeResolution=list(im.size),resolution=[1024,1024],sha256=asset['sha256'],visibleBounds=asset['visibleBounds']))
assert len(assets)==24
(ROOT/'docs/additions68-data.js').write_text('window.jejuAdditions68='+json.dumps({'version':68,'assets':assets},ensure_ascii=False,separators=(',',':'))+';\nif(window.jejuFinalCatalog){const c=window.jejuFinalCatalog; c.assets.push(...window.jejuAdditions68.assets);c.sourceFiles.push(...window.jejuAdditions68.assets.map(a=>({id:a.id,relativePath:a.file,stablePreviewUrl:a.src})));}\n',encoding='utf-8')
(REC/'00_전체생성프롬프트_24종_v68.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(1600,2400),'#1b2423'); draw=ImageDraw.Draw(sheet)
for i,a in enumerate(assets):
    tile=Image.open(OUT/a['file']).resize((360,360),Image.Resampling.LANCZOS);x=(i%4)*400+20;y=(i//4)*400;sheet.paste(tile,(x,y),tile);draw.text((x,y+365),a['id'],fill='white')
sheet.save(REC/'24종_알파객체_검수.jpg',quality=90)
print(json.dumps({'assets':len(assets),'flowers':sum(a['group']=='flowers' for a in assets),'sizeMiB':sum(p.stat().st_size for p in OUT.iterdir())/2**20,'delivery':str(DELIVERY)},ensure_ascii=False))
