# Max sum of k in a row. Looks clean. (the fixed window's missing last window) (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-max-sum-k-window`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 9 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`

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

#slidingwindow #offbyone #codereview #python #leetcode

## Alt text (per slide)

**Slide 1.** Max sum of k numbers in a row. Looks clean.

**Slide 2.** Python max_sum_k(nums, k) tagged "AI · passes the sample": best = float("-inf"); for i in range(len(nums) - k): best = max(best, sum(nums[i:i + k])); return best. Under it [2, 1, 5, 1, 3, 2], k = 3 → 9 ✓, with the windows walked on the array.

**Slide 3.** max_sum_k([1, 2, 3, 9], 2) → 5 ✗; the answer is 12 (3 + 9).

**Slide 4.** "Count the windows": a 2-wide frame on 1, 2, 3, 9 fits at start 0, start 1 and start 2, with the last one, 3 and 9, lit.

**Slide 5.** The same code with for i in range(len(nums) - k): highlighted and the note "Start 2, [3, 9]: never checked"; on 1, 2, 3, 9 the pair 3, 9 is ringed: start 2: 3 + 9 = 12, never checked.

**Slide 6.** The sliding version: window = sum(nums[:k]); best = window; for right in range(k, len(nums)): window += nums[right] - nums[right - k]; best = max(best, window), with that line highlighted and the note "Keep the best". On 2, 1, 5, 1, 3, 2 with k = 3: +3 − 1 → window 9, best 9.

**Slide 7.** "100,000 numbers, k = 10,000, our test run, Python": summing every window (with the +1 fix) takes 12.35 s; sliding the sum takes 11.7 ms.

**Slide 8.** A text slide under "Your turn": How many windows of size 3 fit in 10 numbers?

**Slide 9.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
