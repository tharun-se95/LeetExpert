"""Cheatsheet carousels: one per gold module, drawn from sheets.json (the product's gold.ts).

Writes each module's slides as HTML to build/<module>/slideN.html and its post package
(post.md) to marketing/instagram/<DATE>-<module>-cheatsheet/. render.mjs then screenshots the
slides into that package and fails on overflow; check.py re-dumps gold.ts and fails on drift.

  python3 cheatsheet.py && node render.mjs && python3 check.py

Every word on a slide comes from the sheet or from the registry counts; nothing here restates
the course's content by hand, so a change to gold.ts reaches the posts on the next build.
"""
import html
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
DATE = "2026-09-30"  # the packages' date prefix: when they were made, as for every package
DATA = json.loads((HERE / "sheets.json").read_text())
COUNT = DATA["counts"]["cheatsheets"]
FONTS = (ROOT / "web/lesson-artifacts/fonts").as_uri()
e = html.escape

# Two pointers has its own single card (#128), so it is not a carousel.
SKIP = {"two-pointers"}

# Five tags per post (formats.md): structure, idea, a subject tag, then angle and audience.
# Hand-picked because they are labels, not claims; each must be true of that module's sheet.
TAGS = {
    "arrays": "#arrays #inplace #datastructures",
    "strings": "#strings #palindrome #datastructures",
    "hash-tables": "#hashmap #twosum #datastructures",
    "sliding-window": "#slidingwindow #substring #algorithms",
    "linked-lists": "#linkedlist #fastandslowpointers #datastructures",
    "stacks": "#stack #monotonicstack #datastructures",
    "binary-search": "#binarysearch #offbyone #algorithms",
    "graphs": "#graphs #bfs #algorithms",
    "recursion-backtracking": "#recursion #backtracking #algorithms",
    "binary-trees": "#binarytree #dfs #datastructures",
    "heaps": "#heap #priorityqueue #datastructures",
    "intervals": "#intervals #mergeintervals #algorithms",
    "dynamic-programming": "#dynamicprogramming #memoization #algorithms",
}
AUDIENCE = "#cheatsheet #codinginterview"

TONE = {"accent": "#5eead4", "good": "#7ee2a8", "mark": "#8db0ff", "warn": "#fbbf24", "bad": "#f87171"}

CSS = f"""
@font-face{{font-family:"Space Grotesk";src:url("{FONTS}/SpaceGrotesk-latin-V8mDoQDjQS.woff2");font-weight:300 700}}
@font-face{{font-family:"Space Grotesk";src:url("{FONTS}/SpaceGrotesk-latin-ext-V8mDoQDjQS.woff2");font-weight:300 700;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-latin-i7dPIFZifj.woff2");font-weight:400}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-latin-i7dMIFZifj.woff2");font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden;background:#16202e;font-family:"Space Grotesk",sans-serif;color:#f1f4f9}}
body{{background-image:linear-gradient(#1c2838 1px,transparent 1px),linear-gradient(90deg,#1c2838 1px,transparent 1px);background-size:90px 90px}}
.top{{position:absolute;left:60px;right:60px;top:48px;height:64px;display:flex;justify-content:space-between;align-items:center}}
.brand{{display:flex;align-items:center;gap:12px;font-size:40px;font-weight:700}}.brand i{{width:18px;height:18px;border-radius:50%;background:#3fae5a;display:block}}
.save{{font-family:"Space Mono",monospace;font-size:28px;font-weight:700;color:#0e1520;background:#5eead4;padding:8px 18px;border-radius:10px}}
.n{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;color:#94a3b8}}
.content{{position:absolute;left:60px;right:60px;top:150px;bottom:130px;overflow:hidden;display:flex;flex-direction:column;justify-content:center}}
.foot{{position:absolute;left:60px;right:60px;bottom:44px;display:flex;justify-content:space-between;font-family:"Space Mono",monospace;font-size:24px;font-weight:700;color:#94a3b8}}
.k{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;letter-spacing:.18em;color:#5eead4}}
.h{{font-family:"Space Mono",monospace;font-size:60px;font-weight:700;line-height:1.1;margin-top:10px}}
.sub{{font-size:34px;color:#cbd5e1;margin-top:14px;line-height:1.35}}
.card{{background:#0e1520;border:2px solid #263248;border-radius:26px;padding:34px 38px}}
/* cover */
.cover{{display:flex;flex-direction:column;justify-content:center;height:100%}}
.cover .t{{font-family:"Space Mono",monospace;font-size:92px;font-weight:700;line-height:1.05;margin-top:22px}}
.cover .tag{{font-size:46px;color:#cbd5e1;line-height:1.3;margin-top:28px}}
.inside{{display:flex;flex-wrap:wrap;gap:14px;margin-top:56px}}
.inside span{{font-family:"Space Mono",monospace;font-size:30px;font-weight:700;color:#cbd5e1;border:2px solid #263248;background:#0e1520;border-radius:12px;padding:10px 18px}}
.inside b{{color:#5eead4}}
/* smell -> pattern */
.sm{{margin-top:34px}}
.sm .row{{padding:20px 0;border-top:1px solid #263248}}
.sm .s{{font-size:36px;color:#cbd5e1;line-height:1.3}}
.sm .p{{font-size:42px;font-weight:700;color:#5eead4;margin-top:6px}}
/* one pattern per slide */
.pat{{border-left:10px solid var(--tone);margin-top:30px;padding:44px 46px}}
.pat .pt{{font-family:"Space Mono",monospace;font-size:62px;font-weight:700;line-height:1.12}}
.pat .when{{font-size:26px;font-family:"Space Mono",monospace;font-weight:700;letter-spacing:.12em;color:#94a3b8;margin-top:40px}}
.pat .wv{{font-size:40px;color:var(--tone);font-weight:600;margin-top:10px;line-height:1.3}}
.pat .sum{{font-size:42px;line-height:1.42;color:#e2e8f0;margin-top:40px;padding-top:36px;border-top:1px solid #263248}}
/* targets + traps */
.sec{{flex:none;font-family:"Space Mono",monospace;font-size:28px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8;margin:34px 0 10px;display:flex;gap:16px;align-items:baseline}}
.sec:first-child{{margin-top:0}}
.sec span{{text-transform:none;letter-spacing:0;font-size:22px}}
.cx{{display:grid;grid-template-columns:1fr auto auto;column-gap:44px;align-items:baseline;padding:14px 0;border-top:1px solid #263248;font-size:33px}}
.cx small{{display:block;font-size:25px;color:#94a3b8;margin-top:2px}}
.cx .t,.cx .m{{font-family:"Space Mono",monospace;font-weight:700;color:#5eead4;font-size:31px;white-space:nowrap}}
.trap{{border-left:6px solid var(--tone);padding:8px 20px;margin-top:20px}}
.trap b{{font-size:34px;display:block}}.trap span{{font-size:29px;color:#cbd5e1;line-height:1.36;display:block;margin-top:4px}}
/* cta */
.cta{{display:flex;flex-direction:column;justify-content:center;height:100%}}
.cta .big{{font-family:"Space Mono",monospace;font-size:70px;font-weight:700;line-height:1.15;margin-top:22px}}
.cta .big em{{font-style:normal;color:#5eead4}}
.cta p{{font-size:40px;color:#cbd5e1;line-height:1.4;margin-top:30px}}
.cta .where{{font-family:"Space Mono",monospace;font-size:34px;font-weight:700;color:#0e1520;background:#5eead4;border-radius:12px;padding:14px 22px;margin-top:44px;align-self:flex-start}}
"""


def page(title, n, total, body, foot_right):
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>{e(title)} cheatsheet {n}</title>'
            f'<style>{CSS}</style></head><body>'
            f'<div class="top"><div class="brand">leetExpert<i></i></div>'
            f'{"<div class=save>Save this</div>" if n == 1 else f"<div class=n>{n} / {total}</div>"}</div>'
            f'<div class="content">{body}</div>'
            f'<div class="foot"><span>{e(title)} · cheatsheet</span><span>{foot_right}</span></div></body></html>')


def slides(s):
    """[(html body, alt text)] for one sheet, in order."""
    title = s["title"]
    out = []
    inside = (f'<span><b>{len(s["smells"])}</b> smells → patterns</span><span><b>{len(s["patterns"])}</b> patterns</span>'
              f'<span><b>{len(s["complexity"])}</b> targets</span><span><b>{len(s["traps"])}</b> traps</span>')
    out.append((f'<div class="cover"><div class="k">CHEATSHEET</div><div class="t">{e(title)}</div>'
                f'<div class="tag">{e(s["tagline"])}</div><div class="inside">{inside}</div></div>',
                f'Cover. A leetExpert cheatsheet titled "{title}", with a "Save this" tag. Tagline: "{s["tagline"]}" '
                f'Chips list what is inside: {len(s["smells"])} smells to patterns, {len(s["patterns"])} patterns, '
                f'{len(s["complexity"])} targets and {len(s["traps"])} traps.'))
    rows = "".join(f'<div class="row"><div class="s">{e(x["smell"])}</div><div class="p">→ {e(x["pattern"])}</div></div>' for x in s["smells"])
    out.append((f'<div class="k">SMELL → PATTERN</div><div class="h">Which pattern?</div>'
                f'<div class="sub">Spot the smell in the problem; reach for the pattern.</div><div class="sm">{rows}</div>',
                'Smell to pattern. ' + " ".join(f'{x["smell"]} → {x["pattern"]}.' for x in s["smells"])))
    pats = s["patterns"]
    for i, p in enumerate(pats, 1):
        out.append((f'<div class="k">PATTERN {i} OF {len(pats)}</div><div class="card pat" style="--tone:{TONE[p["tone"]]}">'
                    f'<div class="pt">{e(p["title"])}</div><div class="when">WHEN</div><div class="wv">{e(p["smell"])}</div>'
                    f'<div class="sum">{e(p["summary"])}</div></div>',
                    f'Pattern {i} of {len(pats)}: {p["title"]}. When: {p["smell"]}. {p["summary"]}'))
    note = lambda c: f'<small>{e(c["note"])}</small>' if c.get("note") else ""
    cx = "".join(f'<div class="cx"><span class="l">{e(c["label"])}{note(c)}</span><span class="t">{e(c["time"])}</span><span class="m">{e(c["space"])}</span></div>'
                 for c in s["complexity"])
    traps = "".join(f'<div class="trap" style="--tone:{TONE[t["tone"]]}"><b>{e(t["title"])}</b><span>{e(t["detail"])}</span></div>' for t in s["traps"])
    out.append((f'<div class="sec">Targets <span>time · extra space</span></div>{cx}<div class="sec">Traps</div>{traps}',
                "Targets, time and extra space. "
                + " ".join(f'{c["label"]}: {c["time"]} time, {c["space"]} space{" (" + c["note"] + ")" if c.get("note") else ""}.' for c in s["complexity"])
                + " Traps. " + " ".join(f'{t["title"]}: {t["detail"]}' for t in s["traps"])))
    out.append((f'<div class="cta"><div class="k">KEEP IT</div><div class="big">The real <em>{e(title)}</em> cheatsheet, from the course.</div>'
                f'<p>One of {COUNT} in leetExpert, the interactive DSA course. Each sits under its module\'s practice problems, '
                f'beside lessons that visualise every step.</p><div class="where">leetexpert.com · link in bio</div></div>',
                f'Closing slide: "The real {title} cheatsheet, from the course." One of {COUNT} cheatsheets in leetExpert, '
                f'the interactive DSA course, each under its module\'s practice problems. leetexpert.com, link in bio.'))
    return out


def post_md(s, alts, pkg):
    title, slug = s["title"], s["moduleSlug"]
    hook = f"{title} on one cheatsheet: {len(s['patterns'])} patterns, the smells that pick them, the traps. Save this."
    smells = "\n".join(f'{x["smell"]} → {x["pattern"]}' for x in s["smells"])
    cx = "; ".join(f'{c["label"].lower()} {c["time"]} time, {c["space"]} space' for c in s["complexity"])
    traps = "\n".join(f'⚠️ {t["title"]}' for t in s["traps"])
    caption = (f'{title}: {len(s["patterns"])} patterns, and the smell that tells you which one. 📌 Save this.\n\n'
               f'{s["tagline"]}\n\n{smells}\n\nTargets: {cx}.\n\n{traps}\n\n'
               f'This is the real {title} cheatsheet from leetExpert, one of {COUNT}. '
               f'Each one sits under its module\'s practice problems.\n\n'
               f'Which trap has cost you a test case? 👇\n\n'
               f'leetExpert, the interactive DSA course. Link in bio.')
    alt = "\n\n".join(f"**Slide {i}.** {a}" for i, a in enumerate(alts, 1))
    return f"""# {title} cheatsheet carousel (the real sheet, {len(alts)} slides)

- **Account:** leetexpert
- **Archetype:** keep / Recall: the product's own {title} cheatsheet as a carousel
- **Source:** `web/src/lib/course/cheatsheets/content/gold.ts` (module `{slug}`), dumped to `marketing/reels-pipeline/carousel/sheets.json`; shown in the app at `/courses/dsa/{slug}/practice#cheatsheet`
- **Family:** {slug}
- **Format:** Carousel, {len(alts)} slides, 1080×1350
- **Plan:** issue #133 (epic #132)
- **Status:** rendered {DATE}, not scheduled.
- **Media:** {", ".join(f"`slide{i}.png`" for i in range(1, len(alts) + 1))}

## Hook (first line — all most people read)

{hook}

## Caption

{caption}

## Hashtags

{TAGS[slug]} {AUDIENCE}

## Alt text (per slide)

{alt}

## Verified facts

- **Every slide is the product's content.** `cheatsheet.py` builds the slides and this file from `sheets.json`, the dump of `gold.ts`; `check.py` re-dumps `gold.ts` and fails if `sheets.json` has drifted, and rebuilds this file and fails if it differs.
- **"One of {COUNT}"** is the registry's count (`counts.cheatsheets` in the dump), and the module has a practice lesson, where the app renders its cheatsheet (`check.py`).
- `render.mjs` fails if any slide's text runs outside its frame.

## Sources

Generated by `marketing/reels-pipeline/carousel/` (`cheatsheet.py`, `render.mjs`, `check.py`); see its README.
"""


def build():
    out = {}
    for s in DATA["sheets"]:
        slug = s["moduleSlug"]
        if slug in SKIP:
            continue
        assert (ROOT / "courses/dsa" / slug / "practice.md").exists(), f"{slug} has no practice lesson to show its cheatsheet"
        pairs = slides(s)
        d = HERE / "build" / slug
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir(parents=True)
        for n, (body, _) in enumerate(pairs, 1):
            right = "swipe →" if n < len(pairs) else "link in bio"
            (d / f"slide{n}.html").write_text(page(s["title"], n, len(pairs), body, right))
        pkg = ROOT / "marketing/instagram" / f"{DATE}-{slug}-cheatsheet"
        out[slug] = (pkg, post_md(s, [a for _, a in pairs], pkg), len(pairs))
    return out


if __name__ == "__main__":
    built = build()
    for slug, (pkg, md, n) in built.items():
        pkg.mkdir(parents=True, exist_ok=True)
        (pkg / "post.md").write_text(md)
    print(len(built), "carousels:", ", ".join(f"{k} ({v[2]})" for k, v in built.items()))
