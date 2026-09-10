# Keyword Opportunities

> **Status: hypotheses, not data.** There is no Search Console, so no page has
> a known position, impression count or CTR. Nothing here is a measured
> opportunity; each row is a *prediction* to be confirmed or killed once real
> query data exists. Volume figures are deliberately omitted rather than
> guessed — see `SEO_BASELINE.md`.

## Method

SERPs for representative queries were sampled directly on 2026-09-09 to judge
incumbent strength. Ranking difficulty below is a judgement about *those*
results, not a third-party score.

## Tier 1 — pattern explainers (contest now)

Existing concept lessons already target these. Incumbents are LeetCode Discuss
threads and Medium posts: unstructured, often paywalled, usually single-language.

| Query shape | Existing asset | Why we can win |
| --- | --- | --- |
| `sliding window pattern explained` | Sliding-window concept lesson | Structured lesson + runnable sandbox vs. a forum thread |
| `monotonic stack when to use` | The Monotonic Stack | Incumbents explain *what*, rarely *when* |
| `two pointers vs sliding window` | Converging Pointers | Comparison intent is poorly served |
| `backtracking template` | Recursion & Backtracking module | We have a real template + drills |
| `{pattern} in python` / `in javascript` | Every concept lesson | **The wedge** — most incumbents are Java/C++ only |

## Tier 2 — problem pages (long tail, low individual value)

~200 problem pages. Individually these fight LeetCode itself plus NeetCode and
will rarely win on the bare problem name. Their value is **collective**: they
give the domain topical density and internal-link targets.

Realistic intent to target: `{problem} explained`, `{problem} python and
javascript`, `{problem} intuition` — not `{problem}` alone.

**Do not** create per-language duplicate pages for these. See
`SEO_STRATEGY.md` on why that is doorway-page behaviour.

## Tier 3 — head terms (do not contest yet)

`dsa course`, `data structures and algorithms course`, `dsa visualizer`.
Established incumbents, and no path for a domain registered 2026-09-08.
Revisit only after the site holds Tier 1 positions.

## Cannibalisation watch

Two structural risks worth monitoring once data exists:

1. **Concept lesson vs. its module page.** Both describe the same topic. The
   module page should rank for the topic; the lesson for the specific concept.
2. **Practice lesson vs. problems hub.** Both list the same problems.

Neither is a problem today — nothing ranks yet. Flagged so it is diagnosed
rather than rediscovered.

## What to do when Search Console data arrives

1. Export queries where the site ranks **4–20**. These are the quick wins.
2. Find pages with impressions but CTR below ~2% → title/description work.
3. Look for **queries Google chose that we did not target**. On a content-rich
   site these are usually the best signal available about what the corpus is
   genuinely authoritative on.
