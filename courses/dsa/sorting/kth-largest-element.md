---
title: Kth Largest Element in an Array
type: problem
---

## Problem

Given an integer array `nums` and an integer `k`, return the **kth
largest** element — the kth largest in sorted order, not the kth
distinct value.

**Examples**

```examples
nums = [3,2,1,5,6,4], k = 2   →  5    (sorted: [1,2,3,4,5,6]; 2nd largest is 5)
nums = [3,2,3,1,2,4,5,5,6], k = 4  →  4
```

```constraint
1 ≤ k ≤ n ≤ 10⁴.
```

## Attempt it first

The module's capstone: a genuinely surprising result. You do **not**
need to sort the whole array to find one specific rank within it —
quicksort's partition step, run just once per level instead of
recursing into both sides, finds the kth element in **expected linear
time**. Reason through why before opening the hints; this is the payoff
of understanding partition as its own tool, not just sorting's engine.


```sandbox
{
  "id": "kth-largest-element",
  "fn": { "python": "find_kth_largest", "javascript": "findKthLargest" },
  "check": "return",
  "starter": {
    "python": "def find_kth_largest(nums, k):\n    # Return the kth largest value, counting duplicates.\n    pass\n",
    "javascript": "function findKthLargest(nums, k) {\n  // Return the kth largest value, counting duplicates.\n}\n"
  },
  "cases": [
    { "args": [[3, 2, 1, 5, 6, 4], 2], "expect": 5 },
    { "args": [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], "expect": 4 },
    { "args": [[1], 1], "expect": 1 },
    { "args": [[2, 2, 2, 2], 3], "expect": 2 },
    { "args": [[7, 6, 5, 4, 3, 2, 1], 1], "expect": 7 },
    { "args": [[7, 6, 5, 4, 3, 2, 1], 7], "expect": 1 },
    { "args": [[-1, -5, -3], 2], "expect": -3 }
  ]
}
```

````reveal Hint 1 — what does ONE partition call give you for free?
Partitioning around a pivot places it at its FINAL sorted index — call
it p. If p is exactly the rank you want, you're done instantly. If your
target rank is less than p, it's entirely within the left side; if
greater, entirely within the right. Either way, you never need to touch
the OTHER side again.
````

````reveal Hint 2 — recurse into only ONE side
Unlike quicksort (which recurses into both halves), this recurses into
only the half containing the target rank — throwing away the other
half's work entirely. That's the whole trick, and it's why this beats
full sorting.
````

## Brute force, for contrast

Sort, then index: O(n log n) — correct, and a completely reasonable
first answer. This problem's real content is the follow-up: can you
avoid sorting the parts you don't need? Full sorting computes the exact
rank of EVERY element; quickselect computes only the one rank you
actually asked for.

## The insight

> Quicksort recurses into both partitions because it needs every
> element's final position. Finding a single rank needs only ONE
> element's final position — so after partitioning, discard whichever
> side can't contain the target and recurse into just the other. Each
> level does O(current size) partition work, and — exactly like
> quicksort's average case — a random pivot makes the sizes shrink
> geometrically on average: n + n/2 + n/4 + ⋯ ≈ 2n = **O(n) expected**,
> not O(n log n).

## Solution

`````reveal Solution — quickselect: partition, discard a side, repeat
````tabs
```python
import random

def find_kth_largest(nums: list[int], k: int) -> int:
    target_index = len(nums) - k    # kth LARGEST = (n-k)th smallest, 0-indexed

    def partition(lo: int, hi: int) -> int:
        r = random.randint(lo, hi)
        nums[r], nums[hi] = nums[hi], nums[r]
        pivot = nums[hi]
        boundary = lo
        for i in range(lo, hi):
            if nums[i] < pivot:
                nums[boundary], nums[i] = nums[i], nums[boundary]
                boundary += 1
        nums[boundary], nums[hi] = nums[hi], nums[boundary]
        return boundary

    lo, hi = 0, len(nums) - 1
    while True:
        p = partition(lo, hi)
        if p == target_index:
            return nums[p]
        elif p < target_index:
            lo = p + 1          # discard the LEFT side entirely
        else:
            hi = p - 1          # discard the RIGHT side entirely
```

```typescript
function findKthLargest(nums: number[], k: number): number {
  const targetIndex = nums.length - k; // kth LARGEST = (n-k)th smallest, 0-indexed

  function partition(lo: number, hi: number): number {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [nums[r], nums[hi]] = [nums[hi], nums[r]];
    const pivot = nums[hi];
    let boundary = lo;
    for (let i = lo; i < hi; i++) {
      if (nums[i] < pivot) {
        [nums[boundary], nums[i]] = [nums[i], nums[boundary]];
        boundary++;
      }
    }
    [nums[boundary], nums[hi]] = [nums[hi], nums[boundary]];
    return boundary;
  }

  let lo = 0,
    hi = nums.length - 1;
  while (true) {
    const p = partition(lo, hi);
    if (p === targetIndex) return nums[p];
    else if (p < targetIndex) lo = p + 1; // discard the LEFT side entirely
    else hi = p - 1; // discard the RIGHT side entirely
  }
}
```
````

The index translation matters: partition naturally produces ascending
order, so the kth LARGEST is the (n−k)th smallest (0-indexed) —
`target_index = len(nums) - k`. Verify: k=2 (2nd largest) in a 6-element
array → target_index = 4, the index that holds the value with exactly 4
smaller elements before it, i.e. the 5th smallest = 2nd largest. Trace
the first example (`[3,2,1,5,6,4], k=2`, target_index=4) against the
partition code once by hand to see one discard happen.

```complexity
{
  "time": "O(n) expected, O(n²) worst case (astronomically unlikely with randomization)",
  "space": "O(1) auxiliary (in place); O(log n) expected recursion-ish depth, though this loop version uses none",
  "why": "Each round discards roughly half the remaining candidates on average (random pivot), so total work is n + n/2 + n/4 + ... which converges to O(n) — a full geometric series, not a log-multiplied one, because only ONE side is ever explored."
}
```
`````

## Why this closes the module

Quickselect is the clearest possible demonstration that **partition is
a tool in its own right**, independent of sorting. Every idea in this
module lands here: the partition step from Module 10, the
randomization argument from this module's quicksort lesson (defending
average-case behavior against every input), and the recursion-cost
reasoning from the Big O module (a geometric series collapsing to
linear, versus a log-multiplied one) — all three converge to produce an
algorithm that is asymptotically BETTER than sorting for a question
sorting can also answer, simply by refusing to do more work than the
question actually requires.

````reveal Module complete — what carries forward
- **Comparison sorts have a real, provable floor** (Ω(n log n)) — you
  now know the actual argument, not just the number.
- **Best/worst/average case** (from the Big O module) has now been
  applied concretely to two real algorithms in the same family
  (quicksort and quickselect), each defended by the same randomization
  argument.
- **Partitioning is reusable outside sorting** — quickselect is the
  first of many places a "sorting primitive" turns out to answer a
  narrower, cheaper question when you don't actually need a full order.
- **Custom comparators** (Largest Number) and **sort-then-sweep**
  (Merge Intervals, Meeting Rooms II) are patterns that will recur
  constantly, especially once Greedy (Module 22) starts every proof
  with "sort by some key, then..."

**Next: Module 15 — Matrix / 2D Traversal**, closing Stage 2 with grid
coordinates, traversal orders, and in-place matrix transformations.
````

```quiz
{
  "questions": [
    {
      "question": "Quickselect and quicksort both partition around random pivots. Why is quickselect's expected time O(n) while quicksort's is O(n log n)?",
      "options": [
        "Quickselect doesn't actually run faster; the complexities are the same — both algorithms do the identical amount of total partition work, and the O(n) vs O(n log n) distinction is just a difference in how the bound is conventionally written",
        "Quickselect uses a smarter partition function — its partition step is a more efficient variant that does less comparison work per element than the one quicksort uses, which is where the speed advantage actually comes from",
        "Quicksort must recurse into BOTH halves after every partition (it needs every element's position), giving a total of O(n) work at each of O(log n) levels. Quickselect discards one whole half every round, so the work forms a geometric series (n + n/2 + n/4 + ...) that sums to O(n) — no log factor, because there's only ever one active branch"
      ],
      "answer": 2,
      "explanation": "The log factor in quicksort comes specifically from work being repeated across O(log n) LEVELS of a tree with two branches each. Quickselect has only one branch per level, so summing its work is a geometric series collapsing to a constant multiple of n, not n times the depth."
    },
    {
      "question": "Why does the algorithm compute `target_index = len(nums) - k` instead of using k directly as an index?",
      "options": [
        "It's an arbitrary implementation detail — either k or len(nums) - k could be used as the target index interchangeably, since the partition function would locate the correct element either way",
        "Partition naturally produces elements in ASCENDING order (smallest at index 0), but the problem asks for the kth LARGEST — which corresponds to the (n-k)th smallest in 0-indexed terms. The translation converts the problem's framing into the index the partition machinery actually understands",
        "To make the algorithm run faster — computing the index this way lets the partition function skip over already-eliminated elements more efficiently than using k directly would allow"
      ],
      "answer": 1,
      "explanation": "This is a recurring translation whenever you reuse an ascending-order tool for a descending-order question — get the off-by-one right by re-deriving it from a small example (n=6, k=2 -> index 4) rather than memorizing the formula."
    }
  ]
}
```
