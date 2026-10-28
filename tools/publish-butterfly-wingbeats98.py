"""Publish reviewed native wingbeats and their exact matching painted sources."""
from pathlib import Path
import json,hashlib,shutil,zipfile
from PIL import Image

repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
base=repo.parent/'20261028_메이즈랜드_원본소스/나비_추상유화3배_480_3초_v96'
public=docs/'assets/butterfly-wingbeats-v98';public.mkdir(exist_ok=True)
side=json.loads((base/'측면이미지4종_v97.json').read_text(encoding='utf-8'))
old=json.loads((docs/'assets/element-loops-v95/manifest.json').read_text(encoding='utf-8'))['items']
items=[]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for s in side:
    n=s['index'];original=next(a for a in old if a['id']==s['id'])
    qa=json.loads((base/f'검수/Butterfly{n:02}_루프후보_검증_v98.json').read_text(encoding='utf-8'))
    assert qa['visualReview']=='passed' and qa['matteRevision']==3
    qa.pop('gameApplied',None)
    raw_version=98 if n<4 else 97
    raw=json.loads((base/f'검수/Butterfly{n:02}_원본검수_v{raw_version}.json').read_text(encoding='utf-8'))
    assert qa['sourceSHA256']==s['sourceSHA256'] and qa['rawSHA256']==raw['sha256']
    source=docs/s['sourcePNG'];assert sha(source)==s['sourceSHA256']
    folder=public/s['id'];folder.mkdir(exist_ok=True);rel=folder.relative_to(docs).as_posix()+'/'
    Image.open(source).resize((256,256),Image.Resampling.LANCZOS).save(folder/'preview.webp',lossless=True)
    native=base/'루프후보_v98';frames=sorted((native/f'Butterfly{n:02}_PNGAlpha480').glob('*.png'));assert len(frames)==72
    for j,file in enumerate(frames):
        assert sha(file)==qa['pngSHA256'][j]
        im=Image.open(file);assert im.mode=='RGBA' and im.size==(480,480)
        im.resize((128,128),Image.Resampling.LANCZOS).save(folder/f'frame_{j:04}.webp',lossless=True)
    for source_name,target in [('Key_480_3s','key.mp4'),('Alpha_480_3s','alpha.webm'),('5회확인','five-cycles.mp4')]:
        extension='webm' if target.endswith('webm') else 'mp4'
        shutil.copy2(native/f'ML_SHARED_Butterfly{n:02}_Wingbeat_{source_name}_v98.{extension}',folder/target)
    raw_file=Path(raw['file']);assert sha(raw_file)==qa['rawSHA256'];shutil.copy2(raw_file,folder/'raw.mp4')
    shutil.copy2(base/f'검수/Butterfly{n:02}_원본_16시점_v{raw_version}.jpg',folder/'review.jpg')
    item=dict(id=s['id'],index=n,name=f'추상 유화 나비 {n:02} · 실제 날갯짓 3초',category='butterfly',sourcePNG='https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/docs/'+s['sourcePNG'],sourceSHA256=s['sourceSHA256'],previousSourcePNG=original['sourcePNG'],previousSourceSHA256=original['sourceSHA256'],preview=rel+'preview.webp',compatibleThemes=original['compatibleThemes'],fps=24,duration=3,width=480,height=480,frames=[rel+f'frame_{j:04}.webp' for j in range(72)],loopVideo=rel+'alpha.webm',keyVideo=rel+'key.mp4',keyColor=s['keyColor'],sequenceZip=rel+f'ML_SHARED_Butterfly{n:02}_Wingbeat_PNGAlpha480_v98.zip',fiveCycleVideo=rel+'five-cycles.mp4',rawVideo=rel+'raw.mp4',reviewSheet=rel+'review.jpg',jobId=raw['jobId'],rawSHA256=raw['sha256'],sourceFrameIndices=qa['sourceFrameIndices'],actualCycleFrames=qa['actualCycleFrames'],derivation=qa['derivation'],qa=qa,gameApplied=True)
    with zipfile.ZipFile(docs/item['sequenceZip'],'w',zipfile.ZIP_DEFLATED) as z:
        for file in frames:z.write(file,file.name)
        z.writestr('sequence.json',json.dumps(item,ensure_ascii=False,indent=2))
        z.writestr('README.txt','480x480 RGBA / 24fps / 72frames / 3sec. Import as straight-alpha frames, pivot center. Original native-rate forward wingbeat cycle repeated without reverse or morph. Unity runtime and venue output are not tested.\n')
    with zipfile.ZipFile(docs/item['sequenceZip']) as z:assert z.testzip() is None and len(z.namelist())==74
    item['alphaWebM_SHA256']=sha(folder/'alpha.webm');item['keyMP4_SHA256']=sha(folder/'key.mp4');items.append(item)
data=dict(format='mazeland-butterfly-wingbeats-v98',version=98,date='2026-10-28',approvedRetryCount=3,maximumRetryCredits=6,actualRetryCredits=6,items=items)
selection=json.loads((repo.parent/'20261028_메이즈랜드_원본소스/나비_실제날갯짓_480_3초_v98/사용확정_나비3종_20261028.json').read_text(encoding='utf-8'))
data['selectedIds']=[a['id'] for a in selection['items'] if a['index'] in selection['selectedIndices']]
assert data['selectedIds']==['atmosphere85-butterfly-01','atmosphere85-butterfly-02','atmosphere85-butterfly-03']
data['selectionDecision']='사용자가 확정한 나비 3종만 사용'
for item in items:item['gameApplied']=item['id'] in data['selectedIds']
(public/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(docs/'butterfly-loop-catalog98.js').write_text('window.jejuButterflyLoopData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\nwindow.jejuButterflyLoops.validate(window.jejuButterflyLoopData);\n',encoding='utf-8')
with zipfile.ZipFile(public/'Butterfly4_PNGAlpha480_v98.zip','w',zipfile.ZIP_STORED) as z:
    for m in items:z.write(docs/m['sequenceZip'],Path(m['sequenceZip']).name)
    z.writestr('manifest.json',json.dumps(data,ensure_ascii=False,indent=2))
shutil.copy2(public/'Butterfly4_PNGAlpha480_v98.zip',base/'루프후보_v98/Butterfly4_PNGAlpha480_v98.zip')
(base/'공개제작현황_v98.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('4 exact-source native wingbeats,288 RGBA frames,4 individual ZIPs and combined ZIP published locally.')
