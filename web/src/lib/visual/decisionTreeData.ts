/**
 * Master yes/no decision tree for interview pattern routing.
 * Leaves point at PatternLab routes under /patterns/{family}/{slug}.
 */

export type DecisionLeaf = {
  kind: "leaf";
  id: string;
  title: string;
  summary: string;
  patternHref: string;
  patternLabel: string;
  familyId: string;
};

export type DecisionBranch = {
  kind: "branch";
  id: string;
  question: string;
  hint?: string;
  /** Dual-home: same surface clue can also lead elsewhere */
  trapNote?: string;
  yes: DecisionNode;
  no: DecisionNode;
};

export type DecisionNode = DecisionBranch | DecisionLeaf;

export function isLeaf(node: DecisionNode): node is DecisionLeaf {
  return node.kind === "leaf";
}

export function isBranch(node: DecisionNode): node is DecisionBranch {
  return node.kind === "branch";
}

/** Flatten branch ids for the mini-map layout */
export function collectNodes(root: DecisionNode): DecisionNode[] {
  const out: DecisionNode[] = [];
  function walk(n: DecisionNode) {
    out.push(n);
    if (n.kind === "branch") {
      walk(n.yes);
      walk(n.no);
    }
  }
  walk(root);
  return out;
}

export const MASTER_DECISION_TREE: DecisionBranch = {
  kind: "branch",
  id: "root",
  question: "What is the problem really asking you to find or transform?",
  hint: "Read the ask twice. Ignore the story wrapping — keep the noun.",
  yes: {
    kind: "branch",
    id: "contiguous-ask",
    question:
      "Are you looking at a contiguous slice — a subarray or substring that must stay in one unbroken block?",
    hint: "Words like “longest substring”, “maximum subarray length”, “window of size k”.",
    trapNote:
      "Trap: “subarray sum equals k” sounds contiguous (and it is), but the unlock is often Prefix Sum — not Sliding Window. Dual-home clue.",
    yes: {
      kind: "branch",
      id: "subarray-sum-k",
      question:
        "Is the ask specifically “subarray / continuous sum equals a target k” (or count of such subarrays)?",
      hint: "If you are counting or detecting exact sum = k on a line of numbers, pause before opening a window.",
      yes: {
        kind: "leaf",
        id: "leaf-prefix-sum",
        title: "Prefix Sum",
        summary:
          "Running totals let you turn “sum(i…j) = k” into a hash lookup: have I seen prefix − k before?",
        patternHref: "/patterns/linear-traversal/prefix-sum",
        patternLabel: "Prefix Sum lab",
        familyId: "linear-traversal",
      },
      no: {
        kind: "leaf",
        id: "leaf-sliding-window",
        title: "Sliding Window",
        summary:
          "Grow a right edge, shrink a left edge — one pass over a contiguous block with a living invariant.",
        patternHref: "/patterns/pointer-movement/sliding-window",
        patternLabel: "Sliding Window lab",
        familyId: "pointer-movement",
      },
    },
    no: {
      kind: "branch",
      id: "top-k",
      question:
        "Do you need the top K items, Kth largest/smallest, or a streaming “best few” under a size limit?",
      hint: "“Top K frequent”, “K closest”, “Kth largest in a stream”.",
      yes: {
        kind: "leaf",
        id: "leaf-heap",
        title: "Heap / Priority Queue",
        summary:
          "Keep a bounded priority structure — dump the losers, keep the K survivors.",
        patternHref: "/patterns/priority-structures/heap-priority-queue",
        patternLabel: "Heap lab",
        familyId: "priority-structures",
      },
      no: {
        kind: "branch",
        id: "connected",
        question:
          "Is the core about connectivity — islands, components, same friend circle, or “are these in the same group”?",
        hint: "Grid “number of islands”, union of accounts, Friend Circles.",
        yes: {
          kind: "branch",
          id: "uf-vs-dfs",
          question:
            "Is the graph mostly static merges (“union these, query same set”) rather than exploring neighbors cell-by-cell?",
          hint: "Lots of unite/find → Union Find. Flood fill / walk from a cell → DFS or BFS.",
          yes: {
            kind: "leaf",
            id: "leaf-union-find",
            title: "Union Find",
            summary:
              "Parent pointers + path compression: merge groups and ask “same component?” in nearly O(1).",
            patternHref: "/patterns/relationships/union-find",
            patternLabel: "Union Find lab",
            familyId: "relationships",
          },
          no: {
            kind: "leaf",
            id: "leaf-dfs",
            title: "DFS",
            summary:
              "Dive deep from a start node, mark visited — perfect for flooding a component you can walk.",
            patternHref: "/patterns/recursive-exploration/dfs",
            patternLabel: "DFS lab",
            familyId: "recursive-exploration",
          },
        },
        no: {
          kind: "branch",
          id: "weighted-path",
          question:
            "Do you need a shortest / cheapest path on a graph where edges have different weights (not just hop count)?",
          hint: "Weighted roads, flight costs, network latency — not unweighted BFS layers.",
          yes: {
            kind: "leaf",
            id: "leaf-dijkstra",
            title: "Dijkstra",
            summary:
              "Grow the known-cheapest frontier with a priority queue — never re-open a settled node.",
            patternHref: "/patterns/relationships/dijkstra",
            patternLabel: "Dijkstra lab",
            familyId: "relationships",
          },
          no: {
            kind: "branch",
            id: "sorted-search",
            question:
              "Is the input (or a search space) sorted / monotonic so you can discard half each step?",
            hint: "Sorted array, “minimum capacity that works”, answer that rises then falls.",
            yes: {
              kind: "leaf",
              id: "leaf-binary-search",
              title: "Binary Search",
              summary:
                "Ask a yes/no that shrinks the range — mid becomes the new low or high.",
              patternHref: "/patterns/ordering-search/binary-search",
              patternLabel: "Binary Search lab",
              familyId: "ordering-search",
            },
            no: {
              kind: "branch",
              id: "pair-ends",
              question:
                "Can two indices walk from opposite ends (or meet in the middle) on a sorted line?",
              hint: "Two sum on sorted array, container with most water, reverse / palindrome checks.",
              yes: {
                kind: "leaf",
                id: "leaf-two-pointers",
                title: "Two Pointers",
                summary:
                  "Left and right cooperate — each move is forced by a comparison, no nested scan.",
                patternHref: "/patterns/pointer-movement/two-pointers",
                patternLabel: "Two Pointers lab",
                familyId: "pointer-movement",
              },
              no: {
                kind: "leaf",
                id: "leaf-hash-maps",
                title: "Hash Maps",
                summary:
                  "Trade space for a second look: store what you have seen, answer the complement in O(1).",
                patternHref: "/patterns/linear-traversal/hash-maps",
                patternLabel: "Hash Maps lab",
                familyId: "linear-traversal",
              },
            },
          },
        },
      },
    },
  },
  no: {
    kind: "branch",
    id: "transform-build",
    question:
      "Are you building every valid arrangement / path with choices you can undo (permute, combination, sudoku)?",
    hint: "“All subsets”, “all paths”, “place queens”, constraint search.",
    yes: {
      kind: "leaf",
      id: "leaf-backtracking",
      title: "Backtracking",
      summary:
        "Choose → explore → undo. The call stack is your breadcrumbs.",
      patternHref: "/patterns/recursive-exploration/backtracking",
      patternLabel: "Backtracking lab",
      familyId: "recursive-exploration",
    },
    no: {
      kind: "branch",
      id: "overlap-opt",
      question:
        "Does the answer for a big input reuse answers for smaller overlapping subproblems (optimal substructure)?",
      hint: "Fib-flavored, knapsack, edit distance, house robber — same sub-ask many times.",
      yes: {
        kind: "leaf",
        id: "leaf-dp",
        title: "Dynamic Programming",
        summary:
          "Name the state, write the transition, fill bottom-up or memoize — never recompute a known cell.",
        patternHref: "/patterns/state-transition/dynamic-programming",
        patternLabel: "DP lab",
        familyId: "state-transition",
      },
      no: {
        kind: "leaf",
        id: "leaf-bfs",
        title: "BFS",
        summary:
          "When hops are equal cost, a queue layers the frontier — first time you reach the goal is shortest in steps.",
        patternHref: "/patterns/relationships/bfs",
        patternLabel: "BFS lab",
        familyId: "relationships",
      },
    },
  },
};
