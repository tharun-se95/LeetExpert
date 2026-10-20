---
title: "Summations & Series"
kicker: "Math for DSA • Foundations • concept lesson"
headline: "Two shapes rule loop totals: triangular squares and geometric doubling."
lede: "Every nested loop total in algorithm analysis reduces to one of two fundamental shapes: constant-difference arithmetic sums that scale quadratically as n(n+1)/2, or constant-ratio geometric series that stay under twice their largest term."
chips:
  - "triangular sum scales as **quadratic O(n²)**"
  - "geometric doubling sums to **2^(k+1) − 1**"
  - "halving work sums under **2n total**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroTri" viewBox="0 0 560 160" role="img" aria-label="A staircase of 1 + 2 + 3 + 4 + 5 = 15 blocks doubled into a 5 × 6 rectangle of 30 blocks."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum"></b> <span id="heroUnit"></span></div><div id="heroCap"></div></div></div></div>
---

## The triangular shelf {#problem toc="The triangular shelf"}

```caption
Two interlocking staircases form an n × (n+1) rectangle, proving 1 + 2 + ⋯ + n = n(n+1)/2.
```

```vig "A stepped staircase of blocks fitting against an inverted twin to complete a rectangle"
<rect class="fa" x="40" y="70" width="20" height="20" rx="2"/>
<rect class="fa" x="40" y="50" width="20" height="20" rx="2"/>
<rect class="fa" x="60" y="50" width="20" height="20" rx="2"/>
<rect class="fa" x="40" y="30" width="20" height="20" rx="2"/>
<rect class="fa" x="60" y="30" width="20" height="20" rx="2"/>
<rect class="fa" x="80" y="30" width="20" height="20" rx="2"/>
<rect class="fk" x="60" y="70" width="20" height="20" rx="2"/>
<rect class="fk" x="80" y="70" width="20" height="20" rx="2"/>
<rect class="fk" x="100" y="70" width="20" height="20" rx="2"/>
<rect class="fk" x="80" y="50" width="20" height="20" rx="2"/>
<rect class="fk" x="100" y="50" width="20" height="20" rx="2"/>
<rect class="fk" x="100" y="30" width="20" height="20" rx="2"/>
<line class="st" x1="40" y1="92" x2="120" y2="92"/>
<line class="st" x1="122" y1="30" x2="122" y2="90"/>
```

At the far end of the Grand Library Archive stands a triangular bookcase: the first shelf holds 1 volume, the second shelf holds 2, the third holds 3, continuing up to shelf n, which holds n volumes. How many books does the entire bookcase hold in total?

The derivation slots an inverted, upside-down duplicate against the original staircase:
- Match shelf 1 (1 book) beside the duplicate's shelf n (n books), giving n + 1 books.
- Match shelf 2 (2 books) beside the duplicate's shelf n−1 (n−1 books), giving n + 1 books.
- Match shelf n (n books) beside the duplicate's shelf 1 (1 book), giving n + 1 books.

Every composite row holds exactly n + 1 books across n rows, forming an n × (n + 1) rectangle:

> 1 + 2 + ⋯ + n = n(n + 1) / 2

```widget #triWidget "Triangular shelf: step through n and watch the blocks double into a rectangle"
<div class="tri-stage">
  <div class="tri-controls">
    <label for="triSlider">Staircase size n: <b id="triNVal">4</b></label>
    <input type="range" id="triSlider" min="1" max="8" value="4" aria-label="Staircase size n">
  </div>
  <svg id="triSvg" viewBox="0 0 480 180" role="img" aria-label="Interactive staircase of blocks paired with its inverted twin"></svg>
  <div id="triReadout" class="tri-readout"></div>
</div>
```

This is why nested loops with dependent bounds run in O(n²) time: n(n + 1) / 2 expands to ½n² + ½n, and asymptotic notation drops lower-order terms and constant coefficients.

```key
Summing consecutive integers from 1 to n produces a quadratic total n(n+1)/2: nested loops with dependent index bounds cost O(n²), not O(n).
```

## Doubling and halving boxes {#cost toc="Geometric series"}

```caption
A series with constant ratios is dominated by its single largest term: doublings sum to 2^(k+1) − 1.
```

```vig "A sequence of expandable boxes growing horizontally by powers of two"
<rect class="fa" x="30" y="20" width="16" height="16" rx="2"/>
<rect class="fa" x="30" y="42" width="32" height="16" rx="2"/>
<rect class="fa" x="30" y="64" width="64" height="16" rx="2"/>
<rect class="fa" x="30" y="86" width="128" height="16" rx="2"/>
<path class="sc" d="M165 94H215"/>
<polygon class="fc" points="210,89 220,94 210,99"/>
```

The Archive also maintains expandable storage crates. Whenever the current container fills up, the Archivist buys a new box **exactly twice the size** of the existing one: 1 crate-slot, then 2, 4, 8, 16, continuing by powers of two.

**Doubling series:** Summing the capacities paid for:
- 1 + 2 = 3 (one less than 4)
- 1 + 2 + 4 = 7 (one less than 8)
- 1 + 2 + 4 + 8 = 15 (one less than 16)

> 1 + 2 + 4 + ⋯ + 2ᵏ = 2ᵏ⁺¹ − 1

```widget #boxesWidget "Geometric series: doubling box capacities sum to 2^(k+1) - 1"
<div class="boxes-stage">
  <svg id="boxesSvg" viewBox="0 0 480 160" role="img" aria-label="Visual representation of doubling box sizes"></svg>
  <div id="boxesReadout" class="boxes-readout"></div>
</div>
```

The sum of all earlier terms, 2ᵏ − 1, is strictly less than the largest term 2ᵏ. So the Archivist's entire expenditure, 2ᵏ⁺¹ − 1, is less than twice the final box purchased.

**Halving series:** Picture clearing out an archive in shrinking passes:
Day one clears n items, day two clears n / 2, day three clears n / 4, until 1 item remains:

> n + n/2 + n/4 + ⋯ + 1 < 2n

The initial pass of n items already accounts for more than half of all work ever performed, because the total stays below 2n; all later passes combined add less than one more n.

```key
Geometric sums stay under twice their largest term: the copies made by doubling resizes across n appends sum to under 2n, so each append costs O(1) amortized.
```

## Tying summations to algorithm cost {#insight toc="Tying sums to cost"}

```caption
Dependent loops sum triangularly; dynamic array resizes sum geometrically.
```

```vig "Code blocks mapping directly into a triangular grid and a doubling bar chart"
<rect class="fa" x="25" y="20" width="80" height="70" rx="4"/>
<line class="st" x1="35" y1="35" x2="85" y2="35"/>
<line class="st" x1="45" y1="50" x2="95" y2="50"/>
<line class="st" x1="55" y1="65" x2="90" y2="65"/>
<path class="sc" d="M115 55H145"/>
<polygon class="fc" points="140,50 150,55 140,60"/>
<rect class="fk" x="160" y="25" width="60" height="60" rx="3"/>
<polygon class="fa" points="160,85 220,85 160,25"/>
```

In algorithm analysis, summation shapes map directly to standard runtime patterns:

**Nested dependent loops:**
Comparing all pairs of n items (the handshake problem):
`for i in range(n): for j in range(i): check(i, j)`
Pass 0 does 0 checks, pass 1 does 1, up to pass n−1 doing n−1 checks.
Total checks: 0 + 1 + 2 + ⋯ + (n−1) = n(n − 1) / 2.
This is the triangular sum shifted by 1, yielding O(n²) comparisons.

**Dynamic array resizes:**
Appending n items to an array that starts at capacity 1 copies the existing elements only when the array is full, at sizes 1, 2, 4, 8, ... up to the largest power of 2 below n.
Total copying work: 1 + 2 + 4 + ⋯ + 2ʲ = 2ʲ⁺¹ − 1, and because 2ʲ < n this is less than 2n.
For n = 17 the copies total 31, which is more than n but still under 2n = 34, so 2n is the bound that holds for every n.
Combined with n ordinary writes, the total across all n appends is under 3n operations: fewer than 3 per append on average.

> Total work across n appends = n writes + (copies < 2n) < 3n = O(n) ⇒ O(1) amortized

## Implementing the triangular closed form {#solution toc="Implementation"}

```caption
Compute n(n+1)/2 with integer division at the end: premature truncation fails on odd n.
```

```vig "A fraction bar with the division operator placed at the outer scope"
<rect class="fa" x="30" y="25" width="180" height="62" rx="4"/>
<line class="st" x1="60" y1="56" x2="180" y2="56"/>
<circle class="fc" cx="120" cy="42" r="5"/>
<circle class="fc" cx="120" cy="70" r="5"/>
<rect class="fk" x="145" y="32" width="24" height="20" rx="2"/>
```

When writing `triangle(n)` in code, order of operations matters critically. Between any two consecutive integers n and n + 1, exactly one is guaranteed to be even. Therefore, the product `n * (n + 1)` is always divisible by 2.

If you divide n first via `(n // 2) * (n + 1)`, integer truncation discards the remainder 0.5 whenever n is odd: for n = 3, `3 // 2 * 4 = 1 * 4 = 4`, losing 2 full units!

```warn
Never divide n before multiplying: n // 2 * (n + 1) truncates odd integers prematurely, returning 4 instead of 6 for n = 3.
```

```code mistake "Watch out: premature integer division truncates odd inputs"
```

The correct closed-form implementation multiplies first, then divides by 2. In TypeScript the product n * (n + 1) stays exact while it is below 2⁵³, which holds up to n = 94,906,265; beyond that, use `BigInt`.

```code solution "Closed-form triangular sum: n * (n + 1) // 2"
```

## Where next {#next toc="Where next"}

```caption
Summations distinguish quadratic pairwise sweeps from linear amortized routines.
```

```vig "A branching flowchart linking arithmetic sums to nested loops and geometric sums to trees"
<rect class="fa" x="20" y="40" width="55" height="32" rx="4"/>
<rect class="fa" x="100" y="20" width="55" height="32" rx="4"/>
<rect class="fa" x="100" y="60" width="55" height="32" rx="4"/>
<rect class="fa" x="175" y="40" width="55" height="32" rx="4"/>
<path class="st" d="M75 56H100M155 36L175 48M155 76L175 64"/>
```

Recognizing summation structures enables immediate complexity classification:

```variants
[
  {
    "title": "Pairwise Comparisons",
    "source": "Sorting module (Bubble / Insertion Sort)",
    "text": "Comparing each element against all predecessors performs 1 + 2 + ... + (n-1) = n(n-1)/2 steps, bounding nested loops to O(n²)."
  },
  {
    "title": "Dynamic Array Amortization",
    "source": "Arrays & Strings module",
    "text": "Capacity doubling copies 1 + 2 + 4 + ⋯ elements, a geometric progression summing to under 2n, so appends are amortized O(1)."
  },
  {
    "title": "Divide-and-Conquer Trees",
    "source": "Recursion & Trees module",
    "text": "Geometric node branchings 1 + 2 + 4 + ... + 2^h sum to 2^(h+1) - 1 nodes, relating tree depth directly to total node capacity."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```caption
Test your recognition of triangular sums, geometric convergence, and amortized bounds.
```

```quiz
{
  "questions": [
    {
      "question": "A loop's inner body runs i times on pass i, for i from 1 to n. What is the total number of inner-loop iterations, in closed form?",
      "options": [
        "n(n+1)/2: pair smallest with largest terms",
        "2ⁿ: each pass compounds the work of the last",
        "n²: n passes that each do about n iterations"
      ],
      "answer": 0,
      "explanation": "This is exactly the triangular sum 1+2+...+n = n(n+1)/2. It is about half of n², because pass i does i iterations, not n. It is a quadratic total, not exponential: the per-pass cost grows linearly with the pass number."
    },
    {
      "question": "A process does n units of work, then n/2, then n/4, and so on, until the remaining work rounds down to nothing. What's the total work, approximately?",
      "options": [
        "n log n: about log n passes costing about n each",
        "2n: the first pass is n and the rest add under n more",
        "n: only the first pass counts, later ones are negligible"
      ],
      "answer": 1,
      "explanation": "A halving (geometric) series sums to less than twice its first term: n + n/2 + n/4 + ... stays under 2n. The later passes are not negligible, they add up to almost another n. Passes shrink geometrically, so this is not n log n."
    },
    {
      "question": "Why does a dynamic array's total resize cost across n appends work out to O(n), not something worse?",
      "options": [
        "The copy sizes 1, 2, 4, 8, ... form a doubling series summing to under 2n",
        "Each resize is O(1), so the resizes together add up to O(n)",
        "Resizes happen about log n times and each copies at most n, so O(n log n)"
      ],
      "answer": 0,
      "explanation": "Resizes are not O(1) each: they copy 1, 2, 4, ..., up to just under n elements. That is a doubling geometric series, and such a series sums to less than twice its largest term, so under 2n in total. Bounding each of the log n resizes by n is correct but loose. This is the fact behind amortized analysis."
    }
  ]
}
```
