---
title: "Middleware Performance & Scoping"
practiceFormat: pr-review
depth: essential
---

## The default that catches almost everyone at least once

The previous lesson mentioned this in passing; this lesson makes it the
whole point, because it's a genuinely common, genuinely expensive
mistake: **middleware runs on every single request that matches its
configuration by default — and the default configuration matches
everything, including static assets.** Images, CSS files, JavaScript
bundles, fonts — none of that is automatically excluded unless you tell
Next.js to exclude it.

## Why this is a real performance problem, not a theoretical one

Imagine a middleware function that validates an auth token by calling an
external identity service — a reasonable, common pattern. If that
middleware has no scoping configuration, it runs on *every* request the
browser makes while loading a page: the HTML document request, yes, but
also every single image, every CSS file, every JS chunk, every font file.
A page that loads twenty static assets just triggered twenty redundant
calls to that external identity service, for resources that have nothing
to do with authentication at all.

This directly worsens **Time to First Byte (TTFB)** — the very first
measurable moment a browser gets any data back from the server, which is
also a Core Web Vitals-adjacent metric interviewers specifically probe
for when discussing performance. Unscoped middleware doesn't just waste
backend resources; it makes every matching request measurably slower,
including ones where that slowness is completely unnecessary.

## The fix: a `matcher` config

Middleware supports an exported `config` object with a `matcher` field
that restricts which paths actually trigger it:

```ts
// middleware.ts
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, and common static asset extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

The exact pattern varies by project, but the principle is constant:
**explicitly exclude the paths that don't need this middleware's logic**,
rather than relying on the default of matching everything and hoping the
middleware's own internal logic is cheap enough not to matter. A
well-scoped matcher is the single highest-leverage middleware performance
fix available, because it eliminates the wasted work entirely rather than
trying to make that wasted work faster.

## Why this is a code-review skill, not just a "know the config" skill

In practice, this bug rarely shows up as "I forgot to write a matcher" —
it shows up as an existing middleware file that has *some* matcher
configuration, but one that's subtly too broad, or a middleware file with
no matcher at all sitting in a codebase you've inherited. Recognizing
that gap by reading the code — not by being told "there's a bug here" —
is exactly the skill a senior-level interview loop is checking, which is
why this lesson's practice format is a code review, not a from-scratch
build.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll be given a middleware
file with an unscoped (or too-broadly-scoped) matcher performing an
external token-validation call, presented as a pull request. Your task is
to identify the exact lines responsible for the performance problem and
rewrite the matcher configuration to correctly exclude static assets,
explaining why the original configuration was harming TTFB.

## Try it

Review this pull request:

```ts
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const isValid = await fetch("https://auth.internal/verify", {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.ok);
  if (!isValid) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
// no `config` export
```

What's the performance problem, and what's the fix?

````reveal Work through the review
There's no `config.matcher` at all, which means this middleware — and
its external `fetch` call to `auth.internal/verify` — runs on **every
matching request by default**, including every image, CSS file, and JS
chunk the page loads. A page with twenty static assets triggers twenty
redundant calls to the auth service.

```ts
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Adding this matcher scopes the middleware to actual page navigations,
eliminating the wasted calls entirely rather than trying to make each
individual call faster.
````
