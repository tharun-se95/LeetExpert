"""Builds index.html for the call-stack reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from frames import factorial_events  # noqa: E402

N = 3
EV = factorial_events(N)
RET = {e[1]: e[2] for e in EV if e[0] == "return"}  # {0: 1, 1: 1, 2: 2, 3: 6}

R = Reel("Recursion goes down and comes back up", "Recursion")
a = R.anchor
a("down", "down", 0.0)
a("trays", "trays")
a("top", "top")
a("finish", "finish")
a("frame", "frame")
a("needs1", "needs")
a("needs2", "needs")
a("base", "base")
a("comes", "comes")
a("pops", "pops")
a("times1", "times")
a("pop1", "pop")
a("times2", "times")
a("pop2", "pop")
a("times3", "times")
a("last", "last")
a("six", "six")
a("deep", "deep")
a("code", "code")
a("floor", "floor")
a("otherwise", "otherwise")
a("smaller", "smaller")
a("waits2", "waits")
a("memory", "memory")
a("thousand", "thousand")
a("crashes", "crashes")
a("ten", "ten")
a("break", "break")
a("skip", "skip")
a("hang", "hang")
a("exceeded", "exceeded")
a("asked", "asked")
a("say", "say")
a("turn", "turn")
a("five", "five")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- hook
show("#hk", 0.0, A["trays"], y=0)
R.add('<div class="card" id="hk" data-layout-allow-overlap><div class="mono big" style="margin-top:160px">factorial(3)</div>'
      '<div class="mono big teal" style="margin-top:20px">= 3 × 2 × 1</div></div>')

# --- the trays
show("#tr", A["trays"], A["finish"], y=16)
pop("#tr2", A["top"])
trays = "".join(f'<div class="tray" style="top:{300 - j * 46}px;left:{160 + j * 6}px"></div>' for j in range(5))
R.add(f'<div class="card" id="tr" data-layout-allow-overlap><div class="h">A stack of cafeteria trays</div><div class="trays">{trays}</div>'
      '<div class="val" style="left:0;top:470px">every call: a fresh tray on top</div>'
      '<div class="val teal" id="tr2" style="left:0;top:550px">you only ever work on the top tray</div></div>')

# --- the call stack: frames stack up on the way down, fill in and pop on the way up
FX, FW, FLOOR, SLOT = 150, 780, 1000, 118
slot_top = lambda level: FLOOR - (level + 1) * SLOT  # level 0 = factorial(3) at the bottom
CALL_T = {3: A["finish"] - 0.2, 2: A["frame"] - 0.1, 1: A["needs1"] + 0.2, 0: A["needs2"] + 0.2}
FILL_T = {1: A["times1"], 2: A["times2"], 3: A["times3"]}
POP_T = {0: A["pops"], 1: A["pop1"], 2: A["pop2"], 3: A["last"]}
assert [e[1] for e in EV if e[0] == "call"] == [3, 2, 1, 0] and [e[1] for e in EV if e[0] == "return"] == [0, 1, 2, 3]
STACK_OFF = A["code"] - 0.2
for n in range(N + 1):
    sel = f"#fr{n}"
    init(sel, autoAlpha=0, y=-60)
    k(sel, CALL_T[n], {"autoAlpha": 1, "y": 0}, 0.35, "power2.out")
    k(sel, POP_T[n], {"autoAlpha": 0, "y": -70}, 0.35, "power2.in")
    if n > 0:
        R.swap([(f"#fw{n}", CALL_T[n]), (f"#ff{n}", FILL_T[n])], POP_T[n])
init("#fbase", autoAlpha=0)
k("#fbase", A["base"], {"autoAlpha": 1}, 0.2)
show("#down", A["finish"], A["comes"], y=8)
show("#up", A["comes"], STACK_OFF, y=8)
pop("#res", A["six"])
pop("#dep", A["deep"])
frames = ""
for n in range(N + 1):
    level = N - n
    right = (f'<span class="st amb" id="fbase">base case → 1</span>' if n == 0 else
             f'<span class="sts" data-layout-allow-overlap><span class="st mut" id="fw{n}">waiting: {n} × ?</span>'
             f'<span class="st teal" id="ff{n}">{n} × {RET[n - 1]} = {RET[n]}</span></span>')
    frames += f'<div class="fr" id="fr{n}" style="top:{slot_top(level)}px"><span class="fn">factorial({n})</span>{right}</div>'
R.add('<div id="stk" data-layout-allow-overlap>'
      f'<div class="dir" id="down">↓ winding down: each call waits</div><div class="dir teal" id="up">↑ unwinding: multiply on the way back</div>'
      f'{frames}<div class="floor" style="top:{FLOOR + 8}px"></div>'
      f'<div class="chip" id="res" style="position:absolute;left:{FX}px;top:{FLOOR + 30}px;font-size:36px">factorial(3) = {RET[3]}</div>'
      f'<div class="val" id="dep" style="left:{FX + 420}px;top:{FLOOR + 32}px">4 frames = n + 1</div></div>')
init("#stk", autoAlpha=1)
k("#stk", STACK_OFF, {"autoAlpha": 0}, 0.2)
k("#stk", R.RESET, {"autoAlpha": 1}, 0.01)

# --- the code, line by line
R.code("c1", Path("code/factorial.py").read_text(), [
    (A["floor"] - 0.5, [2, 3], "Base case: n is 0, return 1. The floor."),
    (A["otherwise"] - 0.2, [4], "Otherwise: n × factorial(n − 1)"),
    (A["smaller"] - 0.2, [4], "A smaller problem every call"),
    (A["waits2"] - 0.3, [4], "The multiply waits until the call comes back"),
], A["code"] - 0.1, A["memory"], top=440, font=36)

# --- limits
show("#lim", A["memory"], A["break"], y=20)
pop("#lm1", A["thousand"] - 0.2)
pop("#lm2", A["crashes"] - 0.2)
pop("#lm3", A["ten"] - 0.2)
R.add(f'<div class="card" id="lim" data-layout-allow-overlap><div class="h">Every frame costs memory</div>'
      '<div class="val" id="lm1" style="left:0;top:120px">Python: stops at 1,000 frames</div>'
      f'<div class="panel err" id="lm2" style="top:210px;height:150px">{KI.terminal_crash()}<div><span class="t">factorial(1000)</span><span class="c amb">RecursionError: maximum<br/>recursion depth exceeded</span></div></div>'
      '<div class="val" id="lm3" style="left:0;top:410px">JavaScript: around 10,000</div></div>')

# --- the broken base case
R.code("c2", Path("code/broken.py").read_text(), [
    (A["break"], [4], "Step down by 2 instead of 1…"),
    (A["skip"] - 0.4, [2, 4], '3 → 1 → −1 → −3 … <span class="amb">never 0</span>'),
    (A["hang"] - 0.2, [4], 'Not a hang: <span class="amb">a crash</span>'),
    (A["exceeded"] - 0.4, [4], '<span class="amb">RecursionError: maximum recursion<br/>depth exceeded</span>'),
], A["break"] - 0.1, A["asked"], top=440, font=36)

# --- interview cue, challenge
show("#cue", A["asked"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Space of a recursive<br/>function?", "O(n), one frame per call")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["five"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:48px;font-weight:700">factorial(<span class="teal">5</span>)</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">How many frames <span class="teal">deep?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "cu-07-confident"), (A["trays"] - 0.2, "wu-13-coffee"), (A["finish"] - 0.2, "wu-03-point-side"),
          (A["base"] - 0.1, "cu-02-explaining"), (A["comes"] - 0.2, "wu-03b-point-left"), (A["six"] - 0.1, "fb-05-celebrate"),
          (A["code"] - 0.2, "wu-14-laptop"), (A["memory"] - 0.2, "cu-10-serious"), (A["crashes"] - 0.1, "cu-05b-cringe"),
          (A["break"] - 0.2, "cu-06-skeptical"), (A["exceeded"] - 0.2, "wu-08-facepalm"), (A["asked"] - 0.2, "cu-02-explaining"),
          (A["turn"] - 0.2, "wu-04-open-palm"), (A["five"] - 0.1, "cu-03-thinking"), (A["leet"] - 0.2, "fb-03-present"),
          (R.RESET, "cu-07-confident")])
R.captions(amber={"crashes", "break", "skip", "exceeded", "hang"},
           teal={"base", "six", "pops", "pop", "frame", "frames", "leetexpert", "floor"},
           until=A["leet"])
R.write(Path("style.css").read_text())
