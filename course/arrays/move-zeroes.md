---
title: Move Zeroes
type: problem
---

## Problem

Given an integer array `nums`, move all `0`s to the end **in place** while
keeping the relative order of the non-zero elements.

**Examples**

```text
nums = [0, 1, 0, 3, 12]  →  [1, 3, 12, 0, 0]
nums = [0]               →  [0]
```

**Constraints:** 1 ≤ n ≤ 10⁴ · O(1) auxiliary space · minimize total
writes (follow-up).

## Attempt it first

Same family as the last problem — but this time ==nothing is discarded: the
zeroes must survive, at the end==. Decide what your invariant says about
*three* regions before coding.

```aside
I wrote the two-pass version for years before noticing the swap version is
the same invariant, just fused into one loop.
```

```sandbox
{
  "id": "move-zeroes",
  "fn": { "python": "move_zeroes", "javascript": "moveZeroes" },
  "check": "mutate",
  "starter": {
    "python": "def move_zeroes(nums):\n    # Modify nums in place. Return nothing.\n    pass\n",
    "javascript": "function moveZeroes(nums) {\n  // Modify nums in place. Return nothing.\n}\n"
  },
  "cases": [
    { "args": [[0,1,0,3,12]], "expect": [1,3,12,0,0] },
    { "args": [[0]], "expect": [0] },
    { "args": [[1,2,3]], "expect": [1,2,3] },
    { "args": [[0,0,0,1]], "expect": [1,0,0,0] },
    { "args": [[4,0,5,0,0,6]], "expect": [4,5,6,0,0,0] }
  ]
}
```

````reveal Hint 1 — reuse, then patch
Run the write-pointer template with keep = "is non-zero". Afterward,
nums[0..write) is the non-zeroes in order — and you know exactly how many
zeroes existed: n − write. Where must they go?
````

````reveal Hint 2 — or do it in one pass with swaps
Instead of compact-then-fill, *swap* nums[read] with nums[write] whenever
nums[read] is non-zero. Think about what sits between write and read at
all times — that's the three-region invariant: [0..write) non-zeroes,
[write..read) zeroes, [read..n) unexamined.
````

## Brute force, for contrast

Build a new array: non-zeroes first, then the zero count — O(n) time,
O(n) space. Correct; fails the space requirement. (There's also the
n² shuffle: on finding a zero, shift everything left and place the zero at
the end — the accidental-quadratic from the memory lesson.)

## The insight

> The compaction template already solves "non-zeroes, in order, at the
> front." The zeroes don't need to be *carried* — they're all identical,
> so they can be *reconstructed*: fill the tail with zeroes.

Watch pass 1 run on the example input — when it ends, everything past
`write` is junk waiting to be overwritten with zeroes:

```viz
{ "id": "write-pointer", "data": [0, 1, 0, 3, 12] }
```

## Solution

`````reveal Solution — two-pass compact-and-fill
````tabs
```python
def move_zeroes(nums: list[int]) -> None:
    write = 0
    for read in range(len(nums)):      # pass 1: compact non-zeroes
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):  # pass 2: fill tail with zeroes
        nums[i] = 0
```

```typescript
function moveZeroes(nums: number[]): void {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    // pass 1: compact non-zeroes
    if (nums[read] !== 0) {
      nums[write] = nums[read];
      write++;
    }
  }
  for (let i = write; i < nums.length; i++) nums[i] = 0; // pass 2: fill
}
```
````

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Two sequential passes (add, don't multiply). Writes: one per non-zero plus one per zero = exactly n — optimal for the follow-up's 'minimize writes' when zeroes are few."
}
```
`````

`````reveal Alternative — one-pass swap version
````tabs
```python
def move_zeroes_swap(nums: list[int]) -> None:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
```

```typescript
function moveZeroesSwap(nums: number[]): void {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
}
```
````

Why swapping preserves the zeroes automatically: the invariant is
*[0..write) non-zeroes in order; [write..read) all zeroes*. When
nums[read] is non-zero, the swap drops it at the boundary and relocates
one zero from the middle region to position read — both regions stay
correct with no fill pass. One pass, but note it can do *more* writes
than compact-and-fill when zeroes are rare (each swap is two writes).
`````

## Variants

- **Remove Element** (delete all occurrences of `val`): the pure template —
  keep = `x != val`, return write. No fill pass, tail is garbage.
- **Sort Colors / Dutch national flag:** three *values* (0/1/2) to
  arrange in place — needs a three-pointer generalization; you'll meet it
  in the Two Pointers module.

```quiz
{
  "question": "In the one-pass swap version, why is nums[read] guaranteed to swap with a ZERO (or itself), never losing a non-zero?",
  "options": [
    "Because swaps are commutative — exchanging any two positions produces the same result regardless of which one is labeled read and which is labeled write, so the values involved don't matter",
    "The invariant holds that [write..read) contains only zeroes; the swap target nums[write] is in that region (or write == read when it's empty)",
    "Because the array is scanned twice — a first pass identifies where all the zeroes currently sit, and the second pass only swaps read against a position already confirmed to hold one"
  ],
  "answer": 1,
  "explanation": "Every non-zero encountered was moved into [0..write) immediately, so anything left between write and read is zero. The swap therefore exchanges a non-zero with a zero — or with itself when the regions have no gap."
}
```
