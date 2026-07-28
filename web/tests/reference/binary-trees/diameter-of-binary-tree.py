def diameter_of_binary_tree(root):
    best = [0]

    def height(node):
        if node is None:
            return 0
        left = height(node.left)
        right = height(node.right)
        if left + right > best[0]:
            best[0] = left + right
        return 1 + max(left, right)

    height(root)
    return best[0]
