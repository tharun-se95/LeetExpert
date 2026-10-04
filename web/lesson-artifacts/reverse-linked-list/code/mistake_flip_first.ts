function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr !== null) {
    curr.next = prev;  // the flip, with nothing holding the rest
    prev = curr;
    curr = curr.next;  // this is prev now: the walk turns back
  }
  return prev;
}
