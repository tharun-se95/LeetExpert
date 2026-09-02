---
title: Counting & Combinatorics
type: concept
---

## The custom gift basket

The Archive's gift shop lets visitors build a custom basket: pick one
wrapping style, one ribbon color, one small token to tuck inside. This
question — "how many different baskets are even possible?" — turns out
to answer something much bigger than gift shop inventory. Combinatorics
answers "how big is the answer space?" — and that number *is* the
complexity of any algorithm that enumerates the space. When the
Backtracking module generates all subsets, its 2ⁿ cost isn't an analysis
result so much as a counting fact. Learn to count the space first; the
complexity of brute force follows for free.

## The product rule

Independent choices multiply: 2 wrapping styles × 4 ribbon colors × 3
tokens = 24 possible baskets. Every other formula in this lesson is the
product rule applied with care.

**Sequences with repetition:** k independent slots, m options each →
mᵏ. (4-digit PINs: 10⁴.)

**Subsets: 2ⁿ.** Instead of a fixed basket, imagine the Archivist laying
out every item in the gift shop and deciding, one at a time, "in the
basket" or "out of the basket." Each of n items makes an independent
in/out choice — n twos multiply. This is why "try every subset" is O(2ⁿ)
*before you write a line of code*, and why bitmasks (n-bit numbers =
subsets of n things) range over exactly 2ⁿ values.

## Permutations: order matters

Now the shop wants to build a limited-edition **display** of k books out
of n rare ones, and the *order* on the shelf matters (first book gets the
best lighting). Arrangements of n distinct items: first slot has n
choices, next n−1, … → **n!** Arrangements of just k of the n items:
n · (n−1) ⋯ (n−k+1) = **n!/(n−k)!** (denoted P(n, k)).

Factorials explode faster than exponentials: 10! ≈ 3.6 million (fine),
13! ≈ 6 × 10⁹ (seconds), 20! ≈ 2.4 × 10¹⁸ (never). A permutation
brute-force is viable only to n ≈ 10–11 — read that off constraints
instantly.

## Combinations: order doesn't matter

Now the Archivist just needs to pick k of n books to pack into a shipping
crate — order inside the crate doesn't matter, only which books made the
cut. Take P(n, k) ordered selections, notice each unordered choice was
counted k! times (once per internal ordering), divide it out:

> **C(n, k) = n! / (k!(n−k)!)**

The "divide out the overcount" move is the second great counting technique,
and it's also how you'll de-duplicate in backtracking problems.

Computing C(n, k) in code: never via factorials (overflow/precision — 21!
already exceeds 2⁶³ and JS loses exactness far earlier). This is the same
overflow trap as lcm — the Archivist keeps her running ledger in small,
exact numbers instead of ever writing down a factorial-sized figure.
Multiply and divide incrementally:

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
C(n−1, k). Picture one specific rare book among the n — either it goes
into the crate (now you're choosing k−1 more from the remaining n−1), or
it stays on the shelf (now you're choosing all k from the remaining
n−1). That case-split on the last element is *exactly* the decomposition
dynamic programming will run on; you're meeting DP's core move a stage
early.

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
        "C(n,2) = n(n−1)/2 pairs — the same triangular count as the nested dependent loop, O(n²) with a ½ constant",
        "n² pairs, so O(n²) — every ordered pair (i, j) with i ≠ j counts separately, since brute force naturally iterates both indices independently across the full range",
        "2ⁿ pairs — pairing items is really choosing a subset of size 2 or less from each element's perspective, which is why the subset-counting formula applies here too"
      ],
      "answer": 0,
      "explanation": "Choosing 2 of n unordered is C(n,2) = n(n−1)/2. That's literally the iteration count of `for i, for j > i` — counting and loop analysis are the same computation."
    },
    {
      "question": "A problem has n ≤ 16 and asks about 'every possible selection of elements'. What's the intended approach signal?",
      "options": [
        "2ⁿ subset enumeration (≈ 65,536 subsets — trivial), likely via bitmask or backtracking",
        "n! permutation search — 'every possible selection' implies order matters, since a selection is really an arrangement of the chosen elements into some sequence",
        "An O(n log n) greedy — small constraints like n ≤ 16 typically signal that a sort-based approach is intended, since sorting is the cheapest thing that can meaningfully restructure the input"
      ],
      "answer": 0,
      "explanation": "'Selections' = subsets = 2ⁿ. At n = 16 that's 65,536 — tiny. Constraints of 16–25 practically announce subset enumeration."
    },
    {
      "question": "Why compute C(n, k) with incremental multiply-divide instead of n!/(k!(n−k)!)?",
      "options": [
        "It's asymptotically faster — the multiply-divide loop runs in fewer total arithmetic operations than computing three separate factorials and dividing them, which is where the real time savings come from",
        "Factorials are O(n²) to compute — multiplying together n terms one at a time, with each multiplication getting more expensive as the running product grows, adds up to quadratic total work",
        "Factorials overflow fixed-width integers and lose float precision long before C(n,k) itself is large; incremental division keeps every intermediate exact and small"
      ],
      "answer": 2,
      "explanation": "C(50, 3) = 19,600 — tiny — but 50! has 65 digits. The formula's intermediates are the problem, not the answer. Multiply-divide stepwise keeps intermediates at binomial size."
    }
  ]
}
```
