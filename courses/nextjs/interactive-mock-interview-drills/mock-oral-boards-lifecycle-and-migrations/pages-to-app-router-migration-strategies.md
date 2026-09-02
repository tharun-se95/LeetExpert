---
title: "Pages Router to App Router Migration Strategies"
practiceFormat: canvas-defense
depth: essential
---

## Why "just rewrite it" is the wrong answer for a real production system

Module 1 covered the architectural differences between the Pages Router
and the App Router. A follow-up question a real interview frequently
asks: given a large, live, revenue-generating application still on the
Pages Router, how would you actually migrate it? "Rewrite it all at
once" is rarely a credible answer for a production system with real
users and real risk tolerance — the credible answer is a structured,
incremental strategy.

## The core idea: incremental adoption, not a big-bang rewrite

Next.js explicitly supports the App Router and Pages Router **coexisting
in the same application**, routed by directory: a request matches an
`app/` route if one exists there, and falls back to `pages/` otherwise.
This is the architectural fact that makes incremental migration possible
at all — you're not choosing between "all Pages Router" and "all App
Router" as a single atomic switch.

## A defensible migration sequence

1. **Start with new, low-risk routes** — build any genuinely new pages
   directly in `app/`, leaving existing `pages/` routes untouched.
   Immediate value, zero regression risk to existing functionality.
2. **Migrate leaf routes before shared layouts** — a standalone page
   with no complex nested-layout dependencies is a much safer migration
   candidate than a route deeply embedded in shared Pages Router
   `_app.tsx`/`_document.tsx` chrome.
3. **Migrate directory by directory, verifying at each step** — moving
   one self-contained section of the app (e.g., `/blog/*`) to `app/` at
   a time, with real verification between each move, rather than
   migrating broadly and discovering breakage after the fact.
4. **Leave `_app.tsx`/`_document.tsx`-dependent routes for last** — these
   carry the most shared, cross-cutting logic and the highest risk of a
   subtle regression, so they benefit most from being tackled once the
   team has practical migration experience from the easier routes.

## What makes this answer credible in an interview

The skill being assessed is risk-awareness, not App Router trivia:
recognizing which parts of a migration are low-risk and should go first,
and which parts carry real regression risk and should be sequenced last,
with verification built into every step rather than treated as a single
finish-line event.

## What the practice drill is testing

**Practice (Architectural Canvas + Defense):** you'll design and
verbally defend a directory-by-directory migration plan for moving a
large production Pages Router application to the App Router
incrementally, justifying the sequencing choices by relative risk.
