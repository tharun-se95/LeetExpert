# HyperFrames — capability briefing for leetExpert

Gathered 2026-09-12 against **hyperframes v0.8.35**. Everything below marked
**[verified]** was executed or read directly; **[inferred]** is reasoning from
those facts and has not been proven by a build.

---

## 1. What HyperFrames actually is

**It renders video from HTML.** A composition is an HTML file whose DOM
declares timing with `data-*` attributes, whose animation runtime is
*seekable*, and whose media playback is owned by the framework. It is not a
design tool and not a React renderer — it is a deterministic HTML → frames
pipeline driven by one paused GSAP timeline. [verified: `hyperframes-core`]

The consequence that matters most to us is in §6.

## 2. Environment status on this machine [verified: `hyperframes doctor`]

| Check | State |
| --- | --- |
| CLI | 0.8.35 (latest) |
| Node | v22.23.2, darwin arm64 |
| Chrome headless shell | cached and present |
| FFmpeg / FFprobe | 9.0.1 (Homebrew) |
| whisper-cpp | present (`/opt/homebrew/bin/whisper-cli`) |
| TTS (Kokoro) | **not installed** — optional, local voice fallback |
| BGM (MusicGen) | **not installed** — optional, local music fallback |
| Docker | **not installed** — only needed for `--docker` deterministic renders |
| Memory | 16 GB total, **4.7 GB free at probe time** |

Nothing blocks local rendering today. Two cautions:

- Each render worker launches its own Chrome at **~256 MB**. With ~4.7 GB free,
  cap `--workers` rather than leaving it on `auto`. A `catalog --json` run was
  already **killed (exit 137, OOM)** during this very investigation.
- The CLI is **not installed in this repo** and not on `PATH`. It was probed
  from a scratch install. Repeated `npx` use corrupted its own cache once
  (`ENOTEMPTY` on `adm-zip`); a local devDependency is the stable route.

## 3. Command surface [verified: `--help`]

Grouped by what we would actually use it for.

**Authoring / project**
`init` (scaffold; `--tailwind`, `--resolution`, `--example`) · `add` ·
`catalog` · `compositions` · `info` · `docs`

**Verification gate** — this is unusually strong and worth leaning on
`lint` (static) · `validate` (headless Chrome: JS errors, missing assets,
**contrast**) · `inspect` (layout across the timeline) · `check` (**all of the
above as one gate**) · `snapshot` (PNG key frames) · `keyframes` ·
`compare` / `grade-compare` (labeled variant sheets) · `beats`

**Output** — `render`, with formats **mp4, webm, mov, gif, png-sequence**.
MOV/WebM carry transparency; `png-sequence` writes RGBA frames.

**Scale** — `cloud` (HeyGen), `lambda` (AWS), `cloudrun` (GCP), `benchmark`

**Adjacent** — `capture` (turn a website into editable HyperFrames
components), `transcribe`, `tts`, `remove-background`, `publish`, `present`

### The two flags that change our plan

```
--variables '{"title":"Queues"}'     # merged over data-composition-variables
--batch rows.json                    # JSON array of rows → ONE OUTPUT PER ROW
```

**One composition + a 24-row JSON file = all 24 module heroes**, reproducibly,
from data already in `manifest.ts`. `--strict-variables` fails the render if a
key is undeclared or mistyped. This is the single most valuable thing found.
[verified: flag exists and is documented; **not yet exercised**]

## 4. Skills inventory [verified: on disk]

12 HyperFrames-family skills, **451 files, ~270k words**. Far too much to read
wholesale — load per task, which is how they are designed.

| Skill | Words | Load when |
| --- | ---: | --- |
| `hyperframes` | 8.4k | Entry point. Routing + project state. Mandatory first read. |
| `hyperframes-core` | 20.5k | **The authoring contract.** Read before writing any composition HTML. |
| `hyperframes-cli` | 12.3k | init/lint/check/snapshot/render/publish/diagnostics |
| `hyperframes-animation` | **115k** | Motion rules, scene blueprints, 7 runtime adapters, 24 text effects |
| `hyperframes-creative` | 46.8k | Design spec, palette, typography, beat planning |
| `media-use` | 21.6k | Sourcing/generating images, icons, audio; grades; background removal |
| `hyperframes-registry` | 10.4k | Installing blocks, **and authoring new ones** |
| `hyperframes-audio` | 9.9k | Mixing, ducking, effect chains |
| `hyperframes-keyframes` | 2.6k | Punch-ins, camera moves, seek-safe keyframes |
| `motion-graphics` | 9.7k | Short unnarrated motion-first units (<10s) |
| `general-video` | 2.7k | Catch-all custom compositions |
| `slideshow` | 9.8k | Decks, presenter mode |

`hyperframes skills update <workflow>` installs/refreshes a workflow skill.

## 5. The official registry — 393 items [verified: `catalog --json`]

174 blocks + 219 components. Top tags: `motion-primitive` (112), `showcase`
(83), `transition` (47), `overlay` (41), `typography` (41), `code` (33).

### Directly useful to us

- **`code` (33 items)** — the strongest fit. `code-diff`, `code-highlight`
  (sweep), `code-morph`, `code-scroll` (scroll-to-line), `code-typing`,
  `code-3d-extrude`, plus ~20 syntax themes (Dark+, Monokai, VS Dark/Light,
  Apple Terminal family). Real leverage for showing a solution evolving or a
  line executing.
- **`title-card` (10)** — `titlecard-lockup`, `titlecard-calm`, `yt-prism-title`
  and handwritten variants. Candidates for module-hero typography.
- **`social` (13)** — social *chrome*, not post templates: `x-post`,
  `reddit-post`, `instagram-follow`, `tiktok-follow`, `yt-lower-third`,
  `yt-comment-card`.
- **`transition` (47)** / **`motion-primitive` (112)** — general motion vocabulary.

### The gap that defines the project [verified by keyword search]

**There are no data-structure primitives in the registry. None.**

| Query | Hits |
| --- | --- |
| `array`, `queue`, `heap`, `linked`, `sort`, `binary`, `recursion`, `trie`, `algorithm` | **0 each** |
| `tree` | 2 — both `flowchart` |
| `graph`, `bst` | substring false positives ("typography", "testimonial-proof-card") |

The `data` tag (15 items) is **business** data-viz — bar chart race, US/World
maps, progress rings. Nothing for arrays, pointers, trees, or call stacks.

Closest reusable shapes: `flowchart`, `flowchart-vertical`, `constellation-hub`,
`hw-pipeline`.

**So: HyperFrames gives us the runtime, the timing model, the render pipeline,
the verification gate, and a strong code-presentation vocabulary. The DSA
visual vocabulary is ours to author.**

## 6. What we already own — and why it does not port for free

`web/src/components/viz/registry.ts` holds **19 working DSA tracers**
[verified]:

```
binary-search      block-reversal     converging-pointers  cyclic-rotate
dynamic-array-growth  dynamic-window  fast-slow            fib-call-tree
frequency-count    hash-buckets       kadane               list-reversal
monotonic-stack    palindrome-check   prefix-sum           ring-buffer
sliding-window     substring-search   write-pointer
```

Plus hand-authored SVG diagrams in `web/src/components/md/diagrams/`.

This is exactly the vocabulary the registry lacks — but it is **React
components driven by React state and user interaction**, and HyperFrames
requires **one paused, seekable GSAP timeline with no render-time clocks,
no unseeded randomness, no network, and no input state**. A React tracer is
not seekable and cannot be dropped in.

Three routes, honestly ranked [inferred]:

1. **Re-author the motion as GSAP timelines** in HyperFrames blocks. Most
   work, but yields seekable, renderable, reusable DSA primitives we own —
   and they become candidates to contribute upstream to the registry.
2. **`hyperframes capture`** our own lesson pages into editable components.
   Good for transferring brand/layout and static structure; it will **not**
   carry the tracers' animation logic.
3. **Keep the React tracers as the on-site experience** and build HyperFrames
   compositions only for *output artifacts* (heroes, social, video). Least
   duplication of effort, but two visual systems to keep in sync.

## 7. Mapping to the three workstreams

| Workstream | Fit | Route |
| --- | --- | --- |
| **Module hero art** (24 modules × 2 themes) | **Strong** | One composition + `--batch` over a 24-row JSON from `manifest.ts`; `snapshot --at` for the still, or a short animated hero as MP4/WebM. Fixes today's hand-made assets — which are currently **swapped light/dark** (task chip `task_a93d9fb1`). |
| **DSA visualizations** | **Strong runtime, zero starting material** | Author DSA primitives as HyperFrames blocks (§6 route 1). Biggest effort, highest long-term value: one primitive serves lesson, social, and video. Animated GIF output is explicitly "best at 15fps for docs". |
| **Social content** | **Strong** | Replaces the bespoke Playwright harness I built earlier. Gains: `check`'s contrast audit, `--batch` for series, native transparency, and video/Reels later from the same source. |

## 8. Hard constraints to design against [verified: `hyperframes-core`]

- **Exactly one** `gsap.timeline({ paused: true })` per composition, registered
  at `window.__timelines["<id>"]`.
- **Determinism bans:** no render-time clocks, no unseeded `Math.random`, no
  network, no input state, no `repeat: -1`.
  → *We already learned the network rule the hard way: vendor fonts locally.*
- Root must be an explicitly **sized box** or content silently collapses.
- Never pair a CSS initial `transform` with a GSAP tween on the same property.
- Never tween `display`/`visibility` on a clip; use `autoAlpha`.
- No `crossorigin` on `<video>`/`<audio>`; every `<audio>` needs an `id`.
- **A lint error silently disables the layout and contrast audits** — `check`
  then reports "0 samples" which *looks* clean but means nothing ran. Always
  clear lint errors before trusting a green check.
- Standalone roots must **not** be wrapped in `<template>`; sub-compositions must.

## 9. Recommended next step

Do **not** start with the 24 heroes or the DSA primitives. Start with one
end-to-end spike that exercises the whole pipeline on the smallest real
deliverable:

> Scaffold a project, author **one** module hero as a composition with
> `data-composition-variables`, prove `--batch` renders 3 modules from a JSON
> row file, and get `check` to pass clean.

That validates scaffolding, the variables/batch mechanism, our Space Mono /
Space Grotesk / JetBrains Mono type system under the no-network rule, the
brand palette, and the verification gate — before any of it is multiplied by 24
modules or 220 lessons.

## Open decisions

1. **Where does the project live?** `video/` is mid-rebuild (Remotion). A new
   `hyperframes/` sibling avoids entangling the two; there is also a
   `/remotion-to-hyperframes` port workflow if consolidation is wanted.
2. **Route from §6** — re-author, capture, or dual-system?
3. **Do module heroes stay stills, or become short loops?** The current site
   renders them as static `.webp`; HyperFrames makes animation nearly free.
4. **Do we contribute DSA primitives upstream** to the registry? `hyperframes-registry`
   documents authoring and the PR path; the gap is conspicuous and unclaimed.
