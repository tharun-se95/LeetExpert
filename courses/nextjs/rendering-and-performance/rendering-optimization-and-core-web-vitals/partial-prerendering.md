---
title: "Partial Prerendering (PPR)"
practiceFormat: pr-review
depth: advanced
---

## Collapsing the static/dynamic choice into one route

Every rendering strategy covered so far has been a **per-route** choice:
a route is either static (SSG/ISR) or dynamic (SSR), with streaming
letting parts of a dynamic route arrive at different times but not
changing which category the *route itself* falls into. Partial
Prerendering is a genuinely different idea: **a single route can have a
static shell and dynamic holes, served together as one response**, with
the static shell served instantly from a prerendered cache and the
dynamic holes streamed in afterward using the same Suspense mechanism
from the previous lesson.

## What this looks like in practice

```tsx
export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <StaticProductShell />       {/* prerendered, served instantly */}
      <Suspense fallback={<CartSkeleton />}>
        <PersonalizedCart userId={params.id} />  {/* dynamic hole */}
      </Suspense>
    </div>
  );
}
```

The navigation chrome, product images, and description can all be
prerendered once at build time — they're identical for every visitor.
The personalized cart contents genuinely can't be prerendered, since they
depend on who's asking. PPR serves the prerendered shell as a static
response instantly, then streams the dynamic hole's content in — without
forcing the *entire* route into SSR just because one part of it needs
per-request data.

## The trap: one uncached dynamic call can silently opt in the whole route

This is exactly why the practice format for this lesson is a code
review rather than a build-from-scratch exercise: the most common PPR
bug isn't a syntax error, it's an **accidental scope expansion**. If a
dynamic data call — reading cookies, headers, or an uncached fetch — sits
*outside* a Suspense boundary, at the top level of a route meant to be
mostly static, it can force Next.js to treat far more of that route as
dynamic than intended, quietly erasing the performance benefit PPR was
supposed to provide, without producing any visible error.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll audit a route using
Partial Prerendering and identify a dynamic data-access call placed
outside its Suspense boundary that's forcing more of the layout into
dynamic rendering than intended, then correctly re-scope it.
