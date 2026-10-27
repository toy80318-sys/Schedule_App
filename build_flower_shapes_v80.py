"""Register reviewed AI flower silhouettes without changing earlier source images."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
PACKAGE = ROOT.parent / '20261027_메이즈랜드_원본소스/꽃_형태다양화_v80'
records = json.loads((PACKAGE / 'generation-records.json').read_text(encoding='utf-8'))
source = ROOT / 'source-assets/flower-shapes-v80'
source.mkdir(parents=True, exist_ok=True)
old = json.loads((ROOT / 'docs/assets/set-review-v01/manifest.json').read_text(encoding='utf-8'))
by_id = {a['id']: a for scene in old['backgrounds'] for a in scene['flowers']}
assets = []
for item in sorted(records['assets'], key=lambda a: (a['code'], a['key'])):
    image = Image.open(item['path'])
    assert image.mode == 'RGBA' and image.size == (1254, 1254)
    alpha = image.getchannel('A')
    assert alpha.getextrema() == (0, 255)
    box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    assert box and min(box[0], box[1], 1254-box[2], 1254-box[3]) >= 5, (item['key'], box)
    base = by_id[item['ref']]
    name = f"ML_{item['code']}_LT{item['code'][-2:]}_{item['key']}_ShapeA_AbstractOil_Bloom_v80.png"
    raw = Path(item['path']).read_bytes()
    (source / name).write_bytes(raw)
    (PACKAGE / name).write_bytes(raw)
    asset = {key: base[key] for key in ['theme', 'category', 'group', 'design', 'color', 'colorLabel'] if key in base}
    asset.update(id=f"{item['code']}-{item['key']}-shapeA-v80", name=base['name'].split(' · ')[0]+' · '+item.get('name', {'camellia':'동백','marigold':'금잔화','buckwheat':'메밀꽃','canola':'유채꽃','hydrangea':'수국','lavender':'라벤더'}[item['key']])+' · 새로운 비대칭 형태',
                 src='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/flower-shapes-v80/'+name,
                 file=name, width=1254, height=1254, sha256=hashlib.sha256(raw).hexdigest(), species=item['key'],
                 backgroundId=item['code'], lightingId='LT'+item['code'][-2:], baseAssetId=base['id'],
                 group='flowers', completeObject=True, transparent=True, stillOnly=True, lightingBaked=True, imageStyleVersion=80,
                 setReviewVersion='V05', morphologyVersion=80, ready=True, kind='image', alphaBounds=box)
    asset['preview'] = asset['thumb'] = asset['src']
    assets.append(asset)
assert len(assets) == 12 and len({a['sha256'] for a in assets}) == 12
data = dict(format='jeju-flower-shapes-v1', version=80, date='2026-10-27', tool='built-in image_gen', assets=assets)
text = json.dumps(data, ensure_ascii=False, indent=2)
(ROOT / 'docs/assets/flower-shapes-v80').mkdir(parents=True, exist_ok=True)
(ROOT / 'docs/assets/flower-shapes-v80/manifest.json').write_text(text, encoding='utf-8')
(PACKAGE / 'manifest.json').write_text(text, encoding='utf-8')
(ROOT / 'docs/flower-shape-catalog.js').write_text("// Independently generated complete flower silhouettes.\nwindow.jejuFlowerShapeCatalog="+json.dumps(data, ensure_ascii=False, separators=(',', ':'))+";\nfor(const a of window.jejuFlowerShapeCatalog.assets)if(!window.jejuFinalCatalog.assets.some(v=>v.id===a.id))window.jejuFinalCatalog.assets.push(a);\n", encoding='utf-8')
print('PASS: 12 original RGBA silhouettes, transparent margins, unique hashes and scene lighting metadata')
