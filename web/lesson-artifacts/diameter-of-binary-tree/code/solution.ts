function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0; // the answer lives outside the recursion

  function height(node: TreeNode | null): number {
    if (node === null) return 0;
    const left = height(node.left);   // each child height computed once
    const right = height(node.right);
    best = Math.max(best, left + right); // the path bending here is a candidate
    return 1 + Math.max(left, right);    // return HEIGHT: what the parent can extend
  }

  height(root);
  return best;
}
