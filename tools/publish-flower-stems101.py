"""Publish complete, reviewed long-stem image pairs without changing live layouts."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

from PIL import Image

KEYS = {'sunset': '00FFFF', 'day': '0000FF', 'night': '80FF00', 'morning': 'FF8000'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    plan_path = args.source_root / '제작기록/제작대상48종_줄기3배_v101.json'
    plan = json.loads(plan_path.read_text(encoding='utf-8-sig'))
    assert plan['count'] == len(plan['items']) == 48
    assert len({item['id'] for item in plan['items']}) == 48
    assert all(sum(x['theme'] == theme for x in plan['items']) == 12
               for theme in ('sunset', 'day', 'night', 'morning'))
    pose_checks = json.loads((args.source_root / '제작기록/정렬_실루엣6px_검증_v101.json').read_text(encoding='utf-8'))
    assert len(pose_checks) == 48 and all(check['ok'] for check in pose_checks)
    assert all(sha(Path(check[state])) == check[state + 'SHA256']
               for check in pose_checks for state in ('bloom', 'bud')), 'Stale pair review'
    sources = []
    for item in plan['items']:
        for state in ('Bud', 'Bloom'):
            name = Path(item['sourceBloom']).name.replace('_Bloom_v89.png', f'_Stem3x_{state}_v101.png')
            path = args.source_root / '이미지' / name
            assert path.is_file(), f'Missing input: {path}'
            with Image.open(path) as im:
                assert im.mode == 'RGBA' and im.size == (1024, 1536), path
                alpha = im.getchannel('A')
                assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 245, path
                bounds = alpha.point(lambda value: 255 if value >= 16 else 0).getbbox()
                assert bounds and bounds[0] > 0 and bounds[1] > 0, path
                assert bounds[2] < im.width and bounds[3] < im.height, path
            sources.append((item, state.lower(), path, bounds))
    assert len(sources) == 96
    original_dir = repo / 'source-assets/flower-stems-v101'
    preview_dir = repo / 'docs/assets/flower-stems-v101'
    key_dir = args.source_root / '단색키입력'
    original_dir.mkdir(parents=True, exist_ok=True)
    preview_dir.mkdir(parents=True, exist_ok=True)
    key_dir.mkdir(parents=True, exist_ok=True)
    base = 'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/flower-stems-v101/'
    by_id = {}
    for item, state, path, bounds in sources:
        target = original_dir / path.name
        shutil.copyfile(path, target)
        assert sha(target) == sha(path)
        preview = preview_dir / f'{item["id"]}_{state}.webp'
        with Image.open(path) as im:
            im.thumbnail((384, 576), Image.Resampling.LANCZOS)
            im.save(preview, 'WEBP', lossless=True, method=6)
        entry = by_id.setdefault(item['id'], {
            key: item[key] for key in ('id', 'name', 'theme', 'species', 'shape', 'backgroundId', 'lightingId')
        })
        entry.update(stemLengthMultiplier=3, flowerHeadScaleTarget=1, roots=False,
                     width=1024, height=1536, status='images-ready', videoReady=False,
                     sourceBloomSHA256=item['sourceBloomSHA256'])
        entry.setdefault('images', {})[state] = {
            'original': base + path.name,
            'preview': 'assets/flower-stems-v101/' + preview.name,
            'file': path.name, 'sha256': sha(path), 'alphaBounds': list(bounds),
        }
        key = KEYS[item['theme']]
        key_path = key_dir / path.name.replace('_v101.png', f'_Key{key}_v101.png')
        # Technical key export adds a margin; the generated plant pixels stay at their original scale.
        with Image.open(path) as im:
            backdrop = Image.new('RGBA', (1152, 1536), '#' + key)
            backdrop.alpha_composite(im, (64, 0))
            backdrop.convert('RGB').save(key_path)
        entry.setdefault('inputs', []).append({
            'role': 'start_image' if state == 'bud' else 'end_image',
            'file': str(key_path), 'sha256': sha(key_path),
            'alphaSHA256': sha(path), 'generatedImage': True,
        })
        entry['keyColor'] = '#' + key
    items = list(by_id.values())
    assert all(item['images']['bud']['sha256'] != item['images']['bloom']['sha256'] for item in items)
    registered = json.loads((args.source_root / '제작기록/대표6종_실제입력_영상요청_v101.json').read_text(encoding='utf-8'))['inputs']
    for registration in (args.source_root / '제작기록').glob('입력등록_*_v101.json'):
        registered.extend(json.loads(registration.read_text(encoding='utf-8'))['inputs'])
    for report_path in (args.source_root / '제작기록').glob('*_Open2s_Alpha_v101.json'):
        report = json.loads(report_path.read_text(encoding='utf-8'))
        if report['alphaVisualApproved'] is not True or report.get('matteRevision') != '101-r3':
            continue
        entry = by_id[report['id']]
        assert (report['duration'], report['fps'], report['frames']) == (2, 24, 48)
        assert report['sourceSHA256'] == sha(Path(report['source']))
        assert report['keyBackgroundRecompositedFromRGBA'] is True
        assert report['keyVideoSHA256'] == sha(Path(report['keyVideo']))
        assert report['leadingHoldTrimmed'] is True
        actual_inputs = [source for source in registered if source['id'] == entry['id']]
        assert len(actual_inputs) == 2 and {source['role'] for source in actual_inputs} == {'start_image', 'end_image'}
        assert all(source['sourceSHA256'] == entry['images']['bud' if source['role']=='start_image' else 'bloom']['sha256'] for source in actual_inputs)
        for index, digest in enumerate(report['pngSHA256']):
            assert sha(Path(report['PNGPattern'] % index)) == digest
        assert len(report['pngSHA256']) == 48
        folder = preview_dir / entry['id']
        assert all((folder / f'frame_{index:04d}.webp').is_file() for index in range(48))
        assert (folder / 'atlas.webp').is_file()
        shutil.copyfile(report['keyVideo'], folder / 'open2s-key.mp4')
        entry.update(videoReady=True, status='ready')
        entry['opening'] = {key: report[key] for key in ('duration', 'fps', 'frames', 'width', 'height', 'previewWidth', 'previewHeight', 'atlasColumns', 'atlasRows', 'jobId', 'sourceSHA256', 'keyVideoSHA256', 'fullyOpenBySeconds', 'route')}
        entry['opening'].update(immediateStart=True, firstOpeningAtSeconds=1/24)
        atlas_sha = sha(folder / 'atlas.webp')
        entry['opening'].update(status='passed', matteRevision=report['matteRevision'], atlasSHA256=atlas_sha, atlas=f'assets/flower-stems-v101/{entry["id"]}/atlas.webp?v={atlas_sha[:12]}', framePattern=f'assets/flower-stems-v101/{entry["id"]}/frame_%04d.webp?v=101r3', keyVideo=f'assets/flower-stems-v101/{entry["id"]}/open2s-key.mp4', actualInputs=actual_inputs)
    result = {'format': 'jeju-flower-stems-v101', 'version': 101, 'count': 48,
              'imageCount': 96, 'resolution': [1024, 1536],
              'route': 'GENERATED_BUD_AND_BLOOM_IMAGES_BEFORE_VIDEO',
              'requestedGameDuration': 2, 'automaticPaidRetry': False,
              'videoCount': sum(item['videoReady'] for item in items),
              'videoInputResolution': [1152, 1536], 'keyPadding': [64, 0, 64, 0],
              'upscaleApproved': False, 'items': items}
    text = json.dumps(result, ensure_ascii=False, indent=2)
    (args.source_root / '제작기록/배포목록_줄기3배_v101.json').write_text(text, encoding='utf-8')
    for item in items:
        for source in item['inputs']:
            source['file'] = Path(source['file']).name
    (preview_dir / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'pairs': len(items), 'images': len(sources), 'videoReady': sum(item['videoReady'] for item in items)}))


if __name__ == '__main__':
    main()
