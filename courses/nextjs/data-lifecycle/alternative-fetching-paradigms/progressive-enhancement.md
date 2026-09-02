---
title: "Progressive Enhancement"
practiceFormat: sandbox
depth: advanced
---

## A form that still works with JavaScript turned off

Every Server Action example so far has assumed the browser has loaded and
executed the page's JavaScript. But a `<form action={someServerAction}>`
is built on top of the **native HTML form submission model** — and that
means it keeps working even in a browser that never runs your JavaScript
at all: a slow connection where the JS bundle hasn't finished loading yet,
a corporate environment with scripting disabled, or simply the brief
window between a page's HTML arriving and its JS becoming interactive.

## Why this works without any special code

A plain `<form action={createPost}>` — with no client-side `onSubmit`
handler — degrades to a real, native HTML form submission when
JavaScript isn't available: the browser performs an actual full-page
navigation POST to the Server Action's generated endpoint, the action
executes on the server exactly as it would via the JS-enhanced path, and
the browser then renders whatever the resulting page state is. No
special "no-JS fallback" code is required for this base case — it's the
natural behavior of a real `<form>` element, which Server Actions are
built directly on top of rather than replacing.

## Where this breaks: client-only enhancements

The moment you add `useActionState` for pending-state UI or client-side
validation before submission, you've layered *progressive enhancement* on
top of a base that still works without it — but only if you're careful
not to make the enhanced behavior a **requirement** for the form to
function at all. A pattern like intercepting `onSubmit` to run
client-only validation and calling `event.preventDefault()`
unconditionally would silently break the no-JS fallback path, because
now the form's actual submission depends on JavaScript having run.

## The practical framing for an interview

The interview-relevant claim here isn't "always build for no-JS users" —
it's understanding *why* Server Actions bound to real `<form>` elements
give you this resilience for free, as an architectural property, when
most SPA form patterns (a fully client-controlled `onSubmit` handler that
manually calls `fetch`) do not. Recognizing that distinction is what
separates "I used a Server Action" from "I understand what a Server
Action's HTML-form foundation actually buys me."

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll implement a form using a
Server Action as its `action` prop, layering in client-side pending-state
UI without breaking the form's ability to submit and execute correctly
via a plain native form POST when JavaScript is unavailable.

## Try it

This form intercepts submission for client-side validation. Does it
still work with JavaScript disabled? If not, fix it.

```scratchpad progressive-enhancement
<form
  onSubmit={(e) => {
    e.preventDefault();
    if (!isValid(data)) return;
    createPost(data);
  }}
>
  {/* ... */}
</form>
```

````reveal Work through it
No — `e.preventDefault()` runs unconditionally, inside a handler that
only exists if JavaScript has loaded and executed. With JS disabled,
there's no `onSubmit` handler at all to intercept anything, but there's
also no `action` attribute pointing anywhere real, so the native
form submission has nothing correct to fall back to.

```tsx
<form action={createPost}>
  {/* client validation, layered on top, only intercepts when JS runs: */}
  <SubmitButton />
</form>
```

Passing the Server Action directly as `action` keeps the native
fallback intact — a no-JS browser performs a real POST to the action's
generated endpoint, and the action's own server-side validation (not
shown here, but necessary regardless) is what actually enforces
correctness either way. Client-side validation, if added, should be a
non-blocking enhancement layered on top — never the only path to a
working submission.
````
