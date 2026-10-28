"""Publish only individually reviewed, same-input flower openings; keep rejects visible."""
from pathlib import Path
import json,hashlib,html,csv,zipfile,subprocess,shutil
from PIL import Image
import cv2

repo=Path(__file__).resolve().parents[1]
base=repo.parent/'20261028_메이즈랜드_원본소스/꽃개화_480p_v92'
docs=repo/'docs';public=docs/'assets/flower-openings-v89'
manifest=json.loads((public/'manifest.json').read_text(encoding='utf-8'))
rows=json.loads((base/'생성준비48종.json').read_text(encoding='utf-8'))['requests']
edits={r['id']:r for r in json.loads((base/'제작기록/편집구간_v94.json').read_text(encoding='utf-8'))}
assert len(rows)==48 and len({r['jobId'] for r in rows})==48
passed=[];csvrows=[];cards=[]
videos=base/'개화영상_480_3초';videos.mkdir(exist_ok=True)
for a,r in zip(manifest['items'],rows):
    assert a['id']==r['id'] and [i['sha256'] for i in a['inputs']]==r['inputSHA256']
    assert a['inputs'][0]['value']==r['params']['medias'][0]['value'] and a['inputs'][1]['value']==r['params']['medias'][1]['value']
    rawsha=hashlib.sha256(Path(r['file']).read_bytes()).hexdigest()
    metaFile=base/'검수'/(r['id']+'_AIAlpha_v94.json')
    meta=json.loads(metaFile.read_text(encoding='utf-8')) if metaFile.exists() else {}
    valid=r.get('reviewStatus')!='rejected' and meta.get('visualApproved') is True and meta.get('matteRevision')==5
    a.update(status='passed' if valid else 'rejected' if r.get('reviewStatus')=='rejected' else 'generated-review-pending',jobId=r['jobId'],rawVideoSHA256=rawsha,actualResolution=[640,640],rawVideo=r['resultURL'],videoReview=r['reviewNote'])
    if valid:
        assert meta['sourceSHA256']==rawsha and meta['frames']==72 and meta['fps']==24 and meta['duration']==3
        frames=[f'assets/flower-openings-v89/{a["id"]}/frame_{i:04}.webp' for i in range(72)]
        for i,path in enumerate(frames):
            assert (docs/path).is_file()
            native=Path(meta['nativePNGPattern'].replace('%04d',f'{i:04}'))
            assert hashlib.sha256(native.read_bytes()).hexdigest()==meta['pngSHA256'][i]
        keyname=Path(meta['nativePNGPattern']).name.replace('_%04d.png','.mp4').replace('PNGAlpha','Key'+a['keyColor'][1:])
        video=videos/keyname
        stamp=videos/(keyname+'.json');frameHash=hashlib.sha256(''.join(meta['pngSHA256']).encode()).hexdigest()
        if not video.exists() or not stamp.exists() or json.loads(stamp.read_text(encoding='utf-8'))['frameHash']!=frameHash:
            proc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','480x480','-r','24','-i','pipe:0','-an','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','fast','-movflags','+faststart','-threads','2',str(video)],stdin=subprocess.PIPE,stderr=subprocess.PIPE)
            for i in range(72):
                image=Image.open(meta['nativePNGPattern'].replace('%04d',f'{i:04}'));assert image.mode=='RGBA' and image.size==(480,480)
                rgb=Image.new('RGB',image.size,a['keyColor']);rgb.paste(image,mask=image.getchannel('A'));proc.stdin.write(rgb.tobytes())
            proc.stdin.close();error=proc.stderr.read();assert proc.wait()==0,error
            stamp.write_text(json.dumps({'frameHash':frameHash,'sourceSHA256':rawsha,'matteRevision':5,'frames':72,'fps':24,'seconds':3,'keyColor':a['keyColor']}),encoding='utf-8')
        cap=cv2.VideoCapture(str(video));assert cap.get(cv2.CAP_PROP_FPS)==24 and cap.get(cv2.CAP_PROP_FRAME_COUNT)==72;cap.release()
        webvideo=public/a['id']/'key3s.mp4';shutil.copy2(video,webvideo)
        a.update(fps=24,duration=3,frames=frames,previewWidth=192,previewHeight=192,transparent=True,bud=frames[0],open=frames[-1],review={'alpha':True,'naturalOpening':True,'fullyOpenBySeconds':edits[a['id']]['fullyOpenBySeconds'],'allRawFramesInspected':97,'allAlphaFramesInspected':72,'matteRevision':5},sequenceZip='https://github.com/toy80318-sys/Schedule_App/releases/download/mazeland-flower-openings-v94/'+a['backgroundId']+'_'+a['lightingId']+'_FlowerOpening3s_PNGAlpha480_v94.zip')
        atlas=Image.new('RGBA',(2304,1152))
        for i,path in enumerate(frames):atlas.alpha_composite(Image.open(docs/path).convert('RGBA'),((i%12)*192,(i//12)*192))
        atlasfile=public/a['id']/'atlas.webp';atlas.save(atlasfile,quality=92,method=4)
        a['atlas']={'src':'assets/flower-openings-v89/'+a['id']+'/atlas.webp','columns':12,'rows':6,'width':2304,'height':1152,'sha256':hashlib.sha256(atlasfile.read_bytes()).hexdigest()}
        a['keyVideo']='assets/flower-openings-v89/'+a['id']+'/key3s.mp4'
        passed.append((a,meta))
    else:
        for key in ['frames','fps','duration','previewWidth','previewHeight','transparent','bud','open','review','sequenceZip','keyVideo','atlas']:a.pop(key,None)
    csvrows.append({'id':a['id'],'backgroundId':a['backgroundId'],'lightingId':a['lightingId'],'status':a['status'],'rawVideo':Path(r['file']).name,'nativePNGPattern':Path(meta.get('nativePNGPattern','')).name if valid else '','frames':72 if valid else 0,'fps':24 if valid else 0,'duration':3 if valid else 0,'keyColor':a['keyColor'],'jobId':a['jobId']})
    label='3초 PNG 알파 검수 통과' if valid else '사용 제외 · '+r['reviewNote'] if a['status']=='rejected' else '원본 개화 검토 완료 · 알파 검수 중'
    esc=html.escape
    description='480×480 · 24fps · 3초 · 알파에서 단색 키 배경으로 정리' if valid else '480p 설정 / 실제 원본 640×640 · 24fps · 4.04초 원본'
    cards.append(f'<article id="flower-{r["index"]}"><h3>{r["index"]:02} · {esc(a["name"])}</h3><p>{a["backgroundId"]} / {a["lightingId"]} · {esc(label)}</p><video controls playsinline preload="none" poster="{a["images"]["bud"]["preview"]}" src="{esc(a["keyVideo"] if valid else r["resultURL"],quote=True)}"></video><p>실제 봉오리·만개 두 이미지 입력 · {description}</p><p><a href="{esc(r["resultURL"],quote=True)}" target="_blank" rel="noopener">생성 원본 4.04초 보기</a></p>'+ (f'<a class="button" href="{a["sequenceZip"]}">이 배경의 PNG 알파 3초 묶음</a>' if valid else '')+'</article>')
manifest.update(paidJobsSubmitted=48,releaseRevision=94,rawGenerated=48,reviewPassed=len(passed),reviewRejected=sum(a['status']=='rejected' for a in manifest['items']),updated='2026-10-28')
(public/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(docs/'flower-opening-catalog.js').write_text('window.jejuFlowerOpeningData='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
with (base/'00_꽃48종_배경조명_파일대응_v94.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(csvrows[0]));writer.writeheader();writer.writerows(csvrows)
summary=f'새 영상 생성 48/48 · PNG 알파 검수 통과 {len(passed)}/48 · 원본 불합격 {manifest["reviewRejected"]}/48'
status=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>메이즈랜드 · 꽃 48종 제작 현황</title><link rel="stylesheet" href="site-nav.css?v=86"><link rel="stylesheet" href="collection.css?v=86"><script defer src="site-nav.js?v=95"></script><style>.videos{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}}article{{padding:16px;border:1px solid #466456;border-radius:16px}}video{{width:100%;aspect-ratio:1;max-height:350px;background:#172332}}article p{{font-size:14px}}nav{{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}}@media(max-width:900px){{.videos{{grid-template-columns:repeat(2,minmax(0,1fr))}}}}@media(max-width:600px){{.videos{{grid-template-columns:1fr}}}}</style></head><body><main class="collection"><header class="page-heading"><div><p class="eyebrow">2026-10-28 · v94</p><h1>꽃 48종 제작 현황</h1><p class="lead">{summary}</p></div></header><nav><a class="button" href="layered-garden.html?v=20261028-v94&theme=sunset">정원에서 터치하기</a><a class="button" href="flower-opening-review.html?v=20261028-v94">같은 꽃 봉오리·만개 쌍</a><a class="button" href="editor.html?v=20261028-v94&currentSet=sunset">에디터 · 초점·블러</a></nav><p>48편 모두 새로 생성했습니다. 기존 영상 변형으로 대신하지 않았습니다. 통과 항목은 480×480 · 3초 키 영상입니다. 불합격 항목은 4.04초 생성 원본을 별도 표시합니다. 검수 통과한 꽃만 3초 PNG 알파로 게임에 연결합니다. 불합격 원본은 사용을 막았습니다.</p><p>추진이 힉스필드 · 48편 최초 생성 승인 한도 115.2크레딧. 조회 잔액 882→824.4(감소 57.6). 잔액 차이와 개별 청구 명세는 구분합니다. 유료 재생성은 별도 확인 중이며 업스케일은 실행하지 않았습니다.</p><p>정원은 기본 살랑임·같은 색 꽃잎·배경과 구름·나비 루프를 사용합니다. 에디터 상단 <strong>초점 · 블러</strong>에서 배경·먼 곳·가까운 곳·선택 요소를 조절할 수 있습니다. Unity 실제 실행과 전시장 장비 검증은 아직 하지 않았습니다.</p><section class="videos">{''.join(cards)}</section><p>로컬 소스: {html.escape(str(base))}</p></main></body></html>'''
(docs/'production-status.html').write_text(status,encoding='utf-8')
(base/'00_꽃48종_제작현황_v94.html').write_text(status.replace('<head>','<head><base href="https://toy80318-sys.github.io/Schedule_App/">'),encoding='utf-8')
(base/'진행상태.md').write_text('# 꽃 개화 제작 현황\n\n'+summary+'\n\n원본영상: 원본영상/\nPNG 알파: PNG알파_480/\n배경과 조명 대응: 00_꽃48종_배경조명_파일대응_v94.csv\n\n불합격은 게임·알파 최종 묶음에서 제외. 유료 자동 재생성·업스케일 없음.\n',encoding='utf-8')
packages=base/'다운로드';packages.mkdir(exist_ok=True)
for bg in ['BG01','BG02','BG03','BG04']:
    group=[(a,m) for a,m in passed if a['backgroundId']==bg]
    if not group:continue
    file=packages/f'{bg}_LT0{bg[-1]}_FlowerOpening3s_PNGAlpha480_v94.zip'
    with zipfile.ZipFile(file,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
        for a,m in group:
            for i in range(72):
                native=Path(m['nativePNGPattern'].replace('%04d',f'{i:04}'));z.write(native,native.name)
            video=videos/Path(m['nativePNGPattern']).name.replace('_%04d.png','.mp4').replace('PNGAlpha','Key'+a['keyColor'][1:]);z.write(video,video.name)
        z.writestr('README.txt','24fps / 72 frames / 3 seconds / 480x480 RGBA. Same BG/LT only. Root fixed. Hold last frame after opening. No reverse.\n')
        z.writestr('manifest.json',json.dumps([row for row in csvrows if row['backgroundId']==bg and row['status']=='passed'],ensure_ascii=False,indent=2))
    with zipfile.ZipFile(file) as z:assert z.testzip() is None and len(z.namelist())==len(group)*73+2
print(summary)
