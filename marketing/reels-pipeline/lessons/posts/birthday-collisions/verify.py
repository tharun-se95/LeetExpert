"""Facts for the birthday-collisions carousel: the chance that uniform hashing has already collided."""
import importlib.util
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/hash-tables/hashing-fundamentals.md").read_text()
assert "365 slots" in lesson and "23 people" in lesson and "A million-slot table" in lesson

spec = importlib.util.spec_from_file_location("chance", "code/chance.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
chance = mod.collision_chance


def first_over_half(slots):
    return next(k for k in range(1, slots + 2) if chance(slots, k) > 0.5)


# the formula against an experiment: throw 23 keys into 365 slots, many times
rng = random.Random(7)
trials = 20000
hits = sum(len({rng.randrange(365) for _ in range(23)}) < 23 for _ in range(trials))
assert abs(hits / trials - chance(365, 23)) < 0.02

DAYS, SLOTS, THOUSAND = 365, 1_000_000, 1000
people = first_over_half(DAYS)
print(json.dumps({"days": DAYS, "people": people, "p_days": f"{100 * chance(DAYS, people):.1f}",
                  "slots": SLOTS, "thousand": THOUSAND, "p_thousand": f"{100 * chance(SLOTS, THOUSAND):.1f}",
                  "k_half": first_over_half(SLOTS), "half_full": SLOTS // 2}))
