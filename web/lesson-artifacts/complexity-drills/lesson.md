---
title: "Complexity Drills"
kicker: "Big O & Complexity Analysis · practice lesson"
headline: "Six scenarios, six code shapes: commit before you reveal."
lede: "Back on the warehouse floor one last time. Below are six real-world code snippets representing the classic patterns: sequential passes, shrinking bounds, halving loops, hidden body costs, branching recursion, and matrix scans. For each drill: commit to a time and auxiliary-space answer before opening the reveal, and check whether your prediction matches the instrumented operation count."
chips:
  - "commit to time and space **before revealing**"
  - "price the loop body **honestly**"
  - "branching twice with halving **is linear O(n)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroDrills" viewBox="0 0 560 220" role="img" aria-label="Animation: Six complexity drill scenario cards highlighting patterns from sequential loops to recursive branching."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">1</b> <span id="heroUnit">of 6 drills</span></div><div id="heroCap"></div></div></div></div>
---

## How to drill {#problem toc="How to drill"}

```caption
Commit to your prediction, check the growth ratio, and fix any rule you misapplied.
```

```vig "A target bullseye beside a clipboard checklist"
<circle class="st" cx="50" cy="56" r="30"/><circle class="fa" cx="50" cy="56" r="20"/><circle class="fk" cx="50" cy="56" r="10"/><path class="st" d="M100 56H130M125 51L130 56L125 61"/><rect class="fa" x="144" y="26" width="60" height="66" rx="6"/><circle class="fg" cx="160" cy="42" r="5"/><circle class="fg" cx="160" cy="58" r="5"/><circle class="fg" cx="160" cy="74" r="5"/>
```

Complexity analysis is a reading skill. When you encounter code in an interview or code review, you need to recognize its growth rate by reading its loop bounds, function calls, and data structures.

For each of the six drills below:
1. Examine the code snippet in both languages.
2. Select your prediction for **time complexity** and **auxiliary space**.
3. Open the counted operations reveal to check the ratio across doubling inputs ($n$, $2n$, $4n$).

## Drill 1: Sequential passes {#solution toc="Drill 1"}

```caption
Sequential loops add: O(n) + O(n) = O(n) time and O(1) space.
```

```vig "Two separate sequential loop passes over a collection"
<rect class="fa" x="20" y="44" width="80" height="26" rx="4"/><path class="st" d="M110 57H136M131 52L136 57L131 62"/><rect class="fk" x="146" y="44" width="80" height="26" rx="4"/>
```

**The scenario:** Two separate passes over the same collection — first tallying every package's weight, then subtracting half of each one.

```code solution "Drill 1: sequential loops"
```

```widget #drill-card-1 "Drill 1: Predict time and auxiliary space"
<div class="drill-card">
  <div class="drill-h">
    <span class="drill-title">Drill 1: Sequential Passes</span>
    <span class="drill-badge">Predict below</span>
  </div>
  <div class="drill-choices" role="group" aria-label="Drill 1 choices">
    <button type="button" class="drill-opt" aria-pressed="false"><span>A) O(n) time, O(1) auxiliary space</span><b>Sequential add</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>B) O(n) time, O(n) auxiliary space</span><b>Extra list space</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>C) O(n²) time, O(1) auxiliary space</span><b>Nested multiply</b></button>
  </div>
  <button type="button" class="btn2 btn-reveal" aria-expanded="false">Show counted operations</button>
  <div class="drill-reveal-area" style="display:none">
    <table class="drill-table">
      <thead><tr><th>Input n</th><th>Measured Iterations</th><th>Growth Ratio</th></tr></thead>
      <tbody>
        <tr><td>n = 10</td><td>20 iterations</td><td>baseline</td></tr>
        <tr><td>n = 20</td><td>40 iterations</td><td>2.0x</td></tr>
        <tr><td>n = 40</td><td>80 iterations</td><td>2.0x</td></tr>
      </tbody>
    </table>
    <div class="drill-verdict"><b>Fitted Class: O(n) time, O(1) space.</b> Two sequential loops add: O(n) + O(n) = O(2n) = O(n). One accumulator variable `total`: O(1) space.</div>
  </div>
</div>
```

## Drill 2: Triangular dependent bounds {#build toc="Drill 2"}

```caption
A nested loop with inner bound j < i yields n(n - 1) / 2 comparisons: O(n²) time.
```

```vig "A triangular staircase of comparison blocks"
<rect class="fa" x="20" y="80" width="30" height="20" rx="3"/><rect class="fa" x="54" y="60" width="30" height="40" rx="3"/><rect class="fa" x="88" y="40" width="30" height="60" rx="3"/><rect class="fk" x="122" y="20" width="30" height="80" rx="3"/>
```

**The scenario:** Every package checked against every package that comes after it, searching for a pair that cancels out to zero.

```widget #drill-card-2 "Drill 2: Predict time and auxiliary space"
<div class="drill-card">
  <div class="drill-h">
    <span class="drill-title">Drill 2: Handshake Loop</span>
    <span class="drill-badge">Predict below</span>
  </div>
  <div class="drill-choices" role="group" aria-label="Drill 2 choices">
    <button type="button" class="drill-opt" aria-pressed="false"><span>A) O(n) time — shrinking bound collapses to one pass</span><b>Shrinking range</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>B) O(n log n) time — shrinking bound halves work</span><b>Logarithmic factor</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>C) O(n²) time — triangular sum halves only the constant</span><b>Quadratic pair</b></button>
  </div>
  <button type="button" class="btn2 btn-reveal" aria-expanded="false">Show counted operations</button>
  <div class="drill-reveal-area" style="display:none">
    <table class="drill-table">
      <thead><tr><th>Input n</th><th>Measured Comparisons</th><th>Growth Ratio</th></tr></thead>
      <tbody>
        <tr><td>n = 10</td><td>45 comparisons</td><td>baseline</td></tr>
        <tr><td>n = 20</td><td>190 comparisons</td><td>4.22x</td></tr>
        <tr><td>n = 40</td><td>780 comparisons</td><td>4.11x</td></tr>
      </tbody>
    </table>
    <div class="drill-verdict"><b>Fitted Class: O(n²) time, O(1) auxiliary space.</b> Inner iterations: (n−1) + (n−2) + … + 1 = n(n−1)/2. The 1/2 is a constant factor; the growth is quadratic.</div>
  </div>
</div>
```

## Drill 3: Halving outer with full inner {#insight toc="Drill 3"}

```caption
Outer loop halves i across log₂ n steps; inner loop runs n steps each: O(n log n) time.
```

```vig "Outer halving loop multiplied by a full linear inner scan"
<path class="st" d="M30 30H110M30 55H70M30 80H50"/><rect class="fk" x="140" y="24" width="80" height="66" rx="4"/>
```

**The scenario:** An outer loop halves an index $i$ while an inner loop runs a full pass of size $n$ on every single round.

```widget #drill-card-3 "Drill 3: Predict time and auxiliary space"
<div class="drill-card">
  <div class="drill-h">
    <span class="drill-title">Drill 3: Halving Outer Loop</span>
    <span class="drill-badge">Predict below</span>
  </div>
  <div class="drill-choices" role="group" aria-label="Drill 3 choices">
    <button type="button" class="drill-opt" aria-pressed="false"><span>A) O(log n) time — halving outer loop dictates the cost</span><b>Halving outer</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>B) O(n log n) time — log₂ n outer rounds × n inner steps</span><b>Multiply bounds</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>C) O(n²) time — nested loops are always quadratic</span><b>Nested loops</b></button>
  </div>
  <button type="button" class="btn2 btn-reveal" aria-expanded="false">Show counted operations</button>
  <div class="drill-reveal-area" style="display:none">
    <table class="drill-table">
      <thead><tr><th>Input n</th><th>Measured Iterations</th><th>Growth Ratio</th></tr></thead>
      <tbody>
        <tr><td>n = 16</td><td>64 iterations</td><td>baseline</td></tr>
        <tr><td>n = 32</td><td>160 iterations</td><td>2.50x</td></tr>
        <tr><td>n = 64</td><td>384 iterations</td><td>2.40x</td></tr>
      </tbody>
    </table>
    <div class="drill-verdict"><b>Fitted Class: O(n log n) time, O(1) space.</b> Outer loop halves i: log₂ n passes. Inner loop executes n times on every pass regardless of i. Product: n · log n.</div>
  </div>
</div>
```

## Drill 4: Hidden slice and scan {#trap toc="Drill 4"}

```caption
An innocent one-liner slice and scan in the loop body hides O(n²) time and O(n) space.
```

```vig "A loop icon concealing an expanding buffer underneath"
<circle class="st" cx="60" cy="56" r="26"/><path class="sc" d="M78 40L86 48L78 56"/><rect class="fr" x="120" y="40" width="90" height="32" rx="4"/>
```

**The scenario:** For every package, a check secretly re-slices the remaining array and scans it.

````warn
Pricing the loop body as O(1). Creating a slice `nums[1:]` allocates a new array of size n - 1 (O(n) time and space), and the membership check `x in slice` scans it linearly (O(n) time). A linear loop with an O(n) body executes in O(n²) time.

```code mistake "drill4_mistake: hidden linear slice and scan"
```
````

```widget #drill-card-4 "Drill 4: Predict time and auxiliary space"
<div class="drill-card">
  <div class="drill-h">
    <span class="drill-title">Drill 4: Hidden Body Price</span>
    <span class="drill-badge">Predict below</span>
  </div>
  <div class="drill-choices" role="group" aria-label="Drill 4 choices">
    <button type="button" class="drill-opt" aria-pressed="false"><span>A) O(n) time, O(1) space — only one for-loop is written</span><b>Single loop</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>B) O(n²) time, O(1) space — temporary slice is discarded</span><b>Discarded slice</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>C) O(n²) time, O(n) space — body allocates slice and scans</span><b>Slice + scan</b></button>
  </div>
  <button type="button" class="btn2 btn-reveal" aria-expanded="false">Show counted operations</button>
  <div class="drill-reveal-area" style="display:none">
    <table class="drill-table">
      <thead><tr><th>Input n</th><th>Measured Work</th><th>Growth Ratio</th></tr></thead>
      <tbody>
        <tr><td>n = 10</td><td>180 operations</td><td>baseline</td></tr>
        <tr><td>n = 20</td><td>760 operations</td><td>4.22x</td></tr>
        <tr><td>n = 40</td><td>3,120 operations</td><td>4.11x</td></tr>
      </tbody>
    </table>
    <div class="drill-verdict"><b>Fitted Class: O(n²) time, O(n) space.</b> Pricing the body honestly: slicing copies ~n elements (O(n) auxiliary space), and membership testing is O(n). Outer loop (n) × body (O(n)) = O(n²) time.</div>
  </div>
</div>
```

## Drill 5: Branching twice and halving {#cost toc="Drill 5"}

```caption
Branching twice is not exponential if the input halves each call: O(n) time and O(log n) stack.
```

```vig "A binary recursion tree branching down to leaf nodes"
<circle class="fa" cx="120" cy="20" r="10"/><line class="st" x1="112" y1="28" x2="80" y2="52"/><line class="st" x1="128" y1="28" x2="160" y2="52"/><circle class="fa" cx="80" cy="56" r="8"/><circle class="fa" cx="160" cy="56" r="8"/><line class="st" x1="74" y1="62" x2="50" y2="84"/><line class="st" x1="86" y1="62" x2="100" y2="84"/><line class="st" x1="154" y1="62" x2="140" y2="84"/><line class="st" x1="166" y1="62" x2="190" y2="84"/>
```

**The scenario:** A task delegated to two assistants, each getting half the load, repeating recursively.

```widget #drill-card-5 "Drill 5: Predict time and auxiliary space"
<div class="drill-card">
  <div class="drill-h">
    <span class="drill-title">Drill 5: Branching & Halving</span>
    <span class="drill-badge">Predict below</span>
  </div>
  <div class="drill-choices" role="group" aria-label="Drill 5 choices">
    <button type="button" class="drill-opt" aria-pressed="false"><span>A) O(log n) time — halving dominates the recursion</span><b>Halving dominance</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>B) O(2ⁿ) time — two recursive calls cause exponential blowup</span><b>Exponential tree</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>C) O(n) time — 2 branches × log n depth gives 2^(log n) = n leaves</span><b>Linear leaves</b></button>
  </div>
  <button type="button" class="btn2 btn-reveal" aria-expanded="false">Show counted operations</button>
  <div class="drill-reveal-area" style="display:none">
    <table class="drill-table">
      <thead><tr><th>Input n</th><th>Recursive Calls</th><th>Growth Ratio</th></tr></thead>
      <tbody>
        <tr><td>n = 16</td><td>31 calls</td><td>baseline</td></tr>
        <tr><td>n = 32</td><td>63 calls</td><td>2.03x</td></tr>
        <tr><td>n = 64</td><td>127 calls</td><td>2.01x</td></tr>
      </tbody>
    </table>
    <div class="drill-verdict"><b>Fitted Class: O(n) time, O(log n) auxiliary space.</b> Recursion tree: doubling width each level, log₂ n levels deep: ~2^(log₂ n) = n total calls. Branching twice is not exponential when input halves.</div>
  </div>
</div>
```

```key
Branching twice is not automatically exponential: the depth of the recursion tree decides whether leaf count is 2ⁿ or n.
```

## Drill 6: Full n × n matrix traversal {#node toc="Drill 6"}

```caption
Scanning every cell of an n × n matrix is O(n²) in dimension n, but linear in cell count.
```

```vig "An n by n grid of cells with an arrow scanning each row"
<rect class="fa" x="40" y="24" width="22" height="22" rx="3"/><rect class="fa" x="66" y="24" width="22" height="22" rx="3"/><rect class="fa" x="92" y="24" width="22" height="22" rx="3"/><rect class="fa" x="40" y="50" width="22" height="22" rx="3"/><rect class="fa" x="66" y="50" width="22" height="22" rx="3"/><rect class="fa" x="92" y="50" width="22" height="22" rx="3"/><rect class="fa" x="40" y="76" width="22" height="22" rx="3"/><rect class="fa" x="66" y="76" width="22" height="22" rx="3"/><rect class="fk" x="92" y="76" width="22" height="22" rx="3"/>
```

**The scenario:** Packages arranged in a full $n \times n$ grid; the job is to find the single heaviest package.

```widget #drill-card-6 "Drill 6: Predict time and auxiliary space"
<div class="drill-card">
  <div class="drill-h">
    <span class="drill-title">Drill 6: Grid Traversal</span>
    <span class="drill-badge">Predict below</span>
  </div>
  <div class="drill-choices" role="group" aria-label="Drill 6 choices">
    <button type="button" class="drill-opt" aria-pressed="false"><span>A) O(n) time — outer loop over rows dominates</span><b>Row loop</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>B) O(n²) time — quadratic in n, linear in cell count</span><b>Optimal cell scan</b></button>
    <button type="button" class="drill-opt" aria-pressed="false"><span>C) O(n²) is suboptimal and should be pruned</span><b>Prunable search</b></button>
  </div>
  <button type="button" class="btn2 btn-reveal" aria-expanded="false">Show counted operations</button>
  <div class="drill-reveal-area" style="display:none">
    <table class="drill-table">
      <thead><tr><th>Input Grid</th><th>Cells Visited</th><th>Growth Ratio</th></tr></thead>
      <tbody>
        <tr><td>10 × 10</td><td>100 visits</td><td>baseline</td></tr>
        <tr><td>20 × 20</td><td>400 visits</td><td>4.00x</td></tr>
        <tr><td>40 × 40</td><td>1,600 visits</td><td>4.00x</td></tr>
      </tbody>
    </table>
    <div class="drill-verdict"><b>Fitted Class: O(n²) time in grid dimension, O(1) space.</b> The input contains n² cells; finding a maximum requires examining each cell at least once. Quadratic in dimension is linear in input size.</div>
  </div>
</div>
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing down three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Arrays & Dynamic Arrays",
    "source": "Linear Structures stage",
    "text": "The foundations of sequential memory: pointer arithmetic, contiguous storage, and in-place transformations."
  },
  {
    "title": "Nodes and Pointers",
    "source": "Linked Lists module",
    "text": "Moving from contiguous arrays to node-link structures where elements point to memory locations."
  },
  {
    "title": "Math for DSA",
    "source": "Foundations stage",
    "text": "Floor arithmetic, bit manipulation, logarithms, and summation series that prove the complexity classes used throughout the course."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "Three question rows with one checked off"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "Drill 2: what is the time complexity of the nested handshake loop?",
      "options": [
        "O(n) — since the inner loop range shrinks each pass, the total inner iterations collapse to a single pass",
        "O(n log n) — the inner loop shrinks each pass, and a shrinking iteration bound produces a logarithmic factor",
        "O(n²) — inner iterations sum to n(n-1)/2, halving only the constant factor"
      ],
      "answer": 2,
      "explanation": "Inner iterations: (n−1) + (n−2) + … + 1 = n(n−1)/2. The 1/2 factor is a constant multiplier; the complexity class is quadratic O(n²)."
    },
    {
      "question": "Drill 3: why is the outer halving loop combined with a full inner loop O(n log n)?",
      "options": [
        "The outer loop halves i across log₂ n passes, and each pass performs a full n inner iterations",
        "The outer loop halving dominates completely, so the inner loop contributes only a negligible constant factor",
        "The inner loop runs n times and the outer loop runs n times, producing quadratic behavior despite the halving"
      ],
      "answer": 0,
      "explanation": "The outer loop executes log₂ n times. In every outer iteration, the inner loop executes n times. Multiplying gives n · log₂ n operations."
    },
    {
      "question": "Drill 5 branches twice and halves n each call. What is its time complexity?",
      "options": [
        "O(log n) — halving is the dominant signal in recursion regardless of how many recursive branches fan out",
        "O(2ⁿ) — any recursive function that makes two recursive calls per invocation produces exponential blowup",
        "O(n) — 2 branches per level across log₂ n levels yield about 2^(log₂ n) = n leaf calls"
      ],
      "answer": 2,
      "explanation": "The tree depth is log₂ n levels. Because the width doubles at each level, the leaf layer has 2^(log₂ n) = n leaves. Total calls is 2n - 1 = O(n)."
    }
  ]
}
```
