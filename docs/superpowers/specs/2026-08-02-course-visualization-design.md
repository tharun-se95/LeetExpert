# Course-wide visualization plan

**Date:** 2026-08-02
**Status:** proposed — awaiting confirmation on the component roster before build
**Resolves:** the `HANDOFF.md` "Blocked — needs the owner" visualisation-triage
item — this is that decision, made by the course owner directly.

---

## 1. Current state (measured, not estimated)

Full sweep of `course/` (212 files: 191 lesson/problem pages + 21
auto-generated Practice pages):

| Visual type | Fence | Lessons using it today |
| --- | --- | --- |
| Viz tracer (animated) | `` ```viz `` | 22 |
| Static diagram | `` ```diagram `` | 4 |
| Mermaid | `` ```mermaid `` | 8 |
| **Unique lessons with any visual** | | **32 of 191 (17%)** |

Component inventory: 16 viz tracers (`VIZ_REGISTRY`), 7 static diagrams
(`DIAGRAM_REGISTRY`). All 16 viz tracers already carry a `family` prop
(algorithm-family accent, wired 2026-08-01). **None of the 7 diagram
components do** — they render in plain `var(--accent)`. That's a real gap,
not just an oversight: closing it is in scope here (§3).

Coverage by module — everything from Sorting onward (stage 2 back half
through stage 4) is at zero:

| Has ≥1 visual | Has none |
| --- | --- |
| Arrays, Big-O, Math, Hash Tables (1), Linked Lists, Stacks (2), Queues (1), Two Pointers, Sliding Window, Prefix Sum, Binary Search, Binary Trees (mermaid only) | Getting Started*, Strings, Sorting, Matrix, Recursion & Backtracking, BST, Heaps, Tries, Intervals, Greedy, Graphs, Dynamic Programming |

\* Getting Started is meta content (course intro/roadmap) — genuinely
doesn't need one, not a gap.

---

## 2. Decision framework — which visual type for which lesson

Four outcomes, in this priority order:

1. **Viz (animated tracer)** — the lesson's core insight is a *process*:
   something moves, mutates, or gets visited in a sequence, and watching
   the sequence is what builds the intuition (a pointer sliding, a heap
   sifting, a table filling cell by cell). If the explanation would
   naturally use words like "then," "next," or "as we go" to describe
   what changes, it's motion.
2. **Static diagram** — the lesson's core insight is a *state or
   structure* at a single point in time: what does a hash table's bucket
   array actually look like, what are the three regions of an in-place
   partition, what does a heap look like laid out as an array. One
   precise, labeled picture (or a few side by side, like
   Initialization/Maintenance/Termination) says it fully — animating it
   would add motion the concept doesn't have.
3. **Mermaid** — the lesson's core insight is a *relationship between
   abstract entities*, not a data structure's internal state: dependency
   flow, category relationships, decision branching between concepts.
   Already used this way (`prefix-sum-2d`'s inclusion-exclusion diagram,
   `binary-trees`' traversal-order relationships).
4. **None** — purely definitional, procedural, or drill content with no
   spatial or stateful component (course intro, how-to-use-this-course,
   drills/review pages). Per `CLAUDE.md` and the existing HANDOFF note:
   forcing a diagram into these to raise a coverage number is explicitly
   the wrong move — it would satisfy a metric and violate the course
   standard.

**Reuse before building.** A lesson only gets a *new* component if no
existing (or planned, see §3) component fits via props. The existing
`write-pointer` tracer already serves two unrelated lessons (Move Zeroes,
Remove Duplicates) unchanged — that's the model, not the exception.

## 3. Family-color rule

Every viz and diagram component declares one of the 7 algorithm families
from `familyTheme.ts` (`pointer-movement`, `linear-traversal`,
`ordering-search`, `recursive-exploration`, `state-transition`,
`relationships`, `priority-structures`) — assigned by **technique**, not
by module, exactly as the existing spec already does (`fib-call-tree` is
`recursive-exploration` regardless of which lesson embeds it).

**New work required:** wire `familyCssVars`/`data-motif` into
`Diagram.tsx` and all 7 existing + all new diagram components, the same
way `VizPlayer` already consumes `family`. Right now diagrams render in
flat `var(--accent)` — after this, a diagram embedded in a
`recursive-exploration` lesson and a diagram embedded in a
`relationships` lesson will read as visibly different families, same as
the viz tracers already do. This is a prerequisite, not optional polish —
doing the full-course pass without it means half the new visuals (the
diagrams) stay monochrome while the other half (the viz) are colored,
which is the exact inconsistency worth avoiding.

A utility diagram with no real technique-family (e.g. a Big-O growth-rate
chart) stays neutral (`--accent`) rather than being forced into a family
it doesn't belong to.

## 4. Proposed component roster

Reuse-first, per the HANDOFF guidance ("~12 parameterised tracers... before
writing any bespoke ones"). This roster is 8 new viz + 4 new diagrams — 12
total, split by the motion rule instead of all being tracers, which
matches how much of the uncovered content (Big-O curves, trie shape, hash
bucket layout, call-stack frames) is genuinely static.

| New component | Type | Family | Serves (module → lesson count) |
| --- | --- | --- | --- |
| `tree-traversal` | viz | recursive-exploration | Binary Trees (4 concept + 7 problem), reused by BST traversal-shaped problems |
| `graph-frontier` | viz | relationships | Graphs (6 concept + 7 problem) |
| `heap-sift` | viz | priority-structures | Heaps (2 concept + 6 problem) — first user of this family, reserved for exactly this |
| `dp-table-fill` | viz | linear-traversal | Dynamic Programming (5 concept + 10 problem) — single highest-leverage new component |
| `interval-sweep` | viz | ordering-search | Intervals (1 concept + 5 problem), reused by Sorting's Meeting Rooms II |
| `backtracking-tree` | viz | recursive-exploration | Recursion & Backtracking (3 concept + 6 problem) |
| `compare-swap-bars` | viz | state-transition | Sorting (4 concept + 5 problem) |
| `grid-traversal` | viz | linear-traversal | Matrix (3 concept + 6 problem) |
| `complexity-curve` | diagram | neutral (utility) | Big-O: why-efficiency-matters, big-o-notation, common-complexity-classes — 3 lessons, one component |
| `bucket-layout` | diagram | relationships | Hash Tables: hashing-fundamentals (static sibling to the existing animated `hash-buckets` viz) |
| `trie-branches` | diagram | recursive-exploration | Tries: trie-structure-and-prefix-search |
| `call-stack-frames` | diagram | state-transition | Stacks: lifo-and-the-call-stack; Recursion: the-call-stack-and-base-cases |

`tree-traversal` is deliberately reused for Tries' problem-level lessons
too (a trie is structurally a tree) rather than adding a 13th component.

**Found during full triage** (§ ledger), two more reuse-worthy components
this table missed:

| New component | Type | Family | Serves |
| --- | --- | --- | --- |
| `stack-lifo` | viz | state-transition | Stacks: matching-and-nesting, valid-parentheses, evaluate-rpn, min-stack — plain push/pop, doesn't fit `monotonic-stack`'s ordering constraint |
| `union-find` | viz | relationships | Graphs: union-find concept, redundant-connection — path-compression + union animation |

Roster is 14 new components, not 12.

## 5. Process

1. This spec (framework + roster) — confirm before building.
2. Full 191-lesson triage as a living ledger:
   `docs/course-visualization-ledger.md`, one row per lesson, status
   tracked as work proceeds.
3. Build the 12 new components + the diagram family-color wiring once.
4. Work the ledger module by module, in course order, starting with
   Strings (currently 0% covered, and the module we were just working in).
5. Every embed gets the same verification as any other content change:
   `content.test.ts`, `viz-family-theming.test.ts`-style checks extended
   to diagrams, and a browser check in both themes.

## 6. Out of scope

- Retrofitting the 22 existing viz embeds' lesson prose (separate from
  this pass).
- The IDE Insight-panel memory schematic and cheatsheet pattern icons —
  already have their own systems and aren't per-lesson content.
- New sandbox problems, quiz content.
