"""Four new looks for Instagram, one post each (#149): light, whiteboard, big type, screenshot.

Owner, 2026-10-01: every post so far is the navy grid, a code card over a stage. These break
it up. Each post is a single 1080×1350 image drawn only from facts.json (computed by facts.py,
recomputed by facts.mjs), written as HTML to ../carousel/build/<name>/slide1.html for
../carousel/render.mjs, which screenshots it into the package and fails on overflow. The
package's post.md (hook, caption, five hashtags, alt text) is written here too, so its words and
the image's come from one place.

  python3 facts.py && node facts.mjs && python3 looks.py && (cd ../carousel && node render.mjs <name> ...)
"""
import html
import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "carousel"))
from glyphs import FACES as EXTRA_FACES, draw  # noqa: E402

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BUILD = HERE.parent / "carousel" / "build"
DATE = "2026-10-01"
FONTS = (ROOT / "web/lesson-artifacts/fonts").as_uri()
F = json.loads((HERE / "facts.json").read_text())
e = html.escape

FACES = f"""
@font-face{{font-family:"Space Grotesk";src:url("{FONTS}/SpaceGrotesk-latin-V8mDoQDjQS.woff2");font-weight:300 700}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-latin-i7dPIFZifj.woff2");font-weight:400}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-latin-i7dMIFZifj.woff2");font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden;font-family:"Space Grotesk",sans-serif}}
.top{{position:absolute;left:64px;right:64px;top:52px;height:60px;display:flex;justify-content:space-between;align-items:center}}
.brand{{display:flex;align-items:center;gap:12px;font-family:"Space Mono",monospace;font-size:38px;font-weight:700}}
.brand i{{width:18px;height:18px;border-radius:50%;display:block}}
.content{{position:absolute;left:64px;right:64px;top:150px;bottom:140px;overflow:hidden;display:flex;flex-direction:column}}
.foot{{position:absolute;left:64px;right:64px;bottom:52px;display:flex;justify-content:space-between;font-family:"Space Mono",monospace;font-size:24px;font-weight:700}}
"""

CLOSE = "leetExpert, the interactive DSA course. Link in bio."


def page(title, css, body, top_right=""):
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>{e(title)}</title>'
            f'<style>{FACES}{EXTRA_FACES}{css}</style></head><body>'
            f'<div class="top"><div class="brand">leetExpert<i></i></div>{top_right}</div>'
            f'<div class="content">{draw(body)}</div>'
            f'<div class="foot"><span>the interactive DSA course</span><span>link in bio</span></div></body></html>')


# --- 1. Light: valid parentheses, the stack after each bracket -------------------------
# The course's light theme (globals.css :root): steel ink on paper, white cards, status inks.
LIGHT = {"paper": "#f1f4f9", "card": "#ffffff", "ink": "#16202e", "soft": "#56606e", "rule": "#d8dde8",
         "good": "#067123", "good_bg": "#e3f6e7", "bad": "#b0081d", "bad_bg": "#fdebe9", "lamp": "#2b7a3b"}


def stack_col(ch, stack, state=""):
    cells = "".join(f'<b>{e(c)}</b>' for c in reversed(stack)) or '<em>empty</em>'
    return f'<div class="col {state}"><div class="ch">{e(ch)}</div><div class="st">{cells}</div></div>'


def light():
    p = F["parens"]
    v, bad = p["valid"], p["invalid"]
    L = LIGHT
    css = f"""
body{{background:{L['paper']};color:{L['ink']}}}.brand i{{background:{L['lamp']}}}.foot{{color:{L['soft']}}}
.k{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;letter-spacing:.16em;color:{L['soft']}}}
.h{{font-family:"Space Mono",monospace;font-size:54px;font-weight:700;line-height:1.12;margin-top:12px}}
.card{{background:{L['card']};border:2px solid {L['rule']};border-radius:24px;padding:22px 28px 22px;margin-top:24px}}
.lab{{display:flex;justify-content:space-between;align-items:baseline;font-size:30px;color:{L['soft']}}}
.lab code{{font-family:"Space Mono",monospace;font-weight:700;font-size:34px;color:{L['ink']}}}
.lab .ok{{font-family:"Space Mono",monospace;font-weight:700;font-size:30px;color:{L['good']}}}
.lab .no{{font-family:"Space Mono",monospace;font-weight:700;font-size:30px;color:{L['bad']}}}
.row{{display:flex;gap:14px;margin-top:18px}}
.col{{flex:1;display:flex;flex-direction:column;align-items:center;gap:12px}}
.ch{{font-family:"Space Mono",monospace;font-weight:700;font-size:42px;line-height:1}}
.st{{width:100%;height:{{H}}px;border:3px solid {L['ink']};border-top:none;border-radius:0 0 12px 12px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;padding:6px}}
.st b{{width:100%;height:40px;border-radius:8px;background:{L['paper']};border:2px solid {L['rule']};font-family:"Space Mono",monospace;font-size:32px;display:flex;align-items:center;justify-content:center}}
.st b:first-child{{border-color:{L['ink']}}}
.st em{{font-style:normal;font-size:22px;color:{L['soft']};margin-bottom:8px}}
.col.fail .ch{{color:{L['bad']}}}.col.fail .st{{border-color:{L['bad']};background:{L['bad_bg']}}}
.col.fail .st b:first-child{{border-color:{L['bad']};color:{L['bad']}}}
.col.done .st{{border-color:{L['good']};background:{L['good_bg']}}}
.why{{font-size:30px;color:{L['bad']};margin-top:12px;line-height:1.35}}
.rule{{font-size:31px;line-height:1.4;margin-top:auto;padding-top:20px;border-top:2px solid {L['rule']}}}
.rule b{{font-family:"Space Mono",monospace}}
"""
    deepest = max(len(s["stack"]) for s in v["steps"])
    css = css.replace("{H}", str(22 + deepest * 46))
    cols = [stack_col(s["ch"], s["stack"]) for s in v["steps"]]
    cols[-1] = stack_col(v["steps"][-1]["ch"], v["steps"][-1]["stack"], "done")
    f = bad["fail"]
    bcols = [stack_col(s["ch"], s["stack"]) for s in bad["steps"]]
    bcols.append(stack_col(f["ch"], bad["steps"][-1]["stack"], "fail"))
    bcols += ['<div class="col"></div>'] * (len(v["steps"]) - len(bcols))
    opener = {")": "(", "]": "[", "}": "{"}[f["ch"]]
    body = (f'<div class="k">STACKS · VALID PARENTHESES</div>'
            f'<div class="h">Every closer must match the last opener.</div>'
            f'<div class="card"><div class="lab"><code>{e(v["s"])}</code><span>stack after each bracket</span><span class="ok">✓ valid</span></div>'
            f'<div class="row">{"".join(cols)}</div></div>'
            f'<div class="card"><div class="lab"><code>{e(bad["s"])}</code><span>stops at bracket {f["at"] + 1}</span><span class="no">✗ invalid</span></div>'
            f'<div class="row">{"".join(bcols)}</div>'
            f'<div class="why"><b>{e(f["ch"])}</b> needs <b>{e(opener)}</b> on top, but the last opener is <b>{e(f["top"])}</b>.</div></div>'
            f'<div class="rule">Opener: push it. Closer: the top must be its partner, so pop it. '
            f'Valid only if the stack ends <b>empty</b>.</div>')
    steps_alt = "; ".join(f'after {s["ch"]} the stack holds {s["stack"] or "nothing"}' for s in v["steps"])
    alt = (f'A light card on pale grey paper headed "Stacks · valid parentheses": every closer must match the last opener. '
           f'The string {v["s"]} is drawn one bracket at a time, each with the stack under it: {steps_alt}; it ends empty, marked valid. '
           f'The string {bad["s"]} pushes ( and [, then {f["ch"]} arrives while {f["top"]} is on top, marked invalid: '
           f'{f["ch"]} needs {opener} on top. The rule underneath: opener, push; closer, the top must be its partner, so pop; '
           f'valid only if the stack ends empty.')
    caption = (f"Valid parentheses is one rule: every closer must match the LAST opener. 📌 Save this.\n\n"
               f"That \"last\" is why it's a stack. Openers go on top; a closer checks the top and pops it.\n\n"
               f"{v['s']} → the stack grows to {max((s['stack'] for s in v['steps']), key=len)} and unwinds to empty ✓\n"
               f"{bad['s']} → {f['ch']} arrives while {f['top']} is on top ✗ (both brackets are \"closed\", in the wrong order)\n\n"
               f"And don't forget the end: \"(\" never meets a wrong closer, but the stack isn't empty, so it's invalid too.\n\n"
               f"Your turn: is \"{p['challenge']['s']}\" valid? Trace the stack 👇\n\n{CLOSE}")
    hook = "Every closer must match the last opener."
    tags = "#validparentheses #stack #python #leetcode #codinginterview"
    verified = (f"- Traces come from `facts.py` / `facts.mjs`, which also run the lesson's reference solution "
                f"(`web/tests/reference/stacks/valid-parentheses.{{py,js}}`) on all {p['cases']} sandbox cases of "
                f"`courses/dsa/stacks/valid-parentheses.md`, and the trace on each; both runtimes agree.\n"
                f"- `{v['s']}` is valid and `{bad['s']}` is invalid by the reference in both languages. `(` is invalid (a lesson case: "
                f"\"the stack isn't empty\"). The challenge `{p['challenge']['s']}` is {'valid' if p['challenge']['valid'] else 'invalid'} by the same reference.")
    return "valid-parentheses-light", "Light post: valid parentheses", css, body, hook, caption, tags, alt, verified


# --- 2. Whiteboard: a linked list is a train, drawn in marker ----------------------------
# Marker inks on a whiteboard, each AA (≥ 4.5:1) on the board: blue 9.2, black 15.6, red 5.6,
# green 5.1, soft 6.0 (measured against #f8f8f4). Every line is drawn twice with a seeded wobble,
# so the sketch is hand-made-looking but identical on every render.
BOARD = {"ground": "#f8f8f4", "frame": "#c9ccc5", "blue": "#1f3c9e", "black": "#23262b", "red": "#b3261e",
         "green": "#19733a", "soft": "#5a5f66", "lamp": "#2b7a3b"}


def rough(x1, y1, x2, y2, rng, w=1.6):
    out = []
    for _ in range(2):
        j = lambda: rng.uniform(-w, w)
        mx, my = (x1 + x2) / 2 + j() * 1.5, (y1 + y2) / 2 + j() * 1.5
        out.append(f"M{x1 + j():.1f} {y1 + j():.1f} Q{mx:.1f} {my:.1f} {x2 + j():.1f} {y2 + j():.1f}")
    return " ".join(out)


def rbox(x, y, w, h, rng):
    return " ".join(rough(*a, rng) for a in ((x, y, x + w, y), (x + w, y, x + w, y + h), (x + w, y + h, x, y + h), (x, y + h, x, y)))


def rcircle(cx, cy, r, rng):
    out = []
    for _ in range(2):
        rr = r + rng.uniform(-1.2, 1.2)
        out.append(f"M{cx - rr:.1f} {cy:.1f} a{rr:.1f} {rr + rng.uniform(-1, 1):.1f} 0 1 0 {2 * rr:.1f} 0 "
                   f"a{rr:.1f} {rr:.1f} 0 1 0 {-2 * rr:.1f} 0")
    return " ".join(out)


def arrow(x1, y1, x2, y2, rng, head=16):
    import math
    a = math.atan2(y2 - y1, x2 - x1)
    tips = [(x2 - head * math.cos(a + s), y2 - head * math.sin(a + s)) for s in (0.5, -0.5)]
    return rough(x1, y1, x2, y2, rng) + " " + " ".join(rough(x2, y2, tx, ty, rng, 0.8) for tx, ty in tips)


def train_svg(n):
    import random
    rng = random.Random(149)
    W, CW, GAP, TOP, H = 952, 140, 58, 118, 96
    xs = [6 + i * (CW + GAP) for i in range(n)]
    ink, cars, links, labels = [], [], [], []
    for i, x in enumerate(xs):
        if i == 0:  # the engine: a cab at the back, a chimney and a nose at the front
            cars.append(rbox(x + 8, TOP, CW - 8, H, rng) + " " + rbox(x + CW - 58, TOP - 46, 50, 46, rng)
                        + " " + rbox(x + 30, TOP - 34, 22, 34, rng) + " " + rough(x + 8, TOP + 34, x - 4, TOP + H, rng)
                        + " " + rough(x - 4, TOP + H, x + 8, TOP + H, rng))
        else:
            cars.append(rbox(x, TOP, CW, H, rng))
        cars.append(rcircle(x + 38, TOP + H + 16, 15, rng) + " " + rcircle(x + CW - 38, TOP + H + 16, 15, rng))
        labels.append(f'<text x="{x + CW / 2 + (6 if i == 0 else 0):.0f}" y="{TOP + 66}" class="num">{i + 1}</text>')
        if i < n - 1:
            links.append(arrow(x + CW + 4, TOP + H / 2, xs[i + 1] - 6, TOP + H / 2, rng))
    head = arrow(xs[0] + 92, 26, xs[0] + 92, TOP - 54, rng)
    return (f'<svg class="train" viewBox="0 0 {W} 250" role="img" aria-label="A train of {n} cars, each pointing to the next; '
            f'head points at the engine, car 1.">'
            f'<path class="car" d="{" ".join(cars)}"/><path class="link" d="{" ".join(links)}"/><path class="head" d="{head}"/>'
            f'<text x="{xs[0] + 112}" y="38" class="hl">head</text>'
            f'<text x="{xs[0] + CW + GAP / 2 + 2:.0f}" y="{TOP + H / 2 - 16:.0f}" class="nx">next</text>{"".join(labels)}</svg>')


def whiteboard():
    t = F["train"]
    sizes = [s["size"] for s in t["front"]]
    assert all(s["links_written"] == 1 and s["old_engine_second"] for s in t["front"])
    B = BOARD
    css = f"""
body{{background:{B['ground']};color:{B['black']}}}.brand i{{background:{B['lamp']}}}.foot{{color:{B['soft']}}}
body::before{{content:"";position:absolute;inset:18px;border:6px solid {B['frame']};border-radius:20px;pointer-events:none}}
.k{{font-family:"Caveat",cursive;font-weight:700;font-size:44px;color:{B['soft']}}}
.h{{font-family:"Permanent Marker",cursive;font-size:76px;line-height:1.08;color:{B['blue']};margin-top:2px}}
.train{{width:100%;margin-top:34px;overflow:visible}}
.train path{{fill:none;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}}
.train .car{{stroke:{B['black']}}}.train .link{{stroke:{B['blue']}}}.train .head{{stroke:{B['green']}}}
.train text{{font-family:"Caveat",cursive;font-weight:700;text-anchor:middle}}
.train .num{{font-size:50px;fill:{B['black']}}}.train .hl{{font-size:40px;fill:{B['green']};text-anchor:start}}
.train .nx{{font-size:30px;fill:{B['blue']}}}
.notes{{margin-top:auto;display:flex;flex-direction:column;gap:30px;padding-bottom:8px}}  /* Caveat descends past a 1.12 line box */
.n{{display:flex;gap:22px;align-items:flex-start;font-family:"Caveat",cursive;font-size:50px;line-height:1.12}}
.n .tag{{font-weight:700;font-size:58px;min-width:136px;line-height:.95}}  /* Caveat: Permanent Marker has no lowercase n */
.n b{{font-weight:700}}
.g{{color:{B['green']}}}.r{{color:{B['red']}}}.bk{{color:{B['black']}}}
"""
    body = (f'<div class="k">Linked lists, on the whiteboard</div>'
            f'<div class="h">A linked list is a train.</div>'
            f'{train_svg(t["cars"])}'
            f'<div class="notes">'
            f'<div class="n"><span class="tag g">O(1)</span><span><b class="g">Add a car at the front:</b> point it at the old engine and call it the head. '
            f'One link, whether the train has {sizes[0]} cars or {sizes[-1]:,}.</span></div>'
            f'<div class="n"><span class="tag r">O(n)</span><span><b class="r">Reach car {t["cars"]}:</b> no jumping ahead. Start at the engine '
            f'and walk, {t["hops_to_5"]} hops. The further back, the longer the walk.</span></div>'
            f'<div class="n"><span class="tag bk">head</span><span><b>Lose the head and the train is gone.</b> All {t["cars_still_linked_behind"]} cars are '
            f'still coupled, but nothing can reach them.</span></div></div>')
    hook = "A linked list is a train."
    alt = (f'A whiteboard sketch in marker. Headline: "A linked list is a train." Below it, a hand-drawn train of {t["cars"]} cars '
           f'numbered 1 to {t["cars"]}, car 1 drawn as the engine, a blue arrow labelled "next" from each car to the one behind it, '
           f'and a green arrow labelled "head" pointing at the engine. Three notes: O(1), add a car at the front: point it at the old '
           f'engine and call it the head, one link whether the train has {sizes[0]} cars or {sizes[-1]:,}. O(n), reach car '
           f'{t["cars"]}: no jumping ahead, start at the engine and walk, {t["hops_to_5"]} hops. Head: lose the head and the train is '
           f'gone; all {t["cars_still_linked_behind"]} cars are still coupled, but nothing can reach them.')
    caption = (f"A linked list is a train. 🚂 Save this.\n\n"
               f"Each car only knows the car behind it (its next). The engine is the head: the one car you hold on to.\n\n"
               f"1️⃣ New car at the front? Point it at the old engine and make it the head. One link, whether the train has "
               f"{sizes[0]} cars or {sizes[-1]:,}. O(1).\n"
               f"2️⃣ Want car {t['cars']}? No jumping ahead: start at the engine and walk. {t['hops_to_5']} hops. O(n).\n"
               f"3️⃣ Drop the head and all {t['cars_still_linked_behind']} cars are still coupled, but nothing can reach them. "
               f"The train is gone.\n\n"
               f"That's the trade against an array: cheap at the front, slow to reach the middle.\n\n"
               f"Your turn: on a train of 1,000 cars, how many hops from the engine to the last car? 👇\n\n{CLOSE}")
    tags = "#linkedlist #datastructures #bigo #leetcode #codinginterview"
    verified = (f"- `facts.py` and `facts.mjs` build the train as a real singly linked list (car k's `next` is car k + 1) and agree: "
                f"{t['cars']} cars reachable from the head; car {t['cars']} is {t['hops_to_5']} `next` hops from the engine.\n"
                f"- Front insertion on trains of " + ", ".join(f"{s:,}" for s in sizes) + " cars: the insertion is one statement, "
                f"a new node whose `next` is the old head (that link checked by identity at each size); no other node is touched, "
                f"so the work does not grow with the train. This is by construction, not a timing.\n"
                f"- Dropping the only head reference: 0 cars reachable from `head`; the {t['cars_still_linked_behind']} cars are still "
                f"linked to each other (walked from a kept reference), which is the post's \"still coupled\".\n"
                f"- The challenge: the last of 1,000 cars is {t['hops_to_1000']} hops from the engine (not shown on the post).\n"
                f"- Faces: Permanent Marker (Apache 2.0) and Caveat (OFL 1.1), vendored with their licences in `marketing/reels-pipeline/fonts/`. "
                f"Neither has →, ✓ or ✗, so arrows are drawn; `render.mjs` fails if any text falls back to a system font.")
    return "linked-list-whiteboard", "Whiteboard: a linked list is a train", css, body, hook, caption, tags, alt, verified


# --- 3. Big type: binary search -------------------------------------------------------
# The dark theme's primary fill and its ink (globals.css .dark --pop / --on-pop): no grid, no card.
BIG = {"ground": "#5c8fff", "ink": "#0e1726", "lamp": "#1d5a29"}


def bigtype():
    b = F["bsearch"]
    n, w = b["n"], b["worst"]
    words = {1_000_000_000: "A billion"}[n]
    css = f"""
body{{background:{BIG['ground']};color:{BIG['ink']}}}.brand i{{background:{BIG['lamp']}}}.foot{{color:{BIG['ink']}}}
.content{{justify-content:center}}
.big{{font-family:"Space Mono",monospace;font-weight:700;font-size:100px;line-height:1.08;letter-spacing:-.02em}}
.big span{{display:block}}
.big .two{{margin-top:40px}}
.why{{font-size:36px;line-height:1.4;margin-top:64px;max-width:860px}}
.why b{{font-family:"Space Mono",monospace}}
"""
    body = (f'<div class="big"><span>{words}<br>sorted numbers.</span><span class="two">At most<br>{w} guesses.</span></div>'
            f'<div class="why">Binary search: guess the middle, keep the half that can still hold the answer. '
            f'Each guess halves what\'s left, and {n:,} halves to nothing in <b>{w}</b>.</div>')
    alt = (f'Huge black type on a bright blue ground: "{words} sorted numbers. At most {w} guesses." Underneath, smaller: '
           f'binary search guesses the middle and keeps the half that can still hold the answer; each guess halves what\'s left, '
           f'and {n:,} halves to nothing in {w}.')
    caption = (f"{words} sorted numbers. At most {w} guesses. 🔎\n\n"
               f"That's binary search: look at the middle, throw away the half that can't hold the answer, repeat.\n\n"
               f"Halving is brutal. {n:,} → {n // 2:,} → {n // 4:,} → … one item left after {w - 1} guesses, "
               f"and guess {w} settles it.\n\n"
               f"A line-by-line scan could need {n:,} looks. The catch: the numbers must be sorted.\n\n"
               f"Your turn: how many guesses for a TRILLION? 👇\n\n{CLOSE}")
    tags = "#binarysearch #logn #bigo #leetcode #codinginterview"
    verified = (f"- `facts.py` and `facts.mjs` compute the worst case for a `lo <= hi` binary search on {n:,} items as {w} "
                f"(probe the middle, recurse on the larger side), check 2^{w - 1} ≤ n < 2^{w} and ceil(log2(n + 1)) = {w}, "
                f"and run {b['searches']:,} real searches over a[i] = 2i (hits, misses, both ends): the most any took is "
                f"{b['max_seen']}, so the bound is reached, not just an upper limit.\n"
                f"- The halving chain: {n:,} // 2 = {n // 2:,}, // 4 = {n // 4:,}.\n"
                f"- The challenge: a trillion needs {b['trillion']} (not shown on the post).")
    return "binary-search-big-type", "Big type: binary search", css, body, words + " sorted numbers. At most " + str(w) + " guesses.", caption, tags, alt, verified


# --- 4. Product screenshot: the Big-O observatory at n = 1,000 ---------------------------
# The real app, captured by shot.mjs (which fails unless the page shows facts.json's counts),
# cropped from its own DOM boxes to the curves panel and the n scrubber.
SHOT = {"ground": "#ffffff", "ink": "#16202e", "soft": "#56606e", "rule": "#d8dde8", "bad": "#b0081d", "lamp": "#2b7a3b"}


def crop(src, box, width):
    x, y, w, h = box
    k = width / w
    W, H = src["size"]
    return (f'<div class="crop" style="width:{w * k:.0f}px;height:{h * k:.0f}px;'
            f'background-image:url(\'{src["url"]}\');background-size:{W * k:.1f}px {H * k:.1f}px;'
            f'background-position:{-x * k:.1f}px {-y * k:.1f}px"></div>')


def screenshot():
    b = F["bigo"]
    pkg = ROOT / "marketing/instagram" / f"{DATE}-big-o-screenshot/sources"
    meta = json.loads((pkg / "observatory.json").read_text())
    rows = meta["shown"]["rows"]
    src = {"url": (pkg / "observatory.png").as_uri(), "size": meta["regions"]["size"]}
    S = SHOT
    css = f"""
body{{background:{S['ground']};color:{S['ink']}}}.brand i{{background:{S['lamp']}}}.foot{{color:{S['soft']}}}
.k{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;letter-spacing:.16em;color:{S['soft']}}}
.h{{font-family:"Space Mono",monospace;font-size:56px;font-weight:700;line-height:1.12;margin-top:12px}}
.h em{{font-style:normal;color:{S['bad']}}}
.shot{{margin-top:34px;align-self:center;display:flex;flex-direction:column;align-items:center;gap:14px;
background:#14202e;border-radius:28px;padding:22px}}
.crop{{border-radius:18px;background-repeat:no-repeat}}
.cap{{font-size:30px;color:{S['soft']};line-height:1.4;margin-top:auto;padding-top:20px;border-top:2px solid {S['rule']}}}
.cap b{{font-family:"Space Mono",monospace;color:{S['ink']}}}
"""
    body = (f'<div class="k">BIG-O · IN THE APP</div>'
            f'<div class="h">At n = {b["n"]:,}, n² is <em>a million</em> steps.</div>'
            f'<div class="shot">{crop(src, meta["regions"]["curves"], 720)}{crop(src, meta["regions"]["slider"], 900)}</div>'
            f'<div class="cap">Same input, five growth rates. n log n is about <b>{b["nlogn"]:,}</b>; n² is '
            f'<b>{b["n2"]:,}</b>. Drag n in the course\'s Big-O observatory and watch them split.</div>')
    alt = (f'A screenshot from the leetExpert course: the Big-O observatory, a dark panel listing five curves at input size n = '
           f'{meta["shown"]["n"]}: ' + ", ".join(f"{k} {v}" for k, v in rows.items()) +
           f'. Under it, the input-size slider set to {meta["shown"]["n"]}. The headline reads "At n = {b["n"]:,}, n² is a million steps." '
           f'The caption: same input, five growth rates; n log n is about {b["nlogn"]:,}, n² is {b["n2"]:,}.')
    caption = (f"At n = {b['n']:,}, n² is a million steps. 📈\n\n"
               f"That's one nested loop over a thousand items: {b['n']:,} × {b['n']:,} = {b['n2']:,}.\n\n"
               f"Same input, other growth rates:\n"
               f"O(log n) → about {round(b['logn'])}\nO(n) → {b['n']:,}\nO(n log n) → about {b['nlogn']:,}\nO(n²) → {b['n2']:,}\n\n"
               f"This is the course's Big-O observatory: drag n and watch the curves split.\n\n"
               f"Your turn: at n = 1,000, how many times bigger is n² than n log n? 👇\n\n{CLOSE}")
    tags = "#bigonotation #timecomplexity #algorithms #leetcode #codinginterview"
    verified = (f"- `shot.mjs` drives the running app (`/courses/dsa/big-o/common-complexity-classes`), sets n to {b['n']:,} "
                f"through the page's own slider and **fails** unless the page shows n = 1.0K, O(n) = 1.0K and O(n²) = "
                f"{b['n2'] / 1e6:.1f}M. It shows: " + ", ".join(f"{k} {v}" for k, v in rows.items()) + ".\n"
                f"- `facts.py` / `facts.mjs` count a {b['n']:,} × {b['n']:,} nested loop: {b['n2']:,} steps in both runtimes; "
                f"n log2 n = {b['nlogn']:,} (rounded), log2 n = {b['logn']}.\n"
                f"- The challenge: {b['n2']:,} / {b['nlogn']:,} ≈ {b['n2'] / b['nlogn']:.0f} (not shown on the post).\n"
                f"- The observatory is a navy instrument card in both themes, so the capture is the same in either.")
    return "big-o-screenshot", "Product screenshot: Big-O at n = 1,000", css, body, f"At n = {b['n']:,}, n² is a million steps.", caption, tags, alt, verified


def post_md(title, look, hook, caption, tags, alt, verified, media="slide1.png"):
    return (f"# {title}\n\n"
            f"- **Account:** leetexpert\n- **Look:** {look} (#149: one post in each of four new looks)\n"
            f"- **Format:** single image, 1080×1350\n- **Media:** `{media}`\n"
            f"- **Build:** `marketing/reels-pipeline/looks/` (`facts.py`, `facts.mjs`, `looks.py`), rendered by "
            f"`marketing/reels-pipeline/carousel/render.mjs`\n\n"
            f"## Hook\n\n{hook}\n\n## Caption\n\n{caption}\n\n## Hashtags\n\n{tags}\n\n## Alt text\n\n{alt}\n\n"
            f"## Verified facts\n\n{verified}\n")


def write(name, title, css, body, hook, caption, tags, alt, verified):
    pkg = ROOT / "marketing/instagram" / f"{DATE}-{name}"
    pkg.mkdir(parents=True, exist_ok=True)
    look = title.split(":")[0]  # "Light post", "Big type", …
    (pkg / "post.md").write_text(post_md(title, look, hook, caption, tags, alt, verified))
    out = BUILD / name
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    (out / "target").write_text(str(pkg.relative_to(ROOT)) + "\n")
    (out / "slide1.html").write_text(page(title, css, body))
    assert len(tags.split()) == 5, f"{name}: {len(tags.split())} hashtags"
    return name


POSTS = {"valid-parentheses-light": light, "linked-list-whiteboard": whiteboard, "binary-search-big-type": bigtype, "big-o-screenshot": screenshot}

if __name__ == "__main__":
    only = sys.argv[1:] or list(POSTS)
    for k in only:
        print(write(*POSTS[k]()))
