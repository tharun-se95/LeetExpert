"""Builds index.html for the anagram-tally reel.

Every visual is anchored to a spoken word in words.json (Scribe's timings for
the real take; est_words.py's stand-in for a silent preview). Each element gets
ONE keyframed GSAP track, so the composition stays seek-safe for HyperFrames.
The engine (anchors, tracks, stills, captions) is the gift-card reel's.
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
A["listen"] = at("listen")
A["same0"] = at("same")
A["sort"] = at("sort")
A["costs"] = at("costs")
A["think"] = at("think")
A["racks"] = at("racks")
A["alpha"] = at(["alphabetize", "alphabetise"])
A["tally"] = at("tally")
A["l2"] = at("listen", A["tally"])
A["s2"] = at("silent", A["l2"])
A["every"] = at("every", A["s2"])
A["zero"] = at("zero", A["every"])
A["anagram"] = at("anagram", A["zero"])
A["pass"] = at("pass", A["anagram"])
A["million"] = at("million")
A["sorting"] = at("sorting", A["million"])
A["counting"] = at("counting", A["sorting"])
A["quarter"] = at("quarter")
A["ware"] = at("warehouses")
A["in"] = at("in", A["ware"])
A["out"] = at("out", A["in"])
A["bonus"] = at("bonus")
A["lengths"] = at("lengths")
A["differ"] = at("differ")
A["done"] = at(["you're", "youre"], A["differ"])
A["catch"] = at("catch")
A["slot"] = at("slot", A["catch"])
A["cafe"] = at(["café", "cafe", "caf"], A["slot"])
A["python"] = at("python")
A["js"] = at("javascript")
A["false"] = at("false", A["js"])
A["hash"] = at("hash")
A["sets"] = at("sets", A["hash"])
A["same"] = at("same", A["sets"])
A["notana"] = at("anagrams", A["same"])
A["counts"] = at("counts", A["notana"])
A["hear"] = at("hear")
A["say"] = at("say", A["hear"])
A["turn"] = at("turn")
A["versus"] = at("versus")
A["rows"] = at("rows", A["versus"])
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


def spread(t0, t1, n):
    step = (t1 - t0) / n
    return [round(t0 + i * step, 3) for i in range(n)]


# --- racks: listen over silent. They sort (the habit), unsort, then feed the tally.
S, T = "listen", "silent"
TW, TSTEP = 100, 116
TX0 = (1080 - (6 * TW + 5 * (TSTEP - TW))) // 2
RACK_Y = [380, 540]
RACKS_OFF = A["million"] - 0.2
for w, word in enumerate((S, T)):
    srt = sorted(range(6), key=lambda i: word[i])  # tile index at each sorted slot
    pos = {i: srt.index(i) for i in range(6)}
    assert "".join(word[i] for i in srt) == "eilnst"
    init(f"#rk{w}", autoAlpha=1)
    k(f"#rk{w}", RACKS_OFF, {"autoAlpha": 0}, 0.2)
    k(f"#rk{w}", RESET, {"autoAlpha": 1}, 0.4)
    for i in range(6):
        sel = f"#r{w}t{i}"
        init(sel, autoAlpha=1, x=0, y=0)  # on screen at frame 1, so the loop point is full
        k(sel, A["sort"] + 0.1 + i * 0.03, {"x": (pos[i] - i) * TSTEP}, 0.5, "power3.inOut")
        k(sel, A["think"] + i * 0.03, {"x": 0}, 0.5, "power3.inOut")
        k(sel, RACKS_OFF, {"autoAlpha": 0}, 0.2)
        k(sel, RESET, {"autoAlpha": 1}, 0.4)

# --- hook text, then the sort panel, crossed out at "alphabetize"
show("#hk", A["same0"] - 0.2, A["sort"], y=18)
show("#sortp", A["sort"], A["tally"], y=20)
pop("#onlogn", A["costs"])
init("#sortx", scaleX=0)
k("#sortx", A["alpha"], {"scaleX": 1}, 0.35, "power2.inOut")
pop("#sortno", A["alpha"] + 0.2)

# --- the tally sheet: +1 per tile of listen, -1 per tile of silent
show("#tally", A["tally"], RACKS_OFF + 0.2, y=24)
ROWS = list(S)  # one row per letter, in first-seen order
PLUS = spread(A["l2"] + 0.35, A["s2"] - 0.1, 6)
MINUS = spread(A["s2"] + 0.35, A["every"] - 0.05, 6)
minus_at = {ROWS.index(ch): MINUS[j] for j, ch in enumerate(T)}
# each tile hops as it is counted: listen's in PLUS order, silent's in MINUS order
for w, times in ((0, PLUS), (1, MINUS)):
    for i, t in enumerate(times):
        k(f"#r{w}t{i}", t - 0.12, {"y": -18}, 0.12, "power2.out")
        k(f"#r{w}t{i}", t + 0.02, {"y": 0}, 0.18, "power2.in")
for r in range(6):
    tp, tm = PLUS[r], minus_at[r]
    init(f"#va{r}", autoAlpha=1)
    k(f"#va{r}", tp, {"autoAlpha": 0}, 0.05, "none")
    k(f"#va{r}", RESET, {"autoAlpha": 1}, 0.01)
    init(f"#vb{r}", autoAlpha=0, scale=1.4)
    k(f"#vb{r}", tp, {"autoAlpha": 1, "scale": 1}, 0.2, "back.out(2)")
    k(f"#vb{r}", tm, {"autoAlpha": 0}, 0.05, "none")
    init(f"#vc{r}", autoAlpha=0, scale=1.4)
    k(f"#vc{r}", tm, {"autoAlpha": 1, "scale": 1}, 0.2, "back.out(2)")
    # the tick is drawn for listen's tile and rubbed out for silent's
    init(f"#tk{r}", autoAlpha=0, scaleY=0, transformOrigin="50% 100%")
    k(f"#tk{r}", tp, {"autoAlpha": 1, "scaleY": 1}, 0.2, "power2.out")
    k(f"#tk{r}", tm, {"autoAlpha": 0, "scaleY": 0.2}, 0.25, "power2.in")
    k(f"#tk{r}", RESET, {"scaleY": 0}, 0.01)
    init(f"#row{r}", borderColor="#263248", backgroundColor="#0e1520")
    k(f"#row{r}", A["zero"], {"borderColor": "#5eead4", "backgroundColor": "#0f3d37"}, 0.3)
    k(f"#row{r}", RESET, {"borderColor": "#263248", "backgroundColor": "#0e1520"}, 0.01)
init("#tsub", autoAlpha=1)
k("#tsub", A["anagram"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#tsub", RESET, {"autoAlpha": 1}, 0.01)
init("#stamp", autoAlpha=0, scale=1.8, rotation=-10)
k("#stamp", A["anagram"], {"autoAlpha": 1, "scale": 1}, 0.3, "back.out(1.4)")
pop("#onepass", A["pass"])

# --- benchmark: our test run on 1,000,000 letters (verify.py records it)
SORT_MS, COUNT_MS = 214.7, 54.9
show("#bench", A["million"], A["ware"], y=20)
init("#bf1", scaleX=0.001)
k("#bf1", A["sorting"] + 0.2, {"scaleX": 1}, 1.2, "power1.inOut")
init("#bf2", scaleX=0.001)
k("#bf2", A["counting"] + 0.1, {"scaleX": COUNT_MS / SORT_MS}, 0.5, "power1.inOut")
pop("#bv1", A["sorting"] + 1.3)
pop("#bv2", A["counting"] + 0.6)
pop("#qtr", A["quarter"])

# --- warehouse: +1 in, -1 out, the ledger back at zero
show("#wh", A["ware"], A["bonus"], y=20)
init("#bxin", autoAlpha=0, x=-260)
k("#bxin", A["ware"] + 0.3, {"autoAlpha": 1}, 0.2)
k("#bxin", A["in"] - 0.6, {"x": 0}, 0.6, "power2.out")
k("#bxin", A["in"] + 0.1, {"autoAlpha": 0, "scale": 0.6}, 0.25)
init("#bxout", autoAlpha=0, x=0)
k("#bxout", A["out"] - 0.7, {"autoAlpha": 1}, 0.2)
k("#bxout", A["out"] - 0.4, {"x": 260}, 0.7, "power2.in")
pop("#pin", A["in"] - 0.1)
pop("#pout", A["out"] - 0.1)
init("#wv0", autoAlpha=1)
k("#wv0", A["in"], {"autoAlpha": 0}, 0.05, "none")
init("#wv1", autoAlpha=0)
k("#wv1", A["in"], {"autoAlpha": 1}, 0.15)
k("#wv1", A["out"] + 0.2, {"autoAlpha": 0}, 0.05, "none")
init("#wv2", autoAlpha=0)
k("#wv2", A["out"] + 0.2, {"autoAlpha": 1}, 0.15)

# --- bonus: lengths first
show("#len", A["bonus"], A["catch"], y=20)
pop("#neq", A["differ"] - 0.1)
pop("#lenno", A["done"])

# --- the catch: 26 slots, café, two failures, the hash-map fix
show("#cat", A["catch"], A["sets"], y=20)
for n in range(26):
    pop(f"#sl{n}", A["slot"] - 0.3 + n * 0.02, 0.2)
show("#cafe", A["cafe"] - 0.1, A["sets"] + 0.2, y=14)
init("#arr", autoAlpha=0, x=-20)
k("#arr", A["cafe"] + 0.4, {"autoAlpha": 1, "x": 0}, 0.35, "power3.out")
show("#err1", A["python"], A["sets"] + 0.2, y=16)
show("#err2", A["js"], A["sets"] + 0.2, y=16)
show("#fix", A["hash"] - 0.1, A["sets"] + 0.2, y=16)

# --- pitfall: sets drop the counts
show("#setp", A["sets"], A["hear"], y=20)
pop("#setx", A["same"] + 0.2)
show("#cnt", A["notana"] - 0.2, A["hear"] + 0.2, y=16)
pop("#cntm", A["counts"])

# --- interview cue, challenge
show("#cue", A["hear"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
show("#chal", A["turn"], A["leet"])
pop("#chq", A["rows"])

# --- brand lockup, then back to frame 1
for sel in ("#topbrand", "#topic"):
    init(sel, autoAlpha=1)
    k(sel, A["leet"] - 0.2, {"autoAlpha": 0}, 0.3)
    k(sel, RESET, {"autoAlpha": 1}, 0.4)
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
SB = [(0, "wu-09-arms-crossed"), (A["listen"], "cu-03-thinking"), (A["sort"], "cu-06-skeptical"),
      (A["think"] - 0.2, "cu-07-confident"), (A["alpha"] - 0.1, "wu-10-shrug"), (A["tally"] - 0.1, "wu-02-pen-up"),
      (A["l2"], "wu-03-point-side"), (A["zero"] - 0.1, "cu-08-excited"), (A["pass"] - 0.1, "wu-06-thumbs-up"),
      (A["million"] - 0.2, "wu-14-laptop"), (A["quarter"] - 0.1, "cu-04-surprised"), (A["ware"] - 0.2, "wu-05-tablet"),
      (A["bonus"] - 0.2, "wu-15-peace-notes"), (A["catch"] - 0.2, "cu-10-serious"), (A["python"] - 0.1, "cu-05b-cringe"),
      (A["js"] - 0.1, "wu-08-facepalm"), (A["hash"] - 0.2, "cu-07-confident"), (A["sets"] - 0.2, "cu-06-skeptical"),
      (A["counts"] - 0.2, "wu-03b-point-left"), (A["hear"] - 0.2, "cu-02-explaining"), (A["turn"] - 0.2, "wu-04-open-palm"),
      (A["rows"] - 0.1, "cu-03-thinking"), (A["leet"] - 0.2, "fb-03-present"), (RESET, "wu-09-arms-crossed")]
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
AMB = {"sort", "sorting", "log", "crashes", "range", "worse", "false", "never", "sets", "catch", "miss", "alphabetize"}
TEAL = {"tally", "zero", "anagram", "pass", "counting", "count", "counts", "quarter", "hash", "map", "lengths", "leetexpert", "scrabble"}
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
tiles = "".join(f'<div class="tile" data-layout-allow-overlap id="r{w}t{i}" style="left:{TX0 + i * TSTEP}px;top:{RACK_Y[w]}px">{I.tile(ch)}</div>'
                for w, word in enumerate((S, T)) for i, ch in enumerate(word))
racks = "".join(f'<div class="rack" id="rk{w}" style="top:{RACK_Y[w] + TW - 6}px">{I.rack()}</div>' for w in range(2))
rows = "".join(f'<div class="trow" id="row{r}" style="left:{(r // 3) * 470}px;top:{96 + (r % 3) * 92}px"><span class="tlt">{I.tile(ch)}</span>'
               f'<span class="tks"><i class="tk" id="tk{r}"></i></span>'
               f'<span class="tv" data-layout-allow-overlap><b class="mut" id="va{r}">0</b><b class="amb" id="vb{r}">+1</b><b class="teal" id="vc{r}">0 ✓</b></span></div>'
               for r, ch in enumerate(ROWS))
mini = lambda word, cls="": "".join(f'<span class="mt {cls}">{I.tile(ch)}</span>' for ch in word)
slots = "".join(f'<div class="sl" id="sl{n}">{chr(97 + n)}</div>' for n in range(26))
stills = "".join(f'<img class="still" id="st-{n}" src="stills/{n}.png" alt="" style="height:{800 if n.startswith("fb-") else 700 if n.startswith("cu-") else 760}px">' for n in STILLS)
dots = lambda n, c: f'<span class="dots">{"".join(f"<i style=background:{c}></i>" for _ in range(n))}</span>'
audio = f'<audio id="vo" src="vo.mp3" data-start="{LEAD}" data-duration="{round(duration("vo.mp3"), 2)}" data-track-index="1"></audio>' if HAS_VO else ""

H = f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: Valid anagram, tally sheet</title><script src="gsap.min.js"></script><style>{open("style.css").read()}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{END}">
 <div class="top"><div class="brand" id="topbrand">leetExpert<span class="dot"></span></div><div class="chip" id="topic">Hash map counting</div></div>
 <div data-layout-allow-overlap>{racks}{tiles}</div>
 <div class="low" id="hk" data-layout-allow-overlap><div class="hkq">{I.question()}</div><div class="h">Same tiles,<br/>different order?</div></div>
 <div class="panel low" id="sortp" data-layout-allow-overlap><div class="mut mono" style="font-size:30px">the usual way</div>
  <div class="mono sortc">sorted(<span class="teal">"listen"</span>) == sorted(<span class="teal">"silent"</span>)</div>
  <div class="mono sortr">"eilnst" == "eilnst" <span class="chip amb-chip" id="onlogn">O(n log n)</span></div>
  <div class="strike" id="sortx"></div><div class="nope amb" id="sortno">✗ don't sort</div></div>
 <div class="panel" id="tally" data-layout-allow-overlap><div class="thead">{I.clipboard()}<span>tally sheet</span><span class="mut tsub" id="tsub">listen +1 · silent −1</span></div>
  <div class="trows">{rows}</div><div class="stamp" id="stamp">ANAGRAM ✓</div><div class="chip" id="onepass">one pass · O(n)</div></div>
 <div class="card" id="bench" data-layout-allow-overlap><div class="bt">{I.stopwatch()}<div><div class="h">1,000,000 letters</div><div class="mut mono" style="font-size:30px">our test run · Python</div></div></div>
  <div class="bar" style="top:230px"><div class="bl mono">sorted(s) == sorted(t)</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">215 ms</div></div>
  <div class="bar" style="top:420px"><div class="bl mono">Counter(s) == Counter(t)</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">55 ms</div></div>
  <div class="chip qtr" id="qtr">counting: about ¼ of the time</div></div>
 <div class="card" id="wh" data-layout-allow-overlap><div class="h">Warehouses do this too</div><div class="mut mono" style="font-size:30px;margin-top:8px">stock reconciliation</div>
  <div class="whs">{I.warehouse()}</div><div class="whb" id="bxin">{I.box()}</div><div class="whb" id="bxout">{I.box(I.TEAL, I.TEAL_M)}</div>
  <div class="pm amb" id="pin" style="left:40px">+1 box in</div><div class="pm teal" id="pout" style="right:40px;text-align:right">−1 box out</div>
  <div class="panel ledger"><span class="mono">stock row</span><span class="lv"><b class="mut" id="wv0">0</b><b class="amb" id="wv1">+1</b><b class="teal" id="wv2">0 ✓ balanced</b></span></div></div>
 <div class="card" id="len" data-layout-allow-overlap><div class="h">Bonus: check the<br/>lengths first</div>
  <div class="lrow" style="top:230px">{mini("listen")}<b class="mono">6</b></div><div class="lrow" style="top:380px">{mini("listens")}<b class="mono">7</b></div>
  <div class="mono amb" id="neq" style="position:absolute;top:530px;font-size:56px;font-weight:700">6 ≠ 7</div>
  <div class="chip" id="lenno" style="position:absolute;top:620px">→ false, no counting needed</div></div>
 <div class="card" id="cat" data-layout-allow-overlap><div class="h">The catch: 26 slots,<br/>a to z only</div><div class="slots">{slots}</div>
  <div id="cafe" class="cafe">{mini("caf")}<span class="mt bad">{I.tile("é")}</span><span class="arr amb mono" id="arr">→ slot 136?</span></div>
  <div class="panel err" id="err1" style="top:360px">{I.terminal_crash()}<div><span class="t">Python crashes</span><span class="c amb">IndexError: list index out of range</span></div></div>
  <div class="panel err" id="err2" style="top:480px">{I.shh()}<div><span class="t">JavaScript: <span class="amb">false</span></span><span class="c">quietly wrong, it should be true</span></div></div>
  <div class="panel err fixp" id="fix" style="top:600px">{I.buckets()}<div><span class="t">Beyond a–z: a hash map</span><span class="c teal">Counter(s) == Counter(t) → True</span></div></div></div>
 <div class="card" id="setp" data-layout-allow-overlap><div class="h">Never compare sets</div>
  <div class="panel code" style="top:120px"><div class="ln"><span>set(<span class="teal">"aacc"</span>) == set(<span class="teal">"ccac"</span>)</span></div>
   <div class="ln"><span>→ True</span><span class="amb" id="setx">✗ wrong</span></div></div>
  <div id="cnt" class="cnt"><div class="panel cc"><b class="mono">aacc</b><div>a {dots(2, I.TEAL)}</div><div>c {dots(2, I.AMB)}</div></div>
   <div class="panel cc"><b class="mono">ccac</b><div>a {dots(1, I.TEAL)}</div><div>c {dots(3, I.AMB)}</div></div></div>
  <div class="chip" id="cntm" style="position:absolute;top:640px">counts matter, not just letters</div></div>
 <div class="card" id="cue" data-layout-allow-overlap><div class="cuebox" style="top:40px"><div class="cuemic">{I.mic()}</div><div class="mono amb" style="font-size:32px;font-weight:700">INTERVIEW TELL</div>
  <div class="h" style="margin-top:18px">Same letters,<br/>any order</div>
  <div id="cueB" class="chip" style="display:inline-block;margin-top:26px;font-size:44px">→ say “count them”</div></div></div>
 <div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>
  <div class="lrow" style="top:130px">{mini("aab")}</div><div class="lrow" style="top:280px">{mini("abb")}</div><div class="qb">{I.question()}</div>
  <div class="panel crow" style="top:430px"><span class="mono">a: <b class="amb">?</b></span><span class="mono">b: <b class="amb">?</b></span></div>
  <div id="chq" class="h" style="position:absolute;left:0;top:560px">Which rows <span class="teal">miss zero?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>
 <div class="lock" id="lock"><div class="lbrand">leetExpert<span class="ldot"></span></div><div class="lline" id="lline">The interactive DSA course.<br/>Watch every count change.</div>
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
