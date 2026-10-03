"""Facts for the greedy-coins carousel: largest-coin-first against the course's DP reference."""
import importlib.util
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
assert Path("code/coin_change.py").read_text() == (ROOT / "web/tests/reference/dynamic-programming/coin-change.py").read_text()
lesson = (ROOT / "courses/dsa/dynamic-programming/coin-change.md").read_text()
assert "coins = [1,2,5], amount = 11  →  3   (5 + 5 + 1)" in lesson
assert "fails on coins {1,3,4}, amount 6 (giving 4+1+1=3 coins instead of the optimal 3+3=2 coins)" in lesson


def load(name, fn):
    spec = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return getattr(mod, fn)


greedy, dp = load("greedy", "greedy_change"), load("coin_change", "coin_change")


def best(coins, amount):
    """A fewest-coins combination, found by trying every multiset of the DP's size."""
    n = dp(coins, amount)
    combo = next(c for c in itertools.combinations_with_replacement(sorted(coins, reverse=True), n) if sum(c) == amount)
    assert all(sum(c) != amount for k in range(n) for c in itertools.combinations_with_replacement(coins, k))
    return combo


show = lambda coins: " + ".join(map(str, coins))
BAD, TARGET, OK, OK_TARGET, UPTO = [1, 3, 4], 6, [1, 2, 5], 11, 100
g, b = greedy(BAD, TARGET), best(BAD, TARGET)
wrong = sum(len(greedy(BAD, a)) > dp(BAD, a) for a in range(1, UPTO + 1))

print(json.dumps({"greedy_str": show(g), "greedy_n": len(g), "best_str": show(b), "dp_n": dp(BAD, TARGET),
                  "ok_str": show(greedy(OK, OK_TARGET)), "ok_n": len(greedy(OK, OK_TARGET)), "ok_dp": dp(OK, OK_TARGET),
                  "upto": UPTO, "wrong": wrong}))
