#!/usr/bin/env python3
"""Third depth pass: interview dialogue blocks to clear the 800-word floor."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAM = ROOT / "part-2-pattern-families"

DIALOGUES: dict[str, str] = {
    "Sorting": """
### Interview Dialogue

Interviewer: “Merge these intervals.” You: “I’ll sort by start so neighbors are
the only intervals that can overlap, then one scan merges.” That sentence is
the whole pattern. If they ask whether you must write quicksort, say no —
library sort is fine; the insight is ordering as a move. Contrast: binary
searching the minimum shipping capacity is Answer-Space Binary Search, not this
chapter. Contrast: peak concurrent meetings needs start/end events — Sweep
Line. Keep Sorting for “order once, walk once” stories with duplicate
clustering, greedy-after-sort, and neighbor comparisons.
""",
    "Binary Search": """
### Interview Dialogue

Interviewer: “Koko eats bananas.” You: “I binary search the eating speed. Mid
is feasible if total hours ≤ h; feasibility is monotone so I can discard half
the speeds.” For rotated array search, say which half is sorted before you
discard. Off-by-one is the usual bug — write inclusive bounds and prove the
loop shrinks. Never claim binary search on unsorted pair-sum data without an
ordering story.
""",
    "Intervals": """
### Interview Dialogue

Interviewer: “Insert a new interval into a sorted list.” You: “Copy left
non-overlapping, merge through the overlap pocket, copy the right.” Draw three
zones on the board. If they change the question to “how many rooms,” switch
explicitly to Sweep Line. If they ask erase overlaps for max keep, sort by end
and greedily take — mention Greedy dual-home. Intervals own the geometry of
ranges; Sweep owns the event counter.
""",
    "Sweep Line": """
### Interview Dialogue

Interviewer: “Minimum meeting rooms.” You: “I’ll turn each meeting into a start
event (+1) and end event (−1), sort, and track the running active count. Peak
active is the answer.” Clarify end-before-start tie-breaking. This is not
merge intervals — you are measuring concurrency, not collapsing blocks.
Skyline and carpooling reuse the same event tape.
""",
    "DFS": """
### Interview Dialogue

Interviewer: “Count islands.” You: “Scan the grid; when I see land, DFS flood
to mark the whole component, then bump the count.” Mention visited (or sink to
water). For Clone Graph, show the old→new map. For path problems, carry state
down and return up. Point to Graph Traversal for adj-list construction, but
still walk a tiny example here so the chapter is not a stub.
""",
    "Tree Traversals": """
### Interview Dialogue

Interviewer: “Validate BST.” You: “Inorder should be strictly increasing,” or
“I’ll DFS with low/high bounds.” Name which traversal fits before coding.
Serialize often wants preorder with nulls; free/delete shape wants postorder.
Level averages want a queue — say Level Order / BFS out loud so you don’t force
recursion.
""",
    "Divide and Conquer": """
### Interview Dialogue

Interviewer: “Explain merge sort.” You: “Split until one element, then merge
two sorted runs with two fingers.” Emphasize the merge is where order is
reconstructed. If the problem only needs kth largest, pivot to Quickselect /
Heap instead of full sort merge. D&C shines when halves are independent and
merge is cheap relative to n log n.
""",
    "Backtracking": """
### Interview Dialogue

Interviewer: “Generate permutations.” You: “I’ll choose an unused index, mark
it used, recurse, then unmark — choose / explore / undo.” For Word Search,
mark the cell, recurse four ways, unmark. Call out pruning: stop when the
remaining target is negative or the prefix cannot match any word. Without undo,
later branches inherit ghost state.
""",
    "BFS": """
### Interview Dialogue

Interviewer: “Minutes until all oranges rot.” You: “Multi-source BFS — enqueue
every rotten orange at minute 0, then layer by layer.” First time you reach a
cell is the earliest minute. Forbid DFS for shortest hop counts. Weighted edges
→ Dijkstra. Tree level order is the same queue muscle with a size loop.
""",
    "Graph Traversal": """
### Interview Dialogue

Interviewer: “Here’s an edge list — is the graph bipartite?” You: “I’ll build
an adjacency list, then BFS-color each component with two colors.” Draw three
nodes and edges, write the adj dict on the board, then choose BFS because you
want layers/colors from a source. If it were fewest word mutations, same
representation, BFS for distance. If number of islands on a grid, DFS flood is
fine — say why. Representation + selection are this chapter’s job.
""",
    "Union Find (Disjoint Set)": """
### Interview Dialogue

Interviewer: “Redundant connection.” You: “I’ll union each edge; if both ends
already share a parent, that edge closes a cycle.” Implement find with path
compression live. Number of provinces is the same parent-counting trick. Say
union-by-rank if you have time; interviews often pass with compression alone
on n ≤ 10^5.
""",
    "Topological Sort": """
### Interview Dialogue

Interviewer: “Can you finish all courses?” You: “Kahn’s algorithm — queue zero
indegree nodes, peel, reduce neighbors; if I peel fewer than n, there’s a
cycle.” Draw indegrees. Course Schedule II appends to an order list while
peeling. Alien Dictionary builds edges between first differing letters, then
topo — mention as Hard escalation.
""",
    "Dijkstra": """
### Interview Dialogue

Interviewer: “Network Delay Time.” You: “Non-negative times — Dijkstra. Dist
array, min-heap of (time, node). Pop settle, relax neighbors if I can improve.”
Define relax and settle in plain English. Reject “I’ll Bellman-Ford” unless
negatives appear and you explain |V|−1 rounds. Tree-only unique path is an Easy
warmup, not Network Delay as Easy.
""",
    "Minimum Spanning Tree": """
### Interview Dialogue

Interviewer: “Min cost to connect all points.” You: “All pairs as weighted
edges, Kruskal: sort edges, union if different components, stop at n−1 edges.”
Name Union Find as the cycle checker. Prim is acceptable if you prefer growing
from a seed with a heap. Label connectivity Union-Find drills as prep, not as
fake MST Easys.
""",
    "Stack": """
### Interview Dialogue

Interviewer: “Valid parentheses.” You: “Push openers; on closer, pop and
match.” Escalate to Decode String with a stack of frames (count + string). If
they ask next warmer day, switch to Monotonic Stack. Clear LIFO ownership keeps
you from overusing deques.
""",
    "Queue": """
### Interview Dialogue

Interviewer: “Level order traversal.” You: “Queue; while not empty, process
`size = queue.length` nodes as one level.” That size loop is the tell. BFS
shortest path reuses it with distances. Recent Calls is a time queue: pop from
front while too old. Dual-home quietly: structure here, distance story in BFS.
""",
    "Heap / Priority Queue": """
### Interview Dialogue

Interviewer: “Top K frequent words/elements.” You: “Count with a hash map, then
a size-K min-heap of (freq, key); pop when size exceeds K.” That two-step is
mandatory. Kth largest is the same heap muscle on raw values. Median data
stream uses two heaps — Hard cousin. Never skip the count map when the metric
is frequency.
""",
    "Monotonic Stack": """
### Interview Dialogue

Interviewer: “Daily temperatures.” You: “Monotonic decreasing stack of indices;
while today is warmer than the top, pop and write the day gap.” Histogram
rectangle: for each bar find first shorter left/right with the same mono stack
of indices. State the invariant before you touch the keyboard.
""",
    "Trie": """
### Interview Dialogue

Interviewer: “Word Search II.” You: “Build a trie of the words, DFS the board
while walking the trie; prune when the node dies.” For autocomplete,
startsWith walks are the win over scanning the dictionary. If only exact full
keys matter, say when a Hash Set is enough instead.
""",
}


def word_count(section: str) -> int:
    prose = re.sub(r"```.*?```", "", section, flags=re.S)
    return len(prose.split())


def main() -> None:
    for path in sorted(FAM.glob("family-*.md")):
        text = path.read_text(encoding="utf-8")
        matches = list(re.finditer(r"(?m)^## (.+)$", text))
        if not matches:
            continue
        pieces = []
        changed = False
        for i, m in enumerate(matches):
            title = m.group(1).strip()
            start = m.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            section = text[start:end]
            if (
                title in DIALOGUES
                and word_count(section) < 800
                and "### Interview Dialogue" not in section
                and "### Summary" in section
            ):
                block = DIALOGUES[title].strip() + "\n\n"
                section = section.replace("### Summary", block + "### Summary", 1)
                changed = True
                print(f"dialogue {path.name} / {title} -> ~{word_count(section)}")
            pieces.append(section)
        if changed:
            prefix = text[: matches[0].start()]
            path.write_text(prefix + "".join(pieces), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
