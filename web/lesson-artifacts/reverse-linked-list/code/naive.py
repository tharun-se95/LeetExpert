def reverse_list(head):
    nodes = []
    while head is not None:            # one reference per node: O(n) extra memory
        nodes.append(head)
        head = head.next
    for i in range(len(nodes) - 1, 0, -1):
        nodes[i].next = nodes[i - 1]   # relink from the back
    if not nodes:
        return None
    nodes[0].next = None               # the old head is the new tail
    return nodes[-1]
