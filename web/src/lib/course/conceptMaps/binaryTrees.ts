import type { MindMapNode } from "./types";

/**
 * Concept map for the Binary Trees module. Hand-authored from the
 * module's 4-lesson structure (course/binary-trees/*.md). Curriculum-
 * designer review confirmed 4 lessons and the current ordering are right,
 * and that the two problem lessons without their own "insight" section
 * (Level Order Traversal, Right Side View) are fully covered by the BFS
 * concept lesson's size-snapshot technique. It caught one real bug: the
 * Terminology lesson said "the next lesson has two different recursion
 * shapes," but that describes Lesson 4 (Top-Down vs. Bottom-Up), not
 * Lesson 2 (DFS Traversals) — fixed by naming the lesson instead of
 * saying "next." Rejected recommending a new "Invert a Binary Tree"
 * problem lesson (out of scope for a content-quality pass — a new
 * problem lesson needs its own full attempt/insight/solution content and
 * verified sandbox, not a prose edit) and two "redundant across lessons"
 * tightening claims on the O(h)/O(n) complexity restatements (each
 * appearance builds on the last in a new context — general property,
 * then traversal-specific, then BFS-comparative — the course's
 * established deliberate-reinforcement pattern, not duplication).
 */
export const binaryTreesConceptMap: MindMapNode = {
  id: "binary-trees",
  label: "Binary Trees",
  children: [
    {
      id: "tree-terminology",
      label: "Tree Terminology & Representation",
      children: [
        { id: "node-is-the-tree", label: "A tree IS its root node — no wrapper class; every other node is reachable by following left/right pointers down" },
        { id: "recursive-definition", label: "A binary tree is empty, or a node whose two children are themselves binary trees — the definition mentions trees, so algorithms over it mirror that shape" },
        { id: "depth-vs-height", label: "Depth counts down from the root to you; height counts down from you to the deepest leaf — opposite ends, driving two different recursion shapes later" },
        { id: "balanced-vs-degenerate-height", label: "Height derives from counting: n = 2⁰+2¹+…+2ʰ = 2ʰ⁺¹−1 for a balanced tree, giving h ≈ log₂n — a degenerate tree gets no such doubling, so h = n−1" },
      ],
    },
    {
      id: "dfs-traversals",
      label: "DFS Traversals",
      children: [
        { id: "pre-in-post-order", label: "Preorder/inorder/postorder differ only in WHEN the node itself is visited relative to its two subtrees" },
        { id: "order-picks-the-tool", label: "Postorder fits answers that depend on children (bottom-up); preorder fits context flowing from above (top-down); inorder has one headline use" },
        { id: "inorder-bst-sorted", label: "Inorder on a BST emits everything smaller, then the node, then everything larger — by induction, that's ascending order, O(n), no comparisons" },
        { id: "explicit-stack-traversal", label: "An iterative traversal makes the call stack's bookkeeping explicit — same O(h) space, but heap-allocated, so a degenerate tree can't overflow it" },
      ],
    },
    {
      id: "bfs-level-order",
      label: "BFS & Level-Order Traversal",
      children: [
        { id: "queue-not-stack", label: "Swapping the stack for a queue is the entire difference between DFS (go deep) and BFS (go wide) — FIFO sorts discoveries by depth automatically" },
        { id: "size-snapshot", label: "Snapshotting the queue's length before the inner loop freezes 'this level only,' since the loop enqueues next-level nodes into the same queue as it runs" },
        { id: "dfs-vs-bfs-space", label: "DFS holds a root-to-node path (O(h)); BFS holds a whole level (O(w)) — balanced trees favor DFS, degenerate chains favor BFS, opposite trade-offs" },
      ],
    },
    {
      id: "top-down-bottom-up",
      label: "Top-Down vs. Bottom-Up Tree Recursion",
      children: [
        { id: "two-shapes", label: "Top-down: context flows down as a parameter, answer accumulates at the leaves. Bottom-up: children return answers, the parent combines them going back up" },
        { id: "code-fingerprint", label: "Bottom-up has a meaningful return value combined after recursion; top-down carries an extra parameter down and returns nothing, recording into shared state" },
        { id: "which-shape-question", label: "Does the answer depend on ancestors (top-down) or descendants (bottom-up)? Some problems need both — a bottom-up return plus a global accumulator" },
      ],
    },
  ],
};
