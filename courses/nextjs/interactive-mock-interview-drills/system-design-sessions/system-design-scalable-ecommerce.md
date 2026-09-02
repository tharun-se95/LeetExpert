---
title: "System Design: Scalable E-Commerce Platforms"
practiceFormat: canvas-defense
depth: essential
---

## Why e-commerce is the canonical Next.js system design prompt

An e-commerce storefront is the interview world's favorite Next.js
system design scenario precisely because it forces every rendering
strategy from Module 4 to coexist correctly in one coherent system —
there's no single right rendering strategy for the whole site, only a
right strategy *per route type*, and the design exercise is choosing
correctly for each one.

## Mapping route types to rendering strategies

- **Product listing/category pages** — content that's the same for every
  visitor and changes infrequently: a strong candidate for **ISR**,
  serving cached pages instantly while regenerating periodically as
  inventory or pricing changes.
- **Individual product pages** — potentially thousands or millions of
  SKUs, with `generateStaticParams` pre-rendering the most popular
  products at build time and `dynamicParams` handling long-tail products
  on-demand (Module 4's dynamic-params lesson, applied directly).
- **Cart and checkout flows** — genuinely per-user, must-be-fresh data
  (real-time inventory, pricing, the user's actual cart contents): this
  is **SSR** territory, or a statically-shelled page with dynamic holes
  via **Partial Prerendering** for the parts that must be per-user.
- **Search and filtered results** — Module 5's URL-as-state pattern,
  since a shareable, bookmarkable filtered view is a real product
  requirement for e-commerce search.

## Where the mutation and caching layers plug in

Adding an item to a cart is a **Server Action** (Module 3), and the
resulting cart-count badge shown in the site header needs
`revalidateTag` (also Module 3) applied consistently everywhere cart
data is rendered, so a mutation on the product page correctly updates
the header badge without a full page reload.

## What a strong answer demonstrates

The skill being assessed isn't "do you know these individual Next.js
features" — every prior module already tested that. It's whether you can
**correctly assign** each of them to the right part of a single coherent
system, and explain *why* that assignment is correct for that
specific route's actual freshness and personalization requirements.

## What the practice drill is testing

**Practice (Architectural Canvas + Defense):** you'll draw a full
e-commerce storefront's system architecture — mapping each route type to
its appropriate rendering strategy — and verbally defend the design,
explaining the reasoning behind each choice.

## Try it

Map a rendering strategy to each of: the homepage/category pages,
individual product pages, the cart/checkout flow, and search results.
Justify each choice, then compare.

```scratchpad system-design-scalable-ecommerce
// homepage/category:
// product pages:
// cart/checkout:
// search:
```

````reveal A model answer
**Homepage/category pages** — ISR. Same content for every visitor,
changes infrequently (new arrivals, promotions); serving cached pages
instantly while regenerating periodically balances freshness against
speed.

**Product pages** — static generation for the most popular SKUs via
`generateStaticParams`, with `dynamicParams` left at its default `true`
so long-tail products render on-demand rather than 404ing.

**Cart/checkout** — SSR, or a statically-shelled page using Partial
Prerendering for the parts that must be per-user (real-time inventory,
the user's actual cart). This is data that's wrong if served stale, so
speed takes a back seat to correctness here.

**Search results** — URL-as-state (`searchParams`), so a filtered,
searched view is shareable and bookmarkable, with the actual search
query handled server-side per request.

Adding an item to cart is a Server Action; the header's cart-count badge
needs `revalidateTag` applied everywhere cart data renders, so the
mutation updates it without a full reload.
````
