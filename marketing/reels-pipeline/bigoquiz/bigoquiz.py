"""Big-O quiz singles (#136): one image, a snippet from the course and "What's the time
complexity?" with four options. The answer is never on the image: it goes in the first comment,
with a one-line why, so the post is answered in the comments.

Each quiz is a folder in quizzes/: the code shown is snippet.py verbatim, and the answer, its
letter and every number in the comment come from facts.json, which verify.py measures. The
words below are prose about the snippet, never a value.

Writes the image's HTML to ../carousel/build/<package>/slide1.html for ../carousel/render.mjs,
and each package's post.md (caption, first comment, hashtags, alt text).

  python3 verify.py && python3 bigoquiz.py && (cd ../carousel && node render.mjs <package> ...)
"""
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "carousel"))
sys.path.insert(0, str(HERE.parent / "spotbug"))
from glyphs import FACES, draw  # noqa: E402
from spotbug import CSS as CODE_CSS, code, e, lesson_title  # noqa: E402  (the code card and its colours)

ROOT = HERE.parents[2]
BUILD = HERE.parent / "carousel" / "build"
DATE = "2026-10-03"  # the packages' date prefix: when they were made
FACTS = json.loads((HERE / "facts.json").read_text())
ASK = "What's the time complexity?"

# Prose only, in posting order. tease: the hook's second sentence, which must not give the answer
# away. why: the first comment after "Answer: X, O(...)."; {count} and {n} are facts.json's
# measured count. tags: structure, idea, language, angle, audience (skill/references/formats.md).
QUIZZES = {
    "find-target": {
        "tease": "One loop. So it's O(n)… right?",
        "why": "One loop, but nums[1:] copies the list and `in` scans the copy, on every pass. That is n work inside n passes: {count} comparisons for n = {n} when the target is missing. Built-ins have a price too.",
        "tags": "#bigo #timecomplexity #python #hiddencost #codinginterview",
    },
    "doublings": {
        "tease": "How many times does this loop run?",
        "why": "i doubles every pass, so it reaches n after log₂ n passes: {count} passes for n = {n}. A loop that multiplies or divides its counter by a constant is logarithmic.",
        "tags": "#bigo #logarithm #python #loops #codinginterview",
    },
    "zero-pairs": {
        "tease": "The inner loop shrinks every pass. Still quadratic?",
        "why": "The inner loop runs (n − 1) + (n − 2) + … + 1 = n(n − 1)/2 times: {count} checks for n = {n}. The ½ is a constant factor, so the class is quadratic.",
        "tags": "#bigo #nestedloops #python #timecomplexity #codinginterview",
    },
    "split-twice": {
        "tease": "It calls itself twice. Exponential?",
        "why": "Two calls per call looks exponential, but n halves each time, so the tree is only log₂ n levels deep. The width doubles per level and ends near n: {count} calls for n = {n}. Depth decides, not branching alone.",
        "tags": "#bigo #recursion #python #recursiontree #codinginterview",
    },
    "two-passes": {
        "tease": "Two loops. Is that O(n²)?",
        "why": "The loops run one after the other, so their costs add: n + n = 2n loop steps, {count} for n = {n}. The 2 is a constant. Loops multiply only when one sits inside the other.",
        "tags": "#bigo #loops #python #timecomplexity #codinginterview",
    },
    "naive-fib": {
        "tease": "Three lines of Fibonacci. What does it cost?",
        "why": "Each call makes two more, and n only drops by 1 or 2, so the tree is n levels deep: fib({n}) makes {count} calls. O(2ⁿ) is the bound the course uses; the exact growth is φⁿ, with φ ≈ 1.618.",
        "tags": "#bigo #fibonacci #python #recursion #codinginterview",
    },
    "halving-rounds": {
        "tease": "One loop halves, the other doesn't. What's the total?",
        "why": "The outer loop halves i, so it runs log₂ n times. The inner loop is a full n every time. Multiply: n · log₂ n, which is {count} increments for n = {n}.",
        "tags": "#bigo #nlogn #python #nestedloops #codinginterview",
    },
    "grid-max": {
        "tease": "Nested loops. Is O(n²) always bad?",
        "why": "Two nested loops over an n × n grid: n² reads, {count} for n = {n}. But the input has n² cells and a max needs every one read, so this is linear in the input, and optimal.",
        "tags": "#bigo #matrix #python #nestedloops #codinginterview",
    },
}

CSS = CODE_CSS + """
.opts{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:38px}
.opt{display:flex;align-items:center;gap:24px;padding:24px 30px;border-radius:22px;background:#0e1520;border:2px solid #263248;font-family:"Space Mono",monospace;font-size:44px;font-weight:700}
.opt b{font-size:34px;color:#0e1520;background:#5eead4;border-radius:10px;width:54px;height:54px;display:flex;align-items:center;justify-content:center;flex:none}
"""


def slide(quiz):
    f = FACTS[quiz]
    lines = (HERE / "quizzes" / quiz / "snippet.py").read_text().splitlines()
    # code never wraps: the card is 960px wide less its padding and border, and a line is its
    # characters plus 3.2em of line number at JetBrains Mono's 0.6em advance. The question, the
    # options and the ask leave the code about 380px of lines at a line height of 1.5.
    size = min(34, int(880 / ((max(len(l) for l in lines) + 3.2) * 0.6)), int(380 / (1.5 * len(lines))))
    question = f.get("question", ASK)
    opts = "".join(f'<div class="opt"><b>{l}</b>{e(o)}</div>' for l, o in zip("ABCD", f["options"]))
    body = (f'<div class="k">BIG-O QUIZ</div><div class="h">{e(question)}</div>{code(lines, "py", size)}'
            f'<div class="opts">{opts}</div><div class="ask">Comment <em>A, B, C or D</em>. The answer is in the first comment.</div>')
    alt = (f'Big-O quiz: {question} A {len(lines)}-line Python function, {f["fn"]}: ' + " / ".join(l.strip() for l in lines if l.strip())
           + ". Four options: " + ", ".join(f"{l}: {o}" for l, o in zip("ABCD", f["options"]))
           + ". Comment A, B, C or D. The answer is in the first comment.")
    return body, alt


def page(quiz, title, body):
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>Big-O quiz {quiz}</title>'
            f'<style>{CSS}{FACES}</style></head><body>'
            f'<div class="top"><div class="brand">leetExpert<i></i></div><div class="n">PYTHON</div></div>'
            f'<div class="content">{draw(body)}</div>'
            f'<div class="foot"><span>lesson · {e(title)}</span><span>answer in the comments</span></div></body></html>')


def comment(quiz):
    f, p = FACTS[quiz], QUIZZES[quiz]
    # the φⁿ note belongs to the one answer that is a bound and not the exact growth, and only there
    assert ("φ" in p["why"]) != f["tight"], f"{quiz}: the why and facts.json disagree on whether {f['answer']} is tight"
    why = p["why"].format(count=f"{f['count']['value']:,}", n=f"{f['count']['n']:,}")
    return f"Answer: {f['letter']}, {f['answer']}. {why}"


def post_md(quiz, title, alt):
    f, p = FACTS[quiz], QUIZZES[quiz]
    hook = f"Big-O quiz 🧠 {p['tease']}"
    caption = (f"{hook}\n\n"
               f"{f.get('question', ASK)} Comment A, B, C or D before you look: the answer and the why are in the first comment.\n\n"
               f"The snippet is from the {title} lesson in leetExpert.\n\n"
               f"leetExpert, the interactive DSA course. Link in bio.")
    c = f["count"]
    return f"""# Big-O quiz: {f['fn']} ({title})

- **Account:** leetexpert
- **Archetype:** quiz single (the answer goes in the first comment, built for comments)
- **Source lesson:** `{f['lesson']}`
- **Family:** {Path(f['lesson']).parent.name}
- **Format:** Single image, 1080×1350
- **Plan:** issue #136 (epic #132)
- **Status:** rendered {DATE}, not scheduled.
- **Media:** `slide1.png`

## Hook (first line — all most people read)

{hook}

## Caption

{caption}

## First comment (post it right after publishing; no hashtags, Instagram counts them with the caption's five)

{comment(quiz)}

## Hashtags

{p['tags']}

## Alt text

{alt}

## Verified facts

- **The code is the file that runs.** The image shows `marketing/reels-pipeline/bigoquiz/quizzes/{quiz}/snippet.py` verbatim, and `verify.py` fails unless that code and its complexity are the lesson's own.
- **The answer is measured** (`bigoquiz/facts.json`): at n = {", ".join(f"{int(s):,}" if len(s) < 16 else f"2^{int(s).bit_length() - 1}" for s in f['sizes'])} the snippet takes {", ".join(f"{s:,}" for s in f['steps'])} steps. {f['answer']} is the slowest-growing of the four options that bounds that growth{"" if f['tight'] else "; it is an upper bound, not the exact growth"}.
- **The count in the comment is measured:** {c['value']:,} at n = {c['n']:,}, equal to `{c['formula']}` there and at all three sizes.

## Sources

Generated by `marketing/reels-pipeline/bigoquiz/` (`verify.py`, `bigoquiz.py`) and rendered by `carousel/render.mjs`; see `bigoquiz/README.md`.
"""


def build():
    assert set(QUIZZES) == set(FACTS), "QUIZZES and facts.json name different quizzes: rerun verify.py"
    out = {}
    for quiz in QUIZZES:
        title = lesson_title(FACTS[quiz]["lesson"])
        body, alt = slide(quiz)
        name = f"{quiz}-big-o-quiz"
        d = BUILD / name
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir(parents=True)
        (d / "slide1.html").write_text(page(quiz, title, body))
        pkg = ROOT / "marketing/instagram" / f"{DATE}-{name}"
        (d / "target").write_text(str(pkg.relative_to(ROOT)))
        md = post_md(quiz, title, alt)
        # the image and the caption must leave the answer for the comment
        said = re.sub(r"## First comment.*?(?=\n## )", "", md.split("## Verified facts")[0], flags=re.S)
        assert f"Answer: {FACTS[quiz]['letter']}" not in said, f"{quiz}: the answer leaks outside the first comment"
        out[quiz] = (pkg, md, 1)
    return out


if __name__ == "__main__":
    for quiz, (pkg, md, n) in build().items():
        pkg.mkdir(parents=True, exist_ok=True)
        (pkg / "post.md").write_text(md)
        print(pkg.name)
