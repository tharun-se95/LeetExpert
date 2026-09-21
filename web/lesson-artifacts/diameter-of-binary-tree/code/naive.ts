function diameterOfBinaryTree(root: TreeNode | null): number {
  function height(node: TreeNode | null): number {
    if (node === null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
  }

  function diameter(node: TreeNode | null): number {
    if (node === null) return 0;
    const through = height(node.left) + height(node.right); // bends at this node
    return Math.max(through, diameter(node.left), diameter(node.right));
  }

  return diameter(root);
}
