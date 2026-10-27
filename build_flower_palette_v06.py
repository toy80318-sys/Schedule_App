"""Select neighboring V05 flower colors without changing visible size or root position."""
from __future__ import annotations

import argparse
import copy
from collections import defaultdict

import build_set_review as b
from build_abstract_v05 import anchor, text_digest, verify_capture

ARCHIVE = b.OUT / 'archive-v05'
CAPTURE = b.OUT / 'generation-records/v06-assembly-captures.json'
PALETTES = {
    'sunset': {'name':'노을 피치 코랄','designs':dict(zip(['F01','F02','F03','F04','F05','F06'],[['C04','C01'],['C04','C03'],['C03','C01'],['C04','C03'],['C01','C03'],['C03','C01']]))},
    'day': {'name':'낮 버터 레몬','designs':dict(zip(['F01','F02','F03','F04','F05','F06'],[['C03','C01'],['C03','C02'],['C04','C02'],['C02','C03'],['C03','C04'],['C03','C04']]))},
    'night': {'name':'달빛 페리윙클 라일락','designs':{f'F{i:02}':['C01','C02'] for i in range(1,7)}},
    'morning': {'name':'아침 스카이블루 라벤더','designs':{**{f'F{i:02}':['C01','C03'] for i in range(1,6)},'F06':['C04','C03']}},
}


def visible_height(obj, asset):
    box = asset['verification']['visibleBounds']
    return obj['h'] * (box[3] - box[1]) / asset['height']


def palette_project(base, scene):
    project = copy.deepcopy(base)
    assets = {a['id']:a for a in scene['flowers'] + scene['environment']}
    flower_ids = {a['id'] for a in scene['flowers']}
    palette = {**copy.deepcopy(PALETTES[scene['id']]), 'primaryShare':.75}
    groups = defaultdict(lambda: defaultdict(list))
    for obj in project['objects']:
        if obj['assetId'] in flower_ids:
            groups[assets[obj['assetId']]['design']][obj['sourceObjectId']].append(obj)
    for design, roots in sorted(groups.items()):
        for group_index, (_, siblings) in enumerate(sorted(roots.items())):
            siblings.sort(key=lambda o:(o['copyIndex'],o['id']))
            if len(siblings) != 4 or {o['copyIndex'] for o in siblings} != {0,1,2,3}:
                raise ValueError('Expected four preserved V04 siblings for '+design)
            for index, obj in enumerate(siblings):
                color = palette['designs'][design][1 if (index+group_index)%4 == 3 else 0]
                source = assets[obj['assetId']]
                target = assets[f'{scene["code"]}-{design}-{color}-V05']
                if source['id'] != target['id']:
                    before = anchor(obj, source)
                    old_w, old_h = obj['w'], obj['h']
                    height = old_h * visible_height({'h':1},source) / visible_height({'h':1},target)
                    width = height * target['width'] / target['height']
                    obj.update(w=width,h=height,baseW=obj['baseW']*width/old_w,baseH=obj['baseH']*height/old_h,aspect=target['width']/target['height'])
                    after = anchor(obj, target)
                    obj.update(x=obj['x']+before[0]-after[0],y=obj['y']+before[1]-after[1],assetId=target['id'],name=target['name'])
    project.update(name=f'{scene["code"]} V06 · {palette["name"]} · 인접 2색',setReviewVersion='V06',sourcePngVersion='V05',colorHarmonyVersion='V06',flowerPalette=palette)
    project['reviewNote'] = 'V05 원본 PNG에서 디자인별 인접 2색을 75%/25%로 선택했습니다. 꽃 320개·환경 36개, 보이는 꽃 높이·회전·좌우 반전·알파 하단 뿌리 접점·초점을 유지합니다. 원본 픽셀과 색감 필터는 바꾸지 않았습니다. 웹 합성은 실제 Unity 실행이 아닙니다.'
    return project


def frozen_inputs():
    baseline = b.read_json(ARCHIVE/'manifest.json')
    audit = b.read_json(ARCHIVE/'asset-audit.json')
    layouts = b.read_json(ARCHIVE/'layout-hashes.json')['files']
    if baseline['assetVersion'] != 'V05' or len(audit['files']) != 276 or len(layouts) != 24:
        raise ValueError('Expected frozen V05:276 PNGs and24 layouts')
    for a in audit['files']:
        if b.digest(b.PNG/(a['id']+'.png')) != a['sha256']:
            raise ValueError('Frozen V05 PNG changed: '+a['id'])
    for item in layouts:
        if b.digest(b.OUT/item['file']) != item['sha256']:
            raise ValueError('Frozen V05 layout changed: '+item['file'])
    return baseline, audit, layouts


def build(check=False, draft=False):
    baseline, old_audit, layouts = frozen_inputs()
    old_files = {a['id']:a for a in old_audit['files']}
    cached = {a['id']:a for a in b.read_json(b.OUT/'asset-audit.json')['files']}
    captures = {a['id']:a for a in b.read_json(CAPTURE)['exports']} if CAPTURE.exists() else {}
    manifest, additions = copy.deepcopy(baseline), {}
    for scene in manifest['backgrounds']:
        theme, code = scene['id'], scene['code']
        base = b.read_json(b.OUT/f'{theme}_editor_v05.json')
        project = palette_project(base,scene)
        project_file, unity_file = b.OUT/f'{theme}_editor_v06.json', b.OUT/f'{theme}_unity_v06.json'
        unity = b.make_unity(project)
        unity.update(sourceProject=project_file.name,setReviewVersion='V06',sourcePngVersion='V05',flowerPalette=project['flowerPalette'])
        if check:
            if b.read_json(project_file) != project or b.read_json(unity_file) != unity:
                raise ValueError('V06 layout mismatch: '+theme)
        else:
            b.preserve_layout(project_file,project)
            b.preserve_layout(unity_file,unity)
        versions = [
            {'id':'current','path':f'assets/set-review-v01/{project_file.name}','unityLayout':f'assets/set-review-v01/{unity_file.name}','version':'V06','label':'V06 · '+project['flowerPalette']['name']+' · 인접 2색'},
            {'id':'v05','path':scene['project'],'unityLayout':scene['unityLayout'],'version':'V05','label':'V05 · 이전 4색 배치'},
            {'id':'v04','path':scene['previousProject'],'unityLayout':scene['previousUnityLayout'],'version':'V04','label':scene['previousProjectLabel']},
            {'id':'v01','path':scene['legacyProject'],'unityLayout':scene['legacyUnityLayout'],'version':'V01','label':scene['legacyProjectLabel']},
        ]
        scene.update(project=versions[0]['path'],unityLayout=versions[0]['unityLayout'],projectVersion='V06',sourcePngVersion='V05',projectLabel=versions[0]['label'],projectVersions=versions,flowerPalette=project['flowerPalette'])
        aid = f'{code}-I06-V06'
        record = {'id':aid,'version':'V06','name':project['flowerPalette']['name']+' · 실제 PNG 조립 통합본','sourceProject':scene['project'],'renderWidth':4096,'captureProof':'assets/set-review-v01/generation-records/v06-assembly-captures.json'}
        if not (b.PNG/(aid+'.png')).exists() or aid not in captures:
            if not draft:
                raise FileNotFoundError('V06 actual assembly PNG and capture proof required: '+aid)
            record.update(src=None,construction='pending-same-png-layout-render',status='pending_capture')
        else:
            info = b.inspect_png(b.PNG/(aid+'.png'),False)
            source_ids = {o['assetId'] for o in project['objects']}
            sources = {a['id']:a['sha256'] for a in scene['flowers']+scene['environment'] if a['id'] in source_ids}
            sources[scene['backgrounds'][-1]['id']] = scene['backgrounds'][-1]['sha256']
            if len(source_ids)!=18 or len(source_ids & {a['id'] for a in scene['flowers']})!=12 or len(sources)!=19:
                raise ValueError('Expected twelve selected flower sprites and six environment sprites')
            verify_capture(captures[aid],info,project_file,sources)
            capture = captures[aid]
            if capture.get('usedElementIds')!=sorted(source_ids) or capture.get('renderedSourceCount')!=18:
                raise ValueError('V06 used-element capture mismatch: '+aid)
            declared = {a['id']:a['sha256'] for a in scene['flowers']+scene['environment']+[scene['backgrounds'][-1]]}
            if 'declaredSourcePngs' in capture and capture['declaredSourcePngs']!=declared:
                raise ValueError('V06 declared-source capture mismatch: '+aid)
            info.update(b.preview_record(aid,False,write=not check,cached=cached.get(aid),source_sha=info['sha256']))
            record.update(b.asset_record(aid,info,name=record['name'],construction='same-png-layout-render',sourceProject=scene['project'],renderWidth=4096,captureProof=record['captureProof'],sourceProjectSha256=captures[aid]['projectSha256'],sourceProjectTextEncoding='UTF-8 LF',generationPrompt='Actual shared Canvas renderer export of the preserved V05 PNG assets and V06 neighboring-color layout. No generated or recolored flower pixels.'))
            additions[aid] = {'id':aid,'src':b.RAW+aid+'.png',**info}
        scene['integrated'].append(record)
    all_files = {**old_files,**additions}
    manifest.update(assetVersion='V05',colorHarmonyVersion='V06')
    if CAPTURE.exists():
        entry={'name':CAPTURE.name,'src':'assets/set-review-v01/generation-records/'+CAPTURE.name}
        if not any(a.get('src')==entry['src'] for a in manifest['generationRecords']):manifest['generationRecords'].append(entry)
    manifest['counts'].update(totalPngs=len(all_files),integratedPngs=sum(bool(a.get('src')) for s in manifest['backgrounds'] for a in s['integrated']),activePngs=sum(bool(a.get('src')) for s in manifest['backgrounds'] for key in ['flowers','environment','backgrounds','integrated'] for a in s[key]))
    audit = {**copy.deepcopy(old_audit),'technicalPassed':len(all_files),'files':list(all_files.values())}
    proof = {'format':'jeju-source-byte-proof-v1','count':len(all_files),'sourceDirectory':'source-assets/set-review-v01','totalSourceBytes':sum(a['bytes'] for a in all_files.values()),'totalPreviewBytes':sum(a['previewBytes'] for a in all_files.values()),'preservation':{'allUnchanged':True,'sourceCount':276,'layoutCount':24,'sourceFiles':[{'id':a['id'],'sha256':a['sha256']} for a in old_files.values()],'layouts':copy.deepcopy(layouts)},'files':[{'id':a['id'],'src':a['src'],'bytes':a['bytes'],'sha256':a['sha256']} for a in all_files.values()]}
    frozen_inputs()
    if check:
        for name,value in [('manifest.json',manifest),('asset-audit.json',audit),('source-count-hashes.json',proof)]:
            if b.read_json(b.OUT/name) != value:raise ValueError('V06 generated record mismatch: '+name)
    else:
        for name,value in [('manifest.json',manifest),('asset-audit.json',audit),('source-count-hashes.json',proof)]:b.write_json(b.OUT/name,value)
        (b.OUT/'AI_검증가이드.md').write_text('# V06 · 배경별 인접 2색 꽃 배치\n\nV05 원본 PNG를 디자인별 인접 2색으로 선택합니다. 각 디자인은 주색75%·보조색25%, 꽃320개·환경36개이며, 같은 뿌리에서 나온4개 중1개씩 보조색을 분산합니다. 원본 PNG·알파·필터는 변경하지 않고 가시 꽃 높이·회전·좌우 반전·알파 하단 뿌리 접점·초점을 보존합니다. 꽃잎 모양은 선택된 같은 디자인 원본을 따릅니다.\n\nI06는 이 배치와 같은 V05 PNG를 공유 Canvas 렌더러로4096×1006 내보낸 실제 조립본입니다. pending_capture는 아직 내보내기 전입니다. 캡처 근거의 PNG·프로젝트 UTF-8 LF·렌더 모듈·사용 원본 해시를 검증합니다. Unity JSON은 색상 원본을 그대로 참조하는 좌표 참고이며 blur 구현·실행·성능은 별도 검증 대상입니다.\n\nV01/V04/V05 배치와 V05까지276PNG는 고정 해시로 보존합니다. catalog는 V05의96꽃과24환경 원본을 계속 제공합니다.\n\n'+b.GUIDE,encoding='utf-8')
    return manifest


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--draft',action='store_true')
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    print(build(check=args.check,draft=args.draft)['counts'])
