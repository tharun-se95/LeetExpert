def middle_node(head):
    slow = fast = head
    while fast is not None and fast.next is not None:  # can fast take a full double step?
        slow = slow.next        # +1
        fast = fast.next.next   # +2
    return slow                 # fast walked twice as far: slow is halfway
