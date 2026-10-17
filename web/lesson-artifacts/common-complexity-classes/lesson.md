---
title: "The Common Complexity Classes"
kicker: "Big O • Foundations • concept lesson"
headline: "Seven growth curves dictate what your code can afford."
lede: "Nearly every algorithm in computer science falls into one of seven complexity classes. From constant-time lookups to factorial explosions, the difference between them is not minutes versus seconds — it is seconds versus the lifespan of the universe."
chips:
  - "seven canonical **growth classes**"
  - "halving yields **logarithmic time**"
  - "constraints dictate the **target class**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroLadder" viewBox="0 0 560 160" role="img" aria-label="Log-log plot of the seven complexity classes from n = 1 to a million, against the one-second budget of 10^8 operations."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum"></b> <span id="heroUnit"></span></div><div id="heroCap"></div></div></div></div>
---

## Spreading the word {#problem toc="Spreading the word"}

```caption
The effort and time to reach a population scales drastically depending on your algorithmic strategy.
```

```vig "A messenger in the town square calling out to residents"
<circle class="fc" cx="60" cy="40" r="10"/><path class="st" d="M60 50V80M45 60H75M60 80L45 102M60 80L75 102"/><path class="sc" d="M80 35Q110 30 140 20M80 40Q120 40 160 40M80 45Q110 50 140 60"/><circle class="fa" cx="170" cy="20" r="7"/><circle class="fa" cx="190" cy="40" r="7"/><circle class="fa" cx="170" cy="60" r="7"/>
```

Imagine you need to spread an urgent message to everyone in a town. The effort and time it takes will scale based on the town's population $n$ — and depending on which communication strategy you use, that scaling looks wildly different:

- **The megaphone:** You stand on a balcony in the town square and shout once. Whether the town has 10 residents or 10 billion, you shout once and you are done. Your effort is flat: ==constant time==.
- **The phone tree:** You call two friends, each of whom calls two more friends, and so on. The calls happen in rounds, and each round doubles how many people know. If the town's population doubles, the tree needs only one more round before everyone has heard: ==logarithmic time== to finish, even though the total number of calls still grows with $n$.
- **Door-to-door delivery:** You walk to every house individually to deliver a physical envelope. Your work scales one-to-one with the population: ==linear time==.
- **The handshake greeting:** Every resident must meet every other resident in person to shake hands. In a small village this is fine, but in a large city the total handshakes explode quadratically: ==quadratic time==.
- **The committee and route planning:** Evaluating every possible subset of citizens yields an exponential explosion, while calculating the optimal visiting sequence among all permutations yields a factorial nightmare.

Nearly every algorithm you will meet in this course falls into one of these seven fundamental strategies.

```key
Algorithmic complexity is not about raw speed on small inputs; it is the mathematical curve that dictates how workload explodes as input size scales.
```

## The ladder of complexity {#insight toc="The ladder"}

```caption
Seven canonical complexity classes define the standard performance landscape of computer science algorithms.
```

```vig "A ladder ascending from gentle slope to vertical wall"
<line class="st" x1="30" y1="95" x2="210" y2="95"/><line class="st" x1="30" y1="95" x2="45" y2="90"/><line class="st" x1="45" y1="90" x2="80" y2="82"/><line class="st" x1="80" y1="82" x2="130" y2="65"/><line class="st" x1="130" y1="65" x2="175" y2="35"/><line class="st" x1="175" y1="35" x2="200" y2="10"/><rect class="fa" x="35" y="91" width="6" height="4" rx="1"/><rect class="fa" x="70" y="81" width="6" height="4" rx="1"/><rect class="fa" x="120" y="66" width="6" height="4" rx="1"/><rect class="fk" x="165" y="38" width="6" height="4" rx="1"/><circle class="fc" cx="200" cy="10" r="5"/>
```

In asymptotic analysis, algorithms are grouped into a hierarchy called the **complexity ladder**. As $n$ increases, the curves separate with brutal finality:

```rosetta "The seven canonical complexity classes"
Class | Name | Characteristic Behavior
O(1) | Constant | Work is completely flat regardless of input size
O(log n) | Logarithmic | Each step discards a constant fraction of remaining candidates
O(n) | Linear | You touch each input element a bounded number of times
O(n log n) | Linearithmic | You perform log-work per element, or divide-and-conquer with linear merge
O(n²) | Quadratic | You compare every pair of elements with nested loops
O(2ⁿ) | Exponential | Each element makes an independent binary choice (all subsets)
O(n!) | Factorial | You enumerate every ordering or permutation
```

Drag the slider below across input sizes from $1$ to $1{,}000{,}000$ to watch the operation counts and wall clock times diverge. The dashed budget mark on each bar sits at $10^8$ operations — the standard one-second budget allowance of automated judges:

```widget #complexityLadder "The complexity ladder: operations and wall clock time across input sizes"
<div class="ladder-stage">
  <div class="ladder-ctrls">
    <div class="extabs" role="group" aria-label="Preset input sizes"></div>
    <div class="slider-group">
      <span>Input n:</span>
      <input type="range" id="ladderSlider" min="0" max="8" value="4" aria-label="Input size n on a logarithmic scale">
      <span class="slider-val" id="ladderNVal"></span>
    </div>
  </div>
  <div class="ladder-board">
    <div class="ladder-legend">
      <span>Complexity Class</span>
      <span class="legend-budget">1s Judge Ceiling (~10⁸ ops)</span>
      <span>Operations &amp; Wall Time</span>
    </div>
    <div id="ladderRows"></div>
  </div>
  <p class="ladder-note" id="ladderNote"></p>
</div>
```

```key
Beyond quadratic time, algorithms cease to be practical general-purpose solutions and become enumerations of combinatorial state spaces.
```

## O(log n) — why halving means log {#walk toc="Halving means log"}

```caption
Repeatedly dividing a candidate space by two reaches a single element in exactly floor(log2 n) steps.
```

```vig "A tree dividing into halves down to a single terminal element"
<circle class="fa" cx="120" cy="20" r="8"/><circle class="fa" cx="70" cy="50" r="7"/><circle class="fa" cx="170" cy="50" r="7"/><circle class="fa" cx="45" cy="80" r="6"/><circle class="fa" cx="95" cy="80" r="6"/><circle class="fa" cx="145" cy="80" r="6"/><circle class="fk" cx="195" cy="80" r="6"/><line class="st" x1="114" y1="26" x2="76" y2="44"/><line class="st" x1="126" y1="26" x2="164" y2="44"/><line class="st" x1="66" y1="56" x2="49" y2="74"/><line class="st" x1="74" y1="56" x2="91" y2="74"/><line class="st" x1="166" y1="56" x2="149" y2="74"/><line class="st" x1="174" y1="56" x2="191" y2="74"/>
```

When beginners see $O(\log n)$, they often wonder where the logarithm comes from. In computer science, logarithms arise from **repeated division**.

Consider ==binary search==: you inspect the midpoint of a sorted array. With one single comparison, you discard half of the entire array. How many times can you divide $n$ items in half before only 1 item remains? By definition, that number is $\log_2 n$:

```derivation
**Deriving logarithmic halving:**
At step 0, we have $n$ candidates.
At step 1, we discard half, leaving $\frac{n}{2}$ candidates.
At step 2, we discard half again, leaving $\frac{n}{4} = \frac{n}{2^2}$ candidates.
At step $k$, there are $\frac{n}{2^k}$ candidates remaining.

The process stops when exactly 1 candidate remains:
$$\frac{n}{2^k} = 1 \implies 2^k = n \implies k = \log_2 n$$

Doubling the universe of data adds only one additional halving step: $\log_2(2n) = \log_2 n + 1$.
```

Use the stepper below to watch numbers collapse to $1$ under repeated halving:

```widget #halvingStepper "Halving stepper: tracing divisions by 2 down to 1"
<div class="halve-stage">
  <div class="halve-ctrls">
    <div class="extabs" role="group" aria-label="Starting value n"></div>
    <div class="halve-actions">
      <button type="button" class="btn2" id="btnStepHalve">Halve: n //= 2</button>
      <button type="button" class="btn2" id="btnResetHalve">Reset</button>
    </div>
  </div>
  <div class="halve-dash">
    <div class="h-card"><span class="h-k">Current Value n</span><span class="h-v" id="halveCurN"></span><span class="h-sub">remaining elements</span></div>
    <div class="h-card"><span class="h-k">Halvings Done</span><span class="h-v accent" id="halveStepCount"></span><span class="h-sub">loop iterations</span></div>
    <div class="h-card"><span class="h-k">Theoretical Bound</span><span class="h-v good" id="halveMathCheck"></span><span class="h-sub">exact power ceiling</span></div>
  </div>
  <div class="halve-bar-container">
    <div class="h-bar-label"><span>Search Range Remaining</span><span>n → 1</span></div>
    <div class="h-bar-track"><div class="h-bar-fill" id="halveBarFill" style="width: 100%;"></div></div>
  </div>
  <div class="halve-chain" id="halveChain"></div>
</div>
```

```key
Logarithmic scaling is the most powerful scaling property in computing: doubling the universe of data adds only a single comparison step.
```

## Implementation: counting halvings {#solution toc="Implementation"}

```caption
Implementing an explicit halving loop reveals how quickly numbers collapse to one.
```

```vig "A counter instrumenting code division instructions"
<rect class="fa" x="30" y="25" width="100" height="60" rx="6"/><line class="st" x1="45" y1="45" x2="115" y2="45"/><line class="st" x1="45" y1="60" x2="95" y2="60"/><circle class="fc" cx="160" cy="50" r="22"/><line class="st" x1="176" y1="66" x2="200" y2="90"/>
```

In code, the number of halvings before reaching $1$ is computed with a while loop that performs integer division. Notice that in Python we write `n //= 2` (floor division), while in TypeScript we explicitly write `Math.floor(n / 2)`:

```code solution "halvings: count divisions by 2 before reaching 1"
```

````warn
Using float division without integer truncation. In both Python (`/`) and JavaScript (`/`), division produces floating-point numbers. When halving an odd integer such as 3, `3 / 2` evaluates to `1.5`, which remains strictly greater than 1, triggering an extra spurious loop iteration and overcounting the true halving depth.

```code mistake "halvings_float_div: missing integer truncation in division"
```
````

## Reading constraints like a table of contents {#cost toc="Constraints table"}

```caption
Problem input limits announce the intended complexity class before you write a single line of code.
```

```vig "A stopwatch measuring operations against an 10^8 operations budget"
<circle class="fa" cx="120" cy="56" r="38"/><circle class="fk" cx="120" cy="56" r="32"/><line class="st" x1="120" y1="18" x2="120" y2="10"/><rect class="fa" x="112" y="6" width="16" height="5" rx="1"/><line class="st" x1="120" y1="56" x2="138" y2="38"/><circle class="fc" cx="120" cy="56" r="4"/>
```

Modern CPU cores execute roughly $10^8$ to $10^9$ cycles per second. On technical interview platforms and competitive programming judges, your code is typically allotted **1 to 2 seconds** of execution time before triggering a Time Limit Exceeded (TLE) error. This gives a reliable rule of thumb:

$$\text{Operation budget} \approx 10^8 \text{ simple operations}$$

When you read a problem description, the stated constraint on $n$ instantly narrows down the viable algorithmic strategies:

```widget #constraintsWidget "Constraints table: matching input limits to viable algorithm classes"
<div class="cons-stage">
  <div class="extabs" role="group" aria-label="Input size limits"></div>
  <div class="cons-detail">
    <div class="cons-panel">
      <span class="cons-h">Target Complexity Class</span>
      <span class="cons-target" id="consTarget"></span>
      <span class="cons-machinery" id="consMachinery"></span>
    </div>
    <div class="cons-panel">
      <span class="cons-h">Budget Analysis (~10⁸ ops/sec)</span>
      <span class="cons-break" id="consBreak"></span>
    </div>
  </div>
  <table class="cons-table" aria-label="Constraints mapping table">
    <thead>
      <tr>
        <th scope="col">Input Limit</th>
        <th scope="col">Target Class</th>
        <th scope="col">Typical Machinery</th>
      </tr>
    </thead>
    <tbody id="consTableBody"></tbody>
  </table>
</div>
```

```key
A problem constraint is not a suggestion; it is a mathematical announcement specifying which complexity classes can pass within the operation budget.
```

## Where next {#next toc="Where next"}

```vig "A signpost pointing to input dependency, loop analysis, and recursion trees"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Input Dependency: Best, Worst, & Average",
    "source": "next lesson",
    "text": "How input ordering alters runtime: best-case floors, worst-case guarantees, and average case under explicit probability distributions."
  },
  {
    "title": "Analyzing Loops & API Complexity",
    "source": "following lesson",
    "text": "Techniques for pricing loops that double, sequential loops, dependent nested loops, and hidden linear calls inside standard library methods."
  },
  {
    "title": "Analyzing Recursion: The Tree Method",
    "source": "foundations module",
    "text": "Visualizing recursive function calls as trees, calculating work done per level, and summing geometric progressions to determine Big O bounds."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "A checklist with three questions, the first ticked and verified"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "An algorithm's cost doubles when n doubles. Which class?",
      "options": [
        "O(log n)",
        "O(n)",
        "O(n²)"
      ],
      "answer": 1,
      "explanation": "Linear growth scales proportionally: 2× input → 2× work. O(n²) would 4×, and O(log n) would add a single step."
    },
    {
      "question": "Why is binary search O(log n) and not O(n)?",
      "options": [
        "Each comparison discards half the remaining candidates, so ~log₂ n comparisons reach a single element",
        "It checks elements faster than a scan does — each individual comparison in binary search executes in fewer CPU cycles than the per-element check inside a linear scan",
        "Sorted arrays are faster to read from memory — sorted data has better cache locality than unsorted data, which is what actually accounts for binary search's speed advantage"
      ],
      "answer": 0,
      "explanation": "The speed comes from *discarding*, not from faster per-element work: n → n/2 → n/4 → … → 1 takes log₂ n halvings by the definition of the logarithm."
    },
    {
      "question": "A problem says n ≤ 100,000. Which solution class is the intended target?",
      "options": [
        "O(n log n) or O(n): between about 10⁵ and 2 × 10⁶ operations",
        "O(n²) — 10¹⁰ operations, which a modern judge's few-second time limit can comfortably absorb since 10¹⁰ simple operations complete in well under a second on typical hardware",
        "O(2ⁿ) — since 100,000 is a large-looking number, the intended solution should be the most powerful brute-force tool available, enumerating every subset of the input"
      ],
      "answer": 0,
      "explanation": "At n = 10⁵, n² = 10¹⁰ operations — minutes, not seconds. n log n ≈ 1.7 × 10⁶ passes easily. Constraints are a statement of the expected class."
    }
  ]
}
```
