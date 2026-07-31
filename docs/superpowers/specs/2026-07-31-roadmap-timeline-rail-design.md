# Roadmap lesson — vertical timeline rail

**Date:** 2026-07-31  
**Status:** implemented  
**Scope:** `course/getting-started/course-roadmap.md` + markdown fence plumbing.  
**Out of scope:** Course overview module cards, home curriculum section, scroll-spy highlighting of the active stage node.

## Problem

"The Roadmap" teaches five stages in dependency order, but the page is a
flat stack of headings and paragraphs. A reader scanning for structure gets
prose only — no visual sense of sequence or progression, despite the lesson
title and the "in dependency order" framing.

## Decision

**Approach B + fence 1:** Keep the existing stage prose. Wrap Stage 0–4 in
an explicit `roadmap` markdown fence. Render that fence as a vertical
roadmap rail (timeline-like) to the left of the unchanged stage content.

Rejected:

- Auto-detecting `### Stage N` (fragile; affects any matching heading).
- Lesson-slug special-casing in the renderer (one-off magic).
- Replacing prose with a data-driven card component (Approach A — heavier
  content move; not what we chose).

## Content shape

In `course-roadmap.md`, under "## Five stages, in dependency order", wrap
the five `### Stage …` blocks (heading + italic module list + body) in:

````markdown
```roadmap
### Stage 0 — Foundations
…
### Stage 4 — Global reasoning
…
```
````

Leave the intro paragraph, "## How to move through it", the quiz, and the
closing line **outside** the fence.

No JSON inside the fence — body is ordinary markdown, same nesting pattern
as `reveal` / `aside`.

## Rendering

### Fence hook

`Markdown.tsx` treats `language-roadmap` like `reveal`: pass the fence body
into a `Roadmap` component.

### `Roadmap` component

`web/src/components/md/Roadmap.tsx` (client or server — no interactivity
required for v1; prefer server if nested `Markdown` allows it; otherwise
match `Reveal` and stay client).

1. Split the fence body on `(?=^### Stage )` (multiline) into ordered stage
   chunks. Each chunk must start with `### Stage N — …`. If a chunk does
   not match, render an error card (do not silently flatten).
2. Render an ordered list. Each item is a two-column row:
   - **Rail column (~1.25–1.5rem):** numbered node (0–4) + vertical
     connector. Connector is a single continuous rule behind the nodes
     (absolute full-height line on the list), not per-item dashed segments
     that break at gaps.
   - **Content column:** nested `<Markdown source={chunk} … />` with the
     same `highlightedBlocks` / `highlightedTabs` props as `Reveal`.
3. Last item: connector stops at the last node (no dangling line below).

### Visual language

- Flat handbook: tokens only (`--accent`, `--border`, `--muted`,
  `--background` / `--surface`). No shadows, no blur, no hardcoded
  Tailwind palette colours.
- Nodes: filled accent disc with `on-pop` (or high-contrast) numeral;
  WCAG AA for the digit against the fill in both themes.
- Connector: thin `border` or muted accent line, optically centered on the
  nodes.
- Spacing: rail aligns with the stage `h3` baseline/centre, not floating
  mid-paragraph.
- Mobile: same left rail; do not collapse to a horizontal strip.

### Accessibility

- List is a real `<ol>` (or role-equivalent) so order is announced.
- Nodes are decorative relative to the heading text — `aria-hidden` on the
  numeral discs if the heading already states "Stage N"; avoid double
  announcement.
- Prefer-reduced-motion: no motion in v1.

## TOC / heading ids

`extractToc` in `web/src/lib/course/load.ts` skips **all** fenced content
today. Wrapping stages in `roadmap` would drop Stage 0–4 from "On this
page" unless we change that.

**Required:** when a fence language is `roadmap`, still extract `##` /
`###` headings from inside that fence (same slugify rules as today). Other
fences (`quiz`, `diagram`, `reveal`, …) stay skipped.

Nested `Markdown` + `rehype-slug` must produce the same ids as
`extractToc` / `slugify` for those headings so TOC links scroll correctly.

## Tests

- Unit: `extractToc` includes Stage headings when they sit inside a
  `roadmap` fence; still excludes headings inside `quiz` / `reveal`.
- Unit or content: `course-roadmap.md` contains exactly one `roadmap`
  fence; fence body has five `### Stage N` headings in order 0–4.
- Smoke: typecheck; visual check light + dark on the lesson page.

## Non-goals (v1)

- Scroll-linked "active" node fill.
- Clickable rail jumping to stages (TOC already does that).
- Module glyphs inside the rail.
- Reuse on other lessons unless a second author opts into the fence.
