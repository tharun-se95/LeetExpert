---
title: "Kit Players"
kicker: "Kit specimen · not a lesson · every shape the lane player draws"
headline: "One player for every array, string, stack and queue in the course."
lede: "This page is a test fixture for the lesson kit, not course content. It runs the lane player (kit/lanes.js, with kit/grids.js) through every shape the arrays, strings, stacks, queues and matrix lessons need, so the browser gate can hold it to the same bar as a lesson, in both themes, before any lesson depends on it."
chips:
  - "arrays **named indices and ranges**"
  - "stacks **top up**"
  - "queues **front left**"
  - "items **glide between lanes**"
  - "grids **named rows, columns and blocks**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg viewBox="0 0 560 300" role="img" aria-label="Three boxes stacked in an open-topped column, with the name top pointing at the highest one."><g fill="none" stroke="currentColor" stroke-width="1.4" opacity=".5"><path d="M220,70 V250 H340 V70"/></g><g fill="currentColor" opacity=".16"><rect x="232" y="196" width="96" height="42" rx="10"/><rect x="232" y="148" width="96" height="42" rx="10"/><rect x="232" y="100" width="96" height="42" rx="10"/></g><text x="354" y="125" fill="currentColor" font-family="JetBrains Mono,monospace" font-size="14">← top</text></svg></div></div>
---

## Arrays and strings {#arrays}

An array is a row whose slots carry their indices. Named indices such as `l` and `r` glide between slots, a named range such as `window` is a bracket over the slots it covers, and a swap moves both values so each one can be followed. A copy enters from the slot it was read from, which is what makes a resize visible.

```widget #atabs "Four array walkthroughs"
<div class="extabs" role="group" aria-label="Choose an array walkthrough"></div><div class="lvhost"></div>
```

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

## Grids and matrices {#cells}

A grid is a fixed row read with two coordinates: cell (r, c) is slot r × cols + c. Rows and columns carry names that glide, such as the spiral's four bounds, a rectangle names a block of cells, and a trail threads through the cells in the order they were visited. Values keep their identity, so a transpose shows each value crossing the diagonal, and a cell read onto a queue enters from that cell.

```widget #gtabs "Three grid walkthroughs"
<div class="extabs" role="group" aria-label="Choose a grid walkthrough"></div><div class="lvhost"></div>
```

## Two grids at once {#neighbours}

A 2D prefix sum is a second grid, one row and one column larger, where each cell holds the sum of the block above and left of it. A query over any rectangle then takes four reads, whatever its size.

```widget #prefix "Build a 2D prefix sum, then answer one query"
<div class="lvhost"></div>
```

## Tables {#tables}

A hash table's buckets are a row of small stacks: each bucket is open at the top, exactly like the call-frame stack above, and several buckets side by side are still just consecutive stack lanes. A collision is a second entry landing on the same bucket, on top of the first. A resize declares the larger table alongside the old one and copies each entry into its recomputed bucket, so it glides from the bucket it left.

A DP table is a grid whose cells carry string headers, filled one cell at a time from the cells it depends on — a diagonal match, or the better of two neighbours — drawn as arrows into the cell being filled.

```widget #ttabs "Three table walkthroughs"
<div class="extabs" role="group" aria-label="Choose a table walkthrough"></div><div class="lvhost"></div>
```
