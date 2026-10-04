def reverse_list(head):
    prev, curr = None, head
    while curr is not None:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return curr                        # the loop only ends when curr is None
