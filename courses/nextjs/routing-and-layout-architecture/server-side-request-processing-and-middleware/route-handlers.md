---
title: "Custom HTTP Endpoints with Route Handlers"
practiceFormat: sandbox
depth: essential
---

## Not every route needs to render a page

Everything covered so far in this module produces a **page** — HTML a
user navigates to and sees. But applications also need endpoints that
return data, not UI: a webhook receiver, a REST-style API your frontend
JavaScript calls, an endpoint a third-party service posts to. Route
Handlers are the App Router's answer to that need — a way to define an
endpoint at a URL, following the exact same file-system routing
conventions from this module, that returns a response instead of
rendering a component.

## The convention: `route.ts`, not `page.tsx`

A `route.ts` (or `route.js`) file placed anywhere `page.tsx` could go
defines a Route Handler for that path instead of a page. You export
functions named after HTTP methods — `GET`, `POST`, `PUT`, `DELETE`, and
so on — and Next.js calls the matching one based on the incoming
request's method:

```ts
// app/api/posts/route.ts
export async function GET(request: Request) {
  const posts = await db.posts.findMany();
  return Response.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await db.posts.create({ data: body });
  return Response.json(post, { status: 201 });
}
```

A single `route.ts` file can export multiple method handlers side by
side — `GET` and `POST` in the same file both respond at `/api/posts`,
differentiated purely by which HTTP method the incoming request used.

## Caching behaves differently than you might expect

This is the detail most likely to surprise someone coming from a typical
REST API mental model: **`GET` Route Handlers can be cached by default**,
the same way a statically-rendered page can be. If a `GET` handler's
output doesn't depend on request-specific data (no reading of headers,
cookies, or the request URL's dynamic parts), Next.js may treat it as
static and cache the response — which is usually exactly what you want
for something like a `GET` that serves rarely-changing data, but can
produce confusing "why isn't my endpoint returning fresh data" bugs if
you didn't expect a `GET` handler to be cacheable at all. (This connects
directly to the caching model covered in depth in the next module —
Route Handlers participate in the same caching system, not a separate
one.)

## Choosing Node vs. Edge runtime

Every Route Handler runs in one of two runtime environments, and which
one matters for what your handler is allowed to do:

- **Node.js runtime** (the default): full Node.js API access — file
  system, most npm packages, database drivers that expect a Node
  environment.
- **Edge runtime**: a lighter, faster-to-cold-start environment that runs
  closer to the request geographically, but with a restricted API surface
  — no file system access, and many Node-specific database drivers simply
  won't work there (a topic this course returns to directly in Module
  4's runtime trade-offs lesson).

A Route Handler opts into the Edge runtime by exporting `export const
runtime = "edge";` — without that, it runs on Node by default.

## What the practice drill is testing

Reading about the `GET`/`POST` convention is straightforward; correctly
building a Route Handler that parses an incoming request body, performs a
mutation, and returns an appropriately-shaped response is the actual
skill this drill checks for.

**Practice (Semi-Constrained Sandbox):** you'll build a custom `POST`
Route Handler that parses an incoming JSON payload and executes a
database mutation, returning the correct response shape and status code
for a successful creation.
