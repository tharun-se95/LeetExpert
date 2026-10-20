---
title: "Divisibility, Primes & GCD"
kicker: "Math for DSA • Foundations • concept lesson"
headline: "Carton sizes pair up: one small divisor proves a number composite."
lede: "Checking every candidate divisor up to n is wasteful, because factors always mirror each other around √n. From carton packing to Euclid's remainder chain, three structural facts cut the work: n tests down to √n, √n tests per question down to one table read, and a long subtraction chain down to a logarithmic number of remainders."
chips:
  - "divisors **pair up across √n**"
  - "the sieve precomputes in **O(n log log n)**"
  - "Euclid's larger number **at least halves every two steps**"
  - "lcm: **divide before multiplying** to keep the product exact"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="hero-plot"><svg id="heroPairs" viewBox="0 0 560 250" role="img" aria-label="Factor pairs of 36 mirrored across the square root line."></svg><div class="hero-labels" id="heroLabels"></div></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">√36 = 6</b> <span id="heroUnit">pivot point</span></div><div id="heroCap">Every divisor above 6 pairs with a small divisor below 6.</div></div></div></div>
---

## Carton sizes come in pairs {#insight toc="Factor pairs"}

```caption
Factor pairs mirror across √n, so finding a composite's small witness never requires testing past the square root.
```

```vig "Factor pairs balancing across the square root line"
<line class="st" x1="20" y1="56" x2="220" y2="56"/><line class="sc" x1="120" y1="20" x2="120" y2="92"/><circle class="fa" cx="60" cy="56" r="14"/><circle class="fk" cx="180" cy="56" r="14"/>
```

The Archive's shipping room runs on three constant questions: can this delivery of books be packed into equal cartons, which delivery sizes are unpackable no matter how you divide them, and what largest carton size two different deliveries can share.

Take a delivery of 36 books. If you pack them into cartons of size d, the number of cartons needed is 36 / d. Divisors always arrive in ==factor pairs==:

- 1 carton of 36 books ⟷ 36 cartons of 1 book: pair (1, 36)
- 2 cartons of 18 books ⟷ 18 cartons of 2 books: pair (2, 18)
- 3 cartons of 12 books ⟷ 12 cartons of 3 books: pair (3, 12)
- 4 cartons of 9 books ⟷ 9 cartons of 4 books: pair (4, 9)
- 6 cartons of 6 books ⟷ 6 cartons of 6 books: pair (6, 6)

Look closely at the smaller factor in each pair: it never exceeds 6, and √36 = 6. This is not unique to 36. If a composite number n factors into d · k, then at least one factor must satisfy d ≤ √n. If both factors were strictly greater than √n, their product d · k would exceed √n · √n = n, which contradicts d · k = n.

```key
Every composite number has a divisor witness d with 2 ≤ d ≤ √n. If no divisor exists up to √n, the number is guaranteed prime.
```

## Trial division in O(√n) {#walk toc="Trial division"}

```caption
Iterating d while d² ≤ n stays in exact integer arithmetic and caps loop iterations at √n.
```

```vig "A loop cursor testing divisor steps up to square root"
<rect class="fa" x="25" y="30" width="190" height="24" rx="4"/><line class="st" x1="60" y1="30" x2="60" y2="54"/><line class="st" x1="95" y1="30" x2="95" y2="54"/><line class="st" x1="130" y1="30" x2="130" y2="54"/><polygon class="fc" points="90,16 100,16 95,26"/>
```

To test if a delivery is prime, you do not need to check carton sizes up to n − 1. You only need to test integers d starting from 2 up to ⌊√n⌋.

Writing the loop condition as `d * d <= n` needs no square-root call, so a floating-point rounding of √n can never make the loop stop one step early or late.

```widget #factorStepper "Trial division: factor pairs and test count vs n"
<div class="dsa-stage">
  <div class="dsa-controls">
    <div id="factorTabs" class="extabs" role="group" aria-label="Input presets"></div>
  </div>
  <div class="dsa-card" id="factorCard"></div>
</div>
```

```code solution "is_prime and gcd: primality testing and greatest common divisor"
```

````warn
Using `d * d < n` instead of `d * d <= n`. If the loop condition uses strict inequality, it terminates before checking d = √n. This silently classifies perfect squares of primes — such as 4, 9, 25, and 49 — as prime numbers.

```code mistake "is_prime_mistake: strict inequality misses prime squares"
```
````

## The Sieve of Eratosthenes {#build toc="Sieve"}

```caption
Marking multiples of each prime starting at p² answers primality for all numbers up to n in near-linear time.
```

```vig "A grid of numbers with multiples crossed out by prime strides"
<rect class="fa" x="25" y="20" width="30" height="30" rx="4"/><rect class="fk" x="65" y="20" width="30" height="30" rx="4"/><line class="fr" x1="65" y1="20" x2="95" y2="50"/><rect class="fa" x="105" y="20" width="30" height="30" rx="4"/><rect class="fk" x="145" y="20" width="30" height="30" rx="4"/><line class="fr" x1="145" y1="20" x2="175" y2="50"/>
```

When you need to answer primality for many shipments across a range up to n, testing each number individually with O(√n) trial division adds up. For every number up to 10⁶ the worst case is at most 10⁶ × 10³ = 10⁹ divisions. Counting the divisions the loop above really makes (each number stops at its first divisor), the total is 67,740,404, while a sieve over the same range makes 2,122,048 marks.

Instead of testing one delivery at a time, ==the Sieve of Eratosthenes== walks the entire ledger once, marking composite numbers in bulk:

1. Allocate a boolean array `is_p` of size n + 1 initialized to `True`. Set indices 0 and 1 to `False`.
2. For each p from 2 with p² ≤ n: if `is_p[p]` is `True`, iterate through its multiples m = p², p² + p, p² + 2p, … and mark each `False`.
3. Notice where marking begins: at p², not 2p. Any multiple p · k with k < p already has a prime factor smaller than p, and was already marked on an earlier pass.

```widget #sieveWidget "The Sieve of Eratosthenes: stepping 2..50 with counted operations"
<div class="dsa-stage">
  <div class="dsa-controls">
    <button type="button" class="btn2 best" id="sieveStepBtn">Step prime</button>
    <button type="button" class="btn2" id="sieveResetBtn">Reset</button>
    <span class="dsa-badge" id="sieveOpsCount">0 marks</span>
  </div>
  <div class="dsa-card">
    <div id="sieveStatus" style="font: 500 12px JetBrains Mono, monospace; color: var(--fg);">Click "Step prime" to begin.</div>
    <div class="sieve-grid" id="sieveGridEl"></div>
    <div class="sieve-stats">
      <span id="sieveRange"></span>
      <span id="sieveOpsReadout"></span>
      <span id="sievePrimesCount"></span>
    </div>
  </div>
</div>
```

```rosetta "Trial division versus Sieve of Eratosthenes"
Dimension | Trial Division | Sieve of Eratosthenes
Time Complexity | O(√n) per number | O(n log log n) total for all 2..n
Space Overhead | O(1) auxiliary space | O(n) boolean table
Best Fit | Isolated single number check | Many queries on a dense range such as 2…10⁷
```

```key
The sieve replaces repeated trial divisions with a single pass over memory, amortizing primality checks to O(1) array reads.
```

## Euclid's algorithm and greatest common divisor {#solution toc="Euclid & GCD"}

```caption
Replacing the larger number by the remainder preserves all common divisors, and the larger number at least halves every two steps.
```

```vig "Two bars comparing a delivery length with remainder reduction"
<rect class="fa" x="25" y="30" width="140" height="20" rx="4"/><rect class="fk" x="25" y="60" width="60" height="20" rx="4"/><rect class="fc" x="85" y="60" width="20" height="20" rx="4"/>
```

When two shipments of size a and b arrive, what is the largest carton size that packs both evenly? The greatest common divisor ==gcd(a, b)== solves this.

Euclid's algorithm relies on one fundamental identity:

> gcd(a, b) = gcd(b, a mod b)

Why does this preserve the gcd? Express division as:

> a = q · b + r

where q = ⌊a/b⌋ is the integer quotient and r = a mod b is the remainder.

- If d divides both a and b, then d divides a − q · b, which is r.
- If d divides both b and r, then d divides q · b + r, which is a.

The common divisors of (a, b) are identical to the common divisors of (b, r). Therefore, their greatest common divisor is identical. The reduction loses nothing.

```widget #euclidWidget "Euclid's algorithm: modulo collapse versus repeated subtraction"
<div class="dsa-stage">
  <div class="dsa-controls">
    <div id="euclidTabs" class="extabs" role="group" aria-label="Input presets"></div>
  </div>
  <div class="dsa-card">
    <div class="dsa-head">
      <span class="dsa-title" id="euclidGcdRes">gcd(a, b)</span>
      <span class="dsa-badge good">Exact reduction</span>
    </div>
    <div class="euclid-table-wrap">
      <table class="euclid-table" aria-label="Euclidean algorithm step table">
        <thead>
          <tr>
            <th>Round</th>
            <th>a</th>
            <th>b</th>
            <th>Quotient q</th>
            <th>Remainder r</th>
          </tr>
        </thead>
        <tbody id="euclidTableBody"></tbody>
      </table>
    </div>
    <div class="comp-banner">
      <div class="comp-box">
        <div class="comp-box-title">Euclid Modulo Steps</div>
        <div class="comp-box-val" id="euclidModCount">–</div>
      </div>
      <div class="comp-box">
        <div class="comp-box-title">Repeated Subtraction Steps</div>
        <div class="comp-box-val" id="euclidSubCount">–</div>
      </div>
    </div>
  </div>
</div>
```

One remainder step does the work of a whole run of subtractions. For (1000, 2), repeated subtraction takes 499 steps and Euclid's remainder takes 1.

```key
A remainder step removes the whole quotient at once, so the number of steps depends on how many times the numbers can halve, not on their size.
```

## Least common multiple and the overflow trap {#trap toc="LCM trap"}

```caption
Dividing before multiplying keeps every intermediate no larger than the answer, so the result stays an exact integer.
```

```vig "A numeric register with digits overflowing beyond safe bounds"
<rect class="fa" x="25" y="30" width="190" height="40" rx="6"/><line class="fr" x1="160" y1="20" x2="160" y2="80"/><polygon class="fr" points="180,35 195,45 180,55"/>
```

The least common multiple lcm(a, b) gives the smallest container that holds both shipments without remainder:

> lcm(a, b) = (a · b) / gcd(a, b)

Mathematically, multiplying first or dividing first yields the exact same answer. In code, however, the order of operations makes the difference between exact results and silent data corruption.

In JavaScript, numbers are IEEE-754 doubles with 53 significant bits. The maximum safe integer is 9,007,199,254,740,991 (2⁵³ − 1).

If you compute `(a * b) / gcd(a, b)`, the intermediate product `a * b` can exceed 2⁵³ even when the true LCM is small. Above 2⁵³ not every integer is a double, so the product is rounded to the nearest one before the division runs. For a = 300,000,003 and b = 500,000,005 the lcm is 1,500,000,015, but the product is about 1.5 × 10¹⁷, and the division returns a non-integer.

Because gcd(a, b) divides a evenly by definition, `a / gcd(a, b)` is always an exact whole number. Computing `(a / gcd(a, b)) * b` keeps every intermediate at most the lcm itself, so the result is exact whenever the lcm is below 2⁵³. Python integers never round, so `a * b // g` is exact there; the trap is JavaScript's.

```widget #overflowDemo "Safe integer bounds: divide-first versus multiply-first in JavaScript"
<div class="dsa-stage">
  <div class="dsa-card">
    <div class="dsa-head">
      <span class="dsa-title">Double-precision demonstration</span>
      <span class="dsa-badge warn">Precision guard</span>
    </div>
    <table class="overflow-table" aria-label="Precision comparison table">
      <thead>
        <tr>
          <th>Operation</th>
          <th>Output Value</th>
          <th>Verdict</th>
        </tr>
      </thead>
      <tbody id="overflowTableBody"></tbody>
    </table>
  </div>
</div>
```

```key
Divide before multiplying: (a / gcd(a, b)) * b never holds an intermediate larger than the lcm, so it is exact whenever the lcm is below 2⁵³.
```

## What it costs {#cost toc="Cost"}

```caption
The cost of each routine, with the inputs the page ran it on.
```

```vig "Curves comparing logarithmic decline against square root growth"
<path class="st" d="M25 85Q70 40 215 25"/><path class="sc" d="M25 85L215 55"/>
```

```derivation
Let a ≥ b > 0. Write r₀ = a, r₁ = b, and rₖ₊₂ = rₖ mod rₖ₊₁; step k computes rₖ₊₁ from the pair (rₖ₋₁, rₖ), and the algorithm stops when a remainder is 0.
For any x ≥ y > 0, x mod y < x/2. If y ≤ x/2 then x mod y < y ≤ x/2. If y > x/2 then the quotient is 1, so x mod y = x − y < x − x/2 = x/2.
Applied to (rₖ, rₖ₊₁) this gives rₖ₊₂ < rₖ/2, so every two steps at least halve the number two places back.
Hence r₂ₜ₊₁ < r₁ / 2ᵗ = b / 2ᵗ. Take t = ⌊log₂ b⌋, so that b / 2ᵗ < 2 and r₂ₜ₊₁ is 0 or 1.
If it is 0 the algorithm stopped within 2t steps. If it is 1, one more step gives remainder 0. Either way it stops within 2⌊log₂ b⌋ + 1 steps, which is O(log b).
```

```notes
- **Trial division:** O(√n) time, O(1) space. For n = 10¹² that is at most 10⁶ divisions.
- **Sieve of Eratosthenes:** O(n log log n) time, O(n) space. For n = 10⁷ it makes 22,850,051 marks, finds 664,579 primes, and the table holds 10,000,001 flags.
- **Euclidean GCD:** O(log min(a, b)) time, O(1) space. For a ≥ b with b below 2⁶⁴ the bound above is 2 · 63 + 1 = 127 remainder steps.
```

## Where next {#next toc="Where next"}

```vig "A signpost pointing toward future arithmetic and combinatorics lessons"
<path class="st" d="M120 95V25"/><rect class="fa" x="65" y="25" width="110" height="15" rx="3"/><rect class="fk" x="65" y="50" width="110" height="15" rx="3"/>
```

```variants
[
  {
    "title": "Counting & Combinatorics",
    "source": "next lesson",
    "text": "Applying incremental multiplication and division to compute binomial coefficients C(n, k) without intermediate overflow."
  },
  {
    "title": "Modular Arithmetic",
    "source": "foundations module",
    "text": "Operating on residue rings: the negative modulo trap in JavaScript and keeping running sums bounded."
  },
  {
    "title": "Binary Exponentiation",
    "source": "advanced algorithms",
    "text": "Computing powers aᵇ mod m in O(log b) time by repeatedly squaring and reducing."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "Question rows with checked choices"
<circle class="fg" cx="35" cy="25" r="9"/><path class="st" d="M30 25L34 29L40 21"/><circle class="st" cx="35" cy="55" r="9"/><circle class="st" cx="35" cy="85" r="9"/><rect class="fa" x="55" y="20" width="140" height="10" rx="4"/><rect class="fa" x="55" y="50" width="120" height="10" rx="4"/><rect class="fa" x="55" y="80" width="130" height="10" rx="4"/>
```

```quiz
{
  "questions": [
    {
      "question": "Why does trial division only need to check divisors up to √n?",
      "options": [
        "A composite n = d·k with d ≤ k has d² ≤ n, so it always has a divisor at most √n",
        "A divisor larger than √n cannot divide n evenly, since a factor must stay below the root",
        "Past √n the quotients repeat, but testing them still catches a rare composite the small ones miss"
      ],
      "answer": 0,
      "explanation": "If both factors of n exceeded √n, their product would exceed n. Finding no divisor up to √n is a proof, not a guess; divisors above √n do exist (n/2 divides an even n), they just always come with a smaller partner."
    },
    {
      "question": "Which trace of Euclid's algorithm for gcd(48, 18) is correct?",
      "options": [
        "48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0, so gcd(48, 18) = 0",
        "48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0, so gcd(48, 18) = 6",
        "Stop at the first remainder: 48 mod 18 = 12, so gcd(48, 18) = 12 and no more steps are needed"
      ],
      "answer": 1,
      "explanation": "Keep going until the remainder is 0; the gcd is the last non-zero remainder, which was the divisor of the final step (6), not the 0 it produced and not the first remainder."
    },
    {
      "question": "You need primality for every number up to 10⁶. Which plan is best?",
      "options": [
        "Memoize the O(√n) test so that no number is ever tested twice",
        "Trial division per query, whose O(√n) cost per number keeps the whole range near-linear",
        "Sieve once in O(n log log n), then answer each query with a single array read"
      ],
      "answer": 2,
      "explanation": "Memoizing saves nothing when every number in the range is different. Over 2…10⁶ trial division makes {{trialDiv1e6}} divisions where the sieve makes {{sieveMarks1e6}} marks, and after the sieve each query is one read."
    }
  ]
}
```
