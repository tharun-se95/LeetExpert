def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    lead = trail = dummy
    for _ in range(n):                 # open a gap of exactly n
        lead = lead.next
    while lead.next is not None:       # march until lead is on the last node
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next       # trail is the predecessor: splice
    return dummy.next                  # right even when the head was removed
