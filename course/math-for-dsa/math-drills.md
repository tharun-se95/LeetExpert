---
title: Math Drills
type: concept
---

## How to drill

Same protocol as the Big O drills: commit to an answer before touching the
quiz, and when you miss, find the *rule* you misapplied, not just the right
letter.

## Drill 1 — logs in disguise

A balanced binary search tree holds 10⁹ items. About how many node visits
does one lookup cost?

```quiz
{
  "question": "Drill 1 — lookups in a balanced tree of 10⁹ items cost about…",
  "options": ["30 visits", "1,000 visits", "31,623 visits (√n)"],
  "answer": 0,
  "explanation": "Balanced-tree height ≈ log₂ n, and log₂ 10⁹ ≈ 30 (each ×1,000 adds ~10). The √n answer is the trial-division bound — different tool."
}
```

## Drill 2 — the JS modulo trap

````tabs
```python
def prev_index(i: int, n: int) -> int:
    return (i - 1) % n
```

```typescript
function prevIndex(i: number, n: number): number {
  return (i - 1) % n;
}
```
````

```quiz
{
  "question": "Drill 2 — which implementation is buggy, and when?",
  "options": [
    "Both are fine",
    "The TypeScript one: at i = 0 it returns -1, because JS % keeps the dividend's sign; Python returns n-1 correctly",
    "The Python one: % is undefined for negatives"
  ],
  "answer": 1,
  "explanation": "Python's % follows the divisor's sign → (0-1) % n == n-1. JS keeps the dividend's sign → -1. Fix: ((i - 1) % n + n) % n."
}
```

## Drill 3 — huge products

You must compute the product of 10⁵ numbers, each up to 10⁹, modulo 10⁹+7.

```quiz
{
  "question": "Drill 3 — correct approach in TypeScript?",
  "options": [
    "Multiply everything, mod at the end",
    "Reduce mod 10⁹+7 after every multiplication — but even one product of two ~10⁹ values exceeds 2⁵³, so use BigInt (or split-multiplication)",
    "Reduce after every multiplication with plain numbers — that keeps values safe"
  ],
  "answer": 1,
  "explanation": "Reducing every step is mathematically right, but two reduced values can each be ~10⁹, and their product ~10¹⁸ > Number.MAX_SAFE_INTEGER (~9×10¹⁵) — already inexact BEFORE the mod. Python's big ints make option C fine there; TS needs BigInt."
}
```

## Drill 4 — counting the search space

A problem: "given n ≤ 12 tasks, find the ordering that minimizes total
penalty."

```quiz
{
  "question": "Drill 4 — what does n ≤ 12 tell you?",
  "options": [
    "Orderings = 2¹² = 4,096 — subset enumeration",
    "Orderings = 12! ≈ 4.8 × 10⁸ — a permutation search is (barely) viable, and the constraint is the announcement",
    "Nothing; constraints don't imply approaches"
  ],
  "answer": 1,
  "explanation": "Orderings are permutations, counted by n!, and 12! ≈ 479M is at the edge of feasible (pruning or bitmask-DP over 2¹² states helps). Subsets (2ⁿ) count selections, not orderings."
}
```

## Drill 5 — Euclid, by hand

```quiz
{
  "question": "Drill 5 — gcd(252, 105) = ?",
  "options": ["21", "7", "63"],
  "answer": 0,
  "explanation": "252 mod 105 = 42; 105 mod 42 = 21; 42 mod 21 = 0 → gcd = 21. Two mod steps and done — that's the log-time collapse in action."
}
```

## Drill 6 — sieve or test?

You get q = 10⁵ queries, each asking whether some n ≤ 10⁷ is prime.

```quiz
{
  "question": "Drill 6 — sieve up front, or trial-divide per query?",
  "options": [
    "Trial division: 10⁵ × √10⁷ ≈ 3 × 10⁸ operations — borderline; sieve: ~10⁷ marks once, then O(1) per query. Sieve wins",
    "Trial division — the sieve's 10⁷ memory is prohibitive",
    "They're equivalent"
  ],
  "answer": 0,
  "explanation": "Dense repeated queries are the sieve's home turf: near-linear precompute, free lookups. 10⁷ booleans is ~10 MB (1 MB as a bit array) — cheap. Trial division only wins for a handful of queries or values far beyond sieve range."
}
```

````reveal Module complete — what carries forward
Three tools from this module are load-bearing later:

- **log₂ intuition** prices every tree height and halving loop from here on
  (Binary Search, BST, Heaps).
- **mod-as-clock** (with the JS sign fix) runs ring buffers (Queues),
  rotations (Arrays), and rolling hashes (Strings, Hash Tables).
- **Counting spaces** (2ⁿ subsets, n! orderings, C(n,k) choices) prices
  every brute force before you write it — the starting point of
  Backtracking and DP.

**Next: Stage 1 — Arrays & Dynamic Arrays** (coming soon), where memory
layout finally takes center stage.
````
