---
title: Merge Sort & the n log n Lower Bound
type: concept
---

## Divide, conquer, merge

Merge sort splits the array in half, recursively sorts each half, then
merges the two sorted halves — using exactly the merge step you already
built in Module 7's Merge Two Sorted Lists, applied to arrays instead
of linked lists:

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
    result.extend(right[j:])
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
swaps) and unlike quicksort (next lesson).

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
        "Because n! is the number of comparisons needed",
        "There are n! distinct possible orderings of n elements, and the algorithm must produce a DIFFERENT output for each — if two different input orderings reached the same leaf, the algorithm couldn't distinguish them and would sort at least one incorrectly, so each ordering needs its own leaf",
        "Because binary trees always have that many leaves"
      ],
      "answer": 1,
      "explanation": "This is the crux of the whole argument: correctness REQUIRES distinguishability, and distinguishability requires one leaf per possible input arrangement. Everything else in the proof is just counting how tall a binary tree with that many leaves must be."
    },
    {
      "question": "Why does merge sort's O(n log n) apply to EVERY input, while insertion sort's O(n²) only applies to the WORST input?",
      "options": [
        "Merge sort is simply a better-implemented algorithm",
        "Merge sort's work is determined entirely by its recursive STRUCTURE (splitting in half, merging) which doesn't depend on the input's existing order — every level always does O(n) merge work regardless of what's being merged. Insertion sort's work depends on how far out of place each element already is, which varies by input",
        "It doesn't — merge sort also has a best case"
      ],
      "answer": 1,
      "explanation": "This is the same best/worst-case distinction from the Big O module, now illustrated by two algorithms with genuinely different SHAPES of cost: one that's input-sensitive (insertion sort) and one that's structurally fixed (merge sort)."
    },
    {
      "question": "The proof concludes that NO comparison sort can beat O(n log n) in the worst case. Does this mean n log n is a hard limit on sorting, period?",
      "options": [
        "Yes, no algorithm can ever sort faster than n log n",
        "No — the proof only bounds algorithms that sort by COMPARING elements pairwise. Algorithms that exploit other structure (like the actual values being small integers) can sort in O(n), sidestepping the comparison-based lower bound entirely",
        "The proof is only a heuristic, not a guarantee"
      ],
      "answer": 1,
      "explanation": "The proof's power comes from being airtight WITHIN its assumption (comparisons only) — and its limit comes from that same assumption. The next lesson's linear-time sorts don't violate this theorem; they simply don't play by its rules, which is exactly why they can beat it."
    }
  ]
}
```
