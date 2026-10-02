"""The window's states, step by step, for the scene gen.py draws.

Mirrors code/min_window.py with every move recorded. verify.py checks these
states against the trace block in the lesson and the result against the shown code.
"""


def window_trace(target, nums):
    """[(kind, left, right, total, best)] where kind is 'grow' or 'shrink'; best is None until found."""
    out, left, total, best = [], 0, 0, None
    for right in range(len(nums)):
        total += nums[right]
        out.append(("grow", left, right, total, best))
        while total >= target:
            best = right - left + 1 if best is None else min(best, right - left + 1)
            total -= nums[left]
            left += 1
            out.append(("shrink", left, right, total, best))
    return out
