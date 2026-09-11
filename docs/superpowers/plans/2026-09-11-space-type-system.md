# Space Type System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Sora/Inter with Space Mono (display) and Space Grotesk (body) site-wide. Redesign chapter headings as a hairline plus a decorative `// 01` counter label, and carry emphasis by weight.

**Architecture:** Fonts swap at the token source (`layout.tsx` `next/font` variables), so the 41 `font-display` call sites need no font changes, only weight fixes. The heading treatment lives once in `globals.css` (`.handbook-prose h2`, `.chapter-heading`, `.chapter-rule`) and replaces three hand-copied accent bars. Diagram label sizing is checked against real glyph advances read from the shipped font files with `fontkit`.

**Tech Stack:** Next.js 16.2.10 (`next/font/google`), Tailwind v4, Vitest 4, React 19 SSR (`renderToStaticMarkup`), fontkit 2.0.4, @fontsource/space-grotesk 5.3.0, @fontsource/jetbrains-mono 5.3.0.

**Spec:** `docs/superpowers/specs/2026-09-11-space-type-system-design.md`

## Global Constraints

- `--font-display` = Space Mono, weights `["400", "700"]` only; `--font-sans-face` = Space Grotesk (variable); `--font-mono-face` = JetBrains Mono (unchanged).
- Display call sites use weight 400 or 700 only, never `font-semibold` / `font-medium` / `font-extrabold` / `font-black`.
- Emphasis: `em`/`i` upright at weight 500; `strong`/`b` at 700; code contexts keep their italic.
- Article h2: `border-top: 1px solid var(--rule-strong)`, label `content: "// " counter(chapter, decimal-leading-zero) / ""` in `--muted`, Space Mono 400. No `--family-wash` background, no accent pill.
- `--press-rule-strong`: light `rgba(22, 32, 46, 0.18)`, dark `rgba(244, 244, 245, 0.18)`.
- Problem panes (`.problem-prose`): hairline, no number.
- h3 stays `font-size: 1.14em` (`Roadmap.tsx:15` depends on it).
- The lesson h1 (`LessonView.tsx`) drops `uppercase`.
- All colour goes through tokens; no raw `box-shadow` or palette classes (CLAUDE.md §4).
- TypeScript strict: no `any`, no unchecked casts (CLAUDE.md §5).
- Every new test is seen failing before it is trusted (CLAUDE.md §2).
- Font bytes on a lesson page: an increase over +30 KB against baseline is a finding, not a pass.
- Out of scope: OG/Twitter images, `video/`, palette/shadow/code-colour tokens, `FontSwapReflowDiagram`'s `"Inter"` content label.

---

## Execution setup (before Task 1)

The main working tree has the owner's uncommitted favicon/SEO work in `web/src/app/layout.tsx` and `web/tests/design-tokens.test.ts`, the same files this plan edits. Work happens in an isolated worktree so those hunks never mix into these commits.

- [ ] **Measure the baseline font bytes first** (on the untouched `main` dev server, port 3002). In the Browser pane, navigate to `http://localhost:3002/courses/dsa/arrays/contiguous-memory`, reload, then run:

```js
performance.getEntriesByType("resource")
  .filter((e) => /\.woff2(\?|$)/.test(e.name))
  .map((e) => ({ file: e.name.split("/").pop(), kb: +(e.encodedBodySize / 1024).toFixed(1) }))
```

Record the list and its total as **BASELINE_FONT_KB** for the Task 6 report.

- [ ] **Create the worktree** with superpowers:using-git-worktrees at `.worktrees/space-type-system` on a new branch `feat/space-type-system` from `main` (`.worktrees/` is already gitignored).

- [ ] **Move the spec and plan into the branch and commit them**

```bash
cd /Users/tharunk/leetExpert
mkdir -p .worktrees/space-type-system/docs/superpowers/plans
mv docs/superpowers/specs/2026-09-11-space-type-system-design.md .worktrees/space-type-system/docs/superpowers/specs/
mv docs/superpowers/plans/2026-09-11-space-type-system.md .worktrees/space-type-system/docs/superpowers/plans/
cd .worktrees/space-type-system
git add docs/superpowers/specs/2026-09-11-space-type-system-design.md docs/superpowers/plans/2026-09-11-space-type-system.md
git commit -m "$(printf 'docs(type): Space type system spec and implementation plan\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

- [ ] **Install dependencies in the worktree**

```bash
cd /Users/tharunk/leetExpert/.worktrees/space-type-system/web && npm ci
```

Expected: exits 0.

- [ ] **Add a dev-server entry for the worktree** to `/Users/tharunk/leetExpert/.claude/launch.json` (append to `configurations`):

```json
{
  "name": "web-dev-space",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["--prefix", ".worktrees/space-type-system/web", "run", "dev", "--", "--port", "3003"],
  "port": 3003
}
```

All commands below run from `/Users/tharunk/leetExpert/.worktrees/space-type-system/web` unless stated. `T` means `NODE_OPTIONS=--no-experimental-webstorage npx vitest run`, the same flags as `npm test`.

---

### Task 1: Font tokens

**Files:**
- Modify: `web/src/app/layout.tsx:2` (import) and `:12-33` (font loaders and comment)
- Modify: `web/src/components/md/Mermaid.tsx:55`
- Test: `web/tests/design-tokens.test.ts` (new `describe("type system")` at end of file)

**Interfaces:**
- Produces: the CSS variables `--font-display` (Space Mono 400/700) and `--font-sans-face` (Space Grotesk). Names are unchanged, so every consumer keeps working.

- [ ] **Step 1: Write the failing test.** Append to the end of `web/tests/design-tokens.test.ts`:

```ts
describe("type system", () => {
  it("binds Space Mono to display and Space Grotesk to body", () => {
    const layout = readFileSync(join(SRC, "app", "layout.tsx"), "utf8");
    const imported =
      layout.match(/import \{([^}]*)\} from "next\/font\/google"/)?.[1] ?? "";
    expect(
      imported
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .sort(),
    ).toEqual(["JetBrains_Mono", "Space_Grotesk", "Space_Mono"]);
    // Space Mono has no variable axis: without an explicit weight list
    // next/font refuses to load it, and a missing 700 would be faked.
    expect(layout).toMatch(
      /Space_Mono\(\{[^}]*weight:\s*\["400",\s*"700"\][^}]*variable:\s*"--font-display"/,
    );
    expect(layout).toMatch(
      /Space_Grotesk\(\{[^}]*variable:\s*"--font-sans-face"/,
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `T tests/design-tokens.test.ts -t "binds Space Mono"`
Expected: FAIL. The received array is `["Inter", "JetBrains_Mono", "Sora"]`.

- [ ] **Step 3: Implement.** In `web/src/app/layout.tsx`, replace line 2:

```ts
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
```

with:

```ts
import { JetBrains_Mono, Space_Grotesk, Space_Mono } from "next/font/google";
```

Replace the block from `/**\n * Three faces, three jobs (Linear/educational sheet).` through the closing `});` of `const sans = Inter({...});` with:

```ts
/**
 * Three faces, three jobs.
 *
 * Space Mono (display) carries the wordmark and every heading. Space Grotesk
 * — its proportional sibling, same letterforms — is the body and UI face, so
 * headings and prose read as one system. JetBrains Mono stays on code, which
 * keeps a monospaced heading from ever being mistaken for a code block.
 *
 * Space Mono ships only 400 and 700: display call sites must use one of those
 * or the browser synthesises a fake bold (guarded in design-tokens.test.ts).
 * Space Grotesk has no italic at all, so emphasis is weight, not slant
 * (globals.css `@layer base`).
 */
const display = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
});
```

Leave `const mono = JetBrains_Mono({...})` unchanged. In `web/src/components/md/Mermaid.tsx`, replace:

```ts
    "var(--font-sans), Inter, ui-sans-serif, system-ui, sans-serif";
```

with:

```ts
    "var(--font-sans), 'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
```

- [ ] **Step 4: Run the test and typecheck**

Run: `T tests/design-tokens.test.ts -t "binds Space Mono" && npx tsc --noEmit`
Expected: PASS; tsc exits 0.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/layout.tsx web/src/components/md/Mermaid.tsx web/tests/design-tokens.test.ts
git commit -m "$(printf 'feat(type): Space Mono display and Space Grotesk body tokens\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 2: Emphasis by weight

**Files:**
- Modify: `web/src/app/globals.css` (insert a `@layer base` block after `::selection { … }` at ~line 347; change `.handbook-prose strong` at ~line 585)
- Modify: `web/src/components/coach/CoachMarkdown.tsx:20`
- Test: `web/tests/design-tokens.test.ts` (inside `describe("type system")`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: the test helper `cssBlock(css: string, selector: string): string`, a module-level function in `design-tokens.test.ts` used by Tasks 3 and 4.

- [ ] **Step 1: Write the failing test.** Add this helper directly above `describe("design tokens", () => {` in `web/tests/design-tokens.test.ts`:

```ts
/**
 * Body of the first rule whose selector line is exactly `selector` (a
 * selector list is passed with its newlines, e.g. "em,\ni"). Empty string
 * when absent, so a missing rule fails the assertion instead of throwing.
 */
function cssBlock(css: string, selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  if (start === -1) return "";
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}
```

Then add inside `describe("type system", () => { … })`:

```ts
  it("emphasis is carried by weight, never a synthesised slant", () => {
    // Space Grotesk ships no italic: <em> would render as a fake oblique.
    const css = readFileSync(GLOBALS, "utf8");
    const em = cssBlock(css, "  em,\n  i");
    expect(em).toMatch(/font-style:\s*normal/);
    expect(em).toMatch(/font-weight:\s*500/);
    // 500 vs 600 read as one weight in review; 700 keeps them apart.
    expect(cssBlock(css, "  strong,\n  b")).toMatch(/font-weight:\s*700/);
    expect(cssBlock(css, "  :is(code, pre, kbd, samp) :is(em, i)")).toMatch(
      /font-style:\s*italic/,
    );
    expect(cssBlock(css, ".handbook-prose strong")).toMatch(/font-weight:\s*700/);
    const coach = readFileSync(
      join(SRC, "components", "coach", "CoachMarkdown.tsx"),
      "utf8",
    );
    expect(coach).not.toMatch(/\[&_strong\]:font-semibold/);
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `T tests/design-tokens.test.ts -t "emphasis is carried by weight"`
Expected: FAIL on the `font-style: normal` assertion (received `""`).

- [ ] **Step 3: Implement.** In `web/src/app/globals.css`, directly after the `::selection { … }` rule, insert:

```css
/*
  Space Grotesk ships no italic, so a slanted <em> would be a synthesised
  oblique. Emphasis is weight instead: 500 against 400 body, with strong at
  700 so the two stay distinguishable (500 vs 600 read as the same weight in
  review). Code keeps its italic. In @layer base so a utility on the element
  (e.g. `<strong className="font-medium">` in BigOObservatory) still wins —
  unlayered rules would beat every utility.
*/
@layer base {
  em,
  i {
    font-style: normal;
    font-weight: 500;
  }

  strong,
  b {
    font-weight: 700;
  }

  :is(code, pre, kbd, samp) :is(em, i) {
    font-style: italic;
    font-weight: inherit;
  }
}
```

Change the `.handbook-prose strong` rule:

```css
.handbook-prose strong {
  font-weight: 600;
  color: var(--foreground);
}
```

to:

```css
.handbook-prose strong {
  font-weight: 700;
  color: var(--foreground);
}
```

In `web/src/components/coach/CoachMarkdown.tsx`, change `[&_strong]:font-semibold` to `[&_strong]:font-bold` in the wrapper `className`.

- [ ] **Step 4: Run the test**

Run: `T tests/design-tokens.test.ts -t "emphasis is carried by weight"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/globals.css web/src/components/coach/CoachMarkdown.tsx web/tests/design-tokens.test.ts
git commit -m "$(printf 'feat(type): carry emphasis by weight, strong at 700\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 3: Chapter headings, shared class, title-case lesson h1

**Files:**
- Modify: `web/src/app/globals.css`: tokens (~line 33, ~85, ~189), `.handbook-prose` (~453–467), h2/h3 (~469–525), `.problem-prose .handbook-prose h2` (~549–551)
- Modify: `web/src/components/course/Quiz.tsx:229-240`
- Modify: `web/src/components/cheatsheet/Cheatsheet.tsx:45-55`
- Modify: `web/src/components/md/PracticeProblemsList.tsx:36-47`
- Modify: `web/src/components/course/LessonView.tsx:63`
- Test: `web/tests/design-tokens.test.ts`

**Interfaces:**
- Consumes: `cssBlock` from Task 2.
- Produces: CSS classes `.chapter-heading` (display typography) and `.chapter-rule` (full-width hairline), and the token `--rule-strong`.

- [ ] **Step 1: Write the failing tests.** In `web/tests/design-tokens.test.ts`, **delete** the whole `it("chapter headings carry the family accent bar", () => { … });` block (currently ~lines 577–585). Add inside `describe("type system", () => { … })`:

```ts
  it("chapter headings are a hairline plus a decorative counter label", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const h2 = cssBlock(css, ".handbook-prose h2");
    expect(h2).toMatch(/border-top:\s*1px solid var\(--rule-strong\)/);
    // The old pill + wash assumed a family colour prose no longer gets.
    expect(h2).not.toMatch(/background|family-wash/);
    const label = cssBlock(css, ".handbook-prose h2::before");
    expect(label).toMatch(/counter-increment:\s*chapter/);
    // `/ ""` is CSS alt text: without it "// 01" joins the accessible name.
    expect(label).toMatch(
      /content:\s*"\/\/ " counter\(chapter, decimal-leading-zero\) \/ "";/,
    );
    expect(cssBlock(css, ".problem-prose .handbook-prose h2::before")).toMatch(
      /content:\s*none/,
    );
    expect(cssBlock(css, ".chapter-rule")).toMatch(
      /border-top:\s*1px solid var\(--rule-strong\)/,
    );
    expect(css).toMatch(/--press-rule-strong:\s*rgba\(22, 32, 46, 0\.18\)/);
    expect(css).toMatch(/--press-rule-strong:\s*rgba\(244, 244, 245, 0\.18\)/);
    expect(css).toMatch(/--rule-strong:\s*var\(--press-rule-strong\)/);
  });

  it("component section headings share the class, not a copied accent bar", () => {
    expect(
      FILES.filter((f) => f.body.includes("h-[3px] w-10")).map((f) => f.rel),
    ).toEqual([]);
    for (const rel of [
      "components/course/Quiz.tsx",
      "components/cheatsheet/Cheatsheet.tsx",
      "components/md/PracticeProblemsList.tsx",
    ]) {
      const body = FILES.find((f) => f.rel === rel)?.body ?? "";
      expect(body, rel).toMatch(/\bchapter-heading\b/);
      expect(body, rel).toMatch(/\bchapter-rule\b/);
    }
  });

  it("lesson numbering cannot restart mid-lesson", () => {
    const css = readFileSync(GLOBALS, "utf8");
    expect(cssBlock(css, ".handbook-prose")).toMatch(/counter-reset:\s*chapter/);
    // Roadmap stage bodies nest a second .handbook-prose.
    expect(cssBlock(css, ".handbook-prose .handbook-prose")).toMatch(
      /counter-reset:\s*none/,
    );
    for (const rel of [
      "components/course/LessonView.tsx",
      "app/courses/nextjs/[module]/[chapter]/[lesson]/page.tsx",
    ]) {
      const body = FILES.find((f) => f.rel === rel)?.body ?? "";
      expect(body.match(/<Markdown\b/g)?.length, rel).toBe(1);
    }
  });

  it("lesson titles render in title case", () => {
    // Uppercase monospace wraps a 57-character title to 4–5 lines at 375px.
    const body =
      FILES.find((f) => f.rel === "components/course/LessonView.tsx")?.body ?? "";
    const h1 = body.match(/<h1 className="([^"]*)"/)?.[1] ?? "";
    expect(h1).toMatch(/\bfont-display\b/);
    expect(h1).not.toMatch(/\buppercase\b/);
  });
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `T tests/design-tokens.test.ts -t "type system"`
Expected: 4 FAIL (hairline, shared class, numbering, title case); the Task 1 and 2 tests PASS.

- [ ] **Step 3: Add the tokens.** In `web/src/app/globals.css`, after the light line `  --press-rule: rgba(22, 32, 46, 0.09);` add:

```css
  --press-rule-strong: rgba(22, 32, 46, 0.18); /* chapter hairline — twice the soft rule */
```

After the dark line `  --press-rule: rgba(244, 244, 245, 0.09); /* soft rule */` add:

```css
  --press-rule-strong: rgba(244, 244, 245, 0.18); /* chapter hairline — twice the soft rule */
```

After `  --border: var(--press-rule);` add:

```css
  --rule-strong: var(--press-rule-strong);
```

- [ ] **Step 4: Add the counter scope.** In the `.handbook-prose { … }` rule, after `  color: color-mix(in oklab, var(--foreground) 94%, transparent);` add `  counter-reset: chapter;`. Directly after that rule's closing `}`, add:

```css
/* A Markdown nested inside prose (roadmap stage bodies) must continue the
   lesson's chapter numbering, not restart it at 01. */
.handbook-prose .handbook-prose {
  counter-reset: none;
}
```

- [ ] **Step 5: Replace the heading rules.** Replace everything from `.handbook-prose h2 {` (~line 469) through the closing `}` of `.handbook-prose h3 { … }` (~line 525) with:

```css
/*
  Chapter heading: a hairline and a `// 01` counter label above the heading
  text. Replaces a family-accent pill + wash that assumed a family colour
  prose no longer receives — outside a family scope both fell back to steel
  and read as a grey button. Structure comes from the rule and the number,
  so it holds in the monochrome base.
*/
.handbook-prose h2 {
  margin-top: 2.5rem;
  margin-bottom: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--rule-strong);
}

/*
  One definition of chapter typography, shared with component section
  headings (Quiz, Cheatsheet, Problems) through .chapter-heading. Sentence
  case: uppercase is for small labels and short page titles — at 220 lessons
  an uppercase monospaced h2 reads as shouting.
*/
.handbook-prose h2,
.chapter-heading {
  font-family: var(--font-display), var(--font-sans-face), sans-serif;
  font-size: 1.3em;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.22;
  color: var(--foreground);
}

/* The hairline for component sections whose heading sits in a flex row: the
   rule belongs on the row, not on the heading's own shrink-wrapped width. */
.chapter-rule {
  padding-top: 0.85rem;
  border-top: 1px solid var(--rule-strong);
}

.handbook-prose h2::before {
  counter-increment: chapter;
  /* `/ ""` is CSS alt text. Generated content otherwise joins the heading's
     accessible name and every h2 is announced "slash slash zero one, …". */
  content: "// " counter(chapter, decimal-leading-zero) / "";
  display: block;
  margin-bottom: 0.5rem;
  font-family: var(--font-display), monospace;
  font-size: 0.56em;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--muted);
}

.handbook-prose h3 {
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
  font-family: var(--font-display), var(--font-sans-face), sans-serif;
  /* 1.14em is load-bearing: Roadmap.tsx derives its rail-disc offset from it. */
  font-size: 1.14em;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--foreground);
}
```

After the existing `.problem-prose .handbook-prose h2 { margin-top: 1.75rem; }` rule, add:

```css
/* A problem statement is scanned, not read in chapters: keep the hairline,
   drop the number. */
.problem-prose .handbook-prose h2::before {
  content: none;
}
```

- [ ] **Step 6: Swap the three component headings.** In `web/src/components/course/Quiz.tsx`, replace:

```tsx
      <header className="mb-2 flex items-end justify-between gap-3">
        <div>
          {/* Same family-accent rule + display heading as the article's own h2s (globals.css .handbook-prose h2). */}
          <span
            aria-hidden
            className="mb-2 block h-[3px] w-10 rounded-[length:var(--radius-xs)] bg-[var(--family-accent,var(--accent))]"
          />
          <p className="font-display text-[1.44em] font-semibold tracking-[-0.015em] text-foreground">
            Check yourself
          </p>
        </div>
```

with:

```tsx
      <header className="chapter-rule mb-2 flex items-end justify-between gap-3">
        <p className="chapter-heading">Check yourself</p>
```

In `web/src/components/cheatsheet/Cheatsheet.tsx`, replace:

```tsx
      {/* Same family-accent rule + display heading as the article's own h2s (globals.css .handbook-prose h2). */}
      <span
        aria-hidden
        className="mb-2 block h-[3px] w-10 rounded-[length:var(--radius-xs)] bg-[var(--family-accent,var(--accent))]"
      />
      <h2
        id="cheatsheet"
        className="font-display text-[1.44em] font-semibold tracking-[-0.015em] text-foreground"
      >
        Cheatsheet
      </h2>
```

with:

```tsx
      <h2 id="cheatsheet" className="chapter-rule chapter-heading">
        Cheatsheet
      </h2>
```

In `web/src/components/md/PracticeProblemsList.tsx`, replace:

```tsx
      <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {/* Same family-accent rule + display heading as the article's own h2s (globals.css .handbook-prose h2). */}
          <span
            aria-hidden
            className="mb-2 block h-[3px] w-10 rounded-[length:var(--radius-xs)] bg-[var(--family-accent,var(--accent))]"
          />
          <h2
            id="problems"
            className="font-display text-[1.44em] font-semibold tracking-[-0.015em] text-foreground"
          >
            Problems
          </h2>
```

with:

```tsx
      <header className="chapter-rule mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 id="problems" className="chapter-heading">
            Problems
          </h2>
```

- [ ] **Step 7: Title-case the lesson h1.** In `web/src/components/course/LessonView.tsx`, replace:

```tsx
        <h1 className="press-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
```

with:

```tsx
        <h1 className="press-overprint font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.1rem]">
```

- [ ] **Step 8: Run the tests**

Run: `T tests/design-tokens.test.ts && npx tsc --noEmit`
Expected: all PASS, including every existing design-token test; tsc exits 0.

- [ ] **Step 9: Prove the label alt-text guard can fail.** Temporarily delete ` / ""` from the `content:` line in `.handbook-prose h2::before`, run `T tests/design-tokens.test.ts -t "hairline plus a decorative counter"`, and confirm it FAILS. Restore ` / ""`, rerun, and confirm it PASSES.

- [ ] **Step 10: Commit**

```bash
git add web/src/app/globals.css web/src/components/course/Quiz.tsx web/src/components/cheatsheet/Cheatsheet.tsx web/src/components/md/PracticeProblemsList.tsx web/src/components/course/LessonView.tsx web/tests/design-tokens.test.ts
git commit -m "$(printf 'feat(type): hairline chapter headings with decorative counter label\n\nOne .chapter-heading/.chapter-rule definition replaces three hand-copied\naccent bars. Lesson titles move to title case.\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 4: Display weights Space Mono actually ships

**Files:**
- Modify: every `.tsx` under `web/src/` where a line pairs `font-display` with `font-semibold` (28 lines across 16 files; see the grep in Step 3)
- Test: `web/tests/design-tokens.test.ts`

**Interfaces:**
- Consumes: `FILES` and `GLOBALS` (existing in the test file).

- [ ] **Step 1: Write the failing test.** Add inside `describe("type system", () => { … })`:

```ts
  it("pairs the display face only with weights Space Mono ships (400/700)", () => {
    const UNSHIPPED =
      /\bfont-(?:thin|extralight|light|medium|semibold|extrabold|black)\b|\bfont-\[\d+\]/;
    const hits: string[] = [];
    for (const f of FILES) {
      if (!f.rel.endsWith(".tsx")) continue;
      f.body.split("\n").forEach((line, i) => {
        if (/\bfont-display\b/.test(line) && UNSHIPPED.test(line)) {
          hits.push(`${f.rel}:${i + 1}`);
        }
      });
    }
    const css = readFileSync(GLOBALS, "utf8");
    for (const block of css.split("}")) {
      if (!block.includes("var(--font-display)")) continue;
      const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim();
      if (weight && !["400", "700", "normal", "bold"].includes(weight)) {
        hits.push(`app/globals.css: font-weight ${weight} with the display face`);
      }
    }
    expect(hits).toEqual([]);
  });
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `T tests/design-tokens.test.ts -t "weights Space Mono ships"`
Expected: FAIL, listing about 25 `file:line` entries (HomePage.tsx, nextjs/page.tsx, PatternCard.tsx, …). The three component headings were already removed in Task 3.

- [ ] **Step 3: Implement the sweep.** Every hit is a single-line `className`, so a line-scoped substitution is exact:

```bash
grep -rlE "font-display" src --include="*.tsx" | xargs perl -pi -e 's/\bfont-semibold\b/font-bold/g if /\bfont-display\b/'
git diff --stat
```

Expected: only `.tsx` files listed in the Step 2 failure change, each line swapping `font-semibold` for `font-bold`. Read the diff before continuing and revert any line where `font-semibold` belonged to a different element (none expected).

- [ ] **Step 4: Run the test and the full suite**

Run: `T tests/design-tokens.test.ts -t "weights Space Mono ships" && npm test`
Expected: PASS; full suite green.

- [ ] **Step 5: Commit**

```bash
git add -u web/src web/tests/design-tokens.test.ts
git commit -m "$(printf 'fix(type): display call sites use weights Space Mono ships\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 5: Diagram label fit against real glyph advances

**Files:**
- Modify: `web/package.json` (devDependencies)
- Create: `web/tests/helpers/svgText.ts`
- Create: `web/tests/helpers/svgGeometry.ts`
- Create: `web/tests/diagramTextFit.test.tsx`
- Modify: `web/tests/cacheLayerFallthroughDiagram.test.tsx` (use the helper; the text-fit tests move to the new file)
- Modify: sans-serif `CH_*` constants in `web/src/components/md/diagrams/{CacheLayerFallthrough,DistributedCacheHandler,QueryHydrationHandoff,ServerActionRpc,CacheInvalidationScope}Diagram.tsx`

**Interfaces:**
- Produces, `svgText.ts`: `type Face = "sans" | "mono"`, `interface RunStyle { face: Face; size: number; weight: number; letterSpacing: number }`, `interface Run { text: string; style: RunStyle }`, `textRuns(openTag: string, inner: string): Run[]`, `runWidth(run: Run): number`.
- Produces, `svgGeometry.ts`: `interface Box { x0; y0; x1; y1: number; label: string }`, `interface MeasuredText extends Box { runs: Run[] }`, `parseDiagram(markup: string): { width: number; height: number; rects: Box[]; texts: MeasuredText[] }`, `overlaps(a: Box, b: Box): boolean`, `contains(outer: Box, inner: Box, tol?: number): boolean`, `area(b: Box): number`, `advanceTable(texts: MeasuredText[]): Record<string, number>`.

- [ ] **Step 1: Add the measurement dependencies**

```bash
npm install --save-dev --save-exact fontkit@2.0.4 @types/fontkit@2.0.9 @fontsource/space-grotesk@5.3.0 @fontsource/jetbrains-mono@5.3.0
ls node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-{400,500,600,700}-normal.woff2 node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-{400,600}-normal.woff2
```

Expected: install exits 0; all six files listed.

- [ ] **Step 2: Create `web/tests/helpers/svgText.ts`**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as fontkit from "fontkit";

export type Face = "sans" | "mono";

export interface RunStyle {
  face: Face;
  size: number;
  weight: number;
  letterSpacing: number;
}

export interface Run {
  text: string;
  style: RunStyle;
}

/**
 * Advance widths come from the static instances of the faces the site ships
 * (@fontsource mirrors Google Fonts), so a "label fits" verdict is measured
 * against real glyphs — not an average-width guess that silently goes stale
 * when a face changes, which is exactly what the Inter → Space Grotesk swap
 * would have done.
 */
const FONT_DIR = join(__dirname, "..", "..", "node_modules", "@fontsource");
const FAMILY: Record<Face, string> = {
  sans: "space-grotesk",
  mono: "jetbrains-mono",
};
const cache = new Map<string, fontkit.Font>();

function fontFor(face: Face, weight: number): fontkit.Font {
  const family = FAMILY[face];
  const file = join(FONT_DIR, family, "files", `${family}-latin-${weight}-normal.woff2`);
  const hit = cache.get(file);
  if (hit) return hit;
  // readFileSync throws on a weight the package lacks: measuring a
  // neighbouring weight instead would pass labels that clip in production.
  const opened = fontkit.create(readFileSync(file));
  if (!("layout" in opened)) throw new Error(`${file} is a font collection`);
  cache.set(file, opened);
  return opened;
}

const ENTITIES: Record<string, string> = {
  "&quot;": '"',
  "&#x27;": "'",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
};

const decode = (s: string) =>
  s.replace(/<[^>]*>/g, "").replace(/&(?:quot|#x27|amp|lt|gt);/g, (e) => ENTITIES[e] ?? e);

function styleOf(tag: string, inherited?: RunStyle): RunStyle {
  const get = (name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  const family = get("font-family");
  return {
    face: family ? (/mono/.test(family) ? "mono" : "sans") : (inherited?.face ?? "sans"),
    size: Number(get("font-size") ?? inherited?.size ?? 12),
    weight: Number(get("font-weight") ?? inherited?.weight ?? 400),
    letterSpacing: Number(get("letter-spacing") ?? inherited?.letterSpacing ?? 0),
  };
}

/** Split a <text> element into styled runs, honouring <tspan> overrides. */
export function textRuns(openTag: string, inner: string): Run[] {
  const base = styleOf(openTag);
  const runs: Run[] = [];
  let last = 0;
  for (const m of inner.matchAll(/<tspan([^>]*)>([\s\S]*?)<\/tspan>/g)) {
    const index = m.index ?? 0;
    runs.push({ text: decode(inner.slice(last, index)), style: base });
    runs.push({ text: decode(m[2] ?? ""), style: styleOf(`<tspan${m[1] ?? ""}>`, base) });
    last = index + m[0].length;
  }
  runs.push({ text: decode(inner.slice(last)), style: base });
  return runs.filter((r) => r.text.length > 0);
}

export function runWidth(run: Run): number {
  const font = fontFor(run.style.face, run.style.weight);
  const glyphs = font.layout(run.text);
  return (
    (glyphs.advanceWidth / font.unitsPerEm) * run.style.size +
    run.style.letterSpacing * run.text.length
  );
}
```

- [ ] **Step 3: Create `web/tests/helpers/svgGeometry.ts`** (moved from `cacheLayerFallthroughDiagram.test.tsx`, with measured text widths):

```ts
import { runWidth, textRuns, type Run } from "./svgText";

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  label: string;
}

export interface MeasuredText extends Box {
  runs: Run[];
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function num(tag: string, name: string, fallback = 0): number {
  const v = attr(tag, name);
  return v === undefined ? fallback : Number(v);
}

export function parseDiagram(markup: string) {
  const viewBox = markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox) throw new Error("no viewBox");
  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);

  // Only the outer canvas's own shapes: strip nested <svg> icon viewports.
  const body = markup.replace(/<svg(?!\s+viewBox="0 0 \d)[\s\S]*?<\/svg>/g, "");

  const rects: Box[] = [];
  for (const tag of body.match(/<rect[^>]*>/g) ?? []) {
    if (attr(tag, "fill")?.includes("url(#")) continue; // texture overlay
    rects.push({
      x0: num(tag, "x"),
      y0: num(tag, "y"),
      x1: num(tag, "x") + num(tag, "width"),
      y1: num(tag, "y") + num(tag, "height"),
      label: `rect@${num(tag, "x")},${num(tag, "y")}`,
    });
  }

  const texts: MeasuredText[] = [];
  for (const m of body.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
    const tag = `<text${m[1] ?? ""}>`;
    const runs = textRuns(tag, m[2] ?? "");
    const w = runs.reduce((sum, r) => sum + runWidth(r), 0);
    const fs = num(tag, "font-size", 12);
    const anchor = attr(tag, "text-anchor") ?? "start";
    const x = num(tag, "x");
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    const y = num(tag, "y");
    texts.push({
      x0,
      y0: y - fs,
      x1: x0 + w,
      y1: y + fs * 0.25,
      label: JSON.stringify(runs.map((r) => r.text).join("")),
      runs,
    });
  }

  return { width, height, rects, texts };
}

export const overlaps = (a: Box, b: Box) =>
  a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1;

export const contains = (outer: Box, inner: Box, tol = 2) =>
  inner.x0 >= outer.x0 - tol &&
  inner.x1 <= outer.x1 + tol &&
  inner.y0 >= outer.y0 - tol &&
  inner.y1 <= outer.y1 + tol;

export const area = (b: Box) => (b.x1 - b.x0) * (b.y1 - b.y0);

/**
 * Widest measured per-character advance per type role, rounded up to 0.05 —
 * the minimum a diagram's `chars × CH_*` estimate must use for that role.
 * Runs under 4 characters are skipped: a lone glyph's advance is not a
 * per-character average and would inflate the role.
 */
export function advanceTable(texts: MeasuredText[]): Record<string, number> {
  const table: Record<string, number> = {};
  for (const t of texts) {
    for (const r of t.runs) {
      if (r.text.length < 4) continue;
      const s = r.style;
      const key = `${s.face} ${s.size}px w${s.weight}${s.letterSpacing ? ` ls${s.letterSpacing}` : ""}`;
      table[key] = Math.max(table[key] ?? 0, runWidth(r) / r.text.length);
    }
  }
  for (const key of Object.keys(table)) {
    table[key] = Math.ceil((table[key] ?? 0) * 20) / 20;
  }
  return table;
}
```

- [ ] **Step 4: Create `web/tests/diagramTextFit.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { CacheLayerFallthroughDiagram } from "@/components/md/diagrams/CacheLayerFallthroughDiagram";
import { CacheInvalidationScopeDiagram } from "@/components/md/diagrams/CacheInvalidationScopeDiagram";
import { DistributedCacheHandlerDiagram } from "@/components/md/diagrams/DistributedCacheHandlerDiagram";
import { QueryHydrationHandoffDiagram } from "@/components/md/diagrams/QueryHydrationHandoffDiagram";
import { ServerActionRpcDiagram } from "@/components/md/diagrams/ServerActionRpcDiagram";
import { advanceTable, area, contains, parseDiagram, type Box } from "./helpers/svgGeometry";

/**
 * Every diagram that sizes its viewBox from per-character advance estimates,
 * checked against the real glyph advances of the faces the site ships. The
 * CH_* constants are the layout's guess; this is the measurement that keeps
 * the guess honest when a face changes. PRINT_ADVANCES=1 prints each type
 * role's widest per-character advance — the floor for its CH_* constant.
 */
const DIAGRAMS: Array<[string, () => ReactElement]> = [
  ["CacheLayerFallthroughDiagram", () => <CacheLayerFallthroughDiagram />],
  ["CacheInvalidationScopeDiagram", () => <CacheInvalidationScopeDiagram />],
  ["DistributedCacheHandlerDiagram", () => <DistributedCacheHandlerDiagram />],
  ["QueryHydrationHandoffDiagram", () => <QueryHydrationHandoffDiagram />],
  ["ServerActionRpcDiagram", () => <ServerActionRpcDiagram />],
];

describe.each(DIAGRAMS)("%s label fit (real glyph advances)", (name, render) => {
  const { width, height, rects, texts } = parseDiagram(renderToStaticMarkup(render()));
  if (process.env.PRINT_ADVANCES) console.log(name, advanceTable(texts));

  it("keeps every label inside the viewBox", () => {
    const canvas: Box = { x0: 0, y0: 0, x1: width, y1: height, label: "canvas" };
    expect(texts.filter((t) => !contains(canvas, t, 0.5)).map((t) => t.label)).toEqual([]);
  });

  it("never lets a label overflow the box it sits in", () => {
    const clipped: string[] = [];
    for (const t of texts) {
      const cx = (t.x0 + t.x1) / 2;
      const cy = (t.y0 + t.y1) / 2;
      const owner = rects
        .filter((r) => cx >= r.x0 && cx <= r.x1 && cy >= r.y0 && cy <= r.y1)
        .sort((a, b) => area(a) - area(b))[0];
      if (!owner) continue; // captions / band headers sit on the canvas itself
      if (!contains(owner, t, 3)) clipped.push(`${t.label} overflows ${owner.label}`);
    }
    expect(clipped).toEqual([]);
  });
});
```

- [ ] **Step 5: Reduce `web/tests/cacheLayerFallthroughDiagram.test.tsx` to its collision check** (text fit now lives in `diagramTextFit.test.tsx`). Replace the whole file with:

```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CacheLayerFallthroughDiagram } from "@/components/md/diagrams/CacheLayerFallthroughDiagram";
import { contains, overlaps, parseDiagram } from "./helpers/svgGeometry";

// Label fit (viewBox + owning box) is measured with real glyph advances for
// all five width-estimating diagrams in diagramTextFit.test.tsx.
describe("CacheLayerFallthroughDiagram geometry", () => {
  const { rects } = parseDiagram(renderToStaticMarkup(<CacheLayerFallthroughDiagram />));

  it("keeps sibling pills and nodes from colliding", () => {
    // Zones legitimately contain other rects; only compare same-generation
    // boxes, i.e. pairs where neither contains the other.
    const hits: string[] = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        if (!a || !b) continue;
        if (contains(a, b, 0) || contains(b, a, 0)) continue;
        if (overlaps(a, b)) hits.push(`${a.label} x ${b.label}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
```

- [ ] **Step 6: Run and print the measured advances**

Run: `PRINT_ADVANCES=1 T tests/diagramTextFit.test.tsx tests/cacheLayerFallthroughDiagram.test.tsx`
Expected: the collision test PASSES. Each diagram prints a table like `{ 'sans 13px w600': 7.45, 'sans 9.5px w400': 5.3, 'mono 10px w400': 6.05, … }`. Fit tests FAIL wherever an Inter-tuned `CH_*` is now too small; save the printed tables and the failure list.

- [ ] **Step 7: Retune the sans constants.** In each of the five diagram files, match every sans `CH_*` constant to its table row using the constant's existing comment (e.g. `CH_TITLE = 7.0; // 13px semibold sans` → `sans 13px w600`; ServerActionRpc's `CH_HEADER … 10px sans 600 with 1.2 letter-spacing` → `sans 10px w600 ls1.2`). Set it to `max(current value, table value)` and rewrite the comment in this form:

```ts
const CH_TITLE = 7.45; // 13px semibold sans — widest Space Grotesk run, measured by tests/diagramTextFit.test.tsx
```

Leave every mono constant (`CH_MONO`, `CH_CHIP`, `CH_CALL`, `CH_ROUTE`, `CH_MONOPILL`, `CH_CARD`) unchanged: JetBrains Mono did not change. If a table has a sans role with no matching constant, the width for that text is computed another way; read that call site and apply the same `max` rule to the literal it uses.

- [ ] **Step 8: Run to green**

Run: `T tests/diagramTextFit.test.tsx tests/cacheLayerFallthroughDiagram.test.tsx && npx tsc --noEmit`
Expected: all PASS; tsc exits 0. If a label still overflows, the owning box is sized from a constant that Step 7 missed: fix that constant, not the test tolerance.

- [ ] **Step 9: Prove the fit test can fail.** Temporarily set `CH_PILL` in `CacheLayerFallthroughDiagram.tsx` to `2.0`, run `T tests/diagramTextFit.test.tsx -t CacheLayerFallthrough`, and confirm it FAILS with an `overflows` entry. Restore the value and confirm it PASSES.

- [ ] **Step 10: Commit**

```bash
git add web/package.json web/package-lock.json web/tests/helpers web/tests/diagramTextFit.test.tsx web/tests/cacheLayerFallthroughDiagram.test.tsx web/src/components/md/diagrams
git commit -m "$(printf 'test(diagrams): measure label fit against real Space Grotesk advances\n\nReplaces the Inter-tuned ADV estimate with fontkit advances from the\nshipped faces for all five width-estimating diagrams, and retunes the\nsans CH_* constants to the measured floors.\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 6: Doctrine, full verification, cleanup

**Files:**
- Modify: `CLAUDE.md` (§4)
- Delete (main working tree, untracked): `/Users/tharunk/leetExpert/web/public/__h2-options-1.html`, `-2.html`, `-3.html`, `-italics.html`

- [ ] **Step 1: Update CLAUDE.md §4.** Replace:

```
  steel in both themes (the wordmark uses it too). Chapter headings carry a
  short family-accent rule above `h2`; heading text stays ink.
```

with:

```
  steel in both themes (the wordmark uses it too). Chapter headings are a
  1px `--rule-strong` hairline plus a decorative `// 01` counter label (CSS
  alt text `/ ""` keeps it out of the accessible name); component sections
  share it through `.chapter-rule` + `.chapter-heading`, never a copied bar.
  Heading text stays ink.
```

Insert directly before the line `- **All colour goes through tokens.** No hardcoded Tailwind palette values`:

```
- **Type system: three faces, three jobs.** Space Mono (`--font-display`)
  for the wordmark and every heading; Space Grotesk (`--font-sans-face`) —
  Space Mono's proportional sibling — for body and UI; JetBrains Mono for
  code only, so a heading is never mistaken for a code block. Space Mono
  ships only 400/700: display call sites use regular or `font-bold`, never
  `font-semibold` (guarded in `design-tokens.test.ts`). Space Grotesk has no
  italic, so emphasis is weight — `em` 500, `strong` 700 — never a
  synthesised slant. Diagram label sizing is checked against real glyph
  advances in `tests/diagramTextFit.test.tsx`; change a face and that test
  tells you which `CH_*` constants to retune.
```

- [ ] **Step 2: Run the full gate**

```bash
npx tsc --noEmit && npm run lint && npm test && npm run build
```

Expected: every command exits 0. Record the test count from `npm test`.

- [ ] **Step 3: Confirm the alt text survived the CSS minifier**

```bash
grep -rhoE 'counter\(chapter[^;}]*' .next/static/css | sort -u
```

Expected: output containing `/""` or `/ ""`. If the minifier dropped it, the label is announced again: stop and report, don't ship.

- [ ] **Step 4: Browser verification.** Start `web-dev-space` with `preview_start`. For each URL below, check dark and light theme at desktop width, then at `resize_window` preset `mobile`. Look for heading or label clipping, header/nav truncation, and wrap regressions. Restore the `desktop` preset at the end.

1. `http://localhost:3003/`: hero, stats, tracer demo.
2. `http://localhost:3003/courses/dsa` and `http://localhost:3003/courses/dsa/arrays`: card titles.
3. `http://localhost:3003/courses/dsa/arrays/contiguous-memory`:
   - four `// 01`–`// 04` labels, the hairlines, the callout, the diagram;
   - the quiz "Check yourself" rule spans the whole header row;
   - `*emphasis*` is upright 500 and `**strong**` is 700.
4. `http://localhost:3003/courses/dsa/binary-trees/construct-binary-tree-from-preorder-and-inorder`: the title wraps no worse than 2 lines on desktop.
5. `http://localhost:3003/courses/nextjs/system-design-and-scale/specialized-career-tracks/startup-track-rapid-tooling`: the 77-character title.
6. `http://localhost:3003/courses/dsa/arrays/practice`: the Problems and Cheatsheet headings show a hairline and **no** number.
7. `http://localhost:3003/courses/dsa/problems`, then open the first problem: the Description pane h2 has a hairline and no number; the sandbox editor still uses JetBrains Mono.
8. The coach panel on that problem: open it and confirm bubble text is Space Grotesk.
9. The five diagram lessons; no label clips:
   - `/courses/nextjs/data-lifecycle/the-fetching-model-and-cache-hierarchy/the-server-side-cache-matrix`
   - `/courses/nextjs/data-lifecycle/server-actions-and-react-19-mutations/server-actions-architecture`
   - `/courses/nextjs/data-lifecycle/server-actions-and-react-19-mutations/cache-invalidation-mechanics`
   - `/courses/nextjs/data-lifecycle/alternative-fetching-paradigms/third-party-data-fetching`
   - `/courses/nextjs/interactive-mock-interview-drills/system-design-sessions/system-design-distributed-cache-handlers`
10. Search dialog (⌘K): results render in Space Grotesk.

- [ ] **Step 5: Accessibility tree.** On URL 3, run `read_page` and confirm each h2's name is its heading text only (for example `What an array actually is`) with no `// 01`. Then run in `javascript_tool`:

```js
[...document.querySelectorAll(".handbook-prose h2")].map((h) => getComputedStyle(h, "::before").content)
```

Expected: every entry contains `counter(chapter` or the resolved `"// 0N"`, confirming the label renders even though it is not announced.

- [ ] **Step 6: Font bytes after.** On URL 3, reload and rerun the baseline snippet from Execution setup. Record **AFTER_FONT_KB**. If `AFTER_FONT_KB − BASELINE_FONT_KB > 30`, report it as a finding.

- [ ] **Step 7: Screenshots.** Capture the Arrays lesson top section in dark and light at desktop width for the report.

- [ ] **Step 8: Delete the temporary mockups** (main working tree; these were never tracked):

```bash
rm /Users/tharunk/leetExpert/web/public/__h2-options-1.html /Users/tharunk/leetExpert/web/public/__h2-options-2.html /Users/tharunk/leetExpert/web/public/__h2-options-3.html /Users/tharunk/leetExpert/web/public/__h2-options-italics.html
ls /Users/tharunk/leetExpert/web/public | grep __h2 || echo "clean"
```

Expected: `clean`.

- [ ] **Step 9: Commit**

```bash
git add CLAUDE.md
git commit -m "$(printf 'docs(claude): record the Space type system in design doctrine\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

- [ ] **Step 10: Report.** Report the test count, `BASELINE_FONT_KB` vs `AFTER_FONT_KB`, the retuned `CH_*` values (old → new), screenshots, and any defect found in passing. Then use superpowers:finishing-a-development-branch.
