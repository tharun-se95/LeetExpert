---
title: "The Server-Side Cache Matrix"
practiceFormat: trace
depth: essential
---

## One cache is not enough to explain what you're seeing

The previous lesson covered one caching mechanism — `fetch`'s own
`cache`/`revalidate` options. But when you're debugging "why did this
data not refresh" in a real Next.js app, that's only one of **three
separate, independently-operating caching layers** on the server. Mixing
them up is the single most common source of caching confusion in this
framework, which is exactly why this lesson isolates each one and gives
it a name.

## The three layers

**1. Request Memoization** — scoped to a **single render pass**. If the
same `fetch` (same URL, same options) is called from multiple components
during one request's render — a layout and a nested page both need the
same user data, for instance — React deduplicates those calls into one
actual network request. This memoization is automatically cleared the
moment that request's render finishes; it never persists across requests
or across users.

**2. Data Cache** — this is what the previous lesson's `fetch` options
actually configure. It's a **persistent, server-wide** cache: it survives
across requests and across different users, until it's invalidated by
time (`revalidate`) or explicitly (covered two lessons from now).

**3. Full Route Cache** — caches the **rendered output** of an entire
static route at build time, not just the data a fetch call returned. If
a route is fully static (no uncached dynamic data access), Next.js can
skip re-rendering it altogether and serve the pre-rendered HTML/RSC
payload directly.

## Why the distinction is the actual skill

These three layers operate at completely different scopes and get
invalidated by completely different triggers. Request Memoization
resets every request, automatically, with zero configuration. The Data
Cache persists based on your `fetch` options. The Full Route Cache
persists based on whether the *entire route* qualifies as static. A
request log showing instant repeated responses could be explained by any
one of these three — or a Route Handler bypassing caching entirely — and
correctly identifying *which* layer resolved a given request, from
observable behavior alone, is the diagnostic skill real debugging
requires.

## What the practice drill is testing

**Practice (Trace-the-Execution):** you'll be shown a sequence of rapid
request logs against the same route and asked to determine, for each
one, which of the three cache layers (or none) explains why the response
came back the way it did — distinguishing a same-request dedup from a
persistent Data Cache hit from a fully static Route Cache hit.

## Try it

A layout and its nested page both call `getUser(id)` (same `fetch`, same
options) during **one single render** of one request — and the network
tab shows only one actual call to `/api/user`. A moment later, a second,
different user's request to the same route also completes without a
fresh network call to the underlying data source. Which cache layer
explains each observation?

````reveal Work through it
The first observation — one call, even though two components in the
*same render* both requested it — is **Request Memoization**. It
dedupes identical `fetch` calls within a single render pass, and it
resets the instant that render finishes; it never persists across
requests or users.

The second observation — a *different* request, for a *different* user,
still not triggering a fresh fetch — can't be Request Memoization (which
is scoped per-render). It's the **Data Cache**: a persistent, server-wide
cache that survives across requests and different users until its
`revalidate` window expires or it's explicitly invalidated.

The signal that separates them: Request Memoization only ever explains
duplicate calls *within the same request's render*; anything shared
*across* separate requests has to be the Data Cache (or, if the entire
route's rendered output is what's being reused, the Full Route Cache).
````
