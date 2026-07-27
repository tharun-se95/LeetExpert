---
title: In-Place Techniques
type: concept
---

## What is an in-place technique?

An **in-place algorithm** rearranges data directly inside the original
structure, using O(1) auxiliary space.

No second array. No temporary buffer. You overwrite and swap the elements
where they already sit.

### Why you'd want that

- **Memory.** You reuse the memory you were given instead of asking for n
  more slots.
- **Time.** Copying n elements is real work, not free bookkeeping.
- **The problem demands it.** Plenty of interview and library problems
  specify O(1) extra space outright.

### What it costs you

In-place code is **stateful**. Halfway through execution, part of the
array is transformed and part is untouched — and the two live in the same
memory.

That is the whole difficulty. If you allocate a second array, "input" and
"output" are separate things you can reason about separately. In place,
they are the same array, and you have to know at every instant which
region means what.

There is a tool for that.

## What is a loop invariant?

A **loop invariant** is a condition that is true before and after every
iteration of a loop.

It is not a line of code. It is a claim you make about the array — usually
a claim about what each *region* of the array contains right now.

```diagram
{ "id": "invariant-regions", "size": 8, "first": 3, "second": 5 }
```

The pointers are not really counters. They are the *boundaries* between
regions, and each region means something specific.

Because in-place algorithms constantly mutate the input, invariants are
how you prove one is correct. The invariant defines the meaning of each
region, and the proof shows every step preserves that meaning.

### The three steps

An invariant becomes a proof when you check three things:

1. **Initialization** — the invariant is true before the loop's first
   iteration.
2. **Maintenance** — if the invariant is true before an iteration, it is
   still true after it.
3. **Termination** — when the loop exits, the invariant tells you
   something useful, and that something is what you set out to prove.

```diagram
{ "id": "invariant-phases", "size": 8, "midFirst": 3, "midSecond": 5, "endFirst": 5 }
```

Initialization and maintenance together give you "true at every
iteration," by induction. Termination is what converts that into a result
you actually wanted.

Notice the invariant itself never changes across those three rows. What
changes is how much of the array has been brought under it.

**This is the most transferable idea in the lesson.** Every technique
below is the same move: pick an invariant about the array's regions, then
make every step preserve it. Two pointers, sliding window, binary search,
and quicksort's partition are all region-invariant algorithms. Learn the
framework once here and you get those for free later.

## Technique 1: swapping

The atom of in-place work. Exchange two slots:

````tabs
```python
nums[i], nums[j] = nums[j], nums[i]   # tuple pack/unpack
```

```typescript
[nums[i], nums[j]] = [nums[j], nums[i]]; // destructuring swap
```
````

Both languages give you this without naming a temporary. Under the hood
there is still a temporary — the tuple on the right is built before
either assignment happens, which is exactly why the swap doesn't clobber
itself.

## Technique 2: converging pointers

**The shape:** two pointers start at opposite ends and move toward each
other, doing work as they meet.

Reversing an array is the clean case:

> **Invariant: everything outside `[left, right]` is already in its final
> reversed position.**

```diagram
{ "id": "reverse-converging", "data": [1, 2, 3, 4, 5, 6] }
```

The accent region grows inward from *both* ends at once, and the
unfinished middle shrinks by two every row.

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

Run the three steps on it:

- **Initialization.** Before the loop, `left` and `right` are the two
  ends, so the region outside them is empty. An empty region is trivially
  correct.
- **Maintenance.** One swap puts the element at `left` where it belongs
  (the far end) and vice versa. Both are now final. Moving the pointers
  inward grows the outside region by exactly those two elements, so the
  invariant still holds.
- **Termination.** The loop ends when `left ≥ right`, meaning the inside
  region is empty or a single middle element. Nothing is unfinished, so
  everything is in final position. The array is reversed.

O(n) time, n/2 swaps, O(1) space.

Taking a `(left, right)` range rather than the whole array is deliberate.
The Rotate Array problem composes three range-reversals into something
that looks like a trick until you see it.

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
element at i belongs at (i + k) mod n."

You can chase each displacement cycle — hold a value, drop it at its
destination, pick up whatever was there, continue — for O(n) time and
O(1) space. It's subtle, because you have to detect when a cycle closes
and where the next one starts.

```diagram
{ "id": "cyclic-placement", "n": 6, "k": 2 }
```

That is the trap, drawn. With n = 6 and k = 2 the arrows do *not* form one
big loop — they form two disjoint cycles. Following displacements from
index 0 returns you to 0 having moved only half the array. So the
algorithm has to notice the cycle closed, jump to an index it hasn't
touched, and go again.

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
    },
    {
      "question": "Which of the three loop-invariant steps is the one that actually delivers the result you wanted?",
      "options": [
        "Termination — initialization and maintenance only prove the invariant holds throughout; termination is where you read off the useful conclusion",
        "Maintenance — it runs on every iteration, so it does the bulk of the work and is therefore where the algorithm's guarantee is established",
        "Initialization — setting the invariant up correctly at the start determines the outcome, since everything afterward simply follows from those initial pointer values"
      ],
      "answer": 0,
      "explanation": "Initialization plus maintenance give you 'the invariant is always true' by induction. That alone isn't a result. Termination combines it with the loop's exit condition — read has passed everything, or left ≥ right — to produce the conclusion you were after."
    }
  ]
}
```
