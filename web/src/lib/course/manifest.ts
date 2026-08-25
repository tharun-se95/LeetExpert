import type { FamilyId } from "@/lib/content/manifest";

export type LessonType = "concept" | "problem" | "practice";

export interface LessonMeta {
  slug: string;
  title: string;
  type: LessonType;
}

export type ModuleStatus = "available" | "coming-soon";

export interface ModuleMeta {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  stage: number;
  status: ModuleStatus;
  lessons: LessonMeta[];
}

export interface StageMeta {
  number: number;
  title: string;
  description: string;
}

export const STAGES: StageMeta[] = [
  {
    number: 0,
    title: "Foundations",
    description:
      "How the course works, and the analysis toolkit every later module leans on.",
  },
  {
    number: 1,
    title: "Linear Structures",
    description:
      "The core containers — how they sit in memory and what their operations really cost.",
  },
  {
    number: 2,
    title: "Techniques on Linear Data",
    description:
      "Algorithmic techniques that turn quadratic scans into linear or logarithmic work.",
  },
  {
    number: 3,
    title: "Recursive & Hierarchical",
    description:
      "Recursion as a tool, then the tree-shaped structures built on it.",
  },
  {
    number: 4,
    title: "Global Reasoning",
    description:
      "Problems where the answer depends on the whole input — greedy proofs, graphs, DP.",
  },
];

function concept(slug: string, title: string): LessonMeta {
  return { slug, title, type: "concept" };
}

function problem(slug: string, title: string): LessonMeta {
  return { slug, title, type: "problem" };
}

/** Fixed Practice chapter entry — always last in problem-bearing modules. */
export function practiceLesson(): LessonMeta {
  return { slug: "practice", title: "Practice", type: "practice" };
}

export function isLessonsNavLesson(lesson: LessonMeta): boolean {
  return lesson.type === "concept" || lesson.type === "practice";
}

export const MODULES: ModuleMeta[] = [
  // ── Stage 0 — Foundations ────────────────────────────────────────────────
  {
    slug: "getting-started",
    number: 1,
    title: "How to Learn This Course",
    shortTitle: "Getting Started",
    description:
      "What this course is, how lessons and the in-browser sandbox work, and how to pace yourself.",
    stage: 0,
    status: "available",
    lessons: [
      concept("course-introduction", "Course Introduction"),
      concept("how-lessons-work", "How Lessons & Problems Work"),
      concept("writing-and-running-code", "Writing & Running Code"),
      concept("course-roadmap", "The Roadmap"),
    ],
  },
  {
    slug: "big-o",
    number: 2,
    title: "Big O & Complexity Analysis",
    shortTitle: "Big O",
    description:
      "Measure algorithms by how they scale — the vocabulary the rest of the course is written in.",
    stage: 0,
    status: "available",
    lessons: [
      concept("why-efficiency-matters", "Why Efficiency Matters"),
      concept("big-o-notation", "Big O Notation, Precisely"),
      concept("common-complexity-classes", "The Common Complexity Classes"),
      concept(
        "input-dependency-best-worst-average",
        "Input Dependency: Best, Worst, & Average",
      ),
      concept("analyzing-loops-api-complexity", "Analyzing Loops & API Complexity"),
      concept(
        "analyzing-recursion-tree-method",
        "Analyzing Recursion: The Tree Method",
      ),
      concept(
        "amortized-analysis-dynamic-arrays",
        "Amortized Analysis & Dynamic Arrays",
      ),
      concept("space-complexity", "Space Complexity"),
      concept("complexity-drills", "Complexity Drills"),
    ],
  },
  {
    slug: "math-for-dsa",
    number: 3,
    title: "Math for DSA",
    shortTitle: "Math",
    description:
      "Logarithms, modular arithmetic, and counting — just enough math, properly understood.",
    stage: 0,
    status: "available",
    lessons: [
      concept("logarithms-and-exponents", "Logarithms & Exponents"),
      concept("summations-and-series", "Summations & Series"),
      concept("modular-arithmetic", "Modular Arithmetic"),
      concept("divisibility-primes-gcd", "Divisibility, Primes & GCD"),
      concept("counting-and-combinatorics", "Counting & Combinatorics"),
      concept("math-drills", "Math Drills"),
    ],
  },

  // ── Stage 1 — Linear Structures ──────────────────────────────────────────
  {
    slug: "arrays",
    number: 4,
    title: "Arrays & Dynamic Arrays",
    shortTitle: "Arrays",
    description:
      "Contiguous memory, cache locality, resizing amortization, and in-place techniques.",
    stage: 1,
    status: "available",
    lessons: [
      concept("contiguous-memory", "Arrays in Memory"),
      concept("dynamic-arrays", "Dynamic Arrays, Built From Scratch"),
      concept("in-place-foundations", "In-Place Foundations & Symmetric Pointers"),
      concept(
        "stable-compaction-cyclic-placement",
        "Stable Compaction & Cyclic Placement",
      ),
      problem("remove-duplicates-sorted", "Remove Duplicates from Sorted Array"),
      problem("move-zeroes", "Move Zeroes"),
      problem("best-time-to-buy-sell-stock", "Best Time to Buy & Sell Stock"),
      problem("rotate-array", "Rotate Array"),
      problem("product-except-self", "Product of Array Except Self"),
      practiceLesson(),
    ],
  },
  {
    slug: "strings",
    number: 5,
    title: "Strings",
    shortTitle: "Strings",
    description:
      "Immutability, builders, encodings, and the standard transformation toolkit.",
    stage: 1,
    status: "available",
    lessons: [
      concept("strings-in-memory", "Strings in Memory & Immutability"),
      concept(
        "character-arithmetic-count-arrays",
        "Character Arithmetic & Count Arrays",
      ),
      concept(
        "string-apis-scan-costs-idioms",
        "String APIs, Scan Costs & Idioms",
      ),
      problem("valid-palindrome", "Valid Palindrome"),
      problem("valid-anagram", "Valid Anagram"),
      problem("longest-common-prefix", "Longest Common Prefix"),
      problem("find-the-index", "Find the Index (strStr)"),
      problem("reverse-words", "Reverse Words in a String"),
      practiceLesson(),
    ],
  },
  {
    slug: "hash-tables",
    number: 6,
    title: "Hash Tables",
    shortTitle: "Hash Tables",
    description:
      "Hash functions, collisions, keys, and the four usage patterns — then the problems they unlock.",
    stage: 1,
    status: "available",
    lessons: [
      concept("hashing-fundamentals", "Hashing Fundamentals"),
      concept("collision-chaining", "Collision Resolution: Separate Chaining"),
      concept("build-a-hash-map", "Build a Hash Map From Scratch"),
      concept("collision-open-addressing", "Collision Resolution: Open Addressing"),
      concept("keys-immutability-hashing", "Keys, Immutability & Cryptographic Hashing"),
      concept("hash-patterns", "The Four Hash Patterns"),
      problem("two-sum", "Two Sum"),
      problem("contains-duplicate-ii", "Contains Duplicate II"),
      problem("first-unique-character", "First Unique Character"),
      problem("group-anagrams", "Group Anagrams"),
      problem("longest-consecutive-sequence", "Longest Consecutive Sequence"),
      practiceLesson(),
    ],
  },
  {
    slug: "linked-lists",
    number: 7,
    title: "Linked Lists",
    shortTitle: "Linked Lists",
    description:
      "Node-and-pointer memory model, core operations, in-place reversal, fast & slow pointers.",
    stage: 1,
    status: "available",
    lessons: [
      concept("nodes-and-pointers", "Nodes & Pointers"),
      concept("build-a-linked-list", "Build a Linked List From Scratch"),
      concept("pointer-surgery", "Pointer Surgery Patterns"),
      problem("reverse-linked-list", "Reverse Linked List"),
      problem("middle-of-list", "Middle of the Linked List"),
      problem("linked-list-cycle", "Linked List Cycle"),
      problem("merge-two-sorted", "Merge Two Sorted Lists"),
      problem("remove-nth-from-end", "Remove Nth Node From End"),
      practiceLesson(),
    ],
  },
  {
    slug: "stacks",
    number: 8,
    title: "Stacks",
    shortTitle: "Stacks",
    description:
      "LIFO discipline, the call stack, expression problems, and the monotonic stack.",
    stage: 1,
    status: "available",
    lessons: [
      concept("lifo-and-the-call-stack", "LIFO & the Call Stack"),
      concept("matching-and-nesting", "Matching & Nesting"),
      concept("monotonic-stack", "The Monotonic Stack"),
      problem("valid-parentheses", "Valid Parentheses"),
      problem("evaluate-rpn", "Evaluate Reverse Polish Notation"),
      problem("min-stack", "Min Stack"),
      problem("daily-temperatures", "Daily Temperatures"),
      problem("largest-rectangle", "Largest Rectangle in Histogram"),
      practiceLesson(),
    ],
  },
  {
    slug: "queues",
    number: 9,
    title: "Queues",
    shortTitle: "Queues",
    description:
      "FIFO, deques, ring buffers, and the monotonic queue.",
    stage: 1,
    status: "available",
    lessons: [
      concept("fifo-basics", "FIFO & Queue Mechanics"),
      concept("ring-buffer", "Build a Ring Buffer"),
      concept("deques-and-monotonic", "Deques & the Monotonic Deque"),
      problem("recent-calls", "Number of Recent Calls"),
      problem("queue-using-stacks", "Implement Queue Using Stacks"),
      problem("stream-first-unique", "First Unique in a Stream"),
      problem("sliding-window-maximum", "Sliding Window Maximum"),
      practiceLesson(),
    ],
  },

  // ── Stage 2 — Techniques on Linear Data ──────────────────────────────────
  {
    slug: "two-pointers",
    number: 10,
    title: "Two Pointers",
    shortTitle: "Two Pointers",
    description:
      "Opposite-direction and same-direction pointer walks, and why they're correct.",
    stage: 2,
    status: "available",
    lessons: [
      concept("converging-pointers", "Converging Pointers"),
      concept("partition-pointers", "Partition Pointers"),
      problem("two-sum-ii", "Two Sum II (Sorted Input)"),
      problem("sort-colors", "Sort Colors (Dutch National Flag)"),
      problem("container-with-most-water", "Container With Most Water"),
      problem("three-sum", "3Sum"),
      problem("trapping-rain-water", "Trapping Rain Water"),
      practiceLesson(),
    ],
  },
  {
    slug: "sliding-window",
    number: 11,
    title: "Sliding Window",
    shortTitle: "Sliding Window",
    description:
      "Fixed and dynamic windows — maintaining an invariant while the window moves.",
    stage: 2,
    status: "available",
    lessons: [
      concept("fixed-size-windows", "Fixed-Size Windows"),
      concept("dynamic-windows", "Dynamic Windows & the Shrink Invariant"),
      problem("maximum-average-subarray", "Maximum Average Subarray I"),
      problem("minimum-size-subarray-sum", "Minimum Size Subarray Sum"),
      problem(
        "longest-substring-without-repeating",
        "Longest Substring Without Repeating Characters",
      ),
      problem("permutation-in-string", "Permutation in String"),
      problem("minimum-window-substring", "Minimum Window Substring"),
      practiceLesson(),
    ],
  },
  {
    slug: "prefix-sum",
    number: 12,
    title: "Prefix Sum",
    shortTitle: "Prefix Sum",
    description:
      "Precomputed running totals, prefix-sum + hash map, 2D grids, and Kadane's algorithm.",
    stage: 2,
    status: "available",
    lessons: [
      concept("prefix-sum-basics", "Prefix Sums"),
      concept("prefix-sum-hash-map", "Prefix Sum + Hash Map"),
      concept("prefix-sum-2d", "2D Prefix Sums"),
      problem("range-sum-query-immutable", "Range Sum Query — Immutable"),
      problem("subarray-sum-equals-k", "Subarray Sum Equals K"),
      problem("contiguous-array", "Contiguous Array"),
      problem("range-sum-2d-immutable", "Range Sum Query 2D — Immutable"),
      problem("kadanes-algorithm", "Maximum Subarray (Kadane's Algorithm)"),
      practiceLesson(),
    ],
  },
  {
    slug: "binary-search",
    number: 13,
    title: "Binary Search",
    shortTitle: "Binary Search",
    description:
      "The invariant-driven template, boundary variants, and binary search on the answer.",
    stage: 2,
    status: "available",
    lessons: [
      concept("the-invariant-template", "The Invariant-Driven Template"),
      concept("boundary-search", "Boundary Search"),
      concept("binary-search-on-the-answer", "Binary Search on the Answer"),
      problem("search-insert-position", "Search Insert Position"),
      problem("find-first-and-last", "Find First and Last Position"),
      problem("search-rotated-sorted-array", "Search in Rotated Sorted Array"),
      problem("koko-eating-bananas", "Koko Eating Bananas"),
      problem(
        "find-minimum-in-rotated-sorted-array",
        "Find Minimum in Rotated Sorted Array",
      ),
      practiceLesson(),
    ],
  },
  {
    slug: "sorting",
    number: 14,
    title: "Sorting",
    shortTitle: "Sorting",
    description:
      "Comparison sorts and their lower bound, linear-time sorts, stability, and when each wins.",
    stage: 2,
    status: "available",
    lessons: [
      concept("baseline-sorts", "The O(n²) Baseline Sorts"),
      concept("merge-sort-lower-bound", "Merge Sort & the n log n Lower Bound"),
      concept("quicksort-partitioning", "Quicksort & Partitioning"),
      concept("linear-time-sorts", "Linear-Time Sorts"),
      problem("sort-an-array", "Sort an Array"),
      problem("merge-intervals", "Merge Intervals"),
      problem("largest-number", "Largest Number"),
      problem("meeting-rooms-ii", "Meeting Rooms II"),
      problem("kth-largest-element", "Kth Largest Element in an Array"),
      practiceLesson(),
    ],
  },
  {
    slug: "matrix",
    number: 15,
    title: "Matrix / 2D Traversal",
    shortTitle: "Matrix",
    description:
      "Grid coordinates, traversal orders, and in-place matrix transformations.",
    stage: 2,
    status: "available",
    lessons: [
      concept("grid-coordinates", "Grid Representation & Coordinates"),
      concept("traversal-orders", "Traversal Orders"),
      concept("in-place-transformations", "In-Place Transformations"),
      problem("rotate-image", "Rotate Image"),
      problem("spiral-matrix", "Spiral Matrix"),
      problem("set-matrix-zeroes", "Set Matrix Zeroes"),
      problem("search-a-2d-matrix", "Search a 2D Matrix"),
      problem("number-of-islands", "Number of Islands"),
      problem("word-search", "Word Search"),
      practiceLesson(),
    ],
  },

  // ── Stage 3 — Recursive & Hierarchical ───────────────────────────────────
  {
    slug: "recursion-backtracking",
    number: 16,
    title: "Recursion & Backtracking",
    shortTitle: "Recursion",
    description:
      "The call-stack model, divide & conquer, and systematic search over choice trees.",
    stage: 3,
    status: "available",
    lessons: [
      concept("the-call-stack-and-base-cases", "The Call Stack & Base Cases"),
      concept(
        "backtracking-choose-explore-unchoose",
        "Backtracking: Choose, Explore, Unchoose",
      ),
      concept("recursion-vs-iteration", "Recursion vs. Iteration"),
      problem("subsets", "Subsets"),
      problem("permutations", "Permutations"),
      problem("combination-sum", "Combination Sum"),
      problem("generate-parentheses", "Generate Parentheses"),
      problem("palindrome-partitioning", "Palindrome Partitioning"),
      problem("n-queens", "N-Queens"),
      practiceLesson(),
    ],
  },
  {
    slug: "binary-trees",
    number: 17,
    title: "Binary Trees",
    shortTitle: "Binary Trees",
    description:
      "Tree anatomy, all four traversals, and reconstruction from traversal orders.",
    stage: 3,
    status: "available",
    lessons: [
      concept(
        "tree-terminology-and-representation",
        "Tree Terminology & Representation",
      ),
      concept("dfs-traversals", "DFS Traversals"),
      concept("bfs-level-order", "BFS & Level-Order Traversal"),
      concept(
        "top-down-vs-bottom-up-recursion",
        "Top-Down vs. Bottom-Up Tree Recursion",
      ),
      problem("maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree"),
      problem("diameter-of-binary-tree", "Diameter of Binary Tree"),
      problem(
        "binary-tree-level-order-traversal",
        "Binary Tree Level Order Traversal",
      ),
      problem(
        "construct-binary-tree-from-preorder-and-inorder",
        "Construct Binary Tree from Preorder and Inorder Traversal",
      ),
      problem(
        "lowest-common-ancestor-of-a-binary-tree",
        "Lowest Common Ancestor of a Binary Tree",
      ),
      problem("binary-tree-right-side-view", "Binary Tree Right Side View"),
      problem(
        "serialize-and-deserialize-binary-tree",
        "Serialize and Deserialize Binary Tree",
      ),
      practiceLesson(),
    ],
  },
  {
    slug: "bst",
    number: 18,
    title: "BST & Ordered Structures",
    shortTitle: "BST",
    description:
      "The ordering invariant, balance (AVL / red-black conceptually), and ordered-set applications.",
    stage: 3,
    status: "available",
    lessons: [
      concept(
        "bst-invariant-and-operations",
        "The BST Invariant & Core Operations",
      ),
      concept("balance-and-why-it-matters", "Balance & Why It Matters"),
      problem("validate-binary-search-tree", "Validate Binary Search Tree"),
      problem("kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST"),
      problem(
        "lowest-common-ancestor-of-a-bst",
        "Lowest Common Ancestor of a BST",
      ),
      problem(
        "insert-into-a-binary-search-tree",
        "Insert into a Binary Search Tree",
      ),
      problem("delete-node-in-a-bst", "Delete Node in a BST"),
      problem(
        "convert-sorted-array-to-bst",
        "Convert Sorted Array to Binary Search Tree",
      ),
      practiceLesson(),
    ],
  },
  {
    slug: "heaps",
    number: 19,
    title: "Heaps",
    shortTitle: "Heaps",
    description:
      "Array-backed complete trees, heapify's real cost, two-heaps, k-way merge, top-k.",
    stage: 3,
    status: "available",
    lessons: [
      concept(
        "heap-property-and-array-representation",
        "The Heap Property & Array Representation",
      ),
      concept(
        "heapify-sift-up-and-sift-down",
        "Heapify: Sift-Up & Sift-Down",
      ),
      problem(
        "kth-largest-element-in-a-stream",
        "Kth Largest Element in a Stream",
      ),
      problem("top-k-frequent-elements", "Top K Frequent Elements"),
      problem("k-closest-points-to-origin", "K Closest Points to Origin"),
      problem("merge-k-sorted-lists", "Merge k Sorted Lists"),
      problem(
        "find-median-from-data-stream",
        "Find Median from Data Stream",
      ),
      problem("task-scheduler", "Task Scheduler"),
      practiceLesson(),
    ],
  },
  {
    slug: "tries",
    number: 20,
    title: "Tries",
    shortTitle: "Tries",
    description:
      "Prefix trees — building, searching, and when they beat hash tables.",
    stage: 3,
    status: "available",
    lessons: [
      concept(
        "trie-structure-and-prefix-search",
        "Trie Structure & Prefix Search",
      ),
      problem("implement-trie", "Implement Trie (Prefix Tree)"),
      problem(
        "design-add-and-search-words",
        "Design Add and Search Words Data Structure",
      ),
      problem("longest-word-in-dictionary", "Longest Word in Dictionary"),
      problem("word-search-ii", "Word Search II"),
      practiceLesson(),
    ],
  },

  // ── Stage 4 — Global Reasoning ───────────────────────────────────────────
  {
    slug: "intervals",
    number: 21,
    title: "Intervals",
    shortTitle: "Intervals",
    description:
      "Sorting by endpoints, merging, and scheduling — the sweep mindset.",
    stage: 4,
    status: "available",
    lessons: [
      concept(
        "sorting-intervals-and-the-sweep",
        "Sorting Intervals & the Sweep",
      ),
      problem("meeting-rooms", "Meeting Rooms"),
      problem("insert-interval", "Insert Interval"),
      problem("non-overlapping-intervals", "Non-overlapping Intervals"),
      problem(
        "minimum-arrows-to-burst-balloons",
        "Minimum Number of Arrows to Burst Balloons",
      ),
      problem("employee-free-time", "Employee Free Time"),
      practiceLesson(),
    ],
  },
  {
    slug: "greedy",
    number: 22,
    title: "Greedy",
    shortTitle: "Greedy",
    description:
      "Exchange arguments — proving the greedy choice is safe, not just hoping.",
    stage: 4,
    status: "available",
    lessons: [
      concept(
        "greedy-choice-and-proving-correctness",
        "The Greedy Choice Property & Proving Correctness",
      ),
      problem("jump-game", "Jump Game"),
      problem("jump-game-ii", "Jump Game II"),
      problem("gas-station", "Gas Station"),
      problem("partition-labels", "Partition Labels"),
      problem("candy", "Candy"),
      practiceLesson(),
    ],
  },
  {
    slug: "graphs",
    number: 23,
    title: "Graphs",
    shortTitle: "Graphs",
    description:
      "Representations, BFS/DFS, topological sort, union-find, shortest paths, MST.",
    stage: 4,
    status: "available",
    lessons: [
      concept("graph-representation", "Graph Representation"),
      concept("dfs-and-bfs-on-graphs", "DFS & BFS on Graphs"),
      concept("topological-sort", "Topological Sort"),
      concept("shortest-paths", "Shortest Paths (BFS, Dijkstra)"),
      concept("union-find", "Union-Find (Disjoint Set)"),
      concept(
        "minimum-spanning-trees",
        "Minimum Spanning Trees (Kruskal's & Prim's)",
      ),
      problem("clone-graph", "Clone Graph"),
      problem("course-schedule", "Course Schedule"),
      problem("course-schedule-ii", "Course Schedule II"),
      problem("network-delay-time", "Network Delay Time"),
      problem("number-of-provinces", "Number of Provinces"),
      problem("redundant-connection", "Redundant Connection"),
      problem(
        "min-cost-to-connect-all-points",
        "Min Cost to Connect All Points",
      ),
      practiceLesson(),
    ],
  },
  {
    slug: "dynamic-programming",
    number: 24,
    title: "Dynamic Programming",
    shortTitle: "DP",
    description:
      "Overlapping subproblems from first principles — 1-D, knapsack, LIS, grid, string, tree DP.",
    stage: 4,
    status: "available",
    lessons: [
      concept(
        "from-recursion-to-memoization",
        "From Recursion to Memoization",
      ),
      concept(
        "tabulation-and-space-optimization",
        "Tabulation & Space Optimization",
      ),
      concept("1d-dp-patterns", "1D DP Patterns"),
      concept("2d-dp-patterns", "2D DP Patterns"),
      concept("knapsack-style-dp", "Knapsack-Style DP"),
      problem("climbing-stairs", "Climbing Stairs"),
      problem("house-robber", "House Robber"),
      problem("coin-change", "Coin Change"),
      problem(
        "longest-increasing-subsequence",
        "Longest Increasing Subsequence",
      ),
      problem("unique-paths", "Unique Paths"),
      problem(
        "longest-common-subsequence",
        "Longest Common Subsequence",
      ),
      problem("edit-distance", "Edit Distance"),
      problem(
        "partition-equal-subset-sum",
        "Partition Equal Subset Sum",
      ),
      problem("word-break", "Word Break"),
      problem("house-robber-iii", "House Robber III"),
      practiceLesson(),
    ],
  },
];

export function getModule(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getLesson(
  moduleSlug: string,
  lessonSlug: string,
): { module: ModuleMeta; lesson: LessonMeta } | undefined {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;
  return { module: mod, lesson };
}

export function findProblemBySlug(
  slug: string,
): { module: ModuleMeta; lesson: LessonMeta } | undefined {
  for (const mod of MODULES) {
    const lesson = mod.lessons.find(
      (l) => l.slug === slug && l.type === "problem",
    );
    if (lesson) return { module: mod, lesson };
  }
  return undefined;
}

/** Prev/next among a module's OWN problems, in their authored order. */
export function getProblemNeighbors(
  moduleSlug: string,
  problemSlug: string,
): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const mod = getModule(moduleSlug);
  if (!mod) return { prev: null, next: null };
  const problems = mod.lessons.filter((l) => l.type === "problem");
  const idx = problems.findIndex((l) => l.slug === problemSlug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? { slug: problems[idx - 1].slug, title: problems[idx - 1].title } : null,
    next:
      idx < problems.length - 1
        ? { slug: problems[idx + 1].slug, title: problems[idx + 1].title }
        : null,
  };
}

export interface ProblemGroup {
  module: ModuleMeta;
  problems: LessonMeta[];
}

/** Every module that has at least one problem, with just its problems. */
export function groupedProblems(): ProblemGroup[] {
  return MODULES.map((m) => ({
    module: m,
    problems: m.lessons.filter((l) => l.type === "problem"),
  })).filter((g) => g.problems.length > 0);
}

/** Every problem lesson's slug — used by /problems/[slug]'s generateStaticParams. */
export function allProblemSlugs(): string[] {
  return MODULES.flatMap((m) =>
    m.lessons.filter((l) => l.type === "problem").map((l) => l.slug),
  );
}

export function modulesByStage(stage: number): ModuleMeta[] {
  return MODULES.filter((m) => m.stage === stage);
}

/** Every lesson id, including problems. Format: module/lesson. */
export function allLessonIds(): string[] {
  return MODULES.flatMap((m) => m.lessons.map((l) => `${m.slug}/${l.slug}`));
}

/**
 * Lessons-sidebar + Header progress denominator: concepts and Practice
 * chapters only — never individual problems.
 */
export function allLessonsNavIds(): string[] {
  return MODULES.flatMap((m) =>
    m.lessons
      .filter(isLessonsNavLesson)
      .map((l) => `${m.slug}/${l.slug}`),
  );
}

const FAMILY_BY_MODULE: Record<string, FamilyId> = {
  arrays: "linear-traversal",
  strings: "linear-traversal",
  "hash-tables": "linear-traversal",
  "prefix-sum": "linear-traversal",
  "linked-lists": "pointer-movement",
  stacks: "priority-structures",
  queues: "priority-structures",
  "two-pointers": "pointer-movement",
  "sliding-window": "pointer-movement",
  "binary-search": "ordering-search",
  sorting: "ordering-search",
  matrix: "ordering-search",
  intervals: "ordering-search",
  "recursion-backtracking": "recursive-exploration",
  "binary-trees": "recursive-exploration",
  bst: "recursive-exploration",
  heaps: "priority-structures",
  tries: "priority-structures",
  graphs: "relationships",
  greedy: "state-transition",
  "dynamic-programming": "state-transition",
};

export function moduleFamily(
  mod: ModuleMeta | string,
): FamilyId | null {
  const slug = typeof mod === "string" ? mod : mod.slug;
  return FAMILY_BY_MODULE[slug] ?? null;
}
