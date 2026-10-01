def has_cycle(head):
    seen = set()                  # one entry per node visited: O(n) memory
    node = head
    while node is not None:
        if node in seen:          # a node met twice: the walk came back
            return True
        seen.add(node)
        node = node.next
    return False
