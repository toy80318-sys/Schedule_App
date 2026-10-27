"""Render rooted foliage and fixed-camera sky loops from the approved PNGs."""
from pathlib import Path
import argparse, hashlib, json, math, shutil, subprocess, zipfile
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
PUBLIC = DOCS / 'assets/separated-loops-v88'
SOURCE = ROOT.parent / '20261028_메이즈랜드_원본소스/분리루프_v88/PNG_패키지'
DELIVERY = ROOT.parent / '20261028_메이즈랜드_원본소스/분리루프_v88'
RAW = 'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/'
FPS, EDGE, FRAMES = 24, 480, 96


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def original(asset):
    assert asset['src'].startswith(RAW)
    path = (ROOT / asset['src'][len(RAW):]).resolve()
    assert path.is_relative_to(ROOT) and digest(path) == asset['sha256'], asset['id']
    return path


def encode(path, size, alpha=False):
    codec = ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-b:v', '0', '-crf', '24', '-deadline', 'good', '-cpu-used', '4'] if alpha else ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast', '-movflags', '+faststart']
    return subprocess.Popen(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba' if alpha else 'rgb24', '-s', f'{size[0]}x{size[1]}', '-r', str(FPS), '-i', 'pipe:0', '-an', *codec, '-threads', '2', str(path)], stdin=subprocess.PIPE, stderr=subprocess.PIPE)


def finish(process):
    process.stdin.close()
    error = process.stderr.read().decode('utf-8', 'replace')
    if process.wait():
        raise RuntimeError(error)


def foliage_frame(base, phase, amount):
    h, w = base.shape[:2]
    y, x = np.mgrid[:h, :w].astype(np.float32)
    occupied = np.where(base[:, :, 3] > 0)[0]
    anchor = min(h - 1, int(occupied.max()) - 5)
    weight = np.clip((anchor - y) / max(1, anchor), 0, 1) ** 2
    flow = amount * (math.sin(phase) * .8 + math.sin(phase * 2) * .2)
    dx = flow * weight * (.85 + .15 * np.sin(x / w * math.pi * 4))
    premult = base.astype(np.float32)
    premult[:, :, :3] *= premult[:, :, 3:4] / 255
    result = cv2.remap(premult, x - dx, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    np.divide(result[:, :, :3] * 255, result[:, :, 3:4], out=result[:, :, :3], where=result[:, :, 3:4] > 0)
    return np.clip(np.rint(result), 0, 255).astype(np.uint8), anchor


def inspect(base, frames, moving):
    alpha = base[:, :, 3]
    opaque = cv2.erode((alpha == 255).astype(np.uint8), np.ones((11, 11), np.uint8)).astype(bool)
    failures, border = [], []
    for i, frame in enumerate(frames):
        if np.any(frame[:, :, 3][opaque] < 254): failures.append(i)
        a = frame[:, :, 3]
        if np.any(a[:2]) or np.any(a[-2:]) or np.any(a[:, :2]) or np.any(a[:, -2:]): border.append(i)
    assert not failures and not border, (failures, border)
    diffs = [float(np.mean(np.abs(a.astype(float) - b))) for a, b in zip(frames, frames[1:])]
    seam = float(np.mean(np.abs(frames[-1].astype(float) - frames[0])))
    if moving:
        assert max(diffs) > 0 and seam <= max(diffs) * 1.2 + .01
    return {'framesChecked': len(frames), 'opaqueInteriorFailures': failures, 'borderFailures': border,
            'seamMAE': seam, 'maximumAdjacentMAE': max(diffs), 'fixedRoot': True, 'motion': 'rooted-wind' if moving else 'fixed-object', 'visualReview': 'pending'}


def environment(asset):
    target = PUBLIC / asset['id']; target.mkdir(parents=True, exist_ok=True)
    source = SOURCE / asset['id']; source.mkdir(parents=True, exist_ok=True)
    png = DELIVERY / 'PNG_ALPHA' / asset['id']; png.mkdir(parents=True, exist_ok=True)
    key = np.array([240, 0, 255], dtype=np.float32)
    image = Image.open(original(asset)).convert('RGBA').resize((EDGE, EDGE), Image.Resampling.LANCZOS)
    base = np.array(image)
    # Lanczos leaves one-alpha ringing outside the visible silhouette; originals stay untouched.
    base[:, :, 3][base[:, :, 3] <= 1] = 0
    base[base[:, :, 3] == 0, :3] = 0
    moving = asset['category'] != 'basalt'
    frames = [foliage_frame(base, i / FRAMES * math.tau, {'grass': 3, 'leaf': 2, 'tree': 2.4}.get(asset['category'], 0))[0] if moving else base.copy() for i in range(FRAMES)]
    qa = inspect(base, frames, moving); qa['resamplingAlphaRingingThreshold'] = 1
    alpha = encode(target / 'alpha.webm', (EDGE, EDGE), True)
    chroma = encode(target / 'key.mp4', (EDGE, EDGE))
    try:
        for i, frame in enumerate(frames):
            im = Image.fromarray(frame)
            im.save(png / f'frame_{i:04}.png', compress_level=3)
            im.resize((128, 128), Image.Resampling.LANCZOS).save(target / f'frame_{i:04}.webp', quality=90, method=4)
            alpha.stdin.write(frame.tobytes())
            opacity = frame[:, :, 3:4].astype(np.float32) / 255
            rgb = np.rint(frame[:, :, :3] * opacity + key * (1 - opacity)).astype(np.uint8)
            chroma.stdin.write(rgb.tobytes())
    finally:
        finish(alpha); finish(chroma)
    with zipfile.ZipFile(source / 'PNG_ALPHA.zip', 'w', zipfile.ZIP_STORED) as archive:
        for path in sorted(png.glob('*.png')): archive.write(path, path.name)
        archive.writestr('README.txt', f'{asset["id"]}\nRGBA PNG,480x480,24fps,96frames,4seconds. Fixed root; source PNG is preserved.\n')
    # A light/dark checker contact sheet keeps the real alpha visible during review.
    sheet = Image.new('RGB', (128 * 8, 128 * 2))
    for row, color in enumerate(('#172c24', '#eee8df')):
        for col, i in enumerate(range(0, FRAMES, 12)):
            tile = Image.new('RGBA', (128, 128), color)
            tile.alpha_composite(Image.fromarray(frames[i]).resize((128, 128)))
            sheet.paste(tile.convert('RGB'), (col * 128, row * 128))
    sheet.save(DELIVERY / '검수' / f'{asset["id"]}.jpg', quality=92)
    relative = target.relative_to(DOCS).as_posix()
    return {'id': asset['id'], 'name': asset['name'], 'theme': asset['theme'], 'category': asset['category'],
            'sourcePNG': asset['src'], 'sourceSHA256': asset['sha256'], 'fps': FPS, 'duration': 4, 'width': EDGE, 'height': EDGE,
            'frames': [f'{relative}/frame_{i:04}.webp' for i in range(FRAMES)], 'loopVideo': f'{relative}/alpha.webm',
            'keyVideo': f'{relative}/key.mp4', 'keyColor': '#F000FF', 'sequenceZip': 'https://github.com/toy80318-sys/Schedule_App/releases/download/mazeland-separated-loops-v88/' + asset['id'] + '_PNG_ALPHA_v88.zip',
            'unityFrames': [f'PNG_ALPHA/{asset["id"]}/frame_{i:04}.png' for i in range(FRAMES)],
            'alphaWebM_SHA256': digest(target / 'alpha.webm'), 'keyMP4_SHA256': digest(target / 'key.mp4'),
            'sequenceSHA256': digest(source / 'PNG_ALPHA.zip'), 'qa': qa, 'derivation': 'Approved RGBA PNG with gentle rooted resampling; fixed basalt has no deformation.'}


def background(scene):
    a = scene['background']; target = PUBLIC / scene['id']; target.mkdir(parents=True, exist_ok=True)
    base = np.array(Image.open(original(a)).convert('RGB').resize((1440, 480), Image.Resampling.LANCZOS))
    y, x = np.mgrid[:480, :1440].astype(np.float32)
    mask = np.clip(1 - y / (480 * .24), 0, 1) ** 2 * np.sin(x / 1439 * math.pi) ** 2
    period = DELIVERY / '제작자료' / (scene['id'] + '_period10.mp4'); period.parent.mkdir(exist_ok=True)
    process = encode(period, (1440, 480))
    try:
        for i in range(FPS * 10):
            dx = 2.5 * math.sin(i / (FPS * 10) * math.tau) * mask
            frame = cv2.remap(base, x - dx, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
            assert np.array_equal(frame[116:], base[116:]), 'Mountains and ground must remain fixed'
            process.stdin.write(frame.tobytes())
    finally: finish(process)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-stream_loop', '5', '-i', str(period), '-t', '60', '-c', 'copy', '-movflags', '+faststart', str(target / 'background.mp4')], check=True)
    return {'id': scene['id'], 'name': scene['name'], 'sourcePNG': a['src'], 'sourceSHA256': a['sha256'],
            'video': (target / 'background.mp4').relative_to(DOCS).as_posix(), 'width': 1440, 'height': 480, 'fps': FPS, 'duration': 60,
            'sha256': digest(target / 'background.mp4'), 'derivation': 'Ten-second cyclic sky-only flow repeated six times; camera, mountains and ground stay fixed.', 'visualReview': 'pending'}


def build():
    existing = PUBLIC / 'manifest.json'
    if existing.is_file() and any(a.get('qa', {}).get('visualReview') == 'passed' for a in json.loads(existing.read_text('utf-8')).get('environment', [])):
        raise RuntimeError('Reviewed v88 sources are frozen. Use a new version folder for new media.')
    for path in (PUBLIC, SOURCE, DELIVERY / '검수'): path.mkdir(parents=True, exist_ok=True)
    release = json.loads((DOCS / 'assets/current-release-v86/manifest.json').read_text('utf-8'))
    assets = []
    for a in release['assets']:
        if a['category'] not in ('grass', 'leaf', 'tree', 'basalt'): continue
        row = environment(a); assets.append(row)
        (DELIVERY / '검수' / '환경제작진행.json').write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding='utf-8')
        print('ENV ' + a['id'], flush=True)
    backgrounds = []
    for s in release['scenes']:
        backgrounds.append(background(s)); print('BG ' + s['id'], flush=True)
    result = {'format': 'mazeland-separated-loops-v88', 'version': 88, 'environment': assets, 'backgrounds': backgrounds,
              'flowerPolicy': 'Original flower PNGs remain unchanged. Opening video requires exact generated bud/bloom inputs; no reverse or morph substitute.'}
    (PUBLIC / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    for row in assets:
        for key, ext in [('loopVideo', 'webm'), ('keyVideo', 'mp4')]:
            out = DELIVERY / '영상' / f'{row["id"]}_v88.{ext}'; out.parent.mkdir(exist_ok=True)
            shutil.copyfile(DOCS / row[key], out)
    for row in backgrounds: shutil.copyfile(DOCS / row['video'], DELIVERY / '영상' / f'{row["id"]}_배경60초_v88.mp4')
    print('BUILT16 environment loops +4 background videos; visual review is still required.', flush=True)


def register():
    manifest = json.loads((PUBLIC / 'manifest.json').read_text('utf-8'))
    assert len(manifest['environment']) == 16 and len(manifest['backgrounds']) == 4
    assert all(a['qa']['visualReview'] == 'passed' for a in manifest['environment'])
    assert all(a['visualReview'] == 'passed' for a in manifest['backgrounds'])
    for a in manifest['environment']:
        assert digest(DOCS / a['loopVideo']) == a['alphaWebM_SHA256']
        assert digest(DOCS / a['keyVideo']) == a['keyMP4_SHA256']
    encoded = json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))
    (DOCS / 'separated-motion-catalog.js').write_text('window.jejuSeparatedLoops=' + encoded + ';\nif(window.jejuFinalCatalog&&window.jejuSeparatedMotion)window.jejuFinalCatalog.assets=window.jejuFinalCatalog.assets.map(a=>window.jejuSeparatedMotion.asset(a,window.jejuSeparatedLoops));\n', encoding='utf-8', newline='\n')
    shutil.copyfile(PUBLIC / 'manifest.json', DELIVERY / '분리루프_목록_v88.json')
    print('Registered only reviewed loops; original PNGs and saved layouts remain unchanged.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--register', action='store_true')
    if parser.parse_args().register: register()
    else: build()
