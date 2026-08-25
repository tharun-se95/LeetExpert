# Sliding Window — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 2 concept-lesson sources (Fixed-Size Windows, Dynamic
Windows & the Shrink Invariant) plus the 5 problem lessons. With the
explicit "check whether problem lessons self-teach first" instruction
now standard, this review was well-calibrated — no over-recommendation
of new lessons.

**Accepted — no structural changes.** Confirmed 2 lessons is correct
(they map to the module's two genuinely different execution patterns:
fixed-offset pointer relation vs. variable dual-pointer stepping), and
the Fixed-Size -> Dynamic ordering stays (simpler, deterministic pointer
relation before the harder variable-size case).

**Accepted, light-touch — two small additions, not new lessons:**
- A brief note on what "state" concretely looks like in the dynamic-
  window templates (a set for uniqueness, a frequency map for character
  counts) — the templates use `state`/`extend`/`shrink` abstractly, and
  a one-line concretization helps without duplicating what the problem
  lessons do with their specific state. Folded into existing prose
  rather than added as a new subsection, to avoid restructuring a
  lesson that didn't otherwise need it.
- A closing comparison distinguishing Sliding Window (optimal for
  fixed-size/localized contiguous queries, O(1) auxiliary space) from
  the upcoming Prefix Sum module (arbitrary-range queries on static
  arrays, O(n) space, O(1) query time) — considered but not added as a
  dedicated block; the existing module description and lesson framing
  already scope this clearly enough that a forward-looking paragraph
  felt like padding rather than a real gap.

## Content-quality review — two real correctness bugs found

This pass caught two genuine bugs in already-shipped lesson content,
both independently verified by hand (and for the first, by running the
actual algorithm in Python) before fixing:

- **Dynamic Windows' worked trace was incomplete and its implied answer
  was wrong.** The lesson traced `target sum >= 7` on
  `nums = [2, 3, 1, 2, 4, 3]` but stopped at `right=4`, reporting "best
  length so far = 3." Running the actual algorithm on the full array
  shows the true minimum window is length **2** (`[4, 3]`, found at
  `right=5`) — the trace simply never reached it. Fixed by extending the
  trace through `right=5` to the correct final answer, and added a note
  explaining *why* the loop can't stop early just because it finds a
  valid window (an earlier "best so far" isn't necessarily final).
- **The monotonicity claim was backwards for half the module's own
  templates.** The lesson stated as a general rule: "growing the window
  can only make it MORE valid, shrinking can only make it LESS valid."
  Verified by hand-tracing `"at most 2 distinct characters"` validity
  through `a -> ab -> abc -> bc`: growing from `ab` to `abc` makes the
  window **invalid** (3 distinct), and shrinking back to `bc` makes it
  **valid** again — the exact opposite of the stated rule. The claim was
  only true for the lower-bound case (`sum >= target`) used as the
  lesson's running example; the module's own second template
  (`longest_valid`, for upper-bound conditions like "at most k
  distinct") needs the opposite direction. Rewrote the section to state
  both directions explicitly, tied to the two templates the lesson
  already presents, rather than asserting one direction as universal.

Also added:
- **Fixed-Size Windows:** a division-by-zero trap explanation for
  running-product windows (sum's inverse is subtraction, always safe;
  product's inverse is division, undefined at a leaving zero) and a
  cropping-tool analogy for "slide instead of recompute" (dragging a
  crop box: discard the strip that fell off one edge, paint in the
  strip that entered the other, never re-crop from scratch).
- **Dynamic Windows:** an inchworm analogy for the expand/shrink
  mechanics (front end scouts forward, rear end catches up, neither
  backs up).

Rejected several "redundancy" flags (the O(n) explanation appearing in
intro/dedicated-section/quiz, the incremental-maintenance framing) as
the same deliberate brief-then-full-then-reinforce pattern verified and
kept throughout this rollout, and rejected a suggestion to reformat the
already-concrete arithmetic traces into tables.

Concept map hand-authored; media deferred to Phase 2.
