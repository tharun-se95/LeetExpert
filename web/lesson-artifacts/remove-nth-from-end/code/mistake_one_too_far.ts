function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let lead: ListNode | null = dummy;
  let trail: ListNode = dummy;
  for (let i = 0; i < n; i++) lead = lead!.next;
  while (lead !== null) { // one march too many: trail lands on the target
    lead = lead.next;
    trail = trail.next!;
  }
  trail.next = trail.next!.next; // so this removes the node after it
  return dummy.next;
}
