"""The Python half: the same `/` crashes instead of returning -1.

Run: PYTHONDONTWRITEBYTECODE=1 python3 verify.py
"""
import sys
sys.path.insert(0, "code")
from twins import binary_search_bug, binary_search_fixed

try:
    binary_search_bug([2, 4, 6, 8], 6)
    raise AssertionError("expected TypeError")
except TypeError as e:
    assert str(e) == "list indices must be integers or slices, not float"
# on seven numbers the float is always whole (3.0, 5.0 ...), and a float index still crashes
try:
    binary_search_bug([1, 3, 5, 7, 9, 11, 13], 9)
    raise AssertionError("expected TypeError")
except TypeError:
    pass
assert binary_search_fixed([2, 4, 6, 8], 6) == 2
print("all reel claims verified (python)")
