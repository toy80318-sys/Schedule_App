"""Publish exact original videos as review candidates; never register failed loops."""
from pathlib import Path
import json,hashlib,shutil

repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
public=docs/'assets/abstract-butterflies-v97';public.mkdir(exist_ok=True)
plan=json.loads((base/'영상생성_실행4종_v97.json').read_text(encoding='utf-8'))
jobs=json.loads((base/'생성완료_v97.json').read_text(encoding='utf-8'))['jobs']
decisions=json.loads((base/'영상검수결정_v97.json').read_text(encoding='utf-8'))
old=json.loads((docs/'assets/abstract-butterflies-v96/manifest.json').read_text(encoding='utf-8'))
items=[]
for row in plan['requests']:
    i=row['index'];job=next((j for j in jobs if j['index']==i),None)
    source=next(a for a in old['items'] if a['index']==i)
    item=dict(index=i,id=row['id'],sourcePNG=row.get('sourcePNG',source['sourcePNG']),sourceSHA256=row['sourceSHA256'],model=row['params']['model'],generationStatus=job['status'] if job else 'not-submitted',productionStatus='pending',gameApplied=False)
    assert hashlib.sha256((docs/item['sourcePNG']).read_bytes()).hexdigest()==item['sourceSHA256']
    if job and job['status']=='completed':
        info=json.loads((base/'검수'/f'Butterfly{i:02}_원본검수_v97.json').read_text(encoding='utf-8'))
        assert info['jobId']==job['job_id'];file=Path(info['file']);assert hashlib.sha256(file.read_bytes()).hexdigest()==info['sha256']
        shutil.copy2(file,public/file.name)
        sheet=base/'검수'/f'Butterfly{i:02}_원본_16시점_v97.jpg';shutil.copy2(sheet,public/f'Butterfly{i:02}_review.jpg')
        decision=next((d for d in decisions if d['index']==i),None)
        if decision:assert decision['rawSHA256']==info['sha256']
        item.update(jobId=job['job_id'],rawVideo=(public/file.name).relative_to(docs).as_posix(),rawVideoSHA256=info['sha256'],fps=info['fps'],width=info['width'],height=info['height'],frameCount=info['frameCount'],duration=info['duration'],reviewSheet=(public/f'Butterfly{i:02}_review.jpg').relative_to(docs).as_posix(),review=decision or {'status':'pending'},productionStatus=decision['status'] if decision else 'pending')
    items.append(item)
data=dict(format='mazeland-butterfly-wingbeats-v97',version=97,date='2026-10-28',approvedInitialCount=4,maximumApprovedCredits=9.6,quotedMaximumCredits=sum(r['estimatedMaximumCredits'] for r in plan['requests']),submittedCount=len(jobs),paidRetries=0,gameReplacements=0,items=items)
side_inputs=json.loads((base/'측면이미지4종_v97.json').read_text(encoding='utf-8'))
data['sideInputs']=[{k:v for k,v in a.items() if k!='generatedOriginal'} for a in side_inputs]
assert data['quotedMaximumCredits']<=data['maximumApprovedCredits'] and len(jobs)<=4
candidate=base/'루프후보_v97';validation=base/'검수/Butterfly04_루프후보_검증_v97.json'
if validation.exists():
    v=json.loads(validation.read_text(encoding='utf-8'));assert v['rawSHA256']==next(a['rawVideoSHA256'] for a in items if a['index']==4)
    files=list(candidate.glob('*.mp4'))+list(candidate.glob('*.webm'))
    for file in files:shutil.copy2(file,public/file.name)
    sequence=public/'Butterfly04_Wingbeat_PNGAlpha480_CANDIDATE_v97.zip'
    import zipfile
    with zipfile.ZipFile(sequence,'w',zipfile.ZIP_DEFLATED) as z:
        frames=sorted((candidate/'Butterfly04_PNGAlpha480').glob('*.png'));assert len(frames)==72
        for i,file in enumerate(frames):
            assert hashlib.sha256(file.read_bytes()).hexdigest()==v['pngSHA256'][i];z.write(file,file.name)
        z.writestr('README.txt','CANDIDATE ONLY.72RGBA frames,480x480,24fps,3seconds. Native-rate24-frame real wingbeat repeated3times. Alpha edge cleanup and user approval pending. Not connected to game.\n')
        z.writestr('validation.json',json.dumps(v,ensure_ascii=False,indent=2))
    with zipfile.ZipFile(sequence) as z:assert z.testzip() is None
    data['motionPreview']=dict(index=4,keyVideo=(public/'ML_SHARED_Butterfly04_Wingbeat_Key_480_3s_v97.mp4').relative_to(docs).as_posix(),alphaVideo=(public/'ML_SHARED_Butterfly04_Wingbeat_Alpha_480_3s_v97.webm').relative_to(docs).as_posix(),fiveCycleVideo=(public/'ML_SHARED_Butterfly04_Wingbeat_5회확인_v97.mp4').relative_to(docs).as_posix(),sequenceZip=sequence.relative_to(docs).as_posix(),fps=24,frameCount=72,duration=3,sourceCycle=[26,50],seamMAE=v['seamMAE'],alphaReview='edge-cleanup-pending',status='motion-review-candidate',gameApplied=False)
(public/'production.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(base/'영상제작현황_v97.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Published exact original candidates with explicit quality state;0 game replacements.')
