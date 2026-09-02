---
title: "The Environment Variable Lifecycle"
practiceFormat: pr-review
depth: essential
---

## One naming convention, one very different fate

```
NEXT_PUBLIC_ANALYTICS_ID=UA-12345
DATABASE_URL=postgres://user:pass@host/db
```

These two environment variables look structurally identical — both set
in a `.env` file, both accessed via `process.env`. But their actual
fate is completely different, and the difference hinges entirely on one
naming prefix: `NEXT_PUBLIC_`.

## What `NEXT_PUBLIC_` actually does

Any environment variable prefixed with `NEXT_PUBLIC_` is **inlined
directly into the client JavaScript bundle at build time** — its value
becomes a literal string baked into the code your browser downloads and
can inspect. This is intentional and necessary for values a client
component genuinely needs, like a public analytics ID or a publishable
API key meant to be visible.

Any environment variable **without** that prefix stays server-only — it
never reaches the client bundle, and referencing it from client-side
code doesn't work at all (it resolves to `undefined` in the browser).

## The security leak this creates when misapplied

The realistic, damaging mistake is prefixing a variable that should have
stayed server-only: `NEXT_PUBLIC_DATABASE_URL` or
`NEXT_PUBLIC_STRIPE_SECRET_KEY` compiles that secret directly into the
publicly downloadable JavaScript bundle — anyone who opens their browser's
DevTools and inspects the bundle can read it in plain text. This isn't a
runtime vulnerability requiring an attack — it's a build-time
misconfiguration that ships the secret to every visitor by default,
often going unnoticed because the code "works" (the value genuinely is
accessible where it's used) while being completely broken from a
security standpoint.

## The check this lesson trains you to run

Given any environment variable reference in a codebase, ask: is this
variable's *name* prefixed with `NEXT_PUBLIC_`, and if so, is the value
it holds something that's actually safe for every visitor to see? A
variable holding a real secret should never carry that prefix, full
stop — there's no legitimate reason to intentionally leak a secret, and
the fix for an accidentally-prefixed secret is renaming it (and rotating
the now-compromised secret, since it's already been shipped to anyone
who loaded the page while the leak was live).

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll audit a codebase for an
environment variable that's incorrectly prefixed `NEXT_PUBLIC_`, leaking
a private secret into the client bundle, identify the exact leak, and
correct the configuration.

## Try it

Review this `.env` file and its usage:

```
NEXT_PUBLIC_ANALYTICS_ID=UA-12345
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_51H...
```

```ts
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
```

What's wrong?

````reveal Work through the review
`NEXT_PUBLIC_STRIPE_SECRET_KEY` is a real secret key — the kind that
authorizes actual charges — compiled directly into the client
JavaScript bundle because of its `NEXT_PUBLIC_` prefix. Anyone who
opens DevTools and inspects the bundle can read it in plain text.
`NEXT_PUBLIC_ANALYTICS_ID` is fine to prefix — an analytics ID is meant
to be public.

```
STRIPE_SECRET_KEY=sk_live_51H...
```

The fix: drop the `NEXT_PUBLIC_` prefix so it stays server-only, **and**
rotate the key — it's already been shipped to anyone who loaded the page
while the leak was live, so renaming the variable alone doesn't undo
that exposure.
````
