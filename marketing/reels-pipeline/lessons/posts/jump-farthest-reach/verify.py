"""Facts for the jump-game carousel: array lookups made by trying every jump, and by tracking the farthest reach."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/greedy/jump-game.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def can_jump(" in b)
source = Path("code/jump.py").read_text()
# the shown function is the lesson's block with its comments stripped
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert source.endswith(bare), "can_jump is not the lesson's block"
assert "nums = [3,2,1,0,4] → false  (cannot progress past index 3)" in lesson

mod = {}
exec(source, mod)
brute, sweep = mod["can_jump_brute"], mod["can_jump"]
for nums, want in (([2, 3, 1, 1, 4], True), ([3, 2, 1, 0, 4], False), ([0], True)):
    assert brute(nums) is want and sweep(nums) is want


class Counted(list):
    """A list that counts the elements read from it by index."""
    reads = 0

    def __getitem__(self, i):
        self.reads += 1
        return list.__getitem__(self, i)


K = 20
trap = list(range(K, 0, -1)) + [0, 0]   # every index can reach the 0 just before the end, and none can pass it
a, b = Counted(trap), Counted(trap)
assert brute(a) is False and sweep(b) is False

print(json.dumps({"n": len(trap), "trap": f"[{K}, {K - 1}, ..., 1, 0, 0]", "brute_reads": a.reads, "sweep_reads": b.reads}))
