function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  let length = 0;
  for (let node = head; node !== null; node = node.next) length++; // pass 1: count
  const dummy = new ListNode(0, head);
  let pred: ListNode = dummy;
  for (let i = 0; i < length - n; i++) pred = pred.next!; // pass 2: walk to the predecessor
  pred.next = pred.next!.next;
  return dummy.next;
}
