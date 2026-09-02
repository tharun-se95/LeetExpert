---
title: "Diagnostic Sandbox: Live Mismatch Recovery"
practiceFormat: trace
depth: essential
---

## Everything Module 1 taught, under real pressure

Every concept this lesson exercises was introduced back in Module 1's
hydration chapter — what a mismatch is, why timezone-dependent rendering
and illegal DOM nesting cause them, how to read a hydration error in the
console. This lesson's purpose isn't to teach anything new; it's to
simulate the actual experience of encountering these failures live, in a
running application, without the surrounding lesson text telling you in
advance which specific cause to look for.

## Why "random offsets" is the deliberately harder version

```warn
A single, isolated hydration bug is straightforward once you know the
category of mistake to look for. A **live dashboard showing random
client rendering state offsets** is a harder, more realistic
diagnostic situation: the symptom is observable, but the underlying
cause isn't announced — it could be a genuine hydration mismatch, a
stale Router Cache entry from Module 3, or a race condition in client
state initialization that only resembles a hydration bug on the
surface. Correctly narrowing down *which* category of bug this
actually is, before attempting a fix, is the real skill this drill is
built around.
```

## The diagnostic process this drill exercises

1. **Observe the actual symptom precisely** — what specifically is
   offset, and under what conditions does it appear or disappear?
2. **Check the browser console** for an explicit hydration mismatch
   warning first — if one exists, the cause is almost certainly one of
   Module 1's known patterns.
3. **If there's no explicit hydration warning**, consider the other
   layers this course has covered that can produce similar-looking
   symptoms: a stale Router Cache (Module 3) not reflecting a recent
   mutation, or client state that wasn't correctly seeded from server
   data (Module 5).
4. **Confirm the specific cause** before changing anything — the fix for
   a hydration mismatch, a stale cache, and a state-seeding bug are all
   different, and applying the wrong one won't resolve the actual
   problem.

## What the practice drill is testing

**Practice (Trace-the-Execution):** you'll be given a live, broken
dashboard exhibiting random client-rendering state offsets and asked to
diagnose the specific root cause — distinguishing a genuine hydration
mismatch from a stale-cache or state-seeding issue — before applying a
fix.

## Try it

Symptom: a dashboard's "unread notifications" count sometimes shows a
stale number right after a user marks all as read, but there's no
hydration warning in the console at all, and refreshing the page always
shows the correct count. What category of bug is this, and why can you
rule out a hydration mismatch?

````reveal Work through the diagnosis
No hydration warning, and the count is correct after a full refresh —
both point away from a hydration mismatch, which would show a specific
console warning and would persist even after a genuine server round
trip (a mismatch is about server vs. client disagreement on one render,
not about which render is "current").

This is a **stale Router Cache** symptom: the "mark all as read" action
mutated server data correctly (proven by the refresh showing the right
count), but the client's cached snapshot of the notifications route
wasn't invalidated after the mutation. The fix is calling
`router.refresh()` after the mark-as-read action completes, forcing the
client to discard its stale cached view and pull current server state —
not a hydration fix at all, despite the surface-level resemblance
("numbers don't match what I expect").
````
