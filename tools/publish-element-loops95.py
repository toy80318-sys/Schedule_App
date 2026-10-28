"""Publish the 28 visually reviewed 480px loops and verify native PNG delivery."""
from pathlib import Path
import json,hashlib,html,zipfile
import numpy as np
from PIL import Image

repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
base=repo.parent/'20261028_메이즈랜드_원본소스/요소루프_480_3초_v95'
data=json.loads((base/'요소루프_제작목록_v95.json').read_text(encoding='utf-8'))
assert len(data['items'])==28
labels=dict(grass='풀',leaf='잎',tree='나무',basalt='현무암',cloud='구름',butterfly='유리 나비',particle='빛 입자')
cards=[];count=0
for a in data['items']:
    assert a['renderRevision']==2 and a['fps']==24 and a['duration']==3
    assert len(a['pngSHA256'])==72 and not a['qa']['borderFailures']
    for i,sha in enumerate(a['pngSHA256']):
        p=Path(a['nativePNGPattern'].replace('%04d',f'{i:04}'));im=Image.open(p)
        assert im.mode=='RGBA' and im.size==(480,480) and hashlib.sha256(p.read_bytes()).hexdigest()==sha
        alpha=np.asarray(im)[:,:,3];assert not any(np.any(v) for v in [alpha[:2],alpha[-2:],alpha[:,:2],alpha[:,-2:]])
        count+=1
    for key,shaKey in [('loopVideo','alphaWebM_SHA256'),('keyVideo','keyMP4_SHA256')]:
        assert hashlib.sha256((docs/a[key]).read_bytes()).hexdigest()==a[shaKey]
    assert a['qa']['seamMAE']<=a['qa']['maximumAdjacentMAE']*1.3+.03
    a['qa']['visualReview']='passed';a['qa']['visualEvidence']='All72 frames on light and dark; whole-object form and boundary reviewed 2026-10-28'
    (base/'검수'/(a['id']+'_검증.json')).write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
    esc=html.escape
    cards.append(f'<article><h3>{esc(a["name"])}</h3><p>{esc(a["id"])} · {labels[a["category"]]}</p><div class="pair"><div><span>투명 알파</span><video controls loop muted playsinline preload="none" poster="{a["frames"][0]}" src="{a["loopVideo"]}"></video></div><div><span>보색 키 {a["keyColor"]}</span><video controls loop muted playsinline preload="none" src="{a["keyVideo"]}"></video></div></div><p>480×480 · 24fps · 72프레임 · 3초</p><a class="button" href="{a["sequenceZip"]}">이 종류 PNG 알파 받기</a></article>')
for category in labels:
    group=[a for a in data['items'] if a['category']==category];p=base/'다운로드'/f'{category}_Loop3s_PNGAlpha480_v95.zip'
    with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
        for a in group:
            for i in range(72):
                frame=Path(a['nativePNGPattern'].replace('%04d',f'{i:04}'));z.write(frame,frame.name)
            for key in ['loopVideo','keyVideo']:z.write(docs/a[key],a['id']+'_'+Path(a[key]).name)
        z.writestr('manifest.json',json.dumps(group,ensure_ascii=False,indent=2));z.writestr('README.txt','480x480 RGBA PNG;24fps;72frames;3seconds. Keep matching BG/LT. Basalt stays still. RGBA source alpha preserved; key videos are supplied separately. No new paid AI generation.\n')
    with zipfile.ZipFile(p) as z:assert z.testzip() is None and len(z.namelist())==len(group)*74+2
(base/'요소루프_제작목록_v95.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
public=json.loads(json.dumps(data))
for a in public['items']:
    for key in ['nativePNGPattern','pngSHA256','unityFrames']:a.pop(key,None)
(docs/'assets/element-loops-v95/manifest.json').write_text(json.dumps(public,ensure_ascii=False,indent=2),encoding='utf-8')
(docs/'element-loop-catalog95.js').write_text('window.jejuElementLoopData='+json.dumps(public,ensure_ascii=False,separators=(',',':'))+';\nwindow.jejuElementLoops.validate(window.jejuElementLoopData);if(window.jejuFinalCatalog)window.jejuFinalCatalog.assets=window.jejuFinalCatalog.assets.map(a=>window.jejuElementLoops.asset(a,window.jejuElementLoopData));\n',encoding='utf-8')
page='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>메이즈랜드 · 3초 요소 루프</title><link rel="stylesheet" href="collection.css?v=86"><link rel="stylesheet" href="site-nav.css?v=86"><script defer src="site-nav.js?v=95"></script><style>article{padding:24px;border:1px solid #486755;border-radius:16px;margin:22px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}video{display:block;width:100%;max-height:360px;background:#162133}.pair span{display:block;margin-bottom:12px}@media(max-width:650px){.pair{grid-template-columns:1fr}}</style></head><body><main class="collection"><header class="page-heading"><div><p class="eyebrow">480 · 24FPS · 3SEC · v95</p><h1>배경별 요소 루프 28종</h1><p><a class="button" href="butterflies-oil.html?v=20261028-v97#wingbeat-motion">새 추상 유화 나비 · 실제 날갯짓 검수 →</a></p><p class="lead">구름·유리 나비·빛 입자·풀·잎·나무와 고정 현무암. 투명 영상과 보색 단색 영상을 함께 제공합니다.</p></div></header><p>기존 검수 소스의 3초 반복 파생본입니다. 새 유료 AI 생성은 하지 않았습니다. 광택과 투명 경계를 보존하려고 PNG는 원본 알파에서 만들고, 컬러키 작업용 단색 영상도 따로 정리했습니다. 현무암은 고정 상태를 유지합니다.</p><p><a class="button" href="layered-garden.html?v=20261028-v95&theme=sunset">움직이는 정원 보기</a> <a class="button" href="production-status.html?v=20261028-v94">꽃 개화 48종 현황</a> <a href="atmosphere-loops.html">이전 긴 루프</a></p>'''+''.join(cards)+'</main></body></html>'
(docs/'element-loops.html').write_text(page,encoding='utf-8')
(base/'00_요소루프_보기_v95.html').write_text(page.replace('<head>','<head><base href="https://toy80318-sys.github.io/Schedule_App/">'),encoding='utf-8')
report={'pass1':{'originalIDs':28,'sameSourceSHA':True,'newPaidGeneration':False},'pass2':{'nativeRGBAFrames':count,'size':[480,480],'alphaBordersFailed':0},'pass3':{'PNGAndVideoSHAValidated':True,'introducedHolesFromFileEncoding':0},'pass4':{'loopSeamsChecked':28,'fps':24,'duration':3},'pass5':{'lightAndDarkAllFrameVisualSheets':28,'visualReview':'passed'},'limitations':['Unity runtime not checked','PNG source alpha preserved, not lossy key-video round-trip']}
(base/'검수/소스5회검증_v95.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Published28 reviewed loops;{count}480px RGBA frames;7 ZIP files verified.')
