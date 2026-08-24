import type { MindMapNode } from "./types";

/**
 * Concept map for the Hash Tables module. Transcribed from the NotebookLM
 * mind map regenerated 2026-08-24 against the module's 6-lesson curriculum
 * (see docs/superpowers/specs/2026-08-24-course-media-rollout.md §1/§2.5) —
 * updated from the original 4-lesson version to add the Keys/Immutability/
 * Cryptography branch and the formal Maps vs. Sets leaf.
 */
export const hashTablesConceptMap: MindMapNode = {
  id: "hash-tables",
  label: "Hash Tables",
  children: [
    {
      id: "fundamentals",
      label: "Fundamentals",
      children: [
        { id: "fundamentals-problem", label: "Problem: O(n) value scans in arrays" },
        { id: "fundamentals-goal", label: "Goal: O(1) insert, lookup, delete" },
        { id: "fundamentals-mechanism", label: "Mechanism: slot = h(key) mod m" },
        {
          id: "fundamentals-properties",
          label: "Hash Function Properties",
          children: [
            { id: "fundamentals-properties-deterministic", label: "Deterministic: same key gives same hash" },
            { id: "fundamentals-properties-fast", label: "Fast: O(size of key)" },
            { id: "fundamentals-properties-uniform", label: "Uniform: keys spread evenly across slots" },
          ],
        },
        { id: "fundamentals-string", label: "String construction: polynomial hash mixing" },
        { id: "fundamentals-collisions", label: "Collisions: mathematically unavoidable (birthday paradox)" },
      ],
    },
    {
      id: "collision-resolution",
      label: "Collision Resolution",
      children: [
        {
          id: "collision-chaining",
          label: "Strategy 1: separate chaining",
          children: [
            { id: "collision-chaining-buckets", label: "Buckets hold lists of entries" },
            { id: "collision-chaining-lookup", label: "Lookup scans one bucket's list" },
            { id: "collision-chaining-cost", label: "O(1) average cost under uniform hashing" },
          ],
        },
        {
          id: "collision-open",
          label: "Strategy 2: open addressing",
          children: [
            { id: "collision-open-entries", label: "Entries stored directly in bucket array" },
            { id: "collision-open-probing", label: "Linear probing: search next free slot" },
            { id: "collision-open-clustering", label: "Issue: clustering degrades performance" },
            { id: "collision-open-deletion", label: "Deletion requires tombstone markers" },
            { id: "collision-open-space", label: "Space: O(m), no separate list nodes (vs chaining's O(n+m))" },
          ],
        },
        { id: "collision-load-factor", label: "Load factor (alpha): n entries / m buckets" },
      ],
    },
    {
      id: "implementation",
      label: "Implementation & Complexity",
      children: [
        { id: "implementation-api", label: "Core API: get, set, delete, size" },
        { id: "implementation-delete", label: "Chaining delete: swap-remove for O(1)" },
        {
          id: "implementation-resize",
          label: "Resizing mechanism",
          children: [
            { id: "implementation-resize-double", label: "Dynamic array trick: double table size" },
            { id: "implementation-resize-refile", label: "Re-filing: all entries move to new slots" },
            { id: "implementation-resize-cost", label: "Performance: O(1) amortized insert" },
          ],
        },
        {
          id: "implementation-complexity",
          label: "Complexity summary",
          children: [
            { id: "implementation-complexity-avg", label: "Average: O(1)" },
            { id: "implementation-complexity-worst", label: "Worst case: O(n)" },
            { id: "implementation-complexity-iter", label: "Iteration: O(n + m)" },
            { id: "implementation-complexity-space", label: "Space: O(n + m) chaining" },
          ],
        },
      ],
    },
    {
      id: "keys",
      label: "Keys, Immutability & Cryptographic Hashing",
      children: [
        { id: "keys-immutable", label: "Keys must be immutable: mutation breaks slot = h(key) mod m" },
        { id: "keys-python-js", label: "Python enforces (tuple vs list); JS doesn't (mutable Map keys)" },
        { id: "keys-reference-trap", label: "JS reference trap: Map compares object keys by identity, not value" },
        { id: "keys-canonical-fix", label: "Fix: canonicalize to a string key for by-value equality" },
        {
          id: "keys-crypto",
          label: "Non-cryptographic vs. cryptographic hashing",
          children: [
            { id: "keys-crypto-goal", label: "Table hash: fast + uniform only, no adversary" },
            { id: "keys-crypto-preimage", label: "Preimage resistance: can't reverse digest to input" },
            { id: "keys-crypto-collision", label: "Collision resistance: can't deliberately find two matching inputs" },
            { id: "keys-crypto-avalanche", label: "Avalanche effect: one bit changes ~half the output" },
            { id: "keys-crypto-usage", label: "Used for passwords, integrity checks, signatures — never bucket indices" },
          ],
        },
      ],
    },
    {
      id: "usage-patterns",
      label: "Usage Patterns (Four Verbs) & Sets",
      children: [
        { id: "usage-sets", label: "Maps vs. Sets: same structure, keys only, no payload" },
        { id: "usage-seen", label: "Seen: membership and memory (set)" },
        { id: "usage-count", label: "Count: frequency and tallies (map to int)" },
        { id: "usage-index", label: "Index: reverse lookup (value to location)" },
        { id: "usage-group", label: "Group: bucketing and sorting office (key to list)" },
      ],
    },
    {
      id: "constraints",
      label: "Constraints & Alternatives",
      children: [
        { id: "constraints-iteration", label: "Iteration: unordered, unless an extra layer is added" },
        { id: "constraints-trees", label: "Tree maps: needed for sorted / range queries" },
      ],
    },
  ],
};
