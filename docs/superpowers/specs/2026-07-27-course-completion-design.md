# Course Completion — sandboxes and visualisations for all 191 lessons

**Date:** 2026-07-27
**Status:** ready for implementation
**Standard:** `CLAUDE.md` — commercial course, no shortcuts, no patchwork.

## Problem

The course is 191 lessons: 75 concept, 116 problem. Two things are missing
at scale.

| | Have | Target |
| --- | --- | --- |
| Problem lessons with a runnable sandbox | 26 | 116 |
| Lessons with a visualisation | 25 | triaged set, est. 100–120 |

## Three shortcuts in the previous plan, corrected here

This spec supersedes the informal plan. Held against `CLAUDE.md`, that plan
contained three compromises that are not acceptable for a sold product:

1. **It excluded five problems** because the runner could not express them.
   Rule 1 requires fixing the runner. The permanent exclusion list is now
   **empty**; every one of the 116 problem lessons gets a working sandbox.
2. **It computed expectations from JavaScript reference solutions only.**
   Rule 2 requires both runtimes. Python and JavaScript disagree on integer
   division (`-7 // 2`), sort stability, and string iteration — a case
   validated in one proves nothing about the other.
3. **Reference solutions lived in a throwaway script.** Rule 2 requires them
   checked in and executed in CI so every expectation is reproducible.

---

## Part 1 — Runner capability gaps

Today the runner does exactly one thing: call one function once, compare the
result to one stored value by deep equality. Three classes of problem do not
fit, covering **40 of the 90 uncovered lessons**.

### 1A · Structural inputs — 35 lessons

**The gap.** Linked lists, trees and graphs are objects pointing at each
other. The worker receives JSON. There is currently no way to hand such a
function its input at all. This is the single largest blocker and affects
linked-lists, binary-trees, bst, heaps, tries and graphs.

**The design.** A `shape` field declares how each argument is materialised.
Cases stay readable JSON in the conventional level-order form; the worker
builds real nodes before the call and serialises the result back, so both
sides of the comparison remain inspectable in the markdown.

```json
{
  "shape": { "0": "list" },
  "cases": [{ "args": [[1, 2, 3, 4, 5]], "expect": [5, 4, 3, 2, 1] }]
}
```

Supported shapes: `list` (singly linked), `tree` (binary, `null` for absent
children), `graph` (adjacency list). Each is implemented independently in
both runtimes, and each ships with node-class definitions **injected into
the user's scope**, so learners write against `ListNode` / `TreeNode`
exactly as they would in an interview.

Cycle-carrying variants (`list-cycle`, needed by Linked List Cycle) take a
`pos` field naming the join index, matching the convention learners already
know.

### 1B · Operation sequences — 3 lessons

**The gap.** Min Stack and the two Range Sum Query lessons ask for an object
used repeatedly. There is no single call to make.

**The design.** `check: "sequence"`. A case is a constructor argument list
plus an ordered script of calls with their expected returns. `null` means
"returns nothing; assert only that it does not throw."

```json
{
  "check": "sequence",
  "class": { "python": "MinStack", "javascript": "MinStack" },
  "cases": [{
    "construct": [],
    "ops": [["push", [-2], null], ["push", [0], null],
            ["getMin", [], -2], ["pop", [], null], ["getMin", [], -2]]
  }]
}
```

Failure reporting names the operation index, so a learner sees *which* call
diverged rather than "wrong".

### 1C · Order-independent answers — 2 lessons

**The gap.** 3Sum and Group Anagrams admit several correct orderings.
Equality comparison marks correct solutions wrong, which is worse than
having no test.

**The design.** A `compare` field naming a normaliser applied to **both**
sides before equality:

- `sorted` — order within the top-level result is irrelevant
- `set-of-sets` — order irrelevant at both levels (Group Anagrams)

Normalisation lives in `lib/sandbox/compare.ts` beside `canonical`, so there
remains exactly one definition of equality.

---

## Part 2 — Sandbox authoring pipeline

### Reference solutions are source, not scaffolding

`web/tests/reference/<module>/<lesson>.{py,ts}` holds a correct solution per
problem, in **both** languages. These are checked in and are the origin of
every expectation.

A generator reads them, executes both, and writes the sandbox fence. A CI
test re-executes both against the committed cases. Three consequences:

- No expectation is ever hand-written.
- A Python/JavaScript behavioural divergence fails the build rather than
  reaching a learner.
- Expectations are regenerable if a case list changes.

### Case selection is derived from the lesson, not invented

Each lesson states its constraints. Cases must include, where applicable:
the worked examples from the problem statement; the stated boundaries
(empty, single element, maximum k, negative values); the degenerate case
(all equal, already sorted, no solution); and at least one case targeting
the specific mistake the lesson's hints warn about.

Minimum five cases. A sandbox that passes a naive wrong solution is a defect.

### Starter code is scaffolding

Full signature, a one-line statement of what to return, and the node class
definitions where relevant. It must not encode the approach.

### The backlog ratchet is temporary — with a stated end

`tests/sandbox-backlog.json` pins the uncovered set so it can only shrink.
Per Rule 1, scaffolding carries an end condition: **when the backlog reaches
zero, the file is deleted and the test becomes a hard gate** asserting every
problem lesson has a sandbox. It is a migration device, not a permanent
allowlist.

---

## Part 3 — Visualisation programme

A sandbox is mechanical. **A visualisation is not, and cannot be generated.**
Each needs a decision about what picture explains the idea. This part is
therefore staged, editorial, and explicitly slower.

### The real problem is the reuse ratio

25 lessons carry a visual, from 16 components — only 7 components are used
more than once. That near-1:1 ratio is why coverage is low: every lesson has
been treated as bespoke.

`write-pointer` already serves two lessons and would serve Move Zeroes and
Remove Duplicates unchanged, with different `data`. Parameterisation, not
volume, is the lever.

### Stages

1. **Triage.** Classify all 191 lessons as *needs a visual* or *prose
   suffices*. A forced diagram is worse than none, and this judgment is
   editorial — it belongs to the course author, not the implementer. The
   deliverable is a reviewed list.
2. **Wire existing components to more lessons.** No new code; highest
   value per unit effort. Subject to the triage — never force an
   ill-fitting tracer to raise a number.
3. **Build ~12 parameterised tracers** for the recurring shapes: tree
   traversal, graph BFS/DFS frontier, heap sift-up/down, DP table fill,
   interval sweep, backtracking decision tree, two-pointer partition,
   trie descent, sort partition, hash probe, matrix spiral, monotonic
   deque. Each is designed to serve 5–10 lessons via props.
4. **Bespoke visuals** only where an idea is genuinely singular.

### Every tracer meets the existing contract

Deterministic `(props) => VizStep[]`; captions that double as screen-reader
text; per-language line references **verified programmatically** against the
snippet, not by eye — the line-highlight desync is a known recurring defect
class in this repo and has bitten twice.

---

## Verification

Nothing is complete until all of the following pass:

- `tsc --noEmit`, `eslint`, `npm test`, `npm run build` — all exit 0
- Every reference solution passes its own cases, in **both** runtimes, in CI
- Every registry id resolves; every fence parses
- Sandboxes spot-checked in the browser per module, including a deliberately
  wrong solution to confirm failures report `expected … got …`
- New tracers verified against the line-reference check and stepped to their
  terminal state
- Contrast re-measured for any colour introduced

## Sequencing

```
1A structural adapters ──► Part 2 structural authoring (35)
1B sequence mode ────────► 3 class-design lessons
1C comparators ──────────► 2 order-independent lessons
                           Part 2 plain-value authoring (55)  [independent]
Part 3 triage ───────────► wiring ──► new tracers ──► bespoke [independent]
```

**1A first.** It unblocks the largest block of content, and every future
structural lesson depends on it.

## Definition of done

- 116 of 116 problem lessons have a working sandbox in both languages
- `sandbox-backlog.json` deleted; coverage test is a hard gate
- Zero permanent exclusions
- Visualisation coverage matches the approved triage list
- CI green, standards in `CLAUDE.md` upheld throughout
