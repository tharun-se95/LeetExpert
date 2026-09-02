---
title: "Streaming SSR & Suspense Boundaries"
practiceFormat: trace
depth: essential
---

## The problem with "wait for everything, then send everything"

Traditional SSR renders a page's entire HTML on the server before
sending any of it to the browser. If one part of that page depends on a
slow data source — a third-party API, a heavy aggregation query — the
**entire page** waits for that one slow piece, even if every other part
of the page was ready instantly. The user sees a blank screen for exactly
as long as the slowest piece takes, no matter how fast the rest of the
page could have been.

## Streaming breaks the page into independently-ready chunks

```tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      <Header />
      <Suspense fallback={<SkeletonWidget />}>
        <SlowRecommendations />
      </Suspense>
      <Suspense fallback={<SkeletonWidget />}>
        <SlowActivityFeed />
      </Suspense>
    </div>
  );
}
```

Wrapping a slow component in `<Suspense>` tells Next.js: send the rest of
the page's HTML **immediately**, show this component's `fallback` in its
place, and stream in the real content for this specific boundary the
moment its data resolves — without blocking anything else on the page.
The `<Header>` here, and any other content outside a Suspense boundary,
reaches the browser and becomes visible right away, regardless of how
slow `SlowRecommendations` turns out to be.

## Where you place the boundary is the actual design decision

The API is simple; the skill is architectural — deciding **which pieces
of a page deserve their own Suspense boundary**. Wrap too coarsely (one
boundary around the whole page) and you're back to blocking everything
on the slowest piece. Wrap too granularly and you create a page that
visibly pops in piece by piece in a way that reads as janky rather than
progressive. The right boundary sits around exactly the slow,
independently-useful unit of content — typically a specific data-heavy
widget, not an entire page section that mixes fast and slow data
together.

## What the practice drill is testing

**Practice (Trace-the-Execution):** you'll be given a component tree
containing one deliberately slow third-party fetch mixed in with fast
content, and asked to position a Suspense boundary that isolates exactly
the slow fetch — letting the rest of the page stream in immediately
rather than waiting on it.
