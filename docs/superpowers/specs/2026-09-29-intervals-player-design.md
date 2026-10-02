# Intervals on an axis in the lane player

Status: implemented for #77 (stacked on #78, the call-tree player)

## 1. Problem

The intervals module (7 lessons) needs intervals drawn as bars on one shared numeric axis, with a sweep line, a
per-interval state and a live count. What each lesson draws:

| Lesson | Needs |
|---|---|
| sorting-intervals-and-the-sweep | bars unsorted, then sorted by start and by end; the overlap test as two bars sharing part of the axis (and touching at one endpoint); the sweep skeleton: a running state (a coordinate, a count) as a pass goes left to right |
| meeting-rooms | sorted by start; the previous end as a coordinate; an adjacent pair that overlaps; touching endpoints that do not; Meeting Rooms II: a sweep over start and end events with a live "rooms in use" and its peak |
| insert-interval | a sorted disjoint list plus one new bar entering; three zones (before, overlapping, after); the new bar widening to absorb each overlap |
| non-overlapping-intervals | sorted by end; the end of the last kept interval as a coordinate; each bar kept or dropped; a running count of drops |
| minimum-arrows-to-burst-balloons | sorted by end; an arrow as a coordinate that pierces every bar it crosses; those bars burst; a running count of arrows |
| employee-free-time | many people's bars pooled and merged; the gaps between merged blocks highlighted as free time |
| practice | nothing to draw |

The lane player's `span` is a range of *slots*, which are equal cells, so it cannot say where on a number line a
thing is or how long it is. That is the missing shape, and only that.

## 2. Decision: one new lane kind, on the existing seam

The lane player is reused whole. A new kind, `intervals` (`kit/intervals.js`), registers on `LANE_KINDS` beside
`grid`, `heap` and `graph`, so a lesson that draws none of them does not ship it (`KIT_OPTIONAL`, deps
`player, lanes`). What is reused unchanged: items and their identity, `tone` (the four states), the highlight,
`swap`/`insert`/`remove`/`move` and their glides, a second line, fields, invariants, the step track, tabs,
reduced motion, the accessible description. What the kind adds is what a row cannot say:

- `bar(id, lo, hi, at?)` and `reach(item, lo, hi)`: an item is a bar. Its **slot is its row**, its **extent
  places it and sets its width**, and its label is its extent, so the two cannot disagree. `reach` changes an extent
  in place (the bar widens where it stands).
- `mark(id, name, x)`: a named **coordinate**, not a slot: the sweep line, a burst arrow, the running end. Drawn as
  a line down through the rows with its name and value under the axis. It glides between steps.
- `span(id, name, lo, hi)`: a named **range of the axis**: a gap, free time, a zone. A tinted band behind the bars,
  with its name and extent written under the axis in a bracket, so the tint never carries the meaning alone.

Rows are the lane's own order, so **sorting is a run of swaps that glide**, and a row never holds two bars: there
is no overlap to avoid, and no packing rule that could put two bars on top of each other. A merge is `reach` on one
bar plus `remove` of the other: the bar widens while the other leaves and the rows close up.

### Why not the alternatives

- *Lane `span` with wider cells*: slot widths are one number per lane; an axis needs a width per unit of a number.
- *A grid or a scene board*: cells are equal and integer-addressed. A bar `[15, 18]` is 3 units long wherever it sits.
- *Packing bars into as few rows as possible* (a Gantt chart): it makes a bar's row depend on the other bars, so a
  merge would reshuffle unrelated rows, and it hides the sorted order the lessons are about. Not built; see §6.

### Fixed for the player's life

The scale (pixels per unit) is one number for the lane: the axis and the widest label any step shows, so a `[15,18]`
label fits its 3-unit bar. The axis defaults to the extent of everything any single operation draws (a step may set a
mark and clear it again), rounded out to whole numbers, or is set by the lesson. Only items and coordinates move.
Two tabs that each call their lane `iv` with different axes are measured apart (`key`).

Tick step is chosen so labels do not touch (1, 2, 5, 10, ...), or set with `axis.step`. A point (`lo === hi`) is drawn
as wide as its label, centred on its coordinate.

## 3. States

A walkthrough names its own states with `IvTrace`'s `states: [[name, tone, meaning]]`; each is drawn by a lane tone
(`cur`, `good`, `bad`, `dim`, or `null` for a plain bar, which is what every bar starts as). Two states drawn alike are
refused: nothing would tell them apart. The lane's description and the key beside the player use the walkthrough's
words, never a colour's.

| Lesson meaning | Name it | Tone |
|---|---|---|
| active / open / current block | `active`, `running` | `cur` |
| merged, kept, arrow-burst | `merged`, `kept`, `burst` | `good` (or `dim` for burst) |
| dropped, removed | `dropped` | `bad` |
| ended, finished | `ended` | `dim` |
| not reached yet | `waiting` | none |
| free gap | a `span` (band) | n/a |

The key (`laneKey` in `lanes.js`, shared with the call-tree key) draws each swatch in the state's own item class, so
it cannot disagree with the bars, and adds the band swatch when a range is drawn. It lists only what the shown
walkthrough uses and follows the tab. It holds the tallest tab's height (`reserve`, refitted on resize): the first
run of the gate caught the key wrapping to two lines on one tab and one on the other, which moved the whole player
below it (layout shift 0.006). The call-tree key gets the same fix, since it shares the code.

## 4. Seek safety

The algorithm runs first, recording **steps of small operations** into an `IvTrace` (`sort`, `state`, `reach`,
`merge`, `add`, `remove`, `mark`, `band`, `count`); nothing is written by hand. `ivWalk` replays them on the lane and
records a snapshot per step. The picture after k steps is a pure function of the first k (`ivState`), applied on
plain data. Every snapshot `ivWalk` records is **read back** by `ivRead`, which sees the snapshot and not the trace
(rows and their extents and tones, marks, bands, the counters on the fields line), and `ivSame` throws when the two
disagree, so a step can be shown in any order (a seek, a tab switch, the track) and mean the same thing. The kit test
does the same against a reference written in the test, on random traces read in random order.

Refused while building, so nothing draws wrong or nothing: a bar with no extent (a plain `push`), `lo > hi`, a bar,
mark or range off the axis, `merge` of a bar that is gone, an unknown state, a range with no meaning named for the key.

Invariants shown in the player (`IV_INV`): every bar starts no later than it ends; every bar, mark and range lies
inside the axis. A lesson adds its own through `o.inv` (for example, "kept bars do not overlap").

## 5. Where the code goes

`kit/intervals.js` (+ `intervals.css`), shipped only when a lesson names `kind:'intervals'`, `ivWalk(`,
`new IvTrace(` or `mountIvTabs(`. Two shared-root changes:

- `lanes.js`: a lane kind may supply `place(b, k, l)`, a slot's own `{x, y, w, h}`, for items that are not all one
  size (`layout` used to give every item the box's cell size).
- `lanes.js` gains `laneKey(host, before)`, and the key's CSS (`.ck`) moves to `lanes.css`. `callTreeKey` now
  draws through it and `calltrees.css` is deleted: a second copy of the same key would have drifted.

The kit-players specimen gains an "Intervals" section with two tabs, both generated by running the algorithm:
merge intervals on `[[1,3],[2,6],[8,10],[15,18]]` (sort, widen, close, with a gap band between blocks) and Meeting
Rooms II as a sweep over start and end events on `[[0,30],[5,10],[15,20]]` (a sweep line, `rooms in use` and
`most so far`). Each checks its answer on load against an implementation that shares none of its code (pairwise folding
until nothing touches; counting what is running at each start), and the last picture against the answer; the kit test
repeats both cross-checks with references written from scratch.

## 6. What it does not do

- **Employee grouping as separate lanes on one scale.** Employee Free Time can pool everyone's bars in one lane and
  name the employee on the bar's second line; drawing one lane per employee is possible (several interval lanes) but
  each lane measures its own scale, so their axes are not guaranteed to line up. Follow-up: a shared scale across
  interval lanes of one player.
- **Room assignment** (which room a meeting takes): rows are list order, not rooms. The count of rooms in use is
  drawn; the assignment is not.
- **Many bars.** One row per bar makes the lane as tall as the list. The lessons use 4 to 7; a long list scrolls inside
  the stage, as every tall lane does.
- **A point is label-wide**, not a hairline, so its length on the axis is not to scale (its coordinate is exact).
- **Half-open vs closed endpoints** are not drawn as different shapes: the caption and the state say which a walkthrough
  means (touching endpoints share an x on the axis).
