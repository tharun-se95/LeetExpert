import sys, numpy as np
from PIL import Image, ImageOps
from scipy import ndimage as ndi
from rembg import remove, new_session
B1=dict(zip(["wu-14-laptop","cu-11-laughing","wu-13-coffee","wu-15-peace-notes","wu-01-wave","cu-05-worried","fb-02-walk-in","wu-10-shrug","wu-12-blank-card","cu-08-excited","cu-06-skeptical","fb-06-lean-desk","wu-05-tablet","wu-09-arms-crossed","wu-08-facepalm","fb-05-celebrate","fb-03-present","cu-03-thinking","wu-03-point-side","cu-09-wink"],
 ['814478245_1790535788999233.jpg','205785014_1790535787469301.jpg','85416308_1790535774611753.jpg','349444486_1790535785149814.jpg','555166087_1790535786754850.jpg','755534922_1790535788240068.jpg','313258635_1790535785994117.jpg','696330323_1790535776422863.jpg','335335734_1790535784192529.jpg','160991146_1790535772700065.jpg','584519016_1790535783274455.jpg','391812626_1790535782458865.jpg','112077430_1790535773759239.jpg','777322884_1790535781525624.jpg','195565751_1790535779793480.jpg','583479270_1790535777253529.jpg','243336255_1790535780675633.jpg','336494826_1790535778083600.jpg','961165374_1790535778926277.jpg','238412750_1790535775300486.jpg']))
B2=dict(zip(["cu-05b-cringe","cu-10-serious","fb-04-stool-coffee","wu-02-pen-up","fb-01-standing","cu-02-explaining","wu-01c-wave-front","wu-06-thumbs-up","wu-04-open-palm","cu-01b-smile","cu-04-surprised","wu-07-think-standing","cu-01-happy"],
 ["498571662_1790535794438077.jpg","207751620_1790535789763569.jpg","436360266_1790535791466249.jpg","496617437_1790535796181401.jpg","382958381_1790535797028019.jpg","941383408_1790535801186714.jpg","755944054_1790535799778578.jpg","451199053_1790535792332613.jpg","953408743_1790535801941145.jpg","508899471_1790535771661676.jpg","259229376_1790535797919658.jpg","676425199_1790535793308031.jpg","85084234_1790535790607765.jpg"]))
SRC={**B1,**B2}
sess=new_session("isnet-anime")
def clean(name, debug=False):
    O=np.asarray(Image.open("/mnt/user-data/uploads/"+SRC[name]).convert("RGB")).astype(np.float32)
    a=np.asarray(remove(Image.fromarray(O.astype(np.uint8)),session=sess,only_mask=True)).astype(np.float32)/255.
    brd=np.concatenate([O[:6].reshape(-1,3),O[-6:].reshape(-1,3),O[:,:6].reshape(-1,3),O[:,-6:].reshape(-1,3)]); bg=np.median(brd,0)
    D=np.sqrt(((O-bg)**2).sum(-1))
    # also estimate local bg for images with gradients: use a heavy blur of the background-only pixels
    transparent=a<0.05
    # 1) halo removal in the edge band
    band=ndi.binary_dilation(transparent,iterations=5)&(a>0.05)
    a=np.where(band&(D<30),0,a)
    # 2) background pockets inside (gaps between hair strands / arms / stool legs)
    pocket=(a>0.05)&(D<9)
    lab,n=ndi.label(pocket); sizes=ndi.sum(pocket,lab,range(1,n+1))
    kill=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>=40])
    removed=int(kill.sum()); a=np.where(kill,0,a)
    # 3) re-grow: pixels that are clearly background-coloured and touch transparency get removed iteratively (flood from outside)
    for _ in range(3):
        t=a<0.05; near=ndi.binary_dilation(t)&~t
        a=np.where(near&(D<22),0,a)
    # 4) clean alpha: drop specks, smooth 1px edge
    solid=a>0.5; lab,n=ndi.label(solid); sizes=ndi.sum(solid,lab,range(1,n+1))
    keep=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>=0.002*solid.sum()])
    a=np.where(keep|(a<=0.5)&ndi.binary_dilation(keep,iterations=2),a,0)
    a=ndi.gaussian_filter(np.minimum(a,ndi.grey_erosion(a,size=2)),0.6)
    # 5) colour decontamination on soft edges
    aa=np.clip(a,1e-3,1)[...,None]
    C=np.where(aa<0.98,np.clip((O-(1-aa)*bg)/aa,0,255),O)
    out=np.dstack([C,a*255]).astype(np.uint8); im=Image.fromarray(out,"RGBA"); im=im.crop(im.getbbox())
    return im, removed
if __name__=="__main__":
    names=sys.argv[1:]
    for n in names:
        im,r=clean(n); im.save(f"lib2/{n}.png"); print(n,im.size,"pocket px removed",r,flush=True)
