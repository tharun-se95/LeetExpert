# Home page — editorial rhythm redesign

**Date:** 2026-08-02
**Status:** approved — implementing
**Builds on:** `2026-07-31-codemacha-handbook-identity-design.md` (tokens, Milestone A/B)
**Does not supersede:** the identity spec's token system — this is a composition-only pass.

---

## 1. Problem

Reviewing the shipped `/` (`web/src/app/page.tsx`) against the identity spec's own
Milestone B goals found:

1. **Doctrine violation** — `APPROACH` icons ([page.tsx:69,75,81,87](../../web/src/app/page.tsx))
   use `good`/`warn`/`tone-sky` as marketing decoration. The identity spec (§2.3, §3.2.5)
   reserves status tokens for real status and requires accent-only marketing icons.
2. **CTA redundancy** — `StickyCta` stays visible while the closing pop slab (identical
   "Start free" / "Curriculum" actions) is on screen, showing four buttons for two actions.
3. **Product proof buried** — "See it in action" (the live sandbox + tracer) sits at
   position 5 of 9, after two generic prose sections. The identity spec's own suggested
   order (§3.3) promotes it to position 4; that reorder was never applied.
4. **Repetitive rhythm** — nine sections in a row share one shape (bordered rectangle,
   label, heading, body), against the identity spec's "rules over cards, not a soft card
   grid" principle (§3.2.3).
5. **Hero has no brand signal** — codeMacha only appears in the top nav, not the hero,
   against the identity spec's stated success criterion (§3.2.2).
6. Minor: the hero stats caption ("read leads · write fills the counts") assumes
   read/write-pointer vocabulary before a visitor has taken a lesson.

## 2. Section order (same inventory, reordered)

| # | Section | Change |
|---|---|---|
| 1 | Continue banner | unchanged |
| 2 | Hero | reworked — see §3 |
| 3 | Early bird | unchanged shape |
| 4 | **See it in action** | **promoted** from #5; full-bleed sunk-paper band |
| 5 | Who / Not for / Practical | reshaped — asymmetric 2-column, see §4 |
| 6 | Approach | reshaped — connected numbered rail, see §5 |
| 7 | Start path + topics | unchanged |
| 8 | Author + waitlist | reshaped — asymmetric width (~3:2, was 1:1) |
| 9 | FAQ | unchanged |
| 10 | Closing | unchanged pop slab; sticky CTA fix, see §6 |

Rationale: alternating shapes (full-bleed band → asymmetric split → connected rail →
asymmetric split → accordion → pop slab) replaces the uniform box stack with actual
scroll rhythm, without dropping any section's job (identity spec §3.1 constraint).

## 3. Hero

- Add the `</>` monogram (same mark as header) beside the eyebrow line — a hero-level
  brand signal, not competing with the headline.
- Compress mobile vertical rhythm (stat-tile grid + spacing) so the primary CTA is
  reachable within one mobile screen.
- Soften the visible stats caption to plain language. The animation itself (two-pointer
  read/write scan in `HeroStatsArray.tsx`) is unchanged — it's accessible
  (`prefers-reduced-motion` aware, has a descriptive `aria-label` already) and a genuine
  teaching touch. Only the skimmable one-line caption changes.

## 4. Who / Not for / Practical → `WhoNotPractical.tsx`

New component in `web/src/components/landing/`. Asymmetric two-column instead of three
equal-width boxes: "Who it's for" leads as the wider column; "Not for" and "Practical"
stack in the narrower column, separated by a rule rather than a second and third box.
Same content, same three jobs, different shape from the sections before/after it.

## 5. Approach → `ApproachRail.tsx`

New component in `web/src/components/landing/`. Four steps become a connected
horizontal rail (numbered, joined by a through-line — `aria-hidden`, decorative) instead
of four boxed cards. All four icons use `bg-accent/10 text-accent` — the
good/warn/tone-sky decoration is removed. Semantic list stays an `<ol>` for screen
readers.

## 6. Sticky CTA de-duplication

`StickyCta` ([ContinueAndSticky.tsx](../../web/src/components/landing/ContinueAndSticky.tsx))
adds an `IntersectionObserver` on the closing section's ref, alongside its existing
scroll-position check. The bar hides once the closing slab is ≥30% visible, in addition
to the existing `scrollTop > 480` show condition — so both conditions must hold for the
bar to display, preventing the two identical CTA pairs from ever showing together.

## 7. Accessibility

- Icon color removal is decorative-only; no regression.
- `ApproachRail` keeps an ordered list; connecting line is `aria-hidden`.
- No change to existing `prefers-reduced-motion` handling in `HeroStatsArray` or viz
  tracers.

## 8. Out of scope

- Token/palette changes (identity spec Milestone A is done and unaffected).
- `/course`, lesson layout, sandbox runner.
- New sections, copy changes beyond the stats caption, waitlist backend.

## 9. Verification

- `tsc`, `eslint`, `next build` pass.
- Browser QA: light + dark, desktop + mobile — order, accent-only icons, no sticky/closing
  CTA overlap.
- No content/data changes — `web/tests/` content validation unaffected.
- No new colors introduced — no new contrast measurements needed.
