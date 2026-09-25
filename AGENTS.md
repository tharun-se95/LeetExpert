# Rules for agents working in this repo

`CLAUDE.md` in this directory is the full standard and takes precedence over
this file. This file exists because some agent CLIs (Antigravity's `agy`,
and others) read `AGENTS.md` and never read `CLAUDE.md`. Read `CLAUDE.md`
before any non-trivial change; what follows is the short version that must
hold even for a one-line edit.

This is a **commercial course**. Every change ships to paying learners.

## Non-negotiable

1. **Verify, never assume.** Nothing is "done" until it was run. `tsc`,
   `eslint`, `npm test` and `npm run build` must pass, from `web/`.
2. **Never hand-write an expected value.** Test expectations come from
   executing a reference solution, in **both** Python and JavaScript — the two
   differ on integer division, sort stability and string handling.
3. **No workarounds.** If a tool cannot express what the content needs, extend
   the tool. Do not narrow the content to fit it, and do not ship something
   that "mostly" works.
4. **Report honestly.** Say what you ran and what you did not. Never describe
   partial work as complete. Surface defects you find in passing.

## Code

- TypeScript strict. No `any`, no casts to silence the compiler.
- Comments explain **why**, not what.
- Reuse before writing: search for an existing helper, type or component
  first, and fix bugs at the shared root, not on one caller's path.
- Match the conventions of the surrounding code.
- Accessibility is not optional: real `aria-label`s, visible focus, keyboard
  paths, `prefers-reduced-motion` honoured.

## Design system (see CLAUDE.md §4 for the whole thing)

- **All colour goes through tokens.** Never a hardcoded Tailwind palette value
  (`emerald-500`, `red-400`) in a component.
- Shadows and radii are tokens applied through shared classes
  (`.shadow-elevation`, `.shadow-edge-*`), never a raw `box-shadow` or an
  arbitrary `shadow-[...]`.
- Three type faces, three jobs: Space Mono (display/headings), Space Grotesk
  (body/UI), JetBrains Mono (code only). Display call sites never use
  `font-semibold` — Space Mono ships 400/700 only.
- Contrast is measured, not eyeballed: body ink and muted clear WCAG AA
  (4.5:1), and the ratio goes in a comment beside the token.

## Content

- Every problem lesson has a working sandbox with starter code in both
  languages. Starter code carries the signature and nothing that gives away
  the answer.
- Test cases cover the stated constraints, including the edge the lesson
  calls out ("k can exceed n", "may be empty").
- Callouts are the exception, each with one job, never two adjacent, never
  restating the paragraph before.
- Never leak solutions: reveal content is conditionally rendered so Ctrl+F
  cannot surface it.

## Planning and tracking (CLAUDE.md §7)

Planned work is GitHub issues on `tharun-se95/LeetExpert`, read and written
with `gh`, on the board https://github.com/users/tharun-se95/projects/1
(CLAUDE.md §7 has the commands to move a card).

- Work from an issue: `gh issue view N --comments` before you start. If the
  task you were given names none, say so in your report.
- Before starting, check the issue's comments for someone else's claim, and
  its blocked-by list for open issues; if either, stop and report.
- Record findings, blockers and the checks you ran as a comment on the issue
  (`gh issue comment N --body-file -`), not only in your reply.
- End every issue, comment and PR body you write with the provenance line
  the dispatching session gave you in your task (`<sub>Agent: Antigravity
  agy …</sub>`), verbatim. If the task carries none, write
  `<sub>Agent: Antigravity agy (<your agent>, <your model>) · dispatcher unknown · <date></sub>`
  and say in your report that it was missing.
- Never decide an `owner-decision` issue, and never close an issue yourself:
  the PR's `Closes #N` does that, or the session that dispatched you.

## Where things are

| Path | What it is |
| --- | --- |
| `courses/dsa/` | 220 lesson markdown files in 24 modules — the product |
| `web/` | The Next.js app that renders the course |
| `web/tests/` | Content validation; runs in CI before the build |
| `docs/superpowers/specs/` | Design specs; write one before large work |
| `hyperframes/` | Visual system for lesson art, stills and video |

`web/AGENTS.md` carries Next.js specifics and also applies.
