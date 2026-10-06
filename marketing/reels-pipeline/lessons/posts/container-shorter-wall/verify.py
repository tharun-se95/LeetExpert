"""Facts for the container carousel: containers measured by every pair and by moving the shorter wall."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/two-pointers/container-with-most-water.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def max_area" in b)
source = Path("code/container.py").read_text()
# the shown function is the lesson's block with its comments stripped
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert source.endswith(bare), "max_area is not the lesson's block"
assert "height = [1,8,6,2,5,4,8,3,7]  →  49" in lesson

calls = {"n": 0}


def counting_max(*args):
    """Both functions call max once per container they measure."""
    calls["n"] += 1
    return max(*args)


mod = {"max": counting_max}
exec(source, mod)


def measured(fn, height):
    calls["n"] = 0
    return fn(height), calls["n"]


example = [1, 8, 6, 2, 5, 4, 8, 3, 7]
(a, small_pairs), (b, small_steps) = measured(mod["brute_area"], example), measured(mod["max_area"], example)
assert a == b == 49
# the first measurement is lines 0 and 8; nothing else that uses line 0 beats it
first = (len(example) - 1) * min(example[0], example[-1])
line0 = max(j * min(example[0], example[j]) for j in range(1, len(example)))
assert example[0] <= example[-1] and first == line0

N = 1000
heights = [(i * 37 + 11) % 101 for i in range(N)]   # no randomness, so both runtimes agree
(c, pairs), (d, steps) = measured(mod["brute_area"], heights), measured(mod["max_area"], heights)
assert c == d

print(json.dumps({"answer": a, "small_pairs": small_pairs, "small_steps": small_steps, "first_area": first,
                  "line0_best": line0, "n": N, "pairs": pairs, "steps": steps}))
