# Family 4 — Recursive Exploration Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## DFS

**Recognition:** islands, flood fill, connected components, reachability, clone graph (deep walk)  
**Complexity:** Time O(V + E) or O(R·C) on grids · Space O(V) visited + stack  
**Data Structure:** Adj list / grid + visited set (or in-place mark) — explore one path deep then back up  
**Difficulty:** Easy–Medium · **Interview Frequency:** Very High

### Template

```pseudo
function dfs(node):
    mark node visited
    for each neighbor v of node:
        if not visited(v) and allowed(v):
            dfs(v)

count = 0
for each cell / node:
    if land / unvisited start:
        dfs(cell); count += 1
```

### Common Questions

- Flood Fill · Number of Islands · Max Area of Island · Surrounded Regions · Clone Graph

### Common Mistakes

- Not marking visited before recursing (infinite loops)
- Using DFS for shortest path on an unweighted graph (use BFS)

---

## Tree Traversals

**Recognition:** height, diameter, balanced, LCA, BST inorder, serialize, max path sum  
**Complexity:** Time O(n) · Space O(h) recursion (worst O(n) skewed)  
**Data Structure:** Binary / n-ary tree nodes  
**Difficulty:** Easy–Hard · **Interview Frequency:** Very High

### Template

```pseudo
function walk(node):
    if node is null: return base
    # preorder work here if needed
    left = walk(node.left)
    # inorder work here if needed
    right = walk(node.right)
    # postorder: combine left, right, node
    return combine(left, right, node)
```

### Common Questions

- Maximum Depth · Diameter of Binary Tree · Validate BST · Lowest Common Ancestor · Binary Tree Maximum Path Sum

### Common Mistakes

- Preorder when you need child results first (height / diameter)
- Treating level-order as this section (that is BFS)

---

## Divide and Conquer

**Recognition:** split–solve–combine, merge sort style, cross-mid case, different ways to add parentheses  
**Complexity:** Often O(n log n) (log levels × O(n) combine) · Space O(log n) stack (+ merge buffers)  
**Data Structure:** Index range `[lo, hi]` over array / structure — split the puzzle, solve halves, glue  
**Difficulty:** Medium · **Interview Frequency:** Medium

### Template

```pseudo
function solve(lo, hi):
    if lo == hi: return base(lo)
    mid = (lo + hi) // 2
    leftAns  = solve(lo, mid)
    rightAns = solve(mid + 1, hi)
    crossAns = combine_across(lo, mid, hi)
    return best(leftAns, rightAns, crossAns)
```

### Common Questions

- Sort an Array (merge sort) · Maximum Subarray (D&C) · Majority Element (D&C) · Different Ways to Add Parentheses · Count of Smaller Numbers After Self

### Common Mistakes

- Forgetting the cross-mid / boundary combine
- Using D&C when a linear scan or DP is clearly simpler

---

## Backtracking

**Recognition:** permutations, subsets, combination sum, N-Queens, Sudoku, word search, generate all  
**Complexity:** Time often O(n!) / O(2ⁿ) pruned · Space O(depth) for path  
**Data Structure:** Partial path + choice set; undo / restore marks — try, explore, put the piece back  
**Difficulty:** Medium–Hard · **Interview Frequency:** High

### Template

```pseudo
function bt(path, choices):
    if is_goal(path):
        record(path); return
    for c in choices:
        if not valid(path, c): continue
        apply(path, c)           # choose
        bt(path, next_choices)
        revoke(path, c)          # undo
```

### Common Questions

- Permutations · Combination Sum · Subsets · Word Search · N-Queens · Sudoku Solver

### Common Mistakes

- Forgetting to undo (cell stays blocked; list not popped)
- Using backtracking when memo/DP can share overlapping states
