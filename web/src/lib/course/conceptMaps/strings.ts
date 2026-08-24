import type { MindMapNode } from "./types";

/**
 * Concept map for the Strings module. Hand-authored from the module's
 * 3-lesson structure (course/strings/*.md), settled by the curriculum-
 * designer review (media-rollout spec §2.5) that split the original
 * "The String Toolkit" lesson — it mixed three distinct paradigms
 * (low-level char arithmetic, high-level API costs, two-pointer idioms)
 * into one lesson. A recommended addition (a Sliding Window on Strings
 * preview folded into the third lesson) was rejected: Sliding Window is
 * its own dedicated module (11), taught much later than Strings (5).
 */
export const stringsConceptMap: MindMapNode = {
  id: "strings",
  label: "Strings",
  children: [
    {
      id: "memory",
      label: "Strings in Memory & Immutability",
      children: [
        { id: "memory-array-lock", label: "A string is an array of character units — with a write-lock" },
        { id: "memory-why-immutable", label: "Why locked: safe sharing, hashability, interning" },
        { id: "memory-concat-trap", label: "result += w in a loop: O(n²), re-copies the accumulated prefix each step" },
        { id: "memory-builder", label: "Builder pattern: collect pieces (O(1) amortized), join once (O(total))" },
        { id: "memory-char-array-detour", label: "Mutable surgery: convert once, work in array, convert back — still O(n)" },
        { id: "memory-encoding", label: "JS: UTF-16 code units; Python: code points — invisible under ASCII constraints" },
      ],
    },
    {
      id: "char-arithmetic",
      label: "Character Arithmetic & Count Arrays",
      children: [
        { id: "char-ord-chr", label: "ord/chr bridge characters and codes; ord(ch)-ord('a') = alphabet position" },
        { id: "char-count-array", label: "26-slot count array replaces a hash map when the alphabet is small and fixed" },
        { id: "char-fingerprint", label: "A count array is a frequency fingerprint — a complete anagram test" },
      ],
    },
    {
      id: "string-apis",
      label: "String APIs, Scan Costs & Idioms",
      children: [
        { id: "apis-split-join", label: "split/process/join pipeline — O(n) time and space, Python/JS split() asymmetry" },
        {
          id: "apis-costs",
          label: "Pricing built-in methods honestly",
          children: [
            { id: "apis-costs-includes", label: "includes/in: O(n·m) — O(n²·m) if called inside a loop" },
            { id: "apis-costs-startswith", label: "startswith: O(|p|), stops at first mismatch" },
            { id: "apis-costs-find", label: "find/indexOf: O(n), full scan" },
          ],
        },
        { id: "apis-palindrome", label: "Palindrome check: converging pointers that only read — no char-array needed" },
        { id: "apis-prefix", label: "Common prefix scan: walk forward while every candidate agrees" },
      ],
    },
  ],
};
