---
title: "End-to-End Testing SSR Layouts"
practiceFormat: pr-review
depth: essential
---

## Why SSR rendering boundaries need a different kind of test

A unit test can verify a single component's logic in isolation, but it
can't catch the class of bug this course has spent several modules
building toward: a hydration mismatch that only manifests when real
server-rendered HTML meets real client JavaScript in an actual browser,
or a Suspense boundary that streams content in the wrong order under
real network conditions. End-to-end (E2E) testing tools like Playwright
exist specifically to exercise a real browser against a real running
build, catching exactly these rendering-boundary failures that no unit
test touches.

## Why this course uses trace audits instead of a live browser

Running an actual headless browser inside a self-paced, browser-based
learning platform is one of the three things Phase 0's pedagogy
investigation flagged as genuinely hard to fake safely and reliably in
this format. The workaround: Playwright's own Trace Viewer can replay a
**pre-recorded `.trace.zip`** capture of a real failing test run —
screenshots, DOM snapshots, console output, network activity, all
frozen at the moment of failure — giving you the full diagnostic
experience of investigating a real E2E failure without this platform
needing to spin up live browser infrastructure per learner.

## What a real trace-based diagnosis looks like

Given a failing trace showing a hydration crash, the diagnostic process
is exactly what Module 1's hydration lessons trained: correlate the
console error's reported mismatch against the DOM snapshot at that exact
moment, and trace it back to a specific cause — a `Date`-dependent
render, an invalid nesting, a `window` check that ran during SSR. The
trace format doesn't change *what* you're diagnosing; it changes *how*
you access the evidence, replacing "reproduce it yourself" with
"replay the exact failure that was already captured."

## What the practice drill is testing

**Practice (Pull Request Code Review, via a pre-recorded trace audit):**
you'll be given a `.trace.zip`-style capture of a failing Playwright test
against an SSR layout, and asked to diagnose from the trace's
screenshots, console output, and DOM snapshots exactly why the hydration
render crashed, then propose the fix as you would in a PR review.

## Try it

Trace capture summary: console shows `Warning: Text content did not
match. Server: "$12.00" Client: "$12.00 USD"`. The DOM snapshot shows a
`<PriceTag>` component. What's the likely cause, and what would you
check first?

````reveal Work through the trace
The server and client rendered genuinely different text for the same
component — a classic hydration mismatch. The specific pattern (extra
`" USD"` suffix on the client) points at conditional formatting logic
that behaves differently depending on execution environment — for
example, a `typeof window !== "undefined"` branch inside `PriceTag`
that appends currency context only when running client-side, or a
locale-detection call that resolves differently on the server (no
`Intl` locale context) versus the browser (real user locale available).

The fix: make the formatting logic deterministic between server and
client — pass the currency/locale as an explicit prop from the server
rather than letting the component infer it differently in each
environment, so both renders produce identical output on the first
pass.
````
