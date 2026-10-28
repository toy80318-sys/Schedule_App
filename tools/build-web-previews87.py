"""Small display copies; original PNGs and editor projects are never rewritten."""
from pathlib import Path
import argparse
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
OUT = DOCS / 'assets/web-v87'
RAW = 'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/'


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def build(check=False):
    release = json.loads((DOCS / 'assets/current-release-v86/manifest.json').read_text('utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    rows, previews = [], {}

    def preview(asset, name, edge):
        src = asset['src']
        path = ROOT / src[len(RAW):] if src.startswith(RAW) else DOCS / src
        path = path.resolve()
        assert path.is_relative_to(ROOT) and path.is_file(), src
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        assert digest == asset['sha256'], f'Original differs: {src}'
        target = OUT / f'{name}.webp'
        with Image.open(path) as original:
            image = original.convert('RGBA' if 'A' in original.getbands() else 'RGB')
            image.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            # shortcut: v87 uses frozen v86 originals; new sources need a new version folder.
            if not check and not target.is_file():
                pending = target.with_suffix('.pending')
                image.save(pending, 'WEBP', quality=92, method=4, exact=True)
                pending.replace(target)
            with Image.open(target) as result:
                assert result.size == image.size, target
                if image.mode == 'RGBA' and image.getchannel('A').getextrema()[0] == 0:
                    assert 'A' in result.getbands() and result.getchannel('A').getextrema()[0] == 0, target
        relative = target.relative_to(DOCS).as_posix()
        rows.append({'source': src, 'sourceSHA256': digest, 'originalBytes': path.stat().st_size,
                     'preview': relative, 'bytes': target.stat().st_size,
                     'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
        return relative

    fields = ('id', 'name', 'file', 'src', 'width', 'height', 'theme', 'species', 'category', 'compatibleThemes', 'catalogHidden', 'useStatus')
    assets = []
    for asset in release['assets']:
        thumb = preview(asset, asset['id'], 384)
        previews[asset['src']] = thumb
        assets.append({**{k: asset[k] for k in fields if k in asset}, 'thumb': thumb})
    scenes = []
    for scene in release['scenes']:
        full = scene['integrated']
        hero = preview(full, scene['id'] + '-garden', max(full['width'], full['height']))
        previews[full['src']] = hero
        scenes.append({**{k: scene[k] for k in ('id', 'name', 'flowers')}, 'integrated': {**full, 'preview': hero}})
    loops = json.loads((DOCS / 'assets/atmosphere-v85/manifest.json').read_text('utf-8'))['assets']
    for asset in loops:
        preview({'src': asset['frames'][0], 'sha256': asset['loopHashes']['frames'][0]}, 'loop-' + asset['id'], 384)
    collection = {'version': release['version'], 'webVersion': 87, 'scenes': scenes, 'assets': assets}
    files = {OUT / 'collection.json': encoded(collection) + '\n',
             DOCS / 'web-collection.js': 'window.jejuCurrentRelease=' + encoded(collection) + ';\n',
             DOCS / 'web-previews.js': 'window.jejuWebPreviews=' + encoded(previews) + ';\n'}
    for path, text in files.items():
        if check:
            assert path.read_text('utf-8') == text, f'Rebuild required: {path}'
        else:
            path.write_text(text, encoding='utf-8', newline='\n')
    report = {'files': len(rows), 'originalBytes': sum(r['originalBytes'] for r in rows),
              'displayBytes': sum(r['bytes'] for r in rows), 'filesChecked': rows}
    if not check:
        (OUT / 'optimization.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    else:
        assert json.loads((OUT / 'optimization.json').read_text('utf-8')) == report
    print(encoded({k: v for k, v in report.items() if k != 'filesChecked'}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
