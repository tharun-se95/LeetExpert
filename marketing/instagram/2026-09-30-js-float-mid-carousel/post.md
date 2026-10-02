# Binary search in JavaScript. One character is wrong. (the float `mid`) (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-js-float-mid`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 9 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`

## Hook (first line — all most people read)

Binary search in JavaScript. One character is wrong.

## Caption

Tested on [1, 3, 5, 7, 9, 11, 13]: every target found. Would you ship it? 🤔

const mid = (lo + hi) / 2;

Search [2, 4, 6, 8] for 6 → -1. But 6 is right there.

lo = 0, hi = 3 → (0 + 3) / 2 = 1.5. JavaScript doesn't round, so arr[1.5] is undefined. undefined isn't === 6 and isn't < 6, so the code falls into the last branch: hi = 0.5. It never looks at a real index again.

Why did the tests pass? On 7 numbers, lo + hi is even at every step. The bug only hides on lengths 1, 3, 7, 15…: one less than a power of two.

Python's / makes a float too, but it crashes: "TypeError: list indices must be integers or slices, not float". Loud beats silently wrong.

Fix: const mid = lo + Math.floor((hi - lo) / 2);
It's always a whole index, and it never adds two huge numbers (overflow-safe in Java/C++).

Your turn: 7 hides the bug. What's the next length that does? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#javascript #binarysearch #javascripttips #debugging #webdev

## Alt text (per slide)

**Slide 1.** The reel's cover: "Binary search in JavaScript. One character is wrong."

**Slide 2.** binarySearch([2, 4, 6, 8], 6) → -1 ✗, over the note "6 is right there, at index 2".

**Slide 3.** const mid = (lo + hi) / 2; over the array 2, 4, 6, 8, with a marker between indices 1 and 2 labelled 1.5: lo = 0, hi = 3 → (0 + 3) / 2 = 1.5, and arr[1.5] → undefined.

**Slide 4.** The same array: arr[1.5] is undefined, so === 6? is false and < 6? is false, so hi = mid − 1 = 0.5.

**Slide 5.** "Why the tests passed: on 7 numbers, lo + hi is even at every step." Lengths 1 to 16 in a grid: 1, 3, 7 and 15 are marked hides, the rest fails. Hides only on 2^k − 1: one less than a power of two.

**Slide 6.** "Python, same slash": mid = (lo + hi) / 2 gives TypeError: list indices must be integers or slices, not float. Loud beats silently wrong.

**Slide 7.** The fixed JavaScript binarySearch with const mid = lo + Math.floor((hi - lo) / 2); highlighted and the note "Never adds two huge numbers: overflow-safe in Java or C++"; the stage shows 2, 4 dimmed and lo on 6: 4 < 6 → lo = 2.

**Slide 8.** A text slide under "Your turn": 7 hides the bug. What's the next length that does?

**Slide 9.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
