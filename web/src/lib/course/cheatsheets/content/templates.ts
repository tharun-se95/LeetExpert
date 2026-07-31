import type { ModuleCheatsheet } from "../types";

function sheet(
  partial: Omit<ModuleCheatsheet, "tier"> & { tier?: "template" },
): ModuleCheatsheet {
  return { tier: "template", ...partial };
}

export const TEMPLATE_SHEETS: ModuleCheatsheet[] = [
  sheet({
    moduleSlug: "queues",
    tagline: "FIFO frontiers — BFS levels and sliding-window maxima.",
    smells: [
      { smell: "Level-order / shortest unweighted", pattern: "BFS queue" },
      { smell: "Recent k elements aggregate", pattern: "Deque both ends" },
      { smell: "Generate in arrival order", pattern: "Push back, pop front" },
      { smell: "Multi-source expansion", pattern: "Seed queue with all starts" },
    ],
    patterns: [
      {
        title: "BFS frontier",
        smell: "Layers from a source (or many)",
        summary:
          "Enqueue start(s), mark seen. Pop front, push unseen neighbours. Distance = layers or an explicit dist map.",
        tone: "accent",
        diagram: "bfs-layers",
      },
      {
        title: "Deque for window extrema",
        smell: "Max/min in every window of size k",
        summary:
          "Keep candidates at both ends: drop from back while worse than new; drop from front when out of window. Front is always the answer.",
        tone: "good",
        diagram: "queue-fifo",
      },
      {
        title: "Classic FIFO",
        smell: "Process in arrival order",
        summary:
          "Produce in the order you consume. If you need LIFO, you wanted a stack — don’t fake it with index tricks.",
        tone: "mark",
        diagram: "queue-fifo",
      },
    ],
    complexity: [
      { label: "BFS over graph", time: "O(V+E)", space: "O(V)", note: "Queue + seen set" },
      { label: "Deque window max", time: "O(n)", space: "O(k)", note: "Amortised O(1) per index" },
    ],
    traps: [
      {
        title: "Forgetting the seen set",
        detail: "BFS without marking visited revisits nodes and can loop forever on cycles.",
        tone: "bad",
      },
      {
        title: "Stale deque front",
        detail:
          "Before reading the max/min, drop indices that slid out of the window. A stale front is the classic off-by-k bug.",
        tone: "warn",
      },
    ],
  }),

  sheet({
    moduleSlug: "prefix-sum",
    tagline: "Precompute ranges so every subarray query is O(1).",
    smells: [
      { smell: "Many range sum queries", pattern: "Prefix array" },
      { smell: "Subarray sum equals k", pattern: "Prefix + hash" },
      { smell: "2D rectangle sums", pattern: "Inclusion–exclusion table" },
      { smell: "Range add, then read once", pattern: "Difference array" },
    ],
    patterns: [
      {
        title: "1D prefix",
        smell: "Sum of a[l..r] many times",
        summary:
          "pref[i] = sum of first i elements. Range [l, r] → pref[r+1] − pref[l]. Mind the off-by-one on length.",
        tone: "accent",
        diagram: "prefix-bar",
      },
      {
        title: "Prefix + hash",
        smell: "Count / find subarrays summing to k",
        summary:
          "Store first (or count of) each prefix value. Need pref − k already seen ⇒ a subarray ending here sums to k.",
        tone: "good",
        diagram: "hash-buckets",
      },
      {
        title: "Difference array",
        smell: "Many range updates, few reads",
        summary:
          "Range updates in O(1): +v at L, −v at R+1, then prefix to materialise. Dual of prefix sums.",
        tone: "mark",
        diagram: "prefix-bar",
      },
    ],
    complexity: [
      { label: "Build prefix", time: "O(n)", space: "O(n)", note: "Then O(1) queries" },
      { label: "Subarray sum = k", time: "O(n)", space: "O(n)", note: "Hash of prefixes" },
    ],
    traps: [
      {
        title: "Index alignment",
        detail:
          "Decide whether pref[0]=0 (sum of first 0) or pref[0]=a[0]. Mixing conventions is the classic bug.",
        tone: "warn",
      },
      {
        title: "Forgetting the empty prefix",
        detail:
          "Subarray-sum-to-k needs the 0-prefix seeded in the map (count 1). Without it, prefixes that themselves equal k are missed.",
        tone: "bad",
      },
    ],
  }),

  sheet({
    moduleSlug: "sorting",
    tagline: "Order enables linear scans — know when to sort first.",
    smells: [
      { smell: "Order doesn’t matter, then scan", pattern: "Sort + two pointers" },
      { smell: "Custom rank / interval order", pattern: "Sort by key" },
      { smell: "Count small alphabet", pattern: "Counting sort" },
    ],
    patterns: [
      {
        title: "Sort then sweep",
        smell: "Need adjacent compares or two pointers",
        summary:
          "Once sorted, adjacent comparisons and two pointers become legal. State the O(n log n) sort cost up front.",
        tone: "accent",
        diagram: "sort-bars",
      },
      {
        title: "Key-based ordering",
        smell: "Greedy / merge depends on start or end",
        summary:
          "Sort by start, by end, or by a derived key. Wrong key ⇒ wrong greedy or merge.",
        tone: "good",
        diagram: "sort-bars",
      },
      {
        title: "Counting / bucket",
        smell: "Values live in a tiny range",
        summary:
          "When values sit in a tiny range, count frequencies and rewrite — linear in n + range.",
        tone: "mark",
        diagram: "array-cells",
      },
    ],
    complexity: [
      { label: "Comparison sort", time: "O(n log n)", space: "O(n)*", note: "*or in-place depending on algo" },
      { label: "Counting sort", time: "O(n + R)", space: "O(R)", note: "R = value range" },
    ],
    traps: [
      {
        title: "Unstable assumptions",
        detail:
          "If equal keys must keep input order, confirm your sort’s stability or decorate with original indices.",
        tone: "warn",
      },
      {
        title: "Sorting destroys index answers",
        detail:
          "If the output needs original indices, sort pairs (value, index) — sorting values alone loses the mapping.",
        tone: "bad",
      },
    ],
  }),

  sheet({
    moduleSlug: "matrix",
    tagline: "Grids are graphs — boundaries, directions, and in-place layers.",
    smells: [
      { smell: "Visit every cell once", pattern: "DFS / BFS on grid" },
      { smell: "Rotate / spiral layers", pattern: "Layer peel" },
      { smell: "Set zeroes / mark rows", pattern: "Sentinel row/col" },
    ],
    patterns: [
      {
        title: "4-direction flood",
        smell: "Islands, regions, connected cells",
        summary:
          "From a cell, try U/D/L/R inside bounds. Mark visited in-place or with a set. Islands and regions share this skeleton.",
        tone: "accent",
        diagram: "matrix-grid",
      },
      {
        title: "Layer / ring walk",
        smell: "Rotate, spiral, or peel borders",
        summary:
          "Process the matrix as concentric rectangles. Corners are the off-by-one hotspot.",
        tone: "good",
        diagram: "matrix-grid",
      },
      {
        title: "First row/col markers",
        smell: "O(1) space row/col flags",
        summary:
          "Reuse the matrix border as boolean flags when O(1) space is required — carefully preserve the corner bit.",
        tone: "warn",
        diagram: "matrix-grid",
      },
    ],
    complexity: [
      { label: "Visit all cells", time: "O(m·n)", space: "O(m·n)*", note: "*or O(1) with in-place marks" },
      { label: "Layer rotate", time: "O(m·n)", space: "O(1)", note: "In-place swaps" },
    ],
    traps: [
      {
        title: "Out-of-bounds neighbours",
        detail:
          "Always check 0 ≤ nr < m and 0 ≤ nc < n before indexing. Diagonals are optional — don’t add them by habit.",
        tone: "bad",
      },
      {
        title: "Corner flag collision",
        detail:
          "matrix[0][0] often dual-purposes row-0 and col-0 marks. Use a separate boolean for one of them or you zero the wrong line.",
        tone: "warn",
      },
    ],
  }),

  sheet({
    moduleSlug: "recursion-backtracking",
    tagline: "Choose → explore → unchoose. The call stack is your state.",
    smells: [
      { smell: "All subsets / permutations", pattern: "Backtracking tree" },
      { smell: "Constraint board (N-Queens…)", pattern: "Place + prune" },
      { smell: "Divide structure in half", pattern: "Recurse on parts" },
    ],
    patterns: [
      {
        title: "Backtracking template",
        smell: "Enumerate valid configurations",
        summary:
          "Push a choice, recurse, pop. Record when a complete valid state is reached. Prune early when constraints break.",
        tone: "accent",
        diagram: "recursion-tree",
      },
      {
        title: "Include / exclude",
        smell: "Subsets / combination sum",
        summary:
          "For subsets: branch on taking nums[i] or not, then advance i. Same tree, two edges.",
        tone: "good",
        diagram: "recursion-tree",
      },
      {
        title: "Swap permutations",
        smell: "All orderings of a sequence",
        summary:
          "For i…n, swap i with j≥i, recurse i+1, swap back. Generates each order once.",
        tone: "mark",
        diagram: "array-cells",
      },
    ],
    complexity: [
      { label: "Subsets", time: "O(2ⁿ · n)", space: "O(n)", note: "Output-sensitive" },
      { label: "Permutations", time: "O(n! · n)", space: "O(n)", note: "Depth-n stack" },
    ],
    traps: [
      {
        title: "Mutating shared arrays",
        detail:
          "Push a copy into the answer (or copy on record). Otherwise every result points at the same final list.",
        tone: "bad",
      },
      {
        title: "Forgetting to unchoose",
        detail:
          "After recurse, undo the mutation (pop, unmark, swap back). Missing undo corrupts every sibling branch.",
        tone: "warn",
      },
    ],
  }),

  sheet({
    moduleSlug: "binary-trees",
    tagline: "Rooted structure — traverse with intent (order, level, or path).",
    smells: [
      { smell: "Visit every node once", pattern: "DFS pre/in/post" },
      { smell: "Per level aggregates", pattern: "BFS queue" },
      { smell: "Path / diameter style", pattern: "DFS return + global" },
    ],
    patterns: [
      {
        title: "Recursive DFS",
        smell: "Combine children with the root",
        summary:
          "Base null → 0/identity. Combine left and right with the root. Pick pre/in/post for when you use the root value.",
        tone: "accent",
        diagram: "tree-levels",
      },
      {
        title: "Level-order BFS",
        smell: "Averages, zigzags, right-side view",
        summary:
          "Queue nodes; drain a level size each round. Natural for averages, zigzags, and ‘right side view’.",
        tone: "good",
        diagram: "bfs-layers",
      },
      {
        title: "Post-order aggregate",
        smell: "Height, diameter, LCA prep",
        summary:
          "Need both children before deciding. Compute below, then update a global answer — don’t decide too early.",
        tone: "mark",
        diagram: "tree-levels",
      },
    ],
    complexity: [
      { label: "DFS / BFS visit", time: "O(n)", space: "O(h) / O(w)", note: "h height, w width" },
      { label: "Path aggregates", time: "O(n)", space: "O(h)", note: "One pass with returns" },
    ],
    traps: [
      {
        title: "Null child assumptions",
        detail:
          "Always guard left/right. Many ‘simple’ bugs are dereferencing null on a leaf’s child.",
        tone: "warn",
      },
      {
        title: "Confusing node count with height",
        detail:
          "Height and depth conventions differ (edges vs nodes). Pick one definition and stick to it in base cases.",
        tone: "bad",
      },
    ],
  }),

  sheet({
    moduleSlug: "bst",
    tagline: "Left < node < right — search and bounds fall out of the invariant.",
    smells: [
      { smell: "Lookup / insert / delete key", pattern: "BST walk" },
      { smell: "Ordered traversal needed", pattern: "Inorder = sorted" },
      { smell: "Validate BST", pattern: "Carry (min, max) bounds" },
    ],
    patterns: [
      {
        title: "Search walk",
        smell: "Find / insert / delete a key",
        summary:
          "Compare with node; go left or right. Stop at null (miss) or equal (hit). Average O(h).",
        tone: "accent",
        diagram: "tree-levels",
      },
      {
        title: "Inorder stream",
        smell: "kth smallest / sorted keys",
        summary:
          "Inorder yields sorted keys. Use for kth smallest, recover BST from traversal, or validate increasing order.",
        tone: "good",
        diagram: "tree-levels",
      },
      {
        title: "Bound propagation",
        smell: "Validate or search in a range",
        summary:
          "Each subtree must stay inside (low, high). Tighten the bound when you descend left/right — comparing only to the parent is not enough.",
        tone: "mark",
        diagram: "binary-search",
      },
    ],
    complexity: [
      { label: "Search / insert balanced", time: "O(log n)", space: "O(1)*", note: "*iterative; recursive O(h)" },
      { label: "Skewed tree worst", time: "O(n)", space: "O(n)", note: "Degenerates to a list" },
    ],
    traps: [
      {
        title: "Duplicate policy",
        detail:
          "Know whether equals go left, right, or are forbidden. Inconsistent handling breaks validation and delete.",
        tone: "warn",
      },
      {
        title: "Local parent check ≠ BST",
        detail:
          "A node can be ≥ parent and still violate an ancestor bound. Propagate (min, max), don’t only compare to parent.",
        tone: "bad",
      },
    ],
  }),

  sheet({
    moduleSlug: "heaps",
    tagline: "Priority in O(log n) — top-K and running medians live here.",
    smells: [
      { smell: "Repeated extract-min/max", pattern: "Binary heap" },
      { smell: "Top K in a stream", pattern: "Size-K heap" },
      { smell: "Merge K sorted", pattern: "Heap of heads" },
    ],
    patterns: [
      {
        title: "Size-K heap",
        smell: "Top K of a stream / array",
        summary:
          "For top K largest, keep a min-heap of size K. Evict the smallest when over capacity — heap root is the threshold.",
        tone: "accent",
        diagram: "heap-pyramid",
      },
      {
        title: "Two-heap median",
        smell: "Running median as values arrive",
        summary:
          "Max-heap for the lower half, min-heap for the upper. Rebalance sizes so the median sits at the boundary.",
        tone: "good",
        diagram: "heap-pyramid",
      },
      {
        title: "K-way merge",
        smell: "Merge K sorted lists / arrays",
        summary:
          "Push the next item from each list with its list id. Pop global min, push that list’s successor.",
        tone: "mark",
        diagram: "heap-pyramid",
      },
    ],
    complexity: [
      { label: "Push / pop", time: "O(log n)", space: "O(n)", note: "n = heap size" },
      { label: "Top-K over stream", time: "O(n log k)", space: "O(k)", note: "Better than full sort" },
    ],
    traps: [
      {
        title: "Min vs max heap mix-up",
        detail:
          "Top-K largest needs a min-heap of size K (evict small). Flipping the heap type silently inverts the answer.",
        tone: "bad",
      },
      {
        title: "Comparing tuples incorrectly",
        detail:
          "When the heap stores (value, index, …), define the full comparison. Partial compares break ties and corrupt order.",
        tone: "warn",
      },
    ],
  }),

  sheet({
    moduleSlug: "tries",
    tagline: "Shared prefixes — search, autocomplete, and word breaks.",
    smells: [
      { smell: "Many queries on shared stems", pattern: "Trie insert + walk" },
      { smell: "Prefix exists?", pattern: "Stop mid-word" },
      { smell: "Word search on board", pattern: "Trie + DFS prune" },
    ],
    patterns: [
      {
        title: "Insert path",
        smell: "Build a dictionary of words",
        summary:
          "Each character is an edge. Create missing children; mark end-of-word on the terminal node.",
        tone: "accent",
        diagram: "trie-branches",
      },
      {
        title: "Prefix walk",
        smell: "Autocomplete / startsWith",
        summary:
          "Follow characters until missing edge (fail) or path ends (prefix exists). End flag ⇒ full word.",
        tone: "good",
        diagram: "trie-branches",
      },
      {
        title: "DFS with trie prune",
        smell: "Board word search with a dictionary",
        summary:
          "On a board, advance the trie node with each step; dead trie node ⇒ cut that branch early.",
        tone: "mark",
        diagram: "matrix-grid",
      },
    ],
    complexity: [
      { label: "Insert / search word", time: "O(L)", space: "O(Σ·L)", note: "L = word length" },
      { label: "Build from dict", time: "O(total chars)", space: "O(total chars)", note: "Shares prefixes" },
    ],
    traps: [
      {
        title: "Prefix vs word",
        detail:
          "Reaching a node ≠ finding a word. Check the end marker (or count) explicitly.",
        tone: "warn",
      },
      {
        title: "Not restoring board marks",
        detail:
          "In-place visited marks on a grid must be undone after DFS, or sibling paths see false walls.",
        tone: "bad",
      },
    ],
  }),

  sheet({
    moduleSlug: "intervals",
    tagline: "Sort, then sweep — merge, insert, and conflict detection.",
    smells: [
      { smell: "Overlap / merge ranges", pattern: "Sort by start" },
      { smell: "Minimum rooms / cameras", pattern: "Sweep line events" },
      { smell: "Insert into sorted intervals", pattern: "Walk + merge splice" },
    ],
    patterns: [
      {
        title: "Sort + merge",
        smell: "Collapse overlapping ranges",
        summary:
          "Sort by start. If next.start ≤ current.end, extend end; else push current and shift. Linear after sort.",
        tone: "accent",
        diagram: "interval-sweep",
      },
      {
        title: "Sweep events",
        smell: "Peak concurrent intervals",
        summary:
          "Turn intervals into +1 at start and −1 at end. Sort events; scan tracking active count.",
        tone: "good",
        diagram: "interval-sweep",
      },
      {
        title: "Insert & coalesce",
        smell: "Add one interval into a sorted list",
        summary:
          "Copy intervals before the new one, merge through overlaps, then append the rest.",
        tone: "mark",
        diagram: "interval-sweep",
      },
    ],
    complexity: [
      { label: "Merge intervals", time: "O(n log n)", space: "O(n)", note: "Dominated by sort" },
      { label: "Sweep active count", time: "O(n log n)", space: "O(n)", note: "Event sort" },
    ],
    traps: [
      {
        title: "Half-open vs closed ends",
        detail:
          "Touching endpoints may or may not overlap — read the problem. Off-by-one here fails half the cases.",
        tone: "bad",
      },
      {
        title: "Event sort tie-break",
        detail:
          "When start and end share a time, decide whether ends process first. Wrong order invents a phantom overlap of 1.",
        tone: "warn",
      },
    ],
  }),

  sheet({
    moduleSlug: "greedy",
    tagline: "Local choice with a proof sketch — sort first, then commit.",
    smells: [
      { smell: "Activity selection / jumps", pattern: "Earliest end / farthest reach" },
      { smell: "Assign resources optimally", pattern: "Sort both sides" },
      { smell: "Huffman-like combine", pattern: "Always merge smallest" },
    ],
    patterns: [
      {
        title: "Sort by key, then take",
        smell: "Activity selection / interval scheduling",
        summary:
          "Pick the ordering that makes the greedy choice obvious (earliest end, largest value…). Prove no better swap exists.",
        tone: "accent",
        diagram: "greedy-choice",
      },
      {
        title: "Running reach",
        smell: "Jump Game / farthest index",
        summary:
          "Track the farthest index reachable so far; fail if i passes it. The invariant is ‘everything ≤ reach is attainable’.",
        tone: "good",
        diagram: "array-cells",
      },
      {
        title: "Exchange argument mindset",
        smell: "Need a proof sketch, not vibes",
        summary:
          "If an optimal solution differs, show you can swap toward your greedy pick without hurting the objective.",
        tone: "mark",
        diagram: "greedy-choice",
      },
    ],
    complexity: [
      { label: "Sort + linear greedy", time: "O(n log n)", space: "O(1)*", note: "*or O(n) for output" },
      { label: "Heap greedy", time: "O(n log n)", space: "O(n)", note: "Repeated extract-min" },
    ],
    traps: [
      {
        title: "Greedy without monotonicity",
        detail:
          "If a local improvement can block a better global, greedy fails — switch to DP or search.",
        tone: "bad",
      },
      {
        title: "Wrong sort key",
        detail:
          "Sorting by start when the proof needs earliest end (or vice versa) is a silent wrong answer that ‘looks sorted’.",
        tone: "warn",
      },
    ],
  }),

  sheet({
    moduleSlug: "dynamic-programming",
    tagline: "Subproblems + order — define the state before you code the loop.",
    smells: [
      { smell: "Optimal among overlapping subproblems", pattern: "DP table / memo" },
      { smell: "Count ways under constraints", pattern: "Transition sum" },
      { smell: "Knapsack / decide take or skip", pattern: "2D then compress" },
      { smell: "Longest increasing / common subsequence", pattern: "Sequence DP" },
      { smell: "Grid paths with obstacles", pattern: "2D fill from corners" },
    ],
    patterns: [
      {
        title: "State then transition",
        smell: "You can name ‘best/ways ending at i’",
        summary:
          "Name dp[i] (or dp[i][j]) in words first. Write the recurrence and base cases. Only then pick loop order — code without a named state is guesswork.",
        tone: "accent",
        diagram: "dp-table",
      },
      {
        title: "Memoised recursion",
        smell: "Sparse reachable states; natural recursive structure",
        summary:
          "Top-down: same recurrence, cache results. Great when bottom-up would fill a huge unused table. Still state the complexity of the cache size.",
        tone: "good",
        diagram: "recursion-tree",
      },
      {
        title: "Rolling space",
        smell: "dp[i] only needs dp[i−1] (or two rows)",
        summary:
          "Keep one or two rolling rows after the recurrence is correct. Compressing first is how people invent off-by-one bugs.",
        tone: "mark",
        diagram: "dp-table",
      },
      {
        title: "Decision at each step",
        smell: "Take / skip, or choose among prior endings",
        summary:
          "Write the choices explicitly (take item j, end a subsequence at i…). Transitions that ‘feel right’ without listing choices usually miss a case.",
        tone: "warn",
        diagram: "dp-table",
      },
    ],
    complexity: [
      { label: "1D sequence DP", time: "O(n·T)", space: "O(n)", note: "T = work per state" },
      { label: "Classic knapsack", time: "O(n·W)", space: "O(W)", note: "After rolling" },
      { label: "Grid path DP", time: "O(m·n)", space: "O(n)*", note: "*rolling column/row" },
    ],
    traps: [
      {
        title: "Wrong iteration order",
        detail:
          "Bottom-up must evaluate dependencies before dependents. Reverse a loop and you silently read stale zeroes — tests pass on tiny cases, fail on real ones.",
        tone: "bad",
      },
      {
        title: "Off-by-one base cases",
        detail:
          "Empty prefix, zero capacity, and the first cell of a grid are where most DP bugs hide. Write them before the nested loops.",
        tone: "warn",
      },
    ],
  }),
];
