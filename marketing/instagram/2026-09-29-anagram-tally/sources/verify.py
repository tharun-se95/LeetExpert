"""Recomputes every claim the anagram-tally reel shows or says, in Python.

Run: python3 verify.py && node verify.mjs  (each exits non-zero if a claim drifts)
The JavaScript half matters: the café case fails differently in each runtime.
"""
import random, string, timeit
from collections import Counter


def tally(s, t):
    """The reel's tally sheet: +1 per tile of s, -1 per tile of t, in first-seen order."""
    rows = {}
    for ch in s:
        rows[ch] = rows.get(ch, 0) + 1
    for ch in t:
        rows[ch] = rows.get(ch, 0) - 1
    return rows


def by_array(s, t):
    """The lesson's 26-slot solution, verbatim in shape."""
    if len(s) != len(t):
        return False
    counts = [0] * 26
    a = ord("a")
    for ch_s, ch_t in zip(s, t):
        counts[ord(ch_s) - a] += 1
        counts[ord(ch_t) - a] -= 1
    return all(c == 0 for c in counts)


def by_sort(s, t):
    return sorted(s) == sorted(t)


def by_counter(s, t):
    return len(s) == len(t) and Counter(s) == Counter(t)


# The demo: listen / silent. After the first rack every row is +1, after the second all zero.
assert tally("listen", "") == {"l": 1, "i": 1, "s": 1, "t": 1, "e": 1, "n": 1}
assert set(tally("listen", "silent").values()) == {0}
assert by_array("listen", "silent") and by_sort("listen", "silent")
# The sorted form the hook shows for both words
assert "".join(sorted("listen")) == "".join(sorted("silent")) == "eilnst"

# Length check: listen (6) vs listens (7) is rejected before any counting
assert (len("listen"), len("listens")) == (6, 7) and not by_array("listen", "listens")

# The catch: the 26-slot array only covers a-z
try:
    by_array("café", "éfac")
    raise AssertionError("expected IndexError")
except IndexError as e:
    assert str(e) == "list index out of range"
assert ord("é") - ord("a") == 136  # the slot it reaches for, past index 25
assert by_counter("café", "éfac") and by_sort("café", "éfac")  # the right answer is true

# The pitfall: sets drop counts
assert set("aacc") == set("ccac")
assert not by_array("aacc", "ccac")
assert Counter("aacc") == {"a": 2, "c": 2} and Counter("ccac") == {"c": 3, "a": 1}

# Challenge: aab vs abb leaves a at +1 and b at -1
assert tally("aab", "abb") == {"a": 1, "b": -1}

# Speed, 1,000,000 random a-z letters. The reel quotes our recorded run (2026-09-29):
# sorted 214.7 ms, Counter 54.9 ms. Machines differ, so re-measure only the claim
# the narration makes: counting takes about a quarter of the sort's time.
RECORDED = {"sort_ms": 214.7, "count_ms": 54.9}
assert RECORDED["sort_ms"] > 200 and 0.2 <= RECORDED["count_ms"] / RECORDED["sort_ms"] <= 0.3
random.seed(7)
s = "".join(random.choices(string.ascii_lowercase, k=1_000_000))
t = "".join(random.sample(s, len(s)))
best = lambda f: min(timeit.repeat(lambda: f(s, t), number=1, repeat=3))
ts, tc = best(by_sort), best(by_counter)
print(f"this machine: sorted {ts * 1000:.0f} ms, Counter {tc * 1000:.0f} ms, ratio {tc / ts:.2f}")
assert tc / ts < 0.4, "counting is no longer clearly faster than sorting"

print("all reel claims verified (python)")
