# Space type system — design

**Date:** 2026-09-11
**Status:** draft — awaiting owner review
**Supersedes (partial):** `2026-07-31-leetexpert-handbook-identity-design.md` —
the Sora / Inter face assignments and the family-accent chapter bar only.
Palette, surfaces, shadow and code colour are unchanged.

---

## 1. Why

The section heading reads as UI chrome, not as a chapter marker. It was
designed around a per-family accent: a 5px pill above the h2 plus a 12%
accent wash behind it (`globals.css` `.handbook-prose h2` / `::before`).
When family colour was removed from chrome and prose, `--family-accent`
became empty on lesson pages and both fell back to steel. In dark mode that
means a bright grey pill over a grey rounded box.

The owner also wants typography with character that reads as *coding*,
applied as one identity across the whole product.

Decisions were made against rendered mockups using the real token values in
both themes. Rejected alternatives are listed in §9.

## 2. Font tokens

| Token | Was | Becomes | Role |
| --- | --- | --- | --- |
| `--font-display` | Sora | **Space Mono** 400 / 700 | wordmark, hero, lesson title, h2/h3, card titles, every `font-display` call site |
| `--font-sans-face` | Inter | **Space Grotesk** (variable 300–700) | all body and UI text |
| `--font-mono-face` | JetBrains Mono | JetBrains Mono (unchanged) | code blocks, CodeMirror, Shiki, mono UI labels |

- The swap happens once, in `web/src/app/layout.tsx`, through `next/font/google`.
  The CSS variable names stay the same, so no component changes its font
  reference.
- Space Grotesk is Space Mono's proportional sibling (same designer, same
  letterforms), which is why heading and body read as one system.
- JetBrains Mono stays for code, so a Space Mono heading is never confused
  with a code block.
- `Mermaid.tsx:55` hardcodes an `Inter` fallback. It becomes `Space Grotesk`.
- `FontSwapReflowDiagram`'s `"Inter"` label is Next.js lesson content about
  font swapping, not styling. It stays.

### 2.1 Display weights

Space Mono ships only 400 and 700. There are 41 `font-display` uses across 19
files. In 18 of those files the display font is paired with a weight
utility: 28 `font-semibold` and 9 `font-bold`. A 600 request would be
synthesised or rounded by the browser, so every display call site uses 400
or 700 explicitly. The 28 `font-semibold` become `font-bold`, and the CSS
rules on `.handbook-prose h2/h3` change from `600` to `700`.

## 3. Emphasis (option b)

Space Grotesk has no italic; the Google Fonts API returns 400 for `ital`.
The course markdown contains about 988 `*emphasis*` spans.

- `em` and `i` render **upright at weight 500**, in ink colour.
- `strong` and `b` move from 600 to **700**.
  *(Refinement to option b, flagged for owner review.)* In the mockup,
  emphasis at 500 and strong at 600 looked nearly identical. Widening the
  gap to 500 vs 700 keeps option b's "weight, not slant" choice while
  keeping emphasis and strong distinguishable.
- The rule is global, not scoped to `.handbook-prose`. `CoachMarkdown`
  renders model output outside prose, and its `[&_strong]:font-semibold`
  becomes `font-bold`.
- Code is excluded. `em` / `i` inside `code`, `pre`, `kbd` and `samp` keep
  their own style, and Shiki's italic comment tokens (inline styles, not
  `em`) are unaffected.

## 4. Chapter headings (option A)

### 4.1 Article h2

- The `::before` pill and the `--family-wash` background are removed.
- A 1px hairline goes above the heading: `border-top: 1px solid var(--rule-strong)`.
  `--rule-strong` is a new token defined in both themes beside
  `--press-rule`, at twice its alpha (0.18). This follows the "all colour
  through tokens" rule.
- A label `// 01` sits above the heading text, set in Space Mono 400 at
  about 0.56em in `--muted`. It is generated with
  `counter-increment` / `content: "// " counter(sec, decimal-leading-zero) / ""`,
  so no markdown file changes.
- **The `/ ""` alternative text is required.** Chrome, Safari and Firefox
  include `::before` text in a heading's accessible name. Without it, every
  h2 would be announced as "slash slash zero one, What an array actually
  is", and the in-page heading list would be cluttered with numbers. The
  empty alt text makes the label decorative. It is checked in the
  browser's accessibility tree during verification (§8).
- The counter resets on the `.handbook-prose` root (`Markdown.tsx:269`).
  `LessonView` renders exactly one `Markdown` per lesson, and a test enforces
  that numbering doesn't restart mid-lesson (§7).
- **Problem panes** (`.problem-prose`) keep the hairline but have no number.
  A problem statement is scanned, not read in sections.

### 4.2 One shared heading, not three copies

Three components hand-copy the old treatment with a `3px × w-10` span plus a
display `<p>`:

- `Quiz.tsx:232` ("Check yourself")
- `Cheatsheet.tsx:45`
- `PracticeProblemsList.tsx:38`

The treatment moves into `globals.css` as two classes:

- `.chapter-heading` holds the typography. It is shared with
  `.handbook-prose h2` through one selector list.
- `.chapter-rule` holds the hairline.

The hairline needs its own class because the Quiz and Problems headings sit
inside a flex row (measured on the Arrays lesson: the heading is 139px wide
and its header row is 864px). A border on the heading would span only the
heading, so the rule goes on the row. Component headings get the hairline
and Space Mono, but **no counter**, because they aren't article sections.
The copy-paste comment that let them drift is deleted.

The global `em` / `strong` rules (§3) live in `@layer base`, not unlayered.
Unlayered rules beat every Tailwind utility, and
`BigOObservatory.tsx:151` sets `<strong className="font-medium">` on
purpose.

### 4.3 h3 and lesson title

- **h3:** Space Mono 700. Size stays at `1.14em`, because
  `Roadmap.tsx:15` derives its rail-disc offset from `1.14em × 1.62`.
  Changing the size would silently misalign the roadmap.
- **Lesson h1** (`LessonView.tsx:63`): the `uppercase` class is dropped, so
  titles render in title case. Uppercase in a wide monospaced face makes
  57-character titles ("Construct Binary Tree from Preorder and Inorder
  Traversal") wrap to 2 lines on desktop and 4–5 on mobile. This will be
  confirmed in the browser at 375px before sign-off. `.press-overprint` is
  kept.

## 5. Diagrams that estimate text width

Five Next.js-course diagrams size their viewBox from hand-set sans-serif
character advances tuned to Inter:

- `CacheLayerFallthroughDiagram`
- `DistributedCacheHandlerDiagram`
- `QueryHydrationHandoffDiagram`
- `ServerActionRpcDiagram`
- `CacheInvalidationScopeDiagram`

Examples are `CH_TITLE = 7.0`, `CH_CAPTION = 5.0` and `CH_PILL = 4.8`.
Space Grotesk is wider, so labels would clip.

- The sans-serif constants are **re-measured, not re-guessed**. A checked-in
  script under `web/scripts/` computes the mean advance of each diagram's
  real label strings at each role's size and weight from the Space Grotesk
  font file. Each constant gets its measured value and source in a comment.
- The monospace constants (`CH_MONO`, `CH_CHIP`, `CH_CALL`, …) stay
  unchanged, because JetBrains Mono doesn't change.
- The `ADV` estimate in `tests/cacheLayerFallthroughDiagram.test.tsx`
  ("Inter averages ~0.52em") is **replaced**, not re-based. A shared test
  helper reads real glyph advances with `fontkit` from the shipped faces
  (`@fontsource/space-grotesk` and `@fontsource/jetbrains-mono`, pinned
  devDependencies), and it honours `<tspan>` font overrides and
  letter-spacing.
- A new `tests/diagramTextFit.test.tsx` checks that every label in all five
  diagrams stays inside the viewBox and inside its owning box. Any average
  guess, however conservative, goes stale the next time a face changes;
  measuring the actual glyphs doesn't.
- The same helper prints each type role's widest per-character advance
  (`PRINT_ADVANCES=1`). That value is the floor for each `CH_*` constant,
  so the retuned numbers are reproducible from the repo.

## 6. Performance

Two variable faces (Sora, Inter) are replaced by one variable face (Space
Grotesk) and two static weights (Space Mono 400/700, no italic, since
option b needs none). Font bytes transferred on a lesson page are measured
in the network panel before and after, and the result is recorded in the
implementation report. A regression over +30 KB is a finding, not a pass.

## 7. Tests

Each new or changed test is shown failing against a deliberate fault before
it is trusted (`CLAUDE.md` §2).

1. **Replace** `design-tokens.test.ts:577` ("chapter headings carry the
   family accent bar") with a guard for:
   - the hairline (`var(--rule-strong)`) plus the counter label on
     `.handbook-prose h2`, with the label's `content` ending in `/ ""`, so
     it stays out of the accessible name;
   - no `--family-wash` background on h2;
   - the `.problem-prose` override that removes the number.
2. **Display weight guard:** no source file pairs the display font with a
   weight Space Mono lacks (`font-semibold`, `font-medium`,
   `font-extrabold`, `font-black`, `font-[5-9]00` other than 700).
3. **Font token guard:** `layout.tsx` binds `Space_Mono` to
   `--font-display` and `Space_Grotesk` to `--font-sans-face`, and no
   longer imports `Sora` or `Inter`.
4. **Emphasis guard:** `em` / `i` are upright at 500, `strong` / `b` are
   700, and code contexts are excluded.
5. **Shared heading guard:** `Quiz`, `Cheatsheet` and
   `PracticeProblemsList` use `.chapter-heading`, and the hand-rolled
   `h-[3px] w-10` accent span no longer exists in `src/`.
6. **Counter continuity:** every lesson renders all its h2s inside a single
   `.handbook-prose` root, so numbering can't restart mid-lesson.
7. **Diagram metrics:** the existing fit test passes with the re-based
   `ADV`, and each of the five diagrams is rendered through it.

`tsc`, `eslint`, `npm test` and `npm run build` must all pass.

## 8. Browser verification (both themes; desktop and 375px)

- **Home:** hero, stats, tracer demo, footer.
- **DSA course hub and a module page:** card titles for truncation.
- **Arrays in Memory lesson:** all four sections, callout, diagram, quiz.
- **Long-title lessons:** "Construct Binary Tree from Preorder and Inorder
  Traversal" and the 77-character Next.js track title.
- **A problem workspace:** Description / Explanation panes and the sandbox.
- **Cheatsheet, practice list, coach panel** (with a reply containing
  `*emphasis*` and `**strong**`), and search dialog.
- **Header and sidebar nav:** check for truncation of the wider face.
- **Accessibility tree** (`read_page`) on the Arrays lesson: each h2's
  accessible name is its heading text only, with no "// 01".
- **All five §5 diagrams** in the Next.js course.

Screenshots of the lesson in both themes go in the report.

## 9. Rejected alternatives

- **Heading layouts:**
  - Hanging number: takes width from the reading column.
  - Left rule: collides with blockquote and callout styling.
  - Larger underlined heading: no sense of progress.
- **Heading faces:**
  - Serifs (Fraunces, Young Serif, Newsreader, Instrument Serif, Gloock):
    the owner chose coding faces.
  - JetBrains Mono, Geist Mono, IBM Plex Mono: headings would look like
    code blocks.
  - Monaspace Xenon: strong, but not chosen.
  - Martian Mono and Recursive: not chosen.
- **Body faces:**
  - Inter: doesn't share Space Mono's letterforms.
  - Atkinson Hyperlegible Next: the most legible, but weaker stylistic match.
  - DM Sans, IBM Plex Sans, Archivo, Instrument Sans, Work Sans, Chivo,
    Literata.
- **Scope:**
  - Content-only: two type systems on one page.
  - Keeping Sora for the hero and wordmark: a third brand face.
- **Emphasis:**
  - Synthetic oblique (a): recommended, but the owner chose weight.
  - Space Mono italic (c): monospaced words mid-sentence read as identifiers.

## 10. Out of scope

- The OG and Twitter images, which render with generic `sans-serif`.
- The `video/` subproject and marketing assets.
- Palette, shadow and code-colour tokens.

## 11. Doc and cleanup obligations

- In `CLAUDE.md` §4, replace "Chapter headings carry a short family-accent
  rule above h2" with the hairline and counter rule. Add a typography
  bullet: the three faces and their roles, display weights 400/700 only,
  emphasis by weight.
- Delete the temporary mockups `web/public/__h2-options-*.html` before any
  commit.
