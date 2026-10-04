"""Facts for the insertion-sort carousel: shifts and comparisons on sorted, reversed and nearly sorted input."""
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/sorting/baseline-sorts.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def insertion_sort" in b)
src = block.rstrip().splitlines()
shown = "\n".join(s for l, s in ((l, re.sub(r"\s*#.*$", "", l)) for l in src) if s.strip() or not l.strip()) + "\n"
if "--write" in sys.argv:
    Path("code/insertion_sort.py").write_text(shown)
assert Path("code/insertion_sort.py").read_text() == shown, "code/insertion_sort.py is not the lesson's block without its comments"
assert "`1+2+3+4 = 10` shifts total" in lesson

spec = importlib.util.spec_from_file_location("insertion_sort", "code/insertion_sort.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class Counted(list):
    reads = writes = 0

    def __getitem__(self, i):
        self.reads += 1
        return list.__getitem__(self, i)

    def __setitem__(self, i, v):
        self.writes += 1
        list.__setitem__(self, i, v)


def run(values):
    """(shifts, comparisons). Each pass reads its key once and writes it once; a shift is one
    more read and write; every other read is a comparison."""
    a = Counted(values)
    mod.insertion_sort(a)
    assert list(a) == sorted(values)
    passes = len(values) - 1
    shifts = a.writes - passes
    return shifts, a.reads - passes - shifts


def inversions(values):
    return sum(values[i] > values[j] for i in range(len(values)) for j in range(i + 1, len(values)))


small = [5, 4, 3, 2, 1]
scrambled = [(i * 37) % 101 for i in range(101)]
for values in (small, scrambled):
    assert run(values)[0] == inversions(values)   # every shift resolves exactly one inversion

N, PAIRS = 1000, 10
ordered = list(range(N))
nearly = list(ordered)
for i in range(0, N, N // PAIRS):
    nearly[i], nearly[i + 1] = nearly[i + 1], nearly[i]
assert inversions(nearly) == PAIRS

print(json.dumps({"small_shifts": run(small)[0], "n": N, "sorted_shifts": run(ordered)[0], "sorted_cmp": run(ordered)[1],
                  "reversed_shifts": run(ordered[::-1])[0], "pairs": PAIRS, "nearly_shifts": run(nearly)[0]}))
