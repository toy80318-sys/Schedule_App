"""Decode every exported frame; keep technical checks separate from visual review."""
from pathlib import Path
import hashlib, json, subprocess, zipfile
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]; DOCS=ROOT/'docs'
DELIVERY=ROOT.parent/'20261028_메이즈랜드_원본소스/분리루프_v88'
MANIFEST=DOCS/'assets/separated-loops-v88/manifest.json'


def probe(path):
    result=subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(path)])
    return json.loads(result)


def verify_static_environment(a):
    parts=a['id'].split('-'); themes={'BG01':'sunset','BG02':'day','BG03':'night','BG04':'morning'}
    categories={'E01':'grass','E02':'tree','E05':'basalt','E06':'leaf'}
    assert len(parts)==3 and parts[0] in themes and parts[1] in categories and parts[2]=='V05'
    assert a['theme']==themes[parts[0]] and a['category']==categories[parts[1]]
    assert a['sourcePNG']==f'https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/{a["id"]}.png'
    assert a['image']==f'assets/separated-loops-v88/{a["id"]}/still.png'
    assert a['kind']=='image' and a['stillOnly'] is True and (a['frameCount'],a['width'],a['height'])==(1,1254,1254)
    assert len(a['sourceSHA256'])==64 and all(c in '0123456789abcdef' for c in a['sourceSHA256']) and a['sha256']==a['sourceSHA256']
    assert not any(k in a for k in ('frames','previewFrames','fps','duration','loopVideo','keyVideo','keyColor','sequenceZip','unityFrames','sequenceFrameCount','loopWidth','loopHeight','motion','rootAnchor','seamCheck','visualReview','alphaQA','alphaWebM_SHA256','keyMP4_SHA256','sequenceSHA256','qa'))
    path=DOCS/a['image']; source=ROOT/'source-assets/set-review-v01'/f'{a["id"]}.png'
    assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sourceSHA256']==hashlib.sha256(source.read_bytes()).hexdigest()
    with Image.open(path) as image:
        assert image.format=='PNG' and image.mode=='RGBA' and image.size==(1254,1254)
        image.load()
    return {'id':a['id'],'image':a['image'],'sha256':a['sha256'],'RGBAImagesChecked':1}


def verify():
    data=json.loads(MANIFEST.read_text('utf-8')); checks=[]
    assert data.get('environmentMode') in (None,'static-image')
    static=data.get('environmentMode')=='static-image'
    assert data['format']=='mazeland-separated-loops-v88' and data['version']==88
    assert len(data['environment'])==16 and len({a['id'] for a in data['environment']})==16 and len(data['backgrounds'])==4
    for a in data['environment']:
        if static:
            row=verify_static_environment(a);checks.append(row);print(json.dumps(row),flush=True)
            continue
        path=DOCS/a['loopVideo']; info=probe(path); stream=info['streams'][0]
        assert (stream['width'],stream['height'],stream['r_frame_rate'],int(stream['nb_read_frames']))==(480,480,'24/1',96)
        assert stream.get('tags',{}).get('alpha_mode')=='1'
        key=probe(DOCS/a['keyVideo']); assert len(key['streams'])==1 and key['streams'][0]['codec_type']=='video'
        process=subprocess.Popen(['ffmpeg','-v','error','-c:v','libvpx-vp9','-i',str(path),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        pixels=480*480*4; count=0; max_error=0; alpha_failures=[]; root_failures=[]; samples=[]
        first=np.array(Image.open(DELIVERY/'PNG_ALPHA'/a['id']/'frame_0000.png'))
        occupied=np.where(first[:,:,3]>0)[0]; anchor=int(occupied.max())-5
        opaque=cv2.erode((first[:,:,3]==255).astype(np.uint8),np.ones((11,11),np.uint8)).astype(bool)
        for i in range(96):
            raw=process.stdout.read(pixels); assert len(raw)==pixels
            decoded=np.frombuffer(raw,np.uint8).reshape(480,480,4)
            expected=np.array(Image.open(DELIVERY/'PNG_ALPHA'/a['id']/f'frame_{i:04}.png'))
            assert expected.shape==(480,480,4)
            if not np.array_equal(expected[anchor:],first[anchor:]):root_failures.append(i)
            if np.any(decoded[:,:,3][opaque]<250):alpha_failures.append(i)
            max_error=max(max_error,float(np.abs(decoded[:,:,3].astype(float)-expected[:,:,3]).mean()))
            if i in (0,24,48,72,95): samples.append(Image.fromarray(decoded.copy()))
            count+=1
        error=process.stderr.read().decode(); assert process.wait()==0,error
        assert not root_failures and not alpha_failures and max_error<2,(a['id'],root_failures,alpha_failures,max_error)
        contact=Image.new('RGB',(160*5,160*4))
        night=Image.open(ROOT/'source-assets/set-review-v01/BG03-B04-V05.png').convert('RGBA').resize((160,160))
        for row,color in enumerate(('#fff8f0','#071b16','checker','night')):
            for col,im in enumerate(samples):
                if color=='night':tile=night.copy()
                elif color=='checker':
                    yy,xx=np.mgrid[:160,:160]; g=np.where((xx//16+yy//16)%2,145,210).astype(np.uint8);tile=Image.fromarray(np.dstack([g,g,g,np.full_like(g,255)]))
                else:tile=Image.new('RGBA',(160,160),color)
                tile.alpha_composite(im.resize((160,160),Image.Resampling.LANCZOS));contact.paste(tile.convert('RGB'),(160*col,160*row))
        contact.save(DELIVERY/'검수'/f'{a["id"]}_실제WebM_4배경.jpg',quality=93)
        archive=DELIVERY/'PNG_패키지'/a['id']/'PNG_ALPHA.zip'
        with zipfile.ZipFile(archive) as z:
            assert z.testzip() is None and sum(n.endswith('.png') for n in z.namelist())==96
        row={'id':a['id'],'decodedRGBAFrames':count,'alphaFailures':alpha_failures,'rootFailures':root_failures,'maximumAlphaMAE':max_error,'sequenceCRC':'passed'};checks.append(row);print(json.dumps(row),flush=True)
    for b in data['backgrounds']:
        path=DOCS/b['video']; info=probe(path);stream=info['streams'][0]
        assert (stream['width'],stream['height'],stream['r_frame_rate'])==(1440,480,'24/1')
        assert int(stream['nb_read_frames'])==1440 and abs(float(info['format']['duration'])-60)<.1
        assert hashlib.sha256(path.read_bytes()).hexdigest()==b['sha256']
        subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True)
        checks.append({'id':b['id'],'decodedFrames':1440,'duration':60,'fixedCamera':True});print('BG PASS '+b['id'],flush=True)
    result={('environmentImages' if static else 'environmentLoops'):16,'backgrounds':4,'RGBAFramesChecked':16 if static else 1536,'backgroundFramesDecoded':5760,'checks':checks,'visualReview':'pending'}
    (DELIVERY/'검수'/'기술검수.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    return result


if __name__=='__main__':verify()
