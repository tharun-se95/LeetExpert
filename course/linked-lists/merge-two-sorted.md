---
title: Merge Two Sorted Lists
type: problem
---

## Problem

Given the heads of two **sorted** linked lists, merge them into one
sorted list by **splicing together the existing nodes** (no new value
copies), and return its head.

**Examples**

```text
1→2→4  +  1→3→4   ⇒   1→1→2→3→4→4
null   +  null     ⇒   null
null   +  0        ⇒   0
```

**Constraints:** 0 ≤ each length ≤ 50 · both inputs sorted.

## Attempt it first

This is the dummy node's signature problem — and the merge step you'll
meet again inside merge sort (Module 14) and k-way merging (Module 19).
The rewire-don't-copy discipline from the surgery lesson is the whole
game. Sketch two short lists and stitch them on paper first.

````reveal Hint 1 — the invariant
Keep a `tail` pointer to the END of the merged result built so far
(seeded with a dummy). At each step, both remaining lists have a front;
the SMALLER front is the next node of the answer — splice it on, advance
that list. Sortedness is exactly what makes the local choice globally
right.
````

````reveal Hint 2 — the leftover
When one list empties, the other is entirely ≥ everything merged so far
(why?). You don't loop over it — attach the WHOLE remainder with one
pointer write.
````

## Brute force, for contrast

Collect all values into an array, sort, rebuild: O((m+n) log(m+n)) and
it throws away BOTH gifts — the inputs' sortedness and the reusability
of their nodes. The splice merge is O(m+n) time, O(1) extra space, zero
allocations (beyond the dummy).

## The insight

> Two sorted streams merge in one pass because the global minimum of
> everything remaining is always one of the two FRONTS — take it, and
> the claim holds again. The dummy + tail turns "append to result" into
> a uniform two-write splice with no head special case.

## Solution

`````reveal Solution — dummy + tail splice
````tabs
```python
def merge_two_lists(l1, l2):
    dummy = Node(0)
    tail = dummy                          # end of merged prefix
    while l1 is not None and l2 is not None:
        if l1.value <= l2.value:          # <= keeps the merge stable
            tail.next = l1                # splice existing node
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 is not None else l2   # attach the remainder
    return dummy.next
```

```typescript
function mergeTwoLists(
  l1: ListNode | null,
  l2: ListNode | null,
): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy; // end of merged prefix
  while (l1 !== null && l2 !== null) {
    if (l1.value <= l2.value) {
      // <= keeps the merge stable
      tail.next = l1; // splice existing node
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 !== null ? l1 : l2; // attach the remainder
  return dummy.next;
}
```
````

Invariant: *dummy.next … tail is sorted, contains exactly the consumed
nodes, and tail.value ≤ both remaining fronts.* Each branch preserves
it; the final attachment is legal because the leftover list's every
value ≥ tail.value (its front survived every comparison it faced).

Two deliberate touches: `<=` (not `<`) takes ties from l1 first —
**stability**, which matters when nodes carry payloads beyond the key
and which merge sort will inherit; and the remainder attaches in O(1) —
looping over it would be correct but pays pointless steps.

```complexity
{
  "time": "O(m + n)",
  "space": "O(1)",
  "why": "Each comparison retires one node forever; the remainder attaches in one write. Only dummy/tail references are allocated — nodes are REUSED, not copied."
}
```
`````

## Variants

- **Merge k sorted lists:** pairwise merging or a heap of fronts —
  Module 19's k-way merge.
- **Merge sort on a linked list:** split at the middle (previous
  problem!) + recurse + THIS merge — O(n log n) sort with O(1) extra
  space per merge, no random access needed.
- **Merge sorted arrays** (in-place variant): same idea, opposite
  direction — you'll see why it runs back-to-front in Module 10.

```quiz
{
  "question": "Why is attaching the entire leftover list with one pointer write legal, rather than merging it node by node?",
  "options": [
    "It's an approximation that happens to pass",
    "Every leftover value is ≥ tail's value — the leftover's FRONT survived every comparison (it was never the smaller), and the rest of its list is ≥ its front by sortedness — so the whole chain extends the merged prefix in order",
    "Because the dummy guarantees sortedness"
  ],
  "answer": 1,
  "explanation": "Two facts compose: the surviving front beat nothing (so it's ≥ everything consumed), and its own list is sorted behind it. Chains, unlike array ranges, attach in O(1) — this is precisely the splice advantage linked lists exist for."
}
```
