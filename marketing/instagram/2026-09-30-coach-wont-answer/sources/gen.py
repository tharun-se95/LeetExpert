"""Builds index.html for the coach reel on the shared reelkit engine.

The product footage is real: screens/ holds stills that capture.mjs took from the running
app. Run from this directory after reelkit/prep.sh: python3 gen.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from viz import ArrayViz, MapViz, load, trace  # noqa: E402

R = Reel("The coach won't give you the answer", "Inside leetExpert")
a = R.anchor
a("point", "point", 0.0)
a("real", "real")
a("draft", "draft")
a("run", "run")
a("names", "names")
a("expected", "expected")
a("hint", "hint")
a("swap", "swap")
a("again", "again")
a("breaks", "breaks")
a("further", "further")
a("insert", "insert")
a("walk", "walk")
a("first", "first")
a("store2", "store")
a("ask", "ask")
a("stored", "stored")
a("itself", "itself")
a("fix", "fix")
a("move", "move")
a("earlier", "earlier")
a("never", "never")
a("run3", "run")
a("solved", "solved")
a("still", "still")
a("why", "why")
a("interview", "interview")
a("failing", "failing")
a("turn", "turn")
a("work", "work")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop
S = lambda n: f"screens/{n}.png"

# --- hook
show("#hk", 0.0, A["real"], y=0)
pop("#hk2", A["point"])
R.add('<div class="card" id="hk" data-layout-allow-overlap><div class="h" style="font-size:84px;margin-top:120px">The coach won\'t give you the answer.</div>'
      '<div class="h teal" id="hk2" style="margin-top:40px;font-size:64px">That\'s the point.</div></div>')

# --- the real run: draft, fail, diagnosis, hint 1, a second attempt, hint 2
typing = R.spread(A["draft"] + 0.5, A["run"] - 0.3, 6)
R.screen("w1", [(A["real"], S("00-description")), (A["draft"], S("01-starter"))]
         + [(t, S(f"02-type{j + 1}")) for j, t in enumerate(typing)]
         + [(A["run"] + 0.2, S("03-run1")), (A["names"] - 0.3, S("04-coach1")), (A["hint"] - 0.2, S("05-hint1")),
            (A["swap"], S("05b-attempt2")), (A["again"] + 0.2, S("05c-run2")), (A["further"] - 0.4, S("06-coach2")),
            (A["insert"] - 0.3, S("07-hint2"))],
         A["real"] - 0.1, A["walk"],
         # the coach's and the hints' lines run the full width, so those shots stay at 1x:
         # a zoom would crop the diagnosis mid-sentence
         zooms=[(A["draft"] + 0.3, 1.25, 0.0, 0.55), (A["run"] + 0.4, 1.3, 1.0, 1.0), (A["names"] - 0.3, 1.0, 0.0, 0.0),
                (A["swap"], 1.15, 0.0, 0.85), (A["again"] + 0.4, 1.3, 1.0, 1.0), (A["further"] - 0.4, 1.0, 0.0, 0.0)],
         # coach shots are cropped above the local build's chat box, which reads "Chat unavailable"
         # (chat needs a model key this capture didn't have); the diagnosis above it is untouched
         crops=[(A["names"] - 0.4, 0.74), (A["hint"] - 0.3, 1.0), (A["further"] - 0.5, 0.74), (A["insert"] - 0.4, 1.0)])

# --- why [0, 0]: walk the draft on [3, 2, 4], target 6
R.code("c1", Path("code/draft.py").read_text(), [
    (A["walk"], [1], "<code>two_sum([3, 2, 4], 6)</code>"),
    (A["first"], [3], "i = 0, n = 3"),
    (A["store2"], [4], "Store it: <code>seen = {3: 0}</code>"),
    (A["ask"], [5], "6 − 3 = 3. Is 3 in <code>seen</code>? Yes…"),
    (A["stored"], [5], '…but that\'s the 3 we <span class="amb">just stored</span>'),
    (A["itself"], [6], '3 pairs with itself → <span class="amb">[0, 0]</span>'),
], A["walk"] - 0.1, A["fix"], top=320, font=30)

# under it, the draft's own run on the failing test: nums with i, and what seen holds
CASE, TGT = [3, 2, 4], 6


def two_sum_states(path):
    ev, res = trace(load(path, "two_sum"), CASE, TGT)
    out = []
    for ln, sn in ev:
        i, n, seen = sn.get("i"), sn.get("n"), sn["seen"]
        if ln == 3 and path.endswith("draft.py"):
            out.append(({"ptr": {"i": i}, "mark": {i: "amb"}, "note": f"i = {i}, n = {n}"}, {"vals": dict(seen)}))
        elif ln == 4 and path.endswith("draft.py"):
            out.append(({"ptr": {"i": i}, "mark": {i: "amb"}}, {"vals": dict(seen), "mark": {n: "amb"}, "note": f"seen[{n}] = {i}"}))
        elif ln == 5 and path.endswith("draft.py"):
            hit = TGT - n in seen
            out.append(({"ptr": {"i": i}, "mark": {i: "amb"}, "note": f"{TGT} − {n} = {TGT - n} in seen? {'yes' if hit else 'no'}"},
                        {"vals": dict(seen), "mark": {TGT - n: "amb"} if hit else {}}))
        elif ln == 4:  # the fix checks first: one beat per i, its store folded in below
            hit = TGT - n in seen
            out.append(({"ptr": {"i": i}, "mark": {i: "amb"}, "note": f"{TGT} − {n} = {TGT - n} in seen? {'yes' if hit else 'no → store it'}"},
                        {"vals": dict(seen), "mark": {TGT - n: "teal"} if hit else {}}))
        elif ln == 6 and not path.endswith("draft.py"):
            out[-1][1]["vals"] = dict(seen)  # the store that follows a miss
            out[-1][1]["mark"] = {n: "amb"}
    return out, res


def stage(times, states, p, t0, t1):
    """nums with i on top, seen under it; the note (a row's) runs full width under seen."""
    row = ArrayViz(R, f"{p}n", CASE, [(t, {k: v for k, v in a.items() if k != "note"}) for t, (a, b) in zip(times, states)], t0, t1,
                   top=R.code_bottom + 14, label=f"nums · target {TGT}", pointers=[("i", "amb", "below")], cell=100)
    MapViz(R, f"{p}s", CASE, [(t, {**b, "note": a.get("note", b.get("note", ""))}) for t, (a, b) in zip(times, states)], t0, t1,
           top=row.bottom + 2, cols=3, label="seen (n → i)")


DS, DRES = two_sum_states("code/draft.py")
DS.append(({"ptr": {"i": DS[-1][0]["ptr"]["i"]}, "mark": {j: "amb" for j in set(DRES)}, "note": f"returns {DRES}: 3 found itself"},
           {"vals": DS[-1][1]["vals"], "mark": {CASE[DRES[0]]: "amb"}}))
dt = [A["first"], A["store2"], A["ask"], A["itself"]]
assert len(dt) == len(DS), (len(dt), len(DS))
stage(dt, DS, "d", A["walk"] - 0.1, A["fix"])

# --- the fix, made in the app: move the store below the check
R.screen("w2", [(A["fix"], S("08-fix0")), (A["move"], S("08-fix1")), (A["move"] + 0.5, S("08-fix2"))],
         A["fix"] - 0.1, A["earlier"] - 0.3, zooms=[(A["fix"], 1.2, 0.0, 0.8)])
R.code("c2", Path("code/fixed.py").read_text(), [
    (A["earlier"] - 0.3, [4, 5], "Check first: <code>seen</code> only holds<br/>earlier numbers"),
    (A["never"], [6], 'Store after, so a number can<br/><span class="teal">never find itself</span>'),
], A["earlier"] - 0.4, A["run3"], top=320, font=30)
FS, FRES = two_sum_states("code/fixed.py")
FS.append(({"ptr": {"i": FRES[1]}, "mark": {j: "teal" for j in FRES}, "note": f"returns {FRES} ✓"}, {"vals": FS[-1][1]["vals"]}))
ft = R.spread(A["earlier"] - 0.3, A["run3"] - 0.6, len(FS))
stage(ft, FS, "f", A["earlier"] - 0.4, A["run3"])
R.screen("w3", [(A["run3"], S("09-pass")), (A["still"] - 0.3, S("10-coach-pass"))], A["run3"] - 0.1, A["why"],
         zooms=[(A["run3"] + 0.3, 1.3, 1.0, 1.0), (A["still"] - 0.3, 1.0, 0.0, 0.0)],
         crops=[(A["still"] - 0.4, 0.74)])

# --- interview cue, challenge
show("#cue", A["why"], A["turn"])
init("#cueB", autoAlpha=0, scale=0.85)
k("#cueB", A["failing"], {"autoAlpha": 1, "scale": 1}, 0.35, "back.out(2)")
R.add(f'<div class="card" id="cue" data-layout-allow-overlap>{KI.cue_card("In an interview,<br/>nobody hands you the fix", "walk the failing case")}</div>')
show("#chal", A["turn"], A["leet"])
pop("#chq", A["work"])
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:44px;font-weight:700">two_sum(<span class="teal">[3, 3]</span>, 6)</div>'
      '<div class="mut mono" style="position:absolute;top:230px;font-size:32px">with the fix</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">Why does it <span class="teal">still work?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
# the tutor only where she adds something: the hook, the break, the surprise, the solve, the challenge, the brand
R.stills([(0, "wu-09-arms-crossed"), (A["point"] - 0.1, "cu-09-wink"), (A["real"] - 0.2, None),
          (A["breaks"] - 0.1, "cu-05b-cringe"), (A["breaks"] + 2.2, None),
          (A["stored"] - 0.1, "cu-04-surprised"), (A["itself"] - 0.2, None),
          (A["solved"] - 0.1, "fb-05-celebrate"), (A["still"] - 0.1, "cu-11-laughing"), (A["why"] - 0.2, None),
          (A["turn"] - 0.2, "wu-04-open-palm"), (A["work"] - 0.1, None),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "wu-09-arms-crossed")])
R.captions(amber={"breaks", "itself", "wrong", "zero"},
           teal={"hint", "fix", "check", "earlier", "solved", "four", "leetexpert", "coach", "reason"},
           until=A["leet"])
R.write(Path("style.css").read_text() if Path("style.css").exists() else "")
