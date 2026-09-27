---
title: Diameter of Binary Tree
kicker: Diameter of Binary Tree · Binary Trees module · problem lesson
headline: How far apart can two machines in a tree be?
lede: "A tree-shaped network has a worst case: the most hops any packet could ever need between two machines. That number is the tree's diameter, and finding it looks like a depth problem that quietly is not."
chips:
  - needs **postorder**
  - shape **return + accumulator**
  - time **O(n)**
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroNet" viewBox="0 0 560 300" role="img" aria-label="Animation: a packet crosses a tree-shaped network, first along a route through the core switch, then along a longer route that bends lower down."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">6</b> <span id="heroUnit">hops</span></div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem banner}

Given the `root` of a binary tree, return the length of its **diameter**: the number of **edges** on the longest path between *any two nodes*. The path may or may not pass through the root.

```examples
root = [1,2,3,4,5] → 3  (longest path 4-2-1-3 or 5-2-1-3; three edges)
root = [1,2] → 1  (the single edge between 1 and 2)
```

```constraint
1 ≤ n ≤ 10⁴ nodes.
```

Read the tree as a network: nodes are switches and servers, edges are cables, and the diameter is the worst-case number of hops between two machines, the latency budget you have to plan for. In a tree, two nodes have exactly one route between them: up to where their branches meet, then down. So nothing is left to choose along a route, and the whole problem is to find the pair of machines whose route is longest. Try a few pairs yourself.

```widget #explore "Explore: count the hops between two machines"
<div class="tv-wrap"><div class="tv"></div></div><div class="readout" aria-live="polite"></div><div class="actions"><button type="button" class="btn2 best">Show a longest route</button><button type="button" class="btn2 clear">Clear</button></div>
```

## Attempt it first {#attempt banner}

This is where bottom-up recursion first bites back. It looks like maximum depth, and the height recursion from the last lesson really is the engine, but the answer you want and the value each call must return are two different things. Mixing them up gives a wrong answer that survives small symmetric trees.

Wrestle with one question before revealing anything: the longest path *bending* at a node (down its left, up through the node, down its right) is a strong candidate for the answer, but can a function return that quantity to its parent and have the parent use it? Working out why not is the whole lesson.

First, get a feel for the answer. Each case is a real tree; predict its diameter, then see the path.

```widget "Predict the diameter"
<div id="predict"></div>
```

```reveal #hint "Hint: separate two quantities that want to be one"
At each node two different numbers are in play.

**1.** The longest path that *bends* here is `leftHeight + rightHeight`: down the left as far as possible, back up, down the right as far as possible. That is a candidate for the answer.

**2.** The node's *height* is `1 + max(leftHeight, rightHeight)`: one straight downward path, because a parent can only extend a straight path.

The answer is the maximum of number 1 over all nodes. The value returned upward is number 2. Do not return number 1.
```

## The naive trap: "just return the diameter" {#trap toc="The naive trap" banner}

The tempting first attempt is a function `diameter(node)` that returns the diameter of the subtree at `node`, recursing on children like maximum depth did. Try to write its combine step and you hit a wall. The diameter at a node depends on the two subtrees' **heights**, which measure the path that bends through the node. It does not depend on the two subtrees' diameters. A subtree's diameter is the longest path *somewhere inside* it, and says nothing about how far down the subtree reaches, which is what a parent needs to extend a path through itself.

So a function returning diameters throws away the one number its parent requires (height) and keeps a number the parent cannot use. People patch this by computing height separately inside the diameter function:

```code naive "The correct but slow version"
```

This is correct but slow. In network terms, every switch asks everything below it to report its depth all over again, even though the switch beneath already worked it out for its own parent. For every node, `diameter` calls `height` on its children, and `height` walks that entire subtree. A node near the root triggers a height computation over almost the whole tree, and this repeats at every node: the height of a subtree is recomputed once for every ancestor it has. The chart counts the node visits on a skewed tree, the worst case.

```widget "Work done as the tree grows"
<div class="chart" id="cost"></div><div class="legend"><span><i style="background:var(--r-ink)"></i>naive: diameter with a separate height call</span><span><i style="background:var(--g-ink)"></i>one pass</span></div><p class="cost-note"></p>
```

## The insight {#insight banner}

Both numbers a node needs, its height and the best path bending through it, can be computed from the *same two child heights*. So make the recursion return **height**, the one value a parent can truly extend. And while both child heights are in hand, compute the bending path `left + right` and fold it into a single shared answer kept outside the recursion. One postorder pass computes each subtree's height exactly once, and the diameter is collected on the way.

```key
The value a call returns and the answer you are after may be different quantities: return what the parent can extend, record what the problem asks for on the side.
```

```rosetta "The code, read as a network"
In the code | In the network
`node` | a switch or a server
`edge` | one cable, one hop
`height(node)` | how many machines deep the tree goes below this switch
`left + right` | traffic that climbs to this switch from one side and descends the other
`return height` | what a switch reports to the switch above it
`best` | the fleet's record hop count so far
```

Watch it happen. Each node shows its height once its call has returned. The three counters are the path bending at the current node, the height it returns, and the running best.

```widget #stepper "Walk the one-pass solution"
<div class="extabs" role="group" aria-label="Choose a tree"></div><div class="plhost"></div>
```

## Solution {#solution banner}

Attempt it on paper first: write the recursion, decide what it returns, and say where `best` is updated. Then compare. Read it as a fleet report: every switch tells the switch above it one number, how deep it goes, and keeps the record hop count on the side.

`````reveal #solbox "Show the solution"
```code solution "Return height, accumulate the diameter"
```

```notes
The two lines after the recursive calls do the two jobs. `best = max(best, left + right)` considers the path that bends at this node: `left` edges down one side, up through the node, `right` edges down the other. `return 1 + max(left, right)` gives the parent the one thing it can extend: how far straight down this subtree reaches.

Every node's bending path is considered exactly once, so `best` ends as the maximum over all nodes, which is the diameter.
```

```derivation
**Time O(n).** A binary tree with n nodes has n + 1 empty child slots, and the recursion is called exactly once for each node and each empty slot: n + (n + 1) = 2n + 1 calls. Counting them on the five-node example gives {{calls}}, as predicted. Each call does a constant amount of work besides its recursive calls, so the total is O(n). The naive version could not say this: it called height again on every subtree.

**Space O(h).** The only extra memory is the call stack, as deep as the tree is tall: about {{balancedFrames}} frames for a balanced tree of the constraint's 10⁴ nodes, and 10,000 for a skewed one. CPython's default recursion limit is 1,000, so a 10⁴-deep skewed tree needs the limit raised or an explicit stack.
```

````warn
Do not return the bending path. If `height` ends with `return left + right`, every leaf returns 0, so every parent sees two zero arms and nothing ever grows. The function then answers **{{mistakeAnswers}}**, including the lesson's first example, where the answer is 3.

```code mistake "The mistake"
```
````
`````

## Variants {#variants}

Once you can see "return one thing, record another", a family of problems opens up.

```variants
[
  {
    "title": "Binary Tree Maximum Path Sum",
    "source": "LeetCode 124",
    "text": "Same shape, higher stakes. Return the best downward path sum for the parent to extend, and accumulate the best bending path sum globally. The extra twist: a negative subtree contributes max(0, childSum), because you may choose not to include it."
  },
  {
    "title": "Balanced Binary Tree",
    "source": "LeetCode 110",
    "text": "Another return-height problem with a side answer. Return the height, and flag any node whose two subtree heights differ by more than 1."
  },
  {
    "title": "Maximum Depth",
    "source": "previous lesson",
    "text": "The plain height recursion this problem wraps. Diameter is height plus one accumulator line, which is worth seeing by re-reading it."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "Why can't the recursion simply RETURN each subtree's diameter to its parent, the way maximum depth returns each subtree's depth?",
      "options": [
        "To extend a path through itself, a parent needs how far each child's subtree reaches down, its height. A subtree's diameter is a path inside it that says nothing about that reach.",
        "Returning the diameter would count edges twice: when a parent adds its own edge to a child's returned diameter, edges already on the child's path get counted again at every level.",
        "It can, and that is the standard solution: a parent combines its two children's returned diameters with the path that bends at itself, and keeps the largest of the three."
      ],
      "answer": 0,
      "explanation": "The answer (the longest path anywhere) and the value a parent needs (how far the subtree reaches downward) are different quantities. A subtree's diameter is an internal path, not a downward one, so a parent cannot stitch it into a path through itself. The returned value must be height, and the diameter is collected separately while both child heights are in hand."
    },
    {
      "question": "The \"correct but slow\" version computes height separately inside the diameter function and runs in O(n²). Where does the quadratic cost come from?",
      "options": [
        "Each node calls height() on its children, and height() walks that whole subtree again, so each subtree's height is recomputed once per ancestor: O(n) per node, n nodes.",
        "The two recursive diameter() calls at each node spawn two more each, and that doubling at every level is what makes the work grow with the square of the number of nodes.",
        "The max() at each node compares the bending path with both subtree diameters, and finding those diameters means scanning every node in the tree again on each call."
      ],
      "answer": 0,
      "explanation": "It is the redundant-recompute pattern of naive Fibonacci. A subtree near the root has its height recalculated once per ancestor, so the same nodes are walked again and again. The chart above counts it exactly: n(n + 1) / 2 visits on a skewed tree. Folding height and diameter into one postorder pass computes each height once and drops O(n²) to O(n)."
    }
  ]
}
```
