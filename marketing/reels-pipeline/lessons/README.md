# Lesson carousels (#172)

One idea from one lesson, with the code and the numbers that prove it: a cover, three to six
slides, and a closing slide that names the lesson. These are the "general educational" and
"why DSA" carousels of `marketing/CONTENT_ROADMAP.md`.

## A post is a folder

`posts/<id>/`:

- `post.json`: the lesson, its module's title, the hook, the caption paragraphs, five hashtags
  and the slides. A slide has a kicker `k`, a heading `h`, and any of `p` (paragraphs), `code`
  (`file`, optional `lines: [from, to]`, optional `marks: {line: "hint" | "add"}`) and `rows`
  (`lab`, `val`, `tone`: good, bad, mark or warn), drawn in the order listed. In text,
  `` `x` `` is code, `*x*` is the accent, and `{name}` is a fact.
- `code/`: what a slide shows, verbatim, in Python, with a JavaScript twin.
- `verify.py` and `verify.mjs`: each prints the post's facts as one JSON object, computed by
  running `code/`. They must print the same object.
- `facts.json`: that object, written by `lessons.py --facts`.

## What is enforced

- Python and JavaScript agree on every fact (`run_verifiers`).
- Every number in a slide's prose is a fact, or is in the lesson, or is in the shown code. A
  number typed from memory fails the build.
- The module title is one the course manifest has.
- `../carousel/render.mjs` fails on overflow or a system-font fallback; `../carousel/check.py`
  reruns the verifiers and fails if `facts.json`, a `post.md`, a slide count or the kit drifted.

Not enforced: that the prose itself matches the lesson. Write it from the lesson, and keep
claims that are not numbers to what the lesson says.

## Add a post

1. Read the lesson. Pick one idea a number can prove.
2. Write `code/`, `verify.py`, `verify.mjs`, `post.json`.
3. Build:

```bash
python3 lessons.py --facts
cd ../carousel && node render.mjs <id>-lesson
```

4. Look at every slide. Then append the id to `LESSON_ORDER` in `../carousel/kit.py`, run
   `python3 kit.py` and `PYTHONDONTWRITEBYTECODE=1 python3 check.py`, and add a row to
   `marketing/LEDGER.md`.
