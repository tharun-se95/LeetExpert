def middle_node(head):
    slow = fast = head
    while fast.next is not None and fast.next.next is not None:  # stops one double step early
        slow = slow.next
        fast = fast.next.next
    return slow
