---
title: "Native Fetch Extensions"
practiceFormat: sandbox
depth: essential
---

## Same function, more capability

`fetch` is a standard Web API — you've used it outside Next.js already.
Inside a Next.js Server Component, the same `fetch` function gains extra
options that hook directly into Next.js's own server-side caching system.
This isn't a different function; it's the identical `fetch` you already
know, with a second, Next.js-specific configuration surface layered on
top of the standard `RequestInit` options.

## The two extension points

```ts
fetch("https://api.example.com/products", {
  cache: "force-cache",
  next: { revalidate: 3600 },
});
```

- **`cache`** — accepts `"force-cache"` (the default: cache indefinitely,
  reuse across requests) or `"no-store"` (never cache; always hit the
  network fresh). This is the same on/off switch as HTTP caching in
  spirit, but controlled from your fetch call rather than response
  headers alone.
- **`next: { revalidate: <seconds> }`** — a time-based staleness window.
  Instead of "cache forever" or "never cache," this says "cache this
  response, but treat it as stale after N seconds and refetch on the next
  request past that point." A `revalidate: 60` fetch call serves cached
  data instantly for up to 60 seconds, then transparently refreshes.

## Why this belongs to Next.js, not just the browser

A browser's native `fetch` cache is scoped to that browser, that user,
that tab. Next.js's extended `fetch` caching is a **server-side** cache,
shared across requests from *different* users hitting the same server.
That's the entire point of the extension: a `revalidate: 60` product-list
fetch means the first user's request populates a cache entry that the
next 500 users within that 60-second window all benefit from, without
each of them triggering a fresh call to your backend or database.

## Bypass behavior matters as much as caching behavior

Knowing how to cache is only half the skill — knowing how to
**deliberately not cache** a specific fetch, inside a route where other
fetches are cached, is the part that trips people up. `cache: "no-store"`
on one fetch call doesn't affect any other fetch call in the same
component or route; caching behavior is set per fetch call, not
per-route or globally, unless a route-level segment config (covered
later in this module) overrides it.

## What the practice drill is testing

The options themselves are easy to read about; correctly choosing
between `force-cache`, `no-store`, and a specific `revalidate` window for
different data-freshness requirements within the *same* route — and
getting the syntax exactly right — is what's actually being checked.

**Practice (Semi-Constrained Sandbox):** you'll write a set of raw
`fetch` calls inside a route that require different refresh
characteristics — one that should never go stale, one that should
refresh every few minutes, and one that must always hit the network —
using the correct `cache`/`next.revalidate` configuration for each.
