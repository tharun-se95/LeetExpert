def build_tree(preorder, inorder):
    index = {v: i for i, v in enumerate(inorder)}
    pos = [0]

    def build(lo, hi):
        if lo > hi:
            return None
        val = preorder[pos[0]]
        pos[0] += 1
        node = TreeNode(val)
        mid = index[val]
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node

    return build(0, len(inorder) - 1)
