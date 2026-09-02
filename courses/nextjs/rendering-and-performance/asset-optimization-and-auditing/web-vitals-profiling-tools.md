---
title: "Web Vitals Profiling Tools"
practiceFormat: trace
depth: essential
---

## Knowing the metrics isn't the same as finding what's hurting them

The previous lesson connected Core Web Vitals to architectural causes in
principle. In practice, a real production app doesn't hand you a labeled
diagram of what's slow — you have to go find it, using the tools built
for exactly that.

## `@next/bundle-analyzer` — finding what's actually shipping to the client

```js
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({ /* config */ });
```

Running a build with this enabled produces a visual treemap of exactly
what's inside your client JavaScript bundles — which packages, which
components, and how large each one is relative to the whole. This is the
direct tool for an INP investigation: a bundle analyzer visualization
that shows one unexpectedly large dependency pulled into the main bundle
is a concrete, actionable finding, not a guess.

## Chrome DevTools — finding what's blocking on the actual timeline

The Performance panel's timeline shows exactly what the browser was
doing, in what order, and for how long, during a real page load —
including third-party scripts you don't control directly but that still
execute on your page and consume main-thread time. A long task on the
timeline that traces back to a specific third-party script (an analytics
tag, a chat widget) is the kind of finding that a bundle-size number
alone wouldn't surface, since third-party scripts loaded via `<script>`
tags aren't part of your own bundle analysis.

## Why both tools, not just one

Bundle analysis answers "what did *I* ship." DevTools' timeline answers
"what actually executed, blocking the user, regardless of source." A
regression caused by your own code shows up in the bundle analyzer; a
regression caused by a third-party script embedded elsewhere in the page
shows up only in the DevTools timeline. Real diagnostic work uses both,
because each one is blind to what the other one catches.

## What the practice drill is testing

**Practice (Trace-the-Execution):** you'll be shown a performance trace
log from a real page load and asked to identify the specific third-party
script responsible for blocking the main thread, distinguishing it from
the page's own first-party rendering work.

## Try it

```
Main thread timeline:
[0-120ms]    First-party React render + hydration
[120-140ms]  Idle
[140-980ms]  Long task — script: chat-widget.vendor.com/embed.js
[980-1010ms] First-party click handler attaches
```

INP for this page is poor. What does the timeline point to?

````reveal Work through the trace
The 840ms long task from `chat-widget.vendor.com/embed.js` is the
dominant cost here — nearly seven times longer than the first-party
render/hydration work combined. This is exactly the kind of finding a
bundle analyzer alone would miss: `embed.js` isn't part of your own
JavaScript bundle at all, since it's loaded via a separate `<script>` tag
from a third-party domain — only a DevTools-style timeline capture
surfaces it as the actual bottleneck.

The fix isn't touching your own render code (it's already fast, at
120ms) — it's addressing the third-party script itself: deferring its
load until after initial interactivity, lazy-loading it on user
intent (e.g. only when a chat icon is clicked), or evaluating whether a
lighter-weight alternative exists.
````
