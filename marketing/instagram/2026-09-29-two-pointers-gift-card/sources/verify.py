"""Recomputes every number the gift-card two-pointers reel shows or says.

Run: python3 verify.py  (exits non-zero if any claim drifts)
"""
from math import comb

MENU = [1, 3, 4, 5, 7, 8, 9]  # sorted prices, dollars
CARD = 15


def two_pointer_trace(arr, target, strict=True):
    """Returns (checks, found_pair_or_None, [(l, r, sum, verdict)])."""
    left, right, steps = 0, len(arr) - 1, []
    while (left < right) if strict else (left <= right):
        s = arr[left] + arr[right]
        if s == target:
            steps.append((arr[left], arr[right], s, "exact"))
            return len(steps), (arr[left], arr[right]), steps
        if s < target:
            steps.append((arr[left], arr[right], s, "under"))
            left += 1
        else:
            steps.append((arr[left], arr[right], s, "over"))
            right -= 1
    return len(steps), None, steps


checks, pair, steps = two_pointer_trace(MENU, CARD)
assert steps == [(1, 9, 10, "under"), (3, 9, 12, "under"), (4, 9, 13, "under"),
                 (5, 9, 14, "under"), (7, 9, 16, "over"), (7, 8, 15, "exact")], steps
assert (checks, pair) == (6, (7, 8))
# (7, 8) is the only pair on the menu that spends exactly 15
assert [(a, b) for i, a in enumerate(MENU) for b in MENU[i + 1:] if a + b == CARD] == [(7, 8)]

# Brute force: every pair
assert comb(7, 2) == 21
assert comb(1000, 2) == 499_500
# two pointers on 1,000 items: at most n - 1 checks
assert 1000 - 1 == 999

# Why dropping the cheapest is safe: even with the priciest item it's under
assert MENU[0] + MENU[-1] == 10 < CARD
# Why dropping 9 is safe at step 5: cheapest item still in play is 7
assert 7 + 9 == 16 > CARD

# Pitfall: `left <= right` lets one item pair with itself
_, bad, _ = two_pointer_trace([5], 10, strict=False)
_, good, _ = two_pointer_trace([5], 10, strict=True)
assert bad == (5, 5) and good is None

# Challenge: $12 card on the same menu
c12, p12, _ = two_pointer_trace(MENU, 12)
assert (c12, p12) == (2, (3, 9))
assert [(a, b) for i, a in enumerate(MENU) for b in MENU[i + 1:] if a + b == 12] == [(3, 9), (4, 8), (5, 7)]

print("all reel claims verified")
