class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null,
  ) {}
}

function deleteAll<T>(head: ListNode<T> | null, target: T): ListNode<T> | null {
  const dummy = new ListNode<T | null>(null, head) as ListNode<T>; // a predecessor for the head
  let prev = dummy;
  while (prev.next !== null) {     // stand on prev, inspect prev.next
    if (prev.next.value === target) {
      prev.next = prev.next.next;  // splice it out, and stay: prev.next is new
    } else {
      prev = prev.next;
    }
  }
  return dummy.next; // the head, whatever it now is
}
