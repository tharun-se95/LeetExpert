"""Facts for the string-concatenation carousel.

The counts are the lesson's cost model, not a stopwatch: a string is immutable, so `result += w`
allocates len(result) + len(w) characters and copies both in; join copies each word once. (The
lesson's honesty note says CPython and V8 often special-case +=; the post says so too.)
"""
import importlib.util
import json

spec = importlib.util.spec_from_file_location("joins", "code/joins.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def copies_bad(words):
    """Characters copied when every += builds a new string."""
    total, result = 0, ""
    for w in words:
        total += len(result) + len(w)
        result += w
    return total


def copies_good(words):
    return sum(len(w) for w in words)


small = ["a", "b", "c", "d"]
N = 1000
big = ["x"] * N
for words in (small, big, ["ab", "", "cde"]):
    assert mod.join_bad(words) == mod.join_good(words) == "".join(words)
# the lesson's closed form for n words of length L: L * n(n+1)/2
assert copies_bad(big) == N * (N + 1) // 2 and copies_bad(["xy"] * 50) == 2 * 50 * 51 // 2
print(json.dumps({"small_bad": copies_bad(small), "small_good": copies_good(small), "n": N,
                  "big_bad": copies_bad(big), "big_good": copies_good(big),
                  "ratio": copies_bad(big) // copies_good(big)}))
