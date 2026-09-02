---
title: "System Design: Distributed Multi-Container Cache Handlers"
practiceFormat: canvas-defense
depth: essential
---

## The capstone problem, built from every caching lesson in this course

This final lesson deliberately combines the two hardest caching ideas in
the entire curriculum: Module 3's server-side cache hierarchy and Module
7's distributed self-hosting cache-handler override. The scenario:
design a caching architecture for a Next.js application deployed across
many concurrently-running containers, under real load, where naive
per-container caching produces both wasted work and outright incorrect
behavior.

## Restating the core problem precisely

```warn
Module 7 established the failure mode: Next.js's default cache handler
assumes local disk, so each container in a fleet maintains its own
independent, inconsistent cache. Under concurrent load, this gets
worse than just inconsistency — multiple containers can simultaneously
receive requests for the same not-yet-cached data and **each
independently** trigger the expensive underlying computation or
database query, a redundant "thundering herd" of duplicate work that a
single shared cache would have prevented entirely.
```

## Designing the shared layer

A credible design routes all containers' cache reads and writes through
a single shared, external store — Redis is the canonical choice — with
a custom cache handler implementation replacing Next.js's default
disk-based one. The design has to account for:

- **Consistency**: every container reading the same key sees the same
  value, so a user's request is never served conflicting cached content
  depending on which container happened to handle it.
- **Concurrent-write safety**: if two containers simultaneously
  regenerate the same expired cache entry, the design shouldn't corrupt
  the cache or double the redundant work — a locking or single-flight
  pattern at the shared-cache layer is the credible answer here.
- **Failure isolation**: if the shared Redis layer itself becomes
  unavailable, a well-designed system degrades to computing fresh
  (slower, but correct) rather than serving corrupted or crashing
  outright.

## Why this is the right capstone

Every earlier lesson in this course taught one piece of the caching
picture in isolation. This design problem has no correct answer unless
you can hold the *entire* stack — Request Memoization, Data Cache, Full
Route Cache, the client Router Cache, and now a distributed shared-cache
layer — in mind simultaneously and reason about how they interact under
real concurrent, multi-container load.

## What the practice drill is testing

**Practice (Architectural Canvas + Defense):** you'll whiteboard a
distributed, Redis-backed cache-handler architecture for a multi-container
Next.js deployment, addressing consistency and concurrent-write safety
under load, and verbally defend the design against likely edge-case
pushback.

## Try it

Design a shared-cache architecture for 6 containers under load, and
answer: "What happens if two containers simultaneously try to regenerate
the same expired cache entry?"

```scratchpad system-design-distributed-cache-handlers
// Your design + answer to the concurrent-write question:
```

````reveal A model answer
**Design:** all 6 containers route cache reads/writes through a single
shared Redis instance via a custom cache handler, replacing Next.js's
default disk-based one — restoring one consistent cache view across the
fleet instead of 6 independent, disk-local ones.

**The concurrent-write answer:** without protection, two containers
regenerating the same expired key at once means duplicated, redundant
work — a "thundering herd" — and depending on write ordering, a race
where one container's fresh write is immediately overwritten by the
other's, potentially with stale data. The defensible fix is a
single-flight or locking pattern at the cache layer: the first container
to notice the expired key acquires a short-lived lock and regenerates
it; other containers hitting the same expired key during that window
either wait briefly for the lock holder's result or serve the
(acceptably) stale value rather than each independently recomputing it.

**Failure isolation, if pushed further:** if Redis itself becomes
unavailable, a well-designed handler should degrade to computing fresh
per-container (slower, but correct) rather than crashing outright or
serving corrupted state.
````
