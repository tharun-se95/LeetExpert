---
title: "Mapping Core Web Vitals to Rendering Decisions"
practiceFormat: null
depth: essential
---

## Three metrics, and what each one is actually measuring

Core Web Vitals are the specific, measurable numbers behind the vague
phrase "performance" — and each one is sensitive to a different category
of architectural decision this course has already covered.

- **LCP (Largest Contentful Paint)** — how long until the largest
  visible content element (usually a hero image or headline) finishes
  rendering. Directly affected by rendering strategy: an SSG/ISR page
  can paint its LCP element almost immediately since the HTML is already
  built; a slow SSR page or a client-rendered CSR page delays it.
- **INP (Interaction to Next Paint)** — how long the page takes to
  visibly respond after a user interaction (a click, a keypress).
  Dominated by client-side JavaScript execution cost — a huge bundle
  blocking the main thread, or an expensive re-render, both worsen INP
  regardless of how the initial page was rendered.
- **CLS (Cumulative Layout Shift)** — how much visible content
  unexpectedly moves after it's already rendered. Caused by content
  loading in without reserved space — images without dimensions, fonts
  swapping in with different metrics, injected banners.

## Why streaming specifically improves LCP

Connecting this directly to the previous lesson: a page using Suspense
boundaries to stream in slow content lets the **fast, above-the-fold
content** — frequently the LCP element itself — reach the browser and
paint immediately, without waiting on a slow, unrelated widget elsewhere
on the page. This is a concrete, causal link between an architectural
choice from two lessons ago and a specific, named metric: streaming
doesn't just feel faster, it measurably improves LCP by decoupling the
LCP element's render timing from the slowest data dependency on the
page.

## Why this reframing matters for an interview

"Make the site faster" is not an answerable engineering question. "This
route's LCP is high because the hero image isn't using `next/image`'s
priority loading" is. The skill this lesson builds is translating a
vague performance complaint into the specific Core Web Vital it maps to,
and from there into the specific Next.js pattern — from this module or
earlier ones — that actually addresses it, which is exactly the shape of
reasoning the next few lessons' practice drills exercise directly.
