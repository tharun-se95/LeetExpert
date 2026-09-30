"""Builds index.html for the float-mid reel on the shared reelkit engine.

The code cards show code/bug.js and code/fixed.js minus their last line (the
`module.exports` that lets verify.mjs import them). Run after reelkit/prep.sh.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from viz import ArrayViz, js_reads  # noqa: E402


def shown(path):
    lines = Path(path).read_text().rstrip("\n").split("\n")
    assert lines[-1].startswith("module.exports")
    return "\n".join(lines[:-1])


BUG, FIX = shown("code/bug.js"), shown("code/fixed.js")

R = Reel("Binary search in JavaScript, one character wrong", "Would you ship this?")
a = R.anchor
a("wrong", "wrong", 0.0)
a("tested", "tested")
a("ship", "ship")
a("search", "search")
a("minus", "minus")
a("there", "there")
a("walk", "walk")
a("three", "three")
a("point", "point")
a("round", "round")
a("undefined", "undefined")
a("branch", "branch")
a("half", "half")
a("again", "again")
a("pass", "pass")
a("even", "even")
a("hides", "hides")
a("power", "power")
a("python", "python")
a("crashes", "crashes")
a("loud", "loud")
a("fix", "fix")
a("whole", "whole")
a("huge", "huge")
a("found", "found")
a("computing", "computing")
a("say", "say")
a("turn", "turn")
a("next", "next")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- hook: one character is wrong
R.code("c0", BUG, [
    (0.0, list(range(1, 12)), "Binary search, JavaScript."),
    (A["tested"], list(range(1, 12)), 'Tested on 7 numbers: <span class="teal">every target found ✓</span>'),
    (A["ship"], list(range(1, 12)), "Would you ship it?"),
], 0.0, A["search"], top=310, font=28, label="javascript")

# under it, the test that passed: the shown bug.js finds every one of the seven (run in Node)
SEVEN = [1, 3, 5, 7, 9, 11, 13]
found = [js_reads("code/bug.js", "binarySearch", SEVEN, v)[1] == i for i, v in enumerate(SEVEN)]
ArrayViz(R, "tv", SEVEN, [(0.0, {}), (A["tested"], {"mark": {i: "teal" for i, ok in enumerate(found) if ok},
                                                     "note": f"{sum(found)} of {len(SEVEN)} targets found"})],
         0.0, A["search"], top=R.code_bottom + 4)
init("#badge", autoAlpha=0, x=20)
k("#badge", A["wrong"], {"autoAlpha": 1, "x": 0}, 0.3, "back.out(2)")
k("#badge", A["search"] - 0.2, {"autoAlpha": 0}, 0.2)
R.add('<div class="aibadge" id="badge">one character is wrong</div>')

# --- the failing search
show("#fail", A["search"], A["walk"], y=20)
pop("#fl1", A["minus"])
pop("#fl2", A["there"] - 0.3)
R.add('<div class="card" id="fail" data-layout-allow-overlap><div class="call">binarySearch(<span class="teal">[2, 4, 6, 8]</span>, 6)</div>'
      '<div class="val amb" id="fl1" style="left:0;top:110px;font-size:72px">→ -1 ✗</div>'
      '<div class="val teal" id="fl2" style="left:0;top:230px">6 is right there, at index 2</div></div>')

# --- the walk: mid lands between two cells
CW, STEP, ROW = 160, 190, 520
X0 = (1080 - (3 * STEP + CW)) // 2
cx = lambda i: X0 + i * STEP
show("#walk", A["walk"], A["pass"], y=16)
init("#m15", autoAlpha=0, y=-30)
k("#m15", A["point"], {"autoAlpha": 1, "y": 0}, 0.35, "back.out(2)")
pop("#w1", A["three"])
pop("#w2", A["undefined"] - 0.1)
pop("#w3", A["branch"] - 0.3)
pop("#w4", A["again"])
R.add('<div id="walk" data-layout-allow-overlap>'
      '<div class="mono lnw" style="top:360px">const mid = (lo + hi) / 2;</div>'
      + "".join(f'<div class="cell" style="left:{cx(i)}px;top:{ROW}px">{v}</div><div class="ix" style="left:{cx(i)}px;top:{ROW + CW + 8}px">{i}</div>' for i, v in enumerate([2, 4, 6, 8]))
      + f'<div class="m15" id="m15" style="left:{(cx(1) + cx(2) + CW) // 2 - 47}px;top:{ROW - 70}px"><i></i><b>1.5</b></div>'
      + f'<div class="val" id="w1" style="left:80px;top:{ROW + CW + 60}px">lo = 0, hi = 3 → (0 + 3) / 2 = <span class="amb">1.5</span></div>'
      + f'<div class="val amb" id="w2" style="left:80px;top:{ROW + CW + 120}px">arr[1.5] → undefined</div>'
      + f'<div class="val" id="w3" style="left:80px;top:{ROW + CW + 180}px;font-size:32px">=== 6? false · &lt; 6? false → hi = mid − 1 = 0.5</div>'
      + f'<div class="val amb" id="w4" style="left:80px;top:{ROW + CW + 240}px">never a real index again → -1</div></div>')

# --- why the tests passed: which lengths hide it
HIDES = {1, 3, 7, 15}  # verify.mjs checks this for every length up to 1000
show("#lens", A["pass"], A["python"], y=20)
for n in range(1, 17):
    pop(f"#ln{n}", A["hides"] - 0.2 + n * 0.04, 0.25)
pop("#pw", A["power"])
R.add('<div class="card" id="lens" data-layout-allow-overlap><div class="h">Why the tests passed</div>'
      '<div class="val mut" style="left:0;top:100px;font-size:32px">on 7 numbers, lo + hi is even at every step</div>'
      '<div class="lgrid">' + "".join(f'<div class="lg {"ok" if n in HIDES else "no"}" id="ln{n}"><b>{n}</b><span>{"hides" if n in HIDES else "fails"}</span></div>' for n in range(1, 17)) + '</div>'
      '<div class="val teal" id="pw" style="left:0;top:580px">hides only on 2ᵏ − 1:<br/>one less than a power of two</div></div>')

# --- Python crashes instead
show("#py", A["python"], A["fix"], y=20)
pop("#py2", A["loud"])
R.add(f'<div class="card" id="py" data-layout-allow-overlap><div class="h">Python, same slash</div>'
      f'<div class="panel err" style="top:130px;height:150px">{KI.terminal_crash()}<div><span class="t">mid = (lo + hi) / 2</span><span class="c amb">TypeError: list indices must be<br/>integers or slices, not float</span></div></div>'
      '<div class="val teal" id="py2" style="left:0;top:330px">loud beats silently wrong</div></div>')

# --- the fix, line by line
R.code("c1", FIX, [
    (A["fix"], [5], 'Floor it: <code>lo + Math.floor((hi - lo) / 2)</code>'),
    (A["whole"] - 0.3, [5], "Always a whole index"),
    (A["huge"] - 0.3, [5], "Never adds two huge numbers:<br/>overflow-safe in Java or C++"),
    (A["found"] - 0.3, [6], '<code>[2, 4, 6, 8]</code>, 6 → <span class="teal">index 2 ✓</span>'),
], A["fix"] - 0.1, A["computing"], top=310, font=26, label="javascript")

# under it, the fixed search on the failing list: the indexes fixed.js actually read, in Node
LIST, T = [2, 4, 6, 8], 6
READS, RES = js_reads("code/fixed.js", "binarySearch", LIST, T)
assert all(float(r).is_integer() for r in READS) and RES == LIST.index(T)
lo, hi, dim = 0, len(LIST) - 1, set()
fst = [{"ptr": {"lo": lo, "hi": hi}, "note": f"lo = {lo}, hi = {hi}"}]
for m in map(int, READS):
    fst.append({"ptr": {"lo": lo, "hi": hi}, "dim": set(dim), "mark": {m: "amb"}, "note": f"mid = {lo} + floor(({hi} - {lo}) / 2) = {m}"})
    if LIST[m] == T:
        fst.append({"ptr": {"lo": lo, "hi": hi}, "dim": set(dim), "mark": {m: "teal"}, "note": f"arr[{m}] === {T} → return {RES}"})
    elif LIST[m] < T:
        dim |= set(range(lo, m + 1)); lo = m + 1
        fst.append({"ptr": {"lo": lo, "hi": hi}, "dim": set(dim), "note": f"{LIST[m]} < {T} → lo = {lo}"})
    else:
        dim |= set(range(m, hi + 1)); hi = m - 1
        fst.append({"ptr": {"lo": lo, "hi": hi}, "dim": set(dim), "note": f"{LIST[m]} > {T} → hi = {hi}"})
ft = [A["fix"], A["whole"] - 0.3, A["huge"] - 0.3, (A["huge"] + A["found"]) / 2, A["found"] - 0.3]
assert len(ft) == len(fst), (len(ft), len(fst))
ArrayViz(R, "fv", LIST, list(zip(ft, fst)), A["fix"] - 0.1, A["computing"], top=R.code_bottom + 4,
         pointers=[("hi", "amb", "above"), ("lo", "teal", "below")], cell=100)

# --- interview cue, challenge
show("#cue", A["computing"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
CUE = KI.cue_card("A middle index<br/>in JavaScript?", "I’ll floor it")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{CUE}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["next"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:44px;font-weight:700">length <span class="teal">7</span> hides the bug</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">What\'s the next length<br/>that <span class="teal">hides it?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
# the tutor only where she adds something: the hook, the surprise, the undefined, the challenge, the brand
R.stills([(0, "cu-06-skeptical"), (A["tested"] - 0.1, None),
          (A["there"] - 0.3, "cu-04-surprised"), (A["walk"] - 0.2, None),
          (A["undefined"] - 0.1, "cu-05b-cringe"), (A["undefined"] + 2.4, None),
          (A["python"] - 0.2, "cu-10-serious"), (A["crashes"] + 1.5, None),
          (A["turn"] - 0.2, "wu-04-open-palm"), (A["next"] - 0.1, None),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-06-skeptical")])
R.captions(amber={"wrong", "minus", "undefined", "crashes", "half"},
           teal={"floor", "fix", "found", "whole", "power", "leetexpert", "hides"},
           until=A["leet"])
R.write(Path("style.css").read_text())
