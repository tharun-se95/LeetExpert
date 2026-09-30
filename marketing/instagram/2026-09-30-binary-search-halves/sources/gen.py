"""Builds index.html for the binary-search reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from bstrace import search_trace  # noqa: E402
from viz import ArrayViz  # noqa: E402

ARR, TARGET = [1, 3, 5, 7, 9, 11, 13], 9  # the lesson's viz; verify.py reads it from the lesson
TR = search_trace(ARR, TARGET)
assert [mid for _, _, mid, _ in TR] == [3, 5, 4]

R = Reel("Binary search throws away half", "Binary search")
a = R.anchor
a("find", "find", 0.0)
a("dictionary", "dictionary")
a("middle", "middle")
a("ignore", "ignore")
a("goes", "goes")
a("lo", "lo")
a("hi", "hi")
a("mid1", "middle")
a("less", "less")
a("gone1", "gone")
a("eleven", "eleven")
a("big", "big")
a("gone2", "gone")
a("left", "left")
a("found", "found")
a("code", "code")
a("range", "range")
a("while", "while")
a("target", "target")
a("small", "small")
a("big2", "big")
a("runs", "runs")
a("halves", "halves")
a("million", "million")
a("twenty", "twenty")
a("billion", "billion")
a("thirty", "thirty")
a("bug", "bug")
a("search", "search")
a("forever", "forever")
a("sorted", "sorted")
a("drop", "drop")
a("say", "say")
a("turn", "turn")
a("thirteen", "thirteen")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- the row: lo / hi markers, a mid ring, eliminated halves greyed out
CW, STEP, ROW = 118, 128, 520
X0 = (1080 - (6 * STEP + CW)) // 2
cx = lambda i: X0 + i * STEP
init("#row", autoAlpha=1)
for t0, t1 in ((A["dictionary"] - 0.2, A["goes"]),):
    k("#row", t0, {"autoAlpha": 0}, 0.2)
    k("#row", t1, {"autoAlpha": 1}, 0.25)
k("#row", A["code"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#row", R.RESET, {"autoAlpha": 1}, 0.4)
show("#q", A["find"], A["dictionary"], y=10)
# markers
mx = lambda i: cx(i) + CW // 2 - 40
init("#lo", autoAlpha=0, x=mx(0))
k("#lo", A["lo"], {"autoAlpha": 1}, 0.25)
k("#lo", A["gone1"] + 0.3, {"x": mx(4)}, 0.4, "power3.inOut")
k("#lo", A["code"] - 0.2, {"autoAlpha": 0, "x": mx(0)}, 0.2)
init("#hi", autoAlpha=0, x=mx(6))
k("#hi", A["hi"], {"autoAlpha": 1}, 0.25)
k("#hi", A["gone2"] + 0.3, {"x": mx(4)}, 0.4, "power3.inOut")
k("#hi", A["code"] - 0.2, {"autoAlpha": 0, "x": mx(6)}, 0.2)
init("#mid", autoAlpha=0, x=cx(3) - 9)
k("#mid", A["mid1"], {"autoAlpha": 1}, 0.25)
k("#mid", A["eleven"] - 0.1, {"x": cx(5) - 9}, 0.35, "power3.inOut")
k("#mid", A["left"], {"x": cx(4) - 9}, 0.35, "power3.inOut")
k("#mid", A["code"] - 0.2, {"autoAlpha": 0, "x": cx(3) - 9}, 0.2)
# the eliminated halves, and the find
for i in range(7):
    init(f"#n{i}", opacity=1, borderColor="#263248", color="#f1f4f9")
    if i <= 3:
        k(f"#n{i}", A["gone1"] - 0.1 + i * 0.05, {"opacity": 0.22}, 0.3)
    elif i >= 5:
        k(f"#n{i}", A["gone2"] - 0.1 + (i - 5) * 0.05, {"opacity": 0.22}, 0.3)
    else:
        k(f"#n{i}", A["found"], {"borderColor": "#5eead4", "color": "#5eead4"}, 0.3)
    k(f"#n{i}", R.RESET, {"opacity": 1, "borderColor": "#263248", "color": "#f1f4f9"}, 0.01)
R.swap([("#v1", A["less"] - 0.2), ("#v2", A["big"] - 0.2), ("#v3", A["found"])], A["code"] - 0.2)
R.add('<div id="row" data-layout-allow-overlap>'
      f'<div class="ask" id="q">sorted list · find <span class="teal">{TARGET}</span></div>'
      + "".join(f'<div class="cell" id="n{i}" style="left:{cx(i)}px;top:{ROW}px">{v}</div>' for i, v in enumerate(ARR))
      + f'<div class="ring" id="mid" style="top:{ROW - 9}px"></div>'
      + f'<div class="mk teal" id="lo" style="top:{ROW + CW + 14}px">lo</div><div class="mk amb" id="hi" style="top:{ROW + CW + 60}px">hi</div>'
      + f'<div class="verd" id="v1" style="top:{ROW + CW + 140}px">mid = 7 &lt; 9 → drop 7 and everything left of it</div>'
      + f'<div class="verd" id="v2" style="top:{ROW + CW + 140}px">mid = 11 &gt; 9 → drop 11 and everything right</div>'
      + f'<div class="verd teal" id="v3" style="top:{ROW + CW + 140}px">mid = 9 → found in {len(TR)} checks</div></div>')

# --- the dictionary
show("#dict", A["dictionary"], A["goes"], y=16)
pop("#dk2", A["middle"])
pop("#dk3", A["ignore"])
BOOK = KI.svg("0 0 200 120", '<path d="M100 18 C70 4 30 4 6 12 V112 C30 104 70 104 100 116 Z" fill="#f1f4f9"/>'
              '<path d="M100 18 C130 4 170 4 194 12 V112 C170 104 130 104 100 116 Z" fill="#e2e8f0"/>'
              '<path d="M100 18 V116" stroke="#64748b" stroke-width="3"/>', "bk")
R.add(f'<div class="card" id="dict" data-layout-allow-overlap><div class="h">A paper dictionary</div><div class="book">{BOOK}</div>'
      '<div class="val" id="dk2" style="left:0;top:470px">open the middle</div>'
      '<div class="val teal" id="dk3" style="left:0;top:550px">keep one half, ignore the other</div></div>')

# --- the code, line by line, with the search acted out under it
R.code("c1", Path("code/binary_search.py").read_text(), [
    (A["range"] - 0.3, [2], "<code>[lo, hi]</code>: where the answer could still be"),
    (A["while"], [3, 4], "While the range isn't empty,<br/>take the middle"),
    (A["target"] - 0.3, [5, 6], "The target? Return it"),
    (A["small"] - 0.3, [7, 8], "Too small: move <code>lo</code> past mid"),
    (A["big2"] - 0.3, [9, 10], "Too big: move <code>hi</code> below mid"),
    (A["runs"] - 0.3, [11], "Range ran out: not there"),
    (A["halves"], [3, 4], 'Each check halves the range: <span class="teal">O(log n)</span>'),
], A["code"] - 0.1, A["million"], top=310, font=26)


def stage_states(arr, trace):
    """The shown code's own run on the lesson's list, as stage states: the range, then
    per check its mid and its verdict. `trace` is bstrace's record of code/binary_search.py."""
    lo, hi = trace[0][0], trace[0][1]
    out = [{"ptr": {"lo": lo, "hi": hi}, "note": f"lo, hi = {lo}, {hi}"}]
    dim = set()
    for lo, hi, mid, verdict in trace:
        out.append({"ptr": {"lo": lo, "hi": hi}, "dim": set(dim), "mark": {mid: "amb"},
                    "note": f"mid = {mid} → arr[mid] = {arr[mid]}"})
        if verdict == "found":
            out.append({"ptr": {"lo": lo, "hi": hi}, "dim": set(dim), "mark": {mid: "teal"},
                        "note": f"{arr[mid]} == {TARGET} → return {mid}, in {len(trace)} checks"})
        elif verdict == "low":
            dim |= set(range(lo, mid + 1))
            out.append({"ptr": {"lo": mid + 1, "hi": hi}, "dim": set(dim), "note": f"{arr[mid]} < {TARGET} → lo = {mid + 1}"})
        else:
            dim |= set(range(mid, hi + 1))
            out.append({"ptr": {"lo": lo, "hi": mid - 1}, "dim": set(dim), "note": f"{arr[mid]} > {TARGET} → hi = {mid - 1}"})
    return out


ST = stage_states(ARR, TR)
# init, then (mid, verdict) per check: the verdicts land on the lines that make them
big_mid = (A["big2"] - 0.3 + A["runs"] - 0.3) / 2
st_times = [A["range"] - 0.3, A["while"], A["small"] - 0.3, A["big2"] - 0.3, big_mid, A["runs"] - 0.3, A["halves"]]
assert len(st_times) == len(ST), (len(st_times), len(ST))
ArrayViz(R, "sv", ARR, list(zip(st_times, ST)), A["code"] - 0.1, A["million"], top=R.code_bottom + 4,
         pointers=[("hi", "amb", "above"), ("lo", "teal", "below")], cell=100)

# --- scale: halving a million
show("#scale", A["million"], A["bug"], y=20)
halvings = 20
ht = R.spread(A["million"] + 0.4, A["twenty"] + 0.2, halvings)
init("#hbar", scaleX=1)
hd = min(0.1, (ht[1] - ht[0]) * 0.8)  # each halving finishes before the next
for j, t in enumerate(ht):
    k("#hbar", t, {"scaleX": max(1 / 2 ** (j + 1), 0.004)}, hd, "power1.out")
R.swap([(f"#hc{j}", t) for j, t in enumerate(ht)], A["bug"] - 0.2)
pop("#s2", A["thirty"] - 0.2)
counts = "".join(f'<div class="hcn" id="hc{j}">check {j + 1}: ≤ {max(1_000_000 >> (j + 1), 1):,} left</div>' for j in range(halvings))
R.add('<div class="card" id="scale" data-layout-allow-overlap><div class="h">1,000,000 sorted numbers</div>'
      '<div class="hb"><div class="hbf" id="hbar"></div></div>'
      f'<div class="hcs" data-layout-allow-overlap>{counts}</div>'
      '<div class="val teal" style="left:0;top:340px">at most 20 checks</div>'
      '<div class="val" id="s2" style="left:0;top:440px">1,000,000,000 → at most <span class="teal">30</span></div></div>')

# --- the bug: lo = mid
show("#bugc", A["bug"], A["sorted"], y=20)
pop("#bg2", A["search"])
pop("#bg3", A["forever"] - 0.2)
R.add('<div class="card" id="bugc" data-layout-allow-overlap><div class="h">The classic bug</div>'
      '<div class="panel code" style="top:120px"><div class="ln"><span>lo = mid + 1</span><span class="teal">✓</span></div>'
      '<div class="ln"><span>lo = mid</span><span class="amb">✗</span></div></div>'
      '<div class="val" id="bg2" style="left:0;top:380px">[1, 3], find 3: lo=0, hi=1, mid=0</div>'
      '<div class="val amb" id="bg3" style="left:0;top:460px">1 &lt; 3 → lo = mid = 0 … again, forever ↻</div></div>')

# --- caveat, cue, challenge
show("#cav", A["sorted"], A["say"], y=20)
R.add('<div class="card" id="cav" data-layout-allow-overlap><div class="h">Only on sorted data</div>'
      '<div class="val mut" style="left:0;top:130px;font-size:34px;white-space:normal;right:0">or anything where one comparison<br/>tells you which half to drop</div></div>')
show("#cue", A["say"] - 0.15, A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Sorted data<br/>and a search?", "binary search")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["thirteen"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      f'<div class="mono" style="position:absolute;top:150px;font-size:40px;font-weight:700">{ARR}</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">How many checks<br/>to find <span class="teal">13?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
# the tutor only where she adds something: the hook, the find, the bug, the challenge and the brand
R.stills([(0, "cu-07-confident"), (R.at("seven") - 0.3, None),
          (A["found"] - 0.1, "fb-05-celebrate"), (A["code"] - 0.4, None),
          (A["bug"] - 0.2, "cu-10-serious"), (A["forever"] - 0.2, "wu-08-facepalm"), (A["sorted"] - 0.2, None),
          (A["turn"] - 0.2, "wu-04-open-palm"), (A["thirteen"] - 0.1, "cu-03-thinking"), (A["leet"] - 0.2, "fb-03-present"),
          (R.RESET, "cu-07-confident")])
R.captions(amber={"gone", "bug", "forever", "big"},
           teal={"half", "halves", "found", "twenty", "thirty", "sorted", "leetexpert", "middle"},
           until=A["leet"])
R.write(Path("style.css").read_text())
