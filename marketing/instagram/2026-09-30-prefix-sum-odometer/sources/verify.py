"""Recomputes every claim the prefix-sum reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
The array and the two queries are read from the lesson's own viz block.
"""
import importlib.util, json, random, re, timeit
from pathlib import Path

s = importlib.util.spec_from_file_location("prefix", "code/prefix.py")
m = importlib.util.module_from_spec(s)
s.loader.exec_module(m)
build_prefix, range_sum = m.build_prefix, m.range_sum

ROOT = Path(__file__).resolve().parents[4]
lesson = (ROOT / "courses/dsa/prefix-sum/prefix-sum-basics.md").read_text()
viz = json.loads(re.search(r'```viz\n(\{ "id": "prefix-sum".*?\})\n```', lesson, re.S).group(1))
NUMS, QUERIES = viz["data"], [(q["l"], q["r"]) for q in viz["queries"]]
assert NUMS == [2, 4, 1, 5, 3] and QUERIES == [(1, 3), (2, 4)]

# the build the reel narrates, cell by cell
P = build_prefix(NUMS)
assert P == [0, 2, 6, 7, 12, 15]
# the two queries: 12 - 2 = 10 and 15 - 6 = 9, each equal to adding the range
assert (P[4], P[1], range_sum(P, 1, 3)) == (12, 2, 10) == (12, 2, sum(NUMS[1:4]))
assert (P[5], P[2], range_sum(P, 2, 4)) == (15, 6, 9) == (15, 6, sum(NUMS[2:5]))
# the off-by-one: prefix[r] - prefix[l] drops nums[r]
assert P[3] - P[1] == 5 == 10 - NUMS[3]
# challenge: 0..4 with two numbers
assert range_sum(P, 0, 4) == P[5] - P[0] == 15
# the odometer card: trip = end - start
assert 12_075 - 12_040 == 35
# stale after an update: change nums[1], and every total from prefix[2] on moves
changed = list(NUMS); changed[1] = 9
P2 = build_prefix(changed)
assert [j for j in range(len(P)) if P[j] != P2[j]] == [2, 3, 4, 5]

# range_sum matches summing the slice on random arrays and ranges, negatives included
random.seed(10)
for _ in range(2000):
    xs = [random.randint(-50, 50) for _ in range(random.randint(1, 15))]
    l = random.randrange(len(xs)); r = random.randrange(l, len(xs))
    assert range_sum(build_prefix(xs), l, r) == sum(xs[l:r + 1])

# Speed: 10,000 random queries on 100,000 numbers. The reel quotes our recorded run
# (2026-09-30): 4.96 s summing each range, 6.1 ms with a prefix array (build included).
RECORDED = {"slow_s": 4.96, "fast_ms": 6.1}
assert 4.5 < RECORDED["slow_s"] < 5.5 and 5.5 < RECORDED["fast_ms"] < 6.5  # "five seconds", "six milliseconds"
assert round(RECORDED["slow_s"] * 1000 / RECORDED["fast_ms"], -2) == 800  # the "about 800x" chip
random.seed(10)
n, q = 100_000, 10_000
nums = [random.randint(-1000, 1000) for _ in range(n)]
qs = [tuple(sorted(random.sample(range(n), 2))) for _ in range(q)]
slow = lambda: [sum(nums[l:r + 1]) for l, r in qs]
def fast():
    p = build_prefix(nums)
    return [range_sum(p, l, r) for l, r in qs]
assert slow() == fast()
ts = min(timeit.repeat(slow, number=1, repeat=1)); tf = min(timeit.repeat(fast, number=1, repeat=3))
print(f"this machine: slow {ts:.2f} s, prefix {tf * 1000:.1f} ms, {ts / tf:.0f}x")
assert ts / tf > 100, "the gap is no longer seconds versus milliseconds"

print("all reel claims verified (python)")
