# Translucent chrome and grain on the problem panes

**Date:** 2026-09-15
**Status:** approved by the owner, 2026-09-15. The request was relayed by the callout session; the owner answered each decision in this session.
**Builds on:** `2026-09-14-app-header-and-grain-design.md`, `2026-09-14-drawer-header-and-floating-opener-design.md`.

---

## 1. Decisions (owner)

| Question | Decision |
| --- | --- |
| Where the landing header's scrolled look goes | **Where content scrolls under it.** Lesson and module pages scroll beneath the app header, as the landing page does. The drawer's pinned row blurs the rows passing under it. The drawer rail and the problem sub-header stay grainy paper, because nothing passes under them. |
| Opacity | **90%** (`bg-background/90 backdrop-blur-md`). The blurred page grain shows through. |
| The landing header's scrolled state | **Aligned to 90%.** It was 80%. |
| Shadow on the drawer's pinned row | **None.** |
| Grain on the problem workspace | **The two `bg-elevated` panes only**: the desktop content pane and the mobile workspace pane. The `bg-surface` hover fills on back and prev/next stay solid. |

## 2. Why 90% (measured from the tokens)

Header muted text (the course label, search label, ⌘K, progress count) sits over translucent paper. The darkest real content that can pass under it is `--code-editor` (#14202e in light, which is also the module hero's ground). A translucent layer cannot carry `.grain-paper`, which is opaque, so the header's own grain is gone; only the page grain shows through, blurred.

| Paper opacity | Light muted | Dark muted |
| --- | --- | --- |
| 80% | 3.85 ✗ | 4.54 ✓ |
| 85% | 4.29 ✗ | 5.34 ✓ |
| **90%** | **4.76 ✓** | **6.20 ✓** |

Foreground stays ≥ 9.2 at every opacity. Before this change the landing header's 80% scrolled state fell to 3.85:1 in light.

Grain on `--elevated` panes, worst grain pixel: light 5.33 (`--good`), dark 5.14 (`--muted`), both AA. Grain on `--surface` fails in light (`--muted` 4.05), so hover fills stay solid.

## 3. Design

### 3.1 Shared translucent paper

`layout/headerChrome.ts` exports `TRANSLUCENT_PAPER = "bg-background/90 backdrop-blur-md"`. `LandingHeader` (scrolled) and `CourseNavPanel`'s pinned row use it. The app `Header` spells the same classes literally, because `sidebarChrome.test.ts` reads its `<header className="…">` as a string. A test keeps the three in step.

### 3.2 App header overlays the page (`Header.tsx`, `AppShell.tsx`)

- **`<header>`:** `print:hidden absolute inset-x-0 top-0 z-40 grid h-14 … border-b border-border bg-background/90 backdrop-blur-md shadow-edge-bottom …`. It drops `sticky` and `grain-paper`, and keeps `h-14`.
- **Shell:** the `h-dvh` column becomes `relative`, the positioning context for the header.
- **Page:** `<main>` runs from the top of the viewport. On every route except `/`, the desk wrapper gets `pt-14`, so page content starts below the header and scrolls up under it. Pages that fill `<main>` (the IDE, problems list, concept map) don't scroll, so the header sits over the desk's top padding.
- **Drawer rail:** starts below the header with `mt-14` instead of `h-full`. The flex row stretches it to the remaining height, so its pinned row is never covered. It stays `z-[45]` over the header's shadow.
- **Positions measured from the page scroller's top** move down by the header's 3.5rem:
  - `TableOfContents`: `sticky top-24` becomes `top-38`, and `max-h-[calc(100vh-7rem)]` becomes `max-h-[calc(100vh-10.5rem)]`.
  - `Markdown`: `prose-headings:scroll-mt-24` becomes `scroll-mt-38`.
  - The Next.js course lesson (disabled): `sticky top-20` becomes `top-34`.
- **Landing page unchanged:** its header lives inside `<main>` and the app header isn't rendered on `/`.

### 3.3 Drawer

- The rail is unchanged: `.grain-paper` on `--rail-surface`.
- The pinned row changes from `bg-background grain-paper` to `TRANSLUCENT_PAPER`. It gets no shadow and still no `border-b`.

### 3.4 Problem panes (`ProblemWorkspace.tsx`)

- `ProblemContentPane` (desktop, `bg-elevated`) and the mobile workspace (`bg-elevated`) add `grain-paper [--grain-paper:var(--elevated)]`.
- The sub-header, the IDE (`Sandbox`) and hover fills are unchanged.

## 4. Tests

- **`appHeader.test.tsx`:** the header carries `absolute`, `top-0`, `h-14`, `border-b`, `shadow-edge-bottom` and every class of `TRANSLUCENT_PAPER`, with no `grain-paper` and no `sticky`.
- **`courseNavPanel.test.tsx`:** the pinned row carries `TRANSLUCENT_PAPER`'s classes, no `grain-paper`, no `shadow-` and no `border-b`.
- **`landingHeader.test.tsx`:** the scrolled state carries `TRANSLUCENT_PAPER` via the shared import, not `/80`.
- **`sidebarChrome.test.ts`:** the rail class carries `mt-14` and not `h-full`. The shell column is `relative`. The desk wrapper adds `pt-14` except on `/`.
- **`paperGrain.test.ts`:** the `.grain-paper` allowlist changes Header 1 → 0 and CourseNavPanel 1 → 0, and adds ProblemWorkspace 2. The panes set `--grain-paper` to `var(--elevated)`.
- **`grainContrast.test.ts`:**
  - worst-pixel grain is also checked on `--elevated`;
  - a new test parses the opacity from `TRANSLUCENT_PAPER` and checks muted and foreground ≥ 4.5 over `--code-editor`, `--elevated` and `--background` beneath, in both themes.
- **Offsets:** a test asserts the TOC, heading scroll margin and Next.js sticky offsets each include the header's 3.5rem (`top-38`, `scroll-mt-38`, `top-34`).
- Every new or changed assertion is seen failing first.

## 5. Browser verification (both themes)

1. Lesson page at 1280px: scroll so a code block passes under the header. It blurs through, and header text stays legible.
2. The first content sits below the header at scroll 0, and a TOC click lands the heading below the header.
3. The drawer rail starts below the header. Its pinned row blurs rows scrolling under it.
4. On the problem page, the panes show grain and the IDE stays solid.
5. The landing page's scrolled header at 90%.
6. Mobile at 375px: the header overlays, and the content starts below it.

Gate: tsc, lint, vitest, build.

## 6. Doctrine (CLAUDE.md §4, only this change's sentences)

- **Drawer bullet:** the pinned row is `TRANSLUCENT_PAPER`, not grainy paper.
- **Landing bullet:** 80% becomes `TRANSLUCENT_PAPER` (90%).
- **Grain bullet:** remove the app header and pinned row from the `.grain-paper` list and add the problem panes. The app header sentence becomes "overlays the page, translucent 90% with blur and the edge shadow".
- **Shadow bullet:** "The app header carries no shadow" becomes "the app header's edge shadow falls on the page scrolling under it".

---

## 7. Amendment (owner, 2026-09-15): the drawer row at rest

**Found in browser verification:** with nothing scrolled under it, the translucent pinned row read as a lighter strip against the rail. Flat 90% paper is lighter than the rail's grainy paper.

**Decision:** follow the landing header's pattern.
- **At rest,** the row is grainy paper like the rail: `bg-background grain-paper`, inheriting the rail's `--grain-paper`.
- **Once rows scroll under it,** the row is `TRANSLUCENT_PAPER`. There is still no shadow and no `border-b`.
- **`CourseNavTree`** learns `scrolled` from a 1px sentinel at the top of the nav, observed with `IntersectionObserver({ root: nav })`. It does not use a scroll listener, because a drawer restored mid-scroll fires no scroll event.
  - It observes only when `onClose` is set. The mobile sheet has no pinned row.
  - It passes `scrolled` to `CourseNavPanel`, whose new `scrolled?: boolean` prop defaults to false.

**Tests:**
- `courseNavPanel.test.tsx`: the row is grainy paper at rest and translucent when `scrolled`. `CourseNavTree` uses an `IntersectionObserver` rooted at the nav and no scroll listener.
- `paperGrain.test.ts`: the allowlist counts `CourseNavPanel` 1 again.
