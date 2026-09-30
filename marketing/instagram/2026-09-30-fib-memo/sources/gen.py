"""Builds index.html for the Fibonacci memo reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from calltree import call_tree  # noqa: E402

VAL, NODES = call_tree(5)  # the calls fib(5) really makes, in call order
CALLS30, CALLS40, MEMO40 = 2_692_537, 331_160_281, 79  # verify.py recomputes each

R = Reel("Fibonacci: what does fib(30) cost?", "Would you ship this?")
a = R.anchor
a("fib", "fibonacci", 0.0)
a("under", "under")
a("otherwise", "otherwise")
a("clean", "clean")
a("ship", "ship")
a("ask", "ask")
a("thirty", "thirty")
a("million", "million")
a("forty", "forty")
a("million2", "million")
a("seconds", "seconds")
a("why", "why")
a("draw", "draw")
a("splits", "splits")
a("look", "look")
a("runs", "runs")
a("two", "two")
a("one", "one")
a("fifteen", "fifteen")
a("six", "six")
a("doubles", "doubles")
a("fix", "fix")
a("walk", "walk")
a("dictionary", "dictionary")
a("base", "base")
a("new", "new")
a("nosub", "subtree")
a("otherwise2", "otherwise")
a("store", "store")
a("now", "now")
a("seventy", "seventy")
a("micro", "microseconds")
a("catch", "catch")
a("thousand", "thousand")
a("exceeded", "exceeded")
a("see", "see")
a("memoize", "memoize")
a("turn", "turn")
a("six2", "six")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- hook: the lesson's three-line fib, which is correct
R.code("c0", Path("code/naive.py").read_text(), [
    (0.0, [1, 2, 3, 4], "Fibonacci in three lines"),
    (A["under"] - 0.2, [2, 3], "Under two: return n"),
    (A["otherwise"] - 0.2, [4], "Otherwise: add the two before it"),
    (A["clean"], [1, 2, 3, 4], 'Clean, and <span class="teal">correct</span>. Would you ship it?'),
], 0.0, A["ask"], top=440, font=34)

# --- the cost
show("#cost", A["ask"], A["why"], y=20)
pop("#co1", A["million"] - 0.2)
pop("#co2", A["forty"])
pop("#co3", A["million2"] - 0.2)
init("#co4", autoAlpha=0, scale=0.7)
k("#co4", A["seconds"] - 0.3, {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2.2)")
R.add('<div class="card" id="cost" data-layout-allow-overlap><div class="h">What does it cost?</div>'
      '<div class="call" style="position:absolute;top:130px">fib(30)</div>'
      f'<div class="val amb" id="co1" style="left:0;top:200px">{CALLS30:,} calls</div>'
      '<div class="call" id="co2" style="position:absolute;top:330px">fib(40)</div>'
      f'<div class="val amb" id="co3" style="left:0;top:400px">{CALLS40:,} calls</div>'
      '<div class="panel" id="co4" style="left:0;right:0;top:520px;padding:22px 30px"><div class="val amb" style="position:static;font-size:56px">14.5 seconds</div>'
      '<div class="mut mono" style="font-size:28px;margin-top:6px">our test run · Python</div></div></div>')

# --- fib(5)'s call tree, drawn from the recorded calls
kids = {}
for nid, n, par in NODES:
    kids.setdefault(par, []).append(nid)
depth, xs, leaf = {}, {}, [0]
def place(nid, d):
    depth[nid] = d
    ch = kids.get(nid, [])
    for c in ch:
        place(c, d + 1)
    if ch:
        xs[nid] = sum(xs[c] for c in ch) / len(ch)
    else:
        xs[nid] = leaf[0]
        leaf[0] += 1
place(0, 0)
NW, GAP, TOP, LV = 92, 118, 520, 118
X0 = (1080 - ((leaf[0] - 1) * GAP)) / 2
cx = lambda nid: X0 + xs[nid] * GAP
cy = lambda nid: TOP + depth[nid] * LV + NW / 2
assert max(depth.values()) == 4 and cy(max(depth, key=depth.get)) + NW / 2 < 1090  # stays above the tutor
T_OFF = A["fix"] - 0.2
show("#tree", A["draw"], A["fix"], y=12)
appear = R.spread(A["draw"] + 0.3, A["look"] - 0.2, len(NODES))
# a ring only on values the recorded tree computes more than once
REPEATED = {n for n in {m for _, m, _ in NODES} if sum(m == n for _, m, _ in NODES) > 1}
assert REPEATED == {3, 2, 1, 0}
edges, nodes = "", ""
for (nid, n, par), t in zip(NODES, appear):
    pop(f"#tn{nid}", t, d=0.25)
    if par is not None:
        init(f"#te{nid}", autoAlpha=0)
        k(f"#te{nid}", t, {"autoAlpha": 1}, 0.2)
        edges += f'<line id="te{nid}" x1="{cx(par)}" y1="{cy(par)}" x2="{cx(nid)}" y2="{cy(nid)}"/>'
    nodes += (f'<div class="tnode" id="tn{nid}" style="left:{cx(nid) - NW / 2}px;top:{cy(nid) - NW / 2}px">'
              f'<span>{n}</span>' + (f'<i class="rep" id="tr{nid}"></i>' if n in REPEATED else '') + '</div>')
# the repeats light up by value, on the words that name them
REP_T = {3: A["runs"] - 0.4, 2: A["two"], 1: A["one"], 0: A["one"] + 0.9}
assert set(REP_T) == REPEATED
for nid, n, _ in NODES:
    if n in REPEATED:
        pop(f"#tr{nid}", REP_T[n], d=0.3)
pop("#tq", A["fifteen"])
pop("#tO", A["doubles"])
R.add('<div id="tree" data-layout-allow-overlap><div class="h" style="position:absolute;left:80px;top:360px">fib(5): every call</div>'
      f'<svg class="tedges" width="1080" height="1920" viewBox="0 0 1080 1920">{edges}</svg>{nodes}'
      '<div class="chip" id="tq" style="position:absolute;left:80px;top:440px;font-size:30px">15 calls · 6 questions</div>'
      '<div class="val amb" id="tO" style="right:80px;top:428px;font-size:48px">O(2ⁿ)</div></div>')

# --- the fix, line by line
R.code("c1", Path("code/memo.py").read_text(), [
    (A["dictionary"] - 0.6, [1, 2, 3], "The memo: a dictionary, made fresh on the first call"),
    (A["base"] - 0.2, [4, 5], "Base case: under two, return n"),
    (A["new"] - 0.2, [6, 7], 'New: already solved? Return the saved answer'),
    (A["nosub"] - 0.4, [6, 7], '<span class="teal">No subtree at all</span>'),
    (A["otherwise2"] - 0.2, [8], "Otherwise: compute it once…"),
    (A["store"] - 0.2, [8, 9], "…store it, then return it"),
], A["walk"] - 0.1, A["now"], top=400, font=28)

# --- the payoff
show("#pay", A["now"], A["catch"], y=20)
pop("#py1", A["seventy"] - 0.2)
pop("#py2", A["seventy"] + 1.6)
init("#pb1", scaleX=0.001)
k("#pb1", A["seventy"] + 1.0, {"scaleX": 1}, 0.6, "power1.inOut")
init("#pb2", scaleX=0.001)
k("#pb2", A["micro"] - 0.5, {"scaleX": 0.01}, 0.3, "power1.inOut")
pop("#pv2", A["micro"])
init("#pv1", autoAlpha=0)
k("#pv1", A["seventy"] + 1.3, {"autoAlpha": 1}, 0.3)
R.add('<div class="card" id="pay" data-layout-allow-overlap><div class="h">Each value, once</div>'
      '<div class="val" style="left:0;top:110px">fib(40), memoized:</div>'
      f'<div class="val teal" id="py1" style="left:0;top:175px;font-size:56px">{MEMO40} calls</div>'
      f'<div class="val mut" id="py2" style="left:0;top:260px;font-size:32px">not {CALLS40:,} · O(n)</div>'
      '<div class="bar" style="top:350px"><div class="bl mono">naive fib(40)</div><div class="bt2"><div class="bf amb-bg" id="pb1"></div></div><div class="bv amb mono" id="pv1">14.5 s</div></div>'
      '<div class="bar" style="top:520px"><div class="bl mono">memoized fib(40)</div><div class="bt2"><div class="bf teal-bg" id="pb2"></div></div><div class="bv teal mono" id="pv2">7 µs</div></div></div>')

# --- the catch: still recursion
show("#lim", A["catch"], A["see"], y=20)
pop("#lm1", A["thousand"] - 0.2)
pop("#lm2", A["exceeded"] - 0.8)
R.add('<div class="card" id="lim" data-layout-allow-overlap><div class="h">One catch: still recursion</div>'
      '<div class="val" style="left:0;top:130px">every call is a stack frame</div>'
      '<div class="call" id="lm1" style="position:absolute;top:230px">fib(1000) <span class="mut" style="font-size:32px">memoized</span></div>'
      f'<div class="panel err" id="lm2" style="top:330px;height:150px">{KI.terminal_crash()}<div><span class="t">Python</span><span class="c amb">RecursionError: maximum<br/>recursion depth exceeded</span></div></div></div>')

# --- interview cue, challenge
show("#cue", A["see"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["memoize"] - 0.1, {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Same call twice<br/>in your tree?", "Memoize it")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["six2"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:48px;font-weight:700">naive fib(<span class="teal">6</span>)</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">How many <span class="teal">calls?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "cu-07-confident"), (A["clean"] - 0.1, "wu-06-thumbs-up"), (A["ship"] - 0.1, "cu-03-thinking"),
          (A["million"] - 0.1, "cu-04-surprised"), (A["seconds"] - 0.1, "cu-05b-cringe"), (A["draw"] - 0.2, "wu-02-pen-up"),
          (A["look"] - 0.2, "wu-03-point-side"), (A["doubles"] - 0.2, "wu-08-facepalm"), (A["fix"] - 0.1, "cu-07-confident"),
          (A["walk"] - 0.2, "wu-14-laptop"), (A["nosub"] - 0.2, "cu-08-excited"), (A["now"] - 0.2, "cu-02-explaining"),
          (A["micro"] - 0.1, "fb-05-celebrate"), (A["catch"] - 0.2, "cu-06-skeptical"), (A["exceeded"] - 0.4, "cu-05b-cringe"),
          (A["see"] - 0.2, "cu-02-explaining"), (A["turn"] - 0.2, "wu-04-open-palm"), (A["six2"] - 0.1, "cu-03-thinking"),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-07-confident")])
R.captions(amber={"million", "seconds", "twice", "doubles", "catch", "crashes", "exceeded"},
           teal={"memo", "memoize", "memoized", "once", "remember", "seventy", "microseconds", "leetexpert", "saved"},
           until=A["leet"])
R.write(Path("style.css").read_text())
