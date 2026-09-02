---
title: "RSC Serialization Limits & Boundary Gotchas"
practiceFormat: trace
depth: essential
---

## Why this lesson isn't optional advanced trivia

The Phase 0 review that shaped this course's depth tags specifically
moved this topic from "advanced" to "essential," and the reasoning is
worth stating plainly: **this isn't a rare edge case — it's a
foundational gatekeeper.** If you don't understand what can and can't
cross the client-server boundary, you will write code that fails in ways
that look confusing and arbitrary, because you're missing the one rule
that would have made the failure predictable.

## What "crossing the boundary" actually means

When a Server Component renders a Client Component and passes it props,
those props have to travel from server execution to client execution —
they're part of the serialized payload the previous two lessons
described. That's the moment this lesson is about: **not every
JavaScript value can be serialized into that payload.**

This is conceptually the same constraint you'd hit sending data as JSON:
JSON can represent strings, numbers, booleans, plain objects, and arrays
— it cannot represent a function, a class instance with methods, or a
value like `undefined`. React Server Components' serialization format is
richer than plain JSON (it can represent things like Promises and other
React-specific values), but the core limitation is the same in spirit:
**if a prop value can't be meaningfully converted into the serialized
format, passing it from a Server Component to a Client Component will
fail.**

## The specific things that break

- **Functions.** You cannot pass a plain function as a prop from a Server
  Component to a Client Component. A function is executable code tied to
  a specific runtime's memory — there's no meaningful way to serialize
  "run this logic" and hand it to a different execution environment.
  (Server Actions, from the previous lesson, are the sanctioned exception
  — but that's not passing a function value as a prop, it's Next.js
  generating a network-call wrapper for a specifically-marked function.)
- **Class instances.** An instance of a custom class carries its
  prototype chain and methods with it — passing `new MyClass()` as a prop
  loses that structure in serialization; what would arrive on the client
  side is not a real, functional instance of that class.
- **Non-serializable built-ins**, depending on context — things like
  `Map`/`Set` in some serialization paths, or values that reference
  browser-only globals that don't exist during server execution in the
  first place.

## Why the error is confusing if you don't know this rule

Without knowing this constraint exists, the failure mode looks
mysterious: your code compiles fine, the types might even look correct if
your typing is loose, and then at runtime you get an opaque
serialization error — or worse, silently broken behavior where the prop
just isn't what you expected on the client side. Once you know the rule,
the fix is almost always mechanical: move whatever non-serializable logic
you were trying to pass down so it constructs the value it needs *inside*
the Client Component itself, rather than trying to hand it a
non-serializable value from the server.

## What the practice drill is testing

This is a pattern-recognition skill under time pressure — spotting which
specific prop in a snippet is the one that will fail, and being able to
say precisely why, not just "something here looks server-y."

**Practice (Trace-the-Execution):** you'll be shown several code
snippets, each passing a different kind of value from a Server Component
into a Client Component. Your task is to identify which snippets would
actually fail at the serialization boundary, explain the specific reason
for each failure, and distinguish those from snippets that look
suspicious but are actually fine.
