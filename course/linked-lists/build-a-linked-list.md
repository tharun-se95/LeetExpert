---
title: Build a Linked List From Scratch
type: concept
---

## The node, then the list

The node is two fields. The list wraps a head (and a tail, to make
push-back O(1)) plus a size counter — all invariants we'll maintain
explicitly:

````tabs
```python
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


class LinkedList:
    def __init__(self) -> None:
        self.head: Node | None = None
        self.tail: Node | None = None
        self.size = 0

    def push_front(self, value) -> None:              # O(1)
        self.head = Node(value, next=self.head)
        if self.tail is None:                         # was empty
            self.tail = self.head
        self.size += 1

    def push_back(self, value) -> None:               # O(1) via tail
        node = Node(value)
        if self.tail is None:                         # empty list
            self.head = self.tail = node
        else:
            self.tail.next = node                     # old tail links on
            self.tail = node
        self.size += 1

    def find(self, value) -> Node | None:             # O(n)
        curr = self.head
        while curr is not None:
            if curr.value == value:
                return curr
            curr = curr.next
        return None

    def delete(self, value) -> bool:                  # O(n)
        prev, curr = None, self.head
        while curr is not None:
            if curr.value == value:
                if prev is None:                      # deleting the head
                    self.head = curr.next
                else:
                    prev.next = curr.next             # splice curr out
                if curr is self.tail:                 # deleting the tail
                    self.tail = prev
                self.size -= 1
                return True
            prev, curr = curr, curr.next
        return False

    def to_list(self) -> list:                        # O(n) — for testing
        out, curr = [], self.head
        while curr is not None:
            out.append(curr.value)
            curr = curr.next
        return out
```

```typescript
class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null,
  ) {}
}

class LinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;
  size = 0;

  pushFront(value: T): void {
    // O(1)
    this.head = new ListNode(value, this.head);
    if (this.tail === null) this.tail = this.head; // was empty
    this.size++;
  }

  pushBack(value: T): void {
    // O(1) via tail
    const node = new ListNode(value);
    if (this.tail === null) {
      this.head = this.tail = node; // empty list
    } else {
      this.tail.next = node; // old tail links on
      this.tail = node;
    }
    this.size++;
  }

  find(value: T): ListNode<T> | null {
    // O(n)
    let curr = this.head;
    while (curr !== null) {
      if (curr.value === value) return curr;
      curr = curr.next;
    }
    return null;
  }

  delete(value: T): boolean {
    // O(n)
    let prev: ListNode<T> | null = null;
    let curr = this.head;
    while (curr !== null) {
      if (curr.value === value) {
        if (prev === null) this.head = curr.next; // deleting the head
        else prev.next = curr.next; // splice curr out
        if (curr === this.tail) this.tail = prev; // deleting the tail
        this.size--;
        return true;
      }
      prev = curr;
      curr = curr.next;
    }
    return false;
  }

  toArray(): T[] {
    // O(n) — for testing
    const out: T[] = [];
    for (let curr = this.head; curr !== null; curr = curr.next) {
      out.push(curr.value);
    }
    return out;
  }
}
```
````

## Read it against the invariants

The class maintains three promises, and every method must uphold all of
them — this is the discipline the quiz probes:

1. **head reaches everything**: following `next` from head visits every
   node, ending at null.
2. **tail is the last node** (null iff empty) — the price of O(1)
   push_back is remembering to update tail in *every* method that can
   touch the end (see delete's `curr is tail` branch — the classic
   forgotten case).
3. **size is the node count.**

Notice the *shape* of `delete`: a `(prev, curr)` pair walking in
lockstep, because splicing `curr` out requires writing to
`prev.next` — a singly linked list can never edit what it's standing on,
only what's *ahead* of a node it holds. That asymmetry drives every
pattern in the next lesson.

## The special cases are the lesson

Count the branches: empty list (push_back), deleting the head (no prev),
deleting the tail (tail must retreat). Each exists because the operation
touches a **boundary where a pointer we normally rewire doesn't exist**.
The next lesson's dummy-node trick makes most of these branches vanish —
by making the boundary itself a normal node.

```complexity
{
  "operations": [
    { "name": "push_front / push_back", "time": "O(1)", "why": "constant pointer writes; tail pointer prevents the O(n) walk" },
    { "name": "find / delete by value", "time": "O(n)", "why": "must walk; delete's splice itself is O(1) once found" },
    { "name": "space", "time": "O(n) + pointer overhead", "why": "one next-reference per node — real overhead arrays don't pay" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Why does delete walk a (prev, curr) PAIR instead of just curr?",
      "options": [
        "It's an optimization to exit early — holding both references lets the loop terminate as soon as a match is found instead of continuing to scan, which is the actual reason the extra variable exists",
        "Splicing curr out means writing prev.next = curr.next — in a singly linked list, the node BEFORE the target holds the pointer that must change, and there's no way back to it from curr",
        "To count the nodes — the prev reference doubles as a running counter that tracks how many nodes have been visited so far, which delete needs to update the size field correctly"
      ],
      "answer": 1,
      "explanation": "Singly linked lists only see forward. The edit always happens one node behind the discovery — so you carry the predecessor with you. (A doubly linked list's prev pointer makes this unnecessary — that's exactly what you're paying its overhead for.)"
    },
    {
      "question": "push_back forgot the `if (curr === tail) tail = prev` branch in delete. What breaks, and when?",
      "options": [
        "The list throws immediately — dereferencing a stale tail pointer on the very next operation raises an exception, so the bug surfaces as a crash right where it was introduced",
        "Nothing — tail is only cosmetic; since head always reaches every real node via next pointers, an outdated tail reference is just unused bookkeeping that no correct method actually relies on",
        "After deleting the last node, tail points at a spliced-out node; the NEXT push_back links the new node onto the ghost, and it's unreachable from head — the list silently loses data"
      ],
      "answer": 2,
      "explanation": "Invariant 2 (tail = last reachable node) fails silently, and the damage surfaces LATER at push_back — the new node hangs off a node no traversal can reach. Pointer-invariant bugs are time bombs; that's why each method is checked against all three invariants."
    },
    {
      "question": "A million-int array vs a million-int singly linked list — which uses meaningfully more memory, and why?",
      "options": [
        "The array — capacity slack wastes half; a dynamic array's doubling strategy can leave up to half its allocated capacity empty at any given moment, which outweighs a linked list's per-node overhead",
        "The list: every element carries an extra next-reference (plus per-node allocation overhead), roughly doubling footprint or worse — a real cost the complexity table rounds into 'O(n)'",
        "Same — both store a million ints; since Big O counts elements rather than bytes, the two structures share the identical O(n) space bound and therefore consume comparable real memory"
      ],
      "answer": 1,
      "explanation": "O(n) hides constants, and here the constant differs by 2× or more: value + pointer + allocator header per node, versus packed values (the array's ≤2× slack is bounded and amortized). Locality AND footprint both favor arrays — lists must earn their keep on splice patterns."
    }
  ]
}
```
