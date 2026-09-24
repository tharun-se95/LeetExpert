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
import re, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(ROOT, "kit")
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
                 "node": "i-box", "build": "i-stack", "walk": "i-route", "cost": "i-s-cost", "next": "i-s-variants"}


def _icon(sec):
    return f'<svg class="i" aria-hidden="true"><use href="#{SECTION_ICONS[sec]}"/></svg>'


def decorate(body):
    body = re.sub(r'<section class="sec" id="([a-z]+)"><h2>(.*?)</h2>',
                  lambda m: f'<section class="sec" id="{m[1]}"><h2><span class="sec-ic">{_icon(m[1])}</span><span>{m[2]}</span></h2>', body)
    nav = re.search(r'<nav class="toc".*?</nav>', body, re.S)
    toc = re.sub(r'<a href="#([a-z]+)">', lambda m: f'<a href="#{m[1]}">{_icon(m[1])}', nav[0])
    return body[:nav.start()] + toc + body[nav.end():]


def build(module, slug, family, title):
    folder = os.path.join(ROOT, slug)
    L, D, N = shared.tokens(family)
    css = shared.BASE_CSS.replace("@@L@@", L).replace("@@D@@", D).replace("@@N@@", N) + read(KIT, "kit.css")
    extra = os.path.join(folder, "extra.css")
    if os.path.exists(extra):
        css += read(extra)
    body = decorate(read(folder, "body.html"))
    code = code_bundle(folder)
    js = "\n".join([
        "(function(){\n'use strict';",
        read(KIT, "engine.js"),
        read(KIT, "trees.js"),
        read(KIT, "kit.js"),
        "var CODE=" + json.dumps(code) + ";",
        # coloured copies keyed by the exact source, so codeBlock can find them from CODE's strings
        "var HL=" + json.dumps(highlight(code)) + ";",
        read(folder, "lesson.js"),
        "wirePage();",
        "})();",
    ])
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap">
<style>{css}</style></head><body>
{SHELL_TOP.replace("@@ICONS@@", shared.ICONS)}{body}</main>
<script src="https://cdn.jsdelivr.net/npm/motion@12.23.12/dist/motion.js"></script>
<script>
{js}
</script></body></html>'''
    out = os.path.join(ROOT, "dist", module, slug + ".html")
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
]

if __name__ == "__main__":
    want = sys.argv[1] if len(sys.argv) > 1 else None
    hit = [l for l in LESSONS if want in (None, l[1], f"{l[0]}/{l[1]}")]
    if not hit:
        raise SystemExit(f"no lesson {want!r}; known: " + ", ".join(f"{m}/{s}" for m, s, *_ in LESSONS))
    for lesson in hit:
        build(*lesson)
