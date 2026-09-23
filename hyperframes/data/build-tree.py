"""Rows for the binary-tree primitive, traced by running real traversals."""
import json, os
from collections import deque

RAW = "8,3,10,1,6,.,14,.,.,4,7,.,.,13,.".split(",")
present = lambda i: 0 <= i < len(RAW) and RAW[i] != "."
L = lambda i: 2 * i + 1
R = lambda i: 2 * i + 2

def inorder(i, out, steps):
    if not present(i): return
    steps.append({"node": i, "done": list(out), "note": f"Go left from <b>{RAW[i]}</b> before visiting it."})
    inorder(L(i), out, steps)
    out.append(i)
    steps.append({"node": i, "done": list(out), "note": f"Left subtree is finished — <b>visit {RAW[i]}</b>."})
    inorder(R(i), out, steps)

def level_order():
    out, steps, q = [], [], deque([0])
    while q:
        i = q.popleft()
        if not present(i): continue
        out.append(i)
        depth = i.bit_length()  # 1-indexed level, good enough for the caption
        steps.append({"node": i, "done": list(out),
                      "note": f"Dequeue <b>{RAW[i]}</b>, then enqueue its children. Level {depth}."})
        q.append(L(i)); q.append(R(i))
    return out, steps

io_out, io_steps = [], []
inorder(0, io_out, io_steps)
vals = [int(RAW[i]) for i in io_out]
assert vals == sorted(vals), f"in-order on a BST must be sorted, got {vals}"

lo_out, lo_steps = level_order()
assert [int(RAW[i]) for i in lo_out][0] == 8, "level order must start at the root"

rows = [
  {"_out": "tree-inorder", "family": "recursive-exploration", "theme": "dark",
   "eyebrow": "Recursive Exploration", "title": "In-order Traversal",
   "values": ",".join(RAW), "outLabel": "visit order", "showOutput": True,
   "stepSeconds": 1.4, "steps": json.dumps(io_steps)},
  {"_out": "tree-level-order", "family": "relationships", "theme": "light",
   "eyebrow": "Relationships", "title": "Level-order Traversal",
   "values": ",".join(RAW), "outLabel": "queue output", "showOutput": True,
   "stepSeconds": 1.4, "steps": json.dumps(lo_steps)},
]
out = os.path.join(os.path.dirname(__file__), "rows-tree.json")
json.dump(rows, open(out, "w"), indent=2)
print("in-order   ->", vals, f"({len(io_steps)} steps)")
print("level-order->", [int(RAW[i]) for i in lo_out], f"({len(lo_steps)} steps)")
print("wrote", out)
