# Watch binary search throw away half (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-binary-search-halves`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 10 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`, `slide10.png`

## Hook (first line — all most people read)

Watch binary search throw away half.

## Caption

Find 9 in [1, 3, 5, 7, 9, 11, 13]. 📖 Do what you'd do with a paper dictionary: open the middle, keep one half, ignore the other.

mid = 7 < 9 → everything up to 7 is too small. Gone.
mid = 11 > 9 → 11 and everything after it. Gone.
mid = 9 → found, in 3 checks.

def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

Each check halves the range: O(log n). A million sorted numbers take at most 20 checks. A billion, 30.

⚠️ The classic bug: lo = mid instead of mid + 1. Search [1, 3] for 3: mid stays 0 and lo stays 0, forever.
⚠️ It only works on sorted data, or anything where one comparison tells you which half to drop.

Your turn: how many checks to find 13 in this list? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#binarysearch #algorithms #computerscience #python #leetcode

## Alt text (per slide)

**Slide 1.** The reel's cover: "Watch binary search throw away half."

**Slide 2.** "A paper dictionary": an open book.

**Slide 3.** The sorted list 1, 3, 5, 7, 9, 11, 13 with 1 to 5 dimmed and 7 ringed; lo sits on 9 and hi on 13: mid = 7 < 9 → drop 7 and everything left of it.

**Slide 4.** The same list with only 9 still lit and 11 ringed; lo and hi both on 9: mid = 11 > 9 → drop 11 and everything right.

**Slide 5.** 9 ringed with lo and hi on it: mid = 9 → found in 3 checks.

**Slide 6.** Python binary_search(arr, target): lo, hi = 0, len(arr) - 1; while lo <= hi: mid = lo + (hi - lo) // 2, returning mid on a match, lo = mid + 1 when arr[mid] < target, else hi = mid - 1; return -1. The else branch is highlighted with the note "Too big: move hi below mid"; on the list, 11 > 9 → hi = 4.

**Slide 7.** "1,000,000 sorted numbers": check 20 leaves at most 1, so at most 20 checks; 1,000,000,000 → at most 30.

**Slide 8.** "The classic bug": lo = mid + 1 ✓ against lo = mid ✗. On [1, 3], find 3: lo = 0, hi = 1, mid = 0; 1 < 3 → lo = mid = 0 … again, forever.

**Slide 9.** A text slide under "Your turn": How many checks to find 13 in this list?

**Slide 10.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
