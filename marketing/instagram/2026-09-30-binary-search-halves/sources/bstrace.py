"""The search's states for the scene gen.py draws: one per comparison.

Mirrors code/binary_search.py with each check recorded; verify.py holds it to the shown code.
"""


def search_trace(arr, target, lo_update=lambda mid: mid + 1, cap=50):
    """[(lo, hi, mid, verdict)] with verdict 'found' | 'low' | 'high'; stops after `cap` checks."""
    out, lo, hi = [], 0, len(arr) - 1
    while lo <= hi and len(out) < cap:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            out.append((lo, hi, mid, "found"))
            return out
        if arr[mid] < target:
            out.append((lo, hi, mid, "low"))
            lo = lo_update(mid)
        else:
            out.append((lo, hi, mid, "high"))
            hi = mid - 1
    return out
