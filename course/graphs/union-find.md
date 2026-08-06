---
title: Union-Find (Disjoint Set)
type: concept
---

## The question this structure answers efficiently

Many problems reduce to a repeated pattern: "are these two elements in
the same group?" and "merge these two groups into one." DFS/BFS
(previous lesson) can answer "same group" by re-running a full
traversal each time, but that's wasteful when groups merge and get
queried over and over — you'd re-traverse from scratch on every query.
**Union-Find** (also called **Disjoint Set Union**, DSU) is a structure
purpose-built for exactly these two operations, `find` (which group is
this element in?) and `union` (merge two groups), each running in
very-nearly O(1) time after two specific optimizations are applied
together.

## The basic idea: a forest of parent pointers

Represent each group as a tree, where every element points to a
`parent`, and a group's identity is the **root** of its tree (a root is
its own parent). Initially, every element is its own group — every
element is its own root:

```diagram
{
  "id": "union-find",
  "nodes": [
    { "id": 0, "parent": 0 },
    { "id": 1, "parent": 0 },
    { "id": 2, "parent": 0 },
    { "id": 3, "parent": 3 },
    { "id": 4, "parent": 3 },
    { "id": 5, "parent": 5 }
  ]
}
```


````tabs
```python
class UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))    # every element starts as its own root

    def find(self, x: int) -> int:
        while self.parent[x] != x:      # walk up until reaching a root
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        root_a, root_b = self.find(a), self.find(b)
        if root_a != root_b:
            self.parent[root_a] = root_b   # attach one tree under the other's root
```

```typescript
class UnionFind {
  parent: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // every element starts as its own root
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      // walk up until reaching a root
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent[rootA] = rootB; // attach one tree under the other's root
    }
  }
}
```
````

`find(x)` walks parent pointers up to the root; two elements are in the
same group exactly when `find` returns the same root for both. `union`
finds both roots and attaches one under the other. As written, this is
correct but can degrade badly: repeatedly unioning in a bad order (e.g.
always attaching the new tree under the OLDER one in a long chain) can
build a tree that's effectively a linked list, making `find` cost O(n)
in the worst case.

## Optimization 1: union by rank/size — keep trees shallow

Instead of arbitrarily attaching one root under the other, track each
root's **rank** (an upper bound on its subtree's height) or **size**
(element count), and always attach the SMALLER tree under the root of
the LARGER one. This keeps the resulting tree's height from growing
unnecessarily: attaching a smaller tree under a bigger one can increase
height by at most 1, and only when the two trees were the exact same
size — attaching a bigger tree under a smaller one, by contrast, can add
the entire smaller tree's height on top. Using size (simpler to reason
about) as the criterion:

````tabs
```python
class UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))
        self.size = [1] * n              # each root's tree size

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return
        if self.size[root_a] < self.size[root_b]:      # attach SMALLER under LARGER
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
```

```typescript
class UnionFind {
  parent: number[];
  size: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1); // each root's tree size
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number): void {
    let rootA = this.find(a);
    let rootB = this.find(b);
    if (rootA === rootB) return;
    if (this.size[rootA] < this.size[rootB]) {
      // attach SMALLER under LARGER
      [rootA, rootB] = [rootB, rootA];
    }
    this.parent[rootB] = rootA;
    this.size[rootA] += this.size[rootB];
  }
}
```
````

With union by size/rank alone (no path compression yet), tree height is
bounded by `O(log n)` — a standard result: a tree of height `h` built
this way must have at least `2^h` elements (each merge that increases
height requires combining two equally-tall trees, doubling the count),
so height can be at most `log₂ n`. This alone already brings `find` down
to O(log n).

## Optimization 2: path compression — flatten on the way up

Every time `find(x)` walks up to the root, it has just learned the true
root of every node it passed through along the way. **Path
compression** exploits this: after finding the root, re-point every
node visited during that walk DIRECTLY to the root, so the next `find`
on any of those nodes is O(1):

````tabs
```python
def find(self, x: int) -> int:
    root = x
    while self.parent[root] != root:        # first pass: locate the root
        root = self.parent[root]
    while self.parent[x] != root:           # second pass: flatten the path
        self.parent[x], x = root, self.parent[x]
    return root
```

```typescript
class UnionFind {
  parent: number[] = [];

  find(x: number): number {
    let root = x;
    while (this.parent[root] !== root) {
      // first pass: locate the root
      root = this.parent[root];
    }
    while (this.parent[x] !== root) {
      // second pass: flatten the path
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }
}
```
````

(An equivalent, more common recursive form: `if parent[x] != x: parent[x]
= find(parent[x])`. Both achieve the same flattening — every node on the
path from `x` to the root ends up pointing directly at the root.)

## Why both together give near-constant time

Union by rank/size alone gives O(log n). Path compression alone also
gives an amortized bound close to O(log n) (a more involved argument).
**Together**, the two optimizations combine to give an amortized time
per operation of **O(α(n))**, where α is the **inverse Ackermann
function** — a function that grows so slowly that for any n that could
ever exist in practice (far, far beyond the number of atoms in the
observable universe), α(n) is at most 4 or 5. This is, for every
practical purpose, **constant time**. The formal proof of this bound is
involved and not reproduced here; what matters operationally is the
combination — using only one of the two optimizations still leaves a
provably worse (though still good, O(log n)) bound, while using neither
lets `find` degrade toward O(n) on adversarial union orders, exactly the
linked-list-shaped worst case from the very first, unoptimized version
above.

```complexity
{
  "operations": [
    { "name": "find / union, no optimizations", "time": "O(n) worst case", "why": "an adversarial union order (always attaching under the newer tree) can build a tree with height n, forcing find to walk n pointers" },
    { "name": "find / union, union by rank/size only", "time": "O(log n)", "why": "always attaching the smaller tree under the larger bounds tree height at log n — height can only increase when combining equal-sized trees, and that only doubles the size" },
    { "name": "find / union, both optimizations", "time": "O(α(n)) amortized", "why": "α is the inverse Ackermann function, effectively constant (≤ 4-5) for any n that exists in practice — the two optimizations reinforce each other: compression flattens trees that rank-based union already kept shallow" }
  ]
}
```

## Where this is used

Union-Find is the natural structure whenever a problem is fundamentally
about **connectivity** — do these elements end up grouped together —
rather than about paths or distances (which is DFS/BFS/Dijkstra's
territory instead). This module's problems apply it to detecting a
cycle-causing edge (Redundant Connection), counting connected
components (Number of Provinces), and, in the next lesson, building a
Minimum Spanning Tree (Kruskal's algorithm uses Union-Find to detect
when adding an edge would create a cycle).

```quiz
{
  "questions": [
    {
      "question": "Without union by rank/size, why can repeated union operations in an adversarial order degrade find() to O(n)?",
      "options": [
        "Because union() without a size/rank rule can always attach the existing (possibly already-tall) tree's root under a brand-new single-node tree, repeatedly extending one long chain — producing a tree shaped like a linked list, where find() on the far end walks n pointers",
        "Because the parent array itself is limited in size — since the array is allocated with a fixed capacity equal to the number of elements, exceeding that capacity through repeated unions is what forces find() to take longer on large inputs",
        "Because find() always needs to visit every element in the structure, regardless of tree shape — the operation is defined to walk through the entire disjoint-set structure on every call, independent of how deep or shallow any particular tree happens to be"
      ],
      "answer": 0,
      "explanation": "Without a size/rank rule, union has no reason to prefer attaching the smaller tree under the larger — an unlucky (or adversarial) sequence can keep attaching a tall existing tree under a new single node each time, extending a chain by one link per union. After n-1 unions this produces a tree of height n, and find() on the deepest node walks the entire chain."
    },
    {
      "question": "Path compression re-points every node on a find() path directly to the root. Why does this help even THIS SAME find() call's asymptotic cost, not just future calls?",
      "options": [
        "The current call still does its normal walk-to-the-root pass at whatever height the tree currently has, so path compression's benefit is entirely for FUTURE find() calls on the compressed nodes, which now cost O(1) instead of retracing the same long path — this is what makes the AMORTIZED (averaged over many calls) cost so low, even though any single call's own worst case isn't directly reduced",
        "It reduces the current call's cost because compression happens before the root is located — by re-pointing nodes to a provisional root early in the walk, the algorithm shortens the remaining distance it needs to travel to find the true root during this same call",
        "It doesn't help the current call at all — it only helps future calls — since compression is purely a bookkeeping step performed after the root is already known, this call's own total work is completely unaffected by whether compression happens or not"
      ],
      "answer": 0,
      "explanation": "This is a genuinely subtle point worth getting right: compression happens AFTER the root is already found (or as a second pass in the iterative version), so it doesn't speed up the very call performing it. Its payoff is entirely amortized — every future find() on a now-flattened node is O(1) instead of retracing the original path. The famously slow-growing inverse-Ackermann bound is a statement about the AVERAGE cost across a whole sequence of operations, not any single call."
    },
    {
      "question": "The inverse Ackermann function α(n) is described as 'effectively constant' for any practically-sized n. What does this claim actually mean, precisely?",
      "options": [
        "α(n) DOES grow with n, without bound, in the true mathematical sense — but it grows so astonishingly slowly that for any n up to and vastly beyond the largest numbers that occur in any real computation, α(n) never exceeds about 4 or 5, so treating it as a constant is accurate for all practical purposes even though it isn't one in the strict asymptotic sense",
        "α(n) is an approximation that becomes inaccurate for large n — since the inverse Ackermann function is typically computed using a simplified formula, that approximation's error grows for sufficiently large n, making the 'effectively constant' claim less reliable at scale",
        "α(n) is mathematically equal to a constant for all n — since its growth rate is so slow as to be imperceptible, the function is formally defined with an upper bound that makes it a true constant rather than merely appearing to be one"
      ],
      "answer": 0,
      "explanation": "α(n) is a real, unbounded, monotonically (extremely slowly) increasing function — it is NOT literally O(1) in the formal sense. The precision matters: the claim is that its growth is so many orders of magnitude slower than log n, log log n, or any iterated logarithm that no value of n physically realizable in any computation pushes it past single digits, which is why engineers treat Union-Find with both optimizations as running in constant time in practice."
    }
  ]
}
```
