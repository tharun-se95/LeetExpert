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



```sandbox
{
  "id": "merge-two-sorted",
  "fn": {"python": "merge_two_lists", "javascript": "mergeTwoLists"},
  "check": "return",
  "shape": {"0": "list", "1": "list"},
  "returns": "list",
  "starter": {
    "python": "# ListNode is already defined for you:\n#   class ListNode:\n#       def __init__(self, val=0, next=None): ...\ndef merge_two_lists(list1, list2):\n    # Return the merged sorted head.\n    pass\n",
    "javascript": "// ListNode is already defined for you:\n//   class ListNode { constructor(val, next) {...} }\nfunction mergeTwoLists(list1, list2) {\n  // Return the merged sorted head.\n}\n"
  },
  "cases": [
    { "args": [[1, 2, 4], [1, 3, 4]], "expect": [1, 1, 2, 3, 4, 4] },
    { "args": [[], []], "expect": [] },
    { "args": [[], [0]], "expect": [0] },
    { "args": [[5], [1, 2, 3]], "expect": [1, 2, 3, 5] }
  ]
}
```

````reveal Hint 1 — a dummy so the head is not a special case
The first splice is the same shape as every later one, if you start
from a fake node and grow a tail behind it. The real head is
`dummy.next` when you are done.
````

````reveal Hint 2 — splice, then attach the leftover
You are rewiring existing nodes, not allocating copies. Each step
takes the smaller front and advances that list. When one list is
exhausted, the other is already sorted and every remaining value is
≥ the merged tail — one pointer write attaches the rest.
````

## Solution

`````reveal Solution — dummy head, splice don't copy
````tabs
```python
def merge_two_lists(list1, list2):
    dummy = ListNode(0)
    tail = dummy                       # end of merged prefix
    while list1 is not None and list2 is not None:
        if list1.val <= list2.val:     # <= keeps the merge stable
            tail.next = list1           # splice existing node
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 is not None else list2  # attach the remainder
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
    if (l1.val <= l2.val) {
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
nodes, and tail.val ≤ both remaining fronts.* Each branch preserves
it; the final attachment is legal because the leftover list's every
value ≥ tail.val (its front survived every comparison it faced).

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
    "It's an approximation that happens to pass — attaching the whole remainder in one write occasionally produces an unsorted tail, but the test suites for this problem don't happen to catch that case",
    "Every leftover value is ≥ tail's value — the leftover's FRONT survived every comparison (it was never the smaller), and the rest of its list is ≥ its front by sortedness — so the whole chain extends the merged prefix in order",
    "Because the dummy guarantees sortedness — the sentinel node's presence at the front of the result is what forces every subsequently attached node, including the bulk-attached remainder, into correct order"
  ],
  "answer": 1,
  "explanation": "Two facts compose: the surviving front beat nothing (so it's ≥ everything consumed), and its own list is sorted behind it. Chains, unlike array ranges, attach in O(1) — this is precisely the splice advantage linked lists exist for."
}
```
