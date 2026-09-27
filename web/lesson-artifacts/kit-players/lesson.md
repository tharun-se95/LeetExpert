---
title: "Kit Players"
kicker: "Kit specimen · not a lesson · every shape the lane player draws"
headline: "One player for every stack and queue in the course."
lede: "This page is a test fixture for the lesson kit, not course content. It runs the lane player (kit/stacks.js) through every shape the stacks and queues lessons need, so the browser gate can hold it to the same bar as a lesson, in both themes, before any lesson depends on it."
chips:
  - "stacks **top up**"
  - "queues **front left**"
  - "items **glide between lanes**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg viewBox="0 0 560 300" role="img" aria-label="Three boxes stacked in an open-topped column, with the name top pointing at the highest one."><g fill="none" stroke="currentColor" stroke-width="1.4" opacity=".5"><path d="M220,70 V250 H340 V70"/></g><g fill="currentColor" opacity=".16"><rect x="232" y="196" width="96" height="42" rx="10"/><rect x="232" y="148" width="96" height="42" rx="10"/><rect x="232" y="100" width="96" height="42" rx="10"/></g><text x="354" y="125" fill="currentColor" font-family="JetBrains Mono,monospace" font-size="14">← top</text></svg></div></div>
---

## A stack {#stacks}

Pushes land on top and pops take from the top, so the lane is open at one end only. The name `top` follows the last item without the lesson placing it.

```widget #stackw "Push 4, 7, 2, then pop twice"
<div class="lvhost"></div>
```

## Queues and deques {#queues}

A queue is open at both ends: in at the back, out at the front. The first tab builds one from two stacks, and each item keeps its identity as it moves from one stack to the other. The ring buffer is a fixed row written by slot, so its wrap is visible.

```widget #qtabs "Three queues"
<div class="extabs" role="group" aria-label="Choose a queue"></div><div class="lvhost"></div>
```

## Call frames {#walk toc="Call frames"}

A frame is a stack item with a second line for its locals, which change in place as the call runs.

```widget #frames "reverse(1 → 2 → 3), recursively"
<div class="lvhost"></div>
```

## Several lanes at once {#shape}

A monotonic stack reads an input row with a cursor, keeps indices on a stack, and writes answers into a fixed row.

```widget #mono "Next warmer day"
<div class="lvhost"></div>
```
