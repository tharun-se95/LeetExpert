# Callout system — eight callouts, one job each

**Date:** 2026-09-13 · **Revised:** 2026-09-14 (treatment B on the contribution
green palette; supersedes the washes-on-two-types design) · **Amended:** 2026-09-15
(rules on the grainy problem panes, §5.3)
**Scope (spec 2 of 3):** the callout *system* — `Callout.tsx`, the callout branches
of `Markdown.tsx`, `highlightBlocks.ts`'s non-code fence list, `extractThesis.ts`,
the callout tint tokens in `globals.css`, and their tests. Colours come from spec 1,
`2026-09-14-contribution-green-palette-design.md`, which must land first. Rewriting
lesson content to use the system is a later content spec.
**Status:** implementation in progress on branch `callout-b` — decisions made by the
owner in brainstorming on 2026-09-13, 2026-09-14 and 2026-09-15.

---

## 1. Why this exists

The owner asked to add emoji to lessons for readability. That was declined on the
design system's own terms (OS-rendered colour glyphs bypass tokens and both
themes; screen readers announce them mid-sentence). Icons on section headings were
dropped after measurement: problem lessons are already split into tabs that carry
icons, and concept lessons' headings are unique. Callouts survived, but the audit
showed the system could not carry more weight: types collided in colour, the most
load-bearing one was the faintest, and light-mode callouts were dull.

## 2. Current state (measured 2026-09-13)

| Type | Authoring | Label | Ink today | Uses (DSA / Next.js) |
| --- | --- | --- | --- | --- |
| constraint | ` ```constraint ` | Constraints | `good` | 116 / 0 — required by `content.test.ts:706` |
| tip | ` ```tip ` | Tip | `warn` | 3 / 9 |
| goal | ` ```goal ` | Goal | `info` | 3 / 0 |
| warn | ` ```warn ` | Watch out | `warn` | 0 / 40 |
| brain | ` ```brain ` | Mental model | `insight` | 0 / 23 |
| note / build / rocket | fence or emoji | — | — | 0 / 0 |
| default | `> …` | — | 9% rule | 70 lessons, 295 lines |
| aside | ` ```aside ` | — (`MarginNote`) | `info` | 1 / 0 |
| hint | ` ````reveal Label ` | label | neutral | 313 / 54 |

- Amber (`warn`) and gold (`insight`) are ΔE76 13.0 apart in light mode, so Tip,
  Watch out and Mental model read as one colour.
- The plain blockquote carries lesson theses and the coach reads it
  (`extractThesis.ts:78`): 22 of 23 problems without "The insight" fall back to it;
  43 of 93 "The insight" sections open with one. `modular-arithmetic.md` uses `>`
  for formulas.
- Callout body is a fixed `0.95rem`: 75–80% of reading prose, ~109% of problem-pane
  prose.
- The copy button stays at opacity 0 under keyboard focus.
- No test guards fence names; a typo renders as a code block.
- `Reveal.tsx` works: hint bodies are absent from the DOM while closed.

## 3. The set — eight callouts, one job each

| Callout | Authoring | Job | Not for |
| --- | --- | --- | --- |
| **Key idea** | ` ```key ` (new) | The one claim a section concludes. At most one per `##` section. | Formulas, quotations, summaries |
| **Mental model** | ` ```brain ` | A picture you reason with, naming what it predicts. Spatial/structural lessons only. | Summaries |
| **Watch out** | ` ```warn ` | One concrete mistake: trigger and consequence, executed in both languages. | Emphasis |
| **Tip** | ` ```tip ` | Optional practical help. | "Try it first" nudges, mistakes, claims |
| **Goal** | ` ```goal ` | Exactly what to return. Problem Description only. | Strategy hints |
| **Constraints** | ` ```constraint ` | Input bounds. | — |
| **Aside** | ` ```aside ` | First-person author note, 1–2 sentences. | Content the lesson depends on |
| **Hint** | ` ````reveal Label ` | Staged help. Unchanged. | — |

Never two callouts adjacent; never one that restates the paragraph before it.
Removed: `note`, `build`, `rocket`, and emoji detection.

## 4. Colour = the kind of message

| Category | Hue (spec 1) | Callouts |
| --- | --- | --- |
| understanding | yellow (`insight`) | Key idea, Mental model |
| a mistake | red (`bad`) | Watch out |
| context | blue (`info`) | Goal, Aside |
| a requirement | green (`good`) | Constraints |
| advice | steel (no hue) | Tip |
| hidden until opened | neutral | Hint |

Icons (Phosphor `regular`, `aria-hidden`): Key idea `Key`, Mental model `Brain`,
Watch out `WarningCircle`, Goal `Target`, Constraints `ListChecks`, Tip `Lightbulb`.

## 5. Treatment B (owner decision), with A as the declared fallback

Every labelled callout (not Aside, not Hint, not the plain blockquote) gets:

- a **tint** background, `--callout-tint-{category}`;
- a **3px left rule** in the category's `--{role}-line` — spec 1's generated,
  grain-safe line: light level 3, darkened only where grain requires; dark level 4
  (§5.3);
- a **label and icon** in the category's text colour `--{role}` (bold, uppercase,
  `0.7rem`), body text in ink.

**Fallback A** is the same callout with no tint. Because the rule, label and body
are identical between A and B, switching is a token change: set the five
`--callout-tint-*` tokens to `transparent`. Nothing else in the component or tests
changes except the tint test's expectations (§8.2).

### 5.1 Tokens

```css
/* :root — level 1 mixed 50% into the card */
--callout-tint-understanding: color-mix(in srgb, var(--hue-yellow-1) 50%, var(--elevated));
--callout-tint-mistake:       color-mix(in srgb, var(--hue-red-1) 50%, var(--elevated));
--callout-tint-context:       color-mix(in srgb, var(--hue-blue-1) 50%, var(--elevated));
--callout-tint-requirement:   color-mix(in srgb, var(--hue-green-1) 50%, var(--elevated));
--callout-tint-advice:        color-mix(in srgb, var(--surface) 50%, var(--elevated));
--advice-line:                #64748b;
/* .dark — the same mix at 70% */
--callout-tint-understanding: color-mix(in srgb, var(--hue-yellow-1) 70%, var(--elevated));
--callout-tint-mistake:       color-mix(in srgb, var(--hue-red-1) 70%, var(--elevated));
--callout-tint-context:       color-mix(in srgb, var(--hue-blue-1) 70%, var(--elevated));
--callout-tint-requirement:   color-mix(in srgb, var(--hue-green-1) 70%, var(--elevated));
--callout-tint-advice:        color-mix(in srgb, #3a3f48 70%, var(--elevated));
--advice-line:                #cbd5e1;
/* @theme */
--color-callout-tint-understanding: var(--callout-tint-understanding);
--color-callout-tint-mistake:       var(--callout-tint-mistake);
--color-callout-tint-context:       var(--callout-tint-context);
--color-callout-tint-requirement:   var(--callout-tint-requirement);
--color-callout-tint-advice:        var(--callout-tint-advice);
--color-advice-line:                var(--advice-line);
--color-rule-strong:                var(--rule-strong);
```

Tip's steel has no palette hue: light uses `--surface`; dark uses a stand-in level
1, `#3a3f48`, chosen to sit on the same step as the hue tints. Its rule is
`--advice-line` (light `#64748b` = 4.10:1 on its tint, dark `#cbd5e1` = 7.93:1),
and its label is `--mark`. Mixing into `--elevated` (not a literal) keeps a tint
right if `--elevated` changes.

### 5.2 Measured

On `--elevated` (light `#ffffff`, dark `#26262a`), where both layouts paint
callouts:

| Category | Light tint · off card · label · body · rule on tint | Dark tint · off card · label/rule · body |
| --- | --- | --- |
| understanding | `#f5e9ba` · 1.22 · 5.40 · 13.47 · **2.91** | `#3c330d` · 1.20 · 5.89 · 10.64 |
| mistake | `#ffe1de` · 1.23 · 5.89 · 13.34 · 3.09 | `#4a2727` · 1.16 · 5.76 · 11.04 |
| context | `#dbebff` · 1.21 · 5.53 · 13.54 · **2.94** | `#20344e` · 1.19 · 5.94 · 10.70 |
| requirement | `#cdf4d3` · 1.20 · 5.15 · 13.65 · **2.76** | `#153b29` · 1.21 · 6.28 · 10.53 |
| advice | `#eceef3` · 1.16 · 12.60 · 14.13 · 4.10 | `#34383f` · 1.28 · 7.93 · 9.97 |

**Known compromise (light):** understanding, context and requirement rules fall
under 3:1 against their own tint (2.76–2.94). They clear 3:1 against the page
beside them (spec 1 §4.3: 3.32–3.56 on `--elevated`), and the tint itself marks the
callout's shape, so the rule is reinforcement, not the only boundary. The owner saw
and accepted this on the preview.

**Flag for review — Watch out is no longer the strongest tint in dark.** The
2026-09-13 design required Watch out to stand off the card at least as much as Tip.
With a tint on every type, dark Tip (1.28) now out-steps dark Watch out (1.16) —
the owner-approved 70% setting. This spec replaces that rule with: *every tint
steps 1.15–1.30 off the card in both themes; Watch out's distinction comes from its
hue (the only red callout), not its strength.* If the owner wants the old rule,
the dark advice tint must drop below 70%.

### 5.3 On the grainy problem panes (amended 2026-09-15)

Since 01b778b the problem page's panes are `--elevated` with paper grain, and the
Goal, Constraints and Tip callouts render there. Tints are opaque mixes, so they
cover the grain; labels and body keep §5.2's ratios. Rules sit beside grainy
paper, so their 3:1 floor is taken at the worst grain pixel: the paper pushed
toward black (toward white in dark) by `--grain-opacity`, 0.067. Measured on the
merged tokens:

| Category | Light rule · flat · worst grain | Dark rule · worst grain |
| --- | --- | --- |
| understanding | `#a18600` · 3.54 · 3.05 | `#d1af00` · 5.76 |
| mistake | `#d75b56` · 3.80 · 3.28 | `#ff8b83` · 5.43 |
| context | `#3d89e4` · 3.56 · 3.07 | `#7ab5ff` · 5.79 |
| requirement | `#2b9d4a` · 3.49 · 3.00 (was `#30a14e` · 3.32 · **2.86**) | `#39d353` · 6.22 |
| advice | `#64748b` · 4.76 · 4.10 | `#cbd5e1` · 8.28 |

Before this amendment light Constraints fell to 2.86:1 on every problem page. The
owner chose generated grain-safe lines (spec 1 §4.3) over drawing rules in the
label colour, keeping the approved brighter rules; only green changes, by an
imperceptible 0.012 of OKLCH lightness. The margins stay thin (3.00–3.07), which is
why the floor is asserted in `grainContrast.test.ts`, not just recorded here.

The plain blockquote's `--rule-strong` hairline measures 1.44:1 flat and 1.43:1 on
grain in light (1.74 / 1.71 dark). It separates a quotation from prose; it is not a
boundary a reader must find, and carries no 3:1 floor.

## 6. Component changes

### 6.1 `Callout.tsx`

- `CalloutType` = `"key" | "brain" | "warn" | "tip" | "goal" | "constraint" | "default"`.
- Per type: tint `bg-callout-tint-{category}`, rule `border-l-{role}-line`, label
  and icon `text-{role}`. Tip: `bg-callout-tint-advice`, `border-l-advice-line`,
  `text-mark`.
- Rule `border-l-3` (Tailwind v4's numeric border width, not an arbitrary value);
  padding `py-2.5 pl-4 pr-8`; right radius `var(--radius-sm)`.
- Body inherits the prose size (was `text-[0.95rem]`).
- `default` (plain `>`): no tint, no label, `border-l-2` in `--rule-strong`
  (add `--color-rule-strong` to `@theme`).
- Copy button: `focus-visible:opacity-100 focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-accent`.

### 6.2 `Markdown.tsx`

Fence branch accepts `key | brain | warn | tip | goal | constraint` through a typed
list (no cast); `note` removed; `detectCalloutType` deleted; `blockquote` always
renders `type="default"`.

### 6.3 `highlightBlocks.ts`

`NON_CODE_LANGS`: add `key`, remove `note`; export it.

### 6.4 `extractThesis.ts`

Inside "The insight", a `key` fence contributes its body as prose instead of ending
collection; any other fence still ends it. Without the heading: first `key` fence,
then first blockquote, else empty.

### 6.5 Not changed

`Reveal.tsx`, `MarginNote.tsx` (Aside keeps `0.92em` and `--info`),
`extractHints.ts`, `splitProblemTabs.ts`.

## 7. Documentation

CLAUDE.md §3: the job column and density rule. CLAUDE.md §4: colour names the kind
of message; every labelled callout carries a `--callout-tint-*` (fallback A: set
them transparent); rules use spec 1's grain-safe `*-line` and sit on `--elevated`
only; body inherits prose size.

## 8. Tests

Each new or changed test is shown failing first (CLAUDE.md §2).

1. **`design-tokens.test.ts`, callout mapping** — each type's tint, line and text
   classes per §6.1; no `border-l-warn`/`text-warn`; no `note|rocket|build`; no
   fixed `0.95rem`; copy button carries `focus-visible:opacity-100`.
2. **New — callout tints.** Resolve each `--callout-tint-*` per theme through its
   `color-mix` (composited over `--elevated`), then assert: label ≥ 4.5, body
   ≥ 4.5, icon ≥ 3, tint step off the card in 1.15–1.30, and every tint token is
   defined in `:root` and `.dark` and mapped in `@theme`. Under fallback A the
   step assertion is replaced by "tint is transparent".
3. **New — fence names** (`content.test.ts`): every fence language in `courses/**`
   is a Shiki language or alias, a `NON_CODE_LANGS` member, or `tabs`/`reveal`/
   `sandbox`/`viz`; proven with ` ```wran `.
4. **`coach-thesis.test.ts`** — `key` fence opening "The insight" is the thesis;
   `key` fence preferred over a blockquote without the heading.
5. **New `tests/callout.test.tsx`** (`renderToStaticMarkup`) — each fence renders
   its label; `>` and legacy emoji blockquotes render unlabelled; `note` is not a
   callout.
6. **`grainContrast.test.ts`** (amended 2026-09-15) — every `*-line` and
   `--advice-line` clears 3:1 at the worst grain pixel on `--elevated`, both
   themes. Its token parser now strips CSS comments: this spec's own tint comment,
   "Measured on --elevated: steps …;", once read as a declaration and redefined
   light `--elevated` there, failing both light tests.
7. **`palette.test.ts`** — `lineColour` clears 3:1 at the worst grain pixel,
   keeps level 3 when it already does and darkens minimally when it does not, uses
   level 4 in dark, and its mirrored card and grain strength match `globals.css`.

## 9. Verification

`tsc --noEmit`, `eslint`, `npm test`, `npm run build`; then the browser on
`valid-palindrome` (Goal, Constraints, Tip) and `the-call-stack-and-base-cases`
(blockquote), both themes, with a temporary Key idea / Watch out / Mental model
fence that is reverted; keyboard-focus the copy button; confirm computed tint and
rule colours match §5.2 on the reading sheet and §5.3 on the grainy problem pane.

## 10. Out of scope

- **Content pass:** migrate thesis blockquotes to ` ```key `; Watch outs for the 46
  buried trap mentions; re-sort existing Tips and Next.js `brain`/`warn`/`tip`;
  decide Goal's rollout; give `range-sum-2d-immutable` a thesis.
- **Palette tokens and status colours** — spec 1. **Family colours** — spec 3.

**Sequencing:** spec 1 lands first (this spec reads `--hue-*`, `--{role}-line` and
the new status colours). Plan: `docs/superpowers/plans/2026-09-14-callout-system-b.md`.
