---
title: "Counting & Combinatorics"
kicker: "Math for DSA • Foundations • concept lesson"
headline: "Count the answer space first: search complexity is a combinatorial fact."
lede: "The size of an algorithm's output or search space dictates the theoretical floor of its runtime before writing a single line of code. From gift baskets to subset bitmasks and incremental binomial coefficients, combinatorics provides the map of what brute force can and cannot touch."
chips:
  - "independent choices **multiply**"
  - "subsets scale as **2ⁿ**; permutations as **n!**"
  - "combinations **divide out the overcount**"
  - "compute C(n, k) **stepwise to keep every value exact**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="hero-plot"><svg id="heroBaskets" viewBox="0 0 560 160" role="img" aria-label="Branching tree: each wrapping option branches into every ribbon color, and each of those into every token."></svg><div class="hero-labels" id="heroLabels"></div></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">2 × 4 × 3 = 24</b> <span id="heroUnit">baskets</span></div><div id="heroCap">The product rule multiplies independent choices at each sequential slot.</div></div></div></div>
---

## The custom gift basket and product rule {#insight toc="Product rule"}

```caption
Independent choices multiply: each slot in the sequence multiplies the number of configurations.
```

```vig "Tree diagram of choices branching from a single root"
<circle class="fa" cx="30" cy="56" r="6"/><line class="st" x1="36" y1="56" x2="80" y2="35"/><line class="st" x1="36" y1="56" x2="80" y2="77"/><circle class="fk" cx="80" cy="35" r="5"/><circle class="fk" cx="80" cy="77" r="5"/><line class="st" x1="85" y1="35" x2="140" y2="20"/><line class="st" x1="85" y1="35" x2="140" y2="50"/><circle class="fc" cx="140" cy="20" r="4"/><circle class="fc" cx="140" cy="50" r="4"/>
```

The Archive's gift shop lets visitors build a custom basket: pick one wrapping style, one ribbon color, and one small token to tuck inside.

This question — "how many different baskets are even possible?" — answers something fundamental to computer science. Combinatorics answers ==how big the answer space is==, and that count dictates the runtime of any algorithm that enumerates it.

The fundamental counting principle is the ==product rule==: independent choices multiply.

- 2 wrapping styles × 4 ribbon colors × 3 tokens = 24 possible baskets.
- **Sequences with repetition:** k independent slots with m choices each yield mᵏ possibilities (such as 10⁴ four-digit PINs).
- **Subsets:** 2ⁿ possibilities. Imagine inspecting n items and making an independent binary choice for each: "in the basket" or "out of the basket." Multiplying n twos gives 2ⁿ subsets.

```widget #basketWidget "The gift basket: branching tree of independent choices"
<div class="dsa-stage">
  <div class="dsa-card">
    <div class="dsa-head">
      <span class="dsa-title">Build a Custom Basket</span>
      <span class="dsa-badge good">Product Rule</span>
    </div>
    <div class="basket-slots-grid">
      <div class="slot-col">
        <span class="slot-name" id="wrapName"></span>
        <div id="wrapCol" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>
      <div class="slot-col">
        <span class="slot-name" id="ribbonName"></span>
        <div id="ribbonCol" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>
      <div class="slot-col">
        <span class="slot-name" id="tokenName"></span>
        <div id="tokenCol" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>
    </div>
    <div class="basket-formula-bar" id="basketCalc"></div>
  </div>
</div>
```

```key
Any algorithm that visits every subset does at least 2ⁿ units of work, because there are 2ⁿ subsets to visit.
```

## Permutations: order on the shelf {#walk toc="Permutations"}

```caption
Arranging k of n distinct items without replacement produces n! / (n − k)! ordered sequences.
```

```vig "Ordered slots along a shelf comparing arrangements"
<rect class="fa" x="25" y="35" width="40" height="42" rx="4"/><rect class="fk" x="75" y="35" width="40" height="42" rx="4"/><rect class="fc" x="125" y="35" width="40" height="42" rx="4"/><line class="st" x1="45" y1="20" x2="45" y2="35"/><line class="st" x1="95" y1="20" x2="95" y2="35"/>
```

Now imagine the shop building a limited-edition display shelf of k rare books chosen from n candidates, where the order from left to right matters.

For the first slot on the shelf, you have n choices. For the second slot, n − 1 choices remain. Continuing down to k slots:

> P(n, k) = n · (n − 1) · (n − 2) ⋯ (n − k + 1) = n! / (n − k)!

When arranging all n items (k = n), the count is simply n! (n factorial). Factorials grow faster than exponentials:

- 10! = 3,628,800: about 0.036 s at 10⁸ operations per second
- 13! = 6.2 × 10⁹: about 62 s
- 20! = 2.4 × 10¹⁸: about 771 years

If each permutation costs O(n) work to build or inspect, n · n! is 36,288,000 operations for n = 10, within a 10⁸ budget, and 439,084,800 for n = 11, over it. Brute force over all permutations is viable through n = 10.

```widget #permCombWidget "Permutations versus combinations: order on display versus crate packing"
<div class="dsa-stage">
  <div class="dsa-controls">
    <div id="pcTabs" class="extabs" role="group" aria-label="Choice size"></div>
  </div>
  <div class="dsa-card">
    <div class="dsa-head">
      <span class="dsa-title">Items: {A, B, C, D}</span>
      <span class="dsa-badge good" id="pcFormulaLabel">Overcount</span>
    </div>
    <div class="perm-comb-cols">
      <div class="pc-box">
        <div class="pc-title" id="permCountLabel">Permutations P(n, k)</div>
        <div class="pc-formula">Order matters (displays)</div>
        <div class="pc-items" id="permsList"></div>
      </div>
      <div class="pc-box">
        <div class="pc-title" id="combCountLabel">Combinations C(n, k)</div>
        <div class="pc-formula">Order ignored (crates)</div>
        <div class="pc-items" id="combsList"></div>
      </div>
    </div>
  </div>
</div>
```

```key
Order turns combinations into permutations: every unordered group of size k can be arranged in exactly k! distinct internal orderings.
```

## Combinations: divide out the overcount {#solution toc="Combinations"}

```caption
Computing C(n, k) one factor at a time keeps every intermediate an exact integer, so no factorial is ever built.
```

```vig "A group of elements partitioned into unordered combinations"
<circle class="fa" cx="50" cy="45" r="14"/><circle class="fa" cx="80" cy="45" r="14"/><rect class="st" x="25" y="25" width="80" height="40" rx="8"/><circle class="fk" cx="150" cy="45" r="14"/><circle class="fk" cx="180" cy="45" r="14"/><rect class="sc" x="125" y="25" width="80" height="40" rx="8"/>
```

When packing k of n books into a shipping crate, order inside the crate does not matter. The permutation count P(n, k) overcounts each selection by exactly k! (the number of ways to reorder those k books).

Dividing out that overcount produces ==the binomial coefficient==:

> C(n, k) = n! / (k! · (n − k)!)

Never compute C(n, k) by evaluating n! directly. In JavaScript, n! passes 2⁵³ at n = 19, stops being an exact double at n = 23, and becomes Infinity at n = 171.

Instead, compute C(n, k) by multiplying and dividing stepwise, folding k to min(k, n − k) so the loop runs as few times as possible:

> C(n, k) = Π (n − k + i) / i for i from 1 to k

After step i, the running product holds C(n − k + i, i). Because every binomial coefficient counts actual whole subsets, it is mathematically guaranteed to be an integer at every single iteration.

```code solution "n_choose_k: incremental multiply-divide binomial coefficient"
```

````warn
Computing factorials before dividing. In TypeScript, n! is exact only through n = 22, so C(55, 24) is the first result (scanning n, then k) that comes out wrong, and C(171, 2) = 14,535 comes back as Infinity because 171! does. Python integers never overflow, but dividing three huge factorials rounds the quotient to a float, so its first wrong answer is C(57, 25).

```code mistake "n_choose_k_mistake: raw factorial calculation"
```
````

## Answer space sizes and feasibility {#cost toc="Space sizes"}

```caption
Matching the constraints to a count (2ⁿ, n! or C(n, 2)) tells you what brute force costs before you write any code.
```

```vig "Curves rising rapidly to illustrate factorial and exponential explosions"
<path class="st" d="M25 85Q90 80 120 20"/><path class="sc" d="M25 85Q120 85 215 35"/>
```

A problem's constraints give away its intended algorithmic family. Take a budget of 10⁸ operations and O(n) work per state. Subsets then fit through n = 22 (22 · 2²² = 92,274,688 operations) and not n = 23 (23 · 2²³ = 192,937,984). Permutations fit through n = 10 (10 · 10! = 36,288,000) and not n = 11 (11 · 11! = 439,084,800). Pairs cost one operation each, so C(n, 2) fits through n = 14,142.

```widget #spaceSizesWidget "Reading answer-space sizes off problem constraints"
<div class="dsa-stage">
  <div class="dsa-controls">
    <div id="spaceTabs" class="extabs" role="group" aria-label="Input size preset"></div>
  </div>
  <div class="dsa-card">
    <div class="dsa-head">
      <span class="dsa-title">Answer space size against a 10⁸-operation budget</span>
      <span class="dsa-badge good">Feasibility Map</span>
    </div>
    <table class="space-table" aria-label="Combinatorial growth comparison table">
      <thead>
        <tr>
          <th>Strategy</th>
          <th>States</th>
          <th>Operations</th>
          <th>Time at 10⁸ ops/s</th>
        </tr>
      </thead>
      <tbody id="spaceTableBody"></tbody>
    </table>
    <div id="spaceSummary" style="font: 500 12px JetBrains Mono, monospace; color: var(--mut); margin-top: 8px;"></div>
  </div>
</div>
```

```rosetta "Answer space size by algorithmic strategy"
Problem Request | Answer Space Formula | Feasible Input Scale
All subsets / selections | 2ⁿ | n ≤ 22 (2²² = 4,194,304 states)
All permutations / orderings | n! | n ≤ 10 (10! = 3,628,800 states)
All unordered pairs | C(n, 2) = n(n − 1)/2 | n ≤ 14,142 (n = 10,000 gives 49,995,000 pairs)
All k-combinations | C(n, k) | Varies: C(30, 15) = 155,117,520, over a 10⁸ budget
```

```derivation
Let C(n, k) be computed stepwise, with k ≤ n − k.
Accumulator after step i is C(n − k + i, i).
The ratio between consecutive binomial coefficients is:
C(m, i) / C(m − 1, i − 1) = m / i, where m = n − k + i.
Since C(m, i) counts the number of subsets of size i from m elements, it is an integer by definition.
Therefore, the division by i always divides the intermediate product evenly with zero remainder.
With k replaced by min(k, n − k), the loop makes that many multiplications and that many divisions, so it runs in O(min(k, n − k)) time and O(1) extra space.
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing along three paths"
<path class="st" d="M120 95V25"/><rect class="fa" x="65" y="25" width="110" height="15" rx="3"/><rect class="fk" x="65" y="50" width="110" height="15" rx="3"/>
```

```variants
[
  {
    "title": "Math Drills",
    "source": "next lesson",
    "text": "Rapid-fire practice testing logs, JS modulo traps, huge products, and counting search spaces."
  },
  {
    "title": "Backtracking: Subsets & Permutations",
    "source": "core curriculum",
    "text": "Building search trees that traverse 2ⁿ subsets and n! permutations with early pruning."
  },
  {
    "title": "Dynamic Programming: Pascal's Identity",
    "source": "state transition module",
    "text": "Turning C(n, k) = C(n - 1, k - 1) + C(n - 1, k) into memoized table walks."
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
      "question": "How many distinct unordered pairs can be formed from n items, and what does that say about all-pairs brute force?",
      "options": [
        "n(n − 1) pairs, because the pair (a, b) and the pair (b, a) count separately when you choose two",
        "n² pairs, because each of the n items can be matched with any of the n items, itself included",
        "C(n, 2) = n(n − 1)/2 pairs, exactly what a nested loop over i < j visits, so O(n²)"
      ],
      "answer": 2,
      "explanation": "Choosing 2 of n without order is C(n, 2) = n(n − 1)/2, exactly the number of (i, j) pairs a nested loop with j > i visits. Counting both orders doubles it, and allowing i = j adds n more."
    },
    {
      "question": "A problem has n ≤ 16 and asks about every possible selection of elements. What is the intended approach?",
      "options": [
        "Search all n! permutations, since a selection is an arrangement of the chosen elements in some order",
        "Enumerate all 2ⁿ subsets, {{subsets16}} here, with a bitmask or backtracking over take-or-skip",
        "Use an O(n log n) greedy, since a constraint this small is meant for sorting-based solutions"
      ],
      "answer": 1,
      "explanation": "A selection is a subset, and a subset is a take-or-skip choice for each of the n items, so there are 2ⁿ of them: {{subsets16}} at n = 16. Order does not matter for a selection, so n! overcounts."
    },
    {
      "question": "Why compute C(n, k) by multiplying and dividing one factor at a time instead of n!/(k!(n − k)!)?",
      "options": [
        "Factorials are O(n²) to compute, while the stepwise loop is O(k), so it is asymptotically faster",
        "Dividing n! by k!(n − k)! at the end leaves a fraction, but stepwise division always gives integers",
        "Factorials leave the exact range long before C(n, k); each stepwise value is a small integer"
      ],
      "answer": 2,
      "explanation": "C(50, 3) = {{choose50_3}} is small, but 50! has {{digits50}} digits, far beyond a 64-bit integer or an exact double. After step i the running value is C(n − k + i, i), never more than the final C(n, k)."
    }
  ]
}
```
