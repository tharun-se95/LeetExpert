def diameter_of_binary_tree(root):
    best = 0                             # the answer lives outside the recursion

    def height(node):
        nonlocal best
        if node is None:
            return 0
        left = height(node.left)         # each child height computed once
        right = height(node.right)
        best = max(best, left + right)   # the path bending here is a candidate
        return 1 + max(left, right)      # return HEIGHT: what the parent can extend

    height(root)
    return best
