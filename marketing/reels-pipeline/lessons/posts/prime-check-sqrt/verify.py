"""Facts for the prime-check carousel: trial divisions made testing every size below n, and only up to its square root."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/math-for-dsa/divisibility-primes-gcd.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def is_prime" in b)
source = Path("code/prime.py").read_text()
# the shown function is the lesson's block with its comments stripped
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert source.endswith(bare), "is_prime is not the lesson's block"
assert "It never exceeds 6, and √36 = 6." in lesson and "A shipment described by a 300-digit\nnumber" in lesson

mod = {}
exec(source, mod)
slow, fast = mod["is_prime_slow"], mod["is_prime"]
assert all(slow(n) == fast(n) for n in range(2000))
# the lesson's table: every divisor pair of 36, and the small member never exceeds 6
pairs = [(d, 36 // d) for d in range(1, 37) if 36 % d == 0 and d <= 36 // d]
assert pairs == [(1, 36), (2, 18), (3, 12), (4, 9), (6, 6)] and max(d for d, _ in pairs) == 6


class Counted(int):
    """An n that counts the divisions tried on it (n % d)."""
    mods = 0

    def __mod__(self, d):
        Counted.mods += 1
        return int.__mod__(self, d)


def tests(fn, n):
    Counted.mods = 0
    return fn(Counted(n)), Counted.mods


P = 1_000_003
(a, slow_tests), (b, fast_tests) = tests(slow, P), tests(fast, P)
assert a is True and b is True

print(json.dumps({"p": P, "slow_tests": slow_tests, "fast_tests": fast_tests}))
