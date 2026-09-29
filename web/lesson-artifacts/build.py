"""Builds one lesson page from its folder into web/lesson-artifacts/dist/<module>/<slug>.html.

A lesson folder holds:
  body.html      the page content, from the hero to the last section
  lesson.js      this lesson's own widgets and content (uses the kit's globals)
  extra.css      optional CSS for this lesson only
  code/<name>.py + code/<name>.ts
                 code shown on the page. The page reads them as CODE.<name>.py / .ts, so
                 there is one copy, and `solution` is the one tests/lessonArtifactSolutions
                 executes against the lesson's sandbox cases in both runtimes.

    python3 web/lesson-artifacts/build.py <module>/<slug>      one lesson
    python3 web/lesson-artifacts/build.py                      all of them
"""
import re, json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(ROOT, "kit")
MOTION_JS = os.path.join(ROOT, "..", "node_modules", "motion", "dist", "motion.js")
sys.path.insert(0, ROOT)
import shared


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


def highlight(bundle):
    """{source: coloured html} for every code file, from the app's own Shiki setup (highlight.ts)."""
    jobs = {}
    for pair in bundle.values():
        jobs[pair["py"]] = "python"
        jobs[pair["ts"]] = "typescript"
    if not jobs:
        return {}
    web = os.path.normpath(os.path.join(ROOT, ".."))
    res = subprocess.run([os.path.join(web, "node_modules", ".bin", "tsx"), os.path.join(ROOT, "highlight.ts")],
                         input=json.dumps(jobs), capture_output=True, text=True, cwd=web)
    if res.returncode:
        raise SystemExit("highlighting failed:\n" + res.stderr)
    out = json.loads(res.stdout)
    missing = [lang for src, lang in jobs.items() if src not in out]
    if missing:
        raise SystemExit(f"highlighting left {len(missing)} file(s) uncoloured ({', '.join(sorted(set(missing)))})")
    return out


def render_lesson(folder):
    """lesson.md rendered by the app's own markdown stack (render-lesson.ts), or None for a lesson
    still written as body.html. Spec 2026-09-26-lesson-content-as-data-design.md."""
    src = os.path.join(folder, "lesson.md")
    if not os.path.exists(src):
        return None
    web = os.path.normpath(os.path.join(ROOT, ".."))
    res = subprocess.run([os.path.join(web, "node_modules", ".bin", "tsx"), os.path.join(ROOT, "render-lesson.ts"), src],
                         capture_output=True, text=True, cwd=web)
    if res.returncode:
        raise SystemExit("lesson.md: " + res.stderr.strip())
    out = json.loads(res.stdout)
    if out["rawBlocks"]:
        print(f"  {os.path.basename(folder)}: {out['rawBlocks']} html fence(s)")
    return out


def code_bundle(folder):
    """{name: {py, ts}} from code/*.py and code/*.ts; a name needs both languages."""
    d = os.path.join(folder, "code")
    names = sorted({os.path.splitext(f)[0] for f in os.listdir(d)}) if os.path.isdir(d) else []
    out = {}
    for n in names:
        py, ts = os.path.join(d, n + ".py"), os.path.join(d, n + ".ts")
        if not (os.path.exists(py) and os.path.exists(ts)):
            raise SystemExit(f"code/{n}: needs both {n}.py and {n}.ts")
        out[n] = {"py": read(py).rstrip("\n"), "ts": read(ts).rstrip("\n")}
    return out


SHELL_TOP = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>@@ICONS@@</defs></svg>
<header class="top"><div class="wrap"><a class="mark" href="#top" aria-label="leetExpert"><span>leetExpert</span><span class="lamp" aria-hidden="true"></span></a>
<div class="seg" role="group" aria-label="Code language"><button type="button" id="lang-py" aria-pressed="true">Python</button><button type="button" id="lang-ts" aria-pressed="false">TypeScript</button></div></div></header>
<main id="top" data-code="py">
'''


# Every lesson has the same seven sections; each heading and contents link wears its icon.
# An id missing here fails the build rather than rendering a heading without one.
SECTION_ICONS = {"problem": "i-s-problem", "attempt": "i-s-attempt", "trap": "i-warn", "insight": "i-s-insight",
                 "solution": "i-s-solution", "variants": "i-s-variants", "quiz": "i-s-quiz",
                 # concept lessons
                 "node": "i-box", "build": "i-stack", "walk": "i-route", "cost": "i-s-cost", "next": "i-s-variants",
                 # overview pages
                 "arrays": "i-flat", "lists": "i-route", "stacks": "i-stack", "queues": "i-rack", "shape": "i-s-insight",
                 "cells": "i-g-cell", "neighbours": "i-g-kernel", "inplace": "i-g-rotate", "walks": "i-g-spiral",
                 "tables": "i-g-cell", "heap": "i-recurse", "graphs": "i-route", "graph": "i-route",
                 "calltrees": "i-recurse"}


def _icon(sec):
    return f'<svg class="i" aria-hidden="true"><use href="#{SECTION_ICONS[sec]}"/></svg>'


def decorate(body):
    body = re.sub(r'<section class="sec" id="([a-z]+)"><h2>(.*?)</h2>',
                  lambda m: f'<section class="sec" id="{m[1]}"><h2><span class="sec-ic">{_icon(m[1])}</span><span>{m[2]}</span></h2>', body)
    nav = re.search(r'<nav class="toc".*?</nav>', body, re.S)
    toc = re.sub(r'<a href="#([a-z]+)">', lambda m: f'<a href="#{m[1]}">{_icon(m[1])}', nav[0])
    body = body[:nav.start()] + toc + body[nav.end():]
    # The kinetic headline's word spans are made here, not in the browser, where the split re-broke
    # the heading's lines after load and moved the hero card (layout shift). It runs after the
    # contents splice above, whose offsets were taken on the unsplit body.
    body = re.sub(r'<h1 id="h1">(.*?)</h1>', lambda m: '<h1 id="h1">' + ' '.join(
        f'<span class="kw">{w}</span>' for w in m[1].split(' ')) + '</h1>', body, count=1)
    return body


# Kit modules only some lessons need, with the names that show a lesson uses them. A lesson that
# does not name them does not ship them (CLAUDE.md §5: 220 lessons must not pay for five).
KIT_OPTIONAL = {"lists": ("ListPlayer", "listOf(", "mountTabs(", "listRun("),
                "lanes": ("LanePlayer", "new Lanes(", "mountLaneTabs("),
                "grids": ("kind:'grid'", 'kind:"grid"'),
                "heaps": ("kind:'heap'", 'kind:"heap"'),
                "graphs": ("kind:'graph'", 'kind:"graph"'),
                # a call tree names no lane kind itself: it builds a graph lane, so it carries its own markers
                "calltrees": ("callTreeWalk(", "new CallTrace(", "mountCallTreeTabs(")}
# what a module needs loaded before it, in the order the page must read them
KIT_DEPS = {"lists": ["player"], "lanes": ["player"], "grids": ["player", "lanes"], "heaps": ["player", "lanes"], "graphs": ["player", "lanes"],
            "calltrees": ["player", "lanes", "graphs"]}


def optional_kit(lesson_js):
    out = []
    for name, marks in KIT_OPTIONAL.items():
        if any(m in lesson_js for m in marks):
            out += [d for d in KIT_DEPS.get(name, []) + [name] if d not in out]
    return out


# the latin files every page needs before it can be shown; the rest load on demand
PRELOAD = sorted(f for f in os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts"))
                 if f.endswith(".woff2") and "-latin-" in f and "-latin-ext-" not in f)


def page_parts(slug):
    """The page script's files in the order build() joins them, as (name, text). The data lines
    (CODE, LESSON, HL) go between the kit and lesson.js. tests/lessonArtifactsScript.test.ts lints
    this same list as one script, so what it checks is what ships."""
    folder = os.path.join(ROOT, slug)
    kit = ["engine", "trees", "kit", *optional_kit(read(folder, "lesson.js"))]
    return [(f"kit/{m}.js", read(KIT, m + ".js")) for m in kit] + [("lesson.js", read(folder, "lesson.js"))]


def build(module, slug, family, title):
    folder = os.path.join(ROOT, slug)
    L, D, N, ND = shared.tokens(family)
    uses = optional_kit(read(folder, "lesson.js"))
    parts = [text for _, text in page_parts(slug)]
    css = shared.BASE_CSS.replace("@@L@@", L).replace("@@D@@", D).replace("@@ND@@", ND).replace("@@N@@", N) + read(KIT, "kit.css")
    css += "".join(read(KIT, m + ".css") for m in uses if os.path.exists(os.path.join(KIT, m + ".css")))
    extra = os.path.join(folder, "extra.css")
    if os.path.exists(extra):
        css += read(extra)
    lesson = render_lesson(folder)
    if lesson and lesson["data"]["title"] != title:
        raise SystemExit(f"{slug}: lesson.md title {lesson['data']['title']!r} differs from build.py's {title!r}")
    body = decorate(lesson["html"] if lesson else read(folder, "body.html"))
    code = code_bundle(folder)
    js = "\n".join([
        "(function(){\n'use strict';",
        *parts[:-1],
        "var CODE=" + json.dumps(code) + ";",
        "var LESSON=" + json.dumps(lesson["data"] if lesson else {"quiz": [], "variants": [], "reveals": {}}) + ";",
        # coloured copies keyed by the exact source, so codeBlock can find them from CODE's strings
        "var HL=" + json.dumps(highlight(code)) + ";",
        parts[-1],
        "wirePage();",
        "window.__built&&window.__built();",
        "})();",
    ])
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="../fonts/fonts.css">
{"".join(f'<link rel="preload" href="../fonts/{f}" as="font" type="font/woff2" crossorigin>' for f in PRELOAD)}
<script>/* the page stays invisible until every weight it requests is in AND the page script has built its
   scenes (capped at 2.5 s), because hidden content cannot shift. Waiting on one weight per face let the
   others arrive late and re-wrap text; waiting on fonts alone revealed the page ~300 ms before motion.js
   arrived and the script drew the hero, which then pushed the text down. Without JS nothing is hidden. */
(function(){{var d=document.documentElement,need=2,reveal=function(){{d.classList.remove('fl');}},done=function(){{if(--need===0)reveal();}};
d.classList.add('fl');setTimeout(reveal,2500);window.__built=done;
if(document.fonts&&document.fonts.load)Promise.all(['400 16px "Space Grotesk"','500 16px "Space Grotesk"','700 16px "Space Grotesk"','400 16px "Space Mono"','700 16px "Space Mono"','400 13px "JetBrains Mono"','500 13px "JetBrains Mono"'].map(function(f){{return document.fonts.load(f);}})).then(done,done);else done();}})();</script>
<style>html.fl body{{visibility:hidden}}</style>
<style>{css}</style></head><body>
{SHELL_TOP.replace("@@ICONS@@", shared.ICONS)}{body}</main>
<script src="../vendor/motion.js"></script>
<script>
{js}
</script></body></html>'''
    out = os.path.join(ROOT, "dist", module, slug + ".html")
    # the page's faces sit beside it, one level up (every page is dist/<module>/<slug>.html)
    shutil.copytree(os.path.join(ROOT, "fonts"), os.path.join(ROOT, "dist", "fonts"), dirs_exist_ok=True)
    # motion.js is served beside the page too, never from a CDN: the reveal is capped at 2.5 s, so a slow CDN
    # showed the page before its scenes were built and the hero then shifted the layout (#42). It is the app's
    # own installed copy, so the artifacts and the app run one version and no copy lives in git.
    os.makedirs(os.path.join(ROOT, "dist", "vendor"), exist_ok=True)
    shutil.copyfile(MOTION_JS, os.path.join(ROOT, "dist", "vendor", "motion.js"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{module}/{slug}: {len(html):,} bytes -> {os.path.relpath(out)}")


# module, slug, family colour (familyTheme.ts id), document title
LESSONS = [
    ("binary-trees", "diameter-of-binary-tree", "recursive-exploration", "Diameter of Binary Tree"),
    ("sliding-window", "longest-substring-without-repeating", "pointer-movement", "Longest Substring Without Repeating Characters"),
    ("dynamic-programming", "coin-change", "state-transition", "Coin Change"),
    ("graphs", "course-schedule", "relationships", "Course Schedule"),
    ("linked-lists", "build-a-linked-list", "pointer-movement", "Build a Linked List From Scratch"),
    # overviews: one page across several modules (not a lesson, so not a ledger row; spec §2)
    ("overviews", "linear-structures", "linear-traversal", "The Line Underneath"),
    ("overviews", "grid-structures", "ordering-search", "The Grid Underneath"),
    # specimens: kit fixtures, not lessons or overviews, so not ledger rows. The browser gate runs them so a
    # player is held to the lesson bar before any lesson depends on it (#22).
    ("specimens", "kit-players", "linear-traversal", "Kit Players"),
]

if __name__ == "__main__":
    want = sys.argv[1] if len(sys.argv) > 1 else None
    hit = [l for l in LESSONS if want in (None, l[1], f"{l[0]}/{l[1]}")]
    if not hit:
        raise SystemExit(f"no lesson {want!r}; known: " + ", ".join(f"{m}/{s}" for m, s, *_ in LESSONS))
    for lesson in hit:
        build(*lesson)
