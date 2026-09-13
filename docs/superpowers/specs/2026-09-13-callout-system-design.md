# Callout system — eight callouts, one job each

**Date:** 2026-09-13
**Scope (spec A):** the callout *system* — `Callout.tsx`, the callout branches of
`Markdown.tsx`, `highlightBlocks.ts`'s non-code fence list, `extractThesis.ts`,
the callout tokens in `globals.css`, and the tests that guard them. Rewriting
lesson content to use the system is **spec B** (separate; see §10).
**Status:** proposed — design approved by the owner in brainstorming on
2026-09-13. Implementation is **blocked** until a concurrent session commits its
in-progress edits to `web/src/app/globals.css`, `ProblemWorkspace.tsx` and
`web/tests/design-tokens.test.ts` (§10).

---

## 1. Why this exists

The owner asked to add emoji to lessons for readability. That was declined on
the design system's own terms (OS-rendered colour glyphs bypass tokens and both
themes; screen readers announce them mid-sentence), and two alternatives were
put forward: icons on section headings, and more callouts.

Heading icons were dropped after measurement: problem lessons are already split
into Description / Explanation / Solution / Quiz tabs that carry icons
(`ProblemWorkspace.tsx` `TAB_ICON`), so each tab shows only one or two of the
shared headings; concept lessons' headings are unique (only "The template"
repeats, 5×), so no fixed heading→icon map exists; concept lessons already have
an "On this page" table of contents.

Callouts survived, but auditing them showed the system itself cannot carry more
weight yet: types collide in colour, the most load-bearing one is the faintest,
and most types are used for the wrong job. This spec fixes the system so that
spec B can use it.

Every number below was measured — `getComputedStyle` on the running app, or
computed from the hex tokens in `globals.css` — not estimated. One claim made
during the audit was wrong and is corrected in §2.4.

---

## 2. Current state (measured)

### 2.1 Types, usage, colour

| Type | Authoring | Label | Rule/icon ink | Icon | Uses (DSA / Next.js) |
| --- | --- | --- | --- | --- | --- |
| constraint | ` ```constraint ` | Constraints | `good` | ListChecks | 116 / 0 — required by `content.test.ts:706` |
| tip | ` ```tip ` | Tip | `warn` | Lightbulb | 3 / 9 |
| goal | ` ```goal ` | Goal | `info` | Info | 3 / 0 |
| warn | ` ```warn ` | Watch out | `warn` | WarningCircle | 0 / 40 |
| brain | ` ```brain ` | Mental model | `insight` | Brain | 0 / 23 |
| note | ` ```note ` | Note | `info` | Info | 0 / 0 |
| build | 🏗️ in a blockquote | Build | `good` | RocketLaunch | 0 / 0 |
| rocket | 🚀 in a blockquote | Ship | `info` | Info | 0 / 0 |
| default | `> …` | — | `border` (9% alpha) | — | 70 lessons, 295 lines / 0 |
| aside | ` ```aside ` | — (`MarginNote`) | `info` | — | 1 / 0 |
| hint | ` ````reveal Label ` | label | neutral | CaretRight | 313 / 54 — ≥1 per problem required by `content.test.ts:481` |

The Next.js course is disabled (`web/src/app/courses/nextjs/layout.tsx` calls
`notFound()`), so `warn` and `brain` currently render nowhere.

### 2.2 Colours collide

Ink tokens, with contrast on `--press-paper-sunk` (the deepest surface):

| Role | Light | Dark |
| --- | --- | --- |
| `warn` (amber) | `#92400e` 5.21:1 | `#f59e0b` 9.10:1 |
| `insight` (gold) | `#854d0e` 5.03:1 | `#facc15` 12.77:1 |
| `bad` (red) | `#b91c1c` 4.75:1 | `#f15858` 5.84:1 |
| `good` (green) | `#036f42` 4.60:1 | `#22d497` 10.18:1 |
| `info` (sky) | `#075985` 5.56:1 | `#38bdf8` 9.13:1 |
| `mark` (steel) | `#1e293b` 10.75:1 | `#cbd5e1` 13.17:1 |

- **amber vs gold: ΔE76 = 13.0 in light, 25.7 in dark** — the closest pair in
  both themes. On a 2px rule, light mode cannot separate them. Tip, Watch out
  and Mental model therefore read as one colour.
- goal, note and rocket share `info` *and* the Info icon; constraint and build
  share `good`.
- `design-tokens.test.ts:614` currently locks this mapping in, including
  `tip: "border-l-warn"`.

### 2.3 The most load-bearing callout is the faintest

The plain blockquote carries each lesson's thesis — and the coach reads it:
`extractThesis.ts:78` uses the first blockquote when a problem's Explanation has
no "The insight" heading.

- 23 problem lessons have no "The insight" heading; **22** fall back to a
  blockquote; **1** (`prefix-sum/range-sum-2d-immutable.md`) has neither, so its
  coach thesis is empty (spec B).
- Of 93 "The insight" sections, **43** open with a blockquote.
- It renders with no label and a `border` rule at 9% alpha — near-invisible in
  dark.
- Not every blockquote is a thesis: `math-for-dsa/modular-arithmetic.md:34-35`
  uses `>` to display formulas.

### 2.4 Type size (corrects an audit claim)

Callout body is fixed at `text-[0.95rem]`; prose is `--prose-size`
(`1.1875rem` = 19px desktop; `1.2rem` / `1.27rem` at the laptop steps, which
shrink the root) and `0.875rem` inside `.problem-prose`.

- Reading page: callout body is **80%** of the prose at the desktop size
  (15.2px in 19px), and measured **75%** at the laptop step (12.35px in
  16.51px, root 13px, on `the-call-stack-and-base-cases`).
- Problem pane: callout body is **≈109%** of the prose around it (`0.95rem` in
  `0.875rem`).
- `MarginNote` is `0.92em` — 92% of its context everywhere.

The audit first reported the aside as "10.5px, unreadable". That reading came
from a zoomed viewport where the pane's own prose measured 11.4px; the aside is
92% of its context, not tiny. Withdrawn. The real defect is the fixed-`rem`
callout body, which is wrong in opposite directions on the two layouts.

### 2.5 Other verified defects

- **Copy button is invisible to keyboard users.** Focused via keyboard on
  `/courses/dsa/problems/move-zeroes`: `document.activeElement` was the button,
  computed `opacity` stayed `0`, and it carries no focus class
  (`opacity-0 … group-hover:opacity-100` only). Violates CLAUDE.md §5 "visible
  focus states".
- **No test guards callout fence names.** A typo (` ```wran `) silently renders
  as a code block. The `allowed` set at `content.test.ts:556` checks practice
  slugs, not fence names. Violates CLAUDE.md §5 "a string id typo must fail CI".
- **Dead code:** `note`, `build`, `rocket` have zero uses; `detectCalloutType`
  (`Markdown.tsx:41`) matches emoji no lesson contains.

### 2.6 Verified working — do not change

`Reveal.tsx`: on `move-zeroes`, both hint bodies were absent from the DOM while
closed (`aria-expanded="false"`, no sibling node), and present after opening.
Ctrl+F cannot surface a hint. `extractHints.ts` reads only `reveal` fences.

---

## 3. The set — eight callouts, one job each

| Callout | Authoring | Job | Not for |
| --- | --- | --- | --- |
| **Key idea** | ` ```key ` (new) | The one claim a section concludes. At most one per `##` section. In problems, sits under "The insight". | Formulas, quotations, summaries of a paragraph just read |
| **Mental model** | ` ```brain ` | A picture you reason *with*, naming what it predicts ("hydration is a matching process, so any divergence breaks it"). Spatial/structural lessons only. | Summaries — those are Key ideas |
| **Watch out** | ` ```warn ` | One concrete mistake: its trigger (an input or situation) and its consequence. Code claims are executed in Python and JavaScript. | Emphasis ("this is foundational") |
| **Tip** | ` ```tip ` | Optional practical help: a technique, a shortcut, how to test your answer. | "Try it first" nudges (Attempt-it-first prose), mistakes, claims |
| **Goal** | ` ```goal ` | Exactly what to return, stated precisely. Problem Description only. | Strategy hints |
| **Constraints** | ` ```constraint ` | Input bounds. Unchanged. | — |
| **Aside** | ` ```aside ` | First-person author note, 1–2 sentences, never needed to follow the lesson. Unchanged. | Content the lesson depends on |
| **Hint** | ` ````reveal Label ` | Staged help. Unchanged. | — |

**Density rule (all types):** callouts are the exception. Never two adjacent;
never one that restates the paragraph before it.

Removed: `note`, `build`, `rocket`, and emoji detection.

Spec A enforces the set (types, names, rendering). The *job* column is an
authoring rule that tests cannot judge; spec B applies it and CLAUDE.md §3
records it (§7).

---

## 4. Colour = the type of message

Colour carries a *category*; the label and icon carry the exact type. Each
colour means what it already means elsewhere in the app (red = wrong in the
sandbox and quiz; green = satisfied; gold = the Insight panel).

| Ink | Category | Callouts |
| --- | --- | --- |
| `bad` red | a mistake | Watch out |
| `insight` gold | understanding | Key idea, Mental model |
| `info` sky | context | Goal, Aside (differs in form: margin text, no label) |
| `good` green | a requirement | Constraints |
| `mark` steel | practical advice | Tip |
| neutral | hidden until opened | Hint |

`warn` amber is no longer used by any callout, which removes the ΔE 13
collision outright.

Icons (Phosphor, `regular`): Key idea `Key`; Mental model `Brain`; Watch out
`WarningCircle`; Goal `Target` (was `Info`); Constraints `ListChecks`; Tip
`Lightbulb`. Icons stay `aria-hidden`; the label is the accessible name.

**Rejected:**
- *A new hue per type* — needs new tokens and puts 7–8 hues back in the reading
  column, reversing the 2026-08-27 "carrier, not volume" decision and the
  Blueprint monochrome base.
- *Monochrome, label + icon only* — Watch out loses its signal; the reason for
  this work.
- *Tip in amber* (freed by Watch out moving to red) — indistinguishable from Key
  idea's gold in light mode (ΔE 13). Mocked; confirmed by eye.

---

## 5. Two tinted callouts: Watch out and Tip

Every callout keeps the 2px left rule + small uppercase muted label, on the
page's own background (2026-08-27 §6.2). **Watch out and Tip additionally carry
a wash**, so the two callouts meant to catch the eye are the only filled ones.

**Parity rule:** Watch out's wash must stand off the ground by at least as much
as Tip's — a mistake is never quieter than advice. (A Tip-only wash was mocked
and rejected: it made Tip the loudest element on the page.)

### 5.1 Tokens

Washes are **alpha tokens**, not solid hex. Both measured layouts paint callouts
on `--elevated` (§5.2), so a hex would work today — but alpha is the existing
idiom for status tints (`bg-bad/5`…`/15`, `bg-good/10` in `src/components`), and
it stays correct if a callout renders on another ground (a quiz explanation, the
coach panel) without a second token.

```css
/* :root (light) */
--wash-bad: color-mix(in srgb, var(--bad) 9%, transparent);
--wash-tip: color-mix(in srgb, var(--surface) 50%, transparent);
/* .dark */
--wash-bad: color-mix(in srgb, var(--bad) 12%, transparent);
--wash-tip: color-mix(in srgb, var(--surface) 50%, transparent);
/* @theme */
--color-wash-bad: var(--wash-bad);
--color-wash-tip: var(--wash-tip);
```

Named `wash-*`, not `*-surface`: the existing `--{info,good,warn,insight}-surface`
tokens are solid pastels with their own test (`design-tokens.test.ts:639`), and
reusing the suffix for an alpha token would make that test's `firstHexVar`
assumption silently wrong.

### 5.2 Measured

Problem pane (`--elevated`: light `#ffffff`, dark `#26262a`), live mock:

| Theme | Tip wash step | Watch out wash step | Label (muted) on Tip / Watch out | Body on Watch out | Red icon on its wash | Steel icon on Tip wash |
| --- | --- | --- | --- | --- | --- | --- |
| light (bad 9%) | 1.16 | 1.16 | 5.49 / 5.48 | 14.10 | 5.56 | 12.59 |
| dark (bad 12%) | 1.16 | 1.16 | 7.34 / 5.46 | 11.05 | 3.90 | 11.82 |

Reading page (`/courses/dsa/recursion-backtracking/the-call-stack-and-base-cases`),
measured live in both themes: the reading column also paints **`--elevated`**
behind callouts (light `#ffffff`, dark `#26262a`), not `--background`, so every
ratio is identical to the table above (washes: light Tip `#eceef4`, Watch out
`#f9ebeb`; dark Tip `#19191c`, Watch out `#3e2c30`).

`--background` as a defensive ground, computed from tokens (light `#f1f4f9`):
Tip step 1.11, Watch out step 1.16, label 5.22 / 4.98 — parity and floors hold.
Dark `--background` is left to the §8 test, which resolves tokens from source: a
hand-written resolver used during the audit misread the `.dark` block, and its
dark numbers were discarded.

Floors: body and label ≥ 4.5:1 (AA text); icon ≥ 3:1 (UI graphic); Watch out
step ≥ Tip step on every ground.

**Rejected — strong washes** (Tip at 100% `--surface`, red 18% light / 20%
dark): label fell to 4.67:1 in light, and even red 20% could not match Tip's
step in dark (1.29 vs 1.30). It would be the heaviest fill in the reading column
and reintroduce the chromatic box that 2026-08-27 §6.2 removed.

---

## 6. Component changes

### 6.1 `Callout.tsx`

- `CalloutType` becomes `"key" | "brain" | "warn" | "tip" | "goal" | "constraint" | "default"`.
- Rule/icon inks per §4; labels: `key` "Key idea", `brain` "Mental model",
  `warn` "Watch out", `tip` "Tip", `goal` "Goal", `constraint` "Constraints".
- `warn` adds `bg-wash-bad`, `tip` adds `bg-wash-tip`, each with the vertical
  padding and right-side radius the mock used so text does not touch the wash
  edge. No other type gets a background.
- Body size: `text-[0.95rem]` → `1em` (inherit), so callouts match the prose on
  both layouts (§2.4).
- `default` (plain `>`) rule: `border-l-border` → `border-l-rule-strong`, so a
  quotation or formula display is visible without claiming to be a Key idea.
  No label. `--rule-strong` exists (`globals.css:87`) but has no `@theme`
  mapping, so add `--color-rule-strong: var(--rule-strong);` to `@theme inline`
  — without it the class is never generated and the rule silently disappears.
- Copy button: add `focus-visible:opacity-100` plus the app's focus idiom
  (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`,
  the most-used focus classes in `src/components`), so keyboard users can see
  what they have focused.

### 6.2 `Markdown.tsx`

- Fenced branch accepts `key | brain | warn | tip | goal | constraint`; drop
  `note`.
- Delete `detectCalloutType`; `blockquote` always renders `type="default"`.

### 6.3 `highlightBlocks.ts`

- `NON_CODE_LANGS`: add `key`, remove `note`. Without this a `key` fence is
  sent to Shiki as a code language.

### 6.4 `extractThesis.ts` — the coach must read Key ideas

Today, inside "The insight", collection **stops at the first `code` node** — a
` ```key ` fence is a `code` node, so a Key idea opening the section would yield
an empty thesis.

New order:
1. "The insight" section: collect prose as today, but a `code` node with
   `lang === "key"` contributes its body as prose instead of ending collection.
   Any other `code` node still ends it.
2. No "The insight" heading: the first `key` fence in the Explanation.
3. Otherwise the first blockquote (unchanged, so the 22 fallback lessons keep
   working before spec B migrates them).
4. Otherwise empty.

`seo/description.ts` already skips fences and `>` lines, so Key idea text stays
out of meta descriptions exactly as blockquotes do today.

### 6.5 Not changed

`Reveal.tsx`, `MarginNote.tsx` (aside keeps `0.92em` and `info`),
`extractHints.ts`, `splitProblemTabs.ts`.

### 6.6 Next.js course

`warn`, `brain` and `tip` keep their names, so its 72 uses need no migration;
they pick up the new colours. The course stays disabled.

---

## 7. Documentation

CLAUDE.md §4 gains a callout rule: the eight types, "colour = the type of
message", washes only on Watch out and Tip with the parity rule, and "callout
body inherits prose size". CLAUDE.md §3 gains the job column of §3 and the
density rule, so content authors and agents apply it.

---

## 8. Tests

Each new or changed test must be shown to fail first (introduce the fault,
watch it fail, restore) per CLAUDE.md §2.

1. **`design-tokens.test.ts:614`** — rewrite to the §4 mapping: `key` and
   `brain` → `border-l-insight`; `warn` → `border-l-bad` + `bg-wash-bad`; `tip`
   → `border-l-mark` + `bg-wash-tip`; `goal` → `border-l-info`; `constraint` →
   `border-l-good`; no `border-l-warn` anywhere in `Callout.tsx`; no
   `note|rocket|build` keys; body carries no fixed `rem` size.
2. **New — wash tokens clear their floors on both grounds, both themes.**
   Resolve `--bad`, `--surface`, `--muted`, `--foreground`, `--mark`,
   `--background`, `--elevated` from `globals.css`; composite each wash over
   each ground; assert label and body ≥ 4.5, icon ≥ 3, and
   step(Watch out) ≥ step(Tip). Record the ratios in comments beside the tokens
   (CLAUDE.md §4 "contrast is measured").
3. **New — every lesson fence language is known** (`content.test.ts`): each
   fence opener in `courses/**/*.md` must be a Shiki language or alias
   (`SUPPORTED_LANGS` / `LANG_ALIASES` in `highlight.ts`), a member of
   `NON_CODE_LANGS` (`highlightBlocks.ts`), or one of the four fences handled
   outside both lists: `tabs` and `reveal` (`Markdown.tsx`), `sandbox`
   (`extractSandboxFence.ts`), `viz` (`Markdown.tsx`). All three lists are
   module-private today; export them so the test derives the set rather than
   re-typing it. All 25 fence names used in lessons today are covered (7
   languages/aliases, 14 non-code fences, the 4 above), so the test starts
   green. Prove it can fail with a lesson copy containing ` ```wran `.
4. **`coach-thesis.test.ts`** — add: Key idea fence opening "The insight" is
   the thesis; `key` fence used when no heading; blockquote fallback still
   works; a non-`key` code fence still ends collection.
5. **Render test** (new `tests/callout.test.tsx`, `renderToStaticMarkup` from
   `react-dom/server` as in `codeTabs.test.tsx` and `courseNavPanel.test.tsx`) —
   ` ```key ` renders a `Callout` labelled "Key idea"; `>` renders unlabelled; an
   emoji blockquote no longer changes type; `note` is no longer a callout.
6. **Copy button** — class carries `focus-visible:opacity-100`.

## 9. Verification

`tsc --noEmit`, `eslint`, `npm test`, `npm run build` (after stopping any dev
server using `web/.next`), then the browser: a problem pane
(`valid-palindrome`: Goal, Constraints, Tip) and a reading page
(`the-call-stack-and-base-cases`: blockquote), both themes; keyboard-focus the
copy button; confirm the coach thesis for one lesson of each §6.4 path.

---

## 10. Out of scope

**Spec B — content pass** (depends on A):
- Audit the 70 blockquote lessons: true theses → ` ```key `; formula/quotation
  displays stay `>`.
- Watch outs for the 46 buried trap mentions in DSA lessons ("off-by-one" ×25,
  "the trap" ×9, "classic bug" ×6, "pitfall" ×2, four single phrasings; at
  least 34 lessons), each trigger and consequence executed in both languages.
- Re-sort existing Tips (3 DSA "try it first" nudges → prose) and Next.js
  `brain`/`warn`/`tip` uses per §3's job column.
- Decide Goal: roll out to all 116 problems or retire.
- Give `range-sum-2d-immutable` a thesis.

**Elsewhere:**
- `--warn-surface` and `--insight-surface` are unused by components
  (`--info-surface`/`--good-surface` are used by `HomePage.tsx` and
  `CoachPanel.tsx`).
- CLAUDE.md repo map names an empty `course/` — filed as a separate task.
- Observed, not investigated: the code editor pane renders light in dark theme
  and dark in light theme.

**Sequencing:** a concurrent session has uncommitted edits to `globals.css`,
`ProblemWorkspace.tsx` and `design-tokens.test.ts`. Implementation of this spec
touches two of those files and must start from their committed state.
