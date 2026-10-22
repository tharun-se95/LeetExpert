---
title: "Move Zeroes"
kicker: "Move Zeroes · Arrays module · problem lesson"
headline: "How do you move every zero to the end while preserving relative order?"
lede: "On a freight train carrying mixed cargo, empty cars cannot be uncoupled into thin air. An inspector walks car by car from the locomotive: cars with valid cargo are shifted forward into a continuous, gap-free block at the front, while empty cars are shuffled to the caboose. In memory, moving values in place without allocating a second array requires managing three distinct regions: the compacted non-zeroes, the gathered zeroes, and the unexamined tail."
chips:
  - "two pointers"
  - "time **O(n)**"
  - "space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroTrain" viewBox="0 0 560 220" role="img" aria-label="Animation: five array cells [0, 1, 0, 3, 12] are rearranged in place to [1, 3, 12, 0, 0] by compacting non-zeroes forward and filling the tail with zeroes."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">kept</span></div><div id="heroCap">The inspector scans each slot, compacting valid cargo forward</div></div></div></div>
---

## Problem {#problem}

```vig "Five array slots in a row: three non-zero values gathered at the front followed by two zeroes"
<rect class="st" x="20" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="60" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="100" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="140" y="36" width="36" height="36" rx="6" stroke-dasharray="3 3"/>
<rect class="st" x="180" y="36" width="36" height="36" rx="6" stroke-dasharray="3 3"/>
<circle class="fa" cx="38" cy="54" r="8"/>
<circle class="fa" cx="78" cy="54" r="8"/>
<circle class="fa" cx="118" cy="54" r="8"/>
<circle class="fk" cx="158" cy="54" r="5"/>
<circle class="fk" cx="198" cy="54" r="5"/>
```

Given an integer array `nums`, move all `0`s to the end ==in place== while keeping the relative order of the non-zero elements.

```examples
nums = [0, 1, 0, 3, 12] → [1, 3, 12, 0, 0]
nums = [0] → [0]
nums = [1, 0] → [1, 0]
nums = [0, 0] → [0, 0]
```

```constraint
1 ≤ n ≤ 10⁴ · O(1) auxiliary space · minimize total writes.
```

In-place means modifying the array directly without allocating an O(n) auxiliary copy. But notice the key difference from previous compaction problems: nothing is discarded. In Remove Duplicates, elements past the new length were unread garbage. Here, the zeroes must survive at the end, and their relative order among themselves is trivial because all zeroes are identical.

Try it by hand first. As the inspector moves down the train, decide whether each slot contains a keeper (non-zero) to write forward to `write`, or an empty slot (zero) to skip until the second pass fills the tail.

```widget #byhand "By hand: step through the inspector's decisions"
<div class="lvhost"></div>
<div class="actions stmts">
  <button type="button" class="btn2" data-op="compact">Keep non-zero cargo</button>
  <button type="button" class="btn2" data-op="skip">Skip empty zero</button>
  <button type="button" class="btn2" data-op="fill">Fill trailing zeroes</button>
</div>
<div class="actions">
  <button type="button" class="btn2 reset">Start again</button>
  <span class="lv-hint" id="byhandHint">Inspect nums[0]</span>
</div>
```

## Attempt it first {#attempt toc="Attempt"}

```caption
nums[0..write) holds compacted non-zeroes; nums[write..read) holds zeroes; nums[read..n) is uninspected.
```

```vig "Three array regions: compacted elements on the left, zero gap in the middle, uninspected slots on the right"
<rect class="st" x="15" y="36" width="60" height="36" rx="6"/>
<rect class="st" x="80" y="36" width="60" height="36" rx="6" stroke-dasharray="3 3"/>
<rect class="st" x="145" y="36" width="80" height="36" rx="6"/>
<circle class="fa" cx="35" cy="54" r="7"/>
<circle class="fa" cx="55" cy="54" r="7"/>
<circle class="fk" cx="100" cy="54" r="5"/>
<circle class="fk" cx="120" cy="54" r="5"/>
<polygon class="fc" points="75,20 85,20 80,30"/>
<polygon class="fk" points="140,20 150,20 145,30"/>
```

This problem uses the read/write pointer technique from stable compaction. Two index pointers traverse the same array: `read` acts as the inspector checking every item from left to right, while `write` marks the boundary of the compacted non-zero prefix.

Before revealing the implementation, predict how `write` and `read` relate after scanning elements.

```widget "Predict where write and read stand"
<div id="predict"></div>
```

```reveal #hint "Hint: reuse the template, then reconstruct"
Run the standard compaction template with condition `nums[read] != 0`. When pass 1 completes, `nums[0..write)` holds all the non-zeroes in their original relative order, and `write` equals the count of non-zeroes.

How many zeroes existed in the original array? Exactly `n − write`. And where must they go? In the remaining slots `nums[write..n)`. Because all zeroes are identical, you do not need to preserve the original zero objects: a second pass can simply overwrite `nums[write..n)` with 0.
```

## The trap: forgetting the tail {#trap toc="The trap"}

```caption
Compact non-zeroes without filling the tail, and stale duplicates remain at the end.
```

```vig "An array where the front is compacted but stale duplicates remain at the tail"
<rect class="st" x="20" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="60" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="100" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="140" y="36" width="36" height="36" rx="6"/>
<rect class="st" x="180" y="36" width="36" height="36" rx="6"/>
<circle class="fa" cx="38" cy="54" r="8"/>
<circle class="fa" cx="78" cy="54" r="8"/>
<circle class="fa" cx="118" cy="54" r="8"/>
<circle class="fr" cx="158" cy="54" r="8"/>
<circle class="fr" cx="198" cy="54" r="8"/>
<line class="sc" x1="150" y1="46" x2="166" y2="62"/>
<line class="sc" x1="166" y1="46" x2="150" y2="62"/>
<line class="sc" x1="190" y1="46" x2="206" y2="62"/>
<line class="sc" x1="206" y1="46" x2="190" y2="62"/>
```

In problems like Remove Duplicates or Remove Element, the function returns a new integer length `k`, and the caller only examines `nums[0..k)`. What sits past index `k` does not matter.

Move Zeroes is different: it modifies `nums` in place and returns nothing. The caller inspects the entire array of length n. The classic trap is stopping after pass 1:

```code mistake "Omit pass 2: tail left with stale values"
```

On `[0, 1, 0, 3, 12]`, pass 1 writes to indices 0, 1, and 2, leaving write at 3. The remaining 2 slots (indices 3 and 4) are untouched, so they retain their old values 3 and 12, yielding `[1, 3, 12, 3, 12]`. Compare the correct two-pass walk with the mistake:

```widget #trapper "The same array, two versions"
<div class="extabs" role="group" aria-label="Choose an implementation"></div>
<div class="lvhost"></div>
<p class="cost-note" id="trapNote"></p>
```

A second temptation is the accidental quadratic: on encountering a zero, shifting every element to its right one position left and appending zero to the end. That does O(n) work per zero, degrading to O(n²) time on arrays like `[0, 0, ..., 1]`.

The follow-up asks to ==minimize total writes==. At 0 zeroes in 64 elements, swapping does 128 writes (2 · 64), whereas compact-and-fill does 64 writes. When zeroes dominate (60 zeroes out of 64), swapping requires only 8 writes (2 · 4) compared to compact-and-fill's 64 writes. Compare two-pass compact-and-fill with the one-pass swap alternative across varying zero counts:

```widget "Memory writes: compact-and-fill vs one-pass swap"
<div class="chart" id="cost"></div>
<p class="cost-note" id="costNote"></p>
```

## The insight {#insight toc="Insight"}

```vig "Two arrows showing pass 1 compacting non-zeroes forward and pass 2 filling trailing zeroes"
<rect class="st" x="20" y="40" width="90" height="32" rx="6"/>
<rect class="st" x="120" y="40" width="100" height="32" rx="6" stroke-dasharray="3 3"/>
<circle class="fa" cx="45" cy="56" r="6"/>
<circle class="fa" cx="75" cy="56" r="6"/>
<circle class="fk" cx="150" cy="56" r="5"/>
<circle class="fk" cx="185" cy="56" r="5"/>
<path class="sc" d="M30 24L90 24"/>
<path class="sc" d="M85 20L90 24L85 28"/>
<path class="sc" d="M130 88L190 88"/>
<path class="sc" d="M185 84L190 88L185 92"/>
```

```key
Compacting places non-zeroes in order at nums[0..write). Because all zeroes are identical, pass 2 simply reconstructs them by writing 0 into nums[write..n).
```

Pass 1 copies each of the 3 non-zeroes forward, and pass 2 fills the remaining 2 slots with zeroes: 3 + 2 = 5 writes in total, exactly n.

```rosetta "The code, read as train car inspection"
In the code | On the train tracks
`read` | the inspector walking car by car from locomotive to caboose
`write` | the coupling point where the next loaded car joins the train
`nums[read] != 0` | car carries valid cargo: copy forward to slot write
`nums[read] == 0` | empty car: skip during pass 1
`write += 1` | the compacted cargo train grows by one car
`nums[i] = 0` | pass 2: overwrite all remaining slots behind write with empty zeroes
```

Step through the two-pass algorithm on the lesson's test cases:

```widget #stepper "Walk the two-pass algorithm"
<div class="extabs" role="group" aria-label="Choose an array"></div>
<div class="lvhost"></div>
```

## Solution {#solution}

```caption
Exactly n writes across two sequential passes, with O(1) auxiliary space.
```

```vig "Two pointers write and read stepping across an array"
<rect class="st" x="20" y="38" width="40" height="36" rx="6"/>
<rect class="st" x="65" y="38" width="40" height="36" rx="6"/>
<rect class="st" x="110" y="38" width="40" height="36" rx="6"/>
<rect class="st" x="155" y="38" width="40" height="36" rx="6"/>
<polygon class="fc" points="80,22 90,22 85,32"/>
<polygon class="fa" points="125,22 135,22 130,32"/>
<circle class="fa" cx="40" cy="56" r="7"/>
<circle class="fa" cx="85" cy="56" r="7"/>
<circle class="fk" cx="130" cy="56" r="7"/>
<circle class="fk" cx="175" cy="56" r="7"/>
```

Write the two sequential passes on paper first, then compare with the implementation.

`````reveal #solbox "Show the solution"
```code solution "Two-pass compact-and-fill"
```

```notes
Pass 1 scans every index with `read`. When `nums[read]` is non-zero, it writes it to `nums[write]` and increments `write`. When pass 1 finishes, `nums[0..write)` contains all non-zero elements in their original relative order.

Pass 2 starts at index `write` and writes 0 into every slot through `len(nums) − 1`. Both passes run sequentially, never nested.
```

```derivation
**Time O(n).** Pass 1 inspects each element once in n steps. Pass 2 touches only the trailing `n − write` elements, which is at most n. Sequential passes add rather than multiply: n + (n − write) ≤ 2n operations, which is O(n).

**Space O(1).** Only two integer pointers (`write` and `read`) are allocated regardless of array length. Reordering {{exTotalWrites}} elements on the example input performs {{exWritesPass1}} non-zero copies plus {{exWritesPass2}} zero fills, totaling {{exTotalWrites}} writes.

**Writes: exactly n.** Pass 1 writes once per non-zero; pass 2 writes once per zero. The sum is always n, which optimizes write operations when zeroes are sparse.
```

````warn
Do not return a new array or return write. The problem specifies in-place mutation of `nums` and returns nothing (`None` in Python, `void` in TypeScript). Omitting pass 2 leaves {{exMistakeStr}} instead of {{exSolutionStr}}, with {{staleSlotsCount}} stale slots uncleaned.
````
`````

`````reveal #swapbox "Alternative: one-pass swap version"
The one-pass swap fuses both passes into one by swapping `nums[write]` and `nums[read]` whenever `nums[read] != 0`.

The invariant partitions the array into three regions: `nums[0..write)` non-zeroes in relative order; `nums[write..read)` all zeroes; `nums[read..n)` uninspected.

When `nums[read]` is non-zero, swapping exchanges it with `nums[write]` (which is guaranteed to be a zero from the middle region, or `read` itself when no zeroes have been seen). This relocates a zero to `read` and advances `write`. One pass, but each swap performs two writes: when zeroes are rare (such as 0 zeroes in 64 elements), swapping does {{swapWrites64Rare}} writes compared to two-pass's {{twoPassWrites64}}.
`````

## Variants {#variants}

```vig "Three variant boxes representing remove element, Dutch national flag, and array operations"
<rect class="st" x="20" y="24" width="56" height="30" rx="6"/>
<rect class="st" x="92" y="24" width="56" height="30" rx="6"/>
<rect class="st" x="164" y="24" width="56" height="30" rx="6"/>
<circle class="fa" cx="48" cy="39" r="6"/>
<circle class="fc" cx="120" cy="39" r="6"/>
<circle class="fk" cx="192" cy="39" r="6"/>
<line class="st" x1="20" y1="74" x2="220" y2="74"/>
<circle class="fa" cx="60" cy="88" r="5"/>
<circle class="fa" cx="100" cy="88" r="5"/>
<circle class="fk" cx="140" cy="88" r="5"/>
<circle class="fk" cx="180" cy="88" r="5"/>
```

```variants
[
  {
    "title": "Remove Element",
    "source": "LeetCode 27",
    "text": "Remove all occurrences of a target val in place. Uses the pure write-pointer template with keep condition x != val. Returns write; the remaining tail slots are ignored by the caller."
  },
  {
    "title": "Sort Colors",
    "source": "LeetCode 75",
    "text": "Partition an array containing 0s, 1s, and 2s into three groups in place. Generalizes the three-region invariant to three pointers (low, mid, high) in Dutch National Flag partitioning."
  },
  {
    "title": "Apply Operations to an Array",
    "source": "LeetCode 2460",
    "text": "Apply adjacent doubling operations on identical neighbours, then shift all zeroes to the end. The second half of the problem is this exact Move Zeroes routine composed on the transformed array."
  }
]
```

## Check yourself {#quiz}

```vig "Three question rows with checkmark on the first question"
<circle class="fg" cx="36" cy="24" r="10"/>
<path class="st" d="M31 24L35 28L42 20"/>
<circle class="st" cx="36" cy="56" r="10"/>
<circle class="st" cx="36" cy="88" r="10"/>
<rect class="fa" x="58" y="19" width="150" height="10" rx="5"/>
<rect class="fa" x="58" y="51" width="118" height="10" rx="5"/>
<rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "In the one-pass swap version, why is nums[read] guaranteed to swap with a zero (or itself), never losing an earlier non-zero?",
      "options": [
        "The invariant maintains that [write..read) contains exclusively zeroes; nums[write] is inside that zero region (or write == read when the zero region is empty).",
        "Because swapping is commutative: exchanging any two indices produces the identical set of values regardless of which pointer is labeled read and which is labeled write.",
        "Because read always stays strictly two steps ahead of write, ensuring an unwritten buffer element always absorbs the swap."
      ],
      "answer": 0,
      "explanation": "Every non-zero encountered was moved into [0..write) immediately, so anything left between write and read is zero. The swap therefore exchanges a non-zero with a zero — or with itself when the regions have no gap."
    },
    {
      "question": "When an array of 1,000 integers contains only 2 zeroes, why does two-pass compact-and-fill perform substantially fewer memory writes than the one-pass swap version?",
      "options": [
        "The swap version repeatedly re-scans the array to locate each matching zero slot, spending O(n · k) steps searching through uncompacted elements.",
        "Two-pass writes 998 non-zeroes plus 2 zero fills (1,000 writes), whereas swapping writes two slots per non-zero (1,996 writes).",
        "Swapping allocates temporary intermediate buffers on the heap during each value exchange, saturating system memory bandwidth."
      ],
      "answer": 1,
      "explanation": "Two-pass writes exactly n times (998 non-zero writes + 2 zero fills). Swapping writes two memory locations per swap on every non-zero (2 * 998 = 1,996 writes)."
    },
    {
      "question": "How does Move Zeroes differ fundamentally from Remove Duplicates or Remove Element in how its output is communicated to the caller?",
      "options": [
        "Remove Duplicates requires first sorting the entire array in ascending order to group duplicate elements, whereas Move Zeroes accepts arbitrarily ordered sequences.",
        "Remove Duplicates operates exclusively on non-negative integer primitives, whereas Move Zeroes is capable of handling negative and mixed numeric types across inputs.",
        "Remove Duplicates returns an integer length k and leaves trailing slots unread, whereas Move Zeroes mutates the entire array in place and returns nothing."
      ],
      "answer": 2,
      "explanation": "Remove Duplicates returns the new length k, and the caller only reads nums[0..k). Move Zeroes returns void (or None in Python): the caller reads the entire array of length n, so the zeroes must be present at the end."
    }
  ]
}
```
