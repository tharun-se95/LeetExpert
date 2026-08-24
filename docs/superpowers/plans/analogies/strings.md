# Strings — content-quality review (not a narrative-analogy pass)

Per the policy correction (2026-08-26): this module used NotebookLM for a
genuine content-quality rewrite pass — gaps in derivation, awkward
transitions, concrete-example opportunities — rather than a forced
sustained-analogy narrative. Requested as a chat reply (the `.docx`
Google Doc output this notebook produced couldn't be opened in this
browser sandbox — same blob-download limitation hit earlier in the
session); saved to a Studio note for stable reading via viewport resize.

## What the review found and what was accepted

**Lesson 1 — Strings in Memory & Immutability:**
- Gap: "join_bad re-copies the accumulated prefix, O(n²)" was asserted,
  never shown. Added a step-by-step trace on 4 single-character words
  (`["a","b","c","d"]`) — independently hand-verified: 1+2+3+4 = 10
  character copies for join_bad vs. 4 for join_good (3 free reference-
  appends + 1 final join copy). Generalized to L·n(n+1)/2 vs. n·L.
- Gap: "two O(n) conversions bracketing an O(n) algorithm is still O(n)"
  had no explicit phase breakdown. Added: O(n) convert + O(n) mutate +
  O(n) revert = O(n) — sequence adds.
- Fixed a diagram/prose mismatch the new table introduced: the existing
  `string-builder-cost` diagram defaulted to `count: 6` ("21 copies"),
  which would have sat right next to the new 4-word/10-copy table —
  changed the diagram's count prop to 4 so both agree.

**Lesson 2 — Character Arithmetic & Count Arrays:**
- Gap: "26 slots replace a hash map... O(1)-iterable" was asserted
  without the three reasons why. Added: allocation (fixed block vs.
  dynamic buckets/resizing), per-operation cost (one subtraction vs. a
  hash function), and iteration (always exactly 26 slots regardless of
  input length, vs. scaling with distinct-key count).
- Added a step-by-step trace building a count array from `s = "cab"` —
  hand-verified: 'c'→offset 2, 'a'→offset 0, 'b'→offset 1, final
  counts = [1,1,1,0,...].

**Lesson 3 — String APIs, Scan Costs & Idioms:**
- Gap: "substring search is O(n·m)" had no concrete trace. Added a
  hand-verified naive-search trace: pattern `"ab"` in text `"aabab"` —
  position 0 fails after 2 comparisons, position 1 matches after 2 more,
  4 comparisons total to find the match.

## What was NOT accepted from the raw review output

The review's own numbers needed independent verification before use — one
draft claimed join_good does "4 copies into parts + 4 more at join = 8
total," which is wrong: `parts.append(w)` stores a reference, not a
character copy; only the final `"".join(parts)` copies characters (4
total, not 8). Caught by re-deriving by hand rather than trusting the
tool's arithmetic — the corrected number (4) is what shipped.
