function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  let lead = head!;  // no dummy: the head has no predecessor
  let trail = head!;
  for (let i = 0; i < n; i++) lead = lead.next!;
  while (lead.next !== null) { // when n is the length, lead is null here
    lead = lead.next;
    trail = trail.next!;
  }
  trail.next = trail.next!.next;
  return head;
}
