---
title: "Dynamic Routing Segments"
practiceFormat: sandbox
depth: essential
---

## When a folder name isn't fixed text

Module 1 covered how a plain folder name maps directly to a URL segment
— `app/dashboard/settings/page.tsx` becomes `/dashboard/settings`, with
no ambiguity about what that folder means. But most real applications
need routes where part of the URL isn't fixed text at all: a blog post's
slug, a product ID, a username. This lesson covers the three folder-
naming conventions the App Router uses to express "this part of the URL
is a variable," and — just as important — where each one stops being the
right tool.

## Single dynamic segments: `[param]`

Wrapping a folder name in square brackets — `app/blog/[slug]/page.tsx` —
tells Next.js that this segment matches *any* single URL segment, and
makes that matched value available to your code as a parameter named
`slug`. `/blog/hello-world` and `/blog/my-second-post` both match this
route, with `slug` resolving to `"hello-world"` or `"my-second-post"`
respectively.

The constraint worth internalizing: a single dynamic segment matches
**exactly one** path segment — no slashes. `/blog/hello-world` matches;
`/blog/2024/hello-world` does not match `[slug]` alone, because that's
two segments where the route only declared one variable position.

## Catch-all segments: `[...param]`

Sometimes you genuinely want to match an arbitrary number of segments
under one route — a documentation site where `/docs/react/hooks/useState`
and `/docs/getting-started` should both resolve to the same route
template, just with a different number of path parts. `[...slug]` (three
dots, inside the brackets) captures everything after that point in the
path as an **array**. For `app/docs/[...slug]/page.tsx`, visiting
`/docs/react/hooks/useState` gives you `slug = ["react", "hooks",
"useState"]` — one array, however many segments actually matched.

The trade-off: a catch-all segment matches **one or more** segments — it
still requires at least one. `/docs` by itself (with nothing after it)
does **not** match `[...slug]`, because there's nothing to capture into
the array.

## Optional catch-all segments: `[[...param]]`

This is the fix for that exact gap: doubling the outer brackets —
`[[...slug]]` — makes the catch-all match **zero or more** segments,
which means the route also matches the base path with nothing after it
at all. `app/docs/[[...slug]]/page.tsx` matches `/docs` (with `slug`
resolving to `undefined` or an empty array, depending on how you read it)
*and* `/docs/react/hooks/useState` (same as the required version).

## Choosing between them isn't guesswork

The three options map directly onto three different real shapes of URL
structure, and picking the right one is a design decision, not a
syntax preference:

- **One variable part, always exactly one segment** (a specific post, a
  specific user profile): `[param]`.
- **A variable-depth path that always has *something* after the fixed
  prefix** (a nested docs structure where a bare `/docs` isn't itself a
  valid page): `[...param]`.
- **A variable-depth path where the bare prefix is also a valid page on
  its own** (a docs home page that also needs to handle arbitrarily
  nested sub-pages under the same route file): `[[...param]]`.

Reaching for a catch-all when a single dynamic segment would do adds
unnecessary array-handling code for no benefit; reaching for a single
segment when you actually need variable depth means your route simply
won't match the deeper URLs at all.

## What the practice drill is testing

The conceptual distinction above is straightforward to state; correctly
choosing and wiring up the right convention for a specific target URL
shape — including getting the folder naming exactly right — is the part
that actually gets tested.

**Practice (Semi-Constrained Sandbox):** you'll be given a set of target
URL patterns a route needs to support, and asked to configure the correct
route directory structure (choosing between `[param]`, `[...param]`, and
`[[...param]]`) to make exactly those patterns resolve correctly, without
breaking the route's existing boundaries.
