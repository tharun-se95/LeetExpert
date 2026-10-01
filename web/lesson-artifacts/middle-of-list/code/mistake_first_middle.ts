function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast!.next !== null && fast!.next.next !== null) { // stops one double step early
    slow = slow!.next;
    fast = fast!.next.next;
  }
  return slow;
}
