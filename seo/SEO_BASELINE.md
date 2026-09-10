# SEO Baseline — 2026-09-09

## The single most important fact

`leetexpert.com` was registered **2026-09-08**. At the time of this baseline
the domain is **one day old**. It has never been crawled, never been
submitted, and has no inbound links. No technical work changes that; it sets
the floor on how fast anything else can work.

## Measurement capability: none

| Source | Status |
| --- | --- |
| Google Search Console | **Not set up.** No verification token anywhere in the repo. |
| Analytics (any) | **Not installed.** No GA, Plausible, Vercel Analytics, PostHog. |
| Rank tracking | None. |

**Every metric this document would normally carry — impressions, clicks, CTR,
average position, indexed pages, top queries — is unavailable.** They are not
estimated here, because an invented baseline is worse than none: it would
make later "improvements" unfalsifiable.

This is the highest-priority gap in the entire SEO programme. Phases that
depend on real query data (quick wins at positions 4–20, high-impression /
low-CTR fixes, content decay, cannibalisation) **cannot begin** until Search
Console has been verified and has accumulated data.

## Verified live state (measured 2026-09-09 as Googlebot)

| Check | Result |
| --- | --- |
| `https://www.leetexpert.com/` | 200, 141 KB server-rendered HTML |
| apex → www | 308 permanent (single canonical host) |
| Accidental `noindex` | None |
| Vercel deployment protection | Not active (crawlers not blocked) |
| Rendering | App Router, static (SSG) via `generateStaticParams` |
| `/courses/nextjs/*` | **404 by design** (`courses/nextjs/layout.tsx` calls `notFound()`) |

## State before this session's work

| Item | Before |
| --- | --- |
| `robots.txt` | 404 |
| `sitemap.xml` | 404 |
| Canonical tags | None on any page |
| Meta descriptions | Root layout only — **0 of 220** lesson/problem pages |
| `/courses/dsa` metadata | **None at all** (title fell back to "leetExpert") |
| Structured data | None |

## State after this session

| Item | After |
| --- | --- |
| `robots.txt` | Serves; declares host + sitemap; disallows `/api/` |
| `sitemap.xml` | **247 URLs**, static, 0 redirects, 0 404s |
| Canonical tags | All 6 indexable page types |
| Meta descriptions | **220 / 220** derived from each lesson's own prose |
| Structured data | Organization, WebSite, Course, BreadcrumbList, LearningResource |

## Indexable surface

247 URLs: `/`, 2 hubs, 24 module pages, ~+ concept/practice lessons, and every
problem page. Deliberately excluded: 62 `/courses/nextjs/*` URLs (404), problem
lessons' course URLs (308 → problems hub), `/courses/dsa/marketing` (308 → `/`).

## Assumptions

- The DSA course is the only sellable surface; the Next.js course is disabled.
- Target audience is interview-preparing engineers, Python and JavaScript.
- No commercial/pricing pages exist yet, so no transactional intent to capture.

## Priorities

- **P0** — Verify Search Console; submit the sitemap. *Manual, blocks everything.*
- **P0** — Install analytics. Without it, no change here is measurable.
- **P1** — Long-tail pattern content (see `SEO_KEYWORDS.md`).
- **P2** — Internal linking depth (see `SEO_INTERNAL_LINKING.md`).
