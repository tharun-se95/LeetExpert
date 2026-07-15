#!/usr/bin/env python3
"""Second depth pass + classic list normalization for underweight patterns."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAM = ROOT / "part-2-pattern-families"

PASS2: dict[str, str] = {
    "Sorting": """
### Worked Recognition

Interview prompt: "Given an array of intervals, merge all overlapping." You
sort by start, then walk once. That is Sorting-as-a-move, not a sorting-algorithm
contest. "Largest Number" custom comparator is the same idea with a weirder
order key. "Sort Colors" may use counting or three-way partition — mention the
Arrays callout, then still name the broader habit: create order, then scan.

Engineering echo: ETL pipelines sort events by timestamp once so later joins
and window aggregations become single passes — warehouse sorting paid so
analytics scans stay linear.
""",
    "Binary Search": """
### Worked Recognition

Search Insert Position and First Bad Version train index / boundary search.
Koko and Minimum Time to Ship train answer-space. Always state: "I search the
space of answers from lo to hi; mid is feasible if …” The bottleneck you kill
is linear trying every candidate when the feasibility check is monotonic.

Engineering echo: load balancers pick the lowest server id that still has
capacity with a binary search on sorted capacity arrays; databases probe B-tree
pages by the same halve-the-range idea.
""",
    "Intervals": """
### Worked Recognition

Insert Interval: copy every interval ending before the new start; merge through
overlaps; copy the rest. The naive “re-check the whole list after each insert”
is the bottleneck. Meeting Rooms (can you attend all?) is sort-by-start then
check adjacent overlaps — still Intervals; peak room count is Sweep Line.

Engineering echo: calendar UIs merge free/busy blocks after sorting by start so
a day view is one pass, not O(n²) pairwise clash tests.
""",
    "Sweep Line": """
### Worked Recognition

Car Pooling and Meeting Rooms II are the same event sort: open = +delta, close
= −delta, track peak. Process closes before opens at equal time when resources
free at that instant. Skyline problems emit height changes the same way.

Engineering echo: cloud schedulers compute peak concurrent jobs by sweeping
start/end events — same counter walk as the interview template.
""",
    "DFS": """
### Worked Recognition

Number of Islands / Max Area of Island: for each land cell, DFS floods and
marks water; count how many floods you started. Clone Graph is DFS/BFS with a
map from old node to new node. Path Sum wanders with a running total.

Always mark visited (or sink the island to water) when you enter a cell so you
do not thrash. Graph Traversal owns adj-list construction; you own the recurse
template.
""",
    "Tree Traversals": """
### Worked Recognition

Validate BST is inorder (or bounded DFS). Construct tree from preorder+inorder
uses preorder’s root + inorder’s split. Serialize/deserialize often uses
preorder with null markers. Postorder fits “process children before parent”
deletion order in compilers.

Level order is BFS — send readers to the BFS/Queue chapters for the queue
loop; keep recursive orders here.
""",
    "Divide and Conquer": """
### Worked Recognition

Merge sort interview: write `merge(left,right)` carefully. Count of Range Sum /
reverse pairs use modified merge (Hard). Different from Quickselect (partition
for kth) though both “split.” Say the merge step out loud — without merge you
only have recursion, not D&C.
""",
    "Backtracking": """
### Worked Recognition

Subsets: for each index, choose take/skip then undo. Permutations: swap-in /
swap-back. Combination Sum: choose a coin, recurse with remaining target, pop.
Word Search: mark board cell '#', recurse 4-way, unmark. Prune when remaining
target goes negative or prefix cannot match.

That choose/undo pair is the whole pattern — memorize the habit, not one
problem’s AST.
""",
    "BFS": """
### Worked Recognition

Rotting Oranges: enqueue all rotten first (multi-source), then minute layers.
Shortest Path in Binary Matrix: 8-direction BFS. Open the Lock: BFS on 4-digit
states. Tree level averages: queue size per layer.

Engineering echo: game AI flood-fills reachable tiles from the player with BFS
so every tile learns a hop distance for path heuristics.
""",
    "Graph Traversal": """
### Worked Recognition

Build adj from edge list: `for u,v in edges: adj[u].append(v); adj[v].append(u)`
for undirected. Directed skips the back append. Visited set or array prevents
infinite cycles. Pick BFS when the question says fewest edges; pick DFS when
you need component flood or recursion depth with state.

Clone Graph and Rooms and Keys are representation+walk drills. Do not end the
Mental Model at “see BFS chapter” — show the adj list of a tiny example and
choose.
""",
    "Union Find (Disjoint Set)": """
### Worked Recognition

Number of Provinces: union each connected city pair; answer = number of unique
roots. Redundant Connection: the edge whose ends already share a root. Accounts
Merge: union emails that share an account. Always implement `find` with path
compression in interviews unless told not to.
""",
    "Topological Sort": """
### Worked Recognition

Course Schedule: build indegree + adj; Kahn peel; if peeled < n, cycle → false.
Course Schedule II: same, record order. Alien Dictionary is topo on letter
edges inferred from sorted words — Hard flavor.

Easy prep: compute indegrees for a tiny DAG and list a valid order by hand,
then code Kahn.
""",
    "Dijkstra": """
### Worked Recognition

Network Delay Time / Cheapest Flights within K Stops (careful with K) /
Path With Minimum Effort (binary search + BFS or Dijkstra on effort). Narrate
relax: “can I improve v through u?” and settle: “popped u — done forever.”
Reject negative weights; say Bellman-Ford only if negatives appear and you
explain its |V|−1 full relax rounds.
""",
    "Minimum Spanning Tree": """
### Worked Recognition

Min Cost to Connect All Points: edges = manhattan distances, Kruskal + UF.
Optimize Water Distribution: virtual node trick. Prim alternate is fine if you
prefer growing a tree with a min-heap of outgoing edges.
""",
    "Stack": """
### Worked Recognition

Valid Parentheses / Min Stack / Decode String / Basic Calculator II. Always
ask: “do I need the most recent unfinished opener or frame?” If yes, stack. If
you need next greater, escalate to Monotonic Stack.
""",
    "Queue": """
### Worked Recognition

Implement Queue using Stacks; Design Circular Queue; Binary Tree Level Order;
Number of Recent Calls (sliding timeline queue). Dual-home with BFS: you
explain FIFO here; they explain distance layers there.
""",
    "Heap / Priority Queue": """
### Worked Recognition

Top K Frequent (count → size-K heap) is the canon template. K Closest Points
and Kth Largest Element are cousins. Merge k Sorted Lists pushes list heads.
Say “min-heap of size K keyed by frequency” in the first minute of the interview.
""",
    "Monotonic Stack": """
### Worked Recognition

Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram,
Online Stock Span. Keep indices, not only values, so you can compute widths and
distances. State the mono invariant every time you pop.
""",
    "Trie": """
### Worked Recognition

Implement Trie; Replace Words; Word Search II; Design Search Autocomplete.
If queries are full exact keys only, a hash set may win. If prefixes dominate,
Trie wins.
""",
}

CLASSICS: dict[str, tuple[str, str, str]] = {
    "Sorting": (
        "Sorted Array / Majority Element Lite · Heights Checker · Can Make Arithmetic Progression",
        "Merge Intervals · Sort Colors · Largest Number",
        "Russian Doll Envelopes · Count of Smaller Numbers After Self",
    ),
    "Binary Search": (
        "Binary Search · Search Insert Position · First Bad Version",
        "Search in Rotated Sorted Array · Find Peak Element · Koko Eating Bananas",
        "Median of Two Sorted Arrays · Split Array Largest Sum",
    ),
    "Intervals": (
        "Meeting Rooms · Non-overlapping Intervals Warmup · Interval List Intersections Lite",
        "Merge Intervals · Insert Interval · Non-overlapping Intervals",
        "Minimum Interval to Include Each Query · Data Stream as Disjoint Intervals",
    ),
    "Sweep Line": (
        "Number of Points Covered Lite · Meeting Rooms · Car Pooling Warmup",
        "Meeting Rooms II · Car Pooling · My Calendar II",
        "The Skyline Problem · Number of Airplanes in the Sky",
    ),
    "DFS": (
        "Maximum Depth of Binary Tree · Leaf-Similar Trees · Flood Fill",
        "Number of Islands · Clone Graph · Path Sum II",
        "Longest Increasing Path in a Matrix · Critical Connections in a Network",
    ),
    "Tree Traversals": (
        "Binary Tree Inorder Traversal · Binary Tree Preorder Traversal · Binary Tree Postorder Traversal",
        "Validate Binary Search Tree · Construct Binary Tree from Preorder and Inorder · Binary Tree Zigzag Level Order",
        "Serialize and Deserialize Binary Tree · Binary Tree Maximum Path Sum",
    ),
    "Divide and Conquer": (
        "Merge Two Sorted Lists · Maximum Subarray Warmup · Convert Sorted Array to BST",
        "Sort List · Different Ways to Add Parentheses · Majority Element",
        "Count of Range Sum · Reverse Pairs",
    ),
    "Backtracking": (
        "Subsets · Letter Case Permutation · Binary Watch",
        "Permutations · Combination Sum · Word Search",
        "N-Queens · Sudoku Solver",
    ),
    "BFS": (
        "Minimum Depth of Binary Tree · Average of Levels in Binary Tree · Binary Tree Level Order Traversal II",
        "Rotting Oranges · Shortest Path in Binary Matrix · Open the Lock",
        "Word Ladder · Bus Routes",
    ),
    "Graph Traversal": (
        "Find the Town Judge · Find Center of Star Graph · Flood Fill",
        "Clone Graph · Number of Connected Components · Is Graph Bipartite?",
        "Critical Connections in a Network · Reconstruct Itinerary",
    ),
    "Union Find (Disjoint Set)": (
        "Number of Provinces Warmup · Find Center of Star Graph · Quick Find Demo",
        "Number of Provinces · Redundant Connection · Accounts Merge",
        "Hardest Worker / Similar String Groups · Number of Islands II",
    ),
    "Topological Sort": (
        "Course Order Warmup · Build Indegrees · Detect Cycle in Tiny DAG",
        "Course Schedule · Course Schedule II · Minimum Height Trees",
        "Alien Dictionary · Parallel Courses III",
    ),
    "Dijkstra": (
        "Path Cost on a Tree · Network Delay Warmup · Cheapest Edge Pick",
        "Network Delay Time · Path With Minimum Effort · Cheapest Flights Within K Stops",
        "Find the Closest Palindrome Path / Swim in Rising Water · Reachable Nodes With Restrictions Hard Flavor",
    ),
    "Minimum Spanning Tree": (
        "Connect Cities Warmup · Union-Find Prep · Min Cost Edge Sort Prep",
        "Min Cost to Connect All Points · Optimize Water Distribution · Connecting Cities With Minimum Cost",
        "Critical Connections MST Flavor · Find Critical and Pseudo-Critical Edges",
    ),
    "Stack": (
        "Valid Parentheses · Min Stack · Implement Stack using Queues",
        "Decode String · Daily Temperatures Warmup · Basic Calculator II",
        "Largest Rectangle in Histogram · Basic Calculator",
    ),
    "Queue": (
        "Implement Queue using Stacks · Number of Recent Calls · Design Circular Queue",
        "Binary Tree Level Order Traversal · Design Hit Counter · Moving Average from Data Stream",
        "Sliding Window Maximum · Design Snake Game",
    ),
    "Heap / Priority Queue": (
        "Kth Largest Element in a Stream · Last Stone Weight · Relative Ranks",
        "Top K Frequent Elements · K Closest Points to Origin · Kth Largest Element in an Array",
        "Find Median from Data Stream · Merge k Sorted Lists",
    ),
    "Monotonic Stack": (
        "Next Greater Element I · Remove All Adjacent Duplicates · Online Stock Span Warmup",
        "Daily Temperatures · Next Greater Element II · Online Stock Span",
        "Largest Rectangle in Histogram · Maximal Rectangle",
    ),
    "Trie": (
        "Implement Trie · Longest Common Prefix · Reverse String Prefix Soft",
        "Replace Words · Design Add and Search Words · Map Sum Pairs",
        "Word Search II · Prefix and Suffix Search",
    ),
}


def word_count(section: str) -> int:
    prose = re.sub(r"```.*?```", "", section, flags=re.S)
    return len(prose.split())


def fix_classics(section: str, title: str) -> str:
    if title not in CLASSICS:
        return section
    e, m, h = CLASSICS[title]
    block = (
        f"**Easy:** {e}\n\n"
        f"**Medium:** {m}\n\n"
        f"**Hard:** {h}\n"
    )
    new, n = re.subn(
        r"\*\*Easy:\*\*.*?\n\n\*\*Medium:\*\*.*?\n\n\*\*Hard:\*\*.*?\n",
        block,
        section,
        count=1,
        flags=re.S,
    )
    if n:
        return new
    # fallback looser
    new2, n2 = re.subn(
        r"\*\*Easy:\*\*.*?(?=\n### |\n## |\Z)",
        block + "\n",
        section,
        count=1,
        flags=re.S,
    )
    return new2 if n2 else section


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
            if title in PASS2 and word_count(section) < 800:
                if "### Worked Recognition" not in section and "### Summary" in section:
                    block = PASS2[title].strip() + "\n\n"
                    section = section.replace("### Summary", block + "### Summary", 1)
                    changed = True
                    print(f"pass2 {path.name} / {title} -> ~{word_count(section)}")
            before = section
            section = fix_classics(section, title)
            if section != before:
                changed = True
                print(f"classics fixed {path.name} / {title}")
            pieces.append(section)
        if changed:
            prefix = text[: matches[0].start()]
            path.write_text(prefix + "".join(pieces), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
