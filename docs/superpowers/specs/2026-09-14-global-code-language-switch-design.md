# Global code-language switch — design

**Date:** 2026-09-14
**Status:** approved in brainstorming, awaiting spec review
**Replaces:** the per-surface language tabs in lesson code blocks
(`CodeTabs`), viz tracer code panels (`CodePanel`) and the sandbox editor
(`Sandbox`).

---

## 1. Why

Every code surface carries its own Python / TypeScript or Python / JavaScript
tabs, each defaulting to Python. A learner who works in JavaScript re-picks
their language on every block, every tracer and every problem. The choice is
really a property of the learner, so it belongs in one place.

## 2. Decisions (owner, 2026-09-14)

| Question | Decision |
| --- | --- |
| What the switch offers | **Python** or **JS/TS**. JS/TS shows TypeScript in reading surfaces (lesson blocks, viz panels) and JavaScript in the sandbox, which runs JavaScript. No content or runner changes. |
| Where it lives | The header, right after **Practice** in the centred nav. |
| Phones (< 640px) | A compact single toggle in the header showing the current language mark. |
| How the choice reaches surfaces | A pre-paint attribute plus CSS for server-rendered code blocks; one shared store for interactive surfaces. Pages stay statically generated. |

Rejected, with reasons: a React context alone (every JS/TS reader sees Python
first, then a visible swap); a cookie read on the server (makes every lesson
page dynamic instead of static); TypeScript in the sandbox (a runner and
116-problem content project first); JavaScript in lessons (rewrites 278 blocks).

## 3. The preference

- Values: `"python"` | `"js"`. Default `"python"` — today's default everywhere.
- Persisted in `localStorage` under `dsa-code-lang`. Any other stored value,
  or storage that throws, resolves to `"python"`; the switch still works for
  the session in memory.
- **First paint.** A `next/script` with `strategy="beforeInteractive"` in the
  root layout copies the stored value onto `<html data-code-lang="…">` before
  hydration (the same moment next-themes sets the theme class; `<html>`
  already has `suppressHydrationWarning`). If the script never runs, no
  attribute is set and Python shows — every CSS rule keys off an explicit
  `js`, so "no attribute" and "python" render identically.
- **Store.** `src/lib/codeLang.ts` exports `useCodeLang(): [CodeLang, set]`,
  built on `useSyncExternalStore`: the snapshot reads the attribute, the server
  snapshot is `"python"`, `set` writes the attribute and storage and notifies
  subscribers, and a `storage` event listener keeps other tabs in step. Pure
  helpers (`parseCodeLang`, `sandboxLangFor`, `readingLangFor`) carry the
  mapping so it is tested once.

## 4. The header switch

- Component: `src/components/layout/CodeLangSwitch.tsx`, rendered by
  `Header.tsx` inside the "Product modes" nav after Practice.
- **≥ 640px:** a two-option segmented control, "Python | JS/TS", each option
  with its language mark. `role="radiogroup"` with an accessible name
  ("Code language"); options are `role="radio"` with `aria-checked`; arrow
  keys move and select; roving `tabIndex`; visible focus ring.
- **< 640px:** one 44px button showing the current mark. Tapping toggles.
  `aria-label` names the current language and the one it switches to.
- Shown wherever the Lessons / Practice nav shows (DSA pages and the landing
  page). Hidden on the Next.js course, which is TypeScript-only.

## 5. Surfaces

### 5.1 Lesson code blocks (`CodeTabs`, 278 `tabs` fences)

- No tab row. Both languages render server-side as panels carrying
  `data-code-lang-panel="python" | "js"`; CSS in `globals.css` shows only the
  chosen one:
  - `html[data-code-lang="js"] [data-code-lang-panel="python"] { display: none }`
  - `html:not([data-code-lang="js"]) [data-code-lang-panel="js"] { display: none }`
- The header shows a non-interactive language mark and name for each panel
  (hidden by the same rule), plus Copy. Copy reads the store at click time and
  copies the visible language's code.
- `display: none` keeps the hidden language out of the accessibility tree and
  out of find-in-page.
- A content test requires every `tabs` block to carry exactly `python` and
  `typescript` (all 278 do today), so a missing language fails CI instead of
  needing a silent runtime fallback.

### 5.2 Viz tracer code panels (`CodePanel`)

- No tabs. Reads `useCodeLang()` and shows `code.python` or `code.typescript`
  (both are required by `VizCode`); per-language line highlighting and
  auto-scroll are unchanged.
- Tokens are computed on the client already, so a JS/TS reader may see the
  panel settle to TypeScript just after hydration. Accepted: the panel is
  interactive and below the fold.

### 5.3 Sandbox (problem workspace, inline lesson sandboxes, landing demo)

- No language tabs. The toolbar shows the current language as a
  non-interactive label (mark + "Python" / "JavaScript").
- The editor language is `sandboxLangFor(useCodeLang())`. Changing it keeps
  both drafts (already stored per language under `draftKey(id, lang)`) and
  calls the runner's `reset()`, which cancels an in-flight run and clears
  results — exactly what the old tab click did. No code is ever lost.
- The coach already follows the editor through `setSource`.

### 5.4 Out of scope

- The Next.js course's TSX scratchpad (`ScratchpadEditor`): one language, no pair.
- Single-language code fences (`CodeBlock`): unchanged.

## 6. Accessibility

- The switch is keyboard-operable with a visible focus state; the phone
  toggle announces current and next language.
- Hidden languages are `display: none`, so assistive tech reads only the
  chosen language.
- `prefers-reduced-motion`: the switch has no motion beyond colour transitions.

## 7. Tests (each seen failing before it passes)

1. `codeLang.test.ts` — `parseCodeLang` (valid, invalid, missing), the
   mappings, `set` writing attribute + storage, storage that throws, and a
   `storage` event updating subscribers.
2. The pre-paint script is executed (not string-matched) against fake
   `document` / `localStorage`: sets `js`, ignores junk, survives a throwing
   storage.
3. `CodeLangSwitch` render test — radiogroup name, both radios, `aria-checked`
   follows the value, phone toggle label.
4. `CodeTabs` render test — no `tablist`, both panels with
   `data-code-lang-panel`, labels present.
5. CSS guard — the two hide rules exist and key off explicit `js`.
6. Content test — every `tabs` block is exactly python + typescript.
7. Source guards — `CodePanel` and `Sandbox` render no language tab buttons
   and read `useCodeLang`.

Browser verification (both themes): the desktop and 375px headers; switching
updates lesson blocks, a viz panel and a sandbox live; a reload with JS/TS
stored shows TypeScript at first paint with no flash (Playwright, storage set
before navigation); a second tab follows; keyboard operation of the switch.
`tsc`, `eslint`, `npm test` and `npm run build` must pass.
