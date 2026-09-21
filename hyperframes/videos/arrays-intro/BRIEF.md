# BRIEF — Arrays module explainer

workflow: faceless-explainer
flow: autonomous

## Subject

An introduction to the **Arrays** module of the leetExpert DSA course: what an
array actually is, why indexing is O(1), how dynamic arrays grow, and what the
module covers.

## Confirmed intent

| Field | Value |
| --- | --- |
| angle | **concept** — the module's own train analogy is the spine |
| length | 75–90s (upper end of the sweet spot; the module teaches four concepts) |
| destination | **16:9** — embedded on the lesson page (`getChapterMedia` videoSrc) and YouTube |
| VO_MODE | scripted per scene, not verbatim from lesson prose |
| voice | ElevenLabs, informative/neutral register |
| audience | someone starting DSA who has written code but never reasoned about memory |

## Source of truth — derive, never invent

- `courses/dsa/arrays/contiguous-memory.md` — the train analogy, address arithmetic
- `courses/dsa/arrays/dynamic-arrays.md` — why a raw array cannot grow, doubling
- `courses/dsa/arrays/in-place-foundations.md` — O(1) auxiliary space, swaps
- `courses/dsa/arrays/stable-compaction-cyclic-placement.md` — read/write pointers
- `web/src/lib/course/manifest.ts` — module counts (verify, do not recall)

Every claim in the VO must trace to one of these. Complexity figures are checked
against the lesson that states them.

## Visual assets already available — reuse, do not regenerate

- **Module art**: `web/public/media/module-art/arrays-*.webp` (auto-flow generated).
  NOTE: the light/dark files are currently swapped (tracked separately) — pick by
  looking at the file, not by its name.
- **DSA primitives**: `hyperframes/primitives/*` — seven seek-safe compositions
  sharing `assets/brand.css`. `range-scan` covers array pointer work.
- **Brand layer**: `assets/brand.css` (tokens, 7 family accents), vendored fonts
  (Space Mono / Space Grotesk / JetBrains Mono), vendored GSAP.
- Arrays belongs to the **linear-traversal** family — accent `#0A7A6A`.

## Hard constraints

- Deterministic: no clocks, no unseeded random, no network, no `repeat: -1`.
- Fonts and GSAP are vendored and referenced root-relative.
- Ligatures off wherever code appears.
- Contrast must clear WCAG AA and be measured.
- `npx hyperframes check` must pass clean before any render.

## Out of scope

Captions/subtitles, a second language, vertical cuts. Those are later passes.
