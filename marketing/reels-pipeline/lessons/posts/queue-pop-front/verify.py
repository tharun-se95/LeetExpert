"""Facts for the queue carousel: element moves when the front is removed by shifting, or by moving the front."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/queues/fifo-basics.md").read_text()
assert "bad.pop(0)             # dequeue: O(n) — shifts everything!" in lesson
assert "`items = ['A', 'B', 'C']`" in lesson

spec = importlib.util.spec_from_file_location("queues", "code/queues.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class Counted(list):
    moves = 0

    def __setitem__(self, i, v):
        self.moves += 1
        list.__setitem__(self, i, v)


small = Counted(["A", "B", "C"])
assert mod.dequeue_shift(small) == "A" and list(small) == ["B", "C"]

N = 1000
shifting, plain = Counted(range(N)), list(range(N))
out = [mod.dequeue_shift(shifting) for _ in range(N)]
assert out == [plain.pop(0) for _ in range(N)] == list(range(N))   # the same order list.pop(0) gives

q = mod.HeadQueue()
q.items = Counted()
for x in range(N):
    q.enqueue(x)
assert [q.dequeue() for _ in range(N)] == list(range(N))

print(json.dumps({"small_moves": small.moves, "n": N, "shift_moves": shifting.moves, "head_moves": q.items.moves}))
