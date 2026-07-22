---
title: The Common Complexity Classes
type: concept
---

## The ladder

Nearly every algorithm you'll meet lives in one of seven classes. Use the
explorer above to see how brutally they separate as n grows — then meet each
class with the *reason* it shows up.

| Class | Name | Shows up when… |
| --- | --- | --- |
| O(1) | constant | work doesn't depend on input size |
| O(log n) | logarithmic | each step discards a constant fraction of the input |
| O(n) | linear | you touch each element a bounded number of times |
| O(n log n) | linearithmic | you do log-work per element, or split-and-merge |
| O(n²) | quadratic | you compare every pair |
| O(2ⁿ) | exponential | every element makes an independent include/exclude choice |
| O(n!) | factorial | you enumerate orderings |

## O(1) — constant

The work is the same whether n is ten or ten billion: array indexing,
pushing onto a stack, a hash insert (on average — the Hash Tables module
earns that claim properly).

Constant does **not** mean fast. An operation that always takes 3 seconds is
O(1). It means *flat* — the curve doesn't rise.

## O(log n) — why "halving" means log

Binary search checks the middle of a sorted array and discards half. How
many halvings until one element remains? That's asking: how many times can
you divide n by 2? By definition, that number is **log₂ n** — the logarithm
isn't a convention here, it's literally the answer to the question.

The consequence is absurd scaling: log₂(1,000,000) ≈ 20,
log₂(1,000,000,000,000) ≈ 40. A trillion-element search costs 40 probes.
Doubling the input adds *one* step. (Base doesn't matter inside O:
log₂ n = log₁₀ n / log₁₀ 2, a constant factor, which O absorbs.)

## O(n) — linear

One bounded pass: summing an array, finding a max, the `seen`-set scan from
lesson 1. This is the floor for any problem where you *must* look at every
element — you can't correctly find the max of n numbers while skipping some.

## O(n log n) — the sorting class

Two common origins:

- **log-work per element** — inserting n items into a heap, each insert
  O(log n);
- **divide, solve, merge** — merge sort splits in half (log n levels) and
  merges each level in O(n), giving n · log n.

Good comparison sorts live here, and — as the Sorting module proves — no
comparison sort can do better. In practice n log n is barely worse than
linear: log₂ n is ~30 for a billion elements.

## O(n²) — quadratic

The every-pair signature: nested loops over the same input, bubble sort,
`has_pair_a` from lesson 1. Roughly n²/2 pair-checks — and O drops the ½.
Quadratic is fine below n ≈ 10⁴ and a cliff past n ≈ 10⁵. A huge amount of
this course — hash tables, two pointers, sliding window, sorting-then-scanning —
is machinery for turning O(n²) into O(n) or O(n log n).

## O(2ⁿ) and O(n!) — combinatorial explosion

2ⁿ: each of n elements independently in or out — all subsets. n!: all
orderings — permutations, brute-force traveling salesman. These aren't
"slow algorithms," they're *enumerations of exponentially large answer
spaces*. At n = 50, 2ⁿ ≈ 10¹⁵ steps is ~4 months of compute; n = 20 gives
n! ≈ 2.4 × 10¹⁸. When you meet these in Backtracking and DP, the whole game
is shrinking the space (pruning) or never re-solving the same piece of it
(memoization).

## Reading constraints like a table of contents

Problem constraints tell you which class can pass. With a ~10⁸ ops/sec
budget and a few seconds of allowance:

| n up to… | You need | Typical machinery |
| --- | --- | --- |
| 10–20 | O(2ⁿ) or O(n!) is fine | brute force, backtracking |
| ~10³ | O(n²) | nested loops |
| ~10⁵–10⁶ | O(n log n) or O(n) | sort, heap, hash, window |
| ~10⁹+ | O(log n) or O(1) | binary search, math |

This works in both directions: n ≤ 20 in a problem statement is practically
an announcement that an exponential search is intended.

```quiz
{
  "questions": [
    {
      "question": "An algorithm's cost doubles when n doubles. Which class?",
      "options": [
        "O(log n)",
        "O(n)",
        "O(n²)"
      ],
      "answer": 1,
      "explanation": "Linear growth scales proportionally: 2× input → 2× work. O(n²) would 4×, and O(log n) would add a single step."
    },
    {
      "question": "Why is binary search O(log n) and not O(n)?",
      "options": [
        "Each comparison discards half the remaining candidates, so ~log₂ n comparisons reach a single element",
        "It checks elements faster than a scan does — each individual comparison in binary search executes in fewer CPU cycles than the per-element check inside a linear scan",
        "Sorted arrays are faster to read from memory — sorted data has better cache locality than unsorted data, which is what actually accounts for binary search's speed advantage"
      ],
      "answer": 0,
      "explanation": "The speed comes from *discarding*, not from faster per-element work: n → n/2 → n/4 → … → 1 takes log₂ n halvings by the definition of the logarithm."
    },
    {
      "question": "A problem says n ≤ 100,000. Which solution class is the intended target?",
      "options": [
        "O(n log n) or O(n) — about 10⁶–10⁷ operations",
        "O(n²) — 10¹⁰ operations, which a modern judge's few-second time limit can comfortably absorb since 10¹⁰ simple operations complete in well under a second on typical hardware",
        "O(2ⁿ) — since 100,000 is a large-looking number, the intended solution should be the most powerful brute-force tool available, enumerating every subset of the input"
      ],
      "answer": 0,
      "explanation": "At n = 10⁵, n² = 10¹⁰ operations — minutes, not seconds. n log n ≈ 1.7 × 10⁶ passes easily. Constraints are a statement of the expected class."
    }
  ]
}
```
