---
title: "Internationalization (i18n) Routing"
practiceFormat: sandbox
depth: advanced
---

## Locale as a routing concern, not just a translation-strings concern

Serving a genuinely localized site isn't only about swapping translated
strings into an existing layout — it typically also means the URL
structure itself reflects locale (`/en/pricing`, `/fr/tarifs` or
`/fr/pricing`), and a first-time visitor needs to land on the right
locale automatically based on their browser or geographic signals,
without every individual page needing its own locale-detection logic.

## Middleware-driven locale detection and redirect

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "fr", "de"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));

  if (!hasLocale) {
    const preferredLocale = request.headers.get("accept-language")?.split(",")[0].split("-")[0];
    const locale = locales.includes(preferredLocale ?? "") ? preferredLocale : "en";
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}
```

This is directly the same middleware-based redirect pattern from Module
2 — detecting a property of the request (here, the `Accept-Language`
header) and redirecting to a locale-prefixed path — applied specifically
to internationalization rather than a generic example.

## Structuring routes to carry the locale

```
app/
  [locale]/
    layout.tsx      — receives params.locale, loads that locale's strings
    page.tsx
    pricing/
      page.tsx
```

A `[locale]` dynamic segment wrapping the entire route tree means every
page automatically receives the active locale as a route param, and the
locale-specific layout can load the correct translation strings once, at
the layout level, rather than every individual page re-implementing
locale detection.

## Why this is condensed to one lesson rather than a full i18n curriculum

A dedicated third-party i18n library handles the deeper mechanics of
string interpolation, pluralization rules, and translation-file
management — genuinely valuable, but a separate, orthogonal concern from
what's specific to Next.js. This lesson isolates exactly the part that
*is* Next.js-specific: the routing and middleware pattern that gets a
request to the right locale-scoped route tree in the first place.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll design middleware that
detects an appropriate locale from request headers and redirects to a
locale-prefixed path, structured to work with a `[locale]` dynamic route
segment.
