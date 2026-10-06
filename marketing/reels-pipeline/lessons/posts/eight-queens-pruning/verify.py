"""Facts for the eight-queens carousel: candidate placements against queens actually placed by backtracking."""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/recursion-backtracking/n-queens.md").read_text()
assert "which for `n = 8` is already over 4 billion candidate" in lesson
assert "maintain three sets — used columns, used `row − col` values,\nand used `row + col` values" in lesson

spec = {}
exec(Path("code/queens.py").read_text(), spec)
# the lesson's own solver, run as written, must find the same boards the shown code counts
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def solve_n_queens(" in b)
theirs = {}
exec(block, theirs)


class CountingSet(set):
    """A set that counts its adds: the shown code adds a column once per queen it places."""
    adds = 0

    def add(self, x):
        CountingSet.adds += 1
        set.add(self, x)


def run(n):
    CountingSet.adds = 0
    found = spec["place"](0, n, CountingSet(), set(), set())
    assert found == len(theirs["solve_n_queens"](n))
    return found, CountingSet.adds


four, _ = run(4)
assert four == 2 and theirs["solve_n_queens"](4) == [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]
N = 8
solutions, placed = run(N)

print(json.dumps({"n": N, "cells": N * N, "choose": math.comb(N * N, N), "per_row": N ** N,
                  "placed": placed, "solutions": solutions, "small_solutions": four}))
