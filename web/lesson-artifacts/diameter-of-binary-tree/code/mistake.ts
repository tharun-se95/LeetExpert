function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0;

  function height(node: TreeNode | null): number {
    if (node === null) return 0;
    const left = height(node.left), right = height(node.right);
    best = Math.max(best, left + right);
    return left + right;           // the mistake: returns the bending path
  }

  height(root);
  return best;
}
