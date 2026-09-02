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

```warn
Because a Server Action *is* an HTTP POST endpoint under the hood, it
inherits the same attack-surface concerns as any other endpoint your
server exposes: it can be called by anything that can construct the
right request, not just your own form's submit handler. Treating a
Server Action as "just a function I wrote" rather than "a public
network endpoint I've exposed" is the exact misconception that leads to
unvalidated, unauthorized Server Actions in production.
```

This isn't a side note — it's the entire reason a later lesson in this
course (Securing Server Actions, Module 6) exists as its own dedicated
topic.

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

## Try it

Write a Server Action `createComment` that reads a `text` field from
`FormData`, rejects empty submissions, and otherwise creates a comment.

```scratchpad server-actions-architecture
"use server";

export async function createComment(formData: FormData) {
  // ...
}
```

````reveal Work through it
```ts
"use server";

export async function createComment(formData: FormData) {
  const text = formData.get("text");
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Comment text is required");
  }
  await db.comments.create({ data: { text } });
}
```

Two things worth noticing: `formData.get("text")` returns `FormDataEntryValue
| null`, not a guaranteed `string` — a real form field can technically
be a `File`, so a type check before trusting it as a string is genuinely
necessary, not defensive-programming excess. And this function only ever
executes on the server, even though `<form action={createComment}>` is
called directly from client-rendered JSX — the `"use server"` directive
is what makes that true.
````
