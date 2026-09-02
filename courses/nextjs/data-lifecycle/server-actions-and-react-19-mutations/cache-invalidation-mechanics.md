---
title: "Cache Invalidation Mechanics"
practiceFormat: pr-review
depth: essential
---

## A mutation that succeeds but appears to do nothing

Here's a scenario that looks like a bug but is actually working exactly
as designed: a Server Action successfully writes a new row to the
database — you can confirm it in the database directly — but the page
the user lands on afterward still shows the old list, missing the new
entry. This isn't a broken mutation. It's the Data Cache and Full Route
Cache from earlier in this module doing exactly what they were told:
serving cached content, because nothing has told them the underlying
data changed.

## The two invalidation tools

```ts
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createPost(formData: FormData) {
  await db.posts.create({ data: { title: formData.get("title") } });
  revalidatePath("/posts");
}
```

- **`revalidatePath(path)`** — invalidates the cache for a specific
  route path. The next request to `/posts` re-renders fresh instead of
  serving the stale cached version.
- **`revalidateTag(tag)`** — invalidates every cached `fetch` call
  anywhere in the app that was tagged with a matching `next: { tags:
  [...] }` option, regardless of which route it lives under. This is the
  tool for when the same underlying data is rendered in multiple,
  unrelated places (a post count in a sidebar widget *and* a full post
  list on another page) and a single mutation needs to invalidate all of
  them at once.

## Why forgetting this is such a common bug

The mutation itself — the database write — has no relationship to the
caching layer unless you explicitly connect them. A developer who
correctly writes the database mutation but doesn't call `revalidatePath`
or `revalidateTag` afterward has written *working* code from the
database's perspective and *broken* code from the user's perspective:
the write succeeded, but every cached surface that displayed the old
data keeps displaying it indefinitely (or until its `revalidate` time
window expires on its own).

## Choosing which one, and where

The practical judgment call is scope: a narrow, single-page fix calls for
`revalidatePath`; data duplicated across several unrelated routes calls
for a shared `revalidateTag` applied consistently at every `fetch` site
that renders that data. Reviewing a mutation and asking "every place this
data can be displayed — did the invalidation call actually reach all of
them?" is the real skill.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll review an action file
where a database mutation succeeds but a layout elsewhere in the app
keeps rendering stale data, identify the missing or too-narrowly-scoped
invalidation call, and add the correct `revalidatePath`/`revalidateTag`
call to fix it.
