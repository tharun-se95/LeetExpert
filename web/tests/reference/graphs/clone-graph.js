function cloneGraph(node) {
  if (node === null) return null;
  const cloned = new Map();

  const dfs = (original) => {
    if (cloned.has(original)) return cloned.get(original);
    const copy = new Node(original.val);
    cloned.set(original, copy);
    for (const neighbor of original.neighbors) {
      copy.neighbors.push(dfs(neighbor));
    }
    return copy;
  };

  return dfs(node);
}
