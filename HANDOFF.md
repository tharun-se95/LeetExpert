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
| Problem lessons with a sandbox | **31** | 116 |
| Backlog (`web/tests/sandbox-backlog.json`) | **85** | 0, then delete the file |
| Lessons with a visual | **25** | triaged set (est. 100–120) |
| Tests | 103, all green | grows with each batch |

**Done:** the Riso design system; the sandbox runner including every problem
shape; the reference-solution pipeline with CI gate; search; content tests;
icons.

**Not done:** authoring the remaining 85 sandboxes (mechanical), and the
entire visualisation programme (needs a decision from the owner — see below).

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
  "check":  "return|mutate|prefix|sequence",
  "compare":"exact|sorted|set-of-sets",   // order-independent answers
  "shape":  { "0": "list|tree|graph" },   // arg index -> structure to build
  "returns":"value|list|tree|graph",
  "arg":    0,                            // which arg mutate/prefix inspects
  "class":  { ... },                      // sequence mode only
  "methods":{ "getMin": { "python": "get_min", "javascript": "getMin" } },
  "cases":  [ { "args": [...], "expect": ... } ]
}
```

`sequence` cases use `construct` + `ops: [[method, args, expected]]` instead
of `args`/`expect`.

### Design tokens

Two tiers in `web/src/app/globals.css`: raw inks (`--riso-*`) then semantic
names (`--background`, `--accent`, `--pop`, `--good`…). **Only tier 1 is
redefined for dark mode**; tier 2 resolves at use time and follows. 48 files
consume the semantic names, so a palette change is one edit.

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
4. **Lime cannot be text on the paper** — 1.30:1. `--pop` is fills only;
   `--accent` (olive) carries coloured text. Dark mode collapses the split.
5. **Sequence method names differ per language** (`get_min` / `getMin`) —
   declare them in `methods`. Never auto-convert casing; that is guessing.
6. **A `null` expected value in an op means "do not assert"**, not "must
   return null". A `pop()` returning the popped value is correct.
7. **The markdown `a` override must preserve rehype's `anchor-link` class**,
   or every heading renders as a coloured underlined link.
8. **Viz line references drift.** Verify them programmatically against the
   snippet — this has bitten twice.
9. **Reference solutions are data, not modules** — eslint-ignored on purpose.

---

## Next task: author the remaining 85 sandboxes

Mechanical and safe now. Work **one module per batch**, commit per batch.

Recipe:

1. Read the lesson. Cases must cover the constraints it states — the worked
   examples, stated boundaries (empty, single, "k can exceed n"), the
   degenerate case, and the mistake its hints warn about. Minimum five.
2. Write `web/tests/reference/<module>/<lesson>.py` and `.js`.
3. Add the ` ```sandbox ` fence to "Attempt it first".
   **Never hand-write an expected value** — derive it by running the
   reference, then let the test prove it.
4. Remove the entry from `web/tests/sandbox-backlog.json`.
5. `npm test` — the suite proves both runtimes agree, and that the starter
   still fails.
6. Commit.

Backlog by module (structural ones need `shape`, already supported):

```
dynamic-programming 10   binary-trees 7*   graphs 7*   bst 6*   heaps 6*
matrix 6   recursion-backtracking 6   greedy 5   intervals 5
prefix-sum 5   sliding-window 5   sorting 5   queues 4   tries 4*
linked-lists 2*   binary-search 1   hash-tables 1
```

**When the backlog hits zero: delete the file and convert the coverage test
into a hard gate.** It is migration scaffolding with a stated end (Rule 1).

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

## Verification — all four must pass

```bash
cd web
npx tsc --noEmit      # 0
npx eslint src tests  # 0
npm test              # 103 passing
npm run build         # 0, 220 static pages
```

CI (`.github/workflows/ci.yml`) runs lint → test → build, and installs
Python because the reference tests execute both runtimes.

**When a suite passes first try, prove it can fail.** Sabotage checks that
must fail: corrupt an expectation, break a reference, delete a reference,
make the starter pass. Restore after each.
