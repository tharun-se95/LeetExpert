"""Builds index.html for the monotonic-stack reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from mstrace import stack_events  # noqa: E402

NUMS = [2, 1, 5, 3]  # the lesson's viz; verify.py reads it from the lesson
EV = stack_events(NUMS)

R = Reel("Next greater element has a shape", "Monotonic stack")
a = R.anchor
a("bigger", "bigger", 0.0)
a("squared", "squared")
a("concert", "concert")
a("blocked", "blocked")
a("taller", "taller")
a("stack", "stack")
a("watch", "watch")
a("arr1", "arrives")
a("push_a", "push")
a("arr2", "arrives")
a("push_b", "push")
a("arr3", "arrives")
a("pop1", "pop")
a("pop2", "pop")
a("push_c", "push")
a("arr4", "arrives")
a("push_d", "push")
a("end", "end")
a("minus", "minus")
a("code", "code")
a("starts", "starts")
a("indexes", "indexes")
a("while", "while")
a("write", "write")
a("push_e", "push")
a("once", "once")
a("test", "test")
a("ms", "milliseconds")
a("trap", "trap")
a("values", "values")
a("where", "where")
a("duplicates", "duplicates")
a("second", "second")
a("see", "see")
a("say", "say")
a("turn", "turn")
a("list", "list")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- the trace: nums row, answer row, and the stack as a column on the right
CW, STEP, X0, ROW_N, ROW_A = 130, 150, 90, 430, 720
SX, FLOOR, SLOT = 800, 960, 120
cx = lambda i: X0 + i * STEP
TRACE_OFF = A["code"] - 0.2
# the rows are frame 1 of the loop, so they start drawn; they step aside for the concert
init("#trace", autoAlpha=1)
k("#trace", A["concert"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#trace", A["watch"], {"autoAlpha": 1}, 0.25)
k("#trace", TRACE_OFF, {"autoAlpha": 0}, 0.2)
k("#trace", R.RESET, {"autoAlpha": 1}, 0.4)
init("#sq", autoAlpha=0, scale=0.7)
k("#sq", A["squared"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2.2)")
k("#sq", A["concert"] - 0.2, {"autoAlpha": 0}, 0.2)
# arrival ring
ARR = [A["arr1"], A["arr2"], A["arr3"], A["arr4"]]
init("#ring", autoAlpha=0, x=cx(0) - 9)
k("#ring", ARR[0], {"autoAlpha": 1}, 0.2)
for i in (1, 2, 3):
    k("#ring", ARR[i], {"x": cx(i) - 9}, 0.3, "power3.inOut")
k("#ring", A["end"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#ring", R.RESET, {"x": cx(0) - 9}, 0.01)
# pushes and pops, in the algorithm's order, on the narration's words
TIMES = {("push", 0): A["push_a"], ("push", 1): A["push_b"], ("pop", 1): A["pop1"], ("pop", 0): A["pop2"],
         ("push", 2): A["push_c"], ("push", 3): A["push_d"]}
depth, stack = {}, []
for e in EV:
    if e[0] == "push":
        depth[e[1]] = len(stack); stack.append(e[1])
    else:
        stack.pop()
slot_y = lambda d: FLOOR - (d + 1) * SLOT
for e in EV:
    kind, i = e[0], e[1]
    t = TIMES[(kind, i)]
    if kind == "push":
        init(f"#sb{i}", autoAlpha=0, scale=0.6, x=0, y=0)
        k(f"#sb{i}", t, {"autoAlpha": 1, "scale": 1}, 0.3, "back.out(2)")
    else:
        # fly to the answer cell it just got, and fade
        dx, dy = cx(i) - SX, ROW_A - slot_y(depth[i])
        k(f"#sb{i}", t, {"x": dx, "y": dy, "scale": 0.5, "autoAlpha": 0}, 0.45, "power2.in")
        R.swap([(f"#av{i}", t + 0.35)], TRACE_OFF)
for i in (2, 3):  # still stacked at the end: no greater element
    k(f"#sb{i}", A["end"] + 0.2, {"scale": 0.9}, 0.2)
init("#a23", autoAlpha=0)
k("#a23", A["minus"] - 0.1, {"autoAlpha": 1}, 0.3)
k("#a23", TRACE_OFF, {"autoAlpha": 0}, 0.1)
for i in (2, 3):  # the survivors clear away so the loop restarts on an empty stack
    k(f"#sb{i}", TRACE_OFF, {"autoAlpha": 0}, 0.2)
R.add('<div id="trace" data-layout-allow-overlap>'
      '<div class="lab" style="left:90px;top:385px">nums</div>'
      + "".join(f'<div class="cell" style="left:{cx(i)}px;top:{ROW_N}px">{v}</div><div class="ix" style="left:{cx(i)}px;top:{ROW_N + CW + 6}px">i={i}</div>' for i, v in enumerate(NUMS))
      + f'<div class="ring" id="ring" style="top:{ROW_N - 9}px"></div>'
      + f'<div class="lab" style="left:90px;top:{ROW_A - 45}px">answer</div>'
      + "".join(f'<div class="cell ans" style="left:{cx(i)}px;top:{ROW_A}px">-1</div>' for i in range(4))
      + "".join(f'<div class="cell ans got" id="av{i}" data-layout-allow-overlap style="left:{cx(i)}px;top:{ROW_A}px">{NUMS[2]}</div>' for i in (0, 1))
      + f'<div class="val amb" id="a23" style="left:{cx(2)}px;top:{ROW_A + CW + 10}px;font-size:28px">no greater → −1</div>'
      + f'<div class="lab" style="left:{SX}px;top:{FLOOR + 10}px">stack</div><div class="floor" style="left:{SX - 10}px;top:{FLOOR}px"></div>'
      + "".join(f'<div class="sbox" id="sb{i}" style="left:{SX}px;top:{slot_y(depth[i])}px"><b>{NUMS[i]}</b><span>i={i}</span></div>' for i in range(4))
      + '<div class="chip amb-chip" id="sq" style="position:absolute;left:90px;top:1000px">check right of each: O(n²)</div></div>')

# --- the concert
show("#conc", A["concert"], A["watch"], y=16)
pop("#cc2", A["blocked"])
pop("#cc3", A["taller"])
people = "".join(f'<div class="ppl" style="left:{80 + j * 130}px;height:{h}px"></div>' for j, h in enumerate([150, 120, 260, 180, 140, 300]))
R.add(f'<div class="card" id="conc" data-layout-allow-overlap><div class="h">A concert crowd</div><div class="crowd">{people}</div>'
      '<div class="val" id="cc2" style="left:0;top:440px">someone tall in front: everyone<br/>shorter behind them is blocked</div>'
      '<div class="val teal" id="cc3" style="left:0;top:580px">only taller people ever matter again</div></div>')

# --- the code, line by line
R.code("c1", Path("code/next_greater.py").read_text(), [
    (A["starts"] - 0.3, [2], "<code>answer</code> starts full of −1"),
    (A["indexes"] - 0.3, [3], 'The stack holds <span class="teal">indexes</span>, not values'),
    (A["while"] - 0.2, [5], "While the top is smaller than <code>x</code>…"),
    (A["write"] - 0.3, [6], "…pop it: <code>x</code> is its answer"),
    (A["push_e"] - 0.2, [7], "Then push this index"),
    (A["once"] - 0.3, [4, 5, 6, 7], 'Each index in once, out at most once:<br/><span class="teal">O(n)</span>'),
], A["code"] - 0.1, A["test"], top=400, font=31)

# --- benchmark
show("#bench", A["test"], A["trap"], y=20)
init("#bf1", scaleX=0.001)
k("#bf1", A["test"] + 0.8, {"scaleX": 1}, 0.9, "power1.inOut")
init("#bf2", scaleX=0.001)
k("#bf2", A["ms"] + 0.3, {"scaleX": 0.012}, 0.3, "power1.inOut")
pop("#bv1", A["ms"] - 0.2)
pop("#bv2", A["ms"] + 0.6)
R.add('<div class="card" id="bench" data-layout-allow-overlap><div class="h">10,000 numbers</div><div class="mut mono" style="font-size:30px;margin-top:6px">our test run · Python</div>'
      '<div class="bar" style="top:200px"><div class="bl mono">check right of every number</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">953 ms</div></div>'
      '<div class="bar" style="top:400px"><div class="bl mono">monotonic stack</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">0.6 ms</div></div></div>')

# --- the trap: values instead of indexes
show("#trapc", A["trap"], A["see"], y=20)
pop("#tp2", A["where"] - 0.2)
pop("#tp3", A["duplicates"] + 0.3)
pop("#tp4", A["second"] - 0.2)
R.add('<div class="card" id="trapc" data-layout-allow-overlap><div class="h">The trap: <span class="amb">values</span>, not indexes</div>'
      '<div class="panel code" style="top:120px"><div class="ln"><span>stack.append(x)</span></div>'
      '<div class="ln"><span>answer[nums.index(stack.pop())] = x</span></div></div>'
      '<div class="val" id="tp2" style="left:0;top:340px">popped a value: where does its answer go?</div>'
      '<div class="val amb" id="tp3" style="left:0;top:430px">[1, 1, 3] → [3, −1, −1] ✗</div>'
      '<div class="val mut" id="tp4" style="left:0;top:510px">index(1) finds the first 1 twice;<br/>the second 1 never gets its 3</div></div>')

# --- interview cue, challenge
show("#cue", A["see"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Next greater, next smaller,<br/>days until warmer?", "monotonic stack")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["list"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:44px;font-weight:700">[4, 3, 2, 5]</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">Next greater <span class="teal">list?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "cu-07-confident"), (A["squared"] - 0.1, "cu-06-skeptical"), (A["concert"] - 0.2, "wu-01-wave"),
          (A["stack"] - 0.2, "cu-02-explaining"), (A["watch"] - 0.2, "wu-03-point-side"), (A["pop1"] - 0.1, "cu-08-excited"),
          (A["end"] - 0.2, "wu-03-point-side"), (A["code"] - 0.2, "wu-14-laptop"), (A["once"] - 0.2, "cu-07-confident"),
          (A["test"] - 0.2, "wu-05-tablet"), (A["trap"] - 0.2, "cu-10-serious"), (A["duplicates"] - 0.1, "wu-08-facepalm"),
          (A["see"] - 0.2, "cu-02-explaining"), (A["turn"] - 0.2, "wu-04-open-palm"), (A["list"] - 0.1, "cu-03-thinking"),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-07-confident")])
R.captions(amber={"squared", "trap", "values", "duplicates", "blocked"},
           teal={"stack", "pop", "indexes", "once", "leetexpert", "monotonic", "taller"},
           until=A["leet"])
R.write(Path("style.css").read_text())
