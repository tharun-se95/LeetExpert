"""Rows for hash-buckets, traced by running separate chaining for real."""
import json, os

def chain_insert(keys, m):
    table, steps = [[] for _ in range(m)], []
    steps.append({"i": 0, "bucket": -1, "table": [list(b) for b in table],
                  "note": f"An array of {m} buckets. Each key lands in exactly one of them."})
    collisions = 0
    for i, k in enumerate(keys):
        b = k % m
        collided = len(table[b]) > 0
        collisions += 1 if collided else 0
        table[b].append(k)
        note = (f"h({k}) = {k} mod {m} = <b>{b}</b>. "
                + (f"Bucket {b} is already occupied — a <b>collision</b>. "
                   f"{k} joins the chain rather than overwriting."
                   if collided else "Bucket is empty, so the key goes straight in."))
        steps.append({"i": i, "bucket": b, "table": [list(x) for x in table], "note": note})
    longest = max(len(b) for b in table)
    steps.append({"i": len(keys) - 1, "bucket": -1, "table": [list(b) for b in table],
                  "note": f"All {len(keys)} keys stored. Longest chain is <b>{longest}</b> — "
                          f"lookup costs O(chain), which is why a good hash spreads keys evenly."})
    return steps, longest, collisions

KEYS, M = [12, 7, 19, 5, 26], 5
steps, longest, collisions = chain_insert(KEYS, M)
assert collisions >= 1, "the scenario must actually demonstrate a collision"
assert sum(len(b) for b in json.loads(json.dumps(steps[-1]["table"]))) == len(KEYS)

rows = [{
  "_out": "hash-chaining", "family": "linear-traversal", "theme": "dark",
  "eyebrow": "Linear Traversal", "title": "Hash Table Collisions",
  "keys": ",".join(map(str, KEYS)), "buckets": M, "chainCap": longest,
  "formula": f"h(k) = k mod {M}", "stepSeconds": 1.9,
  "steps": json.dumps(steps),
}]
out = os.path.join(os.path.dirname(__file__), "rows-hash.json")
json.dump(rows, open(out, "w"), indent=2)
print(f"{len(steps)} steps · {collisions} collision(s) · longest chain {longest}")
print("final table:", json.loads(json.dumps(steps[-1]["table"])))
