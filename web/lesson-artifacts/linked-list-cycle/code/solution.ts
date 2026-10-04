function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;     // +1
    fast = fast.next.next; // +2
    if (slow === fast) return true; // the same node, not an equal value
  }
  return false; // fast ran off the end: no cycle
}
