import json,re,html
W=json.load(open('words.json')); LEAD=0.4
norm=lambda t:t.lower().strip(".,?:!'\"")
def at(tok,after=0.0,end=False):
    h=[x for x in W if norm(x['t'])==tok and x['s']>=after]
    return round(LEAD+(h[0]['e'] if end else h[0]['s']),2)
A={k:at(*v) if isinstance(v,tuple) else at(v) for k,v in dict(
 same=("same",3), thousand=("thousand",5), why=("why",10), notx=("not",11), ten=("ten",13), half="half", quarter="quarter", nineteen="nineteen",
 heres=("here's",25), starts="starts", match="match", On=("o",34), loop=("loop",37), squared=("squared",40),
 hashtable=("hash",44), coat=("coat",46), ticket="ticket", hook=("hook",50), hashes="hashes", points="points", jump=("jump",56), O1=("o",58), average=("average",59),
 sometimes="sometimes", collision="collision", further="further", promise="promise",
 but=("but",69), first="first", second="second", third="third", fourth="fourth", unhash="unhashable",
 tell="tell", swap="swap", twosum=("two",111), findd="finding", seen=("seen",114), dicts="dictionaries",
 quick="quick", teaching="teaching", links="link's").items()}
A['end']=round(LEAD+W[-1]['e'],2); R=round(A['end']+1.8,2); TOTAL=round(R+1.0,2)
print(A); print("TOTAL",TOTAL)
def shape(w):
    w=norm(w)
    if re.search(r"o|u",w) and not re.search(r"e|i",w): return "o"
    if re.search(r"e|i",w): return "e"
    return "wide"
ev=[(0,"rest")]
for i,x in enumerate(W):
    a,b=LEAD+x["s"],LEAD+x["e"]; ev.append((a,shape(x["t"])))
    if b-a>0.22: ev.append(((a+b)/2,"small"))
    nxt=LEAD+W[i+1]["s"] if i+1<len(W) else 999
    ev.append((b,"rest" if nxt-b>0.12 else "small"))
ev.sort(); MO=["rest","small","wide","o","e","grin","flat","pout"]; ST={f"#m-{m}":[[0,1 if m=="rest" else 0]] for m in MO}; pv="rest"
for t,sh in ev:
    if sh==pv: continue
    for m in MO: ST[f"#m-{m}"].append([round(t,3),1 if m==sh else 0])
    pv=sh
BE=[(0,"open","up","idle"),(A['ten'],"open","neutral","idle"),(A['half'],"wide","worry","idle"),(A['quarter'],"happy","up","thumbs"),
    (A['heres'],"open","neutral","pen"),(A['squared'],"wide","worry","pen"),(A['hashtable'],"open","up","pen"),(A['jump'],"happy","up","pen"),
    (A['sometimes'],"half","focus","think"),(A['but'],"open","focus","idle"),(A['fourth'],"open","neutral","pen"),(A['unhash'],"wide","worry","pen"),
    (A['tell'],"open","up","pen"),(A['swap'],"happy","up","thumbs"),(A['dicts'],"open","neutral","pen"),(A['quick'],"half","up","think"),
    (A['teaching'],"open","up","pen"),(A['end']+0.3,"happy","neutral","pen"),(R,"open","up","idle")]
SB=[(0,"fb-02-walk-in"),(A['ten'],"wu-05-tablet"),(A['half'],"cu-04-surprised"),(A['quarter'],"cu-08-excited"),
    (A['heres'],"wu-03-point-side"),(A['squared'],"wu-08-facepalm"),(A['hashtable'],"cu-02-explaining"),(A['ticket'],"wu-12-blank-card"),(A['jump'],"cu-09-wink"),
    (A['sometimes'],"cu-03-thinking"),(A['but'],"wu-09-arms-crossed"),(A['fourth'],"wu-10-shrug"),(A['unhash'],"cu-05b-cringe"),
    (A['tell'],"wu-02-pen-up"),(A['swap'],"fb-05-celebrate"),(A['dicts'],"wu-13-coffee"),(A['quick'],"wu-07-think-standing"),
    (A['teaching'],"fb-03-present"),(A['end']+0.3,"cu-11-laughing"),(R,"fb-02-walk-in")]
def st(prefix,names,idx):
    for n in names: ST[f"#{prefix}-{n}"]=[[b[0],1 if b[idx]==n else 0] for b in BE]
st("eyes",["open","half","closed","happy","wide"],1); st("b",["neutral","up","focus","worry"],2); st("a",["idle","pen","think","thumbs","tablet","mug"],3)
opens=[(BE[j][0]+1.0,(BE[j+1][0] if j+1<len(BE) else TOTAL)-0.5) for j in range(len(BE)) if BE[j][1]=="open"]
for a,b in opens:
    t=a
    while t<b:
        ST["#eyes-open"]+=[[round(t,2),0],[round(t+0.12,2),1]]; ST["#eyes-closed"]+=[[round(t,2),1],[round(t+0.12,2),0]]; t+=3.9
for k in ST: ST[k].sort()
groups=[];cur=[]
for i,x in enumerate(W):
    cur.append(i)
    if (x["t"][-1] in ".?!," and len(cur)>=2) or len(cur)>=3 or x["t"][-1] in ".?!": groups.append(cur);cur=[]
if cur: groups.append(cur)
HOT={"thousand","slower","half","second","squared","collision","unhashable","not","free","memory","six","five"}
COOL={"set","set?","quarter","millisecond","faster","jump","average","hash","swap","dictionaries","keys","leet","expert"}
def wc(i):
    t=norm(W[i]["t"])
    return "ca" if t in HOT else ("ct" if t in COOL else "cw")
cap="".join(f'<div class="cg" id="g{g}">'+" ".join(f'<span class="{wc(i)}" id="w{i}">{html.escape(W[i]["t"])}</span>' for i in ids)+'</div>' for g,ids in enumerate(groups))
import os
STILLS=sorted(f[:-4] for f in os.listdir("stills") if f.endswith(".png"))
def hfor(n): return 800 if n.startswith("fb-") else (700 if n.startswith("cu-") else 760)
RIG="".join(f'<img class="still" id="st-{n}" src="stills/{n}.png" alt="" style="height:{hfor(n)}px">' for n in STILLS)
scan="".join(f'<div class="sc" id="sc{i}" style="left:{i*88}px">{v}</div>' for i,v in enumerate([8,3,15,4,23,16,42,9,11,7]))
slots="".join(f'<div class="slot" id="sl{i}" style="left:{i*112}px"></div><div class="si" style="left:{i*112}px">{i}</div>' for i in range(8))
nn="".join(f'<div class="nn" id="nn{i}"></div>' for i in range(64))
H=f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: list vs set</title><script src="gsap.min.js"></script><style>__CSS__</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{TOTAL}">
 <div class="top"><div class="brand">leetExpert<span class="dot"></span></div><div class="tag2" id="topic">Python performance</div></div>
 <div class="stage">
  <div class="pan" id="P1">
   <div class="cards"><div class="card" id="cA"><div class="ct1">list</div><pre><span class="k">seen</span> = <b class="amb">list</b>(nums)
<span class="kw">if</span> x <span class="kw">in</span> seen:</pre></div>
   <div class="card" id="cB"><div class="ct1">set</div><pre><span class="k">seen</span> = <b class="tl">set</b>(nums)
<span class="kw">if</span> x <span class="kw">in</span> seen:</pre></div></div>
   <div class="stamp" id="stamp">one is <b>1,000×</b> slower</div>
   <div class="promise"><span class="chip" id="pr1">why it happens</span><span class="chip" id="pr2">when NOT to use it</span></div>
   <div class="race" id="race"><div class="rl">10,000 numbers × 10,000 lookups <i>(our test run)</i></div>
    <div class="bar"><span class="bl">list</span><div class="track"><div class="fill amb" id="fA"></div></div><b class="rv amb" id="vA">0.51 s</b></div>
    <div class="bar"><span class="bl">set</span><div class="track"><div class="fill tl" id="fB"></div></div><b class="rv tl" id="vB">0.27 ms</b></div>
    <div class="x19" id="x19">≈ <b>1,900×</b> faster</div></div>
  </div>
  <div class="pan" id="P3"><div class="h2">What <code>in</code> does on a list</div>
   <div class="scanrow">{scan}<div class="sweep" id="sweep"></div></div><div class="find">looking for <b>42</b></div>
   <div class="big amb" id="on">O(n) <span>per lookup</span></div>
   <div class="nnw" id="nnw"><div class="nngrid">{nn}</div><div class="nnl"><b class="amb">O(n²)</b><span>hiding in one line</span></div></div></div>
  <div class="pan" id="P4"><div class="h2">A set is a <span class="tl">hash table</span></div>
   <div class="ticket" id="tk">value <b>42</b> <span class="arrow">→</span> hash(42) <span class="arrow">→</span> slot <b class="tl">2</b></div>
   <div class="slots">{slots}<div class="coat" id="coat42">42</div><div class="coat c2" id="coat17">17</div></div>
   <div class="big tl" id="o1">O(1) <span>on average</span></div>
   <div class="coll" id="coll">collision: <b>17</b> also hashes to slot 2 → next free slot</div>
   <div class="prom" id="prom">average O(1), not a promise</div></div>
  <div class="pan" id="P5"><div class="h2">But sets aren't free</div>
   <div class="tr" id="t1"><b>1</b><div><div class="tt">Memory</div><div class="mem"><span>list</span><div class="mb" id="mb1"></div></div><div class="mem"><span>set</span><div class="mb amb" id="mb2"></div></div><div class="ts">set's table ≈ 6.6× the list (10k ints)</div></div></div>
   <div class="tr" id="t2"><b>2</b><div><div class="tt">Build cost</div><div class="ts">building it ≈ 5 full list scans → worth it after a few lookups</div></div></div>
   <div class="tr" id="t3"><b>3</b><div><div class="tt">No order, no duplicates</div><div class="code1">set([3, 1, 3, 2]) → {{1, 2, 3}}</div></div></div>
   <div class="tr" id="t4"><b>4</b><div><div class="tt">Hashable only</div><div class="ts">numbers, strings, tuples ✓ · lists ✗</div>
    <div class="term" id="term"><div>&gt;&gt;&gt; {{[1, 2]}}</div><div class="err">TypeError: unhashable type: 'list'</div></div></div></div></div>
  <div class="pan" id="P6"><div class="h2">Interview tell</div>
   <div class="spot" id="spot"><code>in</code> + <span class="amb">list</span> + loop <span class="arrow">→</span> <b class="amb">hidden O(n²)</b></div>
   <div class="swapc" id="swapc">Say it out loud, then <b class="tl">swap in a set</b></div>
   <div class="uses"><span class="chip2" id="u1">two-sum</span><span class="chip2" id="u2">find duplicates</span><span class="chip2" id="u3">the "seen" pattern</span></div>
   <div class="dictc" id="dictc">dict keys: same hash table, same speed</div></div>
  <div class="pan" id="P7"><div class="qt">Quick test</div><div class="qq">Check <b>one</b> value, just <b>once</b>.</div>
   <div class="opts"><span class="opt" id="oL">list</span><span class="or">or</span><span class="opt" id="oS">set</span></div><div class="cm">Answer in the comments</div></div>
  <div class="lock" id="lock"><div class="lbrand">leetExpert<span class="ldot"></span></div><div class="lline" id="lline">The interactive DSA course.<br>See every step run.</div><div class="lcta" id="lcta">Try leetExpert free <span id="arr">→</span> link in bio</div></div>
 </div>
 <div class="tutor" id="tutor">{RIG}</div>
 <div class="caps">{cap}</div>
 <audio id="mix" src="mix.mp3" data-start="0" data-duration="{TOTAL}" data-track-index="1"></audio>
</div>
<script>
(function(){{
const tl=gsap.timeline({{paused:true}}); const A={json.dumps(A)}, R={R}, END={TOTAL}, WS={json.dumps([round(LEAD+x["s"],2) for x in W])}, G={json.dumps(groups)};
function track(sel,init,pts){{ gsap.set(sel,init); let prev=0; const kf=[];
  pts.forEach(([t,v,d,e])=>{{ kf.push(Object.assign({{}},v,{{duration:d||0.001,ease:e||"power2.out",delay:Math.max(0,t-prev)}})); prev=t+(d||0.001); }});
  if(kf.length) tl.to(sel,{{keyframes:kf}},0); }}
const ST={json.dumps(ST)};
const SB={json.dumps(SB)};
const names=[...new Set(SB.map(x=>x[1]))];
names.forEach(n=>{{ const pts=[]; let on=SB[0][1]===n;
  SB.forEach(([t,m],j)=>{{ if(j===0) return; if(m===n && !on){{ pts.push([t,{{autoAlpha:1,scale:1}},0.18,"power2.out"]); on=true; }} else if(m!==n && on){{ pts.push([t,{{autoAlpha:0}},0.12,"none"]); on=false; }} }});
  track("#st-"+n,{{autoAlpha:SB[0][1]===n?1:0,scale:1,xPercent:-50,transformOrigin:"50% 100%"}},pts); }});
gsap.set(".still",{{autoAlpha:0,xPercent:-50}}); gsap.set("#st-"+SB[0][1],{{autoAlpha:1}});
// slow camera push on the tutor between cuts (resets on each cut)
const push=[]; for(let j=0;j<SB.length;j++){{ const a=SB[j][0], b=(j+1<SB.length?SB[j+1][0]:END);
  if(j>0) push.push([a,{{scale:1}},0.001,"none"]); push.push([a+0.002,{{scale:1.025}},Math.max(0.01,b-a-0.01),"none"]); }}
track("#tutor",{{scale:1,transformOrigin:"50% 100%"}},push);
const IN=(t,d)=>[t,{{autoAlpha:1,y:0}},d||0.4,"power3.out"], OUT=(t)=>[t,{{autoAlpha:0}},0.3];
// panels
track("#P1",{{autoAlpha:1}},[OUT(A.heres-0.3),[R,{{autoAlpha:1}},0.5]]);
track("#P3",{{autoAlpha:0}},[[A.heres-0.2,{{autoAlpha:1}},0.35],OUT(A.hashtable-0.3)]);
track("#P4",{{autoAlpha:0}},[[A.hashtable-0.2,{{autoAlpha:1}},0.35],OUT(A.but-0.3)]);
track("#P5",{{autoAlpha:0}},[[A.but-0.2,{{autoAlpha:1}},0.35],OUT(A.tell-0.5)]);
track("#P6",{{autoAlpha:0}},[[A.tell-0.4,{{autoAlpha:1}},0.35],OUT(A.quick-0.3)]);
track("#P7",{{autoAlpha:0}},[[A.quick-0.2,{{autoAlpha:1}},0.35],OUT(A.teaching-0.3)]);
track("#lock",{{autoAlpha:0,y:20}},[IN(A.teaching,0.45),[R-0.4,{{autoAlpha:0,y:-16}},0.35]]);
track("#lline",{{opacity:0}},[[A.teaching+1.2,{{opacity:1}},0.4]]);
track("#lcta",{{autoAlpha:0,scale:0.85}},[[A.links,{{autoAlpha:1,scale:1}},0.4,"back.out(2)"]]);
track("#arr",{{x:0}},[[A.links+0.5,{{x:10}},0.3,"sine.inOut"],[A.links+0.8,{{x:0}},0.3,"sine.inOut"],[A.links+1.1,{{x:10}},0.3,"sine.inOut"],[A.links+1.4,{{x:0}},0.3,"sine.inOut"]]);
track("#topic",{{opacity:1}},[[A.teaching-0.2,{{opacity:0}},0.3],[R,{{opacity:1}},0.4]]);
// P1 hook + race
track(".amb.pulse",{{}},[]);
track("#stamp",{{autoAlpha:0,scale:0.7}},[[A.thousand,{{autoAlpha:1,scale:1}},0.4,"back.out(2.4)"],[A.ten-0.3,{{autoAlpha:0}},0.3],[R-0.2,{{autoAlpha:0}},0.01]]);
track("#pr1",{{autoAlpha:0,y:12}},[IN(A.why),[A.ten-0.3,{{autoAlpha:0}},0.3]]);
track("#pr2",{{autoAlpha:0,y:12}},[IN(A.notx),[A.ten-0.3,{{autoAlpha:0}},0.3]]);
track("#race",{{autoAlpha:0,y:24}},[IN(A.ten),[R-0.2,{{autoAlpha:0}},0.01]]);
track("#fA",{{scaleX:0}},[[A.ten+1.2,{{scaleX:1}},A.half-A.ten-1.2,"none"],[R-0.2,{{scaleX:0}},0.01]]);
track("#vA",{{autoAlpha:0}},[[A.half,{{autoAlpha:1}},0.25],[R-0.2,{{autoAlpha:0}},0.01]]);
track("#fB",{{scaleX:0}},[[A.quarter-0.15,{{scaleX:0.004}},0.1,"none"],[R-0.2,{{scaleX:0}},0.01]]);
track("#vB",{{autoAlpha:0}},[[A.quarter,{{autoAlpha:1}},0.25],[R-0.2,{{autoAlpha:0}},0.01]]);
track("#x19",{{autoAlpha:0,scale:0.7}},[[A.nineteen,{{autoAlpha:1,scale:1}},0.4,"back.out(2.4)"],[R-0.2,{{autoAlpha:0}},0.01]]);
// P3 scan
const sw=[]; for(let i=0;i<=6;i++) sw.push([A.starts+i*((A.match-A.starts)/6),{{x:i*88}},0.12,"power2.out"]);
track("#sweep",{{x:0,autoAlpha:0}},[[A.starts-0.1,{{autoAlpha:1}},0.1]].concat(sw));
track("#sc6",{{backgroundColor:"#0e1520",borderColor:"#263248"}},[[A.match,{{backgroundColor:"#0f3d37",borderColor:"#5eead4"}},0.3]]);
track("#on",{{autoAlpha:0,y:16}},[IN(A.On)]);
track("#nnw",{{autoAlpha:0}},[[A.loop,{{autoAlpha:1}},0.3]]);
for(let i=0;i<64;i++) track("#nn"+i,{{backgroundColor:"#1f2a3a"}},[[A.loop+0.2+i*((A.squared-A.loop-0.2)/64),{{backgroundColor:"#fbbf24"}},0.08,"none"]]);
// P4 hash
track("#tk",{{autoAlpha:0,y:12}},[IN(A.ticket),]);
track("#coat42",{{autoAlpha:0,x:-120,y:-120}},[[A.hashes,{{autoAlpha:1}},0.2],[A.points,{{x:2*112,y:0}},0.5,"power3.inOut"]]);
track("#sl2",{{borderColor:"#263248"}},[[A.jump,{{borderColor:"#5eead4"}},0.2]]);
track("#o1",{{autoAlpha:0,y:16}},[IN(A.O1)]);
track("#coat17",{{autoAlpha:0,x:-120,y:-120}},[[A.sometimes+0.4,{{autoAlpha:1}},0.2],[A.collision-0.3,{{x:2*112,y:-60}},0.45,"power3.inOut"],[A.further,{{x:3*112,y:0}},0.45,"power3.inOut"]]);
track("#coll",{{autoAlpha:0,y:12}},[IN(A.collision)]);
track("#prom",{{autoAlpha:0,y:12}},[IN(A.promise-0.6)]);
// P5 trade-offs
[["#t1","first"],["#t2","second"],["#t3","third"],["#t4","fourth"]].forEach(([s,k])=>track(s,{{autoAlpha:0,x:-30}},[[A[k],{{autoAlpha:1,x:0}},0.4,"power3.out"]]));
track("#mb1",{{scaleX:0}},[[A.first+0.6,{{scaleX:0.15}},0.5]]); track("#mb2",{{scaleX:0}},[[A.first+0.9,{{scaleX:1}},0.7]]);
track("#term",{{autoAlpha:0,y:10}},[IN(A.unhash-0.5)]);
// P6 cue
track("#spot",{{autoAlpha:0,scale:0.9}},[[A.tell,{{autoAlpha:1,scale:1}},0.4,"back.out(2)"]]);
track("#swapc",{{autoAlpha:0,y:12}},[IN(A.swap)]);
[["#u1","twosum"],["#u2","findd"],["#u3","seen"]].forEach(([s,k])=>track(s,{{autoAlpha:0,scale:0.7}},[[A[k],{{autoAlpha:1,scale:1}},0.35,"back.out(2.4)"]]));
track("#dictc",{{autoAlpha:0,y:12}},[IN(A.dicts)]);
// P7 challenge
track("#oL",{{scale:1}},[[A.quick+3.6,{{scale:1.12}},0.2],[A.quick+3.9,{{scale:1}},0.2]]);
track("#oS",{{scale:1}},[[A.quick+4.1,{{scale:1.12}},0.2],[A.quick+4.4,{{scale:1}},0.2]]);
// captions
G.forEach((ids,g)=>{{ const s=WS[ids[0]]; if(s>=A.teaching-0.05){{ gsap.set("#g"+g,{{autoAlpha:0}}); return; }}
  const e=Math.min((g+1<G.length)?WS[G[g+1][0]]:END, A.teaching-0.1);
  track("#g"+g,{{autoAlpha:0}},[[s-0.05,{{autoAlpha:1}},0.08,"none"],[e-0.06,{{autoAlpha:0}},0.06,"none"]]);
  ids.forEach(i=>track("#w"+i,{{opacity:0.55}},[[WS[i],{{opacity:1}},0.08,"none"]])); }});
//track("#headTilt",{{rotation:0,svgOrigin:"300 440"}},[[A.half,{{rotation:-3}},0.25],[A.quarter,{{rotation:0}},0.3],[A.jump,{{rotation:3}},0.2],[A.jump+0.3,{{rotation:0}},0.3],[A.unhash,{{rotation:-3}},0.25],[A.tell,{{rotation:0}},0.3]]);
window.__timelines["main"]=tl;
}})();
</script></body></html>'''
H=H.replace("__CSS__",open("style.css").read()).replace('track(".amb.pulse",{},[]);\n','')
open("index.html","w").write(H)
json.dump({"A":A,"R":R,"TOTAL":TOTAL},open("timing.json","w"))
