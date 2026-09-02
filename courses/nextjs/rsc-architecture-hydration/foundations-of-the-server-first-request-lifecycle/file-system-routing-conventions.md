---
title: "File-System Routing Conventions"
practiceFormat: sandbox
depth: essential
---

## The file system is the router

Next.js's App Router takes a position that surprises developers coming
from most other frameworks: **there is no separate routing configuration
file.** You don't maintain a list of paths mapped to components anywhere.
Instead, the folder structure under `app/` *is* the route structure —
every folder is a URL segment, and a small set of special file names
inside that folder determine what actually renders and how.

Understanding these conventions precisely matters more than it might
seem, because almost every other App Router feature (layouts, loading
states, error boundaries, parallel routes in a later lesson) is expressed
as *another special file added to the same folder*. If the base
convention isn't solid, everything built on top of it feels arbitrary
instead of consistent.

## The three files that matter first

**`page.tsx`** — this is what makes a folder a real, navigable route. A
folder under `app/` with no `page.tsx` inside it is *not* a URL a user
can visit; it exists only to hold children or a shared layout. Concretely,
`app/dashboard/settings/page.tsx` is what makes `/dashboard/settings`
resolve to actual content. Without that file, `/dashboard/settings`
returns a 404, even if other files exist in that folder.

**`layout.tsx`** — this wraps `page.tsx` (and every nested route beneath
it) with shared UI. Critically, a layout **persists across navigations**
within its subtree — if a user moves from `/dashboard/settings` to
`/dashboard/billing`, and both live under a `dashboard/layout.tsx`, that
layout is not re-mounted. Its own state survives the navigation, which is
exactly the mechanism the previous lesson described: the sidebar doesn't
re-fetch its data on every page change, because it isn't re-rendering
from scratch on every page change either.

**Segment folders** — every folder name between `app/` and the file
becomes a literal path segment. `app/dashboard/settings/page.tsx` maps to
`/dashboard/settings`; the folder nesting *is* the URL nesting, with no
separate mapping step required.

## Why layout nesting controls more than visual layout

Here's the detail that's easy to skim past and important to actually sit
with: because a layout wraps everything beneath it, **the layout also
defines a server-render boundary.** Each layout's own server-side work
(any data it fetches, before this course gets to Server Components and
Server Actions in detail) happens independently of the page nested inside
it. A slow page doesn't block a fast layout from being ready, and — just
as importantly — a layout's own re-render doesn't force everything nested
inside it to restart from zero.

This is why "where do I put this layout file?" isn't a purely cosmetic
decision. Put a layout too high in the tree, and you lose the ability for
sibling routes beneath it to render independently. Put it too low (or
skip it, repeating the same wrapper JSX inside every individual
`page.tsx`), and you lose the persistence and shared-fetch benefits from
the previous lesson entirely — you're back to the Pages Router's
all-or-nothing rendering, just implemented differently.

## Nesting in practice

Consider this structure:

```
app/
  layout.tsx              — wraps the entire site
  dashboard/
    layout.tsx             — wraps everything under /dashboard
    page.tsx                — the /dashboard route itself
    settings/
      page.tsx               — /dashboard/settings
    billing/
      page.tsx               — /dashboard/billing
```

Navigating between `/dashboard/settings` and `/dashboard/billing` remounts
neither the root layout nor the dashboard layout — only the `page.tsx`
content actually changes. That's not an optimization you have to opt
into; it's the direct, structural consequence of where each `layout.tsx`
sits in the folder tree.

## What you're building in this lesson's practice

The concepts above are straightforward to *state*. The part that actually
trips people up in an interview setting — and in real projects — is
correctly predicting which files need to exist, and at which folder
depth, to produce a specific desired routing behavior. That's a
"design the file tree correctly" skill, not a "read about it" skill,
which is exactly why this lesson ends in a sandbox exercise instead of
just a summary.

**Practice (Semi-Constrained Sandbox):** you'll be given a target
application shape — a dashboard with a persistent top-level shell and two
independent sub-sections that should each keep their own local layout
state across navigation between them — and asked to set up the nested
directory structure (the folders and the specific special files within
them) that produces exactly that behavior. The constraint that makes this
a real interview-style exercise rather than a copy-paste exercise: no
autocomplete or file-tree suggestions — you have to know which file names
Next.js actually looks for, not recognize them from a dropdown.

## Try it

Design the file tree for this app: a root shell with global navigation,
and two independent sections — `/dashboard/reports` and
`/dashboard/team` — each of which should keep its own local UI state
(an open filter panel, a selected tab) when a user navigates *within*
that section, without either section's state leaking into the other or
resetting on every click. Write out the folder/file structure below as
comments, the way the nesting diagram above did it.

```scratchpad file-system-routing-conventions
// Sketch the folder tree here. Example format:
// app/
//   layout.tsx        — ...
//   dashboard/
//     ...
```

````reveal A worked file tree
One correct shape:

```
app/
  layout.tsx                    — global nav, wraps everything
  dashboard/
    layout.tsx                   — shared dashboard chrome (sidebar)
    page.tsx                      — /dashboard itself
    reports/
      layout.tsx                  — reports-local state lives here
      page.tsx                     — /dashboard/reports
      [id]/
        page.tsx                   — /dashboard/reports/[id]
    team/
      layout.tsx                  — team-local state lives here
      page.tsx                     — /dashboard/team
```

The key decision: each section (`reports/`, `team/`) gets **its own
`layout.tsx`**, not just a `page.tsx`. That section-scoped layout is
where local UI state (a filter panel, a selected tab) actually lives —
because a layout persists across navigation *within its own subtree*,
moving from `/dashboard/reports` to `/dashboard/reports/42` keeps
`reports/layout.tsx` mounted, preserving its state, while moving over to
`/dashboard/team` mounts `team/layout.tsx` fresh, with no shared state
between the two sections at all. Putting that same state one level up in
`dashboard/layout.tsx` instead would have been the wrong call — it would
force both sections to share state that should stay independent.
````
