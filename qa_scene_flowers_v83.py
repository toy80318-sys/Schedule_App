import json
from pathlib import Path
from PIL import Image
p=Path(__file__).resolve().parent.parent/'20261028_메이즈랜드_원본소스/배경기반_추상유화4변형_v83'
rows={}
for f in sorted(p.glob('flowers_*.json')):
    for j in json.loads(f.read_text(encoding='utf-8')):rows[j['code'],j['kind'],j['variant']]=j
bad=[]
for j in rows.values():
    im=Image.open(j['output']);box=im.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox()
    if im.mode!='RGBA' or im.size!=(1254,1254) or not box or min(box[0],box[1],im.width-box[2],im.height-box[3])<2:
        bad.append(dict(code=j['code'],kind=j['kind'],variant=j['variant'],output=j['output'],bounds=box))
(p/'검수_여백수정목록.json').write_text(json.dumps(bad,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(checked=len(rows),clipped=bad),ensure_ascii=False))
