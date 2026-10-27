"""Assemble the review sets from complete PNG sources, without changing source pixels."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
WEB = ROOT / 'docs'
OUT = WEB / 'assets' / 'set-review-v01'
PNG = ROOT / 'source-assets' / 'set-review-v01'
LEGACY_PNG = OUT / 'PNG'
PREVIEW = OUT / 'preview'
RAW = 'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/'
REFERENCES = Path(r'D:\work\2026\0510_부천영화제\08_Hoban\제주_밝은배경_꽃포커스_20261027')
SIZE = (14165, 3480)
THEMES = [
    ('sunset', 'BG01', '노을', '01_노을', ['펼쳐진 동백', '옆을 향한 컵형 동백', '펼쳐진 금잔화', '겹꽃 금잔화', '성긴 메밀꽃 가지', '작은 크림꽃 모음'], ['블러시 핑크', '코랄', '애프리콧', '아이보리']),
    ('day', 'BG02', '낮', '02_낮', ['펼쳐진 금잔화', '겹꽃 금잔화', '유채꽃 가지', '성긴 유채꽃', '메밀꽃 가지', '작은 크림꽃 모음'], ['골든 옐로우', '애프리콧', '레몬 옐로우', '크림']),
    ('night', 'BG03', '달빛', '03_달빛', ['둥근 수국', '성긴 수국', '곧은 라벤더', '휘어진 라벤더', '활짝 핀 동백', '옆을 향한 동백'], ['페리윙클', '라일락', '라벤더 핑크', '블루 아이보리']),
    ('morning', 'BG04', '아침', '04_아침', ['둥근 하늘빛 수국', '납작한 수국', '두 송이 수국', '비스듬한 수국', '가는 라벤더', '흰꽃 가지'], ['스카이블루', '코발트블루', '페일 라벤더', '블루 아이보리']),
]
ENV = [
    ('E01', 'grass', '풀', 'grass-complete'),
    ('E02', 'tree', '나무', None),
    ('E03', 'butterfly', '나비', 'atmosphere-03'),
    ('E04', 'cloud', '구름', 'atmosphere-01'),
    ('E05', 'basalt', '현무암', 'rocks-01'),
    ('E06', 'leaf', '잎 가지', 'greenery-01'),
]
V03_SETS = {'sunset','day','night','morning'}
BASE_ART = [('I01','V01','꽃 포커스 통합본','integrated'),('I02','V02','전경 환경 블러 통합 시안','integrated'),('B01','V01','밝은 배경 · 선명','backgrounds'),('B02','V02','밝은 배경 · 약한 블러','backgrounds')]


def art_variants(theme):
    return BASE_ART + ([('B03','V03','레퍼런스 추상 유화 배경','backgrounds'),('I03','V03','레퍼런스 추상 유화 통합 시안','integrated')] if theme in V03_SETS else [])


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def preserve_layout(path,value):
    if path.is_file():
        if read_json(path)!=value:
            raise ValueError(f'기존 기본 배치를 바꾸지 않기 위해 중단했습니다: {path.name}')
    else:
        write_json(path,value)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def copy_original(source, destination):
    if not source.is_file():
        raise FileNotFoundError(f'원본이 없습니다: {source}')
    if destination.exists():
        if digest(source) != digest(destination):
            raise ValueError(f'다른 파일이 이미 있어 보존했습니다: {destination}')
    else:
        shutil.copy2(source, destination)
    if digest(source) != digest(destination):
        raise ValueError(f'복사 검증 실패: {destination}')


def prepare_sources():
    PNG.mkdir(parents=True, exist_ok=True)
    previous_hashes={}
    if (OUT/'asset-audit.json').is_file():
        previous_hashes={a['id']:a['sha256'] for a in read_json(OUT/'asset-audit.json')['files']}
    for source in LEGACY_PNG.glob('*.png'):
        copy_original(source,PNG/source.name)
    text = (WEB / 'whole62-data.js').read_text(encoding='utf-8')
    previous = json.JSONDecoder().raw_decode(text.split('=', 1)[1])[0]
    for theme, code, _, prefix, *_ in THEMES:
        for target, source in [
            ('B01-V01', REFERENCES / f'{prefix}_밝은배경.png'),
            ('I01-V01', REFERENCES / f'{prefix}_꽃포커스_통합본.png'),
            ('B02-V02', REFERENCES / '블러추가본' / f'{prefix}_배경_약블러.png'),
            ('I02-V02', REFERENCES / '블러추가본' / f'{prefix}_통합시안_전경블러.png'),
        ]:
            destination=PNG/f'{code}-{target}.png'
            if source.is_file():
                copy_original(source,destination)
            elif not destination.is_file():
                raise FileNotFoundError(f'원본이 없습니다: {destination.name}')
            elif previous_hashes.get(f'{code}-{target}') and digest(destination)!=previous_hashes[f'{code}-{target}']:
                raise ValueError(f'보관된 원본의 해시가 이전 검수 기록과 다릅니다: {destination.name}')
        for eid, _, _, suffix in ENV:
            if suffix is None:
                continue
            asset = next(a for a in previous['assets'] if a['id'] == f'whole62-{theme}-{suffix}')
            candidates = list((ROOT / 'source-assets').glob('*/' + asset['file']))
            if len(candidates) != 1:
                raise ValueError(f'독립 PNG 원본 경로가 모호합니다: {asset["file"]}')
            copy_original(candidates[0], PNG / f'{code}-{eid}-V01.png')


def inspect_png(path, independent):
    with Image.open(path) as im:
        if im.format != 'PNG':
            raise ValueError(f'PNG 형식이 아닙니다: {path.name}')
        im.load()
        width, height = im.size
        has_alpha = 'A' in im.getbands()
        bbox = None
        margins = None
        transparent_fraction = 0
        low_alpha_pixels = 0
        border_clear = None
        if has_alpha:
            alpha = im.getchannel('A')
            hist = alpha.histogram()
            transparent_fraction = hist[0] / (width * height)
            low_alpha_pixels = sum(hist[1:8])
            bbox = alpha.point(lambda n: 255 if n >= 8 else 0).getbbox()
            if bbox:
                margins = [bbox[0], bbox[1], width - bbox[2], height - bbox[3]]
                border_clear = min(margins) >= 8
            else:
                border_clear = False
        alpha_ok = has_alpha and transparent_fraction >= .01 and bbox is not None
        complete = bool(alpha_ok and border_clear) if independent else width > 0 and height > 0
        verification = {
            'alpha': bool(alpha_ok),
            'borderClear': border_clear,
            'complete': complete,
            'technicalOnly': True,
            'status': 'technical_pass' if complete else 'technical_hold',
            'visualMatch': 'pending_manual_review',
            'alphaThreshold': 8,
            'minimumTransparentMarginPx': 8,
            'visibleBounds': list(bbox) if bbox else None,
            'transparentMarginsPx': margins,
            'fullyTransparentFraction': round(transparent_fraction, 6),
            'lowAlphaPixelsBelowThreshold': low_alpha_pixels,
            'note': '기술 검수만 통과. 형태·연결·색·조명·통합본 유사도는 개별 육안 검수가 필요합니다.',
        }
    return {'width': width, 'height': height, 'bytes': path.stat().st_size, 'sha256': digest(path), 'verification': verification}


def metadata_sources():
    paths = {p.name:p for p in (OUT/'generation-records').glob('*.json')}
    paths.update({p.name:p for p in set(OUT.glob('*assets*.json')) | set(OUT.glob('*prompts*.json'))})
    def priority(path):
        return 3 if path.name=='extra-master-prompts.json' else 0 if 'progress' in path.name else 2 if path.name.endswith('-assets.json') else 1
    sources = []
    for path in sorted(paths.values(),key=lambda p:(priority(p),p.name)):
        try:
            data = read_json(path)
        except json.JSONDecodeError:
            continue  # A generation worker may be writing its progress file.
        sources.append((path,data))
    return sources


def generation_metadata():
    result = {}
    for _,data in metadata_sources():
        for item in data if isinstance(data,list) else data.get('assets',data.get('jobs',[])):
            if isinstance(item, dict) and isinstance(item.get('id'), str):
                result[item['id']] = {**result.get(item['id'],{}),**item}
                if item.get('prompt') and not item.get('generationPrompt'):
                    result[item['id']]['generationPrompt']=item['prompt']
    return result


def public_metadata(value):
    if isinstance(value,dict):
        return {key:public_metadata(item) for key,item in value.items() if key.lower() not in {'path','localpath','outputpath'}}
    if isinstance(value,list):
        return [public_metadata(item) for item in value]
    if isinstance(value,str):
        filename=value.replace('\\','/').rsplit('/',1)[-1]
        if re.fullmatch(r'BG0[1-4]-(?:F\d{2}-C\d{2}-V\d{2}|[EBI]\d{2}-V\d{2})\.png',filename) and (value.startswith(('assets/set-review-v01/PNG/','PNG/')) or re.match(r'^[A-Za-z]:[\\/]',value)):
            return RAW+filename
        if re.match(r'^[A-Za-z]:[\\/]',value):
            return 'PNG/'+filename
    return value


def generation_records(write=False):
    directory=OUT/'generation-records'
    if write:
        directory.mkdir(exist_ok=True)
    records=[]
    for path,data in metadata_sources():
        if 'progress' in path.name:
            continue
        if write:
            write_json(directory/path.name,public_metadata(data))
        records.append({'name':path.name,'src':'assets/set-review-v01/generation-records/'+path.name})
    return records


def preview_record(asset_id,independent,write=False,cached=None,source_sha=None):
    path=PREVIEW/f'{asset_id}.webp'
    if write and path.is_file() and cached and cached.get('sha256')==source_sha and cached.get('previewSha256')==digest(path):
        write=False
    if write:
        PREVIEW.mkdir(exist_ok=True)
        with Image.open(PNG/f'{asset_id}.png') as im:
            if independent:
                small=ImageOps.contain(im.convert('RGBA'),(320,320),Image.Resampling.LANCZOS)
                preview=Image.new('RGBA',(320,320))
                preview.paste(small,((320-small.width)//2,(320-small.height)//2))
            else:
                width=min(1200,im.width)
                preview=im.resize((width,max(1,round(width*im.height/im.width))),Image.Resampling.LANCZOS)
            preview.save(path,'WEBP',quality=85,method=6)
    with Image.open(path) as im:
        if im.format!='WEBP' or independent and ('A' not in im.getbands() or im.size!=(320,320)):
            raise ValueError(f'미리보기 형식 오류: {path.name}')
        width,height=im.size
    return {'preview':f'assets/set-review-v01/preview/{asset_id}.webp','previewWidth':width,'previewHeight':height,'previewBytes':path.stat().st_size,'previewSha256':digest(path)}


def asset_record(asset_id, info, **labels):
    return {'id': asset_id, 'version': asset_id.rsplit('-', 1)[-1], 'src': RAW+asset_id+'.png', **labels, **info}


def place(asset, object_id, center, foot, size, *, layer, rotation=0, blur=0, opacity=1, flip=False):
    width = size
    height = size * asset['height'] / asset['width']
    bounds = asset['verification']['visibleBounds'] or [0, 0, asset['width'], asset['height']]
    x = center - (bounds[0] + bounds[2]) / 2 / asset['width'] * width
    y = foot - bounds[3] / asset['height'] * height
    x = max(0, min(SIZE[0] - width, x))
    y = max(0, min(SIZE[1] - height, y))
    return {
        'id': object_id, 'assetId': asset['id'], 'name': asset['name'],
        'x': round(x, 4), 'y': round(y, 4), 'w': round(width, 4), 'h': round(height, 4),
        'baseW': round(width, 4), 'baseH': round(height, 4), 'aspect': asset['width'] / asset['height'],
        'r': round(rotation, 4), 'opacity': opacity, 'flipX': flip, 'blur': blur,
        'motion': 'stationary', 'reviewLayer': layer,
    }


def make_project(scene):
    width, height = SIZE
    flowers, env = scene['flowers'], {a['category']: a for a in scene['environment']}
    objects = []
    add = objects.append
    for i in range(2):
        add(place(env['cloud'], f'{scene["code"]}-cloud-{i:02}', width * (.23 + i * .5), height * (.25 + i * .04), height * .42, layer=0, opacity=.24))
        add(place(env['tree'], f'{scene["code"]}-tree-{i:02}', width * (.035 + i * .93), height * .81, height * .28, layer=1, opacity=.9))
        add(place(env['butterfly'], f'{scene["code"]}-butterfly-{i:02}', width * (.31 + i * .41), height * (.49 + i * .03), height * .09, layer=3, rotation=-8 + i * 17))
    for i in range(80):
        # A deterministic clump pattern keeps each generated revision directly comparable.
        rear = i < 18
        hero = i >= 66
        clump = i % 16
        center = width * ((clump + .6) / 17) + height * .045 * math.sin(i * 2.17)
        size = height * (.18 * (1 + .1 * math.sin(i * 1.73)) if rear else .485 + .015 * math.sin(i * 1.73) if hero else .33 + .01 * math.sin(i * 1.73))
        foot = height * ((.82 if rear else .99 if hero else .95) + .025 * math.sin(i * 2.63))
        asset = flowers[(i * 7 + i // 24) % len(flowers)]
        add(place(asset, f'{scene["code"]}-flower-{i:03}', center, foot, size, layer=2 if rear else 5 if hero else 4, rotation=7 * math.sin(i * 1.21), blur=1.8 if rear else 0, flip=i % 5 == 0))
    for i in range(4):
        add(place(env['leaf'], f'{scene["code"]}-leaf-{i:02}', width * ((i + .5) / 4), height * .927, height * .20, layer=3, rotation=-9 + i * 5))
    for i in range(12):
        near = i % 2 == 0
        add(place(env['basalt'], f'{scene["code"]}-basalt-{i:02}', width * ((i + .5) / 12), height * (.979 if near else .95), height * (.205 if near else .17), layer=7 if near else 5, blur=6 if near else .4, flip=i % 3 == 0))
    for i in range(14):
        add(place(env['grass'], f'{scene["code"]}-grass-{i:02}', width * ((i + .5) / 14), height * .985, height * (.14 + .025 * math.sin(i * 1.93)), layer=8, blur=5 + i % 4, flip=i % 2 == 0))
    objects.sort(key=lambda o: o.pop('reviewLayer'))
    records = []
    for asset in flowers + scene['environment']:
        records.append({
            'id': asset['id'], 'name': asset['name'], 'src': asset['src'], 'preview':asset['preview'], 'width': asset['width'], 'height': asset['height'],
            'category': asset['category'], 'group': 'flowers' if asset['category'] == 'flower' else 'decor',
            'completeObject': True, 'stillOnly': True, 'transparent': True, 'lightingBaked': True,
            'theme': scene['id'], 'imageStyleVersion': 75, 'sha256': asset['sha256'],
        })
    neutral = {'brightness': 100, 'contrast': 100, 'saturation': 100, 'warmth': 0}
    return {
        'format': 'jeju-maze-wall-v1', 'name': f'{scene["code"]} V01 · {scene["label"]} · 6디자인×4색 · 포커스 비교',
        'width': width, 'height': height, 'oilAssetVersion': 14, 'flowerAssetVersion': 2, 'setReviewVersion': 'V01',
        'background': scene['backgrounds'][1]['src'], 'backgroundFit': 'fill', 'reference': None,
        'assets': records, 'objects': objects, 'gardenSpace': {'enabled': False},
        'sceneFilters': {**{key: dict(neutral) for key in ['scene', 'background', 'flowers', 'decor']}, 'focus': {'background': 0, 'far': 0, 'near': 0, 'focus': .65}},
        'reviewNote': 'AI 통합본은 약 3:1, 실제 벽면은 약 4.07:1입니다. 배경은 에디터 등록 배경과 같은 fill 방식이며 정지 합성은 실제 Unity 실행을 대신하지 않습니다.',
    }


def make_unity(project):
    width, height = project['width'], project['height']
    return {
        'format': 'jeju-unity-v1', 'version': 1, 'name': project['name'], 'units': 'meters', 'widthMm': width, 'heightMm': height,
        'sourceProject': f'{project["assets"][0]["theme"]}_editor.json', 'sceneFilters': project['sceneFilters'], 'gardenSpace': project['gardenSpace'],
        'background': {'image': 'PNG/' + Path(project['background']).name, 'fit': 'fill'},
        'assets': [{'id': a['id'], 'name': a['name'], 'kind': 'sprite', 'frames': ['PNG/' + Path(a['src']).name], 'widthPixels': a['width'], 'heightPixels': a['height'], 'sourceAssetId': a['id'], 'sha256': a['sha256']} for a in project['assets']],
        'objects': [{
            'id': o['id'], 'assetId': o['assetId'], 'name': o['name'],
            'xMeters': (o['x'] + o['w'] / 2 - width / 2) / 1000,
            'yMeters': (height / 2 - o['y'] - o['h'] / 2) / 1000,
            'widthMeters': o['w'] / 1000, 'heightMeters': o['h'] / 1000,
            'rotationZ': -o['r'], 'sortingOrder': i, 'flipX': o['flipX'], 'opacity': o['opacity'],
            'blur': o['blur'], 'blurBaked': False, 'editorXmm': o['x'], 'editorYmm': o['y'],
        } for i, o in enumerate(project['objects'])],
        'verification': {'runtime': 'not_run', 'dataOnly': True, 'focusBlurBaked': False, 'pathBase': 'PNG/ 경로는 이 JSON과 함께 내려받은 PNG 폴더를 기준으로 합니다.', 'note': 'Unity 좌표 참고 JSON입니다. 현재 Unity 임포터는 blur 값을 적용하지 않습니다. PNG 배치와 초점/개별 블러를 구현한 뒤 실제 캡처로 검증해야 합니다.'},
    }


GUIDE = '''# AI 세트 검증 가이드 · V01 세트 / V03 추가 시안

## 번호와 비교 순서

- BG01 노을 / BG02 낮 / BG03 달빛 / BG04 아침.
- I01-V01: 첫 꽃 포커스 통합본. I02-V02: 전경 환경 블러 통합 시안.
- B01-V01: 선명한 밝은 배경. B02-V02: 약한 블러를 준 밝은 배경.
- B03-V03: 레퍼런스 추상 유화 배경. I03-V03: 레퍼런스 추상 유화 통합 시안. 기존 V01/V02 뒤에 추가한 비교용 버전이며 꽃 96장·환경 24장과 기존 기본 배치는 변경하지 않습니다.
- V03은 층층이 겹친 산, 구름 바다, 분홍빛 능선과 넓고 표현적인 임파스토 붓질을 기준으로 봅니다. 밝은 대기·하늘과 하단의 짙은 현무암 흙, 선명한 주인공 꽃·부드러운 원경·흐린 전경의 초점 구분을 함께 확인합니다.
- F01..F06은 최근 통합 시안에서 가져온 여섯 디자인 방향이며 각각 C01..C04의 가까운 색상을 가집니다. 원래의 식물학적 6종을 뜻하지 않습니다.
- E01 풀 / E02 나무 / E03 나비 / E04 구름 / E05 현무암 / E06 잎 가지.
- 같은 BG 번호의 통합본, 배경, 꽃, 환경 요소, 배치 파일만 함께 비교합니다.
- manifest.json의 generationRecords에서 공개 제작 기록을 열 수 있습니다. 각 꽃 레코드의 generationPrompt는 해당 ID의 최종 기록을 따르며, 수정된 아침 F05/F06 C01은 extra-master-prompts.json이 이전 생성 기록을 대체합니다. 공개 기록의 원본 참조는 공개 원본 URL 또는 PNG 파일명으로 정리되어 로컬 PC 경로를 포함하지 않습니다.
- 무손실 원본은 저장소 source-assets/set-review-v01/의 PNG입니다. src는 이 원본의 raw GitHub 주소이며 SHA-256은 원본 기준입니다. 페이지 표시용 preview는 별도 WebP(요소 320px 정사각, 통합/배경 너비 1200px)이고 원본을 대신하지 않습니다. PNG 원본의 크기·색·알파·바이트는 바꾸지 않았습니다.

## 원본 PNG 검증

1. manifest.json의 id·src·SHA-256·해상도를 확인합니다. 세트당 꽃은 6×4=24장이고 전체 96장입니다.
2. 독립 요소는 단일 개체 전체가 있는 실제 알파 PNG여야 합니다. 장면 캡처를 네모나게 자른 이미지를 쓰지 않습니다.
3. 기술 검수는 알파 8 이상을 의미 있는 픽셀로 판단하고 사방 8px 이상 비어 있는지 확인합니다. 낮은 알파 잡음 수는 별도로 남깁니다.
4. technical_pass/complete는 파일·알파·가장자리 기술 조건입니다. 줄기 연결, 자연스러운 형태, 아름다움이나 통합본 유사도를 자동 승인한 것이 아닙니다.
5. 꽃머리·잎 끝·줄기 하단·나비 날개·나무 수관이 모두 완전한지 원본을 확대해 검사합니다. 꽃과 줄기가 끊어져 있으면 보류합니다.

## 통합 시안과 비교

1. 선택한 통합본(I02-V02 또는 I03-V03) 옆에 *_editor.json의 웹 합성을 열어 전체 구도부터 비교합니다. V03 비교 시 배경 선택에서 B03-V03을 명시적으로 선택합니다. 기본 배치 파일은 기존 B02-V02를 그대로 유지합니다.
2. F 번호별 꽃 형태, 꽃잎 수와 방향, 줄기 굵기와 길이, 잎의 모양을 기록합니다.
3. 같은 디자인의 C01..C04가 정말 비슷한 계열의 색 변화인지 검사합니다. 잎·줄기 초록을 꽃잎과 함께 변색시키지 않습니다.
4. 배경의 밝은 산·하늘과 하단의 짙은 현무암 흙이 유지되는지 확인합니다. 광원 방향과 따뜻함/차가움이 꽃·나무·풀에 이어져야 합니다.
5. 가까운 전경 환경은 더 흐리고, 주인공 꽃은 선명하고, 먼 풍경은 부드러워야 합니다. 전경 잎·돌이 주요 꽃머리를 가리면 수정합니다.
6. 꽃 줄기와 지면의 접점, 환경 요소 사이의 빈틈, 레이어 앞뒤, 반복 무늬, 크기 차이를 검사합니다.
7. 요소별 수동 판정은 {id, referenceId, shape, color, lighting, contact, focus, completePlant, verdict, reason}으로 남깁니다. verdict는 pass/revise/hold 중 하나입니다.
8. 단순 픽셀 유사도·경계 선명도·자동 통과 수치만으로 통합본과 흡사하다고 판정하지 않습니다. 실제 비교 이미지를 보고 근거를 기록합니다.

## 배치 파일과 Unity 확인

- 기본 비교 배치는 14165×3480의 실제 벽면 좌표입니다. 통합 원화는 약 3:1이므로 실제 벽면 약 4.07:1과 비율이 다릅니다. 배경 fill 및 꽃의 위치를 함께 확인합니다.
- 사용자 저장 JSON은 웹 페이지 안에서만 읽고 원래 에디터 저장소를 바꾸지 않습니다.
- *_unity.json은 Unity 좌표 참고 JSON입니다. PNG/ 경로는 JSON 옆에 함께 내려받은 PNG 폴더를 기준으로 합니다. 이 파일 하나만으로 완성된 Unity 패키지나 실행 결과가 되지 않습니다.
- 원본 보관 폴더 source-assets/set-review-v01/의 PNG들을 내려받아 JSON 옆 PNG/ 폴더에 모은 뒤 경로를 확인합니다. WebP 미리보기를 Unity 원본으로 사용하지 않습니다.
- 개별 blur 값은 웹 비교에서 적용되며 원본 PNG에 구워지지 않았습니다. 현재 Unity 임포터는 blur 메타데이터를 무시합니다. 같은 초점과 블러 설정을 Unity에서 구현한 뒤 실제 캡처를 업로드해 비교해야 합니다.
- 모든 통합 이미지는 정지 시안입니다. 새 개화 영상·Unity 실행·전시장 출력 검수는 별도입니다.
'''


def build(check=False):
    if not check:
        prepare_sources()
    metadata = generation_metadata()
    prior=read_json(OUT/'manifest.json') if (OUT/'manifest.json').is_file() else None
    preserved_sources={a['id']:a['sha256'] for s in prior['backgrounds'] for group in ['flowers','environment','backgrounds','integrated'] for a in s[group] if a['version'] in ['V01','V02']} if prior else {}
    layout_paths=[OUT/f'{theme}_{kind}.json' for theme,*_ in THEMES for kind in ['editor','unity']]
    preserved_layouts={path.name:digest(path) for path in layout_paths if path.is_file()}
    expected = []
    for theme, code, *_ in THEMES:
        expected += [f'{code}-F{f:02}-C{c:02}-V01' for f in range(1, 7) for c in range(1, 5)]
        expected += [f'{code}-{eid}-V01' for eid, *_ in ENV]
        expected += [f'{code}-{kind}-{version}' for kind,version,*_ in art_variants(theme)]
    missing = [aid for aid in expected if not (PNG / f'{aid}.png').is_file()]
    if missing:
        raise ValueError(f'생성이 완료되지 않은 PNG {len(missing)}장:\n' + '\n'.join(missing))
    inspected = {aid: inspect_png(PNG / f'{aid}.png', '-F' in aid or '-E' in aid) for aid in expected}
    for aid,sha in preserved_sources.items():
        if inspected[aid]['sha256']!=sha:
            raise ValueError(f'기존 V01/V02 원본의 바이트가 달라졌습니다: {aid}')
    held = [aid for aid, info in inspected.items() if not info['verification']['complete']]
    if held:
        raise ValueError('독립 PNG 기술 검수 보류(알파/가장자리 확인 필요):\n' + '\n'.join(held))
    cached={a['id']:a for a in read_json(OUT/'asset-audit.json')['files']} if (OUT/'asset-audit.json').is_file() else {}
    for aid,info in inspected.items():
        info.update(preview_record(aid,'-F' in aid or '-E' in aid,write=not check,cached=cached.get(aid),source_sha=info['sha256']))
    scenes = []
    for theme, code, label, _, designs, colors in THEMES:
        flowers = []
        for f in range(1, 7):
            for c in range(1, 5):
                aid = f'{code}-F{f:02}-C{c:02}-V01'
                meta = metadata.get(aid, {})
                record=asset_record(aid, inspected[aid], theme=theme, category='flower', design=f'F{f:02}', designLabel=meta.get('designLabel', designs[f-1]), color=f'C{c:02}', colorLabel=meta.get('colorLabel', colors[c-1]), name=meta.get('name', f'{label} · {designs[f-1]} · {colors[c-1]}'), origin='generated_independent_png')
                if meta.get('generationPrompt'):
                    record['generationPrompt']=meta['generationPrompt']
                flowers.append(record)
        env = [asset_record(f'{code}-{eid}-V01', inspected[f'{code}-{eid}-V01'], category=category, name=f'{label} · {name}', theme=theme, origin='generated_independent_png' if eid == 'E02' else 'previous_complete_independent_png') for eid, category, name, _ in ENV]
        scene = {'id': theme, 'code': code, 'label': label, 'palette': colors, 'flowers': flowers, 'environment': env, 'integrated': [], 'backgrounds': [], 'project': f'assets/set-review-v01/{theme}_editor.json', 'unityLayout': f'assets/set-review-v01/{theme}_unity.json', 'unityLayoutLabel':'Unity 좌표 참고 JSON', 'unityLayoutNote':'PNG/ 경로는 이 JSON과 함께 내려받은 PNG 폴더 기준입니다. 현재 Unity 임포터는 blur 메타데이터를 적용하지 않으며 실제 Unity 실행은 미검증입니다.'}
        for kind, version, name, group in art_variants(theme):
            aid = f'{code}-{kind}-{version}'
            record=asset_record(aid, inspected[aid], name=name)
            if version=='V03' and metadata.get(aid,{}).get('generationPrompt'):
                record['generationPrompt']=metadata[aid]['generationPrompt']
            scene[group].append(record)
        scenes.append(scene)
    manifest = {'format':'jeju-set-review-v1','version':'V01','date':'2026-10-27','flowerDefinition':'최근 통합 시안의 꽃 디자인 6종 × 가까운 계열 4색','backgrounds':scenes,'guide':'assets/set-review-v01/AI_검증가이드.md','audit':'assets/set-review-v01/asset-audit.json','verification':{'technicalOnly':True,'visualMatch':'pending_manual_review','unityRuntime':'not_run'},'counts':{'backgroundSets':len(scenes),'flowerPngs':sum(len(s['flowers']) for s in scenes),'environmentPngs':sum(len(s['environment']) for s in scenes),'backgroundPngs':sum(len(s['backgrounds']) for s in scenes),'integratedPngs':sum(len(s['integrated']) for s in scenes),'totalPngs':len(inspected)}}
    manifest['generationRecords']=generation_records(write=not check)
    audit = {'format':'jeju-set-review-audit-v1','date':'2026-10-27','technicalOnly':True,'technicalPassed':len(inspected),'visualMatch':'pending_manual_review','alphaThreshold':8,'files':[{ 'id':aid,'src':RAW+aid+'.png',**info} for aid,info in inspected.items()]}
    manifest['sourceProof']='assets/set-review-v01/source-count-hashes.json'
    if check:
        old = read_json(OUT/'manifest.json')
        for scene in old['backgrounds']:
            for a in scene['flowers']+scene['environment']+scene['backgrounds']+scene['integrated']:
                if a['sha256'] != inspected[a['id']]['sha256']:
                    raise ValueError(f'검수 후 원본이 바뀌었습니다: {a["id"]}')
                if a['src']!=RAW+a['id']+'.png' or a['previewSha256']!=inspected[a['id']]['previewSha256']:
                    raise ValueError(f'원본 경로 또는 미리보기 검증 실패: {a["id"]}')
        return manifest
    for scene in scenes:
        project = make_project(scene)
        preserve_layout(OUT/f'{scene["id"]}_editor.json',project)
        preserve_layout(OUT/f'{scene["id"]}_unity.json',make_unity(project))
    for name,sha in preserved_layouts.items():
        if digest(OUT/name)!=sha:
            raise ValueError(f'기존 배치 파일의 바이트가 달라졌습니다: {name}')
    write_json(OUT/'manifest.json',manifest)
    write_json(OUT/'asset-audit.json',audit)
    legacy=[aid for aid in expected if (LEGACY_PNG/f'{aid}.png').is_file()]
    for aid in legacy:
        if digest(LEGACY_PNG/f'{aid}.png')!=inspected[aid]['sha256']:
            raise ValueError(f'이전 원본과 바이트가 다릅니다: {aid}')
    write_json(OUT/'source-count-hashes.json',{'format':'jeju-source-byte-proof-v1','count':len(inspected),'sourceDirectory':'source-assets/set-review-v01','totalSourceBytes':sum(i['bytes'] for i in inspected.values()),'totalPreviewBytes':sum(i['previewBytes'] for i in inspected.values()),'legacyDocCopiesCompared':len(legacy),'legacyDocCopiesUnchanged':True,'preservation':{'allUnchanged':True,'sourceCount':len(preserved_sources),'layoutCount':len(preserved_layouts),'sourceFiles':[{'id':aid,'sha256':sha} for aid,sha in preserved_sources.items()],'layouts':[{'file':name,'sha256':sha} for name,sha in preserved_layouts.items()]},'files':[{'id':aid,'src':RAW+aid+'.png','bytes':info['bytes'],'sha256':info['sha256']} for aid,info in inspected.items()]})
    (OUT/'AI_검증가이드.md').write_text(GUIDE,encoding='utf-8')
    return manifest


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true',help='Read-only verification of completed sets')
    args=parser.parse_args()
    try:
        result=build(args.check)
        print(json.dumps({'status':'verified' if args.check else 'built',**result['counts']},ensure_ascii=False))
    except (ValueError,FileNotFoundError,OSError) as error:
        print(str(error),file=sys.stderr)
        raise SystemExit(1)
