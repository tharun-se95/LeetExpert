"""Facts for the growth-beats-hardware carousel.

The counts at n = 1,000 are measured by running the lesson's two versions. The times are the
lesson's model, not a stopwatch: about 10**8 simple operations a second, n*n/2 operations for
version A and n for version B.
"""
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/big-o/why-efficiency-matters.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def has_pair_a" in b)
src = block.rstrip().splitlines()
bare = "\n".join(s for l, s in ((l, re.sub(r"\s*#.*$", "", l)) for l in src) if s.strip() or not l.strip()) + "\n"
assert Path("code/has_pair.py").read_text() == bare, "code/has_pair.py is not the lesson's block without its comments"

spec = importlib.util.spec_from_file_location("has_pair", "code/has_pair.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class Reads(list):
    reads = 0

    def __getitem__(self, i):
        Reads.reads += 1
        return list.__getitem__(self, i)


N = 1000
nums = Reads(range(N))            # no two of 0..999 sum to -1
assert mod.has_pair_a(nums, -1) is False and mod.has_pair_b(list(range(N)), -1) is False
assert mod.has_pair_a([3, 4, 9], 13) and mod.has_pair_b([3, 4, 9], 13)
checks_a = Reads.reads // 2        # each pair check reads two elements
assert checks_a == N * (N - 1) // 2

RATE = 10 ** 8
assert "10⁸ simple operations per second" in lesson
BIG, HUGE = 100_000, 10_000_000
SPEEDUP = 100
quad = next(k for k in range(1, SPEEDUP + 1) if k * k >= SPEEDUP)   # k times the data costs k*k the work
exp = next(k for k in range(1, 64) if 2 ** k >= SPEEDUP)            # k more elements cost 2**k the work

print(json.dumps({"n1": N, "checks_a": checks_a, "checks_b": N, "big": BIG, "huge": HUGE,
                  "a_seconds": BIG * BIG // 2 // RATE, "b_ms": BIG * 1000 // RATE,
                  "a_days": f"{HUGE * HUGE / 2 / RATE / 86400:.1f}", "b_seconds": f"{HUGE / RATE:.1f}",
                  "speedup": SPEEDUP, "quad_gain": quad, "exp_gain": exp}))
