# This removes the even numbers. Or does it? (remove while iterating) (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-29-remove-while-iterating`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 9 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`

## Hook (first line — all most people read)

This removes the even numbers. Or does it?

## Caption

An AI wrote this in two seconds. It passes the sample test. Would you ship it? 🤔

for n in nums:
    if n % 2 == 0:
        nums.remove(n)

[1, 2, 3] → [1, 3] ✓
[2, 4, 6, 7] → [4, 7] ✗ (4 is even, and it survived)

Why: the for loop walks by position, and the position moves forward every time. remove() deletes the value and shifts everything after it one step left, so the next item lands in the slot you just checked, and the loop skips it. It's like checking tickets along a row of seats while everyone slides left under your finger.

Fix 1: don't edit the list you're reading. Build a new one:
return [n for n in nums if n % 2 != 0]

Fix 2, in place: a read pointer and a write pointer. Copy each keeper to write and move write forward. Write never passes read, so nothing unread is overwritten. Then del nums[write:].

And even the version that works (loop over a copy, remove from the original) is O(n²). Our test run on 100,000 numbers: 7,972 ms vs 4 ms for the new list.

Python raises "RuntimeError: dictionary changed size during iteration" for a dict. Lists and JavaScript arrays just skip, silently.

Your turn: what does the buggy version return for [1, 2, 2, 3]? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#pythontips #javascript #debugging #codereview #learnpython

## Alt text (per slide)

**Slide 1.** This removes the even numbers. Or does it?

**Slide 2.** A card calls remove_evens([2, 4, 6, 7]) and shows the cells 2, 4, 6, 7; under "returns" are 4 and 7.

**Slide 3.** "Checking tickets, seat by seat": four cinema seats, 0 to 3. A finger points at seat 1, holding 6, while 4 sits in seat 0, ringed, over the line "4 slid into seat 0. Nobody checked it."

**Slide 4.** Python remove_evens(nums) with the loop for n in nums: if n % 2 == 0: nums.remove(n) highlighted. The note reads "The next item lands in the slot you just checked: skipped", above cells 4 and 7 and the result "returns [4, 7]: 4 survived".

**Slide 5.** The fix as one line, return [n for n in nums if n % 2 != 0], highlighted. The note reads "Build a new one: keep n only if it's odd", [2, 4, 6, 7] → [7] ✓, with 2, 4 and 6 dimmed and 7 lit: new list: [7].

**Slide 6.** The in-place fix: write = 0; for read in range(len(nums)): if nums[read] % 2 != 0: nums[write] = nums[read]; write += 1; then del nums[write:]. The copy line is highlighted. The note reads "write never passes read: nothing unread is overwritten" over cells 7, 4, 6, 7 with write above index 0 and read below index 3: write → 1, never past read.

**Slide 7.** "100,000 numbers, our test run, Python": every remove shifts the whole tail, O(n²). for n in nums[:]: nums.remove(n) takes 7,972 ms; [n for n in nums if n % 2 != 0] takes 4 ms. A tag says about 2,000× slower.

**Slide 8.** A text slide under "Your turn": What does the buggy version return for [1, 2, 2, 3]?

**Slide 9.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
