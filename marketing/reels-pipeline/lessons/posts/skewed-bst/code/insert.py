def insert_into_bst(root, val):
    if root is None:
        return TreeNode(val)
    node = root
    while True:
        if val < node.val:
            if node.left is None:
                node.left = TreeNode(val)
                return root
            node = node.left
        else:
            if node.right is None:
                node.right = TreeNode(val)
                return root
            node = node.right
