"""Spot-the-bug carousels (#135): a snippet that passes the sample test, a hint, the input that
breaks it, the one-line fix, why, and the close.

Each bug is a folder in bugs/: the code shown is buggy.py and fixed.py verbatim, the twins
buggy.js and fixed.js prove the same bug in JavaScript, and every value on a slide comes from
facts.json, which verify.py computes by running them against the lesson's own reference
solution and verify.mjs recomputes in JavaScript. The words below are prose about the bug,
never a value: a slide that needs a number reads it from facts.json.

Writes the slides to ../carousel/build/<package>/ for ../carousel/render.mjs, and each
package's post.md.

  python3 verify.py && node verify.mjs && python3 spotbug.py && (cd ../carousel && node render.mjs <package> ...)
"""
import difflib
import html
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "carousel"))
from cheatsheet import CSS as BASE_CSS  # noqa: E402
from glyphs import FACES, draw  # noqa: E402

ROOT = HERE.parents[2]
BUILD = HERE.parent / "carousel" / "build"
DATE = "2026-10-03"  # the packages' date prefix: when they were made
FACTS = json.loads((HERE / "facts.json").read_text())
e = html.escape

# The app's code colours (CLAUDE.md §4: code colour has one source), read from globals.css.
TOK = dict(re.findall(r"--tok-([a-z]+): (#[0-9a-fA-F]{6});", (ROOT / "web/src/app/globals.css").read_text()))

# Prose only. claim: "sample" (buggy passes the lesson's first case, asserted from facts) or
# "count" (it returns as many items as it should, asserted too). tags: pattern, bug, language,
# angle, audience (skill/references/formats.md), each true of the post.
BUGS = {
    "rotate-array": {
        "claim": "sample",
        "hint": "Python slices never raise. What is nums[-k:] when k is bigger than the list?",
        "why": "Rotating by len(nums) changes nothing, so only k % len(nums) steps matter. Past the length, the slices stop meaning what they look like.",
        "tags": "#arrays #offbyone #python #debugging #codinginterview",
    },
    "subsets": {
        "claim": "count",
        "hint": "Every subset is appended. How many different lists are in result?",
        "why": "result.append(path) stores the same list object every time. The backtracking pops it back to empty, so every entry ends up empty. Append a copy.",
        "tags": "#backtracking #recursion #python #debugging #codinginterview",
    },
    "partition-equal-subset-sum": {
        "claim": "sample",
        "hint": "Each number may be used once. Can this loop use the same number twice?",
        "why": "Counting up, dp[cap - num] may already include this num, so it gets counted again. Counting down reads only values from before num was considered.",
        "tags": "#dynamicprogramming #knapsack #python #debugging #leetcode",
    },
    "evaluate-rpn": {
        "claim": "sample",
        "hint": "The problem says division truncates toward zero. Does // ?",
        "why": "// rounds down, toward minus infinity. When the true quotient is negative and not whole, that is one below what truncating gives.",
        "tags": "#stack #integerdivision #python #debugging #leetcode",
    },
    "non-overlapping-intervals": {
        "claim": "sample",
        "hint": "The greedy keeps the first interval it sees. Which one should it see first?",
        "why": "Keep the interval that ends first, and it leaves the most room for the rest. Sorted by start, one long early interval blocks every short one after it.",
        "tags": "#intervals #greedy #python #debugging #codinginterview",
    },
    "sort-colors": {
        "claim": "sample",
        "hint": "When the loop stops, is every element checked? Look at the one where mid meets high.",
        "why": "mid..high is the part not yet read. When mid == high, one element is still unread, and < skips it.",
        "tags": "#twopointers #dutchnationalflag #python #debugging #leetcode",
    },
}

KW = {"py": r"def|return|for|in|if|elif|else|while|not|and|or|lambda|None|True|False",
      "js": r"function|return|for|of|if|else|while|const|let|true|false|null"}

CSS = BASE_CSS + f"""
@font-face{{font-family:"JetBrains Mono";src:url("{(ROOT / 'web/lesson-artifacts/fonts').as_uri()}/JetBrainsMono-latin-tDbv2o-flE.woff2");font-weight:400 700}}
.code{{background:#0e1520;border:2px solid #263248;border-radius:22px;padding:26px 0;margin-top:30px;font-family:"JetBrains Mono",monospace;font-variant-ligatures:none;color:{TOK['variable']}}}
.code .ln{{display:flex;white-space:pre;padding:0 30px;line-height:1.5}}
.code .ln b{{font-weight:400;color:#475569;width:2.2em;flex:none;text-align:right;margin-right:1em}}
.code .ln.add{{background:rgba(126,226,168,.13);box-shadow:inset 6px 0 #7ee2a8}}
.code .ln.hint{{background:rgba(251,191,36,.12);box-shadow:inset 6px 0 #fbbf24}}
.tk{{color:{TOK['keyword']}}}.ts{{color:{TOK['string']}}}.tn{{color:{TOK['constant']}}}.tf{{color:{TOK['entity']}}}.tc{{color:{TOK['comment']}}}
.claim{{font-size:36px;color:#cbd5e1;line-height:1.4;margin-top:34px}}
.claim code,.row code,.js code,.row .val,.h.call{{font-variant-ligatures:none}}
.claim code,.row code,.js code{{font-family:"JetBrains Mono",monospace;font-size:.86em;color:#f1f4f9}}
.ask{{font-family:"Space Mono",monospace;font-size:40px;font-weight:700;line-height:1.25;margin-top:30px}}
.ask em{{font-style:normal;color:#5eead4}}
.hintbox{{font-size:50px;line-height:1.35;margin-top:34px;font-weight:500}}
.row{{margin-top:34px;padding:30px 36px;border-radius:22px;background:#0e1520;border:2px solid #263248;border-left:10px solid var(--tone)}}
.row .lab{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;letter-spacing:.14em;color:var(--tone)}}
.row .val{{font-family:"JetBrains Mono",monospace;font-size:46px;margin-top:10px;line-height:1.3;word-break:break-word}}
.js{{font-size:30px;color:#94a3b8;margin-top:30px;line-height:1.5}}
.whytxt{{font-size:46px;line-height:1.42;margin-top:34px}}
.src{{font-size:30px;color:#94a3b8;margin-top:44px;line-height:1.45}}
"""


def highlight(src, lang):
    """One line of code as HTML, coloured like the app's code blocks."""
    out, pos = [], 0
    pat = re.compile(rf"(?P<c>#.*$|//.*$)|(?P<s>\"[^\"]*\"|'[^']*')|(?P<n>\b\d+\b)|(?P<k>\b(?:{KW[lang]})\b)|(?P<f>\b[A-Za-z_]\w*(?=\())")
    for m in pat.finditer(src):
        out.append(e(src[pos:m.start()]))
        cls = {"c": "tc", "s": "ts", "n": "tn", "k": "tk", "f": "tf"}[m.lastgroup]
        out.append(f'<span class="{cls}">{e(m.group())}</span>')
        pos = m.end()
    out.append(e(src[pos:]))
    return "".join(out)


def code(lines, lang, size, marks=()):
    """marks: {line index: css class} for the lines a slide points at."""
    marks = dict(marks)
    # the code sits in one span: a flex row drops whitespace-only text between its children,
    # which ate every space after a keyword and every indent
    rows = "".join(f'<div class="ln {marks.get(i, "")}"><b>{i + 1}</b><span>{highlight(l, lang) or " "}</span></div>' for i, l in enumerate(lines))
    return f'<div class="code" style="font-size:{size}px">{rows}</div>'


def changed(bug, lang):
    """(indices of fixed lines that differ from buggy, the buggy lines they replace, the fixed lines)."""
    a = (HERE / "bugs" / bug / f"buggy.{lang}").read_text().splitlines()
    b = (HERE / "bugs" / bug / f"fixed.{lang}").read_text().splitlines()
    old, new, idx = [], [], []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes():
        if op != "equal":
            old += a[i1:i2]
            new += b[j1:j2]
            idx += range(j1, j2)
    return idx, old, new


def lit(v):
    """A value as Python writes it (the slides show Python)."""
    return repr(v)


def call(f, args):
    return f"{f['fn']}({', '.join(lit(a) for a in args)})"


def lesson_title(path):
    return re.search(r"^title: (.+)$", (ROOT / path).read_text(), re.M).group(1).strip()


def module_title(path):
    """The module's name as the course shows it (the cheatsheet dump carries every gold module's)."""
    sheets = json.loads((HERE.parent / "carousel" / "sheets.json").read_text())["sheets"]
    return next(s["title"] for s in sheets if s["moduleSlug"] == Path(path).parent.name)


def sandbox(f):
    text = (ROOT / f["lesson"]).read_text()
    return json.loads(text.split("```sandbox\n", 1)[1].split("\n```", 1)[0])


def outcome(f, args, value):
    """'rotate([1, 2, 3], 4)' and how its answer reads: nums becomes X, or it returns X."""
    if sandbox(f).get("check") == "mutate":
        return call(f, args), f"leaves nums as <code>{e(lit(value))}</code>", "Leaves nums as"
    return call(f, args), f"returns <code>{e(lit(value))}</code>", "Returns"


def slides(bug):
    f, p = FACTS[bug], BUGS[bug]
    title = lesson_title(f["lesson"])
    buggy = (HERE / "bugs" / bug / "buggy.py").read_text().splitlines()
    fixed = (HERE / "bugs" / bug / "fixed.py").read_text().splitlines()
    idx, old, new = changed(bug, "py")
    jidx, jold, jnew = changed(bug, "js")
    assert new and jnew, f"{bug}: a buggy file and its fix are identical, so there is no fix to show"
    # code never wraps, so the longest line sets a ceiling too: the card is 960px wide, less 60px of
    # padding, and a line is its characters plus 3.2em of line number at JetBrains Mono's 0.6em advance
    widest = max(len(l) for l in buggy + fixed)
    size = min(34 if len(buggy) <= 9 else 29 if len(buggy) <= 13 else 25, int(896 / ((widest + 3.2) * 0.6)))
    # where the hint points: the buggy lines the fix replaces, or, for a pure insertion, the
    # line the new one goes in front of
    a_idx = [i for i, l in enumerate(buggy) if l in old] or [min(idx[0], len(buggy) - 1)]
    s_call, s_out, _ = outcome(f, f["sample"]["args"], f["sample"]["buggy"])
    if p["claim"] == "sample":
        assert 0 in f["buggy_passes"], f"{bug}: claims the sample passes, facts say it does not"
        claim = f'It passes the sample test: <code>{e(s_call)}</code> {s_out}.'
        claim_alt = f"It passes the sample test: {s_call} gives {lit(f['sample']['buggy'])}."
    else:
        n = len(f["sample"]["buggy"])
        assert n == len(f["sample"]["expect"]), f"{bug}: claims the right count, facts say otherwise"
        claim = f'<code>{e(s_call)}</code> returns {n} lists: the right count.'
        claim_alt = f"{s_call} returns {n} lists, the right count."
    # a count claim is wrong on every input, so it asks what is wrong rather than which input
    ask = ("Find the input that <em>breaks</em> it. Comment it, then swipe." if p["claim"] == "sample"
           else "So what is <em>wrong</em> with them? Comment, then swipe.")
    broke = "THE INPUT THAT BREAKS IT" if p["claim"] == "sample" else "THE SMALLEST CASE"
    i_call, _, verb = outcome(f, f["input"], f["returns"])
    js_line = (f'JavaScript, same bug: <code>{e(jold[0].strip())}</code> → <code>{e(jnew[0].strip())}</code>'
               if len(jold) == 1 and len(jnew) == 1 else
               f'JavaScript, same bug: add <code>{e(jnew[0].strip())}</code>' if not jold else "")
    added_only = not old
    fix_head = "One line added." if added_only and len(new) == 1 else "One line changes." if len(new) == 1 else f"{len(new)} lines change."
    out = [
        (f'<div class="k">SPOT THE BUG</div><div class="h">{e(title)}</div>{code(buggy, "py", size)}'
         f'<div class="claim">{claim}</div><div class="ask">{ask}</div>',
         f'Spot the bug: {title}. A {len(buggy)}-line Python function, {f["fn"]}: ' + " / ".join(l.strip() for l in buggy if l.strip())
         + f'. {claim_alt} {re.sub("<[^>]+>", "", ask)}'),
        (f'<div class="k">HINT</div>{code(buggy, "py", size, {i: "hint" for i in a_idx})}<div class="hintbox">{e(p["hint"])}</div>',
         f'Hint. The same code, with line {", ".join(str(i + 1) for i in a_idx)} highlighted. {p["hint"]}'),
        (f'<div class="k">{broke}</div><div class="h call" style="font-size:44px;font-family:JetBrains Mono,monospace;font-weight:400">{e(i_call)}</div>'
         f'<div class="row" style="--tone:#f87171"><div class="lab">{verb.upper()}</div><div class="val">{e(lit(f["returns"]))}</div></div>'
         f'<div class="row" style="--tone:#7ee2a8"><div class="lab">SHOULD BE</div><div class="val">{e(lit(f["expect"]))}</div></div>',
         f'{broke.capitalize()}: {i_call}. {verb} {lit(f["returns"])}. It should be {lit(f["expect"])}.'),
        (f'<div class="k">THE FIX</div><div class="h">{fix_head}</div>{code(fixed, "py", size, {i: "add" for i in idx})}'
         + (f'<div class="js">{js_line}</div>' if js_line else ""),
         f'The fix. {fix_head} ' + (f'{" / ".join(o.strip() for o in old)} becomes {" / ".join(n.strip() for n in new)}.' if old else f'Add {" / ".join(n.strip() for n in new)}.')
         + (f' {re.sub("<[^>]+>", "", js_line).replace("→", "becomes")}.' if js_line else "")),
        (f'<div class="k">WHY</div><div class="whytxt">{e(p["why"])}</div>'
         f'<div class="src">From the course: {e(title)}, in {e(module_title(f["lesson"]))}. Its sandbox runs your code against the lesson\'s tests, in Python or JavaScript.</div>',
         f'Why. {p["why"]} From the course: {title}, in {module_title(f["lesson"])}.'),
        (f'<div class="cta"><div class="k">TRY IT</div><div class="big">Passing the sample is not <em>proof</em>.</div>'
         f'<p>Every problem in leetExpert, the interactive DSA course, has a sandbox: write it in Python or JavaScript and run the lesson\'s tests.</p>'
         f'<div class="where">leetexpert.com · link in bio</div></div>',
         "Closing slide: Passing the sample is not proof. Every problem in leetExpert, the interactive DSA course, has a sandbox: "
         "write it in Python or JavaScript and run the lesson's tests. leetexpert.com, link in bio."),
    ]
    return title, out


def page(title, n, total, body, foot_right):
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>{e(title)} spot the bug {n}</title>'
            f'<style>{CSS}{FACES}</style></head><body>'
            f'<div class="top"><div class="brand">leetExpert<i></i></div><div class="n">{n} / {total}</div></div>'
            f'<div class="content">{draw(body)}</div>'
            f'<div class="foot"><span>spot the bug · {e(title)}</span><span>{foot_right}</span></div></body></html>')


def post_md(bug, title, alts):
    f, p = FACTS[bug], BUGS[bug]
    s_call = call(f, f["sample"]["args"])
    if p["claim"] == "sample":
        hook, ask = "Spot the bug 🐛 It passes the sample test. Find the input that breaks it.", "Comment your input before you swipe."
    else:
        hook = f"Spot the bug 🐛 {s_call} returns {len(f['sample']['buggy'])} lists, the right count. So what is wrong with them?"
        ask = "Comment your answer before you swipe."
    caption = (f"{hook}\n\n"
               f"{ask} The hint is on slide 2, the answer on slide 3, the fix on slide 4.\n\n"
               f"From the {title} lesson in leetExpert. The same bug is checked in Python and JavaScript.\n\n"
               f"leetExpert, the interactive DSA course. Link in bio.")
    alt = "\n\n".join(f"**Slide {i}.** {a}" for i, a in enumerate(alts, 1))
    passes = f"{len(f['buggy_passes'])} of {f['cases']}"
    return f"""# Spot the bug: {title} (carousel, {len(alts)} slides)

- **Account:** leetexpert
- **Archetype:** would you ship this? / spot the bug (quiz carousel, built for comments)
- **Source lesson:** `{f['lesson']}`
- **Family:** {Path(f['lesson']).parent.name}
- **Format:** Carousel, {len(alts)} slides, 1080×1350
- **Plan:** issue #135 (epic #132)
- **Status:** rendered {DATE}, not scheduled.
- **Media:** {", ".join(f"`slide{i}.png`" for i in range(1, len(alts) + 1))}

## Hook (first line — all most people read)

{hook}

## Caption

{caption}

## Hashtags

{p['tags']}

## Alt text (per slide)

{alt}

## Verified facts

- **The code is the file that runs.** Slides 1, 2 and 4 show `marketing/reels-pipeline/spotbug/bugs/{bug}/buggy.py` and `fixed.py` verbatim; `buggy.js` and `fixed.js` are the JavaScript twins.
- **Every value is computed** (`spotbug/facts.json`): `verify.py` runs the code against the lesson's reference solution (`web/tests/reference/{Path(f['lesson']).parent.name}/`), and `verify.mjs` recomputes all of it in JavaScript and fails on any difference.
- **{s_call}** gives `{lit(f['sample']['buggy'])}` (the lesson's first case expects `{lit(f['sample']['expect'])}`).
- **{call(f, f['input'])}** gives `{lit(f['returns'])}` from the bug and `{lit(f['expect'])}` from the reference, in both runtimes.
- The fix passes all {f['cases']} of the lesson's sandbox cases in both runtimes; the bug passes {passes}.

## Sources

Generated by `marketing/reels-pipeline/spotbug/` (`verify.py`, `verify.mjs`, `spotbug.py`) and rendered by `carousel/render.mjs`; see `spotbug/README.md`.
"""


def build():
    out = {}
    for bug in BUGS:
        title, pairs = slides(bug)
        name = f"{bug}-spot-the-bug"
        d = BUILD / name
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir(parents=True)
        for n, (body, _) in enumerate(pairs, 1):
            (d / f"slide{n}.html").write_text(page(title, n, len(pairs), body, "swipe →" if n < len(pairs) else "link in bio"))
        pkg = ROOT / "marketing/instagram" / f"{DATE}-{name}"
        (d / "target").write_text(str(pkg.relative_to(ROOT)))
        out[bug] = (pkg, post_md(bug, title, [a for _, a in pairs]), len(pairs))
    assert set(BUGS) == set(FACTS), "BUGS and facts.json name different bugs: rerun verify.py"
    return out


if __name__ == "__main__":
    for bug, (pkg, md, n) in build().items():
        pkg.mkdir(parents=True, exist_ok=True)
        (pkg / "post.md").write_text(md)
        print(pkg.name, n, "slides")
