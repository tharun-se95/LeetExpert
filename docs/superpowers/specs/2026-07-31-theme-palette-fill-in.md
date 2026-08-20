# Theme structure — fill-in palette sheet

**Active palette:** **Blueprint — steel + cyan → monochrome base, family-driven primary** (applied 2026-08-20; Blueprint promoted 2026-08-20; base made monochrome 2026-08-20 — accent/pop/mark are steel, and each lesson's "primary" is its family accent)  
**Source of truth in code:** `web/src/app/globals.css` (base) + `web/src/lib/visual/familyTheme.ts` (family accents)  
**Sheet:** custom — steel (blue-charcoal) paper + calibrated cyan accent  

---

## How the system works

```
Tier 1  (--press-*)     raw inks / paper     ← ONLY these are redefined in .dark
        ↓
Tier 2  (--background, --accent, …)       semantic aliases components use
        ↓
@theme  (--color-*)    Tailwind utilities  (bg-background, text-accent, bg-pop, …)
```

Layer roles (`--elevated` / `--code` / `--surface`) are also set in `.dark` so
dark gets a designed lift ladder, not an invert of light greys.

---

## Blueprint — applied mapping

### Light

| Role | Hex / value | Our token(s) |
|------|-------------|----------------|
| Background (app chrome / page) | `#F1F4F9` | `--press-paper` / `--background` |
| Elevated (sidebar, lesson panel, cards, header) | `#FFFFFF` | `--elevated` |
| Code editor | `#E4E9F2` | `--code` |
| Surface / tests (recessed) | `#D8DDE8` | `--press-paper-sunk` / `--surface` |
| Border | `rgba(22, 32, 46, 0.09)` | `--press-rule` / `--border` |
| Text Primary | `#16202E` | `--press-ink` / `--foreground` |
| Text Muted | `#56606E` | `--press-ink-soft` / `--muted` |
| Accent / pop / mark (monochrome steel) | `#1E293B` | `--accent` + `--pop` + `--press-blue` (`--mark`) |
| Accent Hover | `#334155` | `--accent-hover` |
| Accent Active | `#0F172A` | `--accent-active` |
| Success (sheet fill) | `#16C47F` | text role → `#036F42` (`--good`) |
| Warning (sheet fill) | `#F5B301` | text role → `#92400E` (`--warn`) |
| Error (sheet fill) | `#EF4444` | text role → `#B91C1C` (`--bad`) |
| Insight (text ink) | `#854D0E` | `--insight` |
| Information | `#075985` | `--info` (alias of `--tone-sky`) |
| On-pop | `#FFFFFF` | `--on-pop` |

Brightness ladder (high → low): elevated → background → code → surface.
Light carries a **real, perceptible ladder** — white cards pop off a
cool-gray page, the editor and test wells step down. Measured adjacent
deltas: elevated/background 1.10, background/code 1.11, code/surface 1.12,
elevated/surface 1.36. Muted `#56606E` still clears 4.5:1 on the deepest
tier (4.67:1 on sunk), and every status ink is AA-safe on sunk — that is the
binding floor, because the sandbox paints verdict rows and insight values
directly on `--press-paper-sunk`.

### Dark

Dark surfaces are **neutral grey** — no blue cast (Blueprint's charcoal was
blue-tinted; the grey ladder below keeps the same steps).

| Role | Hex / value | Our token(s) |
|------|-------------|----------------|
| Background | `#121214` | `--press-paper` / `--background` |
| Elevated (sidebar / lesson / cards) | `#26262A` | `--elevated` |
| Code editor | `#19191D` | `--code` |
| Surface / tests | `#0C0C0D` | `--surface` / `--press-paper-sunk` |
| Border | `rgba(244, 244, 245, 0.09)` | `--border` |
| Text Primary | `#E6EDF4` | `--foreground` |
| Text Muted | `#9CA9B8` | `--muted` |
| Pop (CTA fill) | `#CBD5E1` | `--pop` / `--press-lime` |
| Accent / mark (light steel) | `#CBD5E1` | `--accent` / `--press-olive` / `--press-blue` (all steel — never a family colour) |
| Accent Hover | `#E2E8F0` | `--accent-hover` |
| Accent Active | `#CBD5E1` | `--accent-active` |
| Success | `#22D497` | `--good` |
| Warning | `#F59E0B` | `--warn` |
| Error | `#EF4444` | `--bad` |
| Insight (text ink) | `#FACC15` | `--insight` |
| Information | `#38BDF8` | `--info` (alias of `--tone-sky`) |

Dark is the theme where the layer ladder is real. Same relative order as
light, never an inversion: elevated (cards) brightest → code → background →
surface deepest. Measured adjacent deltas: surface/paper 1.05, paper/code
1.07, code/elevated 1.16, elevated/paper 1.24 — visible flat steps, no
shadows. Muted `#9CA9B8` clears ≥8:1 on every surface.

---

## Code editor palette (one source)

Shiki (server, code blocks + viz panes) and CodeMirror (client, sandbox)
paint from the same values — `CODE_LIGHT` / `CODE_DARK` in
`web/src/lib/content/codePalette.ts` mirror the `--tok-*` blocks in
globals.css. Every token clears AA 4.5:1 on `--code`.

| Role | Light | Dark |
|------|-------|------|
| Keyword | `#1D4ED8` | `#60A5FA` |
| String / tag | `#065F46` | `#6EE7B7` |
| Constant | `#92400E` | `#FBBF24` |
| Entity (function) | `#6D28D9` | `#22D3EE` |
| Type | `#155E75` | `#C084FC` |
| Comment | `#59636F` | `#9CA9B8` |
| Variable / name / fg | `#16202E` | `#E6EDF4` |

Each token type is a distinct hue (blue/green/amber/violet/steel) so code
stays scannable; in dark the six tokens are six separable hues on a deep
editor well.

---

## Topic primary (family)

The base palette is monochrome; the "primary" colour of any given page is
its **pattern family**, applied as a CSS-variable scope by
`familyCssVars(familyId)` (see `2026-08-01-viz-family-theming-design.md`).
The scope re-maps `--accent`, `--accent-hover`, `--accent-active`, `--pop`,
`--on-pop`, and `--highlight` to the family; `--mark` is **never** remapped
(it stays steel, the AA-safe body ink). `--mark` is also the wordmark's ink,
so the brand stays steel on every topic.

**The scope is lifted to the AppShell** (`display: contents` wrapper in
`AppShell.tsx`): the route's module family tints the header, sidebar, and
mobile sheet too — active module/lesson chips (`bg-pop`), the progress bar,
hover states, and the mobile sheet's edge bar all carry the topic colour.
The page-level scopes (LessonView, module hub, ProblemWorkspace, Diagram,
VizPlayer) repeat the same values so each surface is self-contained.

**Surface scopes per module:**
- Curriculum map (`/course`): each module card applies its own family scope
  — glyph, wash band (`bg-accent/[0.08]`), and hover all read that module's
  colour, plus a family-dot chip in the card header (dot `bg-accent`, label
  `text-muted` — the dot carries colour, the label stays AA).
- Practice list (`/problems`): each module group section applies its own
  family scope and shows the family label in the section header.
- Lesson chapters: `.handbook-prose h2` carries a short family-accent rule
  (`::before`) above the heading — heading text stays ink; the rule is the
  only per-chapter colour and resolves to steel outside a scope.

**One place to update the colors.** Family colors are authored as a single
`accent` hex per family in `web/src/lib/visual/familyTheme.ts`. `accentUi`
is derived by `uiAccent()` — the smallest darkening that clears 3:1 on both
papers (light `#F1F4F9`, dark `#121214`) — and hover/active/wash/highlight
all derive from `accentUi`. Recolor a family = change one hex.

| Family | Accent (viz / motif) | `accentUi` (UI primary, derived) | `onAccent` |
|--------|----------------------|----------------------------------|-----------|
| linear-traversal | `#0A7A6A` | `#0A7A6A` | `#FFFFFF` |
| pointer-movement | `#C45C26` | `#C45C26` | `#FFFFFF` |
| ordering-search | `#2F6FED` | `#2F6FED` | `#FFFFFF` |
| recursive-exploration | `#6B4CE6` | `#6B4CE6` | `#FFFFFF` |
| priority-structures | `#E11D48` | `#E11D48` | `#FFFFFF` |
| relationships | `#1F9D8A` | `#1F9D8A` | `#111827` |
| state-transition | `#C9A227` | `#AB8921` | `#111827` |

`accentUi` clears only the 3:1 non-text floor against both papers (gold is
the one family that needed darkening: pure `#C9A227` is ~2.2:1 on light
paper; the derived `#AB8921` is 3.01:1 / 5.56:1). `onAccent` is white
(3:1 floor) or `#111827` (4.5:1 floor for the two light fills). `--mark`
stays steel in every scope, so body-size accent text is always AA.

## Notes

- Base accent/pop/mark are monochrome steel: light `#1E293B` (≈13.8:1 on
  paper; white-on-steel ≈15.2:1), dark `#CBD5E1` — every pair clears AA
  comfortably, so there is no "large/UI-only" caveat at the base. Inside a
  family scope, accent becomes the saturated family `accentUi` — those
  clears only the 3:1 non-text floor, so **body-size accent text uses
  `--mark` (never `--accent`)** and links use `text-mark`.
- The base has no colour by design: the seven family accents
  (teal / orange / blue / violet / gold / teal-green / rose) carry all
  colour, and stay distinct from the status palette so a family can never
  read as warn/error or as "information".
- Radius scale `4 / 8 / 12 / 20 / 28` = `--radius-xs / sm / md / lg / xl`, defined
  identically in `:root` and `@theme inline`. Components call them as
  `rounded-[length:var(--radius-*)]` — one of xs / sm / md / lg / xl — never the
  bare `rounded-sm/md/lg/xl` shorthand. Tier map: xs inline tags/chips/status
  dots; sm inline code / kbd / all code surfaces; md controls/rows/cells/
  callouts; lg dialogs/section cards/panels; xl display frames (landing mocks,
  lab theater stage). `rounded-full` allowed for pills/avatars/progress only.
  Enforced by `web/tests/design-tokens.test.ts`.
- Borders are near-invisible in light — separation there comes from the soft
  rule and the real tonal ladder (measured above). Both themes now carry a
  perceptible flat ladder with the same relative order, never an inversion.
- Sheet Success/Warning/Error are too bright for body text on light paper; light theme uses darkened AA text inks in the same hue families (`#036F42` / `#92400E` / `#B91C1C`).
- Depth stays flat (print language): ink, soft rules, and halftone — never drop shadows.
- The palette is custom (steel + cyan), not from the codeMacha sheet. To
  re-theme later, provide the sheet hexes the same way and re-measure every
  ratio — the design-tokens suite enforces the floors.
