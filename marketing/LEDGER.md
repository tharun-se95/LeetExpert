# Social content ledger — Instagram

Append-only. One row per produced post package, newest at the bottom.
`leetexpert-social-artist` reads this **before** generating (to avoid
repeating a hook, lesson, archetype run, or family) and appends to it
**after** the package is written.

Status is `drafted` on creation; update to `posted` by hand once published.

Account is the Instagram account the post is for (`leetexpert` or `10xtharun`,
the names `publish.mjs --account` takes). Posting the same package to both
accounts is two rows, one per account.

| Date | Slug | Account | Archetype | Source lesson | Family | Hook | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-12 | binary-search-infinite-loop | leetexpert | interview-reality edge case | `courses/dsa/binary-search/the-invariant-template.md` | ordering-search | This binary search never returns. The array is sorted, it is not empty, and the target is in it. | drafted |
| 2026-09-12 | what-is-leetexpert | leetexpert | product introduction | `web/src/lib/course/manifest.ts` (whole-course) | — (monochrome) | The code on the page runs. Not a screenshot of a solution — an editor, in the lesson, in Python or TypeScript. | posted |
| 2026-09-24 | agents-write-the-code | leetexpert | product introduction (reel) | `courses/dsa/hash-tables/two-sum.md` | hash-tables | So your AI just wrote this in, like, three seconds. Four out of four. Ship it, right? | posted 2026-09-29 (https://www.instagram.com/reel/Dd4jAy4DCiW/) |
| 2026-09-25 | big-o-in-60-seconds | leetexpert | concept explainer (carousel) | `courses/dsa/big-o/common-complexity-classes.md` | big-o | Every coding interview eventually hits you with the same question: what's the Big O of this? | drafted |
| 2026-09-26 | would-you-ship-this | leetexpert | interview-reality edge case (reel) | `courses/dsa/hash-tables/two-sum.md` | hash-tables | An AI wrote this in about two seconds, and it passes the sample test. So… would you ship it? | drafted |
| 2026-09-27 | two-pointers-trace | leetexpert | trace it (reel) | `courses/dsa/two-pointers/converging-pointers.md` | two-pointers | Okay, sorted list. Find two numbers that add up to fifteen. | superseded by 2026-09-29-two-pointers-gift-card (#119) |
| 2026-09-27 | keep-the-streak | leetexpert | consistency / product (reel loop) | landing example year (`lib/landing/heat.ts`); in-app heat map not built (#30) | — | Learning DSA? Every day you practice… a square lights up. | held (#30) |
| 2026-09-28 | list-vs-set | leetexpert | cost check, deep dive (reel) | `courses/dsa/hash-tables/hashing-fundamentals.md` | hash-tables | Learning Python? These two lines look exactly the same… but one is over a thousand times slower. | posted 2026-09-29 (https://www.instagram.com/reel/Dd4j7dZjME-/) |
| 2026-09-29 | two-pointers-gift-card | leetexpert | trace it, analogy (reel) | `courses/dsa/two-pointers/converging-pointers.md` | two-pointers | You've got a fifteen-dollar gift card. Spend every cent on exactly two things. | in production (#119): visuals built, narration not recorded |
| 2026-09-29 | anagram-tally | leetexpert | pattern explainer, analogy (reel) | `courses/dsa/strings/valid-anagram.md` | hash-tables | Stop sorting to check anagrams. | in production (#120): visuals built, narration not recorded |
| 2026-09-29 | remove-while-iterating | leetexpert | would you ship this? (reel) | `courses/dsa/arrays/stable-compaction-cyclic-placement.md` | arrays | This removes the even numbers. Or does it? | in production (#121): visuals built, narration not recorded |
| 2026-09-30 | coach-wont-answer | leetexpert | inside leetExpert (reel, real product footage) | `courses/dsa/hash-tables/two-sum.md` | hash-tables | The coach won't give you the answer. That's the point. | in production (#122): visuals built, narration not recorded |
| 2026-09-30 | prefix-sum-odometer | leetexpert | trace it (reel) | `courses/dsa/prefix-sum/prefix-sum-basics.md` | prefix-sum | Answer any range sum in O(1). | in production (#123): visuals built, narration not recorded |
| 2026-09-30 | sliding-window-inchworm | leetexpert | pattern in 60 seconds (reel) | `courses/dsa/sliding-window/dynamic-windows.md` | sliding-window | If you see "contiguous", think window. | in production (#124): visuals built, narration not recorded |
| 2026-09-30 | max-sum-k-window | leetexpert | would you ship this? (reel) | `courses/dsa/sliding-window/fixed-size-windows.md` | sliding-window | Max sum of k numbers in a row. Looks clean. | in production (#125): visuals built, narration not recorded |
| 2026-09-30 | binary-search-halves | leetexpert | trace it (reel) | `courses/dsa/binary-search/the-invariant-template.md` | binary-search | Watch binary search throw away half. | in production (#126): visuals built, narration not recorded |
| 2026-09-30 | js-float-mid | leetexpert | would you ship this? (reel) | `courses/dsa/binary-search/the-invariant-template.md` | binary-search | Binary search in JavaScript. One character is wrong. | in production (#127): visuals built, narration not recorded |
