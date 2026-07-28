---
title: Sliding Window Maximum
type: problem
---

## Problem

Given `nums` and window size `k`, return the **maximum of each
contiguous window** of size k as it slides left to right.

**Examples**

```text
nums = [1,3,-1,-3,5,3,6,7], k = 3
windows: [1,3,-1] [3,-1,-3] [-1,-3,5] [-3,5,3] [5,3,6] [3,6,7]
output:  [3, 3, 5, 5, 6, 7]

nums = [1], k = 1  →  [1]
```

**Constraints:** 1 ≤ n ≤ 10⁵ · 1 ≤ k ≤ n · a hard problem — the
O(n) solution is a famous interview finale.

## Attempt it first

Stage 1's final problem. The deque lesson built the exact machine this
needs and proved its two rules; your work is assembling it into
windowed form and getting the off-by-ones right. If you internalized
the dominance argument, you can write this without looking back — try.

```sandbox
{
  "id": "sliding-window-maximum",
  "fn": { "python": "max_sliding_window", "javascript": "maxSlidingWindow" },
  "check": "return",
  "starter": {
    "python": "def max_sliding_window(nums, k):\n    # Return the maximum of each window of size k, left to right.\n    pass\n",
    "javascript": "function maxSlidingWindow(nums, k) {\n  // Return the maximum of each window of size k, left to right.\n}\n"
  },
  "cases": [
    { "args": [[1, 3, -1, -3, 5, 3, 6, 7], 3], "expect": [3, 3, 5, 5, 6, 7] },
    { "args": [[1], 1], "expect": [1] },
    { "args": [[1, -1], 1], "expect": [1, -1] },
    { "args": [[9, 8, 7, 6], 2], "expect": [9, 8, 7] },
    { "args": [[1, 2, 3, 4], 2], "expect": [2, 3, 4] },
    { "args": [[4, 4, 4, 4], 2], "expect": [4, 4, 4] },
    { "args": [[7, 2, 4], 3], "expect": [7] },
    { "args": [[1, 3, 1, 2, 0, 5], 3], "expect": [3, 3, 2, 5] },
    { "args": [[-7, -8, -9], 2], "expect": [-7, -8] }
  ]
}
```

````reveal Hint 1 — why the obvious speedups fail
Brute force is O(n·k). A max-variable can't slide: when the CURRENT
max exits the window, the runner-up is unknown (Min Stack's lesson,
now with expiry). A heap gives O(n log n) with lazy expiry — decent,
not optimal, and worth being able to say out loud.
````

````reveal Hint 2 — the deque's two jobs, windowed
Deque of indices, values decreasing. New element: pop dominated backs
(≤ incoming), push. Window slid: pop the front if its index is now
i − k or older. Record deque-front's value once i ≥ k − 1. Indices —
not values — because expiry is an INDEX question.
````

## Brute force, for contrast

Scan each window: O(n·k) — 10¹⁰ at the extremes (n = 10⁵, k = n/2).
The heap alternative: push everything, lazy-pop stale maxima —
O(n log n), the "good but not great" tier. The deque's O(n) beats both
by never *searching* for the max — it maintains a certificate
structure where the max is always at the front.

## The insight

> Combine the two discard rules, each from a parent structure: an
> element smaller than a LATER element can never be a window max
> (dominance — the stack's rule); an element k-or-more positions old is
> out of every current window (expiry — the queue's rule). What
> survives both filters is exactly the decreasing candidate list, and
> its front is each window's max. Both filters ride the
> push-once/pop-once budget: O(n) total.

## Solution

`````reveal Solution — monotonic deque over a sliding window
````tabs
```python
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()          # indices; values decreasing
    out: list[int] = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()                  # dominated: newer AND >= them
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()              # expired: left the window
        if i >= k - 1:
            out.append(nums[dq[0]])   # front = this window's max
    return out
```

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const dq: number[] = []; // indices; values decreasing (array-as-deque)
  let head = 0; // moving front
  const out: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) {
      dq.pop(); // dominated: newer AND >= them
    }
    dq.push(i);
    if (dq[head] <= i - k) head++; // expired: left the window
    if (i >= k - 1) out.push(nums[dq[head]]); // front = window's max
  }
  return out;
}
```
````

The three lines that carry the off-by-one weight:

- **`dq[0] <= i - k`**: the window is [i−k+1, i]; index i−k is the
  first EXCLUDED position. At most one expiry per step is possible —
  the front is the only element old enough (a single `if`, not a
  `while`, and knowing why is a quiz-grade fact: fronts are pushed in
  increasing index order, and we expire one per slide).
- **`i >= k - 1`**: the first complete window ends at index k−1;
  recording earlier would emit partial-window maxima.
- **`<=` in the dominance pop**: with equal values, keep the NEWER
  index (it expires later, strictly more useful) — popping the equal
  older one is what the dominance proof licenses.

Trace `[1,3,-1,-3,5,3,6,7], k=3` — the deque lesson's example finishes:
fronts read 3, 3, 5, 5, 6, 7. ✓

```complexity
{
  "time": "O(n)",
  "space": "O(k)",
  "why": "Each index: pushed once, popped at most once from ONE end — the split budget. The deque never holds more than k indices (everything older has expired)."
}
```
`````

## Variants

- **Sliding window MINIMUM:** flip the comparison — increasing deque.
- **Shortest Subarray with Sum ≥ K (hard):** monotonic deque over
  prefix sums — this machine composed with Module 12.
- **Constrained-jump DP problems** (Stage 4): "best of the last k
  states" is this pattern inside a DP loop, turning O(n·k) DPs into
  O(n).

````reveal Stage 1 complete — the linear structures, assembled
Nine modules in, you own the full linear toolkit:

- **Arrays** — contiguity, amortized growth, in-place surgery
- **Strings** — immutability economics, builders, fingerprints
- **Hash tables** — O(1)-by-content, four verbs, honest premises
- **Linked lists** — pointer surgery, dummy nodes, runners
- **Stacks & queues** — order disciplines, monotonic structures, and
  amortized accounting used as a ROUTINE tool, not a trick

Stage 2 turns from structures to TECHNIQUES: two pointers, sliding
window, prefix sums, binary search, sorting — algorithms that squeeze
linear structures for everything the Big O module said was possible.

**Next: Module 10 — Two Pointers.**
````

```quiz
{
  "questions": [
    {
      "question": "Why is the expiry check a single `if` rather than a `while`?",
      "options": [
        "Deque indices are in increasing order and the window slides by ONE per step — only the front can be out of range, and by at most one position. The while would be harmless but the if is provably sufficient, and knowing which is the difference between reading code and owning it",
        "To keep the loop O(1) — swapping in a while loop would let a single slide's expiry check run an unbounded number of times, which is what a plain if is specifically there to cap",
        "A while would be incorrect — checking repeatedly for expired fronts risks discarding a still-valid candidate whenever more than one element happens to share the same index value"
      ],
      "answer": 0,
      "explanation": "Every element behind the front is newer, hence in-window if the front is. One slide can expire at most one index. (After the dominance pops, some implementations do expiry first — order between the two rules doesn't matter, another fact the invariant settles.)"
    },
    {
      "question": "Where does the heap solution lose to the deque, given both handle expiry lazily?",
      "options": [
        "The heap pays O(log n) per insertion to maintain TOTAL order among all candidates — order the problem never asks for. The deque maintains only the dominance-filtered decreasing list: every comparison it makes is one the answer actually needs",
        "Heaps can't hold indices — a heap's internal comparator is restricted to numeric values, so tracking which index a value came from would require a separate parallel structure the deque doesn't need",
        "The heap gives wrong answers on duplicates — when two window elements share the same value, a heap's arbitrary tie-breaking during comparisons can surface a stale, already-expired entry as the reported maximum"
      ],
      "answer": 0,
      "explanation": "A recurring optimality theme: the log factor buys sorted-ness among elements that dominance already proved irrelevant. Matching the structure's invariant to EXACTLY the question — no more — is where optimal algorithms come from."
    }
  ]
}
```
