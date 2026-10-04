"""Facts for the space-complexity carousel: extra slots allocated, and frames on the call stack."""
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/big-o/space-complexity.md").read_text()


def bare(block):
    """A lesson block as the slide shows it: comments removed, comment-only lines dropped."""
    src = block.rstrip().splitlines()
    return "\n".join(s for l, s in ((l, re.sub(r"\s*#.*$", "", l)) for l in src) if s.strip() or not l.strip()) + "\n"


blocks = re.findall(r"```python\n(.*?)```", lesson, re.S)
shown = bare(next(b for b in blocks if "def max_of" in b)) + "\n" + bare(next(b for b in blocks if "def sum_to" in b))
if "--write" in sys.argv:
    Path("code/space.py").write_text(shown)
assert Path("code/space.py").read_text() == shown, "code/space.py is not the lesson's two blocks without their comments"

spec = importlib.util.spec_from_file_location("space", "code/space.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

N = 500
nums = list(range(N, 0, -1))
copy = mod.sorted_copy(nums)
assert copy is not nums and copy == sorted(nums) and mod.max_of(nums) == N


def deepest(fn, n):
    """The most frames of the shown code on the stack at once."""
    depth = peak = 0

    def tracer(frame, event, arg):
        nonlocal depth, peak
        if frame.f_code.co_filename.endswith("space.py"):
            if event == "call":
                depth += 1
                peak = max(peak, depth)
            elif event == "return":
                depth -= 1
        return tracer

    sys.settrace(tracer)
    try:
        result = fn(n)
    finally:
        sys.settrace(None)
    assert result == n * (n + 1) // 2
    return peak


BIG = 100_000
assert "sum_to(100_000)" in lesson
try:
    mod.sum_to(BIG)
    raise SystemExit("sum_to(100_000) did not overflow")
except RecursionError:
    pass
assert mod.sum_iter(BIG) == BIG * (BIG + 1) // 2

print(json.dumps({"n": N, "copy_cells": len(copy), "frames_rec": deepest(mod.sum_to, N),
                  "frames_iter": deepest(mod.sum_iter, N), "big": BIG}))
