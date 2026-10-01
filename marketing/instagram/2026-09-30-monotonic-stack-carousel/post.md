# "Next greater element" has a shape: the monotonic stack (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-monotonic-stack`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 10 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`, `slide10.png`

## Hook (first line — all most people read)

"Next greater element" has a shape.

## Caption

For each number, find the first bigger number to its right: [2, 1, 5, 3]. Checking to the right of every number is O(n²).

Picture a concert 🎤: once someone tall stands in front of you, everyone shorter behind them is blocked for good. Only taller people ever matter again.

The stack keeps the numbers still waiting, biggest at the bottom:
2 arrives → push. 1 arrives → push. 5 arrives → pop 1 (answer 5), pop 2 (answer 5), push 5. 3 arrives → push. At the end, 5 and 3 keep −1.

def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []                      # indexes, not values
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            answer[stack.pop()] = x
        stack.append(i)
    return answer

Each index goes in once and comes out at most once: O(n). Our test run on 10,000 numbers (Python): 953 ms checking right of each vs 0.6 ms with the stack.

⚠️ The trap: store values instead of indexes, and when you pop you don't know where the answer goes. Look it up with index() and duplicates break it: [1, 1, 3] → [3, −1, −1].

Your turn: the next-greater list for [4, 3, 2, 5]? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#monotonicstack #stack #leetcode #python #codinginterview

## Alt text (per slide)

**Slide 1.** The reel's cover: ""Next greater element" has a shape."

**Slide 2.** nums 2, 1, 5, 3 at i = 0 to 3 above an answer row of four −1s, an empty stack, and the tag "check right of each: O(n²)".

**Slide 3.** "A concert crowd": figures of different heights in a row. Someone tall in front: everyone shorter behind them is blocked. Only taller people ever matter again.

**Slide 4.** nums with 5 ringed; the answer row now reads 5, 5, −1, −1 and the stack holds 5 (i = 2).

**Slide 5.** The answer row 5, 5, −1, −1 with "no greater → −1" under the last two; the stack holds 5 (i = 2) and 3 (i = 3).

**Slide 6.** Python next_greater(nums): answer = [-1] * len(nums); stack = []; for i, x in enumerate(nums): while stack and nums[stack[-1]] < x: answer[stack.pop()] = x; stack.append(i). The pop line is highlighted with the note "…pop it: x is its answer"; the stage shows 5 > 2: pop 0, answer[0] = 5.

**Slide 7.** "10,000 numbers, our test run, Python": checking right of every number takes 953 ms; the monotonic stack takes 0.6 ms.

**Slide 8.** "The trap: values, not indexes": stack.append(x) and answer[nums.index(stack.pop())] = x. Popped a value: where does its answer go? [1, 1, 3] → [3, −1, −1] ✗, because index(1) finds the first 1 twice and the second 1 never gets its 3.

**Slide 9.** A text slide under "Your turn": The next-greater list for [4, 3, 2, 5]?

**Slide 10.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
