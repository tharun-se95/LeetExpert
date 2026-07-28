function rob(root) {
  const walk = (node) => {
    if (node === null) return [0, 0];
    const left = walk(node.left);
    const right = walk(node.right);
    const withNode = node.val + left[1] + right[1];
    const without = Math.max(...left) + Math.max(...right);
    return [withNode, without];
  };
  return Math.max(...walk(root));
}
