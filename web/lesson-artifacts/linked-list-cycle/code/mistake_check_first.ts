function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    if (slow === fast) return true; // checked before moving: both start on head
    slow = slow!.next;
    fast = fast.next.next;
  }
  return false;
}
