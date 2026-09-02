---
title: "Integrating Global Client Stores"
practiceFormat: sandbox
depth: essential
---

## The scoping mistake that's specific to the App Router

Zustand, Redux, and React Context all predate the App Router, and their
documentation generally assumes a client-only app where you instantiate
one global store once, at the top of the tree, and it lives for the
lifetime of the page. In an App Router app — where Server Components
render on the server and don't persist as long-lived instances the way a
client SPA's root component does — naively creating a store at module
scope creates a bug that's specific to this architecture: **a store
instance meant to be per-user or per-request accidentally becomes a
single, shared instance across every request the server handles.**

## Why module-scope instantiation is the trap

```ts
// WRONG in an App Router server context
export const store = createStore(...); // module-level singleton
```

A module is loaded once and reused across requests on the server. If
this store is meant to hold something like per-user cart contents, every
user hitting this server process would be reading and writing the
*same* store instance — a correctness bug that's invisible in local
development with one browser tab open, and only shows up under real
concurrent traffic.

## The correct pattern: instantiate inside a client component, provide via context

```tsx
// store-provider.tsx
"use client";
import { createContext, useRef, useContext } from "react";
import { createStore } from "zustand";

const StoreContext = createContext(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createStore(/* ... */));
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}
```

Creating the store **inside** a client component, held in a `useRef` so
it survives re-renders without being recreated, and providing it via
Context, ensures each client-side mount gets its own store instance,
scoped correctly to that user's session rather than shared at the module
level across the server process.

## Where in the tree to place the provider

Wrapping the provider around only the subtree that actually needs the
store — rather than the entire root layout — keeps unrelated parts of
the tree free of an unnecessary client-component boundary, consistent
with the client/server boundary principles from Module 1.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll wrap a custom Zustand
store provider around a specific subtree of a layout, correctly
instantiating the store inside a client component rather than at module
scope, avoiding the cross-request sharing bug this lesson describes.

## Try it

This cart store is created at module scope. What's wrong with it, and
how would you fix it?

```scratchpad integrating-global-client-stores
export const cartStore = createStore(() => ({ items: [] }));
```

````reveal Work through it
A module is loaded once and reused across every request the server
process handles. A cart store created at module scope becomes a single
shared instance across every user hitting this server — one user's cart
additions would be visible to another user reading the same store.

```tsx
"use client";
import { createContext, useRef } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createStore(() => ({ items: [] })));
  return (
    <CartContext.Provider value={storeRef.current}>
      {children}
    </CartContext.Provider>
  );
}
```

Creating the store inside a client component, held in `useRef`, gives
each client mount its own instance — scoped correctly per user session
instead of shared across the server process.
````
