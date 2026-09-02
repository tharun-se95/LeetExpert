---
title: Divisibility, Primes & GCD
type: concept
---

The Archive's shipping room runs on three constant questions: can this
delivery of books be packed into equal cartons, which delivery sizes are
"unpackable" no matter how you slice them, and how do you find the
biggest carton size two different deliveries can share. Each rests on a
single insight. Get the insight and the algorithm writes itself.

## 1. Divisibility & prime checking — O(√n)

### The core insight

**Carton sizes come in pairs.** If you can pack n books into cartons of
size d, then you can also pack them into n/d cartons holding d books
each — divisors pair up.

Take n = 36 books. Every carton-size pairing sits in exactly one pair:

| pair | small | large |
| --- | --- | --- |
| (1, 36) | 1 | 36 |
| (2, 18) | 2 | 18 |
| (3, 12) | 3 | 12 |
| (4, 9) | 4 | 9 |
| (6, 6) | 6 | 6 |

Now look at the small column. It never exceeds 6, and √36 = 6.

That is not a coincidence about 36 books. In every pair, at least one
member is ≤ √n — because if both members were larger than √n, their
product would be larger than n. But their product *is* n. So one of them
has to be small.

### Why it matters

To check whether n books can *only* be packed one-at-a-time (n is prime),
you do not need to test every carton size up to n − 1. You only need to
test up to √n.

If n is composite, it has a divisor pair, and the small member of that
pair is ≤ √n. Your loop will find it. So if the loop finishes without
finding anything, n is prime. That is a proof, not a guess.

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

Note `d * d <= n` rather than `d <= Math.sqrt(n)`. Same loop, but it
stays in integer arithmetic and avoids a float rounding edge case at
perfect squares.

```complexity
{
  "time": "O(√n)",
  "space": "O(1)",
  "why": "The loop runs until d exceeds √n, so at most √n iterations. Each does one modulo. Space is a single counter variable."
}
```

**One caveat worth carrying with you.** That √n is the square root of the
*value* n, not of the input size. A shipment described by a 300-digit
number has n ≈ 10³⁰⁰, so √n ≈ 10¹⁵⁰ carton sizes to check — completely
impossible. Measured against the number of digits on the shipping label,
this algorithm is exponential. That is exactly why RSA can rest on
factoring being hard.

In practice: fine up to n ≈ 10¹², useless beyond that.

## 2. Sieve of Eratosthenes — O(n log log n)

### The core insight

Suppose the Archivist needs to know, for every shipment size from 2 up to
some limit, whether it's packable or not — not just one shipment, but
many. Running the O(√n) test k times costs O(k√n). For k = n = 10⁶ that
is around 10⁹ operations — too slow.

So stop asking one shipment at a time. **Walk down the entire shipping
manifest once, marking every packable size as you go — a single pass
covers every question in advance.**

The method is to mark composites rather than find primes:

1. Make a boolean array, `True` for every number from 2 to n. Assume
   everything is prime.
2. Walk upward. When you reach a number p still marked `True`, it is
   prime — nothing below it divided it. Mark all its multiples `False`.
3. Start marking at p², not at 2p.

Step 3 is the one that looks wrong and isn't. Every multiple of p below
p² is p·m for some m < p. That m has a prime factor smaller than p, and
that smaller prime already struck the number out on an earlier pass. So
the work is already done and starting at p² skips it.

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

The outer loop also stops at √n, for the same reason as before: any
composite ≤ n has a prime factor ≤ √n, so by the time p passes √n every
composite has already been marked.

```complexity
{
  "time": "O(n log log n)",
  "space": "O(n)",
  "why": "Marking multiples of p costs about n/p steps. Summing n/2 + n/3 + n/5 + … over the primes up to n gives n · (1/2 + 1/3 + 1/5 + …), and that sum of prime reciprocals grows like log log n. So the total is n log log n."
}
```

### Why it matters

log log n is a brutally slow-growing function. For n = 10⁶ it is about 3.
So O(n log log n) is near-linear in practice — treat it as "roughly O(n)"
when you are estimating.

The cost you actually have to think about is space. The array *is* the
data structure, so you pay O(n) memory whether or not you use every entry.

**Reach for the sieve when:** n ≤ 10⁷ and you need many primality
answers. That builds in well under a second, costs a few tens of MB, and
afterward every "is p prime?" is a single O(1) array read.

**Past that:** memory breaks first. Switch to a segmented sieve, or to a
probabilistic test like Miller–Rabin if you only need scattered
individual numbers.

## 3. GCD & Euclid's algorithm — O(log min(a, b))

### The core insight

Two archivists show up with two different deliveries — a books and b
books — and need the biggest carton size that packs *both* deliveries
evenly with nothing left over. gcd(a, b) is the largest integer that
divides both. Euclid's algorithm computes it from one identity:

> **gcd(a, b) = gcd(b, a mod b)**

Place the smaller delivery, b, against the larger, a, and see how many
full copies of b fit inside a — then throw away those matched copies and
keep only the leftover. Repeat with the leftover in place of a. Repeat
until the second number is 0. The first number is then the answer.

### Why it works

Write a = q·b + r, where q is the integer quotient and r = a mod b. That
is just what division means.

The claim is that (a, b) and (b, r) have *exactly the same* common
divisors. Check both directions:

- Suppose d divides a and b. Then d divides q·b. So d divides
  a − q·b, which is r.
- Suppose d divides b and r. Then d divides q·b. So d divides
  q·b + r, which is a.

So any common divisor of one pair is a common divisor of the other. The
two sets are identical. Identical sets have the same largest element —
which is the gcd. The reduction loses nothing.

Watch it on 48 and 18. Each row divides the bar into copies of the
shorter length, and the leftover (accent) becomes the next row's bar:

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
  "why": "Every two steps, the smaller number is cut at least in half. So the number of steps is bounded by log₂ of the smaller input."
}
```

**Why the halving is guaranteed.** It is not obvious, so split it into
two cases based on b:

- **b ≤ a/2.** Then a mod b is smaller than b, which is already ≤ a/2.
  Halved in one step.
- **b > a/2.** Then a < 2b, so the quotient is exactly 1 and
  a mod b = a − b. And since b > a/2, that remainder is < a/2. Halved
  again.

Either way the value drops below half within two steps, which is all the
O(log) bound needs.

Trace the second case: gcd(100, 60). Here 60 > 50, so the step is really
just a subtraction: 100 − 60 = 40. Then gcd(60, 40) → gcd(40, 20) →
gcd(20, 0) = 20. Step to step the shrinking looks uneven, but it never
stalls.

### Why it matters: lcm and the overflow trap

The least common multiple — the smallest carton size that both
deliveries can *also* be packed into cleanly — comes straight from the
gcd:

> **lcm(a, b) = a · b / gcd(a, b)**

But write it as `a / gcd(a, b) * b`, dividing **before** you multiply.

The division is exact — gcd(a, b) divides a by definition, so nothing is
truncated. Both orderings give the same answer mathematically. What
differs is the largest value that ever exists in a register — the
Archivist's own rule for the overflow trap: divide the first shipment
down to its smallest safe unit before combining it with the second, never
multiply the two full deliveries together first and hope the result fits.

- Divide first, and the intermediate never exceeds the final lcm.
- Multiply first, and you materialize a · b, which overflows a 64-bit
  integer once a and b reach about 3·10⁹ — even when the true lcm would
  have fit comfortably.

**Where this shows up in problems:** reducing fractions to lowest terms
(so you can compare slopes exactly, with no floating point), counting
cycles in array rotation, and using lcm to answer "when do two repeating
intervals line up again?"

```quiz
{
  "questions": [
    {
      "question": "Why does trial division only need to check divisors up to √n?",
      "options": [
        "If n = d·k with d ≤ k, then d ≤ √n — divisors pair up around √n, so a composite always has a small witness",
        "Numbers above √n are usually prime — composite numbers become increasingly rare as they grow, so skipping divisors past √n only sacrifices a negligible, vanishing chance of missing one",
        "It's a heuristic that occasionally misses composites — trial division trades a small amount of accuracy for speed, similar to how randomized primality tests work"
      ],
      "answer": 0,
      "explanation": "If both factors of n exceeded √n their product would exceed n. So finding no divisor ≤ √n is a proof, not a guess."
    },
    {
      "question": "gcd(48, 18) by Euclid — trace it:",
      "options": [
        "gcd(48,18) → gcd(24,9) → gcd(9,6) = 3 (halving both numbers each step instead of taking a true remainder)",
        "gcd(48,18) → gcd(30,18) → gcd(18,12) = 12 (subtracting the smaller from the larger just once per step instead of using mod)",
        "gcd(48,18) → gcd(18,12) → gcd(12,6) → gcd(6,0) = 6"
      ],
      "answer": 2,
      "explanation": "48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0. When the second number hits 0, the first (6) is the gcd."
    },
    {
      "question": "You need primality for every number up to 10⁶. Best plan?",
      "options": [
        "Memoize the O(√n) test — cache each result so repeated queries for the same value skip re-running trial division",
        "Sieve once for O(n log log n) ≈ a few million operations, then answer each query in O(1)",
        "Call the O(√n) test on each — about 10⁶ × 10³ = 10⁹ operations"
      ],
      "answer": 1,
      "explanation": "Batch queries over a dense range are exactly what sieves are for — precompute all answers for near-linear cost, then each lookup is free. Memoizing trial division still pays √n per distinct number."
    }
  ]
}
```
