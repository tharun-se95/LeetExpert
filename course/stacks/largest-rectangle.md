---
title: Largest Rectangle in Histogram
type: problem
---

## Problem

Given bar `heights` in a histogram (all width 1), return the area of the
largest rectangle that fits entirely inside it.

**Examples**

```text
[2,1,5,6,2,3]  →  10    (height 5 × width 2, over bars 5 and 6)
[2,4]          →  4
[3,3,3]        →  9     (height 3 × width 3)
```

**Constraints:** 1 ≤ n ≤ 10⁵ · heights in [0, 10⁴].

## Attempt it first

This is the module capstone and a genuinely hard problem — expect to
spend real time. Don't reach for the stack immediately; first find the
**O(n²) structural insight** (Hint 1), which is 80% of the solution.
The stack is "merely" how that insight gets computed in one pass.


```sandbox
{
  "id": "largest-rectangle",
  "fn": { "python": "largest_rectangle_area", "javascript": "largestRectangleArea" },
  "check": "return",
  "starter": {
    "python": "def largest_rectangle_area(heights):\n    # Return the largest rectangle area.\n    pass\n",
    "javascript": "function largestRectangleArea(heights) {\n  // Return the largest rectangle area.\n}\n"
  },
  "cases": [
    { "args": [[2,1,5,6,2,3]], "expect": 10 },
    { "args": [[2,4]], "expect": 4 },
    { "args": [[1,1,1]], "expect": 3 },
    { "args": [[5,4,3,2,1]], "expect": 9 }
  ]
}
```
````reveal Hint 1 — think per BAR, not per rectangle
The best rectangle is limited by its shortest bar. So ask, for EACH bar
i: if the rectangle's height is exactly heights[i], how wide can it be?
It extends left and right until a STRICTLY SHORTER bar blocks it. The
answer is the max over bars of height × reach. Finding reach by
scanning gives a correct O(n²) — write it.
````

````reveal Hint 2 — reach = two monotonic questions
"Nearest smaller to the left" and "nearest smaller to the right" — the
monotonic lesson's OTHER two flavors. Width = right_smaller[i] −
left_smaller[i] − 1. You could run two passes and combine…
````

````reveal Hint 3 — or one pass: pop time IS answer time
Keep an increasing-height stack. When bar i arrives SHORTER than the
top, the popped bar j has just learned BOTH its boundaries: i blocks it
on the right, and the new stack top (after popping j) blocks it on the
left. Height × (i − left − 1), computed at pop. A trailing height-0
sentinel flushes the stack at the end.
````

## Brute force, for contrast

All O(n²) pairs of boundaries with a running minimum height is the
honest baseline. The per-bar reach version (Hint 1) is also O(n²) but
carries the right STRUCTURE — optimizing a good decomposition beats
optimizing a bad one. At n = 10⁵ both die; the constraints demand the
O(n) version.

## The insight

> Every maximal rectangle's height equals SOME bar's height (lower it
> onto the histogram until it rests on a shortest bar). So n candidates
> — one per bar — cover the optimum, and each candidate's width is a
> pair of nearest-smaller questions. The increasing monotonic stack
> answers both AT POP TIME: the arriving element is the right boundary,
> the exposed top is the left boundary. Three facts, one pass.

## Solution

`````reveal Solution — increasing stack, area at pop
````tabs
```python
def largest_rectangle_area(heights: list[int]) -> int:
    best = 0
    stack: list[int] = []                     # indices, heights increasing
    for i in range(len(heights) + 1):
        # sentinel: virtual height 0 past the end flushes everything
        h = heights[i] if i < len(heights) else 0
        while stack and heights[stack[-1]] >= h:
            j = stack.pop()                   # j's rectangle is decided
            height = heights[j]
            left = stack[-1] if stack else -1 # exposed top blocks on left
            width = i - left - 1
            best = max(best, height * width)
        stack.append(i)
    return best
```

```typescript
function largestRectangleArea(heights: number[]): number {
  let best = 0;
  const stack: number[] = []; // indices, heights increasing
  for (let i = 0; i <= heights.length; i++) {
    // sentinel: virtual height 0 past the end flushes everything
    const h = i < heights.length ? heights[i] : 0;
    while (stack.length > 0 && heights[stack[stack.length - 1]] >= h) {
      const j = stack.pop()!; // j's rectangle is decided
      const height = heights[j];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const width = i - left - 1;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}
```
````

Walk `[2,1,5,6,2,3]` at i = 4 (height 2): pop 6 → left = index of 5,
width 1, area 6; pop 5 → left = index of 1, width 2, area **10**. The
sentinel pass (i = 6, h = 0) pops everything left, deciding 2 and 3's
rectangles.

Three details carrying the correctness:

- **`left = -1` when the stack empties**: nothing smaller exists
  leftward, so the rectangle reaches the wall — width i − (−1) − 1 = i.
- **The `>=` pop (not `>`)**: with equal heights, the earlier duplicate
  pops with a possibly-understated width — but the LAST duplicate in
  the run survives to claim the full span, so the maximum is never
  lost. (Convince yourself on [3,3,3]: the final 3 pops at the sentinel
  with left = −1, width 3 — area 9 found.)
- **The sentinel**: a virtual 0 shorter than everything, so no bar is
  left undecided. Same move as the word-splitting sentinel in Module 5's
  reverse-words.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "Push once, pop once per index — the standing budget — with O(1) area math per pop. The sentinel adds one iteration."
}
```
`````

## Variants

- **Maximal Rectangle in a binary matrix** (hard): each row is a
  histogram of consecutive-1 heights; run THIS algorithm per row —
  O(rows × cols). A capstone built on a capstone.
- **Container With Most Water:** looks similar, is different (only two
  walls, no interior constraint) — converging pointers, Module 10.
  Telling these apart on sight is a recognition skill worth the
  contrast.

````reveal Module complete — what carries forward
- **Obligation matching** (parse anything nested) and **operand
  stacks** (evaluate anything postfix) are the parsing toolkit.
- **Per-depth snapshots** (Min Stack) generalize to any aggregate that
  must survive unwinding.
- **The monotonic stack** — with its push-once/pop-once accounting and
  answer-at-pop / answer-at-push flavors — returns in Module 9
  (monotonic deque), Module 15 (2-D histograms), and beyond.
- The **explicit-stack ⇄ recursion** equivalence becomes load-bearing
  in Stage 3: every DFS you write will choose one side of it.

**Next: Module 9 — Queues**, the opposite discipline: first in, first
out, ring buffers, and the deque that closes the monotonic story.
````

```quiz
{
  "question": "When bar j pops, why is the CURRENT stack top (after the pop) guaranteed to be the nearest strictly-shorter bar to j's left?",
  "options": [
    "Because the stack is sorted by height — the algorithm maintains the surviving indices in fully sorted order by height at all times, so the element just below any popped index is trivially the next-shortest one",
    "It's an approximation the sentinel corrects — the boundary claim only holds approximately during the main scan, and it's the trailing height-0 sentinel pass that fixes up any bars whose left boundary was recorded incorrectly",
    "The increasing-stack invariant: everything between that top and j was ≥ heights[j] and has already been popped (by j or earlier arrivals) — the survivor below j is the first element leftward that stayed, i.e. the first one shorter"
  ],
  "answer": 2,
  "explanation": "Same certificate logic as next-greater, mirrored: survival on an increasing stack MEANS 'shorter than everything above me'. The pop moment thus hands you both boundaries at once — right (the arriver) and left (the survivor) — which is what lets one pass replace two."
}
```
