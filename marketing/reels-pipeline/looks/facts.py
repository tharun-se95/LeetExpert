"""Every number and trace the four new-look posts (#149) show, computed by running code.

Writes facts.json; looks.py draws only from it, and facts.mjs recomputes all of it in JavaScript
and fails on any difference, so a post never shows a value one runtime disagrees with.

  python3 facts.py && node facts.mjs
"""
import json
import math
import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
REF = ROOT / "web/tests/reference/stacks"


# --- valid parentheses: the lesson's reference, plus a trace of the same algorithm --------
def load_reference():
    scope = {}
    exec((REF / "valid-parentheses.py").read_text(), scope)
    return scope["is_valid"]


PAIRS = {")": "(", "]": "[", "}": "{"}


def trace(s):
    """The stack after each bracket, and where (if anywhere) the scan fails.

    Same steps as the reference: a closer must find its opener on top, else invalid.
    """
    stack, steps = [], []
    for i, ch in enumerate(s):
        if ch in PAIRS:
            if not stack or stack[-1] != PAIRS[ch]:
                return {"s": s, "steps": steps, "fail": {"at": i, "ch": ch, "top": stack[-1] if stack else None}, "valid": False}
            stack.pop()
        else:
            stack.append(ch)
        steps.append({"ch": ch, "stack": "".join(stack)})
    return {"s": s, "steps": steps, "fail": None if not stack else {"at": len(s), "ch": None, "top": stack[-1]}, "valid": not stack}


def lesson_cases():
    text = (ROOT / "courses/dsa/stacks/valid-parentheses.md").read_text()
    block = text.split("```sandbox\n", 1)[1].split("\n```", 1)[0]
    return json.loads(block)["cases"]


def parens():
    ref = load_reference()
    cases = lesson_cases()
    for c in cases:
        s = c["args"][0]
        assert ref(s) == c["expect"], f"reference disagrees with the lesson on {s!r}"
        assert trace(s)["valid"] == c["expect"], f"trace disagrees with the lesson on {s!r}"
    shown = [trace("([{}])"), trace("([)]")]
    for t in shown:
        assert t["valid"] == ref(t["s"])
    challenge = "{[]}"
    return {"cases": len(cases), "valid": shown[0], "invalid": shown[1], "challenge": {"s": challenge, "valid": ref(challenge)}}


# --- linked list as a train ------------------------------------------------------------
class Car:
    def __init__(self, name, nxt=None):
        self.name, self.next = name, nxt


def reachable(head):
    n = 0
    while head:
        n, head = n + 1, head.next
    return n


def hops_to(head, k):
    """Links followed from the engine to reach car k (1 = the engine)."""
    hops, cur = 0, head
    while cur and cur.name != k:
        cur, hops = cur.next, hops + 1
    assert cur, f"car {k} not on the train"
    return hops


def train():
    head = None
    for k in range(5, 0, -1):  # build 1 → 2 → 3 → 4 → 5
        head = Car(k, head)
    cars = reachable(head)
    to5 = hops_to(head, 5)
    # a new car at the engine is one link, however long the train
    front_steps = []
    for size in (5, 1_000, 100_000):
        h = None
        for k in range(size, 0, -1):
            h = Car(k, h)
        before = h
        h = Car(0, h)  # the whole insertion: one new car, one link
        front_steps.append({"size": size, "links_written": 1, "old_engine_second": h.next is before})
    big = None
    for k in range(1_000, 0, -1):
        big = Car(k, big)
    lost = head
    head = None  # drop the engine reference: nothing points at car 1 any more
    return {"cars": cars, "hops_to_5": to5, "hops_to_1000": hops_to(big, 1_000), "front": front_steps,
            "reachable_after_losing_head": reachable(head), "cars_still_linked_behind": reachable(lost)}


# --- binary search: a billion sorted numbers ----------------------------------------------
N = 1_000_000_000


def worst_guesses(n):
    """Most probes lo <= hi binary search makes on n items: probe the middle, recurse on the larger side."""
    g = 0
    while n > 0:
        g += 1
        n = n // 2  # of n - 1 remaining items, the larger side holds n // 2
    return g


def search(n, target):
    """Binary search over a[i] = 2 * i (sorted, never built), counting guesses."""
    lo, hi, guesses = 0, n - 1, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        guesses += 1
        v = 2 * mid
        if v == target:
            return guesses
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return guesses


def bsearch():
    worst = worst_guesses(N)
    assert 2 ** (worst - 1) <= N < 2 ** worst, "worst case should equal the bit length"
    rng = random.Random(149)
    targets = [0, 2 * (N - 1), -1, 2 * N, 1, 2 * (N // 2)] + [rng.randrange(-1, 2 * N + 1) for _ in range(20_000)]
    seen = max(search(N, t) for t in targets)
    assert seen <= worst, f"a search took {seen} guesses, above the bound {worst}"
    assert seen == worst, f"no search reached the bound {worst} (max {seen}): the claim would be loose"
    return {"n": N, "worst": worst, "trillion": worst_guesses(10 ** 12), "max_seen": seen, "searches": len(targets), "bit_length": N.bit_length()}


# --- Big-O at n = 1,000 -------------------------------------------------------------
def bigo():
    n = 1000
    steps = sum(1 for _ in range(n) for _ in range(n))  # a nested loop, counted
    assert steps == n * n
    return {"n": n, "n2": steps, "nlogn": round(n * math.log2(n)), "logn": round(math.log2(n), 2)}


def facts():
    return {"parens": parens(), "train": train(), "bsearch": bsearch(), "bigo": bigo()}


if __name__ == "__main__":
    f = facts()
    (HERE / "facts.json").write_text(json.dumps(f, indent=1) + "\n")
    json.dump({k: {kk: vv for kk, vv in v.items() if not isinstance(vv, (dict, list))} for k, v in f.items()}, sys.stdout, indent=1)
    print()
