# If you see "contiguous", think window: the sliding window as an inchworm (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-sliding-window-inchworm`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 10 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`, `slide10.png`

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

#slidingwindow #algorithms #leetcode #python #codinginterview

## Alt text (per slide)

**Slide 1.** The reel's cover: "If you see "contiguous", think window."

**Slide 2.** "Shortest stretch with sum ≥ 7?" over the array 2, 3, 1, 2, 4, 3, with "every start × every end = O(n²)".

**Slide 3.** The same array with the rule "front stretches forward →, back pulls in →, neither end ever backs up".

**Slide 4.** A window around 1, 2, 4 at indices 2 to 4: window total = 7 ≥ 7 ✓, shortest so far = 3.

**Slide 5.** The window now around 4, 3 at indices 4 and 5: window total = 7 ≥ 7 ✓, shortest so far = 2, and the tag "answer: [4, 3], length 2".

**Slide 6.** Python min_subarray_len(target, nums) with the shrink step, total -= nums[left], highlighted inside while total >= target. The note reads "drop nums[left], move left on"; the stage shows the window on 2, 4 with left and right pointers: record 3, drop 1 → total 6.

**Slide 7.** "10,000 numbers, our test run, Python": every start × every end takes 848 ms; the sliding window takes 1.18 ms.

**Slide 8.** "The trap: if instead of while": while total >= target: gives 2 ✓; if total >= target: gives 4 ✗. It shrinks at most once per step, so the window never gets tight.

**Slide 9.** A text slide under "Your turn": Target 11 on [1, 2, 3, 4, 5]. Shortest length?

**Slide 10.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
