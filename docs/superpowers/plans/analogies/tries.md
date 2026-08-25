# Tries — curriculum review + content-quality review

## Curriculum-designer review

Ran against the single concept-lesson source (Trie Structure & Prefix
Search) plus the 4 problem lessons' worked-solution sections, explicitly
instructed to verify problem lessons self-teach before recommending any
new concept lesson.

- **Count and self-teaching:** confirmed 1 lesson is right — wildcard
  DFS/backtracking, the grid-and-trie "lockstep" traversal, and the
  buildable-word BFS/DFS are each fully self-taught in their own problem
  lesson.
- **Ordering improvement applied:** Word Search II (2D grid walked in
  lockstep with a trie, with path pruning) is meaningfully harder than
  Longest Word in Dictionary (a pure trie traversal, no grid), but was
  sequenced before it. Swapped so Longest Word in Dictionary comes 3rd
  and Word Search II — the capstone — comes 4th. Verified no lesson's
  prose depended on the old order.
- **Rejected:** two "scope gap" suggestions to add new problem lessons
  (trie deletion / memory cleanup, and dedicated longest-prefix-match /
  router-style practice). Both are reasonable ideas but out of scope for
  a content-quality pass — a new problem lesson needs its own full
  attempt-it-first / insight / solution content and a verified sandbox
  with hand-executed test cases, not a prose edit to the existing lesson.

## Content-quality review — one real bug found, rest independently verified

- **Real bug: a wrong complexity claim.** The lesson asserted a hash
  set's prefix-query cost is O(n·L), L = average word length. That's
  incorrect: checking whether a word starts with a prefix only requires
  comparing up to the *prefix's* length, not the word's — verified in
  Python (a 30-character word tested against a 3-character prefix costs
  3 comparisons, not 30). The correct bound is **O(n·P)**, P = prefix
  length. Fixed in all four places the claim appeared: the prose
  derivation, the `starts_with` payoff paragraph, the complexity table,
  and a quiz option.
- Added a light illustrative example (not a full byte-level derivation,
  since the lesson's own "conceptual" framing doesn't warrant one) for
  the qualitative memory-crossover claim: `car`/`card`/`cart` (heavy
  sharing) vs. `car`/`dog`/`sky` (no sharing), same word and character
  count, opposite memory outcome.
- Added concrete numbers to the "fatal on large alphabets" claim: a
  one-child node on a 26-letter array wastes 25/26 ≈ 96% of its slots;
  on full ASCII (128 symbols), 127/128 ≈ 99%.
- Added a concrete `is_end_of_word` trace (insert `"card"` and `"cat"`
  only; `search("car")` walks successfully but reports false because the
  flag was never set; `search("card")` reaches a flagged node) and a
  concrete early-abort trace (`search("cable")` on a trie holding only
  `"card"`/`"cat"` stops after 2 characters when the `b`-edge doesn't
  exist) — both verified against the lesson's own stated mechanics.
- One sustained hiking-trail analogy added across the whole lesson —
  forks with letter-signs for the tree structure, flagged clearings for
  `is_end_of_word`, "no sign, no point continuing" for the early-abort
  case, and a fixed 26-slot signpost for the array-vs-map trade-off —
  rather than several independent, unrelated analogies per section.

Concept map hand-authored; media deferred to Phase 2.
