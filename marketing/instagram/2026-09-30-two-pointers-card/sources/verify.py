"""Recomputes every claim the two-pointers card reel shows or says, in Python.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
"""
import importlib.util, json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent

# the card is the product's cheatsheet as it is today: re-dump and compare
fresh = subprocess.run(["npx", "tsx", str(HERE / "dump_sheet.ts")], cwd=ROOT / "web", capture_output=True, text=True, check=True).stdout
assert json.loads(fresh) == json.load(open(HERE / "sheet.json")), "sheet.json drifted from gold.ts: re-run dump_sheet.ts"
data = json.loads(fresh)
assert data["counts"] == {"cheatsheets": 21, "practiceModules": 21, "modules": 24}  # "twenty one, one for every module with practice"
sheet = data["sheet"]
assert [s["pattern"] for s in sheet["smells"]] == ["Opposite ends", "Fast / slow", "Inward from tallest hope", "One pointer each"]


def load(name, fn):
    s = importlib.util.spec_from_file_location(name, HERE / f"code/{name}.py")
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return getattr(m, fn)


def cases(path):
    md = (ROOT / "courses/dsa" / path).read_text()
    return [(c["args"], c["expect"]) for c in json.loads(re.search(r"```sandbox\n(.*?)\n```", md, re.S).group(1))["cases"]]


two_sum = load("opposite_ends", "two_sum")
for args, want in cases("two-pointers/two-sum-ii.md"):
    assert two_sum(*args) == want, args
remove_duplicates = load("fast_slow", "remove_duplicates")
for args, want in cases("arrays/remove-duplicates-sorted.md"):
    nums = list(args[0]); k = remove_duplicates(nums)
    assert nums[:k] == want, args  # the lesson checks the kept prefix
max_area = load("inward_area", "max_area")
for args, want in cases("two-pointers/container-with-most-water.md"):
    assert max_area(*args) == want, args
merge = load("merge_walk", "merge")
for args, want in cases("linked-lists/merge-two-sorted.md"):
    assert merge(*args) == want, args  # the lesson's lists, as arrays

# the crossing-pointers trap: with l <= r, one element pairs with itself
def two_sum_le(numbers, target):
    l, r = 0, len(numbers) - 1
    while l <= r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        l, r = (l + 1, r) if s < target else (l, r - 1)
assert two_sum_le([1, 3, 5], 6) == [1, 3] and two_sum_le([3], 6) == [1, 1] and two_sum([3], 6) is None
# the sort prerequisite: on unsorted data opposite ends misses a pair that exists
assert two_sum([1, 4, 2, 3], 5) is None and 1 + 4 == 5          # misses a real pair when unsorted
assert two_sum(sorted([1, 4, 2, 3]), 5) is not None                 # sort first and it finds one
# challenge: a palindrome check is opposite ends
def is_pal(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1; r -= 1
    return True
assert is_pal("racecar") and not is_pal("race")

print("all reel claims verified (python)")
