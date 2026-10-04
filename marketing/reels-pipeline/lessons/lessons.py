"""Lesson carousels (#172): one idea from one lesson, with the code and numbers that prove it.

A post is a folder in posts/<id>/:
  post.json   the lesson, the hook, the caption, five hashtags and the slides
  code/       the code a slide shows, verbatim, in Python with a JavaScript twin
  verify.py   prints the post's facts as JSON, computed by running code/
  verify.mjs  prints the same facts from the JavaScript twin
  facts.json  what both printed; the only source of a `{name}` in a slide's text

No number is typed on trust: after the facts are filled in, every number in a slide's prose must
appear in facts.json, in the lesson or in the shown code, or the build fails.

Writes the slides to ../carousel/build/<id>-lesson/ for ../carousel/render.mjs and each
package's post.md to marketing/instagram/<date>-<id>-lesson/.

  python3 lessons.py --facts   # rerun every verifier and rewrite facts.json
  python3 lessons.py && (cd ../carousel && node render.mjs $(ls build | grep -- -lesson$) && python3 kit.py)
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "carousel"))
sys.path.insert(0, str(HERE.parent / "spotbug"))
from glyphs import FACES, draw  # noqa: E402
from spotbug import CSS as CARD_CSS, code, e, lesson_title  # noqa: E402  (the code card and its colours)

ROOT = HERE.parents[2]
BUILD = HERE.parent / "carousel" / "build"
POSTS = sorted(p.name for p in (HERE / "posts").iterdir() if (p / "post.json").exists())
MANIFEST = (ROOT / "web/src/lib/course/manifest.ts").read_text()
TONE = {"good": "#7ee2a8", "bad": "#f87171", "mark": "#8db0ff", "warn": "#fbbf24"}

CSS = CARD_CSS + """
.p{font-size:42px;color:#cbd5e1;line-height:1.42;margin-top:32px}
.p code,.h code,.hook code{font-family:"JetBrains Mono",monospace;font-variant-ligatures:none;font-size:.88em;color:#f1f4f9}
.row .val{font-size:42px;font-family:"JetBrains Mono","Space Mono",monospace}
.pre{font-family:"JetBrains Mono",monospace;font-variant-ligatures:none;white-space:pre;font-size:46px;line-height:1.3;color:#f1f4f9;background:#0e1520;border:2px solid #263248;border-radius:22px;padding:30px 40px;margin-top:30px;align-self:flex-start}
.hook{font-family:"Space Mono",monospace;font-size:84px;font-weight:700;line-height:1.12;margin-top:24px}
.hook em,.p em,.h em{font-style:normal;color:#5eead4}
"""


def load(post):
    return json.loads((HERE / "posts" / post / "post.json").read_text())


def run_verifiers(post):
    """The facts, from both runtimes; they must agree."""
    d = HERE / "posts" / post
    py = subprocess.run([sys.executable, "verify.py"], cwd=d, capture_output=True, text=True)
    js = subprocess.run(["node", "verify.mjs"], cwd=d, capture_output=True, text=True)
    assert py.returncode == 0, f"{post}: verify.py failed\n{py.stderr[-600:]}"
    assert js.returncode == 0, f"{post}: verify.mjs failed\n{js.stderr[-600:]}"
    a, b = json.loads(py.stdout), json.loads(js.stdout)
    assert a == b, f"{post}: Python and JavaScript disagree: {a} vs {b}"
    return a


def fill(text, facts):
    """`{name}` -> the fact, whole numbers with thousands separators."""
    def sub(m):
        v = facts[m.group(1)]
        return f"{v:,}" if isinstance(v, int) else str(v)
    return re.sub(r"\{(\w+)\}", sub, text)


def inline(text):
    """Escaped prose, with `code` spans and *emphasis* in the accent."""
    return re.sub(r"\*([^*]+)\*", r"<em>\1</em>", re.sub(r"`([^`]+)`", r"<code>\1</code>", e(text)))


def numbers(text):
    return {m.replace(",", "") for m in re.findall(r"\d[\d,]*(?:\.\d+)?", text)}


def shown(post, c):
    lines = (HERE / "posts" / post / "code" / c["file"]).read_text().splitlines()
    a, b = c.get("lines", [1, len(lines)])
    return lines[a - 1:b]


def slides(post):
    """[(html, alt)] and the lesson's title."""
    p, facts = load(post), json.loads((HERE / "posts" / post / "facts.json").read_text())
    lesson = (ROOT / p["lesson"]).read_text()
    title = lesson_title(p["lesson"]).strip('"')  # a title with a comma is quoted in the front matter
    assert f'"{p["module"]}"' in MANIFEST or f"'{p['module']}'" in MANIFEST, f"{post}: no module titled {p['module']} in the course manifest"
    known = numbers(lesson) | numbers(" ".join(str(v) for v in facts.values()))
    out = [(f'<div class="k">{e(p["module"].upper())}</div><div class="hook">{inline(fill(p["hook_slide"], facts))}</div>'
            + (f'<div class="p">{inline(fill(p["hook_sub"], facts))}</div>' if p.get("hook_sub") else ""),
            f'Cover. {p["module"]}. {fill(p["hook_slide"], facts)} {fill(p.get("hook_sub", ""), facts)}'.replace("*", "").strip())]
    prose = [p["hook_slide"], p.get("hook_sub", "")]
    for s in p["slides"]:
        kicker = fill(s["k"], facts)
        body, alt = f'<div class="k">{e(kicker)}</div>', [kicker.capitalize() + "."]
        prose.append(s["k"])
        if "h" in s:
            body += f'<div class="h">{inline(fill(s["h"], facts))}</div>'
            alt.append(fill(s["h"], facts).replace("`", ""))
            prose.append(s["h"])
        # a slide's parts are drawn in the order the post lists them
        for part in s:
            if part == "code":
                lines = shown(post, s["code"])
                known |= numbers("\n".join(lines))
                # code never wraps: 880px of card for the widest line plus 3.2em of line number,
                # and about 660px of height at a line height of 1.5, less when prose shares the slide
                room = 660 - 120 * len(s.get("p", [])) - 150 * len(s.get("rows", []))
                size = min(34, int(880 / ((max(len(l) for l in lines) + 3.2) * 0.6)), int(room / (1.5 * len(lines))))
                body += code(lines, "py", size, {int(i) - 1: c for i, c in s["code"].get("marks", {}).items()})
                alt.append("Python code: " + " / ".join(l.strip() for l in lines if l.strip()) + ".")
            elif part == "p":
                for para in s["p"]:
                    body += f'<div class="p">{inline(fill(para, facts))}</div>'
                    alt.append(fill(para, facts).replace("`", ""))
                    prose.append(para)
            elif part == "rows":
                for r in s["rows"]:
                    body += (f'<div class="row" style="--tone:{TONE[r.get("tone", "mark")]}"><div class="lab">{e(fill(r["lab"], facts).upper())}</div>'
                             f'<div class="val">{e(fill(r["val"], facts))}</div></div>')
                    alt.append(f'{fill(r["lab"], facts)}: {fill(r["val"], facts)}.')
                    prose += [r["lab"], r["val"]]
            elif part == "pre":
                # a drawing in text (a tree, a grid): the lesson's own lines, so nothing is redrawn by hand
                for line in s["pre"]["lines"]:
                    assert line in lesson, f"{post}: the drawing's line {line!r} is not in the lesson"
                known |= numbers("\n".join(s["pre"]["lines"]))
                body += f'<div class="pre">{e(chr(10).join(s["pre"]["lines"]))}</div>'
                alt.append(s["pre"]["alt"])
            else:
                assert part in ("k", "h"), f"{post}: a slide has an unknown part {part!r}"
        out.append((body, " ".join(alt)))
    stray = sorted(numbers(fill(" ".join(prose), facts)) - known, key=float)
    assert not stray, f"{post}: these numbers are in no fact, lesson line or shown code: {stray}"
    out.append((f'<div class="cta"><div class="k">FROM THE COURSE</div><div class="big">{e(title)}</div>'
                f'<p>A lesson in {e(p["module"])}, in leetExpert, the interactive DSA course. {inline(p["cta"])}</p>'
                f'<div class="where">leetexpert.com · link in bio</div></div>',
                f'Closing slide. From the course: {title}, a lesson in {p["module"]}, in leetExpert, the interactive DSA course. {p["cta"].replace("`", "")} leetexpert.com, link in bio.'))
    return title, out, facts


def page(post, title, n, total, body):
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>{e(post)} {n}</title><style>{CSS}{FACES}</style></head><body>'
            f'<div class="top"><div class="brand">leetExpert<i></i></div><div class="n">{n} / {total}</div></div>'
            f'<div class="content">{draw(body)}</div>'
            f'<div class="foot"><span>lesson · {e(title)}</span><span>{"swipe →" if n < total else "link in bio"}</span></div></body></html>')


def post_md(post, title, alts, facts):
    p = load(post)
    hook = fill(p["hook"], facts)
    caption = "\n\n".join([hook] + [fill(c, facts) for c in p["caption"]] + ["leetExpert, the interactive DSA course. Link in bio."])
    alt = "\n\n".join(f"**Slide {i}.** {a}" for i, a in enumerate(alts, 1))
    listed = "\n".join(f"- `{k}` = {json.dumps(v, ensure_ascii=False)}" for k, v in facts.items())
    return f"""# {title}: {p["name"]} (carousel, {len(alts)} slides)

- **Account:** leetexpert
- **Archetype:** {p["archetype"]}
- **Source lesson:** `{p["lesson"]}`
- **Family:** {Path(p["lesson"]).parent.name}
- **Format:** Carousel, {len(alts)} slides, 1080×1350
- **Plan:** issue #172 (epic #132); {f'content roadmap post {p["roadmap"]}' if p.get("roadmap") else "not on the content roadmap"}
- **Status:** rendered {p["date"]}, not scheduled.
- **Media:** {", ".join(f"`slide{i}.png`" for i in range(1, len(alts) + 1))}

## Hook (first line — all most people read)

{hook}

## Caption

{caption}

## Hashtags

{p["tags"]}

## Alt text (per slide)

{alt}

## Verified facts

Computed by `marketing/reels-pipeline/lessons/posts/{post}/verify.py` and again by `verify.mjs`, which must print the same values; the shown code is `code/` verbatim.

{listed}

Every number in the slides' prose is one of these, or is in the lesson or the shown code (`lessons.py` fails otherwise).

## Sources

Generated by `marketing/reels-pipeline/lessons/lessons.py` and rendered by `carousel/render.mjs`; see `lessons/README.md`.
"""


def package(post):
    return ROOT / "marketing/instagram" / f"{load(post)['date']}-{post}-lesson"


def build():
    out = {}
    for post in POSTS:
        title, pairs, facts = slides(post)
        d = BUILD / f"{post}-lesson"
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir(parents=True)
        for n, (body, _) in enumerate(pairs, 1):
            (d / f"slide{n}.html").write_text(page(post, title, n, len(pairs), body))
        (d / "target").write_text(str(package(post).relative_to(ROOT)))
        out[post] = (package(post), post_md(post, title, [a for _, a in pairs], facts), len(pairs))
    return out


if __name__ == "__main__":
    if "--facts" in sys.argv:
        for post in POSTS:
            (HERE / "posts" / post / "facts.json").write_text(json.dumps(run_verifiers(post), indent=1, ensure_ascii=False) + "\n")
            print(post, "facts written")
    for post, (pkg, md, n) in build().items():
        pkg.mkdir(parents=True, exist_ok=True)
        (pkg / "post.md").write_text(md)
        print(pkg.name, n, "slides")
