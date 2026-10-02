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

## Heaps {#heap}

The tree IS the array: node `i`'s children sit at `2i+1` and `2i+2`, its parent at `(i-1)//2`, so every heap operation is a sequence of swaps along one root-to-leaf path. The heap lane draws both readings of one set of values at once — the complete binary tree, and the flat array underneath it — so a swap glides in both together, and the edge being compared is the one below whichever index is named.

```widget #htabs "Three heap walkthroughs"
<div class="extabs" role="group" aria-label="Choose a heap walkthrough"></div><div class="lvhost"></div>
```

## Graphs {#graphs}

A graph is a fixed lane: node `k` is slot `k`, so a node takes the same tones, names and highlights as a row's cell, and a node copied onto a queue enters it from the node itself. Its edges sit under the nodes and change as a step decides them, each state told by weight and dash so none rests on colour alone: a hairline until examined, thick in the current step's tone while a step examines it, thick in the done tone once chosen, a light dash once examined and passed over, and a heavy dash in the stuck tone where it closes a cycle. Directed edges carry arrowheads, and a weight sits on a plate at the edge's middle. Every walkthrough checks its answer on load against a reference that shares none of its code.

```widget #grtabs "Four graph walkthroughs"
<div class="extabs" role="group" aria-label="Choose a graph walkthrough"></div><div class="lvhost"></div>
```


## Call trees {#calltrees}

A call tree is what a recursive function draws while it runs: one node per call, an edge from a call to each call it makes. It grows as the calls are made, and the path from the root down to the call running now is the call stack, so the frames beside the tree are that same path. A call is active while it is on the path, returned once it is done, a base case when it returns without calling itself, and pruned when a backtracking search cut it before entering it. The key names each state; a node's box carries the call's arguments, and after it returns, what it returned. Both walkthroughs run the real algorithm and check their answer against a reference that shares none of its code.

```widget #cttabs "Two call-tree walkthroughs"
<div class="extabs" role="group" aria-label="Choose a call-tree walkthrough"></div><div class="lvhost"></div>
```

## Intervals {#intervals}

An interval lane draws each interval as a bar on one shared axis: its row is its place in the list, and its position and width are its extent, so the order of the list and the order on the number line are both visible. A sweep line, a burst arrow or a running end is a named coordinate; a gap or a stretch of free time is a named range, bracketed under the axis with its extent written out. Sorting is a run of swaps that glide, and merging is one bar widening while the other leaves and the rows close up. A bar is `waiting`, `active`, `merged` or whatever the walkthrough calls its states, each drawn by its own tone and named in the key. Both walkthroughs run the real algorithm and check their answer against a reference that shares none of its code.

```widget #ivtabs "Two interval walkthroughs"
<div class="extabs" role="group" aria-label="Choose an interval walkthrough"></div><div class="lvhost"></div>
```

## Tries {#tries}

A trie is drawn on the graph lane, like a call tree: the words go in first, so the finished trie is known and every node's place is fixed, and each node appears in its slot when it is made. A node shows its letter, and the root shows `""`, the empty prefix. The word that ends at a node is written under it, so a stored word and a prefix in passing look different. The cursor is the mark `node`, the edges from the root to it are the current walk, and the fields line spells the prefix. A node on the walk, a match, a dead end and a branch left behind are each drawn by their own tone and named in the key. Word Search II pairs the trie with a board: a step onto a cell follows an edge, a letter with no edge is never stepped on, and a spent leaf is removed. Every walkthrough runs the real algorithm and checks its answers against code that shares none of the trie's.

```widget #trtabs "Three trie walkthroughs"
<div class="extabs" role="group" aria-label="Choose a trie walkthrough"></div><div class="lvhost"></div>
```

## Cost plots {#plots}

A cost plot draws how a cost grows with n: named series on one pair of axes, a cursor walking n with each series' value read out beside the plot, and named lines for a budget or a threshold. A formula is drawn as a curve; a measured series is a count taken by running the loop and counting where the work is, and each is checked against an independent statement of it before anything is drawn. Series differ in ink, dash and marker, and are named in the readout, so none rests on colour. All three walkthroughs compute every number they show.

```widget #pltabs "Three cost plots"
<div class="extabs" role="group" aria-label="Choose a cost plot"></div><div class="lvhost"></div>
```
