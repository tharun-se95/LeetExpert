---
title: Course Introduction
type: concept
---

## Cooking versus reciting recipes

Picture two people standing in a kitchen. The first has memorized fifty
recipes word for word — exact temperatures, exact times, exact
ingredients listed in exact amounts. Hand them any one of those fifty
dishes and they'll nail it. Hand them a sixth-first dish, even a simple
one built from ingredients they've cooked a hundred times before, and
they freeze — nothing in their memorized list matches this exact card, so
they don't know where to start.

The second person has never memorized a single recipe. What they know is
*technique*: how heat actually moves through a pan, why resting meat
after cooking keeps it juicy, why salt added early behaves differently
than salt added at the end. Hand them a dish they've never made, and they
look at the ingredients, reason about what the heat and the timing need
to do, and cook something good — because they understand what's actually
happening on the stove, not what a card tells them to do next.

This is a full data structures & algorithms course. Its goal is
**mastery** — the second cook, not the first. By the end, you should be
able to pick up an unfamiliar problem, reason about what the data
demands, choose a structure or technique because you understand its
costs, and implement it from scratch without a reference.

That's a different goal from most interview-prep material, which optimizes for
*recognizing* problems you've effectively seen before — the memorized-recipe
approach. Recognition is a real skill — but it's a side effect of understanding,
not a substitute for it. When
you know *why* a hash table lookup is O(1) on average and what breaks that
guarantee, you don't need to memorize which problems are "hash table
problems." You can tell.

## The three promises

Every module in this course keeps three promises — the same three things
that separate a technique-cook from a recipe-reciter:

1. **Mechanics before use.** You learn how the pan actually distributes
   heat, how the knife actually cuts, before you're handed a specific
   dish to make. You'll see how each structure actually works — how it's
   laid out in memory, what happens step by step during each
   operation — before you're asked to use it in a problem. Nothing is a
   black box.

2. **Costs come with reasons.** You're never told "sear for exactly three
   minutes" without being told *why* — what's happening to the surface of
   the meat, why it matters. You will never be given a complexity table to
   memorize. Every O(·) claim comes with the argument for it: why array
   append is O(1) *amortized*, why heapify is O(n) and not O(n log n), why
   comparison sorting can't beat O(n log n).

3. **You implement everything.** You actually cook the dish yourself,
   both hands in the kitchen — watching a video of someone else searing a
   steak doesn't teach your hands what resistance feels like. Each structure
   gets built from scratch, in both Python and TypeScript. Using `dict` or
   `Map` is fine in problems — but only after you've built the thing once
   and know what you're leaning on.

## What this course expects from you

- **You can already program.** You already know basic kitchen safety and
  how to hold a knife — you're comfortable with variables, loops,
  conditionals, functions, and basic objects/classes in at least one
  language. This course teaches DSA, not programming.
- **You attempt before you read.** You try the dish yourself before
  checking the demonstration. Problem lessons are built solve-first:
  statement, then a gate, then hints, then solutions. The struggle before the
  reveal is where the learning happens — reading solutions feels productive
  and mostly isn't.
- **You answer the quizzes honestly.** Taste your own cooking honestly —
  nobody else is grading it. They're not graded and nothing is
  reported anywhere. They exist to catch the difference between "that
  sounded reasonable" and "I can produce this myself."

## How long it takes

There are 24 modules across 5 stages — the full training menu. A module is
a few hours of real work — concept lessons, implementations, and curated
problems. Done seriously (say, one module every few days), the whole
course is a project of a few months. That's the honest cost of durable
understanding, and it's still far cheaper than cycling through hundreds of
problems whose solutions don't stick.

Next: how lessons and problems are structured, and how to work through them.
