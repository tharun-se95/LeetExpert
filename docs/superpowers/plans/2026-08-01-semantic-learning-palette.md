# Semantic Learning Palette (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the Indigo-means-everything collision (Goal/Ship/Insight
callouts, MarginNote, complexity chips all riding on `--mark`), add a
dedicated Insight (Learning Yellow) role, activate the already-scaffolded
Sky/Information token, and land the owner's Primary hex change (`#5B5CEB` →
`#6366F1`) with correctly measured contrast — not the callout/card layout
rhythm shown in the reference screenshot bolted onto the old token meanings.

**Architecture:** Token-first. Every visual change flows through the
existing two-tier CSS custom property system in `globals.css` (tier 1 raw
ink → tier 2 semantic name → Tailwind `@theme inline` utility). No component
gets a hardcoded hex; `web/tests/design-tokens.test.ts` already enforces
that and gets extended, not bypassed.

**Tech Stack:** Next.js 16 / React, Tailwind v4 (`@theme inline`), Vitest,
`@phosphor-icons/react`.

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts (CLAUDE.md §5).
- All colour goes through tokens — no hardcoded Tailwind palette classes or
  raw hex in components (CLAUDE.md §4; enforced by
  `web/tests/design-tokens.test.ts`).
- Contrast is measured, not eyeballed — every new/changed ratio in this plan
  was computed via the WCAG relative-luminance formula (CLAUDE.md §2).
- `tsc --noEmit`, `eslint src tests`, and `npm test` must be clean after
  every task (CLAUDE.md §2).
- Spec: `docs/superpowers/specs/2026-08-01-semantic-learning-palette-design.md`.

---

## File Structure

| File | Responsibility |
|---|---|
| `web/src/app/globals.css` | Tier-1/tier-2 token definitions — Primary hex, new `--insight`/`--info` roles |
| `web/tests/design-tokens.test.ts` | CI gate proving the tokens above are correct and that specific collision sites no longer use `--mark` |
| `docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md` | Canonical palette reference doc — must stay in sync with globals.css or it becomes a lie |
| `web/src/components/md/Callout.tsx` | Goal/Rocket/Insight/Constraint/Note tone reassignment + leading icon per type |
| `web/src/components/md/MarginNote.tsx` | Aside colour: `--mark` → `--info` |
| `web/src/components/cheatsheet/ComplexityStrip.tsx` | Non-optimal complexity chip: `--mark` → `--info` |
| `web/src/components/insight/InsightPanel.tsx` | Space-complexity chip: `--mark` → `--info` |
| `web/src/components/cheatsheet/tone.ts` | Add `insight` as a 7th selectable tone for cheatsheet pattern cards |
| `web/src/components/cheatsheet/PatternCard.tsx` | `TONE_LABEL` is a `Record<CueTone, string>` — adding `insight` to the union requires an entry here or `tsc` fails |
| `web/src/components/md/ExamplesBlock.tsx` | Card-per-example layout; fixes the existing bug where output is hardcoded green regardless of true/false |

---

### Task 1: Primary hex swap (`#5B5CEB` → `#6366F1`), measured

**Files:**
- Modify: `web/src/app/globals.css:17-153` (tier-1 `--riso-lime`/`--riso-olive`/`--riso-blue`, tier-2 `--accent-active`, and their comments)
- Modify: `web/tests/design-tokens.test.ts:153-186`

**Interfaces:**
- Consumes: nothing new.
- Produces: `--accent`/`--pop` now resolve to `#6366F1` (light and dark fill). `--accent-hover` (`#818cf8` light / `#a5b4fc` dark) and `--riso-olive`/`--riso-blue` in dark mode (`#818cf8`) are **unchanged** — they already sit correctly on the standard Tailwind indigo ramp one/two steps light of the new 500-equivalent primary, so nothing downstream breaks.

Computed contrast (WCAG relative luminance, not estimated):
- `#6366F1` on `#FCFCFD` (paper): **4.35:1** (was 4.91:1 with `#5B5CEB`)
- `#FFFFFF` on `#6366F1` (CTA fill): **4.47:1** (was 5.03:1)

Both clear 3:1 (AA large text/UI/non-text components) comfortably; neither
clears 4.5:1 (AA normal text) anymore. Primary is documented policy as
"large/UI/display accent" only (CLAUDE.md §4) — this task updates the test
threshold to match that documented policy instead of a stale 4.5 floor that
`#5B5CEB` happened to clear.

- [ ] **Step 1: Update the token test to expect the new values (will fail against current CSS)**

In `web/tests/design-tokens.test.ts`, replace lines 153-154:

```ts
    expect(firstHexVar(root, "riso-olive")).toBe("#5b5ceb");
    expect(firstHexVar(root, "riso-lime")).toBe("#5b5ceb");
```

with:

```ts
    expect(firstHexVar(root, "riso-olive")).toBe("#6366f1");
    expect(firstHexVar(root, "riso-lime")).toBe("#6366f1");
```

Replace lines 159-177 (the whole `"body text meets AA; Primary is sheet
large/UI accent"` test body) with:

```ts
  it("body text meets AA; Primary is sheet large/UI accent", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const paper = firstHexVar(root, "riso-paper");
    const ink = firstHexVar(root, "riso-ink");
    const muted = firstHexVar(root, "riso-ink-soft");
    const primary = firstHexVar(root, "riso-olive");
    const onPop = firstHexVar(root, "on-pop");
    const sunk = firstHexVar(root, "riso-paper-sunk");
    const code = firstHexVar(root, "code");
    expect(paper && ink && muted && primary && onPop && sunk && code).toBeTruthy();
    expect(contrastRatio(ink!, paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, sunk!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, code!)).toBeGreaterThanOrEqual(4.5);
    // Primary #6366F1 ≈ 4.35 on paper / white-on-primary ≈ 4.47 — clears
    // AA large-text/UI (3:1) by a wide margin; documented as large/UI/CTA
    // only (CLAUDE.md §4), so 3:1 is the correct floor here, not 4.5.
    expect(contrastRatio(primary!, paper!)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(onPop!, primary!)).toBeGreaterThanOrEqual(3);
  });
```

Replace line 186:

```ts
    expect(firstHexVar(dark, "riso-lime")).toBe("#5b5ceb");
```

with:

```ts
    expect(firstHexVar(dark, "riso-lime")).toBe("#6366f1");
```

- [ ] **Step 2: Run the tests, confirm they fail against current CSS**

Run: `cd web && npx vitest run tests/design-tokens.test.ts`
Expected: FAIL — `riso-olive`/`riso-lime` still resolve to `#5b5ceb`, and the
old primary's contrast is still ≥4.5 so the `>=3` check alone won't fail,
but the hex-literal assertions will.

- [ ] **Step 3: Update globals.css**

In `web/src/app/globals.css`, replace lines 32-38:

```css
  /*
    Primary #5B5CEB — deeper than Tailwind indigo-500; brand text + CTA fill.
    On paper ~4.91:1 — large/UI / display accent; body links prefer weight.
    White on Primary ~5.03:1 — CTA type.
  */
  --riso-lime: #5b5ceb; /* pop = Primary */
  --riso-olive: #5b5ceb; /* accent = Primary */
  --riso-blue: #4a4bd6; /* mark / active — pressed Primary */
```

with:

```css
  /*
    Primary #6366F1 — Tailwind indigo-500 exactly, per owner palette brief.
    On paper ~4.35:1 — large/UI / display accent only; do not use for
    regular-weight body text (below AA's 4.5:1 normal-text floor — clears
    3:1 large-text/UI comfortably). White on Primary ~4.47:1 — fine for
    bold/large CTA labels, same reasoning.
  */
  --riso-lime: #6366f1; /* pop = Primary */
  --riso-olive: #6366f1; /* accent = Primary */
  --riso-blue: #4f46e5; /* mark / active — pressed Primary (indigo-600) */
```

Replace line 61 (`--accent-active: #4a4bd6;`) with:

```css
  --accent-active: #4f46e5;
```

In the `.dark` block, replace lines 104-106:

```css
  --riso-lime: #5b5ceb; /* sheet Primary — CTA fill */
  --riso-olive: #818cf8; /* Primary Hover — readable accent on charcoal */
  --riso-blue: #818cf8;
```

with:

```css
  --riso-lime: #6366f1; /* sheet Primary — CTA fill */
  --riso-olive: #818cf8; /* Primary Hover — readable accent on charcoal */
  --riso-blue: #818cf8;
```

Replace line 119 (`--accent-active: #5b5ceb;`) with:

```css
  --accent-active: #6366f1;
```

`--accent-hover` (`#818cf8` light, `#a5b4fc` dark) is untouched — already
correct on the standard ramp. `--tok-*` code-syntax-highlight tokens
(lines 531-553) are **out of scope** — that's the Shiki/CodeMirror palette
(CLAUDE.md §4, a separate "one source" system from the UI semantic Primary),
not touched by this pass.

- [ ] **Step 4: Run the tests, confirm they pass**

Run: `cd web && npx vitest run tests/design-tokens.test.ts`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Commit**

```bash
git add web/src/app/globals.css web/tests/design-tokens.test.ts
git commit -m "Swap Primary to #6366F1, correct AA threshold to documented 3:1 large-UI floor"
```

---

### Task 2: Add Insight and Info roles

**Files:**
- Modify: `web/src/app/globals.css` (new `--riso-insight`/`--insight`/`--info` tokens + `@theme inline` mapping)
- Modify: `web/tests/design-tokens.test.ts` (new assertions)
- Modify: `docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md` (keep the canonical reference doc in sync)

**Interfaces:**
- Consumes: `--tone-sky` (existing, `#0284c7` light / `#38bdf8` dark — already defined, this task only aliases it).
- Produces: Tailwind utilities `bg-insight` / `text-insight` / `border-insight` and `bg-info` / `text-info` / `border-info`, usable by every later task in this plan.

Computed contrast:
- Insight text ink `#854D0E` on paper `#FCFCFD`: **6.68:1** (light)
- Insight text ink `#FACC15` on dark paper `#0F1117`: **12.3:1** (dark — bright gold reads fine on near-black; no darkening needed in dark mode, same pattern as `--good`/`--warn` where dark mode uses the brighter, less-darkened value)

- [ ] **Step 1: Write the failing test**

In `web/tests/design-tokens.test.ts`, add a new `it` block after the
`"dark mode defines layered surfaces and soft borders"` test (after line 190,
before the closing `});` of the `describe` block):

```ts
  it("Insight and Information roles are defined and AA-compliant", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    const dark = css.slice(css.indexOf(".dark"));

    const lightInsight = firstHexVar(root, "riso-insight");
    const darkInsight = firstHexVar(dark, "riso-insight");
    const lightPaper = firstHexVar(root, "riso-paper");
    const darkPaper = firstHexVar(dark, "riso-paper");

    expect(lightInsight).toBe("#854d0e");
    expect(darkInsight).toBe("#facc15");
    expect(contrastRatio(lightInsight!, lightPaper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkInsight!, darkPaper!)).toBeGreaterThanOrEqual(4.5);

    // --info aliases the existing (previously near-unused) --tone-sky token.
    expect(root).toMatch(/--info:\s*var\(--tone-sky\)/);
    expect(css).toMatch(/--color-insight:\s*var\(--insight\)/);
    expect(css).toMatch(/--color-info:\s*var\(--info\)/);
  });
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd web && npx vitest run tests/design-tokens.test.ts -t "Insight and Information"`
Expected: FAIL — none of these tokens exist yet.

- [ ] **Step 3: Add the tokens to globals.css**

In the light `:root` block, immediately after line 46 (`--riso-amber: #b45309;`), insert:

```css
  /*
    Insight — "remember this," deliberately rare. Not Warning's amber
    (teaching-caution) and not Primary (interaction only). Gold fill wash
    via bg-insight/N; text ink darkened for AA — pure #FACC15 is ~1.5:1 on
    paper, nowhere close.
  */
  --riso-insight: #854d0e; /* 6.68:1 on paper */
```

In the tier-2 section, immediately after line 67 (`--warn: var(--riso-amber);`), insert:

```css
  --insight: var(--riso-insight);
  --info: var(--tone-sky);
```

Note: `--tone-sky` is declared later in the same `:root` block (line 69);
CSS custom properties resolve at used-value time, not declaration order, so
this forward reference is valid — the same pattern the file already relies
on elsewhere (`--pop: var(--riso-lime)` referencing a var declared above it,
`--accent: var(--riso-olive)` likewise).

In the `.dark` block, immediately after line 109 (`--riso-amber: #f59e0b;`), insert:

```css
  --riso-insight: #facc15; /* 12.3:1 on dark paper — bright gold as text */
```

No `--insight`/`--info` redeclaration needed in `.dark` — both are tier-2
references to tier-1 values that already get dark overrides, so they follow
automatically (the same reason `--accent` needs no dark override today).

In the `@theme inline` block, immediately after line 138 (`--color-warn: var(--warn);`), insert:

```css
  --color-insight: var(--insight);
  --color-info: var(--info);
```

- [ ] **Step 4: Run the test, confirm it passes**

Run: `cd web && npx vitest run tests/design-tokens.test.ts`
Expected: PASS (all tests in the file, including Task 1's).

- [ ] **Step 5: Update the canonical palette doc**

In `docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md`, replace the
`Light` table's Primary rows (currently `#5B5CEB` / `#818CF8` / `#4A4BD6`):

```markdown
| Primary | `#6366F1` | `--accent` + `--pop` |
| Primary Hover | `#818CF8` | `--accent-hover` |
| Primary Active / mark | `#4F46E5` | `--accent-active` / `--riso-blue` |
```

and add two rows before `| On-pop | ... |`:

```markdown
| Insight (text ink) | `#854D0E` | `--insight` |
| Information | `#0284C7` | `--info` (alias of `--tone-sky`) |
```

Do the same for the `Dark` table: Primary row becomes `#6366F1`, and add:

```markdown
| Insight (text ink) | `#FACC15` | `--insight` |
| Information | `#38BDF8` | `--info` (alias of `--tone-sky`) |
```

Update the `## Notes` section's first bullet from "~4.91:1... ~5.03:1" to:

```markdown
- Primary on paper ~**4.35:1** (large/UI only — below 4.5:1 normal-text AA).
  White on Primary ~**4.47:1** (bold/large CTA labels only).
```

- [ ] **Step 6: Commit**

```bash
git add web/src/app/globals.css web/tests/design-tokens.test.ts docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md
git commit -m "Add Insight and Information token roles"
```

---

### Task 3: Reassign Callout tones, add leading icons

**Files:**
- Modify: `web/src/components/md/Callout.tsx`
- Modify: `web/tests/design-tokens.test.ts` (regression guard)

**Interfaces:**
- Consumes: `bg-info`/`text-info`/`border-info` and `bg-insight`/`text-insight`/`border-insight` from Task 2.
- Produces: no change to `CalloutProps` — `type`/`label`/`children` unchanged, so every markdown fence and call site keeps working.

- [ ] **Step 1: Write the failing regression test**

Add to `web/tests/design-tokens.test.ts`, after the Task 2 test:

```ts
  it("Callout: constraint is Success-toned, goal/rocket/note are Information, brain is Insight", () => {
    const body = readFileSync(
      join(SRC, "components", "md", "Callout.tsx"),
      "utf8",
    );
    expect(body).toMatch(/constraint:\s*"border-l-good/);
    expect(body).not.toMatch(/constraint:\s*"border-l-warn/);
    expect(body).toMatch(/goal:\s*"border-l-info/);
    expect(body).toMatch(/rocket:\s*"border-l-info/);
    expect(body).toMatch(/note:\s*"border-l-info/);
    expect(body).toMatch(/brain:\s*"border-l-insight/);
    expect(body).not.toMatch(/border-l-mark/);
  });
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd web && npx vitest run tests/design-tokens.test.ts -t "Callout:"`
Expected: FAIL — current file still has `goal`/`rocket`/`brain` on
`border-l-mark` and `constraint` on `border-l-warn`.

- [ ] **Step 3: Rewrite Callout.tsx**

Replace the full contents of `web/src/components/md/Callout.tsx`:

```tsx
"use client";

import { useId, useState } from "react";
import {
  Brain,
  Check,
  Copy,
  Info,
  Lightbulb,
  ListChecks,
  RocketLaunch,
  WarningCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type CalloutType =
  | "tip"
  | "note"
  | "goal"
  | "constraint"
  | "warn"
  | "rocket"
  | "build"
  | "brain"
  | "default";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  /** Optional label above the body (used by fenced callouts). */
  label?: string;
}

const TYPE_STYLES: Record<CalloutType, string> = {
  tip: "border-l-accent bg-accent/5",
  note: "border-l-info bg-info/[0.06]",
  goal: "border-l-info bg-info/5",
  constraint: "border-l-good bg-good/[0.06]",
  warn: "border-l-warn bg-warn/5",
  rocket: "border-l-info bg-info/5",
  build: "border-l-good bg-good/5",
  brain: "border-l-insight bg-insight/5",
  default: "border-l-border bg-surface",
};

const TYPE_LABELS: Partial<Record<CalloutType, string>> = {
  tip: "Tip",
  note: "Note",
  goal: "Goal",
  constraint: "Constraints",
  warn: "Watch out",
  brain: "Mental model",
  build: "Build",
  rocket: "Ship",
};

const TYPE_ICON_CLASS: Partial<Record<CalloutType, string>> = {
  tip: "text-accent",
  note: "text-info",
  goal: "text-info",
  constraint: "text-good",
  warn: "text-warn",
  brain: "text-insight",
  build: "text-good",
  rocket: "text-info",
};

function TypeIcon({ type }: { type: CalloutType }) {
  const className = cn("h-3.5 w-3.5 shrink-0", TYPE_ICON_CLASS[type]);
  switch (type) {
    case "tip":
      return <Lightbulb className={className} aria-hidden />;
    case "note":
    case "goal":
    case "rocket":
      return <Info className={className} aria-hidden />;
    case "constraint":
      return <ListChecks className={className} aria-hidden />;
    case "warn":
      return <WarningCircle className={className} aria-hidden />;
    case "brain":
      return <Brain className={className} aria-hidden />;
    case "build":
      return <RocketLaunch className={className} aria-hidden />;
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

  return (
    <blockquote
      id={id}
      className={cn(
        "group relative my-5 rounded-lg border border-border border-l-4 px-4 py-3 not-italic",
        TYPE_STYLES[type] ?? TYPE_STYLES.default,
      )}
    >
      <button
        type="button"
        onClick={copyText}
        className="absolute right-2 top-2 rounded-md border border-transparent p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:border-border hover:bg-background hover:text-foreground"
        aria-label="Copy callout"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <div className="pr-8 text-[0.95rem] leading-relaxed text-foreground/90 [&_p]:my-0">
        {resolvedLabel ? (
          <p className="mb-1.5 !mt-0 flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-muted uppercase">
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

Note: kept `rounded-lg` on all corners (was `rounded-r-lg`, right-only) to
match the reference screenshot's evenly-rounded card — still flat, no
shadow, border-left stays 4px as the tone flag.

- [ ] **Step 4: Run the test, confirm it passes**

Run: `cd web && npx vitest run tests/design-tokens.test.ts`
Expected: PASS (all tests). Also run `cd web && npx tsc --noEmit` and
`npx eslint src/components/md/Callout.tsx` — expect 0 errors (the icon
imports must resolve; if any of `Brain`/`Info`/`Lightbulb`/`ListChecks`/
`RocketLaunch`/`WarningCircle` don't exist in the installed
`@phosphor-icons/react` version, `tsc` will fail here — verified present in
this repo's `node_modules` before writing this plan).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/md/Callout.tsx web/tests/design-tokens.test.ts
git commit -m "Reassign Callout tones off indigo; add leading icons"
```

---

### Task 4: MarginNote, ComplexityStrip, InsightPanel — drop `--mark` for `--info`

**Files:**
- Modify: `web/src/components/md/MarginNote.tsx`
- Modify: `web/src/components/cheatsheet/ComplexityStrip.tsx:45`
- Modify: `web/src/components/insight/InsightPanel.tsx:87`
- Modify: `web/tests/design-tokens.test.ts` (regression guard)

**Interfaces:**
- Consumes: `text-info`/`border-info` from Task 2.
- Produces: no prop/signature changes anywhere in this task.

- [ ] **Step 1: Write the failing regression test**

Add to `web/tests/design-tokens.test.ts`, after the Task 3 test:

```ts
  it("MarginNote, ComplexityStrip, InsightPanel use --info, not --mark", () => {
    const marginNote = readFileSync(
      join(SRC, "components", "md", "MarginNote.tsx"),
      "utf8",
    );
    const complexityStrip = readFileSync(
      join(SRC, "components", "cheatsheet", "ComplexityStrip.tsx"),
      "utf8",
    );
    const insightPanel = readFileSync(
      join(SRC, "components", "insight", "InsightPanel.tsx"),
      "utf8",
    );
    for (const [name, body] of [
      ["MarginNote", marginNote],
      ["ComplexityStrip", complexityStrip],
      ["InsightPanel", insightPanel],
    ] as const) {
      expect(body, `${name} should not reference --mark`).not.toMatch(
        /\b(?:text|border|bg)-mark\b/,
      );
    }
    expect(marginNote).toMatch(/border-info/);
    expect(marginNote).toMatch(/text-info/);
    expect(complexityStrip).toMatch(/text-info/);
    expect(insightPanel).toMatch(/text-info/);
  });
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd web && npx vitest run tests/design-tokens.test.ts -t "MarginNote, ComplexityStrip"`
Expected: FAIL — all three files still use `--mark`.

- [ ] **Step 3: Edit the three files**

Replace the full contents of `web/src/components/md/MarginNote.tsx`:

```tsx
import type { ReactNode } from "react";

/**
 * The teacher's aside — the second ink of the Riso system.
 *
 * Uses `--info` (Sky) rather than `--accent` (Primary): accent means *pay
 * attention to this, it's interactive*; info means *someone is giving you
 * context*. Keeping those separate is what stops the page turning into
 * undifferentiated colour.
 *
 * Keep them short. An aside that runs longer than a couple of sentences is
 * really body text that belongs in the lesson.
 */
export function MarginNote({ children }: { children: ReactNode }) {
  return (
    <aside className="my-5 border-l-2 border-info pl-4 text-[0.92em] text-info [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
      {children}
    </aside>
  );
}
```

In `web/src/components/cheatsheet/ComplexityStrip.tsx`, replace line 45:

```tsx
        isTargetBigO(value) ? "text-good" : "text-mark",
```

with:

```tsx
        isTargetBigO(value) ? "text-good" : "text-info",
```

In `web/src/components/insight/InsightPanel.tsx`, replace line 87:

```tsx
            <span className="text-mark">{insight.complexity.space}</span>
```

with:

```tsx
            <span className="text-info">{insight.complexity.space}</span>
```

- [ ] **Step 4: Run the test, confirm it passes**

Run: `cd web && npx vitest run tests/design-tokens.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/md/MarginNote.tsx web/src/components/cheatsheet/ComplexityStrip.tsx web/src/components/insight/InsightPanel.tsx web/tests/design-tokens.test.ts
git commit -m "Move MarginNote/ComplexityStrip/InsightPanel off --mark onto --info"
```

---

### Task 5: Add `insight` as a selectable cheatsheet tone

**Files:**
- Modify: `web/src/lib/course/cheatsheets/types.ts`
- Modify: `web/src/components/cheatsheet/tone.ts`
- Modify: `web/src/components/cheatsheet/PatternCard.tsx:9-16`

**Interfaces:**
- Consumes: `bg-insight`/`text-insight`/`border-insight` from Task 2.
- Produces: `CueTone` union grows to `"accent" | "good" | "warn" | "bad" | "muted" | "mark" | "insight"`. No existing cheatsheet content references `"insight"` yet (it's a new option, not a reassignment) — adding it is additive and doesn't change any currently-rendered pattern card's colour.

This is a type-safety task, not a visual one: `PatternCard.tsx`'s
`TONE_LABEL` is `Record<CueTone, string>`, which TypeScript requires to be
exhaustive — skipping this step means Task 2-4's type changes are fine but
this one breaks `tsc` the moment `insight` is added to the union anywhere.

- [ ] **Step 1: Widen the type (this alone will fail `tsc`, which is the point)**

In `web/src/lib/course/cheatsheets/types.ts`, replace line 1:

```ts
export type CueTone = "accent" | "good" | "warn" | "bad" | "muted" | "mark";
```

with:

```ts
export type CueTone =
  | "accent"
  | "good"
  | "warn"
  | "bad"
  | "muted"
  | "mark"
  | "insight";
```

- [ ] **Step 2: Run tsc, confirm it fails**

Run: `cd web && npx tsc --noEmit`
Expected: FAIL — `Property 'insight' is missing in type` for the
`Record<CueTone, string>` in `tone.ts` (three maps) and `PatternCard.tsx`.

- [ ] **Step 3: Add the missing entries**

In `web/src/components/cheatsheet/tone.ts`, replace the full file:

```ts
import type { CueTone } from "@/lib/course/cheatsheets/types";

/** Border + wash classes for tone-coded surfaces (token colours only). */
export const TONE_RULE: Record<CueTone, string> = {
  accent: "border-l-accent bg-accent/5",
  good: "border-l-good bg-good/5",
  warn: "border-l-warn bg-warn/5",
  bad: "border-l-bad bg-bad/5",
  muted: "border-l-border bg-surface",
  mark: "border-l-mark bg-mark/5",
  insight: "border-l-insight bg-insight/5",
};

export const TONE_TEXT: Record<CueTone, string> = {
  accent: "text-accent",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  muted: "text-muted",
  mark: "text-mark",
  insight: "text-insight",
};

export const TONE_CHIP: Record<CueTone, string> = {
  accent: "border-accent/40 text-accent bg-accent/10",
  good: "border-good/40 text-good bg-good/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  bad: "border-bad/40 text-bad bg-bad/10",
  muted: "border-border text-muted bg-surface",
  mark: "border-mark/40 text-mark bg-mark/10",
  insight: "border-insight/40 text-insight bg-insight/10",
};
```

In `web/src/components/cheatsheet/PatternCard.tsx`, replace lines 9-16:

```tsx
const TONE_LABEL: Record<CueTone, string> = {
  accent: "Core",
  good: "Safe",
  warn: "Careful",
  bad: "Avoid",
  muted: "Extra",
  mark: "Reach",
};
```

with:

```tsx
const TONE_LABEL: Record<CueTone, string> = {
  accent: "Core",
  good: "Safe",
  warn: "Careful",
  bad: "Avoid",
  muted: "Extra",
  mark: "Reach",
  insight: "Insight",
};
```

`mark`/`"Reach"` is existing authored-content vocabulary (CORE/SAFE/REACH
badges) — left untouched. No cheatsheet registry file is edited in this
task; auditing which patterns should use `insight` instead of `mark` is
deferred per the spec.

- [ ] **Step 4: Run tsc, confirm it passes**

Run: `cd web && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/course/cheatsheets/types.ts web/src/components/cheatsheet/tone.ts web/src/components/cheatsheet/PatternCard.tsx
git commit -m "Add insight as a selectable cheatsheet pattern-card tone"
```

---

### Task 6: ExamplesBlock — card-per-example layout, fix the true/false colour bug

**Files:**
- Modify: `web/src/components/md/ExamplesBlock.tsx`
- Test: `web/tests/design-tokens.test.ts` (regression guard for the bug fix + no-palette-class gate already covers hardcoded hex)

**Interfaces:**
- Consumes: `ExampleRow` from `@/lib/content/parseExamples` (`{ input: string; output: string; note?: string }`) — unchanged, no changes to the parser.
- Produces: `ExamplesBlock({ rows, className? })` — same public signature as today, so `Markdown.tsx`'s existing call site needs no changes.

The current component hardcodes `text-good` (green) on every output
regardless of value — a `false` output currently renders in green, claiming
success for a negative case. Fix: pill the output only when it's literally
`"true"` or `"false"` (case-insensitive after trim); everything else — most
outputs in this course are arrays/numbers, not booleans — stays plain
foreground text, unchanged from today's behaviour for non-boolean rows.

- [ ] **Step 1: Write the failing test**

Add to `web/tests/design-tokens.test.ts`, after the Task 5-relevant test
(or anywhere in the `describe("design tokens", ...)` block — order doesn't
matter to Vitest):

```ts
  it("ExamplesBlock does not hardcode text-good on every output", () => {
    const body = readFileSync(
      join(SRC, "components", "md", "ExamplesBlock.tsx"),
      "utf8",
    );
    // The old bug: a single `text-good` applied unconditionally to output.
    expect(body).not.toMatch(/text-good"\s*>\s*\n\s*<pre/);
    expect(body).toMatch(/isBooleanOutput/);
  });
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `cd web && npx vitest run tests/design-tokens.test.ts -t "ExamplesBlock"`
Expected: FAIL — no `isBooleanOutput` in the current file, and the
unconditional-green pattern is present.

- [ ] **Step 3: Rewrite ExamplesBlock.tsx**

Replace the full contents of `web/src/components/md/ExamplesBlock.tsx`:

```tsx
import type { ExampleRow } from "@/lib/content/parseExamples";
import { cn } from "@/lib/utils";

function isBooleanOutput(output: string): "true" | "false" | null {
  const v = output.trim().toLowerCase();
  if (v === "true") return "true";
  if (v === "false") return "false";
  return null;
}

function OutputValue({ output }: { output: string }) {
  const bool = isBooleanOutput(output);
  if (bool === "true") {
    return (
      <span className="inline-flex rounded-full border border-good/40 bg-good/10 px-2 py-0.5 font-mono text-[0.78rem] text-good">
        {output.trim()}
      </span>
    );
  }
  if (bool === "false") {
    return (
      <span className="inline-flex rounded-full border border-bad/40 bg-bad/10 px-2 py-0.5 font-mono text-[0.78rem] text-bad">
        {output.trim()}
      </span>
    );
  }
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.78rem] text-foreground">
      {output}
    </pre>
  );
}

/**
 * One card per example — Input / Output rows, an optional explanation line.
 * Output is only pilled green/coral when it's a literal true/false; most
 * course examples return arrays or numbers and stay plain text.
 */
export function ExamplesBlock({
  rows,
  className,
}: {
  rows: ExampleRow[];
  className?: string;
}) {
  return (
    <div
      className={cn("my-4 grid gap-2", className)}
      role="list"
      aria-label="Examples"
    >
      {rows.map((row, i) => (
        <div
          key={`${row.input}-${i}`}
          role="listitem"
          className="rounded-lg border border-border bg-elevated px-3.5 py-2.5"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[0.65rem] text-muted uppercase tracking-wide">
              Input
            </span>
            <pre className="min-w-0 overflow-x-auto whitespace-pre-wrap font-mono text-[0.78rem] text-foreground">
              <span className="sr-only">: </span>
              {row.input}
            </pre>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[0.65rem] text-muted uppercase tracking-wide">
              Output
            </span>
            <OutputValue output={row.output} />
          </div>
          {row.note ? (
            <p className="mt-1 text-[0.72rem] text-muted">{row.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run the test, confirm it passes**

Run: `cd web && npx vitest run tests/design-tokens.test.ts`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Full verification sweep**

Run each and confirm clean:

```bash
cd web
npx tsc --noEmit
npx eslint src tests
npm test
npm run build
```

Expected: 0 / 0 / all passing (455 + the new tests added in this plan) / 0
build errors.

- [ ] **Step 6: Manual browser check**

Start the dev server, open `/problems/valid-palindrome`, and in both light
and dark mode confirm: the Goal callout is Sky/Information-tinted with an
Info icon, Constraints is green with a checklist icon, Examples render as
cards with the `false` example in a coral pill and `true` in a green pill
(not both green), and — if any lesson content uses the `brain` callout type
— it renders in gold, not indigo.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/md/ExamplesBlock.tsx web/tests/design-tokens.test.ts
git commit -m "ExamplesBlock: card layout, fix hardcoded-green output bug"
```
