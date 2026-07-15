#!/usr/bin/env python3
"""Insert teaching depth blocks before ### Summary when a pattern is under 800 words."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAM = ROOT / "part-2-pattern-families"

# Keyed by ## heading. Inserted immediately before ### Summary.
BLOCKS: dict[str, str] = {
    "Sliding Window": """
### Depth Note — One Pass Enter and Leave

Remember the contract: every index enters the window at most once and leaves
at most once. That is why a nested `while` shrink is still O(n). Keep a small
state object (counts, distinct tally, sum) that you update in O(1) or O(alphabet)
per move.

Fixed-K warmups train the muscle without a complex validity rule: add right,
remove `right-K`, refresh best. Variable windows add the `while invalid: left++`
loop. Minimum covering windows update the answer only while valid after each
shrink. If negatives break monotonic shrink logic, leave this chapter for
Prefix Sum.
""",
    "Fast & Slow Pointers": """
### Depth Note — Meetup Math Without Fear

You do not need a formal proof in interviews, but you should narrate: if a
cycle exists, the faster runner closes the gap one step per turn inside the
loop and must meet. For the entrance, resetting one pointer to head equalizes
the remaining distance into the loop. Middle-finding is the same two-speed walk
with a null stop instead of a meetup stop.

Find the Duplicate Number models `i → nums[i]` as a functional graph with one
cycle; Fast & Slow finds it in O(1) extra space. That is why it is Hard owned
here, not a casual sort+scan Easy.
""",
    "Linked List Pointer Manipulation": """
### Depth Note — Dummy Heads and Bridges

Dummy (sentinel) nodes erase special cases at the real head. Merge, remove,
and rotate almost always get simpler with `dummy.next = head` and returning
`dummy.next`. For k-group reverse, keep an explicit bridge pointer to the node
before the group; after reverse, reconnect `bridge.next` to the new group head
and move the bridge to the group’s new tail.

Interviewers listen for “I saved next before rewiring.” Say it. Draw it. Then
code it.
""",
    "Sorting": """
### Depth Note — Ordering as a Move

Sorting is not “implement quicksort.” Interviews mean: **pay once to create
order**, then finish with a simple walk. Anagrams become sorted-key grouping.
Meeting conflicts become “sort by start, check overlaps.” Closest pair sum on
a row becomes sort then two pointers. The Dutch National Flag three-way
partition is a niche in-place Arrays callout when values are only `{0,1,2}` —
it is **not** the identity of this pattern.

Worked sketch — Merge Intervals after ordering. Sort intervals by start. Keep
an answer stack; if the next interval starts before the last ends, extend the
end; else push a new block. The bottleneck you killed is “compare every pair
of intervals.” Order made neighbors the only candidates that matter.

Reach for Sorting when a nested pair scan only needed local order. Reach for
Binary Search answer-space when you are guessing a numeric threshold. Reach for
Sweep Line when concurrency events (starts and ends) need a counter, not just
merge-after-sort.
""",
    "Binary Search": """
### Depth Note — Index Search and Answer Space

Binary search is “guess the middle, throw away half.” Two interview flavors:

1. **Index search** on a sorted row — classic left/right until you find the
   target or the insertion spot.
2. **Answer-space search** — the row is not sorted, but a yes/no predicate is
   monotonic on a numeric range (Koko eating bananas, minimize max page load).

Koko sketch: bananas piles, hours `h`. Guess speed `mid`. If Koko finishes in
`≤ h` hours with that speed, try slower; else go faster. The bottleneck of
trying every speed from 1 to max(pile) dies because the feasibility check is
monotone.

Common trap: off-by-one on inclusive bounds, or searching indexes when you
should search the answer. Say which space you search before coding.
""",
    "Intervals": """
### Depth Note — Merge, Insert, Overlap

Intervals are calendar blocks. Naive “every block vs every other block” is the
bottleneck. After sorting by start, one scan merges overlaps. Insert Interval:
merge the new block into the sorted stream while copying non-overlapping left
and right sides.

Non-overlapping intervals / erase overlaps: sort by end, greedily keep the next
compatible block — that drill dual-homes with Greedy, but the data shape is
still intervals.

Kid analogy: stack sticky notes on a timeline; if the next note overlaps the
top note, stretch the top instead of adding a new sticker.
""",
    "Sweep Line": """
### Depth Note — Events and a Counter

Sweep line turns ranges into start/end events on a line. Sort events; walk left
to right; maintain an active-count. Meeting Rooms II: start = +1, end = −1
(process ends before starts at the same time if rooms free instantly). Peak
count = rooms needed.

This is not “merge intervals.” Merge collapses blocks; sweep measures peak
concurrency or coverage. Graphics and calendars both “walk the line” with an
active set.

Easy warmup honesty: you can practice with counting overlapping segments on a
number line after sorting events — same muscle as Meeting Rooms II.
""",
    "DFS": """
### Depth Note — Recurse Into Neighbors

DFS (depth-first search) means: explore one path as far as it goes before
backtracking to the next branch. On a grid, flood-fill an island by recursing
to four neighbors and marking visited. On a graph, recurse through the
adjacency list.

Bottleneck of nested “scan whole grid for each land cell”: you re-walk water.
DFS (or BFS) marks visited once so each cell pays work once.

Path problems (unique paths with obstacles, path sum in trees) are DFS with a
running state. Graph representation lives in Graph Traversal; this chapter owns
the recursive walk template: `visit → for neighbor: if not seen: dfs(neighbor)`.
""",
    "Tree Traversals": """
### Depth Note — Preorder, Inorder, Postorder

Trees are graphs without cycles and with a root. Traversal order is the ticket:

- **Preorder** — node, then left, then right (serialize / copy shape)
- **Inorder** — left, node, right (BST yields sorted values)
- **Postorder** — left, right, node (delete children before parent)

Naive “I forgot which order” is the bottleneck behind wrong BST validations.
Level-order is BFS with a queue — see Family 6 / Queue — not a recursive
preorder cousin.

Worked BST: inorder walk proves sortedness; a violate means not a BST.
""",
    "Divide and Conquer": """
### Depth Note — Split, Solve, Merge

Divide and Conquer splits a problem into independent halves, solves each, then
merges answers. Merge Sort: split array, sort halves, merge two sorted runs.
Maximum subarray (Kadane is DP; classic D&C also splits mid and tracks best
crossing sum).

Bottleneck: solving the whole at once when halves share almost no dependency
except a cheap merge. Different from DP (overlapping subproblems). Different
from pure DFS (no “merge step” of two solved halves).

Kid analogy: two teams sort their half of the toys; one adult zips the two
sorted piles into one — merge step.
""",
    "Backtracking": """
### Depth Note — Choose, Explore, Undo

Backtracking builds candidates one choice at a time. When a choice fails
constraints, **undo** and try the next. Permutations, subsets, N-Queens, Word
Search: the template is identical — choose → recurse → un-choose.

Bottleneck: generating every full arrangement into a giant list when pruning
could have stopped early. Also missing the undo step so later branches see
stale state.

Easy warmups that are truly Easy: subsets of a short distinct array; letter
case permutations. Sudoku / N-Queens are Hard because the constraint board is
dense.

Kid analogy: packing a backpack for a trip — try an item, see if the rest
still fits; if not, take it out (undo) and try another.
""",
    "BFS": """
### Depth Note — Layers and Multi-Source

BFS (breadth-first search) explores a graph ring by ring with a queue. First
time you reach a node in an unweighted graph is the fewest hops. Multi-source
BFS enqueues every source at distance 0 (rotten oranges, gates and walls).

Bottleneck of rescanning the whole grid each “minute”: mark visited (or rotten)
as you enqueue so each cell enters the queue once.

Never claim BFS finds shortest paths on positive weighted edges — that is
Dijkstra. Binary tree level order is BFS on a tree; Queue chapter owns the
pipeline mechanic, BFS owns the “distance rings” story.
""",
    "Graph Traversal": """
### Depth Note — Representation and Choosing a Walk

Own three things here:

1. **Representation** — adjacency list (`map: node → neighbors`) for sparse
   graphs; matrix when dense or grid-as-graph.
2. **Visited hygiene** — mark when you first enter a node (or color states) so
   cycles do not loop forever.
3. **Choose BFS vs DFS** — need fewest hops / layers → BFS; need full component
   flood, topo recursion, or path-building with undo → DFS / Backtracking.

Worked choice: Word Ladder (fewest transforms) → BFS on an implicit graph.
Number of islands → DFS or BFS flood; either walk works; representation is the
grid itself. Course Schedule cycle detect can be DFS colors or Kahn BFS —
picking either is fine if you justify visited/ indegree discipline.

This is NOT a redirect memo. Templates for queue/recursion walks live in BFS
and DFS chapters; you still must build adj lists and pick the walk here.
""",
    "Union Find (Disjoint Set)": """
### Depth Note — Union and Path Compression

Union Find tracks blobs of connected items. `find(x)` returns the boss of x’s
blob; `union(a,b)` merges two blobs. Path compression: after find, point nodes
straight at the boss so later finds are tiny. Union by rank/size keeps trees
flat.

Island / accounts merge / redundant connection: each edge is a union; a union
of already-same bosses means a redundant edge.

Kid analogy: kids form friend groups; when two groups shake hands, they share
one group captain. Path compression is everyone pointing at the real captain
after roll call.
""",
    "Topological Sort": """
### Depth Note — Kahn and Cycles

Topological sort orders tasks so every directed edge goes forward (prereqs
before courses). Kahn’s algorithm: queue nodes with indegree 0; peel them;
decrease neighbors’ indegrees; if you cannot peel all nodes, a cycle exists.

Easy warmups honestly include “course schedule connectivity lite” or building
indegrees from a tiny edge list — the Medium classics are Course Schedule I/II.

DFS color-states (white/gray/black) also detect cycles; Kahn is often clearer
in interviews because the queue of ready nodes matches “what can I take next.”
""",
    "Dijkstra": """
### Depth Note — Relax and Settle

Dijkstra finds shortest paths with **non-negative** edge weights. Keep best
known distance to each node. Pop the unsettled node with smallest distance
(priority queue). Then **relax** each edge: if `dist[u] + w(u,v) < dist[v]`,
update `dist[v]`. Once popped, a node is **settled** — with non-negative
weights, that distance is final.

Naive idea: explore every path with costs (exponential) or repeatedly scan all
edges without a priority (slow). Do **not** pretend Bellman-Ford is “the naive
version” unless you teach its all-edges |V|−1 relax pass.

Honest Easy prep: shortest path on a tree with edge weights (unique path —
just walk) or Path with Minimum Effort warmer intuition. Network Delay Time is
Medium Dijkstra, not Easy.
""",
    "Minimum Spanning Tree": """
### Depth Note — Kruskal with Union Find

An MST connects all nodes with minimum total edge weight and no cycles.
Kruskal: sort edges by weight ascending; add an edge if its ends are in
different Union-Find blobs; stop when you have `n-1` edges.

Prim grows a tree from one seed with a priority queue — dual flavor. Easy prep
can be Union-Find connectivity warmups labeled as prep, then Min Cost to
Connect All Points as the real MST drill.

Kid analogy: connect island towns with cheapest roads first, skipping a road
that would loop back into an already connected blob.
""",
    "Stack": """
### Depth Note — Last In, First Out

A stack is a springy plate pile: last plate down is first plate up. Valid
parentheses: push openers; on a closer, pop and match. Decode String / basic
calculator: push nesting frames so inner work finishes before outer work.

Bottleneck of nested scanning with indexes: you lose the “most recent open”
context. The stack remembers it.

Queues are first-in-first-out; monotonic stacks keep values increasing/decreasing
for next-greater — different chapters even though both use a stack shell.
""",
    "Queue": """
### Depth Note — First In, First Out

A queue is a lunch line: first in, first out. Tree/graph level order is the
interview classic — enqueue root; while queue non-empty, drain one level’s
worth of nodes (or drain until empty while tracking size).

BFS owns the “shortest unweighted distance” story; this chapter owns the data
structure and the level-size loop. Sliding windows sometimes use deques (double
ended queues) for max — see Monotonic Stack / Window Maximum.

Easy: Implement Queue using Stacks; number of recent calls in a counter queue.
""",
    "Heap / Priority Queue": """
### Depth Note — Top K Frequent Template

A heap keeps the extreme (min or max) at the front. Interview king path — **Top
K Frequent Elements**:

1. Hash map: count frequencies.
2. Keep a **size-K min-heap** of `(freq, key)` (or max-heap of size n — less common).
3. For each key, push; if heap size > K, pop the smallest frequency.
4. Remaining heap entries are the Top K.

“K largest numbers” is the same muscle with values instead of frequencies.
Merge k sorted lists: heap of current heads. Do not stop the Generic Template
at “push all, pop K” when frequency ranking is the real lesson — **count map
first, then sized heap**.
""",
    "Monotonic Stack": """
### Depth Note — Next Greater and Histogram

A monotonic stack stays strictly increasing or decreasing so the top always
answers “previous / next greater or smaller.” Daily Temperatures: indices of
warmer days — while stack top is cooler than today, pop and label distance.

Largest Rectangle in Histogram: for each bar, know first shorter bar left and
right; width = right−left−1; area = height×width. Same mono stack of indices.

This is not Valid Parentheses (plain Stack). Name the invariant (“stack
values increasing”) before coding.
""",
    "Trie": """
### Depth Note — Prefix Trees

A Trie (prefix tree) stores strings character-by-character in a tree of maps.
`startsWith` is a walk that must not fall off the tree; `search` also checks
an end-of-word flag. Word Search II / autocomplete: heavy prefix sharing makes
tries beat scanning a whole dictionary each time.

Recognition: many queries on shared prefixes, not a single hash of full words
only. Implementing Trie is the Easy/Medium doorway; Word Search II is the Hard
payoff.
""",
}


def word_count(section: str) -> int:
    prose = re.sub(r"```.*?```", "", section, flags=re.S)
    return len(prose.split())


def main() -> None:
    for path in sorted(FAM.glob("family-*.md")):
        text = path.read_text(encoding="utf-8")
        matches = list(re.finditer(r"(?m)^## (.+)$", text))
        pieces = []
        changed = False
        for i, m in enumerate(matches):
            title = m.group(1).strip()
            start = m.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            section = text[start:end]
            if title in BLOCKS and word_count(section) < 800:
                block = BLOCKS[title].strip() + "\n\n"
                if "### Depth Note" in section:
                    pieces.append(section)
                    continue
                if "### Summary" not in section:
                    pieces.append(section)
                    continue
                section = section.replace("### Summary", block + "### Summary", 1)
                changed = True
                print(
                    f"injected into {path.name} / {title} -> ~{word_count(section)} words"
                )
            pieces.append(section)
        # rebuild: prefix before first ## + sections
        prefix = text[: matches[0].start()] if matches else text
        new_text = prefix + "".join(pieces)
        if changed:
            path.write_text(new_text, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
