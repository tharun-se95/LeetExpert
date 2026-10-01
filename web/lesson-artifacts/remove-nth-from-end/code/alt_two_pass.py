def remove_nth_from_end(head, n):
    length = 0
    node = head
    while node is not None:            # pass 1: count
        length += 1
        node = node.next
    dummy = ListNode(0, head)
    pred = dummy
    for _ in range(length - n):        # pass 2: walk to the predecessor
        pred = pred.next
    pred.next = pred.next.next
    return dummy.next
