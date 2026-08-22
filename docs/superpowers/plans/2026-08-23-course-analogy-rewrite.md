# Course-Wide Analogy Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the intuition-building sections of all 75 `type: concept` lessons in `course/` so each opens with one sustained, real-world analogy (in the style validated on Hash Tables — Magic Organizer / 10-Slot Mailroom / Hot Potato Parking Lot / Orange Traffic Cone), using Gemini Notebook (NotebookLM) as the analogy-drafting tool, while keeping every existing correctness guarantee (derivations, quizzes, complexity tables) intact.

**Architecture:** A single checked-in style guide is the shared "system prompt" pasted into every NotebookLM notebook, so 24 separate module notebooks (one per `course/` subdirectory) all produce analogies in the same voice. A fixed prompt template is run against each module's concept-lesson sources through the in-app Browser pane (Claude in Chrome is not available in this environment). Output is saved to a scratch markdown file per module *before* any lesson file is touched, so the raw material survives even if a rewrite needs redoing. Lessons are then hand-rewritten (never pasted verbatim from NotebookLM) to fold the analogy in as the opening frame while preserving the technical payoff paragraph, diagrams, complexity blocks, and quizzes as a "why it's actually true" close.

**Tech Stack:** Gemini Notebook (notebook.google.com) via `mcp__Claude_Browser__*` tools; existing course Markdown pipeline (`course/**/*.md`); Vitest content tests in `web/tests/`.

## Global Constraints

- Never paste NotebookLM's raw output into `course/*.md` — it is drafting material only, rewritten in the course's own voice (memory: `feedback_lesson_prose_style` — expand in plain language, never compress into terse metaphors).
- Every lesson must still satisfy CLAUDE.md §3: "Explanations derive their conclusions. No asserted result without the reasoning that produces it." The analogy is the *entry point*, not a replacement for the existing derivation — the derivation stays, reframed as "why this is actually true" after the analogy lands.
- Only upload/paste content that is either (a) this repo's own lesson text, or (b) NotebookLM's own generated output. Never paste in third-party textbook or blog text as a source — CLAUDE.md is a commercial product and reproducing paraphrased copyrighted explanations is a legal risk we don't need to take when the existing lessons are already original.
- Quiz distractors, `complexity` blocks, and frontmatter (`title`, `type`) must be preserved verbatim unless the rewritten prose actually changes what a distractor is testing.
- `diagram`/`viz` JSON blocks may be edited when the story needs specific numbers the existing props don't provide, but every such block must be reconciled against the final prose before a module is marked done (see Task 3, Step 6.5) — text and picture must never disagree on the same page. This was caught as a real bug on the pilot module, not a hypothetical risk.
- After every module's lessons are rewritten: `npm test` and `npm run build` inside `web/` must pass before moving to the next module.
- Scaffolding introduced by this plan (the progress tracker, the `analogies/` scratch directory) is temporary: delete `docs/superpowers/plans/analogies/` and the tracker's checklist once all 24 modules are checked off (end condition, per CLAUDE.md §1).

---

## Phase 0 — Foundations (do once)

### Task 1: Write the shared analogy style guide

This is the "system prompt" every NotebookLM notebook gets fed as its first source. Without it, 24 independent chat sessions will drift in tone — one module might produce dry corporate analogies, another might produce cutesy ones, and the course will read like it had six different authors.

**Files:**
- Create: `docs/superpowers/specs/2026-08-23-analogy-style-guide.md`

- [ ] **Step 1: Write the style guide**

Create `docs/superpowers/specs/2026-08-23-analogy-style-guide.md` with this content:

```markdown
# Analogy Style Guide — Course Explanations

This is pasted as the first source into every NotebookLM notebook used to
draft course explanations. It is the one place tone rules live — update it
here, not per-module, when the approach changes.

## What a good lesson analogy does

- **One analogy per lesson, sustained end to end.** Hash Tables proved the
  pattern: mailroom -> collision -> chaining ("overstuffed cubby") -> open
  addressing ("hot potato parking lot") -> tombstones ("orange traffic
  cone") is ONE scene that grows, not five unrelated ones. A new analogy
  per paragraph is worse than no analogy — it adds vocabulary instead of
  removing it.
- **Physical and everyday**, not abstract or technical-adjacent. "A
  warehouse with numbered cubbies" beats "a directory service." If a
  9-year-old hasn't encountered the object (a mailroom, a parking lot, a
  coat check, a library return slot), don't use it.
- **Introduces the idea before naming it.** Tell the story, let the reader
  feel *why* the problem is real, then attach the vocabulary word
  (collision, load factor, amortized). Never open with the term.
- **Motivates every "why," never just the "what."** If the lesson's
  existing prose asserts a claim, the analogy's job is to make that claim
  feel obvious before the reader sees the formal reasoning.

## Hard rules for the analogy pass specifically

- No equations, no Greek letters, no Big-O notation inside the analogy
  itself. Save all of that for the section that follows.
- No named algorithms or CS jargon inside the analogy's own sentences
  (the mailroom clerk doesn't "hash," they "do a quick trick").
- Plain spoken language — the kind you'd use explaining something to a
  smart friend over coffee, not a textbook register.

## What must survive the analogy pass unchanged

- The lesson keeps its existing derivation / proof / complexity argument
  — it moves to a section AFTER the analogy, introduced as "here's why
  that's actually true" or similar, translated back into the analogy's
  own nouns where possible (e.g., "the clerk's rule" instead of "the hash
  function", the first time; the formal term follows in parentheses).
- Diagrams (` ```diagram `), visualizations (` ```viz `), complexity
  tables (` ```complexity `), and quizzes (` ```quiz `) are structural —
  do not ask NotebookLM to touch these. They're edited by hand afterward
  only if the surrounding prose changes what they reference.
- Frontmatter (`title`, `type`) never changes.

## The standing prose-style rule (already in force)

Lessons expand ideas in plain language — they do not compress into terse
phrases or metaphor-shorthand. An analogy is not a substitute for
explaining the mechanism; it's the on-ramp to explaining it fully.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-08-23-analogy-style-guide.md
git commit -m "docs: add analogy style guide for course rewrite"
```

---

### Task 2: Create the module tracker

The full list of 75 concept lessons across 24 modules, so progress survives across sessions and nothing gets silently skipped or redone.

**Files:**
- Create: `docs/superpowers/plans/2026-08-23-course-analogy-tracker.md`

- [ ] **Step 1: Write the tracker**

Create `docs/superpowers/plans/2026-08-23-course-analogy-tracker.md`:

```markdown
# Course Analogy Rewrite — Progress Tracker

Delete this file (and `docs/superpowers/plans/analogies/`) once every box
below is checked. One NotebookLM notebook per module; see Task 3 of
`2026-08-23-course-analogy-rewrite.md` for the per-module procedure.

- [x] hash-tables — hashing-fundamentals.md, collision-resolution.md, build-a-hash-map.md, hash-patterns.md (pilot — done in chat, not yet rewritten into files)
- [ ] getting-started — course-introduction.md, course-roadmap.md, how-lessons-work.md
- [ ] big-o — analyzing-code.md, common-complexity-classes.md, big-o-notation.md, best-worst-average-amortized.md, complexity-drills.md, why-efficiency-matters.md, space-complexity.md
- [ ] arrays — contiguous-memory.md, in-place-techniques.md, dynamic-arrays.md
- [ ] two-pointers — converging-pointers.md, partition-pointers.md
- [ ] sliding-window — dynamic-windows.md, fixed-size-windows.md
- [ ] strings — string-toolkit.md, strings-in-memory.md
- [ ] linked-lists — build-a-linked-list.md, nodes-and-pointers.md, pointer-surgery.md
- [ ] stacks — lifo-and-the-call-stack.md, matching-and-nesting.md, monotonic-stack.md
- [ ] queues — deques-and-monotonic.md, fifo-basics.md, ring-buffer.md
- [ ] binary-search — binary-search-on-the-answer.md, boundary-search.md, the-invariant-template.md
- [ ] sorting — baseline-sorts.md, linear-time-sorts.md, merge-sort-lower-bound.md, quicksort-partitioning.md
- [ ] recursion-backtracking — backtracking-choose-explore-unchoose.md, recursion-vs-iteration.md, the-call-stack-and-base-cases.md
- [ ] binary-trees — bfs-level-order.md, dfs-traversals.md, top-down-vs-bottom-up-recursion.md, tree-terminology-and-representation.md
- [ ] bst — balance-and-why-it-matters.md, bst-invariant-and-operations.md
- [ ] heaps — heap-property-and-array-representation.md, heapify-sift-up-and-sift-down.md
- [ ] tries — trie-structure-and-prefix-search.md
- [ ] graphs — dfs-and-bfs-on-graphs.md, graph-representation.md, minimum-spanning-trees.md, shortest-paths.md, topological-sort.md, union-find.md
- [ ] intervals — sorting-intervals-and-the-sweep.md
- [ ] prefix-sum — prefix-sum-2d.md, prefix-sum-basics.md, prefix-sum-hash-map.md
- [ ] matrix — grid-coordinates.md, traversal-orders.md, in-place-transformations.md
- [ ] greedy — greedy-choice-and-proving-correctness.md
- [ ] dynamic-programming — 1d-dp-patterns.md, 2d-dp-patterns.md, from-recursion-to-memoization.md, tabulation-and-space-optimization.md, knapsack-style-dp.md
- [ ] math-for-dsa — counting-and-combinatorics.md, logarithms-and-exponents.md, divisibility-primes-gcd.md, modular-arithmetic.md, math-drills.md
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-08-23-course-analogy-tracker.md
git commit -m "docs: add progress tracker for course analogy rewrite"
```

---

## Phase 1 — Finish the pilot module (hash-tables)

### Task 3: Rewrite the two hash-tables lessons already drafted, and establish the reusable per-module procedure

This task is written in full detail because every later module repeats this exact procedure — later tasks reference it by name ("run the Task 3 procedure against module X") instead of re-explaining it, per DRY.

**Files:**
- Modify: `course/hash-tables/hashing-fundamentals.md`
- Modify: `course/hash-tables/collision-resolution.md`
- Create: `docs/superpowers/plans/analogies/hash-tables.md` (scratch — analogy material, not shipped)
- Test: `web/tests/content.test.ts` (existing, run not written)

**The reusable per-module procedure (steps 1–8 below, referenced as "the Task 3 procedure" in Tasks 4+):**

- [ ] **Step 1: Open the Browser pane and start a fresh Gemini Notebook**

```
mcp__Claude_Browser__preview_start { "url": "https://notebook.google.com" }
```
Click "Create new notebook" (or "+ Create new" if a notebook is already open).

- [ ] **Step 2: Paste the style guide as the first source**

Click "Add sources" -> "Copied text". Paste the full contents of
`docs/superpowers/specs/2026-08-23-analogy-style-guide.md`, prefixed with
`SOURCE: analogy-style-guide.md`. Click Insert.

- [ ] **Step 3: Paste each concept lesson in the module as a source**

For every concept lesson in the module (hash-tables: `hashing-fundamentals.md`,
`collision-resolution.md`, `build-a-hash-map.md`, `hash-patterns.md`), repeat:
click "Add sources" -> "Copied text", paste the file's body prefixed with
`SOURCE: <filename>`, click Insert. (`hashing-fundamentals.md` and
`collision-resolution.md` are already pasted from the pilot chat — reuse
that notebook rather than recreating it.)

- [ ] **Step 4: Select all sources, then run the fixed prompt template**

Click "Select all" in the Sources panel so every source (style guide +
all lessons) is checked. Paste this exact prompt (only the module name
changes across runs):

```
You've read the style guide. Using ONLY the real-world-analogy approach
it describes (no equations, no Greek letters, no Big-O in the analogy
itself, one sustained analogy per lesson, introduce the idea before
naming it), draft an analogy pass for every lesson in this module. For
each source file, give me:

1. The ONE real-world analogy you'll use for that lesson, and why it fits.
2. A full walk-through applying that analogy to every major claim in the
   lesson, in the order the lesson currently makes those claims.
3. A one-line note on which existing technical term follows each
   analogy beat (e.g. "this is the moment to introduce the word
   'collision'").

Keep lessons' analogies consistent with each other if they build on the
same underlying idea (they're read in sequence by the same student).
Label each section clearly with the source filename it belongs to.
```

- [ ] **Step 5: Save the raw output to a scratch file**

Copy the full chat response and save it as
`docs/superpowers/plans/analogies/hash-tables.md` (create the file with
the Write tool). This preserves the material even if the rewrite below
needs a second pass.

- [ ] **Step 6: Rewrite each lesson by hand**

For each lesson file, open it and the matching section of the scratch
file side by side. Rewrite the lesson so that:
- It opens with the analogy (in the course's own prose voice — expand,
  don't compress, per the standing style rule).
- Existing technical vocabulary is introduced right after the analogy
  beat that motivates it, exactly where the scratch notes say to.
- The existing derivation/proof paragraph is kept, moved to follow the
  analogy, and re-framed as "here's why that's actually true" — do not
  delete the math, translate its intro sentence to reference the analogy
  ("Back in the mailroom...").
- `diagram`, `viz`, `complexity`, and `quiz` fenced blocks are left
  byte-for-byte unless a quiz question's wording no longer matches the
  surrounding prose, in which case only the prose lead-in of that
  question is adjusted — never the `answer` index or the underlying claim.
- Frontmatter is untouched.

- [ ] **Step 6.5: Reconcile every diagram/viz block against the new prose**

Diagram/viz components are shared React components driven by literal
JSON props embedded in the fence — NotebookLM never sees these props, so
its drafted analogy can silently contradict what a diagram actually
renders. This happened on the pilot: rewritten prose said "Alice and Bob
collide at Slot 4," but the `bucket-layout` diagram right below it
rendered "dog" and "god" colliding at Slot 2.

For every `diagram`/`viz` fence in the file just rewritten:
1. Read its JSON props (e.g. `grep -A20 '```diagram' <file>`).
2. If it encodes hash-mod arithmetic (a `hashValue` + `capacity`), compute
   the actual rendered slot (`hashValue % capacity`) — don't guess.
3. If the story's names/numbers don't match what the props render, fix
   the *story* to use the diagram's existing example data. Only edit the
   JSON props themselves (never the shared component file) if the story
   genuinely needs different concrete numbers than what's already there.
4. Re-render the page (Step 8 below) and visually confirm text and
   picture agree before moving on.

See `docs/superpowers/specs/2026-08-23-analogy-style-guide.md`'s
"diagram/viz reconciliation rule" for the full rationale.

- [ ] **Step 7: Run the test suite and build**

```bash
cd web && npm test && npm run build
```
Expected: both exit 0. If `content.test.ts` fails on a structural
assertion (e.g. a fenced block got mangled), fix the offending lesson
file and re-run before proceeding — do not move to the next lesson with
a failing suite.

- [ ] **Step 8: Spot-check in the browser, then commit**

```
mcp__Claude_Browser__preview_start { "name": "<dev server config from .claude/launch.json>" }
```
Navigate to the rewritten lesson's course page, confirm it renders (no
broken fences, diagrams still mount, quiz still functional). Then:

```bash
git add course/hash-tables/hashing-fundamentals.md course/hash-tables/collision-resolution.md docs/superpowers/plans/analogies/hash-tables.md
git commit -m "content(hash-tables): open hashing-fundamentals and collision-resolution with a sustained real-world analogy"
```

Update the tracker: change the `hash-tables` line in
`docs/superpowers/plans/2026-08-23-course-analogy-tracker.md` to
`[x] hash-tables — hashing-fundamentals.md, collision-resolution.md,
build-a-hash-map.md, hash-patterns.md (done)` once all four files in the
module are rewritten (not just the two pilot files).

---

## Phase 2 — Remaining 23 modules

### Task 4: Run the Task 3 procedure against every remaining module

Each of the 23 remaining rows in
`docs/superpowers/plans/2026-08-23-course-analogy-tracker.md` gets its own
NotebookLM notebook and its own pass through Task 3's 8 steps. Suggested
order follows the course's own stage sequence (`getting-started` and
`big-o` first, since later modules' analogies may reference "remember the
mailroom from Module 5" — check the tracker's checked rows before writing
a new analogy in case a callback is natural, but don't force one).

- [ ] For each unchecked row in the tracker, in order:
  - [ ] Run Task 3 Steps 1–8 against that module's concept-lesson files.
  - [ ] Check off that module's row in the tracker.
  - [ ] Confirm `npm test && npm run build` (inside `web/`) still pass
        before starting the next module.

- [ ] **Final step: remove the scaffolding**

Once every row in the tracker is checked:

```bash
git rm -r docs/superpowers/plans/analogies/
git rm docs/superpowers/plans/2026-08-23-course-analogy-tracker.md
git commit -m "chore: remove course analogy rewrite scaffolding (migration complete)"
```

---

## Notes on NotebookLM capabilities considered and why they're in/out of scope

- **Copied-text sources** — in use (Task 3 Step 2–3). The only reliable
  way to get repo content into a notebook without native file-picker
  automation (Claude Browser can't drive OS file dialogs).
- **Chat with source selection** — in use (Task 3 Step 4). Selecting all
  sources per module, rather than one notebook per lesson, is what let
  the pilot's mailroom analogy naturally extend across two lessons —
  keep multi-lesson modules in one notebook for exactly that reason.
- **Audio Overview** — evaluated, **not** part of the default procedure.
  It takes several minutes to generate per notebook and its output can't
  be pasted back as text, so it doesn't fit a scripted browser-automation
  loop across 24 modules. Optional: manually generate one for the first
  2–3 modules only, as a listening gut-check on pacing, if the written
  analogies still feel off after Task 3 Step 6.
- **Mind Map / Study Guide / Reports / Flashcards (Studio panel)** —
  evaluated, not used. They summarize existing material rather than
  generate the plain-language analogy explanations this task needs;
  no clear fit for this specific rewrite.
- **Native file upload ("Upload files")** — not used. The Browser pane
  tool cannot drive native OS file-picker dialogs, so "Copied text" is
  the only scriptable ingestion path available in this environment.

---

## Self-Review

**Spec coverage:** style guide (Task 1) — consistency mechanism the user
asked for. Tracker (Task 2) — the "how to do this correctly... across the
entire course" scope. Reusable procedure (Task 3) — the concrete
NotebookLM workflow, capability survey included. Rollout (Task 4) —
covers all 24 modules / 75 concept lessons. Tone preservation — enforced
via the Global Constraints section and the style guide's explicit
"what must survive unchanged" rules.

**Placeholder scan:** no TBD/"handle appropriately" steps; the Task 3
prompt template is given verbatim; file paths are exact throughout.

**Scope note:** this plan covers the 75 `type: concept` lessons only.
The 116 `type: problem` lessons are already worked-example-driven (they
walk a specific input through a specific solution) and were judged lower
priority for an abstract-analogy pass — revisit as a separate plan if the
same "reads OK but not great" feedback comes up for problem lessons.
