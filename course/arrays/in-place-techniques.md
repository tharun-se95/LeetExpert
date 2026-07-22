---
title: In-Place Techniques
type: concept
---

## What "in place" buys and costs

An **in-place** algorithm rearranges the input using O(1) auxiliary space —
no second array. You'd work in place because memory is constrained, because
copying n elements is real cost, or because a problem demands it. The
price: in-place code is *stateful* — the array is partially transformed
while you work, so you must know, at every moment, which region means what.

That discipline has a name: **loop invariants**. Every in-place technique
below is "pick an invariant about the array's regions; make every step
preserve it." This is the single most transferable idea in this lesson —
two pointers, sliding window, binary search, and quicksort's partition are
all region-invariant algorithms.

## Technique 1: swap

The atom of in-place work — exchange two slots through a temporary:

````tabs
```python
nums[i], nums[j] = nums[j], nums[i]   # tuple pack/unpack
```

```typescript
[nums[i], nums[j]] = [nums[j], nums[i]]; // destructuring swap
```
````

## Technique 2: reverse by converging pointers

Invariant: *everything outside [left, right] is already in final position.*
Each step swaps the ends and shrinks the region:

````tabs
```python
def reverse_range(nums: list[int], left: int, right: int) -> None:
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1
```

```typescript
function reverseRange(nums: number[], left: number, right: number): void {
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}
```
````

n/2 swaps, no allocation: O(n) time, O(1) space. Taking a `(left, right)`
range instead of a whole array is deliberate — the Rotate Array problem
composes three range-reversals into something surprising.

## Technique 3: the write pointer (stable compaction)

The workhorse. Task: keep some elements ("keepers"), drop the rest,
preserve order, O(1) space. Two indexes over the *same* array:

- **read** scans every element, left to right;
- **write** marks the boundary of the finished prefix.

> **Invariant: `nums[0 .. write)` holds exactly the keepers seen so far,
> in order.**

````tabs
```python
def keep_if(nums: list[int], keep) -> int:
    write = 0
    for read in range(len(nums)):
        if keep(nums[read]):
            nums[write] = nums[read]
            write += 1
    return write          # keepers occupy nums[0:write]
```

```typescript
function keepIf(nums: number[], keep: (x: number) => boolean): number {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (keep(nums[read])) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write; // keepers occupy nums[0..write)
}
```
````

Why it's safe to overwrite: `write ≤ read` always (write only advances on
a keeper, read advances every step), so the slot being written has already
been read. Step through the template below — the tinted regions *are* the
invariant. The two problems after next — Remove Duplicates and Move
Zeroes — are this template with different `keep` conditions, which is why
they're your first solve-first exercises.

```viz
{ "id": "write-pointer", "data": [0, 1, 0, 3, 12] }
```

## Technique 4: cyclic placement (a preview)

Some rearrangements are permutations with known destinations: "element at
i belongs at (i + k) mod n." Chasing each displacement cycle — hold a
value, drop it at its destination, pick up what was there, continue —
achieves O(n) time with O(1) space. It's subtle (you must detect when a
cycle closes); Rotate Array offers it as the expert variant, and
"index-as-destination" returns in cycle sort and several hard problems.

```quiz
{
  "questions": [
    {
      "question": "In the write-pointer template, why is `nums[write] = nums[read]` never destroying data we still need?",
      "options": [
        "Because write ≤ read at all times — the target slot's original value was already read on an earlier iteration",
        "Because keepers are always to the left of non-keepers initially — the input's original arrangement already satisfies the invariant before the loop starts, so overwriting is safe by construction",
        "Because the array is copied first — the function reads from a hidden snapshot of the original array while writing into the live one, so nothing in the live array is ever needed again"
      ],
      "answer": 0,
      "explanation": "write advances at most as fast as read, so the write target is always in already-scanned territory. This ordering argument is the template's entire safety proof."
    },
    {
      "question": "After running keep_if, what do nums[write..n) contain?",
      "options": [
        "Leftover garbage — a mix of old values the algorithm never cleaned up",
        "The dropped elements, in order — the algorithm shifts non-keepers to the tail as a side effect of how the write pointer advances, preserving their relative order back there",
        "Zeroes — the write pointer's advance logic explicitly clears each slot it passes over before moving on, so anything past write is reset to a default empty value"
      ],
      "answer": 0,
      "explanation": "The invariant only governs [0, write). The tail is whatever history left behind — which is why these functions return the new logical length, exactly like the dynamic array's length-vs-capacity split."
    },
    {
      "question": "Reversing an array with converging pointers — what is the invariant that makes it correct?",
      "options": [
        "Elements inside [left, right] are sorted — each swap places the smaller of the two compared elements closer to the front, gradually sorting the unfinished region as a side effect",
        "Elements outside [left, right] are already in their final reversed positions",
        "left always equals n − right — the two pointers move in lockstep from opposite ends by the same amount each step, so their positions stay related by this fixed arithmetic identity"
      ],
      "answer": 1,
      "explanation": "Each swap fixes two more elements permanently and shrinks the unfinished region. When left ≥ right the unfinished region is empty — done. Stating the invariant IS the correctness proof."
    }
  ]
}
```
