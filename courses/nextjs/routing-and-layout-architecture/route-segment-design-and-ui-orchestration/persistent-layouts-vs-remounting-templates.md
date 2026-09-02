---
title: "Persistent Layouts vs. Remounting Templates"
practiceFormat: sandbox
depth: essential
---

## A file that looks like `layout.tsx` but behaves differently

Module 1 established that `layout.tsx` persists across navigations
within its subtree — its state survives, it doesn't remount, and that
persistence is exactly what makes shared, single-fetch layout data
possible. `template.tsx` is a special file that looks almost identical in
how you write it — same shape, wraps child routes the same way — but
makes the *opposite* choice: **a template remounts on every navigation
within its subtree**, discarding and rebuilding its state each time.

This lesson is about knowing which behavior you actually want, because
picking the wrong one produces bugs that are easy to misdiagnose — state
that mysteriously "sticks around" when you expected a reset, or state
that "mysteriously resets" when you expected it to persist.

## Why you'd deliberately want remounting

At first glance, remounting sounds like something to avoid — isn't the
whole point of `layout.tsx` to *avoid* unnecessary remounts? But there
are real cases where remounting on every navigation is exactly the
correct behavior:

- **Entrance animations.** If a section of your UI should visibly
  animate in every time a user navigates to a route beneath it — not just
  the first time, but every single time — that animation needs to
  actually restart, which requires the component to genuinely remount.
  A persistent layout wouldn't remount, so an entrance animation tied to
  its mount lifecycle would only ever play once.
- **Per-page state resets.** Consider a multi-step form wizard, or a
  local UI state (like "which accordion section is open") that should
  reset back to its default every time the user lands on that route
  fresh, rather than remembering whatever state it was left in from a
  previous visit. A persistent layout would carry that state forward
  across navigations, which is the wrong behavior here.
- **Effects that should re-run per navigation.** A `useEffect` inside a
  layout fires on mount; if you want that effect's logic (say, a
  navigation-tracking analytics call) to run *every single time* a route
  beneath it is visited, that requires a fresh mount each time —
  something a persistent layout structurally won't give you.

## The concrete mechanism

Structurally, `template.tsx` and `layout.tsx` can coexist at the same
folder level, wrapping the same routes — Next.js renders a `layout.tsx`
first (if present), and a `template.tsx` inside it wraps the actual page
content with its own, separately-remounting boundary. The layout's
persistent state (the shared header, the sidebar) stays put; only the
content inside the template's boundary remounts on each navigation.

## The decision this lesson is really teaching

Don't think of this as "layout is the default, template is the special
case" or vice versa — think of it as a direct question about the UI
you're building: **should this piece of the tree remember its state
across navigation, or should it start fresh every time?** If you're not
sure, the persistent behavior (`layout.tsx`) is almost always the safer
default for shared chrome, since it's also the one that gives you the
single-fetch, no-unnecessary-rerender benefits from Module 1. Reach for
`template.tsx` specifically when you've identified a concrete reason you
need a fresh mount on every visit.

## What the practice drill is testing

The two files look nearly identical to write; the skill being tested is
recognizing, from a described UI requirement, which behavior is actually
needed — and then correctly refactoring code that has this choice wrong.

**Practice (Semi-Constrained Sandbox):** you'll be given a route segment
that needs to preserve a user's local component input state across
sibling-page navigation (the state should carry over, not reset) — you'll
identify why the current setup doesn't achieve that, and refactor the
route segment to use the correct file so the state actually persists.
