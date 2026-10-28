"""Package existing petal artwork and its independently rendered Y-axis loops."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
import zipfile

REPO = Path(__file__).resolve().parents[1]
WEB = REPO / 'docs/assets/petal-y-loops-v102'
OUT = REPO.parent / '20261029_메이즈랜드_원본소스/꽃잎_Y축회전_루프_v102'
THEMES = {'sunset': '01_노을_BG01_LT01', 'day': '02_낮_BG02_LT02',
          'night': '03_달빛_BG03_LT03', 'morning': '04_아침_BG04_LT04'}
ZIP = 'Mazeland_Petal_Y_Loops_48_v102.zip'
BACK = 'The existing source image is used on both faces; the back is mirrored, not separately generated.'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def encoded(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def checked_loop(a):
    if not re.fullmatch(r'[\w-]+', a['id']):
        raise ValueError('Invalid source ID')
    folder = WEB / a['id']
    qa_file = folder / 'qa.json'
    if not qa_file.is_file():
        raise ValueError('Render not complete: ' + a['id'])
    qa = json.loads(qa_file.read_text(encoding='utf8'))
    source = REPO / 'source-assets/flower-petals-v90' / a['file']
    if source.parent != REPO / 'source-assets/flower-petals-v90' or not source.is_file():
        raise ValueError('Original petal missing: ' + a['id'])
    if sha(source) != a['sha256'] or qa.get('sourceId') != a['id'] or qa.get('inputHash') != a['sha256'] or qa.get('sourceOriginal') != source.relative_to(REPO).as_posix() or qa.get('sourceFlowerSHA256') != a['sourceSHA256']:
        raise ValueError('Source identity changed: ' + a['id'])
    for key in ['sourceUnchanged', 'periodClosureExact', 'encodedAlphaChecked']:
        if qa.get(key) is not True:
            raise ValueError('Incomplete loop check: ' + a['id'] + '/' + key)
    expected = {'fps': 30, 'seconds': 5, 'width': 480, 'height': 480, 'frames': 150,
                'rotationAxis': 'Y', 'rotationDegrees': 360, 'model': 'deterministic-two-sided-texture'}
    if any(qa.get(k) != v for k, v in expected.items()) or qa.get('actualLastFrameDuplicatesFirst') is not False:
        raise ValueError('Loop specification changed: ' + a['id'])
    if not re.fullmatch(r'#[\da-fA-F]{6}', qa.get('keyColor', '')):
        raise ValueError('Missing chroma key: ' + a['id'])
    frames = qa.get('perFrame', [])
    hashes = qa.get('fullCycleFrameHashes', [])
    if len(frames) != 150 or len(hashes) != 150 or hashes[0] == hashes[-1] or any(p.get('index') != i or p.get('borderPixels') != 0 for i, p in enumerate(frames)):
        raise ValueError('Frame checks failed: ' + a['id'])
    alpha = qa.get('qa', {}).get('encodedAlpha', {})
    if alpha.get('framesChecked') != 150 or alpha.get('opaqueInteriorFailures') != 0 or alpha.get('borderFailures') != 0 or alpha.get('alphaDecoder') != 'libvpx-vp9':
        raise ValueError('Decoded transparency not verified: ' + a['id'])
    for kind, name in [('alpha', 'alpha.webm'), ('key', 'key.mp4')]:
        video = qa.get('video', {}).get(kind, {})
        path = folder / name
        if video.get('file') != name or not path.is_file() or video.get('sha256') != sha(path):
            raise ValueError('Encoded video changed: ' + a['id'] + '/' + name)
        probe = video.get('probe', {})
        stream = probe.get('streams', [{}])[0]
        if (stream.get('width'), stream.get('height'), stream.get('r_frame_rate'), stream.get('nb_read_frames')) != (480, 480, '30/1', '150') or abs(float(probe.get('format', {}).get('duration', 0)) - 5) > .034:
            raise ValueError('Decoded dimensions/timing changed: ' + a['id'])
        if tuple(stream.get(k) for k in ['color_range', 'color_space', 'color_transfer', 'color_primaries']) != ('tv', 'bt709', 'bt709', 'bt709') or kind == 'alpha' and stream.get('tags', {}).get('alpha_mode') != '1':
            raise ValueError('Video color/alpha metadata changed: ' + a['id'])
    for name in ['poster.png', 'contact.png']:
        if not (folder / name).is_file():
            raise ValueError('Review image missing: ' + a['id'])
    row = {k: a[k] for k in ['id', 'name', 'theme', 'species', 'shape', 'backgroundId', 'lightingId', 'sourcePNG', 'sourceSHA256']}
    prefix = 'assets/petal-y-loops-v102/' + a['id'] + '/'
    row.update(sourcePetalPNG=source.relative_to(REPO).as_posix(), sourcePetalSHA256=a['sha256'],
               originalPNG=a['original'], alphaVideo=prefix + 'alpha.webm', keyVideo=prefix + 'key.mp4',
               poster=prefix + 'poster.png', contact=prefix + 'contact.png', qaFile=prefix + 'qa.json',
               keyColor=qa['keyColor'], sourceUnchanged=True, periodClosureExact=True, encodedAlphaChecked=True,
               actualLastFrameDuplicatesFirst=False, backSurface=BACK,
               hashes={name: sha(folder / name) for name in ['alpha.webm', 'key.mp4', 'poster.png', 'contact.png', 'qa.json']},
               review={'automated': 'passed', 'visual': qa.get('qa', {}).get('visualReview', 'pending')})
    return row


def build_manifest():
    source = REPO / 'docs/assets/flower-petals-v90/manifest.json'
    data = json.loads(source.read_text(encoding='utf8'))
    if data.get('format') != 'jeju-flower-petals-v90' or data.get('count') != 48 or len(data.get('items', [])) != 48 or len({a['id'] for a in data['items']}) != 48:
        raise ValueError('Expected the original 48-petal manifest')
    for theme in THEMES:
        if sum(a['theme'] == theme for a in data['items']) != 12:
            raise ValueError('Expected twelve petals per theme')
    rows = [checked_loop(a) for a in data['items']]
    return {'format': 'jeju-petal-y-loops-v102', 'version': 102, 'count': 48, 'width': 480, 'height': 480,
            'fps': 30, 'seconds': 5, 'frameCount': 150, 'rotationAxis': 'Y', 'rotationDegrees': 360,
            'model': 'deterministic-two-sided-texture', 'backSurface': BACK, 'paidGenerations': 0,
            'sourceManifestSHA256': hashlib.sha256(source.read_bytes().replace(b'\r\n', b'\n')).hexdigest(), 'items': rows}


def copy_checked(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.is_file() or sha(source) != sha(target):
        shutil.copy2(source, target)
    if sha(source) != sha(target):
        raise ValueError('Delivery copy differs: ' + str(target))


def package(manifest):
    WEB.mkdir(parents=True, exist_ok=True)
    (WEB / 'manifest.json').write_text(encoded(manifest), encoding='utf8')
    OUT.mkdir(parents=True, exist_ok=True)
    local = json.loads(json.dumps(manifest))
    local['packageZip'] = ZIP
    for a in local['items']:
        folder = THEMES[a['theme']] + '/' + a['id'] + '/'
        for key, name in [('alphaVideo', 'alpha.webm'), ('keyVideo', 'key.mp4'), ('poster', 'poster.png'), ('contact', 'contact.png'), ('qaFile', 'qa.json')]:
            source = REPO / 'docs' / a[key]
            a[key] = folder + name
            copy_checked(source, OUT / a[key])
        source = REPO / a['sourcePetalPNG']
        a['originalPNG'] = folder + source.name
        copy_checked(source, OUT / a['originalPNG'])
    html = (REPO / 'docs/petal-y-loops.html').read_text(encoding='utf8')
    marker = '<script id="petalYData" type="application/json"></script>'
    if html.count(marker) != 1:
        raise ValueError('Expected one embedded-data placeholder')
    embedded = encoded(local).replace('<', '\\u003c')
    html = html.replace(marker, '<script id="petalYData" type="application/json">' + embedded + '</script>')
    (OUT / '00_먼저열기.html').write_text(html, encoding='utf8')
    copy_checked(REPO / 'docs/petal-y-loops.js', OUT / 'petal-y-loops.js')
    (OUT / '꽃잎_Y축회전_목록.json').write_text(encoded(local), encoding='utf8')
    with (OUT / '꽃잎_대응표.csv').open('w', encoding='utf-8-sig', newline='') as f:
        keys = ['id', 'name', 'theme', 'backgroundId', 'lightingId', 'sourcePetalSHA256', 'alphaVideo', 'keyVideo', 'originalPNG', 'keyColor']
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows({k: a[k] for k in keys} for a in local['items'])
    (OUT / '사용안내.txt').write_text('꽃잎 Y축 회전 루프 v102\n\n00_먼저열기.html을 열면 시간대별 12종씩 비교할 수 있습니다.\n회전 재생을 누르면 선택한 꽃잎 하나만 재생됩니다. 인터넷 없이도 로컬 영상과 PNG를 볼 수 있습니다.\n\n규격: 480×480 / 30fps / 5초 / 150프레임 / 세로 Y축 360도\nalpha.webm: 투명 알파가 있는 영상(VP9)\nkey.mp4: 보색 단색 배경이 있는 영상(H.264); 투명 영상이 아닙니다.\n원본 PNG: 기존 꽃잎 원본을 변경 없이 복사했습니다.\ncontact.png: 회전 단계와 배경별 확인 이미지\nqa.json: 원본 해시와 전체 프레임·투명도·루프 경계 자동검사 기록\n\n같은 그림을 양면에 사용하므로 뒷면은 원본 그림이 거울처럼 보입니다. 별도 뒷면 그림을 생성한 결과가 아닙니다.\n기존 PNG의 위치·원근 변환으로 만든 결정론적 회전 영상이며 유료 AI 영상 생성은 사용하지 않았습니다.\n영상에 이동이나 페이드를 구워 넣지 않았으므로 반복 재생할 수 있습니다. 게임에서의 흩날림·이동·사라짐은 별도로 적용합니다.\nUnity·전시장 장비에서 실제 실행한 결과는 포함하지 않습니다.\n', encoding='utf8')
    files = [OUT / '00_먼저열기.html', OUT / 'petal-y-loops.js', OUT / '꽃잎_Y축회전_목록.json', OUT / '꽃잎_대응표.csv', OUT / '사용안내.txt']
    files += [OUT / a[key] for a in local['items'] for key in ['alphaVideo', 'keyVideo', 'poster', 'contact', 'qaFile', 'originalPNG']]
    for theme in THEMES:
        source = WEB / 'review' / (theme + '_overview.mp4')
        if source.is_file():
            target = OUT / '검수/시간대_모아보기' / source.name
            copy_checked(source, target)
            files.append(target)
    review_index = WEB / 'review/index.html'
    if review_index.is_file():
        target = OUT / '검수/시간대_모아보기/index.html'
        copy_checked(review_index, target)
        files.append(target)
    for report in sorted((OUT / '검수/독립검수').glob('*.json')):
        json.loads(report.read_text(encoding='utf8'))
        files.append(report)
    with zipfile.ZipFile(OUT / ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=4) as z:
        for f in files:
            z.write(f, f.relative_to(OUT).as_posix())
    with zipfile.ZipFile(OUT / ZIP) as z:
        if z.testzip() is not None or len(z.namelist()) != len(files):
            raise ValueError('Delivery ZIP check failed')
    return len(files)


def main():
    sys.stdout.reconfigure(encoding='utf8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify the rendered files and existing public manifest without writing')
    args = parser.parse_args()
    manifest = build_manifest()
    if args.check:
        path = WEB / 'manifest.json'
        if not path.is_file() or json.loads(path.read_text(encoding='utf8')) != manifest:
            raise ValueError('Public manifest is missing or stale')
        print('PASS: 48 source mappings, source hashes, decoded-loop checks, video hashes and public manifest')
    else:
        count = package(manifest)
        print(json.dumps({'loops': 48, 'deliveryFiles': count, 'zipBytes': (OUT / ZIP).stat().st_size, 'output': str(OUT)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
