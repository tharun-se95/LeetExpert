"""Facts for the subarray-sum carousel: what the map's {0: 1} seed is worth, and one pass against every pair."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/prefix-sum/prefix-sum-hash-map.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def subarray_count" in b)
source = Path("code/subarray.py").read_text()
# the shown function is the lesson's block with its comments stripped
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert bare in source, "subarray_count is not the lesson's block"
assert "a subarray that starts at index 0 and\n  happens to sum to exactly K would never be counted" in lesson
assert "it works with negative numbers" in lesson

mod = {}
exec(source, mod)
# the same function with the seed deleted, and nothing else changed
assert source.count("{0: 1}") == 1
unseeded = {}
exec(source.replace("{0: 1}", "{}"), unseeded)


class Counted(list):
    """A list that counts how many of its elements are read, by index or by iteration."""
    reads = 0

    def __getitem__(self, i):
        self.reads += 1
        return list.__getitem__(self, i)

    def __iter__(self):
        for x in list.__iter__(self):
            self.reads += 1
            yield x


small, small_k = [1, 2, 3], 3
with_seed = mod["subarray_count"](small, small_k)
without = unseeded["subarray_count"](small, small_k)
assert with_seed == mod["brute_count"](small, small_k) == 2 and without == 1   # [1, 2] and [3]; [1, 2] starts at index 0

N, K = 1000, 7
values = [(i * 37 + 11) % 101 - 50 for i in range(N)]   # negatives too; no randomness, so both runtimes agree
assert min(values) < 0 < max(values)
a, b = Counted(values), Counted(values)
brute = mod["brute_count"](a, K)
fast = mod["subarray_count"](b, K)
assert brute == fast

print(json.dumps({"small": str(small), "small_k": small_k, "small_with": with_seed, "small_without": without,
                  "n": N, "k": K, "brute_reads": a.reads, "map_reads": b.reads, "count": fast}))
