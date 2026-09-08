# Handbook Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship codeMacha’s handbook identity — Stone press tokens + flat depth (Milestone A), then restyle/reorder `/` as proof (Milestone B).

**Architecture:** Two-tier CSS tokens in `globals.css` (tier-1 press inks only under `.dark`). Components keep semantic names. Home keeps section inventory; composition becomes editorial (rules/halftone, no soft shadows). Sticky CTA binds to `<main>` scroll.

**Tech Stack:** Next.js app in `web/`, Tailwind v4 tokens via `@theme inline`, Vitest content/design tests, Phosphor icons.

## Global Constraints

- Keep product name **codeMacha**; retire purple `#6E63FF` and warm cream `#FBF5E9`.
- Depth: ink, rules, halftone only — **no** `--shadow-card` / `.elevated-card` box-shadow.
- `--accent` (text) ≠ `--pop` (fill); never use pop as small text on paper.
- AA: accent-on-paper and on-pop-on-pop ≥ **4.5:1** (record ratios in comments).
- Home: **same section inventory**; reorder/restyle + light copy polish OK.
- Marketing icons: **accent wash + accent only** (no rainbow status decoration).
- Do not restructure course/sandbox/lesson chrome in this plan.
- Prefer not to commit unless the owner asks (owner may request commits separately).

**Spec:** `docs/superpowers/specs/2026-07-31-codemacha-handbook-identity-design.md`

## File map

| File | Responsibility |
|------|----------------|
| `web/src/app/globals.css` | Tier-1/2 tokens, kill shadow path, `--tok-*` mirror |
| `web/src/lib/content/codePalette.ts` | Shiki/CodeMirror keyword inks (no purple) |
| `web/src/components/md/Mermaid.tsx` | Diagram accent hex aligned to press inks |
| `web/src/app/icon.svg` | App icon fill |
| `web/tests/design-tokens.test.ts` | Guards + contrast assertions on globals |
| `CLAUDE.md`, `HANDOFF.md` | Doctrine |
| Brand DS + home v3 specs | Mark superseded |
| `web/src/app/page.tsx` | Home order + handbook layout |
| `web/src/components/landing/*` | Stats framing, sticky scroll, viz shell |

---

### Task 1: Contrast gate + token rewrite (Milestone A)

**Files:**
- Modify: `web/tests/design-tokens.test.ts`
- Modify: `web/src/app/globals.css`
- Modify: `web/src/lib/content/codePalette.ts`
- Modify: `web/src/app/icon.svg`
- Modify: `web/src/components/md/Mermaid.tsx` (accent hexes)

**Interfaces:**
- Produces: light paper `#F3F2EE`, sunk `#E8E6DF`, ink `#14130F`, soft `#5C574C`, rule `#D0CDC4`, olive/accent `#1A5F4A`, lime/pop `#B8F000`, on-pop `#14130F`, mark `#2A4A8F`; dark paper `#12141A`, sunk `#1A1D26`, elevated/code `#222632`, ink `#F0EEE8`, soft `#9A9488`, rule `#2A2E38`, accent=pop `#B8F000`, on-pop `#12141A`, mark `#8BA3E0`; status light green `#046b4f` / red `#a8321f` / amber `#8a5a05`.

- [x] **Step 1: Extend design-tokens test**
- [x] **Step 2: Run test — expect fail**
- [x] **Step 3: Rewrite `globals.css` tokens**
- [x] **Step 4: Align codePalette + Mermaid + icon**
- [x] **Step 5: Re-run design-tokens tests**

---

### Task 2: Doctrine docs (Milestone A)

**Files:**
- Modify: `CLAUDE.md` (design system §)
- Modify: `HANDOFF.md` (tokens + lime trap)
- Modify: `docs/superpowers/specs/2026-07-30-codemacha-brand-ds-tokens-design.md` (superseded banner)
- Modify: `docs/superpowers/specs/2026-07-30-landing-home-v3-design.md` (superseded banner)
- Modify: `docs/superpowers/specs/2026-07-31-codemacha-handbook-identity-design.md` (status: approved)

- [ ] **Step 1: Update CLAUDE.md §4**

State Handbook press inks, flat depth, accent≠pop, Brand DS purple retired; point to identity spec.

- [ ] **Step 2: Update HANDOFF.md**

Tokens blurb + trap: chartreuse/pop cannot be text on paper; accent carries coloured text; dark collapses accent to pop.

- [ ] **Step 3: Supersede old specs + mark identity approved**

---

### Task 3: Sticky CTA scroll root (Milestone B prerequisite)

**Files:**
- Modify: `web/src/components/landing/ContinueAndSticky.tsx`

- [ ] **Step 1: Bind scroll to main**

Replace `window.scrollY` listener with scroll on `document.querySelector('main')` (fallback `window` if missing). Threshold ~480px on that element’s `scrollTop`.

- [ ] **Step 2: Manual sanity**

With `npm run dev`, scroll home inside main — sticky bar should appear.

---

### Task 4: Home handbook layout (Milestone B)

**Files:**
- Modify: `web/src/app/page.tsx`
- Modify: `web/src/components/landing/HeroStatsArray.tsx`
- Modify: `web/src/components/landing/LandingViz.tsx` (drop elevated shadow reliance — class OK if no-op)

**Section order:** Continue → Hero → Early bird → **See it in action** → Who/Not/Practical → Approach → Start path → Author/waitlist → FAQ → Closing.

- [ ] **Step 1: Hero brand-first + accent-only chips**

Add hero-level `codeMacha` lockup above/beside thesis. Feature + Approach icon tones → `bg-accent/10 text-accent` only. Soften SaaS card chrome to `border border-border bg-surface` (no elevated lift). Light polish: stats title “Curriculum at a glance”.

- [ ] **Step 2: Reorder sections + print bands**

Promote viz section; use `bg-surface` / rule bands instead of soft `bg-accent/8` SaaS washes where it fights print (early bird may use thin accent rule + sparse highlight). Closing remains `bg-pop` + `text-on-pop` (solid, not `/80` body if it fails AA — use ink-soft equivalent on pop or solid on-pop).

- [ ] **Step 3: Verify**

Run: `cd web && npx vitest run tests/design-tokens.test.ts` and `npx tsc --noEmit` (or project script). Spot-check `/` light+dark.

---

### Task 5: Verification gate

- [ ] **Step 1:** `cd web && npm test` (or vitest suite used in CI) — green  
- [ ] **Step 2:** `cd web && npx tsc --noEmit` — green  
- [ ] **Step 3:** Confirm no `#6e63ff` in `globals.css` / `codePalette.ts` / `icon.svg`  
- [ ] **Step 4:** Report what was verified vs untested in browser

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Stone press palette + AA comments | 1 |
| Kill shadow-card | 1 |
| code palette / Shiki sync | 1 |
| CLAUDE / HANDOFF / supersede | 2 |
| Sticky main scroll | 3 |
| Home reorder + brand + accent icons + flat chrome | 4 |
| Verification | 5 |
