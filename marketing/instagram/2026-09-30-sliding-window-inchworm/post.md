# If you see "contiguous", think window: the sliding window as an inchworm

- **Account:** leetexpert
- **Archetype:** pattern in 60 seconds (reel): cue, expand/shrink, O(n) target, and the trap; with the lesson's analogy and a line-by-line code walkthrough
- **Source lessons:** `courses/dsa/sliding-window/dynamic-windows.md` (the inchworm, and the trace for target 7 on `[2,3,1,2,4,3]`); `minimum-size-subarray-sum.md` (its eight cases)
- **Family:** sliding-window
- **Format:** Reel, 1080×1920, ~105s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p11`, planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #124.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 2:19), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

If you see "contiguous", think window.

## Caption

Shortest stretch of [2, 3, 1, 2, 4, 3] with sum ≥ 7? Trying every start and every end is O(n²).

Picture an inchworm 🐛: the front stretches forward to grab new ground, and when it's overreached, the back pulls in. Neither end ever backs up.

2+3+1 = 6 → grab 2: 8 ✓ (length 4) → pull in: 6 → grab 4: 10 → pull in: 1+2+4 = 7 ✓ (length 3) → pull in: 6 → grab 3: 9 → pull in: 4+3 = 7 ✓ (length 2). Answer: 2.

for right in range(len(nums)):
    total += nums[right]
    while total >= target:
        best = min(best, right - left + 1)
        total -= nums[left]
        left += 1

Both pointers only move forward, so it's O(n) even with a loop inside a loop. Our test run on 10,000 numbers (Python): 848 ms checking every stretch vs 1.18 ms for the window.

⚠️ The trap: write if instead of while and the window shrinks at most once per step. It never gets tight: on this exact list it answers 4, not 2.
⚠️ It needs non-negative numbers. Target 5 on [4, −2, −3, 4, 1]: the window finds nothing, but [4, 1] works.

Your turn: target 11 on [1, 2, 3, 4, 5]. Shortest length? 👇

Step through it on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#slidingwindow #dsa #codinginterview #python #learntocode

## Alt text

Six number cells, 2, 3, 1, 2, 4 and 3, with indices 0 to 5, under the question "shortest stretch with sum ≥ 7? every start × every end = O(n²)". Two lines explain the inchworm: "front stretches forward, back pulls in, neither end ever backs up". A teal rounded window with a small face on its right end, the inchworm, grows across the cells, and readouts show the window total and the shortest length so far: 6 < 7; 8 ≥ 7 with shortest 4; pull in to 6; grow to 10; pull in to 7 with shortest 3; pull in to 6; grow to 9; pull in to [4, 3], 7, with shortest 2. The chip "answer: [4, 3], length 2" appears. A code card walks min_subarray_len line by line: right expands and adds nums[right]; while the total is big enough, record the length, drop nums[left] and move left on; both pointers only move forward, O(n). Bars for 10,000 numbers show 848 ms for every start × every end against 1.18 ms for the sliding window. A trap card compares "while total >= target: ✓ 2" with "if total >= target: ✗ 4": "shrinks at most once per step, the window never gets tight". A caveat card shows target 5 on [4, −2, −3, 4, 1]: "window: 0 (nothing found), but [4, 1] = 5, length 2". An interview-tell card reads "Contiguous, subarray, substring? Say 'sliding window'". A challenge asks for the shortest length with target 11 on [1, 2, 3, 4, 5]. A leetExpert lockup ends the reel.

## Verified facts

The code card is `sources/code/min_window.py`. `verify.py` runs it, and `verify.mjs` runs its JavaScript twin. The `if` version is `code/min_window_if_bug.py`, which is run as well. A planted bug fails each verifier (checked 2026-09-30).

- The fix passes all eight of the lesson's cases, read from its sandbox block. The `if` version fails four of them, including the headline case (4 instead of 2). Challenge: `(11, [1,2,3,4,5]) → 3`, a lesson case.
- The window states the reel animates come from `sources/wintrace.py`. `verify.py` checks them, state for state, against the trace block in `dynamic-windows.md`. The final best is 2, from `[4, 3]`. The algorithm's last shrink to `[3]` (total 3) happens after the answer is found; the reel stops at `[4, 3]` and doesn't claim otherwise.
- Negatives: `(5, [4,-2,-3,4,1])` gives the window 0, while brute force gives 2 (`[4, 1]`).
- The fix equals brute force on 2,000 random non-negative lists.
- Speed: in our recorded run on 2026-09-30 (10,000 numbers, Python), every start × every end took 848 ms and the window 1.18 ms. `verify.py` re-measures each run and asserts a gap over 100× (844× on a re-run).

## Sources

`script.txt`, `code/` (the shown code, the `if` bug, and JavaScript twins), `wintrace.py` (the animated states), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
