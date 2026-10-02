"""Recomputes every claim the max-sum-of-k reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import json, random, re, timeit
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
BUG_SRC = Path("code/bug.py").read_text()
# the fix is exactly "+ 1" applied to the AI's code, nothing else
FIX_SRC = BUG_SRC.replace("range(len(nums) - k)", "range(len(nums) - k + 1)")
assert FIX_SRC != BUG_SRC and FIX_SRC.count("+ 1") == 1


def fn(src):
    ns = {}
    exec(src, ns)
    return ns["max_sum_k"]


bug, fix = fn(BUG_SRC), fn(FIX_SRC)
slide = fn(Path("code/slide.py").read_text())

# the sample, from the fixed-size-windows lesson's viz: passes, 9
lesson = (ROOT / "courses/dsa/sliding-window/fixed-size-windows.md").read_text()
viz = json.loads(re.search(r'```viz\n(\{ "id": "sliding-window".*?\})\n```', lesson).group(1))
assert (viz["data"], viz["k"]) == ([2, 1, 5, 1, 3, 2], 3)
assert bug(viz["data"], viz["k"]) == fix(viz["data"], viz["k"]) == slide(viz["data"], viz["k"]) == 9
# the failure: [1,2,3,9], k=2 -> 5, not 12; k == n -> -inf
assert bug([1, 2, 3, 9], 2) == 5 and fix([1, 2, 3, 9], 2) == slide([1, 2, 3, 9], 2) == 12 == 3 + 9
assert bug([4, 5], 2) == float("-inf") and slide([4, 5], 2) == 9
# the frame count: a 2-wide frame on 4 numbers fits at starts 0, 1, 2; range(n - k) tries 0, 1
assert list(range(4 - 2 + 1)) == [0, 1, 2] and list(range(4 - 2)) == [0, 1]
# challenge: windows of size 3 in 10 numbers
assert 10 - 3 + 1 == 8

# the lesson's Maximum Average Subarray cases: slide passes all; the bug fails the k == n ones
avg = (ROOT / "courses/dsa/sliding-window/maximum-average-subarray.md").read_text()
cases = [(c["args"], c["expect"]) for c in json.loads(re.search(r"```sandbox\n(.*?)\n```", avg, re.S).group(1))["cases"]]
assert all(abs(slide(*a) / a[1] - e) < 1e-9 for a, e in cases)
failing = [a for a, e in cases if not abs(bug(*a) / a[1] - e) < 1e-9]
# it fails 4 of 6: every case where the last window is the best one (for k == n it is the only one)
last_is_best = [a for a, _ in cases if sum(a[0][-a[1]:]) == slide(*a)]
assert failing == last_is_best and len(failing) == 4, failing

# slide == fix == brute force on random inputs, negatives included
random.seed(12)
for _ in range(2000):
    xs = [random.randint(-20, 20) for _ in range(random.randint(1, 12))]
    k = random.randint(1, len(xs))
    want = max(sum(xs[i:i + k]) for i in range(len(xs) - k + 1))
    assert slide(xs, k) == fix(xs, k) == want

# Speed: 100,000 numbers, k = 10,000. Recorded run (2026-09-30): re-summing 12.35 s, sliding 11.7 ms.
RECORDED = {"resum_s": 12.35, "slide_ms": 11.7}
assert round(RECORDED["resum_s"]) == 12 and round(RECORDED["slide_ms"]) == 12  # "twelve seconds", "twelve milliseconds"
random.seed(12)
nums = [random.randint(-100, 100) for _ in range(100_000)]
assert fix(nums, 10_000) == slide(nums, 10_000)
tr = min(timeit.repeat(lambda: fix(nums, 10_000), number=1, repeat=1))
ts = min(timeit.repeat(lambda: slide(nums, 10_000), number=1, repeat=3))
print(f"this machine: re-sum {tr:.2f} s, slide {ts * 1000:.1f} ms, {tr / ts:.0f}x")
assert tr / ts > 100

print("all reel claims verified (python)")
