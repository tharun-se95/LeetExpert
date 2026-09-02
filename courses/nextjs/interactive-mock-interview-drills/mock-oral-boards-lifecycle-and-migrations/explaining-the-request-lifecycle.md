---
title: "Explaining the Request Lifecycle"
practiceFormat: canvas-defense
depth: essential
---

## The single most common senior-level Next.js interview question

"Walk me through the lifecycle of a Next.js App Router request" is one
of the most frequently asked system-level questions in a Next.js
interview loop, precisely because a good answer requires correctly
synthesizing nearly everything this entire course has covered — not
reciting an isolated fact, but demonstrating that the pieces fit
together as one coherent mental model.

## What a genuinely complete answer touches

A strong verbal walkthrough moves through, roughly in order: the
incoming request hitting **middleware** first, before any route is even
matched (Module 2); the router resolving the matching **route segment**
and its nested **layouts** (Module 1, Module 2); Server Components
rendering on the server and producing a **serialized RSC payload**
(Module 1); the relevant **cache layers** — Request Memoization, Data
Cache, Full Route Cache — determining whether any of this actually needs
to re-execute or can be served from cache (Module 3); the response
**streaming** back to the client with Suspense boundaries resolving
independently (Module 4); and finally **hydration** attaching client
interactivity to the delivered HTML (Module 1).

## Why this is a speaking drill, not a writing drill

Correctly *listing* these steps in an essay is a different skill from
correctly *explaining* them out loud, under mild time pressure, in an
order that builds logically and doesn't require the listener to
backtrack — which is exactly what a real interview panel is evaluating.
A candidate who deeply understands every individual piece can still fail
this specific question by explaining it in a disorganized order, or by
front-loading obscure detail before establishing the basic shape.

## What the practice drill is testing

**Practice (Architectural Canvas + Defense):** you'll record a spoken
answer to "walk me through the lifecycle of a Next.js App Router
request," ideally sketching the flow on a design canvas as you speak,
covering middleware, routing/layouts, RSC rendering, caching, streaming,
and hydration in a coherent, logically ordered explanation.
