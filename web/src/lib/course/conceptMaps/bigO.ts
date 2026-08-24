import type { MindMapNode } from "./types";

/**
 * Concept map for the Big O & Complexity Analysis module. Hand-authored
 * from the module's 9-lesson structure (course/big-o/*.md), settled by
 * the curriculum-designer review (media-rollout spec §2.5) that split the
 * original 7-lesson list's two overloaded lessons — iterative vs.
 * recursive analysis, and case-analysis vs. sequence-analysis (amortized).
 */
export const bigOConceptMap: MindMapNode = {
  id: "big-o",
  label: "Big O & Complexity Analysis",
  children: [
    {
      id: "why-matters",
      label: "Why Efficiency Matters",
      children: [
        { id: "why-matters-growth", label: "Growth beats hardware — a 100x faster machine buys 100x data for O(n), only 10x for O(n²)" },
        { id: "why-matters-operations", label: "Count operations, not seconds — machine-independent" },
      ],
    },
    {
      id: "notation",
      label: "Big O Notation, Precisely",
      children: [
        { id: "notation-definition", label: "f(n)=O(g(n)): past some point, f ≤ c·g — an upper bound only" },
        { id: "notation-licenses", label: "Licenses: drop constants, drop lower-order terms, keep the dominant term" },
        { id: "notation-siblings", label: "Ω (lower bound), Θ (tight bound)" },
        { id: "notation-conflation", label: "\"Big O\" and \"worst case\" are independent ideas — O describes a function, case picks which one" },
      ],
    },
    {
      id: "classes",
      label: "The Common Complexity Classes",
      children: [
        { id: "classes-ladder", label: "O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!)" },
        { id: "classes-log", label: "log n = \"how many halvings\" — a trillion elements costs 40 probes" },
        { id: "classes-constraints", label: "Reading constraints: n≤20 → exponential fine; n≤10⁵ → n log n or n needed" },
      ],
    },
    {
      id: "input-dependency",
      label: "Input Dependency: Best, Worst, & Average",
      children: [
        { id: "input-dependency-cases", label: "Worst = guarantee, best = what's exploitable, average = needs a stated distribution" },
        { id: "input-dependency-quicksort", label: "Quicksort: Θ(n log n) average, Θ(n²) worst on a degenerate pivot" },
        { id: "input-dependency-hash", label: "Hash lookup: O(1) average, O(n) worst on collisions" },
      ],
    },
    {
      id: "loops",
      label: "Analyzing Loops & API Complexity",
      children: [
        { id: "loops-rules", label: "Sequence → add; nesting → multiply" },
        { id: "loops-nonconstant", label: "Non-constant steps: doubling counter → O(log n); dependent bound → triangular sum O(n²)" },
        { id: "loops-hidden-cost", label: "Price the body honestly — list membership/slice inside a loop hides O(n²)" },
      ],
    },
    {
      id: "recursion",
      label: "Analyzing Recursion: The Tree Method",
      children: [
        { id: "recursion-recurrence", label: "Recurrence: cost at n defined via cost at smaller n" },
        { id: "recursion-halve", label: "Halve and recurse once (binary search): O(log n)" },
        { id: "recursion-split-merge", label: "Split, recurse twice, merge (merge sort): flat n per level × log n levels = O(n log n)" },
        { id: "recursion-branch", label: "Branch without shrinking (naive Fibonacci): O(2ⁿ)-ish from re-solving subproblems" },
        { id: "recursion-depth-not-branching", label: "Depth decides, not branching factor — merge sort and Fibonacci both branch twice" },
      ],
    },
    {
      id: "amortized",
      label: "Amortized Analysis & Dynamic Arrays",
      children: [
        { id: "amortized-question", label: "Worst-case total over any sequence of m operations, divided by m — no probability" },
        { id: "amortized-dynamic-array", label: "Dynamic array append: O(1) amortized despite O(n) resize spikes" },
        { id: "amortized-accounting", label: "Accounting method: bank 2 extra units per append, resize draws from the bank" },
        { id: "amortized-doubling", label: "Doubling is required — fixed +10 growth degrades to O(n) amortized" },
        { id: "amortized-lens", label: "Four claims, four meanings: average (quicksort, hash), amortized (append), true worst case (merge sort)" },
      ],
    },
    {
      id: "space",
      label: "Space Complexity",
      children: [
        { id: "space-total-aux", label: "Total space (incl. input) vs. auxiliary space (extra only)" },
        { id: "space-call-stack", label: "Call stack frames cost memory proportional to recursion depth" },
        { id: "space-trade", label: "Time–space trade: the \"seen\" set from lesson 1 bought O(n) time with O(n) space" },
      ],
    },
    {
      id: "drills",
      label: "Complexity Drills",
      children: [
        { id: "drills-synthesis", label: "Six drills combining iteration count, body pricing, and stack depth" },
        { id: "drills-relative", label: "Complexity is relative to what n names — quadratic in n can be linear in input size" },
      ],
    },
  ],
};
