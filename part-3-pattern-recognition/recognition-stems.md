# Recognition Stems

Self-test bank for Families 1–7. Cover the **Expected pattern** line, name the
pattern from the stem alone, then peek. Wrong answers → reread the Part 2
mental model, not the template.

Dual-home traps are marked clearly — the goal is recognition when two names
both *sound* right, not memorizing titles.

---

## Family 1 — Linear Traversal

### Stem 1.1

> "Return whether any value appears more than once in the array."

**Expected pattern:** Hash Set (membership while scanning).  
**Not:** Hash Map unless you also need counts for a follow-up.

### Stem 1.2

> "Find two indices whose values sum to `target` in an unsorted array."

**Expected pattern:** Hash Map (complement lookup — look for the partner).  
**See also:** Two Pointers if the array is sorted (Two Sum II).

### Stem 1.3

> "How many contiguous subarrays sum to `K`?"

**Expected pattern:** Prefix Sum + Hash Map of prefix frequencies.  
**Not:** Sliding Window — sum-equals-K is not a "always shrink from the left"
rule unless **all values are non-negative** (check constraints first).

### Stem 1.4

> "Given `nums`, return an array where `answer[i]` is the product of every
> element except `nums[i]` — no division."

**Expected pattern:** Arrays (prefix/suffix products, or two-pass compact).  
**Not:** Prefix Sum (products, not sums).

### Stem 1.5

> "Group strings that are anagrams of each other."

**Expected pattern:** Hash Map (canonical key → list).  
**Trap:** Sorting the whole list of strings is wrong; sort **each** string (or
count letters) as the map key.

### Stem 1.6

> "Longest consecutive sequence of integers — O(n) expected."

**Expected pattern:** Hash Set (start-of-streak check).  
**Not:** Sorting first unless you accept O(n log n).

---

## Family 2 — Pointer Movement

### Stem 2.1

> "Longest contiguous substring with all unique characters."

**Expected pattern:** Sliding Window (expand/shrink + last-seen map).

### Stem 2.2

> "Two numbers in a **sorted** array that sum to target (return indices)."

**Expected pattern:** Two Pointers from ends.  
**Not:** Hash Map (works but wastes the "already sorted" signal).

### Stem 2.3

> "Detect whether a linked list has a cycle using O(1) space."

**Expected pattern:** Fast & Slow Pointers.  
**Not:** Hash Set of node identities (uses O(n) space).

### Stem 2.4

> "Reverse a singly linked list in place."

**Expected pattern:** Linked List Pointer Manipulation (`prev` / `curr` / `next`).  
**Not:** Fast & Slow (no cycle/middle asked).

### Stem 2.5

> "Minimum-length window in `s` that covers all characters of `t`."

**Expected pattern:** Sliding Window (need-count / have-count).  
**Contrast:** Subarray Sum Equals K → Prefix Sum, not this.

### Stem 2.6

> "Find the middle node of a linked list in one pass."

**Expected pattern:** Fast & Slow Pointers (fast hits null ⇒ slow mid).

---

## Family 3 — Ordering & Search

### Stem 3.1

> "Find the minimum eating speed to finish all piles by hour `h`."

**Expected pattern:** Binary Search on the answer (faster/slower speeds work
monotone — try the middle speed).

### Stem 3.2

> "Merge all overlapping intervals after receiving a list of ranges."

**Expected pattern:** Intervals (sort by start, linear merge).

### Stem 3.3

> "What is the minimum number of meeting rooms required?"

**Expected pattern:** Sweep Line (start/end events + max active).  
**Not:** Intervals merge alone (merge answers “combine ranges,” not peak
overlap).

### Stem 3.4

> "Search for `target` in a rotated sorted array with distinct values."

**Expected pattern:** Binary Search (spot which half is still sorted).  
**Not:** Sort then search (destroys the structure you need).

### Stem 3.5

> "Can these meeting intervals all fit in one room?"

**Expected pattern:** Sorting / Intervals (sort + adjacent conflict check).  
**Contrast:** Meeting Rooms **II** (count rooms) → Sweep Line.

### Stem 3.6

> "Given skyline buildings as `[left, right, height]`, return the outline."

**Expected pattern:** Sweep Line (active height set while scanning x-events).  
**Hard classic** — same event-scan skeleton as Meeting Rooms II.

---

## Family 4 — Recursive Exploration

### Stem 4.1

> "Count islands of connected `'1'`s in a grid."

**Expected pattern:** DFS (or BFS) component flood + visited.

### Stem 4.2

> "Generate all permutations of a distinct integer array."

**Expected pattern:** Backtracking (choose → recurse → undo).

### Stem 4.3

> "Compute diameter of a binary tree."

**Expected pattern:** Tree Traversals (postorder heights + running max).

### Stem 4.4

> "Does word `w` appear in a board via adjacent cells (no reuse)?"

**Expected pattern:** Backtracking (DFS shape **with undo**).  
**Not:** Plain DFS “paint forever” without restore — dual-home: deep under
Backtracking; see also DFS.

### Stem 4.5

> "Convert a sorted array into a height-balanced BST."

**Expected pattern:** Divide and Conquer (mid as root, recurse halves).

### Stem 4.6

> "Lowest common ancestor of two nodes in a binary tree (not BST)."

**Expected pattern:** Tree Traversals (recurse; combine left/right hits).

---

## Family 5 — State Transition

### Stem 5.1

> "Fibonacci with `n` up to 40 — recursion TLE."

**Expected pattern:** Memoization (or bottom-up DP) — remember answers so you
do not recompute them.

### Stem 5.2

> "Fewest coins to make `amount` (unlimited coins)."

**Expected pattern:** Dynamic Programming (`dp[x]` transitions).

### Stem 5.3

> "Can you reach the last index jumping at most `nums[i]` steps?"

**Expected pattern:** Greedy (prove max-reach) — cross-ref under Family 5; not
full DP unless the interview forces DP states.

### Stem 5.4

> "Number of unique paths on a grid moving only right/down."

**Expected pattern:** Memoization or DP (`dp[r][c]` from above/left).

### Stem 5.5

> "Longest common subsequence of two strings."

**Expected pattern:** Dynamic Programming (2D string table).  
**Not:** Sliding Window (not contiguous).

### Stem 5.6

> "Minimum gas stations’ surplus order so you complete the circuit (or −1)."

**Expected pattern:** Greedy (tank / debt insight) — Family 5 cross-ref; verify
the local choice proof, do not invent DP blindly.

---

## Family 6 — Relationships

### Stem 6.1

> "Minimum minutes for all oranges to rot (4-directional)."

**Expected pattern:** Multi-source BFS.

### Stem 6.2

> "Can you finish all courses given prerequisite pairs?"

**Expected pattern:** Topological Sort (cycle ⇒ impossible).  
**See also:** Graph Traversal angle if they emphasize visited colors.

### Stem 6.3

> "Time for a signal from node `k` to reach all nodes (weighted)."

**Expected pattern:** Dijkstra (non-negative weights).  
**Not:** BFS (BFS is unweighted / equal-weight only).

### Stem 6.4

> "Shortest path length in an unweighted grid from top-left to bottom-right."

**Expected pattern:** BFS.  
**Not:** Dijkstra unless cell costs vary.

### Stem 6.5

> "Connect all points with minimum total Manhattan cable."

**Expected pattern:** Minimum Spanning Tree (Kruskal + Union Find common).  
**Contrast:** shortest **path** from one source → Dijkstra / BFS.

### Stem 6.6

> "Emails merge into accounts when any email is shared."

**Expected pattern:** Union Find (or DFS components on the email graph).  
**Trap:** Don’t invent MST — this is “same component,” not min-weight tree.

### Stem 6.7

> "Order courses so every prerequisite appears before the course."

**Expected pattern:** Topological Sort (Kahn or DFS finish times).  
**Contrast:** Stem 6.2 asks feasibility; this asks the order.

---

## Family 7 — Priority Structures

### Stem 7.1

> "For each day, how many days until a warmer temperature?"

**Expected pattern:** Monotonic Stack.

### Stem 7.2

> "Return the k most frequent elements."

**Expected pattern:** Hash Map counts + Heap selection (deep under Heap).  
**Dual-home:** counting ≠ selecting.

### Stem 7.3

> "Implement insert/search/startsWith for a dictionary of words."

**Expected pattern:** Trie.

### Stem 7.4

> "Validate a string of brackets `()[]{}`."

**Expected pattern:** Stack (LIFO match — last opener closes first).  
**Not:** Monotonic Stack (no “next greater”).

### Stem 7.5

> "Merge k sorted linked lists into one sorted list."

**Expected pattern:** Heap (k-way merge).  
**See also:** Linked List ops for the splicing; Heap owns the selection.

### Stem 7.6

> "Implement a queue using only stacks."

**Expected pattern:** Queue (amortized transfer between two stacks).  
**Not:** Heap (no priority among elements).

### Stem 7.7

> "Next greater element for each value in a circular array."

**Expected pattern:** Monotonic Stack (2n pass / circular indices).  
**Contrast:** Valid Parentheses stays under plain Stack.

---

## Quick Self-Check (dual-home traps)

| Stem flavor | Correct reflex | Common wrong reflex |
| --- | --- | --- |
| Contiguous sum **equals K** (any ints) | Prefix + map | Sliding Window |
| Longest under constraint | Sliding Window | Prefix Sum |
| Peak concurrent meetings | Sweep Line | Interval merge |
| Top K frequent | Map count + Heap select | Sort only / map only |
| Word on board with undo | Backtracking | Paint-forever DFS |
| Warm days ahead | Monotonic Stack | Nested scan / plain Stack |
| Weighted shortest ≥0 | Dijkstra | BFS |
