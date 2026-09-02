---
title: "Managing URL-as-State"
practiceFormat: sandbox
depth: essential
---

## Why the URL is sometimes the correct state container

A filter sidebar's selected options could live in `useState` — but doing
that means the current filter selection is invisible to anyone the user
shares a link with, and disappears the moment they refresh the page. The
first lesson in this module named this directly: state describing "what
am I currently looking at" belongs in the URL, via `searchParams`, not in
client-only component state.

## Reading search params in a Server Component

```tsx
export default function ProductList({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  const products = await getProducts({
    category: searchParams.category,
    sort: searchParams.sort,
  });
  return <ProductGrid products={products} />;
}
```

A Server Component receives `searchParams` directly as a prop — no
client-side hook needed to read the current filter state during the
initial server render.

## Writing search params from client interaction

```tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function CategoryFilter({ category }: { category: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selectCategory(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("category", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return <select onChange={(e) => selectCategory(e.target.value)}>{/* ... */}</select>;
}
```

Updating the URL via `router.push` with a modified `URLSearchParams`
triggers a client-side navigation to the new URL — which re-runs the
Server Component above with the new `searchParams`, fetching filtered
data, **without unmounting the surrounding layout** the way a full page
navigation would, since this is App Router client-side navigation, not a
hard reload.

## Why "without unmounting layouts" is the specific engineering goal

The naive alternative — reloading the whole page on every filter change
— would work functionally but would re-run and re-render everything,
including layout chrome that never needed to change. Driving filter
state through `searchParams` combined with client-side navigation gets
both properties at once: shareable, refresh-safe state, and a
surgical update that only re-renders the parts of the tree that actually
depend on the changed param.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll implement a multi-filter
sidebar where each filter selection updates the URL's search params via
client-side navigation, and a Server Component reads those params to
render filtered results, without a full page reload.

## Try it

Wire up a sort dropdown that updates a `sort` search param without a
full page reload, read by a Server Component.

```scratchpad managing-url-as-state
"use client";
function SortDropdown() {
  // ...
}
```

````reveal Work through it
```tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select onChange={(e) => handleChange(e.target.value)}>
      <option value="newest">Newest</option>
      <option value="price">Price</option>
    </select>
  );
}
```

```tsx
export default async function ProductList({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const products = await getProducts({ sort: searchParams.sort });
  return <Grid products={products} />;
}
```

`router.push` triggers a client-side navigation to the new URL, which
re-runs the Server Component with the updated `searchParams` — no full
reload, and the resulting URL is shareable and refresh-safe.
````
