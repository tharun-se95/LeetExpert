"""Recomputes every claim the call-stack reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import importlib.util, re, sys
from pathlib import Path
from frames import factorial_events

ROOT = Path(__file__).resolve().parents[4]


def load(name):
    s = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return getattr(m, name)


factorial, broken = load("factorial"), load("broken")
lesson = (ROOT / "courses/dsa/recursion-backtracking/the-call-stack-and-base-cases.md").read_text()
strip = lambda src: [x for x in (re.sub(r"\s*#.*$", "", l).replace(": int", "").replace(" -> int", "").rstrip() for l in src.strip().split("\n")) if x]
for name in ("factorial", "broken"):
    lesson_py = re.search(rf"```python\n(def {name}.*?)\n```", lesson, re.S).group(1)
    assert strip(lesson_py) == strip(Path(f"code/{name}.py").read_text()), name

# the trace: calls 3, 2, 1, 0 on the way down; returns 1, 1, 2, 6 on the way up; 4 frames = n + 1
ev = factorial_events(3)
assert ev == [("call", 3), ("call", 2), ("call", 1), ("call", 0), ("return", 0, 1), ("return", 1, 1), ("return", 2, 2), ("return", 3, 6)]
depth = max(sum(1 for e in ev[:i + 1] if e[0] == "call") - sum(1 for e in ev[:i + 1] if e[0] == "return") for i in range(len(ev)))
assert depth == 4 == 3 + 1 and factorial(3) == 6
assert factorial(0) == 1 and factorial(5) == 120
# challenge: factorial(5) is 6 frames deep
ev5 = factorial_events(5)
assert max(sum(e[0] == "call" for e in ev5[:i + 1]) - sum(e[0] == "return" for e in ev5[:i + 1]) for i in range(len(ev5))) == 6

# the limit: CPython's default is 1000; factorial(1000) crashes, (998) does not
assert sys.getrecursionlimit() == 1000
factorial(998)
try:
    factorial(1000)
    raise AssertionError("expected RecursionError")
except RecursionError as e:
    assert str(e) == "maximum recursion depth exceeded"
# the broken base case: 3 -> 1 -> -1 -> ... never 0; it crashes rather than hangs
seq, n = [], 3
for _ in range(5):
    seq.append(n); n -= 2
assert seq == [3, 1, -1, -3, -5] and 0 not in seq
try:
    broken(3)
    raise AssertionError("expected RecursionError")
except RecursionError as e:
    assert str(e) == "maximum recursion depth exceeded"
assert broken(4) == 4 * 2 * 1  # from an even n it does reach 0

print("all reel claims verified (python)")
