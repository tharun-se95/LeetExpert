# Answer any range sum in O(1): prefix sums as an odometer (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-prefix-sum-odometer`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 10 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`, `slide10.png`

## Hook (first line — all most people read)

Answer any range sum in O(1).

## Caption

nums = [2, 4, 1, 5, 3]. What's the sum from index 1 to 3? 4 + 1 + 5 = 10.
Now answer 10,000 of those. Adding each range from scratch costs up to O(n) every time.

Think of a car's odometer: it only shows the total since the car was new. Any trip = end reading − start reading. You never re-drive the trip. 🚗

A prefix array is that odometer: 0, 2, 6, 7, 12, 15.

def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)   # prefix[0] = 0, the sum of nothing
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix

sum(l..r) = prefix[r + 1] − prefix[l]
1..3 → 12 − 2 = 10. 2..4 → 15 − 6 = 9. One subtraction, however wide the range.

Our test run, 10,000 queries on 100,000 numbers (Python): 4.96 s summing each range vs 6.1 ms with a prefix array, build included.

⚠️ Only for an array that doesn't change: update one value and every later total is stale.
⚠️ Off-by-one: prefix[r] − prefix[l] drops nums[r] (7 − 2 = 5, not 10).

Your turn: using just two numbers, what's sum(0..4)? 👇

Step through it on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#prefixsum #algorithms #leetcode #python #codinginterview

## Alt text (per slide)

**Slide 1.** Answer any range sum in O(1).

**Slide 2.** The array nums, 2, 4, 1, 5, 3, indexed 0 to 4, with a bracket over indices 1 to 3 labelled 4 + 1 + 5 = 10.

**Slide 3.** "An odometer: total distance since the car was new." Trip start 12,040 km, trip end 12,075 km, so the trip = 12,075 − 12,040 = 35 km.

**Slide 4.** nums 2, 4, 1, 5, 3 above its prefix array, the running total: 0, 2, 6, 7, 12, 15.

**Slide 5.** Python build_prefix(nums): prefix = [0] * (len(nums) + 1); for i, x in enumerate(nums): prefix[i + 1] = prefix[i] + x, with the loop highlighted, and range_sum returning prefix[r + 1] - prefix[l]. The note reads "Next slot = previous slot + x"; the stage fills prefix[4] = 7 + 5 = 12.

**Slide 6.** nums with indices 1 to 3 bracketed, and the prefix array 0, 2, 6, 7, 12, 15 with 2 and 12 ringed: 12 − 2 = 10.

**Slide 7.** "10,000 queries on 100,000 numbers, our test run, Python": sum(nums[l:r+1]) each time takes 4.96 s; the prefix array, build included, takes 6.1 ms. A tag says about 800× faster.

**Slide 8.** "The classic off-by-one": prefix[r] - prefix[l] gives sum(1..3) → 7 − 2 = 5 ✗, which drops the last number, nums[3] = 5; prefix[r + 1] - prefix[l] gives 10 ✓.

**Slide 9.** A text slide under "Your turn": Using just two numbers, what's sum(0..4)?

**Slide 10.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
