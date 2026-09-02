---
title: "Enterprise Track — Distributed Self-Hosting & CDN Caching"
practiceFormat: canvas-defense
depth: advanced
---

## Why "just deploy it" stops being the answer at enterprise scale

Everything about caching in this course so far — Module 3's Data Cache,
Module 4's rendering strategies — implicitly assumed a hosting model
where "the server" is effectively one coherent thing. At genuine
enterprise scale — a fleet of containers behind a load balancer, spread
across a Kubernetes cluster or AWS ECS, potentially across multiple
regions — "the server" is actually **many independent server processes**,
and a caching model that assumes one shared, coherent server-side cache
breaks down the moment there's more than one.

## Standalone builds as the deployment unit

```js
// next.config.js
module.exports = {
  output: "standalone",
};
```

`output: "standalone"` produces a minimal, self-contained build — just
the files actually needed to run the app in production, without the full
`node_modules` tree — designed specifically to be the unit you package
into a container image and run identically across many replicas in a
cluster.

## The distributed caching problem this creates

```warn
Next.js's default cache handler assumes a **local disk** — fine for a
single server, but actively wrong for a fleet: Container A's
local-disk cache entry is invisible to Container B, meaning two
containers serving the same route can each independently regenerate
and cache the same data, defeating the purpose of a shared cache and
risking each container showing different cached content to different
users depending on which one happened to serve their request.
```

The fix is overriding Next.js's cache handler to write to a shared,
external store (Redis, a distributed cache service) that every
container instance can read from and write to consistently, restoring
one coherent cache across the whole fleet instead of N independent,
inconsistent local ones.

## What the practice drill is testing

This is genuinely hard to fully simulate in a browser-based self-paced
format — real distributed infrastructure isn't something a sandboxed
exercise can spin up. The practice format here is deliberately different
from the rest of the course.

**Practice (Architectural Canvas + Defense):** you'll draw a distributed
self-hosting topology — containers, load balancer, shared external cache
handler, CDN layer — on a design canvas, then record an audio defense of
the design, explaining specifically why a local-disk cache handler fails
in this topology and how the shared cache handler resolves it.

## Try it

Sketch the topology (containers, load balancer, cache layer, CDN) for a
Next.js app running as 4 replicas behind a load balancer. Then answer
out loud: "A teammate says caching is caching — why would a local-disk
cache handler cause a real bug here?" Write your own answer before
revealing the model one.

```scratchpad enterprise-track-distributed-self-hosting
// Sketch the topology in comments, then draft your spoken answer below.
```

````reveal A model defense
**Topology:** 4 `output: 'standalone'` containers behind a load
balancer, each independently capable of serving any request; a shared
external cache store (Redis) all 4 containers read/write; a CDN layer in
front for static assets.

**The answer to the teammate:** with the default local-disk cache
handler, each of the 4 containers maintains its *own* independent
cache. Two users hitting the same route through different containers
(a real, common outcome behind a load balancer) can see **different
cached content** depending purely on which container happened to serve
them — not a performance nitpick, but a correctness bug, since the
"cache" is supposed to represent one consistent view of the data.
Overriding the cache handler to write to a shared external store (Redis)
restores one coherent cache across the whole fleet, so every container
serves the same cached state regardless of which one a given request
lands on.
````
