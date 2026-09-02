---
title: "Dynamic Social Graph Image Generation"
practiceFormat: sandbox
depth: essential
---

## The image that shows up when a link gets shared

When a URL gets pasted into Slack, Twitter, or iMessage, the preview
card that appears — image, title, snippet — is built from Open Graph
(OG) meta tags the page provides. For a site with a handful of static
pages, a single hand-designed OG image is fine. For a site with
hundreds of dynamically-generated pages — every blog post, every product
— hand-designing an image per page is not feasible, and a single generic
fallback image for every post loses real engagement value (a post's
actual title and author, visible directly in the shared preview, is a
meaningfully better click-through experience than a generic logo).

## Generating images programmatically

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div style={{ fontSize: 64, background: "white", padding: 60 }}>
        {post.title}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

`@vercel/og`'s `ImageResponse` renders JSX — the same component syntax
used everywhere else in this course — directly into a real PNG image at
request time, meaning each blog post's OG image is generated
individually, with that specific post's real title and any other data
you choose to render into the layout, rather than a single static
asset shared across every post.

## Why this connects back to caching

A dynamically-generated image at request time sounds expensive if it
regenerates on every single share — but this is the exact same caching
model from Module 3: the generated image response can be cached, so the
actual rendering cost is paid once per post (or once per revalidation
window), not on every individual social-media crawl or user share.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll implement a dynamic
`opengraph-image` route that renders a post's actual title and metadata
into a generated social-card image, correctly sized for standard OG
image dimensions.

## Try it

Write `app/blog/[slug]/opengraph-image.tsx` so sharing a blog post link
shows that post's real title in the preview card image.

```scratchpad dynamic-social-graph-image-generation
import { ImageResponse } from "next/og";

export default async function Image({ params }) {
  // ...
}
```

````reveal Work through it
```tsx
import { ImageResponse } from "next/og";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return new ImageResponse(
    <div style={{ fontSize: 64, background: "white", padding: 60 }}>
      {post.title}
    </div>,
    { width: 1200, height: 630 },
  );
}
```

The key move: fetching `post` inside `opengraph-image.tsx` using the
same route `params` a normal page would receive, so each individual post
gets its own genuinely rendered image showing its actual title — not a
single shared static asset every post's share link would otherwise use.
`1200×630` is the standard OG image aspect ratio most platforms expect.
````
