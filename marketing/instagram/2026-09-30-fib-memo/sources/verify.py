"""Recomputes every claim the Fibonacci memo reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import re, sys, timeit
from collections import Counter
from pathlib import Path
from calltree import call_tree, _load

ROOT = Path(__file__).resolve().parents[4]
naive, memo = _load("naive").fib, _load("memo").fib

# the shown code is the lesson's: its first fib, and the explicit-dict memo (type hints and comments aside)
lesson = (ROOT / "courses/dsa/dynamic-programming/from-recursion-to-memoization.md").read_text()
blocks = re.findall(r"```python\n(def fib.*?)\n```", lesson, re.S)
# PEP 8 spaces an annotated default ("memo: T = None") and not a bare one ("memo=None")
hints = ((": dict[int, int] | None = ", "="), (": int", ""), (" -> int", ""))
def strip(src):
    out = []
    for l in src.strip().split("\n"):
        l = re.sub(r"\s*#.*$", "", l)
        for h, r in hints:
            l = l.replace(h, r)
        if l.strip():
            out.append(l.rstrip())
    return out
assert strip(blocks[0]) == strip(Path("code/naive.py").read_text())
assert [b for b in blocks if "memo is None" in b] and strip(next(b for b in blocks if "memo is None" in b)) == strip(Path("code/memo.py").read_text())

# correct: both agree with the definition
a, b = 0, 1
for i in range(26):
    assert naive(i) == memo(i) == a
    a, b = b, a + b

# fib(5)'s tree, recorded by running it: 15 calls, 6 distinct questions, the lesson's repeat counts
v, nodes = call_tree(5)
cnt = Counter(k for _, k, _ in nodes)
assert v == 5 and len(nodes) == 15 and len(cnt) == 6 == 5 + 1
assert (cnt[3], cnt[2], cnt[1], cnt[0]) == (2, 3, 5, 3)
# naive calls(n) = 2 fib(n+1) - 1, checked against the tracer, then used for 30 and 40
calls = lambda n: 2 * memo(n + 1) - 1
assert all(len(call_tree(n)[1]) == calls(n) for n in range(15))
assert len(call_tree(30)[1]) == calls(30) == 2_692_537          # "two point seven million"
assert calls(40) == 331_160_281                                  # "three hundred thirty one million"
assert len(call_tree(6)[1]) == calls(6) == 25                    # challenge
# memoized: every value 0..n computed once; 2n - 1 calls
for n in (5, 30, 40):
    v, nodes = call_tree(n, "memo")
    assert v == naive(n) if n <= 30 else v == 102_334_155
    assert len(nodes) == 2 * n - 1
assert len(call_tree(40, "memo")[1]) == 79                       # "seventy nine calls"

# the catch: still recursion; CPython's limit is 1000, memoized fib(1000) crashes
assert sys.getrecursionlimit() == 1000
memo(900)
try:
    memo(1000)
    raise AssertionError("expected RecursionError")
except RecursionError as e:
    assert str(e) == "maximum recursion depth exceeded"

# Speed, fib(40). Recorded run (2026-09-30): naive 14.53 s, memoized 7.14 µs.
RECORDED = {"naive_s": 14.53, "memo_us": 7.14}
assert round(RECORDED["naive_s"] * 2) / 2 == 14.5 and round(RECORDED["memo_us"]) == 7  # "fourteen and a half seconds", "seven microseconds"
tn = timeit.timeit(lambda: naive(40), number=1)
tm = min(timeit.repeat(lambda: memo(40), number=1000, repeat=5)) / 1000
print(f"this machine: naive fib(40) {tn:.2f} s, memoized {tm * 1e6:.2f} µs, {tn / tm:,.0f}x")
assert tn / tm > 100_000

print("all reel claims verified (python)")
