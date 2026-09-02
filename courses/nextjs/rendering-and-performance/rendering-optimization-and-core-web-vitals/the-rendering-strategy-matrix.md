---
title: "The Rendering Strategy Matrix"
practiceFormat: null
depth: essential
---

## Four letters, one underlying question

CSR, SSR, SSG, and ISR all answer the same underlying question
differently: **when, and how often, does this page's HTML actually get
generated?** Every other framework-level decision in this module —
caching, streaming, Partial Prerendering — is really a refinement of
where a given piece of UI sits on this spectrum.

## The four points on the spectrum

- **CSR (Client-Side Rendering)** — the server sends a near-empty HTML
  shell; the browser downloads a JavaScript bundle and renders everything
  itself. Fastest to serve from the server (nothing to compute), slowest
  to become visible to the user, and invisible to search engines that
  don't execute JavaScript.
- **SSG (Static Site Generation)** — HTML is generated once, **at build
  time**, and served identically to every visitor thereafter. Fastest
  possible time-to-first-byte since nothing computes per-request, but the
  content is frozen until the next build.
- **SSR (Server-Side Rendering)** — HTML is generated **fresh, on every
  request**, on the server. Content is always current, at the cost of a
  render happening on the critical path of every single request.
- **ISR (Incremental Static Regeneration)** — a hybrid: serve the
  statically-generated version (SSG's speed), but regenerate it in the
  background after a specified time window, so content eventually catches
  up to fresh data without every request paying SSR's per-request cost.

## Why the choice actually matters for these three concerns

- **Bundle size**: CSR ships the most JavaScript to the client, since the
  client does all the rendering work; SSG/SSR/ISR ship pre-rendered HTML
  and only the JS needed for hydration/interactivity.
- **SEO**: SSG, SSR, and ISR all deliver fully-formed HTML that search
  crawlers can index directly; pure CSR content may not be indexed
  correctly unless the crawler executes JavaScript, which isn't a safe
  universal assumption.
- **Freshness**: SSG is frozen at build time; SSR is always current; ISR
  sits between the two, trading some staleness for SSG-like speed.

## Why this is a matrix, not a single choice per app

The framing "which one does this app use" is itself a misconception —
different routes within the *same* Next.js app routinely use different
strategies: a marketing homepage as SSG, a user dashboard as SSR, a
product catalog as ISR. Choosing correctly per-route, based on that
route's actual freshness and traffic characteristics, is the real skill
this course keeps returning to as later lessons (streaming, PPR) refine
these categories further.
