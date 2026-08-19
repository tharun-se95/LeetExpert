---
title: Merge k Sorted Lists
type: problem
---

## Problem

You are given an array of `k` linked lists, each already sorted in
ascending order. Merge them into one sorted linked list and return its
head.

**Examples**

```examples
lists = [[1,4,5],[1,3,4],[2,6]] → [1,1,2,3,4,4,5,6]
lists = [] → []
lists = [[]] → []
```

```constraint
k up to 10⁴, total nodes n up to ~10⁴, node values in ±10⁴. Lists may be empty.
```

## Attempt it first

You already know how to merge *two* sorted lists in O(total) time — the
two-pointer merge from the Sorting module (it's the core of merge sort).
The whole problem is: how do you extend that to k lists without wasting
work? Before reading on, think about what the merge step actually needs at
each moment. To pick the next node of the output, you compare the *current
heads* of the lists and take the smallest. With k lists, you have k heads
to compare each time — what structure turns "find the smallest of k things,
repeatedly, as they change" into something cheap?

```sandbox
{
  "id": "merge-k-sorted-lists",
  "fn": {
    "python": "merge_k_lists",
    "javascript": "mergeKLists"
  },
  "check": "return",
  "shape": {
    "0": "list[]"
  },
  "returns": "list",
  "starter": {
    "python": "def merge_k_lists(lists):\n    # lists is a list of k sorted list heads. Merge them, return the head.\n    pass\n",
    "javascript": "function mergeKLists(lists) {\n  // lists is an array of k sorted list heads. Merge them, return the head.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          [
            1,
            4,
            5
          ],
          [
            1,
            3,
            4
          ],
          [
            2,
            6
          ]
        ]
      ],
      "expect": [
        1,
        1,
        2,
        3,
        4,
        4,
        5,
        6
      ]
    },
    {
      "args": [
        []
      ],
      "expect": []
    },
    {
      "args": [
        [
          []
        ]
      ],
      "expect": []
    },
    {
      "args": [
        [
          [
            1
          ]
        ]
      ],
      "expect": [
        1
      ]
    },
    {
      "args": [
        [
          [],
          [
            1
          ],
          []
        ]
      ],
      "expect": [
        1
      ]
    },
    {
      "args": [
        [
          [
            -2,
            -1
          ],
          [
            -3,
            0
          ]
        ]
      ],
      "expect": [
        -3,
        -2,
        -1,
        0
      ]
    },
    {
      "args": [
        [
          [
            5
          ],
          [
            4
          ],
          [
            3
          ],
          [
            2
          ],
          [
            1
          ]
        ]
      ],
      "expect": [
        1,
        2,
        3,
        4,
        5
      ]
    }
  ]
}
```

````reveal Hint — the repeated-minimum shape
"Repeatedly take the smallest among k competing candidates, then replace
the one you took with its successor" is the exact access pattern a heap is
built for. Put the k current heads in a min-heap. Pop the smallest (that's
the next output node), then push that node's `.next` back in. The heap
always holds at most k nodes — one live head per list.
````

## Brute force approaches, for contrast

**Approach A — collect and sort.** Walk every node into one array, sort
it, rebuild a list. O(n) to collect, O(n log n) to sort, O(n) to rebuild:
**O(n log n)** total. Correct, but it ignores that the inputs are already
sorted — it throws away the very structure that should make this cheaper.

**Approach B — merge two at a time, sequentially.** Merge list 1 with list
2, then merge that result with list 3, then with list 4, and so on. Each
pairwise merge is linear in its inputs. The trouble is the accumulator
grows: after merging the first `i` lists it holds roughly `i·(n/k)` nodes,
and the next merge re-scans *all* of them. Summing over the k merges:

```text
(n/k) + 2(n/k) + 3(n/k) + ... + k(n/k)
   = (n/k)·(1 + 2 + ... + k)
   = (n/k)·(k(k+1)/2)
   ≈ n·k/2   →   O(nk)
```

Every node in the early lists gets re-copied on every subsequent merge.
That linear-in-k factor is the cost of the naive order — the same node
walked over and over.

## The insight: a min-heap of the k live heads

The two-way merge picks the smaller of *2* current heads each step. The
k-way merge must pick the smallest of *k* current heads each step —
`k − 1` comparisons if done by brute force, done `n` times, giving the
O(nk) above. A min-heap does that "smallest of k" in O(log k) instead of
O(k):

- Seed the heap with the head node of each non-empty list — at most k
  nodes.
- Repeat: pop the minimum (append it to the output); if the popped node
  has a `.next`, push `.next`. This keeps the heap holding exactly the set
  of "current fronts" of the lists that still have elements.

The heap never exceeds size k (one entry per list at any instant), and we
do exactly `n` pop-push cycles total (one per node, since each node is
popped once). Each cycle is O(log k). Total: **O(n log k)**.

Contrast the bounds. Sequential two-at-a-time is O(nk); the heap is
O(n log k). For k = 10⁴ that's the difference between a factor of 10⁴ and
a factor of ~13 per node — the heap replaces the linear `k` with `log k`
by never re-scanning settled nodes: once a node is output it's gone, and
the heap tracks only the live frontier.

(Divide-and-conquer pairwise merging — pair up the k lists, merge in
√/tournament rounds — also achieves O(n log k), because there are log k
rounds each doing O(n) work. It's an equally valid answer; the heap is the
one this module teaches and is simpler to reason about for a stream of
lists.)

## Solution

`````reveal Solution — min-heap of list nodes
One wrinkle: heaps compare their elements, but linked-list nodes aren't
comparable by default. In Python we push a tuple `(value, tiebreak, node)`
— the `tiebreak` (a unique increasing counter) prevents Python from ever
trying to compare two `ListNode` objects when their values tie. In
TypeScript we give the heap a comparator that reads `node.val`.

````tabs
```python
import heapq
from typing import Optional

class ListNode:
    def __init__(self, val: int = 0, nxt: "Optional[ListNode]" = None):
        self.val = val
        self.next = nxt

def merge_k_lists(lists: list[Optional[ListNode]]) -> Optional[ListNode]:
    heap: list[tuple[int, int, ListNode]] = []
    counter = 0
    for node in lists:
        if node:                       # seed with each non-empty head (≤ k)
            heapq.heappush(heap, (node.val, counter, node))
            counter += 1

    dummy = ListNode()
    tail = dummy
    while heap:
        _, _, node = heapq.heappop(heap)   # smallest current head, O(log k)
        tail.next = node                   # splice it onto the output
        tail = node
        if node.next:                      # push this list's next front
            heapq.heappush(heap, (node.next.val, counter, node.next))
            counter += 1
    return dummy.next
```

```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  // Min-heap of nodes, ordered by node.val — same sift logic as the
  // Heapify lesson, comparing .val instead of a raw number.
  const heap: ListNode[] = [];
  const up = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[i].val < heap[p].val) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        i = p;
      } else break;
    }
  };
  const down = (i: number) => {
    const n = heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && heap[l].val < heap[s].val) s = l;
      if (r < n && heap[r].val < heap[s].val) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  };
  const pushNode = (node: ListNode) => {
    heap.push(node);
    up(heap.length - 1);
  };
  const popNode = (): ListNode => {
    const top = heap[0];
    const last = heap.pop() as ListNode;
    if (heap.length > 0) {
      heap[0] = last;
      down(0);
    }
    return top;
  };

  for (const node of lists) if (node) pushNode(node); // seed heads, ≤ k

  const dummy = new ListNode();
  let tail = dummy;
  while (heap.length > 0) {
    const node = popNode(); // smallest current head, O(log k)
    tail.next = node;
    tail = node;
    if (node.next) pushNode(node.next); // this list's next front
  }
  return dummy.next;
}
```
````

The `dummy` head is a standard linked-list idiom (Module 7): it lets us
append without special-casing the first node — `dummy.next` is the real
head at the end. Each node enters and leaves the heap exactly once, so the
loop runs n times, each iteration O(log k).

```complexity
{
  "time": "O(n log k), n = total nodes across all lists, k = number of lists",
  "space": "O(k)",
  "why": "Every node is pushed and popped exactly once (n cycles), and the heap holds at most one node per list (≤ k), so each cycle is O(log k). Output is built by splicing existing nodes, so no extra O(n) storage — only the O(k) heap."
}
```
`````

The heap holds at most k nodes because at any instant each list has
exactly one node "in play" — its current front — and once we pop a node we
immediately push only its single successor. That size cap is why the log
factor is `log k` and not `log n`, and why space is O(k) rather than O(n).

## Variants

- **Merge Two Sorted Lists** (LeetCode 21): the k = 2 base case, done with
  two pointers and no heap — the operation the heap generalizes.
- **Merge k Sorted Arrays:** identical heap, but push `(value, list_index,
  element_index)` so you can find each array's next element by index
  instead of a `.next` pointer.
- **Smallest Range Covering Elements from K Lists** (LeetCode 632): a
  min-heap of one element per list, advancing the minimum each step while
  tracking the current maximum — the k-way-frontier idea pushed further.
- **Ugly Number II / merging sequences:** many "merge k monotonic streams"
  problems reduce to this same heap-of-frontiers pattern.

```quiz
{
  "questions": [
    {
      "question": "Merging the k lists two-at-a-time sequentially is O(nk), but a min-heap makes it O(n log k). Where does the naive approach's extra work come from, and how does the heap remove it?",
      "options": [
        "The naive approach sorts each list again; the heap avoids re-sorting — each pairwise merge step redundantly re-applies a full sort to its combined input, which the heap-based approach sidesteps entirely by never sorting anything twice",
        "Sequential merging re-scans the growing accumulator on every pairwise merge, so nodes in the early lists are copied over and over — summing gives ~nk/2. The heap instead tracks only the k live front nodes and outputs each node exactly once, replacing the linear 'smallest of k' scan with an O(log k) heap operation",
        "The heap uses less memory, which is what makes it faster — the heap's smaller O(k) memory footprint compared to the accumulator's growing size is the direct cause of its speed advantage over the sequential approach"
      ],
      "answer": 1,
      "explanation": "The naive cost is re-work: after merging i lists the accumulator holds ~i·(n/k) nodes and the next merge walks all of them again, so Σ i·(n/k) ≈ nk/2. The heap never revisits a settled node — once popped, a node is spliced into the output and gone. Each of the n nodes is pushed and popped once, and finding the current minimum among k candidates costs log k instead of k. Linear-in-k becomes log-in-k."
    },
    {
      "question": "Why does the heap in this solution never hold more than k nodes at once, and why does that matter?",
      "options": [
        "At any instant each list contributes exactly one node — its current front; when we pop a node we push only its single successor, so the heap's size stays ≤ k. This caps each operation at O(log k) and keeps extra space at O(k) rather than O(n)",
        "Because linked lists can't store more than k nodes total — each of the k input lists is constrained by the problem to hold no more than k nodes altogether, which is what bounds the heap's total capacity",
        "The heap discards nodes it has already compared, keeping it small by chance — nodes that lose a comparison against the current minimum are dropped from consideration, and this incidental pruning happens to keep the heap's size manageable"
      ],
      "answer": 0,
      "explanation": "The heap represents the 'frontier' — one live head per list. Pop one, push its lone successor: the count is conserved at ≤ k. This invariant is exactly what makes the per-operation cost log k (heap height for k elements) instead of log n, and what keeps auxiliary space at O(k). The output list reuses the existing nodes, so there's no O(n) copy."
    }
  ]
}
```
