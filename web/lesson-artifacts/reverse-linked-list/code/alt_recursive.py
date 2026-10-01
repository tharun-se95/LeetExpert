def reverse_list(head):
    if head is None or head.next is None:
        return head                    # empty or one node: already reversed
    new_head = reverse_list(head.next) # reverse everything after me...
    head.next.next = head              # ...then hook me on its end
    head.next = None                   # I am the new tail, for now
    return new_head
