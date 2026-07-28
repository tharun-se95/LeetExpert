def right_side_view(root):
    if root is None:
        return []
    out, level = [], [root]
    while level:
        out.append(level[-1].val)
        nxt = []
        for n in level:
            if n.left:
                nxt.append(n.left)
            if n.right:
                nxt.append(n.right)
        level = nxt
    return out
