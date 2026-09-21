# leetExpert — HyperFrames visual system

Seek-safe, themeable DSA primitives. One source produces lesson art, social
stills and video, so a structure is drawn once and reused everywhere.

Built on **hyperframes v0.8.35**.

## Why each primitive is its own project

Every HyperFrames quality gate — `check`, `lint`, `validate`, `inspect`,
`snapshot` — takes a **project directory**, not a file. There is no
`--composition` flag on any of them. So a primitive that needs its own green
check must be its own project:

```
hyperframes/
  assets/                      one shared layer, never duplicated
    brand.css                  hand-written component rules around a GENERATED token
                               block: the app's dark/light themes + 7 family accents
    matrix-kinds.css           matrix-systems cell states, built from those tokens
    fonts/                     vendored woff2 (latin subsets) + fonts.css
    vendor/gsap.min.js         vendored GSAP — the renderer has no network
  primitives/
    range-scan/                array row + lo/hi/mid
      index.html
      hyperframes.json
      assets -> ../../assets   SYMLINK, not a copy
    linked-list/               nodes + next edges + 2 pointers
    binary-tree/               level-order tree + traversal + output strip
  data/                        row generators — traces are EXECUTED, not typed
  renders/
  new-primitive.sh
```

`assets` is a **symlink** because asset paths must be root-relative inside a
project: `../` traversal above the project root fails lint
(`invalid_parent_traversal_in_asset_path`) — renders rewrite it but Studio
preview 404s.

## Colour follows the app

`assets/brand.css` carries one generated block (between the BEGIN/END GENERATED
markers) read from `web/src/app/globals.css` (both themes: space-black dark,
paper light, the status hues) and `web/src/lib/visual/familyTheme.ts` (each
family's `accentUi`, raw accent and on-accent ink). Nothing is copied by hand,
so a video wears the site's themes and family colours and cannot drift from
them. `--accent` is the family's `accentUi` (3:1 on every app surface, both
themes); body-size accent text uses `--mark`, as in the app.

```bash
cd web && UPDATE_HYPERFRAMES_BRAND=1 npx vitest run tests/hyperframesBrand.test.ts   # regenerate
cd web && npx vitest run tests/hyperframesBrand.test.ts                              # check drift
```

That test also fails on any literal colour in a composition's stylesheet, so new
work goes through the tokens. Renders made before this change (`renders/*.mp4`)
still show the old navy palette until they are rendered again.

## The primitives

| Primitive | Shape | Covers |
| --- | --- | --- |
| `range-scan` | cell row + `lo`/`hi`/`mid` pointers, cells outside the range eliminated | binary search, two pointers, sliding window, prefix sum |
| `linked-list` | nodes + directed `next` edges + two labelled pointers, edges reversible | reversal, fast & slow, cycle detection |
| `binary-tree` | level-order tree (`.` = absent) + current/visited state + output strip | traversals, BST, heaps, recursion call trees |
| `matrix-systems` | one or more coloured boards (grids, memory strips) + overlays (window, shrinking bounds) + facts outro | the eight real-system scenes for the matrix module: framebuffers, filters, alert grouping, rotation, spiral, masking, sorted pages, routing |

All three take the same core variables: `eyebrow`, `title`, `family`, `theme`,
`steps` (JSON), `stepSeconds`.

## Rules these compositions follow

1. **State changes are `tl.set()`, never `tl.call()`.** GSAP suppresses
   callbacks during `seek()`, and render workers seek to arbitrary times in
   parallel — a `.call()` looks right in preview and produces wrong frames in
   the render.
2. **Geometry is measured or derived, never hardcoded twice.** Cell width lives
   in JS and is stamped onto the element; the tree measures its board inside
   `document.fonts.ready`, because font metrics change the header height and
   therefore the space the tree has (this caused real `escaped_container`
   warnings).
3. **No network.** GSAP and all fonts are vendored. `@font-face` is inlined in
   the composition, not linked — StaticGuard does not follow `<link>` and would
   let a silent system-font fallback ship.
4. **Ligatures off.** JetBrains Mono renders `<=` as `≤`; code in a frame must
   stay literally retypable.
5. **`autoAlpha` hides an element but keeps its box.** Reserving slots avoids
   mid-timeline reflow (good), but an over-reserved capacity still occupies
   layout and pushed the stack vessel clean off the frame. Capacity is derived
   from the trace's actual maximum depth, and slot size is clamped to fit.
6. **Defaults are real content, not placeholders.** `preview` and `snapshot`
   read the composition's defaults and accept no `--variables`, so a primitive
   with placeholder defaults cannot be reviewed without a full render — which
   is expensive on this machine. `data/set-defaults.py` bakes a generated row
   into the defaults via a JSON round-trip. Never edit that attribute with a
   regex; doing so corrupted it once
   (`invalid_composition_variables_declaration`).
7. **Traces are executed, not written.** Every `steps` array in `data/` is
   produced by running the real algorithm, with assertions (in-order on a BST
   must come out sorted; two pointers must land on the pair). A hand-typed
   trace can disagree with the algorithm it claims to show.

## Using them

```bash
# verify one primitive (lint + runtime + layout + motion + contrast)
npx hyperframes check primitives/range-scan

# regenerate traces from the algorithms
python3 data/build-rows.py

# render every variant of a primitive — one output per row
npx hyperframes render primitives/range-scan --batch data/rows.json --workers 2

# batch names files by row index; restore the meaningful names
python3 data/name-renders.py

# bake a generated variant into the defaults so preview/snapshot show it
python3 data/set-defaults.py stack-queue data/rows-stack-queue.json monotonic-stack

# still frames for review or for lesson/social art
npx hyperframes snapshot primitives/range-scan --at 1.0,3.2,5.4
```

`--workers 2` is deliberate: each worker is a separate Chrome at ~256 MB and
this machine had 4.7 GB free. A `catalog --json` run was OOM-killed at
`auto`.

### matrix-systems: frames are traced twice

`matrix-systems` renders the scenes of the "The Grid Underneath" artifact. Its
frames come from `data/build-matrix-systems.py` (Python), and
`data/check-matrix-systems.mjs` re-derives them from the artifact's JavaScript
(`data/matrix-systems-artifact.mjs`) and requires every cell, note, stat and
overlay to match. Run both before rendering:

```bash
python3 data/build-matrix-systems.py && node data/check-matrix-systems.mjs
npx hyperframes render primitives/matrix-systems --batch data/rows-matrix-systems.json --workers 2
python3 data/name-renders.py
```

`check` audits only the baked default scene (it accepts no `--variables`), so
after changing layout code `set-defaults.py` each scene in turn and `snapshot`
it. Palette tokens live in `assets/matrix-kinds.css` with measured contrast.
The intro and outro are hard cuts on purpose: the boards sitting under a
fading card trip the layout and contrast audits.

### matrix-systems: narration

`videos/matrix-systems/` holds the narration for the eight videos: `SCRIPT.md`
(hook, body lines that each cover a contiguous frame range, fact line),
`build-vo.py` (ElevenLabs, same voice and edge checks as arrays-intro),
`build-narration.py` (measured timings, one audio track per video, mux). The
composition takes `frameTimes`, `outroAt`, `factTimes` and `totalSeconds`, and
without them falls back to a fixed `stepSeconds`.

```bash
ELEVENLABS_API_KEY=... python3 videos/matrix-systems/build-vo.py [video]   # key from the environment only
python3 videos/matrix-systems/build-narration.py                            # rows-matrix-narrated.json + narration/*.m4a
npx hyperframes render primitives/matrix-systems --batch data/rows-matrix-narrated.json --workers 1
python3 data/name-renders.py                                                 # -> renders/<video>.timed.mp4
python3 videos/matrix-systems/build-narration.py --mux                       # -> renders/<video>.narrated.mp4
```

`build-narration.py --estimate` derives timings from word counts, for dry runs
of the pipeline only; it writes `rows-matrix-narrated.estimate.json`, which must
never be rendered for delivery. `SCRIPT.md` is validated against the scenes: a
beat range that does not tile the scene's frames fails the build.

### Gotcha worth remembering

A **lint error silently disables the layout and contrast audits**. `check` then
prints `0 sample(s)` and `0/0 text checks`, which reads clean but means nothing
ran. Always clear lint before trusting a green check.

## Curriculum coverage

Seven primitives express **18 of the 24 DSA modules**:

| Primitive | Shape | Modules covered |
| --- | --- | --- |
| `range-scan` | cell row + `lo`/`hi`/`mid`, out-of-range eliminated | arrays, strings, two-pointers, sliding-window, prefix-sum, binary-search, sorting |
| `binary-tree` | level-order tree (`.` = absent) + visit state + output strip | binary-trees, bst, heaps, recursion-backtracking |
| `grid` | sized 2D grid, current / dependency / filled states | matrix, dynamic-programming |
| `stack-queue` | LIFO vessel or FIFO channel + input tape | stacks, queues |
| `graph` | normalised node layout + rim-clipped edges, frontier state | graphs |
| `hash-buckets` | bucket array + collision chains | hash-tables |
| `linked-list` | nodes + directed `next` edges, reversible | linked-lists |

Still uncovered, with the shape each would need:

| Module(s) | Primitive needed |
| --- | --- |
| intervals | `interval-bars` — overlapping bars on a shared time axis |
| tries | a `binary-tree` variant with n-ary children and edge labels |
| big-o | `growth-curve` — plotted complexity classes |
| greedy | no single structure; likely `range-scan` or `interval-bars` reused |
| getting-started, math-for-dsa | no structural visual; typographic treatment |

The upstream HyperFrames registry has **no** data-structure primitives at all —
393 items, and zero hits for array, queue, heap, linked, sort or recursion. This
vocabulary is ours to own, and a candidate to contribute back.
