---
title: "Space Complexity"
kicker: "Big O & Complexity Analysis · concept lesson"
headline: "Counter space on your desk: what scratch work actually costs."
lede: "Back at your sorting desk, there is another cost besides how long a task takes: how much physical counter space it eats up while you work. Space complexity applies the same Big O machinery to memory, distinguishing total input space from auxiliary scratch space, and pricing the memory you never see: stack frames in the call stack."
chips:
  - "auxiliary space = **extra memory cleared**"
  - "stack frames cost **proportional to depth**"
  - "time-space trade: **spending memory to buy speed**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroDesk" viewBox="0 0 560 220" role="img" aria-label="Animation: Desk counter space showing a single-variable loop maintaining O(1) space versus a recursive call stack accumulating frames proportionally to input depth O(n)."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">8</b> <span id="heroUnit">input items</span></div><div id="heroCap"></div></div></div></div>
---

## Counter space on your desk {#problem toc="Counter space"}

```caption
Auxiliary space counts only the extra counter space you clear for scratch work.
```

```vig "A sorting desk holding a large bin of letters and a single scratch notepad beside it"
<rect class="fa" x="14" y="26" width="90" height="66" rx="6"/><circle class="fk" cx="36" cy="48" r="10"/><circle class="fk" cx="62" cy="48" r="10"/><circle class="fk" cx="80" cy="48" r="10"/><path class="st" d="M110 58H140M135 53L140 58L135 63"/><rect class="st" x="150" y="36" width="40" height="46" rx="4" stroke-dasharray="3 3"/><rect class="fg" x="160" y="48" width="20" height="22" rx="3"/>
```

When sorting mail at your warehouse desk, time is not the only physical constraint: the available surface area of the desk matters just as much. In complexity analysis, memory follows the same Big O asymptotic classification as time, with one crucial distinction:

- ==Total space==: every byte occupied during execution, including the original input data sitting on the desk.
- ==Auxiliary space==: only the *extra* scratch memory the algorithm itself allocates to do its job.

If you read through a bin of n letters and maintain a single running variable recording the heaviest letter seen so far, the entire desk holds n incoming letters (O(n) total space). But your scratch footprint is just one variable (**O(1) auxiliary space**). Unless stated otherwise, algorithm analysis focuses on auxiliary space: the input size is determined by the caller, but the extra memory used is the algorithm's choice.

## Live model: three functions on the same input {#build toc="Live model"}

```caption
A loop uses 1 variable, a copy allocates n cells, and recursion piles up n stack frames.
```

```vig "Three memory footprints: a single variable box, an array row, and a call stack pile"
<rect class="fa" x="16" y="44" width="36" height="36" rx="4"/><rect class="fa" x="70" y="52" width="20" height="20" rx="3"/><rect class="fa" x="94" y="52" width="20" height="20" rx="3"/><rect class="fa" x="118" y="52" width="20" height="20" rx="3"/><rect class="fa" x="164" y="24" width="56" height="18" rx="3"/><rect class="fa" x="164" y="46" width="56" height="18" rx="3"/><rect class="fa" x="164" y="68" width="56" height="18" rx="3"/>
```

Three different functions can process the exact same input of n items with radically different memory profiles. Toggle between the functions below to see how memory is arranged on the desk.

```widget #model "Interactive memory model: peak auxiliary space"
<div class="model-ctrls">
  <div class="model-seg" role="group" aria-label="Function implementation">
    <button type="button" id="btn-iter" aria-pressed="true">Running sum (loop)</button>
    <button type="button" id="btn-copy" aria-pressed="false">Building a copy</button>
    <button type="button" id="btn-rec" aria-pressed="false">Recursive sum</button>
  </div>
  <div class="model-slider-wrap">
    <span>Input n:</span>
    <input type="range" id="sliderN" min="1" max="24" value="8" aria-label="Input size n">
    <b id="lblN"></b>
  </div>
</div>
<div class="desk-board">
  <div class="desk-cols">
    <div class="desk-section">
      <div class="desk-sec-h">Call Stack Frames (Recursion)</div>
      <div class="stack-pile" id="stackPile"></div>
    </div>
    <div class="desk-section">
      <div class="desk-sec-h">Heap Allocations (Data structures)</div>
      <div class="heap-grid" id="heapGrid"></div>
    </div>
  </div>
</div>
<div class="m-metrics">
  <div class="m-card"><span class="m-k">Peak Extra Memory</span><span class="m-v good" id="mPeakAux"></span><span class="m-sub">scratch space</span></div>
  <div class="m-card"><span class="m-k">Auxiliary Class</span><span class="m-v good" id="mClass"></span><span class="m-sub">growth rate</span></div>
  <div class="m-card"><span class="m-k">Stack Depth</span><span class="m-v pop" id="mStackDepth"></span><span class="m-sub">active frames</span></div>
  <div class="m-card"><span class="m-k">Heap Cells</span><span class="m-v" id="mHeapCells"></span><span class="m-sub">allocated objects</span></div>
</div>
<p class="m-note" id="modelNote"></p>
```

Notice how `sum_iter` and `sum_recursive` produce the exact same numerical result in O(n) time, yet their memory footprints diverge completely: the iterative loop stays in O(1) space, while the recursive call stack expands linearly with n.

## The memory you do not see: the call stack {#trap toc="The call stack"}

```caption
Every active function call holds a frame in memory until its subordinate returns.
```

```vig "A stack of function frames growing vertically toward a stack overflow limit line"
<rect class="fa" x="50" y="76" width="140" height="20" rx="4"/><rect class="fa" x="50" y="52" width="140" height="20" rx="4"/><rect class="fa" x="50" y="28" width="140" height="20" rx="4"/><line class="sc" x1="40" y1="18" x2="200" y2="18" stroke-dasharray="4 4"/>
```

Recall the office delegation hierarchy: whenever a manager delegates work to an assistant, they must keep a sticky note on their own desk reminding them what to do with the assistant's answer when it arrives.

Every active function call occupies a ==stack frame== in memory. That frame stores function parameters, local variables, and the return address in code. When function `A` calls function `B`, `A`'s frame remains frozen in memory until `B` finishes and returns.

Recursion therefore costs auxiliary memory proportional to its maximum call ==depth== — even if the function body allocates no data structures whatsoever.

````warn
Assuming recursive functions use O(1) space because they allocate no arrays. Each recursive invocation adds a stack frame. A linear recursion n levels deep consumes O(n) auxiliary space. In Python the default recursion limit is 1,000 frames, so the recursive sum crashes with a RecursionError long before an iterative loop would notice the input was large.

```code mistake "Recursive sum: hidden O(n) call stack depth"
```
````

Stack depth varies by algorithm structure. In binary search, halving the search space each step produces a stack only log₂ n frames deep: **O(log n) auxiliary space**. In depth-first search along an unbranched path, the recursion reaches n frames deep: **O(n) auxiliary space**.

## Implementing the O(1) solution {#solution toc="Implementation"}

```caption
Accumulate the running total in a single variable to maintain constant auxiliary space.
```

```vig "An accumulator variable holding a single number as elements flow past"
<circle class="fa" cx="40" cy="56" r="18"/><path class="st" d="M68 56H114M108 50L114 56L108 62"/><rect class="fg" x="124" y="38" width="36" height="36" rx="6"/><path class="st" d="M170 56H216M210 50L216 56L210 62"/>
```

An iterative loop computes the sum by updating a single accumulator in place, using zero extra heap structures and exactly one stack frame.

```code solution "sum_iter: O(1) auxiliary space"
```

```key
Auxiliary space measures only the extra memory allocated by the algorithm; an in-place loop maintains O(1) space regardless of input size.
```

## The time–space trade {#cost toc="Time-space trade"}

```caption
A major principle of algorithm design is buying time with memory.
```

```vig "A balanced scale comparing execution time and auxiliary space"
<path class="st" d="M120 24V88M70 88H170"/><line class="st" x1="50" y1="40" x2="190" y2="40"/><circle class="fa" cx="50" cy="56" r="16"/><rect class="fk" x="174" y="42" width="32" height="28" rx="4"/>
```

A central theme in algorithm design is **trading memory for speed**. In Lesson 1, checking pairs with nested loops required O(n²) time but only O(1) auxiliary space. Introducing a `seen` hash set dropped the time to O(n) by spending O(n) auxiliary space to remember past elements.

```rosetta "Common space complexity patterns"
Pattern | Auxiliary space | Why
Running accumulator (loop) | O(1) | One or two scalar variables regardless of input size
Divide-and-conquer recursion | O(log n) | Stack frames proportional to tree depth (e.g. binary search)
Building a copy or buffer | O(n) | Full duplicate array or auxiliary buffer allocated
Seen set or hash table | O(n) | Up to n elements stored to achieve O(1) lookups
```

```derivation
**Iterative running sum: O(1) auxiliary space.** The loop overwrites a single variable `total` in each iteration. The stack depth remains constant at 1 frame.

**Building a copy: O(n) auxiliary space.** Allocating an array of n numbers creates n heap cells in memory, growing linearly with input length.

**Linear recursion: O(n) auxiliary space.** Function calls nest n levels deep before hitting the base case. Even without heap allocations, holding n simultaneous stack frames on the call stack consumes O(n) auxiliary memory.
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing down three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Complexity Drills",
    "source": "next lesson in this module",
    "text": "Put your time and space analysis skills into practice across six real-world code snippets covering sequential loops, triangular bounds, and recursive branching."
  },
  {
    "title": "Amortized Analysis & Dynamic Arrays",
    "source": "previous lesson in this module",
    "text": "How dynamic arrays double their capacity to achieve O(1) amortized append, and why fixed growth ruins the guarantee."
  },
  {
    "title": "Analyzing Recursion: The Tree Method",
    "source": "earlier lesson in this module",
    "text": "Visualizing recursive function calls as trees, summing the work per level, and pricing divide-and-conquer recurrences."
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
      "question": "A function recursively halves its input, doing O(1) work per call with no allocations. Its auxiliary space is…",
      "options": [
        "O(n) — recursive calls always inherit the full input size as their memory cost regardless of shrinking bounds",
        "O(1) — it allocates no structures in the body, so the recursion is assumed free of any extra memory charge",
        "O(log n) — one stack frame per level of halving"
      ],
      "answer": 2,
      "explanation": "Stack frames take physical memory even when the function body allocates no objects. Halving the problem at each call yields at most log₂ n simultaneous frames on the call stack at peak."
    },
    {
      "question": "Reversing an array by swapping ends toward the middle, versus building a reversed copy — what is the auxiliary-space comparison?",
      "options": [
        "O(1) versus O(n): one temporary per swap, against n newly allocated slots",
        "O(n) for both — the array contains n elements, so any operation performed on it inherits that linear space footprint",
        "O(log n) versus O(n) — swapping ends toward the middle still needs a small logarithmic amount of pointer bookkeeping"
      ],
      "answer": 0,
      "explanation": "Swapping ends in place requires only a single temporary variable for the swap: O(1) auxiliary space (the input array does not count). Building a reversed copy allocates n brand-new slots: O(n) auxiliary space."
    },
    {
      "question": "Why is auxiliary space preferred over total space when assessing algorithm memory?",
      "options": [
        "It measures only the memory the algorithm itself controls, isolating its cost from the size of the given problem",
        "Total space cannot be measured accurately because different operating systems report input buffer footprints differently",
        "Total space is always auxiliary space plus a constant, so reporting it would only repeat the same growth class"
      ],
      "answer": 0,
      "explanation": "An algorithm cannot control the size of the input data handed to it by the caller. Auxiliary space isolates the extra scratch memory allocated by the algorithm itself."
    }
  ]
}
```
