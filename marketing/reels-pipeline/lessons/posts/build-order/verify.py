"""Facts for the build-order carousel: Kahn's algorithm, as the lesson writes it, on four files."""
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/graphs/topological-sort.md").read_text()


def bare(block):
    """A lesson block as the slide shows it: no comments, no blank lines left by them."""
    src = block.rstrip().splitlines()
    # a line that was only a comment goes; a blank line the lesson wrote stays
    return "\n".join(s for l, s in ((l, re.sub(r"\s*#.*$", "", l)) for l in src) if s.strip() or not l.strip()) + "\n"


# the shown code is the lesson's own Kahn block
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def topo_sort_kahn" in b)
assert Path("code/topo.py").read_text() == bare(block), "code/topo.py is not the lesson's block without its comments"

spec = importlib.util.spec_from_file_location("topo", "code/topo.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

NAMES = ["utils", "lexer", "parser", "app"]
# the lesson's diagram: 0→1, 0→2, 1→3, 2→3
ADJ = [[1, 2], [3], [3], []]
for a, b in [(0, 1), (0, 2), (1, 3), (2, 3)]:
    assert f'{{ "from": {a}, "to": {b} }}' in lesson and b in ADJ[a]

order = mod.topo_sort_kahn(4, ADJ)
pos = {v: i for i, v in enumerate(order)}
assert all(pos[u] < pos[v] for u in range(4) for v in ADJ[u])  # every edge points forward

cyclic = [[1, 2], [3], [3], [0]]  # app imports utils
assert mod.topo_sort_kahn(4, cyclic) is None
indegree = [sum(u in adj for adj in cyclic) for u in range(4)]

print(json.dumps({"n": 4, "edges": sum(len(a) for a in ADJ),
                  "imports": ", ".join(f"{NAMES[u]} → {NAMES[v]}" for u in range(4) for v in ADJ[u]),
                  "order": " → ".join(NAMES[v] for v in order),
                  "ready_in_cycle": sum(d == 0 for d in indegree)}, ensure_ascii=False))
