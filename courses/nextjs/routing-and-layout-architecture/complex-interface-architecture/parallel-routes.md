---
title: "Parallel Routes"
practiceFormat: sandbox
depth: advanced
---

## The problem a single content slot can't solve

Every layout covered so far renders exactly one thing in its main content
area — a single `children` slot that one active route fills. That model
breaks down the moment a real interface needs to show **multiple,
independently-navigable sections at once**: a dashboard with an analytics
panel and a team-activity panel side by side, each capable of loading,
updating, or erroring on its own, without either one forcing the other to
re-render.

## The syntax: `@slot` folders

A folder name prefixed with `@` defines a **named slot** — a parallel,
independently-rendered section of a layout, distinct from the default
`children` slot:

```
app/
  dashboard/
    layout.tsx
    @analytics/
      page.tsx
    @team/
      page.tsx
    page.tsx
```

The `layout.tsx` receives each slot as a prop matching its folder name,
alongside the normal `children`:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="dashboard-grid">
      {children}
      <div className="panel">{analytics}</div>
      <div className="panel">{team}</div>
    </div>
  );
}
```

Each slot is populated by its own `page.tsx`, and this is the
architecturally important part:

```brain
Each slot has its own independent loading and error state. A slow
`@analytics` query shows its own loading skeleton without blocking
`@team` from rendering the moment its data is ready. This is the
direct, practical payoff: parallel routes let you compose a page out of
independently-fetching regions instead of one monolithic page-level
suspense boundary.
```

## Why this matters for real dashboards

Without parallel routes, a page with three independently-loading widgets
either accepts one shared loading state (the whole page waits for the
slowest widget) or requires you to hand-roll `Suspense` boundaries and
manual data-fetching orchestration inside a single page component. Slots
give you that per-region independence as a first-class routing primitive,
with each slot's own `loading.tsx` and `error.tsx` working exactly the way
they do for a normal route segment.

## What the practice drill is testing

The mechanical part — creating an `@slot` folder — is simple. The actual
skill is correctly wiring a `layout.tsx` to accept and place multiple
named slots as props, and reasoning about which UI regions genuinely
deserve independent loading/error boundaries versus which should stay
combined.

**Practice (Semi-Constrained Sandbox):** you'll build a dashboard layout
that renders two independently-loading analytics panels side by side using
named parallel-route slots, each with its own loading state.

## Try it

Sketch the folder structure and layout signature for a `/dashboard` page
that renders a `@revenue` slot and a `@activity` slot side by side, each
independently loading.

```scratchpad parallel-routes
// app/dashboard/... folder structure, and the layout.tsx signature
```

````reveal Work through it
```
app/
  dashboard/
    layout.tsx
    page.tsx
    @revenue/
      page.tsx
    @activity/
      page.tsx
```

```tsx
export default function DashboardLayout({
  children,
  revenue,
  activity,
}: {
  children: React.ReactNode;
  revenue: React.ReactNode;
  activity: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="grid">
        {revenue}
        {activity}
      </div>
    </div>
  );
}
```

The slot prop names (`revenue`, `activity`) must match the `@`-prefixed
folder names exactly — that's the mechanism connecting each slot's own
`page.tsx` to the corresponding prop the layout receives.
````
