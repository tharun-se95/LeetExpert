"""Builds index.html for the max-sum-of-k reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402

R = Reel("Max sum of k in a row", "Would you ship this?")
a = R.anchor
a("looks", "looks", 0.0)
a("passes", "passes")
a("correct", "correct")
a("ship", "ship")
a("try", "try")
a("five", "five")
a("twelve", "twelve")
a("infinity", "infinity")
a("why", "why")
a("count", "count")
a("zero", "zero")
a("one", "one")
a("two", "two")
a("plus", "plus")
a("walk", "walk")
a("starts", "starts")
a("each", "each")
a("short", "short")
a("last", "last")
a("never", "never")
a("fix", "fix")
a("second", "second")
a("scratch", "scratch")
a("slide", "slide")
a("first", "first")
a("entering", "entering")
a("leaving", "leaving")
a("keep", "keep")
a("per", "per")
a("test", "test")
a("seconds", "seconds")
a("ms", "milliseconds")
a("see", "see")
a("turn", "turn")
a("fit", "fit")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop
BUG = Path("code/bug.py").read_text()

# --- hook: the AI's code passes the sample
R.code("c0", BUG, [
    (0.0, [1, 2, 3, 4, 5], "Max sum of k numbers in a row."),
    (A["passes"], [1, 2, 3, 4, 5], '<code>[2, 1, 5, 1, 3, 2], k = 3</code> → <span class="teal">9 ✓</span>'),
    (A["ship"], [1, 2, 3, 4, 5], "Would you ship it?"),
], 0.0, A["try"], top=410, font=31)
init("#ai", autoAlpha=0, x=20)
k("#ai", A["looks"], {"autoAlpha": 1, "x": 0}, 0.3, "back.out(2)")
k("#ai", A["try"] - 0.2, {"autoAlpha": 0}, 0.2)
R.add(f'<div class="aibadge" id="ai">{KI.robot()}AI · passes the sample</div>')

# --- the failing inputs
show("#fail", A["try"], A["count"], y=20)
pop("#f1", A["five"])
pop("#f2", A["twelve"])
pop("#f3", A["infinity"])
R.add('<div class="card" id="fail" data-layout-allow-overlap><div class="call">max_sum_k(<span class="teal">[1, 2, 3, 9]</span>, 2)</div>'
      '<div class="val amb" id="f1" style="left:0;top:110px;font-size:64px">→ 5 ✗</div>'
      '<div class="val teal" id="f2" style="left:0;top:210px">answer: 12 (3 + 9)</div>'
      '<div class="panel" id="f3" style="left:0;right:0;top:340px;padding:24px 30px"><div class="call" style="font-size:38px">max_sum_k([4, 5], 2)</div>'
      '<div class="val amb" style="position:static;margin-top:10px">→ -inf ✗ (k is the whole length)</div></div></div>')

# --- count the windows: a 2-wide frame on 4 numbers fits at 3 starts
NUMS, K = [1, 2, 3, 9], 2
CW, STEP, ROW = 150, 170, 520
X0 = (1080 - (3 * STEP + CW)) // 2
show("#cnt", A["count"], A["walk"], y=20)
init("#frm", autoAlpha=0, x=X0 - 12)
k("#frm", A["zero"] - 0.2, {"autoAlpha": 1}, 0.25)
k("#frm", A["one"] - 0.1, {"x": X0 + STEP - 12}, 0.35, "power3.inOut")
k("#frm", A["two"] - 0.1, {"x": X0 + 2 * STEP - 12}, 0.35, "power3.inOut")
for j, t in enumerate((A["zero"], A["one"], A["two"])):
    pop(f"#st{j}", t)
pop("#nk", A["plus"] - 0.3)
R.add('<div class="card" id="cnt" data-layout-allow-overlap style="top:360px"><div class="h">Count the windows</div></div>'
      + f'<div id="cntrow" data-layout-allow-overlap>'
      + "".join(f'<div class="cell" style="left:{X0 + i * STEP}px;top:{ROW}px">{v}</div>' for i, v in enumerate(NUMS)) + '</div>'
      + f'<div class="frame" id="frm" style="top:{ROW - 12}px;width:{(K - 1) * STEP + CW + 24}px"></div>'
      + "".join(f'<div class="stl" id="st{j}" style="left:{X0 + j * STEP}px;top:{ROW + CW + 20}px">start {j}</div>' for j in range(3))
      + f'<div class="val" id="nk" style="left:{X0}px;top:{ROW + CW + 100}px">3 windows = n − k <span class="teal">+ 1</span></div>')
init("#cntrow", autoAlpha=0)
k("#cntrow", A["count"], {"autoAlpha": 1}, 0.3)
k("#cntrow", A["walk"] - 0.2, {"autoAlpha": 0}, 0.2)
for sel in ("#frm", "#st0", "#st1", "#st2", "#nk"):
    k(sel, A["walk"] - 0.2, {"autoAlpha": 0}, 0.2)

# --- walk the AI's code
R.code("c1", BUG, [
    (A["starts"] - 0.3, [2], "<code>best</code> starts at negative infinity"),
    (A["each"], [3, 4], "For each start <code>i</code>: sum k numbers,<br/>keep the biggest"),
    (A["short"], [3], '<code>range(n − k)</code> = range(2): starts <span class="amb">0, 1</span>'),
    (A["last"], [3], 'Start 2, <code>[3, 9]</code>: <span class="amb">never checked</span>'),
    (A["fix"], [3], 'Fix: <code>range(len(nums) - k + 1)</code>'),
], A["walk"] - 0.1, A["second"], top=410, font=31)

# --- the second problem, and the slide
show("#scr", A["second"], A["slide"], y=20)
pop("#scr2", A["scratch"] + 0.4)
R.add('<div class="card" id="scr" data-layout-allow-overlap><div class="h">Second problem</div>'
      '<div class="val" style="left:0;top:130px">every window summed from scratch:</div>'
      '<div class="val amb" id="scr2" style="left:0;top:210px;font-size:56px">k additions × every window<br/>= O(n·k)</div></div>')
R.code("c2", Path("code/slide.py").read_text(), [
    (A["slide"], [1], "Slide the frame instead"),
    (A["first"], [2, 3], "Sum the first window once"),
    (A["entering"] - 0.3, [4, 5], "+ the number entering on the right,<br/>− the one leaving on the left"),
    (A["keep"], [6], "Keep the best"),
    (A["per"], [4, 5], 'One add, one subtract per step: <span class="teal">O(n)</span>'),
], A["slide"] - 0.1, A["test"], top=410, font=29)

# --- benchmark
RS_S, SL_MS = 12.35, 11.7
show("#bench", A["test"], A["see"], y=20)
init("#bf1", scaleX=0.001)
k("#bf1", A["test"] + 0.8, {"scaleX": 1}, 1.0, "power1.inOut")
init("#bf2", scaleX=0.001)
k("#bf2", A["ms"] - 0.4, {"scaleX": 0.012}, 0.3, "power1.inOut")
pop("#bv1", A["seconds"])
pop("#bv2", A["ms"])
R.add('<div class="card" id="bench" data-layout-allow-overlap><div class="h">100,000 numbers, k = 10,000</div><div class="mut mono" style="font-size:30px;margin-top:6px">our test run · Python</div>'
      f'<div class="bar" style="top:200px"><div class="bl mono">sum every window (with the +1 fix)</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">{RS_S} s</div></div>'
      f'<div class="bar" style="top:400px"><div class="bl mono">slide the sum</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">{SL_MS} ms</div></div></div>')

# --- interview cue, challenge
show("#cue", A["see"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["see"] + 1.2, {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("k numbers in a row?", "n − k + 1, then slide")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["fit"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:44px;font-weight:700">10 numbers, k = <span class="teal">3</span></div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">How many windows <span class="teal">fit?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "cu-07-confident"), (A["looks"] - 0.1, "wu-14-laptop"), (A["correct"] - 0.1, "wu-06-thumbs-up"),
          (A["ship"] - 0.1, "cu-03-thinking"), (A["try"] - 0.1, "wu-05-tablet"), (A["twelve"] - 0.1, "cu-04-surprised"),
          (A["infinity"] - 0.1, "cu-05b-cringe"), (A["count"] - 0.2, "wu-03-point-side"), (A["walk"] - 0.2, "wu-02-pen-up"),
          (A["never"] - 0.1, "wu-08-facepalm"), (A["fix"] - 0.1, "cu-07-confident"), (A["second"] - 0.2, "cu-06-skeptical"),
          (A["slide"] - 0.2, "wu-03b-point-left"), (A["per"] - 0.1, "cu-02-explaining"), (A["test"] - 0.2, "wu-14-laptop"),
          (A["ms"] - 0.1, "cu-08-excited"), (A["see"] - 0.2, "cu-02-explaining"), (A["turn"] - 0.2, "wu-04-open-palm"),
          (A["fit"] - 0.1, "cu-03-thinking"), (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-07-confident")])
R.captions(amber={"five", "infinity", "short", "never", "scratch", "seconds", "second"},
           teal={"twelve", "plus", "fix", "slide", "sliding", "milliseconds", "leetexpert", "count", "windows"},
           until=A["leet"])
R.write(Path("style.css").read_text())
