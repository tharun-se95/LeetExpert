// Takes the RIGHT middle where the Python reference takes the left — a
// different, equally valid tree, which the property accepts and an expected
// value would not.
function sortedArrayToBst(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = Math.ceil((lo + hi) / 2);
    const node = new TreeNode(nums[mid]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, nums.length - 1);
}
