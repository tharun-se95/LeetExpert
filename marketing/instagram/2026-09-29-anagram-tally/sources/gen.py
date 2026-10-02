"""Builds index.html for the anagram-tally reel on the shared reelkit engine.

Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
import icons as I  # noqa: E402
from viz import MapViz, trace  # noqa: E402

sys.path.insert(0, "code")
from is_anagram import is_anagram  # noqa: E402

R = Reel("Valid anagram, tally sheet", "Hash map counting")
a = R.anchor
a("listen", "listen", 0.0)
a("same0", "same")
a("sort", "sort")
a("costs", "costs")
a("think", "think")
a("alpha", ["alphabetize", "alphabetise"])
a("tally", "tally")
a("l2", "listen")
a("s2", "silent")
a("every", "every")
a("zero", "zero")
a("anagram", "anagram")
a("code", "code")
a("lengths", "lengths")
a("counts", "counts")
a("add", "add")
a("take", "take")
a("end", "end")
a("pass", "pass")
a("million", "million")
a("sorting", "sorting")
a("counting", "counting")
a("quarter", "quarter")
a("ware", "warehouses")
a("in", "in")
a("out", "out")
a("catch", "catch")
a("slot", "slot")
a("cafe", ["café", "cafe", "caf"])
a("python", "python")
a("js", "javascript")
a("hash", "hash")
a("sets", "sets")
a("same", "same")
a("notana", "anagrams")
a("counts2", "counts")
a("hear", "hear")
a("say", "say")
a("turn", "turn")
a("versus", "versus")
a("rows", "rows")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- racks: listen over silent. They sort (the habit), unsort, then feed the tally.
S, T = "listen", "silent"
TW, TSTEP = 100, 116
TX0 = (1080 - (6 * TW + 5 * (TSTEP - TW))) // 2
RACK_Y = [380, 540]
RACKS_OFF = A["code"] - 0.2
for w, word in enumerate((S, T)):
    srt = sorted(range(6), key=lambda i: word[i])  # tile index at each sorted slot
    pos = {i: srt.index(i) for i in range(6)}
    assert "".join(word[i] for i in srt) == "eilnst"
    init(f"#rk{w}", autoAlpha=1)
    k(f"#rk{w}", RACKS_OFF, {"autoAlpha": 0}, 0.2)
    k(f"#rk{w}", R.RESET, {"autoAlpha": 1}, 0.4)
    for i in range(6):
        sel = f"#r{w}t{i}"
        init(sel, autoAlpha=1, x=0, y=0)  # on screen at frame 1, so the loop point is full
        k(sel, A["sort"] + 0.1 + i * 0.03, {"x": (pos[i] - i) * TSTEP}, 0.5, "power3.inOut")
        k(sel, A["think"] + i * 0.03, {"x": 0}, 0.5, "power3.inOut")
        k(sel, RACKS_OFF, {"autoAlpha": 0}, 0.2)
        k(sel, R.RESET, {"autoAlpha": 1}, 0.4)
R.add("<div data-layout-allow-overlap>"
      + "".join(f'<div class="rack" id="rk{w}" style="top:{RACK_Y[w] + TW - 6}px">{I.rack()}</div>' for w in range(2))
      + "".join(f'<div class="tile" data-layout-allow-overlap id="r{w}t{i}" style="left:{TX0 + i * TSTEP}px;top:{RACK_Y[w]}px">{KI.tile(ch)}</div>'
                for w, word in enumerate((S, T)) for i, ch in enumerate(word)) + "</div>")

# --- hook text, then the sort panel, crossed out at "alphabetize"
show("#hk", A["same0"] - 0.2, A["sort"], y=18)
show("#sortp", A["sort"], A["tally"], y=20)
pop("#onlogn", A["costs"])
init("#sortx", scaleX=0)
k("#sortx", A["alpha"], {"scaleX": 1}, 0.35, "power2.inOut")
pop("#sortno", A["alpha"] + 0.2)
R.add(f'<div class="low" id="hk" data-layout-allow-overlap><div class="hkq">{KI.question()}</div><div class="h">Same tiles,<br/>different order?</div></div>'
      '<div class="panel low" id="sortp" data-layout-allow-overlap><div class="mut mono" style="font-size:30px">the usual way</div>'
      '<div class="mono sortc">sorted(<span class="teal">"listen"</span>) == sorted(<span class="teal">"silent"</span>)</div>'
      '<div class="mono sortr">"eilnst" == "eilnst" <span class="chip amb-chip" id="onlogn">O(n log n)</span></div>'
      '<div class="strike" id="sortx"></div><div class="nope amb" id="sortno">✗ don\'t sort</div></div>')

# --- the tally sheet: +1 per tile of listen, -1 per tile of silent
show("#tally", A["tally"], RACKS_OFF + 0.2, y=24)
ROWS = list(S)  # one row per letter, in first-seen order
PLUS = R.spread(A["l2"] + 0.35, A["s2"] - 0.1, 6)
MINUS = R.spread(A["s2"] + 0.35, A["every"] - 0.05, 6)
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
    k(f"#va{r}", R.RESET, {"autoAlpha": 1}, 0.01)
    init(f"#vb{r}", autoAlpha=0, scale=1.4)
    k(f"#vb{r}", tp, {"autoAlpha": 1, "scale": 1}, 0.2, "back.out(2)")
    k(f"#vb{r}", tm, {"autoAlpha": 0}, 0.05, "none")
    init(f"#vc{r}", autoAlpha=0, scale=1.4)
    k(f"#vc{r}", tm, {"autoAlpha": 1, "scale": 1}, 0.2, "back.out(2)")
    # the tick is drawn for listen's tile and rubbed out for silent's
    init(f"#tk{r}", autoAlpha=0, scaleY=0, transformOrigin="50% 100%")
    k(f"#tk{r}", tp, {"autoAlpha": 1, "scaleY": 1}, 0.2, "power2.out")
    k(f"#tk{r}", tm, {"autoAlpha": 0, "scaleY": 0.2}, 0.25, "power2.in")
    k(f"#tk{r}", R.RESET, {"scaleY": 0}, 0.01)
    init(f"#row{r}", borderColor="#263248", backgroundColor="#0e1520")
    k(f"#row{r}", A["zero"], {"borderColor": "#5eead4", "backgroundColor": "#0f3d37"}, 0.3)
    k(f"#row{r}", R.RESET, {"borderColor": "#263248", "backgroundColor": "#0e1520"}, 0.01)
init("#tsub", autoAlpha=1)
k("#tsub", A["anagram"] - 0.2, {"autoAlpha": 0}, 0.2)
k("#tsub", R.RESET, {"autoAlpha": 1}, 0.01)
init("#stamp", autoAlpha=0, scale=1.8, rotation=-10)
k("#stamp", A["anagram"], {"autoAlpha": 1, "scale": 1}, 0.3, "back.out(1.4)")
rows = "".join(f'<div class="trow" id="row{r}" style="left:{(r // 3) * 470}px;top:{96 + (r % 3) * 92}px"><span class="tlt">{KI.tile(ch)}</span>'
               f'<span class="tks"><i class="tick" id="tk{r}"></i></span>'
               f'<span class="tv" data-layout-allow-overlap><b class="mut" id="va{r}">0</b><b class="amb" id="vb{r}">+1</b><b class="teal" id="vc{r}">0 ✓</b></span></div>'
               for r, ch in enumerate(ROWS))
R.add(f'<div class="panel" id="tally" data-layout-allow-overlap><div class="thead">{I.clipboard()}<span>tally sheet</span><span class="mut tsub" id="tsub">listen +1 · silent −1</span></div>'
      f'<div class="trows">{rows}</div><div class="stamp" id="stamp">ANAGRAM ✓</div></div>')

# --- the code, line by line; the same file verify.py imports and runs
SRC = Path("code/is_anagram.py").read_text()
R.code("cw", SRC, [
    (A["code"], [1], "<code>is_anagram(s, t)</code>: True or False"),
    (A["lengths"], [2, 3], "Lengths differ? They can't be anagrams."),
    (A["counts"], [4], "<code>counts</code> is the tally sheet:<br/>letter → number"),
    (A["add"] - 0.4, [5, 6], "+1 for every letter of <code>s</code>"),
    (A["take"] - 0.4, [7, 8], "−1 for every letter of <code>t</code>"),
    (A["end"], [9], "Every count back at 0 → anagram"),
    (A["pass"], [5, 6, 7, 8], "One pass over each word:<br/><span class=\"teal\">O(n) time</span>"),
], A["code"] - 0.1, A["million"], top=310, font=28)

# --- under the code, counts filling and emptying: the shown function's own run on listen/silent
S_WORD, T_WORD = "listen", "silent"
EV, RES = trace(is_anagram, S_WORD, T_WORD)
adds = [(sn["ch"], sn["counts"]) for ln, sn in EV if ln == 6]
takes = [(sn["ch"], sn["counts"]) for ln, sn in EV if ln == 8]
assert RES is True and len(adds) == len(takes) == 6
KEYS = list(adds[-1][1])  # letters in the order the tally sheet met them
sign = lambda n: f"+{n}" if n > 0 else str(n)
look = lambda c: {key: sign(v) for key, v in c.items()}
st = [(A["lengths"], {"note": f"len({S_WORD!r}) == len({T_WORD!r}): {len(S_WORD)} == {len(T_WORD)}"}),
      (A["counts"], {"note": "counts = {}"})]
for t, (ch, c) in zip(R.spread(A["add"] - 0.4, A["take"] - 0.5, 6), adds):
    st.append((t, {"vals": look(c), "mark": {ch: "amb"}, "note": f"s: '{ch}' → counts['{ch}'] = {c[ch]}"}))
for t, (ch, c) in zip(R.spread(A["take"] - 0.4, A["end"] - 0.1, 6), takes):
    st.append((t, {"vals": look(c), "mark": {ch: "teal" if c[ch] == 0 else "amb"}, "note": f"t: '{ch}' → counts['{ch}'] = {c[ch]}"}))
st.append((A["end"], {"vals": look(takes[-1][1]), "mark": {key: "teal" for key in KEYS}, "note": f"every count is 0 → {RES}"}))
MapViz(R, "tv", KEYS, st, A["code"] - 0.1, A["million"], top=R.code_bottom + 4, cols=3, label="counts")

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
R.add(f'<div class="card" id="bench" data-layout-allow-overlap><div class="bt">{I.stopwatch()}<div><div class="h">1,000,000 letters</div><div class="mut mono" style="font-size:30px">our test run · Python</div></div></div>'
      f'<div class="bar" style="top:230px"><div class="bl mono">sorted(s) == sorted(t)</div><div class="bt2"><div class="bf amb-bg" id="bf1"></div></div><div class="bv amb mono" id="bv1">{SORT_MS:.0f} ms</div></div>'
      f'<div class="bar" style="top:420px"><div class="bl mono">Counter(s) == Counter(t)</div><div class="bt2"><div class="bf teal-bg" id="bf2"></div></div><div class="bv teal mono" id="bv2">{COUNT_MS:.0f} ms</div></div>'
      '<div class="chip qtr" id="qtr">counting: about ¼ of the time</div></div>')

# --- warehouse: +1 in, -1 out, the ledger back at zero
show("#wh", A["ware"], A["catch"], y=20)
init("#bxin", autoAlpha=0, x=-260)
k("#bxin", A["ware"] + 0.3, {"autoAlpha": 1}, 0.2)
k("#bxin", A["in"] - 0.6, {"x": 0}, 0.6, "power2.out")
k("#bxin", A["in"] + 0.1, {"autoAlpha": 0, "scale": 0.6}, 0.25)
init("#bxout", autoAlpha=0, x=0)
k("#bxout", A["out"] - 0.7, {"autoAlpha": 1}, 0.2)
k("#bxout", A["out"] - 0.4, {"x": 260}, 0.7, "power2.in")
pop("#pin", A["in"] - 0.1)
pop("#pout", A["out"] - 0.1)
R.swap([("#wv0", A["ware"]), ("#wv1", A["in"]), ("#wv2", A["out"] + 0.2)])
R.add(f'<div class="card" id="wh" data-layout-allow-overlap><div class="h">Warehouses do this too</div><div class="mut mono" style="font-size:30px;margin-top:8px">stock reconciliation</div>'
      f'<div class="whs">{I.warehouse()}</div><div class="whb" id="bxin">{I.box()}</div><div class="whb" id="bxout">{I.box(I.TEAL, I.TEAL_M)}</div>'
      '<div class="pm amb" id="pin" style="left:40px">+1 box in</div><div class="pm teal" id="pout" style="right:40px;text-align:right">−1 box out</div>'
      '<div class="panel ledger"><span class="mono">stock row</span><span class="lv" data-layout-allow-overlap><b class="mut" id="wv0">0</b><b class="amb" id="wv1">+1</b><b class="teal" id="wv2">0 ✓ balanced</b></span></div></div>')

# --- the catch: the 26-slot array, café, two failures, the hash map
show("#cat", A["catch"], A["sets"], y=20)
for n in range(26):
    pop(f"#sl{n}", A["slot"] - 0.3 + n * 0.02, 0.2)
show("#cafe", A["cafe"] - 0.1, A["sets"] + 0.2, y=14)
init("#arr", autoAlpha=0, x=-20)
k("#arr", A["cafe"] + 0.4, {"autoAlpha": 1, "x": 0}, 0.35, "power3.out")
show("#err1", A["python"], A["sets"] + 0.2, y=16)
show("#err2", A["js"], A["sets"] + 0.2, y=16)
show("#fix", A["hash"] - 0.1, A["sets"] + 0.2, y=16)
mini = lambda word, cls="": "".join(f'<span class="mt {cls}">{KI.tile(ch)}</span>' for ch in word)
slots = "".join(f'<div class="sl" id="sl{n}">{chr(97 + n)}</div>' for n in range(26))
R.add(f'<div class="card" id="cat" data-layout-allow-overlap><div class="h">The catch: a 26-slot<br/>array covers a to z only</div><div class="slots">{slots}</div>'
      f'<div id="cafe" class="cafe">{mini("caf")}<span class="mt bad">{KI.tile("é")}</span><span class="arr amb mono" id="arr">→ slot 136?</span></div>'
      f'<div class="panel err" id="err1" style="top:360px">{KI.terminal_crash()}<div><span class="t">Python crashes</span><span class="c amb">IndexError: list index out of range</span></div></div>'
      f'<div class="panel err" id="err2" style="top:480px">{I.shh()}<div><span class="t">JavaScript: <span class="amb">false</span></span><span class="c">quietly wrong, it should be true</span></div></div>'
      f'<div class="panel err fixp" id="fix" style="top:600px">{I.buckets()}<div><span class="t">The hash map takes any character</span><span class="c teal">is_anagram("café", "éfac") → True</span></div></div></div>')

# --- pitfall: sets drop the counts
show("#setp", A["sets"], A["hear"], y=20)
pop("#setx", A["same"] + 0.2)
show("#cnt", A["notana"] - 0.2, A["hear"] + 0.2, y=16)
pop("#cntm", A["counts2"])
dots = lambda n, c: f'<span class="dots">{"".join(f"<i style=background:{c}></i>" for _ in range(n))}</span>'
R.add('<div class="card" id="setp" data-layout-allow-overlap><div class="h">Never compare sets</div>'
      '<div class="panel code" style="top:120px"><div class="ln"><span>set(<span class="teal">"aacc"</span>) == set(<span class="teal">"ccac"</span>)</span></div>'
      '<div class="ln"><span>→ True</span><span class="amb" id="setx">✗ wrong</span></div></div>'
      f'<div id="cnt" class="cnt"><div class="panel cc"><b class="mono">aacc</b><div>a {dots(2, I.TEAL)}</div><div>c {dots(2, I.AMB)}</div></div>'
      f'<div class="panel cc"><b class="mono">ccac</b><div>a {dots(1, I.TEAL)}</div><div>c {dots(3, I.AMB)}</div></div></div>'
      '<div class="chip" id="cntm" style="position:absolute;top:640px">counts matter, not just letters</div></div>')

# --- interview cue, challenge
show("#cue", A["hear"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["say"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("Same letters,<br/>any order", "count them")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["rows"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      f'<div class="lrow" style="top:130px">{mini("aab")}</div><div class="lrow" style="top:280px">{mini("abb")}</div><div class="qb" style="position:absolute;right:30px;top:150px">{KI.question()}</div>'
      '<div class="panel crow" style="top:430px"><span class="mono">a: <b class="amb">?</b></span><span class="mono">b: <b class="amb">?</b></span></div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:560px">Which rows <span class="teal">miss zero?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Watch every count change.")
# the tutor only where she adds something: the hook, the payoff, the catch, the challenge, the brand
R.stills([(0, "wu-09-arms-crossed"), (A["listen"] - 0.1, None),
          (A["anagram"] - 0.1, "cu-08-excited"), (A["code"] - 0.3, None),
          (A["python"] - 0.1, "cu-05b-cringe"), (A["js"] - 0.1, "wu-08-facepalm"), (A["hash"] - 0.2, None),
          (A["turn"] - 0.2, "wu-04-open-palm"), (A["rows"] - 0.1, None),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "wu-09-arms-crossed")])
R.captions(amber={"sort", "sorting", "log", "crashes", "range", "worse", "false", "never", "sets", "catch", "miss", "alphabetize"},
           teal={"tally", "zero", "anagram", "pass", "counting", "count", "counts", "quarter", "hash", "map", "lengths", "leetexpert", "scrabble", "code"},
           until=A["leet"])
R.write(Path("style.css").read_text())
