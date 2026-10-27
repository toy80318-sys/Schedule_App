"""Build V05 from independent oil PNGs and the preserved V04 placement."""
from __future__ import annotations

import argparse
import copy
import hashlib
import math

import build_set_review as b

ARCHIVE = b.OUT / 'archive-v04'


def text_digest(path):
    return hashlib.sha256(path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()


def verify_capture(capture, info, project_path, sources):
    dependencies={name:text_digest(b.WEB/name) for name in ['set-review-renderer.js','garden-space.js','background-grade.js','flower-hue.js']}
    expected={'imageSha256':info['sha256'], 'projectSha256':text_digest(project_path), 'rendererSha256':dependencies['set-review-renderer.js'], 'rendererDependencies':dependencies, 'width':4096, 'height':round(4096*b.SIZE[1]/b.SIZE[0]), 'renderComplete':True, 'renderedObjects':356, 'sourcePngs':sources}
    if info['width']!=4096 or info['height']!=expected['height'] or any(capture.get(k)!=value for k,value in expected.items()):
        raise ValueError('PNG/layout/renderer capture proof mismatch: '+project_path.name)
    return expected


def anchor(obj, asset):
    box = asset['verification']['visibleBounds']
    u, v = (box[0] + box[2]) / 2 / asset['width'], box[3] / asset['height']
    x = (u - .5) * obj['w'] * (-1 if obj['flipX'] else 1)
    y = (v - .5) * obj['h']
    angle = math.radians(obj['r'])
    return (obj['x'] + obj['w'] / 2 + math.cos(angle) * x - math.sin(angle) * y,
            obj['y'] + obj['h'] / 2 + math.sin(angle) * x + math.cos(angle) * y)


def style_project(base, old_assets, new_assets, background):
    project = copy.deepcopy(base)
    mapping = {a['id'].replace('-V05', '-V01'): a for a in new_assets}
    old = {a['id']: a for a in old_assets}
    for obj in project['objects']:
        source = old[obj['assetId']]
        target = mapping[source['id']]
        before = anchor(obj, source)
        a, z = source['verification']['visibleBounds'], target['verification']['visibleBounds']
        scale_y = ((a[3]-a[1])/source['height']) / ((z[3]-z[1])/target['height'])
        height = obj['h']*scale_y
        width = height*target['width']/target['height']
        obj.update(w=width, h=height, baseW=obj['baseW']*width/obj['w'], baseH=obj['baseH']*scale_y, aspect=target['width']/target['height'])
        after = anchor(obj, target)
        obj.update(assetId=target['id'], name=target['name'], x=obj['x']+before[0]-after[0], y=obj['y']+before[1]-after[1])
    for asset in project['assets']:
        target = mapping[asset['id']]
        asset.update({key: target[key] for key in ['id', 'name', 'src', 'preview', 'width', 'height', 'sha256']})
        asset['imageStyleVersion'] = 76
    project.update(name=base['name'].split(' V04')[0]+' V05 · 추상 유화 · 동일 PNG 조립', setReviewVersion='V05', sourcePngVersion='V05', background=background, styleOnlyRevision=True)
    project['reviewNote'] = 'V04의 크기·개수·회전·초점과 줄기 접점을 유지한 추상 유화 PNG 조립입니다. 통합본은 이 배치와 같은 PNG로 렌더링합니다. 웹 합성은 실제 Unity 실행이 아닙니다.'
    return project


def build(check=False, draft=False):
    if not ARCHIVE.is_dir():
        raise FileNotFoundError('Restore the preserved V04 archive from the repository before building')
    baseline = b.read_json(ARCHIVE/'manifest.json')
    old_audit = b.read_json(ARCHIVE/'asset-audit.json')
    old_files = {a['id']: a for a in old_audit['files']}
    for aid, item in old_files.items():
        if b.digest(b.PNG/(aid+'.png')) != item['sha256']:
            raise ValueError('Preserved PNG changed: '+aid)
    layout_files = [b.OUT/f'{theme}_{kind}{suffix}.json' for theme,*_ in b.THEMES for kind in ['editor','unity'] for suffix in ['', '_v04']]
    layout_hashes = {a['file']:a['sha256'] for a in b.read_json(ARCHIVE/'layout-hashes.json')['files']}
    for p in layout_files:
        if b.digest(p)!=layout_hashes[p.name]:
            raise ValueError('Frozen V04 layout changed: '+p.name)
    metadata = b.generation_metadata()
    cached = {a['id']:a for a in b.read_json(b.OUT/'asset-audit.json')['files']}
    inspected, scenes = {}, []
    for scene in copy.deepcopy(baseline['backgrounds']):
        code, theme = scene['code'], scene['id']
        old_assets = scene['flowers'] + scene['environment']
        current = []
        for source in old_assets:
            aid = source['id'].replace('-V01', '-V05')
            info = b.inspect_png(b.PNG/(aid+'.png'), True)
            if not info['verification']['complete']:
                raise ValueError('Incomplete independent PNG: '+aid)
            info.update(b.preview_record(aid, True, write=not check, cached=cached.get(aid), source_sha=info['sha256']))
            inspected[aid] = info
            labels = {k:source[k] for k in ['name','theme','category','design','designLabel','color','colorLabel'] if k in source}
            record = b.asset_record(aid, info, **labels, origin='generated_independent_png', generationPrompt=metadata[aid]['generationPrompt'], generationReference=source['id'])
            current.append(record)
        scene['flowers'], scene['environment'] = current[:24], current[24:]
        for kind, name, group in [('B04','밝은 하늘 · 검은 현무암 흙 · 추상 유화','backgrounds'), ('I05','실제 분리 PNG 조립 통합본','integrated')]:
            aid = f'{code}-{kind}-V05'
            if draft and kind == 'I05' and not (b.PNG/(aid+'.png')).exists():
                continue
            info = b.inspect_png(b.PNG/(aid+'.png'), False)
            info.update(b.preview_record(aid, False, write=not check, cached=cached.get(aid), source_sha=info['sha256']))
            inspected[aid] = info
            record = b.asset_record(aid, info, name=name, generationPrompt=metadata.get(aid,{}).get('generationPrompt','Rendered from the exact independent PNGs and saved V05 layout; no separately invented flowers.'))
            if kind == 'I05':
                record['construction'] = 'same-png-layout-render'
                record['sourceProject'] = f'assets/set-review-v01/{theme}_editor_v05.json'
                record['renderWidth'] = 4096
            scene[group].append(record)
        base = b.read_json(b.OUT/f'{theme}_editor_v04.json')
        project = style_project(base, old_assets, current, scene['backgrounds'][-1]['src'])
        project_file, unity_file = b.OUT/f'{theme}_editor_v05.json', b.OUT/f'{theme}_unity_v05.json'
        if not check:
            b.preserve_layout(project_file, project)
            unity = b.make_unity(project)
            unity['sourceProject'] = project_file.name
            b.preserve_layout(unity_file, unity)
        elif b.read_json(project_file) != project:
            raise ValueError('V05 layout mismatch: '+theme)
        scene.update(project=f'assets/set-review-v01/{project_file.name}', unityLayout=f'assets/set-review-v01/{unity_file.name}', projectVersion='V05', projectLabel='V05 · 추상 유화 · V04 크기·개수 유지', previousProject=scene['project'], previousUnityLayout=scene['unityLayout'], previousProjectVersion='V04', previousProjectLabel='V04 · 이전 그림체 · 같은 배치')
        if scene['integrated'][-1].get('construction') == 'same-png-layout-render':
            captures=b.read_json(b.OUT/'generation-records/v05-assembly-captures.json')['exports']
            record=scene['integrated'][-1]
            capture=next(a for a in captures if a['id']==record['id'])
            sources={a['id']:a['sha256'] for a in current+[scene['backgrounds'][-1]]}
            verify_capture(capture, inspected[record['id']], project_file, sources)
            record['sourceProjectSha256'] = capture['projectSha256']
            scene['integrated'][-1]['sourceProjectTextEncoding'] = 'UTF-8 LF'
            record['captureProof']='assets/set-review-v01/generation-records/v05-assembly-captures.json'
        scenes.append(scene)
    all_files = {**old_files, **{aid:{'id':aid,'src':b.RAW+aid+'.png',**info} for aid,info in inspected.items()}}
    manifest = copy.deepcopy(baseline)
    manifest.update(assetVersion='V05', backgrounds=scenes, generationRecords=b.generation_records(write=not check))
    manifest['counts'].update(backgroundPngs=sum(len(s['backgrounds']) for s in scenes), integratedPngs=sum(len(s['integrated']) for s in scenes), totalPngs=len(all_files), activePngs=sum(len(s[g]) for s in scenes for g in ['flowers','environment','backgrounds','integrated']))
    if check:
        for aid, info in inspected.items():
            found = next((a for a in b.read_json(b.OUT/'asset-audit.json')['files'] if a['id']==aid), None)
            if found is None or found['sha256'] != info['sha256'] or found['previewSha256'] != info['previewSha256']:
                raise ValueError('V05 source/preview mismatch: '+aid)
        return manifest
    audit = {**old_audit, 'technicalPassed':len(all_files), 'files':list(all_files.values())}
    proof = {'format':'jeju-source-byte-proof-v1','count':len(all_files),'sourceDirectory':'source-assets/set-review-v01','totalSourceBytes':sum(a['bytes'] for a in all_files.values()),'totalPreviewBytes':sum(a['previewBytes'] for a in all_files.values()),'preservation':{'allUnchanged':True,'sourceCount':len(old_files),'layoutCount':len(layout_hashes),'sourceFiles':[{'id':aid,'sha256':a['sha256']} for aid,a in old_files.items()],'layouts':[{'file':name,'sha256':sha} for name,sha in layout_hashes.items()]},'files':[{'id':aid,'src':a['src'],'bytes':a['bytes'],'sha256':a['sha256']} for aid,a in all_files.items()]}
    for name, sha in layout_hashes.items():
        if b.digest(b.OUT/name) != sha:
            raise ValueError('Preserved layout changed: '+name)
    b.write_json(b.OUT/'manifest.json', manifest)
    b.write_json(b.OUT/'asset-audit.json', audit)
    b.write_json(b.OUT/'source-count-hashes.json', proof)
    (b.OUT/'AI_검증가이드.md').write_text('# V05 · 실제 PNG 조립 기준\n\nV05는 V04의 꽃 크기·개수와 포커스를 유지하고 그림체만 추상 유화로 바꿉니다. 하늘은 밝게, 하단 흙과 산의 현무암 부분은 어둡게 표현합니다. I05는 각각의 독립 PNG와 V05 배치 JSON을 4096px 폭으로 웹 렌더링한 실제 조립본입니다. 배치와 원본 PNG를 같게 유지한 상태에서 비교하며, 실제 Unity 실행·블러 구현과 성능은 별도 검증해야 합니다.\n\n'+b.GUIDE, encoding='utf-8')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--draft', action='store_true', help='Allow composite exports that have not been captured yet')
    args = parser.parse_args()
    result = build(args.check, args.draft)
    print(result['counts'])
