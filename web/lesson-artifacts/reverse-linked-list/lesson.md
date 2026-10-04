---
title: "Reverse Linked List"
kicker: "Reverse Linked List · Linked Lists module · problem lesson"
headline: "How do you turn a chain around when each link only knows the next one?"
lede: "A file on a FAT disk is a chain: each block's table entry names the block after it, and the directory remembers only the first. Say a log stored that way has to be read newest-first, and the device has no room for a second copy of the chain. You rewrite the entries in place, one per block. Each entry is the only record of where the rest of the file lives, so the order you rewrite them in is the whole problem."
chips:
  - "needs **three pointers**"
  - "time **O(n)**"
  - "space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroFlip" viewBox="0 0 560 300" role="img" aria-label="Animation: five blocks of a file form a chain, each entry naming the next block's address. One at a time, from the first block, each entry is rewritten to name the block before it, until the chain runs from the last block back to the first."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">entries</span> rewritten</div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem banner}

Given the `head` of a singly linked list, reverse the list **in place** and return the new head.

```examples
head = [1,2,3,4,5] → [5,4,3,2,1]
head = [1] → [1]
head = [] → []
```

```constraint
0 ≤ length ≤ 5000. Follow-up: solve it iteratively and recursively.
```

In place means no new nodes and no second list: the same nodes, with their `next` pointers rewritten so the chain runs the other way. Read it as the disk: every block stays where it is, and only the table entries change. That rules out the easy escape of copying the values into an array and writing them back, and it is what makes the problem worth a lesson. A singly linked node knows the node after it and nothing else, so the moment you point a node backwards you have overwritten the only pointer to everything after it.

Try it by hand. These are the four statements the solution is made of. Run them in any order you like on the list 1 → 2 → 3 → 4 → 5, and watch what each one does to the pointers. A node that no name can reach any more is drawn faded: it is still in memory, but nothing can ever get to it again.

```widget #byhand "By hand: four statements, any order"
<div class="lvhost"></div><div class="actions stmts"><button type="button" class="btn2" data-op="save"><code>nxt = curr.next</code></button><button type="button" class="btn2" data-op="flip"><code>curr.next = prev</code></button><button type="button" class="btn2" data-op="prev"><code>prev = curr</code></button><button type="button" class="btn2" data-op="curr"><code>curr = nxt</code></button></div><div class="actions"><button type="button" class="btn2 reset">Start again</button><span class="lv-hint" id="byhandHint"></span></div>
```

## Attempt it first {#attempt banner}

This is the canonical pointer exercise. Sub-range reversal turns up inside harder problems constantly (reversing a window, reversing in groups, checking a palindrome), and all of them assume you can write this loop cold. So take paper, draw four nodes, and run the walk by hand before reading on.

The loop keeps two names on the list. `prev` heads the part already reversed, and `curr` heads the part not yet touched. Before revealing anything, predict where they stand after a few passes of the loop.

```widget "Predict where prev and curr stand"
<div id="predict"></div>
```

```reveal #hint "Hint: save the lifeline before you flip"
Each node's `next` is the only handle on the rest of the list. If you rewrite it first, the rest is gone. So hold three references: `prev`, the reversed part; `curr`, the node being flipped; and `nxt`, the node after it, saved before the flip.

When the walk finishes, `curr` is null: it has walked off the original tail. The new head is the last node flipped, which is `prev`.
```

## The trap: flip first {#trap toc="The trap" banner}

The tempting loop does exactly the two things the problem names, flip and move on, and nothing else:

```code mistake_flip_first "Flip, then move on"
```

It looks right and it runs without an error, which is what makes it dangerous. Follow it on 1 → 2 → 3 → 4. The first pass sets `1.next = prev`, which is null, and that write is the last pointer anyone had to 2. Then `curr = curr.next` reads the pointer it just overwrote, so `curr` becomes null and the loop ends. It returns the list 1, alone, for every input with more than one node. Compare the two orders, step by step:

```widget #trapper "The same list, two orders"
<div class="extabs" role="group" aria-label="Choose an order"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

The other way out of the trap is to give up on in place: walk the list once, keep a reference to every node in an array, then relink them from the back. That version is correct, and it is a fine first answer in an interview, but it holds one reference per node while a reversal needs only three at a time.

```code naive "Correct, with an array beside the list"
```

```widget "References held at once, as the list grows"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

## The insight {#insight banner}

Stop the correct loop at the top of any pass and look at the pointers. The list is always two separate chains. `prev` heads the nodes already flipped, in reverse order, ending at null. `curr` heads the nodes not yet touched, in their original order, also ending at null. Every node is in exactly one of them.

One pass moves exactly one node, `curr`, from the front of the untouched chain to the front of the reversed one, and it costs one pointer write. That is why the order inside the pass is forced. The write that moves `curr` across is `curr.next = prev`, and it destroys the untouched chain's only handle on its second node, so that handle has to be copied into `nxt` first. After the write, `prev = curr` and `curr = nxt` restore the picture: two chains, the reversed one a node longer.

```key
Keep the list as two chains, reversed and untouched, and move one node across per pass: save its next, flip it, then march both names forward.
```

The two chains also explain the ends. At the start the reversed chain is empty, so `prev` is null and `curr` is the head. The loop stops when the untouched chain is empty, `curr` is null, and then `prev` heads every node in reverse: the answer. An empty list never enters the loop and returns null; a one-node list passes once and returns that node. No special cases are needed, because the picture holds for both.

```rosetta "The code, read as the file on disk"
In the code | On the disk
`node` | one block of the file
`node.next` | that block's table entry: the block that comes next
`prev` | the first block of the part already rewritten
`curr` | the block whose entry is rewritten now
`nxt` | the address read out of that entry before it is overwritten
`curr.next = prev` | one entry rewritten to name the block before it
`return prev` | the new directory entry: the file now starts at the old last block
```

Watch it on each of the lesson's lists. The panel checks the two-chain invariant at the top of every pass.

```widget #stepper "Walk the three-pointer loop"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```

## Solution {#solution banner}

Attempt it on paper first: write the loop, decide what `prev` and `curr` start as, and say what you return. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Save, flip, march"
```

```notes
The loop body is the insight, line for line. `nxt = curr.next` saves the untouched chain's handle. `curr.next = prev` moves `curr` onto the front of the reversed chain. `prev = curr` and `curr = nxt` move both names one node on, which restores the two-chain picture.

`return prev` because the loop only ends when `curr` is null: the untouched chain is empty, and `prev` heads the whole list.
```

```derivation
**Time O(n).** Each pass moves one node from the untouched chain to the reversed one and never moves it back, so the loop runs exactly once per node. Reversing the five-node example writes `next` {{writes5}} times, once per node, counted by running it. Each pass does a fixed amount of work, so the total is O(n).

**Space O(1).** The loop holds three references, `prev`, `curr` and `nxt`, whatever the length. The array version holds one per node: {{naiveRefs}} at the constraint's 5000 nodes.
```

````warn
Do not return `curr`. The loop's condition is `curr is not None`, so when the loop ends `curr` is null, always. Returning it hands back an empty list for every input; on the lesson's four lists that gives {{returnCurrAnswers}}.

```code mistake_return_curr "Returning the wrong name"
```
````
`````

`````reveal #recbox "Follow-up: the recursive version"
```code deep_recursive "Reverse the rest, then hook on"
```

```notes
Read it from the base case up. A list of zero or one nodes is already reversed. For a longer list, trust the call to reverse everything after `head` and return its new head. The one line to think about is `head.next.next = head`. The recursive call rewrote every pointer after `head.next` but never `head.next` itself, so `head.next` still names the node that used to follow `head`, which is now the **last** node of the reversed rest. Setting its `next` to `head` puts `head` on the end. Then `head.next = None` makes `head` the tail, until the caller above hooks its own node on after it.
```

```derivation
**Space O(n).** Each call waits for the call on the rest of the list, so a list of n nodes has n calls open at once at its deepest point: {{recFrames}} frames for the constraint's 5000 nodes, measured by counting. Python stops a program at 1,000 frames by default (`sys.getrecursionlimit()`), so on the longest lists the constraint allows, this version raises `RecursionError` in Python. The loop reverses the same list with three references.

Recursion earns its keep when the structure branches, as a tree does; on a chain it buys elegance at the cost of a stack as long as the chain.
```
`````

## Variants {#variants}

```variants
[
  {
    "title": "Reverse Linked List II",
    "source": "LeetCode 92",
    "text": "Reverse only the nodes from position left to right. Walk to the node before the range, run this exact loop for right − left + 1 passes, then reconnect both ends. A dummy node before the head saves a special case when the range starts at the head."
  },
  {
    "title": "Reverse Nodes in k-Group",
    "source": "LeetCode 25",
    "text": "Reverse every block of k nodes, leaving a short last block as it is. It is the sub-range reversal in a loop, with the reconnection between blocks as the hard part."
  },
  {
    "title": "Palindrome Linked List",
    "source": "LeetCode 234",
    "text": "Find the middle (the next lesson's slow and fast pointers), reverse the second half with this loop, then compare the two halves node by node. Three of this module's moves, composed."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "The loop saves <code>nxt = curr.next</code> before <code>curr.next = prev</code>. What goes wrong if the two lines are swapped?",
      "options": [
        "The flip overwrites the only pointer to the rest of the list, so <code>nxt</code> saves the new value, <code>prev</code>, and the walk turns back after one node.",
        "Nothing changes: both lines read and write different fields, so either order leaves every node pointing at the same place once the pass is over.",
        "The last node is skipped: <code>nxt</code> runs one node ahead, so the loop stops with <code>curr</code> on the tail and never flips it."
      ],
      "answer": 0,
      "explanation": "Both lines touch <code>curr.next</code>: the first reads it, the second overwrites it. Swapped, the read happens after the write, so <code>nxt</code> holds <code>prev</code> instead of the next untouched node. Nothing else pointed at the rest of the list, so it is lost, and the loop ends after flipping one node."
    },
    {
      "question": "In the recursive version, what is <code>head.next</code> at the moment <code>head.next.next = head</code> runs?",
      "options": [
        "The new head of the reversed rest, because the recursive call rewires <code>head.next</code> to point at the front of what it reversed.",
        "Null, because the recursive call ends by setting the <code>next</code> of every node it touched, including <code>head</code>, to null.",
        "The node that used to follow <code>head</code>, now the last node of the reversed rest, since the call never touched <code>head.next</code>."
      ],
      "answer": 2,
      "explanation": "The call reversed every pointer after <code>head.next</code> but never wrote <code>head.next</code> itself. So it still names the old second node, which the reversal turned into the last node of the reversed rest. Pointing its <code>next</code> at <code>head</code> appends <code>head</code>; then <code>head.next = None</code> makes it the tail."
    },
    {
      "question": "The constraint allows 5000 nodes. Why is the loop strictly better than the recursion here, not just equivalent?",
      "options": [
        "The recursion visits each node twice, once going down and once coming back up, so it does twice the pointer writes the loop needs.",
        "The recursion holds one open call per node, 5000 at once, past Python's default limit of 1,000; the loop holds three references.",
        "The recursion cannot handle the empty list, so it needs an extra check before the first call that the loop does not need."
      ],
      "answer": 1,
      "explanation": "Both are O(n) time and both write each <code>next</code> once. The difference is space: the call stack grows to one frame per node, so a 5000-node list needs 5000 frames, and CPython stops at 1,000 by default with <code>RecursionError</code>. The loop's memory does not grow with the list at all."
    }
  ]
}
```
