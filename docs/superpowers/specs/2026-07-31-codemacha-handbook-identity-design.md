# codeMacha Handbook Identity — design

**Date:** 2026-07-31  
**Status:** approved — implementing  
**Programme:** One identity spec · two implementation milestones  
**Supersedes (partial):**

- `2026-07-30-codemacha-brand-ds-tokens-design.md` — purple SaaS tokens retired  
- `2026-07-30-landing-home-v3-design.md` — calm SaaS chrome / soft shadows retired; **section inventory kept**  
- Doctrine conflict in `CLAUDE.md` §4 vs Brand DS shadows — resolve in favour of **flat Riso depth**

**Does not supersede:** course content, sandbox runner, viz registry, `/course` map structure.

---

## 1. Positioning

**Product name:** codeMacha (unchanged).

**Identity:** An editorial **handbook** that runs in the browser — not a purple SaaS dashboard, not a LeetCode clone, not a video binge.

**Personality:** Sharp, patient, print-native. Depth comes from **ink, rules, and halftone** — never blur or drop shadows. Bright ink is laid as **blocks** (fills); readable companion ink carries **coloured text**.

**Voice (unchanged substance):** Solve-first, honest counts, no fake testimonials / Discord / countdowns. Light editorial polish to labels is allowed; marketing claims stay true.

**Success criteria**

1. A stranger removing the nav still recognises a handbook brand (not generic edtech).  
2. Accent-as-text and on-pop CTA type meet **WCAG AA** (4.5:1 normal) in light and dark.  
3. Home keeps every current section’s job; composition reads editorial, not card grid.  
4. `CLAUDE.md` and tokens describe **one** depth language.  
5. Course chrome inherits new tokens without a layout rewrite in this programme.

---

## 2. Visual system (Milestone A)

### 2.1 Architecture (keep)

Two tiers in `web/src/app/globals.css`:

| Tier | Role |
|------|------|
| 1 — press inks | Raw paper / ink / accent / pop / status / mark / halftone. **Only tier 1 is redefined under `.dark`.** |
| 2 — semantic | `--background`, `--foreground`, `--muted`, `--border`, `--surface`, `--code`, `--elevated`, `--accent`, `--pop`, `--on-pop`, `--good` / `--bad` / `--warn`, `--mark`, `--highlight`, `--halftone` |

**Rule:** Components never reference tier-1 names. Palette change = edit tier 1 (+ measured comments).

**Variable keys:** Keep existing `--riso-*` CSS custom property names for churn control. Update comments to **“Handbook press inks (Riso depth language)”**. Do not leave lime/olive comments describing purple.

### 2.2 Depth language (locked)

| Allowed | Forbidden |
|---------|-----------|
| Hairline rules (`--border`) | `box-shadow` / `--shadow-card` / `.elevated-card` lift |
| Halftone panels (`.riso-halftone`) | `backdrop-blur` as brand chrome |
| Surface vs paper contrast (sunk paper darker than ground) | Soft “card floating on mist” SaaS look |
| Overprint / ink stamps where already used | Rainbow decorative status colours on marketing icons |

Delete or no-op `--shadow-card` and `.elevated-card { box-shadow: … }` in Milestone A so product surfaces stop shipping soft lift.

### 2.3 Colour — “Stone press” (new; not classic warm cream Riso, not purple Brand DS)

Direction: **cool stone paper** + **teal text accent** + **chartreuse fill pop**. Warm cream `#FBF5E9` and purple `#6E63FF` are explicitly retired.

#### Light (proposed — re-measure in implementation before ship)

| Token | Hex | Role | Target contrast |
|-------|-----|------|-----------------|
| `--riso-paper` | `#F3F2EE` | Page ground | — |
| `--riso-paper-sunk` | `#E8E6DF` | Surface / sunk panels (must read vs paper **without** shadow) | visibly distinct |
| `--riso-ink` | `#14130F` | Body text | ≥ 4.5 on paper *(~16.6:1 measured)* |
| `--riso-ink-soft` | `#5C574C` | Muted | ≥ 4.5 *(~6.4:1 measured)* |
| `--riso-rule` | `#D0CDC4` | Borders | — |
| `--riso-olive` → accent | `#1A5F4A` | **Coloured text**, links, focus, labels | ≥ 4.5 *(~6.7:1 measured)* |
| `--riso-lime` → pop | `#B8F000` | **Fills only** (CTAs, stamps, active pills) | — |
| `--on-pop` | `#14130F` | Type/icons on pop fields | ≥ 4.5 on pop *(~13.7:1 measured)* |
| `--riso-blue` → mark | `#2A4A8F` | Teacher / asides only | ≥ 4.5 *(~7.6:1 measured)* |
| Status good / bad / warn | AA-safe on paper | Pass / fail / warn text | ≥ 4.5 each; record ratios in comments |

`--accent` = olive (teal). `--pop` = lime (chartreuse). **Never** set small text in `--pop` on paper.

#### Dark (translation, not inversion)

| Token | Direction |
|-------|-----------|
| Paper | Cool charcoal `#12141A` (not warm brown-black) |
| Sunk / elevated / code | Lifted steps `#1A1D26` / `#222632` |
| Ink | `#F0EEE8` |
| Soft | Readable secondary ≥ 4.5 |
| Rule | Opaque hairline ~`#2A2E38` (not 6% white wash) |
| Accent **and** pop | Collapse to chartreuse (or measured bright companion) — teal text fails on charcoal |
| on-pop | Dark paper / near-black |

`--mark` stays a **blue teacher ink** in both themes (lifted in dark). Do **not** reuse mark as tertiary gray (Brand DS trap).

#### Icon / marketing colour

On `/` and other marketing surfaces, feature/approach icons use **accent wash + accent** only. Status tokens (`good` / `warn` / `tone-sky`) are for real status, not decoration.

### 2.4 Type (keep faces; tighten roles)

| Role | Face | Use |
|------|------|-----|
| Display | Sora | Brand wordmark, home/lesson titles, section heads |
| Sans | Inter | Body and UI |
| Mono | JetBrains Mono | Code, indices, curriculum scan labels |

**Handbook tweaks (Milestone A doctrine + light home polish):**

- Brand wordmark: `code` in ink + `Macha` in accent (keep), but increase presence on `/` (see §3).  
- Section labels: small caps / tracked mono or display — one pattern app-wide.  
- No new webfonts in this programme.

### 2.5 Radius & motion

- Radius stay `8 / 12 / 20` unless a surface needs square print stamps (opt-in `rounded-none` for stamps only).  
- Motion: `--dur-fast` / `--dur` (~150–250ms); honour `prefers-reduced-motion`.  
- Prefer spring/layout motion on **one** hero teaching toy max; not on every card.

### 2.6 Mark / logo

- Keep `</>` monogram in pop field with on-pop ink.  
- Do not invent a new logo in this programme.  
- On home hero, brand must be a **hero-level signal** (wordmark or title lockup), not only header chrome.

### 2.7 Docs / standards updates (Milestone A deliverables)

1. Rewrite `web/src/app/globals.css` tier 1 + comments + contrast notes.  
2. Remove shadow-card elevation path.  
3. Update `CLAUDE.md` §4: Handbook press inks; flat depth; accent≠pop; purple Brand DS retired.  
4. Update `HANDOFF.md` design-tokens blurb + trap “lime cannot be text”.  
5. Mark `2026-07-30-codemacha-brand-ds-tokens-design.md` as **superseded**.  
6. Extend or add a token/contrast test if cheap (optional but preferred): accent-on-paper and on-pop-on-pop ≥ 4.5.

### 2.8 Out of scope for Milestone A

- Home layout rewrite (Milestone B).  
- Sidebar / lesson / sandbox **structure**.  
- Video Remotion palettes.  
- New logo, illustration system, or photography.  
- Waitlist backend.

---

## 3. Home composition (Milestone B)

### 3.1 Content rule (locked)

**Same section inventory** as current `/` (`web/src/app/page.tsx` + landing components):

1. Continue banner (returners)  
2. Hero — eyebrow, headline, body, dual CTAs, feature chips, curriculum stats array  
3. Early bird strip  
4. Who / Not for / Practical  
5. Approach (Understand → Implement → Visualize → Solve)  
6. See it in action (viz strip)  
7. Start here + topic chips  
8. Author + waitlist  
9. FAQ  
10. Closing CTA (+ sticky CTA behaviour)

**Allowed:** reorder bands, restyle chrome, change hierarchy/spacing, light copy polish (e.g. rename “Your learning progress” → “Curriculum at a glance”).  
**Not allowed:** drop a section’s job, invent testimonials, fake urgency, new mega-nav.

### 3.2 Composition principles

1. **One composition above the fold** — brand + thesis + primary CTA; avoid mini-dashboard density. Stats array may stay but as a **print teaching figure**, not a SaaS analytics card.  
2. **Brand first** — codeMacha readable as the hero signal; headline must not erase the brand.  
3. **Rules over cards** — vertical/horizontal rules, sunk paper bands, halftone; no soft elevated-card grids. Approach / FAQ may use bordered sunk panels without shadow.  
4. **One primary CTA label family** — “Start learning for free” / “Start free” alignment; early-bird is a strip, not a third competing button style. Secondary = curriculum text/button outline.  
5. **Accent-only marketing icons** — drop rainbow chip tones.  
6. **Viz stays product proof** — may move earlier in the scroll **without removing** other sections.  
7. **Flat closing slab** — pop field + on-pop type (AA), not purple glow.  
8. **Sticky CTA** — must listen to the **`<main>` scroll root** (AppShell), not `window.scrollY`.

### 3.3 Suggested order (default for implementation; adjustable if proof needs it)

1. Continue (if any)  
2. Hero (brand + thesis + CTAs + chips + stats figure)  
3. Early bird  
4. See it in action *(promoted)*  
5. Who / Not / Practical  
6. Approach  
7. Start path + topics  
8. Author + waitlist  
9. FAQ  
10. Closing  

Header stays global (search, progress, theme). No fake mega-nav.

### 3.4 Components touched (Milestone B)

- `web/src/app/page.tsx` — structure, classes, section order  
- `web/src/components/landing/*` — HeroStatsArray framing, ContinueAndSticky scroll root, WaitlistForm chrome if needed, LandingViz shell  
- No new landing route; `/course` unchanged structurally

### 3.5 Out of scope for Milestone B

- Token invention (done in A)  
- Course lesson layout / ProblemWorkspace  
- New sections or content programmes  
- Mobile-only redesign beyond responsive parity

---

## 4. Implementation sequence

| Milestone | Deliverable | Done when |
|-----------|-------------|-----------|
| **A — System** | New press palette, flat depth, doctrine docs, AA comments, shadow path removed | `tsc`/lint/tests green; spot-check course page + home still usable; contrast notes recorded |
| **B — Home proof** | `/` restyled & reordered per §3; sticky scroll fixed; accent-only icons | Visual QA light+dark; same section jobs; no invented social proof |

After B, open a **follow-up** (separate spec) only if product chrome still feels SaaS under the new inks.

---

## 5. Risks & traps

1. **Pop as text** — chartreuse will fail AA on stone paper; enforce pop = fill only (existing HANDOFF trap).  
2. **Dark accent collapse** — teal accent fails on charcoal; dark must set accent≈pop.  
3. **Paper ≈ surface** — sunk must be dark enough that cards/panels read without shadow.  
4. **Half-migration** — do not leave `--shadow-card` “for later”; delete in A.  
5. **Sticky scroll** — window listener is a known bug under AppShell.  
6. **Video / old Brand DS docx** — ignore for web; web follows this spec.

---

## 6. Approval checklist

- [ ] Positioning (§1) accepted  
- [ ] Stone press palette + flat depth (§2) accepted (hexes may be nudged if re-measure requires)  
- [ ] Home content + composition rules (§3) accepted  
- [ ] Milestone split A→B (§4) accepted  

**Owner:** review this file, request changes, or approve to proceed to the implementation plan (`docs/superpowers/plans/`).
