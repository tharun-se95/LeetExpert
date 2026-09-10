# SEO Experiments

> No experiment can be **evaluated** until Search Console exists — there is no
> baseline CTR or position to compare against. Changes shipped before then are
> recorded here with their intended effect so they can be evaluated
> retrospectively once data arrives.

## EXP-001 — Meta descriptions on 220 content pages

**Hypothesis.** 220 lesson and problem pages had no `<meta name="description">`,
so Google synthesises snippets from page chrome. Supplying a description drawn
from each lesson's own opening prose should improve CTR at any given position,
and give Google a clearer topical signal per page.

**Change.** Descriptions derived at build time from each lesson's first prose
paragraph (`web/src/lib/seo/description.ts`).

**Baseline.** None available (no GSC).

**Start.** 2026-09-09 (shipped; not yet deployed at time of writing).

**Expected.** Improved CTR versus synthesised snippets. Industry-typical
improvement is meaningful but unquantified here on purpose — inventing a
"+15%" target would make the result unfalsifiable.

**Measure.** Once GSC has ≥28 days of data: average CTR across `/courses/dsa/*`
pages, split by whether Google used our description or synthesised its own
(visible by comparing the snippet in the SERP).

**Result.** Pending.

**Decision.** Pending.

---

## EXP-002 — Structured data (Course, BreadcrumbList, LearningResource)

**Hypothesis.** Breadcrumb markup replaces the raw URL in the SERP with a
readable hierarchy trail, which typically improves CTR. Course and
LearningResource nodes give Google an explicit entity model of the site rather
than requiring it to infer one.

**Change.** `Organization` + `WebSite` (root), `Course` (hub),
`BreadcrumbList` (emitted by the `Breadcrumbs` component itself),
`LearningResource` (every lesson and problem).

**Baseline.** No structured data at all.

**Start.** 2026-09-09.

**Expected.** Breadcrumb trails appear in results within weeks of indexing.
No Course rich result is expected — that needs `offers`/`hasCourseInstance`
data the site does not display, and fabricating it is out of the question.

**Measure.** GSC → Enhancements → Breadcrumbs (valid item count), plus the
Rich Results Test on a live lesson URL post-deploy.

**Result.** Pending.

**Decision.** Pending.

---

## EXP-003 — `/courses/dsa` title (proposed, not shipped)

**Hypothesis.** The hub page had no metadata and was titled "leetExpert". It
now reads "Data Structures & Algorithms Course". Once ranking data exists, a
more intent-specific variant may outperform it.

**Status.** Do not run until EXP-001/002 have data. Changing titles while
nothing is indexed produces no signal, only noise.
