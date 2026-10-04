class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null, // where the next node lives, or null
  ) {}
}

function get<T>(head: ListNode<T>, i: number): ListNode<T> {
  let node = head;
  for (let k = 0; k < i; k++) node = node.next!; // no address arithmetic: follow i links
  return node;
}

function insertAfter<T>(node: ListNode<T>, value: T): ListNode<T> {
  const created = new ListNode(value);
  created.next = node.next; // 1) point the new node where node pointed
  node.next = created;      // 2) then point node at it
  return created;
}
