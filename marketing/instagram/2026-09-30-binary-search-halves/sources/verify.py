"""Recomputes every claim the binary-search reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import importlib.util, json, math, random, re
from pathlib import Path
from bstrace import search_trace

s = importlib.util.spec_from_file_location("bs", "code/binary_search.py")
m = importlib.util.module_from_spec(s)
s.loader.exec_module(m)
binary_search = m.binary_search

ROOT = Path(__file__).resolve().parents[4]
lesson = (ROOT / "courses/dsa/binary-search/the-invariant-template.md").read_text()
viz = json.loads(re.search(r'```viz\n(\{ "id": "binary-search".*?\})\n```', lesson).group(1))
ARR, T = viz["data"], viz["target"]
assert (ARR, T) == ([1, 3, 5, 7, 9, 11, 13], 9)
# the shown code is the lesson's template, comments aside
lesson_py = re.search(r"```python\n(def binary_search.*?)\n```", lesson, re.S).group(1)
strip = lambda src: [re.sub(r"\s+#.*$", "", l).rstrip() for l in src.strip().split("\n")]
assert strip(lesson_py) == strip(Path("code/binary_search.py").read_text().replace("def binary_search(arr, target):", "def binary_search(arr: list[int], target: int) -> int:"))

# the trace: mid 7 (low) -> mid 11 (high) -> mid 9 (found), 3 checks
tr = search_trace(ARR, T)
assert [(ARR[mid], v) for _, _, mid, v in tr] == [(7, "low"), (11, "high"), (9, "found")]
assert [(lo, hi) for lo, hi, _, _ in tr] == [(0, 6), (4, 6), (4, 4)]
assert binary_search(ARR, T) == tr[-1][2] == 4
# challenge: 13 takes 3 checks too
assert len(search_trace(ARR, 13)) == 3 and binary_search(ARR, 13) == 6

# scale: the most checks any target (present or absent) needs, found by running the search
def worst_checks(n):
    # worst case of this template is floor(log2 n) + 1; confirm it by running the search on
    # every target for small n, and on the extreme targets for large n
    return math.floor(math.log2(n)) + 1
for n in range(1, 300):
    arr = list(range(0, 2 * n, 2))
    most = max(len(search_trace(arr, t, cap=10**6)) for t in range(-1, 2 * n + 1))
    assert most == worst_checks(n), n
for n in (10**6, 10**9):
    arr = range(n)  # a range indexes like a sorted list without allocating it
    most = max(len(search_trace(arr, t, cap=10**6)) for t in (-1, 0, n - 1, n, n // 2, n // 3))
    assert most <= worst_checks(n)
assert worst_checks(10**6) == 20 and worst_checks(10**9) == 30

# the bug: lo = mid on [1, 3], target 3 never moves (capped here at 50 checks)
stuck = search_trace([1, 3], 3, lo_update=lambda mid: mid, cap=50)
assert len(stuck) == 50 and all((lo, hi, mid) == (0, 1, 0) for lo, hi, mid, _ in stuck)

# the code agrees with a linear scan on random sorted arrays
random.seed(13)
for _ in range(3000):
    arr = sorted(random.sample(range(-50, 50), random.randint(0, 20)))
    t = random.randint(-55, 55)
    got = binary_search(arr, t)
    assert (got == -1 and t not in arr) or arr[got] == t

print("all reel claims verified (python)")
