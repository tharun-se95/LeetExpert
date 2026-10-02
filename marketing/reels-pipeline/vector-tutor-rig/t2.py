import math
# Polished anime-style DSA tutor — layered SVG, waist-up frame 0 0 600 800
LINE="#3b2320"; SKL="#c98a74"
def defs(p=""):
    return f'''<defs>
<linearGradient id="{p}skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde8dc"/><stop offset="1" stop-color="#f5d0bd"/></linearGradient>
<linearGradient id="{p}hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e3d30"/><stop offset=".55" stop-color="#46291f"/><stop offset="1" stop-color="#301b15"/></linearGradient>
<linearGradient id="{p}hairL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d4839"/><stop offset="1" stop-color="#3a2119"/></linearGradient>
<linearGradient id="{p}iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b150e"/><stop offset=".45" stop-color="#6b3b22"/><stop offset=".85" stop-color="#c7823f"/><stop offset="1" stop-color="#e8b067"/></linearGradient>
<radialGradient id="{p}blush" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f59b91" stop-opacity=".55"/><stop offset="1" stop-color="#f59b91" stop-opacity="0"/></radialGradient>
<linearGradient id="{p}blouse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6eaf2"/><stop offset=".25" stop-color="#ffffff"/><stop offset=".75" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe4ee"/></linearGradient>
<linearGradient id="{p}lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".5" stop-color="#cfe6ff" stop-opacity=".06"/><stop offset="1" stop-color="#ffffff" stop-opacity=".16"/></linearGradient>
<clipPath id="{p}faceClip"><path d="{FACE}"/></clipPath>
</defs>'''
FACE="M200,262 Q198,352 238,408 Q270,450 300,456 Q330,450 362,408 Q402,352 400,262 Q400,164 300,158 Q200,164 200,262Z"

def eye(cx,cy,state,right,p):
    k=1 if right else -1          # outer corner direction
    ox=cx+36*k                     # outer corner x
    ix=cx-36*k
    if state in ("closed","happy"):
        if state=="closed": d=f"M{ix},{cy+4} Q{cx},{cy+22} {ox},{cy+2}"
        else: d=f"M{ix},{cy+12} Q{cx},{cy-18} {ox},{cy+10}"
        lash=f'<path d="M{ox},{cy+(2 if state=="closed" else 10)} l{10*k},{-6}" stroke="{LINE}" stroke-width="4" stroke-linecap="round"/>'
        return f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="6.5" stroke-linecap="round"/>'+lash
    lid=-32 if state!="half" else -6
    ry=29 if state!="wide" else 32
    shape=f"M{ix},{cy+6} Q{cx-6*k},{cy+lid} {ox},{cy-4} Q{ox-4*k},{cy+24} {cx},{cy+30} Q{ix+6*k},{cy+26} {ix},{cy+6}Z"
    cid=f"{p}e{cx}{state}"
    o=f'<clipPath id="{cid}"><path d="{shape}"/></clipPath><path d="{shape}" fill="#ffffff"/>'
    o+=f'<g clip-path="url(#{cid})"><rect x="{cx-50}" y="{cy-40}" width="100" height="18" fill="#e3e7f0"/>'
    o+=f'<ellipse cx="{cx+3*k}" cy="{cy+6}" rx="23" ry="{ry}" fill="url(#{p}iris)" stroke="#2a130c" stroke-width="2.5"/>'
    o+=f'<ellipse cx="{cx+3*k}" cy="{cy+4}" rx="11" ry="15" fill="#1c0b06"/>'
    o+=f'<path d="M{cx-14+3*k},{cy+24} Q{cx+3*k},{cy+32} {cx+18+3*k},{cy+22}" fill="none" stroke="#f3c98d" stroke-width="3" opacity=".8"/>'
    o+=f'<ellipse cx="{cx+10*k}" cy="{cy-8}" rx="8" ry="10" fill="#fff"/><circle cx="{cx-8*k}" cy="{cy+16}" r="4" fill="#fff" opacity=".9"/><circle cx="{cx+14*k}" cy="{cy+14}" r="2" fill="#fff" opacity=".8"/></g>'
    # upper lid: thick tapered line with lashes
    o+=f'<path d="M{ix-2*k},{cy+8} Q{cx-6*k},{cy+lid-8} {ox+2*k},{cy-6} L{ox+12*k},{cy-14} L{ox+6*k},{cy-2} Q{cx-6*k},{cy+lid+2} {ix+2*k},{cy+10}Z" fill="{LINE}"/>'
    o+=f'<path d="M{ox+4*k},{cy-6} l{12*k},{-2} M{ox},{cy} l{11*k},{4}" stroke="{LINE}" stroke-width="3.5" stroke-linecap="round"/>'
    if state!="half": o+=f'<path d="M{ix+6*k},{cy-22} Q{cx},{cy-40} {ox-2*k},{cy-20}" fill="none" stroke="{SKL}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>'
    o+=f'<path d="M{cx+6*k},{cy+30} Q{cx+22*k},{cy+28} {ox-4*k},{cy+18}" fill="none" stroke="{LINE}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>'
    return o

def brows(kind):
    B={"neutral":(0,0,0,0),"up":(-10,-12,-10,-12),"worry":(-2,8,8,-2),"focus":(6,4,4,6),"sly":(2,2,-8,-12)}[kind]
    a,b,c,d=[v+12 for v in B]
    L=f'<path d="M206,{254+a} Q236,{238+b} 272,{246+b} Q240,{244+b} 208,{260+a}Z" fill="#3b2320"/>'
    R=f'<path d="M394,{254+d} Q364,{238+c} 328,{246+c} Q360,{244+c} 392,{260+d}Z" fill="#3b2320"/>'
    return L+R

def mouth(k):
    y=404
    M={"smile":f'<path d="M282,{y} Q300,{y+13} 318,{y}" fill="none" stroke="#9c4a45" stroke-width="3.5" stroke-linecap="round"/><path d="M292,{y+14} Q300,{y+17} 308,{y+14}" fill="none" stroke="#e7a39a" stroke-width="3" stroke-linecap="round"/>',
       "grin":f'<path d="M278,{y-3} Q300,{y-6} 322,{y-3} Q318,{y+26} 300,{y+28} Q282,{y+26} 278,{y-3}Z" fill="#7d2f33" stroke="#6b2528" stroke-width="2"/><path d="M281,{y-1} Q300,{y-4} 319,{y-1} L318,{y+5} Q300,{y+3} 282,{y+5}Z" fill="#fff"/><path d="M288,{y+19} Q300,{y+11} 312,{y+19} Q300,{y+27} 288,{y+19}Z" fill="#e8847e"/>',
       "open":f'<path d="M284,{y} Q300,{y-3} 316,{y} Q313,{y+20} 300,{y+22} Q287,{y+20} 284,{y}Z" fill="#7d2f33"/><path d="M290,{y+15} Q300,{y+9} 310,{y+15} Q300,{y+21} 290,{y+15}Z" fill="#e8847e"/><path d="M286,{y+1} L314,{y+1} L313,{y+4} L287,{y+4}Z" fill="#fff"/>',
       "talk":f'<ellipse cx="300" cy="{y+5}" rx="10" ry="8" fill="#7d2f33"/><path d="M292,{y+9} Q300,{y+5} 308,{y+9} Q300,{y+13} 292,{y+9}Z" fill="#e8847e"/>',
       "o":f'<ellipse cx="300" cy="{y+7}" rx="9" ry="12" fill="#7d2f33" stroke="#6b2528" stroke-width="2"/><path d="M294,{y+13} Q300,{y+10} 306,{y+13} Q300,{y+17} 294,{y+13}Z" fill="#e8847e"/>',
       "flat":f'<path d="M290,{y+5} Q300,{y+7} 310,{y+5}" fill="none" stroke="#9c4a45" stroke-width="3.5" stroke-linecap="round"/>',
       "pout":f'<path d="M291,{y+7} Q300,{y-1} 309,{y+7}" fill="none" stroke="#9c4a45" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="300" cy="{y+10}" rx="7" ry="3" fill="#e7a39a"/>',
       "e":f'<path d="M282,{y} Q300,{y-2} 318,{y} Q300,{y+15} 282,{y}Z" fill="#7d2f33"/><path d="M284,{y} Q300,{y-1} 316,{y} L315,{y+4} Q300,{y+3} 285,{y+4}Z" fill="#fff"/>'}
    return M[k]

def glasses(p):
    fr=lambda x:(f'<rect x="{x}" y="276" width="100" height="92" rx="28" fill="url(#{p}lens)" stroke="#1b1d26" stroke-width="4.5"/>'
                 f'<path d="M{x+14},280 Q{x+50},274 {x+86},280" fill="none" stroke="#1b1d26" stroke-width="3" stroke-linecap="round" opacity=".6"/>'
                 f'<path d="M{x+14},304 L{x+30},292 M{x+12},322 L{x+40},298" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>')
    return fr(196)+fr(304)+'<path d="M296,304 Q300,296 304,304" fill="none" stroke="#1b1d26" stroke-width="5"/><path d="M196,300 L182,292 M404,300 L418,292" stroke="#1b1d26" stroke-width="5" stroke-linecap="round"/>'

def head(eyes,brow,mouth_k,p):
    o=f'<path d="M276,420 L324,420 L330,520 L270,520Z" fill="url(#{p}skin)" stroke="{SKL}" stroke-width="2.5"/>'
    o+=f'<path d="M268,432 Q300,470 332,432 L334,470 Q300,488 266,470Z" fill="#e4ad97" opacity=".8"/>'
    o+=f'<path d="{FACE}" fill="url(#{p}skin)" stroke="{SKL}" stroke-width="3"/>'
    o+=f'<g clip-path="url(#{p}faceClip)"><path d="M190,150 L410,150 L410,262 Q380,236 352,258 Q330,226 300,256 Q272,226 246,258 Q222,236 190,270Z" fill="#e9b7a2" opacity=".75"/></g>'
    o+=f'<ellipse cx="232" cy="378" rx="30" ry="15" fill="url(#{p}blush)"/><ellipse cx="368" cy="378" rx="30" ry="15" fill="url(#{p}blush)"/>'
    o+=f'<path d="M222,374 l-6,8 M232,374 l-6,8 M242,374 l-6,8 M358,374 l-6,8 M368,374 l-6,8 M378,374 l-6,8" stroke="#e98c84" stroke-width="2" stroke-linecap="round" opacity=".6"/>'
    o+=f'<path d="M303,352 Q308,368 302,376" fill="none" stroke="#d99884" stroke-width="3" stroke-linecap="round"/><circle cx="296" cy="376" r="1.8" fill="#c77f6c"/>'
    o+=f'<g id="eyes"><g transform="translate(250,330) scale(1.12) translate(-250,-330)">{eye(250,330,eyes[0],False,p)}</g><g transform="translate(350,330) scale(1.12) translate(-350,-330)">{eye(350,330,eyes[1],True,p)}</g></g>'
    o+=f'<g id="mouth">{mouth(mouth_k)}</g>'
    return o

def hair_back(p):
    o=(f'<path d="M186,250 Q170,118 300,100 Q430,118 414,250 Q456,340 470,430 Q454,470 478,520 Q500,600 474,660 Q496,720 458,776 Q440,730 418,690 Q404,720 380,736 L220,736 Q196,720 182,690 Q160,730 142,776 Q104,720 126,660 Q100,600 122,520 Q146,470 130,430 Q144,340 176,250Z" fill="url(#{p}hair)" stroke="{LINE}" stroke-width="3"/>')
    o+=(f'<path d="M150,470 Q134,560 150,650 M178,420 Q164,520 176,610 M452,470 Q468,560 452,650 M424,420 Q438,520 426,610 M160,690 Q150,730 146,760 M444,690 Q454,730 456,760" fill="none" stroke="#28150f" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>')
    o+=(f'<path d="M140,540 Q128,600 142,660 M462,540 Q474,600 460,660" fill="none" stroke="#7a5343" stroke-width="3" stroke-linecap="round" opacity=".7"/>')
    # bun + teal scrunchie
    o+=(f'<ellipse cx="300" cy="92" rx="48" ry="40" fill="url(#{p}hairL)" stroke="{LINE}" stroke-width="3"/>'
        f'<path d="M262,90 Q282,58 312,62 M300,112 Q322,96 336,74 M270,104 Q296,88 312,64" fill="none" stroke="#28150f" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
        f'<path d="M276,72 Q296,58 318,64" fill="none" stroke="#a37a63" stroke-width="4" stroke-linecap="round"/>'
        f'<path d="M258,120 Q300,142 342,120 Q344,132 338,136 Q300,156 262,136 Q256,132 258,120Z" fill="#107d6e" stroke="#0b5a50" stroke-width="2.5"/>'
        f'<path d="M272,132 Q300,144 328,132" fill="none" stroke="#5eead4" stroke-width="3" opacity=".7"/>')
    return o

def _strand(root,tip,w,bend):
    (rx,ry),(tx,ty)=root,tip
    mx,my=(rx+tx)/2+bend,(ry+ty)/2
    return (f"M{rx-w/2:.1f},{ry:.1f} Q{mx-w/2:.1f},{my:.1f} {tx:.1f},{ty:.1f} "
            f"Q{mx+w/2:.1f},{my:.1f} {rx+w/2:.1f},{ry:.1f}Z")
def hair_front(p):
    base="M190,292 Q176,152 300,128 Q424,150 410,292 Q396,222 300,212 Q204,222 190,292Z"
    o=f'<path d="{base}" fill="url(#{p}hair)" stroke="{LINE}" stroke-width="3"/>'
    S=[((226,150),(200,300),50,-18),((378,152),(408,300),52,20),((250,140),(222,280),46,-14),((352,140),(392,286),48,16),
       ((268,134),(244,262),44,-10),((332,134),(368,258),44,12),((286,130),(268,286),40,-8),((316,130),(342,270),42,8),
       ((300,128),(300,246),40,4),((258,138),(290,262),30,6),((344,138),(318,286),32,-6)]
    o+=f'<clipPath id="{p}skull"><path d="M184,320 L184,250 Q170,120 300,102 Q430,120 416,250 L416,320Z"/></clipPath><g clip-path="url(#{p}skull)">'
    for root,tip,w,bend in S:
        o+=f'<path d="{_strand(root,tip,w,bend)}" fill="url(#{p}hair)" stroke="{LINE}" stroke-width="2.6" stroke-linejoin="round"/>'
    o+='</g>'
    o+=(f'<path d="M186,250 Q170,120 300,102 Q430,120 414,250 Q384,196 300,190 Q216,196 186,250Z" fill="url(#{p}hair)"/>'
        f'<path d="M186,250 Q170,120 300,102 Q430,120 414,250" fill="none" stroke="{LINE}" stroke-width="3"/>'
        f'<path d="M266,106 Q300,96 334,106 L336,118 Q300,108 264,118Z" fill="#107d6e" stroke="#0b5a50" stroke-width="2.5"/>'
        f'<path d="M212,200 Q250,164 300,158 Q350,162 390,198 Q350,178 300,176 Q250,178 212,200Z" fill="#c9a088" opacity=".45"/>'
        f'<path d="M234,190 Q264,172 294,168 M316,170 Q346,176 368,194" fill="none" stroke="#f3d4bf" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>'
        f'<path d="M300,128 Q318,110 338,114 M244,146 Q230,132 216,136" fill="none" stroke="{LINE}" stroke-width="2.4" stroke-linecap="round"/>')
    # side locks (S-waves) framing face
    side=[("M198,268 Q176,350 198,430 Q214,490 190,556 Q178,596 200,640 Q188,594 212,560 Q238,500 222,430 Q208,360 214,290Z",),
          ("M402,268 Q424,350 402,430 Q386,490 410,556 Q422,596 400,640 Q412,594 388,560 Q362,500 378,430 Q392,360 386,290Z",)]
    for (d,) in side: o+=f'<path d="{d}" fill="url(#{p}hair)" stroke="{LINE}" stroke-width="3" stroke-linejoin="round"/>'
    o+=(f'<path d="M206,330 Q196,410 212,480 M394,330 Q404,410 388,480" fill="none" stroke="#9a6f58" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>'
        f'<path d="M210,500 Q222,540 206,580 M390,500 Q378,540 394,580" fill="none" stroke="#28150f" stroke-width="3" stroke-linecap="round" opacity=".7"/>')
    return o

def torso(p):
    o=(f'<path d="M112,800 Q108,610 166,556 Q204,522 262,510 L338,510 Q396,522 434,556 Q492,610 488,800Z" fill="url(#{p}blouse)" stroke="#aeb7c9" stroke-width="3"/>'
       f'<path d="M166,556 Q196,600 204,680 Q208,740 200,800 L176,800 Q170,700 166,556Z" fill="#d7dce8" opacity=".8"/><path d="M434,556 Q404,600 396,680 Q392,740 400,800 L424,800 Q430,700 434,556Z" fill="#d7dce8" opacity=".8"/>'
       f'<path d="M250,640 Q262,690 252,760 M350,640 Q338,690 348,760 M226,560 Q240,580 238,610" fill="none" stroke="#d3d9e5" stroke-width="5" stroke-linecap="round"/>'
       f'<path d="M300,560 L300,800" stroke="#c3cad9" stroke-width="3"/><path d="M304,560 L304,800" stroke="#eef1f6" stroke-width="2"/>')
    for y in (600,660,720,780): o+=f'<circle cx="310" cy="{y}" r="5" fill="#f4f6fa" stroke="#aeb7c9" stroke-width="2"/><circle cx="309" cy="{y-1}" r="1.5" fill="#fff"/>'
    # collar with depth
    o+=(f'<path d="M264,508 L300,560 L300,570 L262,590 L240,540 Q250,522 264,508Z" fill="#c9d0de"/>'
        f'<path d="M264,504 L300,556 L256,584 L234,528Z" fill="#ffffff" stroke="#aeb7c9" stroke-width="3" stroke-linejoin="round"/>'
        f'<path d="M336,504 L300,556 L344,584 L366,528Z" fill="#ffffff" stroke="#aeb7c9" stroke-width="3" stroke-linejoin="round"/>'
        f'<path d="M244,540 L292,560 M356,540 L308,560" stroke="#e1e6ef" stroke-width="3"/>')
    # teal lanyard + badge
    o+=(f'<path d="M252,526 Q262,620 290,694" fill="none" stroke="#0b5a50" stroke-width="9"/><path d="M252,526 Q262,620 290,694" fill="none" stroke="#107d6e" stroke-width="6"/>'
        f'<path d="M348,526 Q338,620 310,694" fill="none" stroke="#0b5a50" stroke-width="9"/><path d="M348,526 Q338,620 310,694" fill="none" stroke="#107d6e" stroke-width="6"/>'
        f'<rect x="292" y="686" width="16" height="12" rx="3" fill="#9aa4b8"/>'
        f'<rect x="266" y="694" width="68" height="92" rx="9" fill="#ffffff" stroke="#8c96aa" stroke-width="3"/><rect x="266" y="694" width="68" height="24" rx="9" fill="#107d6e"/><rect x="266" y="708" width="68" height="10" fill="#107d6e"/>'
        f'<text x="300" y="712" text-anchor="middle" font-family="Space Mono, DejaVu Sans Mono, monospace" font-size="12" font-weight="700" fill="#fff">TUTOR</text>'
        f'<circle cx="300" cy="738" r="12" fill="#f5d0bd"/><path d="M288,736 Q300,720 312,736" fill="#46291f"/><rect x="280" y="756" width="40" height="5" rx="2.5" fill="#c3cad9"/><rect x="286" y="767" width="28" height="5" rx="2.5" fill="#c3cad9"/>')
    return o

def sleeve(pts,p,w=60):
    d="M"+" L".join(f"{x},{y}" for x,y in pts)
    return (f'<path d="{d}" fill="none" stroke="#aeb7c9" stroke-width="{w+6}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="#ffffff" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="#e3e8f0" stroke-width="{w*0.35}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-8,6)" opacity=".7"/>')
def cuff(x,y,ang): return f'<rect x="{x-24}" y="{y-11}" width="48" height="22" rx="10" fill="#f4f6fa" stroke="#aeb7c9" stroke-width="3" transform="rotate({ang} {x} {y})"/>'
def forearm(pts,p,w=34):
    d="M"+" L".join(f"{x},{y}" for x,y in pts)
    return (f'<path d="{d}" fill="none" stroke="{SKL}" stroke-width="{w+5}" stroke-linecap="round"/><path d="{d}" fill="none" stroke="#f7d9c8" stroke-width="{w}" stroke-linecap="round"/>')
def fist(x,y,ang=0):  # closed hand with finger segments
    return (f'<g transform="rotate({ang} {x} {y})"><rect x="{x-24}" y="{y-22}" width="48" height="44" rx="16" fill="#f7d9c8" stroke="{SKL}" stroke-width="3"/>'
            f'<path d="M{x-12},{y-20} L{x-12},{y+6} M{x},{y-21} L{x},{y+6} M{x+12},{y-20} L{x+12},{y+6}" stroke="#e0a790" stroke-width="2.5" stroke-linecap="round"/></g>')

def arms(pose,p):
    L=sleeve([(166,566),(146,700),(146,800)],p); R=sleeve([(434,566),(454,700),(454,800)],p)
    if pose=="idle": return L+R
    if pose=="tablet":
        return (L+sleeve([(434,566),(476,660),(446,712)],p)+forearm([(440,712),(350,700)],p)+cuff(438,710,-20)+
                f'<g transform="rotate(-12 404 690)"><rect x="336" y="600" width="138" height="184" rx="14" fill="#2c313d" stroke="#1b1f28" stroke-width="3"/><rect x="346" y="612" width="118" height="160" rx="8" fill="#3b4252"/>'
                f'<text x="405" y="704" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="28" font-weight="700" fill="#8fa0bb">&lt;/&gt;</text><path d="M352,620 L384,612" stroke="#fff" stroke-width="3" opacity=".25"/></g>'
                +f'<path d="M340,668 Q334,690 344,704 Q358,712 364,698 Q366,684 356,672Z" fill="#f7d9c8" stroke="{SKL}" stroke-width="2.6"/>')
    if pose=="pen":
        return (L+sleeve([(434,566),(506,612)],p)+forearm([(506,612),(530,508)],p)+cuff(512,596,-75)+
                f'<path d="M534,478 L562,392" stroke="#1b1d26" stroke-width="9" stroke-linecap="round"/><path d="M562,392 L567,378" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>'+fist(532,494,-15))
    if pose=="think":
        return L+sleeve([(434,566),(456,690)],p)+forearm([(456,690),(360,488)],p)+cuff(452,676,-60)+fist(350,470,-40)
    if pose=="mug":
        return (L+sleeve([(434,566),(462,680)],p)+forearm([(462,680),(428,650)],p)+
                f'<rect x="378" y="588" width="74" height="84" rx="12" fill="#ffffff" stroke="#aeb7c9" stroke-width="4"/><path d="M452,604 Q482,610 478,636 Q474,660 452,654" fill="none" stroke="#aeb7c9" stroke-width="8"/>'
                f'<text x="415" y="622" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="11" font-weight="700" fill="#1d2230">Good code,</text><text x="415" y="638" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="11" font-weight="700" fill="#1d2230">better you</text><path d="M392,584 Q398,568 392,556 M412,584 Q418,566 412,552" fill="none" stroke="#c3cad9" stroke-width="3" stroke-linecap="round"/>'
                +fist(414,656,-90))
    if pose=="thumbs":
        return (L+sleeve([(434,566),(506,644)],p)+forearm([(506,644),(522,550)],p)+cuff(510,630,-80)+
                f'<rect x="498" y="506" width="50" height="48" rx="16" fill="#f7d9c8" stroke="{SKL}" stroke-width="3"/><rect x="507" y="466" width="17" height="48" rx="8.5" fill="#f7d9c8" stroke="{SKL}" stroke-width="3"/><path d="M502,524 L544,524 M502,538 L544,538" stroke="#e0a790" stroke-width="2.5"/>')

def tutor(eyes=("open","open"),brow="neutral",mouth_k="smile",pose="idle",w=600,h=800,vb="0 0 600 800",p="a"):
    S='transform="translate(300,456) scale(0.9) translate(-300,-456)"'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}" role="img" aria-label="The leetExpert DSA tutor">{defs(p)}'
            f'<g {S}><g id="hairBack">{hair_back(p)}</g></g><g id="body">{torso(p)}</g><g id="arms">{arms(pose,p)}</g>'
            f'<g {S}><g id="head">{head(eyes,brow,mouth_k,p)}<g id="glasses">{glasses(p)}</g></g><g id="hairFront">{hair_front(p)}</g><g id="brows" opacity=".92">{brows(brow)}</g></g></svg>')

def full_body(w=600,p="f"):
    import re
    inner=re.sub(r'^<svg[^>]*>','',tutor(pose="tablet",mouth_k="grin",p=p)).rsplit('</svg>',1)[0]
    legs=(f'<path d="M176,770 L424,770 L434,1010 L400,1450 L318,1450 L304,1020 L296,1020 L282,1450 L200,1450 L166,1010Z" fill="#2f3542" stroke="#1b1f28" stroke-width="3"/>'
          f'<path d="M300,820 L300,1020 M242,1030 L244,1440 M358,1030 L356,1440" stroke="#1b1f28" stroke-width="3" opacity=".7"/><path d="M190,1010 L230,1440 M410,1010 L370,1440" stroke="#465066" stroke-width="10" opacity=".5"/>'
          
          f'<path d="M196,1444 Q186,1488 226,1494 L292,1494 Q302,1466 286,1444Z" fill="#2b2f38" stroke="#15181f" stroke-width="3"/><path d="M404,1444 Q414,1488 374,1494 L308,1494 Q298,1466 314,1444Z" fill="#2b2f38" stroke="#15181f" stroke-width="3"/>'
          f'<path d="M206,1470 Q230,1462 262,1466 M394,1470 Q370,1462 338,1466" stroke="#4a5160" stroke-width="3" fill="none"/>')
    arm=(f'<path d="M150,690 Q146,780 160,850" fill="none" stroke="{SKL}" stroke-width="39" stroke-linecap="round"/><path d="M150,690 Q146,780 160,850" fill="none" stroke="#f7d9c8" stroke-width="34" stroke-linecap="round"/>'
         +cuff(150,694,5)+f'<path d="M144,846 Q138,880 154,894 Q174,904 182,880 Q186,854 174,842Z" fill="#f7d9c8" stroke="{SKL}" stroke-width="3"/><path d="M160,864 L162,890 M170,862 L172,886" stroke="#e0a790" stroke-width="2.2" stroke-linecap="round"/>')
    waist=f'<clipPath id="{p}waist"><path d="M0,0 L600,0 L600,690 L440,770 L436,812 L164,812 L160,770 L0,690Z"/></clipPath>'
    belt=f'<path d="M168,776 L432,776 L434,814 L166,814Z" fill="#232833"/><rect x="284" y="780" width="32" height="30" rx="5" fill="none" stroke="#fbbf24" stroke-width="4"/>'
    inner=f'{waist}<g clip-path="url(#{p}waist)">{inner}</g>{belt}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1510" width="{w}" height="{int(w*1510/600)}">{defs(p)}{legs}{inner}{arm}</svg>'
