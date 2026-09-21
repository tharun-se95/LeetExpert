# Design system: one source of truth

Owner direction 2026-09-21: separate the design system into one source of
truth that every component uses. Two stages, each with its own plan. **This
spec designs Stage 1 in full. Stage 2 is an outline and is designed only after
Stage 1 has been reviewed and has landed.**

- Stage 1 — **Tokens.** Every token defined once, in typed source, and
  generated into every place that today keeps its own copy.
- Stage 2 — **Primitives.** A `ui/` layer (Card, Chip, Button, Field, Segmented,
  Dialog) that components use instead of retyping class strings.

Owner decisions (2026-09-21): both stages, in that order; the design system
lives in `web/src/design-system/` with an enforced boundary (not a workspace
package); token truth flows from typed TS source to CSS, not the reverse.

## 1. Why: the current state

Measured on the working tree at 2026-09-21.

- Tokens live in `web/src/app/globals.css` (1,980 lines). `@import "tailwindcss"`
  at the top, one `@theme inline` block mapping variables to utilities, one
  `@layer base`.
- The truth flows in **two opposite directions**. `lib/visual/palette.ts`
  generates the hue ramp in TS and `tests/palette.test.ts` fails if a hex in
  `globals.css` drifts from it, so a person copies hex values by hand.
  `lib/visual/hyperframesBrand.ts` goes the other way: it parses `globals.css`
  to write `hyperframes/assets/brand.css`.
- Other consumers keep their own values: `lib/visual/familyTheme.ts` (301
  lines), `components/sandbox/editorTheme.ts` (144), the static brand SVG and
  PNG files, and the OG card.
- The radius tokens are declared **twice** with identical values
  (`globals.css:223-227` and `:466-470`).
- Contrast ratios are typed into comments and have drifted. A design review
  (three `agy` slices, each finding recomputed by hand) confirmed two:
  `globals.css:299` says 8.19:1 for `#9ca9b8` on `#060607` (actual 8.47), and
  `:1233` says 11.2:1 and 12.8:1 for `--mark` on the deepest surface (actual
  10.75 and 14.14).
- Motion tokens exist (`--dur-fast` 150ms, `--dur` 250ms, `--dur-gentle` 420ms,
  `--ease`, `--ease-gentle`, `globals.css:249-260`) but some rules bypass them:
  `:587` (1.05s caret), `:610` (a `420ms` that equals `--dur-gentle`), `:640`
  (1.2s), `:663` (60s `ease-in-out`) and the lamp strike/replay rules at
  `:928-942` (900ms and a literal `cubic-bezier`). Layering is chosen ad hoc:
  `z-30` in the landing header against `z-40` and `z-45` for the drawer parts
  (CLAUDE.md §4). CLAUDE.md does not require tokens for either, so this is a
  decision, not a violation (see §8).

## 2. Goals and non-goals (Stage 1)

**Goals**

1. Each token is defined once. Every consumer above is generated from that
   definition, or reads it.
2. No visual change. The proof is exact and executable (§6).
3. Contrast comments are computed and emitted by the generator, never typed.
4. The boundary of the design system is a test, not a convention.

**Non-goals:** renaming a token, changing a value, adding a token (except the
scales in §8, after approval), touching a component, any Stage 2 work.
A value that looks wrong, such as the missing `--on-good` (white on dark
`--good #39d353` is about 2:1 at `ProblemsFlatList.tsx:75`), is fixed in its own
change after Stage 1, so the no-change proof stays clean.

## 3. Structure

```
web/src/design-system/
  tokens/     typed source: palette, surfaces, type, radius, shadow,
              motion, layers, family themes, deliberate one-offs
  build/      pure generator functions (no I/O) + the writer
  styles/     component-level CSS moved verbatim out of globals.css
  index.ts    the only public entry
```

Boundary rules, enforced by `tests/designSystemBoundary.test.ts`:

- Nothing under `design-system/` imports from `app/` or from feature
  components (`components/**` outside `design-system/`).
- Code outside imports only from `@/design-system`, never a deep path.

`globals.css` afterwards holds the imports, the `@theme inline` mapping,
`@layer base`, and the page-level rules that are not tokens.

## 4. Token source

Token names stay exactly as they are (`--elevated`, `--hue-green-ink`,
`--shadow-elevation`, `--press-lamp`). No consumer changes.

Each token is a typed entry: name, light value, dark value, and a derivation
where one exists. Hues and ink levels call the existing `palette.ts`
functions, which move into `tokens/`. A token that is hand-picked on purpose,
such as the brand lamp, carries `deliberate: true` and a stated reason; the
generator emits that reason as its comment. Tokens with no dark counterpart
must say why.

Family themes keep authoring one `accent` hex per family. `accentUi` stays
derived by `uiAccent()`.

## 5. Generator and consumers

The generator is a set of pure functions from the token source to strings. A
thin writer puts them on disk.

| Output | Replaces |
| --- | --- |
| `design-system/tokens.generated.css` (committed) | hand-written token blocks in `globals.css` |
| TS exports from `tokens/` | hex tables in `familyTheme.ts` and `editorTheme.ts`; Shiki reads the same exports (verify in the plan that it does not keep a separate palette) |
| `hyperframes/assets/brand.css` generated block | today's parse of `globals.css` |
| brand SVG and PNG inputs, OG card colours | hand edits followed by `node scripts/generate-icons.mjs` |

Contrast comments are computed from the values and written next to the token.
The radius tokens are emitted once.

The component-level classes (`.shadow-elevation`, `.shadow-edge-*`,
`.grain-paper`, `.paper-grain`, `.chapter-rule`, the callout rules and the rest)
move **verbatim** into `design-system/styles/`, split by concern. It is a pure
move with no edit to the rules; the snapshot in §6 covers custom properties and
a text comparison covers the moved rules.

Generation mechanics are a plan-time decision (a script needs TypeScript
support; `hyperframesBrand.test.ts` already rewrites its output when run with
an update flag). The requirements are fixed here: the output is committed,
`predev` regenerates so dev never serves stale tokens, `prebuild` does not, and
CI fails on drift.

## 6. Proof of "no visual change"

1. **Snapshot before touching anything.** Parse every custom property and its
   declaration in `:root`, the dark block and every family scope from the
   current CSS into a checked-in fixture.
2. **Equality after.** A test parses the new generated CSS the same way and
   requires exact equality with the fixture. A diff fails; the fixture is never
   updated to match. Values that are `var()` or `color-mix()` chains compare as
   declaration text; palette-derived hex compares byte for byte.
3. **Moved rules** are compared as text against the pre-move `globals.css`
   ranges.
4. **Browser check** (CLAUDE.md §2) in both themes on one route per area:
   landing, a lesson, a problem page, the course hub. Green tests alone are not
   the evidence.
5. **Prove it can fail.** Flip one hex digit in a token, watch the snapshot
   test fail, restore.
6. Run `tsc`, `eslint`, `npm test` and `npm run build`, and report their output.

## 7. Guards after Stage 1

- Drift: regenerating must reproduce the committed file exactly.
- `palette`, `paperGrain`, `grainContrast`, `brandLamp`, `hyperframesBrand` and
  `design-tokens` tests run against the generated output and keep their
  assertions.
- Generated PNG and ICO bytes are not compared across machines;
  `brandLamp.test.tsx` keeps guarding their colours.
- Imports of `palette.ts` and the other moved modules are updated in one
  codemod. No re-export shims: a shim is scaffolding with no end condition
  (CLAUDE.md §1).

## 8. Owner decisions recorded (leans accepted 2026-09-21)

These change values, so they are **not** part of the no-change proof; each is
its own change after Stage 1's equality test is green.

1. **Micro type scale.** About ten arbitrary sizes are in use: `text-[10px]`
   (60 uses), `[11px]` (49), `[0.7rem]` (19), `[0.65rem]` (14), and `[0.72rem]`,
   `[0.75rem]`, `[0.68rem]`, `[0.8rem]`, `[9px]`, `[8px]`. Fold them into three
   named tokens. Text shifts by a pixel or two; before and after screenshots
   approve it.
2. **Motion and layer scales are owned by the token source.** The existing
   duration and easing tokens move into it, the literals above are replaced by
   them (or by new named tokens where no existing value fits, such as the 60s
   sway and the lamp curve), and z-index gets a named scale so the
   `z-30`/`z-40`/`z-45` mix moves onto it.
3. **Bare `rounded`.** Tailwind's `rounded` is 0.25rem, 4px at the default root
   size, the same as `--radius-xs: 4px`, so the 174 uses map to it without a
   visible change (they differ only if a user changes the root font size).

## 9. Rollout and risks

- **Land the current work first.** The branch carries 79 uncommitted paths, and
  Stage 1 edits five of them: `globals.css`, `palette.ts`, `familyTheme.ts`,
  `design-tokens.test.ts`, `paperGrain.test.ts`. A clean checkout of `main`
  would drop that work, and the snapshot must capture landed values. It is the
  owner's call how the work lands. Stage 1 does not start until it has.
- Three PRs: (1) generator, fixture and equality test; (2) consumers move onto
  it; (3) component styles move into `design-system/styles/`.
- After regenerating with the dev server stopped, Turbopack can serve stale
  CSS: clear `web/.next/dev` and curl the served chunk.

## 10. Stage 2 outline (not designed here)

Primitives chosen by measured repetition, in order: **Card** (21 files use the
shell, 28 apply `shadow-elevation`, 12 add `hover:border-accent`), **Chip**
(10, plus `TONE_CHIP`), **Button** (37 hand-written `<button>` files), **Field**
(8), **Segmented** (4), **Dialog** (7 dialog roles, 4 portals). Menu (one call
site), a Heading primitive (no count) and `Callout` (already one component) are
excluded until evidence says otherwise.

Each primitive ships as: build with tests, migrate every call site, add a guard
test with an allowlist that must be empty by the end of that migration and is
then deleted. Full design, including visible-change approvals, comes after
Stage 1.
