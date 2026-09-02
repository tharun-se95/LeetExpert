---
title: "Middleware Fundamentals"
practiceFormat: sandbox
depth: essential
---

## Code that runs before your routing even decides what matches

Everything covered so far in this module happens *after* Next.js has
already decided which route matches an incoming request. Middleware runs
**before** that — it intercepts the request at the earliest possible
point, before any route, layout, or page component has been selected,
and it can inspect, modify, or redirect the request before normal routing
even begins.

## The file and its shape

A single `middleware.ts` file at your project root (not nested inside
`app/`) defines your middleware. It exports a function that receives the
incoming request and returns a response describing what should happen
next:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.headers.get("x-user-country");
  if (country === "FR" && !request.nextUrl.pathname.startsWith("/fr")) {
    return NextResponse.redirect(new URL("/fr", request.url));
  }
  return NextResponse.next();
}
```

`NextResponse.next()` tells Next.js to continue normal routing as if
middleware hadn't intervened. `NextResponse.redirect(...)` sends the
browser to a different URL entirely, short-circuiting normal routing for
this request.

## What middleware is actually good for

The unifying theme across middleware's real use cases is: **decisions
that need to happen based on the request itself, before any page-specific
logic runs.**

- **Redirects based on request properties** — locale detection (the
  example above), device type, feature-flag rollout percentages.
- **Rewriting the destination** — serving different content at the same
  URL depending on a cookie or header, without the browser's address bar
  changing (distinct from a redirect, which does change the visible URL).
- **Reading and setting cookies or headers** — attaching an auth token
  check's result as a header downstream code can read, without every
  individual route needing to re-implement that check.
- **Early authentication gating** — checking whether a session exists at
  all before a request even reaches a protected route (the next chapter's
  middleware-based route-guarding lesson builds directly on this).

## What middleware is not for

It's tempting to reach for middleware as a general-purpose "run this
logic on every request" hook, but that instinct causes real problems —
which the very next lesson in this chapter covers in depth. For now, the
short version: middleware runs on **every single matching request by
default**, including requests for static assets unless you explicitly
scope it otherwise. Heavy logic placed here — a slow external API call, a
full database lookup — becomes a tax paid on every request that matches,
not just the ones that actually need that logic.

## What the practice drill is testing

The syntax for reading a request and returning a response is
straightforward; correctly expressing a real-world conditional
redirect/rewrite rule — and getting the `NextResponse` method right for
the intended behavior — is the actual skill being checked.

**Practice (Semi-Constrained Sandbox):** you'll write a middleware
function implementing a localized redirect workflow, inspecting request
headers to decide when a redirect should fire and constructing the
correct destination URL.

## Try it

Write middleware that redirects any request where the `x-user-country`
header is `"DE"` to a `/de` prefixed version of the same path — but only
if the path isn't already under `/de`.

```scratchpad middleware-fundamentals
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ...
}
```

````reveal Work through it
```ts
export function middleware(request: NextRequest) {
  const country = request.headers.get("x-user-country");
  if (country === "DE" && !request.nextUrl.pathname.startsWith("/de")) {
    return NextResponse.redirect(new URL(`/de${request.nextUrl.pathname}`, request.url));
  }
  return NextResponse.next();
}
```

The `!request.nextUrl.pathname.startsWith("/de")` guard is the detail
worth noticing: without it, a request already at `/de/pricing` would get
redirected to `/de/de/pricing`, and the one after that to
`/de/de/de/pricing` — an infinite redirect loop, since the middleware
re-evaluates on every request including the one it just redirected to.
````
