# Semantic learning palette — Phase 1

**Date:** 2026-08-01
**Status:** approved, implementing
**Visual reference:** owner-supplied LeetCode-style mockup (light theme, Valid
Palindrome problem page) — aesthetic/layout reference only, not a feature
target. See conversation for the full palette philosophy brief.

---

## Problem

The current token set uses `--accent`/`--pop`/`--mark` (all Indigo) for six
unrelated meanings at once: the Goal callout, the Rocket/"Ship" callout, the
Insight/"brain" callout, `MarginNote` asides, the non-optimal value in
`ComplexityStrip`, and the same chip in the Insight panel — on top of its
correct job (nav, CTA, progress, selection). Indigo has stopped meaning
anything specific. Two tokens already exist for this problem and sit almost
unused: `--tone-sky` (one call site) and `--tone-rose` (zero).

The owner's brief reframes the palette around what a *role* communicates
(interaction / success / insight / information / error) rather than what
looks good next to Indigo. This spec scopes that to what's buildable now:
token roles + the callout/card/examples layout rhythm from the reference
image. Complexity color ladders (Phase 2) and per-pattern hues (Phase 3) are
explicitly out of scope — see Deferred.

---

## Primary hex change

Owner chose to move Primary from `#5B5CEB` to `#6366F1` (their palette doc's
exact value), accepting a measured contrast trade-off:

| Pairing | Old | New | AA normal text (4.5:1)? | AA large text/UI (3:1)? |
|---|---|---|---|---|
| Primary on paper (`#FCFCFD`) | 4.91:1 | **4.35:1** | No (was yes) | Yes |
| White on Primary (CTA fill) | 5.03:1 | **4.47:1** | No, borderline (was yes) | Yes |

Both computed via the WCAG relative-luminance formula, not estimated.
Consequence: `#6366F1` is safe for fills, large/UI elements, CTA buttons
(bold ≥14pt qualifies as "large text," 3:1 governs), active nav, progress,
borders, icons. It is **not** safe for small/regular-weight running text
(links, inline `text-accent` labels below large/bold sizing) — this was
already policy for the old ink ("do not rely on it for small body links
without weight/size") and is now a harder requirement, not a new one.

No separate darker "text-accent" token is being introduced in Phase 1 — the
existing weight/size discipline documented in CLAUDE.md covers it. If a
specific site (e.g. a small inline link) is found riding under 4.5:1 during
implementation, bump its weight/size rather than inventing a second ink.

---

## New / reassigned roles

| Role | Meaning | Light | Dark | Token |
|---|---|---|---|---|
| Interaction | nav, CTA, progress, selection, focus ring — **nothing else** | `#6366F1` | `#6366F1` fill / `#818CF8` readable text (unchanged split) | `--accent` / `--pop` |
| Success | correct, passed, optimal | `#047857` (unchanged) | `#22D497` (unchanged) | `--good` |
| **Insight** (new) | mental model, "remember this" — rare, deliberate | fill: `--riso-amber`-adjacent gold wash via `bg-insight/10`; text `#854D0E` (**6.68:1** on paper, computed) | text `#FACC15` (**12.3:1** on dark paper, computed) | `--insight` (new) |
| Information | goal framing, notes, hints — activates the existing unused token | `#0284C7` (existing `--tone-sky`, unchanged) | `#38BDF8` (existing, unchanged) | `--tone-sky`, aliased `--info` |
| Teaching caution | tip, interview tip, watch-out | `#B45309` (unchanged `--warn`) | `#F59E0B` (unchanged) | `--warn` |
| Error | failed testcase, invalid | text stays `#DC2626` light / `#EF4444` dark (**already same hue family as Coral, already AA — 4.71:1 / 5.0:1, no change needed**); fill/badge softens from harsh `#EF4444`-as-fill to Coral `#F87171` for backgrounds/pills only | same split | `--bad` |
| `--tone-rose` | stays defined, stays unused — no consumer identified this pass | — | — | unchanged |

Insight fill uses the existing `bg-{token}/N` translucent convention (e.g.
`bg-insight/10`), not a new literal hex — consistent with how `--good`/
`--warn`/`--bad` already work. No new CSS pattern introduced.

### Why Error doesn't need a hue change

Coral `#F87171` and the current error ink `#DC2626`/`#EF4444` are the same
hue (0°, pure red — R>G=B in both). "Coral" softens *lightness*, not hue.
Coral itself fails AA as text (~2.7:1 on paper, computed) — same reason the
current bright fill was never used as text. The existing darkened ink
already does the job Coral's text companion would need to do; only the
fill/badge/pill background moves to the softer value.

---

## Component reassignment (fixes the actual collision)

| Site | Was | Becomes |
|---|---|---|
| `Callout` — `goal` | `border-l-mark bg-mark/5` | `border-l-info bg-info/5` |
| `Callout` — `rocket` | `border-l-mark bg-mark/5` | `border-l-info bg-info/5` |
| `Callout` — `brain` | `border-l-mark bg-mark/5` | `border-l-insight bg-insight/5` — renamed label "Mental model" |
| `Callout` — `constraint` | `border-l-warn bg-warn/[0.06]` | `border-l-good bg-good/[0.06]` — matches the reference image's green Constraints box; constraints are rules to satisfy, not cautions |
| `Callout` — `tip` / `warn` / `build` | unchanged (amber / amber / good) | no change — already correct roles |
| `Callout` — `note` | `border-l-accent bg-accent/[0.06]` (indigo) | `border-l-info bg-info/[0.06]` — informational, was never actually interactive, just mislabeled indigo |
| `MarginNote` | `border-mark text-mark` | `border-info text-info` |
| `ComplexityStrip.SpaceCell` (non-optimal) | `text-mark` | `text-info` — a fact worth noting, not an interaction |
| `InsightPanel` space complexity chip | `text-mark` | `text-info` |
| `cheatsheet/tone.ts` | 6 tones (`accent good warn bad muted mark`) | add 7th: `insight` (`border-l-insight bg-insight/5` / `text-insight` / chip variant). Existing tones, including `mark`, are **not** re-audited across the 21 authored cheatsheets this pass — that's content work, not a token change. Flagged under Deferred. |

`--mark` itself keeps its literal meaning (Primary Active / pressed state)
and stays indigo — that usage is genuinely interactive.

---

## Layout rhythm (callouts, examples — matching the reference)

**Callout:** move from the current left-accent-bar + right-only-rounded
"quote" shape to a fully rounded, evenly-bordered, tone-tinted card —
matching the reference's Problem/Interview-Tip/Constraints boxes. Add a
small tone-colored leading icon next to the label (Info for goal/note,
Lightbulb for tip, WarningCircle for warn, ListChecks for constraint, Brain
for the new "Mental model" type). This is also an accessibility fix, not
just styling — meaning currently rides on color alone; pairing it with a
distinct icon shape helps colorblind readers too. Stays flat: tint
background + 1px full border in the tone color at low opacity, no shadow,
no blur — consistent with the existing flat/print identity.

**`ExamplesBlock`:** currently a compact single-line-per-row list, and it
has a real bug under this philosophy — the output is hardcoded `text-good`
(green) regardless of whether the expected value is `true` or `false`. A
`false` output showing in green currently claims success for a negative
case. Moves to one card per example (Input row, Output row with a tone pill
— good/green for `true`-ish or matching-positive values, bad/coral for
`false`-ish or negative values, plain foreground text for non-boolean
outputs), optional explanation line — matching the reference's card
treatment. Still a token-only change; no new component dependency.

**Not changing:** difficulty badges/filter chips (`problemDifficulty.ts`)
already map Easy/Medium/Hard to good/warn/bad correctly and already use the
translucent-tint chip style; the reference's solid-fill pill look isn't
adopted here since the existing tinted style is already semantically
correct and AA-safe by construction. No reason to touch working code.

---

## Deferred (explicitly out of scope this pass)

- **Phase 2 — complexity color ladder** (O(1) Emerald → O(n²) Red, 5 steps).
  Requires reclassifying `ComplexityStrip`'s binary `isTargetBigO` into a
  5-bucket scale. Separate spec.
- **Phase 3 — per-DSA-pattern hues** (Arrays/Strings/Trees/Graphs/…, 8
  colors). Highest rainbow risk; no existing UI surface tags lessons by
  pattern color today, so it needs its own placement design first.
- Auditing existing cheatsheet content (`web/src/lib/course/cheatsheets/`)
  for `mark`/`accent` tone usage that should move to `insight` or another
  role — content work, not this token pass.
- Everything already ruled out earlier: gamification (streak/heatmap/XP),
  social/analytics data (solved-by count, companies tag, submissions tab),
  multi-language execution (C++/Java), auth/avatar, live execution tracing.

---

## Verification

- `tsc` / `eslint` clean on all touched files.
- `web/tests/design-tokens.test.ts` extended to assert the new `--insight`
  token exists in both `:root` and `.dark`, and that `Callout`'s `constraint`
  type no longer resolves to `warn`.
- Manual: Valid Palindrome problem page — Goal (info/sky), Constraints
  (good/green), a `brain`/Mental-model callout if one exists in course
  content, Examples block true/false pills, in both light and dark, checked
  in the browser.
- Contrast ratios in this doc are computed (WCAG relative luminance), not
  eyeballed — re-verify with the actual rendered pixels once implemented,
  since color-mix/opacity compositing can shift the effective ratio from the
  pure-hex math above.
