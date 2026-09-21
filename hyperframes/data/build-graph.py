"""Rows for the graph primitive, traced by running BFS for real."""
import json, os
from collections import deque

NODES = [
  {"id": "A", "x": 0.06, "y": 0.50}, {"id": "B", "x": 0.30, "y": 0.16},
  {"id": "C", "x": 0.30, "y": 0.84}, {"id": "D", "x": 0.58, "y": 0.30},
  {"id": "E", "x": 0.58, "y": 0.80}, {"id": "F", "x": 0.88, "y": 0.52},
]
EDGES = [["A","B"],["A","C"],["B","D"],["C","D"],["C","E"],["D","F"],["E","F"]]

adj = {n["id"]: [] for n in NODES}
for a, b in EDGES:
    adj[a].append(b); adj[b].append(a)

def bfs(start):
    seen, order, steps = {start}, [], []
    q = deque([start])
    dist = {start: 0}
    steps.append({"cur": None, "visited": [], "frontier": [start],
                  "note": f"Start at <b>{start}</b>. The queue holds nodes discovered but not yet processed."})
    while q:
        cur = q.popleft()
        order.append(cur)
        newly = [nb for nb in adj[cur] if nb not in seen]
        for nb in newly:
            seen.add(nb); dist[nb] = dist[cur] + 1; q.append(nb)
        note = (f"Process <b>{cur}</b> (distance {dist[cur]}). "
                + (f"Discovers {', '.join(newly)} — queued behind everything already waiting."
                   if newly else "No new neighbours; everything it touches is already seen."))
        steps.append({"cur": cur, "visited": list(order), "frontier": list(q), "note": note})
    steps.append({"cur": None, "visited": list(order), "frontier": [],
                  "note": f"Visit order <b>{' '.join(order)}</b>. BFS drains the queue in arrival order, "
                          f"so nodes come out grouped by distance — which is why it finds shortest paths."})
    return steps, order, dist

steps, order, dist = bfs("A")
assert order[0] == "A" and len(order) == len(NODES), "BFS must reach every node once"
# The defining property: visit order is non-decreasing in distance.
ds = [dist[n] for n in order]
assert ds == sorted(ds), f"BFS order must be layered by distance, got {list(zip(order, ds))}"

rows = [{
  "_out": "graph-bfs", "family": "relationships", "theme": "dark",
  "eyebrow": "Relationships", "title": "Breadth-First Search",
  "nodes": json.dumps(NODES), "edges": json.dumps(EDGES), "directed": False,
  "queueLabel": "visit order", "stepSeconds": 1.9, "steps": json.dumps(steps),
}]
json.dump(rows, open(os.path.join(os.path.dirname(__file__), "rows-graph.json"), "w"), indent=2)
print(f"{len(steps)} steps · order {' '.join(order)} · distances {[dist[n] for n in order]}")
