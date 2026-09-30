"""Builds index.html for the remove-while-iterating reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
import icons as I  # noqa: E402
from viz import ArrayViz, load, trace  # noqa: E402

R = Reel("Remove while iterating", "Would you ship this?")
a = R.anchor
a("ai", "ai", 0.0)
a("passes", "passes")
a("ship", "ship")
a("try", "try")
a("get", "get")
a("survived", "survived")
a("seats", "seats")
a("zero", "zero")
a("out", "out")
a("slides", "slides")
a("moves", "moves")
a("nobody", "nobody")
a("walk", "walk")
a("hidden", "hidden")
a("forward", "forward")
a("remove", "remove")
a("lands", "lands")
a("skips", "skips")
a("fix", "fix")
a("build", "build")
a("keeping", "keeping")
a("fix2", "fix")
a("read", "read")
a("visits", "visits")
a("keeper", "keeper")
a("never", "never")
a("cut", "cut")
a("slow", "slow")
a("hundred", "hundred")
a("eight", "eight")
a("ms", "milliseconds")
a("dictionary", "dictionary")
a("runtime", "runtime")
a("lists", "lists")
a("changing", "changing")
a("say", "say")
a("turn", "turn")
a("buggy", "buggy")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop
BUG = Path("code/bug.py").read_text()

# --- hook: the AI's code passes the sample test
R.code("c0", BUG, [
    (0.0, [1, 2, 3, 4, 5], "Remove the even numbers."),
    (A["passes"], [1, 2, 3, 4, 5], '<code>remove_evens([1, 2, 3])</code> → <span class="teal">[1, 3] ✓</span>'),
    (A["ship"], [1, 2, 3, 4, 5], "Would you ship it?"),
], 0.0, A["try"], top=410, font=34)
init("#ai", autoAlpha=0, x=20)
k("#ai", A["ai"] - 0.1, {"autoAlpha": 1, "x": 0}, 0.3, "back.out(2)")
k("#ai", A["try"] - 0.2, {"autoAlpha": 0}, 0.2)
R.add(f'<div class="aibadge" id="ai">{KI.robot()}AI · 2 seconds</div>')

# --- the failing test
show("#test", A["try"], A["seats"], y=20)
for j in range(4):
    pop(f"#in{j}", A["try"] + 0.3 + j * 0.08, 0.25)
for j in range(2):
    pop(f"#o{j}", A["get"] + j * 0.12, 0.3)
init("#o0c", borderColor="#263248", color="#f1f4f9")
k("#o0c", A["survived"] - 0.9, {"borderColor": "#fbbf24", "color": "#fbbf24"}, 0.3)
pop("#surv", A["survived"] - 0.9)
cells = lambda ids, vals, cls="": "".join(f'<div class="cell {cls}" id="{i}">{v}</div>' for i, v in zip(ids, vals))
R.add('<div class="card" id="test" data-layout-allow-overlap><div class="call">remove_evens(<span class="teal">[2, 4, 6, 7]</span>)</div>'
      f'<div class="cells" style="left:0;top:110px">{cells([f"in{j}" for j in range(4)], [2, 4, 6, 7])}</div>'
      '<div class="call mut" style="position:absolute;top:300px">returns</div>'
      f'<div class="cells" style="left:0;top:380px"><div id="o0"><div class="cell" id="o0c">4</div></div><div id="o1"><div class="cell">7</div></div></div>'
      '<div class="tag amb" id="surv" style="left:0;top:560px;font-size:44px">4 is even. It survived.</div></div>')

# --- the seats: the loop's finger moves on while the row slides under it
SX = [70 + 200 * j for j in range(4)]
SEAT_T, FING_T = 250, 120
show("#seats", A["seats"], A["walk"], y=20)
fx = lambda s: SX[s] + 58
init("#fg", autoAlpha=0, x=fx(0), y=-30)
k("#fg", A["seats"] + 0.6, {"autoAlpha": 1, "y": 0}, 0.3, "back.out(2)")
k("#fg", A["moves"], {"x": fx(1)}, 0.4, "power3.inOut")
tail = R.spread(A["nobody"] + 0.9, A["walk"] - 0.4, 4)  # the second removal, played fast
k("#fg", tail[2], {"x": fx(2)}, 0.3, "power3.inOut")
for j in range(4):
    init(f"#px{j}", autoAlpha=1, x=0, y=0)
k("#px0", A["out"] + 0.2, {"autoAlpha": 0, "y": -140}, 0.45, "power2.in")
for j in (1, 2, 3):
    k(f"#px{j}", A["slides"] + 0.1 + (j - 1) * 0.06, {"x": -200}, 0.45, "power3.inOut")
k("#px2", tail[0], {"autoAlpha": 0, "y": -140}, 0.35, "power2.in")
k("#px3", tail[1], {"x": -400}, 0.35, "power3.inOut")
show("#t0", A["out"], A["nobody"] + 0.1, y=10)
pop("#ring", A["nobody"])
pop("#t1", A["nobody"] + 0.1)
pop("#t2", tail[2] + 0.1)
seats = "".join(f'<div class="seat" style="left:{x}px;top:{SEAT_T}px">{I.seat()}</div><div class="slab" style="left:{x}px;top:{SEAT_T + 210}px">seat {j}</div>' for j, x in enumerate(SX))
pax = "".join(f'<div class="pax" id="px{j}" style="left:{SX[j] + 30}px;top:{SEAT_T + 22}px">{v}</div>' for j, v in enumerate([2, 4, 6, 7]))
R.add(f'<div class="card" id="seats" data-layout-allow-overlap><div class="h">Checking tickets, seat by seat</div>{seats}{pax}'
      f'<div class="fing" id="fg" style="top:{FING_T}px">{I.finger()}</div>'
      f'<div class="tag amb" id="t0" style="left:0;top:{SEAT_T + 270}px;font-size:40px">2 is even: out. Everyone slides left.</div>'
      f'<div class="ring" id="ring" style="left:{SX[0] + 15}px;top:{SEAT_T + 7}px"></div>'
      f'<div class="tag amb" id="t1" style="left:0;top:{SEAT_T + 270}px;font-size:40px">4 slid into seat 0. Nobody checked it.</div>'
      f'<div class="tag mut" id="t2" style="left:0;top:{SEAT_T + 340}px">i = 2 is past the end: loop stops → [4, 7]</div></div>')

# --- the buggy code, line by line
R.code("c1", BUG, [
    (A["walk"], [2], "<code>for n in nums</code> walks by position: 0, 1, 2…"),
    (A["forward"], [2], "The position moves forward every time,<br/>no matter what"),
    (A["remove"], [3, 4], "<code>remove(n)</code> deletes it and shifts<br/>everything after it one step left"),
    (A["lands"], [2, 3, 4], 'The next item lands in the slot<br/>you just checked: <span class="amb">skipped</span>'),
], A["walk"] - 0.1, A["fix"], top=380, font=34)

# under it, the shown bug's own run on the failing test
NUMS = [2, 4, 6, 7]
EV, RES = trace(load("code/bug.py", "remove_evens"), list(NUMS))
bug_st, pos, seen = [], -1, set()
for j, (ln, sn) in enumerate(EV):
    nxt = EV[j + 1][0] if j + 1 < len(EV) else None
    if ln == 2 and nxt == 3:
        pos += 1
        seen.add(sn["n"])
        skipped = [v for v in sn["nums"][:pos] if v not in seen]
        bug_st.append({"vals": sn["nums"], "ptr": {"position": pos}, "mark": {pos: "amb"},
                       "note": f"position {pos}: n = {sn['n']}" + (f" · {skipped[0]} never checked" if skipped else "")})
    elif ln == 4:
        bug_st.append({"vals": sn["nums"], "ptr": {"position": pos}, "note": f"remove({sn['n']}): the rest slide left"})
evens = [v for v in RES if v % 2 == 0]
bug_st.append({"vals": RES, "mark": {i: "amb" for i, v in enumerate(RES) if v % 2 == 0}, "note": f"returns {RES}: {evens[0]} survived"})
bug_t = [A["walk"], A["remove"], A["lands"], (A["lands"] + A["skips"]) / 2, A["skips"] - 0.2]
assert len(bug_t) == len(bug_st), (len(bug_t), len(bug_st))
ArrayViz(R, "bv", NUMS, list(zip(bug_t, bug_st)), A["walk"] - 0.1, A["fix"], top=R.code_bottom + 4,
         pointers=[("position", "amb", "below")])

# --- fix 1: a new list
R.code("c2", Path("code/fix_new_list.py").read_text(), [
    (A["fix"], [1, 2], "Fix 1: don't edit the list you're reading"),
    (A["build"], [2], "Build a new one: keep <code>n</code> only if it's odd<br/><code>[2, 4, 6, 7]</code> → <span class=\"teal\">[7] ✓</span>"),
], A["fix"] - 0.1, A["fix2"], top=420, font=32, note_top=720)
KEEP = load("code/fix_new_list.py", "remove_evens")(list(NUMS))
ArrayViz(R, "nv", NUMS, [(A["fix"], {}), (A["build"], {"mark": {i: "teal" for i, v in enumerate(NUMS) if v in KEEP},
                                                        "dim": {i for i, v in enumerate(NUMS) if v not in KEEP}, "note": f"new list: {KEEP}"})],
         A["fix"] - 0.1, A["fix2"], top=R.code_bottom + 4)

# --- fix 2: read/write pointers, in place (the course's stable-compaction template)
R.code("c3", Path("code/fix_in_place.py").read_text(), [
    (A["fix2"], [1], "Fix 2: in place, O(1) extra memory"),
    (A["read"], [2, 3], "<code>read</code> scans; <code>write</code> marks where<br/>the next keeper goes"),
    (A["visits"], [3], "<code>read</code> visits every item"),
    (A["keeper"], [4, 5, 6], "A keeper? Copy it to <code>write</code>,<br/>then move <code>write</code> forward"),
    (A["never"], [5], '<code>write</code> never passes <code>read</code>: nothing<br/>unread is overwritten'),
    (A["cut"], [7], "Cut off the tail: <code>del nums[write:]</code>"),
], A["fix2"] - 0.1, A["slow"], top=360, font=30)

# under it, read and write on the same list: the shown fix's own run
EV, RES = trace(load("code/fix_in_place.py", "remove_evens"), list(NUMS))
ip_st = []
for j, (ln, sn) in enumerate(EV):
    nxt = EV[j + 1][0] if j + 1 < len(EV) else None
    ptr = {"read": sn.get("read"), "write": sn["write"]}
    if ln == 3 and nxt == 4:
        v = sn["nums"][sn["read"]]
        ip_st.append({"vals": sn["nums"], "ptr": ptr, "mark": {sn["read"]: "teal" if v % 2 else "amb"},
                      "note": f"read {sn['read']}: {v} is {'odd → keep' if v % 2 else 'even → skip'}"})
    elif ln == 5:
        ip_st.append({"vals": sn["nums"], "ptr": ptr, "mark": {sn["write"]: "teal"}, "note": f"nums[{sn['write']}] = {sn['nums'][sn['write']]}"})
    elif ln == 6:
        ip_st.append({"vals": sn["nums"], "ptr": ptr, "note": f"write → {sn['write']}: never past read"})
    elif ln == 7:
        ip_st.append({"vals": sn["nums"], "ptr": {}, "mark": {i: "teal" for i in range(len(sn["nums"]))}, "note": f"del nums[{sn['write']}:] → {sn['nums']}"})
ip_t = [A["read"], A["visits"], A["visits"] + 1.0, A["keeper"] - 0.3, A["keeper"] + 1.3, A["never"], A["cut"]]
assert len(ip_t) == len(ip_st) and RES == KEEP, (len(ip_t), len(ip_st))
ArrayViz(R, "iv", NUMS, list(zip(ip_t, ip_st)), A["fix2"] - 0.1, A["slow"], top=R.code_bottom + 4,
         pointers=[("write", "teal", "above"), ("read", "amb", "below")])

# --- cost: remove shifts the tail every time
RM_MS, NL_MS = 7972.0, 4.0  # our recorded run; verify.py re-measures the gap
show("#cost", A["slow"], A["dictionary"], y=20)
init("#bf1", scaleX=0.001)
k("#bf1", A["eight"] - 0.6, {"scaleX": 1}, 0.9, "power1.inOut")
init("#bf2", scaleX=0.001)
k("#bf2", A["ms"] - 0.5, {"scaleX": max(NL_MS / RM_MS, 0.012)}, 0.3, "power1.inOut")
pop("#bv1", A["eight"] + 0.3)
pop("#bv2", A["ms"])
pop("#qtr", A["ms"] + 0.7)
pop("#shift", A["slow"] + 0.4)
R.add('<div class="card" id="cost" data-layout-allow-overlap><div class="h">100,000 numbers</div><div class="mut mono" style="font-size:30px;margin-top:6px">our test run · Python</div>'
      '<div class="tag mut" id="shift" style="left:0;top:150px">every remove shifts the whole tail: O(n²)</div>'
      '<div class="bar" style="top:240px"><div class="bl mono">for n in nums[:]: nums.remove(n)</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">7,972 ms</div></div>'
      '<div class="bar" style="top:430px"><div class="bl mono">[n for n in nums if n % 2 != 0]</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">4 ms</div></div>'
      '<div class="chip qtr" id="qtr">about 2,000× slower</div></div>')

# --- Python only guards dicts
show("#guard", A["dictionary"], A["changing"], y=20)
show("#e1", A["runtime"] - 0.2, A["changing"] + 0.2, y=16)
show("#e2", A["lists"] - 0.1, A["changing"] + 0.2, y=16)
R.add('<div class="card" id="guard" data-layout-allow-overlap><div class="h">Python guards a dict…</div>'
      f'<div class="panel err" id="e1" style="top:140px;height:150px">{KI.terminal_crash()}<div><span class="t">for key in d: del d[key]</span><span class="c amb">RuntimeError: dictionary changed<br/>size during iteration</span></div></div>'
      '<div class="h" style="position:absolute;top:360px">…but not a list</div>'
      f'<div class="panel err" id="e2" style="top:470px;height:150px">{I.silent_skip()}<div><span class="t">Python lists, JavaScript arrays</span><span class="c">no error: items are just skipped</span></div></div></div>')

# --- interview cue, challenge
show("#cue", A["changing"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Changing a collection<br/>while looping over it?", "new list, or a write pointer")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["buggy"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="call" style="position:absolute;top:140px">remove_evens(<span class="teal">[1, 2, 2, 3]</span>)</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:250px">{KI.question()}</div>'
      '<div class="mut mono" style="position:absolute;top:230px;font-size:32px">the buggy version</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">What comes <span class="teal">back?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
# the tutor only where she adds something: the hook, the surprise, the skip, the cost, the challenge, the brand
R.stills([(0, "cu-07-confident"), (A["ai"] - 0.1, None),
          (A["survived"] - 0.9, "cu-04-surprised"), (A["seats"] - 0.2, None),
          (A["skips"] - 0.1, "wu-08-facepalm"), (A["fix"] - 0.3, None),
          (A["eight"] - 0.2, "cu-05b-cringe"), (A["dictionary"] - 0.2, None),
          (A["turn"] - 0.2, "wu-04-open-palm"), (A["buggy"] - 0.1, None),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-07-confident")])
R.captions(amber={"survived", "even", "skips", "skip", "slow", "eight", "seconds", "runtime", "silently", "nobody", "buggy"},
           teal={"fix", "new", "read", "write", "pointer", "keeper", "odd", "milliseconds", "leetexpert", "tail"},
           until=A["leet"])
R.write(Path("style.css").read_text())
