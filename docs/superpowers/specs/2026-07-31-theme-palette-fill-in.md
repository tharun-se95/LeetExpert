# Theme structure — fill-in palette sheet

**Active palette:** **A — Indigo Modern** (applied 2026-07-31; Primary deepened + layered surfaces 2026-07-31; radius scale + perceptible ladders in both themes, AA-darkened status inks, code one-source 2026-08-20)  
**Source of truth in code:** `web/src/app/globals.css`  
**Sheet:** codeMacha COLOR PALETTE OPTIONS  

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

## Indigo Modern — applied mapping

### Light

| Role | Hex / value | Our token(s) |
|------|-------------|----------------|
| Background (app chrome / page) | `#F2F4F8` | `--press-paper` / `--background` |
| Elevated (sidebar, lesson panel, cards, header) | `#FFFFFF` | `--elevated` |
| Code editor | `#EAEEF4` | `--code` |
| Surface / tests (recessed) | `#E0E5EE` | `--press-paper-sunk` / `--surface` |
| Border | `rgba(17, 24, 39, 0.08)` | `--press-rule` / `--border` |
| Text Primary | `#111827` | `--press-ink` / `--foreground` |
| Text Muted | `#5C6573` | `--press-ink-soft` / `--muted` |
| Primary | `#6366F1` | `--accent` + `--pop` |
| Primary Hover | `#818CF8` | `--accent-hover` |
| Primary Active / mark | `#4F46E5` | `--accent-active` / `--press-blue` |
| Success (sheet fill) | `#16C47F` | text role → `#047857` (`--good`) |
| Warning (sheet fill) | `#F5B301` | text role → `#92400E` (`--warn`) |
| Error (sheet fill) | `#EF4444` | text role → `#B91C1C` (`--bad`) |
| Insight (text ink) | `#854D0E` | `--insight` |
| Information | `#0369A1` | `--info` (alias of `--tone-sky`) |
| On-pop | `#FFFFFF` | `--on-pop` |

Brightness ladder (high → low): elevated → background → code → surface.
Light carries a **real, perceptible ladder** — white cards pop off a
cool-gray page, the editor and test wells step down. Measured adjacent
deltas: elevated/background 1.10, background/code 1.06, code/surface 1.09,
elevated/surface 1.26. Muted `#5C6573` still clears 4.5:1 on the deepest
tier (4.66:1 on sunk), and every status ink is AA-safe on sunk — that is the
binding floor, because the sandbox paints verdict rows and insight values
directly on `--press-paper-sunk`.

### Dark

| Role | Hex / value | Our token(s) |
|------|-------------|----------------|
| Background | `#12151C` | `--press-paper` / `--background` |
| Elevated (sidebar / lesson / cards) | `#232937` | `--elevated` |
| Code editor | `#181C25` | `--code` |
| Surface / tests | `#0C0F15` | `--surface` / `--press-paper-sunk` |
| Border | `rgba(249, 250, 252, 0.08)` | `--border` |
| Text Primary | `#F9FAFC` | `--foreground` |
| Text Muted | `#A1A1AA` | `--muted` |
| Primary (CTA fill) | `#6366F1` | `--pop` / `--accent-active` / `--press-lime` |
| Accent (readable on charcoal) | `#818CF8` | `--accent` / `--press-olive` |
| Success | `#22D497` | `--good` |
| Warning | `#F59E0B` | `--warn` |
| Error | `#EF4444` | `--bad` |
| Insight (text ink) | `#FACC15` | `--insight` |
| Information | `#38BDF8` | `--info` (alias of `--tone-sky`) |

Dark is the theme where the layer ladder is real. Same relative order as
light, never an inversion: elevated (cards) brightest → code → background →
surface deepest. Measured adjacent deltas: surface/paper 1.05, paper/code
1.07, code/elevated 1.17, elevated/paper 1.26 — visible flat steps, no
shadows. Muted `#A1A1AA` clears ≥5.5:1 on every surface.

---

## Notes

- Primary on paper ~**4.06:1** (large/UI only — below 4.5:1 normal-text AA).
  White on Primary ~**4.47:1** (bold/large CTA labels only). Body-size accent
  text uses `--mark` (`#4F46E5`, 4.97:1 on sunk) — never `--accent`.
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
- Sheet Success/Warning/Error are too bright for body text on light paper; light theme uses darkened AA text inks in the same hue families (`#047857` / `#92400E` / `#B91C1C`).
- Depth stays flat (print language): ink, soft rules, and halftone — never drop shadows.
- To switch to palette B–E later, provide the sheet hexes the same way.
