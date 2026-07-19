---
title: Divisibility, Primes & GCD
type: concept
---

## Divisors come in pairs

d divides n ("d | n") when n = d · k for some integer k. The observation
that powers half the algorithms in this area: **divisors pair up across
√n** — if d | n then (n/d) | n, and one of the pair is ≤ √n. So to
enumerate divisors or test primality you only probe up to √n:

````tabs
```python
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d <= n:      # only up to sqrt(n)
        if n % d == 0:
            return False
        d += 1
    return True
```

```typescript
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    // only up to sqrt(n)
    if (n % d === 0) return false;
  }
  return true;
}
```
````

```complexity
{
  "time": "O(√n)",
  "space": "O(1)",
  "why": "Any composite n has a divisor ≤ √n (divisors pair as d · n/d), so an absent divisor below √n proves primality. Note this is √ of the VALUE n — exponential in the number's digit count, which is why cryptography can still rely on factoring being hard."
}
```

That last point deserves emphasis: complexity is measured against what you
name. O(√n) in the *value* is O(√(10^digits)) in the *input length* — fine
for n up to ~10¹², useless for 300-digit numbers.

## Many primality checks? Sieve instead

Testing k different numbers up to n costs O(k√n) with the function above.
When you need "is prime?" for *everything* up to n, the **Sieve of
Eratosthenes** precomputes all answers in one pass: mark multiples of each
prime as composite.

````tabs
```python
def sieve(n: int) -> list[bool]:
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    p = 2
    while p * p <= n:
        if is_p[p]:
            for multiple in range(p * p, n + 1, p):
                is_p[multiple] = False
        p += 1
    return is_p
```

```typescript
function sieve(n: number): boolean[] {
  const isP = new Array(n + 1).fill(true);
  isP[0] = isP[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (isP[p]) {
      for (let m = p * p; m <= n; m += p) isP[m] = false;
    }
  }
  return isP;
}
```
````

```complexity
{
  "time": "O(n log log n)",
  "space": "O(n)",
  "why": "Marking multiples of p costs n/p; summing n/2 + n/3 + n/5 + … over primes gives n · (1/2 + 1/3 + 1/5 + …) = n log log n — effectively linear. Starting each inner loop at p² is safe because smaller multiples of p were already struck out by smaller primes."
}
```

## GCD and Euclid's algorithm

gcd(a, b) is the largest integer dividing both. The 2,300-year-old
algorithm rests on one identity:

> **gcd(a, b) = gcd(b, a mod b)**

*Why it's true:* any d dividing both a and b also divides a − qb = a mod b;
any d dividing b and a mod b also divides their combination a. So the two
pairs have the *same set* of common divisors — hence the same greatest one.

````tabs
```python
def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a

# lcm via gcd — always this way, never by factoring:
def lcm(a: int, b: int) -> int:
    return a // gcd(a, b) * b   # divide first to keep numbers small
```

```typescript
function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b; // divide first to keep numbers small
}
```
````

```complexity
{
  "time": "O(log min(a, b))",
  "space": "O(1)",
  "why": "After two steps the remainder at least halves (if b ≤ a/2, then a mod b < b ≤ a/2; if b > a/2, then a mod b = a − b < a/2). Halving every two steps is the logarithm again."
}
```

Where you'll actually use it: reducing fractions to lowest terms (compare
slopes exactly without floating point), array-rotation cycle counts, and
lcm for "when do two cycles align" scheduling problems.

```quiz
{
  "questions": [
    {
      "question": "Why does trial division only need to check divisors up to √n?",
      "options": [
        "Numbers above √n are usually prime",
        "If n = d·k with d ≤ k, then d ≤ √n — divisors pair up around √n, so a composite always has a small witness",
        "It's a heuristic that occasionally misses composites"
      ],
      "answer": 1,
      "explanation": "If both factors of n exceeded √n their product would exceed n. So finding no divisor ≤ √n is a proof, not a guess."
    },
    {
      "question": "gcd(48, 18) by Euclid — trace it:",
      "options": [
        "gcd(48,18) → gcd(18,12) → gcd(12,6) → gcd(6,0) = 6",
        "gcd(48,18) → gcd(24,9) → gcd(9,6) = 3",
        "gcd(48,18) → gcd(30,18) → gcd(18,12) = 12"
      ],
      "answer": 0,
      "explanation": "48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0. When the second number hits 0, the first (6) is the gcd."
    },
    {
      "question": "You need primality for every number up to 10⁶. Best plan?",
      "options": [
        "Call the O(√n) test on each — about 10⁶ × 10³ = 10⁹ operations",
        "Sieve once for O(n log log n) ≈ a few million operations, then answer each query in O(1)",
        "Memoize the O(√n) test"
      ],
      "answer": 1,
      "explanation": "Batch queries over a dense range are exactly what sieves are for — precompute all answers for near-linear cost, then each lookup is free. Memoizing trial division still pays √n per distinct number."
    }
  ]
}
```
