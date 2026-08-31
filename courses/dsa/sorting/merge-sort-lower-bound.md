---
title: Merge Sort & the n log n Lower Bound
type: concept
---

## Divide, conquer, merge

Merge sort splits the array in half, recursively sorts each half, then
merges the two sorted halves — using exactly the merge step you already
built in Module 7's Merge Two Sorted Lists, applied to arrays instead
of linked lists. It's the same move as combining two sorted stacks of
paper on a desk: compare the top sheet of each stack, take the smaller
one, place it face-down on a new pile, and repeat — never needing to
look further into either stack than the sheet currently on top:

```diagram
{
  "id": "merge-tree"
}
```


````tabs
```python
def merge_sort(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:          # <= : take LEFT on ties (stability)
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])               # attach whichever side has leftovers
    result.extend(right[j:])               # correct because both sides were pre-sorted
    return result
```

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0,
    j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      // <= : take LEFT on ties (stability)
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  result.push(...left.slice(i), ...right.slice(j)); // attach the leftovers
  return result;
}
```
````

## The cost — you already proved this

Merge sort's recurrence is `T(n) = 2T(n/2) + O(n)` — the exact recursion
the Big O module analyzed with a level-by-level table: each of the
log n levels does O(n) total merge work, giving **O(n log n)** overall.
No new analysis needed here; recognize the shape and the answer follows
from work already done.

**Stability**, precisely: the `<=` in `merge` means that when
`left[i] == right[j]`, the LEFT element is taken first. Since `left`
holds elements that were originally earlier in the array, equal
elements never swap relative order — merge sort is stable, unlike
selection sort (which can shuffle equal elements arbitrarily during its
swaps) and unlike quicksort (next lesson). Trace it on two duplicate
values arriving from opposite sides — `left = [2ₐ, 4]`,
`right = [2ᵦ, 3]` (subscripts just for tracking, not part of the data):
`left[0]=2ₐ <= right[0]=2ᵦ` is true, so `2ₐ` is taken first; `left[1]=4`
compared against `right[0]=2ᵦ` next, `2ᵦ` is smaller and taken; then `3`,
then `4`. Result: `[2ₐ, 2ᵦ, 3, 4]` — `2ₐ` (originally on the left, i.e.
earlier in the array) stayed ahead of `2ᵦ`, exactly as stability
promises. Why the leftover-copying at the end doesn't break this: once
one side runs out, every remaining element on the other side is
provably ≥ everything already placed (both sides were sorted going in),
so copying them in their existing order is not just convenient, it's
the only correct choice.

```complexity
{
  "time": "O(n log n), all cases — no best/worst split",
  "space": "O(n) auxiliary, plus O(log n) recursion stack",
  "why": "Every level of the recursion does exactly O(n) merge work regardless of input order — merge sort has no 'lucky' input the way insertion sort does. The O(n) space is the merge step's temporary arrays, unavoidable in this formulation."
}
```

## Is O(n log n) actually as good as it gets? A real proof

Every comparison sort you'll meet — merge sort, quicksort, heapsort —
lands at O(n log n) in the typical or worst case. That's not a
coincidence to accept on faith; it's a theorem, and the proof is short
enough to walk through completely.

**The setup.** Model ANY comparison-based sorting algorithm as a binary
decision tree: each internal node is one comparison (`arr[i] < arr[j]`?
yes/no), and each leaf represents a final determined ordering. For the
algorithm to correctly sort every possible input, it must be able to
distinguish all n! possible orderings of n distinct elements — if two
different starting arrangements led the algorithm down the same path
to the same leaf, the algorithm couldn't tell them apart, and would
output the wrong order for at least one of them. So the tree needs **at
least n! leaves**.

**The bound.** A binary tree of height h has at most 2^h leaves (each
level at most doubles the leaf count). So:

> 2^h ≥ n!  ⟹  h ≥ log₂(n!)

**Bounding log₂(n!) without calculus.** Write out the product and keep
only the larger half of the factors:

> n! = n · (n−1) · (n−2) ⋯ 1 ≥ n · (n−1) ⋯ (n/2) ≥ (n/2)^(n/2)

(the last n/2 factors are each at least n/2). Taking log₂ of both
sides:

> log₂(n!) ≥ (n/2) · log₂(n/2) = **Ω(n log n)**

**The conclusion.** The decision tree's height — which equals the
WORST-CASE number of comparisons any correct comparison sort must make
— is Ω(n log n). Merge sort's O(n log n) isn't a limitation of one
algorithm; it's provably **optimal among all algorithms that sort by
comparing elements**. Nothing built purely from "is A < B?" questions
can do better in the worst case, ever.

```quiz
{
  "questions": [
    {
      "question": "In the decision-tree proof, why must the tree have at least n! leaves?",
      "options": [
        "Because binary trees always have that many leaves — any binary tree of a given height is guaranteed to have exactly n! leaves at that height, a general structural fact about binary trees rather than something specific to this proof",
        "Because n! is the number of comparisons needed — since the algorithm must perform one comparison per possible input ordering to sort correctly, the leaf count directly reflects the number of comparisons required",
        "There are n! distinct possible orderings of n elements, and the algorithm must produce a DIFFERENT output for each — if two different input orderings reached the same leaf, the algorithm couldn't distinguish them and would sort at least one incorrectly, so each ordering needs its own leaf"
      ],
      "answer": 2,
      "explanation": "This is the crux of the whole argument: correctness REQUIRES distinguishability, and distinguishability requires one leaf per possible input arrangement. Everything else in the proof is just counting how tall a binary tree with that many leaves must be."
    },
    {
      "question": "Why does merge sort's O(n log n) apply to EVERY input, while insertion sort's O(n²) only applies to the WORST input?",
      "options": [
        "Merge sort is simply a better-implemented algorithm — its code is written more carefully and with fewer inefficiencies than a typical insertion sort implementation, which is what accounts for the more consistent performance",
        "It doesn't — merge sort also has a best case; on nearly-sorted input the merge step can skip comparisons the same way insertion sort's inner loop does, giving merge sort a faster best case too",
        "Merge sort's work is determined entirely by its recursive STRUCTURE (splitting in half, merging) which doesn't depend on the input's existing order — every level always does O(n) merge work regardless of what's being merged. Insertion sort's work depends on how far out of place each element already is, which varies by input"
      ],
      "answer": 2,
      "explanation": "This is the same best/worst-case distinction from the Big O module, now illustrated by two algorithms with genuinely different SHAPES of cost: one that's input-sensitive (insertion sort) and one that's structurally fixed (merge sort)."
    },
    {
      "question": "The proof concludes that NO comparison sort can beat O(n log n) in the worst case. Does this mean n log n is a hard limit on sorting, period?",
      "options": [
        "Yes, no algorithm can ever sort faster than n log n — the decision-tree argument is a statement about sorting itself, not about any particular technique, so it rules out every possible algorithm regardless of how it's implemented",
        "No — the proof only bounds algorithms that sort by COMPARING elements pairwise. Algorithms that exploit other structure (like the actual values being small integers) can sort in O(n), sidestepping the comparison-based lower bound entirely",
        "The proof is only a heuristic, not a guarantee — the decision-tree argument gives strong empirical support for the n log n bound but leaves open the possibility that a cleverly designed comparison sort could beat it on real hardware"
      ],
      "answer": 1,
      "explanation": "The proof's power comes from being airtight WITHIN its assumption (comparisons only) — and its limit comes from that same assumption. The next lesson's linear-time sorts don't violate this theorem; they simply don't play by its rules, which is exactly why they can beat it."
    }
  ]
}
```
