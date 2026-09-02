---
title: "Optimistic UI Updates"
practiceFormat: sandbox
depth: advanced
---

## The gap between "clicked" and "confirmed"

A Server Action mutation, even a fast one, involves a real network round
trip to the server. Waiting for that round trip to fully resolve before
updating the UI at all means every mutation — liking a post, posting a
comment — has a visible, if brief, moment where the interface hasn't
acknowledged the user's action yet. `useOptimistic` closes that gap by
updating the UI **immediately**, assuming the mutation will succeed, then
reconciling with the real result once the server actually responds.

## The hook

```tsx
"use client";
import { useOptimistic } from "react";
import { addComment } from "@/app/actions";

function CommentSection({ comments }: { comments: Comment[] }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, newComment],
  );

  async function handleSubmit(formData: FormData) {
    const text = formData.get("text") as string;
    addOptimisticComment({ id: "temp", text, pending: true });
    await addComment(formData);
  }

  return (
    <>
      {optimisticComments.map((c) => (
        <p key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>{c.text}</p>
      ))}
      <form action={handleSubmit}>{/* ... */}</form>
    </>
  );
}
```

`useOptimistic` takes the current confirmed state and an update function,
and returns a derived optimistic state plus a function to apply a
tentative update to it. The moment `addOptimisticComment` is called, the
UI reflects the new comment — visually distinguished as `pending` here —
before `addComment`'s server round trip has resolved at all.

## What happens when the server responds

Once the real Server Action completes and the underlying `comments` prop
updates with the server's confirmed data (through the same cache
invalidation mechanics covered in Module 3), React reconciles the
optimistic state back to the real, confirmed state automatically. If the
mutation actually failed, the optimistic entry needs to be handled by
your own error-recovery logic — `useOptimistic` doesn't automatically
roll back a failed mutation for you; that's a case your action's error
path and calling component need to account for explicitly.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll enhance a comment-section
form so a newly submitted comment appears immediately in the UI via
`useOptimistic`, before the underlying Server Action's mutation has
actually completed.
