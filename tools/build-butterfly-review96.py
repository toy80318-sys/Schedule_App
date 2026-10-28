"""Review new oil-painted butterfly images without presenting old video as new."""
from pathlib import Path
import json,html
repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
data=json.loads((docs/'assets/abstract-butterflies-v96/manifest.json').read_text(encoding='utf-8'))
cards=[]
for a in data['items']:
    old='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/atmosphere-v84/butterfly_'+str(a['index']).zfill(2)+'.png'
    cards.append(f'''<article id="butterfly-{a['index']}"><h2>{a['index']:02} · {html.escape(a['name'])}</h2><div class="compare"><figure><figcaption>이전 · 섬세한 유리 무늬</figcaption><img loading="lazy" src="{old}" alt="이전 나비"></figure><figure class="new"><figcaption>새 이미지 · 굵은 추상 유화 붓질</figcaption><a href="{a['sourcePNG']}" target="_blank" rel="noopener"><img src="{a['sourcePNG']}" alt="{html.escape(a['name'])}"></a></figure><figure class="light"><figcaption>밝은 배경의 실제 PNG 알파</figcaption><img loading="lazy" src="{a['sourcePNG']}" alt="밝은 배경의 새 나비"></figure></div><p>완성된 독립 객체 · 1024×1024 RGBA · 화면 밖 잘림 방지 여백 · 네 배경 공용 색감</p><p class="status">새 영상: 생성 비용 확인 대기 · 기존 영상은 새 이미지 영상으로 표시하지 않습니다.</p><a class="button" href="{a['sourcePNG']}" download>PNG 알파 받기</a> <a href="{a['keyImage']}" download>보색 키 입력 {a['keyColor']}</a></article>''')
page='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>메이즈랜드 · 추상 유화 나비 4종</title><link rel="stylesheet" href="collection.css?v=86"><link rel="stylesheet" href="site-nav.css?v=86"><script defer src="site-nav.js?v=96"></script><style>article{margin:30px 0;padding:24px;border:1px solid #4c6655;border-radius:18px}.compare{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;background:#122132;border-radius:14px;overflow:hidden}figcaption{padding:12px;font-size:13px}figure img{width:100%;display:block;aspect-ratio:1;object-fit:contain}.light{background:#e8dfd3;color:#273a38}.new{border:1px solid #e9c09b}.status{color:#f2d1a6}@media(max-width:700px){.compare{grid-template-columns:1fr}article{padding:16px}}</style></head><body><main class="collection"><header class="page-heading"><div><p class="eyebrow">NEW ART · 2026-10-28 · v96</p><h1>붓질과 색면으로 다시 그린 나비</h1><p class="lead">추상 유화 느낌을 크게 강화했습니다. 날개 맥·보석·비늘 무늬를 덜어내고, 두꺼운 붓질과 따뜻한 오팔 색면으로 표현했습니다.</p></div></header><p><a class="button" href="assets/abstract-butterflies-v96/Butterfly_AbstractOil3x_4PNG_v96.zip" download>새 PNG 알파 4종 전체 받기</a> <a class="button" href="element-loops.html?v=20261028-v96">요소 루프 보기</a></p><p>새 이미지와 보색 키 입력 4종을 준비했습니다. 480p·무음 영상 4편의 견적은 총 최대9.6크레딧이며 별도 확인 대기입니다. 모델 최소4초 원본을 검수한 뒤 게임용480×480·24fps·3초 PNG 알파로 정리합니다. 업스케일과 자동 유료 재시도는 실행하지 않습니다.</p>'''+''.join(cards)+'</main></body></html>'
(docs/'butterflies-oil.html').write_text(page,encoding='utf-8')
base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
(base/'00_나비4종_추상유화_비교_v96.html').write_text(page.replace('<head>','<head><base href="https://toy80318-sys.github.io/Schedule_App/">'),encoding='utf-8')
print('Built4 new-image comparisons; video production honestly pending.')
production=docs/'assets/abstract-butterflies-v97/production.json'
if production.exists():
    p=json.loads(production.read_text(encoding='utf-8'));videos=[]
    motion=p.get('motionPreview')
    if motion:
        videos.append(f'''<article id="wingbeat-motion"><h2>실제 날갯짓 · 3초 동작 확인용</h2><p>04 나비의 온전한 1초 날갯짓을 원래 속도로 세 번 연결했습니다. 날개가 몸통 연결부에서 접혔다 펼쳐집니다. 역재생·이미지 전체 흔들기·형태 보간을 사용하지 않았습니다.</p><div class="compare"><figure><figcaption>480×480 · 보색 키 · 3초 루프</figcaption><video id="wingbeat-key" src="{motion['keyVideo']}" controls muted loop playsinline preload="metadata"></video></figure><figure><figcaption>PNG 알파 파생 영상 · 가장자리 보정 검토 중</figcaption><video id="wingbeat-alpha" src="{motion['alphaVideo']}" controls muted loop playsinline preload="metadata"></video></figure><figure class="light"><figcaption>밝은 배경 · 같은 알파 후보</figcaption><video src="{motion['alphaVideo']}" controls muted loop playsinline preload="metadata"></video></figure></div><p class="status">동작 확인용 후보입니다. 알파 가장자리의 청록 잔색·흐림 보정과 사용자 확인 전이며, 에디터·게임에 적용하지 않았습니다.</p><p><a class="button" href="{motion['keyVideo']}" download>3초 키 영상 받기</a> <a class="button" href="{motion['sequenceZip']}" download>PNG 알파 72장 · 검토용</a> <a href="{motion['fiveCycleVideo']}" target="_blank" rel="noopener">5회 반복 · 15초 영상</a></p></article>''')
    for a in p['items']:
        if 'rawVideo' not in a:continue
        reason=a.get('review',{}).get('reason','최종 동작·알파 검토 중입니다.')
        label='불합격 · 게임 사용 제외' if a['productionStatus']=='rejected' else '원본 검토용 · 게임 미적용'
        videos.append(f'''<article id="wingbeat-raw-{a['index']}"><h2>{a['index']:02} · {label}</h2><p class="status">{html.escape(reason)}</p><div class="compare"><figure><figcaption>실제로 입력한 이미지</figcaption><img loading="lazy" src="{a['sourcePNG']}" alt="나비 {a['index']} 실제 영상 입력 이미지"></figure><figure><figcaption>새 Higgsfield 생성 원본 · {html.escape(a['model'])}</figcaption><video controls muted loop playsinline preload="none" src="{a['rawVideo']}"></video></figure><figure><figcaption>원본 16시점 · 확대 가능</figcaption><a href="{a['reviewSheet']}" target="_blank" rel="noopener"><img loading="lazy" src="{a['reviewSheet']}" alt="나비 {a['index']} 영상 16시점 검수"></a></figure></div><p>{a['width']}×{a['height']} 실제 출력 · 24fps · {a['frameCount']}프레임 · 작업 {a['jobId']}</p></article>''')
    inputs='<details id="wingbeat-inputs"><summary>몸통 방향 고정을 위해 보완한 측면 입력4종</summary><div class="compare">'+''.join(f'<figure><figcaption>{a["index"]:02} · 측면 입력 PNG</figcaption><a href="{a["sourcePNG"]}" download><img loading="lazy" src="{a["sourcePNG"]}" alt="나비{a["index"]}의 새 측면 입력"></a></figure>' for a in p['sideInputs'])+'</div></details>'
    section='<section id="wingbeats"><h2>새로 생성한 실제 날갯짓 · v97</h2><p>승인된 최초4편을 생성했습니다. 견적 누계는9.2/9.6크레딧이며 유료 재시도와 업스케일은0회입니다. 생성 완료와 품질 합격을 구분합니다.</p>'+''.join(videos[:1])+inputs+''.join(videos[1:])+'</section>'
    page=page.replace('</style>','video{display:block;width:100%;aspect-ratio:1;object-fit:contain}#wingbeats{scroll-margin-top:100px}</style>')
    page=page.replace('새 이미지와 보색 키 입력 4종을 준비했습니다. 480p·무음 영상 4편의 견적은 총 최대9.6크레딧이며 별도 확인 대기입니다. 모델 최소4초 원본을 검수한 뒤 게임용480×480·24fps·3초 PNG 알파로 정리합니다. 업스케일과 자동 유료 재시도는 실행하지 않습니다.','아래에서 실제 날개 접기·펼치기 생성 결과와 불합격 사유를 확인할 수 있습니다. 동작 확인용3초 후보를 공개했으며 게임용 최종 알파와 전체4종 교체는 완료 전입니다.')
    page=page.replace('<article id="butterfly-1">',section+'<h2 id="painted-images">기존에 준비한 추상 유화 이미지4종</h2><article id="butterfly-1">')
    page=page.replace('새 영상: 생성 비용 확인 대기 · 기존 영상은 새 이미지 영상으로 표시하지 않습니다.','새 영상: 상단 실제 날갯짓 검수 참조 · 기존 게임 루프와 구분됩니다.')
    page=page.replace('NEW ART · 2026-10-28 · v96','NEW ART + WINGBEATS · 2026-10-28 · v97')
    if motion:
        for key in ['keyVideo','alphaVideo','fiveCycleVideo','sequenceZip']:page=page.replace(motion[key]+'"',motion[key]+'?v=97r2"')
    (docs/'butterflies-oil.html').write_text(page,encoding='utf-8')
    (base/'00_나비4종_추상유화_비교_v96.html').write_text(page.replace('<head>','<head><base href="https://toy80318-sys.github.io/Schedule_App/">'),encoding='utf-8')
    print('Added exact newly generated video candidates and quality decisions,without game replacement.')

latest=docs/'assets/butterfly-wingbeats-v98/manifest.json'
if latest.exists():
    import re
    d=json.loads(latest.read_text(encoding='utf-8'));current=[]
    for a in d['items']:
        current.append(f'''<article id="wingbeat-{a['index']}"><h2>{a['index']:02} · 추상 유화 나비 · 실제 날갯짓</h2><div class="compare"><figure><figcaption>단색 키 · {a['keyColor']} · 3초</figcaption><video controls muted loop playsinline preload="metadata" src="{a['keyVideo']}"></video></figure><figure><figcaption>어두운 배경 · 실제 알파 영상</figcaption><video controls muted loop playsinline preload="metadata" src="{a['loopVideo']}"></video></figure><figure class="light"><figcaption>밝은 배경 · 같은 알파 영상</figcaption><video controls muted loop playsinline preload="metadata" src="{a['loopVideo']}"></video></figure></div><p>480×480 · 24fps · 72프레임 · 3초 · 측면 날개 접기/펼치기 · 에디터와 정원에 연결</p><p>원래 속도의 {a['actualCycleFrames']/24:g}초 날갯짓 주기를 순방향으로 반복했습니다. 빠른 날갯짓의 원본 모션 블러는 남아 있습니다.</p><p><a class="button" href="{a['sequenceZip']}" download>PNG 알파 72장 받기</a> <a class="button" href="{a['keyVideo']}" download>단색 키 영상</a> <a href="{a['fiveCycleVideo']}" target="_blank" rel="noopener">5회 반복 확인</a></p><details><summary>입력 이미지·생성 원본·검수 보기</summary><div class="compare"><figure><figcaption>실제 시작/끝 입력</figcaption><a href="{a['sourcePNG']}" download><img src="{a['sourcePNG']}" alt="나비 {a['index']}의 실제 입력 PNG" loading="lazy"></a></figure><figure><figcaption>480p 설정의 실제 640×640 원본</figcaption><video controls muted playsinline preload="none" src="{a['rawVideo']}"></video></figure><figure><figcaption>원본 16시점</figcaption><a href="{a['reviewSheet']}"><img loading="lazy" src="{a['reviewSheet']}" alt="나비 {a['index']} 검수"></a></figure></div><p>작업 {a['jobId']} · 입력 이미지와 원본 영상 해시 대조 완료</p></details></article>''')
    history=page.split('<main class="collection">',1)[1].rsplit('</main>',1)[0]
    main='''<header class="page-heading"><div><p class="eyebrow">ACTUAL WINGBEATS · 2026-10-28 · v98</p><h1>추상 유화 나비 · 실제 날갯짓 4종</h1><p class="lead">날개를 접었다 펼치는 실제 생성 영상에서 자연스러운 주기를 골라 3초 루프로 정리했습니다. 배경이 투명한 PNG 시퀀스와 보색 단색 영상도 함께 제공합니다.</p></div></header><p>불합격 3종을 각 1회 재생성했습니다. 추가 사용 6/6크레딧 · 업스케일 없음.</p><p><a class="button" href="assets/butterfly-wingbeats-v98/Butterfly4_PNGAlpha480_v98.zip" download>나비 4종 PNG 알파 전체 받기</a> <a class="button" href="layered-garden.html?v=20261028-v98&theme=sunset">정원에서 보기</a> <a class="button" href="editor.html?v=20261028-v98">에디터 열기</a></p><section id="wingbeat-motion">'''+''.join(current)+'</section><details id="old-wingbeats"><summary>이전 이미지·불합격 영상 기록</summary>'+history+'</details>'
    page=page.split('<main class="collection">',1)[0]+'<main class="collection">'+main+'</main></body></html>'
    page=page.replace('site-nav.js?v=96','site-nav.js?v=98')
    (docs/'butterflies-oil.html').write_text(page,encoding='utf-8')
    (base/'00_나비4종_실제날갯짓_v98.html').write_text(page.replace('<head>','<head><base href="https://toy80318-sys.github.io/Schedule_App/">'),encoding='utf-8')
    loops=docs/'element-loops.html';s=loops.read_text(encoding='utf-8')
    s=re.sub(r'<article><h3>[^<]*</h3><p>atmosphere85-butterfly-0[1-4].*?</article>','',s)
    s=s.replace('20261028-v97#wingbeat-motion','20261028-v98#wingbeat-motion').replace('구름·유리 나비·빛 입자','구름·추상 유화 나비·빛 입자').replace('새 유료 AI 생성은 하지 않았습니다.','나비 4종은 새 추상 유화 입력으로 생성한 실제 날갯짓입니다. 다른 요소는 기존 검수 소스의 파생본입니다.')
    s=re.sub(r'<article><h3>추상 유화 나비 4종.*?</article>','',s)
    s=s.replace('</main>','<article><h3>추상 유화 나비 4종 · 실제 날개 접기/펼치기</h3><p>새 PNG 알파·단색 키 영상과 검수 기록을 한곳에 정리했습니다.</p><a class="button" href="butterflies-oil.html?v=20261028-v98#wingbeat-motion">4종 날갯짓 보기</a></article></main>').replace('site-nav.js?v=95','site-nav.js?v=98')
    loops.write_text(s,encoding='utf-8')
    print('Latest4 native loops linked; previous failures kept in collapsed history.')
