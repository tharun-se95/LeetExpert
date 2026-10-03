# Big-O quiz singles (#136)

One image each: a snippet from the course, "What's the time complexity?" and four options. The
answer is never on the image. It goes up as the **first comment**, with a one-line why, so the
post is answered in the comments. `post.md` carries the caption and the comment text, and the
posting kit page has a "Copy first comment" button for it.

Instagram counts hashtags in the caption and the comments together (five in all), so the first
comment carries none; `check.py` fails if one appears.

## Where the snippets come from

| Quiz | Lesson | Answer |
|---|---|---|
| `find-target` | Big-O, Complexity Drills (Drill 4) | O(n²): a slice and a scan hidden in one loop |
| `doublings` | Big-O, Analyzing Loops & API Complexity | O(log n): the counter doubles |
| `zero-pairs` | Big-O, Complexity Drills (Drill 2) | O(n²): n(n − 1)/2 checks |
| `split-twice` | Big-O, Complexity Drills (Drill 5) | O(n): two calls, but n halves |
| `two-passes` | Big-O, Complexity Drills (Drill 1) | O(n): sequential loops add |
| `naive-fib` | Dynamic Programming, From Recursion to Memoization | O(2ⁿ), an upper bound (Θ(φⁿ)) |
| `halving-rounds` | Big-O, Complexity Drills (Drill 3) | O(n log n) |
| `grid-max` | Big-O, Complexity Drills (Drill 6) | O(n²) in n, linear in the input |

A drill's snippet is the lesson's own Python block with the function renamed (`drill4` says
nothing on an image) and its comments removed (they give the answer away). `doublings` wraps the
lesson's three-line fragment in a function; `naive-fib` is its lesson's block unchanged.

## Files

- `quizzes/<id>/snippet.py`: the code on the image, verbatim. `quiz.json`: the lesson, the four
  options (slowest-growing first), the answer, the input to run it on, three sizes, and the count
  the comment quotes with its closed formula.
- `verify.py`: writes `facts.json`. It fails unless the snippet and its complexity are the
  lesson's own, unless the answer is the slowest-growing option that bounds the measured growth,
  and unless every quoted count equals its formula. Its docstring says how steps are counted,
  including the comparisons a built-in makes (`x in a_list`).
- `bigoquiz.py`: the prose (hook, why, hashtags) and the image; the answer, its letter and every
  number come from `facts.json`. Writes `../carousel/build/<id>-big-o-quiz/` and each package's
  `post.md` in `marketing/instagram/2026-10-03-<id>-big-o-quiz/`. It fails if the answer appears
  anywhere but the first comment.

The measurement is in Python only, the language on the image. These are growth rates of loops and
calls, not values a learner's code is graded against, so they are not run in JavaScript.

## Build

```bash
python3 verify.py && python3 bigoquiz.py
cd ../carousel && node render.mjs $(ls build | grep big-o-quiz) && python3 kit.py
PYTHONDONTWRITEBYTECODE=1 python3 check.py
```

`check.py` reruns the verifier and fails if `facts.json` drifted, if a `post.md` differs from a
fresh build, if a package is not exactly `slide1.png`, or if the first comment has a hashtag.
`kit.py` places the eight from Nov 10, one a day after the last spot-the-bug carousel; they are
quick posts meant for gaps, so any of them can be pulled earlier.
