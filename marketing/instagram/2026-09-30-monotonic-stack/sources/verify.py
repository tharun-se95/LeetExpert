"""Recomputes every claim the monotonic-stack reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import importlib.util, json, random, re, timeit
from pathlib import Path
from mstrace import stack_events

ROOT = Path(__file__).resolve().parents[4]


def load(name):
    s = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return m.next_greater


ng, ng_values = load("next_greater"), load("value_stack_bug")
lesson = (ROOT / "courses/dsa/stacks/monotonic-stack.md").read_text()
# the shown code is the lesson's, comments and type hints aside
lesson_py = re.search(r"```python\n(def next_greater.*?)\n```", lesson, re.S).group(1)
strip = lambda src: [re.sub(r"\s+#.*$", "", l).replace(": list[int]", "").replace(" -> list[int]", "").rstrip() for l in src.strip().split("\n")]
assert strip(lesson_py) == strip(Path("code/next_greater.py").read_text())
viz = json.loads(re.search(r'```viz\n(\{ "id": "monotonic-stack".*?\})\n```', lesson).group(1))
assert viz["data"] == [2, 1, 5, 3]

# the trace the reel animates: push 2, push 1, 5 pops 1 then 2, push 5, push 3
ev = stack_events([2, 1, 5, 3])
assert ev == [("push", 0), ("push", 1), ("pop", 1, 2), ("pop", 0, 2), ("push", 2), ("push", 3)]
assert ng([2, 1, 5, 3]) == [5, 5, -1, -1]
# the trap: values instead of indexes; fine without duplicates, broken with them
assert ng_values([2, 1, 5, 3]) == [5, 5, -1, -1]
assert ng([1, 1, 3]) == [3, 3, -1] and ng_values([1, 1, 3]) == [3, -1, -1]
# challenge
assert ng([4, 3, 2, 5]) == [5, 5, 5, -1]

# the stack equals brute force on random inputs; each index is pushed once and popped at most once
def brute(nums):
    return [next((y for y in nums[i + 1:] if y > x), -1) for i, x in enumerate(nums)]
random.seed(16)
for _ in range(2000):
    xs = [random.randint(0, 9) for _ in range(random.randint(0, 14))]
    assert ng(xs) == brute(xs)
    evs = stack_events(xs)
    assert sum(e[0] == "push" for e in evs) == len(xs) and sum(e[0] == "pop" for e in evs) <= len(xs)

# the lesson's Daily Temperatures cases, solved with the same shape (index distance instead of value)
dt = (ROOT / "courses/dsa/stacks/daily-temperatures.md").read_text()
def daily(t):
    ans, st = [0] * len(t), []
    for i, x in enumerate(t):
        while st and t[st[-1]] < x:
            j = st.pop(); ans[j] = i - j
        st.append(i)
    return ans
for c in json.loads(re.search(r"```sandbox\n(.*?)\n```", dt, re.S).group(1))["cases"]:
    assert daily(*c["args"]) == c["expect"]

# Speed: 10,000 numbers, descending (the brute force's worst case). Recorded run (2026-09-30):
# checking right of every number 953 ms, the stack 0.6 ms.
RECORDED = {"brute_ms": 953, "stack_ms": 0.6}
assert 900 <= RECORDED["brute_ms"] < 1000 and RECORDED["stack_ms"] < 1  # "950 ms", "under one"
desc = list(range(10_000, 0, -1))
assert ng(desc) == brute(desc)
tb = min(timeit.repeat(lambda: brute(desc), number=1, repeat=1)); ts = min(timeit.repeat(lambda: ng(desc), number=1, repeat=3))
print(f"this machine: brute {tb * 1000:.0f} ms, stack {ts * 1000:.2f} ms, {tb / ts:.0f}x")
assert tb / ts > 100

print("all reel claims verified (python)")
