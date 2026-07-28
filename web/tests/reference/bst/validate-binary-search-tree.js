function isValidBST(root) {
  const check = (node, low, high) => {
    if (node === null) return true;
    if (low !== null && node.val <= low) return false;
    if (high !== null && node.val >= high) return false;
    return check(node.left, low, node.val) && check(node.right, node.val, high);
  };
  return check(root, null, null);
}
