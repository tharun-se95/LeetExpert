---
title: "Analyzing Loops & API Complexity"
kicker: "Big O • Foundations • concept lesson"
headline: "Sequence means add; nesting means multiply."
lede: "The reflex 'loop equals linear, two loops equals quadratic' misleads whenever counters jump or loops sit end-to-end. Learn to count non-unit steps rigorously and uncover the quadratic traps lurking inside one-line API calls."
chips:
  - "multiplicative step is **logarithmic**"
  - "sequential passes **add**"
  - "hidden library calls **multiply**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroLoops" viewBox="0 0 560 140" role="img" aria-label="Illustration: three loop shapes side by side showing O(log n), O(n), and O(n^2)."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">3</b> <span id="heroUnit">canonical loop shapes</span></div><div id="heroCap"></div></div></div></div>
---

## The clerk's repetitive floor tasks {#problem toc="Repetitive tasks"}

```caption
Watching how repetitive floor actions are structured determines how the whole shift scales.
```

```vig "A conveyor belt feeding boxes into sorting stations"
<rect class="fa" x="20" y="55" width="200" height="12" rx="4"/><rect class="fk" x="40" y="32" width="24" height="20" rx="3"/><rect class="fk" x="90" y="32" width="24" height="20" rx="3"/><rect class="fk" x="140" y="32" width="24" height="20" rx="3"/><circle class="fc" cx="52" cy="74" r="5"/><circle class="fc" cx="102" cy="74" r="5"/><circle class="fc" cx="152" cy="74" r="5"/>
```

Back on the postal sorting floor, daily duties consist of repetitive operations on stacks of letters and boxes. How those tasks combine governs whether total work remains manageable or balloons uncontrollably:

- **Two separate tasks (sequence).** First, you stamp each letter in a stack of n. Next, you scan each parcel in a cart of n. Because these actions happen one after another, total effort is the **sum** of the two passes: n + n = 2n → **Θ(n)**.
- **Box inside box (nesting).** Next, you receive a crate holding n shipping boxes. Inside each box lie n parcel slots, and you must apply an individual label to every item. Here your work **multiplies**: n boxes × n items per box = n² → **Θ(n²)**.

The difference is not the raw number of loops—it is whether one loop runs **inside** the other.

```key
Sequential code adds costs (O(A) + O(B)); nested code multiplies outer iterations by the cost per iteration (O(A) × O(B)).
```

## Loops that do not step by one {#insight toc="Loop shapes"}

```caption
When loop variables double or depend on outer indices, closed-form math predicts exact iterations.
```

```vig "A logarithmic spiral beside an arithmetic triangle"
<path class="st" d="M30 80C50 80 70 70 90 50S110 20 130 20"/><rect class="fa" x="160" y="70" width="16" height="16" rx="2"/><rect class="fa" x="180" y="50" width="16" height="36" rx="2"/><rect class="fa" x="200" y="30" width="16" height="56" rx="2"/>
```

The intuition that "one loop equals O(n)" only holds when the loop counter steps by a constant offset. When it multiplies or depends on an outer bound, you must count iterations explicitly:

1. **Loop A (Doubling counter):** `i` begins at 1 and doubles each pass (1, 2, 4, 8, …). It halts when i ≥ n, executing ⌈log₂ n⌉ times → **O(log n)**.
2. **Loop B (Two sequential loops):** First loop runs n times; second loop runs n times. Total work: n + n = 2n → **O(n)**.
3. **Loop C (Nested dependent bound):** Inner loop runs from 0 up to i. On iteration i, it executes i steps. Summing across all passes yields 0 + 1 + 2 + … + (n - 1) = n(n − 1)/2 → **O(n²)**.

```widget #loopShapes "Loop shapes: count iterations vs closed form"
<div class="loop-stage">
  <div class="extabs" role="group" aria-label="Choose loop shape"></div>
  <div class="slider-control">
    <div class="slider-label"><span>Input size n:</span><b id="nVal"></b></div>
    <input type="range" class="slider-input" id="loopN" min="1" max="64" value="16" aria-label="Input size n">
  </div>
  <div class="loop-stats">
    <div class="stat-box"><span class="stat-label">Counted Work</span><span class="stat-val" id="countedVal"></span></div>
    <div class="stat-box"><span class="stat-label">Closed Form</span><span class="stat-val accent" id="closedVal"><span id="formulaLabel"></span></span></div>
    <div class="stat-box"><span class="stat-label">Verification</span><span class="stat-val good" id="matchVerdict"></span></div>
  </div>
  <div class="loop-trace" id="loopTrace"></div>
</div>
```

```derivation
**Loop A (i doubles): ⌈log₂ n⌉ iterations, so O(log n) time.** Doubling k times reaches 2ᵏ ≥ n, which solves to k = ⌈log₂ n⌉.

**Loop B (sequential loops): 2n iterations, so O(n) time.** Statements back-to-back sum: n + n = 2n, with constants discarded in asymptotic analysis.

**Loop C (dependent bound j < i): n(n - 1) / 2 iterations, so O(n²) time.** Pairing smallest and largest terms (0 + (n-1)) + (1 + (n-2)) + … yields n(n − 1)/2 steps.
```

```key
A dependent bound like j < i halves the constant factor but does not escape quadratic growth: n(n - 1) / 2 is still Θ(n²).
```

## Implementation: counting loop shapes {#solution toc="Implementation"}

```caption
Instrumenting real code directly verifies that counted loops match mathematical formulas.
```

```vig "A code document displaying instrumented counter variables"
<rect class="fa" x="30" y="20" width="180" height="72" rx="6"/><line class="st" x1="45" y1="40" x2="110" y2="40"/><line class="st" x1="45" y1="56" x2="150" y2="56"/><line class="st" x1="45" y1="72" x2="90" y2="72"/><circle class="fc" cx="180" cy="56" r="10"/>
```

We write an explicit function to execute and count each shape. In production systems, knowing which shape your code forms tells you immediately whether it can scale to millions of elements.

```code solution "count_iterations: tracking loop execution counts"
```

````warn
Pricing `x in list` as O(1). Checking membership in a list of size k scans all k elements under the hood. Inside an n-iteration loop over distinct items, every search scans the whole accumulating output and misses, which turns what looks like a single loop into 0 + 1 + 2 + … + (n-1) = n(n − 1)/2 comparisons: quadratic O(n²) time!

```code mistake "dedupe_list: hidden quadratic loop inside list scan"
```
````

## Price the body honestly: hidden API loops {#cost toc="Honest pricing"}

```caption
Library methods like in list, .includes(), slice(), and string concatenation conceal full linear loops.
```

```vig "A magnifying glass exposing a nested loop hidden inside a method box"
<rect class="fa" x="25" y="35" width="80" height="42" rx="6"/><circle class="fc" cx="150" cy="50" r="24"/><line class="st" x1="167" y1="67" x2="195" y2="95"/><rect class="fk" x="138" y="42" width="24" height="16" rx="3"/>
```

The multiplication rule requires the *true* cost of the loop body. Modern standard libraries pack high-level operations into single expressions that mask significant asymptotic work:

- `x in list` (Python) / `arr.includes(x)` (JavaScript) → linear scan: **O(k)**
- `list.insert(0, val)` / `arr.unshift(val)` → shifts all existing elements: **O(n)**
- `s += piece` in a loop: strings are immutable, so each `+=` may copy everything built so far → **O(n²)** for the whole loop (CPython sometimes extends in place, but nothing in the language promises it)

Replacing the list membership test with a ==hash set== drops each check from O(k) to O(1), restoring overall complexity to linear O(n).

```widget #apiPricing "Price the body honestly: Set vs List membership"
<div class="api-stage">
  <div class="extabs" role="group" aria-label="Choose list size n"></div>
  <div class="api-compare">
    <div class="api-card set-approach">
      <div class="api-head">Set Membership (O(1) per check)</div>
      <div class="api-cost good" id="setCost"></div>
      <div class="api-desc">Uses hash table lookups to check presence in constant time, scaling linearly with n.</div>
    </div>
    <div class="api-card list-approach">
      <div class="api-head">List Membership (O(k) linear scan)</div>
      <div class="api-cost bad" id="listCost"></div>
      <div class="api-desc">Scans the accumulating output array on every element, causing triangular quadratic explosion.</div>
    </div>
  </div>
  <div class="loop-trace" id="ratioBadge"></div>
</div>
```

```key
Before pricing an outer loop, identify the asymptotic complexity of every method called inside its body.
```

## Where next {#next toc="Where next"}

```vig "A signpost with three arrows pointing along three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Analyzing Recursion: The Tree Method",
    "source": "next lesson",
    "text": "Moving from iterative loops to recursive functions, visualizing call trees, and computing work level by level."
  },
  {
    "title": "Amortized Analysis & Dynamic Arrays",
    "source": "foundations module",
    "text": "How dynamic arrays double their capacity, balancing occasional O(n) reallocations against frequent O(1) appends."
  },
  {
    "title": "Hash Tables & Fast Lookup",
    "source": "Linear Structures stage",
    "text": "The mechanics behind O(1) average-case set lookups, bucket distribution, and collision handling."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "Three questions as rows, the first one answered and ticked"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "What is the overall complexity of a loop running n times whose inner loop counter triples from 1 up to n?",
      "options": [
        "O(n) — because a multiplicative loop exits so rapidly that its work is swallowed by the outer loop",
        "O(n log n) — n outer passes, each running the tripling loop about log₃ n times",
        "O(n²) — because any loop nested inside another outer loop of size n multiplies into quadratic growth"
      ],
      "answer": 1,
      "explanation": "The outer loop runs n times. The inner loop multiplies by 3 on each pass, running log₃ n times. Multiplying outer iterations by inner passes gives O(n log n)."
    },
    {
      "question": "A loop runs n times and calls an O(n) helper on every pass. After that loop ends, a second, separate loop runs n times. What is the total cost?",
      "options": [
        "O(n³) — multiplying the nested helper with the sequential loop after it",
        "O(n) + O(n) = O(n) — treating the helper as an independent linear pass",
        "O(n²) — the nested loop body dominates the subsequent sequential pass"
      ],
      "answer": 2,
      "explanation": "The nested call costs n × O(n) = O(n²). The subsequent sequential loop adds O(n). In asymptotic notation, the highest order term dominates: O(n² + n) = O(n²)."
    },
    {
      "question": "Why does checking x in list inside a loop of size n result in O(n²) time instead of O(n)?",
      "options": [
        "Because list membership tests scan elements one by one, performing up to k comparisons on each pass.",
        "Because appending to the output list copies the whole list each time, so the appends are what cost O(n) per pass.",
        "Because the outer loop has to restart from the beginning every time a duplicate is found and skipped."
      ],
      "answer": 0,
      "explanation": "An array has no index lookup by value: finding an item requires scanning up to its current length. Repeated inside an n-element loop, this produces 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 total checks, which is Θ(n²)."
    }
  ]
}
```
