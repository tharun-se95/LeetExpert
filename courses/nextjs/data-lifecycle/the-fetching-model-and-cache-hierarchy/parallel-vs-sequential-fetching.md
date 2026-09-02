---
title: "Parallel vs. Sequential Fetching and Waterfalls"
practiceFormat: trace
depth: essential
---

## The bug that hides in ordinary-looking code

```tsx
async function Page() {
  const user = await getUser();
  const posts = await getPosts(user.id);
  return <Profile user={user} posts={posts} />;
}
```

Nothing here looks wrong — it's just two `await`s, reading top to bottom
the way async code usually reads. But if `getPosts` doesn't actually need
`user`'s full data (say it only needs a static ID already known from the
route params), this code is paying for a **waterfall**: `getPosts` cannot
even *begin* until `getUser` has fully finished, even though the two
requests have no real data dependency forcing that order.

## Why sequential `await`s create a waterfall

Each `await` in a sequential chain **blocks** the next line from starting
until it resolves. If `getUser` takes 300ms and `getPosts` takes 300ms,
that's 600ms total, even though both requests could, in principle, be
in flight to the network at the exact same time. Compounding this by
depth — one waterfall inside a layout, another inside its child page — is
how a page's total load time silently balloons well past what any
individual request costs.

## The fix: start requests concurrently

```tsx
async function Page({ params }: { params: { userId: string } }) {
  const [user, posts] = await Promise.all([
    getUser(params.userId),
    getPosts(params.userId),
  ]);
  return <Profile user={user} posts={posts} />;
}
```

`Promise.all` **starts both requests immediately**, without waiting for
either to finish first, then waits for both to resolve together. Total
time drops from the sum of both requests to roughly the slower of the
two — a 600ms sequential chain becomes a ~300ms parallel one, for free,
with no new network calls added.

## The actual decision point

```brain
The fix is mechanically simple once you see it; the skill is **noticing
that a data dependency doesn't actually exist** in code that happens to
be written sequentially. Not every sequential `await` chain is a bug —
if `getPosts` genuinely needs a value that only `getUser`'s result
provides, the dependency is real and `Promise.all` isn't applicable.
```

The practice drill is built specifically around telling these two cases
apart from a real waterfall trace.

## What the practice drill is testing

**Practice (Trace-the-Execution):** you'll be shown a server performance
log exhibiting a request waterfall, and asked to identify which requests
in the chain have no genuine data dependency on each other, then refactor
the fetching code to run them concurrently with `Promise.all`.

## Try it

```
[0ms]   GET /api/user/42        (started)
[220ms] GET /api/user/42        (done)
[221ms] GET /api/posts?user=42  (started)
[480ms] GET /api/posts?user=42  (done)
```

The code behind this trace:

```ts
const user = await getUser(id);
const posts = await getPosts(id);
```

Is this a genuine waterfall bug? What's the fix, if any?

````reveal Work through the trace
Yes — `getPosts(id)` only needs `id`, which is already known before
`getUser` even runs. There's no real data dependency forcing it to wait
for `user`'s result, so the 221ms delay between the two requests is pure
waste.

```ts
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

With `Promise.all`, both requests start at `[0ms]` instead of one
starting after the other finishes — total time drops from roughly
480ms to roughly 260ms (the slower of the two), for free.
````
