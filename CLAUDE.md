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
- **Callouts are the exception, and each has one job** (spec
  `docs/superpowers/specs/2026-09-13-callout-system-design.md` §3). Key idea
  (` ```key `) is the one claim a section concludes; Mental model (`brain`)
  is a picture you reason with, never a summary; Watch out (`warn`) is one
  concrete mistake with its trigger and consequence, executed in both
  languages; Tip is optional practical help; Goal is exactly what to return;
  Aside is a short first-person note. A plain `>` is a quotation or formula
  display, not a claim. Never two callouts adjacent, never one that restates
  the paragraph before it.
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
- **The brand lamp is the one non-steel ink in chrome.** The logo is a
  soft-glowing grass-green dot (`components/brand/Lamp.tsx`) painted from
  `--lamp` / `--press-lamp*` in `globals.css`. It ends the wordmark —
  `leetExpert ●`, the green signal last (owner, 2026-09-14) — in both the
  app `Header` and `LandingHeader`, at the shared `LOGO_LAMP_SIZE`, inside
  the home link's `.lamp-link` so hover and focus replay its bloom. Each page
  renders one header, so one lamp blooms. It is a deliberate exception
  to the monochrome base and covers the mark only — never a button, focus,
  status, or accent colour. It sits 1.16:1 from `--good` in light (1.17:1
  dark), so the two are told apart by form (a glowing dot in chrome vs a flat
  tick in content) and must stay separate tokens. `tests/brandLamp.test.tsx`
  confines the tokens to the mark and keeps the static icons
  (`assets/brand/mark*.svg`, the generated PNG/ICO files, the OG card) in
  step with them: after changing a lamp token, update those and rerun
  `node scripts/generate-icons.mjs`. Brand SVGs are parsed as strict XML
  (`tests/brandSvgXml.test.ts`) because a favicon is loaded as XML — never
  write `--` inside an SVG comment, which is how the old `icon.svg` shipped
  malformed. Spec: `docs/superpowers/specs/2026-09-13-lamp-logo-design.md`.
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
  panel's top row is pinned (`sticky top-0`): grainy paper like the rail at
  rest and `TRANSLUCENT_PAPER` once rows scroll under it (`CourseNavTree` observes
  a sentinel against the nav, not scroll events — translucent at rest it read as
  a lighter strip), with no shadow and no `border-b` (the module heading below
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
- **Code language is one preference, picked where the code is** (owner,
  2026-09-17; spec `docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md`).
  Every code surface — lesson code blocks (`CodeTabs`), viz code panels
  (`CodePanel`) and the sandbox toolbar — carries `CodeLangMenu`, a menu button
  naming the language shown; picking on any surface changes all of them, in
  every tab. There is no language control in the app or landing header (it was
  withdrawn: far from its effect, present on pages with no code, read as
  navigation, and a two-sided pill cannot hold a third language). The
  preference is a real language id from the hook-free registry
  `lib/codeLanguages.ts` (`python`, `javascript`, `typescript`); a surface that
  lacks it shows the nearest it has (`javascript` ↔ `typescript`, then registry
  order), its label names what is shown, and the menu says the preference is not
  available there. `lib/codeLang.ts` is the store. A plain inline script after
  the lamp's boot script sets `<html data-code-lang>` while the page parses —
  never `next/script` `beforeInteractive`, which runs after first paint — and an
  inline `<style id="code-lang-rules">` generated from the registry resolves
  server-rendered blocks (`data-code-lang-has` / `data-code-lang-panel`) before
  paint, so pages stay static and never flash. The layout imports only hook-free
  modules: reaching `useSyncExternalStore` from it 500'd every route, and
  neither `tsc` nor vitest can see that boundary. The menu is portalled to
  `<body>` because code surfaces clip overflow, and it keeps the picked block in
  place while blocks above it change height. Adding a language means a registry
  entry plus its content, runner and reference solutions (§2) — never list one
  first. Every `tabs` fence carries exactly `python` and `typescript` (content
  test). Guarded in `codeLang.test.ts`, `codeLangMenu.test.tsx` and
  `codeLangSurfaces.test.tsx`.
- **The landing page (`/`) has its own header and a scroll-typed story; no
  other route does.** Owner direction 2026-09-14
  (specs `docs/superpowers/specs/2026-09-14-landing-header-and-grain-design.md`
  and `2026-09-14-landing-rewrite-agentic-ai-design.md`). On `/` AppShell
  skips the app `Header` and renders `LandingHeader` as the first thing
  *inside* `<main>`, inside the app's one `.paper-grain` desk wrapper:
  a `border-border` hairline, **sticky** (owner, 2026-09-14): clear over the
  grain at the top, `TRANSLUCENT_PAPER` (`bg-background/90 backdrop-blur-md`,
  owner 2026-09-15 — at 80% muted text fell to 3.85:1 over a dark block) plus
  `shadow-edge-bottom` once content scrolls under it — `scrolled` comes from an
  IntersectionObserver on a sentinel at the page top (not a scroll listener),
  and its height is the same either way so nothing jumps; content in a centred
  `max-w-landing` column (`--container-landing: 88rem`, owner request) with
  `px-6 md:px-16` gutters shared by header and page so they keep one edge.
  Its nav stays Space Grotesk (16px, ink) — the reference's display-face nav
  was declined to keep the three-faces rule. **The page explains rather than
  sells** (owner): why learn DSA when agents write code — a hero (its headline
  one sentence per line, `HERO.lines`, sized `lg:text-4xl xl:text-5xl` so the
  longer line fits the text column — measured 14.675em), one
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
  (lamp size, wordmark, nav link, round control) and keeps its own `h-14`,
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
  opaque surfaces: the lessons drawer rail and its pinned row at rest, the
  floating drawer opener, the mobile lessons sheet and the problem page's two `--elevated` panes (AA holds
  there too; the `--surface` hover fills stay solid — muted fell to 4.05:1). `--grain-paper` names the surface's paper and
  `--grain-veil` is declared on the elements that use it, never on `:root`.
  The app header overlays the page (spec
  `docs/superpowers/specs/2026-09-15-translucent-chrome-and-pane-grain-design.md`):
  `absolute top-0 h-14`, `TRANSLUCENT_PAPER` with `shadow-edge-bottom`. Lesson
  and module pages scroll under it — the desk wrapper's `pt-14` starts them
  below it, the rail starts below it (`mt-14`), and scroll offsets moved 3.5rem
  (TOC `top-38`, headings `scroll-mt-38`) — and `grainContrast.test.ts` keeps
  its muted text AA over a code block passing beneath. The problem page's root
  and sub-header are transparent over the desk. The reading sheet, cards, code, the IDE and
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
  (`--hue-{name}-{1..4|ink|line}`) are derived from GitHub's contribution-graph
  ramp by `web/src/lib/visual/palette.ts` (spec
  `docs/superpowers/specs/2026-09-14-contribution-green-palette-design.md`);
  `tests/palette.test.ts` fails if a hex in `globals.css` drifts from it.
  Status colours map onto it — good green, bad red, warn orange, info blue,
  insight yellow — with text in `-ink` (light: level 4's lightness at
  near-max chroma), `*-surface` at level 1 and `*-line` for 3:1 rules. A
  `*-line` is generated grain-safe (`lineColour`: light level 3, darkened
  only until it clears 3:1 at the worst grain pixel on `--elevated`; dark
  level 4) and sits **only on `--elevated`**, grainy or flat — light level 3
  fails on `--code` and `--surface`, and the grainy desk would need every hue
  darkened. `grainContrast.test.ts` holds every line to that floor.
- **Callout colour names the kind of message; the label names the type.**
  Yellow = understanding (Key idea, Mental model), red = a mistake (Watch
  out), blue = context (Goal, Aside), green = a requirement (Constraints),
  steel = advice (Tip). Every labelled callout carries a tint
  (`--callout-tint-*`: palette level 1 mixed into `--elevated`, 50% light /
  70% dark), a 3px grain-safe `*-line` rule and a label in its text colour; the owner's
  declared fallback is treatment A — set the five tint tokens to
  `transparent`. Callout body inherits the prose size. Guarded in
  `design-tokens.test.ts` ("callout tints…", "Callout: treatment B…") and
  `tests/callout.test.tsx`.
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
  mobile lessons sheet, and the app header, whose shadow falls on the page
  scrolling under it). Tokens live in `globals.css`
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
- **Accounts are optional and progress is local-first** (spec
  `docs/superpowers/specs/2026-09-18-accounts-and-progress-sync-design.md`).
  Signed out, the app is exactly the localStorage app. What every page ships
  for accounts is three small `next/dynamic` shells (`AccountControl`,
  `AccountRuntime`, `SyncHint`) and the `SyncBridge` context, which holds no
  runtime until someone signs in. Everything that needs the session sits
  behind those shells in chunks fetched only when `authEnabled` is true: the
  auth client, the account menu and its dialogs (`SessionControl`, with
  `Dialog`, `signOutDevice`, `localStore` and `sandboxIds.generated.json`),
  `SessionSync` and `SignedOutLine`; the sync runtime (`SyncProvider`) is a
  further chunk that `SessionSync` loads only once a session exists. With
  auth on, every visitor fetches the auth client and control chunks after
  hydration (something has to ask who is signed in) but only a signed-in one
  fetches the runtime. Measured 2026-09-19 on a build with no auth variables:
  none of that is in the initial `<script>` list of a lesson page, whose
  shared JS fell from 1,825,183 to 1,771,480 B raw (531,154 to 511,917 B
  gzip) when the auth client (33.5 KB raw, 12.2 KB gzip) left it.
  `tests/authChunkBoundary.test.ts` walks the static imports of the three
  shells and fails if the auth client or any of those modules enters them;
  the built HTML is the final check. Not deferred: the 116 problem pages
  still carry `useDraftSync` and `merge.ts` (about 3.6 KB minified, 1.6 KB
  gzip, with the `localStore` code the sandbox needs anyway) because
  `Sandbox` imports the hook statically; without a runtime it does nothing.
  Sign-in is on only when all seven variables in
  `web/.env.example` are set, and `authEnabled` is read while pages are
  prerendered, so changing them needs a rebuild. Pages never read the
  session on the server — a lesson that turns dynamic is a defect; compare
  the `next build` route table against the previous one. The API takes the
  user id only from the session, read with the cookie cache disabled so
  revocation stops writes at once. Marks are an insert-only set; drafts carry
  a server `rev`, and on a conflict the client stashes the losing copy rather
  than overwriting or discarding it. Sign-out clears every synced key,
  including the legacy `dsa-course-*` keys, or the migration revives them.
  Only visited, solved and problem-sandbox drafts sync; adding a kind means
  a merge rule and tests first. Merge rules live in the pure
  `lib/progress/merge.ts`; SQL guarantees are tested on PGlite with the real
  migrations. Browser tests sign in through `POST /api/test-login`, which
  answers only outside a production build and with `AUTH_TEST_LOGIN=1`, and
  is a 404 otherwise; `e2e/test-login-prod.e2e.mjs` checks that against a
  real `next build` with the auth variables set (without them the route is a
  404 whatever `NODE_ENV` does, so the check could not fail).
  Guarded in the `progressMerge`, `progressStore`, `progressApi`,
  `syncQueue`, `signInFlow`, `progressLocalStore` and `testLogin` tests, and
  by `e2e/sync.e2e.mjs`, which needs a Neon development database. That
  script has NOT yet been run against a real Neon database or real OAuth: it
  passed (11 of 11, twice) only against a local Neon-compatible HTTP emulator
  over in-memory PGlite, and neither it nor `e2e/test-login-prod.e2e.mjs`
  runs in any CI.
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
| `web/drizzle/` | Generated Postgres migrations (drizzle-kit); applied by `npm run db:migrate` as a deploy step, never at request time |
| `hyperframes/` | HyperFrames visual system: seek-safe DSA primitives and explainer videos; one source for lesson art, social stills and video (see its README) |
| `marketing/` | Instagram post packages; `LEDGER.md` is the append-only record the social-artist agent reads before and appends to after each post |
| `seo/` | SEO strategy, keywords, technical audit and changelog |
| `archive/handbook-v1/` | The retired v1 pattern handbook, kept for reference |
| `scripts/` | v1 handbook Python scripts; they target a root `part-2-pattern-families/` that now lives in `archive/handbook-v1/`, so they do not run as-is |
| `assets/` | v1 handbook-era Mermaid pattern diagrams and placeholder folders; unchanged since the initial commit and referenced by nothing |
| `references/` | Reading list that informs the content — not part of the course |
| `media-source/` | Git-ignored raw NotebookLM exports; the served copies live in `web/public/media/` |

`web/AGENTS.md` carries Next.js-specific guidance and still applies.
