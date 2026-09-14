# Project standards — DSA Course

This is a **commercial course** intended to be sold to a large number of
learners. Treat every change as shipping to paying users.

The rules below are not style preferences. They are the standard of work
required here, and they bind every agent and contributor. When a rule
conflicts with speed, the rule wins — say the work will take longer, do not
quietly lower the bar.

---

## 1. No shortcuts, no patchwork

**A workaround is not a solution.** If a tool, harness, or component cannot
express what the content genuinely needs, extend it. Do not narrow the
content to fit the tool, and do not ship a version that "mostly" works.

- If a problem does not fit the sandbox runner, **fix the runner**. Excluding
  the problem is a last resort that requires a written justification in the
  spec and an entry in the exclusions list, not a silent omission.
- Never leave a capability half-built and describe it as done. Either it
  handles the real cases or it is explicitly marked incomplete with a
  tracked follow-up.
- Temporary scaffolding (backlog files, allowlists, migration ratchets) must
  carry a stated end condition and be deleted when it is met. Scaffolding
  that outlives its migration is technical debt pretending to be process.

## 2. Correctness is verified, never assumed

- **Never hand-write an expected value.** Expected outputs are computed by
  executing a reference solution. A wrong expectation fails a correct learner
  and destroys trust in the product.
- **Every sandbox is validated against BOTH runtimes.** A reference solution
  in Python *and* JavaScript must pass every case. The two languages differ
  on integer division, sort stability, and string handling — one passing
  proves nothing about the other.
- Reference solutions are **checked in and executed in CI**, not written in a
  throwaway script. Expectations must be reproducible.
- Before claiming anything works, run it. `tsc`, `eslint`, `npm test`, and
  `npm run build` must all pass, and behaviour must be confirmed in the
  browser — a green typecheck is not evidence that a feature works.
- When a test suite passes on the first run, prove it can fail. Introduce a
  deliberate fault, watch it fail, restore. A test that never fails is not a
  test.

## 3. Course content standards

The content is the product. Code exists to serve it.

- **Every problem lesson gets a working sandbox** with starter code in both
  languages. There are **no permitted exclusions**: the runner now expresses
  every problem shape in the course (structural inputs, operation sequences,
  order-independent answers). If a new problem does not fit, extend the
  runner — do not add an exclusion.
- **Test cases must cover the stated constraints.** If the lesson says
  "k can exceed n" or "may be empty", there is a case for it. Cases are
  chosen to catch real mistakes, not to be passed easily.
- **Starter code is scaffolding, not a stub.** It carries the signature, a
  one-line statement of what to return, and nothing that gives the answer.
- **Explanations derive their conclusions.** No asserted result without the
  reasoning that produces it. If a step is non-obvious, show why it holds.
- **Quiz distractors must be plausible and specific.** A wrong option that is
  obviously wrong teaches nothing.
- **Never leak solutions.** Reveal content is conditionally rendered so
  Ctrl+F cannot surface it. Do not "optimise" that away.

## 4. Design system

- **Handbook press inks** in `web/src/app/globals.css` — **Blueprint,
  monochrome base** (accent/pop/mark all steel: light `#1E293B`, dark
  `#CBD5E1`). Fill-in map:
  `docs/superpowers/specs/2026-07-31-theme-palette-fill-in.md`.
- **Type system: three faces, three jobs.** Space Mono (`--font-display`)
  for the wordmark and every heading; Space Grotesk (`--font-sans-face`) —
  Space Mono's proportional sibling — for body and UI; JetBrains Mono for
  code only, so a heading is never mistaken for a code block. Space Mono
  ships only 400/700: display call sites use regular or `font-bold`, never
  `font-semibold` (guarded in `design-tokens.test.ts`). Space Grotesk has no
  italic, so emphasis is weight — `em` 500, `strong` 700 — never a
  synthesised slant. Diagram label sizing is checked against real glyph
  advances in `tests/diagramTextFit.test.tsx`; change a face and that test
  tells you which `CH_*` constants to retune.
- **All colour goes through tokens.** No hardcoded Tailwind palette values
  (`emerald-500`, `red-400`) in components — they survive a palette change
  and silently break the theme.
- **Primary is steel/indigo everywhere; family colour is scoped to content,
  never lifted to chrome.** This reverses the original design (below is what
  changed, kept for context): AppShell no longer applies `familyCssVars`/
  `singleAccentCssVars` on a page-wide wrapper, so the header, sidebar,
  buttons, and focus rings stay one steel/indigo design across every course
  and module — they do not tint per lesson. `activeThemeFor` in
  `AppShell.tsx` still resolves which family a route belongs to (tested in
  `appShellRouting.test.ts`), but only as a lookup for the specific
  components that legitimately want it: viz tracers (`VizPlayer`, `Diagram`,
  `PatternLab`) and curriculum-card identity (the course
  hub and module-page cards in `app/courses/dsa/`), which call
  `familyCssVars(family)` themselves, scoped to their own element. Guarded
  by `design-tokens.test.ts`'s "AppShell resolves the route's family but
  does not tint chrome with it". Family colours are still authored as ONE
  `accent` hex per family in
  `web/src/lib/visual/familyTheme.ts`; `accentUi` (the 3:1-on-both-papers UI
  fill, gold darkened to `#AB8921`) is derived by `uiAccent()` — recolor a
  family by changing one hex. `accentUi` clears only the 3:1 UI floor on
  paper, so **body-size accent text uses `--mark`, never `--accent`**
  (`text-mark`) — `--mark` is never remapped by a family scope and stays AA
  steel in both themes (the wordmark uses it too). Chapter headings are a
  1px `--rule-strong` hairline (a decorative `// 01` counter label sat above
  it until 2026-09-12, removed on request); component sections
  share it through `.chapter-rule` + `.chapter-heading`, never a copied bar.
  Heading text stays ink.
- **The course nav is two levels, and the level is derived from the route.**
  Level 1 is stage headings + module rows; following a module row navigates
  to it and drills into level 2, that module's lessons plus its extras. The
  back row is labelled with the module's own section ("< Foundations") and
  returns focus to that module's row, which scrolls its section back into
  view — a generic jump to the top would make that label untrue. `lib/course/navLevel.ts`
  owns the resolution (`resolveNavView`) — the only stored state is the back
  override, which shows level 1 without navigating and is dropped on the next
  pathname change; a stored level would go stale against the URL. Markup
  lives in the props-only `CourseNavPanel` (rendered in
  `courseNavPanel.test.tsx` without a router), and `CourseNavTree` keeps the
  hooks, the cross-slide (`motion/react`, skipped under `useReducedMotion`)
  and focus. Focus after back moves from a **callback ref**: under
  `AnimatePresence mode="wait"` the incoming level has not mounted when an
  effect or `onExitComplete` fires.
- **The lessons drawer closes from its own header row and opens from a
  floating button** (owner, 2026-09-14; spec
  `docs/superpowers/specs/2026-09-14-drawer-header-and-floating-opener-design.md`;
  it replaced the 2026-09-13 edge tabs and their concave fillets). The nav
  panel's top row is pinned (`sticky top-0`, grainy paper so rows scrolling
  beneath do not show through, no `border-b` — the module heading below
  carries the rule): inside a module it is the back row ("‹ {stage}") with ✕
  beside it, at the top level just ✕. `CourseNavPanel` renders it only when
  given `onClose`; the desktop drawer passes it, the mobile sheet keeps its
  own "Lessons ✕" header and passes nothing. The drawer's top padding moved
  onto that row, so rows cannot scroll into a gap above it. The opener
  (`FloatingLessonsButton`) is a round hairline control on grainy paper with
  the card shadow, `fixed bottom-6 left-6` (the coach launcher's inset,
  mirrored), z-40 above the hover edge strip, hidden while the drawer is open;
  `next.config` moves Next's dev badge to bottom-right so it does not sit on
  it. The problem page's sub-header reserves no room for a tab. `.sidebar-rail`
  paints `--rail-surface` — `--background` with the desk grain, the app
  header's own paper, in both themes (owner, 2026-09-13 "match the header").
  The rail clips its own top, bottom and left (`clip-path: inset(0 -3rem 0
  0)`): it sits above the header (z-45), so its edge shadow's blur otherwise
  spread up onto the header's bottom edge; only the right stays open, for the
  shadow and the resize grip, whose pill overhangs the edge (which is also why
  AppShell's hover-close hit-tests `rail.contains`). Guarded in
  `sidebarChrome.test.ts` and `courseNavPanel.test.tsx`.
- **The landing page (`/`) has its own header and a scroll-typed story; no
  other route does.** Owner direction 2026-09-14
  (specs `docs/superpowers/specs/2026-09-14-landing-header-and-grain-design.md`
  and `2026-09-14-landing-rewrite-agentic-ai-design.md`). On `/` AppShell
  skips the sticky app `Header` and renders `LandingHeader` as the first thing
  *inside* `<main>`, inside the app's one `.paper-grain` desk wrapper:
  a `border-border` hairline, **sticky** (owner, 2026-09-14): clear over the
  grain at the top, `bg-background/80 backdrop-blur-md shadow-edge-bottom`
  once content scrolls under it — `scrolled` comes from an
  IntersectionObserver on a sentinel at the page top (not a scroll listener),
  and its height is the same either way so nothing jumps; content in a centred
  `max-w-landing` column (`--container-landing: 88rem`, owner request) with
  `px-6 md:px-16` gutters shared by header and page so they keep one edge.
  Its nav stays Space Grotesk (16px, ink) — the reference's display-face nav
  was declined to keep the three-faces rule. **The page explains rather than
  sells** (owner): why learn DSA when agents write code — a hero, one
  argument screen (`WHY`: four numbered one-line points, problem-solving
  mindset first — four full chapters were cut the same day as too long a
  scroll to reach the point; do not expand it back into chapters), a line of manifest
  counts, pricing ("Start free. Pay as you learn." — per module, no prices on
  the page), a heatmap feature section (kicker "Feature", heading "Heatmap",
  with the owner's line "Earn credits for consistent heat." typed beneath the
  body) and three questions. Its `HeatMap` is an **example year** and says
  so — the in-app heatmap is not built yet, so the page must not imply it is
  live beyond that label — seeded (`lib/landing/heat.ts`), ending on the render
  date, its days-practised and streak numbers computed from the same counts;
  it names no credit amounts because the rules aren't defined. Its colour is a
  scoped `--heat-0..4` token ramp (GitHub's greens, contrast recorded beside
  the tokens), squares fade in column by column on arrival via CSS, and
  `landingHeat.test.tsx` rebuilds the calendar independently. No viz or code blocks, feature grids,
  testimonials, banners or sticky CTA; do not add them back without asking.
  Copy lives in `lib/landing/story.ts`, and every number in it is computed
  (`pairCount`, `nestedSteps`), never typed in. The page
  snaps section to section (`snap-y` on `<main>`, only on `/`, mandatory from
  `lg`, where `useSectionPaging` turns one wheel gesture into one stop —
  measured in Chrome, mandatory snapping pulled a 300px wheel scroll back to
  the stop it left): scroll-scrubbed typing was tried first and replaced the same day
  because re-rendering text and SVG on every scroll frame felt unsmooth. When
  a section becomes active (`useActiveSection`: an IntersectionObserver on a
  1% band across `<main>`'s middle — not a scroll listener, which never fired
  for a page that returned already scrolled) its text types once, word by word (letter-by-letter was too busy; owner
  2026-09-14), over a length-scaled duration
  (`TypedText` + `useRevealProgress`); the `sr-only` copy is always complete; the visual layer starts
  untyped on the server, because a hero rendered typed would flash blank on
  hydration; a `<noscript>` rule reveals it; reduced motion shows it all. One
  `EvolvingStructure` stays pinned beside the chapters and animates (motion,
  0.9s; instant under reduced motion) array → hash table → BST → graph, one
  stage per argument point as its title starts typing (`argumentStage`; each
  point gets 1.1s, longer than the morph) — one element per edge, so tree edges stay put when
  the tree becomes a graph; its layouts are derived from the values
  (`lib/landing/structureLayouts.ts`) and rebuilt independently in
  `landingStory.test.tsx`. `HomePage` stays a server component and passes
  counts and topic links as props, so the course manifest never ships to the
  landing client. The page ends in `LandingFooter` (landing only; lesson and
  problem pages are viewport-locked): Course and Topics columns linking only
  real routes (`landingFooter.test.tsx` resolves every href against page files
  and the manifest), no legal links until those pages exist, a Connect column
  rendered only when `lib/landing/footer.ts` `CONNECT_LINKS` holds a confirmed
  public address — empty for now because the GitHub repo is private — an
  oversized `FooterWordmark` (sized in container-query units to span its box,
  letters rise once on first view, aria-hidden, settled under reduced motion)
  and a computed copyright year. It is the last snap stop (`snap-end`). The app
  `Header` shares its class sets with it through `layout/headerChrome.ts`
  (logo chip, wordmark, nav link, round control) and keeps its own `h-14`,
  which the drawer geometry above reads. The grain is its own rule below.
  Guarded in `landingHeader.test.tsx` and `appHeader.test.tsx`.
- **The grain is the app's desk, on every route** (owner, 2026-09-14; spec
  `docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md`). The tile
  is `public/textures/grain.png`, generated by `scripts/make-grain.mjs`
  (seeded; `paperGrain.test.ts` checks the committed pixels), drawn at 200px
  with strength `--grain-opacity` per theme. Two paints, one strength:
  `.paper-grain` (a `::before` at `z-index:-1` in an isolated element) on the
  ONE transparent desk wrapper inside `<main>` — a second transparent layer
  inside it would double the strength — and `.grain-paper` (the paper at
  `1 − opacity` over the opaque tile, measured within 1/255 of `.paper-grain`,
  `background-origin: border-box` so borders do not show the bare tile) on
  opaque surfaces: the app header, the lessons drawer rail and its pinned header row, the
  floating drawer opener and the mobile lessons sheet. `--grain-paper` names the surface's paper and
  `--grain-veil` is declared on the elements that use it, never on `:root`.
  The app header is a hairline on the desk like the landing header
  (`bg-background`, no shadow); the problem page's root and sub-header are
  transparent over the desk. The reading sheet, cards, code, the IDE and
  dialogs stay solid and cover the grain. Every text ink clears AA at the
  worst grain pixel (`grainContrast.test.ts`; floors 4.84:1 light on
  `--good`, 6.65:1 dark on `--muted`, measured on the contribution-green palette) — re-measure if the opacity or a paper changes. Call sites are
  allowlisted in `paperGrain.test.ts`.
- **Surfaces combine a paper ladder with soft elevation shadow.**
  `--background` / `--elevated` / `--code` / `--surface` carry a perceptible
  brightness ladder in BOTH themes — elevated brightest, surface deepest,
  never an inversion. Light: white cards on a cool-gray page (measured
  elevated/background 1.10, background/code 1.11, code/surface 1.12,
  elevated/surface 1.36). Dark: neutral-grey surfaces (no blue cast) —
  elevated/paper 1.24, code/elevated 1.16, paper/code 1.07, surface/paper
  1.05. Every text ink (ink, muted, and every status ink incl. info) clears
  AA 4.5:1 on the deepest surface it can render on — the sandbox paints
  verdict rows and insight values on `--press-paper-sunk`, so that is the
  binding floor. A genuinely elevated surface (cards, the coach rail, the
  lessons drawer) ALSO carries a soft ambient shadow on
  top of its brightness step — see the elevation-shadow rule below.
  Recessed surfaces (`--surface`, `--code`) carry no shadow: they sit below
  the page, and a sunk panel casting a shadow reads as floating, which
  fights the brightness step instead of reinforcing it.
- **Contrast is measured, not eyeballed.** Body ink/muted must meet WCAG AA
  (4.5:1). Record ratios in comments beside tokens.
- **Status and palette colour is generated, never hand-picked.** Eight hues
  (`--hue-{name}-{1..4|ink}`) are derived from GitHub's contribution-graph
  ramp by `web/src/lib/visual/palette.ts` (spec
  `docs/superpowers/specs/2026-09-14-contribution-green-palette-design.md`);
  `tests/palette.test.ts` fails if a hex in `globals.css` drifts from it.
  Status colours map onto it — good green, bad red, warn orange, info blue,
  insight yellow — with text in `-ink` (light: level 4's lightness at
  near-max chroma), `*-surface` at level 1 and `*-line` for 3:1 rules. A
  `*-line` sits only on `--elevated` or `--background`; light level 3 fails
  on `--code` and `--surface`.
- **Code colour has one source.** Shiki and CodeMirror must paint from the
  same palette definition. Two engines drifting apart is a visible defect.
- Both themes are first-class. Dark is a designed translation, never an
  inversion.
- **Elevation shadow is soft, diffuse, and ink-tinted — never generic black,
  never a hard offset.** A genuinely lifted surface gets `.shadow-elevation`
  (bordered cards in normal flow — module cards, pattern cards, quiz
  options, prev/next links) or a directional `.shadow-edge-bottom` /
  `.shadow-edge-right` / `.shadow-edge-left` (a panel that only separates
  from content on one side — the docked lessons drawer, the coach rail, the
  mobile lessons sheet). The app header carries no shadow: it is a hairline on
  the grain desk, like the landing header. Tokens live in `globals.css`
  (`--shadow-elevation`, `--shadow-edge-*`): light mode tints the shadow
  with `--press-ink` at low alpha so it reads as ink, not generic UI chrome;
  dark mode uses near-black, since a *light* ink at low alpha would lighten
  rather than shadow a dark surface. Low opacity, generous blur, minimal or
  no offset — the shadow should read as "lifted," not as a decorative
  graphic. Never an arbitrary `shadow-[...]` value or a raw `box-shadow` in
  a component — like radius, shadow is a token, applied via the shared
  class, not authored per-component. A full-bleed panel with no adjacent
  visible page (a mobile tab's own content pane) gets no shadow: there is
  nothing beside it to cast one onto.

## 5. Code standards

- TypeScript strict; no `any`, no unchecked casts to silence the compiler.
- Comments explain **why**, never what. Load-bearing decisions, non-obvious
  constraints, and traps get a comment; obvious code does not.
- Match the conventions of surrounding code rather than importing new ones.
- Registry-addressed content (`viz`, `diagram`, `sandbox` ids) must be
  validated by tests — a string id typo must fail CI, not render an error
  card in production.
- Accessibility is not optional: real `aria-label`s on diagrams, visible
  focus states, keyboard paths for every interaction, and `prefers-reduced-
  motion` honoured.
- Performance is budgeted. Heavy dependencies load only where used; do not
  make 220 lessons pay for a feature five of them need.

## 6. Reporting

- Report outcomes faithfully. If something is unverified, say so and say why.
- Distinguish "I ran it and it passed" from "it should work".
- Surface defects found in passing, including your own from earlier work.
- Never describe partial work as complete.

---

## Repo map

| Path | What it is |
| --- | --- |
| `courses/dsa/` | The product: 220 lesson markdown files in 24 modules, `<module>/<lesson>.md` (116 problem, 83 concept, 21 practice) |
| `courses/nextjs/` | Next.js course, 62 lessons, `<module>/<chapter>/<lesson>.md` — disabled: `web/src/app/courses/nextjs/layout.tsx` 404s every route |
| `web/` | Next.js app that renders the course; reads `courses/` from the repo root (`COURSE_ROOT` overrides) |
| `video/` | Remotion video subproject (see `video/HANDOFF.md`) — legacy; new video work goes to `hyperframes/` |
| `docs/superpowers/specs/` | Design specs; write one before large work |
| `web/tests/` | Content validation — runs in CI before build |
| `hyperframes/` | HyperFrames visual system: seek-safe DSA primitives and explainer videos; one source for lesson art, social stills and video (see its README) |
| `marketing/` | Instagram post packages; `LEDGER.md` is the append-only record the social-artist agent reads before and appends to after each post |
| `seo/` | SEO strategy, keywords, technical audit and changelog |
| `archive/handbook-v1/` | The retired v1 pattern handbook, kept for reference |
| `scripts/` | v1 handbook Python scripts; they target a root `part-2-pattern-families/` that now lives in `archive/handbook-v1/`, so they do not run as-is |
| `assets/` | v1 handbook-era Mermaid pattern diagrams and placeholder folders; unchanged since the initial commit and referenced by nothing |
| `references/` | Reading list that informs the content — not part of the course |
| `media-source/` | Git-ignored raw NotebookLM exports; the served copies live in `web/public/media/` |

`web/AGENTS.md` carries Next.js-specific guidance and still applies.
