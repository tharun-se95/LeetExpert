import type { MindMapNode } from "./types";

/**
 * Concept map for the Stacks module. Hand-authored from the module's
 * 3-lesson structure (course/stacks/*.md). Curriculum-designer review
 * recommended expanding to 5 lessons (adding "Expression Evaluation &
 * Postfix Notation" and "State-Tracking & Auxiliary Stacks") — rejected
 * after verifying both problem lessons it cited (Evaluate Reverse Polish
 * Notation, Min Stack) already contain a full "The insight" derivation
 * section teaching exactly that technique, matching the established
 * course pattern where problem lessons self-teach. It also flagged the
 * recursion-to-iteration example in Lesson 1 as premature — rejected
 * after verifying `big-o` (module 2, which already covers recursion-tree
 * analysis) precedes `stacks` (module 8) by six modules.
 */
export const stacksConceptMap: MindMapNode = {
  id: "stacks",
  label: "Stacks",
  children: [
    {
      id: "lifo-call-stack",
      label: "LIFO & the Call Stack",
      children: [
        { id: "lifo-discipline", label: "A stack is a discipline on an array — push/pop only at the end, which Arrays already made O(1)" },
        { id: "lifo-interrupted-work", label: "LIFO models interrupted work: function calls, undo history, back buttons, nested parsing" },
        { id: "lifo-call-stack-explicit", label: "The runtime's call stack IS a stack of frames — recursion is never strictly necessary" },
        { id: "lifo-depth-limit", label: "Call stack is a small fixed OS region (crashes at a depth ceiling); the heap has no such reservation" },
      ],
    },
    {
      id: "matching-nesting",
      label: "Matching & Nesting",
      children: [
        { id: "matching-obligation-model", label: "Opener pushes an obligation, closer must match the top — well-nested iff the scan never fails and ends empty" },
        { id: "matching-three-failures", label: "Three failure modes: wrong closer, closer on empty, leftover obligations at the end" },
        { id: "matching-single-vs-multi-type", label: "A single bracket type collapses to a non-negative counter; multiple types need the stack's ordering" },
        { id: "matching-cascade", label: "Adjacent-cancellation cascades resolve in one pass — a pop always exposes exactly the next comparison" },
      ],
    },
    {
      id: "monotonic-stack",
      label: "The Monotonic Stack",
      children: [
        { id: "mono-question", label: "Answers 'next/previous greater/smaller' for every element in one O(n) pass, not O(n²)" },
        { id: "mono-invariant", label: "Strictly decreasing (or increasing) invariant — enforced fresh by every push, never assumed" },
        { id: "mono-accounting", label: "Push-once/pop-once amortized accounting makes the nested while-in-for loop O(n) total" },
        { id: "mono-four-flavors", label: "Four flavors from two knobs: stack direction, and whether the answer reads at push or pop" },
      ],
    },
  ],
};
