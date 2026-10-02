"""Recomputes every claim the coach reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
The test cases come from the lesson itself (courses/dsa/hash-tables/two-sum.md), the
same cases the product ran in screens/, so nothing here is a hand-typed expectation.
"""
import importlib.util, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
lesson = (ROOT / "courses/dsa/hash-tables/two-sum.md").read_text()
spec = json.loads(re.search(r"```sandbox\n(.*?)\n```", lesson, re.S).group(1))
CASES = [(c["args"], c["expect"]) for c in spec["cases"]]


def load(name):
    s = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return m.two_sum


def run(fn):
    """[(passed, got, expected)] per lesson case, in order."""
    return [(fn(*[json.loads(json.dumps(a)) for a in args]) == want, fn(*args), want) for args, want in CASES]


draft, swapped, fixed = load("draft"), load("swapped"), load("fixed")

# Run 1: two of four pass; the first failure is case 2, [3,2,4] target 6 -> [0,0] vs [1,2]
r1 = run(draft)
assert sum(p for p, _, _ in r1) == 2
first = next(j for j, (p, _, _) in enumerate(r1) if not p)
assert first == 1 and CASES[first][0] == [[3, 2, 4], 6] and r1[first][1:] == ([0, 0], [1, 2])
# the coach's words, rebuilt the way diagnose.ts builds them (name returned got; expected want)
assert f"two_sum({CASES[first][0][0]}, {CASES[first][0][1]}) returned {r1[first][1]}; expected {r1[first][2]}." == \
    "two_sum([3, 2, 4], 6) returned [0, 0]; expected [1, 2]."

# Run 2 (the pair swapped): none pass; now case 1 breaks first: [1,0] vs [0,1]
r2 = run(swapped)
assert sum(p for p, _, _ in r2) == 0 and r2[0][1:] == ([1, 0], [0, 1])

# The walk: on [3,2,4], i=0 n=3 stores {3: 0}, then 6-3=3 is found: the three we just stored
seen = {}
seen[3] = 0
assert 6 - 3 in seen and seen[6 - 3] == 0

# The fix: check first, then store. All four pass, and the challenge [3,3] -> [0,1]
assert all(p for p, _, _ in run(fixed))
assert fixed([3, 3], 6) == [0, 1]
# with the fix the map only holds earlier indices, so an answer never repeats an index
import random
random.seed(9)
for _ in range(3000):
    xs = [random.randint(-9, 9) for _ in range(random.randint(2, 9))]
    t = random.randint(-15, 15)
    got = fixed(xs, t)
    if got is not None:
        a, b = got
        assert a < b and xs[a] + xs[b] == t

# The screens show what code/ holds: the capture script types exactly draft.py
typed = re.search(r"const lines = (\[.*?\]);", Path("capture.mjs").read_text()).group(1)
lines = json.loads(typed)
assert [l.strip() for l in Path("code/draft.py").read_text().strip().split("\n")] == lines
assert 'type("return [i, seen[target - n]]"' in Path("capture.mjs").read_text()

print("all reel claims verified (python)")
