---
title: "Hydration Under the Hood"
practiceFormat: null
depth: essential
---

## Setting up the lesson that follows this one

You now know that a Client Component gets server-rendered once for its
first paint, then ships its JavaScript to become interactive in the
browser. This lesson looks closely at that second step — the process
called **hydration** — because the next lesson is entirely about
diagnosing what happens when it goes wrong, and you can't debug a process
you don't have a mental model of.

## What React actually does during hydration

When the browser receives server-rendered HTML, that HTML is already
real, visible content — a static picture of what the page should look
like. But it's just markup at that point; there's no React attached to
it, no event listeners, no component state. Hydration is the process
where React's JavaScript runtime "wakes up" that static HTML and turns it
into a live, managed React tree.

Concretely, hydration works by **walking the existing DOM and the
component tree in parallel**, matching them up node by node. For each
DOM node, React expects it to correspond to what that same component
would have rendered if it were rendering fresh, right now, on the client.
When they match — which is the overwhelmingly common case — React quietly
attaches its internal bookkeeping and event listeners to the existing DOM
nodes, without discarding and rebuilding them. The user never sees a
flicker, because the visible content doesn't change; React is just
attaching itself to what's already there.

## Why the "should match" assumption matters

That word "expects" in the previous paragraph is the crux of this whole
topic. Hydration is fundamentally a **matching** process — React assumes
the client-side render output will be identical to what the server
already sent, and it hydrates on that assumption rather than
re-rendering everything from scratch (which would be wasteful, given the
whole point of SSR was to avoid making the user wait for a from-scratch
client render).

When that assumption holds, hydration is close to free — a quick
walk-and-attach operation. When it doesn't hold — when what the client
would render doesn't match what the server actually sent — you get a
**hydration mismatch**, which is exactly what the next lesson diagnoses
in detail. For now, the important takeaway is *why* a mismatch is even
possible in the first place: the server and the browser are two different
execution environments, and anything whose output can differ between them
(the current time, whether `window` exists, browser-specific storage) is
a place where the "should match" assumption can quietly break.

## The trade-off this design accepts

It's worth being explicit about why React chose this matching-based
approach instead of something simpler, like always discarding the
server-rendered HTML and re-rendering fully on the client. The answer is
performance: a full client-side re-render would throw away the entire
benefit of server rendering, redoing work that had already been done and
delaying interactivity further. Matching-and-attaching is faster in the
overwhelming majority of real cases — but it only works because it
assumes the server and client outputs agree, which is a real constraint
you have to actively respect as the developer, not something the
framework can fully guarantee on your behalf.

The next lesson turns this understanding into a practical, diagnosable
skill: what specifically causes that assumption to break, what the
resulting errors actually look like, and how to fix each category of
cause.
