# Theme structure — fill-in palette sheet

**Active palette:** **A — Indigo Modern** (applied 2026-07-31)  
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

---

## Indigo Modern — applied mapping

### Light

| Sheet | Hex | Our token(s) |
|-------|-----|----------------|
| Background | `#FCFCFD` | `--riso-paper` / `--background` |
| (cards) | indigo-wash white | `--riso-paper-sunk` / `--surface` / `--elevated` — `color-mix(indigo 3.5%, #fff)` so flat faces separate from paper without shadows |
| Border | `#D1D5DB` | `--riso-rule` / `--border` (stronger than sheet `#E5E7EB`) |
| Text Primary | `#111827` | `--riso-ink` / `--foreground` |
| Text Muted | `#6B7280` | `--riso-ink-soft` / `--muted` |
| Border | `#E5E7EB` | `--riso-rule` / `--border` |
| Primary | `#6366F1` | `--accent` + `--pop` |
| Primary Hover | `#818CF8` | `--accent-hover` |
| Success (sheet fill) | `#16C47F` | text role → `#047857` (`--good`) |
| Warning (sheet fill) | `#F5B301` | text role → `#B45309` (`--warn`) |
| Error (sheet fill) | `#EF4444` | text role → `#DC2626` (`--bad`) |
| On-pop | `#FFFFFF` | `--on-pop` |

### Dark

| Sheet | Hex | Our token(s) |
|-------|-----|----------------|
| Background | `#0F1117` | `--riso-paper` / `--background` |
| Surface | `#1A1E28` | `--surface` / `--riso-paper-sunk` (lifted vs sheet `#181B23`) |
| Elevated | `#222733` | `--elevated` — card faces |
| Text Primary | `#F9FAFC` | `--foreground` |
| Text Muted | `#A1A1AA` | `--muted` |
| Border | `#343B4A` | `--border` (stronger than sheet `#2A2F3A`) |
| Primary | `#6366F1` | `--pop` / `--accent-active` |
| Primary Hover | `#818CF8` | `--accent` (readable on charcoal) |
| Success | `#22D497` | `--good` |
| Warning | `#F59E0B` | `--warn` |
| Error | `#EF4444` | `--bad` |

---

## Notes

- Primary on paper ~**4.36:1** (large/UI). White on Primary ~**4.47:1**.
- Sheet Success/Warning/Error are too bright for body text on light paper; light theme uses darkened AA text inks in the same hue families.
- To switch to palette B–E later, provide the sheet hexes the same way.
