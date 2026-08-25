# Stacks — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 3 concept-lesson sources (LIFO & the Call Stack, Matching
& Nesting, The Monotonic Stack) plus the 5 problem lessons already in the
manifest.

**Rejected — all 4 recommendations.** The review's central claim was that
3 lessons is "too few" and recommended expanding to 5 by adding
"Expression Evaluation & Postfix Notation" (to support Evaluate Reverse
Polish Notation) and "State-Tracking & Auxiliary Stacks" (to support Min
Stack's O(1)-min trick). Verified against the actual problem-lesson files
before accepting: both `evaluate-rpn.md` and `min-stack.md` already
contain a complete "The insight" derivation section — the operand-stack
reasoning for RPN, and the paired-min-snapshot-stack pattern for Min
Stack, respectively, each with its own hints and a quiz — teaching
exactly what the review claimed was missing. This matches the established
course pattern verified repeatedly this session (arrays' write-pointer
problems, strings' palindrome problem, linked-lists' Merge Two Sorted
Lists): problem lessons are not bare coding exercises, they self-teach
the specific technique. Adding dedicated concept lessons for content
already fully derived in the problem lessons would be redundant, not
a genuine gap.

The review's 4th point — flagging the `count_down_rec`/`count_down_iter`
example in Lesson 1 as "premature" because "students have not taken
Recursion & Backtracking, Trees, or Graphs" — was also rejected after
checking `web/src/lib/course/manifest.ts`: `big-o` is module 2 (which
already teaches recursion-tree analysis in
`analyzing-recursion-tree-method.md`) and precedes `stacks` (module 8) by
six modules, while `recursion-backtracking` is module 16. Recursion is
not an unseen concept at this point in the curriculum — the review's
premise was factually wrong.

Lesson count and ordering (LIFO & the Call Stack -> Matching & Nesting ->
The Monotonic Stack) both stand unchanged.

## Content-quality review

Same 4-question pass used for prior modules. This time NotebookLM was
asked to suggest analogy candidates freely (not pre-filtered in the
prompt) — the selectivity judgment happens on the review side, not by
constraining what the tool proposes. Findings and dispositions:

- **LIFO & the Call Stack:** added a derivation for why the call stack
  has a hard depth limit while an explicit heap-backed stack doesn't (OS
  reserves a small fixed per-thread region for the call stack; the heap
  has no such reservation), and a hand-verified `count_down(3)` trace
  showing the same four pushes/pops in both the recursive and iterative
  versions. Accepted a "stack of paperwork on a desk" analogy for
  "interrupted work" — genuinely spatial and it's arguably the literal
  origin metaphor for the word "stack." Rejected a suggested rewrite of
  the "no implementation lesson needed" paragraph — the proposed tightened
  version was more jargon-heavy than the original, not clearer.
- **Matching & Nesting:** added the O(n²) derivation for the naive
  re-scan approach, a trace of the `([)]` mismatch failure mode, and
  promoted the single-bracket-type-counter-suffices reasoning from
  quiz-explanation-only into main prose (the same "promote to prose"
  pattern used in arrays and linked-lists). Added a full character-by-
  character trace table for the `"abbaca"` cascade (hand-verified) and a
  cafeteria-trays analogy for why a pop instantly exposes the next
  comparison. Rejected removing the forward-reference to the monotonic
  stack lesson — the review called it "premature," but forward-references
  are an established, deliberate course pattern (seen in arrays,
  linked-lists, strings), not a defect.
- **The Monotonic Stack:** strengthened the invariant-maintenance
  argument (why the stack stays strictly decreasing after every push, not
  just what happens on one step), added a one-sentence clarification that
  the course's left-to-right scan convention is a simplifying choice, not
  a mathematical requirement, and accepted a concert-sightlines analogy
  for why shorter/smaller elements get permanently filtered out — a
  strong fit since it foreshadows the module's own Largest Rectangle in
  Histogram problem. Rejected a suggestion to reformat the existing
  `[2,1,5,3]` ASCII-art trace into a markdown table — the review
  mischaracterized the existing trace as "a dense, hard-to-parse
  paragraph," which it isn't; the ASCII-trace format is already concrete
  and consistent with similar traces elsewhere in the course.

Concept map hand-authored; media deferred to Phase 2.
