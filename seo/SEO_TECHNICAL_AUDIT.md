# Technical SEO Audit — 2026-09-09

Findings are marked **FIXED** (this session), **OPEN**, or **OK** (verified,
no action). Every "OK" was measured, not assumed.

## Crawlability

| Finding | Status |
| --- | --- |
| `robots.txt` returned 404 | **FIXED** — `web/src/app/robots.ts`. A 404 is treated as allow-all, so this was never what blocked indexing; its real job is declaring the sitemap. |
| `/api/` crawlable | **FIXED** — disallowed. The coach route is POST-only with no indexable content. |
| Accidental `noindex` | **OK** — no robots meta anywhere. |
| Deployment protection blocking bots | **OK** — anonymous Googlebot fetch returns 200. |
| JS-only content | **OK** — all pages are server components; no page-level `"use client"`. |

## Indexation

| Finding | Status |
| --- | --- |
| No sitemap | **FIXED** — 247 URLs, derived from the course manifest. |
| 62 `/courses/nextjs/*` URLs 404 | **OK / excluded.** The layout calls `notFound()` by design. Listing them would have been a Search Console error. Guarded by a test. |
| Problem lessons reachable at two URLs | **OK** — the course URL 308s to the problems hub, and the canonical now names the destination. |
| `/courses/dsa/marketing` duplicated `/` | **OK** — already 308s (commit `aaa6cc4`); excluded from the sitemap. |
| Orphan pages | **OPEN** — see `SEO_INTERNAL_LINKING.md`. |

## URL architecture

**OK.** Lowercase, hyphenated, no parameters, no trailing-slash variants, a
clean `/courses/{course}/{module}/{lesson}` hierarchy. No changes recommended
— and URL changes on a one-day-old domain would be pure cost.

## Metadata

| Finding | Status |
| --- | --- |
| 220 lesson/problem pages had **no description** | **FIXED** — derived from each lesson's opening prose (`web/src/lib/seo/description.ts`), asserted across all 220 files. |
| `/courses/dsa` had **no metadata at all** | **FIXED** — real title + description. It was titled "leetExpert". |
| Module pages had no description | **FIXED** — now use the authored `ModuleMeta.description`. |
| No canonical tags anywhere | **FIXED** — all 6 indexable page types. |
| Duplicate/stuffed titles | **OK** — titles are lesson names via a `%s · leetExpert` template. |
| H1 per page | **OK** — one `<h1>` in `LessonView`; headings derive from authored markdown. |

## Structured data

All **FIXED** this session, all reflecting visible page content:

- `Organization` + `WebSite` (root layout) with stable `@id`s.
- `Course` on `/courses/dsa`, with all 24 modules as `hasPart`.
- `BreadcrumbList` — emitted *inside* the `Breadcrumbs` component from the same
  `items` it renders, so markup and visible trail cannot diverge.
- `LearningResource` on every lesson and problem, referencing the Course `@id`.

Deliberately **not** emitted: `aggregateRating`, `offers`, `review`. The site
displays none of them; marking up figures a visitor cannot see is the
manipulative structured data Google penalises.

## Open items

| Item | Priority | Why |
| --- | --- | --- |
| No Search Console | **P0** | Blocks all measurement. Manual. |
| No analytics | **P0** | No conversion or engagement data. Needs a dependency decision. |
| No `opengraph-image` | **P2** | Shared links render bare; affects social CTR, not ranking. |
| Core Web Vitals unmeasured | **P2** | Pages are static, but the sandbox loads Pyodide. Not yet profiled. |
| `lastmod` is build time | **P3** | Per-file mtime is checkout time in CI; real commit dates would need a build step. |
