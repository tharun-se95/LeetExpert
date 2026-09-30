"""Builds index.html for the sliding-window reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from wintrace import window_trace  # noqa: E402

NUMS, TARGET = [2, 3, 1, 2, 4, 3], 7  # the lesson's trace; verify.py checks it against the lesson
TR = window_trace(TARGET, NUMS)

R = Reel("Sliding window, the inchworm", "Sliding window")
a = R.anchor
a("question", "question", 0.0)
a("squared", "squared")
a("inchworm", "inchworm")
a("stretches", "stretches")
a("pulls", "pulls")
a("watch", "watch")
a("grabs", "grabs")
a("six", "six")
a("eight", "eight")
a("record", "record")
a("pull1", "pull")
a("ten", "ten")
a("pull2", "pull")
a("again", "again")
a("nine", "nine")
a("pull3", "pull")
a("answer", "answer")
a("code", "code")
a("while", "while")
a("record2", "record")
a("subtract", "subtract")
a("both", "both")
a("test", "test")
a("ms", "milliseconds")
a("trap", "trap")
a("once", "once")
a("four", "four")
a("negatives", "negatives")
a("misses", "misses")
a("contig", "contiguous")
a("say", "say")
a("turn", "turn")
a("shortest", "shortest")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- the row and the inchworm window
CW, STEP, ROW = 136, 150, 470
X0 = (1080 - (5 * STEP + CW)) // 2
cx = lambda i: X0 + i * STEP
ROWS_OFF = A["code"] - 0.2
init("#row", autoAlpha=1)
k("#row", ROWS_OFF, {"autoAlpha": 0}, 0.2)
k("#row", R.RESET, {"autoAlpha": 1}, 0.4)
# states 0..9 animate; the last shrink (to [3]) happens after the answer is found, off screen
TIMES = [A["grabs"], A["grabs"] + 0.45, A["six"] - 0.15, A["eight"] - 0.2, A["pull1"], A["ten"] - 0.2,
         A["pull2"], A["again"], A["nine"] - 0.2, A["pull3"]]
STATES = TR[:len(TIMES)]
assert [(l, r) for _, l, r, _, _ in STATES] == [(0, 0), (0, 1), (0, 2), (0, 3), (1, 3), (1, 4), (2, 4), (3, 4), (3, 5), (4, 5)]
wx = lambda l: cx(l) - 12
ww = lambda l, r: (r - l) * STEP + CW + 24
init("#worm", autoAlpha=0, x=wx(0), width=ww(0, 0))
k("#worm", A["watch"], {"autoAlpha": 1}, 0.3)
for t, (_, l, r, _, _) in zip(TIMES, STATES):
    k("#worm", t, {"x": wx(l), "width": ww(l, r)}, 0.35, "power3.inOut")
k("#worm", ROWS_OFF, {"autoAlpha": 0}, 0.2)
# the readouts: the window's total, and the best length so far (recorded when the window is valid)
best, bests = None, []
for _, l, r, tot, _ in STATES:
    if tot >= TARGET:
        best = r - l + 1 if best is None else min(best, r - l + 1)
    bests.append(best)
assert bests[-1] == 2
R.swap([(f"#tot{j}", t) for j, t in enumerate(TIMES)], ROWS_OFF)
changes = [(j, b) for j, b in enumerate(bests) if b is not None and (j == 0 or bests[j - 1] != b)]
R.swap([(f"#best{j}", TIMES[j]) for j, _ in changes], ROWS_OFF)
show("#ask", A["question"], A["watch"], y=10)
pop("#n2", A["squared"])
pop("#ans", A["answer"])
tots = "".join(f'<div class="ro" id="tot{j}">window total = <span class="{"teal" if tot >= TARGET else "amb"}">{tot}</span>'
               f'<span class="mut"> {"≥ 7 ✓" if tot >= TARGET else "< 7"}</span></div>' for j, (_, l, r, tot, _) in enumerate(STATES))
bestv = "".join(f'<div class="ro" id="best{j}">shortest so far = <span class="teal">{b}</span></div>' for j, b in changes)
R.add('<div id="row" data-layout-allow-overlap>'
      '<div class="ask" id="ask">shortest stretch with sum ≥ 7?<br/><span class="amb" id="n2">every start × every end = O(n²)</span></div>'
      f'<div class="worm" id="worm" style="top:{ROW - 14}px"><i class="head"><b></b><b></b></i></div>'
      + "".join(f'<div class="cell" style="left:{cx(i)}px;top:{ROW}px">{v}</div><div class="ix" style="left:{cx(i)}px;top:{ROW + CW + 8}px">{i}</div>' for i, v in enumerate(NUMS))
      + f'<div class="ros" style="top:{ROW + 210}px" data-layout-allow-overlap>{tots}</div>'
      + f'<div class="ros" style="top:{ROW + 280}px" data-layout-allow-overlap>{bestv}</div>'
      + f'<div class="chip" id="ans" style="position:absolute;left:{X0}px;top:{ROW + 360}px">answer: [4, 3], length 2</div></div>')

# --- the inchworm, before the run
show("#inch", A["inchworm"], A["watch"], y=16)
pop("#i2", A["stretches"])
pop("#i3", A["pulls"])
R.add('<div class="low" id="inch" data-layout-allow-overlap style="top:800px"><div class="h" style="font-size:44px">front stretches forward <span class="teal" id="i2">→</span></div>'
      '<div class="h" style="font-size:44px;margin-top:14px">back pulls in <span class="teal" id="i3">→</span></div>'
      '<div class="mut mono" style="font-size:30px;margin-top:14px">neither end ever backs up</div></div>')

# --- the code, line by line
R.code("c1", Path("code/min_window.py").read_text(), [
    (A["code"], [5, 6], "<code>right</code> expands: add <code>nums[right]</code>"),
    (A["while"], [7], "While the total is big enough…"),
    (A["record2"], [8], "…record the length"),
    (A["subtract"], [9, 10], "drop <code>nums[left]</code>, move <code>left</code> on"),
    (A["both"], [5, 7], 'Both only move forward: <span class="teal">O(n)</span>'),
], A["code"] - 0.1, A["test"], top=370, font=29)

# --- benchmark
BR_MS, W_MS = 848, 1.18
show("#bench", A["test"], A["trap"], y=20)
init("#bf1", scaleX=0.001)
k("#bf1", A["test"] + 0.8, {"scaleX": 1}, 0.9, "power1.inOut")
init("#bf2", scaleX=0.001)
k("#bf2", A["ms"] + 0.3, {"scaleX": 0.012}, 0.3, "power1.inOut")
pop("#bv1", A["ms"] - 0.2)
pop("#bv2", A["ms"] + 0.6)
R.add('<div class="card" id="bench" data-layout-allow-overlap><div class="h">10,000 numbers</div><div class="mut mono" style="font-size:30px;margin-top:6px">our test run · Python</div>'
      f'<div class="bar" style="top:200px"><div class="bl mono">every start × every end</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">{BR_MS} ms</div></div>'
      f'<div class="bar" style="top:400px"><div class="bl mono">sliding window</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">{W_MS} ms</div></div></div>')

# --- the trap: if instead of while
show("#trapc", A["trap"], A["negatives"], y=20)
pop("#tr1", A["once"])
pop("#tr2", A["four"])
R.add('<div class="card" id="trapc" data-layout-allow-overlap><div class="h">The trap: <span class="amb">if</span> instead of <span class="teal">while</span></div>'
      '<div class="panel code" style="top:130px"><div class="ln"><span><span class="tk">while</span> total &gt;= target:</span><span class="teal">✓ 2</span></div>'
      '<div class="ln" id="tr2"><span><span class="tk">if</span> total &gt;= target:</span><span class="amb">✗ 4</span></div></div>'
      '<div class="val amb" id="tr1" style="left:0;top:390px">shrinks at most once per step:<br/>the window never gets tight</div></div>')

# --- the caveat: negatives
show("#neg", A["negatives"], A["contig"], y=20)
pop("#ng2", A["misses"])
R.add('<div class="card" id="neg" data-layout-allow-overlap><div class="h">Needs non-negative numbers</div>'
      '<div class="mono" style="position:absolute;top:130px;font-size:40px;font-weight:700">target 5, [4, <span class="amb">−2</span>, <span class="amb">−3</span>, 4, 1]</div>'
      '<div class="val amb" style="left:0;top:240px">window: 0 (nothing found)</div>'
      '<div class="val teal" id="ng2" style="left:0;top:320px">but [4, 1] = 5, length 2</div>'
      '<div class="mut mono" style="position:absolute;top:430px;font-size:32px">with negatives, shrinking can<br/>raise the total</div></div>')

# --- interview cue, challenge
show("#cue", A["contig"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Contiguous, subarray,<br/>substring?", "sliding window")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["shortest"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:44px;font-weight:700">target <span class="teal">11</span>, [1, 2, 3, 4, 5]</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">Shortest <span class="teal">length?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "cu-07-confident"), (A["question"], "wu-03-point-side"), (A["squared"] - 0.1, "cu-06-skeptical"),
          (A["inchworm"] - 0.2, "cu-09-wink"), (A["watch"] - 0.2, "wu-03-point-side"), (A["eight"] - 0.1, "cu-08-excited"),
          (A["ten"] - 0.2, "wu-02-pen-up"), (A["pull3"] - 0.1, "cu-02-explaining"), (A["answer"] - 0.1, "fb-05-celebrate"),
          (A["code"] - 0.2, "wu-14-laptop"), (A["both"] - 0.1, "cu-07-confident"), (A["test"] - 0.2, "wu-05-tablet"),
          (A["ms"] + 0.4, "cu-04-surprised"), (A["trap"] - 0.2, "cu-10-serious"), (A["four"] - 0.2, "wu-08-facepalm"),
          (A["negatives"] - 0.2, "cu-05-worried"), (A["contig"] - 0.2, "cu-02-explaining"), (A["turn"] - 0.2, "wu-04-open-palm"),
          (A["shortest"] - 0.1, "cu-03-thinking"), (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-07-confident")])
R.captions(amber={"squared", "trap", "if", "never", "negatives", "misses", "overreached"},
           teal={"window", "inchworm", "while", "answer", "leetexpert", "contiguous", "forward"},
           until=A["leet"])
R.write(Path("style.css").read_text())
