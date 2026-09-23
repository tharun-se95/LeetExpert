"""Rows for the stack-queue primitive, traced by running the real algorithms."""
import json, os
from collections import deque

def monotonic_next_greater(arr):
    """Classic decreasing stack: pop everything smaller, then push."""
    steps, st, ans = [], [], [-1] * len(arr)
    steps.append({"i": 0, "contents": [], "op": "start", "note": "The stack holds values still waiting for a bigger one."})
    for i, v in enumerate(arr):
        while st and st[-1] < v:
            popped = st.pop()
            steps.append({"i": i, "contents": list(st), "op": f"pop {popped}",
                          "note": f"<b>{v}</b> is bigger than <b>{popped}</b> — so {v} is {popped}'s next greater. Pop it."})
        st.append(v)
        steps.append({"i": i, "contents": list(st), "op": f"push {v}",
                      "note": f"Nothing left to resolve. Push <b>{v}</b> and move on."})
    # the invariant the whole pattern rests on
    assert all(st[k] >= st[k + 1] for k in range(len(st) - 1)), "stack must stay non-increasing"
    steps.append({"i": len(arr) - 1, "contents": list(st), "op": "done",
                  "note": f"What is left never found a bigger value: <b>{', '.join(map(str, st))}</b>."})
    return steps

def fifo_queue(arr):
    steps, q = [], deque()
    steps.append({"i": 0, "contents": [], "op": "start", "note": "A queue serves in arrival order — first in, first out."})
    for i, v in enumerate(arr):
        q.append(v)
        steps.append({"i": i, "contents": list(q), "op": f"enqueue {v}",
                      "note": f"<b>{v}</b> joins at the back."})
        if len(q) == 3:
            out = q.popleft()
            steps.append({"i": i, "contents": list(q), "op": f"dequeue {out}",
                          "note": f"<b>{out}</b> arrived first, so it leaves first — from the front, not the back."})
    return steps

MS = [2, 1, 5, 6, 2, 3]
FQ = [7, 4, 9, 1, 5]
# Reserve exactly the depth the trace reaches — hidden slots still occupy
# layout, so an over-reservation pushes the vessel off the frame.
cap = lambda steps: max(len(s["contents"]) for s in steps)
ms_steps = monotonic_next_greater(MS)
fq_steps = fifo_queue(FQ)
rows = [
  {"_out": "monotonic-stack", "family": "state-transition", "theme": "dark",
   "eyebrow": "State Transition", "title": "Monotonic Stack", "mode": "stack",
   "input": ",".join(map(str, MS)), "stepSeconds": 1.5,
   "steps": json.dumps(ms_steps), "capacity": cap(ms_steps)},
  {"_out": "fifo-queue", "family": "linear-traversal", "theme": "light",
   "eyebrow": "Linear Traversal", "title": "Queue — First In, First Out", "mode": "queue",
   "input": ",".join(map(str, FQ)), "stepSeconds": 1.5,
   "steps": json.dumps(fq_steps), "capacity": cap(fq_steps)},
]
out = os.path.join(os.path.dirname(__file__), "rows-stack-queue.json")
json.dump(rows, open(out, "w"), indent=2)
for r in rows: print(f'{r["_out"]:<18} {len(json.loads(r["steps"]))} steps  mode={r["mode"]}')
print("wrote", out)
