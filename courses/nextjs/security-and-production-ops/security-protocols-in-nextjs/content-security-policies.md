---
title: "Content Security Policies (CSP)"
practiceFormat: pr-review
depth: essential
---

## What a CSP is actually defending against

A Content Security Policy is an HTTP header that tells the browser which
sources of scripts, styles, and other resources are allowed to execute
on your page — and, critically, which are not. Its primary real-world
purpose is blunting **cross-site scripting (XSS)**: even if an attacker
manages to inject a malicious `<script>` tag into your page (through an
unsanitized user input rendered unsafely, for instance), a correctly
configured CSP prevents the browser from executing it, because it didn't
come from an allowed source.

## The specific problem hydration scripts create for a strict CSP

Next.js needs to run inline scripts for hydration — the process, from
Module 1, of attaching React's client behavior to server-rendered HTML.
A maximally strict CSP that blocks all inline scripts unconditionally
would break hydration itself, along with legitimate app functionality.
The fix is **nonces**: a unique, cryptographically random value generated
fresh per request, attached both to the CSP header and to the specific
inline script tags that are allowed to run.

```ts
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const csp = `script-src 'self' 'nonce-${nonce}'; object-src 'none';`;

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  return response;
}
```

Because the nonce is regenerated on every single request, an attacker
who manages to inject a script tag into the page has no way to predict
the current nonce value — their injected script lacks a valid nonce
attribute and the browser refuses to execute it, while Next.js's own
legitimately-nonced hydration scripts still run correctly.

## The failure mode worth specifically knowing

A CSP configured with `'unsafe-inline'` in its `script-src` directive
defeats the entire nonce mechanism — it tells the browser to allow *any*
inline script regardless of nonce, which is exactly the blanket
permission an XSS payload needs. This specific misconfiguration —
present, functioning, and giving a false sense of security while
providing none — is a realistic thing to encounter in an existing
codebase's CSP setup, and recognizing it is the point of this lesson's
review-format practice.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll review a CSP
implementation and identify a configuration gap — such as an
`'unsafe-inline'` directive undermining the nonce mechanism, or a missing
nonce attachment to hydration scripts — then correct it to properly
reject unauthorized script injection.

## Try it

Review this CSP header:

```
Content-Security-Policy: script-src 'self' 'unsafe-inline' 'nonce-abc123';
```

Does this actually block an injected inline script?

````reveal Work through the review
No — `'unsafe-inline'` tells the browser to allow **any** inline script
regardless of nonce. An attacker's injected `<script>` tag has no valid
nonce, but `'unsafe-inline'` doesn't require one, so it executes anyway.
The nonce is present but functionally inert as long as `'unsafe-inline'`
sits alongside it.

```
Content-Security-Policy: script-src 'self' 'nonce-abc123';
```

Removing `'unsafe-inline'` is the fix — now only scripts carrying the
correct, per-request nonce execute. Legitimate hydration scripts (which
Next.js tags with the matching nonce) still run; an attacker's injected
script, lacking a valid nonce, does not.
````
