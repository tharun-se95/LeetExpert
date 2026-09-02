---
title: "Securing Server Actions"
practiceFormat: pr-review
depth: essential
---

## The consequence of "Server Actions are just HTTP endpoints"

Module 3's Server Actions lesson made a specific claim: a Server Action
compiles to a real, callable HTTP endpoint, not a private function only
reachable through your own UI. This lesson is the direct security
consequence of that fact. An endpoint that can be called from your
`<form>` can also be called by anything else that knows or discovers its
URL and request shape — including automated scanning tools that
specifically probe Next.js apps for exactly this pattern, since Server
Action endpoints are discoverable from the client bundle.

## The two checks every Server Action needs

```ts
"use server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

export async function deletePost(postId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const post = await db.posts.findUnique({ where: { id: postId } });
  if (post?.authorId !== user.id) {
    throw new Error("Forbidden");
  }

  await db.posts.delete({ where: { id: postId } });
}
```

1. **Authorization** — verifying not just that *a* user is logged in, but
   that *this specific user* is allowed to perform *this specific*
   mutation on *this specific* resource. Checking only "is someone
   logged in" and skipping the resource-ownership check is the most
   common real vulnerability — it lets any authenticated user delete or
   modify data belonging to someone else.
2. **Schema validation** — never trusting that the `FormData`/arguments
   arriving at the action match what your UI would have sent. A request
   crafted directly against the endpoint (bypassing your form's own
   client-side constraints entirely) can send anything; the actual
   validation has to happen inside the action itself, not in the form
   that happens to call it under normal use.

## Why "the UI won't let you do that" is not a security control

A disabled button, a client-side validation rule, or a hidden form field
are all *inside* the client bundle, fully visible and bypassable by
anyone who can read the page's JavaScript or call the underlying
endpoint directly. None of that constitutes real authorization or
validation — those checks only count when they run inside the Server
Action itself, on the server, where the caller can't skip them.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll review a Server Action
that's missing either its authorization check (any logged-in user can
act on any resource) or its input validation, identify the exact gap,
and implement the missing check.
