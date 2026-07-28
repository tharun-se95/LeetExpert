def rob(root):
    def walk(node):
        if node is None:
            return (0, 0)
        left = walk(node.left)
        right = walk(node.right)
        with_node = node.val + left[1] + right[1]
        without = max(left) + max(right)
        return (with_node, without)

    return max(walk(root))
