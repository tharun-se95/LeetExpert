import type { MindMapNode } from "./types";

/**
 * Concept map for the Recursion & Backtracking module. Hand-authored from
 * the module's 3-lesson structure (course/recursion-backtracking/*.md).
 * Curriculum-designer review confirmed 3 lessons is right and problem
 * lessons need no new concept lesson (all 6 already self-teach their
 * technique in "The insight"), but flagged two real issues, both fixed:
 * Lesson 1's opening claimed "everything so far has been flat," which
 * contradicts the immediately preceding Sorting module's recursive merge
 * sort and quicksort — reworded to acknowledge that module's recursion
 * while framing this lesson as the first explanation of the underlying
 * machine; and Lesson 2's "unchoose" was explained only via path.pop(),
 * while Permutations/N-Queens apply it to a used-array and to sets —
 * generalized with an added paragraph. Rejected NotebookLM's proposal to
 * merge Lesson 3 into Lesson 1 and drop it entirely (TCO content is
 * deliberately corrective, not filler; the one tree-height paragraph is a
 * normal forward-reference, not "premature cognitive load") and its
 * "triplicate" tightening claims on Lessons 2 and 3 (each flagged passage
 * serves a different purpose — why-copy, why-pop, alternative-design cost
 * — not pure restatement).
 */
export const recursionBacktrackingConceptMap: MindMapNode = {
  id: "recursion-backtracking",
  label: "Recursion & Backtracking",
  children: [
    {
      id: "call-stack-base-cases",
      label: "The Call Stack & Base Cases",
      children: [
        { id: "stack-frame-mechanics", label: "Every call pushes a frame (args/locals, return address, return slot); recursion is the ordinary call mechanism pointed at itself" },
        { id: "base-case-termination", label: "A broken base case doesn't hang like a loop — it crashes with a stack overflow, because frames pile up and never pop" },
        { id: "induction-proof", label: "Prove correctness by induction: base case right, then assume the smaller call is correct and show this call combines it correctly — never unfold the whole recursion" },
        { id: "fib-overlap-preview", label: "Naive Fibonacci is correct but exponential — overlapping subproblems recomputed from scratch is the diagnostic flag for 'this needs DP' (Module 24)" },
      ],
    },
    {
      id: "backtracking-template",
      label: "Backtracking: Choose, Explore, Unchoose",
      children: [
        { id: "state-space-tree", label: "A state-space tree: root is 'nothing decided,' each edge a choice, each leaf a complete configuration — backtracking walks it depth-first" },
        { id: "choose-explore-unchoose", label: "Choose (mutate shared path) → explore (recurse) → unchoose (undo) — one shared mutable tracker, not a copy per node" },
        { id: "unchoose-generalizes", label: "Unchoose isn't just path.pop() — the same mutate-on-choose/restore-on-unchoose discipline applies to a used-array (Permutations) or several sets (N-Queens)" },
        { id: "pruning-practical-not-asymptotic", label: "Pruning cuts the tree actually walked, often by orders of magnitude — but never changes the worst-case big-O, since an adversarial input can leave nothing to cut" },
        { id: "two-factor-complexity", label: "Complexity = tree size × cost per node, verified by checking leaf cost dominates internal cost — not a reflexive 'exponential' label" },
      ],
    },
    {
      id: "recursion-vs-iteration",
      label: "Recursion vs. Iteration",
      children: [
        { id: "depth-is-space", label: "Recursion depth is real O(depth) auxiliary space, invisible in code with no arrays or hash maps — a fact easy to forget" },
        { id: "depth-is-capped", label: "The call stack is bounded (~1000 CPython, ~10⁴ V8) — small next to real input sizes, so correct code can still crash on depth alone" },
        { id: "explicit-stack-fix", label: "An explicit stack moves O(depth) cost from the capped call stack to the heap, bounded only by real memory — the fix when depth is input-controlled" },
        { id: "tco-doesnt-help-here", label: "Tail-call optimization exists in theory but CPython and V8 don't implement it — tail-recursive rewriting buys zero stack safety in this course's languages" },
      ],
    },
  ],
};
