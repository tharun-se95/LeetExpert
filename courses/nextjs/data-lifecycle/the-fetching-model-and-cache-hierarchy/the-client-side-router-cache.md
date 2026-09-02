---
title: "The Client-Side Router Cache"
practiceFormat: sandbox
depth: essential
---

## A fourth cache — and this one lives in the browser

The previous lesson's three layers all live on the **server**. There's a
fourth cache this course covers, and it's the one most likely to
surprise you in practice because it lives somewhere entirely different:
**the client, inside the browser's memory**, populated automatically as
a user navigates your app with `<Link>`.

## What it actually stores and why

When a user's browser prefetches or visits a route via client-side
navigation, Next.js stores that route segment's payload — layouts and
page content — in an in-memory client cache. The next time navigation
targets an already-visited segment (including navigating *back* to it),
the Router Cache can serve it instantly without a fresh server
round-trip, which is a large part of why App Router navigation feels
instant for revisited routes.

## The problem this causes

Here's the surprising part: because this cache lives on the client and
is populated from what was fetched *earlier*, a mutation that changes
server-side data doesn't automatically invalidate what's sitting in a
user's Router Cache. A user could submit a form that updates a database
record, get redirected back to a list page, and see **stale data** —
not because the server's Data Cache is wrong, but because the *client's*
local Router Cache is still holding an older snapshot from before the
mutation happened.

## The fix: `router.refresh()`

```tsx
"use client";
import { useRouter } from "next/navigation";

function RefreshButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.refresh()}>
      Refresh data
    </button>
  );
}
```

`router.refresh()` tells Next.js to re-fetch the current route's data
from the server and reconcile it into the existing client UI — **without
a full page reload**, preserving client-side state like scroll position
or open modals that a hard refresh would lose. This is the tool for
exactly the stale-Router-Cache scenario above: after a mutation
completes, calling `router.refresh()` forces the client to discard its
local cached snapshot and pull the current server state.

## What the practice drill is testing

Understanding *that* the Router Cache exists is one thing; recognizing
the specific symptom (stale data after a successful mutation, despite the
server clearly having fresh data) and reaching for `router.refresh()`
rather than a full page reload is the practical skill.

**Practice (Semi-Constrained Sandbox):** you'll wire up a client
dashboard where, after a data mutation completes, the previously-cached
view refreshes with current server data using `router.refresh()`,
without forcing a full page reload.

## Try it

After a Server Action successfully archives a task, a task list page
still shows the archived task — the mutation worked (confirmed in the
database), but the visible list didn't update. Write the client-side fix.

```scratchpad the-client-side-router-cache
"use client";
function ArchiveButton({ taskId }: { taskId: string }) {
  async function handleClick() {
    await archiveTask(taskId);
    // ...
  }
  return <button onClick={handleClick}>Archive</button>;
}
```

````reveal Work through it
```tsx
"use client";
import { useRouter } from "next/navigation";

function ArchiveButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  async function handleClick() {
    await archiveTask(taskId);
    router.refresh();
  }
  return <button onClick={handleClick}>Archive</button>;
}
```

The mutation succeeded server-side; the stale view is the **client-side
Router Cache** still holding the pre-mutation snapshot it fetched
earlier. `router.refresh()` re-fetches the current route's data and
reconciles it into the existing UI, without a full page reload — exactly
the tool for this specific symptom.
````
