# Theme structure — fill-in palette sheet

**Active palette:** **A — Indigo Modern** (applied 2026-07-31; Primary deepened + layered surfaces 2026-07-31)  
**Source of truth in code:** `web/src/app/globals.css`  
**Sheet:** codeMacha COLOR PALETTE OPTIONS  

---

## How the system works

```
Tier 1  (--riso-*)     raw inks / paper     ← ONLY these are redefined in .dark
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
| Background (app chrome / page) | `#FCFCFD` | `--riso-paper` / `--background` |
| Elevated (sidebar, lesson panel, cards, header) | `#FFFFFF` | `--elevated` |
| Code editor | `#FAFAFB` | `--code` |
| Surface / tests (recessed) | `#F7F8FA` | `--riso-paper-sunk` / `--surface` |
| Border | `rgba(17, 24, 39, 0.08)` | `--riso-rule` / `--border` |
| Text Primary | `#111827` | `--riso-ink` / `--foreground` |
| Text Muted | `#6B7280` | `--riso-ink-soft` / `--muted` |
| Primary | `#6366F1` | `--accent` + `--pop` |
| Primary Hover | `#818CF8` | `--accent-hover` |
| Primary Active / mark | `#4F46E5` | `--accent-active` / `--riso-blue` |
| Success (sheet fill) | `#16C47F` | text role → `#047857` (`--good`) |
| Warning (sheet fill) | `#F5B301` | text role → `#B45309` (`--warn`) |
| Error (sheet fill) | `#EF4444` | text role → `#DC2626` (`--bad`) |
| Insight (text ink) | `#854D0E` | `--insight` |
| Information | `#0284C7` | `--info` (alias of `--tone-sky`) |
| On-pop | `#FFFFFF` | `--on-pop` |

Brightness ladder (high → low): elevated → background → code → surface.

### Dark

| Role | Hex / value | Our token(s) |
|------|-------------|----------------|
| Background | `#0F1117` | `--riso-paper` / `--background` |
| Elevated (sidebar / lesson / cards) | `#1A1E28` | `--elevated` |
| Code editor | `#161B24` | `--code` |
| Surface / tests | `#13161E` | `--surface` / `--riso-paper-sunk` |
| Border | `rgba(249, 250, 252, 0.08)` | `--border` |
| Text Primary | `#F9FAFC` | `--foreground` |
| Text Muted | `#A1A1AA` | `--muted` |
| Primary (CTA fill) | `#6366F1` | `--pop` / `--accent-active` / `--riso-lime` |
| Accent (readable on charcoal) | `#818CF8` | `--accent` / `--riso-olive` |
| Success | `#22D497` | `--good` |
| Warning | `#F59E0B` | `--warn` |
| Error | `#EF4444` | `--bad` |
| Insight (text ink) | `#FACC15` | `--insight` |
| Information | `#38BDF8` | `--info` (alias of `--tone-sky`) |

---

## Notes

- Primary on paper ~**4.35:1** (large/UI only — below 4.5:1 normal-text AA).
  White on Primary ~**4.47:1** (bold/large CTA labels only).
- Borders are intentionally near-invisible — structure comes from the tonal layers.
- Sheet Success/Warning/Error are too bright for body text on light paper; light theme uses darkened AA text inks in the same hue families.
- Depth stays flat (print language): ink, soft rules, and halftone — never drop shadows.
- To switch to palette B–E later, provide the sheet hexes the same way.
