---
title: Middle of the Linked List
type: problem
---

## Problem

Given the head of a singly linked list, return the **middle node**. If
there are two middles (even length), return the **second** one.

**Examples**

```text
1 → 2 → 3 → 4 → 5        ⇒  node 3
1 → 2 → 3 → 4 → 5 → 6    ⇒  node 4   (second middle)
```

**Constraints:** 1 ≤ length ≤ 100.

## Attempt it first

Two passes (count, then walk half) is correct and worth 30 seconds. The
lesson-worthy version is one pass — the runner from the surgery lesson.
Work out for yourself where slow lands for BOTH parities before opening
the solution; the even case is where implementations differ.



```sandbox
{
  "id": "middle-of-list",
  "fn": {"python": "middle_node", "javascript": "middleNode"},
  "check": "return",
  "shape": {"0": "list"},
  "returns": "list",
  "starter": {
    "python": "# ListNode is already defined for you:\n#   class ListNode:\n#       def __init__(self, val=0, next=None): ...\ndef middle_node(head):\n    # Return the middle node (second middle if even).\n    pass\n",
    "javascript": "// ListNode is already defined for you:\n//   class ListNode { constructor(val, next) {...} }\nfunction middleNode(head) {\n  // Return the middle node (second middle if even).\n}\n"
  },
  "cases": [
    { "args": [[1, 2, 3, 4, 5]], "expect": [3, 4, 5] },
    { "args": [[1, 2, 3, 4, 5, 6]], "expect": [4, 5, 6] },
    { "args": [[1]], "expect": [1] },
    { "args": [[1, 2]], "expect": [2] }
  ]
}
```

````reveal Hint 1 — two speeds, one pass
A second walker that takes two steps for every one the first takes
covers the list twice as fast. When the fast walker runs out of nodes,
the slow one is halfway — that's the middle, without a length count.
````

````reveal Hint 2 — which middle on even length
The problem wants the *second* middle when the length is even. That
lives entirely in the stopping condition: how far fast is allowed to
go before the loop ends. Trace length 4 and length 5 on paper before
you lock the condition — they disagree by exactly one slow step.
````

## Solution

`````reveal Solution — fast & slow pointers
````tabs
```python
def middle_node(head):
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next       # +1
        fast = fast.next.next  # +2
    return slow
```

```typescript
function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next; // +1
    fast = fast.next.next; // +2
  }
  return slow;
}
```
````

Parity trace — length 5: fast visits 1,3,5 → loop ends (fast.next null)
with slow on 3 ✓. Length 6: fast visits 1,3,5, then fast.next=6 exists →
one more step: slow on 4, fast null → loop ends. Slow on 4 = second
middle ✓. The condition's ORDER matters too: checking `fast` before
`fast.next` is what makes the even case (fast = null) safe instead of a
null dereference.

(Want the FIRST middle on even lengths? `while fast.next and
fast.next.next` — the same machine, stopping one beat earlier. Knowing
how to retune the condition is the real skill.)

This tracer shows the general two-speed machine (it also detects
cycles — the identity check just never fires true on a plain list);
watch where `slow` rests when `fast` falls off:

```viz
{ "id": "fast-slow", "data": [1, 2, 3, 4, 5] }
```

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "fast touches each node at most once (skipping half), slow half of them — one pass, two references."
}
```
`````

## Variants

- **Palindrome Linked List:** middle + reverse-second-half + compare.
- **Split a list in two halves:** this, plus cutting the link — the
  divide step of merge-sorting a list (Module 14 meets Module 7).
- **Linked List Cycle** (next): same two walkers, different question.

```quiz
{
  "question": "For even lengths, this implementation returns the SECOND middle. Which single change returns the first, and why?",
  "options": [
    "Loop on `fast.next and fast.next.next` instead of `fast and fast.next` — the runner stops one beat earlier, leaving slow on the first middle",
    "Step slow twice and fast once instead — swapping which pointer moves faster reverses which half of the list gets covered first, landing the search on the opposite middle node for even lengths",
    "Return slow.next instead of slow — since slow always lags one node behind where the algorithm needs to report, reading the next field forward corrects the off-by-one and lands on the first middle"
  ],
  "answer": 0,
  "explanation": "Parity behavior lives entirely in the stopping condition — 'fast can take a full double-step' vs 'fast could take one more'. (Starting fast at head.next is another correct retune of the same knob.) Swapping the speeds breaks the half-distance invariant entirely, and slow.next moves the wrong way — past the second middle, not before it."
}
```
