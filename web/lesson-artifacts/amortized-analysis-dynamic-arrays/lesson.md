---
title: "Amortized Analysis & Dynamic Arrays"
kicker: "Big O & Complexity Analysis · concept lesson"
headline: "Rare expensive spikes, paid for by quiet neighbors."
lede: "Placing a package on a shelf is instant until the shelf is full. When it fills up, you must build a new shelf twice as large and move every existing package over. That move is exhausting, but it buys a long run of cheap placements before the next one. Amortized analysis proves that over any sequence of operations, the average cost per operation is constant — because the spikes get rarer exactly as fast as they get bigger."
chips:
  - "doubling spaces spikes **exponentially**"
  - "banker's charge: **3 tokens per append**"
  - "fixed growth collapses to **O(n) amortized**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroShelf" viewBox="0 0 560 220" role="img" aria-label="Animation: an expanding shelf row. Items are placed into empty slots instantly until the shelf fills up, triggering a doubling move where existing items are copied over into a larger row."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">1</b> <span id="heroUnit">packages placed</span></div><div id="heroCap"></div></div></div></div>
---

## The expanding shelf row {#problem toc="Expanding shelf"}

```caption
A sequence of cheap operations punctuated by rare moves to a larger shelf.
```

```vig "A row of shelf slots holding packages with a new larger shelf below"
<rect class="fa" x="14" y="30" width="30" height="28" rx="4"/><rect class="fa" x="48" y="30" width="30" height="28" rx="4"/><rect class="fk" x="82" y="30" width="30" height="28" rx="4"/><rect class="st" x="116" y="30" width="30" height="28" rx="4" stroke-dasharray="3 3"/><path class="st" d="M120 74V90M116 86L120 90L124 86"/><rect class="fa" x="14" y="96" width="30" height="28" rx="4"/><rect class="fa" x="48" y="96" width="30" height="28" rx="4"/><rect class="fa" x="82" y="96" width="30" height="28" rx="4"/><rect class="fk" x="116" y="96" width="30" height="28" rx="4"/><rect class="st" x="150" y="96" width="30" height="28" rx="4" stroke-dasharray="3 3"/><rect class="st" x="184" y="96" width="30" height="28" rx="4" stroke-dasharray="3 3"/>
```

Back at your sorting desk, you manage a row of storage shelves for incoming packages. When a new package arrives, placing it in the next empty shelf slot is quick: just slide it into position. But what happens when the shelf is completely full? You have to move your entire setup to a new location. This move is exhausting: you must pick up every single package already on the shelf and carry it, one by one, over to the new rack.

To prevent spending all your time moving, you establish a rule: whenever the current shelf fills up, you build a new one that is exactly ==twice== the size of the old one. The moves grow larger, but they also become much rarer, separated by longer stretches of effortless placements.

This is a fundamentally different question from best, worst, and average-case analysis. Those lenses evaluate a *single call* across varying inputs. ==Amortized analysis== asks something else: **in any sequence of m operations on the same structure — including an adversarial sequence — what is the total cost divided by m?** There is no probability distribution or lucky input assumed; it is a worst-case guarantee over an entire sequence of operations.

## Live model: doubling against fixed growth {#build toc="Live model"}

```caption
Doubling keeps total copies under 2n; fixed growth repeats copies until the work turns quadratic.
```

```vig "Doubling capacity steps on the left compared to dense repeated copy steps on the right"
<rect class="fa" x="16" y="24" width="40" height="18" rx="3"/><rect class="fa" x="16" y="50" width="80" height="18" rx="3"/><rect class="fk" x="16" y="76" width="160" height="18" rx="3"/><path class="st" d="M190 20V94"/><line class="sc" x1="200" y1="24" x2="226" y2="24"/><line class="sc" x1="200" y1="38" x2="226" y2="38"/><line class="sc" x1="200" y1="52" x2="226" y2="52"/><line class="sc" x1="200" y1="66" x2="226" y2="66"/><line class="sc" x1="200" y1="80" x2="226" y2="80"/><line class="sc" x1="200" y1="94" x2="226" y2="94"/>
```

The canonical example of amortized efficiency is appending to a ==dynamic array== (Python `list`, JavaScript array). An append writes directly to the next free slot: O(1). When the backing array is full, it allocates a new buffer twice as large, copies every existing item into it, and only then writes the new element.

The live model below instruments both strategies on the same sequence of appends. Switch between doubling and fixed increments, step through placements, and observe how the running total of copies evolves.

```widget #model "Interactive dynamic array: doubling vs fixed growth"
<div class="model-ctrls">
  <div class="model-seg" role="group" aria-label="Resize strategy">
    <button type="button" id="strat-double" aria-pressed="true">Doubling (×2)</button>
    <button type="button" id="strat-fixed" aria-pressed="false">Fixed growth (+1)</button>
  </div>
  <div class="model-actions">
    <button type="button" id="btnAppend" class="btn2">Append item</button>
    <button type="button" id="btnReset" class="btn2">Reset</button>
  </div>
  <div class="model-slider-wrap">
    <span>Items n:</span>
    <input type="range" id="sliderN" min="1" max="32" value="9" aria-label="Number of items appended">
    <b id="lblN"></b>
  </div>
</div>
<div class="shelf-board">
  <div class="shelf-h">
    <span>Backing buffer: <b id="shelfSize"></b> / <b id="shelfCap"></b> slots used</span>
    <span>Marked cells were copied by the last resize</span>
  </div>
  <div class="shelf-cells" id="shelfCells"></div>
</div>
<div class="m-metrics">
  <div class="m-card"><span class="m-k">Size</span><span class="m-v" id="mSize"></span><span class="m-sub">elements stored</span></div>
  <div class="m-card"><span class="m-k">Capacity</span><span class="m-v" id="mCap"></span><span class="m-sub">allocated slots</span></div>
  <div class="m-card"><span class="m-k">Last Copies</span><span class="m-v" id="mCopies"></span><span class="m-sub">on this append</span></div>
  <div class="m-card"><span class="m-k">Total Copies</span><span class="m-v good" id="mTotalCopies"></span><span class="m-sub">cumulative moves</span></div>
  <div class="m-card"><span class="m-k">Bank Balance</span><span class="m-v pop" id="mBank"></span><span class="m-sub">saved credits</span></div>
  <div class="m-card"><span class="m-k">Avg Copies</span><span class="m-v good" id="mAvg"></span><span class="m-sub">copies / append</span></div>
</div>
<div class="m-table-wrap">
  <table class="m-table" aria-label="Append operation history">
    <thead>
      <tr><th>Append</th><th>Cap Before</th><th>Cap After</th><th>Copies</th><th>Total Copies</th></tr>
    </thead>
    <tbody id="traceBody"></tbody>
  </table>
</div>
<p class="m-note" id="modelNote"></p>
```

Notice the contrast. With doubling, the spikes get taller (1, 2, 4, 8, 16 copies), but the distance between spikes doubles every time. The quiet O(1) operations vastly outnumber the spikes, keeping the cumulative copies below twice the number of elements inserted. Switch to fixed growth and watch the bank: the same 3-token charge goes overdrawn within a few appends.

## The accounting method {#insight toc="Banker's method"}

```caption
Charge 3 tokens per append: 1 pays for today, 2 wait in the bank to pay for moving.
```

```vig "Three token coins stacked on top of an item slot"
<rect class="fa" x="20" y="54" width="36" height="36" rx="4"/><circle class="fg" cx="38" cy="22" r="7"/><circle class="fg" cx="38" cy="34" r="7"/><circle class="fg" cx="38" cy="46" r="7"/><rect class="fa" x="66" y="54" width="36" height="36" rx="4"/><circle class="fg" cx="84" cy="22" r="7"/><circle class="fg" cx="84" cy="34" r="7"/><circle class="fg" cx="84" cy="46" r="7"/><path class="st" d="M120 72H160M155 67L160 72L155 77"/><rect class="st" x="176" y="44" width="50" height="46" rx="8" stroke-dasharray="4 4"/><circle class="fc" cx="201" cy="67" r="14"/>
```

Summing the series $1 + 2 + 4 + \dots + n/2 \approx n$ works when the whole sequence is known in advance. But there is an even more powerful proof technique: the ==accounting method== (or Banker's view).

Imagine that on every append, you charge an amortized fee of **3 tokens**:
1. **1 token** pays for writing the new package into its shelf slot right now.
2. **2 tokens** are deposited into a bank account linked to that package.

Now consider the moment the shelf fills up at capacity $n$, triggering a resize. The shelf must move all $n$ packages. When was the last resize? At capacity $n/2$, which doubled the shelf to $n$. That means exactly the newest $n/2$ packages were inserted since the last move!

Each of those $n/2$ packages is still holding its 2 banked tokens:

$$(n/2) \times 2 = n \text{ tokens in the bank}$$

That is exactly enough to pay for copying all $n$ packages at 1 token each. The older half of the packages already spent their savings on the previous move; the newer half's savings cover this move in full. The bank balance never drops below zero, which proves that a flat charge of 3 operations per append covers every spike unconditionally.

```key
Amortized analysis guarantees the average cost over any sequence by charging quiet operations a small fee to pay for rare expensive peaks.
```

## Implementing a dynamic array {#solution toc="Implementation"}

```caption
Double the backing buffer when size reaches capacity, copy existing items, and write the new value.
```

```vig "Memory buffer copying elements across into a doubled block"
<rect class="fa" x="14" y="32" width="28" height="24" rx="3"/><rect class="fa" x="46" y="32" width="28" height="24" rx="3"/><path class="st" d="M28 58V78M28 78H28M60 58V78"/><rect class="fa" x="14" y="80" width="28" height="24" rx="3"/><rect class="fa" x="46" y="80" width="28" height="24" rx="3"/><rect class="fk" x="78" y="80" width="28" height="24" rx="3"/><rect class="st" x="110" y="80" width="28" height="24" rx="3" stroke-dasharray="3 3"/>
```

Here is `DynArray` implemented from scratch in Python and TypeScript, instrumented with a copy counter to verify the amortized bound.

```code solution "DynArray: append with capacity doubling"
```

````warn
Growing by a fixed constant (+1 or +10) instead of doubling. A copy of the entire array comes due every few appends regardless of how large the array already is. Total copy work accumulates to n(n - 1) ÷ 2, degrading the amortized cost from O(1) to O(n).

```code mistake "DynArrayFixed: fixed increment (+1)"
```
````

## The three lenses on performance {#cost toc="Three lenses"}

```caption
Worst-case, average-case, and amortized complexity answer three different questions.
```

```vig "Three magnifying lenses inspecting cost curves"
<circle class="st" cx="44" cy="50" r="22"/><line class="st" x1="60" y1="66" x2="74" y2="80"/><circle class="st" cx="120" cy="50" r="22"/><line class="st" x1="136" y1="66" x2="150" y2="80"/><circle class="st" cx="196" cy="50" r="22"/><line class="st" x1="212" y1="66" x2="226" y2="80"/><path class="sc" d="M30 56Q44 40 58 48"/><path class="sc" d="M106 58L134 42"/><path class="sc" d="M182 58Q196 56 210 38"/>
```

Whenever you see a performance claim, ask: *over what does this guarantee hold?* Conflating these three lenses is the primary source of surprise in algorithm performance.

```rosetta "Three performance promises"
Guarantee | What it actually promises | Example
Worst case | Holds for every single individual call on any input | Linear search in an unsorted list is O(n)
Average case | Expected cost over an assumed probability distribution of inputs | Hash table lookup is O(1) assuming uniform hashing
Amortized | Holds for the total cost of any sequence of operations, averaged per operation | Dynamic array append is O(1) amortized
```

```derivation
**Doubling: O(1) amortized.** For n appends starting at capacity 1, resizes copy 1 + 2 + 4 + … + 2^k elements, where 2^k < n. The geometric sum of powers of 2 is at most 2n - 1 copies. Adding n item placements gives fewer than 3n total operations, so under 3 operations per append on average.

**Fixed growth (+1): O(n) amortized.** Resizing every append copies 0 + 1 + 2 + … + (n - 1) = n(n - 1) ÷ 2 elements. Total work is quadratic O(n²), making each append cost O(n) on average.
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing down multiple paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Space Complexity",
    "source": "next lesson in this module",
    "text": "The memory cost of your algorithms: auxiliary space versus input space, in-place operations, and why recursion depth eats memory even when a function allocates no variables."
  },
  {
    "title": "Complexity Drills",
    "source": "practice lesson in this module",
    "text": "Six rapid-fire scenarios to sharpen your ability to price loop iterations, hidden library calls, and branching recursion trees before moving to data structures."
  },
  {
    "title": "Arrays & Strings",
    "source": "Linear Structures stage",
    "text": "Using dynamic arrays in real algorithms: two-pointer techniques, sliding windows, and in-place transformations that build on the amortized guarantees established here."
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
      "question": "Dynamic-array append is \"O(1) amortized.\" What does that claim actually say?",
      "options": [
        "Any sequence of n appends totals O(n) work, even though single appends can cost Θ(n)",
        "Appends are O(1) if you get lucky with resizes — the amortized guarantee only holds for sequences that happen to avoid triggering too many resizes",
        "Each individual append takes O(1) time — every single call into append, including the ones that trigger a resize, completes in constant time"
      ],
      "answer": 0,
      "explanation": "Amortized bounds are exact statements about worst-case totals over sequences: no luck or input distribution involved. Individual spikes are real but paid for by the cheap operations around them."
    },
    {
      "question": "Why does growing a dynamic array by a fixed 10 slots (instead of doubling) ruin the amortized bound?",
      "options": [
        "Allocation of small blocks is slow — requesting memory from the operating system in tiny increments incurs high per-call overhead compared to large blocks",
        "It wastes memory — growing by a fixed amount leaves more unused slack in the backing array on average than doubling does across long sequences",
        "A copy of the whole array then happens every 10 appends, totaling ~n²/20 work for n appends — O(n) amortized"
      ],
      "answer": 2,
      "explanation": "With additive growth, each spike costs ~n and spikes arrive at a constant rate, so total work is quadratic. Multiplicative growth spaces the spikes out exponentially — that is the whole trick."
    },
    {
      "question": "Amortized analysis differs from average-case analysis because…",
      "options": [
        "They are two names for the same idea — both average costs over multiple cases, so the underlying mathematics is identical even if terminology differs",
        "Amortized is only an empirical estimate — you must measure real operation sequences in practice, unlike a worst-case bound which is proven mathematically",
        "Amortized is a worst-case guarantee over operation sequences; average-case is an expectation over an assumed input distribution"
      ],
      "answer": 2,
      "explanation": "Amortized bounds hold for every sequence, even adversarial ones, with no probability anywhere. Average-case analysis requires an assumed probability distribution of inputs."
    }
  ]
}
```
