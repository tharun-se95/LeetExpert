function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast!.next !== null && fast !== null) { // reads fast.next before asking if fast exists
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}
