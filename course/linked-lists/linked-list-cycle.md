---
title: Linked List Cycle
type: problem
---

## Problem

Given the head of a linked list, return whether the list contains a
**cycle** — some node's `next` pointing back to an earlier node, so
traversal never reaches null.

**Examples**

```text
3 → 2 → 0 → -4 ─┐        ⇒  true   (-4 links back to 2)
        ↑______|
1 → 2 → null              ⇒  false
```

**Constraints:** 0 ≤ length ≤ 10⁴ · follow-up: **O(1) memory**.

## Attempt it first

With the module's tools, the O(n)-space answer should come instantly
(which verb from the Hash Tables module?). The O(1)-space answer is
Floyd's tortoise-and-hare — you have both runners already; the work here
is convincing yourself the meeting is *guaranteed*, not lucky. Try to
argue it before opening the hints.

````reveal Hint 1 — the O(n)-space warm-up
Seen verb: walk with a set of visited NODES (node identity, not value —
values can repeat). Revisit ⇒ cycle; null ⇒ no cycle.
````

````reveal Hint 2 — why fast can't jump over slow
Suppose both are inside the cycle, fast some distance d behind slow
(distance measured around the loop). After one step each, fast gains one:
distance d − 1. The gap shrinks by EXACTLY one per step — it can't skip
from 1 to −1. So it reaches 0: they stand on the same node.
````

## Brute force, for contrast

The visited-set is O(n) time and **O(n) space** — completely correct,
and the right first answer. The follow-up's O(1) memory is what forces
the two-speed idea. (There's also a destructive trick — reverse the list
or mark nodes — that mutates input; interviewers usually rule it out.)

## The insight

> If there's no cycle, fast reaches null — done. If there IS a cycle,
> both walkers eventually enter it and never leave; inside a loop of
> length C, the gap between them changes by 1 (mod C) each step, so
> after at most C steps the gap is 0 — a guaranteed meeting, within one
> lap. No probability, no luck: the pigeonhole-style argument makes the
> runner a DETECTOR.

## Solution

`````reveal Solution — Floyd's tortoise and hare
````tabs
```python
def has_cycle(head) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next               # +1
        fast = fast.next.next          # +2
        if slow is fast:               # identity, not value!
            return True
    return False                       # fast fell off: no cycle
```

```typescript
function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next; // +1
    fast = fast.next.next; // +2
    if (slow === fast) return true; // identity, not value!
  }
  return false; // fast fell off: no cycle
}
```
````

Two details that separate correct from lucky: the comparison is **node
identity** (`is` / `===` on references — values may repeat), and it
happens **after** stepping (both start at head; comparing before moving
would report a cycle on every non-empty list). Trace it on the example
from the top of this lesson and watch the gap close by exactly one lap
after lap — 2, 1, 0:

```viz
{ "id": "fast-slow", "data": [3, 2, 0, -4], "cycleAt": 1 }
```

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Before the cycle: at most n steps to enter it. Inside: at most one lap (C ≤ n steps) until the gap closes. Two references total — the follow-up's O(1)."
}
```
`````

`````reveal Follow-up — where does the cycle START? (Cycle II)
The famous second act. After the meeting, reset one pointer to head and
step BOTH at speed 1 — they meet again exactly at the cycle's entry.

Why: let the head-to-entry distance be a, and the meeting point sit b
steps into the cycle (length C). At the meeting, slow has walked a + b;
fast has walked 2(a + b); fast's surplus a + b must be whole laps:
a + b ≡ 0 (mod C), so a ≡ −b ≡ C − b (mod C). Read that aloud: walking
**a** steps from the meeting point goes C − b + (multiples of C) around —
landing precisely on the entry. So head-walker (a steps to entry) and
meeting-walker arrive together, and their first coincidence is the entry.

````tabs
```python
def detect_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
        if slow is fast:                      # met inside the cycle
            probe = head
            while probe is not slow:          # both at speed 1
                probe = probe.next
                slow = slow.next
            return probe                      # the entry node
    return None
```

```typescript
function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      // met inside the cycle
      let probe = head;
      while (probe !== slow) {
        // both at speed 1
        probe = probe!.next;
        slow = slow!.next;
      }
      return probe; // the entry node
    }
  }
  return null;
}
```
````

The a ≡ C − b derivation is the one genuinely non-obvious step in this
module — worth reproducing on paper once. It's modular arithmetic
(Module 3) paying rent again.
`````

## Variants

- **Happy Number** (Hash Tables adjacent): cycle detection on a number
  sequence instead of nodes — Floyd works on ANY deterministic
  successor function, not just lists.
- **Find the Duplicate Number:** an array secretly encoding a linked
  list with a cycle — one of the prettiest reductions in DSA; it returns
  in Module 10.

```quiz
{
  "questions": [
    {
      "question": "What guarantees fast and slow MEET inside a cycle, rather than fast skipping over slow forever?",
      "options": [
        "Random chance, high probability",
        "The circular gap between them changes by exactly 1 per step (speeds differ by 1), so it decrements 1-by-1 to 0 — landing both on the same node within one lap",
        "Fast eventually slows down at the end of the list"
      ],
      "answer": 1,
      "explanation": "Relative speed 1 means no jumps in the gap sequence: d, d−1, …, 1, 0. A speed-3 hare against a speed-1 tortoise changes the gap by 2 — and CAN dodge slow forever on even-length cycles. The 1-2 speed pair isn't arbitrary; it's what makes the proof one line."
    },
    {
      "question": "Why must the meeting test compare node IDENTITY rather than node values?",
      "options": [
        "Identity comparison is faster",
        "Distinct nodes may hold equal values — a value match between different nodes would report a phantom cycle in a plain list like 1→1",
        "Values can be null"
      ],
      "answer": 1,
      "explanation": "A cycle is a property of the POINTER graph, not the data. `is`/`===` on references asks 'same node?', which is the actual question. Same discipline as the visited-set warm-up storing nodes, not values."
    }
  ]
}
```
