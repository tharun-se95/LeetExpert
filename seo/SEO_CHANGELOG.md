# SEO Changelog

---

## 2026-09-09 — Structured data + meta descriptions

**Change.**
- `Organization` + `WebSite` JSON-LD in the root layout, with stable `@id`s.
- `Course` JSON-LD on `/courses/dsa`, listing all 24 modules as `hasPart`.
- `BreadcrumbList` emitted *inside* the `Breadcrumbs` component, built from the
  same `items` it renders.
- `LearningResource` on every lesson and problem page, referencing the Course.
- Meta descriptions on all 220 lesson/problem pages, derived from each lesson's
  own opening prose.

**Reason.** 220 content pages had no description, so Google synthesised
snippets from chrome. No structured data existed at all, so Google had to infer
the site's entity model.

**Expected impact.** Better CTR at a given position; breadcrumb trails in the
SERP; clearer topical signals. No ranking guarantee — the domain is 2 days old.

**Files changed.**
`web/src/lib/seo/description.ts`, `web/src/lib/seo/jsonLd.ts`,
`web/src/components/seo/JsonLd.tsx`, `web/src/components/layout/Breadcrumbs.tsx`,
`web/src/components/course/LessonView.tsx`, `web/src/lib/course/load.ts`
(`readLessonMarkdown`), `web/src/app/layout.tsx`,
`web/src/app/courses/dsa/page.tsx`, `web/src/app/courses/dsa/[module]/[lesson]/page.tsx`,
`web/src/app/courses/dsa/problems/[slug]/page.tsx`.
Tests: `web/tests/seoDescription.test.ts`, `web/tests/seoJsonLd.test.ts`, additions to `web/tests/seo.test.ts`.

**Validation.** tsc clean · eslint 0 errors · **698 tests / 39 files pass** ·
`npm run build` exit 0 · JSON-LD verified in built HTML and in a production
browser session (4 blocks, all parse, **zero console output**) · descriptions
asserted across all 220 authored files.

**Bugs found and fixed while building this**
- Nested fences: ` ````tabs ` wrapping ` ```python ` broke a naive
  `inFence = !inFence` toggle, leaking Python source into descriptions.
- Truncating mid-paragraph severed inline code spans that the course
  hard-wraps across lines, stranding an unmatched backtick.
- A sentence-boundary preference collapsed rich paragraphs to short fragments
  ("Stages 0–1 built containers.").

**Next measurement.** After GSC verification + 28 days of data: CTR across
`/courses/dsa/*`, and breadcrumb valid-item count under Enhancements.

---

## 2026-09-09 — Indexability foundation

**Change.** Added `sitemap.ts` (247 URLs), `robots.ts`, and canonical URLs on
all 6 indexable page types. Added title/description to `/courses/dsa`, which
had no metadata export at all. Consolidated the production origin into a single
`SITE_ORIGIN` constant.

**Reason.** `/robots.txt` and `/sitemap.xml` both returned 404; no page emitted
a canonical tag. Investigation started from "the site does not appear in
Google" — root cause was that the domain was registered **2026-09-08** and had
never been crawled or submitted.

**Expected impact.** Makes ~247 URLs discoverable in one fetch instead of via
three levels of navigation crawling. Prerequisite for indexing, not a ranking
change in itself.

**Files changed.** `web/src/lib/seo/site.ts`, `web/src/app/sitemap.ts`,
`web/src/app/robots.ts`, `web/src/app/layout.tsx`, `web/src/app/page.tsx`,
and the four DSA route files. Tests: `web/tests/seo.test.ts`.

**Validation.** tsc clean · eslint 0 errors · 658 tests pass · build exit 0 ·
robots.txt and sitemap.xml verified live in-browser · mutation-tested (three
deliberate faults each produced exactly one targeted failure).

**Notable exclusions, each verified.** 62 `/courses/nextjs/*` URLs (404 by
design), problem lessons' course URLs (308 → problems hub),
`/courses/dsa/marketing` (308 → `/`).

**Next measurement.** Confirm `Sitemap: read successfully, 247 URLs` in Search
Console once submitted.
