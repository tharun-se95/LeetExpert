---
title: "Math Drills"
kicker: "Math for DSA • Foundations • practice lesson"
headline: "Six scenarios, six mathematical habits: commit before you reveal."
lede: "The Master Archivist runs one final exercise before you work alone in the stacks: a rapid-fire round of real scenarios where reaching for a calculator is too slow. Commit to your prediction for each scenario before opening its reveal, and check your reasoning against the executed counts."
chips:
  - "commit to an answer **before revealing**"
  - "log₂ prices **every halving loop**"
  - "fix negative modulo **with ((a % m) + m) % m**"
  - "count the search space **from constraints**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="hero-drills" id="heroDrills" role="img" aria-label="Six drill cards: logs in disguise, the JavaScript modulo trap, huge products, counting the search space, Euclid by hand, and sieve or trial division."><div class="ha-card active"><div class="ha-num">Drill 1</div><div class="ha-topic">Logs in disguise</div></div><div class="ha-card"><div class="ha-num">Drill 2</div><div class="ha-topic">The JavaScript modulo trap</div></div><div class="ha-card"><div class="ha-num">Drill 3</div><div class="ha-topic">Huge products and safe integers</div></div><div class="ha-card"><div class="ha-num">Drill 4</div><div class="ha-topic">Counting the search space</div></div><div class="ha-card"><div class="ha-num">Drill 5</div><div class="ha-topic">Euclid by hand</div></div><div class="ha-card"><div class="ha-num">Drill 6</div><div class="ha-topic">Sieve or trial division?</div></div></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">6</b> <span id="heroUnit">math scenarios</span></div><div id="heroCap">Six rapid-fire scenarios testing core mathematical reflexes.</div></div></div></div>
---

## The Archivist's fire drill {#problem toc="Fire drill"}

```caption
Commit to an answer before opening the reveal; when an answer misses, identify the rule that was misapplied.
```

```vig "A checklist with target mark beside drill scenarios"
<circle class="st" cx="50" cy="56" r="30"/><circle class="fa" cx="50" cy="56" r="20"/><circle class="fk" cx="50" cy="56" r="10"/><path class="st" d="M100 56H130M125 51L130 56L125 61"/><rect class="fa" x="144" y="26" width="60" height="66" rx="6"/><circle class="fg" cx="160" cy="42" r="5"/><circle class="fg" cx="160" cy="58" r="5"/><circle class="fg" cx="160" cy="74" r="5"/>
```

Mathematical intuition in algorithms is a reading skill. When evaluating code or sizing problem bounds, you need to recognize growth rates, modular pitfalls, and search spaces instantly.

For each of the six drills below:
1. Read the scenario and inspect any accompanying code snippet.
2. Select your prediction in the commit widget.
3. Open the reveal to review the executed trace, exact counts, and mathematical rule.

## Drill 1: Logs in disguise {#insight toc="Drill 1: Logs"}

```caption
Balanced branching trees cut remaining candidates by half at each step, yielding logarithmic height.
```

```vig "A balanced binary tree branching downward"
<circle class="fa" cx="120" cy="20" r="10"/><line class="st" x1="112" y1="28" x2="80" y2="52"/><line class="st" x1="128" y1="28" x2="160" y2="52"/><circle class="fa" cx="80" cy="56" r="8"/><circle class="fa" cx="160" cy="56" r="8"/><line class="st" x1="74" y1="62" x2="50" y2="84"/><line class="st" x1="86" y1="62" x2="100" y2="84"/><line class="st" x1="154" y1="62" x2="140" y2="84"/><line class="st" x1="166" y1="62" x2="190" y2="84"/>
```

**The scenario:** The Archivist asks: "We have a balanced branching cabinet holding 10⁹ index cards. How many drawer-checks does one single lookup cost?"

```widget #drill-card-1 "Drill 1: Predict tree lookup cost"
```

````reveal #drill-1-reveal "Show working & analysis"
A perfectly balanced binary search tree with n keys has ⌊log₂ n⌋ + 1 levels, because each check discards half of the candidates.

For n = 10⁹:
- log₂ 10⁹ = 9 · log₂ 10 ≈ 9 · {{d1_log2of10}} = {{d1_log2}}
- ⌊log₂ 10⁹⌋ + 1 = {{d1_ans}} drawer checks.

The √n option (√10⁹ ≈ {{d1_sqrt}}) is the trial-division bound for primality testing, not tree height. Each factor of 1,000 in n adds only log₂ 1,000 = {{d1_log2of1000}} checks.
````

```key
A perfectly balanced binary search tree of 10⁹ keys has 30 levels, so one lookup makes at most 30 comparisons.
```

## Drill 2: The JavaScript modulo trap {#trap toc="Drill 2: Modulo"}

```caption
JavaScript preserves the dividend's sign in remainder operations, requiring an explicit wrap-around adjustment.
```

```vig "A rotating ring buffer stepping backward off zero"
<circle class="st" cx="120" cy="56" r="32"/><circle class="fa" cx="120" cy="24" r="6"/><circle class="fk" cx="152" cy="56" r="6"/><circle class="fa" cx="120" cy="88" r="6"/><circle class="fa" cx="88" cy="56" r="6"/><path class="sc" d="M110 20L95 30L110 40"/>
```

**The scenario:** The carousel spins backward, and an assistant reports a slot number when stepping back from slot 0 on a carousel of size n = 5.

```code solution "prev_index: wrapped carousel index"
```

```widget #drill-card-2 "Drill 2: Predict negative modulo behavior"
```

````reveal #drill-2-reveal "Show execution trace"
In Python, `%` is floored: the result takes the divisor's sign. `(0 - 1) % 5` evaluates to {{d2_py}}.

In JavaScript and TypeScript, `%` is the remainder operator, which keeps the dividend's sign. `(0 - 1) % 5` evaluates to {{d2_js}}, which is out of bounds for an array index.

The robust fix in JavaScript is `((i - 1) % n + n) % n`, which evaluates to {{d2_fixed}} here.
````

````warn
Using bare `%` on a negative dividend in JavaScript. With i = 0 and n = 5, `(i - 1) % n` is -1, and an array read at -1 gives `undefined`.

```code mistake "prev_index_mistake: negative dividend trap"
```
````

## Drill 3: Huge products and safe integers {#build toc="Drill 3: Products"}

```caption
Intermediate products exceeding 2⁵³ lose precision before modulo reduction unless BigInt is used.
```

```vig "A register overflowing beyond 53 bits of floating precision"
<rect class="fa" x="25" y="30" width="190" height="40" rx="6"/><line class="fr" x1="160" y1="20" x2="160" y2="80"/><polygon class="fr" points="180,35 195,45 180,55"/>
```

**The scenario:** The Archivist's overflowing ledger: 10⁵ numbers, each up to 10⁹, must be multiplied together and reported modulo 10⁹ + 7.

```widget #drill-card-3 "Drill 3: Predict safe integer handling in TypeScript"
```

````reveal #drill-3-reveal "Show precision math"
Reducing at every step is necessary, but two residues just below 10⁹ + 7 still multiply to about 10¹⁸.

`Number.MAX_SAFE_INTEGER` is {{d3_safe}} (2⁵³ − 1). Above 2⁵³ a double cannot hold every integer, so the product is rounded before the modulo operator runs.

Execution demonstration, 999,999,900 × 999,999,999 modulo 1,000,000,007:
- Plain Number: evaluates to {{d3_plain}}
- BigInt, exact: evaluates to {{d3_big}}
- The plain result is off by {{d3_diff}}.

Python handles arbitrarily large integers automatically. TypeScript needs `BigInt`.
````

```key
Multiplying two residues below 10⁹ + 7 can reach about 1.00 × 10¹⁸, past 2⁵³ ≈ 9.0 × 10¹⁵, so JavaScript needs BigInt even when you reduce at every step.
```

## Drill 4: Counting the search space {#cost toc="Drill 4: Space"}

```caption
Constraints announce the intended algorithmic strategy before designing data structures.
```

```vig "Exponential and factorial growth curves diverging"
<path class="st" d="M25 85Q90 80 120 20"/><path class="sc" d="M25 85Q120 85 215 35"/>
```

**The scenario:** A shipping crate can hold n ≤ 12 books, and the Archivist wants the exact shelf ordering that minimizes handling penalty.

```widget #drill-card-4 "Drill 4: Predict complexity from constraints"
```

````reveal #drill-4-reveal "Show search space count"
Shelf arrangements are permutations, counted by n! (factorial):
- 12! = {{d4_perms}} orderings.

At 10⁸ operations per second a full scan of 12! orderings takes {{d4_seconds}} s, over a one-second budget. A bitmask DP over the 2¹² subsets of books, with one state per (subset, last book), has 2¹² · 12 = {{d4_dp}} states.

Subsets (2¹² = {{d4_subsets}}) count selections where order does not matter, not arrangements.
````

```key
A constraint near n ≤ 12 announces n! (12! = 479,001,600 is already past 10⁸), and one near n ≤ 20 announces 2ⁿ (2²⁰ = 1,048,576).
```

## Drill 5: Euclid by hand {#solution toc="Drill 5: Euclid"}

```caption
Euclid's algorithm eliminates whole multiples in single remainder steps, quickly converging to the GCD.
```

```vig "Two overlapping bars shrinking down to GCD"
<rect class="fa" x="25" y="30" width="140" height="20" rx="4"/><rect class="fk" x="25" y="60" width="60" height="20" rx="4"/><rect class="fc" x="85" y="60" width="20" height="20" rx="4"/>
```

**The scenario:** Two archivists need the largest carton size that evenly packs deliveries of 252 and 105 books, by hand, without a calculator.

```widget #drill-card-5 "Drill 5: Predict GCD result"
```

````reveal #drill-5-reveal "Show step-by-step trace"
Trace Euclid's algorithm on (252, 105):
- Step 1: {{d5_r1}}
- Step 2: {{d5_r2}}
- Step 3: {{d5_r3}}

When the remainder reaches 0, the last non-zero remainder is {{d5_gcd}}. The reduction took {{d5_steps}} remainder steps, the last one producing 0.
````

```key
Each remainder is less than half the number two steps back, so Euclid takes at most 2⌊log₂ b⌋ + 1 steps for a ≥ b > 0.
```

## Drill 6: Sieve or trial division? {#walk toc="Drill 6: Sieve"}

```caption
Batch queries over dense ranges favor near-linear sieving over repeated trial division checks.
```

```vig "A grid of numbers representing dense batch primality queries"
<rect class="fa" x="25" y="20" width="30" height="30" rx="4"/><rect class="fk" x="65" y="20" width="30" height="30" rx="4"/><line class="fr" x1="65" y1="20" x2="95" y2="50"/><rect class="fa" x="105" y="20" width="30" height="30" rx="4"/><rect class="fk" x="145" y="20" width="30" height="30" rx="4"/><line class="fr" x1="145" y1="20" x2="175" y2="50"/>
```

**The scenario:** The front desk fields q = 10⁵ requests in a row, each asking whether some shipment size n ≤ 10⁷ is prime.

```widget #drill-card-6 "Drill 6: Predict optimal primality strategy"
```

````reveal #drill-6-reveal "Show operations comparison"
Compare the operation counts:
- Trial division: at most q × √n = 10⁵ × √10⁷ ≈ {{d6_trial_ops}} divisions, which is {{d6_trial_secs}} s at 10⁸ per second.
- Sieve of Eratosthenes: one pass over 2…10⁷ makes {{d6_sieve_ops}} marks (n ln ln n ≈ {{d6_nlnln}}), then each of the 10⁵ queries is a single read.

Space for the sieve: one byte per flag is {{d6_bytes}} bytes, about 10 MB (a bytearray in Python, a Uint8Array in TypeScript); a bitset needs {{d6_bitset}} bytes. The sieve wins decisively.
````

```key
Trial division is cheaper for a few queries; once q passes about 7,226 worst-case queries (n near 10⁷), the sieve's 22,850,051 marks are cheaper.
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing down three paths"
<path class="st" d="M120 95V25"/><rect class="fa" x="65" y="25" width="110" height="15" rx="3"/><rect class="fk" x="65" y="50" width="110" height="15" rx="3"/>
```

```variants
[
  {
    "title": "Arrays & Dynamic Arrays",
    "source": "Linear Structures stage",
    "text": "Moving from mathematical foundations to contiguous memory layout, pointer arithmetic, and amortized resizing."
  },
  {
    "title": "Bit Manipulation",
    "source": "foundations module",
    "text": "Using bitwise operators and masks to represent 2ⁿ subsets directly inside 64-bit integer registers."
  },
  {
    "title": "Number Theory in Cryptography",
    "source": "advanced applications",
    "text": "Extending Euclid to the Extended Euclidean Algorithm to compute modular multiplicative inverses."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "Checklist of multiple choice questions"
<circle class="fg" cx="35" cy="25" r="9"/><path class="st" d="M30 25L34 29L40 21"/><circle class="st" cx="35" cy="55" r="9"/><circle class="st" cx="35" cy="85" r="9"/><rect class="fa" x="55" y="20" width="140" height="10" rx="4"/><rect class="fa" x="55" y="50" width="120" height="10" rx="4"/><rect class="fa" x="55" y="80" width="130" height="10" rx="4"/>
```

```quiz
{
  "questions": [
    {
      "question": "A perfectly balanced binary search tree holds 1,000,000,000 keys. About how many levels does it have?",
      "options": [
        "About {{d1_sqrt}} levels, since the square root of n bounds a balanced tree's height",
        "About {{d1_ans}} levels, since a balanced tree's height is ⌊log₂ n⌋ + 1",
        "About {{d1_cbrt}} levels, since a branching factor of 2 gives the cube root of n"
      ],
      "answer": 1,
      "explanation": "Each level halves the keys that remain, so the height is ⌊log₂ n⌋ + 1 = {{d1_ans}} for n = 10⁹. √n = {{d1_sqrt}} is the trial-division bound, a different quantity."
    },
    {
      "question": "In JavaScript, why does (0 - 1) % 5 evaluate to -1 instead of 4?",
      "options": [
        "JavaScript % works on absolute values and negates the result whenever either operand is negative",
        "JavaScript % keeps the dividend's sign, while Python's % takes the divisor's sign",
        "JavaScript % matches Python's, and the -1 comes from the array read, not from the remainder"
      ],
      "answer": 1,
      "explanation": "JavaScript's % matches C's remainder and keeps the sign of the dividend; Python floors toward negative infinity. 7 % -5 is 2 in JavaScript, which a negate-if-either-negative rule would get wrong."
    },
    {
      "question": "Multiplying two numbers near 10⁹ modulo 10⁹ + 7 in JavaScript needs BigInt because:",
      "options": [
        "A double becomes Infinity above 10⁹, so any product of two such numbers prints as Infinity",
        "BigInt is simply faster than Number for integer products, so it is the default for modular arithmetic",
        "The product is near 10¹⁸, past 2⁵³, so a double rounds it before the % runs"
      ],
      "answer": 2,
      "explanation": "Doubles are exact for integers only up to 2⁵³ − 1 = {{d3_safe}}; above that the low bits are rounded away. Infinity only appears near 1.8 × 10³⁰⁸, far beyond a product of two numbers near 10⁹."
    }
  ]
}
```
