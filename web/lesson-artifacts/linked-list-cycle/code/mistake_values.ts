function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (fast !== null && slow!.val === fast.val) return true; // equal values, not the same node
  }
  return false;
}
