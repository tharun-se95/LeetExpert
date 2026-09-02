---
title: "Code Splitting & Dynamic Imports"
practiceFormat: sandbox
depth: essential
---

## Automatic splitting already does a lot for you

Next.js automatically splits your client JavaScript by route — visiting
`/dashboard` doesn't download the JavaScript needed for `/settings`. This
happens without any configuration, purely as a consequence of the file-
system routing structure this course covered in Module 2. But automatic,
route-level splitting doesn't help with a heavy component that lives
*within* a single route and isn't needed until well after that route's
initial render.

## Manual splitting with `next/dynamic`

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

This defers loading `HeavyChart`'s JavaScript until it's actually needed
— commonly wired to a user interaction (expanding a panel, switching a
tab) rather than downloading it as part of the initial page bundle
regardless of whether the user ever triggers it.

## Why `ssr: false` is sometimes the deliberate choice

Setting `ssr: false` tells Next.js not to render this component on the
server at all — it renders purely on the client, after the JS bundle
containing it has loaded. This is the right call for components that
depend on browser-only APIs (`window`, canvas rendering libraries) that
would fail or behave incorrectly during a server render — a heavy
charting library that reads the browser's viewport dimensions directly
is exactly the kind of thing that has no meaningful server-rendered
output anyway.

## The trade-off this decision is actually making

```tip
Deferring a component's load until interaction reduces the **initial**
bundle size and therefore initial load performance — but it does mean
that specific component takes visibly longer to appear the first time a
user actually triggers it, since its code hasn't been fetched yet. The
right call depends on how likely a typical user is to need that
component at all: a chart most users never expand is a clear candidate
for deferral; a component every single user interacts with immediately
gains little from splitting and only adds a visible delay.
```

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll defer a large client-side
chart component using `next/dynamic` so its JavaScript loads only when a
user actually expands the panel containing it, rather than as part of
the page's initial bundle.

## Try it

`AnalyticsChart` is a heavy client-only charting component that should
only load once a user clicks "Show analytics" — not as part of the
page's initial bundle.

```scratchpad code-splitting-and-dynamic-imports
import AnalyticsChart from "./AnalyticsChart";

function Panel() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>Show analytics</button>
      {show && <AnalyticsChart />}
    </div>
  );
}
```

````reveal Work through it
```tsx
import dynamic from "next/dynamic";

const AnalyticsChart = dynamic(() => import("./AnalyticsChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

function Panel() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>Show analytics</button>
      {show && <AnalyticsChart />}
    </div>
  );
}
```

A plain `import AnalyticsChart from "./AnalyticsChart"` bundles its code
into the initial page load regardless of whether `show` is ever true —
the conditional render only controls when it's *displayed*, not when
its JavaScript is *downloaded*. `next/dynamic` is what actually defers
the download itself. `ssr: false` is appropriate here since a charting
library that measures the browser viewport has no meaningful
server-rendered output anyway.
````
