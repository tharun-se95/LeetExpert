# Landing rewrite — why DSA in the age of agentic AI

**Date:** 2026-09-14
**Scope:** the home page (`/`) content, structure and motion. Builds on
`2026-09-14-landing-header-and-grain-design.md` (header, grain, centred
`max-w-landing` column), which stays.
**Status:** design approved by the owner in brainstorming on 2026-09-14.

---

## 1. Why this exists

The owner judged the current landing page to be overselling: early-bird
banners, a feature grid, placeholder testimonials, pricing cards, a sticky
CTA, and embedded viz and code blocks. The direction is the opposite:
minimal, and focused on one question — **why learn data structures and
algorithms when agents can write code?** — with the page's copy appearing
as if typed while the reader scrolls, beside one evolving line drawing.

Owner decisions:

- **Argument:** lead with the **problem-solving mindset every engineer
  needs**, then: decomposition is the real skill; you judge what agents
  write; fundamentals outlast tools; and (one line) interviews still test it.
- **Typing:** scroll-scrubbed, character by character, with a caret;
  scrolling back up un-types.
- **Motion graphic:** one structure pinned beside the chapters, morphing
  array → hash table → tree → graph as the reader scrolls.
- **Sections:** minimal, on the agent's recommendation (§2).
- **Pricing:** "Start free. Pay as you learn." — per module: early modules
  free, later modules unlocked one at a time. No prices on the page.
- **Cleanup:** delete the landing components the rewrite leaves unused.
- **Removed outright:** every viz block and code block.

The course itself never mentions AI (`courses/dsa` has no such references).
The landing framing builds on the course introduction's own thesis —
understanding over recitation ("cooking versus reciting recipes") — so the
page and the first lesson say the same thing.

---

## 2. Page structure

Kept from the previous page: the transparent `LandingHeader`, the paper
grain, the centred `max-w-landing` column with `px-6 md:px-16`, the hero's
topic links.

| # | Section | Structure stage |
| --- | --- | --- |
| 0 | Hero — heading, one typed sentence, topic links | array (static) |
| 1 | The mindset | array |
| 2 | Decomposition | array → hash table |
| 3 | Judgment | hash table → tree |
| 4 | Fundamentals outlast tools (+ interviews line) | tree → graph |
| 5 | What's inside — one typed line of real counts | graph |
| 6 | Pricing | — |
| 7 | FAQ, three questions | — |

Removed: the early-bird strip, stat band, viz strip (`LandingViz`), sandbox
(`LandingSandbox`), approach rail, why grid, start path, testimonials,
pricing cards, author note and waitlist, closing panel, `StickyCta`.

The page no longer loads CodeMirror, Shiki or Pyodide chunks — those came in
through the viz strip and sandbox (CLAUDE.md §5 performance budget).

---

## 3. Copy (first draft, approved in direction; wording tunable on the page)

Numbers in the copy are **computed, not typed in**: `pairCount(n) =
n(n−1)/2` and `searchSteps(n) = ⌈log₂(n+1)⌉`, formatted at render and
checked in tests. For n = 1,000,000: 499,999,500,000 pairs ("about 500
billion") and 20 steps.

**0 — Hero.** *Agents write the code. You decide if it's right.* (revised
2026-09-14 from "Agents write code. Engineers solve problems.": that contrast
isn't true for readers who use agents daily, and read as defensive; judgment
is the claim the page actually argues) — A data
structures & algorithms course for the part of the job that doesn't get
automated: seeing the shape of a problem, and knowing what a good answer
costs.

**1 — The mindset.** *Problem solving is the job.* Every engineer meets
problems that look new and rarely are. Underneath, most are counting,
searching, ordering or connecting things. Learning data structures and
algorithms is how you learn to see which one you're looking at — and to weigh
what an answer will cost before any code exists. That habit is useful whether
you write the code yourself or not.

**2 — Decomposition.** *An agent is only as good as the problem you give it.*
"Find the duplicates in a million records" can be solved by comparing every
pair — about {pairs} comparisons — or by one pass with a hash table: a
million lookups. Both are "correct". Recognising it as a counting problem is
what turns a vague request into one worth handing to anyone, human or agent.

**3 — Judgment.** *You still sign off on the diff.* Code an agent writes
usually reads well and passes the tests it came with, which tend to be
small. A nested loop that is instant on a hundred items can take hours on a
million. A lookup that a sorted structure answers in {steps} steps becomes a
million-step scan. Catching that in review needs you to know what the code
costs, not only what it does.

**4 — Fundamentals outlast tools.** *Learn the part that doesn't expire.*
Tools and models change every few months. Dijkstra published his
shortest-path algorithm in 1959, and it is still taught — and still the base
that faster routing methods build on. Arrays, hashing, trees and graphs are
the same today as when you'll need them next. And yes: interviews still ask
you to do this without an agent.

**5 — What's inside.** {modules} modules · {lessons} lessons · {problems}
problems, each runnable in Python and JavaScript. (Counts from
`curriculumStats()`, the manifest.)

**6 — Pricing.** *Start free. Pay as you learn.* The early modules are free.
After that, you unlock modules one at a time, as you reach them. —
link: *Start the first lesson →* (`FIRST_LESSON`).

**7 — FAQ.**
- *If AI can write code, why learn this?* — Because deciding what to build,
  and whether what was built is right and fast enough, is still yours. That
  judgment is what this course trains.
- *Which languages?* — Lessons teach in Python and TypeScript; sandboxes run
  Python and JavaScript.
- *Do I need a CS degree?* — No. If you can write basic loops and functions,
  you can start; the first stage builds the vocabulary the rest uses.

---

## 4. Motion

### 4.1 Scroll-typed text

- `useSectionProgress(ref)` — one passive scroll listener on `<main>` (the
  app's only scroller; `window.scrollY` stays 0), coalesced to one
  `requestAnimationFrame`, returning 0..1 as the section's top travels from
  the viewport's lower edge (85% of the viewport height) to 35%.
- **Sections near the page bottom** (revised during implementation): the last
  sections can never rise to 30% of the viewport, and measured in the browser
  they stalled at 89% (pricing) and 32% (questions) at maximum scroll.
  `sectionProgress` rescales the end point to where a section's top will sit
  when scrolling ends (`top − remaining`, constant while scrolling), so those
  sections finish exactly at the bottom and ramp smoothly (57% / 23% at 300px
  above it). Sections are found by `[data-scroll-section]` inside one root
  ref, not per-section ref callbacks, which React's refs lint rejects as ref
  access during render.
- `typedLength(text, progress)` — pure: `round(clamp(progress,0,1) ×
  length)`, never splitting a UTF-16 surrogate pair.
- `TypedText` renders two layers: an `sr-only` copy of the full text (stable
  for assistive tech and search) and an `aria-hidden` visual layer: the typed
  slice, a blinking caret while 0 < progress < 1, and the untyped remainder
  in `text-transparent` so layout never reflows as characters appear.
- The hero sentence types once on mount over ~1.4s (no scroll has happened
  yet), then stays.
- Server render outputs every visual layer **untyped** (progress 0) while
  the `sr-only` copy carries the full text; on mount a layout effect measures
  and sets real progress. (Revised during implementation: rendering the
  server HTML fully typed would paint the hero complete, then blank it on
  hydration and retype it.) The untyped remainder carries `data-typed-rest`,
  and a `<noscript>` rule `[data-typed-rest]{color:inherit!important}` reveals
  all text when scripts never run.
- The manifest stays on the server: `HomePage` passes the counts and topic
  links to the client story as props, because `lib/landing/content.ts`
  imports the whole course manifest.
- `prefers-reduced-motion: reduce`: progress is forced to 1 (all text shown),
  no caret blink.

### 4.2 Evolving structure

- Seven values `[5, 3, 8, 1, 4, 7, 9]` and four layouts in viewBox units:
  - **array:** cells in a row, square corners, no edges;
  - **hash table:** four buckets `0..3` in a column, each value chained right
    in bucket `value % 4`;
  - **tree:** the BST produced by inserting the values in order (this order
    gives a complete tree: 5 → 3, 8 → 1, 4, 7, 9);
  - **graph:** the tree's edges plus cross edges `1–4`, `4–7`, `7–9`, which
    create cycles.
- Stage `s ∈ [0, 3]` comes from chapter progress. Node positions interpolate
  between `floor(s)` and `ceil(s)` layouts; corner radius interpolates from
  square cells (array, hash) to circles (tree, graph); each layout's edges
  fade in with its stage; hash bucket labels fade out after stage 1.
- Pinned with `position: sticky` beside the chapters from `lg`; below `lg`
  it renders inline above each chapter at that chapter's fixed stage.
- Reduced motion: no interpolation — the stage snaps to the chapter in view.
- Monochrome per CLAUDE.md §4: muted lines, `--mark` on the nodes.
- `role="img"` with an `aria-label` describing the current stage from the
  data (e.g. "The values 5, 3, 8, 1, 4, 7, 9 as a binary search tree").

### 4.3 Build choice

A hand-rolled scroll hook over `motion`'s `useScroll` (which would need a
container ref bridged out of `AppShell`) and over CSS scroll-driven animations
(no per-character reveal across wrapped lines; uneven browser support). No
new dependencies.

---

### 4.4 Revision: snap and animate on arrival (owner, 2026-09-14)

After seeing the scroll-scrubbed build the owner found scrolling and
animation not smooth, and asked for section snapping with each section's
animation playing on arrival. This **supersedes §4.1's scroll-scrubbed
typing, §4.2's fractional stage blending, and the page-bottom rescaling**:

- `<main>` gets `snap-y snap-proximity lg:snap-mandatory` on `/` only. Snap
  stops: the grain wrapper's top (header + hero), each chapter, pricing and
  questions — each a `min-h-dvh` section. Proximity below `lg` so a section
  taller than a phone screen can still be read end to end.
- `useActiveSection` marks the section under the viewport's middle line as
  active (a rAF-coalesced listener on `<main>`; state changes only when the
  active section changes). `useRevealProgress` then types that section once
  over `typingDuration(chars)` = 12ms/char clamped to 0.7–2.4s, on its own
  clock. Text already read does not retype on scrolling back.
- `EvolvingStructure` takes a whole stage and animates to it with `motion`
  (0.9s, ease `[0.65, 0, 0.35, 1]`; duration 0 under reduced motion): node
  groups translate, `rx` rounds cells into circles, edges animate endpoints
  plus `opacity` and `pathLength` so new edges draw in. One element per edge
  across stages, so tree edges stay put when the tree becomes a graph.
  `layoutAt`, `stageWeight`, `edgeOpacity`, `cornerRadius`,
  `structureStage`, `sectionProgress` and `useScrollProgress.ts` are removed.
- **Wheel paging** (found in verification): with `snap-mandatory` and
  sections a viewport tall (1306px), a 300px wheel scroll from the top ended
  back at 0 — the nearest stop was the one it left — while the same wheel
  with snapping off moved 300px, and a 250px programmatic `scrollBy` under
  snapping went forward to the next stop. `useSectionPaging` (lg, fine
  pointers) therefore turns one wheel gesture into `scrollBy(±viewport)`,
  smooth (instant under reduced motion), locked for 900ms and extended by
  wheel events within 250ms so a trackpad's momentum tail doesn't skip stops.
  A section taller than the viewport scrolls natively until its edge.
  Keyboard and touch keep native snapping. Decision logic is the pure
  `pagingIntent`, unit-tested.
- **Pinned drawing** (found in verification): an offset computed from the
  drawing's height placed its centre at 88% of the viewport; it now sits in a
  `sticky top-0 flex h-dvh items-center` box.
- Why this is smoother: scroll no longer drives rendering. A scroll frame
  costs a rectangle read; a stage change costs one React render, and motion
  interpolates the SVG off React's render path.

### 4.7 Argument on one screen (owner, 2026-09-14)

The owner found the four chapters (mindset, decomposition, judgment,
fundamentals) "a long scroll to make a point and to get to the point". This
**supersedes §3's chapters 1–4**; "What's inside" stays its own stop.

- One snap stop, kicker "Why it still matters", heading "The code is cheap
  now. Judgment isn't.", then four numbered points, each a one-line claim and
  a one-line piece of evidence:
  1. Problem solving is the job. — Most new problems are counting,
     searching, ordering or connecting things in disguise.
  2. Frame it before you prompt. — A million records is about {500} billion
     pair checks, or one pass with a hash table.
  3. Review what it costs. — A nested loop is {10,000} steps on a hundred
     items and {a trillion} on a million.
  4. Learn what doesn't expire. — Dijkstra's shortest-path algorithm is from
     1959, and routing still builds on it. Interviews still ask for it.
- Numbers stay computed (`pairCount`, `nestedSteps`); `searchSteps` was only
  used by the cut Judgment chapter and is removed.
- Motion: the section types heading → point titles/bodies in order over
  4 × 1.1s; the pinned structure moves one stage when each point's title
  starts (`argumentStage`), so array → hash table → tree → graph still plays,
  on one stop. The argument's progress lives in `LandingStory` because the
  pinned structure follows it. "What's inside" and later sections show the
  graph; the hero shows the array.
- Scroll stops before the outro: 6 → 3 (hero, argument, what's inside).
- Typing is word by word, not letter by letter (owner: per-letter "is too
  much"). `typedLength` reveals `round(progress × words)` whole words and cuts
  at a word's end, so no word is ever half-drawn; durations and the
  heading-then-body order are unchanged.
- Hero lede replaced by the owner's wording: "Learning data structures and
  algorithms is for the part of the job that doesn't get automated." (the
  old lede's "seeing the shape of a problem, and knowing what a good answer
  costs" is carried by the argument's points).

### 4.6 Credits heat map (owner, 2026-09-14)

After pricing, a snap stop with the owner's line **"Earn credits for
consistent heat."** and a GitHub-style heat map (the owner pointed at the
reference site's contribution graph).

- **Honest example:** there is no learner activity data on a marketing page,
  so the map is labelled "An example year". Counts are seeded
  (`exampleCounts`, mulberry32), with practice growing more regular through
  the year — the idea the section illustrates. The year ends on the render
  date, computed in the server `HomePage` so hydration matches.
- **Calendar:** 52 Sunday-first weeks ending on the end date; levels 0–4 by
  problems solved per day at thresholds 1/3/6/10; month labels where a
  month's first week starts. The caption and `aria-label` print days
  practised and the longest streak, both computed.
- **Copy:** body "Every day you practise lights up a square. Keep the squares
  warm, day after day, and you earn credits toward the modules you unlock
  next." Credit rules are undefined, so no amounts or rates; a test fails on
  any digit in the credits copy. *Open for the owner:* whether credits apply
  toward module unlocks as the body implies.
- **Colour:** `--heat-0..4` per theme (GitHub's greens; level 0 lifted off the
  dark card), mapped to `fill-heat-*` / `bg-heat-*`, contrast recorded beside
  the tokens. Scoped to this component; chrome stays steel.
- **Found while verifying — activation without scrolling:** at 375px the page
  came back already scrolled to Credits (scrollTop 5690) with zero scroll
  events in 3s, so `useActiveSection`'s scroll listener never measured and
  the section stayed untyped and unlit. `useActiveSection` now uses an
  IntersectionObserver rooted on `<main>` with a 1% middle band
  (`rootMargin: -49.5% 0px -49.5% 0px`), which reports the current position
  on observe and on every change, however it happens. The pure
  `activeSectionIndex` stays for `useSectionPaging`.
- **Motion:** squares start at opacity 0; `data-lit` on the SVG (set when the
  section becomes active) fades them in with a 14ms-per-column delay, pure
  CSS. Reduced motion shows the year lit; `<noscript>` shows it too.

**Revision — heatmap as a feature (owner, same day).** The section's label
became "Heatmap", then the owner asked to show the heatmap as a feature:
kicker "Feature", heading "Heatmap", body "Every day you practise lights up a
square, so your rhythm is visible at a glance: the weeks you kept going, the
days you stalled, and how long your streak has run.", and "Earn credits for
consistent heat." as a supporting line that types after the body. The owner
chose to reframe the landing section only; **the in-app heatmap (a learner's
real activity) is not built** — the map stays labelled "An example year".
Open: whether the section should move before pricing now that it describes a
feature rather than a pricing mechanic.

### 4.5 Footer (owner, 2026-09-14)

Landing page only — lesson and problem pages are viewport-locked workspaces.
Owner choices: course links, topic links, GitHub, contact/social, a large
wordmark and a copyright line; "GitHub only for now" for contacts.

- **Top row:** logo + wordmark + one line ("Data structures & algorithms, for
  engineers who solve problems."); **Course** (Lessons, Practice, Start the
  first lesson); **Topics** (the eight `TOPIC_CHIPS`, two columns);
  **Connect** from `CONNECT_LINKS` in `lib/landing/footer.ts`.
- **GitHub not linked:** the old URL `github.com/tharun-se95/dsa-handbook`
  returned 404 publicly; `gh repo view` shows it resolves to
  `tharun-se95/LeetExpert`, visibility **PRIVATE**. A link would 404 for
  every visitor, so `CONNECT_LINKS` is empty and the Connect column is not
  rendered until a public address is confirmed.
- **No legal links:** no privacy or terms pages exist.
- **Wordmark:** "leetExpert" in Space Mono at `16.3cqw` inside an `@container`
  box, measured to fill exactly 100% of its container with no overflow at a
  1200px container (195.6px) and at 375px (54.8px). Letters rise and fade in
  with a 50ms stagger, once, when the footer first intersects `<main>`;
  aria-hidden (the home link names the site); settled under reduced motion;
  a `<noscript>` rule shows it without scripts.
- **Copyright:** `© {year} leetExpert`, year from `new Date().getFullYear()` in
  `HomePage` (a server component, so the year is the build's year on a static
  render).
- **Snap:** `snap-end`, the last stop — verified: one wheel gesture from the
  questions lands at maximum scroll with the footer's bottom on the viewport's.

## 5. Files

New: `lib/landing/story.ts` (copy, computed numbers, pure helpers),
`lib/landing/structureLayouts.ts` (values, layouts, edges, interpolation),
`components/landing/useSectionProgress.ts`, `TypedText.tsx`,
`EvolvingStructure.tsx`, `LandingStory.tsx` (client: chapters + pinned
structure), and a rewritten `HomePage.tsx`.

Deleted: `LandingViz.tsx`, `LandingSandbox.tsx`, `ApproachRail.tsx`,
`WaitlistForm.tsx`, `FamilySpotlight.tsx`, `ContinueAndSticky.tsx`,
`HeroStructureArt.tsx`, `IdeWalkthrough.tsx`, `WhoNotPractical.tsx`; the
`.hero-art-crawl` CSS; content constants used only by them; tests covering
only them (rewritten where the behaviour survives).

---

## 6. Verification

- **Structure data tests:** hash buckets equal `value % 4`; tree edges are
  exactly those produced by BST insertion in value order (independent
  insertion in the test); graph edges ⊇ tree edges and contain a cycle;
  every layout places all seven values; interpolation at integer stages
  equals that stage's layout.
- **Typing tests:** `typedLength` clamps, is monotonic in progress, and never
  splits a surrogate pair; rendered markup contains the full text once in an
  `sr-only` node and marks the visual layer `aria-hidden`.
- **Copy tests:** the page's numbers equal `pairCount(1e6)` and
  `searchSteps(1e6)` computed in the test; the counts line uses
  `curriculumStats()`; the pricing section contains no currency amounts.
- **Page tests:** no viz, sandbox or code components imported by
  `HomePage`; the landing column test updated to the remaining containers;
  deleted files are not referenced anywhere.
- Each new assertion broken on purpose once and seen to fail.
- `tsc`, `eslint`, `npm test`, `npm run build`.
- Browser: typing progresses and reverses with scroll; the structure morphs
  across chapters and stays pinned; reduced motion shows all text and snaps
  stages; 375px layout; both themes; no console errors; the landing page's
  network requests include no CodeMirror/Shiki/Pyodide chunks.
