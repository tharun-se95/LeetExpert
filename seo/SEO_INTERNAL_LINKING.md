# Internal Linking

## Measurement (2026-09-09)

Every internal `href` was extracted from all 429 prerendered HTML files and
counted against the 247 sitemap routes. This is measured, not estimated.

| Page type | Count | Min inbound | Median | Max |
| --- | --- | --- | --- | --- |
| Home | 1 | 247 | 247 | 247 |
| Hubs (`/courses/dsa`, `/courses/dsa/problems`) | 2 | 247 | 247 | 247 |
| Module pages | 24 | 246 | 246 | 247 |
| **Lesson pages** | 104 | 3 | **6** | 16 |
| **Problem pages** | 116 | 3 | **4** | 4 |

**Orphan pages: 0.** Every indexable URL has at least one inbound link.

## The finding

The link graph is **top-heavy and structurally flat**.

27 chrome pages (home, hubs, modules) receive ~247 inbound links each, because
the global navigation links them from every page. The 220 pages that carry the
actual long-tail content — the lessons and problems that could realistically
rank — receive a median of 6 and 4 links respectively, and problem pages max
out at exactly 4.

That ceiling of 4 is the tell: it means every problem page's inbound links come
from the same structural sources (the problems hub, its module's practice list,
and prev/next). **There is essentially no contextual linking between content
pages.** A monotonic-stack lesson does not link to the problems that exercise
it beyond a generated list, and a problem does not link back to the concept it
tests.

## Why it matters

Internal links are the strongest signal the site controls over which of its own
pages matter. Right now that signal is uniform noise: navigation says all 24
modules are equally important on all 247 pages, and says almost nothing about
the 220 content pages. Crawl priority and topical association are both being
left on the table.

## Recommended change (not yet implemented)

The data to do this properly already exists: the ` ```practice-problems ` fence
in every practice lesson carries a `pattern:` label per problem, mapping each
problem to the concept that teaches it.

1. **Problem → concept.** Each problem page links back to the concept lesson
   for its pattern, with the pattern name as anchor text. 116 new contextual
   links with meaningful anchors.
2. **Concept → problem.** Each concept lesson links to the problems exercising
   it. Reciprocal, and it strengthens exactly the pages Tier 1 targets.
3. **Related concepts.** Cross-module links where a pattern genuinely builds on
   another (two pointers → sliding window).

This is deliberately left for a focused pass rather than half-built here: it is
a content-architecture change that should be driven off the `pattern` metadata
and validated by a test asserting every generated link resolves to a real
lesson, the same way the sitemap is guarded.

## Anti-goals

- No "Related articles" blocks chosen by similarity score. Links must be
  semantically real or they teach Google nothing.
- No footer link dumps.
- Do not add more global-nav links. The chrome pages do not need more.
