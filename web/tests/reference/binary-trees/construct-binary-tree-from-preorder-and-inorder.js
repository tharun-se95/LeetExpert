function buildTree(preorder, inorder) {
  const index = new Map();
  inorder.forEach((v, i) => index.set(v, i));
  let pos = 0;

  const build = (lo, hi) => {
    if (lo > hi) return null;
    const val = preorder[pos++];
    const node = new TreeNode(val);
    const mid = index.get(val);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };

  return build(0, inorder.length - 1);
}
