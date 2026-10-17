"""Every number the video states, computed by simulating the lesson's DynamicArray.

Source: courses/dsa/arrays/dynamic-arrays.md -- capacity starts at 1 and doubles
when an append finds length == capacity; the additive policy grows by a fixed c.
"""
import json


def simulate(n, grow, start):
    capacity, length, total, worst, worst_at, copy_sizes = start, 0, 0, 0, 0, []
    for i in range(1, n + 1):
        if length == capacity:
            total += length              # the copy moves every existing element
            copy_sizes.append(length)
            if length > worst:
                worst, worst_at = length, i
            capacity = grow(capacity)
        length += 1
    return {"appends": n, "total_copies": total, "copies_per_append": total / n,
            "worst_single_append_copies": worst, "worst_append_index": worst_at,
            "copy_sizes": copy_sizes, "final_capacity": capacity}


N, C = 1024, 4
out = {
    "doubling": simulate(N, lambda cap: cap * 2, 1),
    "add_4": simulate(N, lambda cap: cap + C, C),
}
out["ratio"] = out["add_4"]["total_copies"] / out["doubling"]["total_copies"]
out["small"] = simulate(9, lambda cap: cap * 2, 1)   # the 8-full-then-push beat
d = out["doubling"]
assert d["total_copies"] < 2 * N, "lesson claim: doubling copies < 2n"
print(json.dumps({k: (v if k != "doubling" and k != "add_4" else {kk: vv for kk, vv in v.items() if kk != "copy_sizes" or len(vv) <= 12}) for k, v in out.items()}, indent=2))
