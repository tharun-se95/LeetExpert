---
title: "Redirects, Rewrites, and the Compiler Config"
practiceFormat: pr-review
depth: essential
---

## Two ways to redirect, and they are not interchangeable

You now know middleware can issue a redirect based on a runtime
condition — a header, a cookie, something only knowable at request time.
But `next.config.js` also supports a `redirects()` function that declares
redirect rules directly, as static configuration:

```js
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: "/old-blog/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
    ];
  },
};
```

Both approaches produce a redirect. The distinction that actually matters
is **when the decision gets made and how expensive that decision is.**

## Why the static config path is architecturally cheaper

A redirect rule declared in `next.config.js` is known at **build time**.
Next.js can bake this rule directly into its routing layer — no custom
code runs on each request to *decide* whether to redirect; it's closer to
a lookup than a computation. Middleware, by contrast, runs your own
JavaScript function on every matching request, every time, to make that
same kind of decision at runtime.

```warn
That distinction has a direct performance consequence: **if a redirect
rule doesn't actually depend on anything that varies per-request** —
it's a fixed old-URL-to-new-URL mapping that's true for every single
user, every time — implementing it in middleware is strictly more
expensive than it needs to be. You're paying a runtime JavaScript
execution cost, on every request, for a decision that could have been
resolved statically at build time instead.
```

## When middleware is actually the right tool

This isn't "always prefer static config" — it's "match the tool to
whether the decision genuinely needs runtime information." Middleware
earns its cost when the redirect target depends on something only
knowable per-request: the previous lessons' examples (a user's detected
locale from a header, an auth token's validity, a feature flag's
per-user rollout state) are all things `next.config.js`'s static
`redirects()` fundamentally cannot express, because they're not fixed
mappings — they vary by who's asking.

## The pattern to recognize

The practical skill this lesson is building is pattern recognition: given
an existing redirect implementation, can you tell whether it's using
runtime logic to make a decision that's actually always the same
answer? That's the concrete, checkable signal that logic which *looks*
like it needs middleware could be moved to static config instead, with a
real performance benefit and no loss of correctness.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll be given a middleware
implementation handling what turns out to be a fixed, unconditional
URL-to-URL redirect — the kind of rule that never actually varies by
request — and asked to identify that this runtime logic is unnecessary,
then move it into static `next.config.js` configuration instead.

## Try it

Review this pull request:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/old-pricing") {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }
  return NextResponse.next();
}
```

Is middleware the right tool here? What would you change?

````reveal Work through the review
This redirect never depends on anything request-specific — `/old-pricing`
always goes to `/pricing`, for every visitor, every time. There's no
reason to pay a runtime JavaScript execution cost on every request to
make a decision that's always the same answer.

```js
// next.config.js
module.exports = {
  async redirects() {
    return [
      { source: "/old-pricing", destination: "/pricing", permanent: true },
    ];
  },
};
```

Moving this into static config lets Next.js resolve it at the routing
layer directly, with no middleware function invocation needed at all.
Middleware would still be the right call for a redirect that genuinely
depends on a header, cookie, or other per-request signal — this one
just isn't that.
````
