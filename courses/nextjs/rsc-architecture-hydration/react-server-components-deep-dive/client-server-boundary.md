---
title: "Navigating the Client-Server Boundary"
practiceFormat: trace
depth: essential
---

## Two directives, and a common misreading of both

`"use client"` and `"use server"` are the two directives that make the
Server/Client Component model from the previous lesson actually
controllable in code. They look symmetric — both are string literals at
the top of a file — but they don't do symmetric things, and misreading
that symmetry is exactly where this topic goes wrong for a lot of
developers.

## What `"use client"` actually marks

Every component in the App Router is a Server Component **by default** —
there's no directive needed to opt into server-only execution, because
that's the starting assumption. `"use client"` is what opts a component
*out* of that default, declaring: this component (and everything it
imports, transitively) needs to run in the browser, because it uses
state, effects, event handlers, or a browser-only API.

```warn
**`"use client"` does not mean "this component only runs in the
browser."** A Client Component still gets server-rendered once, for its
first paint — the server produces initial HTML for it exactly like it
would for anything else, so the user sees content immediately rather
than a blank space waiting for JavaScript. What `"use client"` actually
controls is that the component's code *also* ships to the browser and
hydrates, so it can keep running there after that first paint,
responding to clicks and holding state. "Client Component" describes
where it becomes interactive, not the only place it ever executes.
```

## What `"use server"` actually marks

This is the one that catches people off guard, because the naming
suggests it's the mirror image of `"use client"` — as if it marks "this
whole file is server-only" in the same structural sense. It doesn't.
`"use server"` marks specific **functions** as Server Actions: functions
that can be safely called *from* client code (a form submission, a button
click) while their actual execution always happens on the server.

Concretely: you can write a function marked `"use server"`, import it
into a Client Component, and call it directly from an `onClick` handler
as though it were a normal client-side function. Under the hood, Next.js
doesn't ship that function's code to the browser at all — calling it from
the client triggers a network request to the server, where the function's
real logic runs, and the result comes back to the component that called
it. From the component author's point of view it reads like a normal
function call; the client-server round trip is the mechanism Next.js
handles for you, not something you write by hand.

## Why this distinction is the actual interview question

Framed as "what do these two directives do," this can sound like
memorizing two definitions.

```brain
The version interviewers are actually testing is closer to: **given a
piece of code, can you correctly say where each part of it executes,
and why?** That requires holding both directives' real behavior at once
— not "client runs in the browser, server runs on the server" (too
vague to be useful), but something specific:
```

- A component with no directive: Server Component, runs only on the
  server, ships no code to the browser.
- A component marked `"use client"`: server-rendered once for first
  paint, then its code ships and it hydrates to run in the browser from
  then on.
- A function marked `"use server"`: callable from client code, but its
  actual execution always happens on the server, reached via a network
  call Next.js generates for you.

## What the practice drill is testing

Reading real code and correctly tracing execution location is a
different skill from reciting the rule — which is exactly the gap this
lesson's practice exercise is built to close.

**Practice (Trace-the-Execution):** you'll be given a small component
tree that mixes plain Server Components, a `"use client"` component, and
a `"use server"` function called from within that client component. Your
task is to scan the tree and correctly mark where the client-server
boundary actually sits — which components render only server-side, which
one hydrates in the browser, and which specific function call triggers a
network round-trip back to the server despite being invoked from client
code.

## Try it

```
// app/page.tsx (no directive)
import LikeButton from "./LikeButton";

async function Page() {
  const post = await db.posts.find(1);
  return <article>{post.title}<LikeButton postId={post.id} /></article>;
}

// LikeButton.tsx
"use client";
import { likePost } from "./actions";

function LikeButton({ postId }) {
  return <button onClick={() => likePost(postId)}>Like</button>;
}

// actions.ts
"use server";
export async function likePost(id) {
  await db.likes.increment(id);
}
```

For each of `Page`, `LikeButton`, and `likePost`, decide: does it run
only on the server, does it hydrate and run in the browser, or does it
run on the server but get *called* from the browser over the network?

````reveal Work through the boundary
**`Page`** has no directive and calls `await db.posts.find(1)` directly
— a Server Component. It never ships its own code to the browser; its
output crosses as a serialized RSC payload.

**`LikeButton`** is marked `"use client"` — it hydrates and runs for
real in the browser, which is exactly why it's allowed to attach an
`onClick` handler at all. Its compiled code ships as a real JS chunk.

**`likePost`** is marked `"use server"` — despite being *called* from
inside `LikeButton`'s browser-executed `onClick` handler, its own body
never runs client-side. Calling it compiles to a network request; the
increment happens back on the server, where `db.likes` is actually
reachable.

The trap this snippet is built to catch: assuming that because
`likePost` is *invoked* from client code, it *runs* on the client. The
`"use server"` directive is what determines execution location — not
which component happens to call it.
````
