# Watch recursion go down and come back up (the call stack) (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-call-stack-trays`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 10 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`, `slide10.png`

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

## Alt text (per slide)

**Slide 1.** The reel's cover: "Watch recursion go down and come back up."

**Slide 2.** "Winding down: each call waits": one frame on the stack, factorial(3), waiting: 3 × ?.

**Slide 3.** Four frames stacked: factorial(0) on top marked base case → 1, then factorial(1) waiting 1 × ?, factorial(2) waiting 2 × ?, and factorial(3) waiting 3 × ? at the bottom.

**Slide 4.** "Unwinding: multiply on the way back": the stack is down to factorial(3), waiting: 3 × ?.

**Slide 5.** The stack emptied to factorial(3) = 6, with the note "4 frames = n + 1".

**Slide 6.** Python factorial(n): if n == 0: return 1; return n * factorial(n - 1), with the last line highlighted and the note "The multiply waits until the call comes back"; the call stack shows factorial(3): 3 × 2 after factorial(2) returns 2.

**Slide 7.** "Every frame costs memory": Python stops at 1,000 frames, factorial(1000) raises RecursionError: maximum recursion depth exceeded; JavaScript around 10,000.

**Slide 8.** Python broken(n): if n == 0: return 1; return n * broken(n - 2), with the last line highlighted and the note "Not a hang: a crash". The call stack piles up broken(-3), broken(-5), broken(-7), broken(-9), broken(-11): depth 8, n = −11, past 0.

**Slide 9.** A text slide under "Your turn": How many frames deep does factorial(5) go?

**Slide 10.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
