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
- **The brand lamp is the one non-steel ink in chrome.** The logo is a
  soft-glowing grass-green dot (`components/brand/Lamp.tsx`) painted from
  `--lamp` / `--press-lamp*` in `globals.css`. It is a deliberate exception
  to the monochrome base and covers the mark only — never a button, focus,
  status, or accent colour. It sits 1.18:1 from `--good` in light, so the
  two are told apart by form (a glowing dot in chrome vs a flat tick in
  content) and must stay separate tokens. `tests/brandLamp.test.tsx`
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
  `PatternLab`, `FamilySpotlight`) and curriculum-card identity (the course
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
- **The lessons drawer's tabs are part of its sheet.** The close tab hangs
  off the open rail; the opener sits on the closed sheet's edge at the same
  on-screen height (header `h-14` + the close tab's `top-4`). Both carry
  `.sidebar-rail` paper and `.drawer-tab`'s concave fillets (`globals.css`),
  and **no shadow of their own** — measured at 8x, a tab's shadow fell back
  onto the sheet as a dark band beside the seam and outlined it as an object
  stuck on; the sheet casts the shadow. `.sidebar-rail` paints one solid
  `--rail-surface` token — `--elevated`, the app header's own paper, in both
  themes with no per-theme override (owner request, 2026-09-13; the old steel
  wash and a brief space-black dark variant are both gone) — because the
  fillets need that colour as a gradient stop. Each fillet
  overlaps the tab's border row by 1px (`bottom/top: 100%`, not `+1px`).
  Problem pages use the same opener tab — no inline toggle in
  `ProblemWorkspace`'s header — and that header reserves the tab's spot on
  desktop (`lg:pl-12` so the back link clears it, `lg:py-3` so the band holds
  the tab and both fillets) rather than the tab moving per page. The hover
  edge strip stays off the IDE. The rail clips its own top, bottom and left
  (`clip-path: inset(0 -3rem 0 0)`): it sits above the header (z-45), so its
  edge shadow's blur otherwise spread up onto the header's bottom edge across
  the rail's whole width; only the right stays open, for the shadow and the
  close tab. Guarded in `sidebarChrome.test.ts`.
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
  lessons drawer, the sticky header) ALSO carries a soft ambient shadow on
  top of its brightness step — see the elevation-shadow rule below.
  Recessed surfaces (`--surface`, `--code`) carry no shadow: they sit below
  the page, and a sunk panel casting a shadow reads as floating, which
  fights the brightness step instead of reinforcing it.
- **Contrast is measured, not eyeballed.** Body ink/muted must meet WCAG AA
  (4.5:1). Status text inks are AA-darkened from sheet Success/Warning/Error
  fills. Record ratios in comments beside tokens.
- **Code colour has one source.** Shiki and CodeMirror must paint from the
  same palette definition. Two engines drifting apart is a visible defect.
- Both themes are first-class. Dark is a designed translation, never an
  inversion.
- **Elevation shadow is soft, diffuse, and ink-tinted — never generic black,
  never a hard offset.** A genuinely lifted surface gets `.shadow-elevation`
  (bordered cards in normal flow — module cards, pattern cards, quiz
  options, prev/next links) or a directional `.shadow-edge-bottom` /
  `.shadow-edge-right` / `.shadow-edge-left` (a panel that only separates
  from content on one side — the sticky header, the docked lessons drawer,
  the coach rail, the mobile lessons sheet). Tokens live in `globals.css`
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
