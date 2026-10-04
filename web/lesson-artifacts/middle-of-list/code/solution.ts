function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) { // can fast take a full double step?
    slow = slow!.next;     // +1
    fast = fast.next.next; // +2
  }
  return slow; // fast walked twice as far: slow is halfway
}
