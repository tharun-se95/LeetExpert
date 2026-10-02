import json,html,subprocess,re
W=json.load(open("words.json")); LEAD=0.3
AUD=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","vo.mp3"]))
norm=lambda t:t.lower().strip(".,?:!'\"")
def at(tok,nth=0,after=0.0,end=False):
    h=[x for x in W if norm(x["t"])==tok.lower() and x["s"]>=after]
    return round(LEAD+(h[nth]["e"] if end else h[nth]["s"]),2)
T={"list":at("list"),"n15":at("15"),"t21":at("21"),"trick":at("trick"),"left":at("left"),"right":at("right"),
 "s1":at("one",0,15.5),"sum1":at("ten"),"mv1":at("moves",0,19),"s2":at("three"),"sum2":at("twelve"),"mv2":at("still")+0.5,
 "s3":at("four"),"sum3":at("thirteen"),"s4":at("five"),"sum4":at("fourteen"),"s5":at("seven",0,28),"sum5":at("sixteen"),"big":at("too",0,30.5),
 "mv5":at("moves",0,32),"s6":at("seven",0,33),"sum6":at("fifteen",0,34),"found":at("found"),
 "why":at("why"),"if":at("if"),"biggest":at("biggest"),"drop":at("drop"),"every":at("every",0,44),
 "six":at("six"),"on":at("o",0,49),"zero":at("zero"),"leet":at("on",0,52),"clicks":at("clicks"),"link":at("link's"),"bio":at("bio",end=True)}
T["mv3"]=round(T["sum3"]+0.7,2); T["mv4"]=round(T["sum4"]+0.7,2)
TOTAL=round(T["bio"]+2.6,2)
print(json.dumps(T)); print("TOTAL",TOTAL)
A=[1,3,4,5,7,8,9]; X0=107; STEP=126; cx=lambda i:X0+55+i*STEP
cells="".join(f'<div class="cell" id="cell{i}" style="left:{X0+i*STEP}px"><span>{v}</span></div><div class="idx" style="left:{X0+i*STEP}px">{i}</div>' for i,v in enumerate(A))
SUMS=[(1,9,10,"too small","amb"),(3,9,12,"too small","amb"),(4,9,13,"too small","amb"),(5,9,14,"too small","amb"),(7,9,16,"too big","amb"),(7,8,15,"found it","teal")]
sums="".join(f'<div class="sum" id="sum{i}"><span class="eq">{a} + {b} = <b class="{c}">{s}</b></span><span class="tag {c}" id="tag{i}">{t}</span></div>' for i,(a,b,s,t,c) in enumerate(SUMS))
# captions
groups=[];cur=[]
for i,x in enumerate(W):
    cur.append(i)
    if (x["t"][-1] in ".?!," and len(cur)>=2) or len(cur)>=3 or x["t"][-1] in ".?!": groups.append(cur);cur=[]
if cur: groups.append(cur)
def wc(i):
    t=norm(W[i]["t"])
    if t in {"21","too","small","big","sixteen","twenty-one"}: return "ca"
    if t in {"15","fifteen","found","six","o","n","zero","trick","pointer"}: return "ct"
    return "cw"
cap="".join(f'<div class="cg" id="g{g}">'+" ".join(f'<span class="{wc(i)}" id="w{i}">{html.escape(W[i]["t"])}</span>' for i in ids)+'</div>' for g,ids in enumerate(groups))
import os
STILLS=sorted(f[:-4] for f in os.listdir("stills") if f.endswith(".png"))
def hfor(n): return 800 if n.startswith("fb-") else (700 if n.startswith("cu-") else 760)
RIG="".join(f'<img class="still" id="st-{n}" src="stills/{n}.png" alt="" style="height:{hfor(n)}px">' for n in STILLS)
# lip-sync events
def shape(word):
    w=norm(word)
    if re.search(r"o|u",w) and not re.search(r"e|i",w): return "o"
    if re.search(r"ee|i|e",w): return "e"
    return "wide"
ev=[(0,"rest")]
for i,x in enumerate(W):
    s,e=LEAD+x["s"],LEAD+x["e"]
    ev.append((s,shape(x["t"]))); 
    if e-s>0.22: ev.append(((s+e)/2,"small"))
    nxt=LEAD+W[i+1]["s"] if i+1<len(W) else 999
    ev.append((e,"rest" if nxt-e>0.12 else "small"))
ev.sort()
MOUTHS=["rest","small","wide","o","e","grin","flat","pout"]
mtracks={m:[] for m in MOUTHS}; prev=None
for t,sh in ev:
    if sh==prev: continue
    for m in MOUTHS: mtracks[m].append([round(t,3),1 if m==sh else 0])
    prev=sh
# expression beats: (time, eyes, brow, arm)
SB=[(0,"fb-01-standing"),(T["list"]-0.2,"cu-01-happy"),(T["t21"],"cu-05b-cringe"),(T["trick"]-0.4,"cu-02-explaining"),
    (T["left"]-0.3,"wu-03-point-side"),(T["s2"],"wu-02-pen-up"),(T["s4"],"wu-03-point-side"),(T["sum5"],"cu-04-surprised"),(T["mv5"],"wu-03b-point-left"),
    (T["found"],"wu-06-thumbs-up"),(T["why"],"wu-07-think-standing"),(T["drop"],"cu-06-skeptical"),(T["six"],"fb-05-celebrate"),(T["on"],"cu-07-confident"),
    (T["leet"],"fb-03-present"),(T["bio"]+1.0,"fb-01-standing")]
BE=[(0,"open","neutral","idle"),(T["list"]-0.2,"open","up","idle"),(T["t21"],"half","worry","idle"),(T["trick"]-0.4,"open","neutral","idle"),
    (T["left"]-0.3,"open","up","pen"),(T["s1"],"open","neutral","pen"),(T["sum5"],"wide","up","pen"),(T["mv5"],"open","focus","pen"),
    (T["found"],"happy","neutral","thumbs"),(T["why"],"half","focus","think"),(T["six"],"happy","up","thumbs"),(T["leet"],"open","up","pen"),
    (T["bio"]+1.0,"open","neutral","idle")]
def statetrack(prefix,names,idx):
    tr={n:[] for n in names}
    for b in BE:
        for n in names: tr[n].append([b[0],1 if b[idx]==n else 0])
    return {f"#{prefix}-{n}":v for n,v in tr.items()}
EYES=["open","half","closed","happy","wide"]; BROWS=["neutral","up","focus","worry"]; ARMS=["idle","pen","think","thumbs","tablet"]
etr=statetrack("eyes",EYES,1)
# blinks when eyes are "open": insert closed for 0.12s every ~3.7s
opens=[]
for j,b in enumerate(BE):
    e=BE[j+1][0] if j+1<len(BE) else TOTAL
    if b[1]=="open": opens.append((b[0]+1.2,e-0.6))
blinks=[]
for a,b in opens:
    t=a
    while t<b: blinks.append(round(t,2)); t+=3.7
for bt in blinks:
    etr["#eyes-open"]+= [[bt,0],[bt+0.12,1]]; etr["#eyes-closed"]+=[[bt,1],[bt+0.12,0]]
for k in etr: etr[k].sort()
STATE={**etr,**statetrack("b",BROWS,2),**statetrack("a",ARMS,3),**{f"#m-{m}":v for m,v in mtracks.items()}}
CSS=open("style.css").read()
H=f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: Two pointers</title><script src="gsap.min.js"></script><style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{TOTAL}">
<div id="world">
 <div class="top"><div class="brand" id="topbrand">leetExpert<span class="dot"></span></div><div class="tag2" id="topic">Two pointers</div></div>
 <div class="hud" id="hud"><div class="tgt" id="tgt">target = <b>15</b></div><div class="brute" id="brute">every pair: <b>21</b> checks</div></div>
 <div class="arr" id="arr">{cells}
  <div class="ptr L" id="pL">L</div><div class="ptr R" id="pR">R</div></div>
 <div class="sums">{sums}</div>
 <div class="why" id="why"><span id="whyA">1 + biggest (9) = 10 &lt; 15</span><span id="whyB">→ 1 can't pair with anything. Drop it.</span></div>
 <div class="score" id="score"><div class="sc1"><b id="nChecks">0</b><span>two-pointer checks</span></div><div class="vs" id="vs">vs <b>21</b> brute force</div>
  <div class="badges"><span class="bd" id="bd1">O(n) time</span><span class="bd" id="bd2">O(1) extra memory</span></div></div>
 <div class="lock" id="lock"><div class="lbrand">leetExpert<span class="ldot"></span></div><div class="lline" id="lline">Step through it, line by line.</div><div class="lcta" id="lcta">Try it free <span id="larr">→</span> link in bio</div></div>
 <div class="tutor" id="tutor">{RIG}</div>
</div>
<div class="caps">{cap}</div>
<audio id="vo" src="vo.mp3" data-start="{LEAD}" data-duration="{round(AUD,2)}" data-track-index="1"></audio>
</div>
<script>
(function(){{
const tl=gsap.timeline({{paused:true}});
const T={json.dumps(T)}, END={TOTAL}, W={json.dumps([round(LEAD+x["s"],2) for x in W])}, G={json.dumps(groups)}, STATE={json.dumps(STATE)};
function track(sel,init,pts){{ gsap.set(sel,init); let prev=0; const kf=[];
  pts.forEach(([t,v,d,e])=>{{ kf.push(Object.assign({{}},v,{{duration:d||0.001,ease:e||"power2.out",delay:Math.max(0,t-prev)}})); prev=t+(d||0.001); }});
  if(kf.length) tl.to(sel,{{keyframes:kf}},0); }}
// rig layers: instant switches
const SB={json.dumps(SB)};
const names=[...new Set(SB.map(x=>x[1]))];
names.forEach(n=>{{ const pts=[]; let on=SB[0][1]===n;
  SB.forEach(([t,m],j)=>{{ if(j===0) return; if(m===n && !on){{ pts.push([t,{{autoAlpha:1,scale:1}},0.18,"power2.out"]); on=true; }} else if(m!==n && on){{ pts.push([t,{{autoAlpha:0}},0.12,"none"]); on=false; }} }});
  track("#st-"+n,{{autoAlpha:SB[0][1]===n?1:0,scale:1,xPercent:-50,transformOrigin:"50% 100%"}},pts); }});
gsap.set(".still",{{autoAlpha:0,xPercent:-50}}); gsap.set("#st-"+SB[0][1],{{autoAlpha:1}});
const push=[]; for(let j=0;j<SB.length;j++){{ const a=SB[j][0], b=(j+1<SB.length?SB[j+1][0]:END);
  if(j>0) push.push([a,{{scale:1}},0.001,"none"]); push.push([a+0.002,{{scale:1.025}},Math.max(0.01,b-a-0.01),"none"]); }}
track("#tutor",{{scale:1,transformOrigin:"50% 100%"}},push);
// hook
track("#topic",{{autoAlpha:0,y:-10}},[[T.list-0.3,{{autoAlpha:1,y:0}},0.35],[T.leet-0.2,{{autoAlpha:0}},0.3],[END-1.3,{{autoAlpha:0}},0.01]]);
for(let i=0;i<7;i++) track("#cell"+i,{{autoAlpha:0,scale:0.6,backgroundColor:"#0e1520",borderColor:"#263248",opacity:0}},[[T.list+i*0.06,{{autoAlpha:1,scale:1}},0.35,"back.out(2)"]].concat(
  i===0?[[T.mv1,{{opacity:0.28}},0.3]]:i===1?[[T.mv2,{{opacity:0.28}},0.3]]:i===2?[[T.mv3,{{opacity:0.28}},0.3]]:i===3?[[T.mv4,{{opacity:0.28}},0.3]]:i===6?[[T.mv5+0.2,{{opacity:0.28}},0.3]]:[]).concat(
  (i===4||i===5)?[[T.sum6,{{backgroundColor:"#0f3d37",borderColor:"#5eead4"}},0.3]]:[]).concat(
  (i<4||i===6)?[[T.every,{{opacity:0.5}},0.15,"none"],[T.every+0.2,{{opacity:0.28}},0.3]]:[]).concat(
  [[T.leet-0.2,{{autoAlpha:0}},0.3],[END-1.2,{{autoAlpha:1,opacity:1,scale:1,backgroundColor:"#0e1520",borderColor:"#263248"}},0.01],[END-1.19,{{autoAlpha:0}},0.4]]));
gsap.set(".idx",{{opacity:0}}); track(".idx",{{opacity:0}},[[T.list+0.4,{{opacity:1}},0.4],[T.leet-0.2,{{opacity:0}},0.3]]);
track("#hud",{{autoAlpha:0}},[[T.n15-0.1,{{autoAlpha:1}},0.3],[T.leet-0.2,{{autoAlpha:0}},0.3]]);
track("#tgt",{{scale:0.7}},[[T.n15-0.1,{{scale:1}},0.4,"back.out(2)"]]);
track("#brute",{{autoAlpha:0,x:20}},[[T.t21,{{autoAlpha:1,x:0}},0.35,"power3.out"]]);
// pointers
const PX=i=>{X0}+i*{STEP};
track("#pL",{{autoAlpha:0,x:PX(0)}},[[T.left,{{autoAlpha:1}},0.3],[T.mv1,{{x:PX(1)}},0.4,"power3.inOut"],[T.mv2,{{x:PX(2)}},0.4,"power3.inOut"],[T.mv3,{{x:PX(3)}},0.4,"power3.inOut"],[T.mv4,{{x:PX(4)}},0.4,"power3.inOut"],[T.leet-0.2,{{autoAlpha:0}},0.3],[END-1.2,{{x:PX(0)}},0.01]]);
track("#pR",{{autoAlpha:0,x:PX(6)}},[[T.right,{{autoAlpha:1}},0.3],[T.mv5,{{x:PX(5)}},0.45,"power3.inOut"],[T.leet-0.2,{{autoAlpha:0}},0.3],[END-1.2,{{x:PX(6)}},0.01]]);
// sums readout, one per step
const SS=[["s1","sum1","s2"],["s2","sum2","s3"],["s3","sum3","s4"],["s4","sum4","s5"],["s5","sum5","s6"],["s6","sum6","why"]];
SS.forEach(([a,b,c],i)=>{{ track("#sum"+i,{{autoAlpha:0,y:16}},[[T[a],{{autoAlpha:1,y:0}},0.3],[T[c]-0.15,{{autoAlpha:0,y:-10}},0.25]]);
  track("#tag"+i,{{autoAlpha:0,scale:0.7}},[[T[b],{{autoAlpha:1,scale:1}},0.35,"back.out(2.4)"]]); }});
const nC={{v:0}}, eC=document.getElementById("nChecks");
tl.fromTo(nC,{{v:0}},{{v:6,duration:0.6,ease:"power1.out",onUpdate:()=>{{eC.textContent=Math.round(nC.v);}}}},T.six);
// why (breather)
track("#why",{{autoAlpha:0}},[[T.if,{{autoAlpha:1}},0.4],[T.six-0.2,{{autoAlpha:0}},0.3]]);
track("#whyA",{{opacity:0}},[[T.if,{{opacity:1}},0.4]]);
track("#whyB",{{opacity:0,x:-12}},[[T.drop-0.1,{{opacity:1,x:0}},0.35,"power3.out"]]);
// payoff score
track("#score",{{autoAlpha:0,y:24}},[[T.six-0.1,{{autoAlpha:1,y:0}},0.4,"power3.out"],[T.leet-0.2,{{autoAlpha:0}},0.3]]);
track("#vs",{{opacity:0}},[[T.six+0.9,{{opacity:1}},0.3]]);
track("#bd1",{{autoAlpha:0,scale:0.7}},[[T.on,{{autoAlpha:1,scale:1}},0.35,"back.out(2.4)"]]);
track("#bd2",{{autoAlpha:0,scale:0.7}},[[T.zero,{{autoAlpha:1,scale:1}},0.35,"back.out(2.4)"]]);
// CTA lockup, then loop back
track("#topbrand",{{opacity:1}},[[T.leet-0.2,{{opacity:0}},0.3],[END-1.3,{{opacity:1}},0.4]]);
track("#lock",{{autoAlpha:0,y:20}},[[T.leet,{{autoAlpha:1,y:0}},0.45,"power3.out"],[END-1.4,{{autoAlpha:0,y:-16}},0.35]]);
track("#lline",{{opacity:0}},[[T.leet+0.9,{{opacity:1}},0.4]]);
track("#lcta",{{autoAlpha:0,scale:0.8}},[[T.link,{{autoAlpha:1,scale:1}},0.4,"back.out(2)"]]);
track("#larr",{{x:0}},[[T.link+0.5,{{x:12}},0.35,"sine.inOut"],[T.link+0.85,{{x:0}},0.35,"sine.inOut"],[T.link+1.2,{{x:12}},0.35,"sine.inOut"],[T.link+1.55,{{x:0}},0.35,"sine.inOut"]]);
// captions (stop when the lockup takes over)
G.forEach((ids,g)=>{{ const s=W[ids[0]]; if(s>=T.leet-0.05){{ gsap.set("#g"+g,{{autoAlpha:0}}); return; }}
  const e=Math.min((g+1<G.length)?W[G[g+1][0]]:END, T.leet-0.1);
  track("#g"+g,{{autoAlpha:0}},[[s-0.05,{{autoAlpha:1}},0.08,"none"],[e-0.06,{{autoAlpha:0}},0.06,"none"]]);
  ids.forEach(i=>track("#w"+i,{{opacity:0.55}},[[W[i],{{opacity:1}},0.08,"none"]])); }});
window.__timelines["main"]=tl;
}})();
</script></body></html>'''
open("index.html","w").write(H); json.dump({"TOTAL":TOTAL,"T":T},open("timing.json","w"))
