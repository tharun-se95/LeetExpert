# Callout System (Treatment B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement spec `docs/superpowers/specs/2026-09-13-callout-system-design.md` (revised 2026-09-14) — eight callouts with one job each, colour by kind of message on the contribution green palette, a tint on every labelled callout (treatment B; fallback A = tints transparent), a `key` fence the coach reads, and tests that guard all of it.

**Architecture:** Five `--callout-tint-*` tokens mix palette level 1 into `--elevated` (50% light, 70% dark); `Callout.tsx` applies tint, `*-line` rule and `text-{role}` label per type; `Markdown.tsx` maps fence names to types through a typed list; `extractThesis.ts` reads `key` fences; a content test rejects fence names nothing renders.

**Tech Stack:** Next.js 16, React 19, Tailwind 4.3.2 (`@theme inline`), Phosphor icons, remark/mdast, Vitest (`renderToStaticMarkup`).

**Workspace:** `/Users/tharunk/leetExpert/.worktrees/callout-b` (branch `callout-b`, from `main` at `2067ab5`; baseline 59 files / 939 tests, `tsc` clean). Run commands from `web/`.

## Global Constraints

- Colour only through tokens; no palette classes, no raw hex in components (CLAUDE.md §4).
- Tint floors, both themes, on `--elevated`: step off the card 1.15–1.30; label ≥ 4.5:1; body ≥ 4.5:1 (spec §5.2, §8.2). Verified on the merged tokens 2026-09-14: light steps 1.160–1.230, dark 1.156–1.280 (dark mistake is the tightest).
- Known compromise (spec §5.2): light understanding/context/requirement rules are 2.76–2.94:1 against their own tint; they clear ≥ 3:1 against the page (spec 1 line test).
- Fallback A = set the five `--callout-tint-*` tokens to `transparent`; nothing else changes (spec §5).
- Callout body inherits prose size; no fixed `rem` on the body (spec §2).
- Do not touch `Reveal.tsx`, `MarginNote.tsx`, `extractHints.ts`, `splitProblemTabs.ts` (spec §6.5); no lesson content changes except Task 5's temporary, reverted fences.
- TypeScript strict; no `any`; no casts to silence the compiler; comments explain why (CLAUDE.md §5).
- Every new or changed test is shown failing before it passes; every commit is gated on real exit codes (CLAUDE.md §2).
- Commit messages end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

### Task 1: Callout tint tokens

**Files:**
- Modify: `web/src/app/globals.css` (`:root` after line 157 `--info-line: var(--hue-blue-3);`; `.dark` after line 301 `--info-line: var(--hue-blue-4);`; `@theme` after line 375 `--color-info-line: var(--info-line);`)
- Modify: `web/tests/design-tokens.test.ts` (new test before `it("MarginNote, ComplexityStrip, InsightPanel use --info, not --mark"`)

**Interfaces:**
- Consumes: `--hue-{yellow,red,blue,green}-1`, `--surface`, `--elevated`, `--insight/--bad/--info/--good/--mark`, `--foreground` (spec 1, merged); test helpers `blockBody`, `resolveToken`, `contrastRatio` (already in `design-tokens.test.ts`).
- Produces: CSS `--callout-tint-{understanding,mistake,context,requirement,advice}`, `--advice-line`; Tailwind colours `callout-tint-*`, `advice-line`, `rule-strong` (used by Task 2).

- [ ] **Step 1: Write the failing test** — insert before `  it("MarginNote, ComplexityStrip, InsightPanel use --info, not --mark", () => {`:

```ts
  it("callout tints (treatment B) clear their floors on the card, both themes", () => {
    // Spec 2026-09-13 §5: every labelled callout carries a tint — palette
    // level 1 mixed into --elevated. The tint is flattened onto the card it
    // paints on before measuring. Fallback A sets these tokens to transparent,
    // which this test would then fail by design (spec §8.2).
    const css = readFileSync(GLOBALS, "utf8");
    const root = blockBody(css, ":root");
    const dark = blockBody(css, ".dark");
    const labelOf: Record<string, string> = {
      understanding: "insight",
      mistake: "bad",
      context: "info",
      requirement: "good",
      advice: "mark",
    };
    const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const themes: [string, string | null][] = [
      ["light", null],
      ["dark", dark],
    ];
    for (const [theme, body] of themes) {
      const token = (name: string) => resolveToken(root, body, name);
      const card = token("elevated");
      for (const [category, labelRole] of Object.entries(labelOf)) {
        const name = `callout-tint-${category}`;
        if (body !== null) {
          expect(
            new RegExp(`--${name}:`).test(stripComments(body)),
            `.dark must redefine --${name} (70% mix)`,
          ).toBe(true);
        }
        const m =
          /^color-mix\(in srgb, (?:var\(--([\w-]+)\)|(#[0-9a-f]{6})) (\d+)%, var\(--elevated\)\)$/.exec(
            token(name),
          );
        expect(m, `${theme} --${name} is a color-mix into --elevated`).not.toBeNull();
        const source = m![1] ? token(m![1]) : m![2]!;
        const share = Number(m![3]) / 100;
        const bg = channels(card);
        const tint =
          "#" +
          channels(source)
            .map((c, i) => Math.round(c * share + bg[i]! * (1 - share)))
            .map((c) => c.toString(16).padStart(2, "0"))
            .join("");
        const step = contrastRatio(tint, card);
        expect(step, `${theme} ${category} tint ${tint} step off the card`).toBeGreaterThanOrEqual(1.15);
        expect(step, `${theme} ${category} tint ${tint} step off the card`).toBeLessThanOrEqual(1.3);
        expect(
          contrastRatio(token(labelRole), tint),
          `${theme} ${category} label (--${labelRole}) on ${tint}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(token("foreground"), tint),
          `${theme} ${category} body on ${tint}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(css).toMatch(new RegExp(`--color-${name}:\\s*var\\(--${name}\\)`));
      }
      // Tip's rule has no palette hue; it must still clear the 3:1 line floor on the card.
      expect(contrastRatio(token("advice-line"), card), `${theme} advice-line on the card`).toBeGreaterThanOrEqual(3);
    }
    expect(css).toMatch(/--color-advice-line:\s*var\(--advice-line\)/);
    expect(css).toMatch(/--color-rule-strong:\s*var\(--rule-strong\)/);
  });
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/design-tokens.test.ts -t "callout tints"`
Expected: FAIL — `Error: --callout-tint-understanding is not defined`.

- [ ] **Step 3: Add the tokens.** In `web/src/app/globals.css`, after `  --info-line: var(--hue-blue-3);` in `:root`:

```css

  /*
    Callout tints (spec 2026-09-13 §5, treatment B): palette level 1 mixed
    into the card — 50% here, 70% in .dark. Measured on --elevated: steps
    1.16–1.23 light, 1.16–1.28 dark (dark mistake 1.156, the tightest);
    labels ≥ 5.15:1; body ≥ 9.97:1. Fallback A, the owner's declared
    alternative: set these five to transparent. Tip's steel has no palette
    hue, so light mixes --surface and dark a stand-in level 1.
  */
  --callout-tint-understanding: color-mix(in srgb, var(--hue-yellow-1) 50%, var(--elevated));
  --callout-tint-mistake: color-mix(in srgb, var(--hue-red-1) 50%, var(--elevated));
  --callout-tint-context: color-mix(in srgb, var(--hue-blue-1) 50%, var(--elevated));
  --callout-tint-requirement: color-mix(in srgb, var(--hue-green-1) 50%, var(--elevated));
  --callout-tint-advice: color-mix(in srgb, var(--surface) 50%, var(--elevated));
  /* Tip's rule: 4.76:1 on --elevated, 4.10:1 on its own tint. */
  --advice-line: #64748b;
```

After `  --info-line: var(--hue-blue-4);` in `.dark`:

```css

  /* Callout tints, dark: the same mix at 70% (spec 2026-09-13 §5). */
  --callout-tint-understanding: color-mix(in srgb, var(--hue-yellow-1) 70%, var(--elevated));
  --callout-tint-mistake: color-mix(in srgb, var(--hue-red-1) 70%, var(--elevated));
  --callout-tint-context: color-mix(in srgb, var(--hue-blue-1) 70%, var(--elevated));
  --callout-tint-requirement: color-mix(in srgb, var(--hue-green-1) 70%, var(--elevated));
  --callout-tint-advice: color-mix(in srgb, #3a3f48 70%, var(--elevated));
  /* 7.93:1 on its own tint. */
  --advice-line: #cbd5e1;
```

After `  --color-info-line: var(--info-line);` in `@theme inline`:

```css
  --color-callout-tint-understanding: var(--callout-tint-understanding);
  --color-callout-tint-mistake: var(--callout-tint-mistake);
  --color-callout-tint-context: var(--callout-tint-context);
  --color-callout-tint-requirement: var(--callout-tint-requirement);
  --color-callout-tint-advice: var(--callout-tint-advice);
  --color-advice-line: var(--advice-line);
  --color-rule-strong: var(--rule-strong);
```

- [ ] **Step 4: Run the test and the suite**

Run: `npx vitest run tests/design-tokens.test.ts -t "callout tints"` → PASS.
Run: `npm test` → all files pass (exit 0).

- [ ] **Step 5: Prove it can fail.** Change the light `--callout-tint-mistake` share from `50%` to `20%`, run the Step 4 focused command — expected FAIL `light mistake tint … step off the card` (below 1.15). Restore byte-for-byte from a copy, re-run, expect PASS.

- [ ] **Step 6: Commit** (only if Step 4's `npm test` exit code was 0 and the restored run passed)

```bash
git add web/src/app/globals.css web/tests/design-tokens.test.ts
git commit -m "feat(tokens): callout tints for treatment B, contrast-checked on the card

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Callout component and Markdown wiring

**Files:**
- Modify: `web/src/components/md/Callout.tsx` (full rewrite)
- Modify: `web/src/components/md/Markdown.tsx` (delete `detectCalloutType` lines 41–51; replace callout branch lines 113–133; replace `blockquote` renderer lines 204–207)
- Modify: `web/src/lib/content/highlightBlocks.ts:28-45` (`NON_CODE_LANGS`: add `key`, remove `note`)
- Modify: `web/tests/design-tokens.test.ts` (replace the test titled `"Callout: constraint is Success-toned, goal/rocket/note are Information, brain is Insight"`)
- Create: `web/tests/callout.test.tsx`

**Interfaces:**
- Consumes: Task 1 Tailwind colours; `--{role}-line` (spec 1).
- Produces: `export type CalloutType = "key" | "brain" | "warn" | "tip" | "goal" | "constraint" | "default"`; `Callout({ children, type, label })`.

- [ ] **Step 1: Replace the old mapping test** (whole `it(...)` block) with:

```ts
  it("Callout: treatment B — tint, line and label per kind of message", () => {
    // Spec 2026-09-13 §4–§6. Colour names the category: yellow understanding
    // (key, brain), red a mistake (warn), blue context (goal), green a
    // requirement (constraint), steel advice (tip). Every labelled type
    // carries a tint, a 3px *-line rule and a label in its text colour; a
    // plain blockquote stays an unlabelled rule.
    const body = readFileSync(join(SRC, "components", "md", "Callout.tsx"), "utf8");
    expect(body).toMatch(/key:\s*"border-l-insight-line bg-callout-tint-understanding"/);
    expect(body).toMatch(/brain:\s*"border-l-insight-line bg-callout-tint-understanding"/);
    expect(body).toMatch(/warn:\s*"border-l-bad-line bg-callout-tint-mistake"/);
    expect(body).toMatch(/tip:\s*"border-l-advice-line bg-callout-tint-advice"/);
    expect(body).toMatch(/goal:\s*"border-l-info-line bg-callout-tint-context"/);
    expect(body).toMatch(/constraint:\s*"border-l-good-line bg-callout-tint-requirement"/);
    expect(body).toMatch(/default:\s*"border-l-2 border-l-rule-strong"/);
    expect(body).toMatch(/border-l-3/);
    expect(body).not.toMatch(/\bborder-l-warn\b|\btext-warn\b/);
    expect(body).not.toMatch(/\b(?:note|rocket|build):/);
    // No pastel surface fill; tints are the backgrounds.
    expect(body).not.toMatch(/bg-\w+-surface/);
    // Body inherits the prose size: a fixed 0.95rem was 75–80% of reading
    // prose and ~109% of problem-pane prose.
    expect(body).not.toMatch(/text-\[0\.95rem\]/);
    // Label: small bold uppercase in the category's text colour.
    expect(body).toMatch(/text-\[0\.7rem\][^"]*font-bold[^"]*uppercase/);
    // The copy button must appear on keyboard focus, not only on hover.
    expect(body).toMatch(/group-hover:opacity-100[^"]*focus-visible:opacity-100/);
  });
```

- [ ] **Step 2: Write the failing render test** `web/tests/callout.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/md/Markdown";

const render = (source: string) =>
  renderToStaticMarkup(
    <Markdown source={source} highlightedBlocks={{}} highlightedTabs={{}} />,
  );

/** The uppercase label a Callout draws above its body, or null when it has none. */
const labelOf = (html: string) =>
  /<blockquote[^>]*>[\s\S]*?<p class="[^"]*uppercase[^"]*">(?:<svg[\s\S]*?<\/svg>)?([^<]+)<\/p>/.exec(
    html,
  )?.[1] ?? null;

describe("callouts in lesson markdown (spec 2026-09-13)", () => {
  it.each([
    ["key", "Key idea"],
    ["brain", "Mental model"],
    ["warn", "Watch out"],
    ["tip", "Tip"],
    ["goal", "Goal"],
    ["constraint", "Constraints"],
  ])("a %s fence renders a callout labelled %s", (fence, label) => {
    const html = render(`\`\`\`${fence}\nThe body.\n\`\`\``);
    expect(labelOf(html)).toBe(label);
    expect(html).toContain("The body.");
  });

  it("a plain blockquote is unlabelled, even when it opens with a legacy emoji", () => {
    for (const source of ["> A quotation.", "> 💡 A quotation.", "> 🚀 A quotation."]) {
      const html = render(source);
      expect(html).toContain("<blockquote");
      expect(labelOf(html)).toBeNull();
    }
  });

  it("note is no longer a callout", () => {
    expect(render("```note\nPlain.\n```")).not.toContain("<blockquote");
  });
});
```

- [ ] **Step 3: Run both and confirm they fail**

Run: `npx vitest run tests/design-tokens.test.ts -t "Callout: treatment B" tests/callout.test.tsx`
Expected: FAIL — mapping test on `key:` pattern; render test: `key` label `null`, `💡` blockquote labelled `Tip`, `note` renders `<blockquote`.

- [ ] **Step 4: Rewrite `web/src/components/md/Callout.tsx`:**

```tsx
"use client";

import { useId, useState } from "react";
import {
  Brain,
  Check,
  Copy,
  Key,
  Lightbulb,
  ListChecks,
  Target,
  WarningCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type CalloutType =
  | "key"
  | "brain"
  | "warn"
  | "tip"
  | "goal"
  | "constraint"
  | "default";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  /** Optional label above the body (used by fenced callouts). */
  label?: string;
}

// Treatment B (spec 2026-09-13 §5). Colour names the *kind* of message and
// the label names the exact type, so two types may share a colour. Every
// labelled callout carries a tint (fallback A sets the tint tokens to
// transparent — a token change, not a component change) and a *-line rule,
// which clears 3:1 against the page beside it.
const TYPE_STYLE: Record<CalloutType, string> = {
  key: "border-l-insight-line bg-callout-tint-understanding",
  brain: "border-l-insight-line bg-callout-tint-understanding",
  warn: "border-l-bad-line bg-callout-tint-mistake",
  tip: "border-l-advice-line bg-callout-tint-advice",
  goal: "border-l-info-line bg-callout-tint-context",
  constraint: "border-l-good-line bg-callout-tint-requirement",
  // A plain `>` is a quotation or a formula display, not a claim: a visible
  // rule, no tint, no label, so it is never mistaken for a Key idea.
  default: "border-l-2 border-l-rule-strong",
};

const TYPE_LABELS: Partial<Record<CalloutType, string>> = {
  key: "Key idea",
  brain: "Mental model",
  warn: "Watch out",
  tip: "Tip",
  goal: "Goal",
  constraint: "Constraints",
};

/** Label and icon colour: the category's text colour, AA on its tint. */
const TYPE_LABEL_CLASS: Partial<Record<CalloutType, string>> = {
  key: "text-insight",
  brain: "text-insight",
  warn: "text-bad",
  tip: "text-mark",
  goal: "text-info",
  constraint: "text-good",
};

function TypeIcon({ type }: { type: CalloutType }) {
  const className = "h-3.5 w-3.5 shrink-0";
  switch (type) {
    case "key":
      return <Key className={className} aria-hidden />;
    case "brain":
      return <Brain className={className} aria-hidden />;
    case "warn":
      return <WarningCircle className={className} aria-hidden />;
    case "tip":
      return <Lightbulb className={className} aria-hidden />;
    case "goal":
      return <Target className={className} aria-hidden />;
    case "constraint":
      return <ListChecks className={className} aria-hidden />;
    default:
      return null;
  }
}

export function Callout({
  children,
  type = "default",
  label,
}: CalloutProps) {
  const [copied, setCopied] = useState(false);
  const id = useId();

  async function copyText() {
    const el = document.getElementById(id);
    const text = el?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  const resolvedLabel = label ?? TYPE_LABELS[type];
  const labelled = type !== "default";

  return (
    <blockquote
      id={id}
      className={cn(
        "group relative my-4 pr-8 pl-4 not-italic",
        labelled
          ? "border-l-3 py-2.5 rounded-r-[length:var(--radius-sm)]"
          : "py-0.5",
        TYPE_STYLE[type],
      )}
    >
      <button
        type="button"
        onClick={copyText}
        className="absolute top-1 right-0 rounded-[length:var(--radius-md)] border border-transparent p-1.5 text-muted opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:border-border hover:bg-surface hover:text-foreground"
        aria-label="Copy callout"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <div className="leading-relaxed text-foreground/90 [&_p]:my-0">
        {resolvedLabel ? (
          <p
            className={cn(
              "mb-1 !mt-0 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-wide uppercase",
              TYPE_LABEL_CLASS[type] ?? "text-muted",
            )}
          >
            <TypeIcon type={type} />
            {resolvedLabel}
          </p>
        ) : null}
        {children}
      </div>
    </blockquote>
  );
}
```

- [ ] **Step 5: Edit `Markdown.tsx`.** Delete `detectCalloutType` (lines 41–51) and add in its place:

```tsx
/** Fence languages that render as a labelled Callout (spec 2026-09-13 §3). */
const CALLOUT_FENCES = [
  "key",
  "brain",
  "warn",
  "tip",
  "goal",
  "constraint",
] as const satisfies readonly CalloutType[];

function calloutFence(
  className: string,
): (typeof CALLOUT_FENCES)[number] | null {
  const classes = className.split(/\s+/);
  return CALLOUT_FENCES.find((t) => classes.includes(`language-${t}`)) ?? null;
}
```

Replace the callout branch (`if (className.includes("language-tip") || … ) { … }`) with:

```tsx
        const calloutType = calloutFence(className);
        if (calloutType) {
          return (
            <Callout type={calloutType}>
              <Markdown
                source={text()}
                highlightedBlocks={highlightedBlocks}
                highlightedTabs={highlightedTabs}
              />
            </Callout>
          );
        }
```

Replace the `blockquote` renderer with:

```tsx
    blockquote({ children }) {
      // A plain `>` is a quotation or formula display; a claim is a ```key
      // fence. Emoji no longer pick a type — no lesson used them.
      return <Callout type="default">{children}</Callout>;
    },
```

- [ ] **Step 6: `NON_CODE_LANGS`** in `web/src/lib/content/highlightBlocks.ts`: remove the `"note",` line and add `"key",` after `"brain",`.

- [ ] **Step 7: Run tests, typecheck, lint**

Run: `npx vitest run tests/callout.test.tsx tests/design-tokens.test.ts` → PASS.
Run: `npm test` → exit 0. Run: `npx tsc --noEmit` → no output.
Run: `npx eslint src/components/md/Callout.tsx src/components/md/Markdown.tsx src/lib/content/highlightBlocks.ts tests/callout.test.tsx tests/design-tokens.test.ts` → no output.

- [ ] **Step 8: Prove the render test can fail.** In `Markdown.tsx` remove `"key",` from `CALLOUT_FENCES`; run `npx vitest run tests/callout.test.tsx` — expected FAIL on "a key fence renders a callout labelled Key idea". Restore byte-for-byte, re-run, expect PASS.

- [ ] **Step 9: Commit** (gated on Step 7 exit codes and the restored run)

```bash
git add web/src/components/md/Callout.tsx web/src/components/md/Markdown.tsx web/src/lib/content/highlightBlocks.ts web/tests/design-tokens.test.ts web/tests/callout.test.tsx
git commit -m "feat(callouts): treatment B on the palette, key fence, no note or emoji types

Every labelled callout gets a tint, a *-line rule and a label in its
category's text colour; the body inherits prose size; the copy button
shows on keyboard focus.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: The coach reads Key ideas

**Files:**
- Modify: `web/src/lib/coach/extractThesis.ts` (line 4 import; `extractThesis` from its doc comment to end of file)
- Modify: `web/tests/coach-thesis.test.ts` (two tests appended inside `describe("extractThesis", …)`)

- [ ] **Step 1: Write the failing tests** — add after the last `it` in `describe("extractThesis", …)`:

```ts
  it("reads a Key idea fence that opens The insight instead of stopping at it", () => {
    const explanation = [
      "## The insight",
      "",
      "```key",
      "Every subset is a leaf of the include/exclude tree.",
      "```",
      "",
      "So the tree has 2^n leaves.",
      "",
      "```viz",
      '{ "id": "subsets" }',
      "```",
    ].join("\n");
    const thesis = extractThesis(explanation);
    expect(thesis).toContain("include/exclude tree");
    expect(thesis).toContain("2^n leaves");
    expect(thesis).not.toContain("```");
    expect(thesis).not.toContain('"id"');
  });

  it("prefers the first Key idea fence to a blockquote when there is no The insight heading", () => {
    const explanation = [
      "> A quoted formula, not the claim.",
      "",
      "```key",
      "The window only ever grows or slides.",
      "```",
    ].join("\n");
    expect(extractThesis(explanation)).toBe("The window only ever grows or slides.");
  });
```

- [ ] **Step 2: Run and confirm they fail**

Run: `npx vitest run tests/coach-thesis.test.ts`
Expected: FAIL — first returns `""`; second returns `"A quoted formula, not the claim."`.

- [ ] **Step 3: Implement.** Line 4 becomes `import type { Code, Heading, Root, RootContent } from "mdast";`. Replace everything from `/**\n * Lesson thesis from an Explanation slice` to the end of the file with:

```ts
/** A ```key fence — the Key idea callout (spec 2026-09-13 §6.4). */
function isKeyFence(node: RootContent): node is Code {
  return node.type === "code" && node.lang === "key";
}

/**
 * Lesson thesis from an Explanation slice — never the Solution tab.
 * "The insight" section first (most problems), then the first Key idea
 * fence, then the first blockquote (lessons not yet migrated to ```key),
 * else empty.
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
      if (node.type === "heading") break;
      // A Key idea is the section's claim, not a code sample, so its body is
      // prose. Any other fence (viz, tabs, reveal) still ends the thesis.
      if (isKeyFence(node)) {
        parts.push(node.value);
        continue;
      }
      if (node.type === "code") break;
      const slice = sliceNode(explanation, node);
      if (slice) parts.push(slice);
    }
    return toReadableProse(parts.join("\n\n"));
  }

  const keyIdea = nodes.find(isKeyFence);
  if (keyIdea) return toReadableProse(keyIdea.value);

  const quote = nodes.find((node) => node.type === "blockquote");
  return quote ? toReadableProse(sliceNode(explanation, quote)) : "";
}
```

- [ ] **Step 4: Run tests, typecheck, lint** — `npx vitest run tests/coach-thesis.test.ts` PASS (6); `npm test` exit 0; `npx tsc --noEmit` clean; `npx eslint src/lib/coach/extractThesis.ts tests/coach-thesis.test.ts` clean.

- [ ] **Step 5: Commit** (gated)

```bash
git add web/src/lib/coach/extractThesis.ts web/tests/coach-thesis.test.ts
git commit -m "feat(coach): read the Key idea fence as the lesson thesis

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: A mistyped fence name fails CI

**Files:**
- Modify: `web/src/lib/content/highlight.ts` (export `SUPPORTED_LANGS`, `LANG_ALIASES`)
- Modify: `web/src/lib/content/highlightBlocks.ts` (export `NON_CODE_LANGS`)
- Modify: `web/tests/content.test.ts` (imports; helpers and `describe` appended)

- [ ] **Step 1: Write the failing test.** After `import { MODULES } from "../src/lib/course/manifest";` add:

```ts
import { LANG_ALIASES, SUPPORTED_LANGS } from "../src/lib/content/highlight";
import { NON_CODE_LANGS } from "../src/lib/content/highlightBlocks";
```

Append at the end of the file:

```ts
/**
 * Fences handled outside both language lists (spec 2026-09-13 §8.3): they
 * are rendered by their own components, not highlighted and not listed as
 * non-code.
 */
const STRUCTURAL_FENCES = new Set([
  "tabs", // CodeTabs, via highlightBlocks' tabs branch
  "reveal", // Reveal
  "sandbox", // extractSandboxFence
  "viz", // Viz registry
]);

/** Every fence language opened in `body` that nothing in the app renders. */
function unknownFenceNames(body: string): string[] {
  const known = (lang: string) =>
    (SUPPORTED_LANGS as readonly string[]).includes(lang) ||
    Object.prototype.hasOwnProperty.call(LANG_ALIASES, lang) ||
    NON_CODE_LANGS.has(lang) ||
    STRUCTURAL_FENCES.has(lang);
  return [...body.matchAll(/^`{3,}([A-Za-z][\w-]*)/gm)]
    .map((m) => m[1]!)
    .filter((lang) => !known(lang));
}

const COURSES_DIR = join(__dirname, "..", "..", "courses");

describe("fence languages", () => {
  it("flags a mistyped callout fence", () => {
    // Proves the guard can fail: without it, ```wran renders as a plain code block.
    expect(unknownFenceNames("```wran\nMind the index.\n```")).toEqual(["wran"]);
    expect(unknownFenceNames("```warn\nMind the index.\n```")).toEqual([]);
  });

  it("every fence in every course is one the app renders", () => {
    const bad = walk(COURSES_DIR).flatMap((path) =>
      unknownFenceNames(readFileSync(path, "utf8")).map(
        (lang) => `${relative(COURSES_DIR, path)}: \`\`\`${lang}`,
      ),
    );
    expect(bad).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and confirm it fails** — `npx vitest run tests/content.test.ts -t "fence languages"` → FAIL (the lists are not exported).

- [ ] **Step 3: Export the lists.** `const SUPPORTED_LANGS = [` → `export const SUPPORTED_LANGS = [` and `const LANG_ALIASES: Record<` → `export const LANG_ALIASES: Record<` in `highlight.ts`; `const NON_CODE_LANGS = new Set([` → `export const NON_CODE_LANGS = new Set([` in `highlightBlocks.ts`.

- [ ] **Step 4: Run tests, typecheck, lint** — focused PASS; `npm test` exit 0; `tsc` clean; `npx eslint src/lib/content/highlight.ts src/lib/content/highlightBlocks.ts tests/content.test.ts` clean.

- [ ] **Step 5: Commit** (gated)

```bash
git add web/src/lib/content/highlight.ts web/src/lib/content/highlightBlocks.ts web/tests/content.test.ts
git commit -m "test(content): fail CI on a fence language the app does not render

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: CLAUDE.md, full verification, browser check

**Files:**
- Modify: `CLAUDE.md` (§3 bullet before line 65 `- **Never leak solutions.**`; §4 bullet before line 265 `- **Code colour has one source.**`)
- Temporary, reverted: `courses/dsa/strings/valid-palindrome.md`; `/Users/tharunk/leetExpert/.claude/launch.json`

- [ ] **Step 1: CLAUDE.md §3** — insert before `- **Never leak solutions.**`:

```markdown
- **Callouts are the exception, and each has one job** (spec
  `docs/superpowers/specs/2026-09-13-callout-system-design.md` §3). Key idea
  (` ```key `) is the one claim a section concludes; Mental model (`brain`)
  is a picture you reason with, never a summary; Watch out (`warn`) is one
  concrete mistake with its trigger and consequence, executed in both
  languages; Tip is optional practical help; Goal is exactly what to return;
  Aside is a short first-person note. A plain `>` is a quotation or formula
  display, not a claim. Never two callouts adjacent, never one that restates
  the paragraph before it.
```

- [ ] **Step 2: CLAUDE.md §4** — insert before `- **Code colour has one source.**`:

```markdown
- **Callout colour names the kind of message; the label names the type.**
  Yellow = understanding (Key idea, Mental model), red = a mistake (Watch
  out), blue = context (Goal, Aside), green = a requirement (Constraints),
  steel = advice (Tip). Every labelled callout carries a tint
  (`--callout-tint-*`: palette level 1 mixed into `--elevated`, 50% light /
  70% dark), a 3px `*-line` rule and a label in its text colour; the owner's
  declared fallback is treatment A — set the five tint tokens to
  `transparent`. Callout body inherits the prose size. Guarded in
  `design-tokens.test.ts` ("callout tints…", "Callout: treatment B…") and
  `tests/callout.test.tsx`.
```

- [ ] **Step 3: Full static verification** (from `web/`): `npx tsc --noEmit`, `npx eslint` on every file changed in Tasks 1–4, `npm test`, `npm run build` — all exit 0.

- [ ] **Step 4: Temporary content.** In `courses/dsa/strings/valid-palindrome.md`, directly after the existing ` ```tip ` block, add a ` ```key `, a ` ```warn ` and a ` ```brain ` fence (one sentence each) so every callout type renders on one page.

- [ ] **Step 5: Dev server.** Add a `callout-b-worktree` entry to `/Users/tharunk/leetExpert/.claude/launch.json` (`npm --prefix .worktrees/callout-b/web run dev -- --port 3012`, port 3012) and start it with `preview_start`.

- [ ] **Step 6: Browser, both themes** (swap the `light`/`dark` class on `<html>`; never the toggle), on `/courses/dsa/problems/valid-palindrome`, converting computed colours through a canvas (Tailwind v4 reports OKLab):
  - each labelled callout: `border-left-width` = `3px`; `border-left-color` = the resolved `--{role}-line` (Tip: `--advice-line`); `background-color` = its tint composited per spec §5.2; label colour = `--{role}` (Tip: `--mark`); body `font-size` = the `.handbook-prose` font size;
  - Constraints, Goal, Tip, Key idea, Watch out, Mental model all show their labels;
  - copy button: `el.focus({ focusVisible: true })` → computed `opacity` `1`;
  - `/courses/dsa/recursion-backtracking/the-call-stack-and-base-cases`: plain blockquote `border-left-width` `2px`, colour = `--rule-strong`, no label, no background;
  - screenshots in both themes; `read_console_messages` errors-only on a fresh load with nothing injected.

- [ ] **Step 7: Revert temporary changes.** `git checkout -- courses/dsa/strings/valid-palindrome.md` in the worktree; stop the server; remove the launch entry and confirm `git -C /Users/tharunk/leetExpert diff -- .claude/launch.json` is empty.

- [ ] **Step 8: Commit docs and plan** (gated on Step 3)

```bash
git add CLAUDE.md docs/superpowers/plans/2026-09-14-callout-system-b.md
git commit -m "docs: record the callout jobs and treatment B rules in CLAUDE.md

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 9: Integrate** with superpowers:finishing-a-development-branch (merge `callout-b` into `main` safely: gate the exact merge commit in a throwaway worktree, then `--ff-only`).
