import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
from rembg import remove, new_session
exec(open('clean.py').read().split('sess=new_session')[0].split('from rembg import remove, new_session')[1])  # SRC
sess=new_session("isnet-anime")
def clean(name):
    im=Image.open("/mnt/user-data/uploads/"+SRC[name]).convert("RGB"); O=np.asarray(im).astype(np.float32)
    base=np.asarray(remove(im,session=sess,only_mask=True,post_process_mask=True))>127
    brd=np.concatenate([O[:6].reshape(-1,3),O[-6:].reshape(-1,3),O[:,:6].reshape(-1,3),O[:,-6:].reshape(-1,3)]); bg=np.median(brd,0)
    D=np.sqrt(((O-bg)**2).sum(-1)); hue=(O[...,2]-O[...,0])
    bglike=(D<18)&(hue>=(bg[2]-bg[0])-5)
    allowed=ndi.binary_fill_holes(ndi.binary_dilation(base,iterations=3))|ndi.binary_dilation(base,iterations=8)
    cand=(~bglike)&allowed
    lab,n=ndi.label(cand); touch=np.unique(lab[base&cand]); touch=touch[touch>0]
    F=np.isin(lab,touch)
    # trust the model's interior (keeps cool-white shirt highlights next to the lanyard) ...
    core=ndi.binary_erosion(base,iterations=3)
    F=(F|core)
    # tidy: fill tiny pinholes inside F that are not true background pockets
    holes=ndi.binary_fill_holes(F)&~F; hl,hn=ndi.label(holes); hs=ndi.sum(holes,hl,range(1,hn+1))
    F|=np.isin(hl,[i+1 for i,v in enumerate(hs) if v<12])
    # close regions that are open only to the bottom image frame (e.g. a badge cut by the frame)
    Fp=np.pad(F,((0,1),(0,0)),constant_values=True); hp=ndi.binary_fill_holes(Fp)&~Fp; hl,hn=ndi.label(hp); hs=ndi.sum(hp,hl,range(1,hn+1))
    F=F|np.isin(hl,[i+1 for i,v in enumerate(hs) if v<3000])[:-1]
    # peel the light halo that sits outside the dark outline (stop at the line art)
    L=0.299*O[...,0]+0.587*O[...,1]+0.114*O[...,2]
    for _ in range(14):
        edge=F&~ndi.binary_erosion(F,border_value=1)
        F=F&~(edge&(L>190))
    # light regions framed by hair (bun loops, gaps between strands, the white glow around hair) are background
    hair=(L<170)
    brown=(L<170)&((O[...,0]-O[...,2])>=12)&(O[...,0]>=O[...,1])
    lightish=F&((O.min(-1)>228)|bglike)
    distout=ndi.distance_transform_edt(F)
    hairzone=ndi.binary_dilation(brown,iterations=25)
    lab,n=ndi.label(lightish); objs=ndi.find_objects(lab); kill=np.zeros_like(F)
    for i,sl in enumerate(objs):
        if sl is None: continue
        y0,y1=max(sl[0].start-6,0),sl[0].stop+6; x0,x1=max(sl[1].start-6,0),sl[1].stop+6
        comp=lab[y0:y1,x0:x1]==(i+1); ring=ndi.binary_dilation(comp,iterations=5)&~comp
        if ring.sum()==0: continue
        hr=hair[y0:y1,x0:x1][ring].mean(); out=(~F[y0:y1,x0:x1])[ring].mean(); br=brown[y0:y1,x0:x1][ring].mean()
        H,Wd=F.shape
        frame=sl[0].start==0 or sl[1].start==0 or sl[0].stop>=H or sl[1].stop>=Wd
        nearedge=distout[y0:y1,x0:x1][comp].min()<22
        col=O[y0:y1,x0:x1][comp].mean(0); cool=(col[2]-col[0])>=-1
        inhair=hairzone[y0:y1,x0:x1][comp].mean()
        if not frame and nearedge and inhair>0.7 and ((out>0.05 and hr+out>0.6) or br>0.6 or (cool and hr+out>0.8) or (hr>0.8 and col.min()>238 and comp.sum()<1500) or (bg.mean()<235 and np.sqrt(((col-bg)**2).sum())<12 and ndi.binary_erosion(comp).sum()>10)) and comp.sum()<6000: kill[y0:y1,x0:x1]|=comp
    F&=~kill
    # last sweep: near-white, neutral/cool specks at the hair silhouette
    band=F&ndi.binary_dilation(~F,iterations=6)&hairzone&(O.min(-1)>240)&((O[...,2]-O[...,0])>=-2)
    F&=~band
    # drop small light flecks hanging on the outside (bits of halo between hair strands)
    light=F&(L>185); lab,n=ndi.label(light); sz=ndi.sum(light,lab,range(1,n+1))
    outside=ndi.binary_dilation(~F,iterations=2)
    touch=np.unique(lab[outside&light])
    kill=[i for i in touch if i>0 and sz[i-1]<150]
    F=F&~np.isin(lab,kill)
    lab,n=ndi.label(F); sz=ndi.sum(F,lab,range(1,n+1)); F=np.isin(lab,[i+1 for i,v in enumerate(sz) if v>=30])
    # soft edge: 1px band gets alpha from colour distance to the background
    edge=F&~ndi.binary_erosion(F,border_value=1)
    a=F.astype(np.float32)
    a[edge]=np.clip((D[edge]-6)/26,0.25,1)
    a=ndi.gaussian_filter(a,0.5)*ndi.binary_dilation(F)
    aa=np.clip(a,1e-3,1)[...,None]
    C=np.where(aa<0.99,np.clip((O-(1-aa)*bg)/aa,0,255),O)
    out=Image.fromarray(np.dstack([C,a*255]).astype(np.uint8),"RGBA"); return out.crop(out.getbbox())
if __name__=="__main__":
    for n in sys.argv[1:]:
        clean(n).save(f"lib3/{n}.png"); print(n,flush=True)
