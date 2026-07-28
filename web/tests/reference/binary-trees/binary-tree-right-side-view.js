function rightSideView(root) {
  if (root === null) return [];
  const out = [];
  let level = [root];
  while (level.length > 0) {
    out.push(level[level.length - 1].val);
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return out;
}
