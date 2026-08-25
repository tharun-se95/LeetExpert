---
title: The O(n²) Baseline Sorts
type: concept
---

## Why start with the "slow" sorts

Every language ships a fast built-in sort — you will rarely hand-write
one in production. This module teaches sorting anyway, in depth,
because sorting is where several of this course's biggest ideas get
their real proofs: the n log n lower bound, the average/worst-case
split, and the partition step you already half-built in Module 10. The
O(n²) sorts are the right place to start because their invariants are
simple enough to state completely — and one of them, insertion sort, is
genuinely the right tool in specific real situations, not just a
teaching exercise.

## Selection sort: pick the minimum, repeatedly

Invariant: after i passes, the first i positions hold the i smallest
elements, in sorted order, and the rest is untouched. Each pass scans
the unsorted remainder for its minimum and swaps it into place:

````tabs
```python
def selection_sort(arr: list[int]) -> None:
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):          # scan the unsorted remainder
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]   # one swap per pass
```

```typescript
function selectionSort(arr: number[]): void {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      // scan the unsorted remainder
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; // one swap per pass
  }
}
```
````

Cost: pass i scans n − i elements, so total comparisons are
(n−1)+(n−2)+⋯+1 — the triangular sum from the Big O module,
**O(n²)** regardless of input order (even an already-sorted array gets
scanned fully every pass). The one genuine advantage: **exactly n
swaps, total** — the outer loop runs n times and each pass performs
precisely one swap (`arr[i]` with `arr[min_idx]`), so write count is
pinned at n regardless of how scrambled the input is. Contrast that
with insertion sort's worst case below, where a single pass can trigger
many shifts — selection sort's fixed write count is why it wins when
writes are far more expensive than comparisons (e.g. flash memory, or
sorting large records by a small key).

Think of it like scanning a disorganized bookshelf for the single
shortest book, pulling it out, and placing it at the far left — one
placement per full scan, no matter how disordered the rest of the
shelf is.

## Insertion sort: grow a sorted prefix

Invariant: `arr[0..i)` is sorted (not necessarily in final position —
just sorted relative to itself) at the start of pass i. Each pass takes
the next element and shifts it backward through the sorted prefix until
it finds its place — precisely the "insert into a sorted structure"
operation:

```diagram
{
  "id": "sorted-prefix",
  "values": [1, 3, 4, 2, 5, 9],
  "sortedCount": 3,
  "activeIndex": 3,
  "caption": "insertion sort: sorted prefix · insert active into place"
}
```

````tabs
```python
def insertion_sort(arr: list[int]) -> None:
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:      # shift larger elements right
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key                    # key's final resting place
```

```typescript
function insertionSort(arr: number[]): void {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      // shift larger elements right
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key; // key's final resting place
  }
}
```
````

Worst case (reverse-sorted input): each insertion shifts all the way
back — the same triangular sum, **O(n²)**. Trace it on `[5, 4, 3, 2, 1]`:
inserting `4` shifts once (`[4,5,3,2,1]`), inserting `3` shifts twice
(`[3,4,5,2,1]`), inserting `2` shifts three times, inserting `1` shifts
four times — `1+2+3+4 = 10` shifts total, the triangular sum for n = 5.
But watch the **best case**: on an already-sorted array, the inner while
loop's condition fails immediately every time — **O(n)**, one
comparison per element. This gap between best and worst case (Big O's
case-discipline lesson, now with a concrete example) is the whole
reason insertion sort survives in practice: real-world "sort this"
calls are disproportionately "sort this, which is already almost
sorted" (a new log entry appended to a sorted log, one out-of-place
card in a hand).

Make that "almost sorted" precise: define an **inversion** as a pair of
indices `(i, j)` with `i < j` but `arr[i] > arr[j]` — one pair that's
out of order relative to each other. Every shift in insertion sort's
inner loop resolves exactly one inversion (it moves one out-of-order
pair into order and touches nothing else). So the total work is
`O(n + I)`, where `I` is the array's inversion count — n for the outer
pass, plus one unit of work per inversion actually present. A
reverse-sorted array has the maximum possible `I = n(n-1)/2` (every
pair is inverted), recovering the O(n²) worst case; a nearly-sorted
array has `I` close to 0, recovering the near-O(n) best case. Insertion
sort's cost is proportional to how far each element is from its final
position, not to n outright.

Think of it like sorting a hand of playing cards as you're dealt them:
you hold a sorted fan in one hand, and each new card slides in only as
far as it needs to — a card that's already roughly in place barely
moves, one wildly out of order slides past several others.

## Where the baseline sorts actually win

- **Insertion sort on nearly-sorted or small (n < ~20) arrays** — the
  constant factors are tiny, and real sorting libraries (Timsort,
  introsort) switch to insertion sort for small subarrays INSIDE a
  bigger divide-and-conquer sort, for exactly this reason.
- **Insertion sort is online** — it can sort a stream as elements
  arrive, one insertion at a time, without seeing the whole input
  upfront. Selection and the O(n log n) sorts in the next lessons
  cannot.
- **Both are in-place, O(1) auxiliary space** — no allocation, unlike
  merge sort (next lesson).
- **Both are simple to prove correct** — worth internalizing their
  invariants precisely, since every faster sort in this module is a
  variation on "maintain a sorted region and grow it," just with a
  cleverer growth rule.

```complexity
{
  "operations": [
    { "name": "selection sort, any input", "time": "O(n²) comparisons, O(n) swaps", "why": "always scans the full unsorted remainder each pass, regardless of order — but swaps only once per pass" },
    { "name": "insertion sort, worst case", "time": "O(n²)", "why": "reverse-sorted input: every insertion shifts back through the entire sorted prefix" },
    { "name": "insertion sort, best case", "time": "O(n)", "why": "already-sorted input: every inner-loop check fails immediately, no shifting" },
    { "name": "space, both", "time": "O(1)", "why": "in-place — only a few scalar variables beyond the array itself" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Why does selection sort cost O(n²) even when the input is already sorted, while insertion sort drops to O(n) on the same input?",
      "options": [
        "Insertion sort uses a different comparison operator — swapping strict inequality for a non-strict one changes how many shifts occur on already-ordered data, which is the actual source of the speed difference",
        "Selection sort has a bug that insertion sort doesn't — an off-by-one in how the minimum is tracked across passes causes selection sort to occasionally redo work it should be able to skip on sorted input",
        "Selection sort's inner loop unconditionally SCANS the entire unsorted remainder every pass to find the minimum, regardless of whether it's already in order — insertion sort's inner loop CHECKS a condition (arr[j] > key) that fails immediately on sorted input, skipping the shift entirely"
      ],
      "answer": 2,
      "explanation": "The structural difference is search vs. check: selection sort must always search for the minimum (no shortcut even if it's already in place), while insertion sort's work is proportional to how far an element actually needs to move — zero distance on sorted input means zero work."
    },
    {
      "question": "Why do production sorting libraries often switch to insertion sort for small subarrays, even though they use a faster O(n log n) algorithm overall?",
      "options": [
        "Insertion sort is required for correctness on small inputs — the faster O(n log n) algorithms have edge-case bugs that only manifest below a certain array size, so insertion sort is a necessary correctness patch, not a performance choice",
        "Insertion sort has very low constant-factor overhead — no recursion, no extra allocation — which makes it faster than asymptotically-superior algorithms specifically when n is small enough that the O(n log n) vs O(n²) gap hasn't yet outweighed the constants",
        "It's a historical artifact with no real benefit today — modern hardware has made the constant-factor differences between algorithms negligible, so this switch persists mostly out of inertia rather than measurable gain"
      ],
      "answer": 1,
      "explanation": "Big O describes GROWTH, not actual speed at any fixed n — for small n, a simple O(n²) algorithm with tiny constants can beat a complex O(n log n) algorithm with recursion/allocation overhead. This is why real sorts are hybrids, not pure implementations of one algorithm."
    }
  ]
}
```
