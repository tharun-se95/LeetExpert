# Mermaid brand theme (scope: themeVariables + chrome)

**Date:** 2026-07-31  
**Status:** approved — implement  
**Approach:** Brand theme only (no markdown rewrites, no custom diagram components)

## Goal

Course Mermaid flowcharts read as handbook figures aligned with codeMacha Brand DS v1.0, not default zinc Mermaid.

## Theme mapping

Mermaid requires resolved hex (no CSS vars / alpha borders).

| Role | Light | Dark |
|------|-------|------|
| Node fill | `#FFFFFF` | `#202533` |
| Node text | `#111827` | `#FFFFFF` |
| Node / cluster border | `#ECEEF3` cluster; nodes `#6E63FF` accent hairline | `#2A2F3A` cluster; nodes `#6E63FF` |
| Edge / arrow | `#4B5563` | `#B8BCC8` |
| Cluster fill | `#F4F5F8` | `#181B23` |
| Title / tertiary accent | `#6E63FF` | `#6E63FF` |

- Font: Inter (`var(--font-sans)` cascade)
- Font size: ~14–15px via themeVariables
- Accent is not used as node fill (AA for dense labels)

## Chrome

- Single surface card: hairline border, `radius-md`, roomier padding
- Expand control: quiet icon-only on hover
- No second nested visual frame

## Out of scope

- Aggressive SVG post-processing CSS
- Custom React diagrams

## Content note

Mermaid subgraphs ignore parent `flowchart LR|TD` unless they set `direction` themselves. Lessons with subgraphs get an explicit `direction` so layout matches intent (e.g. contiguous-memory `direction LR`).

## Files

- `web/src/components/md/Mermaid.tsx` — `themeConfig` + wrapper classes
- `course/arrays/contiguous-memory.md` — subgraph `direction LR`
- `course/hash-tables/collision-resolution.md` — subgraph `direction TB`
