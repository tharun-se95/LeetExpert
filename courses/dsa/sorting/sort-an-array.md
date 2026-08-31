---
title: Sort an Array
type: problem
---

## Problem

Given an integer array `nums`, sort it in ascending order **without**
calling a built-in sort function.

**Examples**

```examples
nums = [5,2,3,1]    →  [1,2,3,5]
nums = [5,1,1,2,0,0] →  [0,0,1,1,2,5]
```

```constraint
1 ≤ n ≤ 5·10⁴ · values in ±5·10⁴.
```

## Attempt it first

The point of this problem isn't cleverness — it's writing a real
O(n log n) sort **correctly**, from the ground up, using the concept
lessons directly. Pick merge sort or quicksort and implement it fully
before checking anything.


```sandbox
{
  "id": "sort-an-array",
  "fn": { "python": "sort_array", "javascript": "sortArray" },
  "check": "return",
  "starter": {
    "python": "def sort_array(nums):\n    # Return nums in ascending order, without a built-in sort.\n    pass\n",
    "javascript": "function sortArray(nums) {\n  // Return nums in ascending order, without a built-in sort.\n}\n"
  },
  "cases": [
    { "args": [[5, 2, 3, 1]], "expect": [1, 2, 3, 5] },
    { "args": [[5, 1, 1, 2, 0, 0]], "expect": [0, 0, 1, 1, 2, 5] },
    { "args": [[1]], "expect": [1] },
    { "args": [[2, 1]], "expect": [1, 2] },
    { "args": [[-1, -5, 3, 0, -2]], "expect": [-5, -2, -1, 0, 3] },
    { "args": [[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], "expect": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { "args": [[10, 9, 100, 1, 2]], "expect": [1, 2, 9, 10, 100] }
  ]
}
```

````reveal Hint — which one, and why it matters here
Merge sort's O(n log n) holds for EVERY input, no exceptions. Quicksort
with a naive pivot (e.g. always the last element) degrades to O(n²) on
adversarial inputs — and this exact problem is a known place graders
construct such inputs deliberately to fail naive quicksort submissions.
If you write quicksort, randomize the pivot (the concept lesson's fix) —
don't skip it here.
````

## Brute force, for contrast

Insertion or selection sort: correct, O(n²) — at n = 5×10⁴, that's
2.5×10⁹ comparisons, almost certainly too slow. This problem exists
specifically to force implementing the O(n log n) machinery for real,
not just reading about it.

## Solution

`````reveal Solution — merge sort, exactly as derived in the concept lesson
````tabs
```python
def sort_array(nums: list[int]) -> list[int]:
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = sort_array(nums[:mid])
    right = sort_array(nums[mid:])
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

```typescript
function sortArray(nums: number[]): number[] {
  if (nums.length <= 1) return nums;
  const mid = Math.floor(nums.length / 2);
  const left = sortArray(nums.slice(0, mid));
  const right = sortArray(nums.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0,
    j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  result.push(...left.slice(i), ...right.slice(j));
  return result;
}
```
````

There's nothing new here beyond the concept lesson's code — that's
deliberate. The exercise is confirming you can produce it without
re-reading the lesson, and that you understand WHY it's O(n log n)
(the recursion tree argument) rather than having memorized the lines.

```complexity
{
  "time": "O(n log n), every case",
  "space": "O(n)",
  "why": "No input-dependent behavior — the recursive split is always exactly in half, regardless of what the array contains."
}
```
`````

`````reveal Alternative — randomized quicksort, in place
````tabs
```python
import random

def sort_array_qs(nums: list[int]) -> list[int]:
    def partition(lo: int, hi: int) -> int:
        r = random.randint(lo, hi)
        nums[r], nums[hi] = nums[hi], nums[r]   # randomize the pivot first
        pivot = nums[hi]
        boundary = lo
        for i in range(lo, hi):
            if nums[i] < pivot:
                nums[boundary], nums[i] = nums[i], nums[boundary]
                boundary += 1
        nums[boundary], nums[hi] = nums[hi], nums[boundary]
        return boundary

    def quicksort(lo: int, hi: int) -> None:
        if lo < hi:
            p = partition(lo, hi)
            quicksort(lo, p - 1)
            quicksort(p + 1, hi)

    quicksort(0, len(nums) - 1)
    return nums
```

```typescript
function sortArrayQS(nums: number[]): number[] {
  function partition(lo: number, hi: number): number {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [nums[r], nums[hi]] = [nums[hi], nums[r]]; // randomize the pivot first
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

  function quicksort(lo: number, hi: number): void {
    if (lo < hi) {
      const p = partition(lo, hi);
      quicksort(lo, p - 1);
      quicksort(p + 1, hi);
    }
  }

  quicksort(0, nums.length - 1);
  return nums;
}
```
````

In-place (O(log n) auxiliary space, average case) versus merge sort's
O(n) — the trade the concept lesson named. The random swap at the top
of `partition` is not optional here; omitting it is exactly the bug
that fails on adversarial graders.

```complexity
{
  "time": "O(n log n) average, Θ(n²) worst case (astronomically unlikely with randomization)",
  "space": "O(log n) average recursion depth",
  "why": "Randomized pivot selection defends against every input, including ones an adversarial test suite constructs specifically to break naive (fixed-pivot) quicksort."
}
```
`````

## Variants

- **Sort Colors** (Module 10): a bounded-alphabet special case — three-way
  partitioning instead of general comparison sorting.
- **Kth Largest Element** (this module's capstone): uses quicksort's
  partition WITHOUT fully sorting — a direct extension of the machinery
  built here.

```quiz
{
  "question": "Why does randomizing quicksort's pivot matter specifically for a problem like this one, more than it might for casual use?",
  "options": [
    "Randomization is only needed for very large arrays — below a certain input size the worst-case O(n²) behavior isn't actually reachable, so a fixed pivot rule is safe until the array grows past that threshold",
    "It doesn't matter more here than anywhere else — the risk of hitting a bad pivot sequence is the same constant probability regardless of context, so there's nothing about automated grading specifically that changes the calculus",
    "Automated graders can and do construct adversarial inputs (e.g. sorted or reverse-sorted arrays) specifically designed to trigger a FIXED pivot rule's worst case — randomization defeats this because the adversary can't predict the algorithm's own coin flips"
  ],
  "answer": 2,
  "explanation": "This is the concept lesson's average-case argument made concrete and consequential: a naive last-element-pivot quicksort passes casual testing fine but can time out against deliberately adversarial graders, which is exactly the scenario 'defend against ALL input, not just typical input' was built to handle."
}
```
