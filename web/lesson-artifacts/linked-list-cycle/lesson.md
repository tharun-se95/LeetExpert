---
title: "Linked List Cycle"
kicker: "Linked List Cycle · Linked Lists module · problem lesson"
headline: "How can you tell a chain that is long from one that never ends?"
lede: "On a FAT disk a file is a chain of blocks, each entry naming the next. Corrupt one entry so it names a block earlier in the same file, and the file never ends: a reader following it goes round forever. A disk checker has to tell that apart from a file that is merely very long, and it wants to do it without keeping a note of every block it has passed."
chips:
  - "needs **two pointers**"
  - "compares **identity, not value**"
  - "space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroLoop" viewBox="0 0 560 300" role="img" aria-label="Animation: a file's blocks form a chain whose last entry points back to the third block, so the chain loops. Two readers follow it from the first block, one moving one block per round and the other two. They end up on the same block, which proves the chain loops."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">rounds</span></div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem banner}

Given the `head` of a linked list, return whether it contains a **cycle**: some node whose `next` points back to an earlier node, so that following `next` never reaches null.

```examples
head = [3,2,0,-4], pos = 1 → true  (-4 links back to 2)
head = [1,2], pos = -1 → false  (no cycle)
```

```constraint
0 ≤ length ≤ 10⁴. Follow-up: use O(1) memory.
```

`pos` is how the test describes the input: the index of the node the tail links back to, or −1 for no cycle. Your function never sees it; it gets only `head`. Read the list as the corrupted file: the head is the first block, and a cycle is an entry that names a block the reader has already passed.

Try it from the inside. A single reader can only follow `next` and count. Here it is on two lists, one with a loop and one without. Stop either walk after a few steps and ask what the reader has learned.

```widget #walk1 "Explore: one reader, no memory"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```

The reader on the looping list sees exactly what a reader on a very long list would see: another node, and another. Reaching null proves there is no cycle, but no number of steps without null proves there is one. Something more is needed: either a memory of where the reader has been, or a second reader.

## Attempt it first {#attempt banner}

With the Hash Tables module behind you, an O(n)-memory answer should come at once: which structure tells you "seen this before" in O(1)? The O(1)-memory answer is Floyd's tortoise and hare, built from the two walkers of the previous lesson. The real work is convincing yourself that the two must meet when there is a loop: that it is guaranteed, not lucky. Predict when they meet on three lists before reading on.

```widget "Predict the pass on which slow and fast meet"
<div id="predict"></div>
```

```reveal #hint "Hint: what happens to the gap between them?"
Once both walkers are inside the loop, `fast` is chasing `slow` around it. Each pass `slow` moves one node and `fast` two, so the distance from `fast` up to `slow`, measured along the loop, shrinks by exactly one. A distance that drops by exactly one each time cannot jump over zero.
```

## Two traps {#trap banner}

The first answer most people reach is to remember every node they visit. It is correct: a walk on a list with a cycle comes back to a node it has already seen, and a walk without one reaches null.

```code alt_seen_set "Remember every node"
```

What it costs is the memory: one entry per node, where Floyd's version holds two references.

```widget "Entries held at once, on a list with no cycle"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

The second trap is in the comparison. Two different nodes can hold the same value, so "the walkers met" must mean the **same node**, `slow is fast` (`===` in TypeScript), never `slow.val == fast.val`. Here is a list of four 1s, with no cycle, checked both ways:

```code mistake_values "Comparing values"
```

```widget #trapper "[1,1,1,1], no cycle, checked two ways"
<div class="extabs" role="group" aria-label="Choose a comparison"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

## The insight {#insight banner}

Say the list has a tail of **a** nodes before the loop starts, and the loop has **C** nodes. Follow the two walkers in two phases.

**Getting in.** After a passes, `slow` has just entered the loop. `fast`, moving twice as fast, entered earlier and has been going round, so it is somewhere in the loop too.

**Closing the gap.** Now measure the gap: how many nodes `fast` must move forward around the loop to reach `slow`. It is some number from 0 to C − 1. On every pass `slow` moves one node forward, adding one to the gap, and `fast` moves two, taking two away, so the gap shrinks by exactly one. It reaches zero, which means `fast` is on `slow`'s node, within at most C − 1 more passes. It cannot skip past zero, because it never shrinks by more than one at a time.

So with a cycle the walkers meet within a + C passes, which is at most n. Without one, `fast` reaches null after ⌊n ÷ 2⌋ passes, exactly as in the previous lesson. Either way the loop ends after at most n passes, holding two references.

```key
With a cycle the gap between fast and slow shrinks by exactly one node per pass, so it reaches zero and they meet; without one, fast reaches null. Two references decide which.
```

```rosetta "The code, read as a disk check"
In the code | On the disk
`node.next` | a block's table entry: the block that comes next
a cycle | a corrupt entry naming a block earlier in the same file
`slow` | a reader following one entry per round
`fast` | a reader following two entries per round
`slow is fast` | both readers on the same block: the chain loops
`fast is None` | the end-of-chain marker: the file ends normally
```

Watch the gap close on each of the lesson's lists. The fields line shows it once both walkers are in the loop.

```widget #stepper "Walk Floyd's two walkers"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```

## Solution {#solution banner}

Attempt it on paper first: write the loop, decide when to compare and what to compare, and say what each exit returns. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Floyd's tortoise and hare"
```

```notes
Two details separate a correct version from a lucky one. The comparison is **identity**: `is` in Python and `===` in TypeScript compare the references, so two nodes that happen to hold equal values are not a meeting. And the comparison comes **after** the step: both walkers start on the head, so a check before moving would report a meeting on the very first pass.

The loop condition is the previous lesson's, `fast` and `fast.next` both existing, so on a list without a cycle `fast` reaches null and the function returns false.
```

```derivation
**Time O(n).** With a cycle the walkers meet within a + C passes, at most n; without one `fast` falls off after ⌊n ÷ 2⌋. Run on every list of up to 100 nodes, with the tail linked back to every possible node and to none, the most passes any of them took was {{maxPasses}}, never more than its length.

**Space O(1).** Two references, against the set version's one entry per node.
```

````warn
Compare after moving, never before. Both walkers start on the head, so a check at the top of the loop is true on its very first pass, and the function reports a cycle on every list with two or more nodes. On the lesson's eight test lists it {{checkFirstAnswers}}.

```code mistake_check_first "Checking before the step"
```
````
`````

`````reveal #entrybox "Follow-up: where does the cycle start?"
Linked List Cycle II asks for the node where the cycle begins. Floyd's walkers find it with one more phase: after they meet, start a third pointer, `probe`, at the head, and move `probe` and `slow` one node at a time. They meet exactly at the entry.

```derivation
**Why.** At the meeting, `slow` has walked a + b nodes, where b is how far into the loop it stopped, and `fast` twice as many, 2(a + b). `fast`'s extra a + b nodes were whole laps of the loop, so a + b is a multiple of C. Now walk a more nodes from the meeting point: that is b + a nodes into the loop, a whole number of laps, which is the entry. And a nodes from the head is also the entry. So `probe`, from the head, and `slow`, from the meeting point, arrive at the entry on the same step, and not before: until then `probe` is still on the tail, outside the loop.

Checked by running it on every tail length from 0 to {{entryTails}} and every loop length from 1 to {{entryLoops}}: the third phase stopped on the entry every time.
```

```widget #entry "Find the entry, after the meeting"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```
`````

## Variants {#variants}

```variants
[
  {
    "title": "Linked List Cycle II",
    "source": "LeetCode 142",
    "text": "Return the node where the cycle starts. The follow-up above: after the meeting, a third pointer from the head and slow, both at speed one, meet at the entry."
  },
  {
    "title": "Happy Number",
    "source": "LeetCode 202",
    "text": "Repeatedly replace a number by the sum of the squares of its digits. The sequence either reaches 1 or loops, and Floyd's walkers detect the loop without storing the numbers: any rule that gives each value one successor forms a chain like this list."
  },
  {
    "title": "Find the Duplicate Number",
    "source": "LeetCode 287",
    "text": "An array of n + 1 numbers from 1 to n, read as a list where index i points to nums[i]. The duplicate value is the entry of a cycle, found with this lesson's follow-up in O(1) memory."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "Once both walkers are in the loop, why can't <code>fast</code> jump over <code>slow</code> without landing on it?",
      "options": [
        "The gap from <code>fast</code> up to <code>slow</code> shrinks by exactly one node per pass, so it reaches zero instead of skipping it.",
        "<code>fast</code> moves two nodes per pass, so on a loop with an even number of nodes it is certain to land on <code>slow</code> eventually.",
        "It can jump over, so the check also compares <code>fast.next</code> with <code>slow</code> to catch the pass where it would skip past."
      ],
      "answer": 0,
      "explanation": "Each pass <code>slow</code> adds one to the gap and <code>fast</code> takes two away: a net change of exactly −1. A count that falls by one at a time from at most C − 1 must hit 0, on loops of any length, odd or even. No extra comparison is needed."
    },
    {
      "question": "A version compares values, <code>slow.val == fast.val</code>, instead of <code>slow is fast</code>. On which input is it wrong?",
      "options": [
        "A list with a cycle of length one, where the tail points to itself and the two walkers never land on the same node.",
        "A list with no cycle that repeats a value, such as four 1s: the walkers land on different nodes with equal values.",
        "An empty list, because comparing the values of two null pointers raises an error before the loop can return false."
      ],
      "answer": 1,
      "explanation": "Equal values do not make two nodes the same node. On [1,1,1,1] the first pass puts <code>slow</code> on the second node and <code>fast</code> on the third, both holding 1, and the value comparison reports a cycle that is not there. The empty list never enters the loop, and a self-loop is caught by either comparison."
    },
    {
      "question": "The set version and Floyd's version both run in O(n) time. What does Floyd's version save, and when does that matter?",
      "options": [
        "It saves time: it visits each node at most once, while the set version visits each node twice, once to look it up and once to add it.",
        "It saves memory: two references instead of one set entry per node, which matters when the chain is huge or memory is tight.",
        "It saves nothing that matters in practice; the follow-up's O(1) memory is a puzzle constraint rather than a real one."
      ],
      "answer": 1,
      "explanation": "Both are linear in time. The set holds one entry per node, 10,000 at the constraint's limit, where Floyd's walkers hold two references whatever the length. That is the difference between a checker that needs memory in proportion to the disk and one that does not."
    }
  ]
}
```
