/**
 * Interview-standard difficulties for hub display (aligned with common
 * LeetCode ratings for the same problem titles). Source of truth for the
 * Practice list — practice.md fences may overlay the same values.
 */
export type Difficulty = "Easy" | "Medium" | "Hard";

export const PROBLEM_DIFFICULTY: Record<string, Difficulty> = {
  // Arrays
  "remove-duplicates-sorted": "Easy",
  "move-zeroes": "Easy",
  "rotate-array": "Medium",
  "best-time-to-buy-sell-stock": "Easy",
  "product-except-self": "Medium",
  // Strings
  "valid-palindrome": "Easy",
  "valid-anagram": "Easy",
  "longest-common-prefix": "Easy",
  "reverse-words": "Medium",
  "find-the-index": "Easy",
  // Hash tables
  "two-sum": "Easy",
  "contains-duplicate-ii": "Easy",
  "first-unique-character": "Easy",
  "group-anagrams": "Medium",
  "longest-consecutive-sequence": "Medium",
  // Linked lists
  "reverse-linked-list": "Easy",
  "middle-of-list": "Easy",
  "linked-list-cycle": "Easy",
  "merge-two-sorted": "Easy",
  "remove-nth-from-end": "Medium",
  // Stacks
  "valid-parentheses": "Easy",
  "evaluate-rpn": "Medium",
  "min-stack": "Medium",
  "daily-temperatures": "Medium",
  "largest-rectangle": "Hard",
  // Queues
  "recent-calls": "Easy",
  "queue-using-stacks": "Easy",
  "stream-first-unique": "Medium",
  "sliding-window-maximum": "Hard",
  // Two pointers
  "two-sum-ii": "Medium",
  "sort-colors": "Medium",
  "container-with-most-water": "Medium",
  "three-sum": "Medium",
  "trapping-rain-water": "Hard",
  // Sliding window
  "maximum-average-subarray": "Easy",
  "minimum-size-subarray-sum": "Medium",
  "longest-substring-without-repeating": "Medium",
  "permutation-in-string": "Medium",
  "minimum-window-substring": "Hard",
  // Prefix sum
  "range-sum-query-immutable": "Easy",
  "subarray-sum-equals-k": "Medium",
  "contiguous-array": "Medium",
  "range-sum-2d-immutable": "Medium",
  "kadanes-algorithm": "Medium",
  // Binary search
  "search-insert-position": "Easy",
  "find-first-and-last": "Medium",
  "search-rotated-sorted-array": "Medium",
  "koko-eating-bananas": "Medium",
  "find-minimum-in-rotated-sorted-array": "Medium",
  // Sorting
  "sort-an-array": "Medium",
  "merge-intervals": "Medium",
  "largest-number": "Medium",
  "meeting-rooms-ii": "Medium",
  "kth-largest-element": "Medium",
  // Matrix
  "rotate-image": "Medium",
  "spiral-matrix": "Medium",
  "set-matrix-zeroes": "Medium",
  "search-a-2d-matrix": "Medium",
  "number-of-islands": "Medium",
  "word-search": "Medium",
  // Recursion / backtracking
  subsets: "Medium",
  permutations: "Medium",
  "combination-sum": "Medium",
  "generate-parentheses": "Medium",
  "palindrome-partitioning": "Medium",
  "n-queens": "Hard",
  // Binary trees
  "maximum-depth-of-binary-tree": "Easy",
  "diameter-of-binary-tree": "Easy",
  "binary-tree-level-order-traversal": "Medium",
  "construct-binary-tree-from-preorder-and-inorder": "Medium",
  "lowest-common-ancestor-of-a-binary-tree": "Medium",
  "binary-tree-right-side-view": "Medium",
  "serialize-and-deserialize-binary-tree": "Hard",
  // BST
  "validate-binary-search-tree": "Medium",
  "kth-smallest-element-in-a-bst": "Medium",
  "insert-into-a-binary-search-tree": "Medium",
  "delete-node-in-a-bst": "Medium",
  "convert-sorted-array-to-bst": "Easy",
  "lowest-common-ancestor-of-a-bst": "Medium",
  // Heaps
  "kth-largest-element-in-a-stream": "Easy",
  "top-k-frequent-elements": "Medium",
  "merge-k-sorted-lists": "Hard",
  "find-median-from-data-stream": "Hard",
  "k-closest-points-to-origin": "Medium",
  "task-scheduler": "Medium",
  // Tries
  "implement-trie": "Medium",
  "design-add-and-search-words": "Medium",
  "word-search-ii": "Hard",
  "longest-word-in-dictionary": "Medium",
  // Intervals
  "insert-interval": "Medium",
  "non-overlapping-intervals": "Medium",
  "minimum-arrows-to-burst-balloons": "Medium",
  "meeting-rooms": "Easy",
  "employee-free-time": "Hard",
  // Greedy
  "jump-game": "Medium",
  "jump-game-ii": "Medium",
  "gas-station": "Medium",
  "partition-labels": "Medium",
  candy: "Hard",
  // Graphs
  "clone-graph": "Medium",
  "course-schedule": "Medium",
  "course-schedule-ii": "Medium",
  "network-delay-time": "Medium",
  "number-of-provinces": "Medium",
  "redundant-connection": "Medium",
  "min-cost-to-connect-all-points": "Medium",
  // Dynamic programming
  "climbing-stairs": "Easy",
  "house-robber": "Medium",
  "coin-change": "Medium",
  "longest-increasing-subsequence": "Medium",
  "unique-paths": "Medium",
  "longest-common-subsequence": "Medium",
  "edit-distance": "Hard",
  "partition-equal-subset-sum": "Medium",
  "word-break": "Medium",
  "house-robber-iii": "Medium",
};

export function getProblemDifficulty(slug: string): Difficulty | undefined {
  return PROBLEM_DIFFICULTY[slug];
}

/** Token classes for Easy / Medium / Hard badges (good / warn / bad). */
export function difficultyBadgeClass(difficulty: Difficulty): string {
  switch (difficulty) {
    case "Easy":
      return "border-good/40 bg-good/10 text-good";
    case "Medium":
      return "border-warn/40 bg-warn/10 text-warn";
    case "Hard":
      return "border-bad/40 bg-bad/10 text-bad";
  }
}

/**
 * Filter chip classes — inactive keeps a subtle difficulty tint;
 * selected strengthens fill / border / text. "All" uses accent.
 */
export function difficultyFilterChipClass(
  level: Difficulty | "All",
  active: boolean,
): string {
  if (level === "All") {
    return active
      ? "border-accent/50 bg-accent/15 text-accent"
      : "border-border bg-elevated text-muted hover:border-accent/35 hover:text-accent";
  }
  switch (level) {
    case "Easy":
      return active
        ? "border-good/55 bg-good/20 text-good"
        : "border-good/30 bg-good/[0.07] text-good/85 hover:border-good/45 hover:bg-good/12";
    case "Medium":
      return active
        ? "border-warn/55 bg-warn/20 text-warn"
        : "border-warn/30 bg-warn/[0.07] text-warn/85 hover:border-warn/45 hover:bg-warn/12";
    case "Hard":
      return active
        ? "border-bad/55 bg-bad/20 text-bad"
        : "border-bad/30 bg-bad/[0.07] text-bad/85 hover:border-bad/45 hover:bg-bad/12";
  }
}
