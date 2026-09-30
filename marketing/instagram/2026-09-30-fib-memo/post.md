# Fibonacci in three lines. What does fib(30) cost?

- **Account:** leetexpert
- **Archetype:** would you ship this? (reel): correct code, a hidden cost, the fix, with a line-by-line code walkthrough
- **Source lesson:** `courses/dsa/dynamic-programming/from-recursion-to-memoization.md` (naive `fib`, the `fib(5)` overlap tree and its repeat counts, the explicit-dict memo version, the O(n) argument, the recursion-limit caveat)
- **Family:** dynamic programming
- **Format:** Reel, 1080×1920, ~89s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p18`, planned as a carousel and made a reel under the owner's standing direction (2026-09-29) to continue the ledger as reels that explain the code. Issue #131.
- **Status:** in production. The visuals are built and pass `hyperframes check` (0 errors, 0 warnings). The narration is not recorded yet (deferred by the owner), so the only render is a silent preview on estimated timings.
- **Media (when final):** `reel.mp4`, `cover.png`

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

#dynamicprogramming #python #codinginterview #dsa #learntocode

## Alt text

A code card shows the three-line recursive fib and is walked line by line: under two, return n; otherwise add the two before it; "Clean, and correct. Would you ship it?" A card titled "What does it cost?" shows fib(30): 2,692,537 calls, fib(40): 331,160,281 calls, and 14.5 seconds (our test run, Python). Then fib(5)'s call tree draws itself one call at a time: 5 splits into 4 and 3, and so on down to 1s and 0s. As they're named, the repeated calls get amber rings: both fib(3)s, the three fib(2)s, the five fib(1)s and the three fib(0)s. A chip reads "15 calls · 6 questions", and O(2ⁿ) appears. A code card walks the memoized fib: the memo is a dictionary made fresh on the first call; the base case; "New: already solved? Return the saved answer", "No subtree at all"; otherwise compute it once, store it, then return it. A card titled "Each value, once" shows fib(40) memoized: 79 calls, not 331,160,281, O(n), with bars of 14.5 s for naive against 7 µs for memoized. A card titled "One catch: still recursion" shows a memoized fib(1000) raising "RecursionError: maximum recursion depth exceeded" in Python. An interview-tell card reads "Same call twice in your tree? Say 'Memoize it'". A challenge asks how many calls the naive fib(6) makes. A leetExpert lockup ends the reel.

## Verified facts

The code cards are `sources/code/naive.py` and `code/memo.py`. `verify.py` checks that both are the lesson's functions (comments and type hints aside) and then runs them. `code/twins.js` holds the lesson's TypeScript as JavaScript and runs in `verify.mjs`. A planted missing `if n in memo` check fails both verifiers (checked 2026-09-30): the JS memo count comes out as 2,692,537 instead of 59.

- The tree comes from `sources/calltree.py`, which records the calls `fib(5)` actually makes by tracing the shown function. It makes 15 calls to 6 distinct arguments: fib(3) ×2, fib(2) ×3, fib(1) ×5, fib(0) ×3. These are the lesson's counts, and only those four values are ringed.
- The naive call count is 2·fib(n+1) − 1. That formula is checked against the tracer for n from 0 to 14, and gives 2,692,537 for fib(30) (also traced directly), 331,160,281 for fib(40), and 25 for fib(6) (the challenge).
- The memoized version makes 2n − 1 calls when traced: 59 for fib(30) and 79 for fib(40). In JS the same count comes from the twin's own memo, counted with an instrumented `Map`.
- CPython's recursion limit is 1000. A memoized `fib(900)` runs and `fib(1000)` raises `RecursionError: maximum recursion depth exceeded`.
- Speed: in our recorded run on 2026-09-30 (Python), naive fib(40) took 14.53 s and memoized fib(40) took 7.14 µs. `verify.py` re-measures on every run and asserts a gap over 100,000× (14.18 s against 6.81 µs on a re-run). The first draft of the script said "fourteen seconds", which the verifier's rounding check rejected, so the script says "fourteen and a half".

## Sources

`script.txt`, `code/` (the shown code and JavaScript twins), `calltree.py` (the recorded calls), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
