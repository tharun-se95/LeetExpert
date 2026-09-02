---
title: "Auth Providers in the Real World"
practiceFormat: pr-review
depth: advanced
---

## What a hand-rolled session handler is quietly getting wrong

The previous lessons in this module covered sessions, JWTs, and route
guarding as concepts you'd implement yourself — and that's genuinely
useful for understanding the mechanics. But a production auth system has
to also correctly handle OAuth provider redirects and callback
verification, CSRF protection on the auth flow itself, secure cookie
flags (`httpOnly`, `secure`, `sameSite`) configured correctly for every
environment, token refresh timing, and session fixation prevention —
each one a specific, well-known class of vulnerability with its own
established mitigation. A hand-rolled session handler that gets the
happy path working correctly can still be missing several of these,
invisibly, until someone specifically probes for them.

## What providers like Auth.js and Clerk actually abstract

```ts
// auth.ts (Auth.js / NextAuth)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
});
```

A few lines of provider configuration replace what would otherwise be
hundreds of lines of OAuth redirect handling, callback URL verification,
CSRF state-parameter checking, and secure session cookie management —
all of it already reviewed, hardened, and battle-tested against real
attacks by a project maintained specifically for this purpose, rather
than freshly written and only as secure as one team's review caught.

## The judgment this lesson is building

This isn't "never write your own auth code" — the earlier lessons in
this module are genuinely necessary for understanding what a provider is
doing under the hood, and some architectures (a security-sensitive
internal tool with unusual requirements) may have real reasons to build
custom. But recognizing when a hand-rolled flow is missing a
well-known, standard protection is the specific skill: a senior engineer
should be able to look at a manual session handler and identify "this is
missing CSRF protection on the OAuth callback" rather than treating a
custom auth implementation as inherently equivalent in safety to a
maintained provider.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll review a manually
implemented session handler, identify a specific missing protection (such
as CSRF verification on an OAuth callback, or an insecurely-configured
session cookie), and refactor the flow to use a standard auth provider
framework instead.
