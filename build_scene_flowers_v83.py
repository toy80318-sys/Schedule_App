"""Package scene-first flower originals without changing their pixels."""
import hashlib
import json
import zipfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
PACKAGE = ROOT.parent/'20261028_메이즈랜드_원본소스/배경기반_추상유화4변형_v83'
SOURCE = ROOT/'source-assets/scene-flowers-v83'
URL = 'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/scene-flowers-v83/'
LABELS = dict(camellia='동백',marigold='금잔화',buckwheat='메밀꽃',canola='유채꽃',hydrangea='수국',lavender='라벤더')

def build():
    jobs = json.loads((PACKAGE/'03_만개수정_생성계획.json').read_text(encoding='utf-8'))
    rows = {(a['code'],a['kind'],a['variant']):a for a in jobs}
    for file in sorted(PACKAGE.glob('flowers_*.json')):
        for a in json.loads(file.read_text(encoding='utf-8')):rows[a['code'],a['kind'],a['variant']]=a
    jobs=list(rows.values())
    assert len(jobs)==48 and all(a.get('output') for a in jobs), 'All 48 final flower PNGs are required'
    masters=json.loads((PACKAGE/'01_배경꽃_마스터기록.json').read_text(encoding='utf-8'))
    assert len(masters)==4 and all(a.get('output') for a in masters)
    SOURCE.mkdir(parents=True,exist_ok=True)
    def copy(path,file):
        raw=Path(path).read_bytes();(SOURCE/file).write_bytes(raw);(PACKAGE/file).write_bytes(raw)
        im=Image.open(path)
        return dict(file=file,src=URL+file,sha256=hashlib.sha256(raw).hexdigest(),width=im.width,height=im.height)
    scenes=[]
    for m in masters:
        a=copy(m['output'],f"ML_{m['code']}_LT{m['code'][-2:]}_SceneMaster_AbstractOil_v83.png")
        a.update(backgroundId=m['code'],lightingId='LT'+m['code'][-2:],theme=m['theme'],name=m['label']+' · 배경+꽃 기준 장면',kind='image',group='decor',category='scene-reference',stillOnly=True,transparent=False)
        scenes.append(a)
    assets=[]
    for j in jobs:
        im=Image.open(j['output']);assert im.mode=='RGBA' and im.size==(1254,1254), (j['code'],j['kind'],im.mode,im.size)
        alpha=im.getchannel('A');assert alpha.getextrema()==(0,255)
        box=alpha.point(lambda v:255 if v>8 else 0).getbbox()
        assert box and min(box[0],box[1],im.width-box[2],im.height-box[3])>=2, ('Clipped silhouette',j['code'],j['kind'],j['variant'],box)
        b=j['base'];v=j['variant'];code=j['code'];kind=j['kind']
        a=copy(j['output'],f'ML_{code}_LT{code[-2:]}_{kind}_Shape{v}_SceneOil_Bloom_v83.png')
        a.update(id=f'{code}-{kind}-scene-{v.lower()}-v83',name=f"{dict(sunset='노을',day='낮',night='달빛',morning='아침')[j['theme']]} · {LABELS[kind]} · 배경 조화 {v}",
                 theme=j['theme'],species=kind,backgroundId=code,lightingId='LT'+code[-2:],group='flowers',category='flower',kind='image',
                 completeObject=True,transparent=True,stillOnly=True,lightingBaked=True,ready=True,imageStyleVersion=83,artStyleVersion=83,morphologyVersion=83,setReviewVersion='V05',
                 baseAssetId=b['id'],design=b['design'],color=b['color'],colorLabel=b['colorLabel'],shape=v,colorVariation=v,alphaBounds=box,
                 sceneMaster=scenes[[m['code'] for m in masters].index(code)]['file'])
        a['preview']=a['thumb']=a['src']
        if v=='A':a['legacyAssetIds']=[b['id']]
        assets.append(a)
    assert len({a['sha256'] for a in assets})==48
    for b in {a['baseAssetId'] for a in assets}:assert len([a for a in assets if a['baseAssetId']==b])==4
    result=dict(format='jeju-scene-flowers-v1',version=83,date='2026-10-28',workflow='scene master generated first; each flower generated from that master',tool='built-in image_gen',scenes=scenes,assets=assets)
    target=ROOT/'docs/assets/scene-flowers-v83';target.mkdir(parents=True,exist_ok=True)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    (target/'manifest.json').write_text(text,encoding='utf-8');(PACKAGE/'manifest.json').write_text(text,encoding='utf-8')
    (PACKAGE/'생성기록_최종.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding='utf-8')
    js='window.jejuSceneFlowerCatalog='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n'
    js+="for(const a of window.jejuSceneFlowerCatalog.assets){for(const id of a.legacyAssetIds||[]){const old=window.jejuFinalCatalog.assets.find(v=>v.id===id);if(old)Object.assign(old,a,{id,catalogHidden:true});}if(!window.jejuFinalCatalog.assets.some(v=>v.id===a.id))window.jejuFinalCatalog.assets.push(a);}\n"
    (ROOT/'docs/scene-flower-catalog.js').write_text(js,encoding='utf-8')
    with zipfile.ZipFile(PACKAGE/'Mazeland_SceneFlowers48_Masters4_v83.zip','w',zipfile.ZIP_STORED) as z:
        for a in assets+scenes:z.write(SOURCE/a['file'],a['file'])
        z.writestr('manifest.json',text)
    print('PASS:48 unique RGBA flower originals, 4 variants/type, 4 scene masters, lighting IDs, original hashes and ZIP')

if __name__=='__main__':build()
