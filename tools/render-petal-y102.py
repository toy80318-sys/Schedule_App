"""Render existing complete RGBA petals as fixed-pivot, two-sided Y rotation loops."""
from pathlib import Path
import argparse, colorsys, concurrent.futures, hashlib, json, math, re, subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
OUT = DOCS / 'assets/petal-y-loops-v102'
SIZE, FPS, SECONDS, COUNT = 480, 30, 5, 150
REVISION = 1


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def prepared(source):
    image = Image.open(source).convert('RGBA')
    bounds = image.getchannel('A').point(lambda value:255 if value>=16 else 0).getbbox()
    assert bounds and all(v > 0 for v in bounds[:2]) and bounds[2] < image.width and bounds[3] < image.height
    # Original alpha can contain level-one dust; padding centers the visible petal without cutting any source pixels.
    cx,cy=(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2
    canvas=Image.new('RGBA',(2*math.ceil(max(cx,image.width-cx))+4,2*math.ceil(max(cy,image.height-cy))+4))
    canvas.paste(image,(round(canvas.width/2-cx),round(canvas.height/2-cy)))
    image=canvas
    image.thumbnail((340,340), Image.Resampling.LANCZOS)
    rgba = np.asarray(image, dtype=np.float32)
    rgba[:,:,:3] *= rgba[:,:,3:4]/255
    return rgba


def projected_quad(width, height, phase):
    angle = math.tau * (phase % 1)
    c, s = math.cos(angle), math.sin(angle)
    xy = np.asarray([[-(width-1)/2,-(height-1)/2],[(width-1)/2,-(height-1)/2],[(width-1)/2,(height-1)/2],[-(width-1)/2,(height-1)/2]],np.float64)
    perspective = 1200/(1200 + xy[:,0]*s)
    quad = np.column_stack([xy[:,0]*c*perspective,xy[:,1]*perspective]) + (SIZE-1)/2
    return quad.astype(np.float32)


def frame(texture, phase):
    height, width = texture.shape[:2]
    if abs(math.cos(math.tau*(phase % 1))) < 1e-9:
        return np.zeros((SIZE,SIZE,4),np.uint8)
    source = np.asarray([[0,0],[width-1,0],[width-1,height-1],[0,height-1]],np.float32)
    matrix = cv2.getPerspectiveTransform(source,projected_quad(width,height,phase))
    rgba = cv2.warpPerspective(texture,matrix,(SIZE,SIZE),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    np.divide(rgba[:,:,:3]*255,rgba[:,:,3:4],out=rgba[:,:,:3],where=rgba[:,:,3:4]>0)
    rgba[:,:,:3][rgba[:,:,3]==0] = 0
    return np.uint8(np.clip(np.round(rgba),0,255))


def visible(rgba, size=60):
    small = cv2.resize(rgba,(size,size),interpolation=cv2.INTER_AREA).astype(np.float32)
    small[:,:,:3] *= small[:,:,3:4]/255
    return small


def key_color(texture):
    straight = texture[:,:,:3]/np.maximum(texture[:,:,3:4]/255,.001)
    weight = (texture[:,:,3]/255)*(straight.max(2)-straight.min(2))
    rgb = (straight*weight[:,:,None]).sum((0,1))/max(weight.sum(),1)
    hue = colorsys.rgb_to_hsv(*(rgb/255))[0]
    return np.asarray([round(v*255) for v in colorsys.hsv_to_rgb((hue+.5)%1,1,1)],np.uint8)


def encoder(path, alpha):
    codec = ['-c:v','libvpx-vp9','-pix_fmt','yuva420p','-auto-alt-ref','0','-b:v','0','-crf','26','-deadline','good','-cpu-used','5'] if alpha else ['-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-preset','fast','-movflags','+faststart']
    return subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba' if alpha else 'rgb24','-s',f'{SIZE}x{SIZE}','-r',str(FPS),'-i','pipe:0','-an','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv',*codec,'-threads','2',str(path)],stdin=subprocess.PIPE,stderr=subprocess.PIPE)


def probe(path):
    result = subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,nb_read_frames,r_frame_rate,color_space,color_transfer,color_primaries,color_range:stream_tags=alpha_mode:format=duration','-of','json',str(path)],check=True,capture_output=True,text=True)
    info = json.loads(result.stdout)
    stream = info['streams'][0]
    assert (stream['width'],stream['height'],int(stream['nb_read_frames']),stream['r_frame_rate']) == (SIZE,SIZE,COUNT,'30/1'), info
    assert abs(float(info['format']['duration'])-SECONDS) < .04, info
    assert all(stream.get(k)==v for k,v in [('color_space','bt709'),('color_transfer','bt709'),('color_primaries','bt709'),('color_range','tv')]), info
    return info


def decoded_alpha_check(path, solid_masks):
    process = subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-i',str(path),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    count, missing, border, translucent = 0,0,0,0
    first = last = previous = None
    adjacent = []
    while True:
        data = process.stdout.read(SIZE*SIZE*4)
        if not data:
            break
        assert len(data)==SIZE*SIZE*4 and count < COUNT
        rgba = np.frombuffer(data,np.uint8).reshape(SIZE,SIZE,4)
        alpha = rgba[:,:,3]
        mask = np.unpackbits(solid_masks[count],count=SIZE*SIZE).reshape(SIZE,SIZE).astype(bool)
        missing += int(np.count_nonzero(mask & (alpha < 200)))
        border += int(np.count_nonzero(alpha[:2,:])+np.count_nonzero(alpha[-2:,:])+np.count_nonzero(alpha[:,:2])+np.count_nonzero(alpha[:,-2:]))
        translucent += int(np.count_nonzero((alpha>0)&(alpha<255)))
        assert alpha.min()==0 and alpha.max()>=240, ('alpha decode missing',count)
        current = visible(rgba)
        if previous is not None:
            adjacent.append(float(np.abs(current-previous).mean()))
        else:
            first = current
        last, previous = current, current
        count += 1
    error = process.stderr.read()
    assert process.wait()==0, error
    assert count==COUNT and missing==0 and border==0, (count,missing,border)
    seam = float(np.abs(last-first).mean())
    assert seam <= max(adjacent)*1.25+.03, (seam,max(adjacent))
    return {'framesChecked':count,'opaqueInteriorFailures':missing,'borderFailures':border,'translucentPixels':translucent,'seamMAE':seam,'maximumAdjacentMAE':max(adjacent),'alphaDecoder':'libvpx-vp9'}


def contact_sheet(texture, target):
    sheet = Image.new('RGB',(8*120,4*146),'#192337')
    draw = ImageDraw.Draw(sheet)
    for row,background in enumerate(['#F5F0E7','#17202B','checker','#192445']):
        for col in range(8):
            im = Image.fromarray(frame(texture,col/8)).resize((120,120),Image.Resampling.LANCZOS)
            if background=='checker':
                tile = Image.new('RGBA',(120,120),'#D5D8DB')
                check = ImageDraw.Draw(tile)
                for y in range(0,120,15):
                    for x in range(0,120,15):
                        if (x//15+y//15)%2:check.rectangle((x,y,x+14,y+14),fill='#969DA3')
            else:tile=Image.new('RGBA',(120,120),background)
            tile.alpha_composite(im)
            sheet.paste(tile.convert('RGB'),(col*120,row*146))
            draw.text((col*120+5,row*146+123),f'{col*45} deg / {background}',fill='white')
    sheet.save(target/'contact.png')


def build(item, force=False):
    assert re.fullmatch(r'[A-Za-z0-9-]+',item['id']) and Path(item['file']).name==item['file']
    source = ROOT/'source-assets/flower-petals-v90'/item['file']
    input_hash = sha(source)
    assert input_hash==item['sha256'], item['id']
    target = OUT/item['id']
    record = target/'qa.json'
    if record.exists() and not force:
        cached=json.loads(record.read_text(encoding='utf8'))
        if cached.get('renderRevision')==REVISION and cached['inputHash']==input_hash and all(sha(target/v['file'])==v['sha256'] for v in cached['video'].values()):
            print('CACHED '+item['id'],flush=True)
            return cached
    target.mkdir(parents=True,exist_ok=True)
    texture=prepared(source)
    zero=frame(texture,0)
    assert np.array_equal(zero,frame(texture,1))
    assert not np.array_equal(zero,frame(texture,(COUNT-1)/COUNT))
    assert np.array_equal(frame(texture,.5),np.fliplr(zero)), 'Two-sided back must be the exact mirrored artwork'
    key=key_color(texture)
    processes=[encoder(target/'alpha.webm',True),encoder(target/'key.mp4',False)]
    alpha_masks,frame_hashes,stats,widths,small=[],[],[],[],[]
    try:
        for i in range(COUNT):
            rgba=frame(texture,i/COUNT)
            alpha=rgba[:,:,3]
            bounds=Image.fromarray(alpha).getbbox()
            assert bounds and min(bounds[:2])>=20 and max(bounds[2:])<=SIZE-20,(item['id'],i,bounds)
            borders=int(np.count_nonzero(alpha[:2,:])+np.count_nonzero(alpha[-2:,:])+np.count_nonzero(alpha[:,:2])+np.count_nonzero(alpha[:,-2:]))
            assert borders==0
            opacity=alpha[:,:,None].astype(np.float32)/255
            composite=np.uint8(np.clip(np.round(rgba[:,:,:3]*opacity+key*(1-opacity)),0,255))
            processes[0].stdin.write(rgba.tobytes())
            processes[1].stdin.write(composite.tobytes())
            alpha_masks.append(np.packbits(alpha>=250))
            frame_hashes.append(hashlib.sha256(rgba.tobytes()).hexdigest())
            stats.append({'index':i,'alphaBounds':bounds,'opaquePixels':int(np.count_nonzero(alpha>=250)),'borderPixels':borders})
            widths.append(float(np.ptp(projected_quad(texture.shape[1],texture.shape[0],i/COUNT)[:,0])))
            small.append(visible(rgba))
    finally:
        for process in processes:
            process.stdin.close()
            error=process.stderr.read()
            assert process.wait()==0,error
    diffs=[float(np.abs(a-b).mean()) for a,b in zip(small,small[1:])]
    seam=float(np.abs(small[-1]-small[0]).mean())
    assert seam<=max(diffs)*1.25+.03,(item['id'],seam,max(diffs))
    encoded=decoded_alpha_check(target/'alpha.webm',alpha_masks)
    videos={name:{'file':filename,'sha256':sha(target/filename),'probe':probe(target/filename)} for name,filename in [('alpha','alpha.webm'),('key','key.mp4')]}
    assert videos['alpha']['probe']['streams'][0].get('tags',{}).get('alpha_mode')=='1'
    Image.fromarray(zero).save(target/'poster.png')
    contact_sheet(texture,target)
    assert sha(source)==input_hash
    result={
        'sourceId':item['id'],'inputHash':input_hash,'sourceUnchanged':True,'sourceOriginal':source.relative_to(ROOT).as_posix(),
        'sourceFlowerSHA256':item['sourceSHA256'],'fps':FPS,'seconds':SECONDS,'width':SIZE,'height':SIZE,'frames':COUNT,
        'rotationAxis':'Y','rotationDegrees':360,'camera':'fixed perspective, focal distance 1200 pixels','pivot':[239.5,239.5],
        'model':'deterministic-two-sided-texture','backSurface':'same original image on both sides, physically mirrored on the back; no generated backside',
        'periodClosureExact':True,'encodedAlphaChecked':True,'actualLastFrameDuplicatesFirst':False,
        'keyColor':'#'+''.join(f'{v:02X}' for v in key),'projectedWidths':widths,'perFrame':stats,'fullCycleFrameHashes':frame_hashes,
        'video':videos,'qa':{'sourceSeamMAE':seam,'sourceMaximumAdjacentMAE':max(diffs),'encodedAlpha':encoded,'visualReview':'pending','edgeOnNote':'A flat two-sided texture is edge-on at 90 and 270 degrees; the 150 encoded samples avoid the zero-width instant.'},
        'renderRevision':REVISION,
    }
    record.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('RENDERED '+item['id'],flush=True)
    return result


def self_check():
    image=np.zeros((79,55,4),np.float32);image[8:65,10:45]=[100,30,20,255]
    assert np.array_equal(frame(image,0),frame(image,1))
    assert np.array_equal(frame(image,.5),np.fliplr(frame(image,0)))
    assert not frame(image,.25).any()
    assert not np.array_equal(frame(image,0),frame(image,149/150))
    quad=projected_quad(55,79,0)
    assert np.allclose(quad.mean(0),[239.5,239.5])
    assert np.ptp(projected_quad(55,79,.249)[:,0])<1


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--id');parser.add_argument('--force',action='store_true');parser.add_argument('--workers',type=int,default=3);parser.add_argument('--self-check',action='store_true');args=parser.parse_args()
    self_check()
    if args.self_check:
        print('PASS: full-cycle identity, no duplicated endpoint, two-sided Y projection, exact edge-on geometry and stationary pivot');return
    items=json.loads((DOCS/'assets/flower-petals-v90/manifest.json').read_text(encoding='utf8'))['items']
    assert len(items)==48
    if args.id:
        items=[a for a in items if a['id']==args.id]
        assert len(items)==1,'Unknown petal ID'
    else:
        representative=next(a for a in items if a['id']=='BG01-marigold-scene-a-v83')
        build(representative,args.force)
        items=[a for a in items if a is not representative]
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(args.workers,4))) as pool:
        list(pool.map(lambda a:build(a,args.force),items))
    print('COMPLETE: numeric/video checks passed; visual review remains pending',flush=True)


if __name__=='__main__':main()
