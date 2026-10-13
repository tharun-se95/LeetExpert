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
    python3 web/lesson-artifacts/build.py --overviews          the overviews' declarations as JSON, nothing built
"""
import re, json, os, shutil, subprocess, sys
from html.parser import HTMLParser

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
                 "calltrees": "i-recurse", "intervals": "i-flat", "tries": "i-recurse", "plots": "i-s-cost", "pointers": "i-route"}


def _icon(sec):
    return f'<svg class="i" aria-hidden="true"><use href="#{SECTION_ICONS[sec]}"/></svg>'


VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def _top_level(fragment):
    """[(start, end, tag, attrs)] for each top-level element of an HTML fragment, by offset."""
    starts = [0]
    for line in fragment.splitlines(keepends=True):
        starts.append(starts[-1] + len(line))
    out = []

    class P(HTMLParser):
        depth = 0

        def at(self):
            ln, col = self.getpos()
            return starts[ln - 1] + col

        def handle_starttag(self, tag, attrs):
            if self.depth == 0:
                out.append([self.at(), None, tag, dict(attrs)])
            if tag in VOID:
                if self.depth == 0:
                    out[-1][1] = self.at() + len(self.get_starttag_text())
            else:
                self.depth += 1

        # <use/> inside an svg: opens and closes at once, so the depth never moves
        def handle_startendtag(self, tag, attrs):
            if self.depth == 0:
                out.append([self.at(), self.at() + len(self.get_starttag_text()), tag, dict(attrs)])

        def handle_endtag(self, tag):
            if tag in VOID:
                return
            self.depth -= 1
            if self.depth == 0:
                out[-1][1] = fragment.index(">", self.at()) + 1

    P(convert_charrefs=False).feed(fragment)
    return [tuple(x) for x in out]


def _kind(attrs):
    """What a top-level element of a section is to the split layout: 'vis' (a picture the prose
    points at, drawn beside it), 'full' (spans both columns: the heading's caption and vignette, a
    grid of cards, the quiz, an authored duo) or 'text' (prose, callouts and anything unknown, which
    keeps the reading column)."""
    cls = set((attrs.get("class") or "").split())
    if cls & {"ex", "widget", "rosetta"} or "data-code-file" in attrs or attrs.get("id") == "solbox":
        return "vis"
    if cls & {"sec-sub", "duo", "vgrid", "vig"} or attrs.get("id") == "qlist":
        return "full"
    return "text"


def split_section(inner):
    """One section's content (after its h2) as beats: each visual beside the prose that introduces
    it. A visual joins the text run just before it; visuals that open a section, before any prose,
    join the first text run and are marked .lead, so a stacked (narrow) page still shows them first.
    Reading order within a beat is unchanged: the text, then what it points at.

    The beats and loose prose between two full-width rows share one .flow: on a wide page kit.js
    lays its text out as one unbroken column and hangs each scene beside its own paragraph, so a
    short paragraph beside a tall scene no longer leaves a gap under it (owner, 2026-09-28).
    A visual with no prose anywhere around it spans the page, like a full row."""
    parts = [(_kind(a), inner[s:e]) for s, e, _, a in _top_level(inner)]
    rows, flow, lead, text, vis = [], [], [], [], []

    def close():
        nonlocal flow
        if flow:
            rows.append('<div class="flow">' + "".join(flow) + "</div>")
        flow = []

    def flush():
        nonlocal lead, text, vis
        scene = [f'<div class="lead">{h}</div>' for h in lead] + vis
        if text and scene:
            flow.append('<div class="duo beat"><div class="duo-text">' + "".join(text) +
                        '</div><div class="duo-scene">' + "".join(scene) + "</div></div>")
        elif text:
            flow.extend(text)
        elif scene:
            close()
            rows.extend(lead + vis)
        lead, text, vis = [], [], []

    for kind, h in parts:
        if kind == "full":
            flush()
            close()
            rows.append(h)
        elif kind == "vis":
            if text:
                vis.append(h)
            else:
                (vis if vis else lead).append(h)
        else:
            if vis:
                flush()
            text.append(h)
    flush()
    close()
    return "".join(rows)


# The split layout (#63, owner 2026-09-28): prose on the left, each scene hung beside its paragraph, the
# contents as an icon rail. Every lesson and the kit specimen get it; an overview keeps its own
# story-and-visual grid, the design the split was taken from.
def decorate(body, split=False):
    if split:
        body = re.sub(r'(<section class="sec" id="[a-z]+"><h2>.*?</h2>)(.*?)(</section>)',
                      lambda m: m[1] + split_section(m[2]) + m[3], body, flags=re.S)
        body = body.replace('<div class="wrap page">', '<div class="wrap page split">', 1)
    body = re.sub(r'<section class="sec" id="([a-z]+)"><h2>(.*?)</h2>',
                  lambda m: f'<section class="sec" id="{m[1]}"><h2><span class="sec-ic">{_icon(m[1])}</span><span>{m[2]}</span></h2>', body)
    nav = re.search(r'<nav class="toc".*?</nav>', body, re.S)
    toc = re.sub(r'<a href="#([a-z]+)">', lambda m: f'<a href="#{m[1]}">{_icon(m[1])}', nav[0])
    body = body[:nav.start()] + toc + body[nav.end():]
    # the heading, its caption and its vignette share one row; wrapped last, since every splice above
    # keys on <section><h2>
    body = re.sub(r'(<h2>.*?</h2>(?:<p class="sec-sub">.*?</p>)?)(<svg class="vig".*?</svg>)',
                  r'<div class="sec-head"><div class="sec-title">\1</div>\2</div>', body, flags=re.S)
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
                "calltrees": ("callTreeWalk(", "new CallTrace(", "mountCallTreeTabs("),
                "tries": ("trieWalk(", "new TrieTrace(", "mountTrieTabs("),
                "intervals": ("kind:'intervals'", 'kind:"intervals"', "ivWalk(", "new IvTrace(", "mountIvTabs("),
                "plots": ("costChart(", "plotWalk(", "new PlotTrace("),
                # the static costChart needs only plots.js; stepping through a plot adds the player's chrome
                "plotplayer": ("mountPlotTabs(", "PlotPlayer(")}
# what a module needs loaded before it, in the order the page must read them
KIT_DEPS = {"lists": ["player"], "lanes": ["player"], "grids": ["player", "lanes"], "heaps": ["player", "lanes"], "graphs": ["player", "lanes"],
            "calltrees": ["player", "lanes", "graphs"], "intervals": ["player", "lanes"],
            "tries": ["player", "lanes", "graphs"], "plotplayer": ["player", "plots"]}


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


def build(module, slug, family, title, stage=None, summary=None):
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
    body = decorate(lesson["html"] if lesson else read(folder, "body.html"), split=module != "overviews")
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


from lessons import LESSONS  # noqa: E402  (the page table lives apart: see lessons.py)


def overviews():
    """The overviews as the app's hub reads them: [{slug, title, stage, summary, family}]."""
    out = []
    for m, slug, family, title, *rest in LESSONS:
        if m != "overviews":
            continue
        if len(rest) != 2:
            raise SystemExit(f"overviews/{slug}: declare its stage and card summary in LESSONS")
        out.append({"slug": slug, "title": title, "stage": rest[0], "summary": rest[1], "family": family})
    return out


if __name__ == "__main__":
    if sys.argv[1:] == ["--overviews"]:
        print(json.dumps(overviews(), indent=2))
        raise SystemExit(0)
    want = sys.argv[1] if len(sys.argv) > 1 else None
    hit = [l for l in LESSONS if want in (None, l[1], f"{l[0]}/{l[1]}")]
    if not hit:
        raise SystemExit(f"no lesson {want!r}; known: " + ", ".join(f"{m}/{s}" for m, s, *_ in LESSONS))
    for lesson in hit:
        build(*lesson)
