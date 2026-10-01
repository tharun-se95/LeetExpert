---
title: "Pointer Surgery Patterns"
kicker: "Pointer Surgery Patterns · Linked Lists module · concept lesson"
headline: "Which few moves solve most linked-list problems?"
lede: "The Linux kernel links thousands of its structures into lists, and every one of those lists starts with a sentinel: a node that holds no data and is never removed, so that adding to or removing from an empty list, or the front of one, is the same operation as anywhere else. That is the first of four moves this lesson collects. Learn them as patterns, each with the invariant that makes it safe, and the problems in this module become a matter of recognising which ones they need."
chips:
  - "pattern **dummy node**"
  - "pattern **two walkers**"
  - "habit **rewire, don't copy**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroSentinel" viewBox="0 0 560 300" role="img" aria-label="Animation: a list of processes behind a sentinel node. A cursor stands on the sentinel and inspects the next node; finished processes are unlinked one by one, including the first, by the same splice, and the sentinel never moves."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">splices</span></div><div id="heroCap"></div></div></div></div>
---

## The dummy node {#node banner}

Deleting a node means rewriting its predecessor's `next`. The head has no predecessor, so a plain delete needs a branch just for it, and every branch is a place for a bug. The **dummy** removes the branch: put one placeholder node in front of the real head, do all the surgery in terms of it, and return `dummy.next` at the end. Now every real node has a node before it, and the head case is the general case.

```code solution "Delete every copy of a value"
```

Notice where the walker stands. It stands on `prev` and **inspects `prev.next`**: it removes what is ahead of it, never what it is on, because only the node before can be rewired to skip it. That stance also settles when to move on. After a splice, `prev.next` is a node nobody has looked at yet, so the walker stays put and only the else branch advances.

```widget #dummy "Delete every 7, from a dummy"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```

The same dummy also anchors a list you **build**. Keep a `tail` starting on the dummy, and for each node you attach write `tail.next = node`, then `tail = node`. The dummy gave the first attached node a `next` to be written into, and `dummy.next` is the new list's head. Merging two sorted lists is exactly this.

## Advancing after a splice {#trap banner}

The second classic list bug sits in that one `else`. Advance on every pass, splice or not, and the walker steps over the node the splice just pulled into view:

```widget #trapper "[7,7,3], delete 7, two ways"
<div class="extabs" role="group" aria-label="Choose a version"></div><div class="lvhost"></div>
```

````warn
Advance only when nothing was spliced. A walker that always advances skips the node a splice pulls in: on [7,7,3], deleting 7 leaves [7,3], and when the last node is deleted it steps onto null and reads `null.next`, an `AttributeError` in Python and a `TypeError` in TypeScript. Tests that delete a single, non-final value pass, which is how this ships.

```code mistake "Advancing after a splice"
```
````

## Reversal, runners and gaps {#walk banner}

Three more moves cover the rest of the module, and each has a problem lesson of its own. Here they are side by side, each run on a real list with its invariant checked on every settled step.

- **Three-pointer reversal.** Flipping `curr.next` destroys the only pointer to the rest of the list, unless it was saved first. So the walk holds three names: save `nxt = curr.next`, flip `curr.next = prev`, march both on. At every step `prev` heads the reversed part and `curr` the untouched rest.
- **Fast and slow.** One walker moves two nodes for each one the other moves. When the fast one runs out, the slow one is in the middle; on a list with a cycle the fast one never runs out, and it laps the slow one until they meet. Its loop must guard both hops, `fast and fast.next`, because `fast.next.next` reads two nodes ahead.
- **A gap of n.** Two walkers at the same speed, the lead n nodes ahead. When the lead reaches the end, the trailer is n from the end, with no length ever counted. Starting both on a dummy puts the trailer on the predecessor, ready to splice.

```widget #moves "Three moves, run on real lists"
<div class="extabs" role="group" aria-label="Choose a move"></div><div class="lvhost"></div><p class="cost-note" id="movesNote"></p>
```

## Rewire, don't copy {#insight banner}

The deepest habit in this module is that linked-list algorithms **never move data**: they aim pointers. Merging two sorted lists does not copy values into new nodes; it links the existing nodes into a new order. Reversing, partitioning, rotating and removing are all rewires. Each of the four moves above is a rule about which pointer to rewrite and in what order, and each one's invariant says what is true between rewrites.

```key
Linked-list code rewrites pointers and never moves values: stand before the node you change, save any next you are about to overwrite, and let a dummy stand before the head.
```

```rosetta "The four moves, and the invariant each one keeps"
The move | What stays true
dummy node | every real node has a predecessor, and `dummy.next` is the head
three-pointer reversal | `prev` heads the reversed part, `curr` heads the untouched rest
fast and slow | fast has gone exactly twice as far as slow
a gap of n | the lead is exactly n nodes ahead of the trailer
```

## Debugging pointer code {#build toc="Debugging"}

Three habits catch most pointer bugs before they run.

1. **Draw it.** Four boxes and their arrows on paper beat ten minutes of staring at code. Every walkthrough in this module is that drawing, done for you.
2. **Check the boundary trio:** the empty list, a single node, and an edit at either end. Pointer bugs live at the boundaries, where a pointer you would normally rewrite is missing.
3. **State the invariant** of every loop. "prev heads the reversed part" catches a swapped assignment at once; checking that each line keeps it true is what the walkthroughs' invariant panel does.

## Where next {#next}

```variants
[
  {
    "title": "Reverse Linked List",
    "source": "problem",
    "text": "The three-pointer walk, iteratively and recursively, and why the loop is the better choice on a long list."
  },
  {
    "title": "Middle of the Linked List",
    "source": "problem",
    "text": "Fast and slow on a list without a cycle: where slow stops on odd and even lengths, and what one pass really saves."
  },
  {
    "title": "Linked List Cycle",
    "source": "problem",
    "text": "Fast and slow on a list that may loop, the proof that they must meet, and how a third walker finds where the loop starts."
  },
  {
    "title": "Merge Two Sorted Lists",
    "source": "problem",
    "text": "A dummy and a tail building a new list from existing nodes, with the leftover attached in one write."
  },
  {
    "title": "Remove Nth Node From End",
    "source": "problem",
    "text": "A dummy and a gap of n together: the trailer lands on the predecessor, even when the head is removed."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "What exactly does the dummy node remove from list code?",
      "options": [
        "The need for a tail pointer, since with a dummy in front the list no longer has to track where its last node is.",
        "The cost of finding a node, since edits can now start from the dummy instead of walking from the head to the target.",
        "The head-has-no-predecessor case: the head gets a node before it, so the same splice edits it."
      ],
      "answer": 2,
      "explanation": "Every edit is phrased as \"rewrite the predecessor's next\", and the head is the one node without a predecessor. The dummy supplies one, so the head's branch disappears and <code>dummy.next</code> always names the current head. Finding a node still takes a walk, and a tail is still needed for O(1) appends."
    },
    {
      "question": "In the reversal walk, why is <code>nxt = curr.next</code> saved before <code>curr.next = prev</code>?",
      "options": [
        "<code>curr.next</code> is the only route to the rest of the list, and the flip overwrites it, so it has to be copied first.",
        "Saving it first keeps <code>prev</code> valid, because the flip would otherwise also change the node <code>prev</code> refers to.",
        "Either order works: the two lines touch different variables, so the walk reverses the same nodes in the same order."
      ],
      "answer": 0,
      "explanation": "Both lines touch <code>curr.next</code>: the save reads it and the flip overwrites it. Nothing else points at the rest of the list, so a flip made first loses it, and the walk ends after one node. The order is the whole pattern."
    },
    {
      "question": "In <code>delete_all</code>, why does the walker advance only in the else branch?",
      "options": [
        "Advancing after a splice could step <code>prev</code> onto a deleted node, which still points into the list but is no longer part of it.",
        "After a splice, <code>prev.next</code> is a new node nobody has inspected; advancing would step over it, leaving a second 7 in [7,7,3].",
        "Staying put saves one step per splice, a small speed-up that does not change which nodes end up deleted."
      ],
      "answer": 1,
      "explanation": "The splice pulls the next-but-one node into <code>prev.next</code>, so the slot <code>prev</code> inspects now holds a node it has not checked. Advancing skips it. On [7,7,3] that leaves [7,3], and when the deleted node was the last one the advance steps onto null and the next check throws."
    }
  ]
}
```
