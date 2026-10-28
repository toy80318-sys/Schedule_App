"""Expose the three approved native RGBA sequences without regenerating media."""
from pathlib import Path
import json,hashlib,shutil,sys
import numpy as np
from PIL import Image

repo=Path(__file__).resolve().parents[1];docs=repo/'docs'
source=Path(sys.argv[1]).resolve()/'20261028_메이즈랜드_원본소스/나비_실제날갯짓_480_3초_v98'
path=docs/'assets/butterfly-wingbeats-v98/manifest.json';data=json.loads(path.read_text(encoding='utf-8'))
for item in data['items']:
    if item['index'] not in [1,2,3]:continue
    frames=sorted((source/f'Butterfly{item["index"]:02}_PNGAlpha480').glob('*.png'));assert len(frames)==72
    folder=path.parent/item['id']/'png';folder.mkdir(exist_ok=True)
    item['pngFrames']=[];item['pngFrameSHA256']=[]
    for i,file in enumerate(frames):
        expected=item['qa']['pngSHA256'][i];assert hashlib.sha256(file.read_bytes()).hexdigest()==expected
        image=Image.open(file);assert image.mode=='RGBA' and image.size==(480,480)
        alpha=np.asarray(image)[:,:,3];assert alpha.min()==0 and alpha.max()==255
        target=folder/f'frame_{i:04}.png';shutil.copy2(file,target)
        item['pngFrames'].append(target.relative_to(docs).as_posix());item['pngFrameSHA256'].append(expected)
    item['userApproved']=True
data['pngAlphaPlaybackVersion']=100
path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(docs/'butterfly-loop-catalog98.js').write_text('window.jejuButterflyLoopData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\nwindow.jejuButterflyLoops.validate(window.jejuButterflyLoopData);\n',encoding='utf-8')
print('216 original RGBA480 PNGs verified and registered; no new generation.')
