---
title: "Analyzing Recursion: The Tree Method"
kicker: "Big O • Foundations • concept lesson"
headline: "Work flows down the hierarchy; total cost sums every node."
lede: "Recursive functions delegate smaller subproblems to child calls, forming a branching tree of effort. Finding the total complexity means calculating the work at each depth level and summing across the entire tree."
chips:
  - "halving yields **logarithmic depth**"
  - "flat level sums yield **n log n**"
  - "constant reduction yields **exponential blowup**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroHierarchy" viewBox="0 0 560 140" role="img" aria-label="Illustration: office hierarchy delegating tasks down from manager to clerks to assistants."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">3</b> <span id="heroUnit">hierarchy levels active</span></div><div id="heroCap"></div></div></div></div>
---

## The office hierarchy {#problem toc="The hierarchy"}

```caption
A manager delegates pieces of a large task to clerks, creating a branching pyramid of effort.
```

```vig "A managerial hierarchy tree branching down into smaller worker desks"
<circle class="fc" cx="120" cy="25" r="12"/><line class="st" x1="120" y1="37" x2="70" y2="60"/><line class="st" x1="120" y1="37" x2="170" y2="60"/><circle class="fa" cx="70" cy="70" r="10"/><circle class="fa" cx="170" cy="70" r="10"/><line class="st" x1="70" y1="80" x2="45" y2="100"/><line class="st" x1="70" y1="80" x2="95" y2="100"/><line class="st" x1="170" y1="80" x2="145" y2="100"/><line class="st" x1="170" y1="80" x2="195" y2="100"/><circle class="fk" cx="45" cy="108" r="7"/><circle class="fk" cx="95" cy="108" r="7"/><circle class="fk" cx="145" cy="108" r="7"/><circle class="fk" cx="195" cy="108" r="7"/>
```

Imagine you are the general manager of a busy post office, and a giant assignment arrives. Rather than tackling the entire job alone, you divide the work and delegate chunks to subordinate clerks. Each clerk does the same with their assistants, creating a branching pyramid of delegation throughout the office hierarchy.

Unlike iterative loops where you count repetitions of a counter, a recursive function expresses its runtime as a ==recurrence relation==: the cost at size $n$ in terms of smaller subproblems.

Drawing every execution as a node in a recursion tree reveals the total cost:
- The root represents the initial top-level call.
- Children represent recursive calls spawned by that invocation.
- Total work equals the sum of work across all nodes in the tree.

```key
The recursion tree method computes total complexity by summing the non-recursive work performed across all nodes at each level of the tree.
```

## Three recursion trees side by side {#insight toc="Tree model"}

```caption
Three canonical recurrence shapes illustrate logarithmic chains, balanced pyramids, and exponential blowups.
```

```vig "Three tree silhouettes: a single chain, a binary tree, and an overflowing dense shrub"
<line class="st" x1="30" y1="20" x2="30" y2="100"/><circle class="fc" cx="30" cy="20" r="5"/><circle class="fa" cx="30" cy="60" r="5"/><circle class="fa" cx="30" cy="100" r="5"/><path class="st" d="M110 20L85 60M110 20L135 60M85 60L75 100M85 60L95 100M135 60L125 100M135 60L145 100"/><circle class="fc" cx="110" cy="20" r="5"/><path class="st" d="M190 20L170 50M190 20L210 50M170 50L155 80M170 50L185 80M210 50L200 80M210 50L225 80"/><circle class="fc" cx="190" cy="20" r="5"/>
```

Three recurrence shapes cover most of the recursive algorithms you will meet in this course:

1. **Binary Search ($T(n) = T(n/2) + O(1)$):** Halves the input and recurses exactly once. The tree is a single unbranched chain about $\log_2 n$ nodes long ($\log_2 n + 1$ when $n$ is a power of two), each taking $O(1)$ time $\rightarrow$ **$O(\log n)$**.
2. **Merge Sort ($T(n) = 2T(n/2) + O(n)$):** Splits into two halves and merges them in linear time. The number of subproblems doubles at each level while their size halves, keeping the work per level constant at $n$. With $\log_2 n$ levels that merge, total work is $n \cdot \log_2 n \rightarrow$ **$O(n \log n)$**.
3. **Naive Fibonacci ($T(n) = T(n-1) + T(n-2) + O(1)$):** Branches twice while only shrinking input size by a tiny constant ($1$ or $2$). The tree grows nearly $2^k$ wide at level $k$ and reaches depth $n \rightarrow$ **$O(2^n)$** exponential explosion!

```widget #treeWidget "Recursion trees traced from real calls: level-by-level work against the closed form"
<div class="tree-stage">
  <div class="extabs" role="group" aria-label="Choose recurrence relation"></div>
  <div class="extabs" id="treeSizes" role="group" aria-label="Choose input size n"></div>
  <div class="tree-card">
    <div class="tree-head">
      <span class="tree-rec" id="treeRec"></span>
      <span class="tree-asymp" id="treeAsymp"></span>
    </div>
    <div class="tree-svg-wrap">
      <svg id="treeSvg" role="img" aria-label="Recursion tree"></svg>
    </div>
    <div class="tree-stats">
      <div class="stat-box"><span class="stat-label">Tree depth</span><span class="stat-val" id="depthVal"></span></div>
      <div class="stat-box"><span class="stat-label">Counted work, by level</span><span class="stat-val good" id="totalWorkVal"></span></div>
      <div class="stat-box"><span class="stat-label">Closed form</span><span class="stat-val accent" id="formulaVal"></span></div>
      <div class="stat-box"><span class="stat-label">Check</span><span class="stat-val" id="verdictVal"></span></div>
    </div>
  </div>
</div>
```

Every number in this widget comes from running the real function. Binary search probes once per call while looking for a key larger than everything, its worst case; merge sort counts the elements each call's merge writes; Fibonacci counts calls. The right-hand column sums each level, and the closed form is computed separately from the recurrence.

```derivation
**Depth vs Branching Factor:** Branching twice does not inherently make an algorithm exponential. Merge sort branches twice per call and finishes in $O(n \log n)$ time.

What separates merge sort from naive Fibonacci is the **shrinkage rate**:
- Shrinking by a factor ($n \rightarrow n/2$) limits tree depth to $\log_2 n$ levels.
- Shrinking by a constant ($n \rightarrow n-1$) stretches tree depth to $n$ levels, allowing an unchecked geometric doubling of nodes to explode exponentially.
```

```key
Depth, not branching factor alone, decides asymptotic growth: halving guarantees logarithmic depth, while constant shrinkage produces linear depth.
```

## Step by step: summing levels {#walk toc="Summing levels"}

```caption
Breaking down each depth level into subproblem count, node size, and level work reveals the total sum.
```

```vig "A horizontal stack of cards each showing the sum of its level's work"
<rect class="fa" x="25" y="25" width="190" height="18" rx="3"/><rect class="fa" x="25" y="48" width="190" height="18" rx="3"/><rect class="fa" x="25" y="71" width="190" height="18" rx="3"/><rect class="fc" x="180" y="29" width="20" height="10" rx="2"/><rect class="fc" x="180" y="52" width="20" height="10" rx="2"/><rect class="fc" x="180" y="75" width="20" height="10" rx="2"/>
```

When evaluating any recursion tree, determine:
1. **Nodes at level $k$:** how many subproblems exist at depth $k$?
2. **Work per node at level $k$:** how much non-recursive computation does one subproblem perform?
3. **Total work at level $k$:** multiply nodes by work per node.
4. **Tree depth:** when does the subproblem reach the base case?

```rosetta "Recurrence classification and level work patterns"
Algorithm | Recurrence | Work per Level | Tree Depth | Total Complexity
Binary Search | T(n/2) + O(1) | O(1) | log₂ n | O(log n)
Merge Sort | 2T(n/2) + O(n) | O(n) (constant) | log₂ n | O(n log n)
Divide & Conquer (Karatsuba) | 3T(n/2) + O(n) | (3/2)ᵏ · n (growing) | log₂ n | O(n^(log₂ 3)) ≈ O(n^1.58)
Naive Fibonacci | T(n-1) + T(n-2) + O(1) | ~2ᵏ calls | n | O(2ⁿ) (precisely Θ(φⁿ))
```

## Implementation: naive vs memoized Fibonacci {#solution toc="Implementation"}

```caption
Instrumenting real recursion proves that memoization collapses an exponential tree into a linear chain.
```

```vig "A branch being pruned and redirected into a key-value cache box"
<path class="st" d="M30 40H110M70 40V80"/><circle class="fa" cx="70" cy="40" r="8"/><circle class="fk" cx="70" cy="80" r="8"/><rect class="fc" x="140" y="28" width="70" height="50" rx="6"/><path class="st" d="M155 53H195"/>
```

Below is naive recursive Fibonacci alongside a memoized version that stores previously computed answers. Both instrument call counters so exact call volume is measurable.

```code solution "fib_naive vs fib_memo: counting recursive call invocations"
```

````warn
Recreating the cache inside the recursive function. Declaring `memo = {}` inside the recursive helper resets the table on every single recursive frame. Because no cache survives across calls, zero results are reused, and total calls remain identical to naive exponential recursion!

```code mistake "fib_broken_memo: recreating memo resets cache on every call"
```
````

## What it costs: the memoization collapse {#cost toc="What it costs"}

```caption
Reusing solutions to overlapping subproblems collapses an exponential tree into a linear chain.
```

```vig "An exponential curve flattening into a straight linear line"
<path class="st" d="M30 90C70 90 100 80 130 20"/><path class="fc" d="M30 90L190 30"/><circle class="fa" cx="130" cy="20" r="6"/><circle class="fa" cx="190" cy="30" r="6"/>
```

Comparing the exact call counts between naive and memoized recursion exposes the staggering divergence in effort as $n$ grows:

```widget #memoTable "Call counts, counted by running both versions"
<div class="memo-wrap">
  <table class="memo-table">
    <thead><tr><th>n</th><th>naive calls</th><th>memoized calls</th><th>ratio</th></tr></thead>
    <tbody id="memoBody"></tbody>
  </table>
</div>
```

The naive column grows like the Fibonacci numbers themselves: the call count satisfies $C(n) = C(n-1) + C(n-2) + 1$, which solves to $2F(n+1) - 1$. The memoized column grows by two per step, because each new `n` makes one real call that recurses and one that is answered from the cache, giving $2n - 1$.

```key
Exponential recursion in algorithms like Fibonacci is caused by re-solving overlapping subproblems; storing intermediate results in a cache restores linear complexity.
```

## Where next {#next toc="Where next"}

```vig "A signpost with three arrows pointing along three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Amortized Analysis & Dynamic Arrays",
    "source": "next lesson",
    "text": "How dynamic arrays double their capacity, balancing occasional O(n) reallocations against frequent O(1) appends."
  },
  {
    "title": "Space Complexity & Stack Depth",
    "source": "foundations module",
    "text": "Tracking memory consumption, heap allocations, and call stack depth across iterative and recursive algorithms."
  },
  {
    "title": "Divide and Conquer: Merge Sort",
    "source": "Sorting module",
    "text": "Applying the master recurrence T(n) = 2T(n/2) + O(n) in a real sorting algorithm."
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
      "question": "Binary search's recurrence is T(n) = T(n/2) + O(1). How many levels does its call tree have, and what is the total cost?",
      "options": [
        "n levels, O(n) total — each recursive call peels off one element, requiring one level per input element",
        "log n levels, O(log n) total — the tree is a single chain, one child per node, and each level does O(1) work",
        "log n levels, O(n log n) total — each level does O(n) work across its nodes, multiplying across log n levels"
      ],
      "answer": 1,
      "explanation": "The tree is a single chain rather than a branching tree: n → n/2 → n/4 → … → 1 takes log₂ n levels, and each level performs O(1) comparison work. Total: O(log n)."
    },
    {
      "question": "Merge sort's recurrence is T(n) = 2T(n/2) + O(n). Why does the total work come out to O(n log n) rather than O(n) or O(2ⁿ)?",
      "options": [
        "Because each level does O(n) work: twice as many subproblems at half the size keep per-level work flat across log n levels.",
        "Because the tree branches twice per node, and any recursion that branches more than once is exponential by definition, giving roughly 2 to the log n power.",
        "Because merging two sorted halves takes O(log n) time using an internal binary search, and that log n cost multiplies with the n elements processed overall."
      ],
      "answer": 0,
      "explanation": "Branching twice is not inherently exponential. Merge sort halves subproblem size, so each level's total work stays flat at O(n), and the tree is only log n levels deep. Multiplying gives O(n log n)."
    },
    {
      "question": "Why is naive recursive Fibonacci exponential while merge sort's two-way recursion is only O(n log n)?",
      "options": [
        "Fibonacci does more work per call — each call performs extra arithmetic that merge sort's calls skip, so the per-node cost compounds across the recursion tree.",
        "Merge sort's recursion is tail-recursive, so the runtime collapses each recursive call into a loop with no extra stack frames or repeated work, unlike Fibonacci's stacked calls.",
        "Fibonacci shrinks subproblems by a constant (n−1, n−2), giving n levels of doubling width; merge sort halves size, giving log n levels."
      ],
      "answer": 2,
      "explanation": "Both branch twice per node. The critical difference is tree depth: halving cuts depth to log n levels of flat work, whereas subtracting a constant stretches depth to n levels of doubling width."
    }
  ]
}
```
