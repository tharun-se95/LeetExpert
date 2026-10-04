"""Facts for the arrays-in-memory carousel: address arithmetic, the cost of front inserts, a cache line."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/arrays/contiguous-memory.md").read_text()

spec = importlib.util.spec_from_file_location("memory", "code/memory.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

# the lesson's memory-cells diagram
BASE, SLOT, COUNT, I = 4096, 8, 5, 3
assert '"baseAddress": 4096' in lesson and '"slotBytes": 8' in lesson and '"count": 5' in lesson
addresses = [mod.address(BASE, SLOT, i) for i in range(COUNT)]
assert all(b - a == SLOT for a, b in zip(addresses, addresses[1:]))


class Counted(list):
    writes = 0

    def __setitem__(self, i, v):
        self.writes += 1
        list.__setitem__(self, i, v)


N = 1000
front = Counted([None] * N)
for k in range(N):
    mod.insert_front(front, k, k)
assert list(front) == list(range(N - 1, -1, -1))   # the newest is first
assert front.writes == N * (N + 1) // 2            # the lesson's triangular sum
end = Counted([None] * N)
for k in range(N):
    end[k] = k

LINE, INT = 64, 4   # "a 64-byte line holds sixteen 4-byte integers"
assert "a 64-byte line" in lesson and "sixteen 4-byte integers" in lesson
per_line = LINE // INT

print(json.dumps({"base": BASE, "slot": SLOT, "i": I, "addr": addresses[I], "n": N,
                  "front_writes": front.writes, "end_writes": end.writes, "line": LINE,
                  "per_line": per_line, "free_reads": per_line - 1,
                  "hit_pct": round(100 * (per_line - 1) / per_line)}))
