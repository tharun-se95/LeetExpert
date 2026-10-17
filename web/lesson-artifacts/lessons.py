"""The page table, kept out of build.py on purpose.

ledger.py hashes build.py with the shared kit, so every lesson's evidence goes stale when it changes. A
lesson's row is its own source instead (ledger.py feeds the row into that lesson's hash), so adding the
next module's rows here leaves every recorded lesson verified.
"""

# module, slug, family colour (familyTheme.ts id), document title. An overview also carries the course stage
# it spans (manifest.ts STAGES number) and a one-line card summary: the app's hub card comes from these two,
# through `--overviews` (spec 2026-09-29-overview-pages-on-hub-design.md).
LESSONS = [
    ("getting-started", "course-introduction", "foundations", "Course Introduction"),
    ("getting-started", "how-lessons-work", "foundations", "How Lessons & Problems Work"),
    ("getting-started", "writing-and-running-code", "foundations", "Writing & Running Code"),
    ("getting-started", "course-roadmap", "foundations", "The Roadmap"),
    ("big-o", "why-efficiency-matters", "foundations", "Why Efficiency Matters"),
    ("big-o", "big-o-notation", "foundations", "Big O Notation, Precisely"),
    ("big-o", "common-complexity-classes", "foundations", "The Common Complexity Classes"),
    ("big-o", "input-dependency-best-worst-average", "foundations", "Input Dependency: Best, Worst, & Average"),
    ("big-o", "analyzing-loops-api-complexity", "foundations", "Analyzing Loops & API Complexity"),
    ("big-o", "analyzing-recursion-tree-method", "foundations", "Analyzing Recursion: The Tree Method"),
    ("big-o", "amortized-analysis-dynamic-arrays", "foundations", "Amortized Analysis & Dynamic Arrays"),
    ("big-o", "space-complexity", "foundations", "Space Complexity"),
    ("big-o", "complexity-drills", "foundations", "Complexity Drills"),
    ("binary-trees", "diameter-of-binary-tree", "recursive-exploration", "Diameter of Binary Tree"),
    ("sliding-window", "longest-substring-without-repeating", "pointer-movement", "Longest Substring Without Repeating Characters"),
    ("dynamic-programming", "coin-change", "state-transition", "Coin Change"),
    ("graphs", "course-schedule", "relationships", "Course Schedule"),
    ("linked-lists", "nodes-and-pointers", "pointer-movement", "Nodes and Pointers"),
    ("linked-lists", "build-a-linked-list", "pointer-movement", "Build a Linked List From Scratch"),
    ("linked-lists", "pointer-surgery", "pointer-movement", "Pointer Surgery Patterns"),
    ("linked-lists", "reverse-linked-list", "pointer-movement", "Reverse Linked List"),
    ("linked-lists", "middle-of-list", "pointer-movement", "Middle of the Linked List"),
    ("linked-lists", "linked-list-cycle", "pointer-movement", "Linked List Cycle"),
    ("linked-lists", "merge-two-sorted", "pointer-movement", "Merge Two Sorted Lists"),
    ("linked-lists", "remove-nth-from-end", "pointer-movement", "Remove Nth Node From End of List"),
    # overviews: one page across several modules (not a lesson, so not a ledger row; spec §2)
    ("overviews", "linear-structures", "linear-traversal", "The Line Underneath", 1,
     "Arrays, linked lists, stacks and queues side by side, and the everyday systems that run on each."),
    ("overviews", "grid-structures", "ordering-search", "The Grid Underneath", 2,
     "Eight grid algorithms, and the systems that run them every second."),
    # specimens: kit fixtures, not lessons or overviews, so not ledger rows. The browser gate runs them so a
    # player is held to the lesson bar before any lesson depends on it (#22).
    ("specimens", "kit-players", "linear-traversal", "Kit Players"),
]
