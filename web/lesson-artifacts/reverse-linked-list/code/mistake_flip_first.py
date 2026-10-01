def reverse_list(head):
    prev, curr = None, head
    while curr is not None:
        curr.next = prev               # the flip, with nothing holding the rest
        prev = curr
        curr = curr.next               # this is prev now: the walk turns back
    return prev
