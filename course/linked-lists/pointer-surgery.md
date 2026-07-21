---
title: Pointer Surgery Patterns
type: concept
---

## Four patterns, most of the module

Linked-list problems reuse a tiny set of moves. Learn these four as
*patterns with invariants* and the problem lessons become recognition
exercises.

## 1. The dummy (sentinel) node

Last lesson's delete needed a special branch for the head — because the
head has no predecessor to rewire. The dummy trick: allocate one fake
node in front of the real head, do all surgery in terms of that, and
return `dummy.next` at the end. Now *every* real node has a predecessor;
the head case IS the general case:

````tabs
```python
def delete_all(head, target):
    dummy = Node(0, next=head)
    prev = dummy
    while prev.next is not None:
        if prev.next.value == target:
            prev.next = prev.next.next     # splice — head needs no special case
        else:
            prev = prev.next
    return dummy.next                      # new head, whatever it is
```

```typescript
function deleteAll<T>(head: ListNode<T> | null, target: T): ListNode<T> | null {
  const dummy = new ListNode(null as T, head);
  let prev = dummy;
  while (prev.next !== null) {
    if (prev.next.value === target) {
      prev.next = prev.next.next; // splice — head needs no special case
    } else {
      prev = prev.next;
    }
  }
  return dummy.next; // new head, whatever it is
}
```
````

Note the stance: the walker stands on `prev` and *inspects prev.next* —
deleting what's ahead, never what it's on. When a loop deletes, this
stance also fixes the "don't advance after a splice" subtlety: splicing
brings a new prev.next to inspect, so only the else-branch advances.

## 2. In-place reversal: the three-pointer walk

Reversing means flipping every `next` — but flipping `curr.next`
disconnects the rest of the list *unless you saved it first*. Hence
three names:

```text
prev      curr   nxt
null  ←  [A]    [B] → [C] → null      save nxt, flip curr, march on

step:  nxt = curr.next
       curr.next = prev        ← the flip
       prev, curr = curr, nxt  ← march
```

> Invariant: prev heads a fully-reversed list of everything already
> passed; curr heads the untouched remainder. When curr hits null, prev
> is the new head.

You'll implement this — both iteratively and recursively — as the first
problem. It's the most-asked linked-list operation in existence, and
sub-range reversal is the engine of several hard problems. Step through
it once here — watch the reversed region grow one flipped arrow at a
time:

```viz
{ "id": "list-reversal", "data": [1, 2, 3, 4] }
```

## 3. Fast & slow (the runner)

Two walkers, different speeds. `slow` steps once, `fast` steps twice:

- when fast exhausts the list, **slow stands at the middle** (fast covered
  2× the ground);
- if the list has a **cycle**, fast can never exhaust it — it laps slow,
  and they *must* meet (the cycle problem proves why);
- a variant — two *same-speed* walkers with a fixed **gap** — finds the
  n-th node from the end in one pass.

The runner converts "I'd need the length first" problems (two passes)
into one-pass solutions carrying relative position as state.

## 4. Splice by rewiring, not by moving

The deepest habit: linked-list algorithms **never move data** — they
re-aim pointers. Merging two sorted lists doesn't copy nodes; it stitches
existing nodes into a new chain. Reordering, partitioning, rotating: all
pointer rewires. If you find yourself copying values between nodes,
you're usually writing the array algorithm in worse clothing.

## Debugging pointer code

Three habits that catch most bugs before they run:

1. **Draw it.** Four boxes and arrows on paper beat ten minutes of
   staring. Every solution lesson in this module traces its pointers.
2. **Check the boundary trio**: empty list, single node, edit-at-ends.
   Pointer bugs live at boundaries almost exclusively.
3. **State the invariant** of your loop. "prev heads the reversed
   prefix" catches a swapped assignment instantly; vibes don't.

```quiz
{
  "questions": [
    {
      "question": "What exactly does the dummy node eliminate?",
      "options": [
        "The O(n) search cost",
        "The head-has-no-predecessor special case: with a fake predecessor in front, edits at the head use the same prev.next rewiring as everywhere else, and dummy.next always names the current head",
        "The need for a tail pointer"
      ],
      "answer": 1,
      "explanation": "Surgery is always phrased as 'rewrite the predecessor's next'. The dummy manufactures a predecessor for the head, collapsing the branchy case into the general one — fewer branches, fewer bugs."
    },
    {
      "question": "In the reversal walk, why must nxt = curr.next be saved BEFORE curr.next = prev?",
      "options": [
        "Order doesn't matter — both work",
        "curr.next is the only route to the rest of the list; flipping it first would orphan everything not yet reversed — the saved nxt is the lifeline the march depends on",
        "To keep prev valid"
      ],
      "answer": 1,
      "explanation": "One pointer write destroys the only forward reference. The three-name dance exists precisely to hold the lifeline across the flip. Losing-the-rest-of-the-list is THE classic reversal bug."
    },
    {
      "question": "In delete_all, why does the walker advance only in the else-branch?",
      "options": [
        "Efficiency — skipping saves steps",
        "After a splice, prev.next is a NEW, uninspected node; advancing would skip it — e.g. two consecutive targets would leave the second one alive",
        "Because prev could become null"
      ],
      "answer": 1,
      "explanation": "The splice pulls the next-next node INTO the current inspection slot. Advance-after-splice is the second classic list bug: it passes single-deletion tests and fails on consecutive targets like [7,7,3]."
    }
  ]
}
```
