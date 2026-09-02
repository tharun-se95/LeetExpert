---
title: "Production Observability & Error Boundaries"
practiceFormat: sandbox
depth: essential
---

## An unhandled crash is a product failure, not just a stack trace

Every non-trivial production app eventually hits a runtime error it
didn't anticipate — a null value from an API response, an edge case in
data shape. Without a deliberate error boundary, that crash produces a
blank white screen or a broken layout the user has no way to recover
from, and — just as importantly — no record anywhere that it happened,
unless you've wired up something to catch and report it.

## The two boundary files, and the difference between them

```tsx
// app/dashboard/error.tsx
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportToMonitoring(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong loading your dashboard.</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

`error.tsx` catches runtime errors thrown anywhere within its route
segment, rendering a recovery UI **in place of** the broken content
while keeping the surrounding layout (navigation, header) intact and
functional — the user isn't fully locked out of the app, just informed
that this specific section failed. The `reset` function lets them retry
without a full page reload.

`global-error.tsx`, placed at the app root, is the true last resort —
it only activates when an error occurs in the **root layout itself**,
which `error.tsx` boundaries can't catch (an error boundary can't catch
errors from its own parent layout). Because it replaces the root layout
entirely, `global-error.tsx` must render its own complete `<html>` and
`<body>` tags — there's no surrounding shell left to rely on.

## The monitoring connection is what makes this "observability," not just UX

A recovery UI without a `reportToMonitoring` call (or equivalent — Sentry,
or another error-tracking service) means every production crash is
silently absorbed by the boundary and never reaches anyone who could fix
it. The `useEffect` reporting call inside the boundary component is what
turns a graceful-failure UI pattern into genuine production
observability: the team finds out a crash happened, with a stack trace,
without needing a user to manually file a bug report.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll construct a route-level
error boundary that catches a backend data-fetching error, reports it to
a monitoring call, and displays a friendly recovery UI with a working
retry action.
