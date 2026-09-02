---
title: "Route Groups and Semantic Isolation"
practiceFormat: sandbox
depth: essential
---

## The problem: organization without changing the URL

Every folder-naming convention covered in this module so far has one
thing in common: the folder name becomes part of the URL. That's usually
exactly what you want — but sometimes you want to organize your route
files into logical groups (for readability, for applying a shared layout
to a specific subset of routes) **without** that grouping showing up in
the actual URL a user sees. Route groups solve that specific,
narrow problem.

## The syntax: parentheses, not brackets

Wrapping a folder name in parentheses — `(marketing)`, `(dashboard)` —
creates a **route group**: a folder that exists in your file system and
can hold a shared `layout.tsx` or organize related routes together, but
is **completely invisible in the resulting URL**.

Concretely:

```
app/
  (marketing)/
    layout.tsx        — a marketing-specific layout (nav, footer)
    page.tsx            — resolves to "/"
    about/
      page.tsx           — resolves to "/about"
  (dashboard)/
    layout.tsx        — a completely different, dashboard-specific layout
    page.tsx            — resolves to "/dashboard"... 
```

Wait — that last line needs a correction, and it's the exact detail this
lesson is testing whether you've actually understood, not just skimmed:
`app/(dashboard)/page.tsx` resolves to `/`, not `/dashboard`, because
`(dashboard)` is a route group — its name is invisible in the URL. If you
wanted an actual `/dashboard` path, you'd need a real (non-parenthesized)
`dashboard` folder inside or alongside the group. Route groups organize
your file tree and let you apply different layouts to different
*sections* of your app — they are not a shorthand for adding a URL
prefix.

## Why this specific capability matters

Without route groups, applying genuinely different top-level layouts to
different sections of your app — a marketing site's nav-and-footer chrome
versus a logged-in dashboard's sidebar-and-topbar chrome — would force
you into either duplicating layout logic inside every individual page, or
building one shared root layout complicated enough to conditionally
render different chrome depending on the current path. Route groups let
each section own its own `layout.tsx`, cleanly, at the file-system level,
without any of that path-based branching logic.

The isolation goes both ways: `(marketing)`'s layout doesn't leak into
`(dashboard)`'s routes, and vice versa — from the URL's perspective, both
groups' routes simply live directly under the site root, but from the
file system's perspective (and therefore the layout-application
perspective), they're cleanly separated trees.

## What the practice drill is testing

The syntax itself (parentheses around a folder name) is simple to read
about; correctly reasoning about what URL a given file tree actually
produces — especially catching the "the group name is invisible" detail
that the walkthrough above deliberately called out — is where this gets
tested in practice.

**Practice (Semi-Constrained Sandbox):** you'll organize a dashboard
application to expose two distinct sections — authentication-related
pages and user-settings pages — each with its own isolated layout, under
a single unified URL structure where the route-group boundaries
themselves don't appear anywhere in the resulting paths.

## Try it

Design a file tree so `/login` and `/signup` share one minimal
"auth" layout (no sidebar, centered card), while `/profile` and
`/billing` share a completely different "account" layout (sidebar,
top bar) — with none of that grouping visible in the URLs.

```scratchpad route-groups-and-semantic-isolation
// Sketch the app/ folder structure here.
```

````reveal Work through the tree
```
app/
  (auth)/
    layout.tsx        — centered-card layout, no sidebar
    login/
      page.tsx          — /login
    signup/
      page.tsx          — /signup
  (account)/
    layout.tsx        — sidebar + top bar layout
    profile/
      page.tsx          — /profile
    billing/
      page.tsx          — /billing
```

Both `(auth)` and `(account)` are route groups — their names never
appear in a URL — so `/login`, `/signup`, `/profile`, and `/billing` all
resolve exactly as written, with each pair sharing its own isolated
layout. Naming the folders as plain `auth/` and `account/` (no
parentheses) instead would have produced `/auth/login` and
`/account/profile` — a URL structure the requirement explicitly ruled
out.
````
