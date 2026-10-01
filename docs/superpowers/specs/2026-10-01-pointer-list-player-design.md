# Pointer lists in the list player

Issue #26 (phase 2 of #14, the Linked Lists pilot). Status: approved by the agent under the owner's
standing autonomy (2026-09-28), for review with the PR.

## 1. Why

`kit/lists.js` draws one `List` object (head, tail, size) and three walk names (`prev`, `curr`,
`node`). It was built for `build-a-linked-list`, and its invariants are that class's (head reaches
every node, tail is last, size matches). The module's five problem lessons need the same visual for
code that has no `List` at all, only nodes and the pointers a solution holds:

| Lesson | What the player must show |
|---|---|
| reverse-linked-list | arrows flipping in place, `prev`/`curr`/`nxt`, `prev = null` at the start and `curr = null` at the end |
| middle-of-list | `slow` and `fast` on one node, then apart; `fast = null` ending the loop |
| linked-list-cycle | a list whose tail links back into it (a rho), `slow`/`fast` meeting inside the loop |
| merge-two-sorted | two input chains and a `dummy` node, a `tail` stitching nodes from both |
| remove-nth-from-end | a `dummy` before the head, two pointers a fixed gap apart, one node unlinked |

The verified concept lesson keeps its look, so the module reads as one visual. The graph lane
(`kit/graphs.js`) could draw these, but as circles with border-to-border edges, not the box with a
`next` port the module teaches.

## 2. What changes in `kit/lists.js`

1. **`ptrSnap(note, o)`**: a snapshot of plain nodes, no `List` needed. `o.nodes` is every node the
   walkthrough made (so none silently vanishes); `o.tags` maps any pointer name to a node or `null`;
   `o.head` names the node the chain is read from (for the accessible name and `chain`); `o.hi`, `o.done`
   as today. Each node carries a **fixed position** `{x, y}` that the lesson authors, in slot units.
   The rule every player keeps holds: only the pointers and the arrows move, never the nodes.
2. **Layout**: when a snapshot's nodes carry `x`/`y`, `listLayout` returns them as given. Otherwise it is
   unchanged, so `build-a-linked-list` draws exactly as before.
3. **Arrows**: a pointer that runs left along a row is drawn from the node's left edge to the target's
   right edge (`2 ← 3` after a flip). An arrow between rows is straight and trimmed to both boxes, so a
   cycle laid out as a rho and a merge across two rows read without curves through other nodes. The
   existing right-pointing and dropped-node paths are untouched.
4. **Names**: any tag name is drawn. `o.above` (default `head`, `tail`) sit over their node, every
   other name under it. A name that is `null` is drawn as `name = null` past the end of the row it last
   pointed into, or at the left for a name that starts null (`prev = null`), so "the loop ends when
   `fast` is null" is visible, not implied.
5. **Fields and invariants per player**: `ListPlayer` takes `o.fields(s)`, `o.inv` and `o.check(s)`;
   the defaults stay the `List` ones. A problem states its own invariant (for reversal: `prev` heads a
   reversed prefix, `curr` heads the untouched suffix, together they hold every node), checked on every
   settled step like any other.
6. **Height**: the canvas is as tall as the deepest row any loaded step uses.

## 3. Verification

- Kit tests (`tests/lessonArtifactsKit.test.ts`): fixed positions are returned unchanged; a null tag
  is reported; a cyclic chain is detected and the accessible name stops at the repeat.
- The `kit-players` specimen gains a pointer-list walkthrough (reversal, a rho), so the browser gate
  drives it in both themes before any lesson depends on it.
- Each lesson's own load-time checks run its walkthrough against the solution it shows.

## 4. Out of scope

Doubly linked lists (no lesson in this module needs `prev` links on nodes).
