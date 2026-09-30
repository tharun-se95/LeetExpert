# Watch recursion go down and come back up (the call stack)

- **Account:** leetexpert
- **Archetype:** trace it (reel), with the lesson's analogy and a line-by-line code walkthrough
- **Source lessons:** `courses/dsa/recursion-backtracking/the-call-stack-and-base-cases.md` (the cafeteria trays, `factorial`, winding and unwinding, n + 1 frames, the broken `n - 2` base case) and `recursion-vs-iteration.md` (depth limits)
- **Family:** recursion
- **Format:** Reel, 1080×1920, ~93s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p17`. Issue #130.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 1:59), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Watch recursion go down and come back up.

## Caption

factorial(3) = 3 × 2 × 1. Here's what the computer actually does. 🥞

Think of cafeteria trays: every call sets a fresh tray on top, and you only ever work on the top one.

Down: factorial(3) waits on factorial(2), which waits on factorial(1), which waits on factorial(0). That's the base case: return 1.
Up: 1 × 1 = 1, pop. 2 × 1 = 2, pop. 3 × 2 = 6, pop. Answer: 6, four frames deep (n + 1).

def factorial(n):
    if n == 0:
        return 1          # the base case, the floor
    return n * factorial(n - 1)   # smaller problem; the multiply waits

Every frame costs memory. Python stops at 1,000: factorial(1000) raises "RecursionError: maximum recursion depth exceeded". JavaScript allows around 10,000.

⚠️ Break the base case (step down by 2: 3 → 1 → −1 → …) and it skips 0 forever. It doesn't hang, it crashes.

Your turn: how many frames deep does factorial(5) go? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#recursion #callstack #computerscience #python #learnpython

## Alt text

The title factorial(3) = 3 × 2 × 1. A card of stacked cafeteria trays reads "every call: a fresh tray on top; you only ever work on the top tray". Then a call stack builds from the bottom, labelled "winding down: each call waits": frames factorial(3), factorial(2) and factorial(1) each say "waiting: n × ?", and factorial(0) says "base case → 1". The label changes to "unwinding: multiply on the way back". factorial(0) pops, factorial(1) fills in "1 × 1 = 1" and pops, factorial(2) fills in "2 × 1 = 2" and pops, and factorial(3) fills in "3 × 2 = 6" and pops, leaving "factorial(3) = 6" and "4 frames = n + 1". A code card walks factorial line by line: the base case returns 1 (the floor); otherwise n × factorial(n − 1), a smaller problem every call; the multiply waits until the call comes back. A card reads "Every frame costs memory": Python stops at 1,000 frames, factorial(1000) raises RecursionError: maximum recursion depth exceeded, and JavaScript allows around 10,000. A second code card shows broken(n), which steps down by 2: "3 → 1 → −1 → −3 … never 0", not a hang but a crash, RecursionError: maximum recursion depth exceeded. An interview-tell card reads "Space of a recursive function? Say 'O(n), one frame per call'". A challenge asks how many frames deep factorial(5) goes. A leetExpert lockup ends the reel.

## Verified facts

The code cards are `sources/code/factorial.py` and `code/broken.py`. `verify.py` checks that both are the lesson's functions (comments and type hints aside) and then runs them. `code/twins.js` runs in `verify.mjs`. A planted `n == 1` base case fails both verifiers (checked 2026-09-30). The first JS check missed it, because factorial(3) is still 6 with that bug, so `factorial(0)` and `factorial(5)` were added.

- The animated events come from `sources/frames.py`, recorded by running factorial: calls 3, 2, 1, 0, then returns 1, 1, 2, 6. The peak depth is 4 = n + 1. For factorial(5) the depth is 6 (the challenge).
- Python: `sys.getrecursionlimit()` is 1000; `factorial(998)` runs and `factorial(1000)` raises `RecursionError: maximum recursion depth exceeded`. `broken(3)` raises the same, and its sequence 3, 1, −1, −3, −5 never reaches 0. `broken(4)` does reach 0.
- JavaScript: `broken(3)` throws `RangeError: Maximum call stack size exceeded`. The deepest factorial V8 completed here was about 11,000 frames (10,937 and 11,718 on two runs), and the verifier asserts it's between 5,000 and 20,000 ("around ten thousand"). The exact number varies by machine and Node version.

## Sources

`script.txt`, `code/` (the shown code, plus JavaScript twins), `frames.py` (the animated events), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
