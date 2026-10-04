def middle_node(head):
    n = 0
    node = head
    while node is not None:     # pass 1: count the nodes
        n += 1
        node = node.next
    node = head
    for _ in range(n // 2):     # pass 2: walk to index n // 2
        node = node.next
    return node
