"""Facts for the skewed-BST carousel: the course's insert on sorted keys, against the same keys built middle first."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
REF = ROOT / "web/tests/reference/bst"
# the shown code is the course's checked-in reference solutions, byte for byte
assert Path("code/insert.py").read_text() == (REF / "insert-into-a-binary-search-tree.py").read_text()
assert Path("code/middle_first.py").read_text() == (REF / "convert-sorted-array-to-bst.py").read_text()
lesson = (ROOT / "courses/dsa/bst/balance-and-why-it-matters.md").read_text()
assert "A search for 5 visits all 5 nodes." in lesson


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


ns = {"TreeNode": TreeNode}   # the sandbox runner supplies TreeNode; so does this
exec(Path("code/insert.py").read_text(), ns)
exec(Path("code/middle_first.py").read_text(), ns)


def levels(root):
    """How many levels the tree has, counted without recursion (a chain of 1,000 is deep)."""
    count, row = 0, [root] if root else []
    while row:
        count += 1
        row = [c for n in row for c in (n.left, n.right) if c]
    return count


def visits(root, key):
    """Nodes a search for key looks at."""
    seen, node = 0, root
    while node:
        seen += 1
        if key == node.val:
            return seen
        node = node.left if key < node.val else node.right
    raise SystemExit(f"{key} not found")


def inserted(keys):
    root = None
    for k in keys:
        root = ns["insert_into_bst"](root, k)
    return root


small = inserted([1, 2, 3, 4, 5])
N = 1000
keys = list(range(1, N + 1))
chain, bushy = inserted(keys), ns["sorted_array_to_bst"](keys)
assert all(visits(bushy, k) <= levels(bushy) for k in keys)

print(json.dumps({"small_levels": levels(small), "small_visits": visits(small, 5), "n": N,
                  "chain_levels": levels(chain), "chain_visits": visits(chain, N),
                  "balanced_levels": levels(bushy), "balanced_visits": max(visits(bushy, k) for k in keys)}))
