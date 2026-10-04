---
title: "Merge Two Sorted Lists"
kicker: "Merge Two Sorted Lists · Linked Lists module · problem lesson"
headline: "How do you weave two sorted chains into one without copying a link?"
lede: "Two servers each write their log in time order. To read one timeline, you merge them: look at the oldest unread entry from each, take the older, and repeat. Databases built on sorted runs do the same thing when they compact two runs into one. In a linked list nothing has to move to do it: every entry stays where it is, and only the next pointers are rewritten."
chips:
  - "needs **a dummy node**"
  - "rewires **existing nodes**"
  - "time **O(m + n)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroMerge" viewBox="0 0 560 300" role="img" aria-label="Animation: two rows of log entries, each in time order, one per server. A thread starts at a marker on the left and moves to whichever row's front entry is older, linking the entries into one timeline that zigzags between the rows."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">entries</span> linked</div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem banner}

Given the heads of two **sorted** linked lists, merge them into one sorted list by **splicing together the existing nodes**, and return its head.

```examples
list1 = [1,2,4], list2 = [1,3,4] → [1,1,2,3,4,4]
list1 = [], list2 = [] → []
list1 = [], list2 = [0] → [0]
```

```constraint
0 ≤ each length ≤ 50. Both inputs are sorted in non-decreasing order.
```

Splicing means the answer is made of the same nodes the inputs were made of, linked in a new order: no new node for each value, no copying values around. Read it as the two logs. Each is already in time order, so the oldest unread entry of the whole merge is always at the front of one log or the other. Nothing deeper in a log can be older than its own front.

Merge two lists yourself. Each button takes the front node of one list and links it on after the merged part. When one list runs out, a single link attaches everything left in the other.

```widget #byhand "By hand: take a front, or attach the rest"
<div class="lvhost"></div><div class="actions"><button type="button" class="btn2" data-take="l1"></button><button type="button" class="btn2" data-take="l2"></button><button type="button" class="btn2" data-take="rest">Attach the rest</button><button type="button" class="btn2 reset">Start again</button></div>
```

## Attempt it first {#attempt banner}

This is the dummy node's signature problem, and it is the merge step inside merge sort and the k-way merge of a later module, so it is worth writing cold. Sketch two short lists and stitch them on paper. Before you do, predict how many times the loop compares two fronts: the answer says something about where the work ends.

```widget "Predict how many comparisons the merge makes"
<div id="predict"></div>
```

```reveal #hint "Hint: a dummy, so the first node is not special"
Start the merged list from a fake node, the dummy, and keep `tail` on the last node of the merged part. Then the first splice is the same as every later one: `tail.next` gets the smaller front, and `tail` moves onto it. The real head is `dummy.next` at the end. When one list runs out, the other is already sorted and every value in it is at least the merged tail's, so one write, `tail.next = what is left`, finishes the job.
```

## Two traps {#trap banner}

The first trap is forgetting the leftover. The loop stops as soon as **either** list is empty, and the other may still hold nodes. Without one last write they are never linked on:

```code mistake_no_remainder "No last write"
```

```widget #trapper "[5] and [1,2,3], with and without the last write"
<div class="extabs" role="group" aria-label="Choose a version"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

The second trap is the head. Without a dummy, the first node of the result has no node before it to link from, so it needs its own branch, and the empty lists need theirs:

```code alt_no_dummy "Correct, without a dummy"
```

It is correct, and every one of its extra lines is a place for a bug. The dummy removes all of them: it gives the first real node a node before it, exactly like every other node.

The leftover's single write also matters for the work done. A version that keeps looping through the leftover one node at a time is still correct, but it pays a step for every leftover node:

```widget "Steps taken when one list is much longer"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

## The insight {#insight banner}

Keep one picture true from start to finish: the nodes from `dummy.next` to `tail` are exactly the nodes taken so far, in sorted order, and `tail` holds a value no larger than either list's front.

- **One step.** The smaller of the two fronts is no smaller than `tail` (the picture says so) and no larger than anything left in either list, since each list is sorted behind its front. So linking it on after `tail` keeps the merged part sorted, and moving `tail` onto it keeps the picture true.
- **The end.** When one list is empty, the other's front was never the smaller one, so it is at least the merged tail; behind it the list is sorted. The whole leftover chain can follow `tail` with one write.

Every comparison retires one node for good, so the loop makes at most m + n − 1 comparisons, and the leftover costs one write however long it is.

```key
Grow the merged list from a dummy with a tail: link the smaller front on, move tail onto it, and when one list runs out, link the rest of the other on in one write.
```

```rosetta "The code, read as two logs"
In the code | In the logs
`list1`, `list2` | the oldest unread entry of each server's log
`list1.val <= list2.val` | which of the two is older, taking server one's on a tie
`tail.next = list1` | the older entry linked onto the merged timeline
`tail` | the newest entry merged so far
`dummy` | a placeholder before the first entry, so the first merge is like every other
`tail.next = list1 or list2` | one log is done: the rest of the other follows as it is
```

`<=` rather than `<` takes ties from `list1` first. That makes the merge **stable**: equal values keep the order their lists gave them, which matters when a node carries more than its key and which merge sort inherits. Watch it on each of the lesson's inputs, and on a tie decided both ways.

```widget #stepper "Walk the merge"
<div class="extabs" role="group" aria-label="Choose an input"></div><div class="lvhost"></div>
```

## Solution {#solution banner}

Attempt it on paper first: set up the dummy and `tail`, write the loop, and say how the leftover gets attached. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Dummy, tail, one last write"
```

```notes
The loop body is one step of the picture: pick the smaller front, link it after `tail`, advance that list, move `tail`. `tail.next = list1 if list1 is not None else list2` is the end of the picture: at most one list still has nodes, and they all belong after `tail`. `dummy.next` is the merged list's first real node, or null when both inputs were empty.
```

```derivation
**Time O(m + n).** Each comparison links one node and never revisits it, and the loop ends as soon as one list is empty, so it makes at most m + n − 1 comparisons. On the lesson's first example, [1,2,4] and [1,3,4], it makes {{cmpExample}}, counted by running it; the leftover, one node, is linked by a single write.

**Space O(1).** The dummy node and the `tail` reference, whatever the lengths: every node of the result is a node of the input, rewired. Checked on {{spliceChecks}} random pairs of sorted lists: every node of the merged list is one of the input nodes, and each appears once.
```

````warn
Attach the leftover. The loop stops when either list is empty, so a version without the last write loses whatever the other list still holds: on the lesson's four inputs it returns {{noRemainderAnswers}}.

```code mistake_no_remainder "No last write"
```
````
`````

## Variants {#variants}

```variants
[
  {
    "title": "Merge k Sorted Lists",
    "source": "LeetCode 23",
    "text": "Merge pairs of lists until one is left, or keep the k fronts in a min-heap and pop the smallest each time. Both use this lesson's dummy and tail."
  },
  {
    "title": "Sort List",
    "source": "LeetCode 148",
    "text": "Merge sort on a linked list: split at the middle with the slow and fast walkers, sort both halves, and merge them with this loop. No random access is needed anywhere."
  },
  {
    "title": "Merge Sorted Array",
    "source": "LeetCode 88",
    "text": "The same merge on arrays, done in place. Arrays cannot be spliced, so the merge fills the larger array from the back, where the free slots are."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "When the loop ends, why can a single write attach everything left in the other list?",
      "options": [
        "The leftover's front was never the smaller front, so it is at least the tail, and its list is sorted behind it.",
        "The dummy node keeps the merged list sorted, so anything linked after <code>tail</code> ends up in order automatically.",
        "The leftover is always a single node, because the loop stops when the two lists differ in length by exactly one."
      ],
      "answer": 0,
      "explanation": "Two facts combine. The leftover's front survived every comparison it took part in, so it is no smaller than anything already merged. And the rest of its list is sorted behind it. So the whole chain continues the merged order, and linking its front on links all of it. The dummy only removes the special case for the first node, and the leftover can be any length."
    },
    {
      "question": "Without a dummy node, which parts of the merge need special cases?",
      "options": [
        "The last node, because without a dummy <code>tail</code> ends one node short of where the leftover has to be attached.",
        "The first node and the empty inputs, since the result's first node has no node before it to link from.",
        "Ties between equal values, because without a dummy the loop cannot tell which list an equal value came from."
      ],
      "answer": 1,
      "explanation": "Every node except the first is attached by <code>tail.next = …</code>. The first has no <code>tail</code> before it, so it needs its own branch, and so do the empty inputs that have no first node. A dummy is a node before the first, which makes the first splice the same as every other one."
    },
    {
      "question": "The comparison is <code>list1.val &lt;= list2.val</code>. What changes if it uses <code>&lt;</code> instead?",
      "options": [
        "The merge would drop one of two equal values, since <code>&lt;</code> treats a tie as neither list's turn.",
        "The loop would never end on a tie, since neither front would count as smaller and neither list would advance.",
        "Ties would be taken from <code>list2</code> first, so equal values would no longer keep the order their lists gave them."
      ],
      "answer": 2,
      "explanation": "With <code>&lt;</code> a tie makes the condition false, so the else branch takes <code>list2</code>'s node. Every node is still merged and the values come out sorted, but equal keys from the two lists swap their order. That is the loss of stability, which matters once nodes carry data beyond the value compared."
    }
  ]
}
```
