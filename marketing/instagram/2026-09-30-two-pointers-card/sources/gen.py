"""Builds index.html for the two-pointers cheatsheet reel on the shared reelkit engine.

The card is the product's real cheatsheet (sheet.json, from gold.ts); each pattern
gets a code card that verify.py runs on its lesson's cases. Run after reelkit/prep.sh.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "reels-pipeline" / "reelkit"))
from reel import Reel  # noqa: E402
import kiticons as KI  # noqa: E402
from cardhtml import card, CARD_CSS, SHEET, COUNTS  # noqa: E402

R = Reel("Two pointers on one card", "Two pointers")
a = R.anchor
a("save", "save", 0.0)
a("smell", "smell")
a("opposite", "opposite")
a("small", "small")
a("big", "big")
a("removing", "removing")
a("explores", "explores")
a("marks", "marks")
a("finds", "finds")
a("area", "area")
a("inward", "inward")
a("shorter", "shorter")
a("merging", "merging")
a("each", "each")
a("smaller", "smaller")
a("runs", "runs")
a("every", "every")
a("merge", "merge")
a("traps", "traps")
a("sorted", "sorted")
a("watch", "watch")
a("itself", "itself")
a("real", "real")
a("twenty", "twenty")
a("turn", "turn")
a("palindrome", "palindrome")
a("leet", "teach")
a("link", ["links", "link"])
a("bio", "bio", end=True)
R.close()
A, k, init, show, pop = R.A, R.k, R.init, R.show, R.pop

# --- the card: the hook, and again at "this card is the real cheatsheet"
show("#cardA", 0.0, A["smell"], y=0)
show("#cardB", A["real"], A["turn"], y=20)
pop("#recall", A["twenty"])
R.add(f'<div class="cardwrap" id="cardA" data-layout-allow-overlap><div class="sc">{card("a")}</div></div>'
      f'<div class="cardwrap" id="cardB" data-layout-allow-overlap><div class="sc">{card("b")}</div></div>'
      f'<div class="chip" id="recall" style="position:absolute;left:80px;top:1098px;z-index:3">{COUNTS["cheatsheets"]} cheatsheets · one per module with practice</div>')

# --- four smells, four patterns, four code cards
SM = SHEET["smells"]
def banner(bid, j, t0, t1):
    show(f"#{bid}", t0, t1, y=10)
    R.add(f'<div class="bn" id="{bid}"><span class="s">{SM[j]["smell"]}</span><span class="p">→ {SM[j]["pattern"]}</span></div>')

banner("bn0", 0, A["smell"], A["removing"])
R.code("c0", Path("code/opposite_ends.py").read_text(), [
    (A["opposite"] - 0.2, [2], "<code>l</code> at the front, <code>r</code> at the back"),
    (A["small"] - 0.3, [7, 8], "Sum too small: move <code>l</code> in"),
    (A["big"] - 0.3, [9, 10], "Too big: move <code>r</code> in"),
], A["smell"], A["removing"], top=450, font=29)
banner("bn1", 1, A["removing"], A["area"])
R.code("c1", Path("code/fast_slow.py").read_text(), [
    (A["removing"], [3], "<code>fast</code> explores"),
    (A["marks"] - 0.2, [2], "<code>slow</code> marks the end of what you keep"),
    (A["finds"] - 0.2, [4, 5, 6], "Something new? <code>slow</code> steps forward,<br/>takes it"),
], A["removing"] - 0.1, A["area"], top=450, font=30)
banner("bn2", 2, A["area"], A["merging"])
R.code("c2", Path("code/inward_area.py").read_text(), [
    (A["area"], [4], "Area = width × the shorter line"),
    (A["inward"] - 0.2, [2, 3], "Start at both ends, move inward"),
    (A["shorter"] - 0.3, [5, 6, 7, 8], 'Move the <span class="teal">shorter</span> side: the taller one<br/>can never raise the minimum'),
], A["area"] - 0.1, A["merging"], top=450, font=27)
banner("bn3", 3, A["merging"], A["every"])
R.code("c3", Path("code/merge_walk.py").read_text(), [
    (A["each"] - 0.3, [2], "One pointer in each list"),
    (A["smaller"] - 0.3, [5, 6, 7, 8], "Always take the smaller head"),
    (A["runs"] - 0.3, [9], "One runs out: append the rest"),
], A["merging"] - 0.1, A["every"], top=450, font=30)

# --- targets, straight from the card
show("#cx", A["every"], A["traps"], y=20)
rows = "".join(f'<div class="cxr" id="cxr{j}"><span class="l">{c["label"]}</span><span class="t">{c["time"]}</span><span class="m">{c["space"]}</span></div>'
               for j, c in enumerate(SHEET["complexity"]))
for j in range(len(SHEET["complexity"])):
    pop(f"#cxr{j}", A["every"] + 0.4 + j * 0.5 if j < 2 else A["merge"])
R.add(f'<div class="card" id="cx" data-layout-allow-overlap><div class="h">Targets</div><div class="cxh"><span></span><span>time</span><span>space</span></div>{rows}</div>')

# --- the two traps, straight from the card
show("#tr", A["traps"], A["real"], y=20)
pop("#tr0", A["sorted"] - 0.3)
pop("#tr1", A["watch"])
pop("#tr2", A["itself"] - 0.3)
t0, t1 = SHEET["traps"]
R.add(f'<div class="card" id="tr" data-layout-allow-overlap><div class="h">Two traps</div>'
      f'<div class="trap" id="tr0" style="top:110px"><b>{t0["title"]}</b><span>{t0["detail"]}</span></div>'
      f'<div class="trap" id="tr1" style="top:330px"><b>{t1["title"]}</b><span>{t1["detail"]}</span></div>'
      '<div class="panel code" id="tr2" style="top:560px"><div class="ln"><span>while l &lt; r</span><span class="teal">✓</span></div>'
      '<div class="ln"><span>while l &lt;= r</span><span class="amb">[3], 6 → [1, 1] ✗</span></div></div></div>')

# --- challenge
show("#chal", A["turn"], A["leet"])
pop("#chq", A["palindrome"] + 0.3)
R.add(f'<div class="card" id="chal" data-layout-allow-overlap><div class="h">Your turn</div>'
      '<div class="mono" style="position:absolute;top:150px;font-size:44px;font-weight:700">is <span class="teal">"racecar"</span> a palindrome?</div>'
      f'<div class="qb" style="position:absolute;right:30px;top:240px">{KI.question()}</div>'
      '<div id="chq" class="h" style="position:absolute;left:0;top:470px">Which <span class="teal">pattern?</span><div class="mut" style="font-size:36px;margin-top:10px">Answer in the comments ↓</div></div></div>')

# --- lockup, tutor, captions (added last: DOM order is paint order)
R.lockup(A["leet"], A["link"], "The interactive DSA course.<br/>Step through every line.")
R.stills([(0, "wu-12-blank-card"), (A["smell"] - 0.2, "cu-02-explaining"), (A["removing"] - 0.2, "wu-03-point-side"),
          (A["area"] - 0.2, "wu-02-pen-up"), (A["merging"] - 0.2, "wu-03b-point-left"), (A["every"] - 0.2, "cu-07-confident"),
          (A["traps"] - 0.2, "cu-10-serious"), (A["itself"] - 0.2, "cu-05-worried"), (A["real"] - 0.2, "wu-05-tablet"),
          (A["twenty"] - 0.1, "cu-08-excited"), (A["turn"] - 0.2, "wu-04-open-palm"), (A["palindrome"], "cu-03-thinking"),
          (A["leet"] - 0.2, "fb-03-present"), (R.RESET, "wu-12-blank-card")])
R.captions(amber={"traps", "itself", "sorted"},
           teal={"save", "opposite", "fast", "slow", "shorter", "smaller", "leetexpert", "cheatsheet", "card"},
           until=A["leet"])
R.write(CARD_CSS + Path("style.css").read_text())
