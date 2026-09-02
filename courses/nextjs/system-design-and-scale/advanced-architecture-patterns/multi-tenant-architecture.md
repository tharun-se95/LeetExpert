---
title: "Multi-Tenant Architecture"
practiceFormat: sandbox
depth: advanced
---

## One codebase, many completely isolated customers

A multi-tenant SaaS product — think a tool where each customer gets
`customer-a.yourapp.com`, `customer-b.yourapp.com` — needs to serve
genuinely different data and configuration per tenant from the exact
same deployed application, without one tenant ever being able to see
another's data. This is the architectural problem this lesson addresses,
building directly on middleware's request-interception role from Module
2.

## Routing based on the subdomain

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const tenant = hostname.split(".")[0];

  const url = request.nextUrl.clone();
  url.pathname = `/tenants/${tenant}${url.pathname}`;

  return NextResponse.rewrite(url);
}
```

This rewrites every request to a tenant-specific path internally, while
the URL the browser shows stays the clean subdomain form — the same
distinction between a rewrite and a redirect this course covered in
Module 2, applied at the architectural scale of an entire multi-tenant
platform rather than a single route.

## Why tenant isolation needs more than routing

Correctly routing a request to the right tenant's *data* is only half
the problem — a real multi-tenant system needs a database strategy that
guarantees Tenant A's queries can never accidentally return Tenant B's
rows. Two common approaches: a `tenantId` column enforced on every query
(cheaper to operate, but a single missed `WHERE tenantId = ...` clause is
a data-leak vulnerability), or fully separate per-tenant database pools
or schemas (stronger isolation guarantee, more operational overhead to
manage at scale). The subdomain-routing middleware from this lesson is
what determines *which* tenant a request belongs to; a separate,
equally-important layer has to actually enforce that isolation once the
request reaches your data layer.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll design middleware that
extracts the tenant identifier from a request's subdomain and rewrites
the request to route it correctly, internally, to that tenant's
resources — the routing half of a multi-tenant architecture.
