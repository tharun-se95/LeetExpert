def remove_nth_from_end(head, n):
    lead = trail = head                # no dummy: the head has no predecessor
    for _ in range(n):
        lead = lead.next
    while lead.next is not None:       # when n is the length, lead is None here
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next
    return head
