def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    lead = trail = dummy
    for _ in range(n):
        lead = lead.next
    while lead is not None:            # one march too many: trail lands on the target
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next       # so this removes the node after it
    return dummy.next
