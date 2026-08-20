import type { ModuleCheatsheet } from "../types";

export const arraysCheatsheet: ModuleCheatsheet = {
  moduleSlug: "arrays",
  tier: "gold",
  tagline: "In-place discipline — write pointers, partitions, one pass.",
  smells: [
    { smell: "Sorted array, remove / unique in place", pattern: "Write pointer" },
    { smell: "Reorder around a predicate (zero / pivot)", pattern: "Partition" },
    { smell: "Rotate or reverse cycles, O(1) space", pattern: "Triple reverse" },
    { smell: "Best of something over a scan", pattern: "Running extreme" },
    { smell: "Answer needs left×right without division", pattern: "Prefix / suffix" },
  ],
  patterns: [
    {
      title: "Write pointer",
      smell: "Compact valid elements to the front",
      summary:
        "Read with one index, write with another. Everything left of write is the answer region; never allocate a second array.",
      tone: "accent",
      diagram: "array-cells",
    },
    {
      title: "Partition pointers",
      smell: "Stable reorder by a boolean test",
      summary:
        "Grow a ‘kept’ region from the left. Swap (or assign) when the predicate holds; watch relative order if the problem demands stability.",
      tone: "good",
      diagram: "two-pointers",
    },
    {
      title: "Triple reverse",
      smell: "Rotate by k with O(1) extra memory",
      summary:
        "Reverse whole → reverse prefix → reverse suffix. Normalise k mod n before indexing; empty and n=1 are free no-ops.",
      tone: "mark",
      diagram: "array-cells",
    },
    {
      title: "Running minimum / maximum",
      smell: "Optimal pair from a left-to-right scan",
      summary:
        "Track the best so far while scanning once. The sell/buy (or similar) day ordering is an invariant — encode it in the scan direction.",
      tone: "accent",
      diagram: "prefix-bar",
    },
    {
      title: "Prefix × suffix products",
      smell: "Each index needs product of all others",
      summary:
        "Build left products, then fold right products on a second pass. Division tricks die on zeroes — don’t use them.",
      tone: "warn",
      diagram: "prefix-bar",
    },
  ],
  complexity: [
    { label: "Write / partition pass", time: "O(n)", space: "O(1)", note: "Target for in-place drills" },
    { label: "Triple reverse rotate", time: "O(n)", space: "O(1)", note: "Three linear reverses" },
    { label: "Prefix / suffix products", time: "O(n)", space: "O(1)*", note: "*output array doesn’t count" },
  ],
  traps: [
    {
      title: "Off-by-one on the write index",
      detail:
        "Decide whether write points at the next free slot or the last written one — and stick to it. Mixing the two is the usual silent corruption.",
      tone: "warn",
    },
    {
      title: "k can exceed n",
      detail:
        "Any rotate or index arithmetic that ignores k %= n will read off the end. Normalise before you touch the array.",
      tone: "bad",
    },
  ],
};

export const stringsCheatsheet: ModuleCheatsheet = {
  moduleSlug: "strings",
  tier: "gold",
  tagline: "Two ends, builders, and character counts — not magic regex.",
  smells: [
    { smell: "Ignore non-alphanumeric / case", pattern: "Filter + two pointers" },
    { smell: "Same letters, different order", pattern: "Anagram counts" },
    { smell: "Shared stem across words", pattern: "Prefix shrink" },
    { smell: "Words reversed, spaces messy", pattern: "Split / rebuild" },
    { smell: "Find needle in haystack", pattern: "Scan + match window" },
  ],
  patterns: [
    {
      title: "Two-pointer palindrome",
      smell: "Symmetric check after cleaning",
      summary:
        "Advance L/R while skipping noise characters. Compare lowercase forms; stop when they cross.",
      tone: "accent",
      diagram: "two-pointers",
    },
    {
      title: "Frequency / anagram map",
      smell: "Permutation of the same multiset",
      summary:
        "Count characters (array of 26 or a map). Equal counts ⇔ anagram. Prefer fixed alphabets when the problem allows.",
      tone: "good",
      diagram: "hash-buckets",
    },
    {
      title: "Longest common prefix",
      smell: "Vertical or horizontal shrink",
      summary:
        "Start from the first string and trim until every word agrees — or compare column-by-column and stop at the first mismatch.",
      tone: "mark",
      diagram: "array-cells",
    },
    {
      title: "Reverse words",
      smell: "Token order flips, spacing collapses",
      summary:
        "Identify word spans, then rebuild with a single space. Trim ends; don’t reverse characters inside words unless asked.",
      tone: "accent",
      diagram: "array-cells",
    },
    {
      title: "Substring search window",
      smell: "First index of a pattern",
      summary:
        "Slide a candidate start; match character-by-character. Know the naive O(n·m) baseline before reaching for KMP.",
      tone: "warn",
      diagram: "sliding-window",
    },
  ],
  complexity: [
    { label: "Clean + two pointers", time: "O(n)", space: "O(1)", note: "Or O(n) if you build a filtered copy" },
    { label: "Anagram counts", time: "O(n)", space: "O(Σ)", note: "Σ = alphabet size" },
    { label: "Naive strStr", time: "O(n·m)", space: "O(1)", note: "Acceptable for short needles" },
  ],
  traps: [
    {
      title: "Immutability cost",
      detail:
        "Repeated string concatenation in a loop is quadratic in some languages. Build with a list/array, then join once.",
      tone: "warn",
    },
    {
      title: "Unicode vs interview alphabet",
      detail:
        "Problems usually mean ASCII letters/digits. Don’t invent Unicode case folding unless the statement asks.",
      tone: "bad",
    },
  ],
};

export const hashTablesCheatsheet: ModuleCheatsheet = {
  moduleSlug: "hash-tables",
  tier: "gold",
  tagline: "O(1) average lookup turns nested scans into one pass.",
  smells: [
    { smell: "Need complement / pair for a target", pattern: "Value → index map" },
    { smell: "Duplicate inside a distance k", pattern: "Sliding last-seen" },
    { smell: "First unique / order of appearance", pattern: "Count then scan" },
    { smell: "Group by signature", pattern: "Key = sorted / count tuple" },
    { smell: "Long consecutive run without sort", pattern: "Set + expand ends" },
  ],
  patterns: [
    {
      title: "Complement map",
      smell: "Two-sum family",
      summary:
        "As you scan, ask ‘have I seen target − x?’ Store value → index. One pass; don’t forget you cannot reuse the same index.",
      tone: "accent",
      diagram: "hash-buckets",
    },
    {
      title: "Last-seen index window",
      smell: "Duplicates with distance constraint",
      summary:
        "Map value → latest index. When the gap ≤ k, you have a hit. Overwrite the index as you go.",
      tone: "good",
      diagram: "sliding-window",
    },
    {
      title: "Count then first pass",
      smell: "First unique character / element",
      summary:
        "Frequency map first, then a stable left-to-right scan for count == 1. Order matters — maps alone lose it.",
      tone: "mark",
      diagram: "hash-buckets",
    },
    {
      title: "Canonical key grouping",
      smell: "Anagrams / isomorphic buckets",
      summary:
        "Hash a sorted string or a count signature. Every member of a group shares one key — append to that list.",
      tone: "accent",
      diagram: "hash-buckets",
    },
    {
      title: "Set + expand consecutive",
      smell: "Longest consecutive sequence",
      summary:
        "Put numbers in a set. Only start a run at n when n−1 is absent — then walk n+1… Length is the walk count.",
      tone: "warn",
      diagram: "array-cells",
    },
  ],
  complexity: [
    { label: "One-pass complement", time: "O(n)", space: "O(n)", note: "Average hash time" },
    { label: "Group by signature", time: "O(n·k log k)", space: "O(n·k)", note: "k = key length if sorting" },
    { label: "Consecutive via set", time: "O(n)", space: "O(n)", note: "Each run starts once" },
  ],
  traps: [
    {
      title: "Hashing unhashable structures",
      detail:
        "Lists aren’t keys — freeze them (tuple / sorted string / joined counts) before inserting into a map.",
      tone: "warn",
    },
    {
      title: "Average vs worst case",
      detail:
        "Interview answers assume average O(1). Pathological collisions exist; still state the average unless asked for worst-case structures.",
      tone: "bad",
    },
  ],
};

export const twoPointersCheatsheet: ModuleCheatsheet = {
  moduleSlug: "two-pointers",
  tier: "gold",
  tagline: "Opposite ends or same direction — drop a nested loop.",
  smells: [
    { smell: "Sorted array, pair / triplet sum", pattern: "Opposite ends" },
    { smell: "Remove / move while reading ahead", pattern: "Fast / slow" },
    { smell: "Container / area between indices", pattern: "Inward from tallest hope" },
    { smell: "Merge two sorted streams", pattern: "One pointer each" },
  ],
  patterns: [
    {
      title: "Opposite ends",
      smell: "Sorted + target sum",
      summary:
        "Start L=0, R=n−1. Move the end that makes the sum closer to the target. Sorting (if allowed) is the enabling step.",
      tone: "accent",
      diagram: "two-pointers",
    },
    {
      title: "Fast & slow (same array)",
      smell: "Read ahead, write behind",
      summary:
        "Slow marks the boundary of the kept region; fast explores. Same skeleton as array write-pointer drills.",
      tone: "good",
      diagram: "array-cells",
    },
    {
      title: "Inward area search",
      smell: "Width × min height style scores",
      summary:
        "Width shrinks as pointers meet — only move the shorter side, because moving the taller one cannot improve the min.",
      tone: "mark",
      diagram: "two-pointers",
    },
    {
      title: "Two-list merge walk",
      smell: "Combine sorted inputs",
      summary:
        "Always take the smaller head. When one list exhausts, append the rest. Linear in combined length.",
      tone: "accent",
      diagram: "linked-list",
    },
  ],
  complexity: [
    { label: "Opposite ends on sorted", time: "O(n)", space: "O(1)", note: "Plus sort if needed" },
    { label: "Fast / slow rewrite", time: "O(n)", space: "O(1)", note: "In-place" },
    { label: "Merge two sorted", time: "O(n+m)", space: "O(1)*", note: "*or O(n+m) for a new array" },
  ],
  traps: [
    {
      title: "Forgetting the sort prerequisite",
      detail:
        "Opposite-end sum logic is wrong on unsorted data. Either sort first (and handle index requirements) or pick another pattern.",
      tone: "bad",
    },
    {
      title: "Crossing pointers",
      detail:
        "Loop condition is usually L < R. Equality can double-count the middle element — know whether the problem allows it.",
      tone: "warn",
    },
  ],
};

export const slidingWindowCheatsheet: ModuleCheatsheet = {
  moduleSlug: "sliding-window",
  tier: "gold",
  tagline: "Grow the right edge, shrink the left — maintain a window invariant.",
  smells: [
    { smell: "Longest / shortest subarray with a property", pattern: "Variable window" },
    { smell: "Fixed length k aggregate", pattern: "Fixed window" },
    { smell: "At most K distinct / replacements", pattern: "Count map + shrink" },
    { smell: "Anagram / permutation in a string", pattern: "Need map + deficit" },
  ],
  patterns: [
    {
      title: "Variable window",
      smell: "Max length while invariant holds",
      summary:
        "Expand R freely; while the invariant breaks, advance L. Answer updates when the window is valid.",
      tone: "accent",
      diagram: "sliding-window",
    },
    {
      title: "Fixed window of k",
      smell: "Best score on every block of k",
      summary:
        "Maintain a running sum (or structure) for indices [i−k+1, i]. Slide by adding the entering element and dropping the leaving one.",
      tone: "good",
      diagram: "sliding-window",
    },
    {
      title: "Distinct / frequency budget",
      smell: "At most K different characters",
      summary:
        "Map counts inside the window. When distinct > K (or a budget breaks), shrink from L until legal again.",
      tone: "mark",
      diagram: "hash-buckets",
    },
    {
      title: "Need / have matching",
      smell: "Window must cover required counts",
      summary:
        "Track how many constraints are satisfied. Expand until ‘need’ is met, then shrink to minimise — classic minimum-window shape.",
      tone: "warn",
      diagram: "sliding-window",
    },
  ],
  complexity: [
    { label: "Variable window scan", time: "O(n)", space: "O(Σ)", note: "Each index enters/leaves once" },
    { label: "Fixed window", time: "O(n)", space: "O(1)", note: "Often just a running sum" },
    { label: "Covering window", time: "O(n)", space: "O(Σ)", note: "Two maps or one + deficit" },
  ],
  traps: [
    {
      title: "Updating the answer at the wrong time",
      detail:
        "Max-length updates when valid; min-length updates after you’ve satisfied the need and while shrinking. Mixing them is a silent wrong answer.",
      tone: "bad",
    },
    {
      title: "Forgetting to erase zero counts",
      detail:
        "If you use map.size / distinct counters, delete keys (or decrement a distinct tally) when a count hits zero — stale keys inflate distinct.",
      tone: "warn",
    },
  ],
};

export const linkedListsCheatsheet: ModuleCheatsheet = {
  moduleSlug: "linked-lists",
  tier: "gold",
  tagline: "Pointer surgery — reverse, meet, and splice without losing the rest.",
  smells: [
    { smell: "Reverse order of nodes", pattern: "Iterative prev/curr/next" },
    { smell: "Middle or cycle?", pattern: "Fast & slow" },
    { smell: "Remove nth from end", pattern: "Leader gap of n" },
    { smell: "Merge two sorted lists", pattern: "Dummy head walk" },
    { smell: "Reorder / rotate nodes", pattern: "Cut + relink" },
  ],
  patterns: [
    {
      title: "Iterative reverse",
      smell: "Flip every next without recursion",
      summary:
        "Three pointers: prev, curr, next. Save next, rewire curr.next → prev, then advance. Return prev — that is the new head.",
      tone: "accent",
      diagram: "linked-list",
    },
    {
      title: "Fast & slow",
      smell: "Middle node or cycle detection",
      summary:
        "Slow +1, fast +2. Middle when fast hits null; cycle when fast meets slow again. Draw one lap — the rhythm sticks.",
      tone: "good",
      diagram: "fast-slow-list",
    },
    {
      title: "Dummy head",
      smell: "Delete or merge that might touch the real head",
      summary:
        "Fake node before the list so every splice shares one path. Return dummy.next. Eliminates special-case head deletes.",
      tone: "mark",
      diagram: "linked-list",
    },
    {
      title: "Leader gap",
      smell: "Nth from end without knowing length first",
      summary:
        "Advance a leader n steps (or n+1 if you need the node before the cut). Move both until leader is null — follower sits at the edit point.",
      tone: "warn",
      diagram: "fast-slow-list",
    },
    {
      title: "Cut and relink",
      smell: "Rotate, split, or weave two chains",
      summary:
        "Find the cut with a length or two-pointer pass, then rewire heads/tails. Never lose the second half’s head before you attach it.",
      tone: "accent",
      diagram: "linked-list",
    },
  ],
  complexity: [
    { label: "Reverse / middle / merge", time: "O(n)", space: "O(1)", note: "Prefer iterative" },
    { label: "Recursive reverse", time: "O(n)", space: "O(n)", note: "Call stack depth" },
    { label: "Cycle detect (Floyd)", time: "O(n)", space: "O(1)", note: "No visited set needed" },
  ],
  traps: [
    {
      title: "Losing the next pointer",
      detail:
        "Save curr.next before rewiring. One missed save and the rest of the list is unreachable — silent data loss, not a crash.",
      tone: "bad",
    },
    {
      title: "Off-by-one on the gap",
      detail:
        "Removing the nth-from-end needs the node before it. A gap of n vs n+1 is the usual bug; empty-list and n = length are the stress cases.",
      tone: "warn",
    },
  ],
};

export const stacksCheatsheet: ModuleCheatsheet = {
  moduleSlug: "stacks",
  tier: "gold",
  tagline: "LIFO for nesting, deferred work, and monotonic candidates.",
  smells: [
    { smell: "Valid parentheses / nesting", pattern: "Push open, match close" },
    { smell: "Next greater / smaller element", pattern: "Monotonic stack" },
    { smell: "Evaluate expression / calculator", pattern: "Values + ops stacks" },
    { smell: "Histogram / largest rectangle", pattern: "Mono heights + widths" },
    { smell: "Decode nested strings", pattern: "Stack of frames" },
  ],
  patterns: [
    {
      title: "Match nesting",
      smell: "Brackets, tags, or nested scopes",
      summary:
        "Push opening symbols; on close, pop and check the pair. Empty stack at the end ⇔ balanced. A leftover opener is also a fail.",
      tone: "accent",
      diagram: "stack-lifo",
    },
    {
      title: "Monotonic stack",
      smell: "Next greater / smaller to the right (or left)",
      summary:
        "Keep indices in increasing or decreasing value order. When a new value breaks the mono invariant, pop — each pop answers ‘next’ for that index.",
      tone: "good",
      diagram: "sort-bars",
    },
    {
      title: "Deferred evaluation",
      smell: "Infix expression or running calculator",
      summary:
        "Hold operators until precedence (or a ‘)’) says apply. Two stacks — values and ops — cover most interview expression drills.",
      tone: "mark",
      diagram: "stack-lifo",
    },
    {
      title: "Frame stack decode",
      smell: "Nested repeats like 3[a2[c]]",
      summary:
        "Push a frame (count, partial string) when you enter a bracket; pop and multiply when you leave. The stack depth mirrors nesting.",
      tone: "warn",
      diagram: "recursion-tree",
    },
  ],
  complexity: [
    { label: "Linear scan + stack", time: "O(n)", space: "O(n)", note: "Each index push/pop ≤ once" },
    { label: "Nested structure walk", time: "O(n)", space: "O(h)", note: "h = nesting depth" },
    { label: "Monotonic next-greater", time: "O(n)", space: "O(n)", note: "Amortised one pop per index" },
  ],
  traps: [
    {
      title: "Peeking an empty stack",
      detail:
        "Always guard pop/top. Empty means unmatched closer or no candidate yet — both are meaningful states, not just crashes.",
      tone: "warn",
    },
    {
      title: "Storing values instead of indices",
      detail:
        "Monotonic ‘next greater’ usually needs indices (for distance or later writes). Storing only values loses where the answer belongs.",
      tone: "bad",
    },
  ],
};

export const binarySearchCheatsheet: ModuleCheatsheet = {
  moduleSlug: "binary-search",
  tier: "gold",
  tagline: "Halve a monotonic search space — on arrays or on the answer.",
  smells: [
    { smell: "Sorted array lookup / bound", pattern: "Classic binary search" },
    { smell: "Min feasible capacity / days / speed", pattern: "Search on answer" },
    { smell: "First true / last false in a predicate", pattern: "Lower / upper bound" },
    { smell: "Peak / bitonic array", pattern: "Compare mid to neighbours" },
    { smell: "Rotated sorted array", pattern: "Identify the sorted half" },
  ],
  patterns: [
    {
      title: "Classic midpoint",
      smell: "Find a target in a sorted array",
      summary:
        "Maintain [lo, hi] where the answer may live. Mid = lo + (hi − lo) // 2 — avoids overflow. Shrink the half that cannot contain the target.",
      tone: "accent",
      diagram: "binary-search",
    },
    {
      title: "Search on answer",
      smell: "Minimise / maximise a numeric capacity",
      summary:
        "When feasibility is monotonic in a numeric answer, binary search that number and run a linear check. The check — not the mid formula — is the hard part.",
      tone: "good",
      diagram: "prefix-bar",
    },
    {
      title: "Lower / upper bound",
      smell: "First index where predicate becomes true",
      summary:
        "Loop until lo == hi; return that boundary. Decide inclusive/exclusive carefully — ‘first true’ and ‘last false’ differ by one.",
      tone: "mark",
      diagram: "binary-search",
    },
    {
      title: "Rotated / bitonic half",
      smell: "Sorted array that was rotated, or a peak",
      summary:
        "Compare mid to an endpoint (or neighbour) to learn which half is sorted / ascending. Search the half that still can hold the answer.",
      tone: "warn",
      diagram: "array-cells",
    },
  ],
  complexity: [
    { label: "Array binary search", time: "O(log n)", space: "O(1)", note: "Sorted input" },
    { label: "Answer search + check", time: "O(check · log R)", space: "O(1)", note: "R = answer range" },
    { label: "Rotated search", time: "O(log n)", space: "O(1)", note: "One sorted half each step" },
  ],
  traps: [
    {
      title: "Infinite loop on bounds",
      detail:
        "Ensure every branch moves lo or hi. Using mid and mid±1 inconsistently with an inclusive range is the usual hang — write the invariant first.",
      tone: "bad",
    },
    {
      title: "Non-monotonic check",
      detail:
        "Search-on-answer only works when ‘feasible(x)’ never flips back. If the predicate wiggles, binary search returns nonsense — prove monotonicity first.",
      tone: "warn",
    },
  ],
};

export const graphsCheatsheet: ModuleCheatsheet = {
  moduleSlug: "graphs",
  tier: "gold",
  tagline: "Nodes + edges — BFS for short, DFS for components, Union-Find for merges.",
  smells: [
    { smell: "Shortest path, unweighted", pattern: "BFS" },
    { smell: "Connected components / cycle", pattern: "DFS or Union-Find" },
    { smell: "Topological order / course schedule", pattern: "Kahn or DFS postorder" },
    { smell: "Edges stream in; connectivity queries", pattern: "Union-Find" },
    { smell: "Grid islands / regions", pattern: "DFS/BFS flood" },
  ],
  patterns: [
    {
      title: "BFS shortest",
      smell: "Unweighted (or equal-weight) distance",
      summary:
        "Queue + dist (or layer count). First time you reach a node is optimal — don’t relax it again. Mark seen when enqueued, not when dequeued, to avoid duplicates.",
      tone: "accent",
      diagram: "bfs-layers",
    },
    {
      title: "DFS components",
      smell: "Count islands, colour regions, detect cycles",
      summary:
        "Flood from each unvisited node. Mark visited to avoid revisits. On directed graphs, cycle detection needs a recursion-stack (or colours), not only a visited set.",
      tone: "good",
      diagram: "tree-levels",
    },
    {
      title: "Union-Find",
      smell: "Merge sets; ask ‘same component?’",
      summary:
        "find(u) with path compression; union by rank/size. Perfect when edges arrive as pairs and you rarely need full adjacency.",
      tone: "mark",
      diagram: "union-find",
    },
    {
      title: "Topo sort (Kahn)",
      smell: "Order tasks with prerequisites",
      summary:
        "Queue zero-indegree nodes; peel outgoing edges. Cycle ⇔ you finish with fewer than V nodes ordered. DFS postorder is the dual.",
      tone: "warn",
      diagram: "bfs-layers",
    },
  ],
  complexity: [
    { label: "BFS / DFS", time: "O(V+E)", space: "O(V)", note: "Adj list assumed" },
    { label: "Union-Find (α)", time: "≈ O(E α(V))", space: "O(V)", note: "Nearly linear" },
    { label: "Kahn topo", time: "O(V+E)", space: "O(V)", note: "Indegree array + queue" },
  ],
  traps: [
    {
      title: "Directed vs undirected edges",
      detail:
        "Adding both directions on a directed problem invents paths that don’t exist. Match the statement — and build the adj list the same way.",
      tone: "bad",
    },
    {
      title: "Marking visited too late",
      detail:
        "In BFS, mark when you enqueue. Marking only on dequeue lets the same node sit in the queue many times and blows time on dense graphs.",
      tone: "warn",
    },
  ],
};

export const recursionBacktrackingCheatsheet: ModuleCheatsheet = {
  moduleSlug: "recursion-backtracking",
  tier: "gold",
  tagline: "Choose → explore → unchoose. The call stack is your state.",
  smells: [
    { smell: "All subsets / permutations", pattern: "Backtracking tree" },
    { smell: "Constraint board (N-Queens…)", pattern: "Place + prune" },
    { smell: "Divide structure in half", pattern: "Recurse on parts" },
    { smell: "Every valid arrangement / path", pattern: "Enumerate + record" },
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
    {
      title: "Place + prune (constraints)",
      smell: "N-Queens, Sudoku, safe placement",
      summary:
        "Check constraints before recursing, not after recording. Pruning at the placement step is what keeps board searches from degenerating into full enumeration.",
      tone: "warn",
      diagram: "recursion-tree",
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
    {
      title: "Pruning after the record",
      detail:
        "If you record partial answers and only reject them later, you still walk the dead branches. Reject at the choice, not at the leaf.",
      tone: "warn",
    },
  ],
};

export const binaryTreesCheatsheet: ModuleCheatsheet = {
  moduleSlug: "binary-trees",
  tier: "gold",
  tagline: "Rooted structure — traverse with intent (order, level, or path).",
  smells: [
    { smell: "Visit every node once", pattern: "DFS pre/in/post" },
    { smell: "Per level aggregates", pattern: "BFS queue" },
    { smell: "Path / diameter style", pattern: "DFS return + global" },
    { smell: "Reconstruct from traversals", pattern: "Split by inorder root" },
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
    {
      title: "Reconstruct from traversals",
      smell: "Preorder + inorder (or the like)",
      summary:
        "Take the root from preorder, split inorder into left/right spans, recurse on each span. The root index bookkeeping is the entire trap.",
      tone: "warn",
      diagram: "tree-levels",
    },
  ],
  complexity: [
    { label: "DFS / BFS visit", time: "O(n)", space: "O(h) / O(w)", note: "h height, w width" },
    { label: "Path aggregates", time: "O(n)", space: "O(h)", note: "One pass with returns" },
    { label: "Reconstruct", time: "O(n)", space: "O(n)", note: "With index map" },
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
    {
      title: "Reconstruction index drift",
      detail:
        "Inorder split sizes shrink each level; recompute spans from lengths, not from global positions, or you read off the wrong subtree.",
      tone: "warn",
    },
  ],
};

export const heapsCheatsheet: ModuleCheatsheet = {
  moduleSlug: "heaps",
  tier: "gold",
  tagline: "Priority in O(log n) — top-K and running medians live here.",
  smells: [
    { smell: "Repeated extract-min/max", pattern: "Binary heap" },
    { smell: "Top K in a stream", pattern: "Size-K heap" },
    { smell: "Merge K sorted", pattern: "Heap of heads" },
    { smell: "Cooldown / gap scheduling", pattern: "Greedy with heap" },
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
      diagram: "array-cells",
    },
    {
      title: "Greedy with heap (cooldown)",
      smell: "Task scheduler / spaced gaps",
      summary:
        "Always run the task with the largest remaining count; park just-run tasks in a cooldown queue until their gap clears. A plain queue drifts from optimal.",
      tone: "warn",
      diagram: "heap-pyramid",
    },
  ],
  complexity: [
    { label: "Push / pop", time: "O(log n)", space: "O(n)", note: "n = heap size" },
    { label: "Top-K over stream", time: "O(n log k)", space: "O(k)", note: "Better than full sort" },
    { label: "K-way merge", time: "O(n log k)", space: "O(k)", note: "n total items, k lists" },
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
    {
      title: "Cooldown queue vs heap state",
      detail:
        "A task on cooldown must re-enter the heap, not stay parked. Forgetting to re-push is how task-scheduler counts come out too small.",
      tone: "warn",
    },
  ],
};

export const intervalsCheatsheet: ModuleCheatsheet = {
  moduleSlug: "intervals",
  tier: "gold",
  tagline: "Sort, then sweep — merge, insert, and conflict detection.",
  smells: [
    { smell: "Overlap / merge ranges", pattern: "Sort by start" },
    { smell: "Minimum rooms / cameras", pattern: "Sweep line events" },
    { smell: "Insert into sorted intervals", pattern: "Walk + merge splice" },
    { smell: "Fewest removals for non-overlap", pattern: "Earliest-end greedy" },
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
    {
      title: "Earliest-end greedy",
      smell: "Max non-overlapping / min arrows",
      summary:
        "For maximum non-overlapping intervals, keep the one ending soonest and drop any later interval that overlaps it. Earliest start fails on the overlap chain.",
      tone: "warn",
      diagram: "greedy-choice",
    },
  ],
  complexity: [
    { label: "Merge intervals", time: "O(n log n)", space: "O(n)", note: "Dominated by sort" },
    { label: "Sweep active count", time: "O(n log n)", space: "O(n)", note: "Event sort" },
    { label: "Earliest-end greedy", time: "O(n log n)", space: "O(n)", note: "Sort by end" },
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
    {
      title: "Greedy key confusion",
      detail:
        "Non-overlap greed sorts by END; a sort-by-start variant ‘looks sorted’ and quietly accepts overlapping chains. State the key before you code.",
      tone: "warn",
    },
  ],
};

export const dynamicProgrammingCheatsheet: ModuleCheatsheet = {
  moduleSlug: "dynamic-programming",
  tier: "gold",
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
    {
      title: "State that is not a decision point",
      detail:
        "If dp[i] cannot decide between alternatives at i, you are missing a dimension. Adding the choice to the state is cheaper than a wrong recurrence.",
      tone: "warn",
    },
  ],
};

export const GOLD_SHEETS: ModuleCheatsheet[] = [
  arraysCheatsheet,
  stringsCheatsheet,
  hashTablesCheatsheet,
  twoPointersCheatsheet,
  slidingWindowCheatsheet,
  linkedListsCheatsheet,
  stacksCheatsheet,
  binarySearchCheatsheet,
  graphsCheatsheet,
  recursionBacktrackingCheatsheet,
  binaryTreesCheatsheet,
  heapsCheatsheet,
  intervalsCheatsheet,
  dynamicProgrammingCheatsheet,
];
