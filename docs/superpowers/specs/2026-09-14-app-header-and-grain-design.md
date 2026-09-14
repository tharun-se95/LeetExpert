# App header and paper grain, app-wide

**Date:** 2026-09-14
**Scope:** the app header on every route except `/`, the paper grain moved
from the landing page to the whole app's desk, and the lessons drawer and
mobile lessons sheet onto that grainy paper. Builds on the landing work in
`2026-09-14-landing-header-and-grain-design.md`, which is uncommitted in the
main checkout; the owner chose to build on top of it rather than wait.
**Status:** design approved by the owner in brainstorming, 2026-09-14.

---

## 1. Decisions (owner, 2026-09-14)

| Question | Decision |
| --- | --- |
| How far the app header goes toward the landing header | **Same look, app height.** The landing header's visual language, but `h-14` stays, along with full width, the progress chip, the lessons menu and the "│ DSA" label. |
| Background | **The landing page's grainy paper is the app background** on every route. |
| Lessons drawer and mobile lessons sheet | **Grainy paper, like the header.** Keeps the 2026-09-13 rule that the drawer matches the header. |
| Lesson reading sheet, cards, code, IDE | **Stay solid.** The grain is the desk; solid surfaces cover it, as on the landing page. |
| Sequencing | Build now in the main checkout, on top of the uncommitted landing work; stage hunk by hunk around it. |

Rejected: an exact copy of the landing header (72px tall, centred column).
It would cost 27px on every viewport-locked lesson and IDE page, and would
redo the drawer tab geometry. Also rejected: a grainy reading sheet. That puts
lesson text directly on grain and removes the sheet-on-desk structure the
cards inside it rely on.

## 2. Current state (measured, 1280px wide, 13px root)

| | Landing header | App header |
| --- | --- | --- |
| Height | 72.5px | 45.5px (`h-14`) |
| Paper | transparent over grain, hairline; frosted + shadow once scrolled | solid `bg-elevated` + `shadow-edge-bottom` |
| Logo | `h-9` chip, `text-base` wordmark | `h-7` chip, `text-sm` wordmark, "│ DSA" |
| Nav | full ink, 400, no pills, underline on hover | muted, active = filled `bg-pop` pill, no `aria-current` |
| Controls | round hairline, 33px | 25px pill search, 26px toggle, progress pill |

Relevant structure:
- The grain is `.paper-grain`: `isolation: isolate` plus a `::before` layer at `z-index: -1` painting `/textures/grain.png` at `opacity: var(--grain-opacity)` (0.067 in both themes). It sits on a wrapper inside `<main>` so it scrolls with content (`globals.css`, `.paper-grain` comment).
- A test allows exactly one `paper-grain` in `src/**/*.tsx` (`landingHeader.test.tsx`). The rule it protects is that a transparent grain wrapper nested in another doubles the strength.
- `sidebarChrome.test.ts` derives `.sidebar-rail`'s `--rail-surface` from the header's `bg-*` class, and the opener tab's offset from its `h-*` class.
- The lesson prose sits on `.reading-page`, a solid `--elevated` sheet. Cards inside it use `in-[.reading-page]:bg-background` as wells.
- Opaque page paper that would hide the desk grain: the `ProblemWorkspace` root (`bg-background`). The IDE sandbox root (`Sandbox.tsx`, `bg-background`) is tool chrome and stays.
- `.drawer-tab` already uses `::before` and `::after` for its fillets. The mobile sheet uses `before:` for its accent strip. Neither can take `.paper-grain`.
- The app header sits above `<main>`; content never scrolls under it.

## 3. Grain

### 3.1 Two forms, one paint

- **`.paper-grain`** (existing) for elements whose `::before` is free: a
  wrapper, the header, the drawer rail.
- **`.grain-layer`** (new) for elements whose pseudo-elements are taken: an
  `aria-hidden` `<span>` as the element's first child, `position: absolute;
  inset: 0; z-index: -1; border-radius: inherit; pointer-events: none`, inside
  a parent that is positioned and `isolate`.
- One paint for both: the tile, size and opacity declarations live in a
  single rule whose selector is `.paper-grain::before, .grain-layer`, so the
  strength cannot diverge. `print` hides both.

### 3.2 Where it goes

| Element | File | Form | Why this is not a double layer |
| --- | --- | --- | --- |
| Page desk: one wrapper inside `<main>` for every route (the landing branch keeps its sentinel and `LandingHeader` inside the same wrapper) | `AppShell.tsx` | `.paper-grain` | The only grain inside `<main>`. `fillMain` pages get `flex min-h-0 flex-1 flex-col` on the wrapper; others get `min-h-full`; the landing page adds `snap-start`. |
| App header | `Header.tsx` | `.paper-grain` | Sibling of `<main>`, not inside the wrapper. Keeps `bg-background` (opaque), so the grain has solid paper beneath and the rail token test still reads a `bg-*` class. |
| Lessons drawer rail | `Sidebar.tsx` | `.paper-grain` | Sibling of `<main>`; already `relative z-[45]`. |
| Drawer close tab | `Sidebar.tsx` | `.grain-layer` | Inside the rail, but its own `--rail-surface` background is opaque, so the rail's grain beneath it is covered. |
| Drawer opener tab | `FloatingLessonsButton.tsx` | `.grain-layer` | Fixed; opaque `--rail-surface`. |
| Mobile lessons sheet | `MobileLessonsSheet.tsx` | `.grain-layer` | Portaled dialog over a scrim; opaque. Its paper changes from `bg-elevated` to `bg-background`. |

- `ProblemWorkspace`'s root drops `bg-background`, so the desk grain shows in
  its gaps.
- The drawer tabs' 12px fillet corners stay flat `--rail-surface` paper
  (a radial gradient cannot carry the grain). They are checked at 8x in both
  themes (§6).
- Unchanged and solid: `.reading-page`, every card and well, code surfaces,
  the IDE (`Sandbox` ide root, toolbar, panes), `ProblemWorkspace`'s
  sub-header (`bg-elevated`), `SearchDialog`, viz fullscreen.

### 3.3 Drawer paper

`.sidebar-rail { --rail-surface: var(--background); }` — the header's paper,
by the existing rule. The rail separates from the page by its `border-r` and
`shadow-edge-right`, as today; there is no longer a brightness step.

### 3.4 Contrast over grain (computed from the tokens)

Worst case is a grain pixel that pushes `--background` toward the ink (black
under a dark ink, white under a light one) at `--grain-opacity` 0.067:

| Ink | Light flat → worst | Dark flat → worst |
| --- | --- | --- |
| foreground | 14.88 → 12.83 | 15.85 → 13.47 |
| muted | 5.78 → 4.99 | 7.82 → 6.65 |
| good | 5.68 → **4.89** | 9.74 → 8.28 |
| bad | 5.87 → 5.06 | 5.59 → **4.75** |
| warn | 6.43 → 5.55 | 8.71 → 7.41 |
| info | 6.86 → 5.92 | 8.73 → 7.43 |
| mark / accent | 13.27 → 11.44 | 12.60 → 10.71 |

Every text ink clears AA 4.5:1 on the desk. A test recomputes this from the
tokens (§5), so raising `--grain-opacity` or changing a paper fails CI.

## 4. Header

### 4.1 Shared parts

`web/src/components/layout/headerChrome.ts` exports the class sets both
headers use, so the landing and app headers cannot drift:

- `LOGO_CHIP`: `flex h-9 w-9 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-sm font-bold text-on-pop`
- `WORDMARK`: `truncate text-base font-semibold tracking-tight`
- `NAV_LINK`: `inline-flex min-h-11 items-center rounded-[length:var(--radius-xs)] text-base font-normal text-foreground decoration-border underline-offset-4 transition-colors hover:underline hover:decoration-foreground md:min-h-10`
- `NAV_LINK_ACTIVE`: `underline decoration-foreground decoration-2`
- `ROUND_CONTROL`: `inline-flex shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-foreground`

`LandingHeader` switches to them with no visual change. The nav link's
`min-h-11` below `md` sits inside its existing `h-11` row.

### 4.2 App header (`Header.tsx`)

- `<header>`: `print:hidden paper-grain sticky top-0 z-40 grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4`. No `shadow-edge-bottom` and no `bg-elevated`.
- Left: the lessons menu button becomes `ROUND_CONTROL` at `h-11 w-11`. Logo chip `LOGO_CHIP`, wordmark `WORDMARK` (still hidden below `sm` when the menu button shows). The "│ DSA" course label stays from `md`.
- Centre nav: `NAV_LINK`, gap `gap-5 sm:gap-8`. The active link adds `NAV_LINK_ACTIVE` and `aria-current="page"`. An inactive link on hover gets a 1px underline, the active link a steady 2px one in ink, so hover never reads as selection. The Next.js course branch ("Curriculum") uses the same classes.
- Right: search is `ROUND_CONTROL` plus `h-11 w-11 md:h-10 md:w-auto md:gap-2 md:px-3.5 md:text-sm` (icon-only below `md`, labelled pill with ⌘K from `md`). Progress chip: `rounded-full border border-border h-10 px-3 text-[11px] text-muted`, lined up with search. `ThemeToggle` gets `h-11 w-11 rounded-full md:h-10 md:w-10`, as on the landing page.
- Focus stays the global unlayered `:focus-visible` outline; no per-element ring utilities.

### 4.3 Phone budget

Below `md` the nav links lose their pill padding (`px-2`, 2 × 6.5px each at
the 13px root) and gain `gap-5` (16.25px), and the chip grows by 6.5px: about
5px narrower than today at 320px, where today's row already fits. Measured
in the browser at 320, 375, 640, 768 and 1024px (§6).

## 5. Tests

- **`appHeader.test.ts`** (new):
  - `Header.tsx` and `LandingHeader.tsx` both import the `headerChrome` constants.
  - The app `<header>` carries `paper-grain` and `bg-background`, and no `shadow-edge-bottom` or `bg-elevated`.
  - Rendered nav marks the active mode with `aria-current="page"` and `NAV_LINK_ACTIVE`, and the other link with neither.
- **`landingHeader.test.tsx`**: "paints the grain once" becomes an allowlist.
  - `paper-grain`: AppShell 1, Header 1, Sidebar 1.
  - `grain-layer`: Sidebar 1, FloatingLessonsButton 1, MobileLessonsSheet 1.
  - No other file.
  - In `AppShell`, `<Header` and `<Sidebar` render outside the grain wrapper.
  - The "wrapper inside `<main>`" and sentinel tests keep passing against the unified wrapper.
- **`paperGrain.test.ts`**: the rule regex reads the shared `.paper-grain::before, .grain-layer` rule.
- **`grainContrast.test.ts`** (new): recomputes §3.4 from `globals.css` for both themes, and fails any text ink below 4.5:1 at the worst grain pixel.
- **`sidebarChrome.test.ts`**: unchanged. It follows the header's `bg-background` to `--rail-surface: var(--background)`.
- **`design-tokens.test.ts`**: no hex added.
- Every new or changed assertion is seen failing first (CLAUDE.md §2).

## 6. Browser verification (both themes)

1. Header at 320 / 375 / 640 / 768 / 1024px on a lesson, a module page, the problems list and a problem page: no overlap or overflow, and the active underline shows.
2. Grain continuous across header, drawer, desk; no seam at the header hairline or the drawer border.
3. Drawer tabs and fillets at 8x, open and closed.
4. Mobile lessons sheet at 375px: grain, accent strip still visible.
5. The problem page shows desk grain where the root used to be opaque; the IDE is unchanged.
6. The landing page is unchanged: header pixels, grain strength (sampled against a pre-change capture), snap and scrolled state.
7. Scrolling a long lesson stays smooth. The grain wrapper scrolls with content, as on the landing page.
8. Print preview hides all grain.

`tsc`, `eslint`, `vitest` and `next build` pass.

## 7. Doctrine (CLAUDE.md §4)

- The landing bullet: remove "no other route does" for the grain and "Exactly one `.paper-grain` may exist". The header half stays landing-only.
- New rule: the grain is the app's desk (§3). It has two forms with one paint, an allowlist of call sites, and nothing nested transparently; solid surfaces cover it; the worst-pixel contrast test guards it.
- Drawer bullet: `--rail-surface` is now `--background`.
- Shadow lists: remove "the sticky header" from both, and record that the app header is a hairline on the desk, like the landing header.

## 8. Out of scope and related

- The landing page's own layout, story and footer.
- The reading sheet, cards, callouts, code, IDE and dialogs.
- **The global code-language switch plan** (`.worktrees/code-lang-switch`, not started). Its Task 6 edits `Header.tsx` and measured the old pill links for its phone budget. Rebase it onto this change and re-measure before running that task.
