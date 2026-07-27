# In-Lesson Code Sandbox

**Date:** 2026-07-25
**Scope:** Runtime, harness, editor, and a 5-problem pilot.

## Problem

Every one of the 116 problem lessons opens with "Attempt it first" — prose
and reveal-gated hints, with nowhere to actually write code. A reader who
wants to try has to leave the site. The mastery-first premise of the course
wants the opposite: attempt, get told whether you're right, and only then
unfold the solution.

## Approach

A ` ```sandbox ` markdown fence that renders an editor, a Run button, and a
pass/fail result per test case. Everything executes in the reader's own
browser.

### Execution

Two Web Workers, served as real files from `public/sandbox/`. Not Blob
URLs — those require `worker-src blob:` and would break under a strict CSP
later.

A worker is used for two reasons: it has no DOM access, and it can be
**terminated**. Termination is the only reliable way to stop a `while
(true)`. The main thread arms a timer (default 3000 ms) before posting
work; on expiry it terminates the worker and reports a timeout.

- **JavaScript** runs in the browser's own engine. No download.
- **Python** runs under Pyodide in its own worker. `pyodide` becomes a
  dependency; a `prebuild`/`predev` script copies its dist into
  `public/pyodide/`, which is gitignored. The runtime is fetched only when
  a reader first selects Python.

### Security posture

This executes the reader's own code, in the reader's own browser. Nothing
is persisted server-side and nothing is shared between readers, so there
is no stored-XSS and no multi-tenant surface. Isolation here contains
*mistakes* — infinite loops, exceptions, runaway memory — rather than
defending against an attacker. That is why the runtime is client-side and
a server executor is out of scope.

### Test contract

Three distinct problem shapes exist in the course, and a single `expect`
field cannot express them:

| Shape | Example | `check` |
| --- | --- | --- |
| Returns a value | Best Time to Buy & Sell Stock | `return` (default) |
| Mutates in place, returns nothing | Move Zeroes | `mutate` |
| Mutates in place *and* returns a length | Remove Duplicates | `prefix` |

`prefix` exists because Remove Duplicates defines only `nums[0..k)`;
everything past `k` is explicitly garbage, so comparing the whole array
would fail correct solutions. Under `prefix` the harness calls the
function, takes the returned `k`, and compares `args[arg][:k]`.

Three named modes, no expression language.

Fence body:

```json
{
  "fn": { "python": "move_zeroes", "typescript": "moveZeroes" },
  "check": "mutate",
  "arg": 0,
  "timeoutMs": 3000,
  "starter": { "python": "...", "typescript": "..." },
  "cases": [{ "args": [[0, 1, 0, 3, 12]], "expect": [1, 3, 12, 0, 0] }]
}
```

Cases live inline, matching how `quiz`, `viz`, and `complexity` already
work in this repo. Comparison is canonical JSON with sorted object keys.

### Editor

A `<textarea>` over a Shiki-highlighted `<pre>`, reusing the highlighter
already in the project rather than adding CodeMirror for a v1. Tab inserts
spaces instead of moving focus. Drafts persist to `localStorage` keyed by
problem id, so navigation does not discard work.

CodeMirror is the upgrade path if this feels cramped; it swaps behind the
`CodeEditor` boundary without touching the runner or harness.

### Components

| Unit | Responsibility |
| --- | --- |
| `public/sandbox/js-runner.js` | Worker: build fn from source, run cases |
| `public/sandbox/py-runner.js` | Worker: same, under Pyodide |
| `lib/sandbox/compare.ts` | Canonical JSON equality |
| `components/sandbox/types.ts` | `SandboxSpec`, `CaseResult`, messages |
| `components/sandbox/useRunner.ts` | Worker lifecycle, timeout, messaging |
| `components/sandbox/CodeEditor.tsx` | Textarea + highlight overlay |
| `components/sandbox/Sandbox.tsx` | Language tabs, Run/Reset, results |

The runner knows nothing about the UI. The UI knows nothing about Pyodide.

## Pilot

Five problems chosen for shape coverage, not convenience:

1. Move Zeroes — `mutate`
2. Remove Duplicates from Sorted Array — `prefix`
3. Two Sum II — `return`, array result
4. Best Time to Buy & Sell Stock — `return`, scalar result
5. Valid Palindrome (strings) — `return`, boolean result, string input

## Limitation

Problems admitting multiple valid answers cannot be graded by equality.
Those get no sandbox rather than a harness that lies about correctness.

## Verification

- Correct solution passes every case, in both languages.
- Wrong solution fails with expected-vs-got shown.
- `while (true)` is killed by the timeout and reported as such.
- Syntax errors and runtime exceptions surface readable messages.
- Python path works after a cold load; JS path never waits on Pyodide.
- Draft survives navigating away and back.
