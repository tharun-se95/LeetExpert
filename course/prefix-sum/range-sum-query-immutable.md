---
title: Range Sum Query — Immutable
type: problem
---

## Problem

Given an integer array `nums`, implement `NumArray` supporting
`sumRange(left, right)` — the sum of `nums[left..right]` inclusive — for
**many** calls. The array never changes between calls.

**Example**

```text
nums = [-2, 0, 3, -5, 2, -1]
sumRange(0, 2) → -2+0+3 = 1
sumRange(2, 5) → 3-5+2-1 = -1
sumRange(0, 5) → -2+0+3-5+2-1 = -3
```

**Constraints:** 1 ≤ n ≤ 10⁴ · up to 3·10⁴ calls to `sumRange`.

## Attempt it first

This problem exists to make the basics lesson's trade concrete: it's
literally "build the object once, answer queries fast," phrased as a
class. The whole exercise is placing the O(n) work in the constructor
and the O(1) work in the query — get that placement backwards and the
solution technically works but fails the *reason* the problem exists.

````reveal Hint — where does each cost belong?
Build the prefix array ONCE, in __init__/constructor. sumRange should
do only prefix[right+1] - prefix[left] — no loops, no recomputation.
````

## Brute force, for contrast

Sum the range fresh on every call: O(n) per query, O(n·q) total — at
the constraint ceiling, 10⁴ × 3·10⁴ = 3×10⁸, likely too slow if calls
cluster on large ranges. More importantly: it throws away the fact that
`nums` never changes, which is the whole point of an "Immutable" problem
title — a signal, not decoration.

## Solution

`````reveal Solution — prefix array, built once
````tabs
```python
class NumArray:
    def __init__(self, nums: list[int]) -> None:
        self.prefix = [0] * (len(nums) + 1)      # O(n), once
        for i, x in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + x

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]   # O(1), every call
```

```typescript
class NumArray {
  private prefix: number[];

  constructor(nums: number[]) {
    this.prefix = new Array(nums.length + 1).fill(0); // O(n), once
    for (let i = 0; i < nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  sumRange(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left]; // O(1), every call
  }
}
```
````

Verify against the example: `prefix = [0, -2, -2, 1, -4, -2, -3]`.
`sumRange(0,2) = prefix[3] - prefix[0] = 1 - 0 = 1` ✓.
`sumRange(2,5) = prefix[6] - prefix[2] = -3 - (-2) = -1` ✓.

```complexity
{
  "time": "O(n) constructor, O(1) per sumRange call",
  "space": "O(n)",
  "why": "The constructor's cost is paid ONCE regardless of how many queries follow; each query is a fixed 2-lookup subtraction. Total cost across q queries: O(n + q), not O(n · q)."
}
```
`````

## Variants

- **Range Sum Query — Mutable:** a single `update(index, val)` call
  invalidates the whole prefix array under this design (rebuild costs
  O(n) per update) — this is precisely where a Fenwick tree or segment
  tree earns its complexity, trading a bit of query speed for O(log n)
  updates.
- **Range Sum Query 2D — Immutable** (next): the exact same trade,
  extended to rectangles.

```quiz
{
  "question": "Why does this problem specifically matter that `sumRange` is called MANY times, not once?",
  "options": [
    "It doesn't — the prefix-sum approach is always better; paying O(n) once to build the array is worth it even for a single query, since amortized cost is a red herring here and the technique dominates brute force unconditionally",
    "Because the array is described as immutable — the 'immutable' label in the problem's title is itself the reason preprocessing pays off, independent of how many times sumRange actually gets called afterward",
    "The prefix array costs O(n) to build; that investment only pays off when its O(1)-per-query benefit is collected many times. For a single query, brute-force summing (O(range length), no preprocessing) is at least as good and simpler"
  ],
  "answer": 2,
  "explanation": "This is the preprocessing trade from the concept lesson, made numeric: O(n) once is only worth paying if it's amortized across enough O(1) queries to beat doing each query in O(range length) directly. Recognizing WHEN a fixed upfront cost pays off is as important as knowing the technique."
}
```
