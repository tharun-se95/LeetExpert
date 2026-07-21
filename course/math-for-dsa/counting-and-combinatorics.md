---
title: Counting & Combinatorics
type: concept
---

## Why counting is a DSA skill

Combinatorics answers "how big is the answer space?" — and that number *is*
the complexity of any algorithm that enumerates the space. When the
Backtracking module generates all subsets, its 2ⁿ cost isn't an analysis
result so much as a counting fact. Learn to count the space first; the
complexity of brute force follows for free.

## The product rule

Independent choices multiply: 3 shirts × 4 pants = 12 outfits. Every other
formula in this lesson is the product rule applied with care.

**Sequences with repetition:** k independent slots, m options each →
mᵏ. (4-digit PINs: 10⁴.)

**Subsets: 2ⁿ.** Each of n elements makes an independent in/out choice —
n twos multiply. This is why "try every subset" is O(2ⁿ) *before you write
a line of code*, and why bitmasks (n-bit numbers = subsets of n things)
range over exactly 2ⁿ values.

## Permutations: order matters

Arrangements of n distinct items: first slot has n choices, next n−1, … →
**n!** Arrangements of just k of the n items: n · (n−1) ⋯ (n−k+1) =
**n!/(n−k)!** (denoted P(n, k)).

Factorials explode faster than exponentials: 10! ≈ 3.6 million (fine),
13! ≈ 6 × 10⁹ (seconds), 20! ≈ 2.4 × 10¹⁸ (never). A permutation
brute-force is viable only to n ≈ 10–11 — read that off constraints
instantly.

## Combinations: order doesn't matter

Choosing k of n *without* caring about order: take P(n, k) ordered
selections, notice each unordered choice was counted k! times (once per
internal ordering), divide it out:

> **C(n, k) = n! / (k!(n−k)!)**

The "divide out the overcount" move is the second great counting technique,
and it's also how you'll de-duplicate in backtracking problems.

Computing C(n, k) in code: never via factorials (overflow/precision — 21!
already exceeds 2⁶³ and JS loses exactness far earlier). Multiply and
divide incrementally:

````tabs
```python
def choose(n: int, k: int) -> int:
    k = min(k, n - k)
    result = 1
    for i in range(1, k + 1):
        result = result * (n - k + i) // i   # exact: C(n-k+i, i) is an integer
    return result
```

```typescript
function choose(n: number, k: number): number {
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i; // exact at each step
  }
  return result;
}
```
````

```complexity
{
  "time": "O(k)",
  "space": "O(1)",
  "why": "One multiply-divide per step; each intermediate value is itself a binomial coefficient C(n−k+i, i), so every division is exact — no fractions, no factorial-sized intermediates."
}
```

Worth confirming that "exact" claim rather than taking it on faith. After
step i, `result` holds C(n−k+i, i) — check it for i=1: the loop computes
n−k+1 (choosing 1 item from n−k+1 options, C(n−k+1, 1) = n−k+1, matches).
The step from i−1 to i multiplies by (n−k+i) and divides by i, i.e. it
computes C(n−k+i−1, i−1) · (n−k+i) / i. That's exactly the standard ratio
between consecutive binomial coefficients — C(m, i) = C(m−1, i−1) · m / i
for m = n−k+i — and the LEFT side, C(m, i), is a binomial coefficient,
which by definition counts a number of subsets and is therefore always a
whole number. So the division has to come out even: you're computing a
value that's already known to be an integer, one multiply-divide at a
time, never touching a numerator or denominator anywhere near
factorial-sized.

C(n, k) also satisfies **Pascal's identity**: C(n, k) = C(n−1, k−1) +
C(n−1, k) — "either element n is chosen (pick k−1 from the rest) or it
isn't (pick k from the rest)." That case-split on the last element is
*exactly* the decomposition dynamic programming will run on; you're meeting
DP's core move a stage early.

## Reading answer-space sizes off a problem

| The problem asks for… | Space size | Brute force viable to… |
| --- | --- | --- |
| all subsets | 2ⁿ | n ≈ 20–25 |
| all permutations | n! | n ≈ 10–11 |
| all pairs | C(n,2) ≈ n²/2 | n ≈ 10⁴ |
| all k-subsets | C(n,k) | depends — C(30,15) ≈ 155M |

```quiz
{
  "questions": [
    {
      "question": "How many distinct pairs (unordered, no repeats) can be formed from n items — and what does that say about all-pairs brute force?",
      "options": [
        "n² pairs, so O(n²)",
        "C(n,2) = n(n−1)/2 pairs — the same triangular count as the nested dependent loop, O(n²) with a ½ constant",
        "2ⁿ pairs"
      ],
      "answer": 1,
      "explanation": "Choosing 2 of n unordered is C(n,2) = n(n−1)/2. That's literally the iteration count of `for i, for j > i` — counting and loop analysis are the same computation."
    },
    {
      "question": "A problem has n ≤ 16 and asks about 'every possible selection of elements'. What's the intended approach signal?",
      "options": [
        "n! permutation search",
        "2ⁿ subset enumeration (≈ 65,536 subsets — trivial), likely via bitmask or backtracking",
        "An O(n log n) greedy"
      ],
      "answer": 1,
      "explanation": "'Selections' = subsets = 2ⁿ. At n = 16 that's 65,536 — tiny. Constraints of 16–25 practically announce subset enumeration."
    },
    {
      "question": "Why compute C(n, k) with incremental multiply-divide instead of n!/(k!(n−k)!)?",
      "options": [
        "It's asymptotically faster",
        "Factorials overflow fixed-width integers and lose float precision long before C(n,k) itself is large; incremental division keeps every intermediate exact and small",
        "Factorials are O(n²) to compute"
      ],
      "answer": 1,
      "explanation": "C(50, 3) = 19,600 — tiny — but 50! has 65 digits. The formula's intermediates are the problem, not the answer. Multiply-divide stepwise keeps intermediates at binomial size."
    }
  ]
}
```
