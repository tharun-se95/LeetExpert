def middle_node(head):
    slow = fast = head
    while fast.next is not None and fast is not None:  # reads fast.next before asking if fast exists
        slow = slow.next
        fast = fast.next.next
    return slow
