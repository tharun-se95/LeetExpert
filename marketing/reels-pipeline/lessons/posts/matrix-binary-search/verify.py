"""Facts for the matrix binary-search carousel: counts every cell the lesson's solution reads."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
REF = ROOT / "web/tests/reference/matrix/search-a-2d-matrix.py"
# the shown code is the course's checked-in reference solution, byte for byte
assert Path("code/search_matrix.py").read_text() == REF.read_text()

spec = importlib.util.spec_from_file_location("search_matrix", "code/search_matrix.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

reads = []


class Row(list):
    """A row that records each cell read."""
    def __init__(self, r, values):
        super().__init__(values)
        self.r = r

    def __getitem__(self, c):
        reads.append((self.r, c, list.__getitem__(self, c)))
        return list.__getitem__(self, c)


def counted(matrix, target):
    reads.clear()
    found = mod.search_matrix([Row(r, row) for r, row in enumerate(matrix)], target)
    return found, list(reads)


example = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]  # the lesson's example
lesson = (ROOT / "courses/dsa/matrix/search-a-2d-matrix.md").read_text()
assert "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3 → true" in lesson
found, steps = counted(example, 3)
assert found and counted(example, 13)[0] is False
row0, col0, val0 = steps[0]

BIG = 100  # the lesson's largest m and n
big = [[2 * (r * BIG + c) for c in range(BIG)] for r in range(BIG)]
worst = 0
for target in range(-1, 2 * BIG * BIG + 1):
    found, s = counted(big, target)
    assert found == (target % 2 == 0 and 0 <= target < 2 * BIG * BIG)
    worst = max(worst, len(s))

print(json.dumps({"rows": 3, "cols": 4, "mid0": row0 * 4 + col0, "row0": row0, "col0": col0, "val0": val0,
                  "checks_example": len(steps), "big": BIG, "cells": BIG * BIG, "worst": worst}))
