# Arrays and strings in the lane player

Status: draft for #22 (the arrays/strings item) · 2026-09-27

## 1. Problem

The rollout spec (§5.2) asks for a shared player per structure. The arrays, strings, two-pointers,
sliding-window, prefix-sum, sorting and binary-search modules (about 60 lessons) all draw one thing:
a row of values with named indices moving over it. Today the kit draws a row only through the grid
`Scene` (`engine.js`), which paints cell colours and nothing else. The verified sliding-window lesson
shows what that costs: its window is a run of cells painted `win`, and the left and right edges exist
only in the caption. A learner has to reconstruct `l` and `r` from colour.

What the lessons need, read from the module list:

| Need | Lessons (examples) |
|---|---|
| named indices that glide: `i`, `j`, `l`, `r`, `lo`, `mid`, `hi`, `read`, `write` | converging pointers, two-sum II, binary search, move zeroes |
| a range over the row, with a name: window, sorted part, search space, answer | every sliding window, boundary search, baseline sorts |
| values that move: swap, shift, rotate, compaction | rotate array, sort colors, move zeroes, cyclic placement, reverse words |
| values copied into another row: resize, prefix sums, building a new string | dynamic arrays, prefix-sum basics, strings in memory |
| a count array indexed by letter | character arithmetic, valid anagram, permutation in string |
| cell state: current, done, eliminated, found, wrong | all of them |
| rows longer than a phone is wide (10 to 16 cells) | most problem walkthroughs |

## 2. Decision: extend the lane model, do not add a renderer

`kit/stacks.js` already has fixed rows written by slot, index labels, named marks that glide between
slots, in-place `set`, tones, and items that keep their identity as they move between lanes. A row
lane is an array. So the array player is the lane model extended, and the file is renamed
`kit/lanes.js` (with `lanes.css`), because it now holds every linear structure rather than stacks.
`KIT_OPTIONAL` keys on the model's names, so lessons are unaffected by the rename.

A second renderer for arrays would duplicate layout, glide, marks, focus-follow and the gate's
coverage, and drift from the first (CLAUDE.md §5: reuse before writing).

## 3. Additions to the model

- `swap(lane, i, j)`: both items keep their identity, so both glide to each other's slot.
- `insert(lane, k, v)` / `remove(lane, k)`: a dense row shifts; the moved items glide one slot.
- `copy(from, i, to, j)`: a new item in `to`, drawn entering from the source slot, not from off-lane,
  so a resize or a prefix sum shows where each value came from.
- `span(lane, name, lo, hi)` / `span(lane, name, null)`: a named bracket over slots `lo..hi`
  (inclusive), drawn above the row, gliding as either end moves; an empty range (`lo > hi`) is drawn
  as a gap marker between two slots, because "the window is empty" is a state lessons name.
- Tones gain `cur` (being read), alongside `good` (found, placed), `bad` and `dim`. A separate `found`
  would duplicate `good`. Tones stay strokes and outlines; the text keeps the body ink, so no tone can
  cost contrast (the gate measures every step).
- Lane option `w`: the minimum cell width. Characters want 36 px, numbers 56 px.
- A dense (uncapped) row may show indices (`idx: true`).

## 4. Rows wider than the stage

The stage already follows the step's cursor on a narrow screen (`focus`). A span joins the focus set:
when a window is highlighted, the stage keeps it in view, else its moving end.

## 5. Proof

- The model tests grow with swap/insert/remove/copy/span, each held to a plain array over random
  operations, as the stack and deque are.
- The `kit-players` specimen gains an arrays section: converging pointers with a swap, a sliding
  window with its span, a dynamic array's resize by `copy`, a count array over a string. The browser
  gate runs every step in both themes.
- The sliding-window lesson is not migrated in this change (its evidence is verified and its scenes
  work); migrating lessons onto the players is the batch work of phase 3.
