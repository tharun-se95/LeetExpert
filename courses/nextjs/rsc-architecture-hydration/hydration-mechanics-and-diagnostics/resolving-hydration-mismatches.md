---
title: "Resolving Hydration Mismatches"
practiceFormat: trace
depth: essential
---

## The single most common real-world Next.js bug

If there's one debugging skill that separates "has read about Next.js"
from "has actually shipped a Next.js app," it's this one. Hydration
mismatches are the bug you will hit in real projects far more often than
almost anything else this course covers — and it's a favorite interview
scenario precisely because it tests whether you understand the mechanism
from the previous lesson, or just memorized that "hydration is a thing
that can fail."

Recall the core idea: hydration assumes the client's render output
matches what the server already sent. A hydration mismatch is what
happens, and what React reports, when that assumption turns out to be
false.

## Cause 1: values that depend on when or where code runs

The most common cause is code whose output depends on the *environment*
it runs in, not just its inputs. Consider:

```jsx
<p>Current time: {new Date().toLocaleTimeString()}</p>
```

The server renders this at the moment it handles the request. The
browser then hydrates — potentially a moment later, sometimes with a
noticeable network delay in between. `new Date().toLocaleTimeString()`
evaluated on the client, even a fraction of a second later, can produce a
different string than what the server already rendered. React compares
the DOM's existing text ("the server's timestamp") against what the
client would produce right now ("the client's timestamp") — a
disagreement, however small, and React flags a hydration mismatch.

The same root cause covers **timezone-dependent formatting** (a server in
UTC and a browser in the user's local timezone formatting the same
instant differently) and any other value that isn't a pure function of
the component's actual props and state.

## Cause 2: illegal HTML nesting

This one is a browser-parsing quirk rather than a data problem, and it
catches people off guard because it doesn't look like a timing issue at
all:

```jsx
<p>
  <div>This is invalid HTML nesting</div>
</p>
```

The HTML specification does not allow a `<div>` (a block-level element)
inside a `<p>` (which can only contain "phrasing content" — inline-level
content). When the *browser* parses server-rendered HTML containing this,
it silently "corrects" the structure according to its own parsing rules —
commonly by closing the `<p>` early, before the nested `<div>`, producing
a different actual DOM tree than what your JSX describes. React's
client-side render then produces the DOM structure your JSX *says* it
should be, which no longer matches what the browser's own HTML parser
actually built from the server's markup. Mismatch — not because any value
changed, but because the two environments disagree on how to interpret
the same markup.

## Cause 3: browser-only checks that run too early

```jsx
function MyComponent() {
  const isDesktop = window.innerWidth > 768; // throws or misbehaves during SSR
  return <div>{isDesktop ? "Desktop view" : "Mobile view"}</div>;
}
```

`window` doesn't exist during server rendering at all — there is no
browser there. Code like this either throws outright on the server, or
(depending on how it's guarded) produces one result on the server and a
different, `window`-dependent result once it actually runs in the
browser during hydration. Either way, the server's rendered output and
the client's hydration-time render disagree.

The standard fix is to **defer browser-only logic until after hydration
is already complete**, using `useEffect` — code inside `useEffect` runs
only in the browser, and only after the initial render has already
happened, so it can't create a mismatch between what the server sent and
what hydration expects to see. The component renders one consistent
value during hydration (often a sensible default), then updates itself
afterward once the effect runs.

## The shared pattern across all three causes

Notice what all three have in common: **the server and the client
disagreed about what a component should render, for reasons that have
nothing to do with a bug in the component's logic itself.** Fixing
hydration mismatches is less about "finding the broken code" and more
about finding the specific point where a value or a rendering decision
can legitimately differ between server and client execution — and either
eliminating that difference, or deferring it to run safely after
hydration.

## What the practice drill is testing

Recognizing these three patterns in isolation, as presented above, is
one level of understanding. Diagnosing them from an actual browser
console error — which rarely spells out "this is a Cause 2 problem" — is
the harder, more realistic skill this drill is built around.

**Practice (Trace-the-Execution):** you'll be given a simulated browser
console showing a real hydration mismatch error alongside the component
code that produced it. Your task is to identify which of the root causes
above is responsible, explain precisely why the server and client
outputs diverge in this specific case, and refactor the code to eliminate
the mismatch.
