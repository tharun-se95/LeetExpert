"""Rows for the linked-list primitive, traced by executing the real loops."""
import json, os

def reverse_trace(vals):
    """prev=None; while curr: nxt=curr.next; curr.next=prev; prev=curr; curr=nxt"""
    n = len(vals)
    steps, prev, curr, flipped = [], -1, 0, 0
    steps.append({"p1": curr, "p2": prev, "reversed": flipped,
                  "note": "<b>prev</b> starts at null and <b>curr</b> at the head. Nothing is reversed yet."})
    while curr < n:
        nxt = curr + 1
        flipped += 1                      # curr.next = prev — this edge now points back
        prev, curr = curr, nxt
        note = (f"Point node {vals[prev]}'s next at <b>prev</b>, then walk both forward. "
                f"{flipped} node{"s" if flipped != 1 else ""} re-pointed.")
        if curr == n:
            note = (f"<b>curr</b> falls off the end. <b>prev</b> is the new head — "
                    f"every node now points backwards.")
        steps.append({"p1": curr, "p2": prev, "reversed": flipped, "note": note})
    assert flipped == n, "every edge must end up reversed"
    return steps

def fast_slow_trace(vals):
    """slow += 1; fast += 2 — slow lands on the middle when fast runs out."""
    n = len(vals)
    steps, slow, fast = [], 0, 0
    steps.append({"p1": slow, "p2": fast, "reversed": 0,
                  "note": "Both pointers start at the head."})
    while fast + 2 <= n - 1 or fast + 1 <= n - 1:
        step = 2 if fast + 2 <= n - 1 else 1
        fast += step
        slow += 1
        if fast >= n - 1:
            steps.append({"p1": slow, "p2": fast, "reversed": 0,
                          "note": f"<b>fast</b> reaches the end. <b>slow</b> stopped at index {slow} — <b>the middle</b>."})
            break
        steps.append({"p1": slow, "p2": fast, "reversed": 0,
                      "note": f"<b>slow</b> moves one to index {slow}; <b>fast</b> moves two to index {fast}."})
    assert slow == (n - 1) // 2 or slow == n // 2, f"slow={slow} is not a middle of {n}"
    return steps, slow

REV = [1, 2, 3, 4, 5]
FS = [1, 2, 3, 4, 5, 6, 7]
fs_steps, mid = fast_slow_trace(FS)

rows = [
  {"_out": "linked-list-reversal", "family": "pointer-movement", "theme": "dark",
   "eyebrow": "Pointer Movement", "title": "Reverse a Linked List",
   "values": ",".join(map(str, REV)), "p1Label": "curr", "p2Label": "prev",
   "showP2": True, "showNull": True,
   "steps": json.dumps(reverse_trace(REV))},
  {"_out": "linked-list-fast-slow", "family": "pointer-movement", "theme": "light",
   "eyebrow": "Pointer Movement", "title": "Fast &amp; Slow Pointers",
   "values": ",".join(map(str, FS)), "p1Label": "slow", "p2Label": "fast",
   "showP2": True, "showNull": True,
   "steps": json.dumps(fs_steps)},
]
out = os.path.join(os.path.dirname(__file__), "rows-linked-list.json")
json.dump(rows, open(out, "w"), indent=2)
for r in rows:
    print(f'{r["_out"]:<24} {len(json.loads(r["steps"]))} steps')
print(f'fast/slow middle index = {mid} of {len(FS)} nodes')
print("wrote", out)
