# Decision Trees

These are the "which pattern?" flowcharts. Part 3
(`part-3-pattern-recognition/`) turns them into a full walkthrough. Keep this
file in sync with Part 3.

## The Quick Recognition Cheat Sheet

Read the left column like a quiz: if the question sounds like that, start with
the pattern on the right.

| If the question says... | Think... |
| --- | --- |
| Pair in sorted array | Two Pointers |
| Longest substring / contiguous constraint | Sliding Window |
| Frequency / count / complement | Hash Map |
| Range sums / subarray sum equals K | Prefix Sum (+ map); window only if all ≥0 |
| Sorted search / min-max feasible value | Binary Search |
| Reverse / merge linked list | Linked List Pointer Manipulation |
| Nested parentheses | Stack |
| Nearest greater / smaller | Monotonic Stack |
| Shortest path (unweighted) | BFS |
| Explore components / deep paths | DFS |
| Generate combinations / permutations | Backtracking |
| Count ways / max-min overlapping states | Dynamic Programming |
| Top K / Kth largest/smallest | Heap |
| Merge overlapping ranges | Intervals |
| Max concurrent meetings / events on a line | Sweep Line |
| Which nodes belong together | Union Find |
| Prefix / dictionary / autocomplete | Trie |
| Shortest path, weighted ≥0 | Dijkstra |
| Order tasks with dependencies | Topological Sort |
| Connect all with min total weight | MST |
| Local choice with a proof | Greedy (Family 5 full pattern) |

## Master Decision Tree

```mermaid
flowchart TD
    A[Read the question] --> B{Is the data contiguous<br/>array/string?}
    B -->|Yes| C{Need longest/shortest/<br/>best contiguous range?}
    C -->|Yes| SlidingWindow[Sliding Window]
    C -->|No| D{Repeated range sum queries?}
    D -->|Yes| PrefixSum[Prefix Sum]
    D -->|No| E{Sorted, or two ends<br/>move toward each other?}
    E -->|Yes| TwoPointers[Two Pointers]

    B -->|No| F{Is it a linked list?}
    F -->|Yes| G{Cycle / middle / kth from end?}
    G -->|Yes| FastSlow[Fast & Slow Pointers]
    G -->|No| LinkedListOps[Linked List Pointer Manipulation]

    F -->|No| H{Is it a tree or graph?}
    H -->|Yes| I{Level by level /<br/>shortest path unweighted?}
    I -->|Yes| BFS[BFS]
    I -->|No| J{Weighted shortest path?}
    J -->|Yes| Dijkstra[Dijkstra]
    J -->|No| K{Need all paths /<br/>connected components?}
    K -->|Yes| DFS[DFS]
    K -->|No| L{Need every combination<br/>/ permutation?}
    L -->|Yes| Backtracking[Backtracking]
    L -->|No| M{Which nodes belong<br/>to the same group?}
    M -->|Yes| UnionFind[Union Find]
    M -->|No| N{Order tasks with<br/>dependencies?}
    N -->|Yes| TopoSort[Topological Sort]

    H -->|No| O{Need Top K / running min or max?}
    O -->|Yes| Heap[Heap / Priority Queue]
    O -->|No| P{Nearest greater/smaller element?}
    P -->|Yes| MonoStack[Monotonic Stack]
    P -->|No| Q{Last-in-first-out processing?}
    Q -->|Yes| Stack[Stack]
    Q -->|No| R{Prefix / dictionary lookup?}
    R -->|Yes| Trie[Trie]
    R -->|No| S{Answer/state depends on<br/>overlapping subproblems?}
    S -->|Yes| DP[Dynamic Programming]
    S -->|No| Greedy[Greedy — verify proof exists]
```

## Dual-Home Routing

| Problem | Primary (deep) | Secondary (see also) |
| --- | --- | --- |
| Top K Frequent | Heap (select) | Hash Map (count) |
| Subarray Sum Equals K | Prefix Sum + map | Hash Map — **not** Sliding Window unless all values ≥ 0 |
| Longest Consecutive Sequence | Hash Set (left-edge runs) | Hash Map only if you store lengths as values |
| Meeting Rooms II | Sweep Line | Intervals |
| Daily Temperatures / Histogram | Monotonic Stack | Stack |
| Word Search | Backtracking | DFS |
| Merge k Sorted Lists | Heap | Linked List ops |
| Jump Game / Gas Station | Greedy (prove local choice) | DP if proof fails / need all ways |

## Focused Trees

**"I need the Top K elements"**

```mermaid
flowchart LR
    Q[Need Top K?] --> Count[Hash Map counts if needed]
    Count --> Heap[Heap size K]
```

**"I need connected groups"**

```mermaid
flowchart LR
    Q[Need connected groups?] -->|Many merges| UF[Union Find]
    Q -->|Traverse or print| DFS[DFS / BFS]
```

**"I need a shortest path"**

```mermaid
flowchart LR
    Q[Shortest path?] --> W{Weighted?}
    W -->|No| BFS[BFS]
    W -->|Yes, non-negative| Dijkstra[Dijkstra]
    W -->|Yes, negatives| BellmanFord[Bellman-Ford]
```

**"Greedy or DP?"**

```mermaid
flowchart LR
    Q[Optimize choices?] --> P{Local choice provably safe?}
    P -->|Yes| G[Greedy]
    P -->|No / overlapping states| DP[DP / Memo]
```

**"Contiguous constraint vs equals-K sum"**

```mermaid
flowchart LR
    Q[Subarray / substring?] --> C{Longest under constraint?}
    C -->|Yes| SW[Sliding Window]
    C -->|Sum equals K / range sums| PS[Prefix Sum]
```
