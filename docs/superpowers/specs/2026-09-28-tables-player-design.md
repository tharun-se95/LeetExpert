# Tables in the lane player: hash buckets and DP dependency arrows

Status: proposed for #22 (the "tables (hash tables, DP tables)" item)

## 1. Problem

What the lessons need, read from `courses/dsa/hash-tables/` and `courses/dsa/dynamic-programming/`:

| Need | Lessons |
|---|---|
| a fixed array of buckets, each a small chain of entries; a collision extends the chain in place | `collision-chaining`, `hash-patterns`, `two-sum`, `group-anagrams` |
| a chain walked in lookup, one entry at a time, until a match or the chain ends | `collision-chaining`, `build-a-hash-map` |
| a rehash: every entry leaves its old bucket and lands in a new one, keeping identity, as the bucket count changes | `collision-chaining` ("moving day") |
| an open-addressing probe sequence over a fixed row of slots | `collision-open-addressing` |
| a 2D table with string row/column headers, filled cell by cell, where a cell's value is read off one or more earlier cells | `longest-common-subsequence`, `edit-distance`, `unique-paths`, `knapsack-style-dp`, `2d-dp-patterns` |
| which earlier cells fed a given cell — a diagonal match, or the better of two neighbours | `longest-common-subsequence` (`dp[i-1][j-1]` vs `max(dp[i-1][j], dp[i][j-1])`), `edit-distance` (three neighbours) |

1D DP (`1d-dp-patterns`, `climbing-stairs`, `house-robber`, `coin-change`) already draws as a `row` lane with marks (the pointer-movement spec's territory); this item is the 2D tables and hash buckets only.

## 2. Decisions

### 2a. Hash buckets: existing `stack` lanes, not a new kind

A bucket is a small LIFO of entries — new entries go on top, exactly the semantics `LANE_KINDS` already gives a `kind:'stack'` lane, and `LanePlayer.place()` already stands *consecutive* stack lanes side by side in one block (`lanes.js` §"Blocks down the canvas"). Declaring one stack lane per bucket (`{id:'b0',kind:'stack',label:'0'}`, `{id:'b1',...}`, …) draws exactly a row of buckets, each open at the top, each able to hold zero or more entries — the chaining picture in `collision-chaining`'s "hanging hook" blueprint, without a line of new code. `push('b2', 'dog')` files an entry, a second `push('b2', 'god')` is the collision (stacked on top, matching "hangs right behind it"), and `M.lane('b2').items` walked bottom-to-top with `tone('cur')`/`tone('good')` is the lookup scan.

A rehash is the same move the array-resize walkthrough already makes (`kit-players/lesson.js` `resizeSteps`, two `row` lanes, old kept and dimmed, `copy()` for each surviving value): declare the old bucket lanes AND the new, larger bucket-lane set together, and `copy(oldBucket, i, newBucket)` files each entry into its recomputed bucket, gliding from the old bucket it was read from (`from`/`enter` in `lanes.js`, generic across lane kinds already).

Rejected: a new `kind:'chain'` lane (a fixed row of buckets, each bucket itself a growing list). This would duplicate `place()`'s block layout, `slotAt`, glide and focus logic for a shape `stack` already draws — the same reuse argument the grid spec made against a second `Grids` model (CLAUDE.md §5, "reuse before writing").

### 2b. Open addressing: no new specimen

`collision-open-addressing.md`'s probe sequence is a fixed row (`kind:'row', cap`) with a moving cursor mark walking `i, i+1, i+2, …`, exactly what `ringSteps()` in the specimen already exercises for a ring buffer's wraparound write. It needs no new lane behaviour and no new specimen tab; the existing `row` + `mark` combination covers it, and `hash-buckets`' migration (a later phase, not this change) reuses `ringSteps`'s pattern directly.

### 2c. DP tables: a dependency-arrow layer added to `grids.js`

A DP table **is** a grid (`rkeys`/`ckeys` already label rows/columns with strings, exactly `dp`'s prefix headers). What it is missing is a way to say *this* cell's value came from *those* cells — `longest-common-subsequence`'s diagonal-vs-two-neighbours choice is the case that most needs it. Extending `grids.js` (rather than a new kind) matches how `axis`/`rect`/`path` were added to the one grid kind: a DP table shares every other grid behaviour (fixed slots, row-major addressing, identity-preserving `put`, tones) and only adds one more named, glide-free (grid cells are static; only visibility fades) overlay.

`deps(id, name, toSlot, fromSlots)`: a named set of arrows into one target cell from one or more source cells, drawn under the grid (with `path`) as short arrows that stop short of both cell edges. `toSlot === null` removes it. Modeled exactly like `rect`/`path`: a plain named map on the lane (`l.deps`), copied in `snap()`, turned into pixel endpoints in `layout()`, drawn in `under()`.

Rejected: reusing `path()` for this. A path draws one polyline through cells *in visit order* and has no direction; a dependency is inherently directional (this cell was computed FROM those), and `edit-distance`/knapsack cells can have two or three sources that are not a single line to thread through — `path([src, dst])` would say "visited src, then dst", not "dst depends on src". A dedicated arrow, drawn from each source to the shared target, says exactly that.

## 3. The model

- `deps(id, name, toSlot, fromSlots)`: `toSlot` and every slot in `fromSlots` must be a valid slot in that grid (row-major, like `rect`/`path`); `toSlot === null` (or `undefined`) removes the named set. Multiple names can be live on one grid at once, same as `rect`.
- Hash buckets need no model change: `push`/`pop`/`peek`/`copy`/`tone` on ordinary `stack` lanes, one per bucket.

## 4. The view

- An arrow is a line from a source cell's centre to the target's, shortened at both ends to clear the cell boxes, with a small filled triangle at the target end. Grid cells never move (row-major addressing is static for a lane's life), so unlike `rect`/`axis` an arrow never needs to glide between two different pixel positions — only fade in when its name appears and fade out when it is removed or superseded, keyed per `(name, source slot)` so an unchanged source-target pair does not flash.
- Colour: `--fam`, the same token `.gd-path`/`.gd-rect` use, so a dependency arrow reads as one family of "grid annotation" with paths and rectangles, not a fourth colour.
- `describe()` gains one clause per named dependency set ("`dp.at 1,1` from (0, 0)"), so the accessible name says what fed a cell, not just its value.
- Buckets: no new view code. A block of consecutive `stack` lanes is already `LanePlayer`'s "several stacks side by side" case; giving each bucket lane a short numeric label (`'0'`, `'1'`, …) draws the row of hooks directly.

## 5. Proof

- Model tests (`web/tests/lessonArtifactsKit.test.ts`) hold `deps` to a plain `Map<name, {to, from}>` reference over random set/remove operations, check out-of-range slots throw, and check isolation between snapshots (the existing `rect`/`path` test's shape). Faults planted and seen to fail (§below).
- `kit-players` gains one `## Tables` section with three tabs:
  - **Chaining** — insert four keys by hash (a natural collision, since two of them are anagrams of each other and so hash equal under a sum-of-char-codes hash), then look up one by walking its bucket's chain. Checks the finished chains against a plain JS object of arrays built by re-running the same hash over the same inserts.
  - **Resize** — a 2-bucket table takes three inserts (one bucket collides), crosses a load-factor threshold, and rehashes into 4 buckets, entries gliding from their old bucket to their recomputed one. Checks the new buckets against the hash recomputed at the new capacity.
  - **LCS table** — fills a `(m+1)×(n+1)` grid for two short strings, the diagonal-vs-two-neighbours choice drawn with `deps()` at every interior cell. Checks the corner cell's value against a plain, independent recursive LCS.
- No lesson migrates in this change (phase-3 batch work, as with grids/arrays).
