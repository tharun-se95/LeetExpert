# Arrays — content-quality review (retroactive, not a narrative-analogy pass)

Per the policy correction (2026-08-26): arrays originally shipped with zero
NotebookLM involvement — just a straight split of "In-Place Techniques"
into two lessons, no rewrite pass. The user caught this and asked for it
to be re-reviewed properly: "review Arrays, rewrite using notebook."

Reopened the existing arrays notebook, added the tightened content-quality
style guide plus the two split lessons' final content as sources, and
requested the same 4-question content-quality review used for strings
(gaps in derivation, concrete-example opportunities, tightening,
genuinely-spatial-only analogies) across all 4 lessons. First response
truncated after one heading; retried and got the full review.

## What the review found and what was accepted

**Lesson 1 — Arrays in Memory:**
- Gap: "n front-insertions is the triangular sum again: O(n²)" was stated
  without the closed form. Added `n(n+1)/2` explicitly.
- Gap: "cache line (typically 64 bytes)" was asserted without a concrete
  ratio. Added: a 64-byte line holds sixteen 4-byte ints, so the next 15
  reads after a miss (15/16, ~94%) are free.

**Lesson 2 — Dynamic Arrays, Built From Scratch:**
- Gap: the lesson's intro paragraph said "you proved the answer in the Big
  O module" and left multiplicative-vs-additive growth as a citation. The
  multiplicative case's aggregate-method sum already lived in the
  complexity fence below, but the additive case's derivation only existed
  inside a quiz explanation — never in the main prose. Promoted both into
  a self-contained comparison: multiplicative sums to <2n copies over n
  appends (O(1) amortized); additive (`capacity += c`) sums to Θ(n²/c),
  i.e. Θ(n/c) amortized — still growing with n for any constant c.

**Lesson 4 — Stable Compaction & Cyclic Placement:**
- Gap: Technique 4's cyclic-placement preview showed one example (n=6,
  k=2 → 2 disjoint cycles) without the general rule. Added: shifting n
  elements by k splits them into gcd(n, k) disjoint cycles of length
  n/gcd(n, k), with a second hand-verified example (n=5, k=2 → gcd=1 → a
  single 5-cycle) to show the shape actually changes with the shift.

## What was NOT accepted — the review over-flagged already-covered content

Independent verification (reading the current files before trusting the
review) found two of its four flagged "gaps" were already fully derived:

- **Lesson 3's "Python Tuple Swap Mechanism" gap** — the lesson already
  explains this exactly: "there is still a temporary — the tuple on the
  right is built before either assignment happens, which is exactly why
  the swap doesn't clobber itself." No change needed.
- **Lesson 4's "Safety Proof of Read/Write Pointer Invariant" gap** — the
  lesson already has the full derivation: "`read` advances every
  iteration; `write` advances only when a keeper is placed. So `write ≤
  read` always holds. That is the safety argument..." No change needed.

Lesson 3 (In-Place Foundations & Symmetric Pointers) received no edits at
all — it already carries a complete 3-step loop-invariant proof for
converging pointers and the tuple-swap explanation above. This is the
value of independently re-deriving before trusting a review pass: half of
what NotebookLM flagged as missing was already there.

No forced narrative analogy was added anywhere in this pass — the
existing content is already concrete/diagram-grounded (memory-cell
diagrams, pointer-region diagrams, the invariant-proof framework), and per
the policy correction this module gets tight derivations, not a sustained
scene.
