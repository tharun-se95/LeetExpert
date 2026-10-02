import json,math
V=[json.load(open(f"vo3/vo{i}.json")) for i in range(1,8)]
import subprocess
def adur(i): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"vo3/vo{i}.mp3"]))
LEAD=0.1; HOLD=1.4
D=[round(LEAD+adur(i)+HOLD,1) for i in range(1,8)]
ST=[round(sum(D[:k]),1) for k in range(7)]; TOTAL=round(sum(D),1)
def w(scene,idx):  # scene-relative time of word idx in scene (1-based scenes)
    return round(LEAD+V[scene-1][idx]["s"],2)
def find(scene,token,nth=0,exact=False):
    norm=lambda t:t.lower().strip(".,?:!")
    al={"o":{"o","oh","0"}}.get(token.lower(),{token.lower()})
    hits=[k for k,x in enumerate(V[scene-1]) if (norm(x["t"]) in al if exact else norm(x["t"]).startswith(token.lower()))]
    return w(scene,hits[nth])
A={  # anchors (scene-relative seconds)
 "s1_chips":find(1,"what's"), "s1_sub":find(1,"read"), "s1_swipe":find(1,"show")+0.3,
 "s2_not":find(2,"seconds"), "s2_if":find(2,"if",0,True), "s2_dbl":find(2,"doubles"), "s2_q":find(2,"what"),
 "s3_ptr":find(3,"hash"), "s3_jump":find(3,"jumps"), "s3_ten":find(3,"ten"), "s3_tag":find(3,"doesn't"), "s3_step":find(3,"one",-1,True),
 "s4_scan":find(4,"touching"), "s4_dbl":find(4,"double"),
 "s5_pairs":find(5,"checked"), "s5_28":find(5,"twenty"), "s5_mil":find(5,"million"), "s5_bil":find(5,"billion"),
 "s6_c1":find(6,"o",0,True), "s6_same":find(6,"stays"), "s6_c2":find(6,"o",1,True), "s6_c2d":find(6,"doubles",1), "s6_c3":find(6,"o",2,True), "s6_four":find(6,"four"), "s6_timed":find(6,"timed"),
 "s7_cue":find(7,"spot"), "s7_cost":find(7,"o",0,True), "s7_target":find(7,"aim"), "s7_trap":find(7,"usually"), "s7_save":find(7,"save"), "s7_cta":find(7,"learn"),
}
print("durations",D,"starts",ST,"total",TOTAL); print(A)
def hdr(n,dark=False):
    c="#94a3b8" if dark else "#4a5567"; dot="#3fae5a" if dark else "#1f7a3a"
    return f'<div class="hdr"><div class="brand">leetExpert<span class="dot" style="background:{dot}"></span></div><div class="pg" style="color:{c}">{n}/7</div></div>'
dots="".join(f'<div class="d{" late" if i>=8 else " early"}"></div>' for i in range(16))
buckets="".join(f'<div class="bk{" hit" if i==7 else ""}"><span>{ {2:"3",7:"7",10:"11"}.get(i,"") }</span></div>' for i in range(12))
cells="".join(f'<div class="c{" late" if i>=10 else ""}" id="c{i}"></div>' for i in range(20))
grid="".join(f'<div class="g{" pair" if j>i else (" diag" if i==j else "")}"></div>' for i in range(8) for j in range(8))
def pts(f): return "M"+" L".join(f"{60+(k/50)*350:.1f},{420-f(k/50):.1f}" for k in range(101))
def plen(f):
    P=[(60+(k/50)*350,420-f(k/50)) for k in range(101)]; return round(sum(math.dist(P[i],P[i+1]) for i in range(100))+2,1)
F1=lambda x:40; F2=lambda x:x*90; F3=lambda x:x*x*90
css=open("style.css").read()
audio="\n".join(f'<audio id="vo{i+1}" src="vo3/vo{i+1}.mp3" data-start="{round(ST[i]+LEAD,2)}" data-duration="{round(adur(i+1),2)}" data-track-index="1"></audio>' for i in range(7))
def sec(i,inner): return f'<section id="s{i}" class="clip" data-start="{ST[i-1]}" data-duration="{D[i-1]}" data-track-index="0">\n{inner}\n</section>'
html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1350" />
<title>leetExpert: Big-O in 60 seconds</title>
<script src="gsap.min.js"></script>
<style>
{css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1350" data-duration="{TOTAL}">
{sec(1,f"""<div class="scene">{hdr(1)}
<div class="spacer"></div>
<div class="eyebrow">PATTERN IN 60 SECONDS</div>
<h1>Every interview asks: what's the Big-O?</h1>
<p class="sub" id="s1sub">Read it straight from the code.</p>
<div class="spacer"></div>
<div class="row"><div class="chips"><span class="chip" id="ch1">O(1)</span><span class="chip" id="ch2">O(n)</span><span class="chip warn" id="ch3">O(n²)</span></div><span class="swipe" id="swipe">Swipe →</span></div>
</div>""")}
{sec(2,f"""<div class="scene">{hdr(2)}
<div class="eyebrow">THE IDEA</div>
<h2>Big-O is how the work grows.</h2>
<p class="sub" id="s2not">Not seconds. Not your laptop.</p>
<div class="spacer"></div>
<div class="panel">
<div class="mono" style="font-size:34px;color:#94a3b8" id="s2if">If the input doubles…</div>
<div class="nlabel"><span id="lbN">n</span><span id="lb2N" style="color:#fbbf24">2n</span></div>
<div class="dots">{dots}</div>
<div class="q" id="s2q">…what happens to the work?</div>
</div></div>""")}
{sec(3,f"""<div class="scene">{hdr(3)}
<div class="badge"><div class="big">O(1)</div><div class="kind">constant</div></div>
<div class="code">seen = {{<span class="n">3</span>: <span class="n">0</span>, <span class="n">7</span>: <span class="n">1</span>, <span class="n">11</span>: <span class="n">2</span>}}
<span class="k">if</span> <span class="n">7</span> <span class="k">in</span> seen:
    print(seen[<span class="n">7</span>])</div>
<div class="spacer"></div>
<div class="buckets" id="bks">{buckets}<div class="ptr" id="ptr3">7 ↓</div></div>
<div class="stats"><div class="stat"><div class="l">items</div><div class="v" id="items3">3</div></div><div class="stat"><div class="l">steps to find 7</div><div class="v" id="steps3" style="color:#107d6e">1</div></div></div>
<p class="caption" id="s3tag">Same work, any size.</p>
</div>""")}
{sec(4,f"""<div class="scene">{hdr(4)}
<div class="badge"><div class="big">O(n)</div><div class="kind">linear</div></div>
<div class="code">total = <span class="n">0</span>
<span class="k">for</span> x <span class="k">in</span> nums:
    total += x</div>
<div class="spacer"></div>
<div class="cells">{cells}</div>
<div class="stats"><div class="stat"><div class="l">items</div><div class="v" id="items4">10</div></div><div class="stat"><div class="l">steps</div><div class="v" id="steps4" style="color:#107d6e">0</div></div></div>
<p class="caption" id="s4tag">Double the input, double the work.</p>
</div>""")}
{sec(5,f"""<div class="scene">{hdr(5)}
<div class="badge"><div class="big warn">O(n²)</div><div class="kind">quadratic</div></div>
<div class="code" style="font-size:28px;padding:32px 40px"><span class="k">for</span> i <span class="k">in</span> range(len(nums)):
    <span class="a">for</span> j <span class="a">in</span> range(i + <span class="n">1</span>, len(nums)):
        <span class="k">if</span> nums[i] + nums[j] == target:
            <span class="k">return</span> [i, j]</div>
<div class="spacer"></div>
<div class="gridwrap">
<div class="grid" id="grid">{grid}</div>
<div class="swap">
<div id="sw1"><div class="pc"><div class="l">8 numbers</div><div class="v" id="pairs5">0</div><div class="l">pair checks</div></div></div>
<div id="sw3"><div class="pc"><div class="l">1,000,000 numbers</div><div class="v" id="big5" style="font-size:46px">0</div><div class="l">pair checks</div></div></div>
</div></div>
<div class="spacer"></div>
</div>""")}
{sec(6,f"""<div class="scene">{hdr(6)}
<h2>When n doubles…</h2>
<svg width="900" height="520" viewBox="0 0 800 460" style="display:block">
<line x1="60" y1="420" x2="770" y2="420" stroke="#9aa6b6" stroke-width="3"/>
<line x1="60" y1="420" x2="60" y2="20" stroke="#9aa6b6" stroke-width="3"/>
<line x1="410" y1="420" x2="410" y2="20" stroke="#c7cfdb" stroke-width="2" stroke-dasharray="8 8"/>
<line x1="760" y1="420" x2="760" y2="20" stroke="#c7cfdb" stroke-width="2" stroke-dasharray="8 8"/>
<text x="410" y="452" text-anchor="middle" font-size="24" fill="#4a5567">n</text>
<text x="760" y="452" text-anchor="middle" font-size="24" fill="#4a5567">2n</text>
<text x="72" y="36" font-size="22" fill="#4a5567">work</text>
<path id="cv1" d="{pts(F1)}" fill="none" stroke="#107d6e" stroke-width="7" stroke-linecap="round"/>
<path id="cv2" d="{pts(F2)}" fill="none" stroke="#2563eb" stroke-width="7" stroke-linecap="round"/>
<path id="cv3" d="{pts(F3)}" fill="none" stroke="#b45309" stroke-width="7" stroke-linecap="round"/>
</svg>
<div class="stats">
<div class="stat" id="t1"><div class="l" style="color:#107d6e;font-weight:700">O(1)</div><div class="v">same</div></div>
<div class="stat" id="t2"><div class="l" style="color:#2563eb;font-weight:700">O(n)</div><div class="v">2×</div></div>
<div class="stat" id="t3" style="background:#16202e;color:#f1f4f9"><div class="l" style="color:#fbbf24;font-weight:700">O(n²)</div><div class="v">4×</div></div>
</div>
<p class="timed" id="s6t">We timed it: about 4× per doubling.</p>
</div>""")}
{sec(7,f"""<div class="scene dark">{hdr(7,True)}
<div class="spacer"></div>
<h2 style="font-size:70px">Spot it in an interview.</h2>
<div class="rows7">
<div class="r7" id="r1"><b>Cue</b><span>Loop inside a loop</span></div>
<div class="r7" id="r2"><b>Cost</b><span>O(n²)</span></div>
<div class="r7" id="r3"><b>Target</b><span>O(n), with a hash map</span></div>
<div class="r7" id="r4"><b class="w">Trap</b><span>Passes small tests anyway</span></div>
</div>
<div class="spacer"></div>
<h2 style="font-size:56px" id="save">Save this.</h2>
<span class="cta" id="cta">Learn it on leetExpert. Link in bio.</span>
</div>""")}
{audio}
</div>
<script>
(function(){{
const tl = gsap.timeline({{ paused: true }});
const fmt = (x) => Math.round(x).toLocaleString("en-US");
const E_items3=document.getElementById("items3"),E_steps4=document.getElementById("steps4"),E_items4=document.getElementById("items4"),E_pairs5=document.getElementById("pairs5"),E_big5=document.getElementById("big5");
const S={json.dumps(ST)}, A={json.dumps(A)};
const at=(s,k)=>S[s-1]+A[k];
// S1
tl.fromTo(["#ch1","#ch2","#ch3"],{{scale:0.4,opacity:0}},{{scale:1,opacity:1,duration:0.45,stagger:0.15,ease:"back.out(2)"}},at(1,"s1_chips"));
tl.fromTo("#s1sub",{{y:24,opacity:0}},{{y:0,opacity:1,duration:0.5,ease:"power3.out"}},at(1,"s1_sub"));
tl.fromTo("#swipe",{{opacity:0,x:0}},{{opacity:1,duration:0.3}},at(1,"s1_swipe"));
tl.fromTo("#swipe",{{x:0}},{{x:16,duration:0.4,ease:"sine.inOut",yoyo:true,repeat:1,immediateRender:false}},at(1,"s1_swipe")+0.3);
// S2
tl.fromTo("#s2not",{{opacity:0,y:16}},{{opacity:1,y:0,duration:0.4}},at(2,"s2_not"));
tl.fromTo("#s2if",{{opacity:0}},{{opacity:1,duration:0.3}},at(2,"s2_if"));
tl.fromTo("#lbN",{{opacity:0}},{{opacity:1,duration:0.3}},at(2,"s2_if"));
tl.fromTo(".d.early",{{scale:0}},{{scale:1,duration:0.3,stagger:0.04,ease:"back.out(2)"}},at(2,"s2_if"));
tl.fromTo("#lbN",{{opacity:1,y:0}},{{opacity:0,y:-20,duration:0.3,immediateRender:false}},at(2,"s2_dbl"));
tl.fromTo("#lb2N",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.3}},at(2,"s2_dbl"));
tl.fromTo(".d.late",{{scale:0}},{{scale:1,duration:0.3,stagger:0.04,ease:"back.out(2)"}},at(2,"s2_dbl"));
tl.fromTo("#s2q",{{opacity:0,y:16}},{{opacity:1,y:0,duration:0.4}},at(2,"s2_q"));
// S3
tl.fromTo("#ptr3",{{opacity:0}},{{opacity:1,duration:0.2}},at(3,"s3_ptr"));
tl.fromTo("#ptr3",{{x:0}},{{x:7*76,duration:0.45,ease:"power3.out"}},at(3,"s3_jump"));
tl.fromTo("#bks .hit",{{backgroundColor:"#ffffff",borderColor:"#d5dce6"}},{{backgroundColor:"#dff1ec",borderColor:"#107d6e",duration:0.25}},at(3,"s3_jump")+0.45);
const it3={{v:3}};
tl.fromTo(it3,{{v:3}},{{v:10000000,duration:1.4,ease:"power2.in",onUpdate:()=>{{E_items3.textContent=fmt(it3.v);}}}},at(3,"s3_ten"));
tl.fromTo("#s3tag",{{opacity:0,y:16}},{{opacity:1,y:0,duration:0.4}},at(3,"s3_tag"));
tl.fromTo("#steps3",{{scale:1}},{{scale:1.3,duration:0.2,yoyo:true,repeat:1}},at(3,"s3_step"));
// S4
const c4={{v:0}};
for(let i=0;i<10;i++){{ tl.fromTo("#c"+i,{{backgroundColor:"#ffffff",borderColor:"#d5dce6"}},{{backgroundColor:"#dff1ec",borderColor:"#107d6e",duration:0.1}},at(4,"s4_scan")+i*0.1); }}
tl.fromTo(c4,{{v:0}},{{v:10,duration:1.0,ease:"none",onUpdate:()=>{{E_steps4.textContent=fmt(c4.v);}}}},at(4,"s4_scan"));
tl.fromTo(".c.late",{{scale:0}},{{scale:1,duration:0.25,stagger:0.03,ease:"back.out(2)"}},at(4,"s4_dbl"));
const i4={{v:10}};
tl.fromTo(i4,{{v:10}},{{v:20,duration:0.3,ease:"none",onUpdate:()=>{{E_items4.textContent=fmt(i4.v);}}}},at(4,"s4_dbl"));
for(let i=10;i<20;i++){{ tl.fromTo("#c"+i,{{backgroundColor:"#ffffff",borderColor:"#d5dce6"}},{{backgroundColor:"#fde68a",borderColor:"#b45309",duration:0.1}},at(4,"s4_dbl")+0.5+(i-10)*0.1); }}
const c4b={{v:10}};
tl.fromTo(c4b,{{v:10}},{{v:20,duration:1.0,ease:"none",immediateRender:false,onUpdate:()=>{{E_steps4.textContent=fmt(c4b.v);}}}},at(4,"s4_dbl")+0.5);
tl.fromTo("#s4tag",{{opacity:0,y:16}},{{opacity:1,y:0,duration:0.4}},at(4,"s4_dbl"));
// S5
const pairs=Array.from(document.querySelectorAll("#grid .pair"));
const step=(A.s5_28-A.s5_pairs)/28;
pairs.forEach((el,k)=>{{ tl.fromTo(el,{{backgroundColor:"#ffffff",borderColor:"#d5dce6"}},{{backgroundColor:"#fbbf24",borderColor:"#b45309",duration:0.08}},at(5,"s5_pairs")+k*step); }});
const p5={{v:0}};
tl.fromTo(p5,{{v:0}},{{v:28,duration:28*step,ease:"none",onUpdate:()=>{{E_pairs5.textContent=fmt(p5.v);}}}},at(5,"s5_pairs"));
tl.fromTo("#sw1",{{opacity:1}},{{opacity:0,duration:0.25,immediateRender:false}},at(5,"s5_mil")-0.1);
tl.fromTo("#sw3",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.35}},at(5,"s5_mil"));
const b5={{v:0}};
tl.fromTo(b5,{{v:0}},{{v:499999500000,duration:A.s5_bil-A.s5_mil+0.4,ease:"power3.in",onUpdate:()=>{{E_big5.textContent=fmt(b5.v);}}}},at(5,"s5_mil"));
// S6
const LEN={{"#cv1":{plen(F1)},"#cv2":{plen(F2)},"#cv3":{plen(F3)}}};
[["#cv1","s6_c1","#t1","s6_same"],["#cv2","s6_c2","#t2","s6_c2d"],["#cv3","s6_c3","#t3","s6_four"]].forEach(([cv,a1,card,a2])=>{{
 tl.fromTo(cv,{{strokeDasharray:LEN[cv],strokeDashoffset:LEN[cv]}},{{strokeDashoffset:0,duration:1.0,ease:"power2.inOut"}},at(6,a1));
 tl.fromTo(card,{{y:30,opacity:0}},{{y:0,opacity:1,duration:0.4,ease:"power3.out"}},at(6,a2)); }});
tl.fromTo("#s6t",{{opacity:0}},{{opacity:1,duration:0.4}},at(6,"s6_timed"));
// S7
[["#r1","s7_cue"],["#r2","s7_cost"],["#r3","s7_target"],["#r4","s7_trap"]].forEach(([r,a])=>{{ tl.fromTo(r,{{x:-40,opacity:0}},{{x:0,opacity:1,duration:0.4,ease:"power3.out"}},at(7,a)); }});
tl.fromTo("#save",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.4}},at(7,"s7_save"));
tl.fromTo("#cta",{{scale:0.7,opacity:0}},{{scale:1,opacity:1,duration:0.45,ease:"back.out(2)"}},at(7,"s7_cta"));
window.__timelines["main"] = tl;
}})();
</script>
</body>
</html>
'''
open("index.html","w").write(html)
json.dump({"D":D,"ST":ST,"LEAD":LEAD},open("timing3.json","w"))
