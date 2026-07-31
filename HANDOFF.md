# Handover — course completion work

**Branch:** `feat/course-sandboxes-and-riso` (pushed, 2 commits, working tree clean)
**Base:** `main` — nothing merged yet
**Standards:** `CLAUDE.md` at repo root. Read it first; it binds this work.
**Spec:** `docs/superpowers/specs/2026-07-27-course-completion-design.md`

---

## State, in numbers

| | Now | Target |
| --- | --- | --- |
| Lessons | 191 (75 concept, 116 problem) | — |
| Problem lessons with a sandbox | **116** | 116 ✅ |
| Backlog | **0** — file deleted, coverage is a hard gate ✅ | — |
| Lessons with a visual | **25** | triaged set (est. 100–120) |
| Tests | 371, all green | grows with each batch |

**Done:** the Riso design system; **the sandbox programme, complete** — every
one of the 116 problem lessons has a working sandbox, validated against both
runtimes, and the runner expresses every problem shape in the course; the
reference-solution pipeline with CI gate; search; content tests; icons.

**Not done:** the entire visualisation programme (needs a decision from the
owner — see below).

---

## Architecture you must understand before changing anything

### The sandbox runner

Learner code executes in a terminable Web Worker — terminable is the point,
it is the only reliable way to stop `while (true)`.

```
useRunner.ts ──posts──► public/sandbox/js-runner.js  ──► run-cases.js ──► structures.js
             └─────────► public/sandbox/py-runner.js  ──► DRIVER (Python, in-file)
             ◄──raw outcomes── (workers NEVER decide pass/fail)
             └─ applies lib/sandbox/compare.ts
```

**The load-bearing rule: workers report raw outcomes; the main thread decides
pass/fail.** That keeps one definition of equality. Do not "optimise" a
comparison into a worker.

**Why `run-cases.js` is plain JS in `public/`:** so CI can import the exact
file the browser runs (behind a `self` shim) instead of proving a copy. The
Python test extracts the `DRIVER` string out of `py-runner.js` for the same
reason. If you move this logic into TypeScript, that guarantee dies.

### Sandbox spec fields

```jsonc
{
  "id": "...",                      // stable; also the localStorage draft key
  "fn":     { "python": "...", "javascript": "..." },
  "starter":{ "python": "...", "javascript": "..." },
  "check":  "return|mutate|prefix|sequence|roundtrip",
  "compare":"exact|sorted|set-of-sets",   // order-independent answers
  "shape":  { "0": "list|list[]|tree|graph|node" }, // arg -> what to build
  "returns":"value|list|tree|graph",      // `node`/`list[]` are argument-only
  "property":"<name from lib/sandbox/properties.ts>",
  "arg":    0,                            // which arg mutate/prefix inspects
  "class":  { ... },                      // sequence mode only
  "methods":{ "getMin": { "python": "get_min", "javascript": "getMin" } },
  "cases":  [ { "args": [...], "expect": ... } ]
}
```

`sequence` cases use `construct` + `ops: [[method, args, expected]]` instead
of `args`/`expect`. `property` cases carry `args` and no `expect` at all —
the property is the bar.

### Design tokens

Two tiers in `web/src/app/globals.css`: raw press inks (`--riso-*` keys,
**Indigo Modern** values) then semantic names (`--background`, `--accent`,
`--pop`, `--good`…). **Only tier 1 is redefined for dark mode**; tier 2
resolves at use time and follows. Palette sheet:
`docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md`.
Components consume semantic names, so a palette change is one edit.

---

## Traps already paid for — do not rediscover these

1. **Pyodide refuses to boot in a classic worker.** `py-runner.js` is an ES
   module worker instantiated with `{ type: "module" }`.
2. **`@phosphor-icons/react` is not RSC-safe** (it carries a React context).
   Server components import from `@phosphor-icons/react/dist/ssr` and pass
   `weight="bold"` explicitly. Do not "fix" this by adding `"use client"`.
3. **CodeMirror:** `basicSetup.syntaxHighlighting` must stay `false` and
   `theme="none"` must be passed, or you get an opaque white block and
   invisible tokens in dark mode.
4. **Sheet Primary `#6366F1` is ~4.36:1 on paper** — fine for large/UI and
   CTAs with white on-pop (~4.47:1); do not rely on it for small body links
   without weight/size. Status sheet fills are bright — text roles use
   darkened AA companions (see globals comments).
5. **Sequence method names differ per language** (`get_min` / `getMin`) —
   declare them in `methods`. Never auto-convert casing; that is guessing.
6. **A `null` expected value in an op means "do not assert"**, not "must
   return null". A `pop()` returning the popped value is correct.
7. **The markdown `a` override must preserve rehype's `anchor-link` class**,
   or every heading renders as a coloured underlined link.
8. **Viz line references drift.** Verify them programmatically against the
   snippet — this has bitten twice.
9. **Reference solutions are data, not modules** — eslint-ignored on purpose.
10. **A list arg may be `{ values, pos }`** — `pos` is the index the tail
    links back to, `-1` for an open list. Cycle problems have no other
    encoding. `formatCall` renders it as the list plus where the tail lands,
    because the learner receives a list and never sees the object.
11. **Sequence ops are named per language via `methods`** and the reference
    test applies the same mapping the browser does — so a wrong map fails
    CI rather than only breaking Python at runtime.
12. **A `node` argument must resolve out of the tree the learner is handed.**
    Binary Tree LCA compares by identity (`root is p`); resolving against a
    fresh node with the same value passes the BST version and fails only the
    general one, which is a nasty way to find out.
13. **Clone Graph cannot be graded by equality** — a returned original
    serialises exactly like a correct copy. The runners report `aliased`;
    the main thread turns it into a failure.
14. **The content test and `parseSpec` are two validators and WILL drift.**
    Property cases carry no `expect`; they passed every content check and
    were rejected by the parser, rendering "Invalid sandbox block" on a page
    CI called green. A test now runs the real `parseSpec` over every fence.

---

## The sandbox programme is finished

All 116 problem lessons have a sandbox. `sandbox-backlog.json` is deleted and
the coverage test is a hard gate: a new problem lesson without a sandbox
fails CI. **There are no permitted exclusions** — if a new problem does not
fit, extend the runner.

### What the runner can express

| Need | Mechanism |
| --- | --- |
| Linked list / tree argument or result | `shape` / `returns`: `list`, `tree` |
| A list whose tail points back | `{ values, pos }` as a `list` argument |
| k linked lists | `shape: "list[]"` (argument only) |
| A specific node of a tree | `shape: "node"` (argument only) |
| Graph of real `Node`s | `shape`/`returns`: `graph`, 1-indexed adjacency list |
| Class with a script of calls | `check: "sequence"` + `class` + `methods` |
| encode/decode pair | `check: "roundtrip"` + `roundtrip: [enc, dec]` |
| Order-independent answers | `compare: "sorted"` / `"set-of-sets"` |
| Several answers all correct | `property: "<name>"` |

**Two rules govern where logic lives.** Workers report raw outcomes and never
decide pass/fail, so `compare` and `property` run once on the main thread
rather than twice per runtime. Anything that must *observe* the objects —
whether a returned graph reuses input nodes — is reported by the worker as a
raw fact (`aliased`) and judged on the main thread.

### Adding a property

`web/src/lib/sandbox/properties.ts` holds them, one function of
`(result, args) => string | null`, returning the learner-facing reason it
failed. Register the name and both the content test and `parseSpec` accept
it. Use one only when the problem statement itself says several answers are
correct — otherwise pin the value.

### The authoring recipe

1. Read the lesson. Cases must cover the constraints it states — the worked
   examples, stated boundaries (empty, single, "k can exceed n"), the
   degenerate case, and the mistake its hints warn about. Minimum five.
2. Write `web/tests/reference/<module>/<lesson>.py` and `.js`.
3. Add the ` ```sandbox ` fence to "Attempt it first".
   **Never hand-write an expected value** — derive it by running the
   reference, then let the test prove it.
4. `npm test` — the suite proves both runtimes agree, and that the starter
   still fails. Then sabotage a reference and watch it go red.
5. Commit.

A derivation helper is worth rebuilding in a scratchpad each session: load
`public/sandbox/structures.js` + `run-cases.js` behind a `self` shim, compile
the checked-in `.js` reference, and print `runCases` outcomes. That is how
expectations get derived without hand-writing one.

---

## Blocked — needs the owner, do not decide unilaterally

**Visualisation triage.** Which of the 191 lessons deserve a visual is an
editorial judgment about the course. The spec assigns it to the author.
Forcing diagrams to raise a coverage number would satisfy the metric and
violate the course standard.

Once triaged, the plan is reuse-first: 25 lessons currently carry a visual
from 16 components, only 7 used more than once. `write-pointer` would serve
Move Zeroes and Remove Duplicates unchanged. Build ~12 parameterised tracers
(tree traversal, graph frontier, heap sift, DP table fill, interval sweep,
backtracking tree…), each serving 5–10 lessons via props, before writing any
bespoke ones.

**Also outstanding from an earlier review:** the module page has ~two-thirds
dead vertical space; analytics is deliberately unbuilt (it ships user data to
a third party — the owner's call); the mobile sandbox is layout-verified but
never tested against a real touch keyboard.

---

## Follow-up — Practice chapter briefs

v1 shipped auto-list Practice chapters for all 21 problem-bearing modules
and a gold-template chapter for `arrays`. Fill the remaining modules to the
same standard (playbook + `practice-problems` fence with pattern /
difficulty / watch_for for every problem). No IA changes required — same
renderer.

Remaining modules:

- strings, hash-tables, linked-lists, stacks, queues
- two-pointers, sliding-window, prefix-sum, binary-search, sorting, matrix
- recursion-backtracking, binary-trees, bst, heaps, tries
- intervals, greedy, graphs, dynamic-programming

---

## Shipped — Practice cheatsheets (2026-07-31, enhanced same day)

Every Practice chapter renders a **Cheatsheet** above the Problems list:
module glyph header, smell→pattern cues, tone-coded pattern cards with SVG
diagrams, complexity strip, and traps. Spec/plan:

- `docs/superpowers/specs/2026-07-31-practice-cheatsheets-design.md`
- `docs/superpowers/plans/2026-07-31-practice-cheatsheets.md`

**Architecture:** typed registry at `web/src/lib/course/cheatsheets/` (not a
markdown fence). Renderer: `web/src/components/cheatsheet/`. CI gate:
`web/tests/cheatsheets.test.ts` fails if any practice module lacks a sheet.

| Tier | Modules |
| --- | --- |
| Gold (9) | arrays, strings, hash-tables, two-pointers, sliding-window, **linked-lists, stacks, binary-search, graphs** |
| Template (12) | queues, prefix-sum, sorting, matrix, recursion-backtracking, binary-trees, bst, heaps, tries, intervals, greedy, dynamic-programming |

**v1.1 enhancements:** promoted 4 modules to gold; new diagrams
`fast-slow-list` + `union-find`; SVG marker-id collision fixed; template
sheets enriched (card smells, ≥2 traps); DP near-gold; stronger CI depth
gates (gold variety, every DiagramId used).

**Follow-up:** promote DP, heaps, binary-trees, intervals, recursion next.
Optional: thin markdown prose overlay under the registry header.

---

## Verification — all four must pass

```bash
cd web
npx tsc --noEmit      # 0
npx eslint src tests  # 0
npm test              # 371 passing
npm run build         # 0, 220 static pages
```

CI (`.github/workflows/ci.yml`) runs lint → test → build, and installs
Python because the reference tests execute both runtimes.

**When a suite passes first try, prove it can fail.** Sabotage checks that
must fail: corrupt an expectation, break a reference, delete a reference,
make the starter pass. Restore after each.
