def level_order(root):
    if root is None:
        return []
    out, level = [], [root]
    while level:
        out.append([n.val for n in level])
        nxt = []
        for n in level:
            if n.left:
                nxt.append(n.left)
            if n.right:
                nxt.append(n.right)
        level = nxt
    return out
