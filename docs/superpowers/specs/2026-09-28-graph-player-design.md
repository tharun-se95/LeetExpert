# Graphs in the lane player

Status: implemented for #22 (the graphs item, the last player on the issue)

## 1. Problem

The graphs module (13 lessons) steps through algorithms whose state lives on a node-link drawing *and*
on the linear structures beside it. Each one below needs a step player, not a still picture:

| Need | Lessons |
|---|---|
| one graph drawn two ways: nodes and edges, and the adjacency list read off it | graph representation |
| a traversal: a frontier (queue for BFS, stack for DFS) beside the graph, nodes toned as discovered, visited, current | DFS and BFS on graphs; number of provinces; clone graph |
| a directed graph, an in-degree row, a ready queue and an output order (Kahn) | topological sort; course schedule I and II |
| a parent pointer per node that is re-pointed as sets merge; the edge that closes a cycle | union-find; redundant connection; number of provinces |
| edge weights, a distance per node that drops as edges relax, a min-heap of (distance, node) | shortest paths; network delay time |
| edges chosen one at a time into a tree, by weight | minimum spanning trees; min cost to connect all points |
| two graphs side by side, the second built while the first is walked | clone graph |

Today the kit draws a graph only as a scene board (`engine.js` tree boards with `directed`) or as
`graphView` in `kit.js`, a still view that the lesson repaints by hand (`course-schedule/lesson.js`
builds its own frames and keeps a hand-synced queue beside it). Neither is a `StepPlayer` lane, so
a graph cannot share a player with the queue, stack, row or heap lanes the algorithms above read
and write, and nothing glides.

## 2. Decision: a graph lane kind

A graph is a **fixed lane**: slot `k` is node `k`, its item carries the node's label (`v`) and an
optional second line (`sub`: a distance, a colour name, an in-degree). Node tone, highlight and
`mark` work through the generic lane API unchanged, so a traversal tones nodes exactly as a row tones
cells. What a graph adds is its **edges**, held on the lane and drawn in the kind's `under` layer (so
nodes sit on top of them), each with a state that the steps change.

Node positions are **authored by the lesson**, in grid units, the same `{x, d}` shape the scene boards
and `graphView` already use (`course-schedule`'s `G` converts unchanged). A general graph has no
canonical layout, and a layout algorithm that moved when an edge was added would break the rule every
other player keeps: only the items move. Positions are fixed for the player's life.

Rejected:

- **Nodes as a second kind of thing, not lane items.** Traversals move node *references* onto a
  queue or stack lane. Keeping nodes as items lets `copy(graph, k, 'q')` put a node's label on the
  frontier entering from the node itself: the glide from graph to queue is the point of the picture.
- **Edges as items.** Edges never travel between lanes. As items they would need a position each and
  would pass through the shared draw loop that every lane kind relies on, for a need only graphs have.
  They are drawn in a layer instead, as grids draw their paths and heaps draw their tree edges.
- **Reusing `path`/`rect` from grids.** Those name cells in a board's own coordinates; a graph has
  none. It names an edge by its two endpoints.

## 3. Where the code goes

`kit/graphs.js` (+ `graphs.css`), registered on `lanes.js`'s `LANE_KINDS` seam
(`KIT_DEPS.graphs = ["player", "lanes"]`), shipped only when a lesson names `kind:'graph'`
(`KIT_OPTIONAL`), always after `lanes.js`. The existing `graphView` and scene boards are not
changed; migrating `course-schedule` onto the player is follow-up work, not this item.

## 4. The model

- Lane definition: `{id, kind:'graph', label, nodes:[{x, d, l}], edges:[[a, b, w?]], directed}`.
  `cap` is the node count, set by `init` (`Lanes` then opens the slots, as for every fixed lane).
  `Lanes#nodes(id)` writes every node's label `l` into its slot and returns the items, as grids'
  `fill` does. Undirected edges are stored with `a < b`; the lookup accepts either order. Two nodes
  on one position, a self-loop, or an endpoint out of range throw.
- `Lanes#edge(id, a, b, state)`: an edge's state is one of `idle` (default), `seen` (examined),
  `tree` (chosen: BFS/DFS tree, MST, shortest-path tree), `cur` (the one this step examines) and
  `bad` (the edge that closes a cycle; a rejected relaxation). Throws on an edge the graph does not
  have: a typo must fail, not draw nothing.
- `Lanes#link(id, a, b, w?)` / `Lanes#unlink(id, a, b)`: add or drop an edge while the player runs,
  for structures whose edges ARE the state (a union-find forest re-points a root's parent pointer;
  a clone graph grows its copy). Linking an edge the graph already has throws.
- `Lanes#weight(id, a, b, w)`: change a weight label (rarely needed; declared weights are drawn).
- `Lanes#adj(id, a)`: `[{to, w}]`, the edges out of `a` (directed) or at `a` (undirected), in the
  order they were added, so a walkthrough iterates the graph it draws instead of a second copy.
  `Lanes#hasEdge(id, a, b)` asks without throwing.
- `span` throws (a graph has no range). `mark(id, name, k)` names a node (`u`, `v`, `src`), drawn
  below the node circle.
- `snap` copies edges into an array (`{key, a, b, w, state}`) so snapshots stay isolated, as every
  kind's does. The view reads only snapshots, so `layout` and `describe` read that array.
- A tone on an item marks node state. Lessons use the existing tones (`cur`, `done`, `bad`...); the
  kind adds none.

## 5. The view

- `measure`/`block`/`box`: width from `max x`, height from `max d`, with a fixed unit
  (`GXUNIT`, `GYUNIT`) sized so a node's cell and a weight label fit between neighbours.
  Fixed for the player's life, so the canvas never resizes.
- `slotAt(b, k)`: node `k`'s centre. Items are drawn as round-cornered boxes, the same as other
  lanes, so the palette and the contrast gate need nothing new.
- `under`: each edge as a line trimmed to the two node boxes' borders (as the DP arrows are, border
  to border), with an arrowhead when `directed`. A state change cross-fades with `t`; a `link`
  fades in and an `unlink` fades out. Edges are keyed by lane and endpoints, never by position in
  the list, so an `unlink` fades only its own line. Weight labels sit on a card-coloured plate
  centred on the edge's midpoint, so they stay legible where lines cross. A directed pair drawn both
  ways is pulled 5px apart so the two arrows do not overlap.
- Edge colours go through CSS classes (`gr-edge idle|seen|tree|cur|bad`), never presentation
  attributes (CLAUDE.md §4: an SVG presentation attribute is not CSS). `tree` and `cur` are drawn
  thicker, so state is told by weight as well as colour.
- Marks are the generic row marks (`rowMarks`), drawn under the node and gliding between steps;
  node boxes are the ordinary lane items, never redrawn by the kind.
- `focus` (phone): the nodes named by highlighted marks (the player's own focus) and the endpoints
  of `cur` edges.
- `describe`: nodes with their labels and tones, then edges with their states, e.g.
  `Graph g: nodes 0 (A, visited), 1 (B)...; edges 0–1 tree, 1–2 current.` Screen readers get the
  step's graph state, as every other kind already provides.

## 6. Tests and the specimen

- `tests/lessonArtifactsKit.test.ts`: edge-state bookkeeping over random operations against a plain
  map; `link`/`unlink` round-trips; undirected lookup in both orders; errors on unknown edges and
  duplicate links; snapshot isolation; `build.py` dependency order includes `graphs`. Plant faults
  (a missed state copy in `snap`, a directed edge found in reverse) and see each fail.
- `kit-players` specimen gains graph tabs: BFS (graph + queue), Kahn (directed graph + in-degree row
  + ready queue + order row), union-find (redundant connection: an edge row, a forest re-pointed by
  `link` + parent row) and Dijkstra (weighted graph whose nodes carry their distance as the second
  line, + a min-heap lane of (distance, node) with stale entries skipped). Every step's expected state is computed
  by running the algorithm in the specimen's own code, not typed in.
- The browser gate passes light and dark at 1366 and 375 with layout shift 0.

## 7. Known limits

- The lesson authors positions; a crowded layout is the lesson's to fix. `block` does not detect
  crossing edges.
- On a 375px phone a graph wider than about 5 units scrolls, like a wide grid (grid spec §4).
