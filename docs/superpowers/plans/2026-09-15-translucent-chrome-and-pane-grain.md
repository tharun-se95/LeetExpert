# Translucent Chrome and Pane Grain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The app header overlays the page as translucent 90% paper with blur and the edge shadow, the drawer's pinned row goes translucent, the landing header's scrolled state aligns to 90%, and the problem panes get grain.

**Architecture:**
- A shared `TRANSLUCENT_PAPER` constant carries the translucent classes.
- `AppShell` makes the shell `relative`, the header `absolute`, the desk wrapper `pt-14` off `/`, and the rail `mt-14`.
- Scroll-relative offsets shift by 3.5rem.
- The panes add `.grain-paper` on `--elevated`.

**Tech Stack:** Next.js 16.2, React 19.2, Tailwind v4, Vitest 4, Playwright MCP.

**Spec:** `docs/superpowers/specs/2026-09-15-translucent-chrome-and-pane-grain-design.md`

## Global Constraints

- `TRANSLUCENT_PAPER = "bg-background/90 backdrop-blur-md"`. The header keeps a literal `className` string, because `sidebarChrome` parses it.
- The header stays `h-14`. The pinned row has no shadow and no `border-b`.
- The landing page's layout is unchanged except its scrolled opacity.
- `globals.css` is not edited. `CLAUDE.md` has another session's uncommitted edits: change only this spec's sentences and do not commit it.
- Implementation stays uncommitted (owner). Never `git stash`. Never run Prettier.
- Gate: tsc, lint 0 errors, vitest, build, and browser checks (spec §5).

---

### Task 1: Failing tests

- [ ] `appHeader.test.tsx`: replace "is a hairline on the grainy desk" with "overlays the page as translucent paper with the edge shadow". Classes: `absolute top-0 h-14 border-b shadow-edge-bottom` plus `TRANSLUCENT_PAPER`, no `grain-paper` or `sticky`. Add "moves scroll-relative offsets below the header": TOC `top-38` and `max-h-[calc(100vh-10.5rem)]`, Markdown `prose-headings:scroll-mt-38`, Next.js lesson `sticky top-34`.
- [ ] `courseNavPanel.test.tsx` "paints the pinned row": `TRANSLUCENT_PAPER` classes, no `grain-paper`, no `shadow-`, no `border-b`.
- [ ] `landingHeader.test.tsx` scrolled: imports `TRANSLUCENT_PAPER` and expects every class; no `bg-background/80`; the file imports the constant.
- [ ] `sidebarChrome.test.ts`: add "starts the rail below the overlaying header" (rail class has `mt-14`, not `h-full`) and "lets pages scroll under the header" (shell `relative flex h-dvh`, the desk wrapper has `!landing && "pt-14"`).
- [ ] `paperGrain.test.ts`: allowlist Header 0, CourseNavPanel 0, ProblemWorkspace 2, and `[--grain-paper:var(--elevated)]` twice in ProblemWorkspace.
- [ ] `grainContrast.test.ts`: grain on `--elevated` too, and a translucent-paper test reading the alpha from `headerChrome.ts`.
- [ ] Run: `npx vitest run tests/appHeader.test.tsx tests/courseNavPanel.test.tsx tests/landingHeader.test.tsx tests/sidebarChrome.test.ts tests/paperGrain.test.ts tests/grainContrast.test.ts`. Expected: the new assertions FAIL.

### Task 2: Implement

- [ ] `headerChrome.ts`: export `TRANSLUCENT_PAPER` with a comment on why 90% (spec §2).
- [ ] `Header.tsx` `<header>`: `print:hidden absolute inset-x-0 top-0 z-40 grid h-14 … border-b border-border bg-background/90 backdrop-blur-md shadow-edge-bottom px-3 sm:gap-3 sm:px-4`.
- [ ] `AppShell.tsx`: the shell becomes `relative flex h-dvh flex-col overflow-hidden`; the desk wrapper `cn(…)` adds `!landing && "pt-14"`; update the comments.
- [ ] `Sidebar.tsx` rail: `h-full` becomes `mt-14`, with a comment.
- [ ] `CourseNavPanel.tsx` `PinnedRow`: `cn("sticky top-0 z-10 flex items-center justify-end gap-2 pt-3 pb-1", TRANSLUCENT_PAPER)`, with an updated comment.
- [ ] `LandingHeader.tsx`: `scrolled && cn(TRANSLUCENT_PAPER, "shadow-edge-bottom")`.
- [ ] `ProblemWorkspace.tsx`: both `bg-elevated` panes add `grain-paper [--grain-paper:var(--elevated)]`.
- [ ] Offsets: `TableOfContents` `top-38` and `max-h-[calc(100vh-10.5rem)]`; `Markdown` `scroll-mt-38`; Next.js lesson `top-34`.
- [ ] Run the Task 1 suites, then `tsc` and `lint`. Expected: PASS.

### Task 3: Doctrine, gate, browser

- [ ] `CLAUDE.md` §4: the four sentences in spec §6.
- [ ] Full `npx vitest run` and `npm run build`.
- [ ] Browser checks per spec §5, with screenshots.
- [ ] Report, leaving everything uncommitted.
