# Call trees in the lane player

Status: implemented for #78 (stacked on #62, the top of the #22 stack)

## 1. Problem

The recursion-and-backtracking module (10 lessons) and big-o's analyzing-the-recursion-tree method
step through a tree that does not exist until the algorithm runs: one node per call, growing as calls
are made. Each needs:

| Need | Where |
|---|---|
| a tree that grows as calls are made, a node's label being the call's arguments | every lesson in the module; the recursion-tree method |
| the current path from the root, lit while a call is running, retracting when it returns (choose, explore, unchoose) | subsets, permutations, combination sum, n-queens, word search |
| base cases with what they return | factorial, fibonacci, the recursion-tree method |
| pruned branches: attempted, cut before entry (a conflict, an overshoot) | n-queens, combination sum, generate parentheses |
| the call stack beside the tree, showing the same path | all of them |
| answers collected as leaves are reached | subsets, permutations, combinations |

No player on main or in #60/#61/#62 draws this shape.

## 2. Decision: no new lane kind, no new layout engine

The question the issue asked: can the engine's node-link tree boards (`engine.js` tree boards,
`trees.js`) grow incrementally? They can not, and they are the wrong root:

- They are scene boards with a per-cell state, run by the scene player. They cannot share a player with
  a stack lane, a row of answers or any other lane, which is the whole point here (the frames must be
  the path, the answers must accumulate).
- `trees.js` lays out binary trees only (`l`, `r`), in-order. A call tree is n-ary.

The graph lane (#62) already has what growth needs: node positions fixed by the lesson, slots that start
empty and are filled one at a time (an item entering a lane glides in), and `link` to add an edge while
it plays (an edge fades in). So a call tree is **a directed graph lane plus an ordinary stack lane**, and
the new code is only the bookkeeping that makes a growing tree obey the rule every player keeps, that
only the items move:

1. The algorithm runs first, into a `CallTrace` (`call`, `base`, `ret`, `prune`). When it finishes the
   whole tree is known, so every node's position is fixed before the first step is drawn
   (`callTreeLayout`: leaves left to right in call order, a parent over the middle of its first and last
   child, depth down). The graph lane names every call as a node.
2. `callTreeWalk` replays the events on the lanes. A call fills its node's slot and links its edge; the
   frame goes on the stack lane. Nothing already drawn moves, so the tree grows in place.

Extensions to the shared root, `graphs.js`, both backwards compatible:

- `gap: [x, y]` on a graph lane (default: the weight-plate gap). A tree draws no plates, so its nodes sit
  closer; without this, ten leaves ran off the stage.
- `words: {tone: name}`: what each tone is called in the lane's accessible description, so a screen
  reader hears "active", "returned", "base case", "pruned" rather than "current", "finished", "done",
  "rejected".
- The description skips slots still empty: a call that has not been made is not there to describe.

## 3. States

Named by meaning, never by colour (#64: a colour's hue differs by theme). Drawn with the existing tones,
so both themes are already measured:

| State | Tone | Meaning | Node | Edge into it |
|---|---|---|---|---|
| active | `cur` | on the path from the root; has not returned | outlined, its frame on the stack | thick (`cur`) |
| returned | `dim` | done with | empty, dashed outline | hairline (`idle`) |
| base | `good` | a base case: returned without calling itself | outlined | hairline |
| pruned | `bad` | attempted and cut before entry; never on the path | outlined | dashed heavy (`bad`) |

Every state also differs by line weight and dash, so none rests on colour alone. The innermost call, and
on a return the caller control returns to, take the item highlight. A return value replaces the node's
second line (`= 3`); until then the second line is the call's other argument.

**The key.** #71's `stateKey()` paints swatches from the scene player's `PAL`, which the lane tones do not
use, and #71 is not in this stack. `callTreeKey` draws each swatch as an item box in the state's own
class (`ln-item cur` and so on), so it paints from the same tokens as the tree and cannot disagree with
it. It lists only the states the shown walkthrough uses, and follows the tab. When #71 lands, both can
share one `.skey` style; the swatch source is the only difference.

## 4. Seek safety

The state after k events is a pure function of the first k (`callTreeState(trace, k)`: which calls exist,
each one's state and second line, the edge into it, the path). `callTreeWalk` reads every snapshot it
records back through `callTreeRead` (which sees the snapshot, not the trace) and throws when the two
disagree, so a walkthrough that draws something its events do not say fails on load. Steps can be shown in
any order (the track, a tab switch) and mean the same thing. The kit test does the same against a plain
stack machine that shares no code with the kit, on random traces read in random order.

Invariants shown in the player (`CALLTREE_INV`): the call stack holds one frame per active call; the active
calls are one per depth from the root; a pruned call has nothing below it.

## 5. Where the code goes

`kit/calltrees.js` (its key is the lane player's own `laneKey`, styled in `lanes.css`; `calltrees.css` is gone, #77), `KIT_DEPS.calltrees = ["player", "lanes", "graphs"]`,
shipped only when a lesson names `callTreeWalk(`, `new CallTrace(` or `mountCallTreeTabs(`
(`KIT_OPTIONAL`). A lesson that draws no call tree does not ship it.

## 6. What it does not do

- Memoisation's shared subproblems (a DAG, one node reached from two calls) are not drawn: a call tree has
  one node per call, which is also what the recursion-tree method counts. A lesson that wants the DAG uses
  the graph lane directly.
- A tree of more leaves than the stage is wide scrolls inside the stage, as every wide lane does.
- A board (the n-queens grid) beside the tree is a grid lane the lesson adds through `o.lanes` and drives
  from `o.on`; the specimen shows a row of answers, not a board.
