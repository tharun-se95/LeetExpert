---
title: Clone Graph
type: problem
---

## Problem

Given a reference to a node in a **connected undirected graph**, return
a **deep copy** (clone) of the entire graph. Each node has a value and a
list of neighbor references; the clone must be structurally identical
(same connectivity) but made of entirely new node objects.
(LeetCode 133.)

**Examples**

```examples
adjList = [[2,4],[1,3],[2,4],[1,3]] → deep copy with the same adjacency
adjList = [[]] → [[]]
adjList = [] → []
```

The square graph this adj list describes:

```text
1 -- 2
|    |
4 -- 3
```

Cloned-1 must connect to cloned-2 and cloned-4, and so on — same connectivity, all new nodes.

```constraint
up to 100 nodes, connected graph, no self-loops or repeated edges.
```

## Attempt it first

The graph can have cycles (it's explicitly undirected and connected,
which almost always means cycles), so a naive DFS/BFS that creates a new
clone every time it visits a node would infinite-loop or create
duplicate clones of the same original node. Before opening anything,
think about what single piece of extra state, tracked during the
traversal, prevents both problems at once.

```sandbox
{
  "id": "clone-graph",
  "fn": {
    "python": "clone_graph",
    "javascript": "cloneGraph"
  },
  "check": "return",
  "shape": {
    "0": "graph"
  },
  "returns": "graph",
  "starter": {
    "python": "def clone_graph(node):\n    # Return a deep copy of the graph: same connectivity, all new Nodes.\n    pass\n",
    "javascript": "function cloneGraph(node) {\n  // Return a deep copy of the graph: same connectivity, all new Nodes.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          [
            2,
            4
          ],
          [
            1,
            3
          ],
          [
            2,
            4
          ],
          [
            1,
            3
          ]
        ]
      ],
      "expect": [
        [
          2,
          4
        ],
        [
          1,
          3
        ],
        [
          2,
          4
        ],
        [
          1,
          3
        ]
      ]
    },
    {
      "args": [
        [
          []
        ]
      ],
      "expect": [
        []
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
          [
            2
          ],
          [
            1
          ]
        ]
      ],
      "expect": [
        [
          2
        ],
        [
          1
        ]
      ]
    },
    {
      "args": [
        [
          [
            2,
            3
          ],
          [
            1,
            3
          ],
          [
            1,
            2
          ]
        ]
      ],
      "expect": [
        [
          2,
          3
        ],
        [
          1,
          3
        ],
        [
          1,
          2
        ]
      ]
    },
    {
      "args": [
        [
          [
            2
          ],
          [
            1,
            3
          ],
          [
            2,
            4
          ],
          [
            3
          ]
        ]
      ],
      "expect": [
        [
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          4
        ],
        [
          3
        ]
      ]
    }
  ]
}
```

````reveal Hint — a map from original node to its clone, checked BEFORE recursing
Maintain a hash map from `original node → its clone`. Before creating a
new clone for a node, check whether it's already in the map — if so,
return the existing clone instead of making a new one (this both avoids
duplicate clones AND breaks the infinite loop, since a node already
being cloned is a signal "don't re-enter this node's cloning process").
The map must be checked and populated for the CURRENT node before
recursing into its neighbors, not after — this ordering is what
correctly handles cycles, since a neighbor might point back to a node
whose cloning is already in progress.
````

## The insight

This is a standard graph traversal (DFS shown below; BFS works
identically) with one addition: a `visited` map that serves double duty
— it's both the "don't revisit" guard the previous lesson's cycle
handling requires, AND the actual output data structure (mapping every
original node to its finished clone). The critical ordering: when `dfs`
is called on a node, it must (1) create that node's clone and register
it in the map IMMEDIATELY, THEN (2) recurse into neighbors. Reversed —
recursing before registering — would let a cycle back to the current
node trigger infinite recursion, since the map wouldn't yet know this
node is already being processed.

## Solution

`````reveal Solution — DFS with an original-to-clone map, checked before recursing
````tabs
```python
class Node:
    def __init__(self, val: int = 0, neighbors: list["Node"] | None = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def clone_graph(node: "Node | None") -> "Node | None":
    if node is None:
        return None

    cloned: dict["Node", "Node"] = {}

    def dfs(original: "Node") -> "Node":
        if original in cloned:
            return cloned[original]              # already cloning/cloned — return it

        clone = Node(original.val)
        cloned[original] = clone                 # register BEFORE recursing (breaks cycles)
        for neighbor in original.neighbors:
            clone.neighbors.append(dfs(neighbor))
        return clone

    return dfs(node)
```

```typescript
class Node {
  val: number;
  neighbors: Node[];
  constructor(val = 0, neighbors: Node[] = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

function cloneGraph(node: Node | null): Node | null {
  if (node === null) return null;

  const cloned = new Map<Node, Node>();

  function dfs(original: Node): Node {
    if (cloned.has(original)) {
      return cloned.get(original)!; // already cloning/cloned — return it
    }

    const clone = new Node(original.val);
    cloned.set(original, clone); // register BEFORE recursing (breaks cycles)
    for (const neighbor of original.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }
    return clone;
  }

  return dfs(node);
}
```
````

Trace a cycle to see why this terminates: cloning node 1 registers
clone-1, then recurses into neighbor 2; cloning node 2 registers
clone-2, then recurses into neighbor 1 — but node 1 is ALREADY in
`cloned` (registered before this recursion even started), so that call
returns the existing clone-1 immediately instead of recursing again.
The cycle in the original graph is correctly mirrored as a cycle in the
clone, without the traversal itself looping forever.

```complexity
{
  "time": "O(V + E)",
  "space": "O(V)",
  "why": "Every vertex is cloned exactly once (the map check ensures this) and every edge is examined exactly once (each neighbor list is iterated once per original node). Space is the map holding one entry per vertex, plus O(V) recursion depth in the worst case."
}
```
`````

## Variants

- **Copy List with Random Pointer** (Module 7 territory, not covered): the linked-list version
  of this exact problem — same original-to-clone map technique, applied
  to a simpler (non-branching, but still cycle-capable via the random
  pointer) structure.
- **DFS & BFS on Graphs** (concept lesson, this module): the `visited`
  guard this problem's `cloned` map generalizes — here it does double
  duty as both the cycle guard and the actual output.
- **Course Schedule** (next lesson): another graph problem needing
  careful state tracking during traversal, though there the tracked
  state (a node's DFS color) serves cycle DETECTION rather than
  cloning.

```quiz
{
  "question": "Why must a node's clone be registered in the `cloned` map BEFORE recursing into that node's neighbors, rather than after the recursive calls complete?",
  "options": [
    "Since the graph can contain cycles, a neighbor's own neighbor list might point back to the current node; if the current node's clone isn't registered until after all its neighbors are processed, that back-reference would trigger ANOTHER full cloning attempt of the current node, and this would recurse forever since the map would never show the node as already handled",
    "Registering after recursion would clone the neighbors in the wrong order — since the neighbor list is processed sequentially, delaying registration would cause later neighbors to be cloned before earlier ones, scrambling the resulting adjacency order",
    "The order doesn't matter for correctness, only for performance — registering before or after the recursive calls produces the same final map contents either way, so swapping the order would only add a small constant-factor slowdown, not change the output"
  ],
  "answer": 0,
  "explanation": "The map's job is to signal 'this node is already being handled — reuse the existing clone' the instant a cycle loops back to it. If registration happens only after the neighbor loop finishes, then during that neighbor loop, a cycle back to the current (still-unregistered) node looks exactly like an unvisited node — triggering infinite recursion. Registering first is what makes the map function as a cycle guard, not just a final output structure."
}
```
