def diameter_of_binary_tree(root):
    def height(node):
        if node is None:
            return 0
        return 1 + max(height(node.left), height(node.right))

    def diameter(node):
        if node is None:
            return 0
        through = height(node.left) + height(node.right)   # bends at this node
        return max(through, diameter(node.left), diameter(node.right))

    return diameter(root)
