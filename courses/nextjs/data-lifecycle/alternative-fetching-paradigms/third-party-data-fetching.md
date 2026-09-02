---
title: "Integrating Third-Party Data Fetching"
practiceFormat: sandbox
depth: advanced
---

## Why you'd reach outside Next.js's own caching at all

Everything so far in this module has used Next.js's own `fetch`
extensions and cache layers. But many real applications already have —
or specifically want — React Query or SWR: libraries built for
client-side data needs Next.js's server-side caches don't address at all,
like automatic background refetching on window focus, optimistic client
mutations with rollback, or fine-grained per-query cache control that
outlives a single page's server render. The question this lesson answers
is: how do these coexist with an RSC architecture, where data-fetching by
default happens on the server?

## The pattern: fetch on the server, seed the client cache

The correct integration isn't "replace RSC data-fetching with React
Query" — it's "use the server to get data quickly to the client, then
hand that data to React Query as its **initial cache state**, so the
client library doesn't have to make a redundant fetch of data the server
already retrieved."

```tsx
// Server Component
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsClientView />
    </HydrationBoundary>
  );
}
```

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";

function PostsClientView() {
  const { data } = useQuery({ queryKey: ["posts"], queryFn: getPosts });
  // data is already populated from the server prefetch — no loading
  // flash, but useQuery still owns all subsequent client-side behavior
  // (refetch on focus, invalidation, etc.)
}
```

## Why this specific shape, and not something simpler

Without this hand-off, a client component using `useQuery` directly would
fetch on mount, producing a loading flash even though the server already
had the same data available during its own render. `dehydrate`/
`HydrationBoundary` transfers the server's already-fetched query result
into the exact cache shape React Query expects on the client, so the
client library picks up from where the server left off instead of
starting cold.

## What the practice drill is testing

The concept of "prefetch on the server, hydrate on the client" is simple
to state; correctly wiring the `QueryClient`/`dehydrate`/
`HydrationBoundary` plumbing so the client's `useQuery` call actually
matches the server's prefetched query key is where mistakes happen.

**Practice (Semi-Constrained Sandbox):** you'll prefetch a query inside a
Server Component and correctly pass its dehydrated cache state into a
client-side `QueryClient` provider so a child client component's
`useQuery` call resolves instantly from the server-provided data.
