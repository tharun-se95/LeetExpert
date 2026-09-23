# Landing page: natural scroll, grouped features, a full-3D hero

Owner direction, 2026-09-23. The visual reference is the approved design
canvas (`leetExpert Landing Page`, claude.ai artifact 23yanGrig5uohjiwETbbmk:
the light page and the dark hero).

## What changed, and why

1. **The page scrolls like any other.** The wheel paging (`useSectionPaging`,
   `wheelGesture`), the snap stops (`snap-y`/`snap-start`, `STOP`'s
   `min-h-dvh`) and the typed headings (`TypedText`, the typing helpers in
   `story.ts`) are deleted. Owner: "lets update the landing page to be like a
   regular landing page scroll … no more scroll to reveal".
2. **Understand, Build and Keep show every feature.** Each section is a header
   (kicker with icon, a heading with its key word drawn over, the lede) and
   three stacked rows: icon tile, name, line and link beside the real
   component, on alternate sides. No tabs, no selected state, nothing inert.
   Rows carry `id={verb.id}`, so the hero's chips are plain anchors.
3. **Each component floats on a card of its own** (owner chose a light frame
   per demo): the navy instruments, a paper card round the tracer, the
   heatmap's own card. The card rests tilted in 3D and bobs.
4. **Motion as the page scrolls** is CSS on view timelines bound to `<main>`:
   cards tilt in, headings and rows rise, marks and rules draw, icons pop,
   section line drawings (`SectionDeco`) drift, the hero lifts away. Every
   resting state is the finished page; `prefers-reduced-motion` stills it all.
5. **The hero's art is a full-3D floor** (`HeroFloor`), replacing the 2.5D
   canvas backdrop that sat behind the whole page (`LandingBackdrop`,
   `boxesGrid`, `--boxes-*`, deleted). Owner: "use the box grid in the
   background in the hero and instead of 2.5D lets go full 3d", then "hero
   text is clashing with background box grid fix it": the floor is anchored to
   the hero's foot at `--hero-floor-h`, the copy is padded by exactly that, it
   fades in from its top edge, and the nine chips sit on a solid strip — so it
   is never under text, at any window height. Themes via `--floor-*` tokens.
6. **Livelier type**: headings at `text-6xl`, the hero at `xl:text-7xl` with
   words arriving on load, "code." in the accent with a caret and "right."
   ringed by hand with a tick; the marked word per heading.

## Constraints kept

- Headline: one sentence per line (owner, 2026-09-14); the accessible name is
  the plain sentences, the animated words are aria-hidden.
- Family colour is scoped to content: `familyCssVars` on each section, never
  chrome; body-size text never in `--accent`.
- Heavy features still load only once their section is near
  (`useActiveSection`, now its only job besides the stage cards' rise).
- Nothing between a view-timeline element and `<main>` may become a scroll
  container: the column is `overflow-x-clip`, the hero `overflow-clip`.

## Tests

`landingStory.test.tsx` ("scrolling", "hero"), `landingFeatures.test.tsx`
(rows, marks), `landingInside`, `landingFooter`; the paging, deck and boxes
tests were deleted with their code, and the boxes contrast checks left
`paperContrast.test.ts` because no text sits over the floor.
