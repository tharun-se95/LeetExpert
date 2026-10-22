---
title: "Arrays in Memory"
kicker: "Arrays · Stage 1 Module 4 · concept lesson"
headline: "One unbroken block of memory: pure arithmetic to reach any element, high price to move anything."
lede: "Picture a train of identical, permanently coupled cars sitting on a straight length of track, numbered 0, 1, 2, … from the engine back. Every car is the same length, so if you know the engine's position and a car's number, you know exactly how far down the track that car sits — no walking the platform counting cars, just multiply the car number by the car length. That single picture is almost the whole lesson: an array is one contiguous block of memory holding equal-sized slots, and that single sentence explains everything arrays are good and bad at."
chips:
  - "address arithmetic: **base + i × slot_size**"
  - "random access: **O(1) directly**"
  - "insert/delete shifts: **O(n − i)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroTrain" viewBox="0 0 560 220" role="img" aria-label="Animation: a train of identical coupled cars sits on a straight track at contiguous memory addresses. Selecting any index instantly computes the byte address by direct multiplication, jumping directly to that slot without walking intervening cars."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">hops</span> taken</div><div id="heroCap"></div></div></div></div>
---

## What an array actually is {#node toc="What an array is"}

```caption
An unbroken block of equal-sized slots turns element lookup into instant arithmetic.
```

```vig "Contiguous memory cells with direct address arrow jumping to slot 3"
<rect class="fa" x="16" y="44" width="36" height="32" rx="4"/><rect class="fa" x="56" y="44" width="36" height="32" rx="4"/><rect class="fa" x="96" y="44" width="36" height="32" rx="4"/><rect class="fk" x="136" y="44" width="36" height="32" rx="4"/><rect class="fa" x="176" y="44" width="36" height="32" rx="4"/><path class="st" d="M16 32H154M150 28L154 32L150 36"/><circle class="fc" cx="16" cy="32" r="3"/><line class="sc" x1="154" y1="32" x2="154" y2="42"/>
```

On the tracks above, the train's cars are numbered 0, 1, 2, … from the engine back. Every car is the same length, so knowing the engine's position and any car's index gives you that car's physical position immediately — no walking the platform counting cars, just a single multiplication: car number × car length.

That physical picture explains the fundamental structure of an ==array==: **one contiguous block of memory** holding equal-sized slots. Because the block is unbroken and every slot occupies the exact same byte width, the memory address of slot i is pure arithmetic:

> address(i) = base_address + i × slot_size

That's why `arr[i]` is ==O(1)==: the computer doesn't *search* for index 7 — it computes 7's physical memory address in a single CPU instruction and jumps there directly. No other position is touched. Compare a chain of linked nodes (Linked Lists module), where reaching item 7 means walking 7 hops: same "get the i-th item" request, completely different mechanics.

```rosetta "The array, read as memory"
In the code | In physical memory
`arr[i]` | byte address computed as `base + i × slot_size`
`arr[0]` | the base address, allocated contiguously by the runtime
`slot_size` | fixed byte width per element (4 bytes for int32, 8 bytes for int64 / pointer)
`i × slot_size` | exact byte offset from base address; zero hops needed
`arr[i] = value` | direct write to computed address in O(1) time
```

```code solution "Address calculation & append at end"
```

The interactive model below displays a live RAM buffer. Change the base address, slot size, or target index to see how direct address arithmetic works at the hardware level.

```widget #addressCalc "Interactive RAM address calculator"
<div class="cm-ctrls">
  <div class="cm-slider-wrap">
    <span>Base address:</span>
    <input type="number" id="baseInput" value="4096" min="0" max="65536" step="64" style="width: 80px;" aria-label="Base memory address">
  </div>
  <div class="cm-seg" id="sizeSeg" role="group" aria-label="Slot size">
    <button type="button" data-size="4" aria-pressed="false">4 Bytes (int32)</button>
    <button type="button" data-size="8" aria-pressed="true">8 Bytes (int64 / ptr)</button>
  </div>
  <div class="cm-slider-wrap">
    <span>Index i: <b id="idxLabel">3</b></span>
    <input type="range" id="idxSlider" min="0" max="7" value="3" aria-label="Element index">
  </div>
</div>
<div class="ram-board">
  <div class="ram-formula" id="formulaText">
    address(3) = base (4096) + 3 × 8B = 4120
  </div>
  <div class="ram-strip" id="ramStrip"></div>
</div>
```

```key
An array is one unbroken block of equal-sized slots; random access is direct multiplication, never a search.
```

## The costs, from the layout {#cost toc="Layout costs"}

```caption
Contiguity forbids gaps: inserting or removing an element forces every subsequent slot to shift.
```

```vig "Array insertion shifting elements to the right to open a slot"
<rect class="fa" x="16" y="44" width="32" height="30" rx="3"/><rect class="fk" x="52" y="44" width="32" height="30" rx="3"/><rect class="fa" x="88" y="44" width="32" height="30" rx="3"/><path class="st" d="M124 59H148M144 55L148 59L144 63"/><rect class="fa" x="152" y="44" width="32" height="30" rx="3"/><rect class="fa" x="188" y="44" width="32" height="30" rx="3"/>
```

Every array cost is a consequence of "contiguous, equal-sized, packed":

```rosetta "Operation costs from memory layout"
Operation | Time complexity and physical rationale
Read / write `arr[i]` | O(1) via direct address arithmetic: base + i × slot_size
Append at end (free capacity) | O(1) write into next unused contiguous slot
Insert at index i | O(n − i): contiguity forbids gaps; every subsequent element shifts right
Delete at index i | O(n − i): every subsequent element shifts left to close the gap
Search unsorted | O(n): no sorted structure to exploit; must scan linearly
```

The shifting cost is the one people forget. `list.insert(0, x)` in Python or `arr.unshift(x)` in JavaScript reads as one innocent line but moves the entire array — on the train, coupling a new car in right behind the engine means uncoupling every single car behind that point and rolling each one back one position to make room, because the cars are physically joined and nothing can occupy two positions at once. A loop doing n front-insertions costs 1 + 2 + ⋯ + (n − 1) shifts — the triangular sum:

> Total shifts = n(n − 1) / 2

For 10,000 insertions, that is **49,995,000** shifts instead of 10,000 writes — an accidental slowdown of nearly **5,000×**!

```code mistake "The accidental quadratic: repeated front insertions"
```

Use the simulator below to insert elements at the front, middle, or end, and observe how contiguity forces every subsequent element to shift.

```widget #shiftSim "Array insertion & shifting simulator"
<div class="cm-ctrls">
  <div class="cm-seg" role="group" aria-label="Insert position">
    <button type="button" id="btnShiftFront" class="btn2">Insert at Front [0] (Unshift)</button>
    <button type="button" id="btnShiftMid" class="btn2">Insert at Mid</button>
    <button type="button" id="btnShiftEnd" class="btn2">Append at End (Push)</button>
  </div>
  <button type="button" id="btnShiftReset" class="btn2">Reset</button>
</div>
<div class="shift-board">
  <div class="shift-track" id="shiftTrack"></div>
</div>
<div class="m-metrics">
  <div class="m-card">
    <span class="m-k">Last Shifts</span>
    <span class="m-v warn" id="lblLastShifts">0</span>
    <span class="m-sub">elements moved</span>
  </div>
  <div class="m-card">
    <span class="m-k">Total Shifts</span>
    <span class="m-v bad" id="lblTotalShifts">0</span>
    <span class="m-sub">cumulative moves</span>
  </div>
  <div class="m-card">
    <span class="m-k">Triangular Sum</span>
    <span class="m-v pop" id="lblTheoretical">0</span>
    <span class="m-sub">n(n-1)/2 bound</span>
  </div>
</div>
```

```warn
Inserting at index 0 shifts the entire array; repeated front insertions turn linear code into accidental O(n²) quadratic runtime. Build at the end and reverse once, or use a deque.
```

## Cache locality: the hidden second superpower {#walk toc="Cache locality"}

```caption
Modern CPUs pull 64-byte cache lines: sequential array scans get the next fifteen reads for free.
```

```vig "A 64-byte cache line bracket loading sixteen 4-byte elements together into CPU cache"
<rect class="st" x="16" y="30" width="208" height="24" rx="4" stroke-dasharray="3 3"/><rect class="fa" x="20" y="34" width="10" height="16" rx="2"/><rect class="fa" x="33" y="34" width="10" height="16" rx="2"/><rect class="fa" x="46" y="34" width="10" height="16" rx="2"/><rect class="fa" x="59" y="34" width="10" height="16" rx="2"/><rect class="fa" x="72" y="34" width="10" height="16" rx="2"/><rect class="fa" x="85" y="34" width="10" height="16" rx="2"/><rect class="fa" x="98" y="34" width="10" height="16" rx="2"/><rect class="fa" x="111" y="34" width="10" height="16" rx="2"/><path class="sc" d="M120 58V80M116 76L120 80L124 76"/><rect class="fk" x="90" y="84" width="60" height="20" rx="3"/>
```

Modern CPUs don't fetch one value from RAM at a time — they pull an unbroken **cache line** (standard 64 bytes) into fast L1/L2 cache. Concretely: a 64-byte line holds sixteen 4-byte integers, so reading `arr[0]` pulls `arr[0..15]` in together. The next fifteen reads (**15 of 16, ~94%**) hit fast cache for free before the CPU fetches from RAM again.

Scan in order and every fetch brings the next several elements along for free this way; the CPU's memory controller even detects the stride pattern and prefetches ahead. Scanning a linked structure scattered across heap memory defeats both effects — every pointer hop is a potential cache miss costing ~100× a cache hit.

```widget #cacheVisualizer "64-byte CPU cache line visualizer"
<div class="cm-ctrls">
  <div class="cm-seg" role="group" aria-label="Cache test mode">
    <button type="button" id="btnScanArray" class="btn2">Scan Contiguous Array</button>
    <button type="button" id="btnScanScattered" class="btn2">Traverse Scattered Pointers</button>
  </div>
  <button type="button" id="btnResetCache" class="btn2">Reset</button>
</div>
<div class="cache-board">
  <div class="cache-bracket">
    <div class="cache-bracket-header">
      <span>CPU L1 Cache Line · 64 Bytes</span>
      <span>16 words × 4 bytes</span>
    </div>
    <div class="cache-cells-grid" id="cacheGrid"></div>
  </div>
</div>
<div class="m-metrics">
  <div class="m-card">
    <span class="m-k">Cache Hits</span>
    <span class="m-v good" id="lblCacheHits">0</span>
    <span class="m-sub">served from L1 cache (~1ns)</span>
  </div>
  <div class="m-card">
    <span class="m-k">Cache Misses</span>
    <span class="m-v bad" id="lblCacheMisses">0</span>
    <span class="m-sub">RAM bus fetch (~100ns)</span>
  </div>
  <div class="m-card">
    <span class="m-k">Hit Rate</span>
    <span class="m-v pop" id="lblCacheHitRate">—</span>
    <span class="m-sub">spatial locality efficiency</span>
  </div>
</div>
```

```key
Array scans and linked list scans are both O(n) asymptotically, but cache lines make contiguous arrays 10–100× faster in wall-clock time.
```

When two designs tie on paper, bet on the contiguous one.

## What Python lists and JS arrays really are {#build toc="Dynamic arrays"}

```caption
Neither language gives raw fixed arrays: list and Array are dynamic arrays wrapping a contiguous buffer.
```

```vig "Dynamic array struct holding length, capacity, and a pointer to contiguous memory buffer"
<rect class="fa" x="16" y="36" width="60" height="40" rx="4"/><circle class="fk" cx="64" cy="56" r="3"/><path class="st" d="M64 56H116M112 52L116 56L112 60"/><rect class="st" x="120" y="28" width="104" height="56" rx="4"/><rect class="fa" x="126" y="36" width="20" height="40" rx="2"/><rect class="fa" x="150" y="36" width="20" height="40" rx="2"/><rect class="fa" x="174" y="36" width="20" height="40" rx="2"/><rect class="sc" x="198" y="36" width="20" height="40" rx="2" stroke-dasharray="2 2"/>
```

Neither Python nor JavaScript gives you raw fixed-size arrays. `list` and `Array` are **dynamic arrays**: a contiguous memory block *plus* bookkeeping (current length, allocated capacity) and an automatic resizing growth policy.

Two implementation footnotes worth knowing:

- **Python** lists store a contiguous array of 8-byte *pointers* to objects, not the objects themselves. Contiguity applies to the pointer buffer, while the objects sit in the heap.
- **JavaScript** V8 engines store arrays contiguously in hardware memory as long as you keep them dense and same-typed (e.g. `PACKED_SMI_ELEMENTS`). Writing far past the end or mixing conflicting types can demote them to a hash table dictionary mode. Keep arrays dense.

## Check your understanding {#quiz toc="Quiz"}

```quiz
{
  "questions": [
    {
      "question": "Why is reading `arr[500000]` O(1) rather than requiring a walk to position 500,000?",
      "options": [
        "Its address is computed directly: base + 500000 × slot_size — contiguity plus equal slot sizes make location a formula, not a search",
        "Caches make walks fast — the CPU's prefetcher recognizes the access pattern of stepping through a sequence and pre-loads the target position before the walk even reaches it",
        "The runtime keeps an index of every position — a hidden lookup table maps each index to a memory address so that access doesn't need to be computed on the fly"
      ],
      "answer": 0,
      "explanation": "Random access is address arithmetic. This is THE defining array property, and it requires both contiguity and uniform slot size."
    },
    {
      "question": "A loop builds a list by always inserting each new item at index 0. Total cost for n items?",
      "options": [
        "O(n²) — insert at the front shifts all existing elements, giving 1 + 2 + ⋯ + (n − 1) shifts",
        "O(n log n) — each front-insertion shifts a shrinking fraction of the array as later inserts land closer to a full block, giving the same total as a merge-style halving pattern",
        "O(n) — each insert is one operation, and since it's a single built-in call rather than an explicit loop, its cost is counted as constant regardless of how many elements it touches"
      ],
      "answer": 0,
      "explanation": "Front insertion is O(current length) because contiguity forbids gaps. Summing over the loop is the triangular series. Build at the end (O(1) amortized) and reverse once, or use a deque."
    },
    {
      "question": "Array scan and linked-list scan are both O(n). Why is the array scan often 10–100× faster in practice?",
      "options": [
        "Cache lines: contiguous elements arrive in fast cache together and get prefetched; scattered nodes miss cache on every hop",
        "It isn't — same class, same speed; any measured difference in practice is noise from benchmarking methodology rather than a real property of the two data layouts",
        "Arrays use less total memory — linked-list nodes carry pointer overhead per element, and it's this smaller total footprint, not access pattern, that accounts for the speedup"
      ],
      "answer": 0,
      "explanation": "Big O counts operations, not memory-hierarchy behavior. Contiguity turns most element accesses into cache hits — a constant factor, but a huge one."
    }
  ]
}
```

## Where to go from here {#next toc="What's next"}

```caption
Dynamic arrays wrap contiguous buffers with growth rules that keep appends O(1) amortized.
```

```vig "Expanding buffer row with elements copying into a doubled array"
<rect class="fa" x="16" y="32" width="40" height="20" rx="3"/><rect class="fa" x="16" y="60" width="80" height="20" rx="3"/><path class="st" d="M104 70H148M144 66L148 70L144 74"/><rect class="fk" x="152" y="60" width="80" height="20" rx="3"/>
```

Now that you understand raw contiguous layout and shifting trade-offs, the next lesson builds the **Dynamic Array from scratch** — including the doubling growth policy that pays for occasional expensive resizes and keeps `append` strictly O(1) amortized.
