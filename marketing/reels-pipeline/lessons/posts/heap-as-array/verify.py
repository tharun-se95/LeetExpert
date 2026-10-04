"""Facts for the heap-as-array carousel: the lesson's three index helpers on the lesson's heap."""
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/heaps/heap-property-and-array-representation.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def parent" in b)
if "--write" in sys.argv:
    Path("code/heap_index.py").write_text(block)
assert Path("code/heap_index.py").read_text() == block, "code/heap_index.py is not the lesson's block"

spec = importlib.util.spec_from_file_location("heap_index", "code/heap_index.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

HEAP = [1, 3, 2, 7, 4, 5, 8]   # the lesson's heap-array diagram
assert '"values": [1, 3, 2, 7, 4, 5, 8]' in lesson
assert all(HEAP[mod.parent(c)] <= HEAP[c] for c in range(1, len(HEAP)))          # a min-heap
assert all(mod.parent(mod.left(i)) == i == mod.parent(mod.right(i)) for i in range(1000))

I, C = 1, 6
REF_BYTES, N = 16, 1_000_000   # "two child references (16 bytes on a 64-bit machine)"
assert "two child\n  references (16 bytes on a 64-bit machine)" in lesson

print(json.dumps({"i": I, "l": mod.left(I), "r": mod.right(I), "lv": HEAP[mod.left(I)], "rv": HEAP[mod.right(I)],
                  "c": C, "pc": mod.parent(C), "pv": HEAP[mod.parent(C)], "cv": HEAP[C],
                  "n": N, "ref_bytes": REF_BYTES, "pointer_bytes": REF_BYTES * N}))
