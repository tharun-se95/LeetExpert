---
title: "Middleware-Based Route Guarding"
practiceFormat: sandbox
depth: essential
---

## Gating access before any protected code runs at all

Module 2 introduced middleware as code that runs before routing even
decides what matches, and specifically flagged early authentication
gating as one of its core legitimate use cases. This lesson builds that
out fully: using middleware to check whether a request is authenticated
**before** it ever reaches a protected route's actual page or Route
Handler logic.

## The pattern

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const isValid = sessionToken && (await verifySession(sessionToken));

  const isProtectedPath = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedPath && !isValid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

Notice the `matcher` config, directly reusing the scoping principle from
Module 2's middleware performance lesson: this guard should only run on
paths that actually need protection, not on every request including
static assets.

## Why this belongs in middleware rather than each individual page

Without a centralized guard, every single protected page or layout would
need to independently re-implement its own "is this user authenticated"
check at the top of its own render function — a pattern that's easy to
forget on a newly-added route and creates a security gap by omission
rather than by a deliberate, visible mistake. Centralizing the check in
middleware means a new protected route is covered automatically the
moment its path matches the guard's `matcher` pattern, rather than
requiring the developer to remember to add the check themselves.

## The `redirectedFrom` detail

Passing the originally-requested path as a query param to the login page
isn't decorative — it's what allows a login flow to redirect the user
back to where they were actually trying to go after they successfully
authenticate, rather than dropping them at a generic default landing
page regardless of intent.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll write middleware that
checks a session token against a protected path pattern, redirecting
unauthenticated requests to a login page while preserving the originally
requested path for post-login redirection.

## Try it

Write middleware that redirects unauthenticated requests to `/admin/*`
routes to `/login`, preserving the original path so login can redirect
back afterward.

```scratchpad middleware-based-route-guarding
export async function middleware(request: NextRequest) {
  // ...
}
export const config = { matcher: ["/admin/:path*"] };
```

````reveal Work through it
```ts
export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const isValid = sessionToken && (await verifySession(sessionToken));

  if (!isValid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
```

The `matcher` already scopes this to `/admin/*`, so no additional path
check is needed inside the function. Attaching `redirectedFrom` as a
query param is what lets the login page send the user back to where
they were actually trying to go, rather than a generic default landing
page after they authenticate.
````
