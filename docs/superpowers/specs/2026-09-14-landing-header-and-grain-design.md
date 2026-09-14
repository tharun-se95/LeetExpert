# Landing header and paper grain

**Date:** 2026-09-14
**Scope:** the home page (`/`) only — a new `LandingHeader`, the shell change
that renders it, promotion of the paper-grain trial to a documented part of the
design system, and the tests that guard both. Every other route keeps today's
sticky `Header`.
**Status:** proposed — design approved by the owner in brainstorming on
2026-09-14.
**Reference:** https://victoreke.com/ home page, chosen by the owner as the
direction for the leetExpert landing page. This spec covers the header and the
background; later sections of that page are separate work.

---

## 1. Why this exists

The owner liked the reference's home page and asked to adopt its design for
the landing page, starting with its grainy background, then its header. The
grain was trialled on the landing page first (§3) and approved on sight
("looks good"). The header is this spec's main change.

Two decisions were put to the owner and settled:

- **Scope: landing page only.** The app header is global chrome whose height
  the lessons drawer's tabs are aligned to (CLAUDE.md §4, guarded by
  `sidebarChrome.test.ts`). Restyling it app-wide would redo that geometry and
  drop the always-visible search/nav on lesson and problem pages.
- **Nav typeface: Space Grotesk.** The reference sets its nav in its display
  face. CLAUDE.md §4 reserves Space Mono for the wordmark and headings, so the
  nav keeps the UI face and takes the reference's size, weight, ink and
  spacing instead. No rule exception.

---

## 2. Current state (measured)

All values from `getComputedStyle` on the running pages at a 1210–1261px
viewport, dark theme.

### 2.1 The reference header

| Property | Value |
| --- | --- |
| Position | `static` — scrolls away with the page (top −800px at scrollY 800) |
| Background | transparent; the body's grain shows through |
| Bottom edge | `1px solid rgb(39 39 42)` (zinc-800 on a zinc-900 page) |
| Shadow / blur | none / none |
| Height | 89px: 24px padding top and bottom around a 40px row |
| Content column | `max-w-6xl` (1152px), centred — the same column as the hero |
| Logo | 35×35px image, left |
| Nav | display face, 16px, weight 400, full ink `#fff`, 32px gaps, no pills |
| Right | theme toggle only: 40×40px, `border-radius: 9999px`, 1px zinc-800 border |
| Mobile | nav hidden below `md`, replaced by a menu |

### 2.2 Our header today (`components/layout/Header.tsx`)

Rendered by `AppShell` **above** `<main>` on every route. Sticky, `z-40`,
`h-14` (45.5px at the 13px laptop root), solid `bg-elevated` (`#26262a` dark),
`shadow-edge-bottom`, full-bleed `px-3 sm:px-4`. Nav: 13px Space Grotesk
medium, `text-muted`, pill hover. Right: search pill with ⌘K, progress chip
(hidden on `/` via `showProgress`), square 32px `ThemeToggle`.

`AppShell` already resolves the landing route with `isLandingPath(pathname)`
(`pathname === "/"`) and holds the search dialog state (`searchOpen`), passing
`onOpenSearch` to the header. `<main>` is the only scroller
(`overflow-y-auto`), so anything that must scroll with the page has to be
inside it.

---

## 3. Paper grain (trial → promoted)

### 3.1 What the reference does

`body { background-image: url(noise.png); background-size: 200px 200px }`
over `#18181b`. The PNG is 400×400, every pixel a random grey at a constant
alpha of 17/255 (6.67%), 90KB. We do **not** reuse that file; we generate our
own with the same character.

### 3.2 What is already in the working tree (uncommitted trial)

- `web/public/textures/grain.png` — 400×400 opaque greyscale noise, 8 quantised
  levels, seeded PRNG (seed `20260914`), 69,274 bytes.
- `globals.css`: `--grain-opacity: 0.067` in `:root` and `.dark`; a
  `.paper-grain` rule — `isolation: isolate` on the element, and a `::before`
  layer (`position: absolute; inset: 0; z-index: -1; pointer-events: none`)
  painting the tile at `200px 200px` with `opacity: var(--grain-opacity)`;
  hidden in print.
- `HomePage.tsx`: `paper-grain` on its root `<div>`.

Why a `::before` at `z-index: -1` inside an isolated root: an absolute layer at
`z-index: auto` paints over in-flow text; `-1` inside a new stacking context
paints above the root's (transparent) background and below every child. Why
opacity in CSS rather than baked into the PNG: strength stays a per-theme token
that can be tuned without regenerating the asset.

### 3.3 Contrast over grain (measured)

Worst case is a grain pixel that pushes the paper toward the text colour
(black under dark text, white under light text) at 6.7%:

| Theme | Paper | Muted text flat | Muted, average grain | Muted, worst pixel | Body ink, worst pixel |
| --- | --- | --- | --- | --- | --- |
| Light | `#f1f4f9` | 5.78:1 | 5.39:1 | **4.99:1** | 12.83:1 |
| Dark | `#121214` | 7.82:1 | 7.32:1 | **6.65:1** | 13.47:1 |

Both clear AA 4.5:1 for muted text. The grain only shows on the paper; solid
surfaces (cards, stat band, code panels) cover it.

### 3.4 Promotion

- Move the generator to `web/scripts/make-grain.mjs` (Node built-ins only:
  `zlib` + a hand-written PNG encoder). Invocation:
  `node scripts/make-grain.mjs public/textures/grain.png 400 8 20260914`.
  The pixel generation is exported as a pure function
  (`grainPixels(size, levels, seed)`) separate from PNG encoding. The
  reproducibility guarantee is on **pixels, not file bytes**: compressed bytes
  depend on the zlib build Node bundles, so a Node upgrade could change them
  with no visual difference. A test inflates the committed PNG and compares
  its pixels to `grainPixels(400, 8, 20260914)` (§6).
- Replace the "TRIAL" wording in the `.paper-grain` comment with the settled
  rule and a pointer to this spec.
- Move `paper-grain` from `HomePage`'s root to the shell's landing wrapper
  (§4.1) so the grain runs continuously under the header.
- Document the grain in CLAUDE.md §4.

---

## 4. Landing header

### 4.1 Shell (`AppShell.tsx`)

```
const landing = isLandingPath(pathname);

<div className="flex h-dvh flex-col overflow-hidden">
  {landing ? null : <Header … />}
  <div className="flex min-h-0 flex-1">
    …Sidebar…
    <main …>
      {landing ? (
        <div className="paper-grain relative min-h-full">
          <LandingHeader onOpenSearch={() => setSearchOpen(true)} />
          <PageEnter fill={fillMain}>{children}</PageEnter>
        </div>
      ) : (
        <PageEnter fill={fillMain}>{children}</PageEnter>
      )}
    </main>
```

- `min-h-full`: the grain covers the full scroller even if content is shorter.
- The header sits outside `PageEnter`, so it does not replay the page's rise
  animation.
- ⌘K keeps working: the key listener and `SearchDialog` stay in `AppShell`.
- `Header.tsx` is not edited. `sidebarChrome.test.ts` reads the first
  `<header className=…>` in that file; a variant inside it would change what
  that test measures.

### 4.2 Component (`components/landing/LandingHeader.tsx`)

Client component (the theme toggle needs it). Props: `onOpenSearch: () => void`.

**Element.** `<header className="print:hidden border-b border-border py-6">` —
no `bg-*`, no shadow, not `sticky`/`fixed`. `border-border` resolves to
`--press-rule` (light `rgba(22,32,46,.09)`, dark `rgba(244,244,245,.09)`),
the same soft rule the reference's zinc-800 plays.

**Row.** `mx-auto flex h-10 max-w-6xl items-center justify-between gap-3 px-4
lg:px-8` — identical column and padding to `HomePage`'s hero container, so the
logo's left edge sits on the hero heading's left edge.

**Left — home link.** `</>` chip at `h-9 w-9` (reference logo is 35px) with
the existing `bg-pop text-on-pop` treatment, then the wordmark
`leet` (`text-foreground`) + `Expert` (`text-mark`), `text-base font-semibold`.
No "│ DSA" course label: the landing page is the DSA course.

**Centre — nav.** `<nav aria-label="Product modes">` with `Lessons`
(`/courses/dsa`) and `Practice` (`/courses/dsa/problems`). Space Grotesk
(`font-sans`), `text-base` at every width (1rem — 16px at the desktop root,
the reference's size; see §4.4 for where the root steps down),
`font-normal`, `text-foreground`, `gap-5 sm:gap-8`.
No pills. Hover: `underline underline-offset-4 decoration-border` →
`decoration-foreground`. Focus: the global `:focus-visible` outline
(`--focus-ring` 2px, `--focus-offset` 2px), exactly as `Header.tsx` relies on.
Per-element `focus-visible:ring-*` utilities are not used: the global rule is
unlayered, so it beats layered utilities and a ring would only stack under it
(measured: the outline still drew on an element carrying
`focus-visible:outline-none`).
Neither link is ever "active" on `/`, so no active style.

**Right — actions.** Search: hairline pill (`rounded-full border border-border
px-3 py-1.5 text-sm text-muted`, magnifier + "Search" + `⌘K` kbd), icon-only
`h-11 w-11` below `md` (the touch target `Header.tsx` uses), `h-10` pill from
`md`; `aria-label="Search lessons and problems"`; calls
`onOpenSearch`. Theme toggle: `ThemeToggle` with a round, 40px treatment.

### 4.3 `ThemeToggle` change

Add an optional `className` prop, merged with `cn()` onto **both** the mounted
button and the pre-mount placeholder (so the round shape does not pop in after
hydration). The app header passes nothing and keeps its square 32px toggle.
`LandingHeader` passes `h-11 w-11 rounded-full md:h-10 md:w-10`. This relies
on `cn()` being `twMerge(clsx(…))` (`lib/utils.ts`, verified): the passed size
and radius replace the default `h-8 w-8 rounded-[length:var(--radius-md)]`
rather than both landing in the class list with an order-dependent winner.

### 4.4 Mobile

Every size here is rem-based, so it moves with the root's laptop scale steps
in `globals.css` (15px below 1600px wide or 900px tall, 13px below 1400px or
760px). Those `max-width` steps also catch phones: at 375×812 the root is
13px, so `text-base` renders 13px and `h-11` renders 35.75px. That is the app's
existing behaviour on every page, not something this header introduces; it is
recorded here so the numbers below are not mistaken for defects.

At 375px the row holds: the chip (36px at a 16px root), two nav links
(`text-base`, `gap-5`), the icon-only search button and the toggle (`h-11`
each). Below `sm` the wordmark is `sr-only` (the chip stays as the visible home
link, and the wordmark stays its accessible name), matching how `Header.tsx`
fits ~375px. A first build used `text-sm` nav and `h-10` buttons below `sm`;
measured at 375px that was 11.4px text and 33px targets, and was raised to the
values above. Measured with those values: no overlap between the three
columns and no row overflow (§6).

### 4.5 Accessibility

- All interactive elements are real links/buttons with visible focus (the
  global outline; measured 2px solid, 2px offset on the search button and the
  toggle).
- Tap targets: search and toggle `h-11` below `md`, like `Header.tsx`; nav
  links `min-h-10`.
- Keyboard order measured in the browser: home link → Lessons → Practice →
  Search → theme toggle. The browser tool's synthetic Enter/Space keys do not
  trigger native button activation — shown by the same null result on the
  untouched app-header search button — so Enter/Space activation of the search
  button is covered by it being a native `<button type="button">` with
  `onClick`, not by an automated key test. ⌘K and a pointer click were
  verified to open search.
- No motion added; nothing to gate on `prefers-reduced-motion`.
- `print:hidden`, like the app header.

---

## 5. Out of scope

- Every route other than `/` (header, grain).
- The rest of the reference page (hero, contribution graph, experience
  layout) — separate specs.
- A light-mode or texture change to cards and surfaces.

---

## 6. Verification

**New tests.**
- `tests/landingHeader.test.tsx` (rendered without a router, like
  `courseNavPanel.test.tsx`): nav links have the two hrefs; the search button
  calls `onOpenSearch`; the `<header>` has no `sticky`/`fixed` and no `bg-*`
  class; nav links do not use `font-display`; the theme toggle is present.
- Shell routing (extend `layoutContainment.test.ts`, which already reads
  `AppShell.tsx`): the landing branch renders `LandingHeader` inside `<main>`
  within a `paper-grain` wrapper, and `Header` is not rendered on that branch.
- Grain reproducibility: `tests/paperGrain.test.ts` inflates the IDAT of
  `public/textures/grain.png`, checks IHDR is 400×400 8-bit greyscale, strips
  the per-row filter bytes, and asserts the pixels equal
  `grainPixels(400, 8, 20260914)`. It also asserts `globals.css` defines
  `--grain-opacity` in both `:root` and `.dark`.
- Each new assertion is broken once on purpose, seen to fail, and restored.

**Suite.** `tsc`, `eslint`, `npm test`, `npm run build` all pass.

**Browser** (dev server, both themes):
- `/` at desktop and 375px: header transparent over grain, hairline visible,
  logo aligned to the hero, scrolls away; bottom `StickyCta` still appears
  after 480px.
- Keyboard: Tab order logo → Lessons → Practice → Search → theme; focus rings
  visible; ⌘K and the search button both open the dialog.
- A lesson page and a problem page: sticky app header, drawer tab alignment
  and square toggle unchanged.

---

## 7. Coordination

`web/src/app/globals.css` and `web/src/components/layout/AppShell.tsx` carry
uncommitted edits from another session (the module-card flip under
`@media (hover: hover)`; `relative` on `<main>`). This work edits both files.
Those hunks are left intact and are not included in this work's commits; if
they are still uncommitted at implementation time, stage by hunk.

---

## 8. Revisions after implementation (2026-09-14)

**Sticky** (owner, later the same day): the header no longer scrolls away.
It is `sticky top-0 z-30` inside `<main>`; transparent over the grain at the
page top, and `bg-background/80 backdrop-blur-md shadow-edge-bottom` once
content scrolls beneath it, so the nav stays legible over typed text.
`AppShell` passes `scrolled` from an IntersectionObserver on a 1px sentinel
at the top of the grain wrapper, rooted on `<main>` — not a scroll listener,
because a landing page restored mid-scroll fires no scroll event. Padding is
identical in both states, so content never shifts. Sections keep `py-24`,
which clears the ~5.5rem header, so no `scroll-padding` was added (that
would misalign the one-viewport wheel paging). This supersedes §4.1's
"scrolls away" and §6's "no sticky/fixed and no bg-*" assertion.

**Hero** (owner decisions): heading + paragraph + a row of the eight
`TOPIC_CHIPS` as icon links with a hairline underline (the reference's social
row), beside `HeroStructureArt` — a line drawing of a BST holding 1–15 with
the search for 11 traced in `--mark` and a slow dash crawl (18s loop, stopped
under `prefers-reduced-motion`). No buttons; no eyebrow; `FamilySpotlight`
left the hero (now unused — kept pending the owner's call), the "Popular
modules" chips were removed as duplicates of the hero row.

**Column and rhythm** (owner: "full width, spaced like the reference"). The
reference measured at a 1522px viewport: `main` `max-w-7xl` with `md:px-16`
(1152px of content), 128px under the header, `mt-32` (128px) between
sections, section headings 36px bold. The landing page and `LandingHeader`
now share `max-w-7xl px-6 md:px-16`, sections are `lg:space-y-32`, the gap
under the header is `lg:pt-32`, and section headings are
`text-3xl sm:text-4xl`. All rem-based: at the 15px laptop root the column is
1080px, reaching the reference's 1152px from a 1600px-wide viewport.
This supersedes the `max-w-6xl px-4 lg:px-8` container named in §4.2.

**End to end** (owner, same day, after seeing the `max-w-7xl` column): the page
max-width was removed. Header, page sections, the stat band's row and
`StickyCta` keep only `px-6 md:px-16` gutters, so content spans the viewport;
readable blocks keep their own caps (hero text `max-w-2xl`, pricing cards
`max-w-3xl`). Consequence to watch: on very wide screens multi-column blocks
(the why grid, the viz strip) stretch with the viewport — no cap exists by
design, so add one per block if a block reads badly there.

**Centred again, hero spaced out** (owner, same day, after seeing end to end):
the `max-w-7xl` centred container is restored on header, page, stat band row
and `StickyCta`, keeping `px-6 md:px-16`. The hero gets more vertical room:
`pt-24 lg:pt-40` under the header (was `pt-20 lg:pt-32`), `space-y-24
lg:space-y-32` to the block below it (was `space-y-16`), paragraph `mt-8`
(was `mt-6`) and topic links `mt-12` (was `mt-10`). The end-to-end paragraph
above is superseded.

**A bit wider** (owner, same day): the shared container moved from
`max-w-7xl` (80rem) to a theme token, `--container-landing: 88rem`
(`max-w-landing`) — content 1200px at the 15px laptop root, 1280px at a 16px
root. One token rather than five arbitrary values, because the five
containers (header, hero wrapper, stat row, sections, `StickyCta`) must stay
equal; `landingHero.test.tsx` "landing column" fails if any drifts.
