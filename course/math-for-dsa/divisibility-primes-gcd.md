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

*Why it's true:* let q = a // b (integer division), so by definition
a = q·b + (a mod b). Now check both directions:

- If d divides both a and b, it divides q·b (a multiple of b) and
  therefore divides a − q·b, which is exactly a mod b.
- If d divides both b and a mod b, it divides q·b (a multiple of b)
  and a mod b, so it divides their sum q·b + (a mod b), which is exactly
  a.

Either way, d divides the FULL pair — (a, b) and (b, a mod b) have
identically the same set of common divisors, so in particular the same
GREATEST one. That's the whole proof: two pairs that agree on every
common divisor must agree on the largest.

Watch it happen on 48 and 18 — each row divides the bar into copies of
the shorter length, and the leftover (accent) becomes next row's bar:

```diagram
{ "id": "euclid-shrink", "a": 48, "b": 18 }
```

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
  "why": "After every TWO steps, the smaller number at least halves. Case 1: b <= a/2, so a mod b (which is always < b) is automatically < a/2 too — one step does the halving. Case 2: b > a/2, so a is less than 2b, meaning the division a / b happens exactly once (quotient 1) and a mod b = a - b, which is < a/2 precisely because b > a/2. Either way, two steps at most halve the smaller value, so the process ends in O(log min(a,b)) steps."
}
```

Concretely, watch case 2 fire: gcd(100, 60) → b=60 > 100/2=50, so
a mod b = 100 − 60 = 40 (one subtraction, not a real "division" in
spirit) → gcd(60, 40) → next round continues. The halving isn't always
visually dramatic step-to-step, but it's guaranteed within every pair of
steps — which is all the O(log) bound needs.

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
