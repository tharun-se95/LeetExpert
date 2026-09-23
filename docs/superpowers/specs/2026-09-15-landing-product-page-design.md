# Landing page — from manifesto to product page

**Date:** 2026-09-15
**Scope:** the home page (`/`) structure and content. Builds on and partly
supersedes `2026-09-14-landing-rewrite-agentic-ai-design.md` (the header,
grain, snapping, word typing, stage cards, heatmap and footer stay).
**Status:** owner decisions taken on 2026-09-15, after an external review
("the page communicates the thesis better than it communicates the product").

---

## 1. Why this exists

An outside review scored the page well on positioning and copy and poorly on
conversion and trust: a visitor can't tell what leetExpert is, sees none of
the product, and finds no reason to believe it works. The owner accepted most
of it and set these decisions:

- **Hero:** say what the product is, add actions and the counts (keep the
  thesis headline and the owner's lede).
- **Six steps** (Recognize, Model, Reason, Implement, Review, Optimize)
  **replace** the "Why it still matters" screen: one screen, rich animation.
- **Product showcase:** breaks the old "no viz or code blocks" rule. For now a
  **placeholder** tracer and sandbox, designed in the current theme.
- **Heatmap promoted** into a features section with four real features:
  complexity insight, AI coach, pattern cheatsheets, lesson videos and audio.
- **Social proof:** placeholders with examples, **labelled as placeholders
  everywhere** (production too).
- **Pricing:** still undecided — copy unchanged, no prices.
- **Styling:** the Blueprint design system only. The review's "glass/metal"
  look is ignored.

Rejected from the review, with reasons recorded so they are not re-proposed
silently: the "typical platform vs leetExpert" comparison table (disparages
competitors, claims we can't back); leading with interview prep (it weakens
the judgment thesis — interviews get an FAQ answer instead).

## 2. Page structure

| # | Stop | Component |
| --- | --- | --- |
| 0 | Hero — kicker, headline, lede, what it is, two links, counts; the evolving structure beside it from `lg` | `LandingStory` |
| 1 | How you'll think — six steps on one worked problem | `LandingStory` + `MethodSteps` |
| 2 | Inside a lesson — placeholder tracer + sandbox | `LandingStory` + `ProductShowcase` |
| 3 | What's inside — stage cards (unchanged) | `LandingStory` |
| 4 | What you get — heatmap + four feature cards | `LandingOutro` |
| 5 | Learners — placeholder stats and quotes | `LandingOutro` |
| 6 | Pricing (unchanged) | `LandingOutro` |
| 7 | Questions — four | `LandingOutro` |
| 8 | Footer (unchanged) | `LandingFooter` |

Social proof sits before pricing: the page earns trust, then names the model.

The pinned structure column is gone: the method and showcase stops need the
full width. `EvolvingStructure` moves into the hero, where it plays array →
hash table → tree → graph once on arrival (one stage per 1.1s, as before) and
rests on the graph. Below `lg` it is not shown in the hero — the method screen
carries the motion on phones.

## 3. Hero

- Kicker **"DSA for the age of AI"**.
- Headline unchanged (`HERO.lines`, one sentence per line, same sizing — the
  text column keeps the old grid's proportions, so the 14.675em measurement
  still holds).
- Lede unchanged (owner's wording).
- Descriptor: **"A structured course in data structures and algorithms:
  visual lessons, and problems you solve in your browser in Python or
  JavaScript."** Every claim is true of the course today.
- Links: **"Start learning free"** (solid steel pill, `bg-pop text-on-pop`) →
  the first lesson, which is free; **"Explore the curriculum"** (hairline
  link) → `/courses/dsa`.
- Counts line from the manifest: `24 modules · 220 lessons · 116 problems`.
- The eight topic links leave the hero (the stage cards and footer carry the
  curriculum); `TOPIC_CHIPS` stays for the footer.

## 4. How you'll think — the six steps

Kicker "How you'll think", heading kept from the old screen: **"The code is
cheap now. Judgment isn't."**, then "Six habits the course trains, shown on one
problem."

One worked problem runs through all six, built in `lib/landing/method.ts` from
the drawing's own values `[5, 3, 8, 1, 4, 7, 9]` and target 16 (exactly one
pair, 7 + 9 — asserted by brute force in the test):

| Step | One line | Panel |
| --- | --- | --- |
| Recognize | Turn an unfamiliar problem into one you've seen. | The array; "a pair that sums to a target is a lookup in disguise". |
| Model | Choose the structure that makes the key question cheap. | Numbers move into a "seen" set one by one until 9 finds 7. |
| Reason | Predict the time and space before you write a line. | O(n) time, O(n) space; a million lookups vs about 500 billion pair checks (computed). |
| Implement | Write it cleanly, in Python or JavaScript. | The hash-set solution, lines appearing in turn, and its result. |
| Review | Read a solution, yours or an agent's, and say what it costs. | An agent's nested-loop draft, the inner loop flagged, its cost computed. |
| Optimize | Know what changes when the input or the rules change. | Sorted input: two pointers converge on 7 and 9 in O(1) extra space. |

"Review" does not claim the course has AI-review lessons: it trains reading any
solution's cost, which every problem lesson does.

**Correctness:** every result on the panel is computed (`findPair`,
`twoPointerTrace`, `pairCount`); the two Python snippets shown are executed by
python3 in the test and must return the computed pair.

**Motion (`MethodSteps`):**
- Arrival starts an auto-advance, one step per 2.4s, once through, resting on
  the last. A six-segment rail above the panel fills with the active step.
- The step list is a real tab list (`role="tablist"`, arrow keys, Home/End);
  choosing a step stops the auto-advance.
- The panel crossfades between steps (`AnimatePresence`, 0.3s); within a
  panel, items stagger in (set entries, code lines, pointer moves).
- Reduced motion: no auto-advance and no tweens — the reader picks steps.
- Server render shows step 1, so the page is complete without scripts.
- The panel has a fixed minimum height so switching steps never moves the
  page.

## 5. Inside a lesson — placeholder showcase

Kicker "Inside a lesson", heading **"Watch it run. Then write it yourself."**,
body "Every tracer steps through its code line by line, and every problem runs
your code against its tests in Python and JavaScript."

Two frames on `bg-elevated` with `shadow-elevation`, side by side from `lg`:

- **Tracer frame:** title bar "Valid Anagram · frequency count", a
  `Placeholder` tag, letter slots for "anagram" filled with counts computed by
  `letterCounts`, a step caption and inert player controls (aria-hidden).
- **Sandbox frame:** title bar with Python / JavaScript marks, the
  **real starter code and first cases read from
  `courses/dsa/strings/valid-anagram.md`** at build (parsed with
  `parseSandboxSpec`), each case shown as "not run", and a `Placeholder` tag.
- A link "Open the Valid Anagram lesson" to the real lesson.

**Follow-up (tracked, not done):** replace both frames with the live
`frequency-count` tracer and the real `Sandbox`, loaded with `next/dynamic`
only when the section nears, so the hero does not pay for CodeMirror or the
runners (CLAUDE.md §5).

## 6. What you get — features

Kicker "What you get", heading **"Built to make practice stick."**

- The heatmap card first and widest: its "Feature" label, "Heatmap" title,
  body, the owner's "Earn credits for consistent heat." and the example year —
  still labelled "An example year" (the in-app heatmap is not built).
- Four cards, each an icon, title and one line, all describing what ships:
  - **Complexity insight** — "Problems state the time and space to aim for,
    and draw your test case in memory." (`InsightPanel`)
  - **AI coach** — "When a test fails, the coach names the case that broke and
    points you to the next hint, not the answer." (`lib/coach/diagnose.ts`)
  - **Pattern cheatsheets** — "{n} module cheatsheets: the cues that point to
    a pattern, the patterns, complexity targets and traps." (`CHEATSHEETS`)
  - **Lesson videos & audio** — "Narrated video and audio walkthroughs, on {n}
    lessons so far." (lessons whose `getChapterMedia` has video)
- Both counts are computed on the server; the video count is small today (six)
  and says "so far" rather than implying full coverage.

## 7. Learners — placeholder social proof

Kicker "Learners", heading "What learners say.", a visible note
**"Placeholder: example numbers and quotes, replaced with real ones before
launch."**, three stats and three quotes. Every item is flagged
`placeholder: true` in `PROOF` and renders a `Placeholder` tag; quotes are
attributed to "Name Surname" and a role, never an invented named person.

These numbers are the one deliberate exception to "every number computed":
they are examples, labelled as such, and a test fails if any item loses its
flag or its tag. **End condition:** replace with real data and remove the flag
and tags once the product has learners.

## 8. Questions

Four, in two columns from `lg`: Who is it for? · Does it help with interviews?
· Which languages? · Do I need a CS degree? "If AI can write code, why learn
this?" is removed — the method screen now answers it.

## 9. Motion shared

The stage cards' rise-in CSS becomes one `.rise-in` class (opacity + 0.5rem
rise, 420ms, stagger by inline `transition-delay`, lit by `data-lit` on an
ancestor), used by stage cards, feature cards, proof items and the showcase
frames. Reduced motion and `<noscript>` show them in place.

## 10. Rules changed

CLAUDE.md's landing rule is rewritten: the page now explains **and markets
the product**; one showcase section may carry tracer and sandbox frames; a
features section and labelled placeholder social proof are allowed; still no
comparison table, banners or sticky CTA.

## 11. Verification

- Tests: worked example (brute-force pair, python3 executes both snippets,
  independent two-pointer trace); showcase starter and cases equal the lesson's
  own fence parsed in the test; feature counts recomputed independently;
  every proof item flagged and tagged; hero links resolve; section order and
  counts; tab semantics and server-rendered first step; `.rise-in` motion,
  reduced motion and noscript.
- Each new assertion broken on purpose once and seen to fail.
- `tsc`, `eslint`, `npm test`, `npm run build`.
- Browser (Playwright): every stop at 1440×900, 1024×768 and 375px; the six
  steps auto-advance once and respond to clicks and arrow keys; reduced
  motion; both themes; no console errors.

## 12. Revision: Understand, Build and Keep (owner, 2026-09-17)

The owner asked for **every feature in the app** on the page: Watch (lesson
video and audio), Learn (course and tracers), Code (Python and JavaScript),
Review (AI coach), Optimize, Mindmap, Cheatsheets, Practice and Burn
(heatmap). A layout mock was published and approved with its headings and
verbs (artifact "leetExpert Three Acts"; the owner dropped the act numbers and
the feature-map table). This **supersedes §2, §4, §5 and §6**.

Owner decisions: Optimize is all of it (the insight panel, the Big-O explorer
and a new optimize feature still to be designed); the heatmap is renamed
**Burn** and keeps "Earn credits for consistent heat."; the six habits fold
into Build; each window is shown the way that suits the feature.

### Page

Hero (adds a strip of the nine verbs grouped by section; each links to
`#verb`, which selects it and brings its section into view) → **Understand**
(Watch · Learn · Map, "See it before you solve it.") → **Build** (Code ·
Review · Optimize, "The code is cheap now. Judgment isn't.") → **Keep**
(Practice · Recall · Burn, "Come back tomorrow.") → What's inside → Learners →
Pricing → Questions → Footer. Eight snap stops, as before. Removed:
`MethodSteps`, `ProductShowcase`, the features stop, `SHOWCASE`, `features()`.

Each section (`FeatureSection`) is the section copy and a vertical tab list of
its verbs (arrows, Home, End) beside one window: title bar, a window-kind
chip, a fixed-height body that scrolls inside (reachable by keyboard), and a
"Today" footer saying what exists now, with a link to the real page.

### Windows

| Verb | Window | What it shows |
| --- | --- | --- |
| Watch | Live | `VideoPlayer` + `AudioMini` for Collision Chaining (Hash Tables) |
| Learn | Live | The Valid Anagram lesson's own `frequency-count` tracer fence |
| Map | Screenshot | The Hash Tables concept map page |
| Code | Preview → Live | The `find_pair` sandbox's starter and cases; **Try it** loads the real `Sandbox` |
| Review | Live | The broken draft (adds before it checks) and the real `DiagnosisCard` |
| Optimize | Live | `InsightPanel` on the editor surface, the computed cost line, `BigOObservatory`, and a Placeholder tag for the new feature |
| Practice | Screenshot | The practice page |
| Recall | Live | The Hash Tables `Cheatsheet` |
| Burn | Example | The example year, the owner's credits line |

- **Loading:** every heavy feature is its own `next/dynamic` chunk, rendered
  only when its verb is selected **and** its section is active or next
  (`near`); until then a stand-in. The tracer and sandbox are client-only.
  The video player uses `preload="metadata"` (a shared component), so Watch
  fetches the video's metadata, not the video, once Understand is near.
- **Screenshots:** `scripts/capture-landing-shots.mjs` (playwright-core
  driving installed Chrome) writes `public/landing/{map,practice}-{light,dark}.png`
  at 1280×720 CSS, 2×, below the app header, hiding Next's dev badge and the
  floating lessons opener. Swapped per theme with `.landing-shot-*` CSS (the
  module-art pattern). Regenerate them when those pages change.
- **Worked problem (Build):** `lib/landing/method.ts` — values and target as
  before; `findPair`, `findPairAddFirst` (the draft), `reviewDiagnosis()`
  (the app's `diagnose()` fed the draft's computed result; no hints on the
  landing sandbox, so none offered), `OPTIMIZE_INSIGHT`, `OPTIMIZE_NOTE`
  (computed). Both Python snippets are run by python3 in the tests.
- **The `find_pair` sandbox** (`lib/landing/findPairSandbox.ts`) is not a
  course lesson, so the course reference harness never sees it; the same
  standard is applied in `landingFeatures.test.tsx`: reference solutions
  `tests/reference/landing/find-pair.{py,js}` pass all six cases in both
  runtimes, the untouched starter fails, and the draft fails (the `[8], 16`
  case exists to catch it). Verified in the browser: the Python reference
  typed into the live window reports "All 6 passed".
- **Data:** `featureData()` in `productData.ts` (server only) reads the
  lessons, media, tracer fence and cheatsheet, and counts videos, tracers,
  problems and cheatsheets; it throws if any is missing.

### Found while verifying

- The hash effect was keyed on the verbs array, rebuilt every render, so a
  stale `#review` re-selected Review a frame after the reader moved on; now
  keyed on the verb ids.
- `InsightPanel` paints with code tokens and read ~1.5:1 on the card; it sits
  on `bg-code-editor`, as in the sandbox.
- A longer intro stretched Build's window; the window is `self-start`.
- **Open:** after a pass, the shared `Sandbox` says "Now compare yours against
  the solution below", but the landing window has no solution below.
- **Open:** the Optimize feature beyond insight and the explorer is to be
  designed; its slot is a Placeholder tag.

## 13. Revision: the 3D deck and section clips (owner, 2026-09-18)

The owner asked for the real components "beautifully in 3D" instead of
screenshots, all three windows of a section visible at once (a slideshow),
the empty space used, and HyperFrames plus `motion` for the motion. Answers
given on 2026-09-18: **3D deck, auto-cycling**; **one motion clip per
section**; Map and Practice **real and interactive**. This supersedes the
single-window layout and the Screenshot windows of §12.

### Deck (lg and up)

- The section's three windows sit in one perspective stage, cover-flow
  style: the selected window in front, flat and live; the other two behind it
  on either side, turned toward the centre (`rotateY` about ±24°, pushed back,
  dimmed), still showing their real content. `motion` animates between
  arrangements (0.7 s); under reduced motion they jump.
- Back windows are `inert` and `aria-hidden`; a transparent button over each
  one brings it forward (pointer only, `tabIndex=-1`: the verb tabs are the
  keyboard path, which already moves the selection).
- **Auto-cycling:** while the section is the active stop, the selection
  advances every 8 s, shown as a fill on the selected verb tab. It stops for
  good in that section once the reader picks a verb, clicks a card or uses
  the pause control, and it pauses while the pointer or focus is inside the
  deck or the tab is hidden. It never runs under reduced motion. A visible
  Pause/Play control meets WCAG 2.2.2 (moving content longer than 5 s).
- **Phones and tablets (< lg):** a swipeable slideshow: the three windows in
  a horizontal scroll-snap row, the verb tabs following the scroll position
  and scrolling to their window when chosen. No auto-cycling there.

### Windows

- **Map** is the real `ConceptMindMap` for Hash Tables (React Flow,
  expandable), and **Practice** the real problem list: search, difficulty
  chips and the `ProblemsFlatList`, reading progress from `useProgress`.
  Both are `next/dynamic` chunks rendered only once their section is near.
- The screenshots, `SHOT_SIZE`, `LANDING_SHOTS`, the `.landing-shot-*` CSS,
  `scripts/capture-landing-shots.mjs` and its `playwright-core` dependency
  are removed; the Screenshot window kind goes with them.
- Heavy bodies render only when their section is near, as before; the
  window in front and the two behind it all show their real content then
  (the sandbox still waits for **Try it**).

### Clips (HyperFrames)

- One silent loop per section, rendered from the existing primitives in
  compact mode (`#root[data-compact]`, 960×540 laid out at 2×), both themes:
  Understand is the in-order walk of the hero's BST, Build the two pointers
  landing on the Build problem's pair, Keep a four-week practice streak.
  Traces come from `hyperframes/data/build-landing.py` running the
  algorithms; `web/tests/landingClips.test.ts` recomputes each trace in
  TypeScript from `method.ts` and requires the rows to match.
- `web/scripts/render-landing-clips.sh` regenerates the rows, renders the six
  clips and transcodes them to `public/landing/clips/{section}-{theme}.mp4`
  (960 px, H.264, no audio, faststart) with a final-frame poster
  (`.png`; this ffmpeg has no WebP encoder, and flat UI art is small as PNG). The test checks every file exists.
- On the page the clip sits in the section's copy column under the verb tabs,
  from lg only (the empty space). It loads (`preload="none"`) and plays only
  while its section is near, picks the theme's file from `resolvedTheme`, and
  under reduced motion shows the poster, which is the finished state. It has
  an `aria-label` computed from the trace (for example the in-order output).

### Found while building

- `render` saw a zero-length composition ("Composition has zero duration")
  though `snapshot` and a browser played the same primitive: each primitive
  registers its timeline after the runtime initialises. Each now calls
  `window.__hfForceTimelineRebind?.()` after registering.
- The render runtime writes the frame's 1920×1080 size inline on `#root`, so
  the compact size needs `!important`, or the 2× scale drew it cropped.
- `range-scan` steps accept `hit` (the cells a step settles on), so Build's
  last frame fills the found pair.

## 14. Revision: bare components, the backdrop and one last slide (owner, 2026-09-19)

Owner feedback on §13, with answers given the same day: **endless 3D
carousel**; the coach as the **real UI over a scripted thread, no container,
rendered like a 3D component**; the last slide as a **pricing hero plus two
rows**. This supersedes §13's cards, its clips and the three outro stops.

### Backdrop

- `EvolvingStructure` leaves the hero and becomes `LandingBackdrop`: fixed
  behind the whole landing page, scaled to fill the screen, blurred and
  faint, with a slow 40 s drift (none under reduced motion). It now has six
  stages — array, **linked list**, hash table, tree, **matrix**, graph — and
  takes the next one each time a snap stop arrives (hero → array … last
  slide → graph), morphing over 2.4 s. It observes every `[data-scroll-section]`
  in `<main>` itself. Decorative: `aria-hidden`.
- The linked list links the values in array order on a gentle wave; the
  matrix fills a 4-wide grid row by row and joins grid neighbours. Both are
  derived from the values and rebuilt independently in `landingStory.test.tsx`.
- Contrast: the backdrop is one ink (`--backdrop-ink`) at `--backdrop-opacity`
  and `--backdrop-blur`. Light draws a **white etch** (lighter than the
  paper): any darker ink at a visible strength took `--muted` under AA
  (4.29:1 at 0.08). Dark keeps `--foreground` at 0.1 (`--muted` fell to 4.18:1
  at 0.16). `grainContrast.test.ts` holds every text ink AA over the strongest
  stroke on the worst grain pixel.

### Carousel

- No card, title bar, chip or "Today" footer: each window is the component
  alone (`WindowContent` = body, an accessible `label`, an optional `link`,
  `note` and `fill`). The kinds (Live/Preview/Example) and the `today` lines
  are gone; the selected verb's line, the Burn credits line (`note`) and the
  real page's link sit under the tabs.
- The three components sit on a ring: angle `(i − turn) × 120°`, with `turn`
  never wrapped, so running by itself the ring only turns forward; a picked
  component is reached the short way round. Position, depth, turn, fade and
  blur all derive from one motion value per item. (Later the same day the
  owner asked to remove the blur, and then pointed out they still read as
  blurred because the blurred backdrop showed through their opacity: they are
  now dimmed by a veil of grained page paper faded in over them, with an opaque
  veil behind every component, and no opacity or filter on the items.) A feathered veil of page
  paper sits behind each component (no frame) so see-through components (the
  map's canvas) don't show the ones behind.
- Timer, hold, pause (WCAG 2.2.2), reduced motion, `#verb` links and the
  phone row are as §13. Below lg the row is given explicit flat values:
  motion keeps the last inline style when `style` becomes undefined.

### Windows

| Verb | Now |
| --- | --- |
| Watch | The Arrays module's HyperFrames intro (`/media/arrays/intro.mp4`, `getModuleVideo`) |
| Learn | The Valid Anagram tracer without its code panel (`<Viz code={false}>`; fullscreen still shows the code) |
| Map | The real Hash Tables concept map |
| Code | The live `find_pair` editor (no preview or Try it) |
| Review | `ReviewCoach`: the real `CoachPanel` (`variant="showcase"`: no close or clear) in `ScriptedCoachProvider` — the diagnosis card, "Why did it return [8, 8]?", and a reply naming the draft's flagged line and the number that pairs with itself, all computed (`reviewThread()`); the composer is locked with `lockedReason`, and nothing calls the AI |
| Optimize | `BigOObservatory` alone |
| Practice, Recall | As §13 |
| Burn | `HeatMap` alone, stripped of its card |

Each heavy window is still its own `next/dynamic` chunk rendered only once its
section is near (the coach too: it brings `react-markdown`).

### Last slide

Pricing, learners and questions are one snap stop: pricing across the top
with a solid "Start the first lesson" link, then learners (placeholder-tagged
as before) and the four questions as a one-open-at-a-time `<details>` list
side by side. The page is six stops plus the footer.

### Removed

The section clips (`SectionClip`, `lib/landing/clips.ts`,
`scripts/render-landing-clips.sh`, `public/landing/clips/`,
`hyperframes/data/build-landing.py` and its rows, `landingClips.test.ts`),
the Try-it preview, `OPTIMIZE_INSIGHT`/`OPTIMIZE_NOTE`, `METHOD_PROBLEM`, the
`MILLION`/`pairCount`/`spellCount` helpers and the hero timing
(`heroStage`, `STRUCTURE_STAGES`).

### Found while building

- Crossing lg left the ring's blur and fade on the phone row (above).
- The tracer's fullscreen view is `fixed inset-0`, which a transformed or
  filtered ancestor turns into its own box (it opened 848×570 inside a ring
  slot); it now portals to `<body>` (`vizPlayerChrome.test.tsx`).
- The dev server kept serving an old `globals.css` after edits (twice, the
  first time right after a `next build` ran beside it); restarting it with
  `.next/dev` cleared fixed it.
- Content-sized boxes (owner, 2026-09-19, "make the containers content size"):
  each component's box and its paper are its content's height, centred in
  the slot, capped at the stage (38rem) with its own scroll; the map, the
  problem list and the coach have no intrinsic height, so they get 34rem.
  With less of the front covering them, the ones behind are dimmed more
  (0.75 where they rest).

## 15. Revision: floating data points (owner, 2026-09-20)

> Superseded 2026-09-21 by `2026-09-21-landing-boxes-backdrop-design.md`: the structure backdrop was replaced by the boxes grid; the floating-points schedule, free-space placement and `data-backdrop-off` here no longer apply.

Owner direction on §14's backdrop, answered in chat: **2.5D, not WebGL**; the
transformations run on **their own slow clock, independent of scroll** (a pure
ambient loop — this supersedes "takes the next one each time a snap stop
arrives"); **no values or numbers, just geometric shapes**; and finally **"just
make them floating data points that transform into data structures"**.

### The loop

- Nine points (nine so the matrix is a full 3×3). On load they float as a
  seeded cloud, then the loop runs: **assemble** into a structure (3 s glide,
  its edges draw in), **hold** it (5 s), **release** back into a new cloud
  (3 s, edges fade) and **float** (4 s), then assemble the next. Order: array →
  linked list → hash table → binary search tree → matrix → graph → array …;
  15 s a structure, 90 s a cycle. The schedule is a pure function of elapsed
  time (`backdropTarget`), tested.
- The clock advances only on animation frames, capped per frame, so a hidden
  tab pauses it and a returning tab resumes where it left off rather than
  jumping.
- Every point floats all the time on its own seeded path (a few units of the
  drawing), so a held structure breathes. Its position each frame is the
  tweened target plus that offset, and every edge is drawn from the same two
  computed points, so a link never detaches from its dots. The loop writes
  attributes straight to the SVG — no React render per frame.
- Reduced motion (read live through `useMediaQuery`): no loop, no float, no
  sway; the graph, still.

### Shapes

Points and lines only — no labels, no digits. The structures are still
derived from a hidden seed (`STRUCTURE_VALUES`), so the tree is the BST those
values build and the chains are real `v % 4` buckets; `landingStory.test.tsx`
rebuilds each independently.

- Array: a tight, even row inside a faint capsule (the contiguous block).
- Linked list: wider, on a gentle wave, each point linked to the next.
- Hash table: a vertical spine with a stub per non-empty bucket, chains
  hanging off it (the stubs replace §14's digit labels).
- Tree: the BST, depth-scaled to fit the drawing.
- Matrix: 3×3, each cell joined to its right and lower neighbours.
- Graph: on a ring, the tree's edges plus cross links that close cycles.
- Clouds: one seeded scatter per structure, inside the drawing's margins.

### Depth and softness

The `.landing-backdrop` wrapper carries `perspective`; the drawing sways
through `rotateX`/`rotateY` over 60 s (a compositor-only transform), so its
far side foreshortens. `--backdrop-blur` rises so the layer reads soft.
Contrast is unchanged in kind: one ink at `--backdrop-opacity`, and
`grainContrast.test.ts` holds every text ink AA over it.

### Removed

The scroll observer in `LandingBackdrop`; the node labels, bucket digits,
cells and `cornerFor`; `describeStage` and the `role="img"` path (the drawing
is only ever decorative now).

## 15. Revision: features one by one as the page scrolls (owner, 2026-09-20)

"We will let the features be shown one by one: as we scroll in Understand we
show Watch, Learn, … and continue scrolling to the next section after the
features." This replaces §13's 8 s auto-turn, its `.deck-fill` timer and its
Pause/Play control.

- From lg each feature section is `data-scroll-steps` (3) screens tall with its
  content pinned (`sticky top-0 h-dvh`) and one `snap-start` marker per
  feature, a screen apart. The marker crossing `<main>`'s middle band sets the
  feature in front, so scrolling down turns the ring forward and scrolling up
  turns it back; after the last feature the next scroll reaches the next
  section. Snap stops: hero, 3 + 3 + 3 feature steps, what's inside, the last
  slide, the footer. The backdrop still changes per section, not per step.
- `useSectionPaging`: in a stepped section every wheel gesture is one step
  (`pagingIntent({ stepped })`), never native scrolling; and a wheel over a box
  that can still scroll that way (the cheatsheet, the problem list, the coach
  thread) scrolls the box first (`scrollsInside`), paging once it is at its
  end. The concept map gets `scrollThrough` (no wheel zoom; drag and the
  buttons still work): taking the wheel, it stranded the reader on Map.
- How fast that step travels, and when the next gesture is allowed to move,
  are superseded by `2026-09-20-landing-wheel-paging-design.md`: the fixed
  900ms lock is replaced by a speed-scaled tween and a coasting rule.
- A tab, an arrow key or a hero `#verb` link scrolls to that feature's step.
- Below lg nothing changes: one stop, the swipeable row (a phone can't pin a
  section taller than its screen).
- Verified in Chrome at 1440×900: Watch → Learn → Map → Build by wheel,
  including with the pointer over the map; back up Burn → Recall → Practice →
  Optimize; the cheatsheet scrolls 500px inside before paging; tabs and
  `#map` land on their steps.

## 16. Revision: a vertical stack, one component visible (owner, 2026-09-20)

"Instead of horizontal, make it vertical but only visible one at a time, others
are hidden." The 3D ring (§14) is gone: the three components are stacked in one
place (`StackItem`, `data-offset` −1/0/1). The selected one is in place and
visible; the ones before it sit 56px up and the ones after it 56px down, at
opacity 0, taking no pointer events, their panels `inert`. Scrolling down to the
next step lifts the current one away and brings the next up from below (0.6s;
instant under reduced motion); scrolling up does the reverse. The side covers
and the dimming veil went with the ring; the paper veil behind each component
stays. Steps, paging, tabs and `#verb` links are as §15; phones keep the row.


### Revision: bigger, family colours, the free space (owner, 2026-09-20)

"Make the dots a bit bigger and more visible; use the empty space, don't
disturb the text; use family colours."

- **Placement.** The backdrop no longer fills the screen behind the text. It
  is fixed to the right of the text column — the landing container's content
  edge + 51rem, where 48rem (`max-w-3xl`) is the widest text measure the story
  uses — from `xl`, where that leaves ~500px or more, and hidden below `xl`,
  where the text spans the screen. Stops whose text runs to the right edge
  (the last slide, the footer) carry `data-backdrop-off`; the backdrop fades
  out while one is on screen. That is the only thing it observes — the shapes
  still run on their own clock. The Understand/Build/Keep components are
  opaque and simply cover it where they sit.
- **Colour.** Each structure is painted in the UI accent (`accentUi`, 3:1 on
  every paper in both themes) of the family of the module that teaches it:
  array `arrays`, linked list `linked-lists`, hash table `hash-tables`, tree
  `bst`, matrix `matrix`, graph `graphs` (`STAGE_MODULES`). The server reads
  them (`backdropColours()`); a module with no family throws rather than
  falling back to a default colour. A cloud already wears the colour of the
  structure it gathers into, so the hue shifts while the points scatter.
- **Visibility.** Points r 9 (was 5), strokes 2 (was 1.25), blur 3px (was
  6px), strength 0.55 light / 0.7 dark. With the drawing off the text, the
  old "every text ink AA over the strongest stroke" test no longer describes
  anything and is replaced by a placement test.
- **Found while building.** Turbopack's dev server twice kept serving stale
  CSS after `globals.css` changed; a restart with `.next/dev` cleared fixed it.
