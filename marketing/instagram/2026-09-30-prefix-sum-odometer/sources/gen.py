"""Builds index.html for the prefix-sum reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import importlib.util, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402

# the numbers on screen come from running the shown code, not from this file
_s = importlib.util.spec_from_file_location("prefix", "code/prefix.py")
_m = importlib.util.module_from_spec(_s)
_s.loader.exec_module(_m)
NUMS = [2, 4, 1, 5, 3]  # the lesson's viz data; verify.py reads it from the lesson
P = _m.build_prefix(NUMS)

R = Reel("Prefix sums, the odometer", "Prefix sums")
a = R.anchor
a("index", "index", 0.0)
a("ten", "ten")
a("thousand", "thousand")
a("scratch", "scratch")
a("odometer", "odometer")
a("total", "total")
a("subtract", "subtract")
a("drive", ["re-drive", "drive"])
a("prefix", "prefix")
a("zero", "zero")
a("six", "six")
a("seven", "seven")
a("twelve", "twelve")
a("fifteen", "fifteen")
a("code", "code")
a("slot", "slot")
a("previous", "previous")
a("pass", "pass")
a("sum", "sum")
a("minus", "minus")
a("idx1", "index")
a("ten2", "ten")
a("idx2", "index")
a("nine", "nine")
a("subtraction", "subtraction")
a("test", "test")
a("seconds", "seconds")
a("ms", "milliseconds")
a("catch", "catch")
a("change", "change")
a("stale", "stale")
a("off", "off")
a("drops", "drops")
a("lots", "lots")
a("say", "say")
a("turn", "turn")
a("four", "four")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- the two rows: nums above, prefix below; nums[i] sits over prefix[i + 1], its running total
CW, STEP, ROW_N, ROW_P = 130, 144, 470, 760
X0 = (1080 - (5 * STEP + CW)) // 2
px = lambda j: X0 + j * STEP
nx = lambda i: px(i + 1)
# the rows show for the hook, the build, the queries and the catch; they hide for the other scenes
init("#rows", autoAlpha=1)
for t0, t1 in ((A["odometer"] - 0.2, A["prefix"]), (A["code"] - 0.2, A["idx1"] - 0.1), (A["test"] - 0.2, A["catch"])):
    k("#rows", t0, {"autoAlpha": 0}, 0.2)
    k("#rows", t1, {"autoAlpha": 1}, 0.25)
k("#rows", A["off"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#rows", R.RESET, {"autoAlpha": 1}, 0.4)
# prefix cells pop in as the running total is built
build = [A["zero"], round((A["zero"] + A["six"]) / 2, 2), A["six"], A["seven"], A["twelve"], A["fifteen"]]
for j in range(6):
    init(f"#p{j}", autoAlpha=0, scale=0.6, borderColor="#263248", color="#f1f4f9")
    k(f"#p{j}", build[j], {"autoAlpha": 1, "scale": 1, "borderColor": "#5eead4"}, 0.3, "back.out(2)")
    k(f"#p{j}", build[j] + 0.5, {"borderColor": "#263248"}, 0.3)
    if j >= 2:  # stale after nums[1] changes
        k(f"#p{j}", A["stale"] - 0.1 + (j - 2) * 0.08, {"borderColor": "#fbbf24", "color": "#fbbf24"}, 0.25)
    k(f"#p{j}", R.RESET, {"autoAlpha": 0, "borderColor": "#263248", "color": "#f1f4f9"}, 0.01)
show("#plab", A["prefix"], A["off"], y=8)
# hook: the range 1..3 and its sum
br = lambda bid, l, r, top: f'<div class="brk" id="{bid}" style="left:{nx(l)}px;width:{nx(r) - nx(l) + CW}px;top:{top}px"></div>'
show("#b13", A["index"], A["odometer"], y=8)
show("#b13v", A["ten"], A["odometer"], y=8)
# many queries at once: brackets flicker over the row
FLICK = [(0, 4), (2, 3), (1, 2), (0, 1), (3, 4), (0, 2)]
ft = R.spread(A["thousand"], A["odometer"] - 0.3, len(FLICK))
R.swap([(f"#fk{j}", t) for j, t in enumerate(ft)], A["odometer"] - 0.2)
show("#qn", A["scratch"], A["odometer"], y=10)
# queries on the finished rows
show("#q1", A["idx1"], A["idx2"], y=8)
pop("#q1v", A["ten2"])
show("#q2", A["idx2"], A["test"], y=8)
pop("#q2v", A["nine"])
show("#o1", A["subtraction"], A["test"], y=8)
# the catch: nums[1] changes, everything after goes stale
show("#chg", A["change"], A["off"], y=0)
pop("#stl", A["stale"] + 0.3)
rows = ('<div class="lab" style="left:%dpx;top:%dpx">nums</div>' % (X0, ROW_N - 44)
        + "".join(f'<div class="cell" style="left:{nx(i)}px;top:{ROW_N}px">{v}</div><div class="ix" style="left:{nx(i)}px;top:{ROW_N + CW + 6}px">{i}</div>' for i, v in enumerate(NUMS))
        + f'<div class="lab" id="plab" style="left:{X0}px;top:{ROW_P - 44}px">prefix (running total)</div>'
        + "".join(f'<div class="cell pc" id="p{j}" style="left:{px(j)}px;top:{ROW_P}px">{v}</div>' for j, v in enumerate(P))
        + br("b13", 1, 3, ROW_N - 22) + f'<div class="val amb" id="b13v" style="left:{nx(1)}px;top:{ROW_N - 100}px">4 + 1 + 5 = {sum(NUMS[1:4])}</div>'
        + "".join(br(f"fk{j}", l, r, ROW_N - 22) for j, (l, r) in enumerate(FLICK))
        + f'<div class="chip amb-chip" id="qn" style="position:absolute;left:{X0}px;top:{ROW_P + 30}px">10,000 queries × O(n) each</div>'
        + f'<div id="q1" data-layout-allow-overlap>{br("q1b", 1, 3, ROW_N - 22)}<i class="ring teal-r" style="left:{px(4) - 8}px;top:{ROW_P - 8}px"></i>'
        + f'<i class="ring amb-r" id="q1a" style="left:{px(1) - 8}px;top:{ROW_P - 8}px"></i>'
        + f'<div class="val" id="q1v" style="left:{X0}px;top:{ROW_P + 160}px">sum(1..3) = prefix[4] − prefix[1]<br/>= {P[4]} − {P[1]} = <span class="teal">{_m.range_sum(P, 1, 3)}</span></div></div>'
        + f'<div id="q2" data-layout-allow-overlap>{br("q2b", 2, 4, ROW_N - 22)}<i class="ring teal-r" style="left:{px(5) - 8}px;top:{ROW_P - 8}px"></i>'
        + f'<i class="ring amb-r" style="left:{px(2) - 8}px;top:{ROW_P - 8}px"></i>'
        + f'<div class="val" id="q2v" style="left:{X0}px;top:{ROW_P + 160}px">sum(2..4) = prefix[5] − prefix[2]<br/>= {P[5]} − {P[2]} = <span class="teal">{_m.range_sum(P, 2, 4)}</span></div></div>'
        + f'<div class="chip" id="o1" style="position:absolute;left:{X0}px;top:{ROW_P + 280}px">one subtraction per query: O(1)</div>'
        + f'<div class="cell chg" id="chg" data-layout-allow-overlap style="left:{nx(1)}px;top:{ROW_N}px">9</div>'
        + f'<div class="val amb" id="stl" style="left:{X0}px;top:{ROW_P + 170}px">change nums[1] → prefix[2..5] are stale</div>')
R.add(f'<div id="rows" data-layout-allow-overlap>{rows}</div>')

# --- the odometer
show("#odo", A["odometer"], A["prefix"], y=20)
pop("#od2", A["total"])
pop("#od3", A["subtract"])
pop("#od4", A["drive"])
R.add('<div class="card" id="odo" data-layout-allow-overlap><div class="h">An odometer</div>'
      '<div class="mut mono" style="font-size:30px;margin-top:8px">total distance since the car was new</div>'
      '<div class="odo" style="top:180px"><span class="ol">trip start</span><span class="od">12,040</span><span class="ou">km</span></div>'
      '<div class="odo" id="od2" style="top:330px"><span class="ol">trip end</span><span class="od">12,075</span><span class="ou">km</span></div>'
      '<div class="val" id="od3" style="left:0;top:500px">trip = 12,075 − 12,040 = <span class="teal">35 km</span></div>'
      '<div class="val mut" id="od4" style="left:0;top:580px;font-size:34px">no re-driving the trip</div></div>')

# --- the code, line by line
R.code("c1", Path("code/prefix.py").read_text(), [
    (A["code"], [1], "<code>build_prefix(nums)</code>"),
    (A["slot"], [2], "n + 1 slots; <code>prefix[0] = 0</code>:<br/>the sum of nothing"),
    (A["previous"] - 0.3, [3, 4], "Next slot = previous slot + x"),
    (A["pass"], [3, 4], 'One pass: <span class="teal">O(n)</span>'),
    (A["sum"], [7, 8], "Sum of <code>l..r</code>:"),
    (A["minus"] - 0.3, [8], "<code>prefix[r + 1] − prefix[l]</code>"),
], A["code"] - 0.1, A["idx1"] - 0.1, top=390, font=32)

# --- benchmark: our test run
SLOW_S, FAST_MS = 4.96, 6.1
show("#bench", A["test"], A["catch"], y=20)
init("#bf1", scaleX=0.001)
k("#bf1", A["test"] + 0.8, {"scaleX": 1}, 1.0, "power1.inOut")
init("#bf2", scaleX=0.001)
k("#bf2", A["ms"] - 0.5, {"scaleX": 0.012}, 0.3, "power1.inOut")
pop("#bv1", A["seconds"])
pop("#bv2", A["ms"])
pop("#qtr", A["ms"] + 0.6)
R.add('<div class="card" id="bench" data-layout-allow-overlap><div class="h">10,000 queries</div><div class="mut mono" style="font-size:30px;margin-top:6px">100,000 numbers · our test run · Python</div>'
      f'<div class="bar" style="top:200px"><div class="bl mono">sum(nums[l:r+1]) each time</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">{SLOW_S:.2f} s</div></div>'
      f'<div class="bar" style="top:400px"><div class="bl mono">prefix array, build included</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">{FAST_MS:.1f} ms</div></div>'
      f'<div class="chip qtr" id="qtr">about {round(SLOW_S * 1000 / FAST_MS, -2):,.0f}× faster</div></div>')

# --- the off-by-one
show("#obo", A["off"], A["lots"], y=20)
pop("#obo1", A["drops"] - 0.2)
pop("#obo2", A["drops"] + 0.6)
R.add('<div class="card" id="obo" data-layout-allow-overlap><div class="h">The classic off-by-one</div>'
      f'<div class="panel code" style="top:130px"><div class="ln"><span>prefix[r] − prefix[l]</span><span class="amb">✗</span></div>'
      f'<div class="ln mut" style="font-size:34px">sum(1..3) → {P[3]} − {P[1]} = <span class="amb">{P[3] - P[1]}</span></div></div>'
      f'<div class="val amb" id="obo1" style="left:0;top:380px">drops the last number, nums[3] = {NUMS[3]}</div>'
      f'<div class="panel code" id="obo2" style="top:480px"><div class="ln"><span>prefix[r + 1] − prefix[l]</span><span class="teal">✓ {_m.range_sum(P, 1, 3)}</span></div></div></div>')

# --- interview cue, challenge
show("#cue", A["lots"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Many range sums,<br/>the array never changes", "prefix sums")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["four"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      f'<div class="mono" style="position:absolute;top:140px;font-size:38px;font-weight:700">prefix = <span class="teal">{P}</span></div>'
      f'<div class="qb" style="position:absolute;right:30px;top:230px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:430px">sum(0..4) using<br/><span class="teal">just two numbers?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "cu-07-confident"), (A["index"], "cu-03-thinking"), (A["ten"], "wu-06-thumbs-up"), (A["thousand"], "cu-04-surprised"),
          (A["odometer"] - 0.2, "wu-05-tablet"), (A["subtract"] - 0.1, "cu-02-explaining"), (A["prefix"] - 0.2, "wu-03-point-side"),
          (A["twelve"] - 0.1, "wu-02-pen-up"), (A["code"] - 0.2, "wu-14-laptop"), (A["sum"] - 0.2, "cu-02-explaining"),
          (A["idx1"] - 0.2, "wu-03-point-side"), (A["subtraction"] - 0.1, "fb-05-celebrate"), (A["test"] - 0.2, "wu-14-laptop"),
          (A["ms"] - 0.2, "cu-08-excited"), (A["catch"] - 0.2, "cu-10-serious"), (A["stale"] - 0.1, "cu-05-worried"),
          (A["off"] - 0.2, "wu-08-facepalm"), (A["lots"] - 0.2, "cu-02-explaining"), (A["turn"] - 0.2, "wu-04-open-palm"),
          (A["four"] - 0.1, "cu-03-thinking"), (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "cu-07-confident")])
R.captions(amber={"scratch", "stale", "catch", "off", "drops", "seconds", "slow"},
           teal={"prefix", "odometer", "subtract", "subtraction", "ten", "nine", "fifteen", "milliseconds", "leetexpert"},
           until=A["leet"])
R.write(Path("style.css").read_text())
