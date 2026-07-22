---
title: Fixed-Size Windows
type: concept
---

## The redundant work brute force does

A **window** is a contiguous slice of an array or string. A fixed-size
window problem asks something about every window of size k as it slides
across the input — most classically, "what's the maximum sum over any k
consecutive elements?" The brute force sums each window fresh:

```text
[2, 1, 5, 1, 3, 2], k = 3
window [2,1,5] → sum 8
window [1,5,1] → sum 7
window [5,1,3] → sum 9
window [1,3,2] → sum 6
```

Each sum costs O(k), and there are n − k + 1 windows: **O(n·k)** total.
For k anywhere near n, that's the O(n²) from Module 4's opening example
wearing a new costume — and the redundancy is visible in the trace
above: windows 1 and 2 share elements 1 and 5. Recomputing their sum
from scratch throws that shared work away.

## Slide instead of recompute

A window moving one step right doesn't change much: it drops its
leftmost element and picks up one new element on the right. So don't
recompute the sum — **update** it:

> new_sum = old_sum − (element leaving) + (element entering)

```text
[2, 1, 5, 1, 3, 2], k = 3
sum([2,1,5]) = 8
slide: 8 − 2 + 1 = 7   → sum([1,5,1])
slide: 7 − 1 + 3 = 9   → sum([5,1,3])
slide: 9 − 5 + 2 = 6   → sum([1,3,2])
```

Each slide is O(1) — one subtraction, one addition — regardless of k.
Total cost: O(k) to prime the first window, then O(1) per slide across
n − k remaining positions: **O(n)**, independent of k. This is the
converging-pointers trick's sibling: instead of two pointers eliminating
candidates, here **one pointer pair (left, right) drags a window**, and
the saving comes from *incremental maintenance* rather than *batch
elimination*. Different mechanism, same economic shape: find what's
shared between adjacent subproblems and stop recomputing it.

Step through the exact example above — the window never re-sums, it
only trades one element for another:

```viz
{ "id": "sliding-window", "data": [2, 1, 5, 1, 3, 2], "k": 3 }
```

## The template

````tabs
```python
def max_window_sum(nums: list[int], k: int) -> int:
    window_sum = sum(nums[:k])          # prime: O(k), once
    best = window_sum
    for right in range(k, len(nums)):
        left = right - k                # the element leaving
        window_sum += nums[right] - nums[left]   # slide: O(1)
        best = max(best, window_sum)
    return best
```

```typescript
function maxWindowSum(nums: number[], k: number): number {
  let windowSum = nums.slice(0, k).reduce((a, b) => a + b, 0); // O(k), once
  let best = windowSum;
  for (let right = k; right < nums.length; right++) {
    const left = right - k; // the element leaving
    windowSum += nums[right] - nums[left]; // slide: O(1)
    best = Math.max(best, windowSum);
  }
  return best;
}
```
````

Notice what makes this legal: **sum is incrementally maintainable** —
knowing the old sum and exactly which element enters/leaves is enough to
compute the new sum, with no need to re-examine the untouched middle.
That property is doing all the work, and it's worth stating as a
question you ask before reaching for this template: *"if I know the
answer for window i, and I know what's entering and leaving, can I get
the answer for window i+1 without rescanning?"* Sum, count, and running
XOR all qualify trivially. Max and min do **not** — losing the leaving
element might have been the max, and nothing short of a rescan (or a
smarter structure) tells you the new max. That's exactly why Sliding
Window Maximum (Module 9) needed the monotonic deque instead of this
template: max isn't incrementally maintainable with O(1) bookkeeping,
so the technique reached for a structure that tracks *candidates*, not
just a running scalar.

## Generalizing beyond sums

The same slide idea works for any aggregate with an efficient "remove
one, add one" update:

- **Count matching a predicate** (e.g., vowels in the window): ±1 per
  slide, same as sum.
- **Frequency map** (Hash Tables' Count verb, windowed): decrement the
  leaving character's count, increment the entering one — O(1) if you
  track "how many distinct counts are currently correct" alongside the
  map, as the Permutation in String problem will show.
- **XOR / product** (with care for zero): symmetric to sum.

```quiz
{
  "questions": [
    {
      "question": "Why does sliding a fixed window turn an O(n·k) brute force into O(n)?",
      "options": [
        "Each slide reuses the previous window's sum, updating it with one subtraction and one addition instead of re-summing all k elements — O(1) per slide instead of O(k)",
        "The window itself gets smaller as it slides — each slide narrows the range of elements under consideration by one, so later windows require progressively less work to sum than earlier ones",
        "Because k is always small — the problem's constraints keep the window size bounded by a small constant, which is what makes the per-window O(k) summation cost negligible regardless of how the algorithm is written"
      ],
      "answer": 0,
      "explanation": "The saving is incremental maintenance: adjacent windows overlap in k−1 elements, and only the boundary changes. Recomputing from scratch discards that overlap; sliding exploits it."
    },
    {
      "question": "Why can't the sliding-sum template be reused directly for a sliding MAXIMUM?",
      "options": [
        "Sum is incrementally maintainable (new = old − leaving + entering); max is not — if the leaving element WAS the max, nothing about the update tells you the new max without rescanning or tracking candidates",
        "Windows can't have a maximum — a contiguous slice of an array has no well-defined single largest element once duplicates or ties are involved, which is why the sliding-sum approach doesn't generalize",
        "Maximum is more expensive to compute than sum — comparing values to find the largest one takes more CPU cycles per element than adding them together, which is the real obstacle to sliding a maximum the same way"
      ],
      "answer": 0,
      "explanation": "The technique's applicability hinges on whether the aggregate can be updated from 'what changed' alone. This is exactly why Sliding Window Maximum needed a monotonic deque — a structure that tracks enough candidates to answer 'what's next' after the max leaves."
    }
  ]
}
```
