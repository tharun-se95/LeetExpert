def history(head):
    out, node = [], head
    while node.parent is not None:   # stops one short: the first commit is lost
        out.append(node.id)
        node = node.parent
    return out
