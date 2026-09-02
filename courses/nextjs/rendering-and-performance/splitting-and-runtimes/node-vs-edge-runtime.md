---
title: "Runtime Trade-Offs: Node.js vs. Edge Runtime"
practiceFormat: pr-review
depth: advanced
---

## Two genuinely different execution environments, not just a config flag

`export const runtime = "edge"` looks like a small, one-line
configuration choice, but it changes **where and how** your code actually
executes — not just a performance tuning knob. The Node.js runtime is
the full, familiar Node environment: file system access, the complete
npm ecosystem, database drivers built with Node's networking APIs in
mind. The Edge runtime is a deliberately restricted, lightweight
environment designed to start near-instantly and run geographically
closer to the requesting user — trading away most of Node's API surface
to get there.

## What Edge genuinely cannot do

- **No file system access** — any code path that reads from disk fails
  outright.
- **A restricted set of Web-standard APIs** — not the full Node.js
  standard library.
- **Many Node-native database drivers simply don't work** — a driver
  built assuming raw TCP socket access via Node's `net` module (a common
  pattern for traditional SQL drivers) has no equivalent in the Edge
  runtime's execution model, and importing it doesn't just run slowly —
  it fails to run at all.

## The trap this lesson's drill is built around

A Route Handler exported with `runtime = "edge"` for its faster
cold-start and lower latency, importing a Node-native Postgres or MySQL
driver, is a configuration that can pass a type check and even work in
some local setups, then fail in production the moment it actually tries
to open a real database connection through an API the Edge runtime
doesn't provide. This is exactly why the practice format here is a code
review: the bug isn't a syntax error the compiler catches — it's an
architectural incompatibility between a runtime choice and a dependency
choice that only fully surfaces at actual connection time.

## The real trade-off framing

Edge earns its cost when latency and cold-start time are the dominant
concern and your code's dependencies are compatible with its restricted
surface (fetch-based APIs, edge-compatible database clients built
specifically for this environment). Node is the correct default when you
need its full API surface or an existing driver ecosystem that assumes
it.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll audit a Route Handler
configured for the Edge runtime that imports a Node-native database
driver, identify why this combination will fail, and correct the
runtime/dependency mismatch.

## Try it

Review this pull request:

```ts
// app/api/orders/route.ts
export const runtime = "edge";

import { Pool } from "pg"; // Node-native Postgres driver

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const result = await pool.query("SELECT * FROM orders LIMIT 10");
  return Response.json(result.rows);
}
```

This passed local testing. Will it work in production?

````reveal Work through the review
No — `pg` is built on Node's `net` module for raw TCP socket access,
which the Edge runtime doesn't provide at all. This isn't a
performance issue; it fails outright the moment `pool.query` actually
tries to open a connection, in an environment where local testing may
have masked it (e.g. running through a Node-compatible dev server
rather than the real Edge runtime).

Two valid fixes: drop `runtime = "edge"` and run this on the default
Node.js runtime, where `pg` works normally; or, if Edge's latency
benefit is genuinely needed, switch to a database client built
specifically for the Edge runtime's constraints (an HTTP-based driver
rather than a raw-socket one). The choice depends on whether this
route's latency profile actually justifies Edge's restricted surface.
````
