---
title: Serialize and Deserialize Binary Tree
type: problem
---

## Problem

Design an algorithm to **serialize** a binary tree to a single string,
and **deserialize** that string back to the exact original tree
structure (values, and where every null child is). No assumption may be
made about the tree's shape or values — the design must work for any
binary tree. (LeetCode 297.)

**Examples**

```examples
root = [1,2,3,null,null,4,5] → [1,2,3,null,null,4,5]  (deserialize(serialize(tree)) recovers an identical tree)
```

```text
      1
     / \
    2   3
       / \
      4   5
```

The string encoding is yours to choose — only the round-trip must hold.

```constraint
up to 10⁴ nodes · values may be any 32-bit integer · encoding must not conflate real values with a null sentinel
```

## Attempt it first

The previous lesson (Construct from Preorder and Inorder) needed *two*
traversals to reconstruct a tree, precisely because a single traversal
without extra information can't reveal where nulls are — many different
tree shapes can share the same plain preorder sequence. This problem's
whole trick is: what if the traversal explicitly records nulls too?
Before opening anything, work out why recording explicit null markers
during a SINGLE preorder pass makes that pass, on its own, sufficient to
reconstruct the exact tree — no second traversal required.

```sandbox
{
  "id": "serialize-and-deserialize-binary-tree",
  "fn": {
    "python": "Codec",
    "javascript": "Codec"
  },
  "class": {
    "python": "Codec",
    "javascript": "Codec"
  },
  "check": "roundtrip",
  "roundtrip": {
    "python": [
      "serialize",
      "deserialize"
    ],
    "javascript": [
      "serialize",
      "deserialize"
    ]
  },
  "shape": {
    "0": "tree"
  },
  "returns": "tree",
  "starter": {
    "python": "class Codec:\n    def serialize(self, root):\n        # Encode the tree as a string. The format is yours to choose.\n        pass\n\n    def deserialize(self, data):\n        # Rebuild the identical tree from your own string.\n        pass\n",
    "javascript": "class Codec {\n  serialize(root) {\n    // Encode the tree as a string. The format is yours to choose.\n  }\n\n  deserialize(data) {\n    // Rebuild the identical tree from your own string.\n  }\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          1,
          2,
          3,
          null,
          null,
          4,
          5
        ]
      ],
      "expect": [
        1,
        2,
        3,
        null,
        null,
        4,
        5
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
          1
        ]
      ],
      "expect": [
        1
      ]
    },
    {
      "args": [
        [
          1,
          2
        ]
      ],
      "expect": [
        1,
        2
      ]
    },
    {
      "args": [
        [
          -2147483648,
          2147483647
        ]
      ],
      "expect": [
        -2147483648,
        2147483647
      ]
    },
    {
      "args": [
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expect": [
        1,
        null,
        2,
        null,
        3
      ]
    },
    {
      "args": [
        [
          5,
          3,
          6,
          2,
          4,
          null,
          null,
          1
        ]
      ],
      "expect": [
        5,
        3,
        6,
        2,
        4,
        null,
        null,
        1
      ]
    },
    {
      "args": [
        [
          0,
          -1,
          1
        ]
      ],
      "expect": [
        0,
        -1,
        1
      ]
    }
  ]
}
```

````reveal Hint — preorder with explicit null markers is self-sufficient
Serialize with a preorder DFS, but instead of skipping null children,
emit an explicit sentinel (e.g. `"#"` or `"null"`) for each one. So a
leaf node contributes `value,#,#` (itself, then a null for the missing
left, then a null for the missing right) instead of just `value`.

Now deserializing is a straightforward preorder REPLAY: read the next
token; if it's the null sentinel, this position is `None`/`null`;
otherwise it's a node's value — construct the node, then RECURSE to
build its left child (consuming the next tokens), then recurse to build
its right child (consuming the tokens after that). Because every null
was explicitly recorded, the reader always knows exactly when a subtree
ends — it never has to guess or need a second traversal to disambiguate
structure, unlike the previous lesson's problem.
````

## Why plain preorder (without nulls) isn't enough

It's worth seeing the failure directly. Plain preorder of

```text
    1              1
   /      and       \
  2                  2
```

is `[1, 2]` in **both cases** — a left child in one tree, a right child
in the other, and the bare sequence can't tell them apart. That
ambiguity is exactly what the previous lesson's problem solved by
supplying a *second* traversal (inorder) to disambiguate structure.
Explicit null markers solve the same ambiguity a different way: `1,2,#`
(root 1, left child 2, 2's left is null — 2's right is implied absent by
running out of input, or written explicitly as one more `#`) versus
`1,#,2` (root 1, no left child, right child 2) are now distinguishable
from the string alone, with no second traversal needed.

## Solution

`````reveal Solution — preorder with explicit null sentinels, replayed on decode
````tabs
```python
class Codec:
    def serialize(self, root: "TreeNode | None") -> str:
        tokens: list[str] = []

        def dfs(node: "TreeNode | None") -> None:
            if node is None:
                tokens.append("#")           # explicit null marker
                return
            tokens.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ",".join(tokens)

    def deserialize(self, data: str) -> "TreeNode | None":
        tokens = iter(data.split(","))

        def build() -> "TreeNode | None":
            token = next(tokens)
            if token == "#":
                return None                  # this position was recorded as empty
            node = TreeNode(int(token))
            node.left = build()              # replay preorder: left consumes next
            node.right = build()             # then right consumes what's left
            return node

        return build()
```

```typescript
class Codec {
  serialize(root: TreeNode | null): string {
    const tokens: string[] = [];

    function dfs(node: TreeNode | null): void {
      if (node === null) {
        tokens.push("#"); // explicit null marker
        return;
      }
      tokens.push(String(node.val));
      dfs(node.left);
      dfs(node.right);
    }

    dfs(root);
    return tokens.join(",");
  }

  deserialize(data: string): TreeNode | null {
    const tokens = data.split(",");
    let pos = 0;

    function build(): TreeNode | null {
      const token = tokens[pos++];
      if (token === "#") return null; // this position was recorded as empty
      const node = new TreeNode(Number(token));
      node.left = build(); // replay preorder: left consumes next
      node.right = build(); // then right consumes what's left
      return node;
    }

    return build();
  }
}
```
````

The deserializer never needs to look ahead or backtrack — it consumes
tokens strictly left to right, exactly mirroring the order they were
written, because every position (including empty ones) was recorded
during serialization. `next(tokens)` (Python's iterator) and `pos++`
(TypeScript's cursor) both enforce "consume exactly one token per call,
in order," which is what makes the replay correct: `build()` for the
left subtree consumes precisely the tokens that belong to it before
`build()` for the right subtree ever runs, because that's the same
order `dfs` wrote them in.

```complexity
{
  "time": "O(n) for both serialize and deserialize",
  "space": "O(n)",
  "why": "Serialize visits every real node once (O(1) work: format and append) plus emits one sentinel per null child — there are exactly n+1 null children total across any binary tree with n nodes (a standard fact: every node has exactly 2 child slots, n-1 of which are filled by non-root nodes, leaving n+1 empty), so the token count is O(n), not larger. Deserialize consumes each token exactly once, O(1) work per token, O(n) total. Space is the output string/token list, O(n), plus O(h) recursion depth on each side."
}
```
`````

## Variants

- **Serialize and Deserialize BST** (LeetCode 449): the BST's ordering
  invariant means preorder ALONE (no null markers at all) is already
  sufficient to reconstruct the tree — cross-link to Module 18's BST
  invariant lesson: on deserialize, use the ordering to decide which
  later values belong in the left subtree versus the right, instead of
  relying on explicit `#` sentinels.
- **Construct Binary Tree from Preorder and Inorder Traversal**
  (previous lesson): the contrast that motivates this whole problem —
  that approach needed two DIFFERENT traversals because neither alone
  recorded nulls; this approach needs only ONE traversal because it
  does.
- **Copy List with Random Pointer** (Module 7 territory, not covered): a
  different data structure, but the same underlying theme — faithfully
  reconstructing a structure requires recording enough information
  during the first pass that no ambiguity remains for the second.

```quiz
{
  "question": "The previous lesson reconstructed a tree from TWO traversals (preorder + inorder) with no null markers. This lesson reconstructs a tree from ONE traversal (preorder) but WITH explicit null markers. Why does either approach work, while plain preorder alone (no nulls, only one traversal) does not?",
  "options": [
    "Plain preorder alone actually does work; the two extra approaches are unnecessary — a sufficiently careful deserializer can always infer the correct child structure from just the sequence of values and their count, without null markers or a second traversal",
    "Serialization strings are always ambiguous regardless of technique; the deserializer just picks one valid tree arbitrarily — since multiple tree shapes can share the same encoded string no matter how it's constructed, any deserializer is really just choosing arbitrarily among equally valid candidates",
    "Plain preorder without null markers loses information about where each node's children are absent, making the same sequence consistent with multiple different tree shapes; adding a second traversal (inorder) OR adding explicit null markers to preorder each independently supply the missing structural information needed to make the shape unambiguous"
  ],
  "answer": 2,
  "explanation": "The core issue is that bare preorder records values and their root-first order but not subtree BOUNDARIES — you can't tell where one subtree ends and another begins, or whether a child slot is simply empty. Two independent fixes exist: give the reader a second, differently-ordered traversal (inorder) to triangulate the boundaries from, or record the boundaries directly as explicit null tokens within the one traversal. Either supplies the missing bit of information; omitting both leaves the shape genuinely ambiguous."
}
```
