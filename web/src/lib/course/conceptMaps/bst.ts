import type { MindMapNode } from "./types";

/**
 * Concept map for the BST & Ordered Structures module. Hand-authored
 * from the module's 2-lesson structure (course/bst/*.md). Curriculum-
 * designer review confirmed 2 lessons is right and all 6 problem lessons
 * self-teach their technique. It caught two real issues, both fixed:
 * Lowest Common Ancestor of a BST — a pure read-only search-descent
 * problem — was sequenced last, after the much harder Delete and
 * Convert Sorted Array problems, disrupting the difficulty curve; moved
 * to right after Kth Smallest, before Insert. And Lesson 2 said "two
 * problems ahead lean on this lesson" but named only one (Convert Sorted
 * Array to BST); reworded to correctly describe one problem plus the
 * lesson's broader role in making every O(h) claim from Lesson 1 honest.
 * Rejected recommending a new rotation-implementation problem lesson
 * (out of scope for a content pass, and the module's own text already
 * frames AVL/red-black rotation as conceptual knowledge — "you will
 * almost never implement one of these by hand" — not an interview
 * coding skill).
 */
export const bstConceptMap: MindMapNode = {
  id: "bst",
  label: "BST & Ordered Structures",
  children: [
    {
      id: "bst-invariant-operations",
      label: "The BST Invariant & Core Operations",
      children: [
        { id: "subtree-wide-invariant", label: "Every value in the left subtree < node < every value in the right subtree — over the ENTIRE subtree, not just immediate children" },
        { id: "search-decision-procedure", label: "Each comparison discards a whole subtree without looking at it — binary search walking a tree instead of an array, O(h)" },
        { id: "insert-falls-off", label: "Insert searches for the value; the empty slot it falls off at is exactly the one place it can go while keeping the invariant true" },
        { id: "delete-inorder-successor", label: "Deleting a two-children node: copy in the inorder successor's value, then delete the successor (which is always case 1 or 2, never case 3 again)" },
        { id: "inorder-sorted-proof", label: "Inorder traversal of a BST is sorted by structural induction: sorted-block-below, node, sorted-block-above stays sorted" },
      ],
    },
    {
      id: "balance-why-it-matters",
      label: "Balance & Why It Matters",
      children: [
        { id: "degenerate-collapse", label: "Sorted input makes every insert turn the same direction — the BST silently collapses into a linked list, h = n" },
        { id: "log-n-floor-derived", label: "A height-h tree holds at most 2⁰+2¹+...+2ʰ = 2ʰ⁺¹−1 nodes — inverting that gives h ≥ log₂(n+1)−1, the unavoidable floor" },
        { id: "rotation-primitive", label: "A rotation rewires three pointers, changing height while leaving the inorder sequence — and therefore the invariant — untouched" },
        { id: "avl-vs-red-black", label: "AVL enforces strict balance (~1.44 log n height, fast lookups, frequent rotations); red-black enforces looser balance (~2 log n, fewer rotations) — both O(log n)" },
      ],
    },
  ],
};
