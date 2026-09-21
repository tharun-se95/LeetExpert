# Social content ledger — Instagram

Append-only. One row per produced post package, newest at the bottom.
`leetexpert-social-artist` reads this **before** generating (to avoid
repeating a hook, lesson, archetype run, or family) and appends to it
**after** the package is written.

Status is `drafted` on creation; update to `posted` by hand once published.

| Date | Slug | Archetype | Source lesson | Family | Hook | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-12 | binary-search-infinite-loop | interview-reality edge case | `courses/dsa/binary-search/the-invariant-template.md` | ordering-search | This binary search never returns. The array is sorted, it is not empty, and the target is in it. | drafted |
| 2026-09-12 | what-is-leetexpert | product introduction | `web/src/lib/course/manifest.ts` (whole-course) | — (monochrome) | The code on the page runs. Not a screenshot of a solution — an editor, in the lesson, in Python or TypeScript. | drafted |
