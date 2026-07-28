// Promotes the inorder PREDECESSOR where the Python reference promotes the
// successor — both are correct, which is exactly why this lesson is graded
// by a property instead of by one expected tree.
function deleteNode(root, key) {
  if (root === null) return null;
  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;
    let predecessor = root.left;
    while (predecessor.right) predecessor = predecessor.right;
    root.val = predecessor.val;
    root.left = deleteNode(root.left, predecessor.val);
  }
  return root;
}
