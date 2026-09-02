---
title: "Evaluating When NOT to Use Next.js"
practiceFormat: null
depth: advanced
---

## The question that separates a framework fan from a systems thinker

Every lesson so far in this course has been building fluency inside
Next.js's own model. A senior-level system design conversation
occasionally goes the other direction entirely: "would you actually
choose Next.js here, or would something else genuinely serve this
product better?" Being unable to answer that honestly — reflexively
defending Next.js regardless of the scenario — reads as inexperience,
not loyalty.

## Where a pure SPA or plain static site is the better call

- **An internal admin tool with no SEO requirement and a small, known
  user base** — the App Router's server-rendering machinery, caching
  layers, and RSC/client boundary discipline are solving problems (SEO,
  first-load performance for anonymous public visitors) that simply
  don't exist for a tool only ever used by logged-in employees on a fast
  internal network. A plain client-rendered SPA (or even a simpler
  framework) can be genuinely less complex to build and reason about for
  this specific case.
- **A truly static site with no personalization** — a documentation site
  or a small marketing microsite with content that changes rarely and
  needs zero per-user variation may not need Next.js's dynamic-rendering
  and caching sophistication at all; a simpler static site generator can
  serve the exact same result with less operational surface area.

## Where a different full framework might fit better

Depending on the team's existing expertise and the product's specific
needs, other frameworks in the React ecosystem (or outside it entirely)
solve overlapping problems with different trade-offs — a team already
deeply invested in a different meta-framework's conventions, or a
product whose core need (real-time collaborative editing, for instance)
is better served by a framework built around that specific problem, are
legitimate reasons the "just use Next.js" default doesn't hold.

## The actual skill being assessed

```brain
This lesson has no drill because the skill it builds is argumentative,
not mechanical: articulating a genuine, specific trade-off — not
simply listing frameworks — grounded in what a particular product
actually needs versus what Next.js's App Router architecture is
specifically optimized for. An interviewer asking this question is
testing whether you understand Next.js's design *because* you
understand where its design stops paying for itself, not whether you
can recite its feature list.
```
