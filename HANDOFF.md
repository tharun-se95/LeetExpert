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
| Problem lessons with a sandbox | **110** | 116 |
| Backlog (`web/tests/sandbox-backlog.json`) | **6** | 0, then delete the file |
| Lessons with a visual | **25** | triaged set (est. 100–120) |
| Tests | 347, all green | grows with each batch |

**Done:** the Riso design system; the sandbox runner for every problem shape
the authored lessons need, including cyclic lists; the reference-solution
pipeline with CI gate; search; content tests; icons.

**Not done:** the last 6 sandboxes, every one of them blocked on a runner
capability (below) — there is no mechanical authoring left — and the entire
visualisation programme (needs a decision from the owner — see below).

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
  "shape":  { "0": "list|tree|graph|node" }, // arg index -> what to build
  "returns":"value|list|tree|graph",      // `node` is argument-only
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

---

## Next task: the last 6 sandboxes, each blocked on runner work

**There is no mechanical authoring left.** 110 of 116 problem lessons carry a
sandbox; the six below each need a runner capability that does not exist yet.
Build one capability at a time, all the way (both runtimes, content test,
browser), and author its lessons in the same batch.

The authoring recipe, once a capability exists:

1. Read the lesson. Cases must cover the constraints it states — the worked
   examples, stated boundaries (empty, single, "k can exceed n"), the
   degenerate case, and the mistake its hints warn about. Minimum five.
2. Write `web/tests/reference/<module>/<lesson>.py` and `.js`.
3. Add the ` ```sandbox ` fence to "Attempt it first".
   **Never hand-write an expected value** — derive it by running the
   reference, then let the test prove it.
4. Remove the entry from `web/tests/sandbox-backlog.json`.
5. `npm test` — the suite proves both runtimes agree, and that the starter
   still fails. Then sabotage a reference and watch it go red.
6. Commit.

**When the backlog hits zero: delete the file and convert the coverage test
into a hard gate.** It is migration scaffolding with a stated end (Rule 1).

A derivation helper is worth rebuilding in a scratchpad each session: load
`public/sandbox/structures.js` + `run-cases.js` behind a `self` shim, compile
the checked-in `.js` reference, and print `runCases` outcomes. That is how
expectations get derived without hand-writing one.

### The runner does not yet express these four things

The `node` shape (below, item 0) has since been built and both LCA lessons
are authored — it is the worked example of what "build the capability" looks
like: decode in `structures.js` AND the Python DRIVER, widen `ArgShape`,
widen the content test, prove it with a sabotage, verify in the browser.

0. ~~**Arguments that are node references.**~~ **Done.** `shape: "node"` takes
   a plain value and hands the learner the node carrying it, resolved out of
   the tree built for the `tree` argument. It must be the same tree object:
   Binary Tree LCA compares `root is p` by identity, so resolving against a
   copy passes the BST version and silently fails the general one. There is a
   sabotage for exactly this.
1. **Answers that are correct in more than one form** — 3 lessons.
   `bst/delete-node-in-a-bst` (promote the inorder successor *or*
   predecessor), `bst/convert-sorted-array-to-bst` (any height-balanced BST
   whose inorder is `nums`), and `graphs/course-schedule-ii` (any valid
   topological order) all say so in their own problem statements. Pinning one
   answer fails a correct learner, which is worse than no test. Needs a check
   mode where the expectation is a **property** — "is a BST, inorder ==
   nums, heights differ by ≤ 1"; "every prerequisite precedes its course" —
   not a value. `compare` cannot express this: it is a new `check`, and the
   property has to run in both runtimes.
2. **A list of linked lists** — 1 lesson. `heaps/merge-k-sorted-lists` takes
   `list[ListNode]`. `shape` maps one argument to one structure; this needs
   an element-wise form (`"list[]"`).
3. **Graphs are a pass-through, not a structure** — 1 lesson. `decodeArg`
   returns the adjacency list unchanged, so a learner would receive a raw
   array where `graphs/clone-graph` hands them a `Node`. The shape is
   accepted by the content test and implemented by nobody; no authored lesson
   uses it, which is why this was never caught — the five graph problems that
   ARE authored take plain edge lists. Clone Graph additionally has to prove
   the result is a *copy*: serialising equal is not enough, since
   `return node` would pass. Compare node identity against the input.
4. **A round trip, not a call** — 1 lesson.
   `binary-trees/serialize-and-deserialize-binary-tree` is a `Codec` whose
   `serialize` output is implementation-defined; the only honest assertion is
   that `deserialize(serialize(root))` equals `root`. `sequence` mode cannot
   feed one op's result into the next.

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
npm test              # 347 passing
npm run build         # 0, 220 static pages
```

CI (`.github/workflows/ci.yml`) runs lint → test → build, and installs
Python because the reference tests execute both runtimes.

**When a suite passes first try, prove it can fail.** Sabotage checks that
must fail: corrupt an expectation, break a reference, delete a reference,
make the starter pass. Restore after each.
