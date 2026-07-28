function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (node === null) return 0;
    const left = height(node.left);
    const right = height(node.right);
    if (left + right > best) best = left + right;
    return 1 + Math.max(left, right);
  };
  height(root);
  return best;
}
