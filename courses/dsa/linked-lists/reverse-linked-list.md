---
title: Reverse Linked List
type: problem
---

## Problem

Given the head of a singly linked list, reverse it **in place** and
return the new head.

**Examples**

```examples
head = [1,2,3,4,5] → [5,4,3,2,1]
head = [1] → [1]
head = [] → []
```

```constraint
0 ≤ length ≤ 5000 · follow-up: solve it iteratively AND recursively.
```

## Attempt it first

The surgery lesson gave you the three-pointer walk and its invariant.
Close the lesson, take paper, draw four nodes, and execute the dance by
hand before you code it. This is THE canonical pointer exercise — worth
doing honestly enough that you can rewrite it cold in an interview,
because sub-range reversal shows up inside harder problems constantly.



```sandbox
{
  "id": "reverse-linked-list",
  "fn": {"python": "reverse_list", "javascript": "reverseList"},
  "check": "return",
  "shape": {"0": "list"},
  "returns": "list",
  "starter": {
    "python": "# ListNode is already defined for you:\n#   class ListNode:\n#       def __init__(self, val=0, next=None): ...\ndef reverse_list(head):\n    # Return the new head.\n    pass\n",
    "javascript": "// ListNode is already defined for you:\n//   class ListNode { constructor(val, next) {...} }\nfunction reverseList(head) {\n  // Return the new head.\n}\n"
  },
  "cases": [
    { "args": [[1, 2, 3, 4, 5]], "expect": [5, 4, 3, 2, 1] },
    { "args": [[1, 2]], "expect": [2, 1] },
    { "args": [[1]], "expect": [1] },
    { "args": [[]], "expect": [] }
  ]
}
```

````reveal Hint 1 — save the lifeline before you flip
Each node's `next` is the only handle on the rest of the list. If you
rewire it first, the suffix is gone. Hold three references: the
reversed prefix, the node you are flipping, and the node after it.
````

````reveal Hint 2 — what you return
When the walk finishes, the current pointer is null — it walked off
the original tail. The new head is the last node you flipped, which
is sitting in the "reversed prefix" reference.
````

## Solution

`````reveal Solution — iterative three-pointer
````tabs
```python
def reverse_list(head):
    prev, curr = None, head       # reversed prefix: empty; untouched suffix: everything
    while curr is not None:
        nxt = curr.next            # 1) save the lifeline
        curr.next = prev           # 2) the flip
        prev = curr                # 3) march
        curr = nxt
    return prev                    # curr is None; prev heads it all
```

```typescript
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null; // reversed prefix: empty
  let curr = head; // untouched suffix: everything
  while (curr !== null) {
    const nxt: ListNode | null = curr.next; // 1) save the lifeline
    curr.next = prev; // 2) the flip
    prev = curr; // 3) march
    curr = nxt;
  }
  return prev; // curr is null; prev heads it all
}
```
````

Trace on 1→2→3: (prev=∅, curr=1) flip → 1→∅ · (prev=1, curr=2) flip →
2→1→∅ · (prev=2, curr=3) flip → 3→2→1→∅ · curr=∅, return 3. The empty
and single-node cases need no branches — the invariant covers them (loop
runs zero/one times).

```viz
{ "id": "list-reversal", "data": [1, 2, 3, 4] }
```

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One pass, three references of state, each node's next written exactly once."
}
```
`````

`````reveal Follow-up — the recursive version, honestly analyzed
````tabs
```python
def reverse_list_rec(head):
    if head is None or head.next is None:
        return head                        # base: empty or single node
    new_head = reverse_list_rec(head.next) # reverse the tail...
    head.next.next = head                  # ...then hook me on its end
    head.next = None                       # I'm the new tail (for now)
    return new_head
```

```typescript
function reverseListRec(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head; // base cases
  const newHead = reverseListRec(head.next); // reverse the tail...
  head.next.next = head; // ...then hook me on its end
  head.next = null; // I'm the new tail (for now)
  return newHead;
}
```
````

The subtle line is `head.next.next = head`: after the recursive call,
`head.next` still points at what WAS my successor — which is now the
reversed sublist's LAST node. Aiming its next back at me appends me.

Space honesty (Big O module, space lesson): n recursive frames → **O(n)
stack space**, and Python's ~1000-frame recursion limit makes this
actually crash at the constraint ceiling of 5000. The iterative version
isn't just equivalent — here it's strictly better. Recursion earns its
keep when the structure branches (trees); on a linear structure it
mostly buys elegance at stack-space cost.
`````

## Variants

- **Reverse a sub-range [left, right]** (Reverse Linked List II): dummy
  node + the same walk applied to a window — the exact composition of
  this module's patterns 1 + 2.
- **Reverse in k-groups** (hard): range reversal in a loop.
- **Palindrome linked list:** middle (next problem) + reverse second
  half + compare — three of this module's moves composed.

```quiz
{
  "question": "In the recursive version, what is head.next at the moment `head.next.next = head` executes, and why does the assignment work?",
  "options": [
    "The new head of the reversed sublist — the recursive call returns having already rewired head.next to point at the front of the newly reversed portion, which is exactly what the assignment then extends",
    "null — the recursion cleared it; since the recursive call fully processes everything below head, it also resets head's own next field to null as part of unwinding back up the call stack",
    "Still head's ORIGINAL successor — untouched by the recursive call — which is now the TAIL of the reversed sublist; pointing its next at head appends head to the reversed part"
  ],
  "answer": 2,
  "explanation": "The recursion rewired everything BEYOND head.next but never touched head or head.next itself. So head.next is a handle to the reversed sublist's end — exactly where head must attach. Then head.next = None makes head the new tail. Draw it once; it stops being magic."
}
```
