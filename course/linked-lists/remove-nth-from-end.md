---
title: Remove Nth Node From End
type: problem
---

## Problem

Given the head of a linked list, remove the **n-th node from the end**
and return the head. n is guaranteed valid.

**Examples**

```text
1→2→3→4→5, n = 2   ⇒   1→2→3→5     (removed 4)
1,         n = 1   ⇒   null         (removed the only node — the head!)
1→2,       n = 2   ⇒   2            (removed the head)
```

**Constraints:** 1 ≤ length ≤ 30 · 1 ≤ n ≤ length · follow-up: **one
pass**.

## Attempt it first

The module's graduation exercise: it composes the gap runner (surgery
pattern 3), the dummy node (pattern 1), and the stand-on-the-predecessor
discipline — all in ~10 lines. The examples deliberately include
head-removal; let that steer your setup.

````reveal Hint 1 — two passes, for grounding
Count length L; the target is node L − n + 1; walk to its PREDECESSOR
and splice. Works — but the follow-up wants the length-free version.
````

````reveal Hint 2 — carry the distance as a gap
Send `lead` exactly n steps ahead of `trail`. March both at speed 1.
When lead hits the END, trail is n from the end. But you need trail on
the PREDECESSOR of the target — and the target might be the head. One
node solves both issues at once; which pattern?
````

## Brute force, for contrast

Two passes is O(n) too — the follow-up isn't about asymptotics, it's
about carrying position relationally (the runner idea) instead of
numerically. Same lesson as Middle-of-List, one level up in precision:
this time the gap must land trail on a *specific* node, off by exactly
one from the target.

## The insight

> A fixed gap of n between two same-speed walkers is an invariant: when
> the leader exhausts the list, the trailer stands exactly n from the
> end — no length ever computed. Starting BOTH from a dummy makes the
> trailer stop on the target's PREDECESSOR (not the target), and makes
> head-removal a non-event: the head's predecessor exists — it's the
> dummy.

## Solution

`````reveal Solution — dummy + gap runner
````tabs
```python
def remove_nth_from_end(head, n: int):
    dummy = Node(0, next=head)
    lead = trail = dummy
    for _ in range(n):                 # open a gap of exactly n
        lead = lead.next
    while lead.next is not None:       # march until lead is the LAST node
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next       # trail = predecessor: splice
    return dummy.next                  # handles removed-head for free
```

```typescript
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let lead: ListNode = dummy;
  let trail: ListNode = dummy;
  for (let i = 0; i < n; i++) {
    // open a gap of exactly n
    lead = lead.next!;
  }
  while (lead.next !== null) {
    // march until lead is the LAST node
    lead = lead.next;
    trail = trail.next!;
  }
  trail.next = trail.next!.next; // trail = predecessor: splice
  return dummy.next; // handles removed-head for free
}
```
````

Why the arithmetic lands: from the dummy, lead ends on the last node
after (L − n) marches; trail, having marched the same amount from the
dummy, stands at position L − n — which is the (L − n + 1)-th node's
predecessor, i.e. exactly the node before the n-th-from-end. Trace
`1→2, n=2`: gap opens with lead on 2's... — do it on paper; the
single-node and remove-head examples are the ones worth hand-checking.

The dummy is doing double duty: it absorbs the head-removal case AND
gives trail a start position that makes "predecessor" fall out of the
same march — no −1 adjustments, no branches.

```complexity
{
  "time": "O(L)",
  "space": "O(1)",
  "why": "lead walks the list once; trail walks L − n of it. Two references and a splice."
}
```
`````

## Variants

- **Rotate List by k:** find length OR use a gap — then splice the tail
  block to the front (Rotate Array's cousin, solved by rewiring).
- **Swap Nodes in Pairs / Reverse k-group:** predecessor-held splices in
  a loop — the same stand-before-the-work discipline at higher intensity.

````reveal Module complete — what carries forward
- **Dummy + predecessor stance** is the universal list-surgery setup;
  you'll use it unchanged in every splice problem from here on.
- **Three-pointer reversal** returns inside palindrome checks, k-group
  reversal, and list reordering.
- **Fast & slow** graduates into cycle detection on ANY successor
  function (Happy Number, Find the Duplicate) and the split step of
  list merge sort.
- **Rewire, don't copy** is the mindset trees inherit: a tree node is a
  list node with two nexts.

**Next: Module 8 — Stacks**, where the call stack you met in Big O
becomes a structure you wield on purpose.
````

```quiz
{
  "question": "Both walkers start at the DUMMY, and lead marches until lead.next is null (not until lead is null). What do these two choices jointly guarantee?",
  "options": [
    "They save one iteration",
    "trail halts on the PREDECESSOR of the n-th-from-end node — startable even when that predecessor 'shouldn't exist' (head removal) — so the splice trail.next = trail.next.next is always exactly right",
    "They prevent infinite loops on cycles"
  ],
  "answer": 1,
  "explanation": "Stopping at the last node (not past it) plus the dummy's one-node head start is precisely the −1 offset that turns 'n from the end' into 'predecessor of n from the end'. Off-by-one design in pointer code is done with invariants and a hand trace, not trial and error."
}
```
