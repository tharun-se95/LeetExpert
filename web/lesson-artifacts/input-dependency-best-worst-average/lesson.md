---
title: "Input Dependency: Best, Worst, & Average"
kicker: "Big O • Foundations • concept lesson"
headline: "How long will this take depends on what is in the bin."
lede: "Asking 'what does this algorithm cost?' is underspecified when cost varies with the input arrangement, not just its size. Three honest answers bound the range: the best-case floor, the worst-case guarantee, and the average case across an assumed distribution."
chips:
  - "best case is the **floor**"
  - "worst case is the **guarantee**"
  - "average case demands a **stated distribution**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroMail" viewBox="0 0 560 160" role="img" aria-label="Animation: scanning across parcels in a mail bin from index 0 to index 7."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">1</b> <span id="heroUnit">probe</span></div><div id="heroCap"></div></div></div></div>
---

## The clerk and the mail bin {#problem toc="The mail bin"}

```caption
The work required to process a bin of parcels depends entirely on how the letters are arranged inside it.
```

```vig "A mail clerk standing in front of mail bins with parcels arriving in neat and disordered stacks"
<rect class="fa" x="20" y="30" width="30" height="60" rx="4"/><rect class="fa" x="55" y="30" width="30" height="60" rx="4"/><rect class="fa" x="90" y="30" width="30" height="60" rx="4"/><rect class="fk" x="25" y="40" width="20" height="15" rx="2"/><rect class="fa" x="140" y="70" width="80" height="20" rx="4"/><polygon class="fc" points="160,35 170,20 180,35"/><circle class="fa" cx="170" cy="45" r="8"/>
```

Imagine you are a clerk in a parcel-sorting post office. A bin containing letters arrives on your desk. You must process every item, but "how long will this take?" depends completely on what is actually in the bin, not just how many letters there are.

- **The lucky delivery.** If letters arrive already sorted by postal code, you slide them straight into their cubbies. This is the absolute minimum effort possible: the best case.
- **The messy delivery.** If letters arrive in total chaos or mislabeled, you must examine every single address in a directory. This requires the maximum work for that bin size: the worst case.
- **The typical day.** Most days, mail arrives in a mixed blend. Expected effort sits squarely in the middle: the average case.

Complexity analysis formalizes this distinction. "What does this algorithm cost?" is ambiguous until you specify which inputs you are measuring over.

```key
Algorithm complexity is not a single number per input size: it is a range bounded by the best possible input, the worst possible input, and the expected distribution.
```

## Linear search: best, worst, average {#insight toc="Linear search"}

```caption
Scanning elements one by one reveals three distinct, mathematically rigorous answers for the exact same function.
```

```vig "A pointer sliding across eight array cells from left to right"
<rect class="fa" x="15" y="45" width="22" height="26" rx="4"/><rect class="fa" x="42" y="45" width="22" height="26" rx="4"/><rect class="fa" x="69" y="45" width="22" height="26" rx="4"/><rect class="fa" x="96" y="45" width="22" height="26" rx="4"/><rect class="fa" x="123" y="45" width="22" height="26" rx="4"/><rect class="fk" x="150" y="45" width="22" height="26" rx="4"/><polygon class="fc" points="155,25 167,25 161,38"/><path class="st" d="M15 85H225"/>
```

Linear search makes all three bounds concrete. Given an array of $n$ elements, we search for a target value from index $0$ onward:

- **Target at index 0** $\rightarrow$ found on the very first comparison $\rightarrow$ best case **$\Theta(1)$**.
- **Target missing entirely** $\rightarrow$ every index must be checked $\rightarrow$ worst case **$\Theta(n)$**.
- **Target equally likely at any slot** $\rightarrow$ expected comparisons average halfway through $\rightarrow$ **$\Theta(n)$**.

```widget #mailSearch "Linear search: place the target anywhere and see comparisons"
<div class="mail-stage">
  <div class="extabs" role="group" aria-label="Search preset targets"></div>
  <div class="bin-slots" id="binSlots"></div>
  <div class="search-readout">
    <div class="sr-item"><span class="sr-label">Target Zip</span><span class="sr-val" id="targetLabel">142</span></div>
    <div class="sr-item"><span class="sr-label">Result Index</span><span class="sr-val good" id="idxLabel">index 0</span></div>
    <div class="sr-item"><span class="sr-label">Comparisons</span><span class="sr-val" id="cmpLabel">1 / 8</span></div>
    <div class="sr-item"><span class="sr-label">Classification</span><span class="sr-val good" id="classLabel">Best Case: Θ(1)</span></div>
  </div>
  <div class="avg-panel">
    <div class="avg-head">
      <span class="avg-title">Average-Case Distribution (uniform over 8 positions)</span>
      <span class="avg-math">(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8) / 8 = 36 / 8 = 4.5 checks</span>
    </div>
    <div class="avg-bars">
      <div class="avg-col"><div class="avg-bar" style="height: 12.5%;"></div><span class="avg-bar-label">1</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 25%;"></div><span class="avg-bar-label">2</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 37.5%;"></div><span class="avg-bar-label">3</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 50%;"></div><span class="avg-bar-label">4</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 62.5%;"></div><span class="avg-bar-label">5</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 75%;"></div><span class="avg-bar-label">6</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 87.5%;"></div><span class="avg-bar-label">7</span></div>
      <div class="avg-col"><div class="avg-bar" style="height: 100%;"></div><span class="avg-bar-label">8</span></div>
    </div>
    <div class="sim-row">
      <button type="button" class="btn" id="simAvg">Run 1,000 random queries</button>
      <span class="sim-res" id="simRes">Click to simulate uniform random lookups</span>
    </div>
  </div>
</div>
```

```derivation
**Best case: 1 comparison, so Θ(1) time.** The target sits at index 0 and returns immediately on the first check.

**Worst case: n comparisons, so Θ(n) time.** When the target is in the last slot or absent, the loop executes all n iterations.

**Average case: (n + 1) / 2 comparisons, so Θ(n) time.** Assuming each index is equally likely, the expected count is $\frac{1}{n} \sum_{i=1}^n i = \frac{n(n+1)}{2n} = \frac{n+1}{2}$.
```

```key
Average case requires an explicit probability distribution; without stating how inputs are distributed, average case has no mathematical meaning.
```

## Implementation: counting comparisons {#solution toc="Implementation"}

```caption
An explicit comparison counter inside the loop records every check made before returning.
```

```vig "A magnifying glass inspecting code comparison instructions"
<rect class="fa" x="30" y="25" width="100" height="60" rx="6"/><line class="st" x1="45" y1="45" x2="115" y2="45"/><line class="st" x1="45" y1="60" x2="95" y2="60"/><circle class="fc" cx="160" cy="50" r="22"/><line class="st" x1="176" y1="66" x2="200" y2="90"/>
```

In production code, linear search returns the index when found and `-1` otherwise. Here we increment a counter on every element comparison so the runtime cost is directly measurable.

```code solution "linear_search: return index and comparison count"
```

````warn
Returning on the first mismatch. Placing `return -1` inside the loop body causes the search to abort prematurely after one check whenever the target is not at index 0, incorrectly reporting absence on present elements.

```code mistake "linear_search_early_exit: returning on first mismatch"
```
````

## Insertion sort: when order shapes cost {#cost toc="Insertion sort"}

```caption
Input ordering alters insertion sort from an efficient linear pass into an expensive quadratic crawl.
```

```vig "Bars representing array values being reordered with an arrow pointing to sorted placement"
<rect class="fa" x="25" y="60" width="14" height="30" rx="2"/><rect class="fa" x="45" y="45" width="14" height="45" rx="2"/><rect class="fa" x="65" y="30" width="14" height="60" rx="2"/><rect class="fk" x="85" y="15" width="14" height="75" rx="2"/><path class="st" d="M120 50H180M170 42L180 50L170 58"/>
```

A second dramatic case-split occurs in ==insertion sort==. When inserting each new element into an already-sorted prefix:

- **Already sorted list:** Each element is compared once with its predecessor, finds its correct place immediately, and triggers zero shifts. Total comparisons: $n - 1 \rightarrow$ **$\Theta(n)$**.
- **Reversed list:** Every new item must be compared with every single preceding element and shifted all the way to the front. Total comparisons: $1 + 2 + \dots + (n-1) = \frac{n(n-1)}{2} \rightarrow$ **$\Theta(n^2)$**.
- **Random list:** On average each element shifts halfway through the sorted prefix $\rightarrow \approx \frac{n(n-1)}{4} \rightarrow$ **$\Theta(n^2)$**.

```widget #sortSplit "Insertion sort across three input orderings"
<div class="sort-stage">
  <div class="extabs" role="group" aria-label="Input arrangement"></div>
  <div class="sort-readout">
    <div><span class="sr-label">Input Array</span><div class="sort-arr" id="sortArr"></div></div>
    <div><span class="sr-label">Total Comparisons</span><div class="sr-val" id="sortCmp"></div></div>
    <div style="grid-column: 1 / -1;"><span class="sr-label">Complexity Bound</span><div class="sr-val" id="sortBound"></div></div>
  </div>
  <div class="chart" id="sortChart"></div>
</div>
```

```key
The worst case is the contractual guarantee that holds even against adversarial inputs, while best case reveals structural patterns an algorithm can exploit.
```

## Two famous case-splits in the wild {#walk toc="Famous splits"}

```caption
Quicksort and hash table lookups quietly depend on the distinction between average and worst case.
```

```vig "A tree splitting on the left and a bucket array with linked chains on the right"
<circle class="fa" cx="50" cy="30" r="10"/><circle class="fa" cx="28" cy="65" r="8"/><circle class="fa" cx="72" cy="65" r="8"/><line class="st" x1="43" y1="38" x2="33" y2="57"/><line class="st" x1="57" y1="38" x2="67" y2="57"/><rect class="fa" x="140" y="30" width="24" height="18" rx="3"/><rect class="fa" x="140" y="52" width="24" height="18" rx="3"/><rect class="fa" x="140" y="74" width="24" height="18" rx="3"/><line class="st" x1="164" y1="39" x2="190" y2="39"/><circle class="fk" cx="196" cy="39" r="6"/>
```

Two algorithms encountered throughout system design rely heavily on case-splits:

1. **Quicksort:** Averages $\Theta(n \log n)$ time when partitioning splits subarrays roughly in half. But with a naive pivot strategy like always picking the last element, an *already sorted* input degenerates into partitions of size $0$ and $n-1$, creating an $n$-level recursion chain that costs **$\Theta(n^2)$ worst case**. Randomizing the pivot guarantees that bad splits are extremely unlikely on any fixed input.
2. **Hash Table Lookup:** Quoted everywhere as $O(1)$. This is an **average-case** claim assuming a uniform hash distribution with few bucket collisions. If all keys collide into the exact same bucket, lookup degenerates into a linear scan through a single chain: **$O(n)$ worst case**.

```rosetta "Famous algorithms and their case bounds"
Algorithm | Best Case | Average Case | Worst Case
Linear Search | Θ(1) | Θ(n) | Θ(n)
Insertion Sort | Θ(n) | Θ(n²) | Θ(n²)
Quicksort | Θ(n log n) | Θ(n log n) | Θ(n²)
Hash Table Lookup | Θ(1) | Θ(1) | Θ(n)
```

## Where next {#next toc="Where next"}

```vig "A signpost with three arrows pointing along three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Analyzing Loops & API Complexity",
    "source": "next lesson",
    "text": "Moving from linear scans to loops that step by doubling or depend on outer loop variables, and pricing hidden O(n) calls hidden inside built-in library methods."
  },
  {
    "title": "Analyzing Recursion: The Tree Method",
    "source": "following lesson",
    "text": "Tracing recursive branching with recursion trees, calculating level-by-level work, and summing geometric progressions to find closed-form costs."
  },
  {
    "title": "Amortized Analysis & Dynamic Arrays",
    "source": "foundations module",
    "text": "When occasional worst-case operations (like array resizing) are paid for by frequent O(1) operations, producing a constant amortized cost."
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
      "question": "Quicksort with a naive pivot choosing the last element is handed an already-sorted array. What happens to its running time?",
      "options": [
        "It degrades to Θ(n²) because every partition splits into sizes 0 and n−1, turning the tree into a path n levels deep.",
        "It stays Θ(n log n) because pivot selection only alters low-level constant factors and cannot change the asymptotic growth rate of divide-and-conquer recursion.",
        "It improves to Θ(n) because an already-sorted sequence needs zero swaps during the partition step, finishing in linear time."
      ],
      "answer": 0,
      "explanation": "A degenerate split peels off only one element per level instead of halving the input. n levels with O(n) partition work per level equals Θ(n²), the worst-case scenario that naive pivot rules trigger on sorted inputs."
    },
    {
      "question": "Why is hash table lookup commonly quoted as O(1) in technical interviews?",
      "options": [
        "Because O(1) is the absolute worst-case guarantee regardless of how many hash collisions occur across the buckets.",
        "It is shorthand for average-case lookup with low collisions; worst case is O(n).",
        "Because modern hash tables dynamically allocate infinite buckets so that collision resolution never requires searching."
      ],
      "answer": 1,
      "explanation": "The O(1) claim assumes keys distribute evenly across buckets. In the pathological worst case where every key hashes into the exact same bucket, lookup degenerates into scanning an O(n) linked chain."
    },
    {
      "question": "An algorithm has best-case time Θ(1) and worst-case time Θ(n). What can you conclude about its average-case time?",
      "options": [
        "It must be Θ(n) because theoretical analysis always defaults to the worst-case bound whenever input probabilities are left unspecified.",
        "It depends on the input distribution and cannot be determined from best and worst bounds alone.",
        "It must be Θ(1) because randomly generated inputs almost always hit early exit conditions long before reaching the end of the array."
      ],
      "answer": 1,
      "explanation": "Best and worst case bound the extremes of performance. Average case requires a stated probability distribution over inputs to calculate an expected value."
    }
  ]
}
```
