function insertIntoBST(root, val) {
  if (root === null) return new TreeNode(val);
  let node = root;
  for (;;) {
    if (val < node.val) {
      if (node.left === null) {
        node.left = new TreeNode(val);
        return root;
      }
      node = node.left;
    } else {
      if (node.right === null) {
        node.right = new TreeNode(val);
        return root;
      }
      node = node.right;
    }
  }
}
