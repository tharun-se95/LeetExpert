# Lesson code-block syntax highlighting — design

**Status:** approved, ready for implementation
**Scope:** `web/` only. Static syntax highlighting for code fences inside lesson
markdown. Does **not** cover the interactive coding-problem editor (Monaco +
execution) — that is a separate, not-yet-started design.

## Problem

Lesson markdown (`.md` files loaded via `loadLesson`) is parsed and rendered
client-side by `src/components/md/Markdown.tsx` (`react-markdown`, marked
`"use client"`). Its `pre` handler already special-cases custom fence
languages (`mermaid`, `quiz`, `tabs`, `complexity`, `reveal`) but falls
through to a plain, unstyled `<pre>` for real code (`python`, `typescript`,
etc.) — no syntax coloring.

A second consumer, `src/components/course/CodeTabs.tsx` (handles the
`` ```tabs `` fence — e.g. showing the same solution in Python/TS/Java), also
renders plain unhighlighted `<pre><code>`. It currently regex-parses the raw
fence source client-side to split it into per-language tabs.

Neither call site does any highlighting today.

## Goals

- Real syntax coloring for fenced code blocks in lesson content, matching
  the site's existing light/dark theme system.
- Same treatment for `CodeTabs`, so all lesson-code surfaces look consistent.
- Small header bar per code block: language label + copy-to-clipboard button
  (reusing the copy pattern already in `Callout.tsx`). No AI/theme/collapse/
  line-number toolbar (that fuller "editor chrome" was explicitly scoped out).
- Zero added client-side JS cost for highlighting, since the site is fully
  statically generated (`generateStaticParams` on every course route).

## Non-goals

- The interactive coding-problem editor (Monaco, code execution, grading) —
  separate design, separate spec.
- Inline (single-backtick) code highlighting — stays plain monospace.
- Line numbers, line highlighting/diff markers, or a collapse/expand toggle.
- A test suite — `web/` has none today; verification here is manual (see
  Testing).

## Architecture

Highlighting happens **once, at build time**, inside `loadLesson`
(`src/lib/course/load.ts`) — not in the browser, and not per-request (the
site is statically generated, so this cost is paid once at `next build`).

1. **`src/lib/content/highlight.ts`** (new, server-only): thin wrapper around
   Shiki. Creates a single highlighter instance at module scope (via Shiki's
   singleton/`createHighlighter` API) covering the supported languages and
   both themes, so grammars/themes load once for the whole build, not once
   per lesson or per code block. Exposes one function,
   `highlightCode(code: string, lang: string): string | null` returning
   Shiki's HTML output, or `null` if the language isn't supported / Shiki
   throws (see Error handling).

2. **`loadLesson`** gains a markdown pre-processing pass, run after
   `gray-matter` parses front matter and before the markdown string is
   handed to `LessonView`/`Markdown`:
   - For every fenced block whose language is a real code language (i.e.
     *not* `mermaid` / `quiz` / `tabs` / `complexity` / `reveal` / `text` /
     unfenced), call `highlightCode` and replace the fence with a marker
     node carrying the resulting HTML and the language (for the header
     label).
   - For `` ```tabs `` blocks specifically: extract each inner `` ```lang ``
     fence (same parsing `CodeTabs.tsx` does today, just moved server-side),
     call `highlightCode` per tab, and attach the resulting
     `{ label, language, html }[]` array to that block instead of leaving it
     as raw text for client-side parsing.
   - Blocks where `highlightCode` returned `null` (unsupported language, or
     a Shiki error) are left as plain fences — `Markdown.tsx`'s existing
     plain-`<pre>` fallback path handles those unchanged.

3. **`Markdown.tsx`** `pre` handler: add a branch, checked before the
   existing fallback, that detects the pre-highlighted marker and renders it
   through the new `CodeBlock` component via `dangerouslySetInnerHTML` for
   the highlighted body. This is safe because the injected HTML is Shiki's
   own output generated server-side from lesson content already in the
   repo, not user input.

4. **`src/components/md/CodeBlock.tsx`** (new, client component — needs the
   copy button's `useState`/clipboard access): header bar (language label
   left, copy button right, reusing `Callout.tsx`'s copy-to-clipboard
   pattern) + a body that renders the highlighted HTML (`dangerouslySetInnerHTML`)
   when given one, or falls back to a plain `<pre>{code}</pre>` when `html`
   is `null`. Takes `{ language: string; code: string; html: string | null }`.
   Shared by both the `Markdown.tsx` `pre` branch and `CodeTabs`, so both
   surfaces look identical and there's one place to change the chrome later.
   The surrounding background/border come from the existing `bg-code`/
   `border-code` theme tokens (a wrapper div), not from Shiki's own
   background, keeping it visually consistent with `Callout` and other
   card-styled elements.

5. **`CodeTabs.tsx`** prop shape changes from `{ source: string }` (raw
   fence text, parsed client-side via regex) to
   `{ tabs: { label: string; language: string; code: string; html: string | null }[] }`
   (pre-split, pre-highlighted server-side). `html` is `null` when
   `highlightCode` couldn't highlight that specific tab (same per-block
   fallback as the top-level case — see Error handling); `CodeBlock` renders
   the raw `code` text in that case instead of injecting HTML. The component
   keeps its existing tab-switch state and button row; it renders
   `CodeBlock` for the active tab instead of a raw `<pre><code>`. The
   `language-tabs` branch in `Markdown.tsx` passes the precomputed array
   instead of raw fence text.

## Language & theme support

- **Languages:** `typescript`, `tsx`, `javascript`, `jsx`, `python`, `json`,
  `bash` — covers everything currently used in lesson content
  (`typescript`, `python`, `text`) plus common extras at negligible extra
  cost in Shiki's fine-grained bundle. `text` is treated as "no highlight,"
  same as an unsupported language.
- **Themes:** two Shiki themes — a light one and a dark one, chosen to sit
  close to the existing `--code` background tokens (`#f4f4f5` light /
  `#171717` dark) rather than using Shiki's own background color. Shiki's
  multi-theme `codeToHtml` output (`themes: { light, dark }`) generates both
  variants in one pass as CSS variables; the existing `next-themes`
  dark-mode class on `<html>` switches which variable set is visible via
  CSS. No re-highlighting on theme toggle, no client JS involved.
- The code block's background/border still come from `bg-code`/
  `border-code` (via `CodeBlock`'s wrapper), not from the Shiki theme's own
  background.

## Error handling

- If `highlightCode` doesn't recognize the language, or Shiki throws (e.g. a
  typo like `` ```typescrpt ``), the pre-processing pass in `loadLesson`
  catches it **per block** and leaves that one fence as plain text — it does
  not fail the whole build. Because this runs at build time, any fallback is
  immediately visible locally or in CI, never silently shipped to
  production.
- `light`/`dark` theme keys are static Shiki theme names bundled with the
  highlighter, not user input — no fallback needed for those.

## Testing

No test suite exists in `web/` to extend. Verification is manual:

- View a lesson with a real code fence (e.g. a Module 6 hash-table lesson
  using `python`) and confirm highlighting renders with the header/copy
  button.
- View a lesson with a `` ```tabs `` block and confirm each tab is
  highlighted and the copy button works per active tab.
- Toggle light/dark mode and confirm both Shiki theme variants render
  correctly without a re-highlight flash.
- Intentionally misspell a language in a scratch fence, confirm it falls
  back to plain `<pre>` instead of breaking `next build`.
