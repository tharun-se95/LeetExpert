# Fibonacci in three lines. What does fib(30) cost? (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-fib-memo`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 8 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`

## Hook (first line — all most people read)

Fibonacci in three lines. What does fib(30) cost?

## Caption

def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

Clean, correct, and it passes every small test. Would you ship it? 🤔

fib(30) makes 2,692,537 calls. fib(40) makes 331,160,281. In our test run (Python), fib(40) took 14.5 seconds.

Why: draw the calls for fib(5). Every call splits in two, and the same questions come back. fib(3) runs twice, fib(2) three times, fib(1) five times. That's 15 calls to answer 6 different questions, and each repeat redoes its whole subtree: O(2ⁿ).

The fix is to remember every answer:

def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:            # already solved: no subtree at all
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

Each value from 0 to n is computed once. fib(40) now takes 79 calls: O(n). In our test run it took 7 microseconds.

⚠️ One catch: it's still recursion. A memoized fib(1000) crashes Python with "RecursionError: maximum recursion depth exceeded".

Your turn: how many calls does the naive fib(6) make? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#dynamicprogramming #memoization #fibonacci #python #leetcode

## Alt text (per slide)

**Slide 1.** The reel's cover: "Fibonacci in three lines. What does fib(30) cost?"

**Slide 2.** "What does it cost?": fib(30) makes 2,692,537 calls; fib(40) makes 331,160,281 calls; 14.5 seconds in our Python test run.

**Slide 3.** "fib(5): every call", tagged 15 calls · 6 questions and O(2ⁿ): the full call tree, 5 splitting into 4 and 3, down to leaves of 1 and 0, with the repeated calls in amber.

**Slide 4.** The memoized fib(n, memo=None) in Python: create memo on the first call; if n < 2: return n; if n in memo: return memo[n]; memo[n] = fib(n - 1, memo) + fib(n - 2, memo), highlighted with the note "…store it, then return it"; the memo holds 2 → 1, 3 → 2, 4 → 3, 5 → 5: memo[5] = 5.

**Slide 5.** "Each value, once": fib(40), memoized, takes 79 calls, not 331,160,281: O(n). Naive fib(40) 14.5 s against memoized fib(40) 7 µs.

**Slide 6.** "One catch: still recursion": every call is a stack frame. A memoized fib(1000) in Python raises RecursionError: maximum recursion depth exceeded.

**Slide 7.** A text slide under "Your turn": How many calls does the naive fib(6) make?

**Slide 8.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
