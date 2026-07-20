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

````reveal Hint — speeds and stopping condition
slow steps 1, fast steps 2. When fast runs off the end, slow has covered
half the distance. The whole correctness question hides in the loop
condition: `while fast and fast.next` — trace it on lengths 5 AND 6 and
watch which node slow ends on.
````

## Brute force, for contrast

Count length n in one pass, walk ⌊n/2⌋ nodes in a second: O(n) time,
O(1) space, two passes. Nothing wrong with it — the runner isn't faster
asymptotically; it's *one pass*, which matters for streams and matters
because this exact two-speed setup is the engine of the next problem's
cycle detection. This problem is the runner's warm-up track.

## The insight

> Position can be carried as a RELATIONSHIP between two walkers instead
> of as a number you compute first. fast at the end ⇔ slow at the middle,
> always, because fast moves exactly twice as fast — the invariant
> "fast's distance = 2 × slow's distance" holds at every step.

## Solution

`````reveal Solution — slow & fast
````tabs
```python
def middle_node(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next           # +1
        fast = fast.next.next      # +2
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
    "Step slow twice and fast once instead",
    "Loop on `fast.next and fast.next.next` instead of `fast and fast.next` — the runner stops one beat earlier, leaving slow on the first middle",
    "Return slow.next instead of slow"
  ],
  "answer": 1,
  "explanation": "Parity behavior lives entirely in the stopping condition — 'fast can take a full double-step' vs 'fast could take one more'. (Starting fast at head.next is another correct retune of the same knob.) Swapping the speeds breaks the half-distance invariant entirely, and slow.next moves the wrong way — past the second middle, not before it."
}
```
