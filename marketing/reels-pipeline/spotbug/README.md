# Spot-the-bug carousels (#135)

Six slides each: the snippet and a true claim ("passes the sample test"), a hint, the input that
breaks it with what it returns and what it should, the fix, why, and the close. Built to get
comments: the first slide asks for the breaking input before the swipe.

## Where the bugs come from

Each bug is a mistake the course itself names: a cheatsheet trap in
`web/src/lib/course/cheatsheets/content/gold.ts`, or a lesson that warns about it, and it is
written against that lesson's own sandbox.

| Bug | Lesson | Mistake |
|---|---|---|
| `rotate-array` | Arrays, Rotate Array | k can exceed n: no `k %= n` |
| `subsets` | Recursion & Backtracking, Subsets | appending the shared `path`, not a copy |
| `partition-equal-subset-sum` | Dynamic Programming, Partition Equal Subset Sum | the 1-D capacity loop runs forward, so a number is reused |
| `evaluate-rpn` | Stacks, Evaluate RPN | `//` / `Math.floor` where the problem truncates toward zero |
| `non-overlapping-intervals` | Intervals, Non-overlapping Intervals | the greedy sorts by start, not end |
| `sort-colors` | Two Pointers, Sort Colors | `mid < high` leaves the last unread element unread |

A bug qualifies only if it is silent (a wrong answer, not a crash) and the same in Python and
JavaScript. Two were dropped for that reason: "forgetting to erase zero counts" crashes rather
than answering wrong, and "directed vs undirected edges" fails the sample test, so the post
has nothing to spot.

## Files

- `bugs/<id>/buggy.py`, `fixed.py`: the code on the slides, verbatim. `buggy.js`, `fixed.js`: the
  JavaScript twins. `bug.json`: the lesson and the input that breaks the bug.
- `verify.py`: runs each pair against the lesson's sandbox cases and its reference solution
  (`web/tests/reference/<module>/<id>.py`) and writes `facts.json`. It fails if the reference
  disagrees with the lesson, if the fix misses a case, or if the bug is right on its input.
- `verify.mjs`: the same in JavaScript; fails unless it reproduces `facts.json` exactly.
- `spotbug.py`: the prose (claim kind, hint, why, hashtags) and the slides; every value comes
  from `facts.json`. Writes `../carousel/build/<id>-spot-the-bug/` and each package's `post.md`
  in `marketing/instagram/2026-10-03-<id>-spot-the-bug/`.

## Build

```bash
python3 verify.py && node verify.mjs && python3 spotbug.py
cd ../carousel && node render.mjs $(ls build | grep spot-the-bug) && python3 kit.py
PYTHONDONTWRITEBYTECODE=1 python3 check.py
```

`check.py` reruns both verifiers and fails if `facts.json` drifted, if a `post.md` differs from a
fresh build, or if a package is missing a slide. `kit.py` places the six from Nov 4, after the
last reel carousel. Each check was seen to fail on 2026-10-03: a bug fixed in Python only, a bug
fixed in JavaScript only, a fix broken in JavaScript, an input the bug gets right, an edited
`post.md` and a missing slide.

Found while building: the partition bug passed all seven of its lesson's sandbox cases. #164 added
two cases that catch it and `web/tests/namedMistakes.test.ts`, which keeps it caught.
