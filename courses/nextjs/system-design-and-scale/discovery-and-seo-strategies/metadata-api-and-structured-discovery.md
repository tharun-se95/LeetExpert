---
title: "Metadata API & Structured Discovery"
practiceFormat: sandbox
depth: essential
---

## Metadata is part of the route, not an afterthought

The App Router treats `<title>`, meta descriptions, and structured data
as first-class route-level concerns, generated the same way page content
is — with a static export for fixed values or a function for values that
depend on the route's actual data.

## Static and dynamic metadata

```tsx
// Static metadata
export const metadata = {
  title: "Pricing — Acme",
  description: "Simple, transparent pricing for teams of any size.",
};
```

```tsx
// Dynamic metadata — depends on route data
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

`generateMetadata` runs on the server, with access to the same route
params a page component receives, and can `await` real data — meaning
each individual blog post gets its own correct, unique title and
description generated from its actual content, rather than every post
sharing one generic fallback.

## Sitemaps and structured markup

A `sitemap.ts` file at the app root can programmatically generate a
sitemap covering every dynamically-generated route (every blog post,
every product page) by querying the same data source `generateStaticParams`
would use — keeping the sitemap automatically in sync with actual
content rather than requiring a manually maintained list. Structured
markup (JSON-LD schemas describing an article, a product, an FAQ) can be
embedded directly in a page's rendered output, giving search engines
machine-readable context beyond plain text — the specific mechanism that
enables rich search results like star ratings or FAQ dropdowns appearing
directly in search listings.

## What makes this a discoverability system, not just page titles

The throughline connecting metadata, sitemaps, and structured data is
that all three are inputs to how search engines and other automated
consumers understand and index your content — none of them are visible
to a human visitor directly, but all three materially affect whether and
how your content surfaces in search results at all.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll write a
`generateMetadata` function that produces correct, data-driven titles
and descriptions per route, including structured markup output for a
content type of your choosing.

## Try it

Write `generateMetadata` for `app/blog/[slug]/page.tsx` so each post
gets its own real title and description, rather than a shared fallback.

```scratchpad metadata-api-and-structured-discovery
export async function generateMetadata({ params }) {
  // ...
}
```

````reveal Work through it
```ts
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

`generateMetadata` runs on the server with access to the same route
params the page component receives, and can `await` real data — so each
post's tab title and search-result snippet reflect that specific post's
actual content, rather than a single generic fallback shared across
every blog post on the site.
````
