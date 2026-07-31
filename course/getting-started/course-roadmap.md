---
title: The Roadmap
type: concept
---

## Five stages, in dependency order

The 24 modules are grouped into five stages. The order isn't arbitrary —
each stage leans on the ones before it, and most confusion in DSA comes from
meeting ideas before their prerequisites.

```roadmap
### Stage 0 — Foundations

*How to Learn This Course · Big O & Complexity Analysis · Math for DSA*

Big O is the vocabulary the entire course is written in, so it comes first
and gets a full module — not a cheat sheet. The math module covers the small
set of tools (logarithms, modular arithmetic, counting) that later modules
quietly depend on.

### Stage 1 — Linear structures

*Arrays · Strings · Hash Tables · Linked Lists · Stacks · Queues*

The core containers. Everything here is about **memory**: contiguous versus
linked layout, what a pointer really is, why resizing a dynamic array is
still cheap on average, how hashing turns "search everything" into "go
directly there." These six structures are the raw material for every later
stage.

### Stage 2 — Techniques on linear data

*Two Pointers · Sliding Window · Prefix Sum · Binary Search · Sorting ·
Matrix Traversal*

Not new structures — new **algorithms over the structures you just
learned**. Each one converts a brute-force quadratic scan into linear or
logarithmic work, and each comes with the argument for why the shortcut is
safe (why can binary search discard half the array? why can the window
never miss the answer?).

### Stage 3 — Recursive & hierarchical

*Recursion & Backtracking · Binary Trees · BST & Ordered Structures ·
Heaps · Tries*

Recursion is taught as a tool in its own right — the call-stack model, then
divide & conquer, then systematic search over choice trees. The tree-shaped
structures follow, each defined by one invariant: the BST's ordering, the
heap's parent-beats-child, the trie's shared prefixes.

### Stage 4 — Global reasoning

*Intervals · Greedy · Graphs · Dynamic Programming*

Problems where the answer depends on the whole input at once. Greedy is
taught with exchange arguments — proving the greedy choice is safe, since
"it felt locally best" is how greedy solutions go wrong. Graphs and DP are
the two biggest modules in the course, each internally staged.
```

## How to move through it

- **In order, if you're building from scratch.** The dependencies are real.
- **Jump in, if you're refreshing.** Each module states what it assumes. If
  a module feels hard in a "missing pieces" way rather than a "new idea"
  way, back up one stage.
- **Don't stockpile theory.** A stage's techniques only settle once you've
  done its problems. Finish a module's problems before starting the next
  module — momentum through problems beats coverage of prose.

```quiz
{
  "question": "Why does Sliding Window (Stage 2) come after Arrays and Hash Tables (Stage 1)?",
  "options": [
    "Window problems usually maintain state in a hash map over an array — the technique operates on those structures",
    "Difficulty ranks stages: each stage is strictly harder than the last, so ordering follows a difficulty curve rather than a dependency graph",
    "The stages follow the order these techniques were invented historically, so Sliding Window's 1970s-era origin places it after the older array and hashing ideas"
  ],
  "answer": 0,
  "explanation": "Stage 2 techniques are algorithms over Stage 1 structures. A dynamic window is typically \"an array plus a hash map tracking what's inside the window\" — so those come first."
}
```

Next stop: **Big O & Complexity Analysis** — the language everything else is
written in.
