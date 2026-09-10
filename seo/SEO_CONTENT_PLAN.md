# Content Plan

## Position: write nothing new yet

220 lessons exist and **none are indexed**. Adding content before the existing
corpus is crawled and ranked is misallocation — it increases what must be
crawled without evidence about what works.

The plan below activates once Search Console shows which lessons Google
associates with which queries.

## Audit of the existing corpus

| Classification | Count | Action |
| --- | --- | --- |
| Keep | 220 | All DSA lessons. Authored, substantive, unique. |
| Improve | TBD | Determined by query data, not by guesswork. |
| Consolidate | 0 | No duplicate topics found. |
| Redirect | 2 | Already done (`/course/*`, `/courses/dsa/marketing`). |
| Noindex / remove | 0 | No thin pages found. |
| Next.js course (62) | — | 404 by design; out of scope while disabled. |

No page in the corpus is thin, scraped, or keyword-stuffed. That is unusual and
is the programme's main asset.

## Gaps worth filling (after data)

These are shapes the corpus lacks, in rough priority order:

1. **Comparison pages.** "Two pointers vs sliding window", "BFS vs DFS: which
   to reach for". Comparison intent is real, poorly served, and the course
   already contains both halves of each answer.
2. **"When do I use X" pages.** The corpus explains mechanisms well and
   selection poorly. Selection is what an interview candidate actually
   searches for under pressure.
3. **Complexity reference.** A single canonical, linkable complexity table for
   every structure and operation in the course. Reference pages attract links.

Each must be a genuinely better answer than what ranks today, or it is not
worth writing.

## Rules for anything new

- Written for a human preparing for an interview, not for a crawler.
- Every claim derived, per the course's own standard — no asserted results.
- Both languages, since that is the differentiator.
- No page ships without a real internal-link path from an existing lesson.
