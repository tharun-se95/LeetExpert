import type { MindMapNode } from "./types";

/**
 * Concept map for the Arrays & Dynamic Arrays module. Hand-authored from
 * the module's 4-lesson structure (course/arrays/*.md), settled by the
 * curriculum-designer review (media-rollout spec §2.5) that split the
 * original "In-Place Techniques" lesson — four techniques each carrying
 * a full loop-invariant proof was too much for one lesson — into a
 * symmetric-pointer foundation and an asymmetric-technique follow-up.
 * A recommended addition (row/column-major memory flattening folded into
 * Arrays in Memory) was rejected: that topic already belongs to the
 * later Matrix module.
 */
export const arraysConceptMap: MindMapNode = {
  id: "arrays",
  label: "Arrays & Dynamic Arrays",
  children: [
    {
      id: "memory",
      label: "Arrays in Memory",
      children: [
        { id: "memory-contiguous", label: "One contiguous block, equal-sized slots" },
        { id: "memory-address", label: "address(i) = base + i × slot_size — O(1) random access" },
        {
          id: "memory-costs",
          label: "Costs from the layout",
          children: [
            { id: "memory-costs-readwrite", label: "read/write O(1)" },
            { id: "memory-costs-append", label: "append at end O(1) (capacity free)" },
            { id: "memory-costs-insert", label: "insert/delete at i O(n−i) — contiguity forbids gaps" },
            { id: "memory-costs-search", label: "unsorted search O(n)" },
          ],
        },
        { id: "memory-frontinsert", label: "n front-insertions = triangular sum = O(n²)" },
        { id: "memory-cache", label: "Cache locality: sequential access is 10-100x faster despite same O(n) class" },
        { id: "memory-languages", label: "Python lists = pointer blocks; JS arrays demote to hash-map mode if sparse/mixed-type" },
      ],
    },
    {
      id: "dynamic",
      label: "Dynamic Arrays, Built From Scratch",
      children: [
        { id: "dynamic-design", label: "Backing store + capacity + length + growth policy" },
        { id: "dynamic-grow", label: "grow(): capacity *= 2 (multiplicative — load-bearing)" },
        { id: "dynamic-ops", label: "get/set O(1); append O(1) amortized; pop(end) O(1); insert/delete O(n−i)" },
        { id: "dynamic-shrink", label: "Shrink lazily (or never) to avoid grow/shrink thrashing at a boundary" },
        { id: "dynamic-factors", label: "Growth factors in the wild: 1.5x–2x, any factor >1 gives O(1) amortized" },
      ],
    },
    {
      id: "in-place-foundations",
      label: "In-Place Foundations & Symmetric Pointers",
      children: [
        { id: "in-place-def", label: "In-place: O(1) auxiliary space, stateful — same memory is input and output" },
        {
          id: "in-place-invariant",
          label: "Loop invariant: a claim about array regions, proved in 3 steps",
          children: [
            { id: "in-place-invariant-init", label: "Initialization: true before the first iteration" },
            { id: "in-place-invariant-maintenance", label: "Maintenance: true before ⇒ true after" },
            { id: "in-place-invariant-termination", label: "Termination: the exit condition yields the result" },
          ],
        },
        { id: "in-place-swap", label: "Swapping: the atom of in-place work" },
        { id: "in-place-converging", label: "Converging pointers: outside [left,right] is already final (array reversal)" },
      ],
    },
    {
      id: "advanced-linear",
      label: "Stable Compaction & Cyclic Placement",
      children: [
        { id: "advanced-readwrite", label: "Read/write pointers: nums[0..write) holds keepers seen so far, in order" },
        { id: "advanced-readwrite-safety", label: "write ≤ read always — never overwrites unread data" },
        { id: "advanced-cyclic", label: "Cyclic placement: chase displacement cycles for permutations like rotation" },
        { id: "advanced-cyclic-trap", label: "Multiple disjoint cycles — must detect closure and jump to an untouched index" },
      ],
    },
  ],
};
