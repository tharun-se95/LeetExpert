function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let lead: ListNode = dummy;
  let trail: ListNode = dummy;
  for (let i = 0; i < n; i++) lead = lead.next!; // open a gap of exactly n
  while (lead.next !== null) {                     // march until lead is on the last node
    lead = lead.next;
    trail = trail.next!;
  }
  trail.next = trail.next!.next; // trail is the predecessor: splice
  return dummy.next;             // right even when the head was removed
}
