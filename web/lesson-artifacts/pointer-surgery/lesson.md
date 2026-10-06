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

## The dummy node {#node}

```caption
With a dummy in front, the head has a predecessor like every other node.
```

```vig "A dashed placeholder node in front of a chain, pointing at the real first node"
<rect class="st" x="10" y="44" width="42" height="24" rx="4" stroke-dasharray="3 3"/><circle class="fk" cx="44" cy="56" r="2.5"/><path class="st" d="M44 56L66 56"/><path class="st" d="M61.9 53.2L66 56L61.9 58.8"/><rect class="fa" x="68" y="44" width="26" height="24" rx="4"/><rect class="st" x="94" y="44" width="16" height="24" rx="4"/><circle class="fk" cx="102" cy="56" r="2.5"/><path class="st" d="M102 56L124 56"/><path class="st" d="M119.9 53.2L124 56L119.9 58.8"/><rect class="fa" x="126" y="44" width="26" height="24" rx="4"/><rect class="st" x="152" y="44" width="16" height="24" rx="4"/><circle class="fk" cx="160" cy="56" r="2.5"/><path class="st" d="M160 56L180 56"/><path class="st" d="M175.9 53.2L180 56L175.9 58.8"/><circle class="st" cx="190" cy="56" r="7"/><path class="st" d="M185.1 60.9L194.9 51.1"/>
```

Deleting a node means rewriting its predecessor's `next`. The head has no predecessor, so a plain delete needs a branch just for it, and every branch is a place for a bug. The ==dummy== removes the branch: put one placeholder node in front of the real head, do all the surgery in terms of it, and return `dummy.next` at the end. Now every real node has a node before it, and the head case is the general case.

```code solution "Delete every copy of a value"
```

Notice where the walker stands. It stands on `prev` and **inspects `prev.next`**: it removes what is ahead of it, never what it is on, because only the node before can be rewired to skip it. That stance also settles when to move on. After a splice, `prev.next` is a node nobody has looked at yet, so the walker stays put and only the else branch advances.

```widget #dummy "Delete every 7, from a dummy"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```

The same dummy also anchors a list you **build**. Keep a `tail` starting on the dummy, and for each node you attach write `tail.next = node`, then `tail = node`. The dummy gave the first attached node a `next` to be written into, and `dummy.next` is the new list's head. Merging two sorted lists is exactly this.

## Advancing after a splice {#trap}

```vig "A walker hopping straight onto a node that a splice has just pulled into reach, without inspecting it"
<circle class="fa" cx="30" cy="66" r="8"/><circle class="st" cx="84" cy="66" r="8" stroke-dasharray="3 3"/><circle class="fr" cx="138" cy="66" r="8"/><circle class="fa" cx="192" cy="66" r="8"/><path class="st" d="M149 66L181 66"/><path class="st" d="M176.9 63.2L181 66L176.9 68.8"/><path class="st" d="M36 76Q84 108 131 77"/><path class="st" d="M126 76.9L131 77L129.1 81.6"/><path class="sc" d="M30 52Q84 8 136 52" stroke-dasharray="4 4"/><path class="sc" d="M134.7 47.2L136 52L131 51.5"/>
```

The second classic list bug sits in that one `else`. Advance on every pass, splice or not, and the walker steps over the node the splice just pulled into view:

```widget #trapper "[7,7,3], delete 7, two ways"
<div class="extabs" role="group" aria-label="Choose a version"></div><div class="lvhost"></div>
```

````warn
Advance only when nothing was spliced. A walker that always advances skips the node a splice pulls in: on [7,7,3], deleting 7 leaves [7,3], and when the last node is deleted it steps onto null and reads `null.next`, an `AttributeError` in Python and a `TypeError` in TypeScript. Tests that delete a single, non-final value pass, which is how this ships.

```code mistake "Advancing after a splice"
```
````

## Reversal, runners and gaps {#walk}

```vig "Three small chains: one with its arrows flipped backwards, one with a slow and a fast marker, one with two markers a fixed gap apart"
<circle class="fa" cx="30" cy="16" r="5"/><circle class="fa" cx="70" cy="16" r="5"/><circle class="fa" cx="110" cy="16" r="5"/><circle class="fa" cx="150" cy="16" r="5"/><circle class="fa" cx="190" cy="16" r="5"/><path class="sc" d="M62 16L38 16"/><path class="sc" d="M42.1 18.8L38 16L42.1 13.2"/><path class="sc" d="M102 16L78 16"/><path class="sc" d="M82.1 18.8L78 16L82.1 13.2"/><path class="sc" d="M142 16L118 16"/><path class="sc" d="M122.1 18.8L118 16L122.1 13.2"/><path class="sc" d="M182 16L158 16"/><path class="sc" d="M162.1 18.8L158 16L162.1 13.2"/><circle class="fa" cx="30" cy="58" r="5"/><circle class="fa" cx="70" cy="58" r="5"/><circle class="fa" cx="110" cy="58" r="5"/><circle class="fa" cx="150" cy="58" r="5"/><circle class="fa" cx="190" cy="58" r="5"/><path class="st" d="M38 58L62 58"/><path class="st" d="M57.9 55.2L62 58L57.9 60.8"/><path class="st" d="M78 58L102 58"/><path class="st" d="M97.9 55.2L102 58L97.9 60.8"/><path class="st" d="M118 58L142 58"/><path class="st" d="M137.9 55.2L142 58L137.9 60.8"/><path class="st" d="M158 58L182 58"/><path class="st" d="M177.9 55.2L182 58L177.9 60.8"/><polygon class="fc" points="104,38 116,38 110,49"/><polygon class="fk" points="184,38 196,38 190,49"/><circle class="fa" cx="30" cy="100" r="5"/><circle class="fa" cx="70" cy="100" r="5"/><circle class="fa" cx="110" cy="100" r="5"/><circle class="fa" cx="150" cy="100" r="5"/><circle class="fa" cx="190" cy="100" r="5"/><path class="st" d="M38 100L62 100"/><path class="st" d="M57.9 97.2L62 100L57.9 102.8"/><path class="st" d="M78 100L102 100"/><path class="st" d="M97.9 97.2L102 100L97.9 102.8"/><path class="st" d="M118 100L142 100"/><path class="st" d="M137.9 97.2L142 100L137.9 102.8"/><path class="st" d="M158 100L182 100"/><path class="st" d="M177.9 97.2L182 100L177.9 102.8"/><polygon class="fc" points="24,80 36,80 30,91"/><polygon class="fk" points="144,80 156,80 150,91"/>
```

Three more moves cover the rest of the module, and each has a problem lesson of its own. Here they are side by side, each run on a real list with its invariant checked on every settled step.

- **Three-pointer reversal.** Flipping `curr.next` destroys the only pointer to the rest of the list, unless it was saved first. So the walk holds three names: save `nxt = curr.next`, flip `curr.next = prev`, march both on. At every step `prev` heads the reversed part and `curr` the untouched rest.
- **Fast and slow.** One walker moves two nodes for each one the other moves. When the fast one runs out, the slow one is in the middle; on a list with a cycle the fast one never runs out, and it laps the slow one until they meet. Its loop must guard both hops, `fast and fast.next`, because `fast.next.next` reads two nodes ahead.
- **A gap of n.** Two walkers at the same speed, the lead n nodes ahead. When the lead reaches the end, the trailer is n from the end, with no length ever counted. Starting both on a dummy puts the trailer on the predecessor, ready to splice.

```widget #moves "Three moves, run on real lists"
<div class="extabs" role="group" aria-label="Choose a move"></div><div class="lvhost"></div><p class="cost-note" id="movesNote"></p>
```

## Rewire, don't copy {#insight}

```vig "Two rows of nodes that stay where they are while one pointer is re-aimed from the upper row to the lower"
<circle class="fa" cx="40" cy="30" r="8"/><circle class="fa" cx="100" cy="30" r="8"/><path class="st" d="M51 30L89 30"/><path class="st" d="M84.9 27.2L89 30L84.9 32.8"/><circle class="fa" cx="160" cy="30" r="8"/><path class="st" d="M112 30L148 30" stroke-dasharray="3 3"/><circle class="fa" cx="80" cy="84" r="8"/><circle class="fa" cx="140" cy="84" r="8"/><circle class="fa" cx="200" cy="84" r="8"/><path class="st" d="M91 84L129 84"/><path class="st" d="M124.9 81.2L129 84L124.9 86.8"/><path class="st" d="M151 84L189 84"/><path class="st" d="M184.9 81.2L189 84L184.9 86.8"/><path class="sc" d="M105 40L133 74"/><path class="sc" d="M132.6 69L133 74L128.2 72.6"/>
```

The deepest habit in this module is that linked-list algorithms ==never move data==: they aim pointers. Merging two sorted lists does not copy values into new nodes; it links the existing nodes into a new order. Reversing, partitioning, rotating and removing are all rewires. Each of the four moves above is a rule about which pointer to rewrite and in what order, and each one's invariant says what is true between rewrites.

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

```vig "Four boxes and their arrows sketched in a row, with a magnifier held over one link"
<rect class="st" x="14" y="60" width="34" height="22" rx="4"/><rect class="st" x="70" y="60" width="34" height="22" rx="4"/><rect class="st" x="126" y="60" width="34" height="22" rx="4"/><rect class="st" x="182" y="60" width="34" height="22" rx="4"/><path class="st" d="M50 71L68 71"/><path class="st" d="M63.9 68.2L68 71L63.9 73.8"/><path class="st" d="M106 71L124 71"/><path class="st" d="M119.9 68.2L124 71L119.9 73.8"/><path class="st" d="M162 71L180 71"/><path class="st" d="M175.9 68.2L180 71L175.9 73.8"/><circle class="st" cx="115" cy="71" r="21"/><path class="sc" d="M130 86L148 104"/>
```

Three habits catch most pointer bugs before they run.

1. **Draw it.** Four boxes and their arrows on paper beat ten minutes of staring at code. Every walkthrough in this module is that drawing, done for you.
2. **Check the boundary trio:** the empty list, a single node, and an edit at either end. Pointer bugs live at the boundaries, where a pointer you would normally rewrite is missing.
3. **State the invariant** of every loop. "prev heads the reversed part" catches a swapped assignment at once; checking that each line keeps it true is what the walkthroughs' invariant panel does.

## Where next {#next}

```vig "Three sketches: arrows turned to face backwards, a fast and a slow marker on one chain, and a chain that loops back on itself"
<circle class="fa" cx="14" cy="20" r="7"/><circle class="fa" cx="50" cy="20" r="7"/><circle class="fa" cx="86" cy="20" r="7"/><path class="sc" d="M42 20L22 20"/><path class="sc" d="M26.1 17.2L22 20L26.1 22.8"/><path class="sc" d="M78 20L58 20"/><path class="sc" d="M62.1 17.2L58 20L62.1 22.8"/><circle class="fa" cx="14" cy="64" r="6"/><circle class="fa" cx="38" cy="64" r="6"/><circle class="fa" cx="62" cy="64" r="6"/><circle class="fa" cx="86" cy="64" r="6"/><circle class="fa" cx="110" cy="64" r="6"/><polygon class="fc" points="33,44 43,44 38,55"/><polygon class="fk" points="81,44 91,44 86,55"/><circle class="fa" cx="150" cy="56" r="7"/><circle class="fa" cx="182" cy="56" r="7"/><circle class="fa" cx="214" cy="36" r="7"/><circle class="fa" cx="214" cy="80" r="7"/><path class="st" d="M157 56L175 56"/><path class="st" d="M187.9 52.3L208.1 39.7"/><path class="st" d="M214 43L214 73"/><path class="st" d="M208.4 75.8L187.6 60.2"/>
```

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

```vig "Three questions as rows, the first one answered and ticked"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

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
