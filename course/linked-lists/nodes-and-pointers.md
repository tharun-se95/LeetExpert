---
title: Nodes & Pointers
type: concept
---

## Dropping contiguity

Every structure so far lived in one contiguous block. A **linked list**
abandons that: each element is a free-standing **node** — a value plus a
**pointer** (reference) to the next node — allocated wherever memory
happens to be free. The structure *is* the pointers; the only thing you
hold is a reference to the first node (the **head**).

```diagram
{
  "id": "linked-list",
  "values": [7, 3, 12]
}
```

A "pointer" here is nothing exotic: in Python and JS every object
variable is already a reference — `node.next = other` stores *where other
lives*, not a copy of it. Assigning pointers is O(1) and never moves
data. That single fact is the source of everything lists are good at.

## What the layout buys — and what it costs

**Buys: O(1) structural edits at a known spot.** Splicing a node in or
out is two pointer assignments — no shifting, ever. Compare the array's
O(n − i) insert: the entire cost difference is contiguity's gap-closing
requirement, which lists simply don't have.

**Costs: O(n) access to anything by position or value.** There is no
address arithmetic — `the 500th node` can only be reached by walking 500
`next` pointers. Binary search? Impossible at useful cost, even sorted:
no O(1) jumps to the middle. And the Arrays module's cache-locality bonus
inverts into a penalty: nodes are scattered, so every hop risks a cache
miss.

```complexity
{
  "operations": [
    { "name": "access i-th element", "time": "O(i)", "why": "no address arithmetic — walk i pointers from the head" },
    { "name": "search by value", "time": "O(n)", "why": "walk and compare, same as an unsorted array" },
    { "name": "insert/delete AFTER a node you hold", "time": "O(1)", "why": "two pointer assignments; nothing shifts" },
    { "name": "push front", "time": "O(1)", "why": "new node points at old head; head points at new node" },
    { "name": "push back", "time": "O(1) with a tail pointer, O(n) without", "why": "the tail reference is bookkeeping you must maintain" }
  ]
}
```

The table's third row carries a trap worth naming: O(1) insertion is
conditional on *already holding* the neighbor node. "Insert after the
node containing 42" is O(n) + O(1) — the search dominates. Lists shine
when the algorithm naturally walks the structure anyway, holding nodes as
it goes.

## Variants you'll meet

- **Singly linked** (above): one `next` per node. This module's default.
- **Doubly linked**: nodes also carry `prev` — O(1) deletion *of the node
  itself* (not just after it) and backward walking, at the price of one
  more pointer per node to keep consistent. This is what makes an LRU
  cache tick (Module 6 + this, combined later).
- **Sentinel/dummy nodes**: a permanent placeholder node before the real
  head, existing purely to make edge cases (empty list, edit-at-head)
  identical to the general case. The surgery lesson makes heavy use of it.

## Honest engineering note

In modern practice, arrays win most container jobs — locality plus
amortized-O(1) append beat pointer chasing for typical workloads. Linked
lists earn their place where **splice-heavy workloads** dominate
(schedulers, LRU caches, adjacency structures) — and in this course,
because pointer manipulation is a *skill*: trees and graphs (Stages 3–4)
are node-and-pointer structures with more pointers. This module is where
that muscle gets built.

```quiz
{
  "questions": [
    {
      "question": "Why is there no useful binary search on a sorted linked list?",
      "options": [
        "Binary search's power comes from O(1) jumps to the middle; a list reaches ITS middle only by an O(n) walk, so each 'jump' costs as much as scanning",
        "Comparisons are slower on nodes — dereferencing a node to read its value before comparing adds enough per-step overhead that binary search's advantage over a linear scan disappears in practice",
        "Linked lists can't be sorted — without random access, there's no way to place elements into sorted order in the first place, so the premise of a sorted linked list is itself unachievable"
      ],
      "answer": 0,
      "explanation": "The log n bound rides entirely on random access. Without address arithmetic, halving the search space still costs a linear walk to get there — the discards save comparisons but not movement."
    },
    {
      "question": "\"Insert x after the node containing 42\" — what does this really cost in a singly linked list?",
      "options": [
        "O(n): finding the node containing 42 is a walk; only the two-pointer splice AFTER you hold it is O(1)",
        "O(1) — list insertions are O(1); the operation only ever touches a fixed number of pointer fields regardless of where in the list the target node happens to be located",
        "O(log n) — locating a node by its stored value can exploit the same halving strategy as binary search, since the list's traversal order still lets you discard a fraction of candidates each step"
      ],
      "answer": 0,
      "explanation": "The O(1) claim is conditional on holding the neighbor. Search + splice = O(n) + O(1). Lists pay off when the algorithm already walks past the splice point anyway."
    },
    {
      "question": "Arrays and singly linked lists both delete an element. When does the LIST version actually win?",
      "options": [
        "When you already hold a reference to the predecessor node (e.g., mid-traversal): the splice is O(1) while the array must shift O(n−i) regardless",
        "Always — no shifting; a linked list never has to move other elements to close a gap, so its deletion is unconditionally faster than an array's regardless of how the target node was located",
        "Never — arrays are always faster; contiguous memory and cache locality give arrays enough of a constant-factor advantage that they outperform linked-list splicing in every practical scenario"
      ],
      "answer": 0,
      "explanation": "Both structures pay O(n) to FIND an arbitrary element. The difference is pure edit cost afterward: two pointer writes vs a shift. Held-position edits are the linked list's entire value proposition."
    }
  ]
}
```
