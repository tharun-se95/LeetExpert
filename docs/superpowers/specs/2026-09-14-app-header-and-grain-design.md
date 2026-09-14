# App header and paper grain, app-wide

**Date:** 2026-09-14
**Scope:** the app header on every route except `/`, the paper grain moved
from the landing page to the whole app's desk, and the lessons drawer, its
tabs, the mobile lessons sheet and the problem page's sub-header onto that
grainy paper. Builds on the landing work in
`2026-09-14-landing-header-and-grain-design.md`, which is uncommitted in the
main checkout; the owner chose to build on top of it rather than wait.
**Status:** design approved by the owner, 2026-09-14. Revised the same day
after a before/after mockup of the real pages: the problem sub-header joins
the grain, the drawer tab fillets carry grain, and solid surfaces take grain
through a background-layer paint instead of extra elements.

---

## 1. Decisions (owner, 2026-09-14)

| Question | Decision |
| --- | --- |
| How far the app header goes toward the landing header | **Same look, app height.** The landing header's visual language, but `h-14` stays, along with full width, the progress chip, the lessons menu and the "│ DSA" label. |
| Background | **The landing page's grainy paper is the app background** on every route. |
| Lessons drawer, its tabs and the mobile lessons sheet | **Grainy paper, like the header.** Keeps the 2026-09-13 rule that the drawer matches the header. |
| Problem page sub-header (back link, title, arrows) | **Grainy desk, not `bg-elevated`.** The mockup showed a grainy app header above a solid grey sub-header reading as two surfaces. |
| Drawer tab fillets | **Carry the grain.** The mockup at 4x showed flat wedges at the four corners. |
| Lesson reading sheet, cards, code, IDE | **Stay solid.** The grain is the desk; solid surfaces cover it, as on the landing page. |
| Sequencing | Build now in the main checkout, on top of the uncommitted landing work; stage hunk by hunk around it. |

Rejected, with reasons:
- An exact copy of the landing header, 72px tall with a centred column. It costs 27px on every viewport-locked lesson and IDE page, and redoes the drawer tab geometry.
- A grainy reading sheet. It puts lesson text directly on grain and removes the sheet-on-desk structure the cards inside it rely on.

## 2. Current state (measured, 1280px wide, 13px root)

| | Landing header | App header |
| --- | --- | --- |
| Height | 72.5px | 45.5px (`h-14`) |
| Paper | transparent over grain, hairline; frosted + shadow once scrolled | solid `bg-elevated` + `shadow-edge-bottom` |
| Logo | `h-9` chip, `text-base` wordmark | `h-7` chip, `text-sm` wordmark, "│ DSA" |
| Nav | full ink, 400, no pills, underline on hover | muted, active = filled `bg-pop` pill, no `aria-current` |
| Controls | round hairline, 33px | 25px pill search, 26px toggle, progress pill |

Relevant structure:
- **Grain today.** The grain is `.paper-grain`: `isolation: isolate` plus a `::before` layer at `z-index: -1`, painting `/textures/grain.png` at 200px with `opacity: var(--grain-opacity)` (0.067 in both themes).
  - It sits on one wrapper inside `<main>`, so it scrolls with content.
  - `landingHeader.test.tsx` allows exactly one `paper-grain` in `src/**/*.tsx`. A transparent grain wrapper nested in another doubles the strength.
- **Drawer tests.** `sidebarChrome.test.ts` derives `.sidebar-rail`'s `--rail-surface` from the header's `bg-*` class, and the opener tab's offset from its `h-*` class. It forbids `background-image` and `color-mix` inside the `.sidebar-rail` rule.
- **Reading sheet.** The lesson prose sits on `.reading-page`, a solid `--elevated` sheet. Cards inside it use `in-[.reading-page]:bg-background` as wells.
- **Opaque page paper that hides the desk.**
  - The `ProblemWorkspace` root (`bg-background`) and its sub-header (`bg-elevated`).
  - The IDE sandbox root (`Sandbox.tsx`, `bg-background`) is tool chrome and stays.
- **Taken pseudo-elements.** `.drawer-tab` already uses `::before` and `::after` for its fillets: radial gradients painting `--rail-surface` outside a circle, with a 1px `--border` ring. The mobile sheet uses `before:` for its accent strip.
- **Header position.** The app header sits above `<main>`, so content never scrolls under it.

## 3. Grain

### 3.1 Two paints, one strength

- **`.paper-grain`** (existing, unchanged): the `::before` layer, for a
  **transparent** element that must show grain over whatever paper is behind
  it. Exactly one use: the desk wrapper inside `<main>`.
- **`.grain-paper`** (new): grain as background layers on an **opaque**
  surface. `--grain-paper` names the surface's paper, defaulting to
  `var(--background)`:

  ```css
  .grain-paper,
  .drawer-tab::before,
  .drawer-tab::after {
    --grain-veil: color-mix(
      in srgb,
      var(--grain-paper, var(--background)) calc((1 - var(--grain-opacity)) * 100%),
      transparent
    );
  }
  .grain-paper {
    background-image:
      linear-gradient(var(--grain-veil), var(--grain-veil)),
      url("/textures/grain.png");
    background-size: auto, 200px 200px;
    background-repeat: no-repeat, repeat;
  }
  ```

  The paper at `1 − opacity` over the opaque tile composites to exactly
  what the tile at `opacity` over the paper does. Measured in Chromium
  against `.paper-grain` on `--background`, 400×400px: max channel
  difference 1/255, identical means, both themes.
  `background-color` still comes from the element's own `bg-*` class.
- `--grain-veil` is declared on the same selectors that use it. A custom
  property resolves `var()` where it is declared, so a `:root` declaration
  would freeze `--grain-paper` at `:root`'s value.
- `print` removes both paints.

### 3.2 Where it goes

| Element | File | Paint | Paper |
| --- | --- | --- | --- |
| Page desk: one wrapper inside `<main>` for every route. The landing branch keeps its sentinel and `LandingHeader` inside the same wrapper. | `AppShell.tsx` | `.paper-grain` | transparent over `body` (`bg-background`) |
| App header | `Header.tsx` | `.grain-paper` | `bg-background` |
| Lessons drawer rail | `Sidebar.tsx` | `.grain-paper`, `--grain-paper: var(--rail-surface)` | `--rail-surface` |
| Drawer close tab | `Sidebar.tsx` | `.grain-paper` (inherits `--grain-paper` from the rail) | `--rail-surface` |
| Drawer opener tab | `FloatingLessonsButton.tsx` | `.grain-paper`, `--grain-paper: var(--rail-surface)` | `--rail-surface` |
| Drawer tab fillets | `globals.css` `.drawer-tab::before/::after` | veil + tile, cut by `mask` (§3.3) | `--rail-surface` |
| Mobile lessons sheet | `MobileLessonsSheet.tsx` | `.grain-paper` | `bg-elevated` → `bg-background` |

- `ProblemWorkspace`'s root drops `bg-background`, and its sub-header drops
  `bg-elevated`. Both are then transparent over the desk wrapper, with the
  sub-header keeping its `border-b`.
- Unchanged and solid: `.reading-page`, every card and well, code surfaces,
  the IDE (`Sandbox` ide root, toolbar, panes), `SearchDialog`, viz fullscreen.
- Nothing is nested transparently. `.grain-paper` surfaces are opaque, so a
  grain beneath one is covered, not added to.

### 3.3 Drawer tab fillets

Each fillet keeps its geometry: a `--radius-md` square, circle centred on
the outer corner, a bare `100%` offset, a 1px `--border` ring. Only its paper
changes, from a flat gradient stop to grain, and a mask does the cutting.
The `::before` version (the `::after` mirrors it with `circle at 100% 100%`):

```css
.drawer-tab::before {
  bottom: 100%;
  background:
    radial-gradient(circle at 100% 0,
      transparent calc(var(--radius-md) - 1.25px),
      var(--border) calc(var(--radius-md) - 0.75px),
      var(--border) calc(var(--radius-md) - 0.25px),
      transparent calc(var(--radius-md) + 0.25px)),
    linear-gradient(var(--grain-veil), var(--grain-veil)),
    url("/textures/grain.png") 0 0 / 200px 200px;
  --grain-paper: var(--rail-surface);
  mask: radial-gradient(circle at 100% 0,
    transparent calc(var(--radius-md) - 1.25px),
    #000 calc(var(--radius-md) - 0.75px));
}
```

The mask is the old fill gradient's shape, so the edge anti-aliases the same
way and the ring lies fully inside the opaque part. Checked at 8x, both
themes, open and closed (§6).

### 3.4 Drawer paper

`.sidebar-rail { --rail-surface: var(--background); }`, the header's paper
by the existing rule. The rail separates from the page by its `border-r` and
`shadow-edge-right`, as today; there is no longer a brightness step.

### 3.5 Contrast over grain (computed from the tokens)

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

- **`<header>`:** `print:hidden grain-paper sticky top-0 z-40 grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4`. No `shadow-edge-bottom` and no `bg-elevated`.
- **Left:**
  - The lessons menu button becomes `ROUND_CONTROL` at `h-11 w-11`.
  - Logo chip `LOGO_CHIP`; wordmark `WORDMARK`, still hidden below `sm` when the menu button shows.
  - The "│ DSA" course label stays from `md`.
- **Centre nav:**
  - `NAV_LINK`, gap `gap-5 sm:gap-8`.
  - The active link adds `NAV_LINK_ACTIVE` and `aria-current="page"`.
  - An inactive link on hover gets a 1px underline, the active link a steady 2px one in ink, so hover never reads as selection.
  - The Next.js course branch ("Curriculum") uses the same classes.
- **Right:**
  - Search is `ROUND_CONTROL` plus `h-11 w-11 md:h-10 md:w-auto md:gap-2 md:px-3.5 md:text-sm`: icon-only below `md`, a labelled pill with ⌘K from `md`.
  - Progress chip: `rounded-full border border-border h-10 px-3 text-[11px] text-muted`, lined up with search.
  - `ThemeToggle` gets `h-11 w-11 rounded-full md:h-10 md:w-10`, as on the landing page.
- **Focus** stays the global unlayered `:focus-visible` outline, with no per-element ring utilities.

### 4.3 Phone budget

Below `md` the nav links lose their pill padding (`px-2`, 2 × 6.5px each at
the 13px root) and gain `gap-5` (16.25px), and the chip grows by 6.5px: about
5px narrower than today at 320px, where today's row already fits. The
mockup confirmed the 375px row fits. Measured at 320, 375, 640, 768 and
1024px (§6).

## 5. Tests

- **`appHeader.test.tsx`** (new):
  - `Header.tsx` and `LandingHeader.tsx` both import the `headerChrome` constants.
  - The app `<header>` carries `grain-paper` and `bg-background`, and no `shadow-edge-bottom` or `bg-elevated`.
  - Rendered with `renderToStaticMarkup`, `next/navigation`'s `usePathname` and `useProgress` mocked (`vi.mock`), on `/courses/dsa/arrays` and on `/courses/dsa/problems`: the active mode's link carries `aria-current="page"` and `NAV_LINK_ACTIVE`, and the other link carries neither.
- **`paperGrain.test.ts`** (extended):
  - `.grain-paper` layers `linear-gradient(var(--grain-veil), var(--grain-veil))` over `url("/textures/grain.png")` at `200px 200px`.
  - `--grain-veil` mixes `var(--grain-paper, var(--background))` at `calc((1 - var(--grain-opacity)) * 100%)` and is declared on `.grain-paper` and both fillet pseudo-elements.
  - Both fillets carry the veil, the tile and a `mask: radial-gradient(`.
  - `.grain-paper` is used exactly in: Header, Sidebar (rail and close tab), FloatingLessonsButton, MobileLessonsSheet.
  - Sidebar and FloatingLessonsButton set `--grain-paper` to `var(--rail-surface)`.
- **`landingHeader.test.tsx`**: "paints the grain once" stays (one `paper-grain`, in `AppShell`). The wrapper and sentinel tests pass against the unified wrapper, and a new assertion checks that `<Header` and `<Sidebar` render outside it.
- **`grainContrast.test.ts`** (new): recomputes §3.5 from `globals.css` for both themes, and fails any text ink below 4.5:1 at the worst grain pixel.
- **`sidebarChrome.test.ts`**:
  - The rail paper test follows the header's `bg-background` to `--rail-surface: var(--background)`, with no edit.
  - The fillet ink test still finds `var(--rail-surface)`, `var(--border)` and `radial-gradient(`.
  - The problem header tests read `lg:pl-12` and `lg:py-3`, which are unchanged.
- **`design-tokens.test.ts`**: no hex added.
- Every new or changed assertion is seen failing first (CLAUDE.md §2).

## 6. Browser verification (both themes)

1. **Header at 320 / 375 / 640 / 768 / 1024px** on a lesson, a module page, the problems list and a problem page: no overlap or overflow, and the active underline shows.
2. **Grain is continuous** across header, drawer, desk and the problem sub-header, with no seam at the header hairline or the drawer border.
3. **Drawer tabs and fillets at 8x**, open and closed. No flat wedge; the ring meets the tab border as before.
4. **Mobile lessons sheet at 375px:** grain shows, and the accent strip is still visible.
5. **The problem page** shows desk grain in the root and sub-header; the IDE is unchanged.
6. **The landing page is unchanged:** header pixels, grain strength (sampled against a pre-change capture), snap and scrolled state.
7. **Scrolling a long lesson stays smooth.**
8. **Print preview hides all grain.**

`tsc`, `eslint`, `vitest` and `next build` pass.

## 7. Doctrine (CLAUDE.md §4)

- **The landing bullet.** Remove "no other route does" for the grain. The header half stays landing-only.
- **New rule: the grain is the app's desk (§3).**
  - Two paints, one strength: `.paper-grain` for the one transparent desk wrapper, `.grain-paper` for opaque surfaces.
  - Solid surfaces cover it.
  - The worst-pixel contrast test guards it.
- **Drawer bullet.** `--rail-surface` is now `--background`, and the tabs and fillets carry the grain.
- **Shadow lists.** Remove "the sticky header" from both, and record that the app header is a hairline on the desk, like the landing header.

## 8. Out of scope and related

- The landing page's own layout, story and footer.
- The reading sheet, cards, callouts, code, IDE and dialogs.
- **The global code-language switch plan** (`.worktrees/code-lang-switch`, not started). Its Task 6 edits `Header.tsx` and measured the old pill links for its phone budget. Rebase it onto this change and re-measure before running that task.
