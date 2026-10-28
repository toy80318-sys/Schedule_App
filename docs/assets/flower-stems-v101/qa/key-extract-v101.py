"""Resolve antialiased key edges against nearby real foreground colors; never fill gaps."""
import cv2,numpy as np

def extract(rgb):
    f=rgb.astype(np.float32)
    bg=np.median(np.concatenate([f[:,:4],f[:,-4:]],axis=1),axis=1)[:,None,:]
    bg=np.repeat(bg,f.shape[1],axis=1)
    delta=f-bg;distance=np.linalg.norm(delta,axis=2)
    hue=np.linalg.norm(f/np.maximum(f.max(axis=2,keepdims=True),1)-bg/np.maximum(bg.max(axis=2,keepdims=True),1),axis=2)
    green=bool(np.median(bg[:,:,1])>np.median(bg[:,:,0])+100 and np.median(bg[:,:,1])>np.median(bg[:,:,2])+100)
    deep=cv2.erode(((distance>90)&(hue>(.45 if green else .18))).astype(np.uint8),np.ones((5,5),np.uint8)).astype(bool)
    core=((hue>(.65 if green else .4))&(distance>50))|((f.max(axis=2)<bg.max(axis=2)*.6)&(distance>60))|deep
    assert core.any()
    spatial,labels=cv2.distanceTransformWithLabels((~core).astype(np.uint8),cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    palette=np.zeros((int(labels.max())+1,3),np.float32);palette[labels[core]]=f[core]
    foreground=palette[labels];direction=foreground-bg
    a=np.clip(np.sum(delta*direction,axis=2)/np.maximum(np.sum(direction*direction,axis=2),1),0,1)
    a[core]=1
    if green:
        # H.264 chroma spill around petals must not become opaque foreground.
        keylike=(hue<.65)&(f.max(axis=2)>bg.max(axis=2)*.6)
        spill=np.clip((f[:,:,1]-np.maximum(f[:,:,0],f[:,:,2]))/np.maximum(bg[:,:,1]-np.maximum(f[:,:,0],f[:,:,2]),1),0,1)
        a[keylike]=np.minimum(a[keylike],1-spill[keylike])
    a[(spatial>5)|(a<.035)]=0;a[a>.98]=1
    color=rgb.copy();edge=(a>0)&(a<1)
    color[edge]=np.uint8(np.clip((f[edge]-(1-a[edge,None])*bg[edge])/a[edge,None],0,255))
    soft=(a>0)&(a<.25);color[soft]=foreground[soft].astype(np.uint8)
    assert np.array_equal(color[a==1],rgb[a==1])
    return color,a,core

if __name__=='__main__':
    for key in [(0,224,255),(0,0,255),(0,255,0),(255,32,0)]:
        rgb=np.full((64,64,3),key,np.uint8);rgb[16:48,16:48]=[80,60,110]
        color,a,_=extract(rgb)
        assert np.all(a[20:44,20:44]==1) and not np.any(a[:8])
        assert np.array_equal(color[20:44,20:44],rgb[20:44,20:44])
    print('Four key colors: empty background and opaque RGB preservation passed')

