---
title: "Dynamic Params & Static Generation"
practiceFormat: sandbox
depth: essential
---

## Static generation needs to know what to generate

SSG works by pre-rendering pages at build time — but a page like
`/blog/[slug]/page.tsx` has an infinite space of possible `slug` values.
Next.js has no way to statically generate a page for every possible slug
unless you explicitly tell it which ones exist. `generateStaticParams`
is that mechanism.

## The function

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}
```

At build time, Next.js calls `generateStaticParams`, gets back a list of
param objects, and pre-renders one static page per entry — turning a
dynamic route segment into a set of genuinely static pages, with all of
SSG's speed benefits, despite the route being defined with a dynamic
`[slug]` folder.

## What happens for a slug that wasn't in the list

This is the detail that separates surface familiarity from real
understanding: what happens when a request comes in for a `slug` that
existed in the database *after* the last build, and therefore wasn't
included in `generateStaticParams`'s build-time list? The behavior
depends on the route segment's `dynamicParams` export:

- **`dynamicParams = true`** (the default) — Next.js renders that page
  on-demand, on the server, the first time it's requested, then caches
  the result for subsequent requests — extending ISR-like behavior to
  params that didn't exist at build time.
- **`dynamicParams = false`** — any param not in the static list returns
  a 404, with no on-demand fallback rendering at all. This is the right
  choice when the full universe of valid params truly is closed and known
  at build time, and an unlisted param genuinely should be treated as
  invalid rather than lazily generated.

## What the practice drill is testing

Writing `generateStaticParams` itself is mechanical; correctly reasoning
about the fallback behavior for a param outside the pre-generated set —
and choosing the right `dynamicParams` setting for a given content
model — is the actual skill.

**Practice (Semi-Constrained Sandbox):** you'll write
`generateStaticParams` configuration for a multi-page blog, correctly
shaping the returned param objects to match the route's dynamic segment,
and configure fallback behavior for slugs outside the pre-generated set.
