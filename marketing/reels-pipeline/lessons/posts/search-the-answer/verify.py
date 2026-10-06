"""Facts for the search-the-answer carousel: feasibility checks made by trying every speed and by binary search."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/binary-search/koko-eating-bananas.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def min_eating_speed" in b)
source = Path("code/koko.py").read_text()
# the shown function is the lesson's block with its comments stripped (its import heads the file)
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert bare.startswith("import math\n\n") and source.startswith("import math\n\n")
assert source.endswith(bare[len("import math\n\n"):]), "min_eating_speed is not the lesson's block"
assert "piles = [3,6,7,11], h = 8   →  4" in lesson
assert "1+2+2+3 = 8 ≤ 8" in lesson and "1+2+3+4 = 10 > 8" in lesson

checks = {"n": 0}


def counting_sum(xs):
    """Both functions call sum once per speed they test."""
    checks["n"] += 1
    return sum(xs)


mod = {"sum": counting_sum}
exec(source, mod)


def counted(fn, piles, h):
    checks["n"] = 0
    return fn(piles, h), checks["n"]


def hours(piles, speed):
    return sum(-(-p // speed) for p in piles)


example, H = [3, 6, 7, 11], 8
assert mod["min_eating_speed"](example, H) == mod["brute_speed"](example, H) == 4
assert hours(example, 3) == 10 and hours(example, 4) == 8
for piles, h, want in (([30, 11, 23, 4, 20], 5, 30), ([30, 11, 23, 4, 20], 6, 23)):   # the lesson's other examples
    assert mod["min_eating_speed"](piles, h) == mod["brute_speed"](piles, h) == want

big, big_h = [1_000_000, 750_000, 999_999, 250_000, 500_000], 9
(a, brute_checks), (b, binary_checks) = counted(mod["brute_speed"], big, big_h), counted(mod["min_eating_speed"], big, big_h)
assert a == b and hours(big, a) <= big_h < hours(big, a - 1)

print(json.dumps({"hours_slow": hours(example, 3), "hours_ok": hours(example, 4), "big_max": max(big), "big_h": big_h,
                  "big_answer": a, "brute_checks": brute_checks, "binary_checks": binary_checks}))
