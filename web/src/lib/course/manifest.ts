export type LessonType = "concept" | "problem";

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

export const MODULES: ModuleMeta[] = [
  // ── Stage 0 — Foundations ────────────────────────────────────────────────
  {
    slug: "getting-started",
    number: 1,
    title: "How to Learn This Course",
    shortTitle: "Getting Started",
    description:
      "What this course is, how lessons and problems work, and how to pace yourself.",
    stage: 0,
    status: "available",
    lessons: [
      concept("course-introduction", "Course Introduction"),
      concept("how-lessons-work", "How Lessons & Problems Work"),
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
      concept("analyzing-code", "Analyzing Loops & Recursion"),
      concept(
        "best-worst-average-amortized",
        "Best, Worst, Average & Amortized",
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
      concept("in-place-techniques", "In-Place Techniques"),
      problem("remove-duplicates-sorted", "Remove Duplicates from Sorted Array"),
      problem("move-zeroes", "Move Zeroes"),
      problem("rotate-array", "Rotate Array"),
      problem("best-time-to-buy-sell-stock", "Best Time to Buy & Sell Stock"),
      problem("product-except-self", "Product of Array Except Self"),
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
      concept("string-toolkit", "The String Toolkit"),
      problem("valid-palindrome", "Valid Palindrome"),
      problem("valid-anagram", "Valid Anagram"),
      problem("longest-common-prefix", "Longest Common Prefix"),
      problem("reverse-words", "Reverse Words in a String"),
      problem("find-the-index", "Find the Index (strStr)"),
    ],
  },
  {
    slug: "hash-tables",
    number: 6,
    title: "Hash Tables",
    shortTitle: "Hash Tables",
    description:
      "Hash functions, collisions, load factor, resizing — then the problems they unlock.",
    stage: 1,
    status: "available",
    lessons: [
      concept("hashing-fundamentals", "Hashing Fundamentals"),
      concept("collision-resolution", "Collisions, Load Factor & Resizing"),
      concept("build-a-hash-map", "Build a Hash Map From Scratch"),
      concept("hash-patterns", "The Four Hash Patterns"),
      problem("two-sum", "Two Sum"),
      problem("contains-duplicate-ii", "Contains Duplicate II"),
      problem("first-unique-character", "First Unique Character"),
      problem("group-anagrams", "Group Anagrams"),
      problem("longest-consecutive-sequence", "Longest Consecutive Sequence"),
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
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "matrix",
    number: 15,
    title: "Matrix / 2D Traversal",
    shortTitle: "Matrix",
    description:
      "Grid coordinates, traversal orders, and in-place matrix transformations.",
    stage: 2,
    status: "coming-soon",
    lessons: [],
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
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "binary-trees",
    number: 17,
    title: "Binary Trees",
    shortTitle: "Binary Trees",
    description:
      "Tree anatomy, all four traversals, and reconstruction from traversal orders.",
    stage: 3,
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "bst",
    number: 18,
    title: "BST & Ordered Structures",
    shortTitle: "BST",
    description:
      "The ordering invariant, balance (AVL / red-black conceptually), and ordered-set applications.",
    stage: 3,
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "heaps",
    number: 19,
    title: "Heaps",
    shortTitle: "Heaps",
    description:
      "Array-backed complete trees, heapify's real cost, two-heaps, k-way merge, top-k.",
    stage: 3,
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "tries",
    number: 20,
    title: "Tries",
    shortTitle: "Tries",
    description:
      "Prefix trees — building, searching, and when they beat hash tables.",
    stage: 3,
    status: "coming-soon",
    lessons: [],
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
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "greedy",
    number: 22,
    title: "Greedy",
    shortTitle: "Greedy",
    description:
      "Exchange arguments — proving the greedy choice is safe, not just hoping.",
    stage: 4,
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "graphs",
    number: 23,
    title: "Graphs",
    shortTitle: "Graphs",
    description:
      "Representations, BFS/DFS, topological sort, union-find, shortest paths, MST.",
    stage: 4,
    status: "coming-soon",
    lessons: [],
  },
  {
    slug: "dynamic-programming",
    number: 24,
    title: "Dynamic Programming",
    shortTitle: "DP",
    description:
      "Overlapping subproblems from first principles — 1-D, knapsack, LIS, grid, string, tree DP.",
    stage: 4,
    status: "coming-soon",
    lessons: [],
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

export function modulesByStage(stage: number): ModuleMeta[] {
  return MODULES.filter((m) => m.stage === stage);
}

/** Every lesson id, used for progress denominators. Format: module/lesson. */
export function allLessonIds(): string[] {
  return MODULES.flatMap((m) => m.lessons.map((l) => `${m.slug}/${l.slug}`));
}
