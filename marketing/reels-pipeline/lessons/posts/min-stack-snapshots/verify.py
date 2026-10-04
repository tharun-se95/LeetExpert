"""Facts for the min-stack carousel: where one min variable breaks, and what getMin reads with a rescan or a snapshot stack."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/stacks/min-stack.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "class MinStack" in b)
source = Path("code/min_stack.py").read_text()
# the shown class is the lesson's block with its comments stripped
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert source.endswith(bare), "MinStack is not the lesson's block"
assert "push(-2), push(0), push(-3), getMin() → -3" in lesson
assert "mins runs [−2, −2, −3]" in lesson

mod = {}
exec(source, mod)
OneMin, ScanMin, MinStack = mod["OneMin"], mod["ScanMin"], mod["MinStack"]


class Counted(list):
    """A list that counts its elements read, by index or by iteration, while `on`."""
    reads = 0
    on = False

    def __getitem__(self, i):
        self.reads += self.on
        return list.__getitem__(self, i)

    def __iter__(self):
        for x in list.__iter__(self):
            self.reads += self.on
            yield x


# the lesson's example
one, right = OneMin(), MinStack()
for v in (-2, 0, -3):
    one.push(v)
    right.push(v)
assert one.getMin() == right.getMin() == -3
mins = list(right._mins)
one.pop()
right.pop()
assert right.top() == 0 and one.stack == [-2, 0]
assert one.getMin() not in one.stack   # the single variable names a value that is gone

N = 1000
values = [(i * 37 + 11) % 101 - 50 for i in range(N)]   # no randomness, so both runtimes agree
scan, snap = ScanMin(), MinStack()
scan.stack, snap._mins = Counted(), Counted()
for v in values:
    scan.push(v)
    snap.push(v)
for depth in range(N, 0, -1):   # getMin, then pop, until empty; only getMin's reads are counted
    scan.stack.on = snap._mins.on = True
    a, b = scan.getMin(), snap.getMin()
    scan.stack.on = snap._mins.on = False
    assert a == b == min(values[:depth])
    scan.pop()
    snap.pop()

print(json.dumps({"one_min_says": one.getMin(), "right": right.getMin(), "left": str(one.stack), "mins": str(mins),
                  "n": N, "scan_reads": scan.stack.reads, "snap_reads": snap._mins.reads}))
