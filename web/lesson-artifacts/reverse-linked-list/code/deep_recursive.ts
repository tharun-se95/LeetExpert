function reverseList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head; // empty or one node
  const newHead = reverseList(head.next); // reverse everything after me...
  head.next.next = head;                  // ...then hook me on its end
  head.next = null;                       // I am the new tail, for now
  return newHead;
}
