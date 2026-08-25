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

The same dummy trick works in reverse: instead of anchoring an existing
head, it anchors a **new** list you're building node by node. Keep a
`tail` pointer starting at the dummy; each time you attach a node, do
`tail.next = node` then `tail = node`. Return `dummy.next` at the end —
the dummy was never part of the real list, just scaffolding that gave the
very first attached node a `.next` to be written into. Merging two sorted
lists is exactly this: walk both inputs, repeatedly attach the smaller
head onto the dummy-anchored tail, and never allocate a new node — only
rewire existing ones.

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
  and they *must* meet (the cycle problem proves why). Picture two
  runners on a circular track, one moving twice as fast as the other: no
  matter the head start, the faster runner eventually laps the slower one
  and the two end up standing in the same spot. On a straight, dead-ending
  path there's no lap to close — the faster runner just reaches the end
  and stops. A cyclic list behaves exactly like the track, which is why
  fast and slow are guaranteed to meet, and an acyclic list behaves like
  the straight path, which is why they never will;
- a variant — two *same-speed* walkers with a fixed **gap** of n — finds
  the n-th node from the end in one pass: advance a lead pointer n nodes
  ahead first, then move both pointers together, one step at a time. The
  lead pointer needs exactly n more steps to fall off the end (`None`);
  the trailing pointer, moving in lockstep, covers that same n steps from
  wherever it started — landing precisely on the n-th node from the end
  when the lead pointer runs out.

The runner converts "I'd need the length first" problems (two passes)
into one-pass solutions carrying relative position as state.

**The bug this pattern invites:** `fast` reads two nodes ahead per step —
`fast.next.next` — so the loop guard has to check *both* hops are safe
before taking them: `while fast and fast.next`. Checking only `fast` and
skipping the second half of the guard is worse than a guaranteed crash —
it's a *coin flip* that depends on list length. `fast` visits nodes
1, 3, 5, … (1-indexed): on an **odd**-length list it eventually lands
exactly on the last node, the guard passes (`fast` isn't `None`), and the
body's `fast.next.next` tries to dereference `.next` on `None` — crash. On
an **even**-length list `fast` instead lands on the *second-to-last* node;
`fast.next.next` resolves cleanly to `None`, and the next guard check
exits the loop with no error. Test only against even-length inputs — an
easy accident — and this bug ships invisibly, the same way `delete_all`'s
advance-after-splice bug passes single-deletion tests and only breaks on
consecutive targets. The order in the correct guard matters too: `fast and
fast.next` short-circuits safely (`fast.next` is only evaluated once
`fast` is confirmed not `None`), but `fast.next and fast` evaluates
`fast.next` first and crashes on the exact same `None` it was trying to
guard against.

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
        "The need for a tail pointer — with a dummy node absorbing every edge case at the front, the list no longer needs a separate reference tracking its final node either",
        "The O(n) search cost — the dummy node lets edits happen without first locating the target through a linear walk, collapsing what would be a search-then-splice into a single O(1) operation",
        "The head-has-no-predecessor special case: with a fake predecessor in front, edits at the head use the same prev.next rewiring as everywhere else, and dummy.next always names the current head"
      ],
      "answer": 2,
      "explanation": "Surgery is always phrased as 'rewrite the predecessor's next'. The dummy manufactures a predecessor for the head, collapsing the branchy case into the general one — fewer branches, fewer bugs."
    },
    {
      "question": "In the reversal walk, why must nxt = curr.next be saved BEFORE curr.next = prev?",
      "options": [
        "To keep prev valid — prev's own reference could be silently invalidated by the flip if nxt weren't captured first, since both variables secretly alias the same underlying node object",
        "Order doesn't matter — both work; whether nxt is captured before or after the flip, the three-pointer walk ends up visiting and reversing the exact same sequence of nodes either way",
        "curr.next is the only route to the rest of the list; flipping it first would orphan everything not yet reversed — the saved nxt is the lifeline the march depends on"
      ],
      "answer": 2,
      "explanation": "One pointer write destroys the only forward reference. The three-name dance exists precisely to hold the lifeline across the flip. Losing-the-rest-of-the-list is THE classic reversal bug."
    },
    {
      "question": "In delete_all, why does the walker advance only in the else-branch?",
      "options": [
        "Because prev could become null — advancing inside the if-branch risks stepping prev past the end of the list entirely, leaving it dangling on a deleted node with no valid next to inspect",
        "After a splice, prev.next is a NEW, uninspected node; advancing would skip it — e.g. two consecutive targets would leave the second one alive",
        "Efficiency — skipping saves steps; not advancing after a splice trims one iteration off the loop's total step count, a minor performance tweak rather than something correctness depends on"
      ],
      "answer": 1,
      "explanation": "The splice pulls the next-next node INTO the current inspection slot. Advance-after-splice is the second classic list bug: it passes single-deletion tests and fails on consecutive targets like [7,7,3]."
    }
  ]
}
```
