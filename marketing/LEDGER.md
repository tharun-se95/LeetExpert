# Social content ledger — Instagram

Append-only. One row per produced post package, newest at the bottom.
`leetexpert-social-artist` reads this **before** generating (to avoid
repeating a hook, lesson, archetype run, or family) and appends to it
**after** the package is written.

Status is `drafted` on creation; update to `posted` by hand once published.

| Date | Slug | Archetype | Source lesson | Family | Hook | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-12 | binary-search-infinite-loop | interview-reality edge case | `courses/dsa/binary-search/the-invariant-template.md` | ordering-search | This binary search never returns. The array is sorted, it is not empty, and the target is in it. | drafted |
| 2026-09-12 | what-is-leetexpert | product introduction | `web/src/lib/course/manifest.ts` (whole-course) | — (monochrome) | The code on the page runs. Not a screenshot of a solution — an editor, in the lesson, in Python or TypeScript. | posted |
| 2026-09-24 | agents-write-the-code | product introduction (reel) | `courses/dsa/hash-tables/two-sum.md` | hash-tables | So your AI just wrote this in, like, three seconds. Four out of four. Ship it, right? | drafted |
| 2026-09-25 | big-o-in-60-seconds | concept explainer (carousel) | `courses/dsa/big-o/common-complexity-classes.md` | big-o | Every coding interview eventually hits you with the same question: what's the Big O of this? | drafted |
| 2026-09-26 | would-you-ship-this | interview-reality edge case (reel) | `courses/dsa/hash-tables/two-sum.md` | hash-tables | An AI wrote this in about two seconds, and it passes the sample test. So… would you ship it? | drafted |
| 2026-09-27 | two-pointers-trace | trace it (reel) | `courses/dsa/two-pointers/converging-pointers.md` | two-pointers | Okay, sorted list. Find two numbers that add up to fifteen. | drafted |
| 2026-09-27 | keep-the-streak | consistency / product (reel loop) | landing example year (`lib/landing/heat.ts`); in-app heat map not built (#30) | — | Learning DSA? Every day you practice… a square lights up. | held (#30) |
| 2026-09-28 | list-vs-set | cost check, deep dive (reel) | `courses/dsa/hash-tables/hashing-fundamentals.md` | hash-tables | Learning Python? These two lines look exactly the same… but one is over a thousand times slower. | drafted |
