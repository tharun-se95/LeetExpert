---
title: "RSC vs. SSR vs. CSR"
practiceFormat: trace
depth: essential
---

## The distinction interviewers actually care about

By this point you understand *why* rendering location matters (Module
1.1) and *how* the App Router organizes routes and layouts (also 1.1).
This lesson introduces the piece that trips up even experienced React
developers moving to Next.js: **React Server Components (RSC) are not
just "SSR, but newer."** They're a genuinely different execution model,
and confusing the two is one of the fastest ways to lose credibility in a
technical interview.

## Refresher: SSR still ships your component's code to the browser

Server-Side Rendering, as covered earlier, means a server runs your React
component and produces an HTML string on each request. But here's the
detail that matters for this lesson: **in traditional SSR, that same
component's JavaScript is *also* sent to the browser**, so that React can
"hydrate" it — attach event listeners and internal state, turning the
static HTML into a live, interactive component. The server-rendered HTML
is a head start on *appearance*, but the component's full code still has
to reach the client.

That means every SSR'd component's code counts toward your JavaScript
bundle size, even the parts of it that never actually need to run in the
browser — the part that just formats a date, or reads from a database,
for instance.

## What Server Components change

A React Server Component **executes only on the server, and never sends
its own code to the browser at all.** What crosses the network isn't
JavaScript — it's a special serialized description of the UI output
(conceptually similar to how HTML describes UI output, but richer,
because it can describe where client components need to be "slotted in").
The browser never downloads the Server Component's source code, its
imports, or the libraries it used internally, because none of that ever
needs to run client-side.

This is the concrete, practical payoff: if a component does something
server-only anyway — reading a file, querying a database directly,
calling a secret-keyed API — a Server Component means that logic (and any
heavy library it depends on) simply never ships to the browser. Compare
that to the old approach, where you'd fetch that same data inside
`getServerSideProps`, but the *component* rendering it was still a
regular client-hydrated component whose code shipped regardless.

## Where CSR still fits

None of this eliminates client-rendered components — it narrows what
they're *for*. A Client Component (marked with `"use client"`, covered in
the next lesson) is still exactly the right tool for anything that
depends on browser-only state or interactivity after the page has
loaded: a dropdown that opens on click, a form tracking its own input as
the user types, a chart that re-renders as a WebSocket pushes new data.
That work has nowhere to happen except in the browser, so it stays
client-rendered — Server Components don't replace that, they sit
alongside it.

## Putting the three together

Here's the mental model this module has been building toward, stated
directly:

- **Server Components** run only on the server, ship no JavaScript to the
  browser, and are the default in the App Router. Use them for anything
  that doesn't need browser-only interactivity — most of a typical page's
  content, in practice.
- **Client Components** run in the browser (after an initial server
  render for their first paint) and are what actually hydrates and
  becomes interactive. Use them specifically where you need state, event
  handlers, or browser APIs.
- **Traditional SSR** (as a concept, distinct from the App Router's
  default RSC behavior) still describes what happens to a Client
  Component on its first request: the server renders it to HTML for a
  fast first paint, then ships its JavaScript so the browser can hydrate
  it into something interactive.

The App Router's real innovation isn't "we added server rendering" —
Next.js already had that. It's that **a single page can mix Server and
Client Components freely**, so you pay the "ship JavaScript and hydrate"
cost only for the specific pieces that genuinely need interactivity,
instead of the whole page.

## What the practice drill is testing

The distinction above is easy to state and easy to get backwards under
pressure — mixing up "which one avoids shipping JavaScript" is a common
enough mistake that interviewers specifically probe for it. The practice
exercise for this lesson gives you a real execution trace to read rather
than asking you to recite the definitions.

**Practice (Trace-the-Execution):** you'll be given a request trace
showing what actually crossed the network for a page with both Server and
Client Components — HTML output for some parts, a serialized RSC payload
for others, and a JavaScript bundle for the client-rendered pieces. Your
job is to correctly identify which trace entries came from which kind of
component, and explain why each one produced what it did.

## Try it

A page renders three components: `<ProductPrice>` (reads from a
database, no interactivity), `<AddToCartButton>` (has an `onClick`
handler and local pending state), and `<PageLayout>` (the wrapping shell,
no interactivity). Below is what the browser's network panel shows for
one request to this page. For each entry, decide: did this come from a
Server Component or a Client Component, and why?

```
1. GET /product/42                    → 4.1 KB   text/x-component
2. GET /_next/static/chunks/847.js    → 12.8 KB  application/javascript
3. GET /_next/static/chunks/main.js   → 31.2 KB  application/javascript
```

````reveal Work through the trace
**Entry 1** (`text/x-component`, an RSC payload, not plain HTML) is the
serialized description of the whole tree — `PageLayout` and
`ProductPrice` are Server Components, so their rendered output travels
as this serialized payload rather than as their source code. Nothing
about their own implementation ever reaches the browser as JavaScript.

**Entry 2** is `AddToCartButton`'s own compiled code. It has to ship as
real JavaScript because it's a Client Component — it needs `onClick` and
local state to work in the browser at all, and that only works if its
code actually runs there.

**Entry 3** is Next.js's own client runtime (React, the router, hydration
logic) — not any of your three components specifically, but the shared
machinery every page with at least one Client Component needs loaded to
hydrate it.

The diagnostic habit this builds: **`text/x-component` responses are the
signature of Server Component output** — if you ever see that content
type in a real trace, whatever produced it never shipped its own code to
the browser, regardless of how much data or logic it contains server-side.
A `.js` chunk, by contrast, is direct, inspectable evidence that whatever
it contains runs client-side.
````
