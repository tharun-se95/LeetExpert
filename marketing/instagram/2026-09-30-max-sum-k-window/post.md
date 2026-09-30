# Max sum of k in a row. Looks clean. (the fixed window's missing last window)

- **Account:** leetexpert
- **Archetype:** would you ship this? (reel), with a line-by-line code walkthrough of the bug and of the O(n) slide
- **Source lessons:** `courses/dsa/sliding-window/fixed-size-windows.md` (the sample `[2,1,5,1,3,2]`, k=3, and the sliding template); `maximum-average-subarray.md` (its six cases)
- **Family:** sliding-window
- **Format:** Reel, 1080×1920, ~93s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p12`, planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #125.
- **Status:** in production. The visuals are built and pass `hyperframes check` (0 errors, 0 warnings). The narration is not recorded yet (deferred by the owner), so the only render is a silent preview on estimated timings.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Max sum of k numbers in a row. Looks clean.

## Caption

An AI wrote this, and it passes the sample ([2, 1, 5, 1, 3, 2], k = 3 → 9). Would you ship it? 🤔

def max_sum_k(nums, k):
    best = float("-inf")
    for i in range(len(nums) - k):
        best = max(best, sum(nums[i:i + k]))
    return best

[1, 2, 3, 9], k = 2 → 5. The answer is 12 (3 + 9).
[4, 5], k = 2 → -inf.

Count the windows: a 2-wide frame on 4 numbers fits at starts 0, 1 and 2. That's n − k + 1. range(n − k) stops one short, so the last window is never checked. Fix: + 1.

Second problem: every window is summed from scratch, which is O(n·k). Slide instead: sum the first window once, then add the number entering on the right and subtract the one leaving on the left. O(n).

Our test run, 100,000 numbers with k = 10,000 (Python): 12.35 s summing every window vs 11.7 ms sliding.

Your turn: how many windows of size 3 fit in 10 numbers? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#slidingwindow #python #codinginterview #dsa #learntocode

## Alt text

A code card shows a Python function, max_sum_k, looping for i in range(len(nums) - k) and taking the max of sum(nums[i:i + k]), with an "AI · passes the sample" badge. A note shows [2, 1, 5, 1, 3, 2], k = 3 → 9, a pass, then "Would you ship it?". The next card shows max_sum_k([1, 2, 3, 9], 2) → 5, wrong, with "answer: 12 (3 + 9)", and max_sum_k([4, 5], 2) → -inf, wrong, because k is the whole length. A "Count the windows" scene slides a teal frame two cells wide over 1, 2, 3, 9 to start 0, start 1 and start 2: "3 windows = n − k + 1". The code card returns, and a highlight walks it: best starts at negative infinity; for each start i, sum k numbers and keep the biggest; range(n − k) = range(2) tries starts 0 and 1; start 2, [3, 9], is never checked; the fix is range(len(nums) - k + 1). A "Second problem" card reads "k additions × every window = O(n·k)". A second code card walks the sliding version: sum the first window once, add the number entering on the right and subtract the one leaving on the left, keep the best, one add and one subtract per step, O(n). Bars for 100,000 numbers with k = 10,000 show 12.35 s for summing every window against 11.7 ms for sliding. An interview-tell card reads "k numbers in a row? Say 'n − k + 1, then slide'". A challenge asks how many windows of size 3 fit in 10 numbers. A leetExpert lockup ends the reel.

## Verified facts

The AI's code is `sources/code/bug.py`; the slide is `code/slide.py`. `verify.py` builds the fix by applying exactly `+ 1` to the bug's source, then runs all three. `code/twins.js` runs in `verify.mjs`. A planted bug in the slide fails each verifier (checked 2026-09-30).

- The sample, read from the fixed-size-windows lesson's viz, gives 9 for all three versions. `[1,2,3,9], 2`: the bug gives 5; the fix and the slide give 12. `[4,5], 2`: the bug gives `-inf` (JavaScript: `-Infinity`), and the slide gives 9.
- On the lesson's six Maximum Average Subarray cases, the slide passes all six. The bug fails **four**: exactly the cases whose last window is the best one, which includes all three where k equals the length.
- `range(4 − 2 + 1)` is `[0, 1, 2]` and `range(4 − 2)` is `[0, 1]`. Challenge: 10 − 3 + 1 = 8.
- The slide equals the fix and brute force on 2,000 random inputs with negatives, in both languages.
- Speed: in our recorded run on 2026-09-30 (100,000 numbers, k = 10,000, Python), summing every window with the +1 fix took 12.35 s and sliding 11.7 ms. `verify.py` re-measures each run and asserts a gap over 100× (1,050× on a re-run).

## Sources

`script.txt`, `code/` (the AI's version, the slide, and JavaScript twins), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
