---
title: "Authentication Mechanics: Sessions vs. JWTs"
practiceFormat: null
depth: essential
---

## Two answers to "how does the server know who's asking"

Every subsequent lesson in this module — route guarding, Server Action
security, auth providers — assumes you already understand the two
fundamental ways a server authenticates a request after initial login.
Getting this foundational distinction right is what makes the later,
more practical lessons make sense rather than feel like arbitrary
configuration choices.

## Database-backed sessions

On login, the server creates a session record in a database, keyed by a
random session ID, and sends that ID to the browser as a cookie. Every
subsequent request, the server looks up that session ID in the database
to confirm the user is still authenticated and to retrieve their
identity.

- **Revocation is instant** — deleting the session row from the database
  immediately invalidates it; the very next request using that session ID
  fails the lookup.
- **Cost**: every authenticated request requires a database round trip
  just to validate the session, which is a real, ongoing cost at scale.

## JWTs (JSON Web Tokens)

On login, the server issues a cryptographically signed token containing
the user's identity claims directly, and the browser sends that token
back on each request. The server verifies the signature — no database
lookup required — to trust the claims inside it.

- **No database round trip needed to validate** — the signature itself
  is the proof of authenticity, which is why JWTs are the natural fit
  for the Edge runtime's constraints from Module 4: verifying a signature
  is cheap, self-contained computation that doesn't need Edge-incompatible
  database drivers.
- **Revocation is genuinely hard** — because the token is
  self-contained and valid until its expiry, there's no simple "delete
  this token" the way there is for a session row. Revoking a JWT before
  its natural expiry requires additional infrastructure (a
  denylist/blocklist check), which partially erodes the "no database
  lookup" advantage that made JWTs attractive in the first place.

## Why this trade-off is the actual interview-relevant content

```brain
The correct answer to "which is better" is genuinely "it depends on
what you're optimizing for" — instant revocation and simplicity favor
database sessions; Edge-runtime compatibility and horizontal
scalability without shared session storage favor JWTs. Being able to
articulate this trade-off, rather than asserting one is simply
superior, is the specific skill senior-level interviews are checking
for on this topic.
```
