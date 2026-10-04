"""Facts for the Number of Provinces carousel: the reference solution on the lesson's examples and one more."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
# the shown code is the course's checked-in reference solution, byte for byte
assert Path("code/provinces.py").read_text() == (ROOT / "web/tests/reference/graphs/number-of-provinces.py").read_text()
lesson = (ROOT / "courses/dsa/graphs/number-of-provinces.md").read_text()

spec = importlib.util.spec_from_file_location("provinces", "code/provinces.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

assert "isConnected = [[1,1,0],[1,1,0],[0,0,1]] → 2" in lesson and "isConnected = [[1,0,0],[0,1,0],[0,0,1]] → 3" in lesson
ex1 = mod.find_circle_num([[1, 1, 0], [1, 1, 0], [0, 0, 1]])
ex2 = mod.find_circle_num([[1, 0, 0], [0, 1, 0], [0, 0, 1]])
assert (ex1, ex2) == (2, 3)

N = 6
LINKS = [(0, 1), (1, 2), (3, 4)]
m = [[int(i == j) for j in range(N)] for i in range(N)]
for a, b in LINKS:
    m[a][b] = m[b][a] = 1
count = mod.find_circle_num(m)

# the groups, found independently: grow each city's set until nothing changes
group = {i: {i} for i in range(N)}
changed = True
while changed:
    changed = False
    for a, b in LINKS:
        merged = group[a] | group[b]
        for c in merged:
            if group[c] != merged:
                group[c], changed = merged, True
groups = sorted({tuple(sorted(g)) for g in group.values()})
assert len(groups) == count and m[0][2] == 0 and any(0 in g and 2 in g for g in groups)

print(json.dumps({"ex1": ex1, "ex2": ex2, "n": N, "links": ", ".join(f"{a}–{b}" for a, b in LINKS),
                  "groups": " ".join("{" + ", ".join(map(str, g)) + "}" for g in groups), "count": count},
                 ensure_ascii=False))
