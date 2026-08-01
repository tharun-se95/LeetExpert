# Problem statement visual rhythm

**Status:** implemented (system + 3 gold exemplars)  
**Date:** 2026-07-31

## Goal

Problem Description tabs should read like modern docs: callouts, structured
examples, highlighted keywords — not a flat Problem → paragraph → Examples
wall.

## System tools

| Tool | Authoring | Render |
| --- | --- | --- |
| Examples cards | ` ```examples ` or ` ```text ` with `→` lines | `ExamplesBlock` |
| Goal / tip / note / constraint | ` ```goal ` / `tip` / `note` / `constraint ` | `Callout` tones |
| Keyword swipe | `==phrase==` (existing) | `<mark>` |
| Inline code | `` `ident` `` | accent-tinted pill |

## Gold exemplars

- `course/strings/valid-palindrome.md`
- `course/arrays/remove-duplicates-sorted.md`
- `course/hash-tables/two-sum.md`

## Follow-up

Bulk-pass remaining problem Descriptions to `examples` + `constraint` /
`goal` fences (mechanical; same renderer).
