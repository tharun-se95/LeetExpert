import type { MindMapNode } from "./types";

/**
 * Concept map for the Linked Lists module. Hand-authored from the module's
 * 3-lesson structure (course/linked-lists/*.md). Curriculum-designer review
 * confirmed the 3-lesson count and ordering (Nodes & Pointers -> Build From
 * Scratch -> Pointer Surgery) as correct, and flagged two genuine gaps that
 * were folded into the lessons: null-pointer safety for the fast/slow guard,
 * and the dummy node's second use as a construction anchor (not just a
 * deletion aid). A recommendation to strip the LinkedList wrapper class from
 * Lesson 2 was rejected — the Arrays module builds a full DynamicArray class
 * from scratch too, even though problems only use native structures; the
 * invariant-discipline teaching (tail/size bookkeeping) is consistent with
 * that established course pattern, not premature overhead.
 */
export const linkedListsConceptMap: MindMapNode = {
  id: "linked-lists",
  label: "Linked Lists",
  children: [
    {
      id: "nodes-pointers",
      label: "Nodes & Pointers",
      children: [
        { id: "nodes-drop-contiguity", label: "Each node is free-standing — value + pointer to next, allocated wherever memory is free" },
        { id: "nodes-buys", label: "Buys: O(1) structural edits at a known spot — splicing is two pointer writes, nothing shifts" },
        { id: "nodes-costs", label: "Costs: O(n) access by position/value — no address arithmetic, so no useful binary search either" },
        { id: "nodes-variants", label: "Variants: singly (default), doubly (prev pointer, O(1) self-deletion), sentinel/dummy nodes" },
      ],
    },
    {
      id: "build-from-scratch",
      label: "Build a Linked List From Scratch",
      children: [
        { id: "build-three-invariants", label: "Three promises: head reaches everything, tail is the last node, size is the node count" },
        { id: "build-tail-bug", label: "Forgetting the tail-update branch fails silently — surfaces later, at the next push_back" },
        { id: "build-prev-curr", label: "delete walks a (prev, curr) pair — a singly linked list can only edit what's ahead of it" },
        { id: "build-special-cases", label: "Empty list, head deletion, tail deletion — each a boundary where a pointer to rewire doesn't exist" },
      ],
    },
    {
      id: "pointer-surgery",
      label: "Pointer Surgery Patterns",
      children: [
        { id: "surgery-dummy", label: "Dummy node: manufactures a predecessor for the head — collapses the head-case into the general case" },
        { id: "surgery-dummy-construction", label: "Same trick in reverse: a dummy also anchors a NEW list under construction (tail pointer walks forward) — merging" },
        { id: "surgery-reversal", label: "Three-pointer reversal: prev/curr/nxt — nxt must be saved before the flip or the rest of the list is orphaned" },
        { id: "surgery-fast-slow", label: "Fast & slow runner: middle-finding, cycle detection, fixed-gap nth-from-end" },
        { id: "surgery-null-safety", label: "while fast and fast.next — checking only fast is a parity-dependent bug, crashes only on odd-length lists" },
        { id: "surgery-rewire-not-move", label: "Never move data — re-aim pointers. Copying values between nodes is the array algorithm in worse clothing" },
      ],
    },
  ],
};
