"""Facts for the mutable-key carousel: file an entry under a list, change the list, look it up."""
import importlib.util
import json

spec = importlib.util.spec_from_file_location("table", "code/table.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

before = mod.slot([1, 2])
table, key = mod.demo()
after = mod.slot(key)
assert key == [1, 2, 5] and before != after
assert table.get(key) is None                     # the lookup goes to the new slot and finds nothing
assert table.buckets[before] == [(key, "parcel")]  # the entry never left its old slot
stored = sum(len(b) for b in table.buckets)

# what the slides say Python itself does
try:
    {[1, 2]: "parcel"}
    raise SystemExit("a list keyed a dict")
except TypeError as err:
    assert "unhashable type" in str(err)
assert {(1, 2): "parcel"}[(1, 2)] == "parcel"

print(json.dumps({"slot_before": before, "slot_after": after, "stored": stored}))
