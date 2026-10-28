"""Build trusted runtime metadata for the existing 48 transparent rotation videos."""
from pathlib import Path
import argparse, hashlib, json, math
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'docs/petal-y-runtime102-catalog.js'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bounds(image):
    return image.getchannel('A').point(lambda value: 255 if value >= 16 else 0).getbbox()


def catalog():
    sources = json.loads((ROOT / 'docs/assets/flower-petals-v90/manifest.json').read_text('utf8'))
    loops = json.loads((ROOT / 'docs/assets/petal-y-loops-v102/manifest.json').read_text('utf8'))
    assert sources['count'] == loops['count'] == len(sources['items']) == len(loops['items']) == 48
    assert (loops['width'], loops['height'], loops['fps'], loops['seconds'], loops['frameCount'], loops['rotationAxis']) == (480, 480, 30, 5, 150, 'Y')
    assert len({a['id'] for a in sources['items']}) == len({a['id'] for a in loops['items']}) == 48
    mapped = {a['id']: a for a in loops['items']}
    rows = []
    for source in sources['items']:
        loop = mapped[source['id']]
        assert all(loop[key] == source[key] for key in ['id', 'sourcePNG', 'sourceSHA256'])
        prefix = 'assets/petal-y-loops-v102/' + source['id'] + '/'
        assert loop['alphaVideo'] == prefix + 'alpha.webm' and loop['poster'] == prefix + 'poster.png'
        assert loop['sourceUnchanged'] and loop['periodClosureExact'] and loop['encodedAlphaChecked']
        original = ROOT / 'source-assets/flower-petals-v90' / source['file']
        assert original.parent == ROOT / 'source-assets/flower-petals-v90'
        assert sha(original) == source['sha256'] == loop['sourcePetalSHA256']
        video = ROOT / 'docs' / loop['alphaVideo']
        assert sha(video) == loop['hashes']['alpha.webm']
        original_image = Image.open(original)
        poster_path = ROOT / 'docs' / loop['poster']
        assert sha(poster_path) == loop['hashes']['poster.png']
        poster = Image.open(poster_path)
        assert original_image.mode == poster.mode == 'RGBA' and poster.size == (480, 480)
        old, new = bounds(original_image), bounds(poster)
        assert old and new
        ratios = [((old[i+2]-old[i]) / original_image.size[i]) / ((new[i+2]-new[i]) / 480) for i in range(2)]
        assert abs(ratios[0] / ratios[1] - 1) < .02
        scale = round(math.sqrt(ratios[0] * ratios[1]), 6)
        assert 1 <= scale <= 2.5
        rows.append({key: loop[key] for key in ['id', 'sourcePNG', 'sourceSHA256', 'sourcePetalSHA256', 'alphaVideo']} |
                    {'videoSHA256': loop['hashes']['alpha.webm'], 'drawScale': scale})
    return {'format': 'jeju-petal-y-runtime-v102', 'version': 102, 'count': 48, 'width': 480, 'height': 480,
            'fps': 30, 'seconds': 5, 'frameCount': 150, 'rotationAxis': 'Y', 'sampleSize': 128, 'items': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    content = 'window.jejuPetalYData=' + json.dumps(catalog(), ensure_ascii=False, separators=(',', ':')) + ';\n'
    if args.check:
        assert DEST.read_text('utf8') == content, 'Petal runtime catalog is stale'
    else:
        DEST.write_text(content, encoding='utf8', newline='\n')
    print('PASS: 48 original mappings, exact alpha videos and preserved visible petal sizes')


if __name__ == '__main__':
    main()
