/**
 * The sandbox behind Build's Code window (owner, 2026-09-17). It is not a
 * course lesson, so the course's reference harness never sees it; the same
 * standard is applied in landingFeatures.test.tsx instead: checked-in
 * reference solutions (tests/reference/landing/find-pair.{py,js}) pass every
 * case in both runtimes, the untouched starter fails, and the draft Review
 * shows fails. The single-number case is the one that catches that draft.
 */
export const FIND_PAIR_SPEC = {
  id: "landing-find-pair",
  fn: { python: "find_pair", javascript: "findPair" },
  check: "return",
  starter: {
    python: "def find_pair(nums, target):\n    # Return the two numbers as a pair, or None if no pair adds up to target.\n    pass\n",
    javascript:
      "function findPair(nums, target) {\n  // Return the two numbers as [a, b], or null if no pair adds up to target.\n}\n",
  },
  cases: [
    { args: [[5, 3, 8, 1, 4, 7, 9], 16], expect: [7, 9] },
    { args: [[8, 8], 16], expect: [8, 8] },
    { args: [[8], 16], expect: null },
    { args: [[-3, 4, 10], 7], expect: [-3, 10] },
    { args: [[1, 2, 3], 100], expect: null },
    { args: [[], 5], expect: null },
  ],
} as const;

export const FIND_PAIR_SOURCE = JSON.stringify(FIND_PAIR_SPEC);
