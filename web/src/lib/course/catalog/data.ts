import type { CatalogProblem } from "./types";

export const CATALOG_PROBLEMS: readonly CatalogProblem[] = [
  {
    "id": 1,
    "slug": "two-sum",
    "title": "Two Sum",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Hash Tables"
    ],
    "pattern": "Complement lookup",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "hash-tables",
    "courseLessonSlug": "two-sum"
  },
  {
    "id": 2,
    "slug": "add-two-numbers",
    "title": "Add Two Numbers",
    "difficulty": "Medium",
    "topics": [
      "Linked Lists",
      "Math"
    ],
    "pattern": "Carry-propagating simultaneous traverse",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 3,
    "slug": "longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "topics": [
      "Sliding Window",
      "Strings",
      "Hash Tables"
    ],
    "pattern": "Dynamic window + last-seen map",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "sliding-window",
    "courseLessonSlug": "longest-substring-without-repeating"
  },
  {
    "id": 4,
    "slug": "median-of-two-sorted-arrays",
    "title": "Median of Two Sorted Arrays",
    "difficulty": "Hard",
    "topics": [
      "Binary Search",
      "Arrays",
      "Divide and Conquer"
    ],
    "pattern": "Binary search on dual-array partition",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 11,
    "slug": "container-with-most-water",
    "title": "Container With Most Water",
    "difficulty": "Medium",
    "topics": [
      "Two Pointers",
      "Arrays",
      "Greedy"
    ],
    "pattern": "Converging area (advance shorter side)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "two-pointers",
    "courseLessonSlug": "container-with-most-water"
  },
  {
    "id": 14,
    "slug": "longest-common-prefix",
    "title": "Longest Common Prefix",
    "difficulty": "Easy",
    "topics": [
      "Strings",
      "Tries"
    ],
    "pattern": "Vertical / horizontal scan prefix trim",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "strings",
    "courseLessonSlug": "longest-common-prefix"
  },
  {
    "id": 15,
    "slug": "3sum",
    "title": "3Sum",
    "difficulty": "Medium",
    "topics": [
      "Two Pointers",
      "Arrays",
      "Sorting"
    ],
    "pattern": "Sort + two-pointer per pivot",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "two-pointers",
    "courseLessonSlug": "three-sum"
  },
  {
    "id": 17,
    "slug": "letter-combinations-of-a-phone-number",
    "title": "Letter Combinations of a Phone Number",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Strings"
    ],
    "pattern": "Multi-way digit-mapping Cartesian branch",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 19,
    "slug": "remove-nth-node-from-end-of-list",
    "title": "Remove Nth Node From End",
    "difficulty": "Medium",
    "topics": [
      "Linked Lists",
      "Two Pointers"
    ],
    "pattern": "Fixed-gap dual pointers",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "linked-lists",
    "courseLessonSlug": "remove-nth-from-end"
  },
  {
    "id": 20,
    "slug": "valid-parentheses",
    "title": "Valid Parentheses",
    "difficulty": "Easy",
    "topics": [
      "Stacks",
      "Strings"
    ],
    "pattern": "Bracket matching stack",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "stacks",
    "courseLessonSlug": "valid-parentheses"
  },
  {
    "id": 21,
    "slug": "merge-two-sorted-lists",
    "title": "Merge Two Sorted Lists",
    "difficulty": "Easy",
    "topics": [
      "Linked Lists",
      "Recursion"
    ],
    "pattern": "Dummy-head iterative splice",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "linked-lists",
    "courseLessonSlug": "merge-two-sorted"
  },
  {
    "id": 22,
    "slug": "generate-parentheses",
    "title": "Generate Parentheses",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Strings",
      "Stacks"
    ],
    "pattern": "Count-constrained branching",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "recursion-backtracking",
    "courseLessonSlug": "generate-parentheses"
  },
  {
    "id": 23,
    "slug": "merge-k-sorted-lists",
    "title": "Merge k Sorted Lists",
    "difficulty": "Hard",
    "topics": [
      "Linked Lists",
      "Heaps",
      "Divide and Conquer"
    ],
    "pattern": "Min-heap of active list heads",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "heaps",
    "courseLessonSlug": "merge-k-sorted-lists"
  },
  {
    "id": 26,
    "slug": "remove-duplicates-from-sorted-array",
    "title": "Remove Duplicates from Sorted Array",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Two Pointers"
    ],
    "pattern": "Two pointers / write pointer",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "arrays",
    "courseLessonSlug": "remove-duplicates-sorted"
  },
  {
    "id": 27,
    "slug": "remove-element",
    "title": "Remove Element",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Two Pointers"
    ],
    "pattern": "In-place write pointer",
    "lists": [
      "all",
      "top150"
    ]
  },
  {
    "id": 28,
    "slug": "find-the-index-of-the-first-occurrence-in-a-string",
    "title": "Find the Index in String (strStr)",
    "difficulty": "Easy",
    "topics": [
      "Strings",
      "Two Pointers"
    ],
    "pattern": "Sliding window / KMP match scan",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "strings",
    "courseLessonSlug": "find-the-index"
  },
  {
    "id": 33,
    "slug": "search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "difficulty": "Medium",
    "topics": [
      "Binary Search",
      "Arrays"
    ],
    "pattern": "Pivot-aware sorted-half binary search",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-search",
    "courseLessonSlug": "search-rotated-sorted-array"
  },
  {
    "id": 34,
    "slug": "find-first-and-last-position-of-element-in-sorted-array",
    "title": "Find First and Last Position",
    "difficulty": "Medium",
    "topics": [
      "Binary Search",
      "Arrays"
    ],
    "pattern": "Dual boundary searches (left & right biased)",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "binary-search",
    "courseLessonSlug": "find-first-and-last"
  },
  {
    "id": 35,
    "slug": "search-insert-position",
    "title": "Search Insert Position",
    "difficulty": "Easy",
    "topics": [
      "Binary Search",
      "Arrays"
    ],
    "pattern": "Lower-bound insertion binary search",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "binary-search",
    "courseLessonSlug": "search-insert-position"
  },
  {
    "id": 36,
    "slug": "valid-sudoku",
    "title": "Valid Sudoku",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Hash Tables",
      "Matrix"
    ],
    "pattern": "Row, column, and sub-box hashing",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 39,
    "slug": "combination-sum",
    "title": "Combination Sum",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Arrays"
    ],
    "pattern": "Unbounded candidate choice tree",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "recursion-backtracking",
    "courseLessonSlug": "combination-sum"
  },
  {
    "id": 40,
    "slug": "combination-sum-ii",
    "title": "Combination Sum II",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Arrays"
    ],
    "pattern": "Bounded candidate choice with duplicate skipping",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 42,
    "slug": "trapping-rain-water",
    "title": "Trapping Rain Water",
    "difficulty": "Hard",
    "topics": [
      "Two Pointers",
      "Arrays",
      "Stacks"
    ],
    "pattern": "Two-pointer running prefix / suffix maxima",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "two-pointers",
    "courseLessonSlug": "trapping-rain-water"
  },
  {
    "id": 45,
    "slug": "jump-game-ii",
    "title": "Jump Game II",
    "difficulty": "Medium",
    "topics": [
      "Greedy",
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Jump frontier window advancement",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "greedy",
    "courseLessonSlug": "jump-game-ii"
  },
  {
    "id": 46,
    "slug": "permutations",
    "title": "Permutations",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Arrays"
    ],
    "pattern": "Swap-based / used-array exploration tree",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "recursion-backtracking",
    "courseLessonSlug": "permutations"
  },
  {
    "id": 48,
    "slug": "rotate-image",
    "title": "Rotate Image",
    "difficulty": "Medium",
    "topics": [
      "Matrix",
      "Math",
      "Arrays"
    ],
    "pattern": "Transpose + horizontal reflect (in-place)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "matrix",
    "courseLessonSlug": "rotate-image"
  },
  {
    "id": 49,
    "slug": "group-anagrams",
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Hash Tables",
      "Strings"
    ],
    "pattern": "Sorted-key grouping",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "hash-tables",
    "courseLessonSlug": "group-anagrams"
  },
  {
    "id": 51,
    "slug": "n-queens",
    "title": "N-Queens",
    "difficulty": "Hard",
    "topics": [
      "Recursion & Backtracking",
      "Arrays"
    ],
    "pattern": "Board column & diagonal bitset conflict pruning",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "recursion-backtracking",
    "courseLessonSlug": "n-queens"
  },
  {
    "id": 53,
    "slug": "maximum-subarray",
    "title": "Maximum Subarray (Kadane's Algorithm)",
    "difficulty": "Medium",
    "topics": [
      "Prefix Sum",
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Running sum reset on negative",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "prefix-sum",
    "courseLessonSlug": "kadanes-algorithm"
  },
  {
    "id": 54,
    "slug": "spiral-matrix",
    "title": "Spiral Matrix",
    "difficulty": "Medium",
    "topics": [
      "Matrix",
      "Arrays"
    ],
    "pattern": "Four boundary pointer inward walk",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "matrix",
    "courseLessonSlug": "spiral-matrix"
  },
  {
    "id": 55,
    "slug": "jump-game",
    "title": "Jump Game",
    "difficulty": "Medium",
    "topics": [
      "Greedy",
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Running maximum reach boundary check",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "greedy",
    "courseLessonSlug": "jump-game"
  },
  {
    "id": 56,
    "slug": "merge-intervals",
    "title": "Merge Intervals",
    "difficulty": "Medium",
    "topics": [
      "Intervals",
      "Sorting",
      "Arrays"
    ],
    "pattern": "Sort by start + interval union sweep",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "sorting",
    "courseLessonSlug": "merge-intervals"
  },
  {
    "id": 57,
    "slug": "insert-interval",
    "title": "Insert Interval",
    "difficulty": "Medium",
    "topics": [
      "Intervals",
      "Arrays"
    ],
    "pattern": "Walk left, coalesce overlapping, append right",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "intervals",
    "courseLessonSlug": "insert-interval"
  },
  {
    "id": 62,
    "slug": "unique-paths",
    "title": "Unique Paths",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Combinatorics",
      "Matrix"
    ],
    "pattern": "2D grid sum from top and left neighbors",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "unique-paths"
  },
  {
    "id": 70,
    "slug": "climbing-stairs",
    "title": "Climbing Stairs",
    "difficulty": "Easy",
    "topics": [
      "Dynamic Programming",
      "Math"
    ],
    "pattern": "1D linear recurrence (Fibonacci)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "climbing-stairs"
  },
  {
    "id": 72,
    "slug": "edit-distance",
    "title": "Edit Distance",
    "difficulty": "Hard",
    "topics": [
      "Dynamic Programming",
      "Strings"
    ],
    "pattern": "2D edit table (insert, delete, replace min)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "edit-distance"
  },
  {
    "id": 73,
    "slug": "set-matrix-zeroes",
    "title": "Set Matrix Zeroes",
    "difficulty": "Medium",
    "topics": [
      "Matrix",
      "Arrays"
    ],
    "pattern": "First row & column markers for O(1) space",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "matrix",
    "courseLessonSlug": "set-matrix-zeroes"
  },
  {
    "id": 74,
    "slug": "search-a-2d-matrix",
    "title": "Search a 2D Matrix",
    "difficulty": "Medium",
    "topics": [
      "Binary Search",
      "Matrix",
      "Arrays"
    ],
    "pattern": "Flattened virtual 1D binary search",
    "lists": [
      "all",
      "course",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "matrix",
    "courseLessonSlug": "search-a-2d-matrix"
  },
  {
    "id": 75,
    "slug": "sort-colors",
    "title": "Sort Colors (Dutch National Flag)",
    "difficulty": "Medium",
    "topics": [
      "Two Pointers",
      "Arrays",
      "Sorting"
    ],
    "pattern": "Three-way partition pointers",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "two-pointers",
    "courseLessonSlug": "sort-colors"
  },
  {
    "id": 76,
    "slug": "minimum-window-substring",
    "title": "Minimum Window Substring",
    "difficulty": "Hard",
    "topics": [
      "Sliding Window",
      "Strings",
      "Hash Tables"
    ],
    "pattern": "Coverage counter expansion and contraction",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "sliding-window",
    "courseLessonSlug": "minimum-window-substring"
  },
  {
    "id": 78,
    "slug": "subsets",
    "title": "Subsets",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Arrays"
    ],
    "pattern": "Include / exclude binary decision tree",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "recursion-backtracking",
    "courseLessonSlug": "subsets"
  },
  {
    "id": 79,
    "slug": "word-search",
    "title": "Word Search",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Matrix"
    ],
    "pattern": "Grid DFS with visited cell backtracking",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "matrix",
    "courseLessonSlug": "word-search"
  },
  {
    "id": 84,
    "slug": "largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "topics": [
      "Stacks",
      "Monotonic Stack",
      "Arrays"
    ],
    "pattern": "Monotonic increasing stack boundaries",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "stacks",
    "courseLessonSlug": "largest-rectangle"
  },
  {
    "id": 90,
    "slug": "subsets-ii",
    "title": "Subsets II",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Arrays"
    ],
    "pattern": "Decision tree with sorted duplicate skip",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 98,
    "slug": "validate-binary-search-tree",
    "title": "Validate Binary Search Tree",
    "difficulty": "Medium",
    "topics": [
      "BST",
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Min / max bound propagation",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "bst",
    "courseLessonSlug": "validate-binary-search-tree"
  },
  {
    "id": 100,
    "slug": "same-tree",
    "title": "Same Tree",
    "difficulty": "Easy",
    "topics": [
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Dual-node simultaneous structural match",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 102,
    "slug": "binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "difficulty": "Medium",
    "topics": [
      "Binary Trees",
      "BFS",
      "Queues"
    ],
    "pattern": "BFS queue level-drain",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "binary-tree-level-order-traversal"
  },
  {
    "id": 104,
    "slug": "maximum-depth-of-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "difficulty": "Easy",
    "topics": [
      "Binary Trees",
      "Recursion",
      "DFS"
    ],
    "pattern": "Bottom-up height calculation",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "maximum-depth-of-binary-tree"
  },
  {
    "id": 105,
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
    "title": "Construct Binary Tree from Preorder and Inorder",
    "difficulty": "Medium",
    "topics": [
      "Binary Trees",
      "Arrays",
      "Divide and Conquer"
    ],
    "pattern": "Inorder index split by preorder root",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "construct-binary-tree-from-preorder-and-inorder"
  },
  {
    "id": 108,
    "slug": "convert-sorted-array-to-binary-search-tree",
    "title": "Convert Sorted Array to Binary Search Tree",
    "difficulty": "Easy",
    "topics": [
      "BST",
      "Binary Trees",
      "Divide and Conquer"
    ],
    "pattern": "Mid-split recursive balance",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "bst",
    "courseLessonSlug": "convert-sorted-array-to-bst"
  },
  {
    "id": 110,
    "slug": "balanced-binary-tree",
    "title": "Balanced Binary Tree",
    "difficulty": "Easy",
    "topics": [
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Bottom-up height check with -1 early exit",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 121,
    "slug": "best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy & Sell Stock",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Dynamic Programming"
    ],
    "pattern": "Single-pass running minimum",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "arrays",
    "courseLessonSlug": "best-time-to-buy-sell-stock"
  },
  {
    "id": 122,
    "slug": "best-time-to-buy-and-sell-stock-ii",
    "title": "Best Time to Buy and Sell Stock II",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Greedy"
    ],
    "pattern": "Sum of all positive valleys-to-peaks",
    "lists": [
      "all",
      "top150"
    ]
  },
  {
    "id": 124,
    "slug": "binary-tree-maximum-path-sum",
    "title": "Binary Tree Maximum Path Sum",
    "difficulty": "Hard",
    "topics": [
      "Binary Trees",
      "Dynamic Programming",
      "DFS"
    ],
    "pattern": "Post-order max single gain + global arch",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 125,
    "slug": "valid-palindrome",
    "title": "Valid Palindrome",
    "difficulty": "Easy",
    "topics": [
      "Two Pointers",
      "Strings"
    ],
    "pattern": "Converging pointers with alphanumeric filter",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "strings",
    "courseLessonSlug": "valid-palindrome"
  },
  {
    "id": 127,
    "slug": "word-ladder",
    "title": "Word Ladder",
    "difficulty": "Hard",
    "topics": [
      "Graphs",
      "BFS",
      "Strings",
      "Hash Tables"
    ],
    "pattern": "Shortest transformation path via bidirectional BFS",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 128,
    "slug": "longest-consecutive-sequence",
    "title": "Longest Consecutive Sequence",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Hash Tables"
    ],
    "pattern": "Run detection from sequence heads",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "hash-tables",
    "courseLessonSlug": "longest-consecutive-sequence"
  },
  {
    "id": 130,
    "slug": "surrounded-regions",
    "title": "Surrounded Regions",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Matrix",
      "DFS"
    ],
    "pattern": "Boundary-connected uncapturable flood fill",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 131,
    "slug": "palindrome-partitioning",
    "title": "Palindrome Partitioning",
    "difficulty": "Medium",
    "topics": [
      "Recursion & Backtracking",
      "Strings",
      "Dynamic Programming"
    ],
    "pattern": "Valid palindrome prefix split tree",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "recursion-backtracking",
    "courseLessonSlug": "palindrome-partitioning"
  },
  {
    "id": 133,
    "slug": "clone-graph",
    "title": "Clone Graph",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Hash Tables",
      "BFS",
      "DFS"
    ],
    "pattern": "BFS / DFS with original-to-clone hash map",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "clone-graph"
  },
  {
    "id": 134,
    "slug": "gas-station",
    "title": "Gas Station",
    "difficulty": "Medium",
    "topics": [
      "Greedy",
      "Arrays"
    ],
    "pattern": "Net surplus tour with deficit reset",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "greedy",
    "courseLessonSlug": "gas-station"
  },
  {
    "id": 135,
    "slug": "candy",
    "title": "Candy",
    "difficulty": "Hard",
    "topics": [
      "Greedy",
      "Arrays"
    ],
    "pattern": "Two-sweep rating comparisons (left & right)",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "greedy",
    "courseLessonSlug": "candy"
  },
  {
    "id": 136,
    "slug": "single-number",
    "title": "Single Number",
    "difficulty": "Easy",
    "topics": [
      "Bit Manipulation",
      "Arrays"
    ],
    "pattern": "XOR cancellation of paired duplicates",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 138,
    "slug": "copy-list-with-random-pointer",
    "title": "Copy List with Random Pointer",
    "difficulty": "Medium",
    "topics": [
      "Linked Lists",
      "Hash Tables"
    ],
    "pattern": "Map clone or interweaved nodes",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 139,
    "slug": "word-break",
    "title": "Word Break",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Strings",
      "Hash Tables",
      "Tries"
    ],
    "pattern": "Prefix-reachable boolean DP array",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "word-break"
  },
  {
    "id": 141,
    "slug": "linked-list-cycle",
    "title": "Linked List Cycle",
    "difficulty": "Easy",
    "topics": [
      "Linked Lists",
      "Two Pointers"
    ],
    "pattern": "Floyd's fast & slow pointer cycle detection",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "linked-lists",
    "courseLessonSlug": "linked-list-cycle"
  },
  {
    "id": 143,
    "slug": "reorder-list",
    "title": "Reorder List",
    "difficulty": "Medium",
    "topics": [
      "Linked Lists",
      "Two Pointers"
    ],
    "pattern": "Find midpoint + reverse half + interleave",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 146,
    "slug": "lru-cache",
    "title": "LRU Cache",
    "difficulty": "Medium",
    "topics": [
      "Linked Lists",
      "Hash Tables",
      "Design"
    ],
    "pattern": "Doubly linked list + hash map",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 150,
    "slug": "evaluate-reverse-polish-notation",
    "title": "Evaluate Reverse Polish Notation",
    "difficulty": "Medium",
    "topics": [
      "Stacks",
      "Arrays",
      "Math"
    ],
    "pattern": "Operand stack evaluation",
    "lists": [
      "all",
      "course",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "stacks",
    "courseLessonSlug": "evaluate-rpn"
  },
  {
    "id": 151,
    "slug": "reverse-words-in-a-string",
    "title": "Reverse Words in a String",
    "difficulty": "Medium",
    "topics": [
      "Strings",
      "Two Pointers"
    ],
    "pattern": "Split, reverse tokens, and collapse whitespace",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "strings",
    "courseLessonSlug": "reverse-words"
  },
  {
    "id": 152,
    "slug": "maximum-product-subarray",
    "title": "Maximum Product Subarray",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Running min and max tracking to handle negative flips",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 153,
    "slug": "find-minimum-in-rotated-sorted-array",
    "title": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium",
    "topics": [
      "Binary Search",
      "Arrays"
    ],
    "pattern": "Inflection point binary search",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-search",
    "courseLessonSlug": "find-minimum-in-rotated-sorted-array"
  },
  {
    "id": 155,
    "slug": "min-stack",
    "title": "Min Stack",
    "difficulty": "Medium",
    "topics": [
      "Stacks",
      "Design"
    ],
    "pattern": "Parallel min stack / paired values",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "stacks",
    "courseLessonSlug": "min-stack"
  },
  {
    "id": 167,
    "slug": "two-sum-ii-input-array-is-sorted",
    "title": "Two Sum II (Sorted Input)",
    "difficulty": "Medium",
    "topics": [
      "Two Pointers",
      "Arrays",
      "Binary Search"
    ],
    "pattern": "Converging pointers on sorted array",
    "lists": [
      "all",
      "course",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "two-pointers",
    "courseLessonSlug": "two-sum-ii"
  },
  {
    "id": 179,
    "slug": "largest-number",
    "title": "Largest Number",
    "difficulty": "Medium",
    "topics": [
      "Sorting",
      "Strings",
      "Greedy"
    ],
    "pattern": "Custom comparator comparing (a + b) vs (b + a)",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "sorting",
    "courseLessonSlug": "largest-number"
  },
  {
    "id": 189,
    "slug": "rotate-array",
    "title": "Rotate Array",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Two Pointers"
    ],
    "pattern": "Reverse cycles / triple reverse",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "arrays",
    "courseLessonSlug": "rotate-array"
  },
  {
    "id": 190,
    "slug": "reverse-bits",
    "title": "Reverse Bits",
    "difficulty": "Easy",
    "topics": [
      "Bit Manipulation",
      "Divide and Conquer"
    ],
    "pattern": "Bitwise shift and accumulate",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 191,
    "slug": "number-of-1-bits",
    "title": "Number of 1 Bits",
    "difficulty": "Easy",
    "topics": [
      "Bit Manipulation",
      "Divide and Conquer"
    ],
    "pattern": "Brian Kernighan's bit clearing: n & (n - 1)",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 198,
    "slug": "house-robber",
    "title": "House Robber",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Take / skip decision 1D recurrence",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "house-robber"
  },
  {
    "id": 199,
    "slug": "binary-tree-right-side-view",
    "title": "Binary Tree Right Side View",
    "difficulty": "Medium",
    "topics": [
      "Binary Trees",
      "BFS",
      "DFS"
    ],
    "pattern": "BFS rightmost node capture",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "binary-tree-right-side-view"
  },
  {
    "id": 200,
    "slug": "number-of-islands",
    "title": "Number of Islands",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Matrix",
      "BFS",
      "DFS"
    ],
    "pattern": "Grid flood fill connected components",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "matrix",
    "courseLessonSlug": "number-of-islands"
  },
  {
    "id": 206,
    "slug": "reverse-linked-list",
    "title": "Reverse Linked List",
    "difficulty": "Easy",
    "topics": [
      "Linked Lists"
    ],
    "pattern": "Three-pointer iterative pointer reversal",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "linked-lists",
    "courseLessonSlug": "reverse-linked-list"
  },
  {
    "id": 207,
    "slug": "course-schedule",
    "title": "Course Schedule",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Topological Sort",
      "BFS",
      "DFS"
    ],
    "pattern": "Cycle detection in directed graph (Kahn / DFS colors)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "course-schedule"
  },
  {
    "id": 208,
    "slug": "implement-trie-prefix-tree",
    "title": "Implement Trie (Prefix Tree)",
    "difficulty": "Medium",
    "topics": [
      "Tries",
      "Design",
      "Strings"
    ],
    "pattern": "26-ary child pointer nodes + isWord flag",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "tries",
    "courseLessonSlug": "implement-trie"
  },
  {
    "id": 209,
    "slug": "minimum-size-subarray-sum",
    "title": "Minimum Size Subarray Sum",
    "difficulty": "Medium",
    "topics": [
      "Sliding Window",
      "Arrays",
      "Binary Search"
    ],
    "pattern": "Dynamic shrink window",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "sliding-window",
    "courseLessonSlug": "minimum-size-subarray-sum"
  },
  {
    "id": 210,
    "slug": "course-schedule-ii",
    "title": "Course Schedule II",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Topological Sort",
      "BFS"
    ],
    "pattern": "Topological order extraction (Kahn's in-degrees)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "course-schedule-ii"
  },
  {
    "id": 211,
    "slug": "design-add-and-search-words-data-structure",
    "title": "Design Add and Search Words",
    "difficulty": "Medium",
    "topics": [
      "Tries",
      "DFS",
      "Design"
    ],
    "pattern": "Trie walk with wildcard dot DFS branching",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "tries",
    "courseLessonSlug": "design-add-and-search-words"
  },
  {
    "id": 212,
    "slug": "word-search-ii",
    "title": "Word Search II",
    "difficulty": "Hard",
    "topics": [
      "Tries",
      "Recursion & Backtracking",
      "Matrix"
    ],
    "pattern": "Trie-pruned grid DFS with cell masking",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "tries",
    "courseLessonSlug": "word-search-ii"
  },
  {
    "id": 213,
    "slug": "house-robber-ii",
    "title": "House Robber II",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Circular array two-run linear DP",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 215,
    "slug": "kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "topics": [
      "Heaps",
      "Sorting",
      "Divide and Conquer"
    ],
    "pattern": "Quickselect near-linear partition / min-heap",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "sorting",
    "courseLessonSlug": "kth-largest-element"
  },
  {
    "id": 217,
    "slug": "contains-duplicate",
    "title": "Contains Duplicate",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Hash Tables"
    ],
    "pattern": "Seen set lookup",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 219,
    "slug": "contains-duplicate-ii",
    "title": "Contains Duplicate II",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Hash Tables",
      "Sliding Window"
    ],
    "pattern": "Last-seen index map",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "hash-tables",
    "courseLessonSlug": "contains-duplicate-ii"
  },
  {
    "id": 226,
    "slug": "invert-binary-tree",
    "title": "Invert Binary Tree",
    "difficulty": "Easy",
    "topics": [
      "Binary Trees",
      "Recursion"
    ],
    "pattern": "Recursive child swap",
    "lists": [
      "all",
      "blind75",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 230,
    "slug": "kth-smallest-element-in-a-bst",
    "title": "Kth Smallest Element in a BST",
    "difficulty": "Medium",
    "topics": [
      "BST",
      "Binary Trees",
      "DFS"
    ],
    "pattern": "In-order traversal count",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "bst",
    "courseLessonSlug": "kth-smallest-element-in-a-bst"
  },
  {
    "id": 232,
    "slug": "implement-queue-using-stacks",
    "title": "Implement Queue using Stacks",
    "difficulty": "Easy",
    "topics": [
      "Queues",
      "Stacks",
      "Design"
    ],
    "pattern": "Two-stack amortized push / pop",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "queues",
    "courseLessonSlug": "queue-using-stacks"
  },
  {
    "id": 235,
    "slug": "lowest-common-ancestor-of-a-binary-search-tree",
    "title": "Lowest Common Ancestor of a BST",
    "difficulty": "Medium",
    "topics": [
      "BST",
      "Binary Trees"
    ],
    "pattern": "BST value split path walk",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "bst",
    "courseLessonSlug": "lowest-common-ancestor-of-a-bst"
  },
  {
    "id": 236,
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "title": "Lowest Common Ancestor of a Binary Tree",
    "difficulty": "Medium",
    "topics": [
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Post-order bottom-up subtree presence",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "lowest-common-ancestor-of-a-binary-tree"
  },
  {
    "id": 238,
    "slug": "product-of-array-except-self",
    "title": "Product of Array Except Self",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Prefix Sum"
    ],
    "pattern": "Prefix / suffix products",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "arrays",
    "courseLessonSlug": "product-except-self"
  },
  {
    "id": 239,
    "slug": "sliding-window-maximum",
    "title": "Sliding Window Maximum",
    "difficulty": "Hard",
    "topics": [
      "Sliding Window",
      "Queues",
      "Monotonic Deque"
    ],
    "pattern": "Monotonic decreasing deque of indices",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "queues",
    "courseLessonSlug": "sliding-window-maximum"
  },
  {
    "id": 242,
    "slug": "valid-anagram",
    "title": "Valid Anagram",
    "difficulty": "Easy",
    "topics": [
      "Strings",
      "Hash Tables"
    ],
    "pattern": "Character frequency count",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "strings",
    "courseLessonSlug": "valid-anagram"
  },
  {
    "id": 252,
    "slug": "meeting-rooms",
    "title": "Meeting Rooms",
    "difficulty": "Easy",
    "topics": [
      "Intervals",
      "Sorting"
    ],
    "pattern": "Sort by start + pairwise overlap check",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "intervals",
    "courseLessonSlug": "meeting-rooms"
  },
  {
    "id": 253,
    "slug": "meeting-rooms-ii",
    "title": "Meeting Rooms II",
    "difficulty": "Medium",
    "topics": [
      "Intervals",
      "Sorting",
      "Heaps"
    ],
    "pattern": "Chronological sweep line / min-heap of active ends",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "sorting",
    "courseLessonSlug": "meeting-rooms-ii"
  },
  {
    "id": 268,
    "slug": "missing-number",
    "title": "Missing Number",
    "difficulty": "Easy",
    "topics": [
      "Bit Manipulation",
      "Arrays",
      "Math"
    ],
    "pattern": "XOR index with value or Gauss sum",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 283,
    "slug": "move-zeroes",
    "title": "Move Zeroes",
    "difficulty": "Easy",
    "topics": [
      "Arrays",
      "Two Pointers"
    ],
    "pattern": "Partition pointers",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "arrays",
    "courseLessonSlug": "move-zeroes"
  },
  {
    "id": 295,
    "slug": "find-median-from-data-stream",
    "title": "Find Median from Data Stream",
    "difficulty": "Hard",
    "topics": [
      "Heaps",
      "Design",
      "Two Pointers"
    ],
    "pattern": "Dual balanced heaps (Max-heap lower, Min-heap upper)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "heaps",
    "courseLessonSlug": "find-median-from-data-stream"
  },
  {
    "id": 297,
    "slug": "serialize-and-deserialize-binary-tree",
    "title": "Serialize and Deserialize Binary Tree",
    "difficulty": "Hard",
    "topics": [
      "Binary Trees",
      "Design",
      "DFS",
      "Strings"
    ],
    "pattern": "Pre-order DFS traversal with null delimiters",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "serialize-and-deserialize-binary-tree"
  },
  {
    "id": 300,
    "slug": "longest-increasing-subsequence",
    "title": "Longest Increasing Subsequence",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Binary Search",
      "Arrays"
    ],
    "pattern": "1D DP O(n^2) or Patience sorting binary search O(n log n)",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "longest-increasing-subsequence"
  },
  {
    "id": 303,
    "slug": "range-sum-query-immutable",
    "title": "Range Sum Query \u2014 Immutable",
    "difficulty": "Easy",
    "topics": [
      "Prefix Sum",
      "Arrays",
      "Design"
    ],
    "pattern": "1D prefix array prefix[right+1] - prefix[left]",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "prefix-sum",
    "courseLessonSlug": "range-sum-query-immutable"
  },
  {
    "id": 304,
    "slug": "range-sum-query-2d-immutable",
    "title": "Range Sum Query 2D \u2014 Immutable",
    "difficulty": "Medium",
    "topics": [
      "Prefix Sum",
      "Matrix",
      "Design"
    ],
    "pattern": "2D inclusion-exclusion principle",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "prefix-sum",
    "courseLessonSlug": "range-sum-2d-immutable"
  },
  {
    "id": 307,
    "slug": "range-sum-query-mutable",
    "title": "Range Sum Query \u2014 Mutable",
    "difficulty": "Medium",
    "topics": [
      "Segment Tree",
      "Binary Indexed Tree",
      "Design"
    ],
    "pattern": "Segment Tree / Fenwick Tree point update and range query",
    "lists": [
      "all"
    ]
  },
  {
    "id": 315,
    "slug": "count-of-smaller-numbers-after-self",
    "title": "Count of Smaller Numbers After Self",
    "difficulty": "Hard",
    "topics": [
      "Binary Indexed Tree",
      "Segment Tree",
      "Divide and Conquer"
    ],
    "pattern": "Fenwick Tree frequency sweep or Merge Sort inversion count",
    "lists": [
      "all"
    ]
  },
  {
    "id": 322,
    "slug": "coin-change",
    "title": "Coin Change",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Unbounded knapsack minimization",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "coin-change"
  },
  {
    "id": 337,
    "slug": "house-robber-iii",
    "title": "House Robber III",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Tree DP returning (rob_root, skip_root) pair",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "house-robber-iii"
  },
  {
    "id": 338,
    "slug": "counting-bits",
    "title": "Counting Bits",
    "difficulty": "Easy",
    "topics": [
      "Bit Manipulation",
      "Dynamic Programming"
    ],
    "pattern": "DP recurrence dp[i] = dp[i >> 1] + (i & 1)",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 347,
    "slug": "top-k-frequent-elements",
    "title": "Top K Frequent Elements",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Hash Tables",
      "Heaps"
    ],
    "pattern": "Count + size-k heap / Bucket sort",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "heaps",
    "courseLessonSlug": "top-k-frequent-elements"
  },
  {
    "id": 355,
    "slug": "design-twitter",
    "title": "Design Twitter",
    "difficulty": "Medium",
    "topics": [
      "Heaps",
      "Hash Tables",
      "Design"
    ],
    "pattern": "Merge-k sorted tweet streams via heap",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 371,
    "slug": "sum-of-two-integers",
    "title": "Sum of Two Integers",
    "difficulty": "Medium",
    "topics": [
      "Bit Manipulation",
      "Math"
    ],
    "pattern": "Half adder via XOR sum and AND carry shifts",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 387,
    "slug": "first-unique-character-in-a-string",
    "title": "First Unique Character in a String",
    "difficulty": "Easy",
    "topics": [
      "Strings",
      "Hash Tables",
      "Queues"
    ],
    "pattern": "Count, then scan",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "hash-tables",
    "courseLessonSlug": "first-unique-character"
  },
  {
    "id": 416,
    "slug": "partition-equal-subset-sum",
    "title": "Partition Equal Subset Sum",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "0/1 Knapsack boolean subset sum",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "partition-equal-subset-sum"
  },
  {
    "id": 417,
    "slug": "pacific-atlantic-water-flow",
    "title": "Pacific Atlantic Water Flow",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Matrix",
      "DFS"
    ],
    "pattern": "Dual ocean reverse DFS reachability intersection",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 424,
    "slug": "longest-repeating-character-replacement",
    "title": "Longest Repeating Character Replacement",
    "difficulty": "Medium",
    "topics": [
      "Sliding Window",
      "Strings",
      "Hash Tables"
    ],
    "pattern": "Window length minus max-freq count constraint",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 435,
    "slug": "non-overlapping-intervals",
    "title": "Non-overlapping Intervals",
    "difficulty": "Medium",
    "topics": [
      "Intervals",
      "Greedy",
      "Sorting"
    ],
    "pattern": "Earliest-end greedy interval scheduling",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "intervals",
    "courseLessonSlug": "non-overlapping-intervals"
  },
  {
    "id": 450,
    "slug": "delete-node-in-a-bst",
    "title": "Delete Node in a BST",
    "difficulty": "Medium",
    "topics": [
      "BST",
      "Binary Trees"
    ],
    "pattern": "Three-case node deletion (successor swap)",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "bst",
    "courseLessonSlug": "delete-node-in-a-bst"
  },
  {
    "id": 452,
    "slug": "minimum-number-of-arrows-to-burst-balloons",
    "title": "Minimum Arrows to Burst Balloons",
    "difficulty": "Medium",
    "topics": [
      "Intervals",
      "Greedy",
      "Sorting"
    ],
    "pattern": "Sort by end + point sweep",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "intervals",
    "courseLessonSlug": "minimum-arrows-to-burst-balloons"
  },
  {
    "id": 518,
    "slug": "coin-change-ii",
    "title": "Coin Change II",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "Unbounded knapsack combination count",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 525,
    "slug": "contiguous-array",
    "title": "Contiguous Array",
    "difficulty": "Medium",
    "topics": [
      "Prefix Sum",
      "Hash Tables",
      "Arrays"
    ],
    "pattern": "Zero-to-negative-one transformed prefix first-seen map",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "prefix-sum",
    "courseLessonSlug": "contiguous-array"
  },
  {
    "id": 543,
    "slug": "diameter-of-binary-tree",
    "title": "Diameter of Binary Tree",
    "difficulty": "Easy",
    "topics": [
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Post-order height + global maximum diameter",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "binary-trees",
    "courseLessonSlug": "diameter-of-binary-tree"
  },
  {
    "id": 547,
    "slug": "number-of-provinces",
    "title": "Number of Provinces",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Union Find",
      "DFS"
    ],
    "pattern": "Union-Find connected component count",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "number-of-provinces"
  },
  {
    "id": 560,
    "slug": "subarray-sum-equals-k",
    "title": "Subarray Sum Equals K",
    "difficulty": "Medium",
    "topics": [
      "Prefix Sum",
      "Hash Tables",
      "Arrays"
    ],
    "pattern": "Prefix sum with frequency hash map count lookup",
    "lists": [
      "all",
      "course",
      "top150"
    ],
    "courseModuleSlug": "prefix-sum",
    "courseLessonSlug": "subarray-sum-equals-k"
  },
  {
    "id": 567,
    "slug": "permutation-in-string",
    "title": "Permutation in String",
    "difficulty": "Medium",
    "topics": [
      "Sliding Window",
      "Strings",
      "Hash Tables"
    ],
    "pattern": "Count-match sliding window",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "sliding-window",
    "courseLessonSlug": "permutation-in-string"
  },
  {
    "id": 572,
    "slug": "subtree-of-another-tree",
    "title": "Subtree of Another Tree",
    "difficulty": "Easy",
    "topics": [
      "Binary Trees",
      "DFS"
    ],
    "pattern": "Tree traversal calling Same Tree check",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 621,
    "slug": "task-scheduler",
    "title": "Task Scheduler",
    "difficulty": "Medium",
    "topics": [
      "Heaps",
      "Greedy",
      "Hash Tables"
    ],
    "pattern": "Max-heap most-frequent task greedy selection",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "heaps",
    "courseLessonSlug": "task-scheduler"
  },
  {
    "id": 643,
    "slug": "maximum-average-subarray-i",
    "title": "Maximum Average Subarray I",
    "difficulty": "Easy",
    "topics": [
      "Sliding Window",
      "Arrays"
    ],
    "pattern": "Fixed-size rolling window",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "sliding-window",
    "courseLessonSlug": "maximum-average-subarray"
  },
  {
    "id": 680,
    "slug": "valid-palindrome-ii",
    "title": "Valid Palindrome II",
    "difficulty": "Easy",
    "topics": [
      "Two Pointers",
      "Strings"
    ],
    "pattern": "Greedy one-character deletion branch",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 684,
    "slug": "redundant-connection",
    "title": "Redundant Connection",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Union Find"
    ],
    "pattern": "Disjoint Set Union (DSU) cycle detection",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "redundant-connection"
  },
  {
    "id": 695,
    "slug": "max-area-of-island",
    "title": "Max Area of Island",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Matrix",
      "DFS"
    ],
    "pattern": "Grid DFS component area summing",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 701,
    "slug": "insert-into-a-binary-search-tree",
    "title": "Insert into a Binary Search Tree",
    "difficulty": "Medium",
    "topics": [
      "BST",
      "Binary Trees"
    ],
    "pattern": "Leaf placement walk",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "bst",
    "courseLessonSlug": "insert-into-a-binary-search-tree"
  },
  {
    "id": 703,
    "slug": "kth-largest-element-in-a-stream",
    "title": "Kth Largest Element in a Stream",
    "difficulty": "Easy",
    "topics": [
      "Heaps",
      "Design"
    ],
    "pattern": "Size-k min-heap maintaining kth largest at top",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "heaps",
    "courseLessonSlug": "kth-largest-element-in-a-stream"
  },
  {
    "id": 704,
    "slug": "binary-search",
    "title": "Binary Search",
    "difficulty": "Easy",
    "topics": [
      "Binary Search",
      "Arrays"
    ],
    "pattern": "Standard interval halving",
    "lists": [
      "all",
      "neetcode150",
      "top150"
    ]
  },
  {
    "id": 720,
    "slug": "longest-word-in-dictionary",
    "title": "Longest Word in Dictionary",
    "difficulty": "Medium",
    "topics": [
      "Tries",
      "Hash Tables",
      "Strings"
    ],
    "pattern": "Build and verify prefixes in Trie",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "tries",
    "courseLessonSlug": "longest-word-in-dictionary"
  },
  {
    "id": 739,
    "slug": "daily-temperatures",
    "title": "Daily Temperatures",
    "difficulty": "Medium",
    "topics": [
      "Stacks",
      "Monotonic Stack",
      "Arrays"
    ],
    "pattern": "Monotonic decreasing stack of indices",
    "lists": [
      "all",
      "course",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "stacks",
    "courseLessonSlug": "daily-temperatures"
  },
  {
    "id": 743,
    "slug": "network-delay-time",
    "title": "Network Delay Time",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Shortest Path",
      "Heaps"
    ],
    "pattern": "Dijkstra's shortest path algorithm with min-heap",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "network-delay-time"
  },
  {
    "id": 746,
    "slug": "min-cost-climbing-stairs",
    "title": "Min Cost Climbing Stairs",
    "difficulty": "Easy",
    "topics": [
      "Dynamic Programming",
      "Arrays"
    ],
    "pattern": "1D DP min predecessor recurrence",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 759,
    "slug": "employee-free-time",
    "title": "Employee Free Time",
    "difficulty": "Hard",
    "topics": [
      "Intervals",
      "Sorting",
      "Heaps"
    ],
    "pattern": "Merged interval timeline inversion",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "intervals",
    "courseLessonSlug": "employee-free-time"
  },
  {
    "id": 763,
    "slug": "partition-labels",
    "title": "Partition Labels",
    "difficulty": "Medium",
    "topics": [
      "Greedy",
      "Strings",
      "Two Pointers"
    ],
    "pattern": "Last-occurrence window extension",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "greedy",
    "courseLessonSlug": "partition-labels"
  },
  {
    "id": 787,
    "slug": "cheapest-flights-within-k-stops",
    "title": "Cheapest Flights Within K Stops",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Shortest Path",
      "Dynamic Programming"
    ],
    "pattern": "Bellman-Ford algorithm with k relaxation rounds",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 875,
    "slug": "koko-eating-bananas",
    "title": "Koko Eating Bananas",
    "difficulty": "Medium",
    "topics": [
      "Binary Search",
      "Arrays"
    ],
    "pattern": "Binary search on monotonic answer space",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "binary-search",
    "courseLessonSlug": "koko-eating-bananas"
  },
  {
    "id": 876,
    "slug": "middle-of-the-linked-list",
    "title": "Middle of the Linked List",
    "difficulty": "Easy",
    "topics": [
      "Linked Lists",
      "Two Pointers"
    ],
    "pattern": "Fast & slow pointer midpoint arrival",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "linked-lists",
    "courseLessonSlug": "middle-of-list"
  },
  {
    "id": 912,
    "slug": "sort-an-array",
    "title": "Sort an Array",
    "difficulty": "Medium",
    "topics": [
      "Sorting",
      "Divide and Conquer",
      "Arrays"
    ],
    "pattern": "Merge Sort / Quicksort / Heap Sort",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "sorting",
    "courseLessonSlug": "sort-an-array"
  },
  {
    "id": 933,
    "slug": "number-of-recent-calls",
    "title": "Number of Recent Calls",
    "difficulty": "Easy",
    "topics": [
      "Queues",
      "Design"
    ],
    "pattern": "Time-window FIFO queue",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "queues",
    "courseLessonSlug": "recent-calls"
  },
  {
    "id": 973,
    "slug": "k-closest-points-to-origin",
    "title": "K Closest Points to Origin",
    "difficulty": "Medium",
    "topics": [
      "Heaps",
      "Geometry",
      "Sorting"
    ],
    "pattern": "Max-heap of size k / Quickselect",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "heaps",
    "courseLessonSlug": "k-closest-points-to-origin"
  },
  {
    "id": 981,
    "slug": "time-based-key-value-store",
    "title": "Time Based Key-Value Store",
    "difficulty": "Medium",
    "topics": [
      "Binary Search",
      "Hash Tables",
      "Design"
    ],
    "pattern": "Timestamp upper-bound binary search",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 994,
    "slug": "rotting-oranges",
    "title": "Rotting Oranges",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Matrix",
      "BFS"
    ],
    "pattern": "Multi-source BFS time step propagation",
    "lists": [
      "all",
      "blind75",
      "neetcode150"
    ]
  },
  {
    "id": 1046,
    "slug": "last-stone-weight",
    "title": "Last Stone Weight",
    "difficulty": "Easy",
    "topics": [
      "Heaps",
      "Arrays"
    ],
    "pattern": "Max-heap simulation",
    "lists": [
      "all",
      "neetcode150"
    ]
  },
  {
    "id": 1143,
    "slug": "longest-common-subsequence",
    "title": "Longest Common Subsequence",
    "difficulty": "Medium",
    "topics": [
      "Dynamic Programming",
      "Strings"
    ],
    "pattern": "2D character match recurrence table",
    "lists": [
      "all",
      "course",
      "blind75",
      "neetcode150",
      "top150"
    ],
    "courseModuleSlug": "dynamic-programming",
    "courseLessonSlug": "longest-common-subsequence"
  },
  {
    "id": 1429,
    "slug": "first-unique-number",
    "title": "First Unique in a Stream",
    "difficulty": "Medium",
    "topics": [
      "Queues",
      "Hash Tables",
      "Design"
    ],
    "pattern": "FIFO queue + frequency map",
    "lists": [
      "all",
      "course"
    ],
    "courseModuleSlug": "queues",
    "courseLessonSlug": "stream-first-unique"
  },
  {
    "id": 1584,
    "slug": "min-cost-to-connect-all-points",
    "title": "Min Cost to Connect All Points",
    "difficulty": "Medium",
    "topics": [
      "Graphs",
      "Minimum Spanning Tree",
      "Union Find"
    ],
    "pattern": "Kruskal with DSU / Prim with Priority Queue",
    "lists": [
      "all",
      "course",
      "neetcode150"
    ],
    "courseModuleSlug": "graphs",
    "courseLessonSlug": "min-cost-to-connect-all-points"
  }
] as const;

export const CATALOG_TOPICS: readonly string[] = [
  "Arrays",
  "BFS",
  "BST",
  "Binary Indexed Tree",
  "Binary Search",
  "Binary Trees",
  "Bit Manipulation",
  "Combinatorics",
  "DFS",
  "Design",
  "Divide and Conquer",
  "Dynamic Programming",
  "Geometry",
  "Graphs",
  "Greedy",
  "Hash Tables",
  "Heaps",
  "Intervals",
  "Linked Lists",
  "Math",
  "Matrix",
  "Minimum Spanning Tree",
  "Monotonic Deque",
  "Monotonic Stack",
  "Prefix Sum",
  "Queues",
  "Recursion",
  "Recursion & Backtracking",
  "Segment Tree",
  "Shortest Path",
  "Sliding Window",
  "Sorting",
  "Stacks",
  "Strings",
  "Topological Sort",
  "Tries",
  "Two Pointers",
  "Union Find"
] as const;

