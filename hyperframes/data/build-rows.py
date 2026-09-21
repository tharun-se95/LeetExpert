"""Generate render rows for the range-scan primitive by EXECUTING each algorithm.

Never hand-write a trace. Every {lo,hi,mid} below is produced by running the
real loop, so the animation cannot disagree with the algorithm it depicts.
"""
import json, os

def binary_search(arr, target):
    steps, lo, hi = [], 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            steps.append({"lo": lo, "hi": hi, "mid": mid,
                          "note": f"arr[{mid}] = {arr[mid]} — <b>found the target</b>."})
            return steps
        if arr[mid] < target:
            steps.append({"lo": lo, "hi": hi, "mid": mid,
                          "note": f"arr[{mid}] = {arr[mid]} &lt; {target}. Everything at or left of {mid} is ruled out."})
            lo = mid + 1
        else:
            steps.append({"lo": lo, "hi": hi, "mid": mid,
                          "note": f"arr[{mid}] = {arr[mid]} &gt; {target}. Everything at or right of {mid} is ruled out."})
            hi = mid - 1
    return steps

def two_pointers(arr, target):
    steps, lo, hi = [], 0, len(arr) - 1
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s == target:
            steps.append({"lo": lo, "hi": hi, "mid": lo,
                          "note": f"{arr[lo]} + {arr[hi]} = {target}. <b>That is the pair.</b>"})
            return steps
        if s < target:
            steps.append({"lo": lo, "hi": hi, "mid": lo,
                          "note": f"{arr[lo]} + {arr[hi]} = {s} &lt; {target}. Only a bigger left value can help — move <b>lo</b>."})
            lo += 1
        else:
            steps.append({"lo": lo, "hi": hi, "mid": lo,
                          "note": f"{arr[lo]} + {arr[hi]} = {s} &gt; {target}. Only a smaller right value can help — move <b>hi</b>."})
            hi -= 1
    return steps

def fixed_window(arr, k):
    steps, best = [], None
    cur = sum(arr[:k])
    for start in range(0, len(arr) - k + 1):
        if start:
            cur += arr[start + k - 1] - arr[start - 1]
        best = cur if best is None else max(best, cur)
        tag = " <b>Best so far.</b>" if cur == best else ""
        steps.append({"lo": start, "hi": start + k - 1, "mid": start,
                      "note": f"Window [{start}..{start+k-1}] sums to {cur}.{tag}"})
    return steps

BS_ARR, BS_T = [1, 3, 5, 7, 9, 11, 13, 15], 13
TP_ARR, TP_T = [2, 7, 11, 15, 19, 24], 30
SW_ARR, SW_K = [4, 2, 1, 7, 8, 1, 2, 8], 3

# Assert the scenarios are real before drawing them.
assert BS_T in BS_ARR, "binary-search target must exist in the array"
assert binary_search(BS_ARR, BS_T)[-1]["mid"] == BS_ARR.index(BS_T)
tp = two_pointers(TP_ARR, TP_T)
assert TP_ARR[tp[-1]["lo"]] + TP_ARR[tp[-1]["hi"]] == TP_T, "two-pointer must actually land on the pair"
sw = fixed_window(SW_ARR, SW_K)
assert max(sum(SW_ARR[i:i+SW_K]) for i in range(len(SW_ARR)-SW_K+1)) == 16

rows = [
  {"_out": "binary-search", "family": "ordering-search", "theme": "dark",
   "eyebrow": "Ordering & Search", "title": "Binary Search",
   "values": ",".join(map(str, BS_ARR)), "showMid": True,
   "loLabel": "lo", "hiLabel": "hi", "midLabel": "mid",
   "steps": json.dumps(binary_search(BS_ARR, BS_T))},
  {"_out": "two-pointers", "family": "pointer-movement", "theme": "dark",
   "eyebrow": "Pointer Movement", "title": "Two Pointers",
   "values": ",".join(map(str, TP_ARR)), "showMid": False,
   "loLabel": "lo", "hiLabel": "hi", "midLabel": "mid",
   "steps": json.dumps(tp)},
  {"_out": "sliding-window", "family": "linear-traversal", "theme": "light",
   "eyebrow": "Linear Traversal", "title": "Sliding Window",
   "values": ",".join(map(str, SW_ARR)), "showMid": False,
   "loLabel": "start", "hiLabel": "end", "midLabel": "mid",
   "steps": json.dumps(sw)},
]
out = os.path.join(os.path.dirname(__file__), "rows.json")
json.dump(rows, open(out, "w"), indent=2)
for r in rows:
    print(f'{r["_out"]:<16} {len(json.loads(r["steps"]))} steps  family={r["family"]:<18} theme={r["theme"]}')
print("\nwrote", out)
