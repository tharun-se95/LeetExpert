---
title: "App Router vs. Pages Router Architectural Paradigm"
practiceFormat: null
depth: essential
---

## Two routers, one framework

If you've read about Next.js from more than one source, you've probably
run into two different ways of organizing a project: the **Pages
Router** (the original, `pages/` directory) and the **App Router** (the
newer, `app/` directory). Interviewers ask about this constantly — partly
because a lot of production code still runs on the Pages Router, and
partly because *why* the App Router exists is a genuinely good test of
whether you understand Next.js's architecture or just its file-naming
conventions.

This lesson isn't a feature checklist of "what's new in the App Router."
It's about the specific architectural problem the Pages Router ran into,
because that problem is what the App Router was built to solve — and
understanding the problem is what lets you explain the solution instead
of just describing it.

## How the Pages Router organized data and layout

In the Pages Router, each file under `pages/` is a route, and each route
file is responsible for two separate things at once: it renders the
page's UI, *and* it exports a special function — most commonly
`getServerSideProps` — that fetches whatever data that page needs. Next.js
calls that function on the server, waits for it to resolve, and only then
renders the page component with the result passed in as props.

That pairing sounds reasonable in isolation. The trouble shows up once
you add shared layout — a sidebar, a header, navigation that should
persist across pages. In the Pages Router, layout isn't a first-class
routing concept; it's typically implemented by wrapping every page's
output in a shared `<Layout>` component from a custom `_app.tsx` file.
That layout wrapper doesn't have its own place in the data-fetching
story — it's just JSX wrapping whatever the page returned.

## Where that breaks down

Here's the concrete problem: suppose your shared layout needs its own
data — say, a sidebar that shows the current user's name and
notification count, present on every single page. In the Pages Router
model, there's no dedicated place for "layout-level data fetching" to
live. Two things commonly happen instead, and both are bad:

1. **Every page's `getServerSideProps` re-fetches the layout data**,
   because that's the only data-fetching mechanism available. Navigate
   between five pages, and you've fetched the same user/notification data
   five separate times — pure duplicated work, on every single
   navigation.
2. **The entire page — layout included — waits on the slowest data
   source.** Because `getServerSideProps` returns one combined props
   object for the whole page, if the page's *own* content depends on a
   slow database query, the header and sidebar (which have nothing to do
   with that query) are stuck waiting for it too. There's no way to say
   "render the layout the instant it's ready, and let the slower content
   stream in after" — it's all one all-or-nothing render.

Neither of these is a minor inconvenience you can code around cleanly
within the model. They're structural: the Pages Router treats "the page"
as the only unit of both rendering and data-fetching, and a real
application's layout hierarchy doesn't match that assumption.

## What the App Router changed

The App Router's core architectural move is to make **layout nesting
itself a routing concept**, not just a JSX convenience. A `layout.tsx`
file at any level of the `app/` directory wraps every route beneath it,
and — this is the important part — **each layout can fetch its own
data, independently, at its own level of the tree.**

That single change resolves both problems from before:

- The sidebar's user/notification data lives in the sidebar's own
  `layout.tsx`. Because a layout persists across navigations within its
  subtree, that data is fetched *once*, not on every page render beneath
  it.
- Different levels of the tree can resolve at different speeds. The
  layout doesn't have to wait for a slow child page's data, because it
  isn't bundled into the same all-or-nothing fetch anymore — each level
  fetches what it needs, when it needs it. (The next module covers
  exactly how this "different parts of the page arrive at different
  times" idea plays out with streaming and Suspense — this lesson is
  just establishing why the architecture makes that possible at all.)

This is why the App Router is often described as "layout-first": layout
composition and data-fetching are unified into the same nested structure,
instead of layout being an afterthought wrapped around a page that does
all the real work alone.

## Why this matters beyond "it's newer"

It's tempting to treat this as "the App Router is strictly better, full
stop" — but the more useful framing, and the one that holds up under
interview follow-up questions, is narrower: **the App Router solves a
specific structural limitation in how the Pages Router coupled
page-level data-fetching to a single, flat unit of rendering.** If your
app genuinely has no meaningful shared layout and no meaningful
difference in data freshness across sections of a page, that specific
problem doesn't bite as hard — but almost every real production
application has *some* shared layout with its own data needs, which is
exactly the case this lesson walked through.

The next lesson moves from "why this architecture exists" to "how it's
actually expressed in the file system" — the concrete conventions
(`page.tsx`, `layout.tsx`, segment folders) that make this layout nesting
real.
