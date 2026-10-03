"""Facts for the Move Zeroes carousel: counts every write each version makes."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
# the shown code is the course's checked-in reference solution, byte for byte
assert Path("code/move_zeroes.py").read_text() == (ROOT / "web/tests/reference/arrays/move-zeroes.py").read_text()


def load(name, fn):
    spec = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return getattr(mod, fn)


compact, shuffle = load("move_zeroes", "move_zeroes"), load("shuffle", "move_zeroes_shuffle")


class Counted(list):
    writes = 0

    def __setitem__(self, i, v):
        self.writes += 1
        list.__setitem__(self, i, v)


def run(fn, values):
    a = Counted(values)
    fn(a)
    assert list(a) == [x for x in values if x != 0] + [0] * values.count(0)  # order kept, zeroes last
    return list(a), a.writes


example = [0, 1, 0, 3, 12]  # the lesson's example
assert "nums = [0, 1, 0, 3, 12]  →  [1, 3, 12, 0, 0]" in (ROOT / "courses/dsa/arrays/move-zeroes.md").read_text()
out, example_writes = run(compact, example)
assert run(shuffle, example)[0] == out

N = 1000
big = [i % 2 for i in range(N)]  # every other one a zero
_, ref_writes = run(compact, big)
_, shuffle_writes = run(shuffle, big)

print(json.dumps({"example_out": "[" + ", ".join(map(str, out)) + "]", "example_writes": example_writes, "n": N,
                  "ref_writes": ref_writes, "shuffle_writes": shuffle_writes, "ratio": shuffle_writes // ref_writes}))
