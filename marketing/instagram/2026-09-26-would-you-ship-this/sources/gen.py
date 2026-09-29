import json,html,subprocess
W=json.load(open("vo/words.json"))
LEAD=0.3
AUD=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","vo.mp3"]))
TOTAL=round(LEAD+AUD+2.6,2)
norm=lambda t:t.lower().strip(".,?:!'\"")
def at(token,nth=0,after=0.0):
    hits=[x for x in W if norm(x["t"])==token.lower() and x["s"]>=after]
    return round(LEAD+hits[nth]["s"],2)
def end(token,nth=0,after=0.0):
    hits=[x for x in W if norm(x["t"])==token.lower() and x["s"]>=after]
    return round(LEAD+hits[nth]["e"],2)
T={
 "type0":at("wrote"),"type1":at("seconds"),"ship":at("ship"),
 "check":at("check"),"n2":at("two",0,12),"n7":at("seven"),"n11":at("eleven"),"n15":at("fifteen"),"tgt9":at("target",0,15),"true1":at("true",0,16),
 "try":at("try"),"one":at("one",0,20),"five":at("five",0,21),"tgt10":at("target",0,22),
 "it":at("it",0,23.5),"true2":at("true",0,24),"ten":at("ten",0,27),"paired":at("paired"),
 "problem":at("problem"),"innums":at("in",0,35.5),"scans":at("scans"),"loop":at("loop",0,40),"forty":at("forty",0,42),"over":at("over",0,43.8),"secs":end("seconds",1),
 "fix":at("fix"),"keep":at("keep"),"check2":at("check",0,49),"add":at("add",0,49.9),"gone":at("bug's"),"on":at("o",0,53),"same":at("same",0,54),"three":at("three",0,55.9),"ms":end("milliseconds"),
 "passing":at("passing"),"weird":at("weird"),"c1":at("one",0,62.5),"c2":at("duplicates"),"c3":at("empty"),"on2":at("on",0,65),"proof":at("proof"),"coach":at("coach"),"link":at("link's"),"bio":end("bio"),
}
print(json.dumps(T))
# ---- code tokens (monochrome syntax; teal/amber reserved for meaning)
KW={"def","for","in","if","return"}
LINES=[("L1","def has_pair_sum(nums, target):"),("L2","    for x in nums:"),("L3","        if target - x in nums:"),("L4","            return True"),("L5","    return False")]
import re
def toks(s):
    return re.findall(r"\s+|[A-Za-z_]+|.",s)
chars=[]  # (lineid, char, cls)
def line_html(lid,s,typed=True):
    out=[]; ci=0
    for tk in toks(s):
        cls="kw" if tk in KW else ("lit" if tk in ("True","False") else ("fn" if tk=="has_pair_sum" else "id"))
        if lid=="L3" and tk=="nums" and s.endswith("nums:") and s.index("in nums")+3==sum(len(t) for t in toks(s)[:toks(s).index(tk)]) : pass
        for ch in tk:
            idx=len(chars); chars.append((lid,ch))
            out.append(f'<span class="ch {cls}" id="k{idx}">{html.escape(ch) if ch!=" " else "&nbsp;"}</span><span class="cr" id="c{idx}"></span>')
    return "".join(out)
code_html=""
for lid,s in LINES:
    if lid=="L3":
        pre="        if target - x in "; body=line_html(lid,pre)
        body+='<span class="swapbox"><span class="swap" id="swapNums">'+line_html(lid,"nums")+'</span><span class="swapN" id="swapSeen">seen</span></span>'+line_html(lid,":")
        code_html+=f'<div class="ln" id="{lid}"><span class="g">3</span><span class="lc">{body}</span></div>'
    else:
        code_html+=f'<div class="ln" id="{lid}"><span class="g">{ {"L1":1,"L2":2,"L4":4,"L5":5}[lid] }</span><span class="lc">{line_html(lid,s)}</span></div>'
    if lid=="L1": code_html+='<div class="ln ins" id="I1"><span class="g">+</span><span class="lc"><span class="id">&nbsp;&nbsp;&nbsp;&nbsp;seen = </span><span class="fn">set</span><span class="id">()</span></span></div>'
    if lid=="L4": code_html+='<div class="ln ins" id="I2"><span class="g">+</span><span class="lc"><span class="id">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen.add(x)</span></span></div>'
NCH=len(chars)
# ---- captions: group words
groups=[];cur=[]
for i,x in enumerate(W):
    cur.append(i)
    if x["t"][-1] in ".?!," and len(cur)>=2 or len(cur)>=4 or x["t"][-1] in ".?!":
        groups.append(cur);cur=[]
if cur: groups.append(cur)
AMB={"true","itself","problem","loop","forty","ten","seconds","secretly","scans","one","five"}
TEAL={"true.","fix?","set","seen","gone,","o","of","n.","milliseconds.","proof.","coach","bio."}
def wcls(i):
    t=W[i]["t"].lower()
    if i<len(W) and W[i]["s"]>57 : return "ct" if norm(t) in {"proof","coach","expert","bio","passing"} else "cw"
    if W[i]["s"]>45.5: return "ct" if norm(t) in {"fix","set","seen","gone","o","of","n","three","half","milliseconds"} else "cw"
    if 16<W[i]["s"]<17.4 and norm(t)=="true": return "ct"
    if 24<W[i]["s"]<45.5: return "ca" if norm(t) in {"true","itself","problem","loop","forty","ten","seconds","scans","secretly","only","one","number"} else "cw"
    return "cw"
cap_html=""
for g,ids in enumerate(groups):
    spans=" ".join(f'<span class="{wcls(i)}" id="w{i}">{html.escape(W[i]["t"])}</span>' for i in ids)
    cap_html+=f'<div class="cg" id="g{g}">{spans}</div>'
cells_vals=[3,8,1,9,4,7,2,6]
cells="".join(f'<div class="sc" id="sc{i}">{v}</div>' for i,v in enumerate(cells_vals))
CSS=open("style.css").read()
H=f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: Would you ship this?</title>
<script src="gsap.min.js"></script>
<style>{CSS}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{TOTAL}">
<div id="world">
 <div class="top"><div class="brand" id="topbrand">leetExpert<span class="dot"></span></div><div class="tag" id="tagAI">AI-written</div></div>
 <div class="card" id="card">
  <div class="bar"><span class="fname">has_pair_sum.py</span><span class="o" id="bigO"><span class="ob" id="oSq">O(n²)</span><span class="ob" id="oN">O(n)</span></span></div>
  <div class="code" id="code"><span class="caret0" id="caret0"></span>{code_html}<div class="hl" id="hl3"></div></div>
 </div>
 <div class="stage">
  <div class="q" id="q">Would you <span class="t">ship</span> it?</div>
  <div class="chip" id="chipA"><span class="mono">nums = [<span id="a2">2</span><span id="a7">, 7</span><span id="a11">, 11</span><span id="a15">, 15</span>]</span><span class="mono" id="aT">&nbsp;&nbsp;target = 9</span><span class="res ok" id="aR">True ✓</span></div>
  <div class="chip" id="chipB"><span class="mono">nums = [<span id="b5">5</span>]</span><span class="mono" id="bT" data-layout-allow-overlap>&nbsp;&nbsp;target = 10</span><span class="res bad" id="bR">True ✗</span><span class="res ok" id="bR2">False ✓</span></div>
  <div class="self" id="self"><div class="box">5</div><svg width="260" height="170" viewBox="0 0 260 170" id="loopSvg"><path id="loopPath" d="M60,60 C60,-20 200,-20 200,60 C200,120 120,130 96,96" fill="none" stroke="#fbbf24" stroke-width="7" stroke-linecap="butt"/><path id="loopHead" d="M84,78 L96,100 L110,80" fill="none" stroke="#fbbf24" stroke-width="7"/></svg><div class="selfL" id="selfL">10 − 5 = 5 → <b>itself</b></div></div>
  <div class="scan" id="scan"><div class="ptr" id="optr">x ↓</div><div class="cells" id="cells">{cells}<div class="sweep" id="sweep"></div></div><div class="scanL" id="scanL">a loop inside a loop</div></div>
  <div class="watch" id="watch"><div class="wl" data-layout-allow-overlap>40,000 numbers</div><div class="wrow"><div class="wt bad" id="wSlow" data-layout-allow-overlap>0.0 s</div><div class="wt ok" id="wFast" data-layout-allow-overlap>3.5 ms</div></div></div>
  <div class="land" id="land">
   <div class="lchk" id="lchk"><span>sample test</span><span class="lok" id="lok">✓</span><span class="lq" id="lq">≠ proof</span></div>
   <div class="lh" id="lh">Passing the sample test isn't proof.</div>
   <div class="edges"><span class="elbl" id="elbl">Try:</span><span class="edge" id="e1">one number</span><span class="edge" id="e2">duplicates</span><span class="edge" id="e3">empty</span></div>
  </div>
 </div>
</div>
<div class="lock" id="lock"><div class="lbrand" id="lbrand"><span>leetExpert</span><span class="ldot"></span></div><div class="lline" id="lline">The coach names the case that broke.</div><div class="lcta" id="lcta">Try it free <span class="larr" id="larr">→</span> link in bio</div></div>
<div class="glitchbar" id="gb1"></div><div class="glitchbar b" id="gb2"></div>
<div class="caps">{cap_html}</div>
<audio id="vo" src="vo.mp3" data-start="{LEAD}" data-duration="{round(AUD,2)}" data-track-index="1"></audio>
</div>
<script>
(function(){{
const tl=gsap.timeline({{paused:true}});
const T={json.dumps(T)}, NCH={NCH}, W={json.dumps([[round(LEAD+x["s"],2)] for x in W])}, G={json.dumps(groups)}, END={TOTAL};
// One tween per element: keyframes at absolute times. pts = [[time, vars, dur, ease]]
function track(sel, init, pts){{
  gsap.set(sel, init);
  let prev=0; const kf=[];
  pts.forEach(([t,v,d,e])=>{{ kf.push(Object.assign({{}},v,{{duration:d||0.001,ease:e||"power2.out",delay:Math.max(0,t-prev)}})); prev=t+(d||0.001); }});
  tl.to(sel,{{keyframes:kf}},0);
}}
gsap.set(".ch",{{opacity:0}});
// camera
track("#world",{{scale:1,x:0}},[[0,{{scale:1.015}},T.ship,"sine.inOut"],[T.ship+1.2,{{scale:1.03}},T.true1-T.ship-1.2,"sine.inOut"],
 [T.true1+1.8,{{scale:1.04}},T.it-T.true1-1.8,"sine.inOut"],
 [T.it,{{x:18}},0.04,"none"],[T.it+0.04,{{x:-22}},0.04,"none"],[T.it+0.08,{{x:14}},0.04,"none"],[T.it+0.12,{{x:-8}},0.04,"none"],[T.it+0.16,{{x:0}},0.04,"none"],
 [T.it+2.8,{{scale:1.05}},T.innums-T.it-2.8,"sine.inOut"],[T.innums,{{scale:1.06}},T.secs-T.innums,"sine.inOut"],[T.secs+1.2,{{scale:1.07}},T.ms-T.secs-1.2,"sine.inOut"],
 [T.passing-0.4,{{scale:1.0}},1.2,"power2.inOut"]]);
// typing: each char appears once; caret i visible only during its slot
for(let i=0;i<NCH;i++){{ const t=T.type0+i*((T.type1-T.type0)/NCH);
  const er=T.bio+1.4+(NCH-1-i)*(0.55/NCH);
  track("#k"+i,{{opacity:0}},[[t,{{opacity:1}},0.04,"none"],[er,{{opacity:0}},0.02,"none"]]);
  if(i<NCH-1) track("#c"+i,{{opacity:0}},[[t,{{opacity:1}},0.01,"none"],[t+(T.type1-T.type0)/NCH,{{opacity:0}},0.01,"none"]]); }}
const lastC=[[T.type0+(NCH-1)*((T.type1-T.type0)/NCH),{{opacity:1}},0.01,"none"]];
for(let b=0;b<4;b++){{ lastC.push([T.type1+0.5+b,{{opacity:0}},0.05,"none"]); lastC.push([T.type1+1.0+b,{{opacity:1}},0.05,"none"]); }}
lastC.push([T.check-0.2,{{opacity:0}},0.1,"none"]);
track("#caret0",{{opacity:1}},[[T.type0-0.02,{{opacity:0}},0.01,"none"],[T.bio+1.98,{{opacity:1}},0.01,"none"]]);
track("#c"+(NCH-1),{{opacity:0}},lastC);
track("#tagAI",{{autoAlpha:0,y:-12}},[[T.type0-0.3,{{autoAlpha:1,y:0}},0.35,"power3.out"],[T.on2-0.2,{{autoAlpha:0}},0.3]]);
track(".brand",{{opacity:1}},[[T.on2-0.2,{{opacity:0}},0.3],[T.bio+0.9,{{opacity:1}},0.4]]);
track("#q",{{autoAlpha:0,y:30}},[[T.ship-0.1,{{autoAlpha:1,y:0}},0.4,"back.out(2)"],[T.check-0.6,{{autoAlpha:0}},0.3]]);
// code highlight + dims
track("#hl3",{{autoAlpha:0,backgroundColor:"rgba(94,234,212,0.10)"}},[[T.check,{{autoAlpha:1}},0.35],[T.try,{{autoAlpha:0}},0.3],
 [T.ten,{{autoAlpha:1,backgroundColor:"rgba(251,191,36,0.16)"}},0.3],[T.fix,{{autoAlpha:0}},0.3]]);
track(["#L1","#L2","#L4","#L5"],{{opacity:1}},[[T.ten,{{opacity:0.35}},0.4],[T.fix,{{opacity:1}},0.3]]);
track("#card",{{opacity:1,y:0}},[[T.try,{{opacity:0.55}},0.5],[T.it,{{opacity:1}},0.3],[T.passing-0.4,{{opacity:0.35}},0.5],[T.on2-0.2,{{opacity:0,y:-40}},0.4],[T.bio+0.9,{{opacity:1,y:0}},0.45,"power3.out"]]);
// setup chip
track("#chipA",{{autoAlpha:0,y:30}},[[T.n2-0.25,{{autoAlpha:1,y:0}},0.4,"power3.out"],[T.try,{{autoAlpha:0,y:-10}},0.4]]);
[["#a2","n2"],["#a7","n7"],["#a11","n11"],["#a15","n15"]].forEach(([id,k])=>track(id,{{opacity:0}},[[T[k],{{opacity:1}},0.15]]));
track("#aT",{{opacity:0}},[[T.tgt9,{{opacity:1}},0.2]]);
track("#aR",{{opacity:0,scale:0.6}},[[T.true1,{{opacity:1,scale:1}},0.4,"back.out(2.5)"]]);
// tiny test chip (breather) -> reveal -> fix -> away
track("#chipB",{{autoAlpha:0,y:30}},[[T.one,{{autoAlpha:1,y:0}},0.4,"power3.out"],[T.problem,{{autoAlpha:0}},0.35],[T.gone-0.3,{{autoAlpha:1,y:0}},0.35],[T.same-0.3,{{autoAlpha:0}},0.3]]);
track("#b5",{{opacity:0,scale:0.5}},[[T.five,{{opacity:1,scale:1}},0.35,"back.out(2)"]]);
track("#bT",{{opacity:0}},[[T.tgt10,{{opacity:1}},0.2]]);
track("#bR",{{autoAlpha:0,scale:0.6}},[[T.true2,{{autoAlpha:1,scale:1}},0.4,"back.out(2.5)"],[T.gone-0.3,{{autoAlpha:0}},0.01]]);
track("#bR2",{{autoAlpha:0,scale:0.6}},[[T.gone,{{autoAlpha:1}},0.01,"none"],[T.gone+0.01,{{scale:1}},0.4,"back.out(2.5)"]]);
track(["#gb1","#gb2"],{{autoAlpha:0}},[[T.it,{{autoAlpha:0.85}},0.02,"none"],[T.it+0.18,{{autoAlpha:0}},0.05,"none"]]);
track("#self",{{autoAlpha:0,y:20}},[[T.ten,{{autoAlpha:1,y:0}},0.4],[T.problem,{{autoAlpha:0}},0.35]]);
track("#selfL",{{opacity:0}},[[T.ten+0.2,{{opacity:1}},0.3]]);
track("#loopPath",{{strokeDasharray:420,strokeDashoffset:420,opacity:0}},[[T.paired-0.3,{{opacity:1}},0.01],[T.paired-0.29,{{strokeDashoffset:0}},0.9,"power2.inOut"]]);
track("#loopHead",{{opacity:0}},[[T.paired+0.55,{{opacity:1}},0.15]]);
// hidden cost
track("#scan",{{autoAlpha:0,y:30}},[[T.innums,{{autoAlpha:1,y:0}},0.4,"power3.out"],[T.forty-0.2,{{autoAlpha:0}},0.3]]);
const step=0.62, optr=[], sweep=[];
for(let o=0;o<8;o++){{ const t0=T.scans+o*step; if(o>0) optr.push([t0,{{x:o*104}},0.12,"power2.out"]);
  sweep.push([t0+0.05,{{x:0}},0.01,"none"]); sweep.push([t0+0.06,{{x:7*104}},step*0.8,"none"]); }}
track("#optr",{{x:0}},optr);
track("#sweep",{{x:0,autoAlpha:0}},[[T.scans-0.1,{{autoAlpha:1}},0.1]].concat(sweep).concat([[T.scans+8*step+0.1,{{autoAlpha:0}},0.2]]));
track("#scanL",{{opacity:0}},[[T.loop,{{opacity:1}},0.3]]);
track("#bigO",{{autoAlpha:0,scale:0.6,color:"#fbbf24",borderColor:"#fbbf24"}},[[T.loop,{{autoAlpha:1,scale:1}},0.35,"back.out(2)"],[T.on,{{color:"#5eead4",borderColor:"#5eead4"}},0.3],[T.bio+1.0,{{autoAlpha:0}},0.3]]);
track("#oSq",{{opacity:1}},[[T.on,{{opacity:0}},0.15]]);
track("#oN",{{opacity:0}},[[T.on+0.1,{{opacity:1}},0.2]]);
track("#watch",{{autoAlpha:0,y:30}},[[T.forty,{{autoAlpha:1,y:0}},0.4],[T.fix,{{autoAlpha:0}},0.3],[T.same,{{autoAlpha:1,y:60}},0.35],[T.passing-0.4,{{autoAlpha:0}},0.3]]);
const sw={{v:0}}; const eS=document.getElementById("wSlow");
tl.fromTo(sw,{{v:0}},{{v:10.5,duration:T.secs-T.over,ease:"power1.in",onUpdate:()=>{{eS.textContent=sw.v.toFixed(1)+" s";}}}},T.over);
track("#wSlow",{{color:"#fbbf24"}},[[T.three,{{color:"#b98a1f"}},0.3]]);
track("#wFast",{{opacity:0,scale:0.6}},[[T.three,{{opacity:1,scale:1}},0.4,"back.out(2)"]]);
// fix diff
track("#I1",{{height:0,opacity:0}},[[T.keep,{{height:60,opacity:1}},0.45],[T.bio+1.0,{{height:0,opacity:0}},0.3]]);
track("#swapNums",{{opacity:1}},[[T.check2,{{opacity:0}},0.2],[T.bio+1.0,{{opacity:1}},0.01]]);
track("#swapSeen",{{opacity:0}},[[T.check2+0.1,{{opacity:1}},0.25],[T.bio+1.0,{{opacity:0}},0.01]]);
track("#I2",{{height:0,opacity:0}},[[T.add,{{height:60,opacity:1}},0.45],[T.bio+1.0,{{height:0,opacity:0}},0.3]]);
// landing (callback: the setup's check returns, and gets overruled)
const LOOP=T.bio+0.9;   // loop-back starts after the lockup has been read
track("#land",{{autoAlpha:0}},[[T.passing-0.3,{{autoAlpha:1}},0.3],[T.on2-0.15,{{autoAlpha:0,y:-30}},0.35]]);
track("#lchk",{{scale:0.5,y:40}},[[T.passing-0.3,{{scale:1,y:0}},0.5,"back.out(2)"]]);
track("#lok",{{opacity:1}},[[T.proof,{{opacity:0}},0.15]]);
track("#lq",{{opacity:0,x:-10}},[[T.proof+0.1,{{opacity:1,x:0}},0.3,"power3.out"]]);
track("#lchk",{{backgroundColor:"#5eead4"}},[[T.proof,{{backgroundColor:"#fbbf24"}},0.2]]);
track("#lh",{{opacity:0,y:20}},[[T.passing,{{opacity:1,y:0}},0.45]]);
track("#elbl",{{opacity:0}},[[T.weird,{{opacity:1}},0.3]]);
[["#e1","c1"],["#e2","c2"],["#e3","c3"]].forEach(([id,k])=>track(id,{{opacity:0,scale:0.6}},[[T[k],{{opacity:1,scale:1}},0.35,"back.out(2.5)"]]));
// brand lockup: the frame clears to one message
track("#lock",{{autoAlpha:0}},[[T.on2,{{autoAlpha:1}},0.3],[LOOP,{{autoAlpha:0,y:-20}},0.35]]);
track("#lbrand",{{opacity:0,y:30,scale:0.94}},[[T.on2,{{opacity:1,y:0,scale:1}},0.55,"power3.out"]]);
track("#lline",{{opacity:0,y:20}},[[T.coach,{{opacity:1,y:0}},0.45,"power3.out"]]);
track("#lcta",{{opacity:0,scale:0.8}},[[T.link,{{opacity:1,scale:1}},0.45,"back.out(2)"]]);
track("#larr",{{x:0}},[[T.link+0.5,{{x:12}},0.35,"sine.inOut"],[T.link+0.85,{{x:0}},0.35,"sine.inOut"],[T.link+1.2,{{x:12}},0.35,"sine.inOut"],[T.link+1.55,{{x:0}},0.35,"sine.inOut"]]);
// loop back to the intro: code erases itself, editor returns to frame-0 state
// captions
G.forEach((ids,g)=>{{ const s=W[ids[0]][0]; if(s>=T.on2-0.05) {{ gsap.set("#g"+g,{{autoAlpha:0}}); return; }} const e=Math.min((g+1<G.length)?W[G[g+1][0]][0]:END, T.on2-0.1);
  track("#g"+g,{{autoAlpha:0}},[[s-0.05,{{autoAlpha:1}},0.08,"none"],[e-0.06,{{autoAlpha:0}},0.06,"none"]]);
  ids.forEach(i=>track("#w"+i,{{opacity:0.55}},[[W[i][0],{{opacity:1}},0.08,"none"]])); }});
window.__timelines["main"]=tl;
}})();
</script>
</body></html>'''
open("index.html","w").write(H)
json.dump({"TOTAL":TOTAL,"T":T},open("timing.json","w"))
print("chars",NCH,"groups",len(groups),"total",TOTAL)
