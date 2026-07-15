# Question Bank

Every candidate interview question this handbook draws on, grouped by pattern.
`part-5-practice-roadmap/` selects only the highest-value 5–8 per pattern from
this pool — this file is the full reservoir to choose from and to keep growing.

Difficulty tags: `(E)` Easy · `(M)` Medium · `(H)` Hard

---

## Family 1 — Linear Traversal

**Arrays** _(indexing, in-place transforms; not frequency maps)_

- Move Zeroes `(E)`
- Rotate Array `(M)`
- Product of Array Except Self `(M)`
- Spiral Matrix `(M)` — also in Uncategorized; deep under Arrays when used
- First Missing Positive `(H)`

**Hash Maps** _(key → value / frequency / complement)_

- Two Sum `(E)`
- Valid Anagram `(E)`
- Isomorphic Strings `(E)`
- Group Anagrams `(M)`
- Contiguous Array `(M)` — map of prefix → first index; see also Prefix Sum
- 4Sum II `(M)`
- Top K Frequent Elements `(M)` — dual-home with Heap; deep under Heap for selection
- Design HashMap `(E/M)`
- Subarray Sum Equals K `(M)` — see also only; **owned under Prefix Sum**
- Longest Consecutive Sequence `(M)` — see also only; **owned under Hash Sets**

**Hash Sets** _(membership / uniqueness / seen-before)_

- Contains Duplicate `(E)`
- Intersection of Two Arrays `(E)`
- Happy Number `(E)` — dual-home with Fast/Slow; deep under Fast/Slow
- Longest Consecutive Sequence `(M)` — **primary home** (set + only-start-at-run-beginning)
- Missing Number `(E)` — set / math variants
- First Missing Positive `(H)` — dual-home with Arrays

**Prefix Sum**

- Running Sum of 1d Array `(E)`
- Range Sum Query — Immutable `(E)`
- Find Pivot Index `(E)`
- Subarray Sum Equals K `(M)` — **primary home** (prefix + frequency map)
- Contiguous Array `(M)`
- Subarray Sums Divisible by K `(M)`
- Maximum Size Subarray Sum Equals K `(M)`
- Count of Range Sum `(H)`
- Max Sum of Rectangle No Larger Than K `(H)`

## Family 2 — Pointer Movement

**Two Pointers**

- Valid Palindrome `(E)`
- Remove Duplicates from Sorted Array `(E)`
- Pair Sum in Sorted Array / Two Sum II `(E/M)`
- Reverse String `(E)`
- Container With Most Water `(M)`
- 3Sum `(M)`
- Trapping Rain Water `(H)`

**Sliding Window**

- Maximum Sum Subarray of Size K `(E)`
- Longest Substring Without Repeating Characters `(M)`
- Fruits Into Baskets `(M)`
- Permutation in String `(M)`
- Minimum Window Substring `(H)`
- Sliding Window Maximum `(H)`

**Fast & Slow Pointers**

- Linked List Cycle `(E)`
- Middle of the Linked List `(E)`
- Happy Number `(E)`
- Linked List Cycle II `(M)`
- Find the Duplicate Number `(M)`
- Palindrome Linked List `(E/M)`

**Linked List Pointer Manipulation**

- Reverse Linked List `(E)`
- Merge Two Sorted Lists `(E)`
- Remove Nth Node From End of List `(M)`
- Swap Nodes in Pairs `(M)`
- Reverse Nodes in k-Group `(H)`
- Merge k Sorted Lists `(H)` — dual-home with Heap; deep under Heap for multi-merge

## Family 3 — Ordering & Search

**Sorting** _(sort-then-scan; not binary search on answer)_

- Sort Colors `(M)`
- Merge Sorted Array `(E)`
- Largest Number `(M)`
- Meeting Rooms `(E)` — dual-home with Intervals
- Wiggle Sort II `(M)`
- Count of Smaller Numbers After Self `(H)`

**Binary Search**

- Binary Search `(E)`
- First Bad Version `(E)`
- Search in Rotated Sorted Array `(M)`
- Find Peak Element `(M)`
- Koko Eating Bananas `(M)`
- Split Array Largest Sum / Allocate Books `(H)`
- Median of Two Sorted Arrays `(H)`

**Intervals**

- Merge Intervals `(M)`
- Insert Interval `(M)`
- Meeting Rooms `(E)`
- Meeting Rooms II `(M)`
- Non-overlapping Intervals `(M)`
- Minimum Number of Arrows to Burst Balloons `(M)`
- Employee Free Time `(H)`

**Sweep Line**

- Meeting Rooms II `(M)` — dual-home with Intervals; deep under Sweep for event scan
- The Skyline Problem `(H)`
- My Calendar I/II `(M)`
- Car Fleet `(M)`
- Number of Airplanes in the Sky `(M)`

## Family 4 — Recursive Exploration

**DFS**

- Number of Islands `(M)`
- Flood Fill `(E)`
- Clone Graph `(M)`
- Path Sum `(E)`
- Max Area of Island `(M)`
- Surrounded Regions `(M)`
- Word Search `(M)` — dual-home with Backtracking; grid DFS shell here

**Tree Traversals**

- Binary Tree Inorder Traversal `(E)`
- Maximum Depth of Binary Tree `(E)`
- Balanced Binary Tree `(E)`
- Diameter of Binary Tree `(E)`
- Lowest Common Ancestor of a Binary Tree `(M)`
- Binary Tree Maximum Path Sum `(H)`
- Serialize and Deserialize Binary Tree `(H)`

**Divide and Conquer**

- Merge Sort (implement) `(M)`
- Majority Element `(E)` — Boyer-Moore alt; D&C version teaches split/combine
- Maximum Subarray (Kadane vs D&C) `(M)`
- Different Ways to Add Parentheses `(M)`
- Beautiful Array `(M)`
- Count of Smaller Numbers After Self `(H)` — dual-home with Sorting

**Backtracking**

- Subsets `(M)`
- Permutations `(M)`
- Combination Sum `(M)`
- Word Search `(M)`
- Palindrome Partitioning `(M)`
- N-Queens `(H)`
- Sudoku Solver `(H)`

## Family 5 — State Transition

**Memoization**

- Climbing Stairs `(E)` — intro memo
- Fibonacci Number `(E)`
- House Robber `(M)`
- Decode Ways `(M)`
- Unique Paths `(M)`
- Word Break `(M)`

**Dynamic Programming**

- Climbing Stairs `(E)`
- House Robber `(M)`
- Coin Change `(M)`
- Longest Increasing Subsequence `(M)`
- Longest Common Subsequence `(M)`
- Edit Distance `(M)`
- Partition Equal Subset Sum `(M)`
- Burst Balloons `(H)`

**Greedy** _(full Part 2 pattern section in Family 5 — depth rewrite)_

- Assign Cookies `(E)`
- Lemonade Change `(E)`
- Best Time to Buy and Sell Stock `(E)` — one-pass greedy framing
- Jump Game `(M)`
- Jump Game II `(M)`
- Gas Station `(M)`
- Activity Selection / Non-overlapping Intervals `(M)`
- Minimum Number of Arrows to Burst Balloons `(M)`
- Candy `(H)`
- Create Maximum Number `(H)`

## Family 6 — Relationships

**BFS**

- Binary Tree Level Order Traversal `(M)`
- Rotting Oranges `(M)`
- Shortest Path in Binary Matrix `(M)`
- Word Ladder `(H)`
- Open the Lock `(M)`
- Bus Routes `(H)`

**Graph Traversal** _(representation + visited hygiene; shorter section)_

- Clone Graph `(M)`
- Number of Connected Components `(M)`
- Is Graph Bipartite? `(M)`
- Course Schedule `(M)` — dual-home with Topo; traversal angle here

**Union Find**

- Number of Provinces `(M)`
- Redundant Connection `(M)`
- Accounts Merge `(M)`
- Graph Valid Tree `(M)`
- Swim in Rising Water `(H)`

**Topological Sort**

- Course Schedule `(M)`
- Course Schedule II `(M)`
- Alien Dictionary `(H)`
- Parallel Courses III `(H)`

**Dijkstra**

- Network Delay Time `(M)`
- Cheapest Flights Within K Stops `(M)`
- Path With Minimum Effort `(M)`
- Swim in Rising Water `(H)` — dual-home with UF

**Minimum Spanning Tree**

- Min Cost to Connect All Points `(M)`
- Connecting Cities With Minimum Cost `(M)`
- Optimize Water Distribution `(H)`

## Family 7 — Priority Structures

**Stack**

- Valid Parentheses `(E)`
- Min Stack `(M)`
- Evaluate Reverse Polish Notation `(M)`
- Basic Calculator `(H)`
- Largest Rectangle in Histogram `(H)` — dual-home with Monotonic Stack

**Queue**

- Implement Queue using Stacks `(E)`
- Design Circular Queue `(M)`
- Moving Average from Data Stream `(E)`
- Sliding Window Maximum `(H)` — dual-home with deque/Mono Stack
- Task Scheduler `(M)` — dual-home with Heap

**Heap / Priority Queue**

- Kth Largest Element in an Array `(M)`
- K Closest Points to Origin `(M)`
- Top K Frequent Elements `(M)` — counting via Hash Map; selection via Heap
- Merge k Sorted Lists `(H)`
- Find Median from Data Stream `(H)`
- Task Scheduler `(M)`

**Monotonic Stack**

- Next Greater Element I `(E)`
- Daily Temperatures `(M)`
- Online Stock Span `(M)`
- Next Greater Element II `(M)`
- Largest Rectangle in Histogram `(H)`
- Maximal Rectangle `(H)`

**Trie**

- Implement Trie (Prefix Tree) `(M)`
- Design Add and Search Words Data Structure `(M)`
- Replace Words `(M)`
- Word Search II `(H)`
- Design Search Autocomplete System `(H)`

## Uncategorized (Math / Simulation / Bit Manipulation)

_Out of v1 core chapters — appendix-only if budget remains after polish._

- Spiral Matrix `(M)`
- Rotate Image `(M)`
- Plus One `(E)`
- Single Number `(E)`
- Missing Number `(E)`
- Counting Bits `(E)`
