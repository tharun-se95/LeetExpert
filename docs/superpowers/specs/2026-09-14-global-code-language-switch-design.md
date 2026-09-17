# Code language: one preference, picked where the code is — design

**Date:** 2026-09-14
**Status:** approved 2026-09-14; revised during planning (pre-paint mechanism)
and 2026-09-15 (restyled header). **Revised 2026-09-17** (owner): the header
switch is withdrawn. The language is picked from a menu on each code surface,
and the preference names real languages instead of "JS/TS", so more languages
can be added. §2–§5 and §7 are rewritten; the header pill and phone toggle
built on 2026-09-15 are removed.
**Replaces:** the per-surface language tabs in lesson code blocks
(`CodeTabs`), viz tracer code panels (`CodePanel`) and the sandbox editor
(`Sandbox`); then the 2026-09-15 header switch.

---

## 1. Why

Every code surface carried its own Python / TypeScript or Python / JavaScript
tabs, each defaulting to Python. A learner who works in JavaScript re-picked
their language on every block, every tracer and every problem. The choice is a
property of the learner, so it is stored once.

**Why the 2026-09-17 revision.** The first build put the choice in the app
header. An owner review with fresh eyes found:

- It sat far from what it changes. People link a control to its effect when
  the two are together, and a learner who notices the wrong language is
  looking at the code, not the header.
- It appeared on pages with no code (course hub, problem list, landing).
- Inside the "Product modes" nav it read as a third destination beside
  Lessons and Practice, and a screen reader announced it as navigation.
- A two-sided pill cannot hold a third language.
- "JS/TS" named no real language: the header said JS/TS while the editor
  said JavaScript.

Coding platforms (LeetCode, HackerRank, CodeSignal) put the language picker on
the editor, and multi-language docs (Stripe, Docusaurus tabs with a shared
group) put it on each code block, synced. This design follows both.

## 2. Decisions

| Question | Decision |
| --- | --- |
| What is stored | One language id from a registry: `python`, `javascript` or `typescript`. |
| Where it is picked | A menu in the header of every code surface: lesson code blocks, viz code panels and the sandbox toolbar. Nothing in the app or landing header. |
| What a surface shows | Its own languages. If it lacks the preferred one it shows the nearest it has, by a fixed fallback order, and its label names what is actually shown. |
| Syncing | Picking on any surface changes every surface, in every open tab. |
| More languages | Add a registry entry. The menu is a list, so it has room; a surface lists only the languages it has. |
| How the choice reaches surfaces | Unchanged: a pre-paint attribute plus CSS for server-rendered blocks, one store for interactive surfaces. Pages stay static. |

Rejected: keeping the header switch (reasons above); one page-level control in
the lesson header (it scrolls away, so block four of a long lesson has no
control in reach); a segmented control per block (it does not scale past two
or three languages and crowds phone widths).

**Not in this revision** (tracked as follow-ups, not built):
- A first-run "Which language do you practise in?" prompt. The pickers are
  enough to choose; the prompt needs its own design.
- New languages. The registry takes them, but each needs content (278 `tabs`
  blocks), a runner and reference solutions in that runtime (CLAUDE.md §2)
  before it is listed.

## 3. The preference

- **Registry** (`src/lib/codeLanguages.ts`, hook-free so the server layout can
  import it): `CODE_LANG_IDS` in menu order (`python`, `javascript`,
  `typescript`) and `CODE_LANG_LABEL` for their names.
- **Fallback order.** `codeLangChain(id)` is the preferred id, then its
  nearest relatives (`javascript` ↔ `typescript`: TypeScript without its types
  is JavaScript), then every other registry language in registry order. So
  the chain always ends in a language every surface has.
- `resolveCodeLang(preference, available)` returns the first id in the chain
  that the surface has. `parseCodeLang` accepts only registry ids; anything
  else is `python`.
- Persisted in `localStorage` under `dsa-code-lang`. Storage that throws
  still switches for the session.
- **First paint.** A plain inline `<script>` right after the lamp's boot
  script copies a valid stored id onto `<html data-code-lang>` while the HTML
  parses — never `next/script` `beforeInteractive`, which the App Router runs
  after first paint. With no attribute, surfaces resolve as `python`.
- **CSS resolution.** The same registry generates the rules
  (`codeLangCss()`), served as an inline `<style>` next to the script:
  - For each preference P, a panel for language L is hidden inside a block
    whose `data-code-lang-has` names a language earlier than L in P's chain.
    What remains visible is the first language in the chain that the block
    has. Nothing is hidden by default, so a panel outside a named block always
    shows rather than vanishing.
  - `~=` attribute matching needs no `:has()`, so it works in every browser
    the app supports.
- **Store.** `useCodeLang(): [CodeLangId, set]` on `useSyncExternalStore`: the
  snapshot reads the attribute, the server snapshot is `python`, `set` writes
  the attribute and storage and notifies, and a `storage` listener follows
  other tabs.

## 4. The picker (`src/components/code/CodeLangMenu.tsx`)

- **Trigger:** a compact button in the surface header, showing the mark and
  name of the language the surface is showing, plus a caret.
  - On server-rendered surfaces the trigger holds one label per available
    language as `data-code-lang-panel` spans, so the right one is visible at
    first paint.
  - Its accessible name is "Code language: {shown}", built from a `sr-only`
    prefix plus the visible label, so it is right before hydration too.
  - It uses the `.code-lang-label` ink (`--tok-name` on the code canvas;
    `--muted` on the sandbox toolbar's paper).
- **Menu:** `role="menu"` of `menuitemradio`s, one per language the surface
  has, with the shown one `aria-checked`.
  - If the preference is not among them, a muted line inside the menu says so:
    "TypeScript isn't available here — showing JavaScript".
  - The menu renders into a portal on `document.body`, `position: fixed` under
    the trigger. Code surfaces clip their overflow, so an in-place popover
    would be cut off.
  - It closes on Escape (focus returns to the trigger), on a pick, a pointer
    down outside, or Tab. On scroll or resize it follows its trigger and closes
    only once the trigger is off screen: the page scrolls smoothly, so closing
    on any scroll shut a menu opened mid-scroll the moment it appeared
    (found in the browser check).
- **Keyboard:** Enter, Space or ArrowDown on the trigger opens the menu with
  focus on the checked item. ArrowUp/ArrowDown move with wrap-around,
  Home/End jump, and Enter/Space pick.
- **Picking** sets the preference to that id.
  - **Scroll anchor:** the picker's top edge is measured before the change and
    the nearest scrolling ancestor is scrolled by the difference afterwards,
    so the block you picked in stays under the pointer while blocks above it
    change height.
- **Look:** the menu is `bg-elevated` with a `border-border` hairline,
  `shadow-elevation` and the radius token. Items are `min-h-11` touch targets
  with the language mark; the checked item carries a tick and ink text,
  the others muted. Focus uses the global `:focus-visible` outline.

## 5. Surfaces

### 5.1 Lesson code blocks (`CodeTabs`, 278 `tabs` fences)

- Both languages render server-side as panels, inside a block carrying
  `data-code-lang-has="python typescript"`.
- The header holds the picker (CSS-labelled) and Copy. Copy follows the
  store's resolution, which matches the attribute once hydrated, so it copies
  the language on screen.
- The content test still requires every `tabs` block to be exactly `python`
  and `typescript`.

### 5.2 Viz tracer code panels (`CodePanel`)

- Available: `python`, `typescript`. The picker and the code both follow
  `resolveCodeLang(useCodeLang())`. Tokens are computed on the client, so a
  non-Python reader may see the panel settle just after hydration — accepted,
  as before (interactive, below the fold). Here the trigger label comes from
  the store, so it never disagrees with the code beneath it.

### 5.3 Sandbox (problem workspace, inline lesson sandboxes, landing demo)

- Available: `python`, `javascript`. The toolbar's static label becomes the
  picker (CSS-labelled; the editor itself mounts on the client).
- Changing the resolved language keeps both drafts and calls `reset()`, which
  cancels an in-flight run — unchanged from the first design.

### 5.4 Headers

- `Header` and `LandingHeader` return to their pre-switch markup, including
  the phone spacing that was tightened only to fit the toggle.

### 5.5 Out of scope

- The Next.js course's TSX scratchpad (`ScratchpadEditor`): one language.
- Single-language code fences (`CodeBlock`): nothing to pick.

## 6. Accessibility

- The picker is a menu button with full keyboard support and a visible focus
  state; its name states the language shown.
- Hidden languages are `display: none`, out of the accessibility tree and
  find-in-page.
- No motion beyond colour transitions.

## 7. Tests (each seen failing before it passes)

1. `codeLang.test.ts` — registry parsing, fallback chains, `resolveCodeLang`,
   the store (attribute, storage, throwing storage, other tabs), the executed
   pre-paint script (valid ids only), and the hook-free import guard.
2. **CSS resolution, executed:** the generated rules are loaded into jsdom,
   and for every preference × every block availability, exactly the resolved
   panel is displayed.
3. `CodeLangMenu` — the trigger's accessible name and panel labels, menu roles
   and `aria-checked`, the "not available" note, keyboard open/move/pick/close.
4. `CodeTabs` — picker in the header, both panels, `data-code-lang-has`.
5. Source guards — `CodePanel` and `Sandbox` render the picker and resolve
   through the registry; the headers contain no language control.
6. Content — every `tabs` block is exactly python + typescript.

Browser verification (both themes, desktop and 375px):
- A lesson, a problem page and the landing demo each show the picker, with the
  menu drawn over the code surface and not clipped.
- Picking TypeScript in a lesson block updates every block, the viz panel,
  and the sandbox, which shows JavaScript with the note.
- The picked block stays in place on screen.
- With a non-Python preference stored and all JavaScript blocked, the first
  paint shows the right code and labels.
- A second tab follows the change.
- The picker works by keyboard alone.
- `tsc`, `eslint`, `npm test` and `npm run build` pass.
