def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next          # +1
        fast = fast.next.next     # +2
        if slow is fast:          # the same node, not an equal value
            return True
    return False                  # fast ran off the end: no cycle
