---
title: "Passing State Across RSC Boundaries"
practiceFormat: sandbox
depth: essential
---

## The direction that always works, and the one that never does

Module 1 established that Server Components can render Client Components
as children, and that props crossing from server to client must be
serializable. This lesson is the practical, state-focused consequence of
that rule: a Server Component parent can hand a client child its
**initial** server-fetched data as a prop, but it can never hand it a
live reference, a function closure, or anything that would need to keep
executing on the server after the initial render.

## The pattern: server fetches, client owns interactive state from there

```tsx
// Server Component
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return <QuantitySelector initialQuantity={1} product={product} />;
}
```

```tsx
// Client Component
"use client";
function QuantitySelector({ initialQuantity, product }: Props) {
  const [quantity, setQuantity] = useState(initialQuantity);
  // quantity is now genuinely client-owned interactive state,
  // seeded from server data but not tied to it afterward
}
```

The server component's job ends at fetching `product` and choosing a
sensible `initialQuantity`. Once that data crosses into `QuantitySelector`,
ongoing interaction state (`quantity`, as the user clicks +/-) is owned
entirely by the client — the server component doesn't re-run every time
the client state changes, and shouldn't.

## The mistake this lesson is inoculating against

Passing an entire server-side object graph down "just in case the client
needs it," rather than deliberately choosing the specific serializable
values a client component's *interactive* state actually needs to seed
from, produces the exact serialization failures Module 1 covered:
functions, class instances, or non-plain-object values baked into a
larger server response quietly break when they hit the client boundary.
The discipline is to seed client state with the minimal, plain-data
subset that server rendering already computed, not to forward server
objects wholesale.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll fetch data inside a
Server Component and correctly seed it as the initial state of a client
component's own interactive state, choosing exactly which fields cross
the boundary rather than forwarding the full server-fetched object.
