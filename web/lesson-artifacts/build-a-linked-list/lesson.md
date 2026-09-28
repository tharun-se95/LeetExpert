---
title: "Build a Linked List From Scratch"
kicker: "Build a Linked List From Scratch · Linked Lists module · concept lesson"
headline: "How do you keep a list in order when nothing sits next to anything?"
lede: "A file on a busy disk rarely gets one unbroken run of blocks. The FAT file system stores it as a chain instead: each block's entry names the block that comes next, and the directory remembers only the first. That chain is a linked list. Building one by hand shows exactly which pointer every operation has to rewrite, and which ones are easy to forget."
chips:
  - "needs **two fields per node**"
  - "keeps **head, tail, size**"
  - "time **O(1) at the ends**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroDisk" viewBox="0 0 560 300" role="img" aria-label="Animation: five blocks of one file sit at scattered addresses on a disk. Below them the same blocks form a chain in file order, each naming the next block's address. A reader follows the chain from the head, and each block it reads lights up at its scattered place on the disk."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">blocks</span> read</div><div id="heroCap"></div></div></div></div>
---

## The node, then the list {#node}

```vig "Three nodes, each a value and a next reference, chained left to right and ending in an empty reference"
<rect class="fa" x="10" y="44" width="26" height="24" rx="4"/><rect class="st" x="36" y="44" width="16" height="24" rx="4"/><circle class="fk" cx="44" cy="56" r="2.5"/><rect class="fa" x="68" y="44" width="26" height="24" rx="4"/><rect class="st" x="94" y="44" width="16" height="24" rx="4"/><circle class="fk" cx="102" cy="56" r="2.5"/><rect class="fa" x="126" y="44" width="26" height="24" rx="4"/><rect class="st" x="152" y="44" width="16" height="24" rx="4"/><circle class="fk" cx="160" cy="56" r="2.5"/><path class="st" d="M44 56L66 56"/><path class="st" d="M61.9 58.8L66 56L61.9 53.2"/><path class="st" d="M102 56L124 56"/><path class="st" d="M119.9 58.8L124 56L119.9 53.2"/><path class="st" d="M160 56L180 56"/><path class="st" d="M175.9 58.8L180 56L175.9 53.2"/><circle class="st" cx="188" cy="56" r="7"/><path class="st" d="M183 61L193 51"/>
```

A node is two fields: the value it stores, and `next`, a reference to the node after it. The last node's `next` is empty (`None` in Python, `null` in TypeScript, drawn here as ∅). A node knows nothing about the nodes before it, only the one after.

The list itself is a small wrapper around the chain. It keeps three fields: `head`, the first node, which is the only way in; `tail`, the last node, kept so adding at the end does not need a walk; and `size`, the number of nodes, kept so counting does not need one either.

```rosetta "The code, read as a file on disk"
In the code | On the disk
`Node` | one block of the file, wherever the disk had room for it
`value` | the data stored in that block
`next` | the table entry naming the block that comes next
`None` / `null` | the end-of-chain marker: no block follows
`head` | the directory entry: the file's first block
`tail` | the file's last block, remembered so appending skips the walk
`size` | how many blocks the file uses
```

Keeping `tail` and `size` is not free. They are promises the list makes about itself, and every method that changes the chain has to keep them true. There are three:

```key
Three invariants: following next from head reaches every node and ends at null; tail is the last of those nodes (null only when the list is empty); size is how many there are.
```

## Build it, one pointer at a time {#build toc="Build it"}

```vig "A list with a new node above it, its next reference about to point at the old head"
<rect class="fa" x="64" y="66" width="26" height="24" rx="4"/><rect class="st" x="90" y="66" width="16" height="24" rx="4"/><circle class="fk" cx="98" cy="78" r="2.5"/><rect class="fa" x="118" y="66" width="26" height="24" rx="4"/><rect class="st" x="144" y="66" width="16" height="24" rx="4"/><circle class="fk" cx="152" cy="78" r="2.5"/><rect class="fa" x="172" y="66" width="26" height="24" rx="4"/><rect class="st" x="198" y="66" width="16" height="24" rx="4"/><circle class="fk" cx="206" cy="78" r="2.5"/><path class="st" d="M98 78L116 78"/><path class="st" d="M111.9 80.8L116 78L111.9 75.2"/><path class="st" d="M152 78L170 78"/><path class="st" d="M165.9 80.8L170 78L165.9 75.2"/><rect class="fk" x="10" y="14" width="26" height="24" rx="4"/><rect class="st" x="36" y="14" width="16" height="24" rx="4"/><circle class="fk" cx="44" cy="26" r="2.5"/><path class="sc" stroke-dasharray="4 4" d="M44 26C56 26 70 42 76 60"/><path class="sc" d="M68 57L76 62L78 53"/>
```

Here is a real list, drawn from its actual pointers. Push values onto either end, or click a node to delete its value. Each operation plays one pointer write at a time, and the panel under it checks the three invariants against the pointers themselves, not against what the list claims.

```widget #play "Build it: every pointer write, one at a time"
<div class="actions"><button type="button" class="btn2 best" id="pf"></button><button type="button" class="btn2" id="pb"></button><button type="button" class="btn2" id="rs">Reset</button><span class="lv-hint" id="playHint">or click a node to delete it</span></div>
<div class="lvhost"></div>
```

Watch the invariants while an operation runs. Part way through <span class="c-py">`push_front`</span><span class="c-ts">`pushFront`</span>, `head` already points at the new node but `size` has not caught up, so the count is briefly wrong. That is allowed: an invariant only has to hold when a method returns, because in single-threaded code nothing else can look at the list in the middle of a call. The panel marks those moments as mid-operation instead of calling them broken.

Both pushes are a fixed handful of pointer writes, whatever the length of the list, so both are O(1). Two branches deserve attention. When the list is empty there is no old tail to link onto, so the new node becomes head and tail at once. That branch exists because the pointer the normal path writes, `tail.next`, does not exist yet.

```code solution "The whole class"
```

## Find and delete: walking in pairs {#walk toc="The pair walk"}

```vig "A chain of nodes with two markers above neighbouring nodes, one trailing the other"
<rect class="fa" x="10" y="56" width="26" height="24" rx="4"/><rect class="st" x="36" y="56" width="16" height="24" rx="4"/><circle class="fk" cx="44" cy="68" r="2.5"/><rect class="fa" x="68" y="56" width="26" height="24" rx="4"/><rect class="st" x="94" y="56" width="16" height="24" rx="4"/><circle class="fk" cx="102" cy="68" r="2.5"/><rect class="fa" x="126" y="56" width="26" height="24" rx="4"/><rect class="st" x="152" y="56" width="16" height="24" rx="4"/><circle class="fk" cx="160" cy="68" r="2.5"/><path class="st" d="M44 68L66 68"/><path class="st" d="M61.9 70.8L66 68L61.9 65.2"/><path class="st" d="M102 68L124 68"/><path class="st" d="M119.9 70.8L124 68L119.9 65.2"/><path class="st" d="M160 68L180 68"/><path class="st" d="M175.9 70.8L180 68L175.9 65.2"/><circle class="st" cx="188" cy="68" r="7"/><path class="st" d="M183 73L193 63"/><polygon class="fc" points="17,30 29,30 23,41"/><polygon class="fk" points="75,30 87,30 81,41"/>
```

```duo
Finding a value means walking from `head`, one `next` at a time, until the value turns up or the walk falls off the end. There is no shortcut: a node's position in memory says nothing about its position in the list, so reaching the k-th node costs k steps. Find is O(n).

Deleting is harder, and the reason is a property of the chain. To remove a node you rewrite the `next` of the node *before* it, so that it skips over the one being removed. But a node has no reference to the node before it. By the time the walk is standing on the node to delete, it is too late to reach back. So delete walks two references in step: `curr`, the node being examined, and `prev`, the one before it.

The four delete cases split on two questions. Is `prev` empty? Then the node is the head, and it is `head` that must skip ahead, not a `next`. Is `curr` the tail? Then `tail` must move back to `prev`. Finding the node is O(n); once it is found, the splice is at most two pointer writes and a change to `size`.
---
<div class="widget navy" id="walker"><div class="wl">Walk the pair</div><div class="extabs" role="group" aria-label="Choose an operation"></div><div class="lvhost"></div></div>
```

## The forgotten tail {#trap}

```vig "A list whose tail marker still points at a node that has been cut away, drawn dashed and detached"
<rect class="fa" x="10" y="34" width="26" height="24" rx="4"/><rect class="st" x="36" y="34" width="16" height="24" rx="4"/><circle class="fk" cx="44" cy="46" r="2.5"/><rect class="fa" x="68" y="34" width="26" height="24" rx="4"/><rect class="st" x="94" y="34" width="16" height="24" rx="4"/><circle class="fk" cx="102" cy="46" r="2.5"/><path class="st" d="M44 46L66 46"/><path class="st" d="M61.9 48.8L66 46L61.9 43.2"/><path class="st" d="M102 46L128 46"/><path class="st" d="M123.9 48.8L128 46L123.9 43.2"/><rect class="st" x="134" y="34" width="42" height="24" rx="4" stroke-dasharray="3 3"/><circle class="fr" cx="166" cy="46" r="2.5"/><circle class="fr" cx="155" cy="96" r="6"/><path class="st" d="M155 88L155 64"/><path class="st" d="M158.4 69L155 64L151.6 69"/><circle class="st" cx="210" cy="46" r="7"/><path class="st" d="M205 51L215 41"/>
```

```duo
The branch that moves `tail` back when the tail is deleted is the one most often left out, and leaving it out does not crash anything. Delete the last node without it and `tail` still points at the node that was just removed, a node nothing reachable from `head` leads to. The damage waits for the next append: <span class="c-py">`push_back`</span><span class="c-ts">`pushBack`</span> trusts `tail`, links the new node onto that removed node, and the new value is gone without an error.
---
<div class="widget navy" id="trapper"><div class="wl">Delete the tail, then append</div><div class="extabs" role="group" aria-label="Choose a version"></div><div class="lvhost"></div></div>
```

````warn
Deleting the tail must move `tail` back to `prev`. Without that line, deleting 12 from 7 → 3 → 12 and then appending 5 leaves a list whose walk from head is 7 → 3 while `size` is 3: both runtimes lose the 5, and nothing raises an error.

```code mistake "The delete that forgets the tail"
```
````

## The special cases are the lesson {#insight toc="The special cases"}

```vig "Three small lists at their boundaries: an empty one, one losing its head, one losing its tail"
<circle class="st" cx="30" cy="56" r="7"/><path class="st" d="M25 61L35 51"/><rect class="fr" x="64" y="44" width="26" height="24" rx="4"/><rect class="st" x="90" y="44" width="12" height="24" rx="4"/><path class="st" d="M102 56L118 56"/><path class="st" d="M113.9 58.8L118 56L113.9 53.2"/><rect class="fa" x="122" y="44" width="26" height="24" rx="4"/><rect class="fa" x="170" y="44" width="26" height="24" rx="4"/><rect class="st" x="196" y="44" width="12" height="24" rx="4"/><path class="st" d="M208 56L214 56"/><path class="st" d="M209.9 58.8L214 56L209.9 53.2"/><rect class="fr" x="214" y="44" width="20" height="24" rx="4"/>
```

Count the branches in the class: an empty list in both pushes, deleting the head, deleting the tail. Each one sits at a boundary where the pointer the normal path rewrites does not exist.

```rosetta "Where each special case comes from"
The branch | The pointer that is missing
push to an empty list | there is no old tail whose `next` could be set, so head and tail are set directly
delete the head | there is no `prev`, so `head` itself skips ahead instead of `prev.next`
delete the tail | the node `tail` names is leaving, so `tail` must move back to `prev`
```

```key
Every special case in a linked list is a boundary where a pointer you would normally rewrite is missing. Find the boundaries and you have found the bugs.
```

The next lesson removes most of these branches with one trick: a dummy node that sits in front of the head and is never deleted. With it, every real node has a node before it, so deleting the head becomes an ordinary splice.

## What it costs {#cost}

```vig "Bars climbing a staircase for walking to the end on every append, beside a flat row for appending at a kept tail"
<path class="st" d="M10 100H118M130 100H230"/><rect class="fr" x="14" y="86" width="9" height="10" rx="2"/><rect class="fr" x="27" y="76" width="9" height="20" rx="2"/><rect class="fr" x="40" y="66" width="9" height="30" rx="2"/><rect class="fr" x="53" y="56" width="9" height="40" rx="2"/><rect class="fr" x="66" y="46" width="9" height="50" rx="2"/><rect class="fr" x="79" y="36" width="9" height="60" rx="2"/><rect class="fr" x="92" y="26" width="9" height="70" rx="2"/><rect class="fr" x="105" y="16" width="9" height="80" rx="2"/><rect class="fg" x="134" y="88" width="8" height="12" rx="2"/><rect class="fg" x="146" y="88" width="8" height="12" rx="2"/><rect class="fg" x="158" y="88" width="8" height="12" rx="2"/><rect class="fg" x="170" y="88" width="8" height="12" rx="2"/><rect class="fg" x="182" y="88" width="8" height="12" rx="2"/><rect class="fg" x="194" y="88" width="8" height="12" rx="2"/><rect class="fg" x="206" y="88" width="8" height="12" rx="2"/><rect class="fg" x="218" y="88" width="8" height="12" rx="2"/>
```

Keeping `tail` is what makes appending O(1). Without it, appending means walking from `head` to the last node every time. Appending to a list of k nodes visits all k of them, so appending n values one after another visits 0 + 1 + … + (n − 1) nodes in total, which is n(n − 1) / 2.

```mount #cost-facts
```

```widget "Nodes visited to append n values"
<div class="chart" id="cost-chart"></div><div class="legend"><span><i style="background:var(--r-ink)"></i>no tail: walk to the end each time</span><span><i style="background:var(--g-ink)"></i>with tail: link on directly</span></div><p class="cost-note" id="cost-note"></p>
```

Memory is the other cost, and big-O hides it. An array of numbers stores the numbers side by side. A linked list stores each number inside its own node, next to a reference to the following node, and each node is a separate allocation with its own bookkeeping. Both are O(n) space, but the list spends at least twice the slots per value, and its nodes are scattered, so reading them in order does not benefit from the cache the way an array does. A list earns its place where it splices: inserting or removing next to a node you already hold is O(1), which an array cannot do.

## Where next {#next}

```vig "Three sketches: arrows turned to face backwards, a fast and a slow marker on one chain, and a chain that loops back on itself"
<circle class="fa" cx="14" cy="20" r="7"/><circle class="fa" cx="50" cy="20" r="7"/><circle class="fa" cx="86" cy="20" r="7"/><path class="sc" d="M42 20L22 20"/><path class="sc" d="M26.1 17.2L22 20L26.1 22.8"/><path class="sc" d="M78 20L58 20"/><path class="sc" d="M62.1 17.2L58 20L62.1 22.8"/><circle class="fa" cx="14" cy="64" r="6"/><circle class="fa" cx="38" cy="64" r="6"/><circle class="fa" cx="62" cy="64" r="6"/><circle class="fa" cx="86" cy="64" r="6"/><circle class="fa" cx="110" cy="64" r="6"/><polygon class="fc" points="33,44 43,44 38,55"/><polygon class="fk" points="81,44 91,44 86,55"/><circle class="fa" cx="150" cy="56" r="7"/><circle class="fa" cx="182" cy="56" r="7"/><circle class="fa" cx="214" cy="36" r="7"/><circle class="fa" cx="214" cy="80" r="7"/><path class="st" d="M157 56L175 56"/><path class="st" d="M187.9 52.3L208.1 39.7"/><path class="st" d="M214 43L214 73"/><path class="st" d="M208.4 75.8L187.6 60.2"/>
```

The rest of the module reuses the moves on this page: rewriting a next pointer, and walking with more than one reference.

```variants
[
  {
    "title": "Pointer Surgery Patterns",
    "source": "next lesson",
    "text": "A dummy node in front of the head: every real node then has a node before it, so deleting the head becomes an ordinary splice and most branches here disappear."
  },
  {
    "title": "Reverse Linked List",
    "source": "problem",
    "text": "Turn every next pointer to face backwards, holding three references at once so no part of the list is lost halfway through the flip."
  },
  {
    "title": "Middle of the Linked List",
    "source": "problem",
    "text": "A fast reference moves two nodes for every one a slow reference moves. When the fast one reaches the end, the slow one is in the middle."
  },
  {
    "title": "Linked List Cycle",
    "source": "problem",
    "text": "The same two speeds detect a loop: if next ever leads back into the list, the fast reference laps the slow one and they meet."
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
      "question": "<code>delete</code> walks two references, <code>prev</code> and <code>curr</code>. Why not just <code>curr</code>?",
      "options": [
        "Removing curr means rewriting the next pointer of the node before it, and a singly linked list gives curr no way back to that node.",
        "Holding both lets the loop stop the moment it finds a match; with curr alone it would have to scan to the end before it could delete anything.",
        "prev keeps a count of the nodes visited so far, which delete needs so that it can lower size by the right amount when it removes a node."
      ],
      "answer": 0,
      "explanation": "The pointer that changes belongs to the node before the one being removed. From <code>curr</code> there is no way back to it, so the walk carries the predecessor along. A doubly linked list stores a <code>prev</code> in every node precisely to avoid this, and pays a second reference per node for it."
    },
    {
      "question": "A <code>delete</code> leaves out the tail branch. You delete the last node, then append 5. What happens?",
      "options": [
        "The append links 5 onto the removed node that tail still names. No walk from head reaches it, so 5 is lost with no error and size is one too high.",
        "The append raises an error at once, because tail points at a node that was deleted, and reading the next field of a deleted node fails on the spot.",
        "Nothing goes wrong: head still reaches every real node, and the append walks from head to find the end, so the stale tail is never actually used."
      ],
      "answer": 0,
      "explanation": "In Python and TypeScript a removed node is an ordinary object until nothing refers to it, and <code>tail</code> still refers to it, so no error is raised. The append trusts <code>tail</code>, which is the whole point of keeping it, and links the new node where no walk from <code>head</code> will ever arrive. The trap widget above runs exactly this sequence."
    },
    {
      "question": "Halfway through a push to the front, <code>head</code> already points at the new node but <code>size</code> has not been raised. Is the list broken at that moment?",
      "options": [
        "No. Invariants must hold whenever a method returns. Inside one they may briefly fail, since with one thread no other code can run mid-call.",
        "Yes. Every invariant has to hold after every single line, so size should be raised first, before the new node is created or linked into the list.",
        "No, because size is only a cache: the list recounts its nodes whenever size is read, so a stale value in the middle of a push is never seen."
      ],
      "answer": 0,
      "explanation": "An invariant is a promise about the list between operations. Some temporary break is unavoidable, since no single pointer write can move <code>head</code> and <code>size</code> together. What matters is that every method restores all three before it returns. In this class <code>size</code> is a stored field, never recounted, which is why forgetting to update it is a real bug."
    }
  ]
}
```

