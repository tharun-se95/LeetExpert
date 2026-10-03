"""Facts for the lowest-common-ancestor carousel: the reference solution on the lesson's tree."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
# the shown code is the course's checked-in reference solution, byte for byte
assert Path("code/lca.py").read_text() == (ROOT / "web/tests/reference/binary-trees/lowest-common-ancestor-of-a-binary-tree.py").read_text()
lesson = (ROOT / "courses/dsa/binary-trees/lowest-common-ancestor-of-a-binary-tree.md").read_text()
assert "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1 → 3" in lesson
assert "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4 → 5" in lesson

spec = importlib.util.spec_from_file_location("lca", "code/lca.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class TreeNode:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None


def build(level):
    """A tree from its level-order list, None for a missing child."""
    nodes = [None if v is None else TreeNode(v) for v in level]
    kids = iter(nodes[1:])
    for node in nodes:
        if node is not None:
            node.left, node.right = next(kids, None), next(kids, None)
    return nodes[0], {n.val: n for n in nodes if n is not None}


root, by = build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])


def lca(p, q):
    a, b = mod.lowest_common_ancestor(root, by[p], by[q]).val, mod.lowest_common_ancestor(root, by[q], by[p]).val
    assert a == b
    return a


print(json.dumps({"nodes": len(by), "lca_5_1": lca(5, 1), "lca_5_4": lca(5, 4), "lca_7_4": lca(7, 4),
                  "lca_6_4": lca(6, 4), "lca_7_8": lca(7, 8)}))
