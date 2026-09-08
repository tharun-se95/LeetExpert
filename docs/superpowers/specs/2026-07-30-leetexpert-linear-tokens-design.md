# codeMacha Linear tokens + type (scope A)

**Date:** 2026-07-30  
**Status:** approved — implement colors + typography only  
**Out of scope:** icon stroke pass, illustration style audit

## Goal

Align the app chrome with the Linear/Notion educational palette and readable type stack, without changing icon libraries or viz art.

## Light tokens

| Role | Semantic | Hex | Notes |
|------|----------|-----|--------|
| Page | `--background` | `#FFFFFF` | Sheet “Background White” |
| Sunk | `--surface` / `--code` | `#F8FAFC` | Sheet “Light” |
| Ink | `--foreground` | `#111827` | Sheet “Deep Navy” · 17.74:1 on white |
| Muted | `--muted` | `#4B5563` | 7.56:1 on white |
| Border | `--border` | `#E5E7EB` | Sheet “Border” |
| Accent / pop | `--accent` / `--pop` | `#5B5CEB` | Sheet “Indigo” · 5.03:1 as text; white-on-fill 5.03:1 |
| On pop | `--on-pop` | `#FFFFFF` | |
| Mark | `--mark` | `#4338CA` | Darker indigo; distinct from accent |
| Good / warn / bad | text inks | `#047857` / `#B45309` / `#DC2626` | Sheet Success/Warning/Error (`#10B981` / `#F59E0B` / `#EF4444`) are too light for body text on white; AA text variants used; sheet hexes recorded in CSS comments |

## Dark tokens

| Role | Hex | Notes |
|------|-----|--------|
| Page | `#0B1220` | Sheet dark background |
| Surface | `#111827` | Deep navy lift |
| Ink | `#F8FAFC` | |
| Muted | `#9CA3AF` | AA on dark ground |
| Border | `#1F2A3D` | Visible rule without glare |
| Pop | `#5B5CEB` + white `--on-pop` | Same brand fill as light (no pastel inversion) |
| Accent text | `#A5B4FC` | Lifted for AA on `#0B1220` |
| Mark | `#818CF8` | |
| Status | `#34D399` / `#FBBF24` / `#F87171` | Lifted for dark ground |

## Typography

| Role | Face |
|------|------|
| Logo / headings (`--font-display`) | **Sora** |
| Body (`--font-sans`) | **Inter** |
| Code (`--font-mono`) | **JetBrains Mono** (unchanged) |

Rationale: educational readability over display novelty. Sora chosen over Space Grotesk (sheet listed both; headings specified Sora SemiBold).

## Also update

- `codePalette.ts` + `--tok-*` mirrors → indigo keyword, navy/white fg
- Favicon brand fill → `#5B5CEB`

## Non-goals

- Phosphor → Lucide / 2px outline pass
- Rewriting viz or landing illustrations
- Product copy changes
