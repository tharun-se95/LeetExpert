"""Recomputes every claim the remove-while-iterating reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
The code/ files are the exact code the reel shows; gen.py renders them verbatim.
"""
import importlib.util, random, timeit


def load(name):
    spec = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.remove_evens


bug, new_list, in_place = load("bug"), load("fix_new_list"), load("fix_in_place")

# The hook: passes the sample test, fails the next one
assert bug([1, 2, 3]) == [1, 3]
assert bug([2, 4, 6, 7]) == [4, 7]
# Challenge answer: one 2 survives
assert bug([1, 2, 2, 3]) == [1, 2, 3]

# The trace the seats scene draws: the loop only ever sees 2 and 6
seen, nums = [], [2, 4, 6, 7]
for n in nums:
    seen.append((n, list(nums)))
    if n % 2 == 0:
        nums.remove(n)
assert seen == [(2, [2, 4, 6, 7]), (6, [4, 6, 7])] and nums == [4, 7]

# Both fixes agree with the obvious reference on random lists, negatives included
random.seed(8)
for _ in range(2000):
    xs = [random.randint(-20, 20) for _ in range(random.randint(0, 12))]
    want = [x for x in xs if x % 2 != 0]
    assert new_list(list(xs)) == want, xs
    assert in_place(list(xs)) == want, xs
for case in ([], [2, 4, 6, 7], [1, 2, 2, 3], [2, 2, 2], [1, 3, 5]):
    assert in_place(list(case)) == new_list(list(case)) == [x for x in case if x % 2]
# in place really is in place: the same list object, shortened
xs = [2, 4, 6, 7]
assert in_place(xs) is xs and xs == [7]

# A dict does raise
d = {1: "a", 2: "b"}
try:
    for key in d:
        del d[key]
    raise AssertionError("expected RuntimeError")
except RuntimeError as e:
    assert str(e) == "dictionary changed size during iteration"


# Cost, 100,000 numbers. The reel quotes our recorded run (2026-09-29): remove over a
# copy 7,972 ms, new list 4.0 ms, write pointer 6.1 ms. Machines differ, so re-measure
# only what the narration claims: seconds versus milliseconds, a thousandfold gap.
def remove_over_copy(nums):  # the "works but slow" version: iterate a copy, remove from the original
    for n in nums[:]:
        if n % 2 == 0:
            nums.remove(n)
    return nums


RECORDED = {"remove_ms": 7972.0, "new_list_ms": 4.0}
assert RECORDED["remove_ms"] > 7000 and RECORDED["new_list_ms"] < 5
assert 1900 < RECORDED["remove_ms"] / RECORDED["new_list_ms"] < 2100  # the "about 2,000x" chip
random.seed(1)
base = [random.randrange(10**6) for _ in range(100_000)]
assert remove_over_copy(list(base)) == new_list(list(base))
t_rm = min(timeit.repeat(lambda: remove_over_copy(list(base)), number=1, repeat=1))
t_nl = min(timeit.repeat(lambda: new_list(list(base)), number=1, repeat=3))
print(f"this machine: remove {t_rm * 1000:.0f} ms, new list {t_nl * 1000:.1f} ms, {t_rm / t_nl:.0f}x")
assert t_rm / t_nl > 300, "the gap is no longer seconds versus milliseconds"

print("all reel claims verified (python)")
