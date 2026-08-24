---
title: Stable Compaction & Cyclic Placement
type: concept
---

The previous lesson's converging pointers move toward each other and
meet in the middle — a symmetric shape. These two techniques break that
symmetry: the pointers move at different speeds, or the destinations
aren't neighbors at all. Same discipline — pick an invariant, prove it
in three steps — applied to a less obvious shape.

## Technique 3: read/write pointers (stable compaction)

The workhorse. **Task:** keep some elements, drop the rest, preserve
relative order, O(1) space.

Two indexes walk the *same* array:

- **read** scans every element, left to right.
- **write** marks the boundary of the finished prefix.

> **Invariant: `nums[0 .. write)` holds exactly the keepers seen so far,
> in their original relative order.**

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

The three steps:

- **Initialization.** `write = 0`, so `nums[0 .. 0)` is the empty range.
  Zero keepers seen, zero keepers stored. True.
- **Maintenance.** `read` advances every iteration; `write` advances only
  when a keeper is placed. So `write ≤ read` always holds. That is the
  safety argument: the slot you overwrite has already been read on this
  or an earlier iteration, so you can never destroy data you still need.
  A keeper appends to the prefix and grows it by one; a non-keeper leaves
  the prefix alone. Either way the invariant survives.
- **Termination.** `read` has passed every element, so "keepers seen so
  far" means all of them. The invariant now reads: `nums[0 .. write)`
  holds every keeper, in order. `write` is the new logical length.

Note what the invariant does *not* promise. It says nothing about
`nums[write .. n)`. That region is leftover history, which is precisely
why the function returns a length instead of pretending the array shrank.

Step through the template below — the tinted regions *are* the invariant:

```viz
{ "id": "write-pointer", "data": [0, 1, 0, 3, 12] }
```

The next two problems, Remove Duplicates and Move Zeroes, are this exact
template with different `keep` conditions. That's why they're your first
solve-first exercises.

## Technique 4: cyclic placement (a preview)

Some rearrangements are permutations with known destinations: "the
element at i belongs at (i + k) mod n." Read/write pointers don't apply
here — there's no single prefix growing left to right, because every
element's destination can be anywhere.

You can chase each displacement cycle instead — hold a value, drop it at
its destination, pick up whatever was there, continue — for O(n) time and
O(1) space. It's subtle, because you have to detect when a cycle closes
and where the next one starts.

```diagram
{ "id": "cyclic-placement", "n": 6, "k": 2 }
```

That is the trap, drawn. With n = 6 and k = 2 the arrows do *not* form one
big loop — they form two disjoint cycles. Following displacements from
index 0 returns you to 0 having moved only half the array.

In general, shifting n elements by k splits them into exactly gcd(n, k)
disjoint cycles, each of length n / gcd(n, k) — here gcd(6, 2) = 2, so two
cycles of length 3. Change the shift and the shape changes with it:
n = 5, k = 2 gives gcd(5, 2) = 1, a single cycle that touches all 5
elements before closing. So the algorithm can't assume one pass through
the array finishes the job — it has to notice when a cycle closes, jump to
an index it hasn't touched, and go again.

Rotate Array offers it as the expert variant, and "index as destination"
comes back in cycle sort and several hard problems.

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
    }
  ]
}
```
