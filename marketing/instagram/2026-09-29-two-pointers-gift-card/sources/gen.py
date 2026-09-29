"""Builds index.html for the gift-card two-pointers reel.

Every visual is anchored to a spoken word in words.json (Scribe's timings for
the real take; est_words.py's stand-in for a silent preview). Each element gets
ONE keyframed GSAP track, so the composition stays seek-safe for HyperFrames.
"""
import json, html, os, re, subprocess, sys
import icons as I

W = json.load(open("words.json"))
LEAD = 0.3
HAS_VO = os.path.exists("vo.mp3")


def duration(path):
    # ffprobe is not always installed; ffmpeg's banner carries the duration too
    try:
        return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))
    except FileNotFoundError:
        ff = os.environ.get("FFMPEG", "ffmpeg")
        out = subprocess.run([ff, "-i", path], capture_output=True, text=True).stderr
        h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
        return int(h) * 3600 + int(m) * 60 + float(s)


def norm(t):
    return re.sub(r"[^a-z0-9'\-]", "", t.lower()).strip("'-")


def forms(t):
    n = norm(t)
    return {n, n.replace("'", ""), *n.split("-")}


def at(alts, after=0.0, end=False):
    """Timeline time of the first word matching any of `alts` at or after `after`."""
    alts = [alts] if isinstance(alts, str) else alts
    for x in W:
        if LEAD + x["s"] >= after and forms(x["t"]) & set(alts):
            return round(LEAD + (x["e"] if end else x["s"]), 2)
    sys.exit(f"anchor not found: {alts} after {after}")


A = {}
A["spend"] = at("spend")
A["menu"] = at(["menu's", "menus", "menu"])
A["pair"] = at("pair")
A["c21"] = at(["twenty-one", "twenty", "21"], A["pair"])
A["thousand"] = at(["thousand", "1000"])
A["smarter"] = at("smarter")
A["cheapest"] = at("cheapest")
A["priciest"] = at("priciest")
A["s1"] = at(["one", "1"], A["priciest"])
A["sum1"] = at(["ten", "10"], A["s1"])
A["key"] = at("key")
A["even"] = at("even")
A["reach"] = at("reach")
A["x1"] = at("cross", A["reach"])
A["s2"] = at(["three", "3"], A["x1"])
A["sum2"] = at(["twelve", "12"], A["s2"])
A["gone"] = at("gone")
A["s3"] = at(["four", "4"], A["gone"])
A["sum3"] = at(["thirteen", "13"])
A["s4"] = at(["five", "5"], A["sum3"])
A["sum4"] = at(["fourteen", "14"])
A["s5"] = at(["seven", "7"], A["sum4"])
A["sum5"] = at(["sixteen", "16"])
A["high"] = at("high")
A["nines"] = at(["nines", "9s"], A["high"])
A["x5"] = at("cross", A["nines"])
A["s6"] = at(["seven", "7"], A["x5"])
A["sum6"] = at(["fifteen", "15"], A["s6"])
A["done"] = at("done")
A["six"] = at(["six", "6"], A["done"])
A["time"] = at("time", A["six"])
A["memory"] = at("memory")
A["db"] = at("databases")
A["pointer"] = at("pointer", A["db"])
A["catch"] = at("catch")
A["sortfirst"] = at("sort", A["catch"])
A["hash"] = at("hash")
A["meet"] = at("meet")
A["twice"] = at("twice")
A["input"] = at("input")
A["tp"] = at("pointers", A["input"])
A["turn"] = at("turn")
A["which"] = at("which", A["turn"])
A["leet"] = at("teach")
A["link"] = at(["links", "link"], A["leet"])
A["bio"] = at("bio", end=True)
order = list(A.values())
assert order == sorted(order), "anchors out of narrative order: " + json.dumps(A)
END = round(A["bio"] + 2.4, 2)
RESET = END - 0.5  # the last half second returns to frame 1 so the reel loops

# ---------------------------------------------------------------- tracks
K = {}


def k(sel, t, props, d=0.3, e="power2.out"):
    K.setdefault(sel, {"init": {}, "pts": []})["pts"].append([round(t, 3), props, d, e])


def init(sel, **props):
    K.setdefault(sel, {"init": {}, "pts": []})["init"].update(props)


def show(sel, t0, t1, y=16, d=0.28):
    init(sel, autoAlpha=0, y=y)
    k(sel, t0, {"autoAlpha": 1, "y": 0}, d, "power3.out")
    k(sel, t1 - 0.2, {"autoAlpha": 0, "y": -y}, 0.2, "power1.in")


def pop(sel, t, d=0.35):
    init(sel, autoAlpha=0, scale=0.7)
    k(sel, t, {"autoAlpha": 1, "scale": 1}, d, "back.out(2.2)")


# --- hook: gift card
init("#gc", autoAlpha=1, scale=1, rotation=-2)
k("#gc", 0.2, {"rotation": 0}, 0.6, "power2.out")
k("#gc", A["menu"] - 0.15, {"autoAlpha": 0, "scale": 0.8}, 0.3, "power2.in")
k("#gc", RESET, {"autoAlpha": 1, "scale": 1, "rotation": -2}, 0.4)
init("#gcS", autoAlpha=0)
k("#gcS", A["spend"], {"autoAlpha": 1}, 0.3)
k("#gcS", RESET, {"autoAlpha": 0}, 0.01)
show("#hookrow", A["spend"] + 0.3, A["menu"], y=24)

# --- meter
TRACK_W = 860
show("#meter", A["menu"], A["db"])
SUMS = [(A["sum1"], 10), (A["sum2"], 12), (A["sum3"], 13), (A["sum4"], 14), (A["sum5"], 16), (A["sum6"], 15)]
init("#fill", scaleX=0.001, backgroundColor="#fbbf24")
for t, s in SUMS:
    k("#fill", t, {"scaleX": s / 18, **({"backgroundColor": "#5eead4"} if s == 15 else {})}, 0.45, "power3.out")
k("#fill", A["db"] + 0.3, {"scaleX": 0.001, "backgroundColor": "#fbbf24"}, 0.01)
RD = [("$0 spent", "mut")] + [(f"${s} · " + ("exact!" if s == 15 else "too low" if s < 15 else "too high"),
                              "teal" if s == 15 else "amb") for _, s in SUMS]
rd_times = [A["menu"]] + [t for t, _ in SUMS] + [A["db"]]
for i in range(len(RD)):
    init(f"#rd{i}", autoAlpha=0, y=10)
    k(f"#rd{i}", rd_times[i], {"autoAlpha": 1, "y": 0}, 0.25)
    if i + 1 < len(RD):
        k(f"#rd{i}", rd_times[i + 1] - 0.05, {"autoAlpha": 0, "y": -10}, 0.05, "none")
BITS = [(-60, -70, "#5eead4"), (40, -90, "#fbbf24"), (90, -40, "#5eead4"), (-100, -20, "#f1f4f9"),
        (70, 50, "#fbbf24"), (-50, 60, "#5eead4"), (120, 10, "#f1f4f9"), (-120, 40, "#fbbf24")]
for i, (dx, dy, _) in enumerate(BITS):
    init(f"#bit{i}", autoAlpha=0, x=0, y=0, rotation=0)
    k(f"#bit{i}", A["sum6"] + 0.2, {"autoAlpha": 1, "x": dx, "y": dy, "rotation": 180}, 0.6, "power3.out")
    k(f"#bit{i}", A["sum6"] + 1.0, {"autoAlpha": 0}, 0.3)
    k(f"#bit{i}", A["sum6"] + 1.4, {"x": 0, "y": 0, "rotation": 0}, 0.01)

# --- menu of price tags
PRICES = [1, 3, 4, 5, 7, 8, 9]
TAG_W, STEP = 124, 134
X0 = (1080 - (7 * TAG_W + 6 * 10)) // 2
tag_x = lambda i: X0 + i * STEP
CROSS = {0: A["x1"] + 0.1, 1: A["gone"], 2: A["sum3"] + 0.35, 3: A["sum4"] + 0.35, 6: A["x5"] + 0.1}
for i in range(7):
    sel = f"#tag{i}"
    init(sel, autoAlpha=0, scale=0.6, borderColor="#263248", backgroundColor="#0e1520")
    k(sel, A["menu"] + 0.1 + i * 0.07, {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
    if i in CROSS:
        k(sel, CROSS[i] + 0.15, {"autoAlpha": 0.3}, 0.3)
    if i in (4, 5):
        k(sel, A["sum6"], {"borderColor": "#5eead4", "backgroundColor": "#0f3d37", "scale": 1.08}, 0.3, "back.out(2)")
        k(sel, A["sum6"] + 0.35, {"scale": 1}, 0.25)
    k(sel, A["db"] - 0.2, {"autoAlpha": 0}, 0.2)
    k(sel, A["db"] + 0.3, {"borderColor": "#263248", "backgroundColor": "#0e1520", "scale": 0.6}, 0.01)
for i, t in CROSS.items():
    init(f"#xo{i}", autoAlpha=0, scale=1.6)
    k(f"#xo{i}", t, {"autoAlpha": 1, "scale": 1}, 0.25, "back.out(1.6)")
    k(f"#xo{i}", A["db"] - 0.2, {"autoAlpha": 0}, 0.2)

# --- fingers: one per end of the menu
fx = lambda i: tag_x(i) + (TAG_W - 72) // 2
init("#fL", autoAlpha=0, x=fx(0), y=-40)
k("#fL", A["cheapest"], {"autoAlpha": 1, "y": 0}, 0.35, "back.out(2)")
for t, to in [(A["x1"] + 0.45, 1), (A["gone"] + 0.3, 2), (A["sum3"] + 0.6, 3), (A["sum4"] + 0.6, 4)]:
    k("#fL", t, {"x": fx(to)}, 0.35, "power3.inOut")
k("#fL", A["db"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#fL", A["db"] + 0.3, {"x": fx(0), "y": -40}, 0.01)
init("#fR", autoAlpha=0, x=fx(6), y=-40)
k("#fR", A["priciest"], {"autoAlpha": 1, "y": 0}, 0.35, "back.out(2)")
k("#fR", A["x5"] + 0.45, {"x": fx(5)}, 0.35, "power3.inOut")
k("#fR", A["db"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#fR", A["db"] + 0.3, {"x": fx(6), "y": -40}, 0.01)
show("#labL", A["cheapest"], A["s1"], y=8)
show("#labR", A["priciest"], A["s1"], y=8)

# --- brute force: every pair
show("#brute", A["pair"], A["smarter"])
TRI = [(r, c) for r in range(6) for c in range(r, 6)]  # 21 cells: pairs (i<j) of 7 items
for n in range(len(TRI)):
    pop(f"#pc{n}", A["pair"] + 0.15 + n * 0.035, 0.2)
init("#b2", autoAlpha=0, x=24)
k("#b2", A["thousand"], {"autoAlpha": 1, "x": 0}, 0.3, "power3.out")

# --- the six checks
EQ = [(1, 9, 10), (3, 9, 12), (4, 9, 13), (5, 9, 14), (7, 9, 16), (7, 8, 15)]
starts = [A["s1"], A["s2"], A["s3"], A["s4"], A["s5"], A["s6"]]
ends = [A["key"], A["s3"], A["s4"], A["s5"], A["s6"], A["six"]]
for i in range(6):
    show(f"#eq{i}", starts[i], ends[i], y=12, d=0.22)
    if i < 5:
        pop(f"#eqt{i}", SUMS[i][0])
init("#paid", autoAlpha=0, scale=1.8, svgOrigin="770 110")
k("#paid", A["sum6"] + 0.35, {"autoAlpha": 1, "scale": 1}, 0.3, "back.out(1.4)")
show("#why", A["key"], A["s2"])
init("#beam", rotation=0, svgOrigin="150 44")
k("#beam", A["even"] + 0.2, {"rotation": 12}, 0.8, "elastic.out(1,0.5)")
init("#panL", y=0)
k("#panL", A["even"] + 0.2, {"y": -21}, 0.8, "elastic.out(1,0.5)")
init("#panR", y=0)
k("#panR", A["even"] + 0.2, {"y": 21}, 0.8, "elastic.out(1,0.5)")
init("#whyB", autoAlpha=0, x=-14)
k("#whyB", A["reach"] - 0.1, {"autoAlpha": 1, "x": 0}, 0.3, "power3.out")

# --- result
show("#score", A["six"], A["db"])
init("#vs", autoAlpha=0)
k("#vs", A["six"] + 0.7, {"autoAlpha": 1}, 0.3)
pop("#bd1", A["time"] - 0.5)
pop("#bd2", A["memory"] - 0.5)

# --- systems: a merge join walks two sorted tables with a pointer in each
ORDERS, USERS = [1, 2, 2, 4, 5], [1, 2, 3, 4, 5]
steps, i, j = [], 0, 0
while i < len(ORDERS) and j < len(USERS):
    m = ORDERS[i] == USERS[j]
    steps.append((i, j, m))
    if m or ORDERS[i] < USERS[j]:
        i += 1
    else:
        j += 1
ROW_Y = lambda r: 250 + r * 88
show("#db", A["db"], A["catch"], y=20)
for r in range(5):
    pop(f"#ro{r}", A["db"] + 0.15 + r * 0.05, 0.25)
    pop(f"#ru{r}", A["db"] + 0.15 + r * 0.05, 0.25)
t0 = A["db"] + 0.9
dt = max(0.28, min(0.5, (A["catch"] - 0.5 - t0) / len(steps)))
init("#dpL", autoAlpha=0, y=ROW_Y(0))
init("#dpR", autoAlpha=0, y=ROW_Y(0))
k("#dpL", t0 - 0.3, {"autoAlpha": 1}, 0.2)
k("#dpR", t0 - 0.3, {"autoAlpha": 1}, 0.2)
pi, pj = 0, 0
for n, (si, sj, m) in enumerate(steps):
    t = t0 + n * dt
    if si != pi:
        k("#dpL", t, {"y": ROW_Y(si)}, dt * 0.7, "power2.inOut")
    if sj != pj:
        k("#dpR", t, {"y": ROW_Y(sj)}, dt * 0.7, "power2.inOut")
    pi, pj = si, sj
    if m:
        init(f"#lk{n}", autoAlpha=0)
        k(f"#lk{n}", t + dt * 0.6, {"autoAlpha": 1}, 0.2)
MATCHES = [(n, si, sj) for n, (si, sj, m) in enumerate(steps) if m]
assert [(ORDERS[a], USERS[b]) for _, a, b in MATCHES] == [(1, 1), (2, 2), (2, 2), (4, 4), (5, 5)]

# --- the catch: must be sorted
show("#catch", A["catch"], A["meet"])
init("#nope", autoAlpha=0, x=-14)
k("#nope", A["catch"] + 0.5, {"autoAlpha": 1, "x": 0}, 0.3, "power3.out")
show("#opt1", A["sortfirst"] - 0.1, A["meet"] + 0.2, y=20)
show("#opt2", A["hash"] - 0.1, A["meet"] + 0.2, y=20)

# --- pitfall: stop when the fingers meet
show("#pit", A["meet"], A["input"])
pop("#ok1", A["meet"] + 0.3)
init("#ln2", autoAlpha=0, y=12)
k("#ln2", A["twice"] - 1.1, {"autoAlpha": 1, "y": 0}, 0.25)
init("#stk", scaleX=0)
k("#stk", A["twice"] - 0.6, {"scaleX": 1}, 0.35, "power2.inOut")
pop("#bad2", A["twice"] - 0.6)
show("#same", A["twice"] - 0.3, A["input"] + 0.2, y=14)

# --- interview cue, challenge
show("#cue", A["input"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["tp"] - 0.2, {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
show("#chal", A["turn"], A["leet"])
pop("#chq", A["which"])

# --- brand lockup, then back to frame 1
init("#topbrand", autoAlpha=1)
k("#topbrand", A["leet"] - 0.2, {"autoAlpha": 0}, 0.3)
k("#topbrand", RESET, {"autoAlpha": 1}, 0.4)
init("#topic", autoAlpha=1)
k("#topic", A["leet"] - 0.2, {"autoAlpha": 0}, 0.3)
k("#topic", RESET, {"autoAlpha": 1}, 0.4)
init("#lock", autoAlpha=0, y=20)
k("#lock", A["leet"], {"autoAlpha": 1, "y": 0}, 0.45, "power3.out")
k("#lock", RESET - 0.1, {"autoAlpha": 0, "y": -16}, 0.3)
init("#lline", autoAlpha=0)
k("#lline", A["leet"] + 0.8, {"autoAlpha": 1}, 0.4)
init("#lcta", autoAlpha=0, scale=0.8)
k("#lcta", A["link"], {"autoAlpha": 1, "scale": 1}, 0.4, "back.out(2)")
init("#larr", x=0)
for n in range(2):
    k("#larr", A["link"] + 0.5 + n * 0.7, {"x": 12}, 0.35, "sine.inOut")
    k("#larr", A["link"] + 0.85 + n * 0.7, {"x": 0}, 0.35, "sine.inOut")

# --- tutor stills, cut on story beats
SB = [(0, "wu-12-blank-card"), (A["menu"] - 0.2, "cu-02-explaining"), (A["c21"], "cu-05b-cringe"),
      (A["thousand"], "cu-04-surprised"), (A["smarter"] - 0.2, "cu-07-confident"), (A["cheapest"], "wu-03-point-side"),
      (A["key"] - 0.2, "wu-02-pen-up"), (A["x1"], "wu-03-point-side"), (A["sum3"], "cu-02-explaining"),
      (A["sum5"], "cu-04-surprised"), (A["nines"] - 0.2, "wu-03b-point-left"), (A["done"] - 0.2, "wu-06-thumbs-up"),
      (A["six"], "fb-05-celebrate"), (A["time"], "cu-01-happy"), (A["db"] - 0.2, "wu-14-laptop"),
      (A["catch"] - 0.2, "wu-09-arms-crossed"), (A["meet"] - 0.2, "cu-06-skeptical"), (A["twice"] - 0.3, "wu-10-shrug"),
      (A["input"] - 0.2, "cu-10-serious"), (A["turn"] - 0.2, "wu-04-open-palm"), (A["which"], "cu-03-thinking"),
      (A["leet"] - 0.2, "fb-03-present"), (RESET, "wu-12-blank-card")]
assert [t for t, _ in SB] == sorted(t for t, _ in SB)
STILLS = sorted({n for _, n in SB})
missing = [n for n in STILLS if not os.path.exists(f"stills/{n}.png")]
assert not missing, f"run prep.sh first; missing stills: {missing}"
for n in STILLS:
    on = SB[0][1] == n
    init(f"#st-{n}", autoAlpha=1 if on else 0, xPercent=-50)
    for j, (t, m) in enumerate(SB[1:], 1):
        if m == n and not on:
            k(f"#st-{n}", t, {"autoAlpha": 1}, 0.14, "power2.out"); on = True
        elif m != n and on:
            k(f"#st-{n}", t, {"autoAlpha": 0}, 0.1, "none"); on = False
# a slow push-in on each hold, reset at every cut
init("#tutor", scale=1, transformOrigin="50% 100%")
for j, (t, _) in enumerate(SB):
    nxt = SB[j + 1][0] if j + 1 < len(SB) else END
    if j:
        k("#tutor", t, {"scale": 1}, 0.001, "none")
    k("#tutor", t + 0.002, {"scale": 1.035}, max(0.01, nxt - t - 0.01), "none")

# --- captions: groups of up to three words, key words coloured
AMB = {"low", "high", "twice", "twenty-one", "21", "thousand", "half", "million", "catch", "problem"}
TEAL = {"fifteen", "15", "done", "six", "6", "smarter", "key", "pointers", "pointer", "sorted", "databases", "leetexpert"}
groups, cur = [], []
for i, x in enumerate(W):
    cur.append(i)
    if (x["t"][-1] in ".?!,:…" and len(cur) >= 2) or len(cur) >= 3 or x["t"][-1] in ".?!…":
        groups.append(cur); cur = []
if cur:
    groups.append(cur)
wc = lambda i: "ca" if forms(W[i]["t"]) & AMB else "ct" if forms(W[i]["t"]) & TEAL else "cw"
cap = "".join(f'<div class="cg" id="g{g}">' + " ".join(f'<span class="{wc(i)}" id="w{i}">{html.escape(W[i]["t"])}</span>' for i in ids) + "</div>"
              for g, ids in enumerate(groups))
WS = [LEAD + x["s"] for x in W]
for g, ids in enumerate(groups):
    s = WS[ids[0]]
    if s >= A["leet"] - 0.05:
        init(f"#g{g}", autoAlpha=0); continue
    e = min(WS[groups[g + 1][0]] if g + 1 < len(groups) else END, A["leet"] - 0.1)
    init(f"#g{g}", autoAlpha=0)
    k(f"#g{g}", s - 0.05, {"autoAlpha": 1}, 0.06, "none")
    k(f"#g{g}", max(e - 0.1, s + 0.02), {"autoAlpha": 0}, 0.04, "none")
    for i in ids:
        init(f"#w{i}", opacity=0.5)
        k(f"#w{i}", WS[i], {"opacity": 1}, 0.08, "none")

# every track must run forward: a keyframe that starts before the previous one
# ends would be shifted later by GSAP, silently drifting off its word
for sel, tr in K.items():
    tr["pts"].sort(key=lambda p: p[0])
    prev = 0.0
    for p in tr["pts"]:
        assert p[0] >= prev - 1e-6, f"{sel}: keyframe at {p[0]} overlaps previous ending {prev}"
        prev = p[0] + p[2]

# ---------------------------------------------------------------- markup
tags = "".join(f'<div class="tag" id="tag{i}" style="left:{tag_x(i)}px"><i class="hole"></i>{I.ITEMS[p]()}<span class="p">${p}</span></div>' for i, p in enumerate(PRICES))
xos = "".join(f'<svg class="xo" id="xo{i}" style="left:{tag_x(i)}px" viewBox="0 0 124 168"><path d="M18 30 L106 138 M106 30 L18 138" stroke="#fbbf24" stroke-width="10" stroke-linecap="round"/></svg>' for i in CROSS)
TX = 30 + TRACK_W * 15 / 18
bits = "".join(f'<div class="bit" id="bit{i}" style="left:{30 + TX - 8}px;top:99px;background:{c}"></div>' for i, (_, _, c) in enumerate(BITS))
rds = "".join(f'<span class="rd {c}" id="rd{i}">{html.escape(t)}</span>' for i, (t, c) in enumerate(RD))
tri = "".join(f'<div class="pc" id="pc{n}" style="left:{c * 36}px;top:{r * 36}px"></div>' for n, (r, c) in enumerate(TRI))
eqs = "".join(f'<div class="panel low eq" id="eq{i}"><span class="e">${a} + ${b} = <b class="{"teal" if s == 15 else "amb"}">${s}</b></span>'
              f'<span class="tg {"teal" if s == 15 else "amb"}" id="eqt{i}">{"exact!" if s == 15 else "too low" if s < 15 else "too high"}</span></div>'
              for i, (a, b, s) in enumerate(EQ[:5]))
eqs += f'<div class="low rcptw" id="eq5">{I.receipt()}</div>'
rows_o = "".join(f'<div class="row" id="ro{r}" style="top:{ROW_Y(r)}px">{v}</div>' for r, v in enumerate(ORDERS))
rows_u = "".join(f'<div class="row" id="ru{r}" style="top:{ROW_Y(r)}px">{v}</div>' for r, v in enumerate(USERS))
CL, CR = 60, 560  # column lefts inside #db
links = "".join(f'<path id="lk{n}" d="M{CL + 300} {ROW_Y(a) + 37} C{CL + 400} {ROW_Y(a) + 37} {CR - 100} {ROW_Y(b) + 37} {CR} {ROW_Y(b) + 37}" stroke="#5eead4" stroke-width="5" fill="none"/>'
                for n, a, b in MATCHES)
stills = "".join(f'<img class="still" id="st-{n}" src="stills/{n}.png" alt="" style="height:{800 if n.startswith("fb-") else 700 if n.startswith("cu-") else 760}px">' for n in STILLS)
minitags = lambda xs: "".join(f'<span class="mt">{I.ITEMS[x]()}<b>${x}</b></span>' for x in xs)
audio = f'<audio id="vo" src="vo.mp3" data-start="{LEAD}" data-duration="{round(duration("vo.mp3"), 2)}" data-track-index="1"></audio>' if HAS_VO else ""

H = f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: Two pointers, gift card</title><script src="gsap.min.js"></script><style>{open("style.css").read()}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{END}">
 <div class="top"><div class="brand" id="topbrand">leetExpert<span class="dot"></span></div><div class="chip" id="topic">Two pointers</div></div>
 <div id="gc" data-layout-allow-overlap>{I.gift_card(15, "a")}<div class="k">GIFT CARD</div><div class="v">$15</div><div class="s" id="gcS">Spend every cent.</div></div>
 <div id="hookrow" data-layout-allow-overlap>{I.cart()}<span>2 items</span>{I.coins()}<span>every cent</span></div>
 <div class="panel" id="meter" data-layout-allow-overlap><div class="mrow"><span class="lbl">gift card <b>$15</b></span><div class="rdwrap">{rds}</div></div>
  <div id="track"><div id="fill"></div><div id="tick" style="left:{TX - 30 - 3}px"></div>{bits}</div></div>
 {tags}{xos}
 <div class="fg" id="fL">{I.hand(I.TEAL, "L")}</div><div class="fg" id="fR">{I.hand(I.AMB, "R")}</div>
 <div class="flab teal" id="labL" style="left:{tag_x(0) + 62 - 110}px">cheapest</div><div class="flab amb" id="labR" style="left:{tag_x(6) + 62 - 110}px">priciest</div>
 <div class="panel low" id="brute" data-layout-allow-overlap><div class="tri">{tri}</div>
  <div class="bstat"><div class="big">21</div><div class="sm">pairs to try, 7 items</div><div id="b2">{I.shelves()}<span>1,000 items →</span><b>499,500</b>{I.hourglass()}</div></div></div>
 {eqs}
 <div class="panel low" id="why" data-layout-allow-overlap>{I.balance()}<div class="wt"><span>$1 + priciest $9<br/>= <span class="amb">$10</span> &lt; $15</span><span id="whyB" class="amb">→ $1 can't reach $15. Cross it off.</span></div></div>
 <div class="low" id="score" style="position:absolute" data-layout-allow-overlap><div class="sc1"><b>6</b><span>checks</span><i id="vs">vs <b>21</b> every pair</i></div>
  <div class="badges"><span class="bd" id="bd1">{I.clock()}O(n) time</span><span class="bd" id="bd2">{I.chip()}O(1) memory</span></div></div>
 <div id="db" data-layout-allow-overlap><div class="dbt">{I.server()}Databases do this too</div><div class="dbs">{I.no_loop()}merge join: one pointer per sorted table</div>
  <div class="dbic" style="left:{CL + 114}px">{I.database(I.AMB)}</div><div class="dbic" style="left:{CR + 114}px">{I.database(I.TEAL)}</div>
  <div class="col" style="left:{CL}px;top:0"><div class="colh" style="position:absolute;top:196px;width:300px">orders.user_id</div>{rows_o}</div>
  <div class="col" style="left:{CR}px;top:0"><div class="colh" style="position:absolute;top:196px;width:300px">users.id</div>{rows_u}</div>
  <svg id="links" viewBox="0 0 920 720">{links}</svg>
  <div class="dp teal" id="dpL" style="left:0">▶</div><div class="dp amb" id="dpR" style="left:{CR + 306}px">◀</div></div>
 <div class="card" id="catch" data-layout-allow-overlap><div class="h">Unsorted menu?</div><div style="margin-top:24px">{minitags([7, 1, 9, 4, 8, 3, 5])}</div>
  <div id="nope" class="mono amb" style="margin-top:22px;font-size:36px;font-weight:700">✗ the fingers can't tell which way to move</div>
  <div class="panel opt" id="opt1" style="top:390px">{I.sort_bars()}<div><span class="t">Sort first</span><span class="c">then two pointers · O(n log n)</span></div></div>
  <div class="panel opt" id="opt2" style="top:560px">{I.buckets()}<div><span class="t">Or use a hash set</span><span class="c">one pass · O(n) time, O(n) memory</span></div></div></div>
 <div class="card" id="pit" data-layout-allow-overlap><div class="h">Stop when the fingers meet</div>
  <div class="panel code" style="top:120px"><div class="ln"><span><span class="kw">while</span> left &lt; right:</span><span class="teal" id="ok1">✓</span></div>
   <div class="ln" id="ln2"><span><span class="kw">while</span> left &lt;= right:</span><span class="amb" id="bad2">✗</span></div>
   <div class="strike" id="stk" style="top:141px;width:600px"></div></div>
  <div class="panel" id="same" style="position:absolute;left:0;right:0;top:420px;padding:28px 32px;font-family:'Space Mono',monospace;font-size:40px;font-weight:700">
   <div class="twice">{I.cookie()}<span class="amb">×2</span>{I.cookie()}</div>$10 card, menu: $5<br/><span class="amb">$5 + $5 = $10<br/>the same item, twice</span></div></div>
 <div class="card" id="cue" data-layout-allow-overlap><div class="cuebox" style="top:40px"><div class="cuemic">{I.mic()}</div><div class="mono amb" style="font-size:32px;font-weight:700">INTERVIEW TELL</div>
  <div class="h" style="margin-top:18px">Sorted input +<br/>find a pair</div>
  <div id="cueB" class="chip" style="display:inline-block;margin-top:26px;font-size:44px">→ say “two pointers”</div></div></div>
 <div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>
  <div class="gcmini">{I.gift_card(12, "b")}<div class="k">GIFT CARD</div><div class="v">$12</div></div><div class="qb">{I.question()}</div>
  <div style="position:absolute;left:0;top:390px">{minitags(PRICES)}</div>
  <div id="chq" class="h" style="position:absolute;left:0;top:520px">Which pair do you hit <span class="teal">first?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>
 <div class="lock" id="lock"><div class="lbrand">leetExpert<span class="ldot"></span></div><div class="lline" id="lline">The interactive DSA course.<br/>Step through every line.</div>
  <div class="lcta" id="lcta">Try leetExpert free <span id="larr">→</span> link in bio</div></div>
 <div class="tutor" id="tutor">{stills}</div>
 <div class="caps">{cap}</div>
 {audio}
</div>
<script>
(function(){{
const tl=gsap.timeline({{paused:true}});
const K={json.dumps(K)};
for (const [sel,{{init,pts}}] of Object.entries(K)) {{
  gsap.set(sel,init); let prev=0; const kf=[];
  for (const [t,v,d,e] of pts) {{ kf.push(Object.assign({{}},v,{{duration:d||0.001,ease:e||"power2.out",delay:Math.max(0,t-prev)}})); prev=t+(d||0.001); }}
  if (kf.length) tl.to(sel,{{keyframes:kf}},0);
}}
window.__timelines=window.__timelines||{{}};
window.__timelines["main"]=tl;
}})();
</script></body></html>'''
open("index.html", "w").write(H)
json.dump({"END": END, "A": A}, open("timing.json", "w"))
print(f"END {END}s · {len(K)} tracks · {len(SB)} still cuts · vo={'yes' if HAS_VO else 'no (silent preview)'}")
