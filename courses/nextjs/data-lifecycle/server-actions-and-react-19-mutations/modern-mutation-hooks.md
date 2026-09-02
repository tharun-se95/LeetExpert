---
title: "Modern Mutation Hooks"
practiceFormat: sandbox
depth: essential
---

## The gap a bare Server Action leaves open

The previous lesson's `createPost` action works, but a real form needs
more than "submit and hope": a submitting state to disable the button
and show a spinner, a way to surface a validation error back to the same
form, and a way to read that state from a component that isn't the form
itself. React 19 ships three hooks purpose-built for exactly this gap
around Server Actions.

## `useActionState` — return value and pending state, together

```tsx
"use client";
import { useActionState } from "react";
import { createPost } from "@/app/actions";

function NewPostForm() {
  const [state, formAction, isPending] = useActionState(createPost, {
    error: null,
  });

  return (
    <form action={formAction}>
      <input name="title" />
      {state.error && <p>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

`useActionState` (replacing the earlier, now-superseded `useFormState`)
wraps a Server Action so it can **return a value the form can read** —
here, a validation error — while also exposing `isPending` directly,
without you having to wire up separate state for "is this submitting
right now." The action function itself needs to accept the previous
state as its first argument to work with this hook (`createPost(prevState,
formData)`), which is the detail most likely to trip you up coming from
a plain Server Action signature.

## `useFormStatus` — pending state from a child, without prop drilling

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

`useFormStatus` reads the pending state of the **nearest parent
`<form>`**, from inside a component that isn't the form itself. This
matters for reusable submit-button components that need to know their
form's submission state without the parent form manually passing
`isPending` down as a prop.

## `useTransition` — for mutations outside a `<form>` submit

Not every mutation is a form submission — a "like" button, a drag
reorder. `useTransition` lets you wrap a Server Action call in a
non-blocking transition from any event handler:

```tsx
"use client";
import { useTransition } from "react";
import { toggleLike } from "@/app/actions";

function LikeButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleLike(postId))}
    >
      Like
    </button>
  );
}
```

## What the practice drill is testing

Each hook solves a distinct sub-problem; picking the right one for a
given UI shape — and correctly threading the action function's expected
signature through `useActionState` — is the actual skill.

**Practice (Semi-Constrained Sandbox):** you'll implement a multi-input
form using `useActionState` for validation-error display and pending
state, with a separately-composed submit button reading `useFormStatus`.
