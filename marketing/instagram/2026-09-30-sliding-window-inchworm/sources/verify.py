"""Recomputes every claim the sliding-window reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import importlib.util, json, random, re, timeit
from pathlib import Path
from wintrace import window_trace

ROOT = Path(__file__).resolve().parents[4]


def load(path, name="min_subarray_len"):
    s = importlib.util.spec_from_file_location(path, path)
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return getattr(m, name)


fix, bug = load("code/min_window.py"), load("code/min_window_if_bug.py")
lesson = (ROOT / "courses/dsa/sliding-window/minimum-size-subarray-sum.md").read_text()
CASES = [(c["args"], c["expect"]) for c in json.loads(re.search(r"```sandbox\n(.*?)\n```", lesson, re.S).group(1))["cases"]]

# the fix passes every lesson case; the `if` bug fails four, including the headline one (4, not 2)
assert all(fix(*a) == e for a, e in CASES)
assert [bug(*a) == e for a, e in CASES].count(False) == 4
assert bug(7, [2, 3, 1, 2, 4, 3]) == 4 and fix(7, [2, 3, 1, 2, 4, 3]) == 2
# challenge (a lesson case)
assert fix(11, [1, 2, 3, 4, 5]) == 3

# the trace the reel animates equals the lesson's own trace block, state for state
dyn = (ROOT / "courses/dsa/sliding-window/dynamic-windows.md").read_text()
block = re.search(r"target sum ≥ 7, nums = \[2, 3, 1, 2, 4, 3\]\n\n(.*?)\n\nend of array", dyn, re.S).group(1)
want = [(m.group(1), [int(x) for x in m.group(2).split(",")], int(m.group(3)))
        for m in re.finditer(r"(right=\d+|left→\d+): \[([\d,]+)\]\s+sum=(\d+)", block)]
tr = window_trace(7, [2, 3, 1, 2, 4, 3])
got = [(("right=%d" % r) if k == "grow" else ("left→%d" % l), [2, 3, 1, 2, 4, 3][l:r + 1], t) for k, l, r, t, _ in tr]
assert got == want, (got, want)
assert tr[-1][4] == 2  # best = 2, from [4, 3]

# negatives break it: target 5 on [4,-2,-3,4,1], the window finds nothing; [4,1] works
def brute(target, nums):
    lens = [j - i + 1 for i in range(len(nums)) for j in range(i, len(nums)) if sum(nums[i:j + 1]) >= target]
    return min(lens) if lens else 0
assert fix(5, [4, -2, -3, 4, 1]) == 0 and brute(5, [4, -2, -3, 4, 1]) == 2 and 4 + 1 == 5

# the fix agrees with brute force on random non-negative lists
random.seed(11)
for _ in range(2000):
    xs = [random.randint(0, 9) for _ in range(random.randint(1, 12))]
    t = random.randint(1, 40)
    assert fix(t, xs) == brute(t, xs), (t, xs)

# Speed, 10,000 numbers. Recorded run (2026-09-30): every stretch 848 ms, the window 1.18 ms.
RECORDED = {"brute_ms": 848, "window_ms": 1.18}
assert 800 <= RECORDED["brute_ms"] < 900 and 0.5 < RECORDED["window_ms"] < 1.5  # "850 ms", "about one"
random.seed(1)
nums = [random.randint(1, 100) for _ in range(10_000)]
t = 10_000 * 50 // 3
def every_stretch():
    best = 0
    for i in range(len(nums)):
        s = 0
        for j in range(i, len(nums)):
            s += nums[j]
            if s >= t:
                best = j - i + 1 if best == 0 else min(best, j - i + 1)
                break
    return best
assert every_stretch() == fix(t, nums)
tb = min(timeit.repeat(every_stretch, number=1, repeat=1)); tw = min(timeit.repeat(lambda: fix(t, nums), number=1, repeat=3))
print(f"this machine: every stretch {tb * 1000:.0f} ms, window {tw * 1000:.2f} ms, {tb / tw:.0f}x")
assert tb / tw > 100

print("all reel claims verified (python)")
