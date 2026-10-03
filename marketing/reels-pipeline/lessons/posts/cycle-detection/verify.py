"""Facts for the cycle-detection carousel: the course's reference on the lesson's lists, with the steps counted."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
assert Path("code/has_cycle.py").read_text() == (ROOT / "web/tests/reference/linked-lists/linked-list-cycle.py").read_text()
lesson = (ROOT / "courses/dsa/linked-lists/linked-list-cycle.md").read_text()
assert "head = [3,2,0,-4], pos = 1 → true  (-4 links back to 2)" in lesson

spec = importlib.util.spec_from_file_location("has_cycle", "code/has_cycle.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class Node:
    def __init__(self, val):
        self.val, self.next = val, None


def build(values, pos):
    """A list whose tail links back to index pos (-1: no cycle)."""
    nodes = [Node(v) for v in values]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0] if nodes else None


def steps(head):
    """Moves the two runners make before they meet or fast falls off; the result must be the reference's."""
    slow = fast = head
    count, found = 0, False
    while fast and fast.next:
        slow, fast, count = slow.next, fast.next.next, count + 1
        if slow is fast:
            found = True
            break
    assert found == mod.has_cycle(head)
    return count, found


def visited(head):
    """Nodes the visited-set answer stores before it decides."""
    seen, node = set(), head
    while node is not None and id(node) not in seen:
        seen.add(id(node))
        node = node.next
    return len(seen)


N = 10_000
values = list(range(1, N + 1))
ex, ex_found = steps(build([3, 2, 0, -4], 1))
loop, loop_found = steps(build(values, 0))
tail, tail_found = steps(build(values, N - 1))
none, none_found = steps(build(values, -1))
assert (ex_found, loop_found, tail_found, none_found) == (True, True, True, False)
assert mod.has_cycle(None) is False and mod.has_cycle(build([1, 2], -1)) is False

print(json.dumps({"ex_steps": ex, "n": N, "loop_steps": loop, "tail_steps": tail, "none_steps": none,
                  "set_nodes": visited(build(values, 0)), "pointers": 2}))
