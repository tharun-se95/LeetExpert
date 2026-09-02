---
title: "Server Actions Architecture"
practiceFormat: sandbox
depth: essential
---

## A function that's actually an HTTP endpoint in disguise

A Server Action looks like an ordinary async function you call directly
from a component:

```tsx
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.posts.create({ data: { title } });
}
```

```tsx
// app/new-post/page.tsx
import { createPost } from "@/app/actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

But under the hood, `createPost` is not actually invoked as a local
function call when the form submits from the browser. The `"use server"`
directive tells Next.js's build process to generate a secure, unique
endpoint for this function, and calling it from client code compiles
down to an **RPC-like HTTP POST request** to that endpoint. The function
body only ever executes on the server — the client only ever holds a
reference to "call this remote endpoint," never the function's actual
implementation.

## Why this framing matters for security

Because a Server Action *is* an HTTP POST endpoint under the hood, it
inherits the same attack-surface concerns as any other endpoint your
server exposes: it can be called by anything that can construct the
right request, not just your own form's submit handler. This isn't a
side note — it's the entire reason a later lesson in this course
(Securing Server Actions, Module 6) exists as its own dedicated topic.
Treating a Server Action as "just a function I wrote" rather than "a
public network endpoint I've exposed" is the exact misconception that
leads to unvalidated, unauthorized Server Actions in production.

## The mechanics of the round trip

1. The client-rendered `<form>` submits.
2. Next.js serializes the form data and posts it to the generated
   endpoint for `createPost`.
3. The function executes **on the server**, with full access to your
   database, environment secrets, and any server-only imports.
4. Next.js automatically handles revalidating and re-rendering affected
   UI once the action completes (the specific mechanics of *how* stale
   data gets refreshed are covered in the Cache Invalidation Mechanics
   lesson later in this chapter).

## What the practice drill is testing

Writing the `"use server"` function itself is simple; correctly wiring
it as a form's `action` prop, reading `FormData` values with the right
types, and performing a real database mutation from inside it is the
practical skill.

**Practice (Semi-Constrained Sandbox):** you'll write an isolated Server
Action that receives form input, extracts and validates the submitted
fields, and persists them via a database mutation call.
