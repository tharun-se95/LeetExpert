# Heaps in the lane player

Status: proposed for #22 (the heaps item)

## 1. Problem

The heaps module (9 lessons) teaches one idea that a flat array cannot show on its own: **the tree
IS the array.** Node `i`'s children sit at `2i+1` and `2i+2`, its parent at `(i-1)//2`, purely by
index arithmetic (`heap-property-and-array-representation.md`). Every operation the module teaches
is a sequence of swaps along a root-to-leaf path in that implied tree:

| Need | Lessons |
|---|---|
| the array IS a complete tree: same values, two readings at once | heap property & array representation |
| push = append, then swap upward (sift-up) until the parent dominates | heapify: sift-up & sift-down |
| pop = swap root↔last, drop the last, then swap downward (sift-down) with the dominating child | heapify: sift-up & sift-down |
| peek = the root, O(1), no walk | heap property; kth largest in a stream |
| heapify a raw array bottom-up (sift-down every non-leaf, from the last one back to the root) | heapify: sift-up & sift-down |
| a comparator that flips the invariant (min vs. max) | heapify (max-heap variant); K closest points |
| a heap of bounded size `k` beside an input row it reads from | top K frequent elements; kth largest in a stream |
| two heaps, kept balanced, composed in one player | find median from data stream |

A static `diagram` (`HeapArrayDiagram.tsx`, used by two lessons already) draws the tree above the
array once, for one fixed array. It is not a `StepPlayer`: no play/step controls, no fields, no
invariant panel, and nothing moves — exactly the gap the array and grid items closed for their own
structures (`docs/superpowers/specs/2026-09-27-array-string-player-design.md`,
`2026-09-28-grid-player-design.md`).

## 2. Decision: a heap lane kind, drawn twice from one set of items

A heap's backing storage is already exactly a growing lane: `push` appends, and every repair is a
`swap` between two slots. Nothing about insertion or removal needs a new mutation primitive —
`Lanes#push`, `#swap` and `#remove` already do the array-level bookkeeping other lanes use, and they
already give each item a stable identity across a swap (the point of the whole lane model). So a
heap is a lane of `kind: 'heap'`, not fixed (`push`/`pop` grow and shrink it exactly as a plain row
does), with one comparator flag (`cmp: 'min' | 'max'`) carried for the invariant check and the label.

What is new is the *view*: every item is drawn in two places from the same position data — its
array cell (the item's one real position, exactly what the ordinary tween already glides on a swap)
and a second, read-only copy in the tree above it, at the position node `k`'s completeness forces
(`heap-property-and-array-representation.md`'s own derivation: node `k` sits above the leaf span its
own subtree owns, so it never moves when a sibling subtree grows or shrinks — the same placement the
static `HeapArrayDiagram` already uses, ported here so the two never drift apart visually).

Rejected:

- **Two lanes (a `row` for the array plus a second, custom structure for the tree), synced by the
  lesson.** The lesson would have to keep two views' items in lock-step by hand on every push, pop
  and swap — exactly the duplication the lane model exists to avoid (CLAUDE.md §5), and a `swap`
  glide would need to be triggered twice, once per view, with no shared tween.
- **A second `items` entry per id (letting `layout()` place an item twice).** The seam
  (`LANE_KINDS`) only gives a kind one position per item — `items[it.id] = slotAt(b, k)` is called
  once, generically, before a kind's own `layout` runs, and the player's main draw loop tweens
  exactly that one position per id. Widening `items` to an array of positions would touch the shared
  draw loop that every existing lane kind (`stack`, `queue`, `row`, `grid`) relies on, for a need
  only one kind has. Instead the heap kind treats the array cell as that one real position (so it
  gets the existing glide, entrance and exit animation for free) and draws the tree copy itself, as
  an `over` layer computed from its own `layout()` output — the same seam grids.js already uses to
  draw a second, non-item-shaped thing (a trail, a rectangle) from one set of cells.
- **Reusing `mark`/`span` for the tree's parent-child relation.** A grid throws on `mark`/`span` for
  the same reason: a structure with its own way of naming a position should have one way, not two
  that can disagree. A heap already has one: `mark(id, name, slot)`, exactly as a plain row uses it
  for `i`, `l`, `r`. `span` is disallowed (throws) — a heap has no meaningful range.

## 3. Where the code goes

`kit/heaps.js` (+ `heaps.css`), registered on `lanes.js`'s `LANE_KINDS` seam, after `lanes.js`
(`KIT_DEPS.heaps = ["player", "lanes"]`), shipped only when a lesson names `kind:'heap'`
(`KIT_OPTIONAL`). A lesson that draws no heap does not pay for it.

## 4. The model

- Lane definition: `{id, kind:'heap', label, cmp:'min'|'max' (default 'min'), w}`.
- Mutation is entirely the existing generic API: `push` (append, keep the tree complete), `swap`
  (one repair step, up or down), `remove` (drop the last slot, after swapping the root there for a
  pop). `peek` is just `M.lane(id).items[0]`. No new Lanes method is needed for insert, extract or
  heapify — each is a short sequence of the calls above, exactly as `reverseSteps`/`monoSteps` in the
  kit-players specimen already compose primitives for their own algorithms.
- `mark(id, name, slot)` (unchanged, default behaviour: a heap does not override it) names the index
  a step is reading — `i`, `l`, `r`, or the like — below the array cell it names, exactly as a plain
  row's marks sit below its cells.
- `span` throws (`is a heap: name a slot with mark(), not span()`).
- Tones are the lane tones (`cur`, `good`, `bad`, `dim`), applied with `tone()` as on any other lane;
  they render identically on the array cell and its tree copy, since `.ln-item` tone styling
  (`lanes.css`) is reused unchanged by the tree copy's markup, not duplicated.
- `heapHolds(l)`: a plain function (not a `Lanes` method — it reads a *snapshot's* lane, the same
  shape the model tests and a walkthrough's `inv` array both already work with) checking every
  parent dominates both children, in the direction `l.cmp` names. Used by the specimen's `inv` panel
  and reusable by a lesson's own invariant.

## 5. The view

- The array cell is the item's one real position (`slotAt`), so a swap, a push (enter) or the final
  pop (exit) glide exactly as they do on a plain row — no new animation code.
- The tree is drawn as a second, non-interactive copy in an `over` layer, computed in the kind's own
  `layout(l, b, extra)`: node `k`'s position is `heap-property-and-array-representation.md`'s own
  argument — depth `d = ⌊log₂(k+1)⌋` (found here via `31 - Math.clz32(k+1)`, exact integer bit
  arithmetic, since `Math.log2` can round the wrong way exactly at a power of two), positioned above
  the leaf span its own subtree owns, so a node never moves when a sibling subtree grows or shrinks.
  The canvas is sized once, from the deepest level any snapshot in the player reaches (`measure`
  takes the max heap size seen, `block` turns it into a level count), so pushing or popping never
  resizes the tree or shifts an unrelated node.
- The tree copy carries the same value, tone and highlight as the array cell (both are drawn from
  the same item id), and glides the same way on a swap: `layout()` stores each item's value, tone
  and tree position together, so the `over` layer never needs the *previous* snapshot's item data
  (which the `under`/`over` seam does not pass) to draw an item leaving the tree — its last known
  values travelled with its last known position.
- The parent-child edge for the step being explained is the edge into whichever slot is named by a
  currently highlighted mark (`i`, `l`, `r`, ...) — a heap step is always "this index versus its
  parent" or "this index versus a child", so the mark already being highlighted names the edge with
  no second annotation needed. Every other edge is drawn, unhighlighted, so the tree's shape is
  always visible.
- Focus (phone): the array cell of any item a currently highlighted mark names, read from the
  primary `items` position (`L.items[it.id]`) the same way every other lane kind's items are found.
- The accessible name reads the heap as an array (`Min-heap h, as an array, index 0 first: ...`),
  plus its current marks — the array is the canonical reading, exactly as the visual leads with it.

## 6. Composition

- **Top k**: a heap lane beside a plain `row` lane (the input) in one player — no different from a
  grid beside a queue (`kit-players` §"Several lanes at once"/"Number of islands"): each lane kind
  keeps its own block, stacked by the existing `place()`/`boxesOf()`.
- **Running median**: two `heap` lanes in one player. Item ids are unique across the whole page, so
  the `over` layer's node and edge maps (keyed by item id, and by `lane#index` for edges) hold both
  heaps' trees without collision; each heap keeps its own array row and canvas region.

## 7. Proof

- Model tests (`lessonArtifactsKit.test.ts`) hold a heap lane to a plain array over random pushes,
  swaps and removes, check `heapHolds` against a hand-built reference on a real build-heap trace,
  check that `mark` behaves exactly as a plain row's (unchanged), and that `span` throws.
- `build.py`'s dependency test covers `heaps`.
- The `kit-players` specimen gains a `## Heaps` section: "Push and pop" (sift-up on push, sift-down
  on pop, checked by popping every element and comparing the order to `Array.prototype.sort`),
  "Heapify" (bottom-up build from a raw array, checked against the heap property and the same
  multiset of values), and "Top k" (a bounded min-heap beside an input row, checked against sorting
  the input and taking the top k). The browser gate runs every step in both themes at 1366 and
  375 px, as the other kit sections already do.
- Running median (two heaps in one player) is described here as a composition the kind supports, but
  is not built into the specimen in this change — the module's own lesson build (a later phase) is
  where it is first exercised end to end, the same boundary the grid spec drew for lesson migration.
