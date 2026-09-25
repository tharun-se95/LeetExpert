def history(head):
    """Commit ids from HEAD back to the first commit."""
    out, node = [], head
    while node is not None:
        out.append(node.id)
        node = node.parent   # each commit only knows the one before it
    return out
