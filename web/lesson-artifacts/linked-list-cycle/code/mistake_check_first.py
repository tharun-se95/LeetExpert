def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        if slow is fast:          # checked before moving: both start on head
            return True
        slow = slow.next
        fast = fast.next.next
    return False
