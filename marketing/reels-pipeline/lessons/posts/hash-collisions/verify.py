"""Facts for the hash-collision carousel: where keys land in the shown chained table."""
import importlib.util
import json

spec = importlib.util.spec_from_file_location("chained", "code/chained.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def fill(m, keys):
    t = mod.ChainedTable(m)
    for k in keys:
        t.put(k, str(k))
    assert all(t.get(k) == str(k) for k in keys) and t.get(m * 10**6 + m) is None
    return t


def slot(t, key):
    """The bucket the key sits in, found by looking, not by formula."""
    return next(i for i, chain in enumerate(t.buckets) if any(k == key for k, _ in chain))


def scanned(t, key):
    """Entries a lookup examines before it finds the key."""
    chain = t.buckets[slot(t, key)]
    return [k for k, _ in chain].index(key) + 1


A, B, C, D = 10, 18, 3, 7   # keys from the lesson's hash-buckets viz
M, M2 = 4, 8                # its capacity, then doubled
small, doubled = fill(M, [A, C, B, D]), fill(M2, [A, C, B, D])
assert slot(small, A) == slot(small, B) and slot(small, C) == slot(small, D)
assert slot(doubled, A) == slot(doubled, B) and slot(doubled, C) != slot(doubled, D)

N, PRANK = 100, 4           # the lesson's prankster: 100 packages, all for slot 4
prank_keys = [PRANK + M2 * i for i in range(N)]
prank = fill(M2, prank_keys)
assert {slot(prank, k) for k in prank_keys} == {PRANK}
spread = fill(128, list(range(N)))

print(json.dumps({"m": M, "m2": M2, "a": A, "b": B, "c": C, "d": D,
                  "slot_ab": slot(small, A), "slot_ab2": slot(doubled, A), "slot_cd": slot(small, C),
                  "slot_c2": slot(doubled, C), "slot_d2": slot(doubled, D),
                  "prank_n": N, "prank_slot": PRANK, "prank_scan": scanned(prank, prank_keys[-1]),
                  "spread_scan": max(scanned(spread, k) for k in range(N))}))
