# Queues — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 3 concept-lesson sources (FIFO & Queue Mechanics, Build
a Ring Buffer, Deques & the Monotonic Deque) plus the 4 problem lessons.
This time the prompt explicitly told the reviewer to check whether the
problem lessons already self-teach before recommending a new lesson —
learned from stacks, where the review missed that Evaluate RPN and Min
Stack both already had full derivation sections. It worked: this review
correctly concluded "there are no genuine conceptual gaps" for 3 of the
4 problem lessons on its own.

**Accepted — no structural changes to lesson count.** Confirmed 3
lessons is right, ordering (FIFO -> Ring Buffer -> Deques) stays.

**Noted, not acted on — Ring Buffer has no dedicated problem lesson.**
The review correctly observed Lesson 2 ("Build a Ring Buffer") has zero
problem-level reinforcement among the 4 existing problem lessons, and
suggested a future "Design Circular Queue" problem. This is a real
observation but out of scope for a content pass — adding a new problem
lesson requires its own sandbox, reference solutions validated in both
languages, and CI test cases per CLAUDE.md §2, not something to fold
into a prose-review pass. Left as a note for a future problem-set
expansion, not implemented here.

**Rejected — moving the Monotonic Deque + Sliding Window Maximum to
"Module 10 (Two Pointers & Sliding Window)."** The review's central
recommendation treated Two Pointers and Sliding Window as one combined
module 10. Checked `web/src/lib/course/manifest.ts`: they are two
separate modules — Two Pointers is module 10 (converging/partition
pointers; problems like Two Sum II, 3Sum, Trapping Rain Water), Sliding
Window is module 11 (fixed/dynamic window-boundary invariants; problems
like Minimum Window Substring). Sliding Window's actual scope is about
maintaining an invariant while a window's *boundary* moves — not about
efficiently querying a window's max/min, which is fundamentally a
deque/monotonic-stack technique. The lesson already frames Sliding
Window Maximum as "this module's capstone," a deliberate choice, not an
oversight. The review's recommendation rested on a factual error about
the module map.

## Content-quality review

Same 4-question pass, this time explicitly telling NotebookLM to suggest
analogies freely rather than pre-filtering in the prompt (per user
correction after the stacks pass) — selectivity happens in review, not
by constraining the tool.

- **FIFO & Queue Mechanics:** added a derivation for why a singly linked
  list's tail-pointer trick only works paired with head-side removal
  (the reverse would need an O(n) search for the new tail, since nodes
  have no `prev`), an amortization derivation for the `SimpleQueue`
  compaction threshold using the *actual* trigger condition in the code
  (`head > 1000 && head*2 > items.length`), and a concrete
  dequeue/enqueue trace comparing the shifting array against the
  head-index version. Accepted a bus-passengers-shuffling analogy for
  the head-index trick. Rejected two "redundancy" fixes (the shift-cost
  explanation restated in the complexity table and quiz, the two-line
  "other O(1) designs" list called "crowded") — both are established,
  deliberate course conventions, not defects, and in the second case the
  review mischaracterized an already-bulleted list as "a single
  sentence."
- **Build a Ring Buffer:** added the modular-arithmetic derivation for
  why `head == tail` aliases both empty and full, a short justification
  for the sacrificial-slot tie-breaker, and tied the diagram's own
  example numbers (head=1, size=3) to the code's actual derived-tail
  formula. Expanded the lesson's own already-invoked "clock" reference
  (it names the connection but never spells out the mechanism) into one
  concrete sentence. Rejected the "design notes paragraph is bloated"
  and "amortized-vs-worst-case is repeated" fixes — both mischaracterize
  or duplicate established patterns, same as lesson 1.
- **Deques & the Monotonic Deque — the important one.** The review
  flagged that the worked example traces *values* in the deque
  (`deque [3, -1, -3]`) when a real implementation must store *indices*
  to check window expiry. Verified this independently by hand-running
  the actual index-based algorithm (Python, `collections.deque`) against
  the lesson's own example (`[1, 3, -1, -3, 5]`, k=3) — a front-expiry
  pop genuinely fires at i=4 (index 1 falls outside the window), and the
  original value-only trace never showed it, silently collapsing it into
  an ordinary back-dominance pop instead. This wasn't just an
  imprecision — the original trace never demonstrated half of what the
  lesson claims the algorithm does (the front-expiry mechanic). Replaced
  the entire worked example with a hand-verified index-based trace that
  shows the expiry check firing explicitly. Also added a one-clause
  explanation of why `collections.deque` uses segmented ring-buffer
  blocks. Rejected two proposed analogies (double-ended train car,
  sports-roster dominance) — the train car duplicates what the existing
  diagram already shows, and the sports-roster metaphor would introduce
  a second, different analogy for the same "dominance" concept the
  Stacks module already analogized with concert sightlines — redundant
  across modules rather than reinforcing within one.

Concept map hand-authored; media deferred to Phase 2.
