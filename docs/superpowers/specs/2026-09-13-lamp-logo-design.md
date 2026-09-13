# Lamp logo — design

**Date:** 2026-09-13
**Scope:** the leetExpert brand mark everywhere it renders — site header,
landing hero, favicons (SVG + PNG/ICO), home-screen tiles, OG/Twitter card.
**Out of scope:** the wordmark text and its two-tone ink, the manifest
`theme_color` / viewport `themeColor` (browser/OS chrome, not the mark), the
Coach panel's Sparkle badge (not a brand mark).

## Problem

Two different logos ship today and they share only a steel plate:

- The header ([Header.tsx](../../../web/src/components/layout/Header.tsx)) and
  the landing hero ([HomePage.tsx](../../../web/src/components/landing/HomePage.tsx))
  draw a `bg-pop` rounded square containing a `</>` glyph.
- `icon.svg`, `mark.svg`, `mark-square.svg`, every generated favicon/PWA icon,
  and the OG card draw code brackets flanking a checkmark.

Neither says anything specific about the product, and `src/app/icon.svg` is a
hand-kept copy of `src/assets/brand/mark.svg` with nothing enforcing the sync.

## Decision

Replace both with **the lamp**: a single soft-glowing green dot, signalling ON.
One mark, every surface.

Every choice below was made by the owner from rendered comparisons (visual
companion session, 2026-09-12/13), not from prose. Rejected alternatives and
why are recorded at the end.

| Decision | Choice |
| --- | --- |
| What the mark is | The dot **is** the whole logo |
| Container | **Bare** — no plate, no bezel |
| Position vs wordmark | **Leading** — `● leetExpert`, in the badge's slot |
| Motion | **Static**, plus one power-on bloom |
| Bloom timing | **T1 lamp strike**, 900ms |
| Bloom frequency | **Once per tab** |
| Green | **Grass** — `#2B7A3B` light / `#5BE07A` dark |
| Core size | **r = 15** on the 64 grid, one geometry at every size |
| Raster favicon | **F2** — bright core with dark rim |
| Home-screen tiles | **T-D** — dark tile |
| OG card | Lamp on the existing scrim, no plate |
| Landing hero badge | Static lamp, no bloom |

## The mark

### Geometry (64 × 64 grid)

| Part | Shape | Notes |
| --- | --- | --- |
| Halo | circle, r = 30, centred | radial fade to transparent |
| Core | circle, r = 15, centred | radial, specular focus at cx 38% / cy 34%, r 70% |

**Why r = 15, not the first-drafted r = 11.** In the 26px header box r = 11
leaves a ~9px core that reads light next to the 28px badge it replaces. The
halo's outer edge is fixed at r = 30, so every step up in core radius spends
halo band: r = 11 → 19 units of fade, r = 17 → 13 units, at which point the
mark reads as a green button rather than a light. r = 15 is the largest core
that still visibly glows, puts the core near the wordmark's cap height, and —
because only the core survives at 16px (~7.5px there vs ~5.5px at r = 11) —
lets a single geometry serve header, favicon and design size with no
size-specific redraw.

### Colour

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--press-lamp` | `#2b7a3b` | `#5be07a` | core mid stop, halo colour |
| `--press-lamp-hi` | `#43a354` | `#cfffd8` | core specular (0%) |
| `--press-lamp-lo` | `#1d5a29` | `#2fb455` | core edge (100%) |
| `--lamp-halo-peak` | `0.45` | `0.85` | halo opacity at centre |

Core stops: hi 0% → lamp 45% → lo 100%.
Halo stops (light): lamp @ peak 0% → 0.20 @ 34% → 0.06 @ 70% → 0 @ 100%.
Halo stops (dark): lamp @ peak 0% → 0.42 @ 32% → 0.11 @ 68% → 0 @ 100%.

### Contrast — measured, not eyeballed

The mark is a meaningful non-text graphic, so the floor is **WCAG 1.4.11,
3:1** against every surface it can render on. Values are read from
`globals.css` tokens and computed with the WCAG relative-luminance formula.

| Surface | Light `#2b7a3b` | Dark `#5be07a` |
| --- | --- | --- |
| `--elevated` | 5.32 (`#ffffff`) | 8.89 (`#26262a`) |
| `--press-paper` | 4.82 (`#f1f4f9`) | 11.04 (`#121214`) |
| `--code` | 4.36 (`#e4e9f2`) | 10.34 (`#19191d`) |
| deepest (`--press-paper-sunk` / `--surface`) | **3.91** (`#d8dde8`) | 11.53 (`#0c0c0d`) |

The shaded edge is darker than the core in both themes, so the silhouette
scores higher still: light edge `#1d5a29` is 7.48 on paper and 6.06 on sunk;
dark edge `#2fb455` is 5.59 on elevated.

### Known, accepted asymmetry

A glow cannot be brighter than white. On light paper the halo renders as a
pale green wash and the core must be *darker* than the page to be seen, so the
light theme reads "saturated and lit"; only the dark theme genuinely glows.
This is inherent to a bare dot with no plate and was accepted when the bare
container was chosen.

### Relationship to `--good`

Grass is 1.18:1 from the Success ink in light and 1.13:1 in dark — too close
to separate by luminance. They are separated by **form and place**: the lamp
is always a glowing circle at the top-left of chrome; `--good` is always a
flat tick, chip or border inside content (sandbox verdicts, solved chips,
correct quiz answers). The stress test rendered both together; in dark the
two greens are visibly similar, which is why the scope guard below is
load-bearing, not decorative. `--lamp` is a separate token so neither can be
retuned by accident through the other.

## Motion — the power-on bloom

### T1 lamp strike (900ms)

| Layer | Keyframes | Easing |
| --- | --- | --- |
| Core | 0%: opacity 0, scale .55 → 18% (162ms): opacity 1, scale 1.08 → 34% (306ms) – 100%: scale 1 | `cubic-bezier(.2,.8,.2,1)` |
| Halo | 0–10% (90ms): opacity 0, scale .35 → 45% (405ms): opacity 1, scale 1.22 → 100%: scale 1 | `cubic-bezier(.2,.8,.2,1)` |

Both layers use `transform-box: fill-box; transform-origin: center` and
`animation-fill-mode: both`. The core ignites first and the halo follows 90ms
later, which is what makes it read as "switched on" rather than "faded in".

### When it fires

1. **Once per tab**, on the first page painted in that tab. Implemented with
   `sessionStorage`, which is per-tab by specification — so a new tab replays
   it, and that is the intended behaviour, not a leak.
2. **Not on client navigation.** `Header` is rendered by `AppShell` in the root
   layout and stays mounted across App Router navigations, so there is no
   remount to retrigger.
3. **On hover and keyboard focus** of the header logo link (`:hover`,
   `:focus-visible`), so mouse and keyboard users both get it. Uses a
   separately-named keyframe so the browser restarts the animation.
4. **Header only.** The landing hero lamp is static.
5. **Never under reduced motion.** An explicit
   `@media (prefers-reduced-motion: reduce) { … animation: none }` for the
   lamp. (The global rule at `globals.css:482` already clamps durations to
   0.01ms and fill-mode `both` would leave it lit; the explicit rule exists so
   the lamp's behaviour does not silently depend on that global.)

### No flash

If the server sent a lit mark and the bloom started after hydration, users
would see lit → dark → bloom. Instead an inline script in `<head>` — the same
pre-paint pattern `next-themes` already uses for the colour theme — runs
before first paint:

```js
try {
  if (!sessionStorage.getItem("lamp-lit")) {
    document.documentElement.dataset.lampBoot = "";
    sessionStorage.setItem("lamp-lit", "1");
  }
} catch {}
```

CSS keys the bloom off `html[data-lamp-boot] .lamp--bloom`, so it runs from
the first paint. `<html>` already carries `suppressHydrationWarning`. The
`try` matters: storage access throws in some privacy modes, and the fallback
must be the static lit mark, never an unlit one. Verified: the site sends no
Content-Security-Policy, so an inline script is not blocked.

## Surfaces

### Header and landing hero

- `Header.tsx`: the `bg-pop` `</>` span becomes `<Lamp bloom />` in a 26px
  box; the logo `Link` gains the class that scopes hover/focus replay.
- `HomePage.tsx`: the hero eyebrow's `</>` span becomes `<Lamp />` (24px,
  static). Leaving it would keep the retired logo on the most-visited page.

### Favicons

- **`icon.svg`** (browsers that load SVG favicons): the theme pair, switched by
  an embedded `@media (prefers-color-scheme: dark)` style. This follows the OS
  theme, which is what browser tab chrome follows.
- **PNG 16/32/48 + ICO** (fallback): one fixed image on an unknown tab colour.
  **F2:** dark-theme core `#5be07a` with a 4-unit `#1d5a29` rim stroke on
  the core, transparent background.

  | Tab | Contrast carried by | Ratio |
  | --- | --- | --- |
  | Chrome light `#dee1e6` | rim | 6.29 |
  | white `#ffffff` | rim | 8.25 |
  | Chrome dark `#35363a` | core | 7.12 |
  | dark strip `#202124` | core | 9.50 |

  Rejected F1 (single `#379146`, no rim) cleared all four by 3.02 / 3.05 —
  passing on paper, failing on the first tab grey that differs slightly.

### Home-screen tiles (T-D)

iOS renders a transparent `apple-touch-icon` on black, and Android draws
icons on a tile, so a background is unavoidable here. **Dark tile:**
`#5be07a` lamp on `#121214` (9.74:1).

- `apple-icon.png` 180px: full-bleed square (iOS applies its own squircle).
- `android-chrome-192/512`: rounded tile (rx 14 on the 64 grid), matching
  today's treatment of the Android icons.

### OG / Twitter card

`lib/seo/ogImage.tsx` (Satori; already on the hex allowlist): the white plate
with brackets/check is removed and the dark-theme lamp sits directly on the
steel scrim. `#5be07a` against the scrim colour `#16202e` is **9.68:1**. That
is measured against the scrim's colour, not the rendered composite: the scrim
is 92% opaque at the left edge where the lamp sits, so the real backdrop
shifts it slightly — confirm on the rendered card. Satori's SVG gradient
support must likewise be confirmed by rendering `/opengraph-image`, not
assumed.

## Implementation

| File | Change |
| --- | --- |
| `web/src/app/globals.css` | Lamp tokens in `:root` and `.dark` with measured ratios in comments; `--lamp` role; `--color-lamp` in `@theme inline`; `.lamp` layer classes, both keyframes, boot/hover/focus selectors, explicit reduced-motion rule |
| `web/src/components/brand/Lamp.tsx` (new) | Client component; inline SVG; gradient stops via `style={{ stopColor: "var(--press-lamp…)" }}` so no raw hex; gradient ids from `useId` (header and hero can render together, and duplicate ids resolve to the first definition); `aria-hidden` (the link text names the site); `bloom?: boolean` |
| `web/src/components/layout/Header.tsx` | badge → `<Lamp bloom />`; logo link replay class |
| `web/src/components/landing/HomePage.tsx` | hero badge → `<Lamp />` |
| `web/src/app/layout.tsx` | pre-paint `<head>` script (above) |
| `web/src/assets/brand/mark.svg` | theme-aware lamp (source for `icon.svg`) |
| `web/src/app/icon.svg` | byte-identical copy of `mark.svg` |
| `web/src/assets/brand/mark-raster.svg` (new) | F2 rimmed lamp, transparent |
| `web/src/assets/brand/mark-tile.svg` (replaces `mark-square.svg`) | T-D dark full-bleed tile |
| `web/src/assets/brand/mark-tile-rounded.svg` (new) | T-D dark rounded tile |
| `web/scripts/generate-icons.mjs` | repoint sources; rerun; commit outputs |
| `web/src/lib/seo/ogImage.tsx` | plate → lamp |
| `web/src/components/coach/CoachPanel.tsx` | reword the comment that cites the wordmark badge's `bg-pop` pair, which no longer exists |
| `web/package.json` | add `sharp` as a devDependency — it is only transitive via `next` today, and test 6 must not break silently on a Next upgrade |
| `CLAUDE.md` §4 | record the brand-lamp exception to the monochrome base |

### Doctrine amendment (`CLAUDE.md` §4)

The design system mandates a monochrome steel base. The lamp is the first
non-steel ink in chrome, and it is a deliberate, owner-approved exception.
Add a bullet stating: the brand lamp is the **only** non-steel colour
permitted in chrome; `--lamp` renders the mark and nothing else; it is not a
UI accent, status, or focus colour; the guard in `tests/brandLamp.test.ts`
enforces this. Without a written exception and a guard, the next contributor
who needs "a green" reaches for `--lamp` and brand colour leaks into buttons.

## Tests — `web/tests/brandLamp.test.ts` (new)

1. **Contrast.** Light and dark `--press-lamp` clear 3:1 against every surface
   token (`press-paper`, `elevated`, `code`, deepest) read from
   `globals.css`, reusing the existing luminance helpers' formula.
2. **Scope guard.** `--lamp`, `--press-lamp*`, and `*-lamp` utilities appear
   only in `globals.css` and `components/brand/Lamp.tsx`.
3. **Retired mark.** `Header.tsx` and `HomePage.tsx` render `<Lamp` and
   contain no `"</>"` badge.
4. **Sync.** `src/app/icon.svg` is byte-identical to
   `src/assets/brand/mark.svg` — replacing the unenforced "kept in sync by
   hand" comment.
5. **Assets mirror tokens.** Every lamp hex in `mark*.svg` equals the
   corresponding `globals.css` token, so retuning a token fails CI until the
   static icons are regenerated.
6. **Pipeline actually ran.** Decode `public/favicon-32x32.png` with `sharp`;
   the centre pixel is green-dominant. Catches an SVG edited without rerunning
   `generate-icons.mjs`, which would ship the old steel PNG.
7. **Reduced motion.** `globals.css` contains the explicit lamp
   `animation: none` rule inside `prefers-reduced-motion: reduce`.

**Prove the suite can fail:** set light `--press-lamp` to `#7fff00`, confirm
test 1 fails naming the surface and ratio, restore.

## Verification

- `tsc`, `eslint`, `npm test`, `npm run build` all pass.
- Browser, both themes: lamp renders at r 15 in the header and hero.
- Bloom fires on first load of a tab; does not fire on client navigation;
  replays on hover and on keyboard focus; replays in a fresh tab.
- Reduced-motion emulation: lamp appears lit immediately, no animation.
- No flash: reload with throttled CPU shows no lit frame before the bloom.
- `/opengraph-image` and `/twitter-image` render the lamp on the scrim.
- Generated PNG/ICO/apple/android icons inspected visually at true size.

## Amendments during planning (2026-09-13)

Found while reading the code to write the implementation plan. None changes
what the owner sees; each corrects a detail the spec got wrong or left
unimplementable.

1. **No `--color-lamp` mapping.** It would have no consumers — `Lamp.tsx`
   paints from `var()` directly — and would only generate `bg-lamp` /
   `text-lamp` utilities that the scope guard exists to forbid.
2. **Halo stop offsets unified to 33% / 69%** in both themes (was 34/70
   light, 32/68 dark). SVG `offset` is an attribute, not a CSS property, so it
   cannot take a theme variable; the shift is under one unit on the 64 grid.
   The per-theme opacities remain tokens (`--lamp-halo-a|b|c`).
3. **The boot script is the first child of `<body>`, not in `<head>`** —
   the pattern `next-themes` uses. It still runs before the header markup is
   parsed, so the no-flash guarantee holds, without hand-authoring `<head>`
   in the root layout. The script string lives in
   `components/brand/lampBoot.ts` so it can be unit-tested.
4. **The flag is written before the attribute is set.** If storage can't be
   written, the lamp stays statically lit instead of blooming on every load.
5. **`data-lamp-boot` is removed when the first bloom ends.** Without this,
   ending a hover would drop the replay animation, fall back to the boot
   selector, and play the bloom again.
6. **Lamp tokens go in the first `:root` and first `.dark` block.**
   `globals.css` has later blocks of both, and the token suites slice
   `:root`→`.dark` from the first occurrence.
7. **`generate-icons.mjs` copies `mark.svg` → `icon.svg`** instead of relying
   on a hand copy; the byte-identical test stays as the guard.
8. **Home-screen tiles scale the lamp to 72%** so the halo clears iOS's
   squircle mask.
9. **The test file is `brandLamp.test.tsx`**, since it renders `<Lamp>` with
   `renderToStaticMarkup`, and it gains boot-script tests and an OG-card
   colour test. Contrast helpers move to `tests/helpers/contrast.ts`, shared
   with `design-tokens.test.ts`.

## Rejected alternatives

| Option | Why not |
| --- | --- |
| Dot as a companion to the existing mark / wordmark lockup only | Owner chose the dot as the whole logo |
| Steel plate / LED well / glow-flooded plate | Owner chose bare; plate variants were the more reduction-safe option and were shown as such |
| Trailing dot (`leetExpert ●`) | Stronger product metaphor (a prompt cursor) but weaker as a standalone icon |
| Dot at the seam (`leet●Expert`) | No dot-alone form left for favicon/app icon |
| Infinite breathe / heartbeat | Runs forever in a sticky header above reading on every lesson; a blink is the UI idiom for "needs attention" |
| Reuse `--good` | Semantic collision with pass/correct states; zero-token saving not worth it |
| Teal-mint `#00876b` / `#2fe3a6` | Recommended; owner preferred grass |
| Neon / lime (`#00ffa3`, `#39ff14`, `#ccff00`, …) | 1.07–1.24:1 on light paper — not a WCAG technicality, the mark is invisible. Rim, fork, and disc rescues were shown |
| T2 slow warm-up (1400ms) | Softer but slower, with a less definite end |
| Once per visit across tabs | Needs a cookie or timestamped `localStorage` for a marginally rarer bloom |
| F1 single mid-green raster favicon | 3.02 minimum — passes with no margin |
| T-L light tile | The no-glow version of the mark on the home screen |
