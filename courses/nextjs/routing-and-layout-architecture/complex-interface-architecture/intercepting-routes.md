---
title: "Intercepting Routes"
practiceFormat: sandbox
depth: advanced
---

## The pattern: a modal that's also a real page

You've likely used the interface this lesson teaches without naming it:
click a photo in a feed, and it opens in a modal *on top of* the feed —
but if you copy that modal's URL and open it in a fresh tab, you get the
photo as a full standalone page, not a broken modal with no feed behind
it. That dual behavior — same URL, two different presentations depending
on *how* you arrived — is what intercepting routes implement.

## The syntax: `(.)`, `(..)`, `(..)(..)`, `(...)`

A folder prefixed with a dot-convention **intercepts** navigation to
another route segment, rendering that segment's content in the current
layout's context instead of performing a full route transition:

- `(.)` — intercept a segment at the **same** level
- `(..)` — intercept a segment **one level up**
- `(..)(..)` — intercept a segment **two levels up**
- `(...)` — intercept a segment from the **root**

```
app/
  feed/
    page.tsx
    @modal/
      (.)photo/
        [id]/
          page.tsx
    photo/
      [id]/
        page.tsx
```

Here, `@modal/(.)photo/[id]` intercepts navigation to `/feed/photo/123`
**when that navigation originates from within `/feed`** (a client-side
`<Link>` click), rendering the photo inside the modal slot layered over
the feed. But `/feed/photo/123`'s own `photo/[id]/page.tsx` still exists
and still renders normally — so a hard navigation (a fresh page load, a
shared link, a browser refresh) bypasses the interception entirely and
renders the real, standalone page instead.

## Why this needs parallel routes to work

Notice the `@modal` slot in that tree — intercepting routes are built on
top of the parallel-routes mechanism from the previous lesson. The
intercepted content renders into a named slot layered over the existing
page, which is exactly why the two lessons are sequenced back to back:
you can't reason correctly about intercepting routes without first having
the mental model of independently-rendered slots in a shared layout.

## The distinction the practice drill is built around

The single detail that separates "I've memorized the folder-naming
convention" from "I understand what this is for" is: **interception only
happens on soft, client-side navigation.** A hard navigation to the exact
same URL — typed directly, refreshed, or opened from a shared link —
always renders the real underlying route, never the intercepted modal
version. Getting this backwards (assuming the modal is the only way that
URL ever renders) is the most common misunderstanding this pattern
produces.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll implement a photo-feed
interface where clicking a photo opens it in a modal overlaying the feed
via a client-side navigation, while a direct visit to that same photo's
URL renders it as a full standalone page — correctly wiring both the
intercepting route and its non-intercepted counterpart.
