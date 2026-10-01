def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if fast is not None and slow.val == fast.val:  # equal values, not the same node
            return True
    return False
