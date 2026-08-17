# Coach Thesis and Thread UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a pass, the coach stays on this lesson’s thesis instead of selling a faster algorithm, and the rail can display a Socratic nudge (bold, lists, inline code) without leaking a solution.

**Architecture:** Extract a server-only `thesis` from the Explanation tab (`## The insight` or the first blockquote) and put it in the existing coach corpus. Tighten the system prompt and the all-passed diagnosis CTA. Reject every code fence in `filterCoachReply`. Render assistant bubbles with a slim `CoachMarkdown` (not the lesson `Markdown` component) and keep suggestion chips after the first message, keyed off the last diagnosis.

**Tech Stack:** TypeScript strict, Vitest, remark-parse + remark-gfm (already in `extractHints`), react-markdown + remark-gfm (already in the app), Next.js client components, handbook tokens in `globals.css`.

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts to silence the compiler. The one existing pattern — `unified().use().parse() as Root` in `extractHints.ts` — is the only allowed AST cast.
- Comments explain why, never what.
- All colour goes through tokens. No Tailwind palette classes (`emerald-500`, `zinc-400`, `prose`).
- `CoachProblem` has no `solution` field. Solution tab, quiz answers, and `web/tests/reference/**` never enter the prompt or corpus.
- Client receives hint **labels** only. Thesis and hint bodies stay server-side.
- Do not import `web/src/components/md/Markdown.tsx` into the coach rail (Mermaid / Quiz / Viz).
- Accessibility: real `aria-label`s, visible focus (`focus-visible:ring-2 focus-visible:ring-accent`), `prefers-reduced-motion` on the pending bubble.
- Do not edit the plan file’s meaning while implementing. Do not commit unless the user asks (this session’s user rule). When a later agent is told to commit, use the commit step in each task.
- Verify by running the command. A green typecheck is not evidence the rail works — Task 7 includes a browser pass on Find the Index.

**Spec:** `docs/superpowers/specs/2026-08-17-coach-thesis-and-thread-ui-design.md`

---

## File map

| File                                         | Responsibility                                                       |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `web/src/lib/coach/extractThesis.ts`         | Pure extraction of the lesson thesis from an Explanation slice       |
| `web/src/lib/coach/types.ts`                 | `CoachProblem.thesis`                                                |
| `web/src/lib/coach/buildCorpus.ts`           | Write `thesis` into the generated corpus                             |
| `web/src/lib/coach/prompt.ts`                | Thesis block + stay-on-lesson / no-LaTeX / clarify-short-reply rules |
| `web/src/lib/coach/diagnose.ts`              | All-passed CTA without “variant”                                     |
| `web/src/lib/coach/filter.ts`                | Reject any ` ``` ` fence                                             |
| `web/src/lib/coach/suggestions.ts`           | Chip copy for empty / passed / failed                                |
| `web/src/components/coach/CoachMarkdown.tsx` | Safe GFM subset for assistant bubbles                                |
| `web/src/components/coach/CoachThread.tsx`   | Markdown bubbles, persistent chips, pending line                     |
| `web/tests/coach-thesis.test.ts`             | Extraction + leak pins                                               |
| `web/tests/coach-suggestions.test.ts`        | Chip table                                                           |
| Existing coach tests                         | Prompt, corpus, diagnose, filter contracts                           |

Do not touch `web/src/components/md/Markdown.tsx`, sandbox runners, or course lesson bodies in this plan.

---

### Task 1: extractThesis

**Files:**

- Create: `web/src/lib/coach/extractThesis.ts`
- Test: `web/tests/coach-thesis.test.ts`
- Modify: `web/tests/coach-extract.test.ts` only if a shared fixture is needed — prefer keeping extraction tests in `coach-thesis.test.ts`

**Interfaces:**

- Consumes: Explanation markdown string (same slice `extractHints` already receives)
- Produces: `extractThesis(explanation: string): string`

- [ ] **Step 1: Write the failing tests**

Create `web/tests/coach-thesis.test.ts`:

`````typescript
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";
import { splitProblemTabs } from "../src/lib/content/splitProblemTabs";
import { extractThesis } from "../src/lib/coach/extractThesis";

const COURSE = join(__dirname, "..", "..", "course");

function explanationOf(rel: string): string {
  const raw = readFileSync(join(COURSE, rel), "utf8").replace(/\r\n/g, "\n");
  const { content } = matter(raw);
  const split = extractSandboxFence(content.trim());
  if (!split) throw new Error(`no sandbox in ${rel}`);
  return splitProblemTabs(split.afterSandbox).explanation;
}

describe("extractThesis", () => {
  it("reads Find the Index insight and stays on the constraint thesis", () => {
    const thesis = extractThesis(explanationOf("strings/find-the-index.md"));
    expect(thesis).toMatch(/correct move at these constraints/i);
    expect(thesis).not.toMatch(/^## Solution\b/m);
    expect(thesis).not.toMatch(/def str_str|function strStr/);
    expect(thesis).not.toMatch(/```viz/);
  });

  it("returns empty when the explanation is only hints", () => {
    expect(
      extractThesis(explanationOf("linked-lists/reverse-linked-list.md")),
    ).toBe("");
  });

  it("takes the first blockquote when there is no The insight heading", () => {
    const explanation = [
      "Some setup.",
      "",
      "> The move is a single pass with a seen set.",
      "",
      "````reveal Hint 1 — look once",
      "Store what you have seen.",
      "````",
    ].join("\n");
    expect(extractThesis(explanation)).toContain("single pass with a seen set");
  });

  it("stops before a viz fence and ignores Solution text below", () => {
    const explanation = [
      "## The insight",
      "",
      "> Stay with the O(n) pass at these constraints.",
      "",
      "```viz",
      '{ "id": "substring-search" }',
      "```",
      "",
      "## Solution",
      "",
      "def str_str(haystack, needle):",
      "    return 0",
    ].join("\n");
    const thesis = extractThesis(explanation);
    expect(thesis).toContain("O(n) pass");
    expect(thesis).not.toContain("def str_str");
    expect(thesis).not.toContain("substring-search");
  });
});
`````

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run tests/coach-thesis.test.ts`

Expected: FAIL with `Cannot find module '../src/lib/coach/extractThesis'`

- [ ] **Step 3: Implement extractThesis**

Create `web/src/lib/coach/extractThesis.ts`:

```typescript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Heading, Root, RootContent } from "mdast";

function phrasingText(node: {
  type: string;
  value?: string;
  children?: unknown[];
}): string {
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children
    .map((child) =>
      phrasingText(
        child as { type: string; value?: string; children?: unknown[] },
      ),
    )
    .join("");
}

function headingText(node: Heading): string {
  return phrasingText(node).trim();
}

function sliceNode(source: string, node: RootContent): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  if (start === undefined || end === undefined) return "";
  return source.slice(start, end);
}

/**
 * Lesson thesis from an Explanation slice — never the Solution tab.
 * Heading first (most problems), then the first blockquote, else empty.
 */
export function extractThesis(explanation: string): string {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(explanation) as Root;
  const nodes = tree.children;

  const insightAt = nodes.findIndex(
    (node) =>
      node.type === "heading" && /^the insight$/i.test(headingText(node)),
  );

  if (insightAt >= 0) {
    const parts: string[] = [];
    for (const node of nodes.slice(insightAt + 1)) {
      if (node.type === "heading" || node.type === "code") break;
      const slice = sliceNode(explanation, node);
      if (slice) parts.push(slice);
    }
    return parts.join("\n\n").trim();
  }

  const quote = nodes.find((node) => node.type === "blockquote");
  return quote ? sliceNode(explanation, quote).trim() : "";
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run tests/coach-thesis.test.ts`

Expected: PASS, 4 tests

- [ ] **Step 5: Commit (only if the user asked to commit)**

```bash
git add web/src/lib/coach/extractThesis.ts web/tests/coach-thesis.test.ts
git commit -m "feat(coach): extract the lesson thesis from Explanation"
```

---

### Task 2: Corpus thesis field

**Files:**

- Modify: `web/src/lib/coach/types.ts`
- Modify: `web/src/lib/coach/buildCorpus.ts`
- Modify: `web/tests/coach-corpus.test.ts`
- Regenerated: `web/src/lib/coach/corpus.generated.json` (via the existing build script)

**Interfaces:**

- Consumes: `extractThesis(explanation: string): string`
- Produces: `CoachProblem.thesis: string` on every corpus entry

- [ ] **Step 1: Extend the corpus leak tests**

In `web/tests/coach-corpus.test.ts`, add assertions inside the existing `"covers every problem sandbox id"` test:

```typescript
expect(typeof corpus["two-sum"].thesis).toBe("string");
expect(corpus["find-the-index"].thesis).toMatch(
  /correct move at these constraints/i,
);
```

And extend `"never includes the Solution tab or a Solution reveal body"` so each problem’s `thesis` is scanned:

```typescript
if (/^## Solution\b/m.test(problem.thesis)) {
  leaked.push(`${id} thesis has ## Solution`);
}
if (
  new RegExp(
    String.raw`(?:def|function)\s+${problem.fn.python}|function\s+${problem.fn.javascript}`,
    "i",
  ).test(problem.thesis)
) {
  leaked.push(`${id} thesis defines the sandbox fn`);
}
```

Use the same `leaked` array already in that test. Keep the generated-JSON equality test as-is — it will fail until the JSON is rebuilt, which is the intended red.

- [ ] **Step 2: Run corpus tests and confirm they fail**

Run: `npx vitest run tests/coach-corpus.test.ts`

Expected: FAIL — `thesis` is undefined on `two-sum` / generated JSON mismatch

- [ ] **Step 3: Add the field and write it**

In `web/src/lib/coach/types.ts`, add `thesis: string` to `CoachProblem` (after `statement`, before `hints`):

```typescript
export interface CoachProblem {
  sandboxId: string;
  title: string;
  moduleSlug: string;
  statement: string;
  /** Explanation insight only. Empty when the lesson has no insight block. */
  thesis: string;
  hints: CoachHint[];
  fn: { python: string; javascript: string };
}
```

In `web/src/lib/coach/buildCorpus.ts`, import `extractThesis` and set:

```typescript
corpus[spec.id] = {
  sandboxId: spec.id,
  title: typeof data.title === "string" ? data.title : spec.id,
  moduleSlug,
  statement: split.beforeSandbox.trim(),
  thesis: extractThesis(explanation),
  hints: extractHints(explanation),
  fn: { python: spec.fn.python, javascript: spec.fn.javascript },
};
```

Regenerate:

```bash
node scripts/build-coach-corpus.mjs
```

from `web/`.

- [ ] **Step 4: Re-run corpus tests**

Run: `npx vitest run tests/coach-corpus.test.ts tests/coach-thesis.test.ts`

Expected: PASS. 116 ids. `find-the-index` thesis pin holds. Generated JSON equals `buildCorpus()`.

- [ ] **Step 5: Commit (only if asked)**

```bash
git add web/src/lib/coach/types.ts web/src/lib/coach/buildCorpus.ts web/src/lib/coach/corpus.generated.json web/tests/coach-corpus.test.ts
git commit -m "feat(coach): put the lesson thesis in the server corpus"
```

---

### Task 3: Prompt stays on the thesis

**Files:**

- Modify: `web/src/lib/coach/prompt.ts`
- Modify: `web/tests/coach-prompt.test.ts`

**Interfaces:**

- Consumes: `CoachProblem.thesis`
- Produces: system string that includes the thesis block and the new rules

- [ ] **Step 1: Write the failing prompt contract**

Add to `web/tests/coach-prompt.test.ts` (the existing `problem` fixture must gain `thesis: "Naive is the correct move at these constraints."`):

```typescript
it("packs the thesis and forbids assigning a faster algorithm after a pass", () => {
  const packed = buildModelMessages(problem, request);
  expect(packed.system).toContain(
    "Naive is the correct move at these constraints.",
  );
  expect(packed.system).toMatch(/plain text/i);
  expect(packed.system).toMatch(/LaTeX/i);
  expect(packed.system).toMatch(/ambiguous/i);
  expect(packed.system).toMatch(/do not assign a faster/i);
  expect(packed.system).not.toContain("return [0, 1]");
});
```

The existing “no solution field” test must still pass with `thesis` present.

- [ ] **Step 2: Run prompt tests and confirm the new one fails**

Run: `npx vitest run tests/coach-prompt.test.ts`

Expected: FAIL — system string missing “do not assign a faster” / thesis line

- [ ] **Step 3: Update the prompt**

Replace `buildSystemPrompt` with:

```typescript
export function buildSystemPrompt(fn: {
  python: string;
  javascript: string;
}): string {
  return [
    "You are a Socratic DSA coach for this one problem.",
    "Ask a question or point at the next authored hint.",
    `Never implement ${fn.python} or ${fn.javascript}.`,
    "Never paste a full algorithm, pseudocode that is the algorithm, or a code fence.",
    "Write math and identifiers in plain text (O(n*m), n and m). Never LaTeX.",
    "If asked for the solution, refuse and ask a smaller question.",
    "Use the diagnosis facts; do not invent case outputs.",
    "If the last user message is short or ambiguous (yes, no, idk, ok), ask which meaning they meant before teaching further.",
    "After they pass, stay on this lesson's thesis. Do not assign a faster or different algorithm unless they clearly insist. Naming one as later reading is allowed; walking them through it is not.",
    "Do not dump authored hint bodies verbatim unless the learner already opened that hint.",
  ].join(" ");
}
```

In `buildModelMessages`, after the statement and before the hints block, insert:

```typescript
"Lesson thesis (after they pass, stay here; if empty, use Attempt it first and the constraints):",
problem.thesis || "(none)",
"",
```

Keep hint packing and the rest of the context unchanged.

- [ ] **Step 4: Re-run prompt tests**

Run: `npx vitest run tests/coach-prompt.test.ts`

Expected: PASS

- [ ] **Step 5: Commit (only if asked)**

```bash
git add web/src/lib/coach/prompt.ts web/tests/coach-prompt.test.ts
git commit -m "feat(coach): keep post-pass chat on the lesson thesis"
```

---

### Task 4: Diagnosis CTA and fence filter

**Files:**

- Modify: `web/src/lib/coach/diagnose.ts`
- Modify: `web/tests/coach-diagnose.test.ts`
- Modify: `web/src/lib/coach/filter.ts`
- Modify: `web/tests/coach-filter.test.ts`

**Interfaces:**

- Consumes: existing `diagnose` / `filterCoachReply` signatures (unchanged)
- Produces: new all-passed sentence; any triple-backtick is `COACH_REFUSE`

- [ ] **Step 1: Write the failing assertions**

In the existing `"reports all cases passed"` test in `web/tests/coach-diagnose.test.ts`, add:

```typescript
expect(d.prose).toBe(
  "All 1 cases passed. Ask about this lesson’s bound or what to take from it — I still will not write the code.",
);
expect(d.prose).not.toMatch(/variant/i);
```

Use a typographic apostrophe in `lesson’s` only if `diagnose.ts` uses that same character. Prefer ASCII `lesson's` in both files to avoid a silent mismatch:

```typescript
expect(d.prose).toBe(
  "All 1 cases passed. Ask about this lesson's bound or what to take from it — I still will not write the code.",
);
```

In `web/tests/coach-filter.test.ts`, add:

````typescript
it("rejects any fenced block, not only language-tagged ones", () => {
  const reply =
    "Count the alignments.\n\n```\nfor i in range(n):\n    pass\n```";
  expect(
    filterCoachReply(reply, { python: "two_sum", javascript: "twoSum" }),
  ).toBe(COACH_REFUSE);
});
````

- [ ] **Step 2: Run the two files and confirm they fail**

Run: `npx vitest run tests/coach-diagnose.test.ts tests/coach-filter.test.ts`

Expected: FAIL on the new all-passed string and the bare-fence case (bare fence currently allowed)

- [ ] **Step 3: Implement**

In `diagnose.ts`, all-passed `prose`:

```typescript
prose: `All ${results.length} cases passed. Ask about this lesson's bound or what to take from it — I still will not write the code.`,
```

In `filter.ts`:

````typescript
const FENCE = /```/;
````

Keep the `fnDefinition` checks. Do not change `COACH_REFUSE`.

- [ ] **Step 4: Re-run**

Run: `npx vitest run tests/coach-diagnose.test.ts tests/coach-filter.test.ts`

Expected: PASS

- [ ] **Step 5: Commit (only if asked)**

```bash
git add web/src/lib/coach/diagnose.ts web/src/lib/coach/filter.ts web/tests/coach-diagnose.test.ts web/tests/coach-filter.test.ts
git commit -m "fix(coach): stop priming variants and reject every code fence"
```

---

### Task 5: Persistent suggestion chips

**Files:**

- Create: `web/src/lib/coach/suggestions.ts`
- Test: `web/tests/coach-suggestions.test.ts`
- Modify: `web/src/components/coach/CoachThread.tsx` (wiring in Task 6; this task is the pure helper)

**Interfaces:**

- Consumes: `{ hasChat: boolean; diagnosis: Diagnosis | null }`
- Produces: `coachSuggestions(input): string[]`

- [ ] **Step 1: Write the failing table**

Create `web/tests/coach-suggestions.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { coachSuggestions } from "../src/lib/coach/suggestions";
import type { Diagnosis } from "../src/lib/coach/types";

const passed: Diagnosis = {
  status: "all-passed",
  kind: "all-passed",
  firstFailIndex: null,
  caseName: null,
  got: null,
  expected: null,
  error: null,
  passed: 5,
  total: 5,
  prose: "All 5 cases passed.",
  nextHintIndex: null,
};

const failed: Diagnosis = {
  ...passed,
  status: "failed",
  kind: "wrong-value",
  firstFailIndex: 0,
  caseName: "str_str",
  passed: 2,
  prose: "str_str returned -1; expected 0.",
};

describe("coachSuggestions", () => {
  it("keeps the empty-state chips before any chat", () => {
    expect(coachSuggestions({ hasChat: false, diagnosis: null })).toEqual([
      "What pattern is this?",
      "Why did that case fail?",
      "What’s the next hint without spoiling it?",
    ]);
  });

  it("after a pass, asks about the bound — not a variant algorithm", () => {
    const chips = coachSuggestions({ hasChat: true, diagnosis: passed });
    expect(chips).toEqual([
      "What is the worst-case cost of what I wrote?",
      "Do I need a faster algorithm at these constraints?",
      "What should I take from this problem?",
    ]);
    expect(chips.join(" ")).not.toMatch(/variant/i);
  });

  it("after a fail, points at the case and the next hint", () => {
    expect(coachSuggestions({ hasChat: true, diagnosis: failed })).toEqual([
      "Why did that case fail?",
      "What’s the next hint without spoiling it?",
    ]);
  });
});
```

Match the apostrophe in `What’s` to the string already in `CoachThread.tsx` (`What’s the next hint without spoiling it?`).

- [ ] **Step 2: Run and confirm fail**

Run: `npx vitest run tests/coach-suggestions.test.ts`

Expected: FAIL — module not found

- [ ] **Step 3: Implement the helper**

Create `web/src/lib/coach/suggestions.ts`:

```typescript
import type { Diagnosis } from "./types";

const EMPTY = [
  "What pattern is this?",
  "Why did that case fail?",
  "What’s the next hint without spoiling it?",
];

const AFTER_PASS = [
  "What is the worst-case cost of what I wrote?",
  "Do I need a faster algorithm at these constraints?",
  "What should I take from this problem?",
];

const AFTER_FAIL = [
  "Why did that case fail?",
  "What’s the next hint without spoiling it?",
];

export function coachSuggestions(input: {
  hasChat: boolean;
  diagnosis: Diagnosis | null;
}): string[] {
  if (!input.hasChat) return EMPTY;
  if (input.diagnosis?.kind === "all-passed") return AFTER_PASS;
  if (input.diagnosis) return AFTER_FAIL;
  return [];
}
```

- [ ] **Step 4: Re-run**

Run: `npx vitest run tests/coach-suggestions.test.ts`

Expected: PASS, 3 tests

- [ ] **Step 5: Commit (only if asked)**

```bash
git add web/src/lib/coach/suggestions.ts web/tests/coach-suggestions.test.ts
git commit -m "feat(coach): keep suggestion chips after the first question"
```

---

### Task 6: Thread UI

**Files:**

- Create: `web/src/components/coach/CoachMarkdown.tsx`
- Modify: `web/src/components/coach/CoachThread.tsx`
- Modify: `web/src/components/coach/CoachComposer.tsx` only if the visible label reads “Ask the coach” — it must not; the `sr-only` label “Ask the coach” may stay. The textarea placeholder is already “Ask a question — I will not write the code.”

**Interfaces:**

- Consumes: `coachSuggestions`, `useCoach().diagnosis` / `pending` / `thread`
- Produces: assistant bubbles rendered through `CoachMarkdown`; chips after chat; pending bubble

- [ ] **Step 1: Add CoachMarkdown**

Create `web/src/components/coach/CoachMarkdown.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function safeHref(href: string | undefined): string | null {
  if (!href) return null;
  return /^https?:\/\//i.test(href) ? href : null;
}

export function CoachMarkdown({ source }: { source: string }) {
  return (
    <div className="text-sm text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_code]:rounded-sm [&_code]:bg-code [&_code]:px-1 [&_strong]:font-semibold">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <p>{children}</p>,
          h1: "p",
          h2: "p",
          h3: "p",
          h4: "p",
          img: () => null,
          a: ({ href, children }) => {
            const safe = safeHref(href);
            if (!safe) return <span>{children}</span>;
            return (
              <a
                href={safe}
                rel="noreferrer"
                className="text-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

export function flattenForTest(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return "";
}
```

Do **not** export `flattenForTest` unless a test needs it — delete that export if unused. Keep `safeHref` unexported.

No `prose` class. No palette colours.

- [ ] **Step 2: Wire CoachThread**

Replace the local `SUGGESTIONS` constant with `coachSuggestions`. Read `diagnosis` and `pending` from `useCoach()`.

Assistant items: wrap `item.content` in `CoachMarkdown` inside the existing assistant bubble (`mr-4 rounded-lg border border-border bg-info-surface …`). User items stay `{item.content}` text.

Show chips whenever `coachSuggestions({ hasChat, diagnosis }).length > 0`, not only when `!hasChat`.

When `pending` is true, append a bubble after the thread:

```tsx
{
  pending ? (
    <p
      className="mr-4 rounded-lg border border-border bg-info-surface px-3 py-2 text-sm text-muted"
      aria-live="polite"
    >
      Thinking…
    </p>
  ) : null;
}
```

No spinner animation. If you add a pulse class, gate it with `motion-reduce:animate-none`.

Chip buttons keep the existing classes (`min-h-11`, `focus-visible:ring-2 focus-visible:ring-accent`, disabled when `pending || configured === false`).

- [ ] **Step 3: Lint the new UI files**

Run from `web/`:

```bash
npx eslint src/components/coach/CoachMarkdown.tsx src/components/coach/CoachThread.tsx src/lib/coach/suggestions.ts
```

Expected: 0 errors. Fix `react-hooks/immutability` or unused exports if they appear. Do not disable the rule to keep a dead export.

- [ ] **Step 4: Typecheck the coach surface**

Run: `npx tsc --noEmit --pretty false`

Expected: no errors in the files this plan touched. Pre-existing `tests/coach-api.test.ts` `ProcessEnv` errors (if still present) are out of scope — do not “fix” them by widening types unless they block this work; if they do, add `NODE_ENV: "test"` to those fixture objects only.

- [ ] **Step 5: Commit (only if asked)**

```bash
git add web/src/components/coach/CoachMarkdown.tsx web/src/components/coach/CoachThread.tsx
git commit -m "feat(coach): render nudges as markdown and keep the chips"
```

---

### Task 7: Verify the live regression

**Files:** none new. This task is evidence, not more surface.

- [ ] **Step 1: Run the coach unit suite**

Run from `web/`:

```bash
npx vitest run tests/coach-thesis.test.ts tests/coach-corpus.test.ts tests/coach-prompt.test.ts tests/coach-diagnose.test.ts tests/coach-filter.test.ts tests/coach-suggestions.test.ts tests/coach-extract.test.ts tests/coach-api.test.ts
```

Expected: all listed files pass. If `coach-api` still fails on `ProcessEnv`, record that as pre-existing and continue.

- [ ] **Step 2: Sabotage the Find the Index pin, watch it fail, restore**

In `extractThesis` temporarily `return ""` for every input. Re-run `npx vitest run tests/coach-thesis.test.ts tests/coach-corpus.test.ts`. Expected: Find the Index pin fails. Restore the real function. Re-run. Expected: PASS.

- [ ] **Step 3: Browser pass on Find the Index**

With `npm run dev` (restart if `.env.local` or corpus changed):

1. Open `/problems/find-the-index` (or the course slug for that lesson). Both themes.
2. Run a correct naive `str_str`. Diagnosis must say “bound or what to take from it”, not “variant”.
3. Click “What is the worst-case cost of what I wrote?”
4. Confirm `**bold**` and lists render; `$N$` / `$M$` do not appear.
5. Reply `no`. The next turn must ask which “no”, not continue a KMP walkthrough.
6. If the model names KMP, it must be later reading, not an assignment. If it assigns KMP, that is a fail — tighten the prompt sentence, add the failing phrase to `coach-prompt.test.ts`, and re-check.
7. Desktop rail and mobile Coach tab. Keyboard: chips and composer show a visible focus ring. `prefers-reduced-motion`: pending bubble does not pulse.

- [ ] **Step 4: Update HANDOFF.md**

Under the Problem Coach note, add two lines: thesis is in the corpus; post-pass CTA no longer says “variant”; thread renders a GFM subset. Do not rewrite the whole handoff.

- [ ] **Step 5: Commit (only if asked)**

```bash
git add HANDOFF.md
git commit -m "docs: note coach thesis and thread UI"
```

---

## Self-review

**Spec coverage**

| Spec requirement                                                                | Task          |
| ------------------------------------------------------------------------------- | ------------- |
| `extractThesis` heading / blockquote / empty                                    | 1             |
| `CoachProblem.thesis` + leak pins + Find the Index pin                          | 2             |
| Prompt: thesis, no LaTeX, clarify short replies, no faster-algorithm assignment | 3             |
| All-passed CTA without “variant”                                                | 4             |
| Filter rejects any fence                                                        | 4             |
| Persistent chips by diagnosis                                                   | 5–6           |
| `CoachMarkdown` subset, no lesson Markdown                                      | 6             |
| Pending bubble, a11y, tokens                                                    | 6             |
| Browser regression on Find the Index                                            | 7             |
| No Solution / quiz / reference in corpus                                        | 2 (leak scan) |

**Placeholder scan:** no TBD / “add tests later” / “similar to Task N”.

**Type consistency:** `thesis: string` on `CoachProblem`; `extractThesis(explanation: string): string`; `coachSuggestions({ hasChat, diagnosis })`; `filterCoachReply` and `diagnose` signatures unchanged.

**Not in this plan:** Python boot timeout (already shipped), KaTeX, authoring insight headings on every lesson, committing without an explicit user ask.
