function deleteAllAdvancing<T>(head: ListNode<T> | null, target: T): ListNode<T> | null {
  const dummy = new ListNode<T | null>(null, head) as ListNode<T>;
  let prev = dummy;
  while (prev.next !== null) {
    if (prev.next.value === target) prev.next = prev.next.next;
    prev = prev.next!; // advances even after a splice
  }
  return dummy.next;
}
