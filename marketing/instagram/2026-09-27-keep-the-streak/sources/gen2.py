import json,re,hashlib
W=json.load(open('words.json')); LEAD=0.4
norm=lambda t:t.lower().strip(".,?:!'\"")
def at(tok,after=0): return round(LEAD+[x for x in W if norm(x['t'])==tok and x['s']>=after][0]['s'],2)
TA=dict(learning=at('learning'),every=at('every'),lights=at('lights'),grind=at('you',4),one=at('just'),today=at('today'),come=at('come'),
        practice=at('practice',9),leet=at('leet'),inter=at('interactive'),link=at("link's"),end=round(LEAD+W[-1]['e'],2))
R=round(TA['end']+1.8,2); TOTAL=round(R+1.0,2)
COLS,ROWS,C,G=15,7,44,8; X0=(1080-(COLS*(C+G)-G))//2; Y0=720
def h(i): return int(hashlib.md5(str(i).encode()).hexdigest(),16)%100
cells=[]
for c in range(COLS):
    for r in range(ROWS):
        i=c*ROWS+r; on=(c>=COLS-4) or (h(i)<35+c*4.5)
        cells.append((i,c,r,0 if not on else (1+h(i*7)%3 if c<COLS-4 else 3)))
LV=["#1f2a3a","#0f5c52","#138f7f","#5eead4"]
order=[(i,l) for i,c,r,l in cells if l>0]; t0,t1=TA['every'],TA['one']-0.3
litT={i:round(t0+k*(t1-t0)/len(order),3) for k,(i,l) in enumerate(order)}
cols={c:min(litT[i] for i,cc,r,l in cells if cc==c and l>0) for c in range(COLS)}
html_cells="".join(f'<div class="sq" id="q{i}" style="left:{X0+c*(C+G)}px;top:{Y0+r*(C+G)}px"></div>' for i,c,r,l in cells)
import os
STILLS=sorted(f[:-4] for f in os.listdir("stills") if f.endswith(".png"))
def hfor(n): return 800 if n.startswith("fb-") else (700 if n.startswith("cu-") else 760)
RIG="".join(f'<img class="still" id="st-{n}" src="stills/{n}.png" alt="" style="height:{hfor(n)}px">' for n in STILLS)
def shape(w):
    w=norm(w)
    if re.search(r"o|u",w) and not re.search(r"e|i",w): return "o"
    if re.search(r"e|i",w): return "e"
    return "wide"
ev=[(0,"rest")]
for i,x in enumerate(W):
    a,b=LEAD+x["s"],LEAD+x["e"]; ev.append((a,shape(x["t"])))
    if b-a>0.22: ev.append(((a+b)/2,"small"))
    nxt=LEAD+W[i+1]["s"] if i+1<len(W) else 99
    ev.append((b,"rest" if nxt-b>0.12 else "small"))
ev.sort(); MOUTHS=["rest","small","wide","o","e","grin","flat","pout"]; STATE={f"#m-{m}":[[0,1 if m=="rest" else 0]] for m in MOUTHS}; prev="rest"
for t,sh in ev:
    if sh==prev: continue
    for m in MOUTHS: STATE[f"#m-{m}"].append([round(t,3),1 if m==sh else 0]); 
    prev=sh
SB=[(0,"wu-13-coffee"),(TA['learning']-0.1,"cu-02-explaining"),(TA['every'],"wu-13-coffee"),(TA['grind'],"wu-10-shrug"),(TA['one'],"cu-01-happy"),
    (TA['today'],"wu-06-thumbs-up"),(TA['come'],"cu-09-wink"),(TA['practice'],"fb-03-present"),(TA['end']+0.4,"cu-11-laughing"),(R,"wu-13-coffee")]
BE=[(0,"open","neutral","mug"),(TA['learning']-0.1,"open","up","mug"),(TA['every'],"open","neutral","mug"),(TA['today'],"happy","up","thumbs"),
    (TA['practice'],"open","up","pen"),(TA['end']+0.4,"happy","neutral","pen"),(R,"open","neutral","mug")]
def st(prefix,names,idx):
    for n in names: STATE[f"#{prefix}-{n}"]=[[b[0],1 if b[idx]==n else 0] for b in BE]
st("eyes",["open","half","closed","happy","wide"],1); st("b",["neutral","up","focus","worry"],2); st("a",["idle","pen","think","thumbs","tablet","mug"],3)
for bt in [3.2,5.6,9.3,R+0.4]:
    STATE["#eyes-open"]+=[[bt,0],[bt+0.12,1]]; STATE["#eyes-closed"]+=[[bt,1],[bt+0.12,0]]
for k in STATE: STATE[k].sort()
CSS=open("style.css").read()
H=f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: Keep the streak</title><script src="gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{TOTAL}">
 <div class="top"><div class="brand big">leetExpert<span class="dot"></span></div><div class="tag2">DSA practice</div></div>
 <div class="head" id="head"><div class="eyebrow" id="eb">Learning DSA?</div>
  <div class="hl" id="hA">Every practice day <span class="t">lights a square.</span></div><div class="hl" id="hB">One problem <span class="t">today.</span></div><div class="hl" id="hC">Come back <span class="t">tomorrow.</span></div>
  <div class="sub" id="sub">No five-hour grind needed.</div></div>
 <div id="board"><div class="months"><span>Jul</span><span>Aug</span><span>Sep</span></div><div class="grid">{html_cells}</div>
  <div class="legend">Less <i style="background:{LV[0]}"></i><i style="background:{LV[1]}"></i><i style="background:{LV[2]}"></i><i style="background:{LV[3]}"></i> More</div>
  <div class="streak" id="streak"><div class="sl">current streak</div><div class="sv"><b id="days">0</b> days</div></div></div>
 <div class="lock" id="lock"><div class="lbrand">leetExpert<span class="ldot"></span></div><div class="lline" id="lline">Interactive DSA, one problem a day.</div><div class="lcta" id="lcta">Try leetExpert free <span id="arr">→</span> link in bio</div></div>
 <div class="tutor" id="tutor">{RIG}</div>
 <audio id="mix" src="mix.mp3" data-start="0" data-duration="{TOTAL}" data-track-index="1"></audio>
</div>
<script>
(function(){{
const tl=gsap.timeline({{paused:true}}); const TA={json.dumps(TA)}, R={R}, END={TOTAL};
function track(sel,init,pts){{ gsap.set(sel,init); let prev=0; const kf=[];
  pts.forEach(([t,v,d,e])=>{{ kf.push(Object.assign({{}},v,{{duration:d||0.001,ease:e||"power2.out",delay:Math.max(0,t-prev)}})); prev=t+(d||0.001); }});
  if(kf.length) tl.to(sel,{{keyframes:kf}},0); }}
const STATE={json.dumps(STATE)};
const SB={json.dumps(SB)};
const names=[...new Set(SB.map(x=>x[1]))];
names.forEach(n=>{{ const pts=[]; let on=SB[0][1]===n;
  SB.forEach(([t,m],j)=>{{ if(j===0) return; if(m===n && !on){{ pts.push([t,{{autoAlpha:1,scale:1}},0.18,"power2.out"]); on=true; }} else if(m!==n && on){{ pts.push([t,{{autoAlpha:0}},0.12,"none"]); on=false; }} }});
  track("#st-"+n,{{autoAlpha:SB[0][1]===n?1:0,scale:1,xPercent:-50,transformOrigin:"50% 100%"}},pts); }});
gsap.set(".still",{{autoAlpha:0,xPercent:-50}}); gsap.set("#st-"+SB[0][1],{{autoAlpha:1}});
const push=[]; for(let j=0;j<SB.length;j++){{ const a=SB[j][0], b=(j+1<SB.length?SB[j+1][0]:END);
  if(j>0) push.push([a,{{scale:1}},0.001,"none"]); push.push([a+0.002,{{scale:1.025}},Math.max(0.01,b-a-0.01),"none"]); }}
track("#tutor",{{scale:1,transformOrigin:"50% 100%"}},push);
const LV={json.dumps(LV)}, LIT={json.dumps({str(i):[litT[i],l] for i,l in order})};
Object.entries(LIT).forEach(([i,[t,l]])=>track("#q"+i,{{backgroundColor:LV[0],scale:1}},[[t,{{backgroundColor:LV[l],scale:1.18}},0.12],[t+0.12,{{scale:1}},0.2,"power2.inOut"],[R-0.2,{{backgroundColor:LV[0]}},0.01,"none"]]));
track("#eb",{{autoAlpha:1}},[[TA.grind-0.2,{{autoAlpha:0}},0.25],[R,{{autoAlpha:1}},0.5]]);
track("#hA",{{autoAlpha:1,y:0}},[[TA.one-0.2,{{autoAlpha:0,y:-20}},0.35],[R,{{autoAlpha:1,y:0}},0.5]]);
track("#hB",{{autoAlpha:0,y:20}},[[TA.one,{{autoAlpha:1,y:0}},0.4,"power3.out"],[TA.come-0.2,{{autoAlpha:0,y:-20}},0.3]]);
track("#hC",{{autoAlpha:0,y:20}},[[TA.come,{{autoAlpha:1,y:0}},0.4,"power3.out"],[TA.practice-0.2,{{autoAlpha:0}},0.3]]);
track("#sub",{{autoAlpha:0,y:10}},[[TA.grind,{{autoAlpha:1,y:0}},0.35],[TA.one-0.2,{{autoAlpha:0}},0.3]]);
track("#board",{{autoAlpha:1}},[[TA.practice-0.2,{{autoAlpha:0}},0.35],[R,{{autoAlpha:1}},0.5]]);
track("#streak",{{autoAlpha:0,y:16}},[[TA.grind,{{autoAlpha:1,y:0}},0.4],[R-0.2,{{autoAlpha:0}},0.01]]);
const d={{v:0}}, eD=document.getElementById("days");
tl.fromTo(d,{{v:0}},{{v:28,duration:TA.one-0.3-TA.grind,ease:"none",onUpdate:()=>{{eD.textContent=Math.round(d.v);}}}},TA.grind);
track("#lock",{{autoAlpha:0,y:20}},[[TA.practice,{{autoAlpha:1,y:0}},0.45,"power3.out"],[R-0.3,{{autoAlpha:0,y:-16}},0.35]]);
track("#lline",{{opacity:0}},[[TA.inter,{{opacity:1}},0.4]]);
track("#lcta",{{autoAlpha:0,scale:0.85}},[[TA.link,{{autoAlpha:1,scale:1}},0.4,"back.out(2)"]]);
track("#arr",{{x:0}},[[TA.link+0.5,{{x:10}},0.3,"sine.inOut"],[TA.link+0.8,{{x:0}},0.3,"sine.inOut"],[TA.link+1.1,{{x:10}},0.3,"sine.inOut"],[TA.link+1.4,{{x:0}},0.3,"sine.inOut"]]);
window.__timelines["main"]=tl;
}})();
</script></body></html>'''
open("index.html","w").write(H)
json.dump({"TA":TA,"R":R,"TOTAL":TOTAL,"cols":cols},open("timing.json","w")); print(TA,R,TOTAL)
